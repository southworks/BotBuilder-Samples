// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { BlockBlobClient, ContainerClient } from "@azure/storage-blob";
import {
    BoolExpression,
    BoolExpressionConverter,
    Expression,
    StringExpression,
    StringExpressionConverter
} from "adaptive-expressions";
import { HttpsAgent } from "agentkeepalive";
import axios, { AxiosInstance, AxiosResponse } from "axios";

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from "botbuilder-dialogs";
import { Agent } from "http";

export interface RapidMessageDialogConfiguration extends DialogConfiguration {
    disabled?: BoolExpression;
    lineOfBusiness: string | Expression | StringExpression;
    location: string | Expression | StringExpression;
    env: string | Expression | StringExpression;
    callId: string | Expression | StringExpression;
    resultProperty?: string | Expression | StringExpression;
}
export class RapidMessageDialog
    extends Dialog
    implements RapidMessageDialogConfiguration {
    public static $kind = "Optum.RapidMessageDialog";
    public disabled: BoolExpression = new BoolExpression;
    private stargateTokenURL: string = "${settings.stargateTokenURL}";
    public tokenurl: StringExpression = new StringExpression(this.stargateTokenURL);
    private stargateClientId: string = "${settings.stargateClientId}";
    public clientid: StringExpression = new StringExpression(this.stargateClientId);
    private stargateClientSecret: string = "${settings.stargateClientSecret}";
    public clientsecret: StringExpression = new StringExpression(this.stargateClientSecret);
    private tokenConnString: string = "${settings.tokenConnectionString}";
    public tokenConnectionString: StringExpression = new StringExpression(this.tokenConnString);
    private tokenContName: string = "${settings.tokenContainerName}";
    public tokenContainerName: StringExpression = new StringExpression(this.tokenContName);
    private connString: string = "${settings.commonStoreConnectionString}";
    public connectionString: StringExpression = new StringExpression(this.connString);
    private contName: string = "${settings.rapidMessageContainer}";
    public containerName: StringExpression = new StringExpression(this.contName);
    private mwURL: string = "${settings.rapidMessageMWURL}";
    public url: StringExpression = new StringExpression(this.mwURL);
    private mwTimeout: string = "${settings.rapidMessageMWTimeout}";
    public timeout: StringExpression = new StringExpression(this.mwTimeout);
    public lineOfBusiness: StringExpression = new StringExpression();
    public location: StringExpression = new StringExpression();
    public env: StringExpression = new StringExpression();
    public callId: StringExpression = new StringExpression();
    public resultProperty?: StringExpression;
    private accesstoken: any;
    public tokenExpireTime: number;
    public tokenExpireMSecs: number;
    private httpsagent: HttpsAgent;
    private httpagent: Agent;
    private axiosclient: AxiosInstance;
    private call_id: string = "";
    private readonly tokenFileName = "stargateaccessToken.json";

    constructor() {
        super();
        this.tokenExpireTime = Date.now();
        this.tokenExpireMSecs = this.accesstoken?.expires_in * 1000 || 30 * 60000;
        this.httpsagent = new HttpsAgent({ keepAlive: true, maxSockets: 100, maxFreeSockets: 10, timeout: 60000, freeSocketTimeout: 30000 });
        this.httpagent = new Agent({ keepAlive: true, maxSockets: 100, maxFreeSockets: 10, timeout: 60000 });
        this.axiosclient = axios.create({ httpAgent: this.httpagent, httpsAgent: this.httpsagent });
    }

    public getConverter(
        property: keyof RapidMessageDialogConfiguration
    ): Converter | ConverterFactory {
        switch (property) {
            case "disabled":
                return new BoolExpressionConverter();
            case "lineOfBusiness":
                return new StringExpressionConverter();
            case "location":
                return new StringExpressionConverter();
            case "env":
                return new StringExpressionConverter();
            case "callId":
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
        const tokenurl = this.tokenurl.getValue(dc.state);
        const clientid = this.clientid.getValue(dc.state);
        const clientsecret = this.clientsecret.getValue(dc.state);
        const tokenConnectionString = this.tokenConnectionString.getValue(dc.state);
        const tokenContainerName = this.tokenContainerName.getValue(dc.state);
        const connectionString = this.connectionString.getValue(dc.state);
        const containerName = this.containerName.getValue(dc.state);
        const url = this.url.getValue(dc.state);
        const timeout = this.timeout.getValue(dc.state) || "2000";
        const lineOfBusiness = this.lineOfBusiness.getValue(dc.state);
        const location = this.location.getValue(dc.state);
        const env = this.env.getValue(dc.state);
        this.call_id = this.callId.getValue(dc.state);
        let returnMsg = {}, result, body = {
            "sessionId": "",
            "lineOfBusiness": "",
            "location": "",
            "env": ""
        };
        try {
            const dialogInputval = {
                "name": "Omni_Rapid_Message_inputparams_Peg", properties: {
                    "Call Id": this.call_id,
                    "customMetrics": [{
                        "Token Url": tokenurl,
                        "Token Container Name": tokenContainerName,
                        "Rapid Message Container Name": containerName,
                        "Url": url,
                        "Timeout": this.timeout.getValue(dc.state),
                        "Line Of Business": lineOfBusiness,
                        "Location": location,
                        "Environment": env,
                        "Call Id": this.call_id
                    }]
                }
            };
            this.telemetryClient.trackEvent(dialogInputval);

            if (!connectionString?.trim() || !containerName?.trim()) {
                throw new Error(
                    "Please provide Azure Blob Connection String and Container Name properties"
                );
            }
            if (!tokenConnectionString?.trim() || !tokenContainerName?.trim()) {
                throw new Error(
                    "Please provide Token Azure Blob Connection String and Container Name properties"
                );
            }
            if (!tokenurl?.trim() || !clientid?.trim() || !clientsecret?.trim()) {
                throw new Error(
                    "Please provide Token Url, client id and client secret properties"
                );
            }
            if (!url?.trim()) {
                throw new Error(
                    "Please provide Url properties"
                );
            }
            if (!lineOfBusiness?.trim() || !location?.trim() || !env?.trim()) {
                throw new Error(
                    "Please provide Line Of Business, Location and Enviroment properties"
                );
            }
            let blockBlobClient: BlockBlobClient;
            blockBlobClient = this.getBlockBlobClient(connectionString, containerName, `${lineOfBusiness}_${location}.json`);
            const isblobexists = await blockBlobClient.exists();
            let isBlobValid: boolean = false;
            if (isblobexists) {
                const blobprops = await blockBlobClient.getProperties();
                if (blobprops.lastModified) {
                    const crdate = new Date();
                    const exdate = new Date(blobprops.lastModified.getTime() + 5 * 60000);
                    isBlobValid = crdate < exdate;
                    const teTelemetryVal = {
                        "name": "Omni_Rapid_Message_Blob_Exist_BlobStore_Peg", properties: {
                            "Call Id": this.call_id, "customMetrics": [{
                                "Name": `${lineOfBusiness}_${location}.json`,
                                "Call Id": this.call_id,
                                "Current DateTime": crdate,
                                "last Modified DateTime": blobprops.lastModified,
                                "Expiry DateTime": exdate,
                                "Is Valid": isBlobValid
                            }]
                        }
                    };
                    this.telemetryClient.trackEvent(teTelemetryVal);
                } else { isBlobValid = false; }
            } else { isBlobValid = false; }
            if (isBlobValid) {
                result = await this.getDMObject(blockBlobClient);
                returnMsg = { "status": "success", "data": result };
            } else {
                const httpsagent = this.httpsagent || new HttpsAgent({ keepAlive: true, maxSockets: 100, maxFreeSockets: 10, timeout: 60000, freeSocketTimeout: 30000 });
                const httpagent = this.httpagent || new Agent({ keepAlive: true, maxSockets: 100, maxFreeSockets: 10, timeout: 60000 });
                this.axiosclient = axios.create({ httpAgent: httpagent, httpsAgent: httpsagent });

                const token = await this.getAccessToken(tokenurl, clientid, clientsecret, "application/json", 1000, tokenConnectionString, tokenContainerName);
                let headers = {
                    'Content-Type': "application/json",
                    'Authorization': `Bearer ${token}`
                }
                body.sessionId = this.call_id;
                body.lineOfBusiness = lineOfBusiness;
                body.location = location;
                body.env = env;
                let axiosrequest = this.axiosclient.post(url, body, {
                    headers: headers,
                    timeout: Number(timeout)
                });
                await axiosrequest.then(async response => {
                    await this.setDMObject(blockBlobClient, response.data);
                    returnMsg = { "status": "success", "data": JSON.stringify(response.data) };
                }).catch((error) => {
                    returnMsg = { "status": "error", "data": error.response ? error.response.data : error.message ? error.message : error };
                });
            }
            const resTelemetryVal = {
                "name": "Omni_Rapid_Message_Output_Peg", properties: {
                    "Call Id": this.call_id, "Response": returnMsg,
                    "customMetrics": [{
                        "Response": returnMsg,
                        "Call Id": this.call_id
                    }]
                }
            }
            this.telemetryClient.trackEvent(resTelemetryVal);
        } catch (e: any) {
            const resTelemetryVal = {
                "name": "Omni_Rapid_Message_error_Peg", properties: {
                    "Call Id": this.call_id, "Response": e.message ? e.message : "error",
                    "customMetrics": [{
                        "Response": e,
                        "Call Id": this.call_id
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
    * @protected
    * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
    * @returns A `string` representing the compute Id.
    */
    protected onComputeId(): string {
        return "Optum.RapidMessageDialog";
    }

    /**
         * To Get Stargate access token 
         * @param tokenurl The string holds URL for Stargate Access token Generation.
         * @param clientid The string has Client Id for Stargate Access token.
         * @param clientsecret The string has Client Secret for Stargate Access token
         * @param contentType The string Content Type of Stargate Access token Http Request
         * @param tokenTimeout The string Timeout milliseconds for Stargate Access token Http Request
         * @param connStr The string contains connection string of azure storage.
         * @param contName The string contains container name to store stargate Access token centralized cache.
         * @returns A `string` representing the stargate access token.
         */
    async getAccessToken(tokenurl: string, clientid: string, clientsecret: string, contentType: string, tokenTimeout: number, connStr: string, contName: string) {
        try {
            if (this.accesstoken === undefined) {
                const teTelemetryVal = {
                    "name": "Omni_Rapid_Message_token_NotExist_LocalCache_Peg", properties: {
                        "Call Id": this.call_id, "customMetrics": [{
                            "Call Id": this.call_id
                        }]
                    }
                };
                this.telemetryClient.trackEvent(teTelemetryVal);
                var blockBlobClient = this.getBlockBlobClient(connStr, contName, this.tokenFileName);
                const blockBlobexists = await blockBlobClient.exists();
                if (blockBlobexists) {
                    const data: any = await this.getTokenFromStore(blockBlobClient);
                    this.accesstoken = JSON.parse(data);
                    this.tokenExpireMSecs = this.accesstoken.expires_in * 1000;
                    this.tokenExpireTime = this.accesstoken["Expirytime"];
                    const isTokenExpired = (this.tokenExpireTime - Date.now()) < (this.tokenExpireMSecs * .05);
                    if (isTokenExpired) {
                        this.blobStoreTokenExpiredTelelog(isTokenExpired);
                        const response = await this.getTokenFromStargate(clientid, clientsecret, tokenurl, contentType, tokenTimeout);
                        this.setAccessTokeninLocal(response);
                        await this.setTokentoStore(blockBlobClient, response);
                    }
                }
                else {
                    const teTelemetryVal = {
                        "name": "Omni_Rapid_Message_token_NotExist_BlobStore_Peg", properties: {
                            "Call Id": this.call_id, "customMetrics": [{
                                "Call Id": this.call_id
                            }]
                        }
                    };
                    this.telemetryClient.trackEvent(teTelemetryVal);
                    const response = await this.getTokenFromStargate(clientid, clientsecret, tokenurl, contentType, tokenTimeout);
                    this.setAccessTokeninLocal(response);
                    await this.setTokentoStore(blockBlobClient, response);
                }
            } else {
                const isTokenExpired = (this.tokenExpireTime - Date.now()) < (this.tokenExpireMSecs * .05);
                if (isTokenExpired) {
                    const teTelemetryVal = {
                        "name": "Omni_Rapid_Message_LocalCache_tokenExpired_Peg", properties: {
                            "Call Id": this.call_id,
                            "customMetrics": [{
                                "Token": this.accesstoken,
                                "Token Expire Time (a) ": this.tokenExpireTime,
                                "Date.now (b) ": Date.now(),
                                "a - b = ": (this.tokenExpireTime - Date.now()),
                                "Token Expire in MSecs ": this.tokenExpireMSecs,
                                "5% Token Expire in MSecs": this.tokenExpireMSecs * .05,
                                "isTokenExpired ": isTokenExpired,
                                "Call Id": this.call_id
                            }]
                        }
                    };
                    this.telemetryClient.trackEvent(teTelemetryVal);
                    var blockBlobClient = this.getBlockBlobClient(connStr, contName, this.tokenFileName);
                    const blockBlobexists = await blockBlobClient.exists();
                    if (blockBlobexists) {
                        const data: any = await this.getTokenFromStore(blockBlobClient);
                        this.accesstoken = JSON.parse(data);
                        this.tokenExpireMSecs = this.accesstoken.expires_in * 1000;
                        this.tokenExpireTime = this.accesstoken["Expirytime"];
                        const isTokenExpired = (this.tokenExpireTime - Date.now()) < (this.tokenExpireMSecs * .05);
                        if (!isTokenExpired) {
                            const validTelemetryVal = {
                                "name": "Omni_Rapid_Message_BlobStore_tokenValid_Peg", properties: {
                                    "Call Id": this.call_id,
                                    "customMetrics": [{
                                        "Token": this.accesstoken,
                                        "Token Expire Time (a) ": this.tokenExpireTime,
                                        "Date.now (b) ": Date.now(),
                                        "a - b = ": (this.tokenExpireTime - Date.now()),
                                        "Token Expire in MSecs ": this.tokenExpireMSecs,
                                        "5% Token Expire in MSecs": this.tokenExpireMSecs * .05,
                                        "isTokenExpired ": isTokenExpired,
                                        "Call Id": this.call_id
                                    }]
                                }
                            }
                            this.telemetryClient.trackEvent(validTelemetryVal);
                            return this.accesstoken.access_token;
                        }
                        else {
                            this.blobStoreTokenExpiredTelelog(isTokenExpired);
                        }
                    }
                    const response = await this.getTokenFromStargate(clientid, clientsecret, tokenurl, contentType, tokenTimeout);
                    this.setAccessTokeninLocal(response);
                    await this.setTokentoStore(blockBlobClient, response);
                } else {
                    const validTelemetryVal = {
                        "name": "Omni_Rapid_Message_LocalCache_tokenValid_Peg", properties: {
                            "Call Id": this.call_id,
                            "customMetrics": [{
                                "Token": this.accesstoken,
                                "Token Expire Time (a) ": this.tokenExpireTime,
                                "Date.now (b) ": Date.now(),
                                "a - b = ": (this.tokenExpireTime - Date.now()),
                                "Token Expire in MSecs ": this.tokenExpireMSecs,
                                "5% Token Expire in MSecs": this.tokenExpireMSecs * .05,
                                "isTokenExpired ": isTokenExpired,
                                "Call Id": this.call_id
                            }]
                        }
                    }
                    this.telemetryClient.trackEvent(validTelemetryVal);
                }
            }
            return this.accesstoken.access_token;
        } catch (err: any) {
            throw new Error("Token Error : " + err);
        }
    }

    /**
     * To log Blob Store token Expired peg in app insights
     * @param isTokenExpired The Boolean indicates token 
     */
    private blobStoreTokenExpiredTelelog(isTokenExpired: boolean) {
        const teTelemetryVal = {
            "name": "Omni_Rapid_Message_BlobStore_tokenExpired_Peg", properties: {
                "Call Id": this.call_id,
                "customMetrics": [{
                    "Token": this.accesstoken,
                    "Token Expire Time (a) ": this.tokenExpireTime,
                    "Date.now (b) ": Date.now(),
                    "a - b = ": (this.tokenExpireTime - Date.now()),
                    "Token Expire in MSecs ": this.tokenExpireMSecs,
                    "5% Token Expire in MSecs": this.tokenExpireMSecs * .05,
                    "isTokenExpired ": isTokenExpired,
                    "Call Id": this.call_id
                }]
            }
        };
        this.telemetryClient.trackEvent(teTelemetryVal);
    }

    /**
     * To Set Stargate Access Token in Local cache.
     * @param response HTTP response from stargate token request
     */
    private setAccessTokeninLocal(response: AxiosResponse<any>) {
        this.accesstoken = response.data;
        this.tokenExpireMSecs = response.data.expires_in * 1000;
        this.tokenExpireTime = Date.now() + this.tokenExpireMSecs;
    }

    /**
     * To Set Stargate Access Token in Azure storage.
     * @param connStr The string contains connection string of azure storage.
     * @param contName The string contains container name to store stargate Access token centralized cache.
     * @param response HTTP response from stargate token request
     * @returns A `BlockBlobUploadResponse` Response data for the Block Blob Upload operation.
     */
    private async setTokentoStore(blockBlobClient: BlockBlobClient, response: AxiosResponse<any>) {
        response.data["Expirytime"] = Date.now() + this.tokenExpireMSecs;
        const uploadBlobResponse = await blockBlobClient.upload(JSON.stringify(response.data), Buffer.byteLength(JSON.stringify(response.data)));
        const setTokenToStoreVal = {
            "name": "Omni_Rapid_Message_SetTokenToStore_Peg", properties: {
                "Call Id": this.call_id,
                "customMetrics": [{
                    "Token": this.accesstoken,
                    "Token Expire Time (a) ": this.tokenExpireTime,
                    "Date.now (b) ": Date.now(),
                    "a - b = ": (this.tokenExpireTime - Date.now()),
                    "Token Expire in MSecs ": this.tokenExpireMSecs,
                    "5% Token Expire in MSecs": this.tokenExpireMSecs * .05,
                    "Call Id": this.call_id
                }]
            }
        }
        this.telemetryClient.trackEvent(setTokenToStoreVal);
        return uploadBlobResponse;
    }

    /**
     * To Get Azure Block Blob Client.
     * @param connStr The string contains connection string of azure storage.
     * @param contName The string contains container name to store stargate Access token centralized cache.
     * @returns A BlobClient object for the token blob name.
     */
    public getBlockBlobClient(connStr: string, contName: string, blobName: string) {
        var containerClient = new ContainerClient(connStr, contName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        return blockBlobClient;
    }

    /**
     * To Get Stargate access Token From Azure Storage
     * @param blockBlobClient BlobClient object for the token blob name.
     * @returns A `object` representing the stargate access token response.
     */
    private async getTokenFromStore(blockBlobClient: BlockBlobClient) {
        const downloadBlockBlobResponse = await blockBlobClient.download(0);
        const readable = downloadBlockBlobResponse.readableStreamBody!;
        let data: any = this.streamToString(readable);
        const getTokenToStoreVal = {
            "name": "Omni_Rapid_Message_GetTokenFromStore_Peg",
            properties: {
                "Call Id": this.call_id,
                "customMetrics": [{ "Token": data }]
            }
        };
        this.telemetryClient.trackEvent(getTokenToStoreVal);
        return data;
    }

    /**
     * To Get access token from Stargate.
     * @param tokenurl The string holds URL for Stargate Access token Generation.
     * @param clientid The string has Client Id for Stargate Access token.
     * @param clientsecret The string has Client Secret for Stargate Access token
     * @param contentType The string Content Type of Stargate Access token Http Request
     * @param tokenTimeout The string Timeout milliseconds for Stargate Access token Http Request
     * @returns A `AxiosResponse` representing the stargate access token response.
     */
    private async getTokenFromStargate(clientid: string, clientsecret: string, tokenurl: string, contentType: string, tokenTimeout: number) {
        const postData = {
            grant_type: "client_credentials",
            client_id: clientid,
            client_secret: clientsecret
        };
        const response = await this.axiosclient.post(tokenurl, JSON.stringify(postData), {
            headers: { "Content-Type": contentType },
            timeout: tokenTimeout
        });
        const getToken4mStargate = {
            "name": "Omni_Rapid_Message_GetTokenFromStargate_Peg",
            properties: {
                "Call Id": this.call_id,
                "customMetrics": [{ "Token": response?.data ? response.data : "", "Headers": response?.headers ? response.headers : "" }]
            }
        };
        this.telemetryClient.trackEvent(getToken4mStargate);
        if (!response.data?.expires_in) {
            throw new Error("Invalid Token Response " + response);
        }
        return response;
    }

    /**
     * To Get Rapid Message data Object from Azure Storage.
     * @param blockBlobClient BlobClient object for the Rapid Message blob name.
     * @returns A `string` representing the Rapid Message response.
     */
    public async getDMObject(blockBlobClient: BlockBlobClient) {
        const downloadBlockBlobResponse = await blockBlobClient.download(0);
        const readable = downloadBlockBlobResponse.readableStreamBody!;
        let retdata = await this.streamToString(readable);
        const resTelemetryVal = {
            "name": "Omni_Rapid_Message_GetDMObject_Peg", properties: {
                "Call Id": this.call_id,
                "Rapid Message Data": retdata,
                "customMetrics": [{
                    "Call Id": this.call_id,
                    "Rapid Message Data": retdata
                }]
            }
        }
        this.telemetryClient.trackEvent(resTelemetryVal);
        return retdata;
    }

    /**
     * To Set Rapid Message data Object on Azure Storage.
     * @param blockBlobClient BlobClient object for the Rapid Message blob name.
     * @param cacheObject  A JSON object contains Rapid Message data.
     * @returns A `BlockBlobUploadResponse` representing the Blob Client Upload response.
     */
    public async setDMObject(blockBlobClient: BlockBlobClient, cacheObject: any) {
        const uploadBlobResponse = await blockBlobClient.upload(JSON.stringify(cacheObject), Buffer.byteLength(JSON.stringify(cacheObject)));
        const resTelemetryVal = {
            "name": "Omni_Rapid_Message_SetDMObject_Peg", properties: {
                "Call Id": this.call_id,
                "Rapid Message Data": JSON.stringify(cacheObject),
                "UploadBlobResponse": uploadBlobResponse,
                "customMetrics": [{
                    "Call Id": this.call_id,
                    "Rapid Message Data": JSON.stringify(cacheObject),
                    "UploadBlobResponse": uploadBlobResponse
                }]
            }
        }
        this.telemetryClient.trackEvent(resTelemetryVal);
        return uploadBlobResponse;
    }

    /**
     * To convert ReadableStream to String
     * @param readable A ReadableStream object holding Rapid Message data
     * @returns A `string` as Rapid Message data.
     */
    public async streamToString(readable: NodeJS.ReadableStream) {
        let data: any = "";
        readable.setEncoding('utf8');
        for await (const chunk of readable) { data += chunk; }
        return data;
    }
}

