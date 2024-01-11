// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { BlockBlobClient, ContainerClient } from "@azure/storage-blob";
import {
    BoolExpression,
    BoolExpressionConverter,
    Expression,
    IntExpression,
    IntExpressionConverter,
    NumberExpression,
    NumberExpressionConverter,
    StringExpression,
    StringExpressionConverter,
    ValueExpression,
    ValueExpressionConverter
} from "adaptive-expressions";
import { Int } from "adaptive-expressions/lib/builtinFunctions";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import axiosRetry from "axios-retry";
import { HttpsAgent } from "agentkeepalive";
import { Agent } from "http";
import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogStateManager,
    DialogTurnResult,
} from "botbuilder-dialogs";

export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT'
}
export interface HttpRequestDialogConfiguration extends DialogConfiguration {
    disabled?: BoolExpression;
    tokenurl: string | Expression | StringExpression;
    clientid: string | Expression | StringExpression;
    clientsecret: string | Expression | StringExpression;
    tokencontentType: string | Expression | StringExpression;
    tokenTimeout: Number | Expression | NumberExpression;
    authorizationHeader: string | Expression | StringExpression;
    connectionString: string | Expression | StringExpression;
    containerName: string | Expression | StringExpression;
    retryCount: Int | IntExpression;
    retryInterval: Number | Expression | NumberExpression;
    url: string | Expression | StringExpression;
    method: HttpMethod;
    contentType: string | Expression | StringExpression;
    timeout: Number | Expression | NumberExpression;
    body: ValueExpression;
    verbiageToggleVal: BoolExpression;
    promptTime: Number | Expression | NumberExpression;
    firstPrompt: ValueExpression;
    fstpmtteleval: ValueExpression;
    repeatPrompt: ValueExpression;
    rptpmtteleval: ValueExpression;
    resultProperty: string | Expression | StringExpression;
}

export class HttpRequestDialog
    extends Dialog
    implements HttpRequestDialogConfiguration {

    public static $kind = "Optum.HttpRequestDialog";
    public tokenurl: StringExpression = new StringExpression();
    public clientid: StringExpression = new StringExpression();
    public clientsecret: StringExpression = new StringExpression();
    public tokencontentType: StringExpression = new StringExpression();
    public tokenTimeout: NumberExpression = new NumberExpression();
    public authorizationHeader: StringExpression = new StringExpression();
    public connectionString: StringExpression = new StringExpression();
    public containerName: StringExpression = new StringExpression();
    public retryCount: IntExpression = new IntExpression();
    public retryInterval: NumberExpression = new NumberExpression();
    public method: HttpMethod = HttpMethod.POST;
    public url: StringExpression = new StringExpression();
    public contentType: StringExpression = new StringExpression();
    public timeout: NumberExpression = new NumberExpression();
    public body: ValueExpression = new ValueExpression;
    public resultProperty: StringExpression = new StringExpression;
    public disabled: BoolExpression = new BoolExpression;
    public verbiageToggleVal: BoolExpression = new BoolExpression;
    public promptTime: NumberExpression = new NumberExpression();
    public firstPrompt: ValueExpression = new ValueExpression;
    public fstpmtteleval: ValueExpression = new ValueExpression;
    public repeatPrompt: ValueExpression = new ValueExpression;
    public rptpmtteleval: ValueExpression = new ValueExpression;
    private accesstoken: any;
    public tokenExpireTime: number;
    public tokenExpireMSecs: number;
    private httpsagent: HttpsAgent;
    private httpagent: Agent;
    private axiosclient: AxiosInstance;

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
        property: keyof HttpRequestDialogConfiguration
    ): Converter | ConverterFactory {
        switch (property) {
            case "tokenurl":
                return new StringExpressionConverter();
            case "clientid":
                return new StringExpressionConverter();
            case "clientsecret":
                return new StringExpressionConverter();
            case "tokencontentType":
                return new StringExpressionConverter();
            case "tokenTimeout":
                return new NumberExpressionConverter();
            case "authorizationHeader":
                return new StringExpressionConverter();
            case "connectionString":
                return new StringExpressionConverter();
            case "containerName":
                return new StringExpressionConverter();
            case "retryCount":
                return new IntExpressionConverter();
            case "retryInterval":
                return new NumberExpressionConverter();
            case "url":
                return new StringExpressionConverter();
            case "contentType":
                return new StringExpressionConverter();
            case "timeout":
                return new NumberExpressionConverter();
            case "body":
                return new ValueExpressionConverter();
            case "disabled":
                return new BoolExpressionConverter();
            case "verbiageToggleVal":
                return new BoolExpressionConverter();
            case "promptTime":
                return new NumberExpressionConverter();
            case "firstPrompt":
                return new ValueExpressionConverter();
            case "fstpmtteleval":
                return new ValueExpressionConverter();
            case "repeatPrompt":
                return new ValueExpressionConverter();
            case "rptpmtteleval":
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
        const method = this.method.toString();
        const tokenurl = this.tokenurl.getValue(dc.state);
        const clientid = this.clientid.getValue(dc.state);
        const clientsecret = this.clientsecret.getValue(dc.state);
        const tokencontentType = this.tokencontentType.getValue(dc.state) || 'application/json';
        const tokenTimeout = this.tokenTimeout.getValue(dc.state) || 1000;
        const authorizationHeader = this.authorizationHeader.getValue(dc.state);
        const connectionString = this.connectionString.getValue(dc.state);
        const containerName = this.containerName.getValue(dc.state);
        const retryCount = this.retryCount.getValue(dc.state) || 0;
        const retryInterval = this.retryInterval.getValue(dc.state) || 0;
        const url = this.url.getValue(dc.state);
        const contentType = this.contentType.getValue(dc.state) || 'application/json';
        const timeout = this.timeout.getValue(dc.state) || 2000;
        const body = this.body.getValue(dc.state);
        const verbiageToggleVal = this.verbiageToggleVal.getValue(dc.state);
        const promptTime = this.promptTime.getValue(dc.state) || 1000;
        const firstPrompt = this.firstPrompt.getValue(dc.state);
        const fstpmtteleval = this.fstpmtteleval.getValue(dc.state);
        const repeatPrompt = this.repeatPrompt.getValue(dc.state);
        const rptpmtteleval = this.rptpmtteleval.getValue(dc.state);
        const dialogInputval = {
            "name": "Omni_Http_Action_inputparams_Peg", properties: {
                "customMetrics": [{
                    "Method": method,
                    "Token Url": tokenurl,
                    "Token ContentType": this.tokencontentType.getValue(dc.state),
                    "Token Timeout": this.tokenTimeout.getValue(dc.state),
                    "Authorization Header": authorizationHeader,
                    "Container Name": containerName,
                    "RetryCount": this.retryCount.getValue(dc.state),
                    "RetryInterval": this.retryInterval.getValue(dc.state),
                    "Url": url,
                    "ContentType": this.contentType.getValue(dc.state),
                    "Timeout": this.timeout.getValue(dc.state),
                    "Body": body,
                    "Verbiage Toggle": verbiageToggleVal,
                    "Prompt Time": this.promptTime.getValue(dc.state),
                    "First Prompt": firstPrompt,
                    "First Prompt Telemetry": fstpmtteleval,
                    "Repeat Prompt": repeatPrompt,
                    "Repeat Prompt Telemetry": rptpmtteleval
                }]
            }
        };
        this.telemetryClient.trackEvent(dialogInputval);
        let returnMsg: any = "";
        let headers;
        try {
            if ((!connectionString?.trim() || !containerName?.trim()) && (!authorizationHeader?.trim())) {
                throw new Error(
                    "Please provide Azure Blob Connection String and Container Name properties"
                );
            }
            if ((!tokenurl?.trim() || !clientid?.trim() || !clientsecret?.trim()) && (!authorizationHeader?.trim())) {
                throw new Error(
                    "Please provide Token Url, client id and client secret or Authorization Header properties"
                );
            }
            if (!url?.trim()) {
                throw new Error(
                    "Please provide Url properties"
                );
            }
            const httpsagent = this.httpsagent || new HttpsAgent({ keepAlive: true, maxSockets: 100, maxFreeSockets: 10, timeout: 60000, freeSocketTimeout: 30000 });
            const httpagent = this.httpagent || new Agent({ keepAlive: true, maxSockets: 100, maxFreeSockets: 10, timeout: 60000 });
            this.axiosclient = axios.create({ httpAgent: httpagent, httpsAgent: httpsagent });
            if (!authorizationHeader?.trim()) {
                const token = await this.getAccessToken(tokenurl, clientid, clientsecret, tokencontentType, tokenTimeout, connectionString, containerName);
                headers = {
                    'Content-Type': contentType,
                    'Authorization': `Bearer ${token}`
                }
            } else {
                headers = {
                    'Content-Type': contentType,
                    'Authorization': authorizationHeader
                }
            }

            if (retryCount > 0 && verbiageToggleVal == false) {
                axiosRetry(this.axiosclient, {
                    retries: retryCount,
                    shouldResetTimeout: true,
                    retryDelay: (retrycount: number) => {
                        const retryTeleVal = {
                            "name": "Omni_Http_Action_Retry_Peg", properties: {
                                "customMetrics": [{
                                    "Retry #": retrycount,
                                    "RetryInterval": retryInterval
                                }]
                            }
                        }
                        this.telemetryClient.trackEvent(retryTeleVal);
                        return retryInterval
                    },
                    retryCondition: (_error: any) => {
                        const retryTeleVal = {
                            "name": "Omni_Http_Action_RetryError_Peg", properties: {
                                "customMetrics": [{
                                    "RetryInterval": retryInterval,
                                    "error": _error
                                }]
                            }
                        }
                        this.telemetryClient.trackEvent(retryTeleVal); return true;
                    }
                });
            }
            let axiosrequest: Promise<AxiosResponse<any>>;
            switch (method) {
                case 'GET':
                    axiosrequest = this.axiosclient.get(url, {
                        data: body,
                        headers: headers,
                        timeout: timeout
                    });
                    break;
                case 'POST':
                    axiosrequest = this.axiosclient.post(url, body, {
                        headers: headers,
                        timeout: timeout
                    });
                    break;
                case 'PUT':
                    axiosrequest = this.axiosclient.put(url, body, {
                        headers: headers,
                        timeout: timeout
                    });
                    break;
                default:
                    throw new Error("Invalid Http method. (supported methods: get, post and put)");
                    break;
            }
            if (verbiageToggleVal == false) {
                await axiosrequest.then(response => {
                    returnMsg = this.getSuccessResponse(response);
                }).catch((error) => {
                    returnMsg = this.getErrorResponse(error);
                });
            }
            else {
                axiosrequest.then(response => {
                    returnMsg = this.getSuccessResponse(response);
                }).catch((error) => {
                    returnMsg = this.getErrorResponse(error);
                });
                let promptType: boolean = false;
                let promptTimeCounter: number = 0;
                while (returnMsg === "") {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    promptTimeCounter++;
                    if ((promptTimeCounter * 100) == promptTime) {
                        this.promptMessage(verbiageToggleVal, returnMsg, promptType ? repeatPrompt : firstPrompt, dc, promptType ? rptpmtteleval : fstpmtteleval);
                        promptType = true; promptTimeCounter = 0;
                    }
                }
            }
        } catch (e: any) { returnMsg = { "headers": "", "status_code": 0, "status_messages": "error", "output": e.message } }

        const resTelemetryVal = {
            "name": "Omni_Http_Action_Output_Peg", properties: {
                "Response": returnMsg,
                "customMetrics": [{
                    "Response": returnMsg
                }]
            }
        }
        this.telemetryClient.trackEvent(resTelemetryVal);
        if (this.resultProperty) {
            dc.state.setValue(this.resultProperty.getValue(dc.state), returnMsg);
        }

        return dc.endDialog(returnMsg);
    }

    /**
     * Prompt message using send Activity and log it on AppInsights with Telemetry Client.
     * @param verbiageToggleVal The Boolean indicates the Verbiage to play. 
     * @param returnMsg The string to check the async http completed.
     * @param prompt The object to be prompt to user. 
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation. 
     * @param telemetryVal The object to be log in AppInsights.
     */
    private promptMessage(verbiageToggleVal: boolean, returnMsg: any, prompt: any, dc: DialogContext, telemetryVal: any) {
        if (verbiageToggleVal === true) {
            if (returnMsg === "") {
                if (prompt) {
                    dc.context.sendActivity(prompt);
                    if (telemetryVal) {
                        this.telemetryClient.trackEvent(telemetryVal);
                    }
                }
            }
        }
    }

    /**
     * Builds Success Response.
     * @param response The object that return from http request.
     * @returns A Json object representing the Success Response.
     */
    private getSuccessResponse(response: any): any {
        return { "headers": response.headers, "status_code": response.status, "status_messages": response.statusText, "output": response.data };
    }

    /**
     * Builds Error Response.
     * @param response The object that return from http request.
     * @returns A Json object representing the error Response.
     */
    private getErrorResponse(error: any): any {
        return {
            "headers": error.response ? error.response.headers : "",
            "status_code": error.response ? error.response.status : error.message ? error.message.toString().indexOf("timeout of") > -1 ? 408 : 0 : 0,
            "status_messages": error.response ? error.response.statusText : "error",
            "output": error.response ? error.response.data : error.message ? error.message : error
        };
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return "Optum.HttpRequestDialog";
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
                const teTelemetryVal = { "name": "Omni_Http_Action_token_NotExist_LocalCache_Peg" };
                this.telemetryClient.trackEvent(teTelemetryVal);
                var blockBlobClient = this.getBlockBlobClient(connStr, contName);
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
                        await this.setTokentoStore(connStr, contName, response);
                    }
                }
                else {
                    const teTelemetryVal = { "name": "Omni_Http_Action_token_NotExist_BlobStore_Peg" };
                    this.telemetryClient.trackEvent(teTelemetryVal);
                    const response = await this.getTokenFromStargate(clientid, clientsecret, tokenurl, contentType, tokenTimeout);
                    this.setAccessTokeninLocal(response);
                    await this.setTokentoStore(connStr, contName, response);
                }
            } else {
                const isTokenExpired = (this.tokenExpireTime - Date.now()) < (this.tokenExpireMSecs * .05);
                if (isTokenExpired) {
                    const teTelemetryVal = {
                        "name": "Omni_Http_Action_LocalCache_tokenExpired_Peg", properties: {
                            "customMetrics": [{
                                "Token": this.accesstoken,
                                "Token Expire Time (a) ": this.tokenExpireTime,
                                "Date.now (b) ": Date.now(),
                                "a - b = ": (this.tokenExpireTime - Date.now()),
                                "Token Expire in MSecs ": this.tokenExpireMSecs,
                                "5% Token Expire in MSecs": this.tokenExpireMSecs * .05,
                                "isTokenExpired ": isTokenExpired
                            }]
                        }
                    };
                    this.telemetryClient.trackEvent(teTelemetryVal);
                    var blockBlobClient = this.getBlockBlobClient(connStr, contName);
                    const blockBlobexists = await blockBlobClient.exists();
                    if (blockBlobexists) {
                        const data: any = await this.getTokenFromStore(blockBlobClient);
                        this.accesstoken = JSON.parse(data);
                        this.tokenExpireMSecs = this.accesstoken.expires_in * 1000;
                        this.tokenExpireTime = this.accesstoken["Expirytime"];
                        const isTokenExpired = (this.tokenExpireTime - Date.now()) < (this.tokenExpireMSecs * .05);
                        if (!isTokenExpired) {
                            const validTelemetryVal = {
                                "name": "Omni_Http_Action_BlobStore_tokenValid_Peg", properties: {
                                    "customMetrics": [{
                                        "Token": this.accesstoken,
                                        "Token Expire Time (a) ": this.tokenExpireTime,
                                        "Date.now (b) ": Date.now(),
                                        "a - b = ": (this.tokenExpireTime - Date.now()),
                                        "Token Expire in MSecs ": this.tokenExpireMSecs,
                                        "5% Token Expire in MSecs": this.tokenExpireMSecs * .05,
                                        "isTokenExpired ": isTokenExpired
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
                    await this.setTokentoStore(connStr, contName, response);
                } else {
                    const validTelemetryVal = {
                        "name": "Omni_Http_Action_LocalCache_tokenValid_Peg", properties: {
                            "customMetrics": [{
                                "Token": this.accesstoken,
                                "Token Expire Time (a) ": this.tokenExpireTime,
                                "Date.now (b) ": Date.now(),
                                "a - b = ": (this.tokenExpireTime - Date.now()),
                                "Token Expire in MSecs ": this.tokenExpireMSecs,
                                "5% Token Expire in MSecs": this.tokenExpireMSecs * .05,
                                "isTokenExpired ": isTokenExpired
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
            "name": "Omni_Http_Action_BlobStore_tokenExpired_Peg", properties: {
                "customMetrics": [{
                    "Token": this.accesstoken,
                    "Token Expire Time (a) ": this.tokenExpireTime,
                    "Date.now (b) ": Date.now(),
                    "a - b = ": (this.tokenExpireTime - Date.now()),
                    "Token Expire in MSecs ": this.tokenExpireMSecs,
                    "5% Token Expire in MSecs": this.tokenExpireMSecs * .05,
                    "isTokenExpired ": isTokenExpired
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
    private async setTokentoStore(connStr: string, contName: string, response: AxiosResponse<any>) {
        var blockBlobClient = this.getBlockBlobClient(connStr, contName);
        response.data["Expirytime"] = Date.now() + this.tokenExpireMSecs;
        const uploadBlobResponse = await blockBlobClient.upload(JSON.stringify(response.data), Buffer.byteLength(JSON.stringify(response.data)));
        const setTokenToStoreVal = {
            "name": "Omni_Http_Action_SetTokenToStore_Peg", properties: {
                "customMetrics": [{
                    "Token": this.accesstoken,
                    "Token Expire Time (a) ": this.tokenExpireTime,
                    "Date.now (b) ": Date.now(),
                    "a - b = ": (this.tokenExpireTime - Date.now()),
                    "Token Expire in MSecs ": this.tokenExpireMSecs,
                    "5% Token Expire in MSecs": this.tokenExpireMSecs * .05
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
    public getBlockBlobClient(connStr: string, contName: string) {
        var containerClient = new ContainerClient(connStr, contName);
        const blockBlobClient = containerClient.getBlockBlobClient(this.tokenFileName);
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
        let data: any = "";
        readable.setEncoding('utf8');
        for await (const chunk of readable) {
            data += chunk;
        }
        const getTokenToStoreVal = { "name": "Omni_Http_Action_GetTokenFromStore_Peg", properties: { "customMetrics": [{ "Token": data }] } };
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
        const getToken4mStargate = { "name": "Omni_Http_Action_GetTokenFromStargate_Peg", properties: { "customMetrics": [{ "Token": response?.data ? response.data : "", "Headers": response?.headers ? response.headers : "" }] } };
        this.telemetryClient.trackEvent(getToken4mStargate);
        if (!response.data?.expires_in) {
            throw new Error("Invalid Token Response " + response);
        }
        return response;
    }
}