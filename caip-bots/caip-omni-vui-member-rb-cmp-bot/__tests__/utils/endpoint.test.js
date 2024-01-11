const {
  configureHealthEndpoint,
  configureAvailabilityEndpoint,
  configureManifestsEndpoint,
} = require("../../utils/endpoint");
const sinon = require("sinon");
const fs = require("fs");

describe("Endpoint", () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it("should configure health endpoint", () => {
    const getStub = sandbox.stub();
    const server = { get: getStub };
    configureHealthEndpoint(server);
    sinon.assert.calledWithExactly(getStub, "/", sinon.match.func);
    sinon.assert.calledWithExactly(getStub, "/api/health", sinon.match.func);

    const sendStub = sandbox.stub();
    const rootCallback = getStub.getCall(0).args[1];
    const healthCallback = getStub.getCall(1).args[1];
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
});
