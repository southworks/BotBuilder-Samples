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
bf='node_modules/@microsoft/botframework-cli/bin/run'
SETTINGS='settings/appsettings.json'

echo "* * * Setting up directory structure * * *"
rm -rf generated
mkdir -p generated/interruption

if [[ ! -f settings/cross-train.config.json ]]; then
    mkdir settings && cp templates/cross-train.config.template settings/cross-train.config.json
fi
echo "* * * Cross training LUIS and QnA * * *"
$bf luis:cross-train --in . --out generated/interruption --config settings/cross-train.config.json --force

if [[ ${LUIS_AUTHKEY} != null && ${LUIS_AUTHKEY} != "" ]]; then
    echo "* * * Build and publish LUIS * * *"
    $bf luis:build --in generated/interruption --authoringKey ${LUIS_AUTHKEY} --botName ${LUIS_APP_NAME_BASE} --out generated --suffix composer --force --directVersionPublish
fi

if [[ ${QNA_SUBKEY} != null && ${QNA_SUBKEY} != "" ]]; then
    echo "* * * Build and publish QnA * * *"
    $bf qnamaker:build --in generated/interruption --subscriptionKey ${QNA_SUBKEY} --botName ${QNA_APP_NAME_BASE} --out generated --suffix composer --force
fi

echo "* * * Copying settings template * * *"
cp templates/appsettings.json.template $SETTINGS

echo "* * * Build project * * *"
npm install

echo "* * * Setting up ${BOT_PROJ_FILE_NAME} * *"
cp templates/.botproj.template $BOT_PROJ_FILE_NAME
MANIFEST_URL=$(az keyvault secret show --id "https://${KEY_VAULT_NAME}.vault.azure.net/secrets/live-agent-skill-manifest-url" --query value | tr -d '"')
sed -i "s|LIVE_AGENT_SKILL_MANIFEST_URL|${MANIFEST_URL}|g" $BOT_PROJ_FILE_NAME
