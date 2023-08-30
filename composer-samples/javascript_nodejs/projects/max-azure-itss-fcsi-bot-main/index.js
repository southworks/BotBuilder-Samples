// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

if (typeof globalThis === 'undefined') {
  global.globalThis = global;
}

const { getRuntimeServices } = require("botbuilder-dialogs-adaptive-runtime");
const {
  makeApp,
} = require("botbuilder-dialogs-adaptive-runtime-integration-express");
const {
  configureManifestsEndpoint,
  configureHealthEndpoint,
  configureAvailabilityEndpoint,
} = require("./utils/endpoint");

(async function () {
  try {
    setInterval(() => {
      const used = process.memoryUsage();
      console.log("-----------------------");
      for (let key in used) {
        console.log(
          `${key} ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`
        );
      }
      console.log("-----------------------");
    }, 10000);
    
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

    listen();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
