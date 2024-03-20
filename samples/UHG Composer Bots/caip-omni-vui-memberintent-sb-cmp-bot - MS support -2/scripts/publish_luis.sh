#!/bin/bash -eu
KEY_VAULT_NAME=${keyVaultName:?}
COGNITIVE_ACCOUNT_NAME=${cognitiveAccountName}
RESOURCE_GROUP_NAME=${resourceGroupName}

LUIS_AUTHKEY=$(az keyvault secret show --id "https://${KEY_VAULT_NAME}.vault.azure.net/secrets/luis-authoring-key" --query value | tr -d '"')
SUB_ID=$(az account show | jq ".id" | tr -d '"')
AUTH_TOKEN=$(az account get-access-token --resource=https://management.core.windows.net/ --query accessToken --output tsv)

while IFS='' read -r file; do
    while IFS='' read -r app; do
        ID=$(echo "$app" | jq -r ".appId")
        VERSION=$(echo "$app" | jq -r ".version")

        echo "* * * Adding LUIS Prediction Resources * * *"
        curl -X POST "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/$ID/azureaccounts" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            -H "Ocp-Apim-Subscription-Key: $LUIS_AUTHKEY" \
            --data-ascii "{\"azureSubscriptionId\": \"$SUB_ID\", \"resourceGroup\": \"$RESOURCE_GROUP_NAME\", \"accountName\": \"$COGNITIVE_ACCOUNT_NAME\"}"  

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