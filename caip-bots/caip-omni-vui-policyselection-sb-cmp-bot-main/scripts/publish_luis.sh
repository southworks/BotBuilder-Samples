#!/bin/bash -eu

# This script adds the LUIS prediction resource to the LUIS app and publishes it to the production slot
# This script looks at all the generated LUIS settings files (Which may point to multiple LUIS apps)

KEY_VAULT_NAME=${keyVaultName:?}
RESOURCE_JSON=${resourceJson:?}

LUIS_AUTHKEY=$(az keyvault secret show --id "https://${KEY_VAULT_NAME}.vault.azure.net/secrets/luis-authoring-key" --query value | tr -d '"')
SUB_ID=$(az account show | jq ".id" | tr -d '"')
AUTH_TOKEN=$(az account get-access-token --resource=https://management.core.windows.net/ --query accessToken --output tsv)

while IFS='' read -r file; do
    while IFS='' read -r app; do
        ID=$(echo "$app" | jq -r ".appId")
        VERSION=$(echo "$app" | jq -r ".version")

        while IFS='' read -r resource; do
            rg=`echo $resource | jq '. | .resource_group_name' -r`
            cog=`echo $resource | jq '. | .luis_cognitive_account_name' -r`

            echo "* * * Adding LUIS Prediction Resource ${cog}, ${rg} * * *"
            curl -X POST "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/$ID/azureaccounts" \
                -H "Authorization: Bearer $AUTH_TOKEN" \
                -H "Content-Type: application/json" \
                -H "Ocp-Apim-Subscription-Key: $LUIS_AUTHKEY" \
                --data-ascii "{\"azureSubscriptionId\": \"$SUB_ID\", \"resourceGroup\": \"$rg\", \"accountName\": \"$cog\"}"  
        done < <(echo ${RESOURCE_JSON} | jq -c '.[] | {resource_group_name, luis_cognitive_account_name}')

        echo "* * * Enabling LUIS Sentiment Analysis * * *"
        curl -X PUT "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/$ID/publishsettings" \
            -H "Content-Type: application/json" \
            -H "Ocp-Apim-Subscription-Key: $LUIS_AUTHKEY" \
            --data-ascii "{\"sentimentAnalysis\": true}"  

        echo "* * * Publishing LUIS to Production Slot * * *"
        curl -X POST "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/$ID/publish" \
            -H "Content-Type: application/json" \
            -H "Ocp-Apim-Subscription-Key: $LUIS_AUTHKEY" \
            --data-ascii "{\"versionId\": \"$VERSION\"}"  

    done < <(jq -c ".luis[]" "$file")
done < <(find . -name "luis.settings.*" -path "*/generated/*")