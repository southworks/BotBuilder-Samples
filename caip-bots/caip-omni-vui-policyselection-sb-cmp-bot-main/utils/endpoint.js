const fs = require("fs");
const path = require("path");

const axios = require("./customAxios");
const { SecretClient } = require("@azure/keyvault-secrets");
const {
  DefaultAzureCredential,
  ClientSecretCredential,
  ChainedTokenCredential,
} = require("@azure/identity");
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
} = require("@azure/storage-blob");

/**
 * Configure a server to serve manifest files.
 * @param server Web server to be configured.
 */
exports.configureManifestsEndpoint = (server) => {
  if (fs.existsSync("manifests")) {
    const manifestFiles = fs.readdirSync("manifests");
    const func = (file) => {
      return (_req, res) => {
        const manifest = JSON.parse(
          fs.readFileSync(path.join("manifests", file), "utf8")
        );
        res.send(manifest);
      };
    };
    for (const file of manifestFiles) {
      if (file.endsWith(".json")) {
        server.get(`/api/manifests/${file}`, func(file));
      }
    }
  }
};

/**
 * Configure health endpoint
 * @param server Web server to be configured.
 */
exports.configureHealthEndpoint = (server) => {
  server.get("/", (_req, res) => {
    res.sendStatus(200);
  });
  server.head("/api/health", (_req, res) => {
    res.sendStatus(200);
  });
};

/**
 * Configure availability endpoint
 * @param server Web server to be configured.
 */
exports.configureAvailabilityEndpoint = (server) => {
  server.get("/api/availability", (_req, res) => {
    res.sendStatus(202);
  });
};

/**
 * Configure component health endpoint.
 * @param server Web server to be configured.
 */
exports.configureComponentHealthEndpoint = (server) => {
   // Skip health check if running from local
   if (process.env.NODE_ENV == "dev") {
    server.get("/api/health", (_req, res) => {
      res.sendStatus(200);
    });
    return;
  }

  // Read App Settings file
  const appsettingsPath = path.resolve(
    __dirname,
    "../settings/appsettings.json"
  );
  const appSettings = JSON.parse(fs.readFileSync(appsettingsPath, "utf8"));

  // Set up error handling response format
  const errorHandling = (error) => {
    const code = error.code || error;
    const status =
      error.response && error.response != undefined
        ? error.response.status
        : 500;
    return { code, status };
  };

  // Set up LUIS parameters
  const luisEndpoint = appSettings.luis.endpoint;
  const appID = appSettings.luis.appId;
  const luisPredictionKey = appSettings.luis.endpointKey;
  const luisQuery = appSettings.luis.name; // Any query will work, might prefer an unknown intent response
  const luisTestURL = `${luisEndpoint}luis/prediction/v3.0/apps/${appID}/slots/production/predict?verbose=true&show-all-intents=true&log=true&subscription-key=${luisPredictionKey}&query=${luisQuery}`;
  
  /* Set up CQA parameters
  const cqaEndpoint = appSettings.languageService.endpoint;
  const cqaProjectName = appSettings.languageService.questionAnsweringProject;
  const cqaKey = appSettings.languageService.apiKey;
  const cqaTestUrl = `${cqaEndpoint}/language/:query-knowledgebases?projectName=${cqaProjectName}&api-version=2021-10-01&deploymentName="production"`;
  const data = JSON.stringify({
    top: 3,
    question: "hello", // Change if needed.
    includeUnstructuredSources: true,
    confidenceScoreThreshold: "0.5",
  });*/

  // Set up Storage Account parameters
  const connectionString = appSettings.BlobsStorage.connectionString;
  const result = connectionString.split(";").map((e) => e.split("="));
  const accountName = result[1][1];
  const sharedKey = result[2][1];
  const sharedKeyCreds = new StorageSharedKeyCredential(
    accountName,
    `${sharedKey}==`
  );
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    sharedKeyCreds
  );

  // Set up Key Vault parameters
  const clientCredential = new ClientSecretCredential(
    process.env.MicrosoftTenantId,
    process.env.MicrosoftAppId,
    process.env.MicrosoftAppPassword,
    {
      additionallyAllowedTenants: ["*"],
    }
  );
  const defaultCredential = new DefaultAzureCredential();
  const chainedCredentials = new ChainedTokenCredential(
    clientCredential,
    defaultCredential
  );

  server.get("/api/health", async (_req, _res) => {
    let errResponse = [];

    // Check LUIS health
    try {
      await axios.get(luisTestURL);
    } catch (error) {
      const e = errorHandling(error);
      const luisRes = "LUIS App Down " + e.status + " " + e.code;
      errResponse.push({
        serviceName: "LUIS",
        errorStatus: luisRes,
      });
    }

    /* Check CQA health
    if (!!cqaEndpoint || !!cqaProjectName || !!cqaKey) {
      try {
        await axios.post(cqaTestUrl, data, {
          headers: {
            "Ocp-Apim-Subscription-Key": cqaKey,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        const e = errorHandling(error);
        const cqaRes = "CQA App Down " + e.status + " " + e.code;
        errResponse.push({ serviceName: "CQA", errorStatus: cqaRes });
      }
    }*/

    // Check Storage Account health
    try {
      await blobServiceClient.getAccountInfo();
    } catch (error) {
      const e = errorHandling(error);
      const storageRes = "Storage Down " + e.status + " " + e.code;
      errResponse.push({
        serviceName: "Storage",
        errorStatus: storageRes,
      });
    }

    // Check Key Vault health
    try {
      const client = new SecretClient(process.env.vaultUri, chainedCredentials);
      await client.getSecret("app-insights-key");
    } catch (error) {
      const e = errorHandling(error);
      const keyVaultRes = "Azure KeyVault Down " + e.status + " " + e.code;
      errResponse.push({
        serviceName: "Azure KeyVault",
        errorStatus: keyVaultRes,
      });
    }

    const resStatus = errResponse.length > 0 ? 500 : 200;
    const resData =
      errResponse.length > 0 ? errResponse : "All Services are up and running.";

    _res.statusCode = resStatus;
    _res.send(resData);
  });
};