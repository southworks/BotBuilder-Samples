import { StringExpression, ValueExpression } from "adaptive-expressions";
import {
  ValueExpressionConverter,
  StringExpressionConverter,
} from "adaptive-expressions";
import { DialogContext } from "botbuilder-dialogs";
import { expect } from "chai";
import * as sinon from "sinon";
import { StargateProvider } from "../src/stargateProvider";
const proxyquire = require("proxyquire");

const settings1 = {};

const settings = {
  stargateToken: {
    URL: "https://stargate-unittests.optum.com",
    clientID: "123456",
    clientSecret: "clientSecret",
    tokenBodyParams : {
      resource : "resoruceId",
      anykey : "anyvalue"
    }
  }
};

describe("StargateProvider", () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it("should properties match", () => {
    const stargateProvider = new StargateProvider();
    expect(stargateProvider.id).equal("StargateProvider");

    const methodStrConverter = stargateProvider.getConverter("httpMethod");
    const urlStrConverter = stargateProvider.getConverter("url");
    const contentTypeStrConverter =
      stargateProvider.getConverter("contentType");
    const valueConverter = stargateProvider.getConverter("postBodyOrGetParams");
    const resultStrConverter = stargateProvider.getConverter("resultProperty");
    const undefConverter = stargateProvider.getConverter("id");

    expect(undefConverter).to.be.undefined;
    expect(stargateProvider.id).equal("StargateProvider");
    expect(methodStrConverter).instanceOf(StringExpressionConverter);
    expect(urlStrConverter).instanceOf(StringExpressionConverter);
    expect(contentTypeStrConverter).instanceOf(StringExpressionConverter);
    expect(valueConverter).instanceOf(ValueExpressionConverter);
    expect(resultStrConverter).instanceOf(StringExpressionConverter);
  });

  it("should return error when invalid authType is passed", async () => {
    const data =
      "StargateProvider invalid authType. valid authTypes are oauth and jwt";

    const expectedResponse = { statusCode: 200, content: data };

    const stargateProvider1 = proxyquire("../src/stargateProvider", {
      "@advanceddevelopment/caip-bot-core": {
        stargateOauthProvider: sinon
          .stub()
          .returns({ post: sinon.stub().resolves("VALID RESPONSE") }),
      },
    }).StargateProvider;
    const stargateProvider = new stargateProvider1();
    stargateProvider.authType = new StringExpression("oauth2");
    stargateProvider.httpMethod = new StringExpression("POST");
    stargateProvider.url = new StringExpression(
      "https://stargate-unittests.optum.com"
    );
    stargateProvider.contentType = new StringExpression("text/xml");
    stargateProvider.postBodyOrGetParams = new ValueExpression(
      "postBodyOrGetParams"
    );

    stargateProvider.resultProperty = new StringExpression("resultProperty");

    const endDialog = sandbox.fake();
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: sandbox.fake(),
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
    } as unknown as DialogContext;

    try {
      await stargateProvider.beginDialog(dc);
    } catch (err: any) {
      expect(err.message).equal(expectedResponse);
    }
  });

  it("should return valid response on post - oauth", async () => {
    const expectedResponse = { statusCode: 200, content: "VALID RESPONSE" };

    const stargateProvider1 = proxyquire("../src/stargateProvider", {
      "@advanceddevelopment/caip-bot-core": {
        stargateOauthProvider: sinon
          .stub()
          .returns({ post: sinon.stub().resolves("VALID RESPONSE") }),
      },
    }).StargateProvider;
    const stargateProvider = new stargateProvider1();
    stargateProvider.authType = new StringExpression("oauth2");
    stargateProvider.httpMethod = new StringExpression("POST");
    stargateProvider.url = new StringExpression(
      "https://stargate-unittests.optum.com"
    );
    stargateProvider.contentType = new StringExpression("text/xml");
    stargateProvider.postBodyOrGetParams = new ValueExpression(
      "postBodyOrGetParams"
    );

    stargateProvider.resultProperty = new StringExpression("resultProperty");

    const endDialog = sandbox.fake();
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: sandbox.fake(),
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
    } as unknown as DialogContext;

    await stargateProvider.beginDialog(dc);
    sinon.assert.calledWith(endDialog, expectedResponse);
  });

  it("should return valid response on get - oauth", async () => {
    const expectedResponse = { statusCode: 200, content: "VALID RESPONSE" };

    const stargateProvider1 = proxyquire("../src/stargateProvider", {
      "@advanceddevelopment/caip-bot-core": {
        stargateOauthProvider: sinon
          .stub()
          .returns({ get: sinon.stub().resolves("VALID RESPONSE") }),
      },
    }).StargateProvider;
    const stargateProvider = new stargateProvider1();
    stargateProvider.authType = new StringExpression("oauth2");
    stargateProvider.httpMethod = new StringExpression("GET");
    stargateProvider.url = new StringExpression(
      "https://stargate-unittests.optum.com"
    );
    stargateProvider.contentType = new StringExpression("text/xml");
    stargateProvider.postBodyOrGetParams = new ValueExpression();

    stargateProvider.resultProperty = new StringExpression("resultProperty");

    const endDialog = sandbox.fake();
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: sandbox.fake(),
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
    } as unknown as DialogContext;

    await stargateProvider.beginDialog(dc);
    sinon.assert.calledWith(endDialog, expectedResponse);
  });

  it("should return valid response on post - jwt", async () => {
    const expectedResponse = { statusCode: 200, content: "VALID RESPONSE" };

    const stargateProvider1 = proxyquire("../src/stargateProvider", {
      "@advanceddevelopment/caip-bot-core": {
        stargateJwtProvider: sinon
          .stub()
          .returns({ post: sinon.stub().resolves("VALID RESPONSE") }),
      },
    }).StargateProvider;
    const stargateProvider = new stargateProvider1();
    stargateProvider.authType = new StringExpression("jwt");
    stargateProvider.httpMethod = new StringExpression("POST");
    stargateProvider.url = new StringExpression(
      "https://stargate-unittests.optum.com"
    );
    stargateProvider.contentType = new StringExpression("text/xml");
    stargateProvider.postBodyOrGetParams = new ValueExpression(
      "postBodyOrGetParams"
    );

    stargateProvider.resultProperty = new StringExpression("resultProperty");

    const endDialog = sandbox.fake();
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: sandbox.fake(),
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
    } as unknown as DialogContext;

    await stargateProvider.beginDialog(dc);
    sinon.assert.calledWith(endDialog, expectedResponse);
  });

  it("should return valid response on put - oauth", async () => {
    const expectedResponse = { statusCode: 200, content: "VALID RESPONSE" };

    const stargateProvider1 = proxyquire("../src/stargateProvider", {
      "@advanceddevelopment/caip-bot-core": {
        stargateOauthProvider: sinon
          .stub()
          .returns({ put: sinon.stub().resolves("VALID RESPONSE") }),
      },
    }).StargateProvider;
    const stargateProvider = new stargateProvider1();
    stargateProvider.authType = new StringExpression("oauth2");
    stargateProvider.httpMethod = new StringExpression("PUT");
    stargateProvider.url = new StringExpression(
      "https://stargate-unittests.optum.com"
    );
    stargateProvider.contentType = new StringExpression("text/xml");
    stargateProvider.postBodyOrGetParams = new ValueExpression();

    stargateProvider.resultProperty = new StringExpression("resultProperty");

    const endDialog = sandbox.fake();
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: sandbox.fake(),
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
    } as unknown as DialogContext;

    await stargateProvider.beginDialog(dc);
    sinon.assert.calledWith(endDialog, expectedResponse);
  });

  it("should return valid response on put - jwt", async () => {
    const expectedResponse = { statusCode: 200, content: "VALID RESPONSE" };

    const stargateProvider1 = proxyquire("../src/stargateProvider", {
      "@advanceddevelopment/caip-bot-core": {
        stargateJwtProvider: sinon
          .stub()
          .returns({ put: sinon.stub().resolves("VALID RESPONSE") }),
      },
    }).StargateProvider;
    const stargateProvider = new stargateProvider1();
    stargateProvider.authType = new StringExpression("jwt");
    stargateProvider.httpMethod = new StringExpression("PUT");
    stargateProvider.url = new StringExpression(
      "https://stargate-unittests.optum.com"
    );
    stargateProvider.contentType = new StringExpression("text/xml");
    stargateProvider.postBodyOrGetParams = new ValueExpression(
      "postBodyOrGetParams"
    );

    stargateProvider.resultProperty = new StringExpression("resultProperty");

    const endDialog = sandbox.fake();
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: sandbox.fake(),
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
    } as unknown as DialogContext;

    await stargateProvider.beginDialog(dc);
    sinon.assert.calledWith(endDialog, expectedResponse);
  });

  it("should return valid response on get - jwt", async () => {
    const expectedResponse = { statusCode: 200, content: "VALID RESPONSE" };

    const stargateProvider1 = proxyquire("../src/stargateProvider", {
      "@advanceddevelopment/caip-bot-core": {
        stargateJwtProvider: sinon
          .stub()
          .returns({ get: sinon.stub().resolves("VALID RESPONSE") }),
      },
    }).StargateProvider;
    const stargateProvider = new stargateProvider1();
    stargateProvider.authType = new StringExpression("jwt");
    stargateProvider.httpMethod = new StringExpression("GET");
    stargateProvider.url = new StringExpression(
      "https://stargate-unittests.optum.com"
    );
    stargateProvider.contentType = new StringExpression("text/xml");
    stargateProvider.postBodyOrGetParams = new ValueExpression();

    stargateProvider.resultProperty = new StringExpression("resultProperty");

    const endDialog = sandbox.fake();
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: sandbox.fake(),
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
    } as unknown as DialogContext;

    await stargateProvider.beginDialog(dc);
    sinon.assert.calledWith(endDialog, expectedResponse);
  });

  it("should return error when invalid http method is passed", async () => {
    const data = "Invalid Http method. (supported methods: get, post and put)";
    const expectedResponse = { statusCode: 500, content: data };
    const stargateProvider = new StargateProvider();
    stargateProvider.authType = new StringExpression("oauth2");
    stargateProvider.httpMethod = new StringExpression("INVALID_POST");
    stargateProvider.url = new StringExpression(
      "https://stargate-unittests.optum.com"
    );
    stargateProvider.contentType = new StringExpression("text/xml");
    stargateProvider.postBodyOrGetParams = new ValueExpression(
      "postBodyOrGetParams"
    );

    stargateProvider.resultProperty = new StringExpression("resultProperty");

    const endDialog = sandbox.fake();
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: sandbox.fake(),
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
    } as unknown as DialogContext;

    await stargateProvider.beginDialog(dc);
    sinon.assert.calledWith(endDialog, expectedResponse);
  });

  it("should return error when stargate token properties are not set", async () => {
    const data =
      "StargateProvider requires stargate client_id and client_secret properties to be set in appsettings.json";
    const expectedResponse = { statusCode: 500, content: data };
    const stargateProvider = new StargateProvider();
    stargateProvider.authType = new StringExpression("oauth2");
    stargateProvider.httpMethod = new StringExpression("INVALID_POST");
    stargateProvider.url = new StringExpression(
      "https://stargate-unittests.optum.com"
    );
    stargateProvider.contentType = new StringExpression("text/xml");
    stargateProvider.postBodyOrGetParams = new ValueExpression(
      "postBodyOrGetParams"
    );

    stargateProvider.resultProperty = new StringExpression("resultProperty");

    const endDialog = sandbox.fake();
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: sandbox.fake(),
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings1),
        },
      },
    } as unknown as DialogContext;

    await stargateProvider.beginDialog(dc);
    sinon.assert.calledWith(endDialog, expectedResponse);
  });

  it("should return error when stargate token url not set for oauth", async () => {
    const data =
      "StargateProvider requires stargate token url to be set in appsettings.json";
    const expectedResponse = { statusCode: 500, content: data };
    const stargateProvider = new StargateProvider();
    stargateProvider.authType = new StringExpression("oauth2");
    stargateProvider.httpMethod = new StringExpression("INVALID_POST");
    stargateProvider.url = new StringExpression(
      "https://stargate-unittests.optum.com"
    );
    const settings = {
      stargateToken: {
        clientID: "123456",
        clientSecret: "clientSecret",
      },
    };
    stargateProvider.contentType = new StringExpression("text/xml");
    stargateProvider.postBodyOrGetParams = new ValueExpression(
      "postBodyOrGetParams"
    );

    stargateProvider.resultProperty = new StringExpression("resultProperty");

    const endDialog = sandbox.fake();
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: sandbox.fake(),
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
    } as unknown as DialogContext;

    await stargateProvider.beginDialog(dc);
    sinon.assert.calledWith(endDialog, expectedResponse);
  });

  it("should return error with http status code when stargate request error out", async () => {
    const data = "data not found";
    const expectedResponse = { statusCode: 404, content: data };
    const stargateProvider1 = proxyquire("../src/stargateProvider", {
      "@advanceddevelopment/caip-bot-core": {
        stargateJwtProvider: sinon.stub().returns({
          get: sinon
            .stub()
            .rejects({ response: { status: 404, statusText: data } }),
        }),
      },
    }).StargateProvider;
    const stargateProvider = new stargateProvider1();
    stargateProvider.authType = new StringExpression("jwt");
    stargateProvider.httpMethod = new StringExpression("GET");
    stargateProvider.url = new StringExpression(
      "https://stargate-unittests.optum.com"
    );

    stargateProvider.contentType = new StringExpression("text/xml");
    stargateProvider.postBodyOrGetParams = new ValueExpression(
      "postBodyOrGetParams"
    );

    stargateProvider.resultProperty = new StringExpression("resultProperty");

    const endDialog = sandbox.fake();
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: sandbox.fake(),
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
    } as unknown as DialogContext;

    await stargateProvider.beginDialog(dc);
    sinon.assert.calledWith(endDialog, expectedResponse);
  });

  it("should return 500 when stargate reject doesn't contain http response", async () => {
    const data = "internal server error";
    const expectedResponse = { statusCode: 500, content: data };
    const stargateProvider1 = proxyquire("../src/stargateProvider", {
      "@advanceddevelopment/caip-bot-core": {
        stargateJwtProvider: sinon.stub().returns({
          get: sinon.stub().rejects({ message: data }),
        }),
      },
    }).StargateProvider;
    const stargateProvider = new stargateProvider1();
    stargateProvider.authType = new StringExpression("jwt");
    stargateProvider.httpMethod = new StringExpression("GET");
    stargateProvider.url = new StringExpression(
      "https://stargate-unittests.optum.com"
    );

    stargateProvider.contentType = new StringExpression("text/xml");
    stargateProvider.postBodyOrGetParams = new ValueExpression(
      "postBodyOrGetParams"
    );

    stargateProvider.resultProperty = new StringExpression("resultProperty");

    const endDialog = sandbox.fake();
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: sandbox.fake(),
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
    } as unknown as DialogContext;

    await stargateProvider.beginDialog(dc);
    sinon.assert.calledWith(endDialog, expectedResponse);
  });
});
