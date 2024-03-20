
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
import { CacheAction, ObjectCacheDialog } from "../src/ObjectCacheDialog";
import { DialogContext, DialogSet } from "botbuilder-dialogs";
import { ContainerClient, BlockBlobClient,BlockBlobUploadResponse } from "@azure/storage-blob";
import { BotTelemetryClient, NullTelemetryClient, TurnContext } from "botbuilder";
describe("ObjectCacheDialog", () => {
    let sandbox: sinon.SinonSandbox;
    let nulltelemetryClient: BotTelemetryClient;
    let bcontainerstub = sinon.createStubInstance(ContainerClient);
    let blobClientstub = sinon.createStubInstance(BlockBlobClient);
    let tcstub = sinon.createStubInstance(TurnContext);
    let dsstub = sinon.createStubInstance(DialogSet);
    const dialog = new ObjectCacheDialog();
    dialog.resultProperty = new StringExpression("dialog.result");

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        nulltelemetryClient = new NullTelemetryClient();
        sandbox
            .stub(ObjectCacheDialog.prototype, <any>"getCacheObject")
            .returns("Test");
        sandbox
            .stub(ObjectCacheDialog.prototype, <any>"setCacheObject")
            .returns("Test");
        sandbox
            .stub(ObjectCacheDialog.prototype, <any>"getBlockBlobClient")
            .returns(blobClientstub);
        sandbox
            .stub(ContainerClient.prototype, <any>"getBlockBlobClient")
            .returns(blobClientstub);
        sandbox
            .stub(ObjectCacheDialog.prototype, <any>"streamToString")
            .returns("");
        sandbox
            .stub(DialogSet.prototype, <any>"telemetryClient")
            .returns(nulltelemetryClient);
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
    it("should return Please provide Connection String", async () => {
        dialog.disabled = new BoolExpression(false);
        dialog.action = CacheAction.GET;
        const expectedResponse = { status: 'error', data: "Please provide Connection String." };
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
    it("should return Please provide Container Name", async () => {
        dialog.connectionString = new StringExpression("connectionString");
        const expectedResponse = { status: 'error', data: "Please provide Container Name." };
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
    it("should return Please provide Cache Object Key", async () => {
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        const expectedResponse = { status: 'error', data: "Please provide Cache Object Key." };
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
    it("should return Success Get Action", async () => {
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.cacheObjectKey = new StringExpression("cacheObjectKey");
        const expectedResponse = { "status": "success", "data": "Test" };
        const endDialogFake = sandbox.fake();
        const setValueFake = sandbox.fake();
        const dc = ({
            endDialog: endDialogFake,
            context: tcstub,
            dialogs: dsstub,
            containerClient: bcontainerstub,
            blockBlobClient: blobClientstub,
            state: {
                setValue: setValueFake,
            },
        } as unknown) as DialogContext;
        await dialog.beginDialog(dc);
        sandbox.assert.calledWith(endDialogFake, expectedResponse);
    });
    it("should return Please provide Cache Object.", async () => {
        dialog.action = CacheAction.SET;
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.cacheObjectKey = new StringExpression("cacheObjectKey");
        const expectedResponse = { "status": "error", "data": "Please provide Cache Object." };
        const endDialogFake = sandbox.fake();
        const setValueFake = sandbox.fake();
        const dc = ({
            endDialog: endDialogFake,
            context: tcstub,
            dialogs: dsstub,
            containerClient: bcontainerstub,
            state: {
                setValue: setValueFake,
            },
        } as unknown) as DialogContext;
        await dialog.beginDialog(dc);
        sandbox.assert.calledWith(endDialogFake, expectedResponse);
    });
    it("should return Success Set Action", async () => {
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.cacheObjectKey = new StringExpression("cacheObjectKey");
        dialog.cacheObject = new ValueExpression("cacheObject");
        const expectedResponse = { "status": "success", "data": "Test" };
        const endDialogFake = sandbox.fake();
        const setValueFake = sandbox.fake();
        const dc = ({
            endDialog: endDialogFake,
            context: tcstub,
            dialogs: dsstub,
            containerClient: bcontainerstub,
            state: {
                setValue: setValueFake,
            },
        } as unknown) as DialogContext;
        await dialog.beginDialog(dc);
        sandbox.assert.calledWith(endDialogFake, expectedResponse);
    });
});

describe("ObjectCacheDialog for subFunction", () => {
    let sandbox: sinon.SinonSandbox;
    const dialog = new ObjectCacheDialog();

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
            .stub(ObjectCacheDialog.prototype, <any>"streamToString")
            .returns("test");
        let result = await dialog.getCacheObject(blobClientstub);
        expect(result).to.equals("test");
    });
    it("should return BlockBlobUploadResponse", async () => {
        blobClientstub.upload.returnsArg(1);
        let result = await dialog.setCacheObject(blobClientstub, { "data": "Value" });
        expect(result).to.not.NaN;
    });
});

describe("ObjectCacheDialog for error", () => {
    let sandbox: sinon.SinonSandbox;
    const dialog = new ObjectCacheDialog();
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
        dialog.cacheObjectKey = new StringExpression("cacheObjectKey");
        dialog.cacheObject = new ValueExpression("cacheObject");
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
        const dialog = new ObjectCacheDialog();
        expect(dialog.id).equals("Optum.ObjectCacheDialog");
        const cacheObjectKey = dialog.getConverter("cacheObjectKey");
        const cacheObject = dialog.getConverter("cacheObject");
        const resConvert = dialog.getConverter("resultProperty");
        const undefConvert = dialog.getConverter("id");
        const disable = dialog.getConverter("disabled");
        expect(cacheObjectKey).instanceOf(StringExpressionConverter);
        expect(cacheObject).instanceOf(ValueExpressionConverter);
        expect(resConvert).instanceOf(StringExpressionConverter);
        expect(disable).instanceOf(BoolExpressionConverter);
        expect(undefConvert).to.be.undefined;
    });
});

describe("streamToStringresolves", () => {
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
        const dialog = new ObjectCacheDialog();
        let inputstream: stubReadableStream = new stubReadableStream();
        let result = await dialog.streamToString(inputstream);
        expect(result).to.equals("test");
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
