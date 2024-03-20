#!/usr/bin/env bash
set -e

# The webapp is configured to run this script on startup, so if the name or location ar changed, the corresponding startup
# command in configure_app_service_for_dynatrace.sh needs to be updated as well.

# This needs to point to the same path which DT is extracted to (see scripts/download_extract_dynatrace.sh)
echo "Starting application..."
LD_PRELOAD="/home/site/wwwroot/dynatrace/oneagent/agent/lib64/liboneagentproc.so" node /home/site/wwwroot/index.js