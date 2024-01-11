// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    BoolExpression,
    BoolExpressionConverter,
    Expression,
    StringExpression,
    StringExpressionConverter,
    ValueExpression,
    ValueExpressionConverter
} from "adaptive-expressions";

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from "botbuilder-dialogs";
import { BlockBlobClient, ContainerClient } from "@azure/storage-blob";
export enum CacheAction {
    GET = 'GET',
    SET = 'SET'
}
export interface ObjectCacheDialogConfiguration extends DialogConfiguration {
    disabled?: BoolExpression;
    action: CacheAction;
    cacheObjectKey: string | Expression | StringExpression;
    cacheObject: ValueExpression;
    resultProperty?: string | Expression | StringExpression;
}

export class ObjectCacheDialog
    extends Dialog
    implements ObjectCacheDialogConfiguration {
    public static $kind = "Optum.ObjectCacheDialog";
    public disabled: BoolExpression = new BoolExpression;
    private connString: string = "${settings.commonStoreConnectionString}";
    private contName: string = "${settings.ObjectCacheContainer}";
    public connectionString: StringExpression = new StringExpression(this.connString);
    public containerName: StringExpression = new StringExpression(this.contName);
    public action: CacheAction = CacheAction.GET;
    public cacheObjectKey: StringExpression = new StringExpression();
    public cacheObject: ValueExpression = new ValueExpression;
    public resultProperty?: StringExpression;

    public getConverter(
        property: keyof ObjectCacheDialogConfiguration
    ): Converter | ConverterFactory {
        switch (property) {
            case "disabled":
                return new BoolExpressionConverter();
            case "cacheObjectKey":
                return new StringExpressionConverter();
            case "cacheObject":
                return new ValueExpressionConverter();
            case "resultProperty":
                return new StringExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }
        const connectionString = this.connectionString.getValue(dc.state);
        const containerName = this.containerName.getValue(dc.state);
        const action = this.action.toString();
        const cacheObjectKey = this.cacheObjectKey.getValue(dc.state);
        const cacheObject = this.cacheObject.getValue(dc.state);
        let returnMsg = {}, result;

        try {
            const dialogInputval = {
                "name": "Omni_Cache_Object_inputparams_Peg", properties: {
                    "customMetrics": [{
                        "Container Name": containerName,
                        "Cache Action": action,
                        "Cache Object Key": cacheObjectKey,
                        "Cache Object": cacheObject
                    }]
                }
            };
            this.telemetryClient.trackEvent(dialogInputval);
            if (connectionString == undefined || connectionString == "") {
                throw new Error("Please provide Connection String.")
            }
            if (containerName == undefined || containerName == "") {
                throw new Error("Please provide Container Name.")
            }
            if (cacheObjectKey == undefined || cacheObjectKey == "") {
                throw new Error("Please provide Cache Object Key.")
            }
            let blockBlobClient: BlockBlobClient;
            switch (action.toUpperCase()) {
                case "GET":
                    blockBlobClient = this.getBlockBlobClient(connectionString, containerName, cacheObjectKey + ".json");
                    result = await this.getCacheObject(blockBlobClient);
                    break;
                case "SET":
                    if (cacheObject == undefined || cacheObject === "") {
                        throw new Error("Please provide Cache Object.")
                    }
                    blockBlobClient = this.getBlockBlobClient(connectionString, containerName, cacheObjectKey + ".json");
                    result = await this.setCacheObject(blockBlobClient, cacheObject);
                    break;
                default:
                    throw new Error("Invalid Action. (supported actions: get, set)");
                    break;
            }
            returnMsg = { "status": "success", "data": result };
            const resTelemetryVal = {
                "name": "Omni_Cache_Object_Output_Peg", properties: {
                    "Response": returnMsg,
                    "customMetrics": [{
                        "Response": returnMsg
                    }]
                }
            }
            this.telemetryClient.trackEvent(resTelemetryVal);
        } catch (e: any) {
            const resTelemetryVal = {
                "name": "Omni_Cache_Object_error_Peg", properties: {
                    "Response": e.message ? e.message : "error",
                    "customMetrics": [
                        {
                            "Response": e
                        }]
                }
            }
            this.telemetryClient.trackEvent(resTelemetryVal);
            returnMsg = { "status": "error", "data": e.message ? e.message : e }
        }

        if (this.resultProperty) {
            dc.state.setValue(this.resultProperty.getValue(dc.state), returnMsg);
        }
        return dc.endDialog(returnMsg);
    }

    public async getCacheObject(blockBlobClient: BlockBlobClient) {
        const downloadBlockBlobResponse = await blockBlobClient.download(0);
        const readable = downloadBlockBlobResponse.readableStreamBody!;
        return await this.streamToString(readable);
    }

    public async setCacheObject(blockBlobClient: BlockBlobClient, cacheObject: any) {
        const uploadBlobResponse = await blockBlobClient.upload(JSON.stringify(cacheObject), Buffer.byteLength(JSON.stringify(cacheObject)));
        return uploadBlobResponse;
    }

    public getBlockBlobClient(connStr: string, contName: string, cacheKeyName: string) {
        const containerClient = new ContainerClient(connStr, contName);
        const blockBlobClient = containerClient.getBlockBlobClient(cacheKeyName);
        return blockBlobClient;
    }

    public async streamToString(readable: NodeJS.ReadableStream) {
        let data: any = "";
        readable.setEncoding('utf8');
        for await (const chunk of readable) { data += chunk; }
        return data;
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return "Optum.ObjectCacheDialog";
    }
}