#!/usr/bin/env bash
set -e

# Lookup the absolute path of this script (e.g. absolute path to scripts dir)
SCRIPT_DIR=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
# Save the PWD on a stack, and change into parent dir.
pushd "$SCRIPT_DIR/.."

DT_ENDPOINT="${dtEndpoint:?}"
DT_TENANT_ID="${dtTenantId:?}"

wget --no-check-certificate -O /tmp/installer.sh -q "$DT_ENDPOINT/e/$DT_TENANT_ID/api/v1/deployment/installer/agent/unix/paas-sh/latest?Api-Token=$DYNATRACE_API_TOKEN&include=nodejs"

echo "Downloaded dynatrace installer. Size:"
stat -c%s /tmp/installer.sh

echo "Running dynatrace installer..."

# Using pwd, as the installer doesn't work with relative paths.
# This is referenced by custom_startup.sh, so any changes to TARGET_DIR here need to be reflected there.
TARGET_DIR=$(pwd)
sh -x /tmp/installer.sh "$TARGET_DIR"

popd