
import {
    Expression,
    StringExpression,
    StringExpressionConverter,
    ObjectExpression,
    BoolExpressionConverter,
    BoolExpression,
    ValueExpressionConverter,
    ValueExpression
} from "adaptive-expressions";
import { expect } from "chai";
import * as sinon from "sinon";
import "mocha";
import { RapidMessageDialog } from "../src/RapidMessageDialog";
import { DialogContext, DialogSet } from "botbuilder-dialogs";
import { ContainerClient, BlockBlobClient } from "@azure/storage-blob";
import { BotTelemetryClient, NullTelemetryClient } from "botbuilder";
const nock = require('nock');
describe("RapidMessageDialog", () => {
    let sandbox: sinon.SinonSandbox;
    let nulltelemetryClient: BotTelemetryClient;
    let blobClientstub = sinon.createStubInstance(BlockBlobClient);
    const dialog = new RapidMessageDialog();
    dialog.resultProperty = new StringExpression("dialog.result");
    const endpoint = "https://unittesting.optum.com/api/omnicustomaction";
    const tokenEndpoint = "https://unittesting.optum.com/api/getAccessToken";
    const response = () => {
        return new Promise((resolve) => {
            setTimeout(() => resolve('{ "OPM": { "Toggle_Master": "false" } }'), 900);
        })
    };
    const tokenresponse = () => {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ "access_token": "asdfghjkl123456789qwertyuiop", "token_type": "Bearer", "expires_in": 1391 }), 100);
        })
    };
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        nulltelemetryClient = new NullTelemetryClient();
        sandbox
            .stub(RapidMessageDialog.prototype, <any>"getDMObject")
            .returns("Test");
        sandbox
            .stub(RapidMessageDialog.prototype, <any>"setDMObject")
            .returns("Test");
        sandbox
            .stub(RapidMessageDialog.prototype, <any>"getBlockBlobClient")
            .returns(blobClientstub);
        sandbox
            .stub(BlockBlobClient.prototype, <any>"exists")
            .resolves(true);
        sandbox
            .stub(ContainerClient.prototype, <any>"getBlockBlobClient")
            .returns(blobClientstub);
        sandbox
            .stub(RapidMessageDialog.prototype, <any>"streamToString")
            .returns("");
        sandbox
            .stub(DialogSet.prototype, <any>"telemetryClient")
            .returns(nulltelemetryClient);
        if (!nock.isActive()) {
            nock.activate();
        }
        nock("https://unittesting.optum.com")
            .post("/api/getAccessToken")
            .reply(200, tokenresponse);
        nock("https://unittesting.optum.com")
            .post("/api/omnicustomaction")
            .reply(200, response);
    });
    afterEach(() => {
        sandbox.restore();
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
        dialog.disabled = new BoolExpression(false);
        const expectedResponse = { status: 'error', data: "Please provide Azure Blob Connection String and Container Name properties" };
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
        dialog.disabled = new BoolExpression(false);
        dialog.connectionString = new StringExpression("connectionString");
        const expectedResponse = { status: 'error', data: "Please provide Azure Blob Connection String and Container Name properties" };
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

    it("should return Please provide Token Azure Blob Connection String and Container Name properties", async () => {
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        const expectedResponse = { status: 'error', data: "Please provide Token Azure Blob Connection String and Container Name properties" };
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

    it("should return Please provide Token Azure Blob Connection String and Container Name properties", async () => {
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenConnectionString = new StringExpression("tokenconnectionString");
        const expectedResponse = { status: 'error', data: "Please provide Token Azure Blob Connection String and Container Name properties" };
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

    it("should return Please provide Token Url, client id and client secret properties", async () => {
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenConnectionString = new StringExpression("tokenconnectionString");
        dialog.tokenContainerName = new StringExpression("tokenContainerName");
        const expectedResponse = { status: 'error', data: "Please provide Token Url, client id and client secret properties" };
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

    it("should return Please provide Token Url, client id and client secret properties", async () => {
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenConnectionString = new StringExpression("tokenconnectionString");
        dialog.tokenContainerName = new StringExpression("tokenContainerName");
        dialog.tokenurl = new StringExpression("tokenurl");
        const expectedResponse = { status: 'error', data: "Please provide Token Url, client id and client secret properties" };
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

    it("should return Please provide Token Url, client id and client secret properties", async () => {
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenConnectionString = new StringExpression("tokenconnectionString");
        dialog.tokenContainerName = new StringExpression("tokenContainerName");
        dialog.tokenurl = new StringExpression("tokenurl");
        dialog.clientid = new StringExpression("clientid");
        const expectedResponse = { status: 'error', data: "Please provide Token Url, client id and client secret properties" };
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
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenConnectionString = new StringExpression("tokenconnectionString");
        dialog.tokenContainerName = new StringExpression("tokenContainerName");
        dialog.tokenurl = new StringExpression("tokenurl");
        dialog.clientid = new StringExpression("clientid");
        dialog.clientsecret = new StringExpression("clientsecret");
        const expectedResponse = { status: 'error', data: "Please provide Url properties" };
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

    it("should return Please provide Line Of Business, Location and Enviroment properties", async () => {
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenConnectionString = new StringExpression("tokenconnectionString");
        dialog.tokenContainerName = new StringExpression("tokenContainerName");
        dialog.tokenurl = new StringExpression(tokenEndpoint);
        dialog.clientid = new StringExpression("clientid");
        dialog.clientsecret = new StringExpression("clientsecret");
        dialog.url = new StringExpression(endpoint);
        const expectedResponse = { status: 'error', data: "Please provide Line Of Business, Location and Enviroment properties" };
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

    it("should return Please provide Line Of Business, Location and Enviroment properties", async () => {
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenConnectionString = new StringExpression("tokenconnectionString");
        dialog.tokenContainerName = new StringExpression("tokenContainerName");
        dialog.tokenurl = new StringExpression(tokenEndpoint);
        dialog.clientid = new StringExpression("clientid");
        dialog.clientsecret = new StringExpression("clientsecret");
        dialog.url = new StringExpression(endpoint);
        dialog.lineOfBusiness = new StringExpression("lineOfBusiness");
        const expectedResponse = { status: 'error', data: "Please provide Line Of Business, Location and Enviroment properties" };
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

    it("should return Please provide Line Of Business, Location and Enviroment properties", async () => {
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenConnectionString = new StringExpression("tokenconnectionString");
        dialog.tokenContainerName = new StringExpression("tokenContainerName");
        dialog.tokenurl = new StringExpression(tokenEndpoint);
        dialog.clientid = new StringExpression("clientid");
        dialog.clientsecret = new StringExpression("clientsecret");
        dialog.url = new StringExpression(endpoint);
        dialog.lineOfBusiness = new StringExpression("lineOfBusiness");
        dialog.location = new StringExpression("location");
        const expectedResponse = { status: 'error', data: "Please provide Line Of Business, Location and Enviroment properties" };
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

    it("should return Rapid Message Data", async () => {
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenConnectionString = new StringExpression("tokenconnectionString");
        dialog.tokenContainerName = new StringExpression("tokenContainerName");
        dialog.tokenurl = new StringExpression(tokenEndpoint);
        dialog.clientid = new StringExpression("clientid");
        dialog.clientsecret = new StringExpression("clientsecret");
        dialog.url = new StringExpression(endpoint);
        dialog.lineOfBusiness = new StringExpression("lineOfBusiness");
        dialog.location = new StringExpression("location");
        dialog.env = new StringExpression("Enviroment");
        const expectedResponse = { status: 'success', data: JSON.stringify({ OPM: { "Toggle_Master": "false" } }) };
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

    it("should return Rapid Message Data for Token local Cache", async () => {
        const expectedResponse = { status: 'success', data: JSON.stringify({ OPM: { "Toggle_Master": "false" } }) };
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

    it("should return Rapid Message Data", async () => {
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenConnectionString = new StringExpression("tokenconnectionString");
        dialog.tokenContainerName = new StringExpression("tokenContainerName");
        dialog.tokenurl = new StringExpression(tokenEndpoint);
        dialog.clientid = new StringExpression("clientid");
        dialog.clientsecret = new StringExpression("clientsecret");
        dialog.url = new StringExpression(endpoint);
        dialog.timeout = new StringExpression("400");
        dialog.lineOfBusiness = new StringExpression("lineOfBusiness");
        dialog.location = new StringExpression("location");
        dialog.env = new StringExpression("Enviroment");
        const expectedResponse = { status: 'error', data: 'timeout of 400ms exceeded' };
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
});

describe("RapidMessageDialog Data from Azure Blob", () => {
    let sandbox: sinon.SinonSandbox;
    let nulltelemetryClient: BotTelemetryClient;
    const dialog = new RapidMessageDialog();
    dialog.resultProperty = new StringExpression("dialog.result");
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        nulltelemetryClient = new NullTelemetryClient();

        sandbox
            .stub(BlockBlobClient.prototype, <any>"exists")
            .resolves(true);
        sandbox
            .stub(BlockBlobClient.prototype, <any>"getProperties")
            .resolves({ lastModified: new Date() });
    sandbox
        .stub(RapidMessageDialog.prototype, <any>"getDMObject")
        .returns({ OPM: { "Toggle_Master": "false" } });
    sandbox
        .stub(DialogSet.prototype, <any>"telemetryClient")
        .returns(nulltelemetryClient);

});
afterEach(() => {
    sandbox.restore();
});
it("should return Rapid Message Data", async () => {
    dialog.connectionString = new StringExpression("DefaultEndpointsProtocol=https;AccountName=substoreage;AccountKey=skdjfhskdjfh=;EndpointSuffix=test.windows.net");
    dialog.containerName = new StringExpression("containerName");
    dialog.tokenConnectionString = new StringExpression("tokenconnectionString");
    dialog.tokenContainerName = new StringExpression("tokenContainerName");
    dialog.tokenurl = new StringExpression("tokenEndpoint");
    dialog.clientid = new StringExpression("clientid");
    dialog.clientsecret = new StringExpression("clientsecret");
    dialog.url = new StringExpression("endpoint");
    dialog.lineOfBusiness = new StringExpression("lineOfBusiness");
    dialog.location = new StringExpression("location");
    dialog.env = new StringExpression("Enviroment");
    const expectedResponse = { status: 'success', data: { OPM: { "Toggle_Master": "false" } } };
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
});

describe("RapidMessageDialog for subFunction", () => {
    let sandbox: sinon.SinonSandbox;
    const dialog = new RapidMessageDialog();

    let blobClientstub = sinon.createStubInstance(BlockBlobClient);
    dialog.resultProperty = new StringExpression("dialog.result");
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("getBlockBlobClient should return BlockBlobClient", async () => {
        let bcontainerstub = sinon.createStubInstance(ContainerClient);
        bcontainerstub.getBlockBlobClient.returns(blobClientstub);
        let result = await dialog.getBlockBlobClient("DefaultEndpointsProtocol=https;AccountName=substoreage;AccountKey=skdjfhskdjfh=;EndpointSuffix=test.windows.net", "containerName", "cacheObjectKey");
        expect(result).to.instanceOf(BlockBlobClient);
    });
    it("getCacheObject should return string", async () => {
        blobClientstub.download.returnsArg(0);
        sandbox
            .stub(RapidMessageDialog.prototype, <any>"streamToString")
            .returns("test");
        let result = await dialog.getDMObject(blobClientstub);
        expect(result).to.equals("test");
    });
    it("should return BlockBlobUploadResponse", async () => {
        blobClientstub.upload.returnsArg(1);
        let result = await dialog.setDMObject(blobClientstub, { "data": "Value" });
        expect(result).to.not.NaN;
    });
});

describe("RapidMessageDialog for error", () => {
    let sandbox: sinon.SinonSandbox;
    const dialog = new RapidMessageDialog();
    dialog.resultProperty = new StringExpression("dialog.result");
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("should return error", async () => {
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tokenConnectionString = new StringExpression("tokenconnectionString");
        dialog.tokenContainerName = new StringExpression("tokenContainerName");
        dialog.tokenurl = new StringExpression("tokenEndpoint");
        dialog.clientid = new StringExpression("clientid");
        dialog.clientsecret = new StringExpression("clientsecret");
        dialog.url = new StringExpression("endpoint");
        dialog.lineOfBusiness = new StringExpression("lineOfBusiness");
        dialog.location = new StringExpression("location");
        dialog.env = new StringExpression("Enviroment");
        const expectedResponse = {
            status: 'error',
            data: 'Unable to extract accountName with provided information.'
        };
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
        const dialog = new RapidMessageDialog();
        expect(dialog.id).equals("Optum.RapidMessageDialog");
        const lineOfBusiness = dialog.getConverter("lineOfBusiness");
        const location = dialog.getConverter("location");
        const env = dialog.getConverter("env");
        const callId = dialog.getConverter("callId");
        const resConvert = dialog.getConverter("resultProperty");
        const undefConvert = dialog.getConverter("id");
        const disable = dialog.getConverter("disabled");
        expect(lineOfBusiness).instanceOf(StringExpressionConverter);
        expect(location).instanceOf(StringExpressionConverter);
        expect(env).instanceOf(StringExpressionConverter);
        expect(callId).instanceOf(StringExpressionConverter);
        expect(resConvert).instanceOf(StringExpressionConverter);
        expect(disable).instanceOf(BoolExpressionConverter);
        expect(undefConvert).to.be.undefined;
    });
});

describe("streamToString", () => {
    let sandbox: sinon.SinonSandbox;
    let resolvesPromise = sinon.stub().resolves();
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(stubReadableStream.prototype, <any>"eventNames").returns(resolvesPromise);
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("should return Resolves promise", async () => {
        const dialog = new RapidMessageDialog();
        let inputstream: stubReadableStream = new stubReadableStream();
        let result = await dialog.streamToString(inputstream);
        expect(result).to.equals("test");
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
            .stub(RapidMessageDialog.prototype, <any>"getBlockBlobClient")
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
        const dialog = new RapidMessageDialog();
        let accesstoken = await dialog.getAccessToken(tokenEndpoint, "clientid", "clientsecret", "tokencontentType", 1000, "connectionString", "containerName");
        expect(accesstoken).to.not.equals("");
    });
    it("should return Error", async () => {
        const dialog = new RapidMessageDialog();
        try {
            await dialog.getAccessToken(tokenEndpoint, "clientid", "clientsecret", "tokencontentType", 500, "connectionString", "containerName");
        } catch (e) { expect(e).to.not.equals("") }
    });
});

describe("getAccessToken returns Error", () => {
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
            .stub(RapidMessageDialog.prototype, <any>"getBlockBlobClient")
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
        const dialog = new RapidMessageDialog();
        try {
            let accesstoken = await dialog.getAccessToken(tokenEndpoint, "clientid", "clientsecret", "tokencontentType", 1000, "connectionString", "containerName");
        } catch (e) { expect(e).to.not.equals("") }
    });
});

describe("getAccessToken with cache", () => {
    const dialog = new RapidMessageDialog();
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
            .stub(RapidMessageDialog.prototype, <any>"getBlockBlobClient")
            .returns(blockblobstub);
        sandbox
            .stub(RapidMessageDialog.prototype, <any>"getTokenFromStore")
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
        const dialog = new RapidMessageDialog();
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
            .stub(RapidMessageDialog.prototype, <any>"getBlockBlobClient")
            .returns(blockblobstub);
        sandbox
            .stub(RapidMessageDialog.prototype, <any>"getTokenFromStore")
            .returns(JSON.stringify({ "access_token": "asdfghjkl123456789qwertyuiop", "token_type": "Bearer", "expires_in": 10, "Expirytime": Date.now() + 2000 }));
        dialog.tokenExpireTime = Date.now();
        dialog.tokenExpireMSecs = 10;
        let accesstoken = await dialog.getAccessToken(tokenEndpoint, "clientid", "clientsecret", "tokencontentType", 1000, "connectionString", "containerName");
        expect(accesstoken).to.not.equals("");
    });
});

class stubReadableStream implements NodeJS.ReadableStream {
    readable: boolean = true;
    read(size?: number): string | Buffer {
        return "data";
    }
    setEncoding(encoding: BufferEncoding): this {
        return this;
    }
    pause(): this {
        throw new Error("Method not implemented.");
    }
    resume(): this {
        throw new Error("Method not implemented.");
    }
    isPaused(): boolean {
        throw new Error("Method not implemented.");
    }
    pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean; }): T {
        throw new Error("Method not implemented.");
    }
    unpipe(destination?: NodeJS.WritableStream): this {
        throw new Error("Method not implemented.");
    }
    unshift(chunk: string | Uint8Array, encoding?: BufferEncoding): void {
        throw new Error("Method not implemented.");
    }
    wrap(oldStream: NodeJS.ReadableStream): this {
        throw new Error("Method not implemented.");
    }
    [Symbol.asyncIterator](): AsyncIterableIterator<string | Buffer> {
        return stringGenerator();
    }
    addListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    on(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    once(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    off(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    removeAllListeners(event?: string | symbol): this {
        throw new Error("Method not implemented.");
    }
    setMaxListeners(n: number): this {
        throw new Error("Method not implemented.");
    }
    getMaxListeners(): number {
        throw new Error("Method not implemented.");
    }
    listeners(eventName: string | symbol): Function[] {
        throw new Error("Method not implemented.");
    }
    rawListeners(eventName: string | symbol): Function[] {
        throw new Error("Method not implemented.");
    }
    emit(eventName: string | symbol, ...args: any[]): boolean {
        throw new Error("Method not implemented.");
    }
    listenerCount(eventName: string | symbol): number {
        throw new Error("Method not implemented.");
    }
    prependListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    prependOnceListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    eventNames(): (string | symbol)[] {
        throw new Error("Method not implemented.");
    }
}

async function* stringGenerator(): AsyncGenerator<string> {
    let returnflag: boolean = true;
    while (returnflag) {
        returnflag = false;
        yield new Promise<string>(resolve => resolve("test"));
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}