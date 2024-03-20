
import {
    Expression,
    StringExpression,
    StringExpressionConverter,
    ObjectExpression,
    BoolExpressionConverter,
    BoolExpression
} from "adaptive-expressions";
import { expect } from "chai";
import * as sinon from "sinon";
import "mocha";
import { ConfigLoaderDialog } from "../src/configLoaderDialog";
import { DialogContext, DialogSet } from "botbuilder-dialogs";
import { ContainerClient, BlockBlobClient, BlobClient } from "@azure/storage-blob";
import { BotTelemetryClient, NullTelemetryClient, TurnContext } from "botbuilder";
describe("configLoaderDialog", () => {
    let sandbox: sinon.SinonSandbox;
    let nulltelemetryClient: BotTelemetryClient;
    let bcontainerstub = sinon.createStubInstance(ContainerClient);
    let blobClientstub = sinon.createStubInstance(BlobClient);
    let tcstub = sinon.createStubInstance(TurnContext);
    let dsstub = sinon.createStubInstance(DialogSet);
    const dialog = new ConfigLoaderDialog();
    dialog.resultProperty = new StringExpression("dialog.result");

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        nulltelemetryClient = new NullTelemetryClient();
        sandbox
            .stub(ConfigLoaderDialog.prototype, <any>"getContainerclient")
            .returns(bcontainerstub);
        sandbox
            .stub(ContainerClient.prototype, <any>"getBlobClient")
            .returns(blobClientstub);
        sandbox
            .stub(ConfigLoaderDialog.prototype, <any>"getTFNConfigfromStore")
            .returns("");
        sandbox
            .stub(ConfigLoaderDialog.prototype, <any>"streamToString")
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
    it("should return Please provide TFN Experience Name", async () => {
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        const expectedResponse = { status: 'error', data: "Please provide TFN Experience Name." };
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
    it("should return Success", async () => {
        dialog.connectionString = new StringExpression("connectionString");
        dialog.containerName = new StringExpression("containerName");
        dialog.tfnExperienceName = new StringExpression("tfnExperienceName");
        const expectedResponse = { "status": "success", "data": "" };
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

describe("configLoaderDialog for error", () => {
    let sandbox: sinon.SinonSandbox;
    const dialog = new ConfigLoaderDialog();
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
        dialog.tfnExperienceName = new StringExpression("tfnExperienceName");
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
        const dialog = new ConfigLoaderDialog();
        expect(dialog.id).equals("Optum.ConfigLoaderDialog");
        const tfnExperienceName = dialog.getConverter("tfnExperienceName");
        const resConvert = dialog.getConverter("resultProperty");
        const undefConvert = dialog.getConverter("id");
        const disable = dialog.getConverter("disabled");
        expect(tfnExperienceName).instanceOf(StringExpressionConverter);
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
        const dialog = new ConfigLoaderDialog();
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
async function *stringGenerator(): AsyncGenerator<string> {
    let returnflag: boolean = true;
    while (returnflag) {
        returnflag=false;
        yield new Promise<string>(resolve => resolve("test"));
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}
