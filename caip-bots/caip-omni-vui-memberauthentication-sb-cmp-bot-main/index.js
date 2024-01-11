// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { getRuntimeServices } = require("botbuilder-dialogs-adaptive-runtime");
const {
  makeApp,
} = require("botbuilder-dialogs-adaptive-runtime-integration-express");
const {
  configureManifestsEndpoint,
  configureHealthEndpoint,
  configureAvailabilityEndpoint,
  configureComponentHealthEndpoint,
} = require("./utils/endpoint");

(async function () {
  try {
    const applicationRoot = process.cwd();

    const [services, configuration] = await getRuntimeServices(
      applicationRoot,
      "settings"
    );

    const [app, listen] = await makeApp(
      services,
      configuration,
      applicationRoot
    );

    configureHealthEndpoint(app);
    configureAvailabilityEndpoint(app);
    configureManifestsEndpoint(app);
    configureComponentHealthEndpoint(app);

    listen();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
