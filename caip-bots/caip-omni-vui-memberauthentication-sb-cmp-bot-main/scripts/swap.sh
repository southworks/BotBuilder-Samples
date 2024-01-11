#!/bin/bash -eu
# This script swapps the prerelease slot with the production slot
# resourceJson is a list of resource objects

RESOURCE_JSON=${resourceJson:?}

while read -r resource; do
    rg=`echo $resource | jq '. | .resource_group_name' -r`
    webapp=`echo $resource | jq '. | .app_service_name' -r`
    echo "echo * * * Swap to prerelease slot: ${webapp}, ${rg} * * *"
    az webapp deployment slot swap --slot prerelease --resource-group ${rg} --name ${webapp}
done < <(echo ${RESOURCE_JSON} | jq -c '.[] | {resource_group_name, app_service_name}')