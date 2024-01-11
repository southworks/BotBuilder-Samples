#!/bin/bash

ENV=${1:?}
SETTINGS="settings/appsettings.json"
KEY_VAULT_NAME="omnivui-kv-59e0-dev-v1"
LUIS_APP_NAME_BASE="caip-omni-vui-policyselection-sb-cmp-v1"

echo "logging in"
if az account get-access-token; then
	echo "already logged in..."
else
	az login
fi

echo "setting azure subscription"
if [[ "$ENV" == "dev" || "$ENV" == "qa" ]]; then
	az account set -s "cde58a60-b083-4190-8122-66243d80da50" || exit 1
else
	az account set -s "f963e1df-e288-4594-b8a4-0a8a3b04267d" || exit 1
fi

echo "adding secrets to appsettings"
cp templates/appsettings.json.template $SETTINGS
sed -i '' "s/\[KEY_VAULT_NAME\]/${KEY_VAULT_NAME}/g" $SETTINGS
while IFS='' read -r id; do
	secret=$(az keyvault secret show --id $id --query value | tr -d '"')
	sed -i '' "s|$id|$secret|" $SETTINGS
done < <(grep -o "https://${KEY_VAULT_NAME}.vault.azure.net/secrets/[a-zA-Z-]*" $SETTINGS)
echo "replacing luis app name"
sed -i '' "s/\[LUIS_APP_NAME_BASE\]/${LUIS_APP_NAME_BASE}/g" $SETTINGS