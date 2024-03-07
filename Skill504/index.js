// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const {
  start,
} = require("botbuilder-dialogs-adaptive-runtime-integration-express");
const Agent = require("agentkeepalive");

(async function () {
  try {
    await start(process.cwd(), "settings", {
      connectorClientOptions: {
        agentSettings: {
          http: new Agent({
            maxSockets: 128,
            maxFreeSockets: 128,
            timeout: 60000,
            freeSocketTimeout: 30000,
          }),
          https: new Agent.HttpsAgent({
            maxSockets: 128,
            maxFreeSockets: 128,
            timeout: 60000,
            freeSocketTimeout: 30000,
          }),
        },
      },
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
