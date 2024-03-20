#!/bin/bash -eu

# this script assumes the following prerequisites
# @microsoft/botframework-cli@next package with @microsoft/bf-sampler-cli@beta plugin
# azure account is logged in and subscription is set

KEY_VAULT_NAME=${keyVaultName:?}
LUIS_APP_NAME_BASE=${luisAppNameBase:?}

LUIS_AUTHKEY=$(az keyvault secret show --id "https://${KEY_VAULT_NAME}.vault.azure.net/secrets/luis-authoring-key" --query value | tr -d '"')
DL_KEY=$(az keyvault secret show --id "https://${KEY_VAULT_NAME}.vault.azure.net/secrets/directline-automation-key" --query value | tr -d '"')
bf='../scripts/node_modules/@microsoft/botframework-cli/bin/run'
SETTINGS='settings/appsettings.json'

if [[ ${LUIS_AUTHKEY} != null && ${LUIS_AUTHKEY} != "" ]]; then
    echo "* * * Publishing LUIS * * *"
    $bf luis:build --in generated/interruption --authoringKey ${LUIS_AUTHKEY} --botName ${LUIS_APP_NAME_BASE} --out generated --suffix composer --force --directVersionPublish
fi

echo "* * * Setting up and copying app settings * * *"
cp templates/appsettings.json.template $SETTINGS
sed -i "s/\[KEY_VAULT_NAME\]/${KEY_VAULT_NAME}/g" $SETTINGS
while IFS='' read -r id; do
    secret=$(az keyvault secret show --id $id --query value | tr -d '"')
    sed -i "s|$id|$secret|" $SETTINGS
done < <(grep -o "https://${KEY_VAULT_NAME}.vault.azure.net/secrets/[a-zA-Z-]*" "${SETTINGS}")

echo "* * * Configure Test Automation * * *"
sed -i "s/DIRECTLINE_SECRET/${DL_KEY}/g" botium.json