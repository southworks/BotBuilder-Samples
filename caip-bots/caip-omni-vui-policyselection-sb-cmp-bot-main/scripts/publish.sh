#!/bin/bash -eu

# this script assumes the following prerequisites
# @microsoft/botframework-cli@next package with @microsoft/bf-sampler-cli@beta plugin
# azure account is logged in and subscription is set

KEY_VAULT_NAME=${keyVaultName:?}
RESOURCE_JSON=${resourceJson:?}
IS_PROD=${isProd:-"false"}

DL_KEY=$(az keyvault secret show --id "https://${KEY_VAULT_NAME}.vault.azure.net/secrets/directline-automation-key" --query value | tr -d '"')
SETTINGS='settings/appsettings.json'

while IFS='' read -r resource; do
    kv=`echo $resource | jq '. | .key_vault_name' -r`
    rg=`echo $resource | jq '. | .resource_group_name' -r`
    webapp=`echo $resource | jq '. | .app_service_name' -r`

    echo "* * * Setting up and copying app settings * * *"
    cp templates/appsettings.json.template $SETTINGS
    sed -i "s/\[KEY_VAULT_NAME\]/${kv}/g" $SETTINGS
    while IFS='' read -r id; do
        secret=$(az keyvault secret show --id $id --query value | tr -d '"')
        sed -i "s|$id|$secret|" $SETTINGS
    done < <(grep -o "https://${kv}.vault.azure.net/secrets/[a-zA-Z-]*" $SETTINGS)

    echo "* * * Configure Test Automation * * *"
    sed -i "s/DIRECTLINE_SECRET/${DL_KEY}/g" botium.json

    if [[ "$IS_PROD" == "true" ]]; then
        zip -rq code.zip . -x code.zip 'scripts/node_modules/*' 'scripts/*.json' '.git/*'
    else 
        zip -rq code.zip . -x code.zip 
    fi

    echo "* * * Deploy webapp prerelease slot ${webapp}, ${rg}* * *"
    az webapp deployment source config-zip --resource-group ${rg} --name ${webapp} --slot prerelease --src code.zip
done < <(echo ${RESOURCE_JSON} | jq -c '.[] | {key_vault_name, resource_group_name, app_service_name}')