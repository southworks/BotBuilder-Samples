#!/bin/bash

ENV=${1:?}
BOT_NAME=${2:?}
SETTINGS="settings/appsettings.json"



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

echo "getting bot resources id"
botResourcesId=$(az storage entity query --table-name botactive --account-name sttfstateva${ENV} --filter "PartitionKey eq '${ENV}' and RowKey eq '${BOT_NAME}'"  | jq '.items[0].bot_resources_id' -r)

echo "getting key vault name"
keyVaultName=$(az storage entity query --table-name botresources --account-name sttfstateva${ENV} --filter "PartitionKey eq '${BOT_NAME}' and RowKey eq '${botResourcesId}'"  | jq '.items[0].key_vault_name' -r)

echo "getting luis app name"
LUIS_APP_NAME_BASE=$(az storage entity query --table-name botresources --account-name sttfstateva${ENV} --filter "PartitionKey eq '${BOT_NAME}' and RowKey eq '${botResourcesId}'"  | jq '.items[0].luis_app_name_base' -r)

echo "adding secrets to appsettings"
cp templates/appsettings.json.template $SETTINGS
sed -i '' "s/\[KEY_VAULT_NAME\]/${keyVaultName}/g" $SETTINGS
while IFS='' read -r id; do
	secret=$(az keyvault secret show --id $id --query value | tr -d '"')
	sed -i '' "s|$id|$secret|" $SETTINGS
done < <(grep -o "https://${keyVaultName}.vault.azure.net/secrets/[a-zA-Z-]*" $SETTINGS)
echo "replacing luis app name"
sed -i '' "s/\[LUIS_APP_NAME_BASE\]/${LUIS_APP_NAME_BASE}/g" $SETTINGS

echo "building custom actions"
npm run build:customaction