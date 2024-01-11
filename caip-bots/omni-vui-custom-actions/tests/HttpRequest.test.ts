import {
    Expression,
    StringExpression,
    StringExpressionConverter,
    ObjectExpression,
    NumberExpression,
    ValueExpression,
    NumberExpressionConverter,
    ValueExpressionConverter,
    BoolExpressionConverter,
    BoolExpression,
    IntExpressionConverter,
    IntExpression
} from "adaptive-expressions";
import { expect } from "chai";
import * as sinon from "sinon";
import "mocha";
import * as axios from "axios";
import { HttpMethod, HttpRequestDialog } from "../src/HttpRequestDialog";
import { DialogContext } from "botbuilder-dialogs";
import { BotTelemetryClient, NullTelemetryClient, TurnContext } from "botbuilder";
import { DialogSet } from "botbuilder-dialogs";
import { BlockBlobClient, ContainerClient } from "@azure/storage-blob";

const nock = require('nock');
describe("HttpRequestDialog", () => {
    let sandbox: sinon.SinonSandbox;
    let nulltelemetryClient: BotTelemetryClient;
    let tcstub = sinon.createStubInstance(TurnContext);
    let dsstub = sinon.createStubInstance(DialogSet);
    let blockblobstub = sinon.createStubInstance(BlockBlobClient);
    const dialog = new HttpRequestDialog();
    dialog.resultProperty = new StringExpression("dialog.result");
    const endpoint = "https://unittesting.optum.com/api/omnicustomaction";
    const tokenEndpoint = "https://unittesting.optum.com/api/getAccessToken";
    const response = () => {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ result: 'success data' }), 900);
        })
    };
    const response500ms = () => {
        return new Promise((reject) => {
            setTimeout(() => reject({ result: 'success data' }), 400);
        })
    };

    let successresult = {
        headers: { 'content-type': 'application/json' },
        'status_code': 200,
        status_messages: null,
        output: { result: 'success data' }
    };
    const tokenresponse = () => {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ "access_token": "asdfghjkl123456789qwertyuiop", "token_type": "Bearer", "expires_in": 1391 }), 100);
        })
    };
    let errorresult = {
        headers: "",
        status_code: 408,
        status_messages: "error",
        output: 'timeout of 900ms exceeded'
    };

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        nulltelemetryClient = new NullTelemetryClient();
        sandbox
            .stub(TurnContext.prototype, <any>"sendActivity")
        sandbox
            .stub(HttpRequestDialog.prototype, <any>"getBlockBlobClient")
            .returns(blockblobstub);
        sandbox
            .stub(DialogSet.prototype, <any>"telemetryClient")
            .returns(nulltelemetryClient);
        if (!nock.isActive()) {
            nock.activate();
        }
        nock("https://unittesting.optum.com")
            .get("/api/omnicustomaction")
            .reply(200, response);
        nock("https://unittesting.optum.com")
            .post("/api/omnicustomaction")
            .reply(200, response);
        nock("https://unittesting.optum.com")
            .put("/api/omnicustomaction")
            .reply(200, response);
        nock("https://unittesting.optum.com", {
            reqheaders: {
                "accept": "application/json, text/plain, */*",
                "content-type": "application/json",
                "authorization": "Bearer asdfghjkl123456789qwertyuiop",
                "user-agent": "axios/0.21.4",
                "content-length": 6
            },
            "body": "body"
        })
            .put("/api/omnicustomaction")
            .reply(200, response500ms);
        nock("https://unittesting.optum.com")
            .post("/api/getAccessToken")
            .reply(200, tokenresponse);
    });
    afterEach(() => {
        sandbox.restore();
        nock.cleanAll();
        nock.restore();
    });
    it("disabled", async () => {
        dialog.disabled = new BoolExpression(true);
        const endDialogFake = sandbox.fake();
        const setValueFake = sandbox.fake();
        const dc = ({
            endDialog: endDialogFake,
            state: {
                setValue: setValueFake,
            },
        } as unknown) as DialogContext;
        await dialog.beginDialog(dc);
        sandbox.assert.calledWith(endDialogFake);
    });
    it("should return Please provide Azure Blob Connection String and Container Name properties", async () => {
        dialog.method = HttpMethod.GET;
        dialog.disabled = new BoolExpression(false);
        const expectedResponse = { headers: "", "status_code": 0, status_messages: 'error', output: "Please provide Azure Blob Connection String and Container Name properties" };
        const endDialogFake = sandbox.fake();
        const setValueFake = sandbox.fake();
        const dc = ({
            endDialog: endDialogFake,
            state: {
                setValue: setValueFake,
            },
        } as unknown) as DialogContext;
        await dialog.beginDialog(dc);
        sandbox.assert.calledWith(endDialogFake, expectedResponse);
    });

    it("should return Please provide Azure Blob Connection String and Container Name properties", async () => {
        dialog.method = HttpMethod.GET;
        dialog.disabled = new BoolExpression(false);
        dialog.connectionString = new StringExpression("connectionString");
        const expectedResponse = { headers: "", "status_code": 0, status_messages: 'error', output: "Please provide Azure Blob Connection String and Container Name properties" };
        const endDialogFake = sandbox.fake();
        const setValueFake = sandbox.fake();
        const dc = ({
            endDialog: endDialogFake,
            state: {
                setValue: setValueFake,
            },
        } as unknown) as DialogContext;
        await dialog.beginDialog(dc);
        sandbox.assert.calledWith(endDialogFake, expectedResponse);
    });

    it("should return Please provide Token Url, client id and client secret or Authorization Header properties", async () => {
        dialog.method = HttpMethod.GET;
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        const expectedResponse = { headers: "", "status_code": 0, status_messages: 'error', output: "Please provide Token Url, client id and client secret or Authorization Header properties" };
        const endDialogFake = sandbox.fake();
        const setValueFake = sandbox.fake();
        const dc = ({
            endDialog: endDialogFake,
            state: {
                setValue: setValueFake,
            },
        } as unknown) as DialogContext;
        await dialog.beginDialog(dc);
        sandbox.assert.calledWith(endDialogFake, expectedResponse);
    });

    it("should return Please provide Token Url, client id and client secret or Authorization Header properties", async () => {
        dialog.method = HttpMethod.GET;
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenurl = new StringExpression("tokenurl");
        const expectedResponse = { headers: "", "status_code": 0, status_messages: 'error', output: "Please provide Token Url, client id and client secret or Authorization Header properties" };
        const endDialogFake = sandbox.fake();
        const setValueFake = sandbox.fake();
        const dc = ({
            endDialog: endDialogFake,
            state: {
                setValue: setValueFake,
            },
        } as unknown) as DialogContext;
        await dialog.beginDialog(dc);
        sandbox.assert.calledWith(endDialogFake, expectedResponse);
    });

    it("should return Please provide Token Url, client id and client secret or Authorization Header properties", async () => {
        dialog.method = HttpMethod.GET;
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenurl = new StringExpression("tokenurl");
        dialog.clientid = new StringExpression("clientid");
        const expectedResponse = { headers: "", "status_code": 0, status_messages: 'error', output: "Please provide Token Url, client id and client secret or Authorization Header properties" };
        const endDialogFake = sandbox.fake();
        const setValueFake = sandbox.fake();
        const dc = ({
            endDialog: endDialogFake,
            state: {
                setValue: setValueFake,
            },
        } as unknown) as DialogContext;
        await dialog.beginDialog(dc);
        sandbox.assert.calledWith(endDialogFake, expectedResponse);
    });

    it("should return Please provide Url properties", async () => {
        dialog.method = HttpMethod.GET;
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenurl = new StringExpression("tokenurl");
        dialog.clientid = new StringExpression("clientid");
        dialog.clientsecret = new StringExpression("clientsecret");
        const expectedResponse = { headers: "", "status_code": 0, status_messages: 'error', output: "Please provide Url properties" };
        const endDialogFake = sandbox.fake();
        const setValueFake = sandbox.fake();
        const dc = ({
            endDialog: endDialogFake,
            state: {
                setValue: setValueFake,
            },
        } as unknown) as DialogContext;
        await dialog.beginDialog(dc);
        sandbox.assert.calledWith(endDialogFake, expectedResponse);
    });

    it("should return status code 200 for Get", async () => {
        dialog.telemetryClient = nulltelemetryClient;
        dialog.method = HttpMethod.GET;
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenurl = new StringExpression(tokenEndpoint);
        dialog.clientid = new StringExpression("clientid");
        dialog.clientsecret = new StringExpression("clientsecret");
        dialog.url = new StringExpression(endpoint);
        dialog.timeout = new NumberExpression(1000);
        dialog.verbiageToggleVal = new BoolExpression(true);
        dialog.promptTime = new NumberExpression(200);
        dialog.firstPrompt = new ValueExpression({ "lgType": "Activity", "text": "we are working on it. Please wait", "speak": "we are working on it. Please wait" });
        dialog.repeatPrompt = new ValueExpression({ "lgType": "Activity", "text": "we are working on it. Please wait", "speak": "we are working on it. Please wait" });
        dialog.fstpmtteleval = new ValueExpression({ "name": "FirstPrompt_Peg" });
        const endDialogFake = sandbox.fake();
        const setValueFake = sandbox.fake();
        const dc = ({
            endDialog: endDialogFake,
            context: tcstub,
            dialogs: dsstub,
            state: {
                setValue: setValueFake,
            },
            telemetryClient: nulltelemetryClient
        } as unknown) as DialogContext;
        await dialog.beginDialog(dc);
        sandbox.assert.calledWith(endDialogFake, successresult);
    });

    it("should return status code 200 for POST", async () => {
        dialog.telemetryClient = nulltelemetryClient;
        dialog.method = HttpMethod.POST;
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenurl = new StringExpression(tokenEndpoint);
        dialog.clientid = new StringExpression("clientid");
        dialog.clientsecret = new StringExpression("clientsecret");
        dialog.url = new StringExpression(endpoint);
        dialog.verbiageToggleVal = new BoolExpression(false);
        dialog.body = new ValueExpression("body");
        const endDialogFake = sandbox.fake();
        const setValueFake = sandbox.fake();
        const dc = ({
            endDialog: endDialogFake,
            context: tcstub,
            dialogs: dsstub,
            state: {
                setValue: setValueFake,
            },
        } as unknown) as DialogContext;
        await dialog.beginDialog(dc);
        sandbox.assert.calledWith(endDialogFake, successresult);
    });

    it("should return status code 200 for PUT", async () => {
        dialog.method = HttpMethod.PUT;
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenurl = new StringExpression(tokenEndpoint);
        dialog.clientid = new StringExpression("clientid");
        dialog.clientsecret = new StringExpression("clientsecret");
        dialog.url = new StringExpression(endpoint);
        dialog.body = new ValueExpression("body");
        dialog.retryCount = new IntExpression(1);
        dialog.retryInterval = new NumberExpression(0);
        const endDialogFake = sandbox.fake();
        const setValueFake = sandbox.fake();
        const dc = ({
            endDialog: endDialogFake,
            state: {
                setValue: setValueFake,
            },
        } as unknown) as DialogContext;
        await dialog.beginDialog(dc);
        sandbox.assert.calledWith(endDialogFake, successresult);
    });

    it("should return status code 200 for PUT with retry options", async () => {
        dialog.method = HttpMethod.PUT;
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenurl = new StringExpression(tokenEndpoint);
        dialog.clientid = new StringExpression("clientid");
        dialog.clientsecret = new StringExpression("clientsecret");
        dialog.url = new StringExpression(endpoint);
        dialog.timeout = new NumberExpression(500);
        dialog.body = new ValueExpression("body");
        dialog.retryCount = new IntExpression(1);
        dialog.retryInterval = new NumberExpression(0);
        dialog.tokenExpireTime = Date.now();
        dialog.tokenExpireMSecs = 10;
        const endDialogFake = sandbox.fake();
        const setValueFake = sandbox.fake();
        const dc = ({
            endDialog: endDialogFake,
            state: {
                setValue: setValueFake,
            },
        } as unknown) as DialogContext;
        await dialog.beginDialog(dc);
        sandbox.assert.calledWith(endDialogFake, successresult);
    });

    it("should return status code 200 for POST with Authorization Header", async () => {
        dialog.telemetryClient = nulltelemetryClient;
        dialog.method = HttpMethod.POST;
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.authorizationHeader = new StringExpression("asdfghjkl123456789qwertyuiop");
        dialog.url = new StringExpression(endpoint);
        dialog.timeout = new NumberExpression(1000);
        dialog.body = new ValueExpression("body");
        const endDialogFake = sandbox.fake();
        const setValueFake = sandbox.fake();
        const dc = ({
            endDialog: endDialogFake,
            state: {
                setValue: setValueFake,
            },
        } as unknown) as DialogContext;
        await dialog.beginDialog(dc);
        sandbox.assert.calledWith(endDialogFake, successresult);
    });

    it("should return Timeout error for Get", async () => {
        dialog.telemetryClient = nulltelemetryClient;
        dialog.method = HttpMethod.GET;
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenurl = new StringExpression(tokenEndpoint);
        dialog.clientid = new StringExpression("clientid");
        dialog.clientsecret = new StringExpression("clientsecret");
        dialog.url = new StringExpression(endpoint);
        dialog.timeout = new NumberExpression(900);
        dialog.promptTime = new NumberExpression(200);
        dialog.retryCount = new IntExpression(0);
        const endDialogFake = sandbox.fake();
        const setValueFake = sandbox.fake();
        const dc = ({
            endDialog: endDialogFake,
            context: tcstub,
            dialogs: dsstub,
            state: {
                setValue: setValueFake,
            },
            telemetryClient: nulltelemetryClient
        } as unknown) as DialogContext;
        await dialog.beginDialog(dc);
        sandbox.assert.calledWith(endDialogFake, errorresult);
    });

    it("should return Timeout error for POST", async () => {
        dialog.telemetryClient = nulltelemetryClient;
        dialog.method = HttpMethod.POST;
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenurl = new StringExpression(tokenEndpoint);
        dialog.clientid = new StringExpression("clientid");
        dialog.clientsecret = new StringExpression("clientsecret");
        dialog.url = new StringExpression(endpoint);
        dialog.timeout = new NumberExpression(900);
        dialog.body = new ValueExpression("body");
        dialog.retryCount = new IntExpression(0);
        const endDialogFake = sandbox.fake();
        const setValueFake = sandbox.fake();
        const dc = ({
            endDialog: endDialogFake,
            context: tcstub,
            dialogs: dsstub,
            state: {
                setValue: setValueFake,
            },
        } as unknown) as DialogContext;
        await dialog.beginDialog(dc);
        sandbox.assert.calledWith(endDialogFake, errorresult);
    });

    it("should return error for PUT", async () => {
        dialog.method = HttpMethod.PUT;
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenurl = new StringExpression(tokenEndpoint);
        dialog.clientid = new StringExpression("clientid");
        dialog.clientsecret = new StringExpression("clientsecret");
        dialog.url = new StringExpression(endpoint);
        dialog.body = new ValueExpression("body");
        dialog.timeout = new NumberExpression(900);
        dialog.verbiageToggleVal = new BoolExpression(true);
        dialog.promptTime = new NumberExpression(200);
        dialog.firstPrompt = new ValueExpression({ "lgType": "Activity", "text": "we are working on it. Please wait", "speak": "we are working on it. Please wait" });
        dialog.repeatPrompt = new ValueExpression({ "lgType": "Activity", "text": "we are working on it. Please wait", "speak": "we are working on it. Please wait" });
        dialog.fstpmtteleval = new ValueExpression({ "name": "FirstPrompt_Peg" });
        dialog.retryCount = new IntExpression(0);
        const endDialogFake = sandbox.fake();
        const setValueFake = sandbox.fake();
        const dc = ({
            endDialog: endDialogFake,
            context: tcstub,
            dialogs: dsstub,
            state: {
                setValue: setValueFake,
            },
        } as unknown) as DialogContext;
        await dialog.beginDialog(dc);
        sandbox.assert.calledWith(endDialogFake, errorresult);
    });

});

describe("getConverter", () => {
    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });

    it("should return Converter", () => {
        const dialog = new HttpRequestDialog();
        expect(dialog.id).equals("Optum.HttpRequestDialog");
        const tokenurl = dialog.getConverter("tokenurl");
        const clientid = dialog.getConverter("clientid");
        const clientsecret = dialog.getConverter("clientsecret");
        const tokencontentType = dialog.getConverter("tokencontentType");
        const tokenTimeout = dialog.getConverter("tokenTimeout");
        const authorizationHeader = dialog.getConverter("authorizationHeader");
        const connectionString = dialog.getConverter("connectionString");
        const containerName = dialog.getConverter("containerName");
        const retryCount = dialog.getConverter("retryCount");
        const retryInterval = dialog.getConverter("retryInterval");
        const url = dialog.getConverter("url");
        const contentType = dialog.getConverter("contentType");
        const timeout = dialog.getConverter("timeout");
        const body = dialog.getConverter("body");
        const resConvert = dialog.getConverter("resultProperty");
        const undefConvert = dialog.getConverter("id");
        const disable = dialog.getConverter("disabled");
        const verbiageToggleVal = dialog.getConverter("verbiageToggleVal");
        const promptTime = dialog.getConverter("promptTime");
        const firstPrompt = dialog.getConverter("firstPrompt");
        const repeatPrompt = dialog.getConverter("repeatPrompt");
        const fstpmtteleval = dialog.getConverter("fstpmtteleval");
        const rptpmtteleval = dialog.getConverter("rptpmtteleval");
        expect(tokenurl).instanceOf(StringExpressionConverter);
        expect(clientid).instanceOf(StringExpressionConverter);
        expect(clientsecret).instanceOf(StringExpressionConverter);
        expect(tokencontentType).instanceOf(StringExpressionConverter);
        expect(tokenTimeout).instanceOf(NumberExpressionConverter);
        expect(authorizationHeader).instanceOf(StringExpressionConverter);
        expect(connectionString).instanceOf(StringExpressionConverter);
        expect(containerName).instanceOf(StringExpressionConverter);
        expect(retryCount).instanceOf(IntExpressionConverter);
        expect(retryInterval).instanceOf(NumberExpressionConverter);
        expect(url).instanceOf(StringExpressionConverter);
        expect(contentType).instanceOf(StringExpressionConverter);
        expect(timeout).instanceOf(NumberExpressionConverter);
        expect(body).instanceOf(ValueExpressionConverter);
        expect(resConvert).instanceOf(StringExpressionConverter);
        expect(disable).instanceOf(BoolExpressionConverter);
        expect(verbiageToggleVal).instanceOf(BoolExpressionConverter);
        expect(promptTime).instanceOf(NumberExpressionConverter);
        expect(firstPrompt).instanceOf(ValueExpressionConverter);
        expect(repeatPrompt).instanceOf(ValueExpressionConverter);
        expect(fstpmtteleval).instanceOf(ValueExpressionConverter);
        expect(rptpmtteleval).instanceOf(ValueExpressionConverter);
        expect(undefConvert).to.be.undefined;
    });
});

describe("getAccessToken", () => {
    let blockblobstub = sinon.createStubInstance(BlockBlobClient);
    const tokenEndpoint = "https://unittesting.optum.com/api/getAccessToken";
    const tokenresponse = () => {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ "access_token": "asdfghjkl123456789qwertyuiop", "token_type": "Bearer", "expires_in": 1391 }), 900);
        })
    };
    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox
            .stub(HttpRequestDialog.prototype, <any>"getBlockBlobClient")
            .returns(blockblobstub);
        if (!nock.isActive()) {
            nock.activate();
        }
        nock("https://unittesting.optum.com")
            .post("/api/getAccessToken")
            .reply(200, tokenresponse);
    });
    afterEach(() => {
        sandbox.restore();
        nock.cleanAll();
        nock.restore();
    });

    it("should return Access Token", async () => {
        const dialog = new HttpRequestDialog();
        let accesstoken = await dialog.getAccessToken(tokenEndpoint, "clientid", "clientsecret", "tokencontentType", 1000, "connectionString", "containerName");
        expect(accesstoken).to.not.equals("");
    });
    it("should return Error", async () => {
        const dialog = new HttpRequestDialog();
        try {
            await dialog.getAccessToken(tokenEndpoint, "clientid", "clientsecret", "tokencontentType", 500, "connectionString", "containerName");
        } catch (e) { expect(e).to.not.equals("") }
    });
});
describe("getAccessToken", () => {
    let blockblobstub = sinon.createStubInstance(BlockBlobClient);
    const tokenEndpoint = "https://unittesting.optum.com/api/getAccessToken";
    const tokenresponse = () => {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ "message": "Sorry, We can't serve you please try after sometime" }), 900);
        })
    };
    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox
            .stub(HttpRequestDialog.prototype, <any>"getBlockBlobClient")
            .returns(blockblobstub);
        if (!nock.isActive()) {
            nock.activate();
        }
        nock("https://unittesting.optum.com")
            .post("/api/getAccessToken")
            .reply(200, tokenresponse);
    });
    afterEach(() => {
        sandbox.restore();
        nock.cleanAll();
        nock.restore();
    });

    it("should return Error", async () => {
        const dialog = new HttpRequestDialog();
        try {
            let accesstoken = await dialog.getAccessToken(tokenEndpoint, "clientid", "clientsecret", "tokencontentType", 1000, "connectionString", "containerName");
        } catch (e) { expect(e).to.not.equals("") }
    });
});

describe("getAccessToken with cache", () => {
    const dialog = new HttpRequestDialog();
    let blockblobstub = sinon.createStubInstance(BlockBlobClient);
    blockblobstub.exists.resolves(true);
    const tokenEndpoint = "https://unittesting.optum.com/api/getAccessToken";
    const tokenresponse = () => {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ "access_token": "asdfghjkl123456789qwertyuiop", "token_type": "Bearer", "expires_in": 1391 }), 900);
        })
    };
    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox
            .stub(HttpRequestDialog.prototype, <any>"getBlockBlobClient")
            .returns(blockblobstub);
        sandbox
            .stub(HttpRequestDialog.prototype, <any>"getTokenFromStore")
            .returns(JSON.stringify({ "access_token": "asdfghjkl123456789qwertyuiop", "token_type": "Bearer", "expires_in": 100, "Expirytime": Date.now() }));
        if (!nock.isActive()) {
            nock.activate();
        }
        nock("https://unittesting.optum.com")
            .post("/api/getAccessToken")
            .reply(200, tokenresponse);
    });
    afterEach(() => {
        sandbox.restore();
        nock.cleanAll();
        nock.restore();
    });

    it("should return Access Token from Azure storage", async () => {
        const dialog = new HttpRequestDialog();
        let accesstoken = await dialog.getAccessToken(tokenEndpoint, "clientid", "clientsecret", "tokencontentType", 1000, "connectionString", "containerName");
        expect(accesstoken).to.not.equals("");
    });
    it("should return Access Token with invalid Azure storage", async () => {

        let accesstoken = await dialog.getAccessToken(tokenEndpoint, "clientid", "clientsecret", "tokencontentType", 1000, "connectionString", "containerName");
        expect(accesstoken).to.not.equals("");
    });
    it("should return Access Token with invalid Azure storage and invalid Local cache", async () => {
        dialog.tokenExpireTime = Date.now();
        dialog.tokenExpireMSecs = 10;
        let accesstoken = await dialog.getAccessToken(tokenEndpoint, "clientid", "clientsecret", "tokencontentType", 1000, "connectionString", "containerName");
        expect(accesstoken).to.not.equals("");
    });
    it("should return Access Token with Azure storage and invalid Local cache", async () => {
        sandbox.restore();
        sandbox
            .stub(HttpRequestDialog.prototype, <any>"getBlockBlobClient")
            .returns(blockblobstub);
        sandbox
            .stub(HttpRequestDialog.prototype, <any>"getTokenFromStore")
            .returns(JSON.stringify({ "access_token": "asdfghjkl123456789qwertyuiop", "token_type": "Bearer", "expires_in": 10, "Expirytime": Date.now() + 2000 }));
        dialog.tokenExpireTime = Date.now();
        dialog.tokenExpireMSecs = 10;
        let accesstoken = await dialog.getAccessToken(tokenEndpoint, "clientid", "clientsecret", "tokencontentType", 1000, "connectionString", "containerName");
        expect(accesstoken).to.not.equals("");
    });
});

