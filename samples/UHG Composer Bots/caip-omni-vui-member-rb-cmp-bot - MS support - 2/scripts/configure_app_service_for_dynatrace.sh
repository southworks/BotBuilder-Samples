#!/usr/bin/env bash
set -e

# Lookup the absolute path of this script (e.g. absolute path to scripts dir)
SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
# Save the PWD on a stack, and change into parent dir.
pushd "$SCRIPT_DIR/.."

ENV="${env:?}"
RESOURCE_JSON="${resourceJson:?}"
DT_ENDPOINT="${dtEndpoint:?}"
DT_TENANT_ID="${dtTenantId:?}"

echo "Retrieving Dynatrace connection info..."
DT_CONNECTION_INFO=$(curl -k "$DT_ENDPOINT/e/$DT_TENANT_ID/api/v1/deployment/installer/agent/connectioninfo?Api-Token=${DYNATRACE_API_TOKEN:?}")

DT_TENANTTOKEN=$(jq -r '.tenantToken' <<< "$DT_CONNECTION_INFO")

# Connection endpoint is queried from DT rather than being in env-values.json environment vars
# in case the DT VM's private IP changes.
DT_CONNECTION_POINT=$(jq -r '.formattedCommunicationEndpoints' <<< "$DT_CONNECTION_INFO")

JSON=$(echo ${RESOURCE_JSON} | jq -c '{key_vault_name, resource_group_name, app_service_name}')

while IFS='' read -r resource; do
    kv=`echo $resource | jq '. | .key_vault_name' -r`
    rg=`echo $resource | jq '. | .resource_group_name' -r`
    webapp=`echo $resource | jq '. | .app_service_name' -r`

    echo "Updating app settings for ${webapp} in ${rg}..."
    az webapp config appsettings set -g "${rg}" -n "${webapp}" -s "prerelease" \
        --settings "DT_TENANTTOKEN=$DT_TENANTTOKEN" "DT_CONNECTION_POINT=$DT_CONNECTION_POINT" "@./appsettings/${ENV}-values.json" \
        --only-show-errors -o none

    echo "Updating startup command for ${webapp} in ${rg}..."
    az webapp config set -g "${rg}" -n "${webapp}" -s "prerelease" --startup-file="sh -x /home/site/wwwroot/scripts/custom_startup.sh" --only-show-errors

done <<< "$JSON"

popd > /dev/null