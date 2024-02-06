// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// const { makeApp } = require('botbuilder-dialogs-adaptive-runtime-integration-express');
const { start } = require('botbuilder-dialogs-adaptive-runtime-integration-restify');
// const { getRuntimeServices } = require('botbuilder-dialogs-adaptive-runtime');
// const restify = require('restify');

(async function () {
  try {
    await start(process.cwd(), "settings");
    // const applicationRoot = process.cwd();
    // const settingsDirectory = "settings";

    // const [services, configuration] = await getRuntimeServices(applicationRoot, settingsDirectory);
    // const [, listen] = await makeApp(services, configuration, applicationRoot, {}, restify.createServer());

    // listen();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

