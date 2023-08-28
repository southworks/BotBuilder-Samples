#!/bin/bash -eu

# this script assumes the following prerequisites
# @microsoft/botframework-cli@next package with @microsoft/bf-sampler-cli@beta plugin
# azure account is logged in and subscription is set

KEY_VAULT_NAME=${keyVaultName:?}
BOT_NAME=${botName:?}
RESOURCE_GROUP_NAME=${resourceGroupName:?}
WEBAPP_NAME=${webappName:?}

DL_KEY=$(az keyvault secret show --id "https://${KEY_VAULT_NAME}.vault.azure.net/secrets/directline-automation-key" --query value | tr -d '"')
SETTINGS='settings/appsettings.json'

echo "* * * Setting up and copying app settings * * *"
cp templates/appsettings.json.template $SETTINGS
sed -i "s/\[KEY_VAULT_NAME\]/${KEY_VAULT_NAME}/g" $SETTINGS
while IFS='' read -r id; do
    secret=$(az keyvault secret show --id $id --query value | tr -d '"')
    sed -i "s|$id|$secret|" $SETTINGS
done < <(grep -o "https://${KEY_VAULT_NAME}.vault.azure.net/secrets/[a-zA-Z-]*" $SETTINGS)

echo "* * * Configure Test Automation * * *"
sed -i "s/DIRECTLINE_SECRET/${DL_KEY}/g" botium.json

echo "* * * Deploy webapp prerelease slot * * *"
zip -rq code.zip . -x code.zip 
az webapp deployment source config-zip --resource-group ${RESOURCE_GROUP_NAME} --name ${WEBAPP_NAME} --slot prerelease --src code.zip
