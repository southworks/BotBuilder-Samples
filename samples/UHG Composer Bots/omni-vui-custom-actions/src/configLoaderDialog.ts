// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    BoolExpression,
    BoolExpressionConverter,
    Expression,
    StringExpression,
    StringExpressionConverter
} from "adaptive-expressions";

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from "botbuilder-dialogs";
import { BlobClient, BlobDownloadResponseParsed, ContainerClient } from "@azure/storage-blob";

export interface ConfigLoaderDialogConfiguration extends DialogConfiguration {
    disabled?: BoolExpression;
    tfnExperienceName: string | Expression | StringExpression;
    resultProperty?: string | Expression | StringExpression;
}

export class ConfigLoaderDialog
    extends Dialog
    implements ConfigLoaderDialogConfiguration {
    public static $kind = "Optum.ConfigLoaderDialog";
    private connString: string = "${settings.commonStoreConnectionString}";
    private contName: string = "${settings.configUIContainer}";
    public connectionString: StringExpression = new StringExpression(this.connString);
    public containerName: StringExpression = new StringExpression(this.contName);
    public tfnExperienceName: StringExpression = new StringExpression();
    public resultProperty?: StringExpression;
    public disabled: BoolExpression = new BoolExpression;

    public getConverter(
        property: keyof ConfigLoaderDialogConfiguration
    ): Converter | ConverterFactory {
        switch (property) {
            case "disabled":
                return new BoolExpressionConverter();
            case "tfnExperienceName":
                return new StringExpressionConverter();
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
        const tfnExperienceName = this.tfnExperienceName.getValue(dc.state);
        let returnMsg = {}, result;

        try {
            const dialogInputval = {
                "name": "Omni_Config_Loader_inputparams_Peg", properties: {
                    "customMetrics": [{
                        "Container Name": containerName,
                        "TFNExperienceName": tfnExperienceName
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
            if (tfnExperienceName == undefined || tfnExperienceName == "") {
                throw new Error("Please provide TFN Experience Name.")
            }
            var containerClient = this.getContainerclient(connectionString, containerName);
            const blobClient = containerClient.getBlobClient(tfnExperienceName + ".json");
            result = await this.getTFNConfigfromStore(blobClient);
            returnMsg = { "status": "success", "data": result };
            const resTelemetryVal = {
                "name": "Omni_Config_Loader_Output_Peg", properties: {
                    "Response": returnMsg,
                    "customMetrics": [{
                        "Response": returnMsg
                    }]
                }
            }
            this.telemetryClient.trackEvent(resTelemetryVal);
        } catch (e: any) {
            const resTelemetryVal = {
                "name": "Omni_Config_Loader_error_Peg", properties: {
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

    /**
     * To Get Azure Container Client.
     * @param connectionString The string contains connection string of azure storage.
     * @param containerName The string contains container name to store stargate Access token centralized cache.
     * @returns An instance of ContainerClient.
     */
    private getContainerclient(connectionString: string, containerName: string) {
        return new ContainerClient(connectionString, containerName);
    }

    /**
     * To Get Azure Container Client.
     * @param blobClient The BlobClient contains connection string of azure storage.
     * @returns A NodeJS ReadableStream contains blob data from azure storage.
     */
    private async getTFNConfigfromStore(blobClient: BlobClient) {
        const downloadBlockBlobResponse = await blobClient.download(0);
        const readable = downloadBlockBlobResponse.readableStreamBody!;
        return await this.streamToString(readable);
    }

    /**
     * To convert ReadableStream to String
     * @param readable A ReadableStream object holding Direct Message data
     * @returns A `string` as Direct Message data.
     */
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
        return "Optum.ConfigLoaderDialog";
    }
}