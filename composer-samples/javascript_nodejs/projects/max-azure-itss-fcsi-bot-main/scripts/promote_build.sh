#!/bin/bash -eu

# this script assumes the following prerequisites
# @microsoft/botframework-cli@next package with @microsoft/bf-sampler-cli@beta plugin
# azure account is logged in and subscription is set

KEY_VAULT_NAME=${keyVaultName:?}
LUIS_APP_NAME_BASE=${luisAppNameBase:?}
QNA_APP_NAME_BASE=${qnaAppNameBase:?}
BOT_NAME=${botName:?}
BOT_PROJ_FILE_NAME="${BOT_NAME}.botproj"

LUIS_AUTHKEY=$(az keyvault secret show --id "https://${KEY_VAULT_NAME}.vault.azure.net/secrets/luis-authoring-key" --query value | tr -d '"')
QNA_SUBKEY=$(az keyvault secret show --id "https://${KEY_VAULT_NAME}.vault.azure.net/secrets/qna-subscription-key" --query value | tr -d '"')
DL_KEY=$(az keyvault secret show --id "https://${KEY_VAULT_NAME}.vault.azure.net/secrets/directline-automation-key" --query value | tr -d '"')
bf='../node_modules/@microsoft/botframework-cli/bin/run'
SETTINGS='settings/appsettings.json'

if [[ ${LUIS_AUTHKEY} != null && ${LUIS_AUTHKEY} != "" ]]; then
    echo "* * * Publishing LUIS * * *"
    $bf luis:build --in generated/interruption --authoringKey ${LUIS_AUTHKEY} --botName ${LUIS_APP_NAME_BASE} --out generated --suffix composer --force --directVersionPublish
fi
if [[ ${QNA_SUBKEY} != null && ${QNA_SUBKEY} != "" ]]; then
    echo "* * * Publishing QnA * * *"
    $bf qnamaker:build --in generated/interruption --subscriptionKey ${QNA_SUBKEY} --botName ${QNA_APP_NAME_BASE} --out generated --suffix composer --force
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

echo "* * * Setting up ${BOT_PROJ_FILE_NAME} * *"
cp templates/.botproj.template $BOT_PROJ_FILE_NAME
MANIFEST_URL=$(az keyvault secret show --id "https://${KEY_VAULT_NAME}.vault.azure.net/secrets/live-agent-skill-manifest-url" --query value | tr -d '"')
sed -i "s|LIVE_AGENT_SKILL_MANIFEST_URL|${MANIFEST_URL}|g" $BOT_PROJ_FILE_NAME