import Agent from 'agentkeepalive';

export interface ProviderJwtInfo{
    clientId: string;
    clientSecret: string;
    tokenExpireSeconds?: number;
    retryCount?: number;
    httpAgent?: Agent;
    customHeaders?:Map<string,string>;
    tokenBodyParams?:any;
}

export interface ProviderOauthInfo{
    clientId: string;
    clientSecret: string;
    tokenUrl: string;
    retryCount?: number;
    httpAgent?: Agent;
    customHeaders?:Map<string,string>;
    tokenBodyParams?:any;
}

export interface ProviderInfo{
    clientId: string;
    clientSecret: string;
    authType: string;
    tokenExpireSeconds?: number;
    tokenUrl?: string;
    httpAgent?: Agent;
    customHeaders?:Map<string,string>;
    tokenBodyParams?:any;
    /*This Timeout is applicable for every call to API and gets reset on every retry */
    timeout?:number;
    /*Defaults to 0 i.e. no retry */
    retryCount?: number;
    /*Defaults to 2 secs */
    retryDelay?:number;
}