const {
  configureHealthEndpoint,
  configureAvailabilityEndpoint,
  configureManifestsEndpoint,
  configureComponentHealthEndpoint,
} = require("../../utils/endpoint");
const sinon = require("sinon");
const fs = require("fs");
const path = require("path");
const axios = require("../../utils/customAxios");
const { SecretClient } = require("@azure/keyvault-secrets");
const { BlobServiceClient } = require("@azure/storage-blob");

describe("Endpoint", () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    delete process.env.NODE_ENV;
    delete process.env.MicrosoftTenantId;
    delete process.env.MicrosoftAppId;
    delete process.env.MicrosoftAppPassword;
    delete process.env.vaultUri;
    sandbox.restore();
  });

  it("should configure health endpoint", () => {
    const getStub = sandbox.stub();
    const headStub = sandbox.stub();
    const server = { get: getStub, head: headStub };
    configureHealthEndpoint(server);
    sinon.assert.calledWithExactly(getStub, "/", sinon.match.func);
    sinon.assert.calledWithExactly(headStub, "/api/health", sinon.match.func);

    const sendStub = sandbox.stub();
    const rootCallback = getStub.getCall(0).args[1];
    const healthCallback = headStub.getCall(0).args[1];
    rootCallback(null, { sendStatus: sendStub });
    healthCallback(null, { sendStatus: sendStub });
    sinon.assert.calledTwice(sendStub);
  });

  it("should configure availability endpoint", () => {
    const getStub = sandbox.stub();
    const server = { get: getStub };
    configureAvailabilityEndpoint(server);
    sinon.assert.calledOnceWithExactly(
      getStub,
      "/api/availability",
      sinon.match.func
    );

    const sendStub = sandbox.stub();
    const callback = getStub.getCall(0).args[1];
    callback(null, { sendStatus: sendStub });
    sinon.assert.calledWith(sendStub, 202);
  });

  it("should configure manifest endpoint", () => {
    sandbox.stub(fs, "existsSync").returns(true);
    const mockManifests = fs.readdirSync("__tests__/mocks/manifests");
    sandbox.stub(fs, "readdirSync").returns(mockManifests);
    const getStub = sandbox.stub();
    const server = { get: getStub };
    configureManifestsEndpoint(server);
    sinon.assert.calledOnceWithExactly(
      getStub,
      "/api/manifests/demo.json",
      sinon.match.func
    );

    const mockFile = fs.readFileSync(
      "__tests__/mocks/manifests/demo.json",
      "utf8"
    );
    sandbox.stub(fs, "readFileSync").returns(mockFile);
    const sendStub = sandbox.stub();
    const callback = getStub.getCall(0).args[1];
    callback(null, { send: sendStub });
    sinon.assert.calledWith(sendStub, { type: "demo" });
  });

  it("should configure default component health endpoint when running local", () => {
    const getStub = sandbox.stub();
    const server = { get: getStub };
    process.env.NODE_ENV = "dev";
    configureComponentHealthEndpoint(server);
    sinon.assert.calledWithExactly(getStub, "/api/health", sinon.match.func);

    const sendStub = sandbox.stub();
    const healthCallback = getStub.getCall(0).args[1];
    healthCallback(null, { sendStatus: sendStub });
    sinon.assert.calledOnce(sendStub);
  });
  
  it("should configure component health endpoint and receive failed response", async function () {
    // Need to wait as async calls can take a while
    this.timeout(30000);

    // Set mock env values
    process.env.MicrosoftTenantId = "MicrosoftTenantId";
    process.env.MicrosoftAppId = "MicrosoftAppId";
    process.env.MicrosoftAppPassword = "MicrosoftAppPassword";
    process.env.vaultUri = "invalidUri";

    // Stub out appsettings file
    sandbox.stub(path, "resolve").returns("mockPath");
    const mockAppSettings = fs.readFileSync(
      "__tests__/mocks/settings/appsettings.json"
    );
    sandbox.stub(fs, "readFileSync").returns(mockAppSettings);

    const getStub = sandbox.stub();
    const server = { get: getStub };
    configureComponentHealthEndpoint(server);
    sinon.assert.calledWithExactly(getStub, "/api/health", sinon.match.func);

    const expectedRes = [
      {
        serviceName: "LUIS",
        errorStatus: "LUIS App Down 500 ECONNREFUSED",
      },
     /* { serviceName: "CQA", errorStatus: "CQA App Down 500 ECONNREFUSED" },*/
      {
        serviceName: "Storage",
        errorStatus: "Storage Down 500 REQUEST_SEND_ERROR",
      },
      {
        serviceName: "Azure KeyVault",
        errorStatus: "Azure KeyVault Down 500 ERR_INVALID_URL",
      },
    ];

    const sendStub = sandbox.stub();
    const callback = getStub.getCall(0).args[1];
    await callback(null, { send: sendStub, statusCode: null });
    sinon.assert.calledWith(sendStub, expectedRes);
  });

  it("should configure component health endpoint and receive success response", async function () {
    // Need to wait as async calls can take a while
    this.timeout(30000);

    // Set mock env values
    process.env.MicrosoftTenantId = "MicrosoftTenantId";
    process.env.MicrosoftAppId = "MicrosoftAppId";
    process.env.MicrosoftAppPassword = "MicrosoftAppPassword";
    process.env.vaultUri = "validUri";

    // Stub out appsettings file
    sandbox.stub(path, "resolve").returns("mockPath");
    const mockAppSettings = fs.readFileSync(
      "__tests__/mocks/settings/appsettings.json"
    );
    sandbox.stub(fs, "readFileSync").returns(mockAppSettings);

    const getStub = sandbox.stub();
    const server = { get: getStub };
    configureComponentHealthEndpoint(server);
    sinon.assert.calledWithExactly(getStub, "/api/health", sinon.match.func);

    // Mock responses from dependencies
    sandbox.stub(axios, "get").resolves({ status: 200 });
    sandbox.stub(axios, "post").resolves({ status: 200 });
    sandbox.stub(SecretClient.prototype, "getSecret").resolves("mockSecret");
    sandbox
      .stub(BlobServiceClient.prototype, "getAccountInfo")
      .resolves("mockAccountInfo");

    const expectedRes = "All Services are up and running.";

    const sendStub = sandbox.stub();
    const callback = getStub.getCall(0).args[1];
    await callback(null, { send: sendStub, statusCode: null });
    sinon.assert.calledWith(sendStub, expectedRes);
  });
});