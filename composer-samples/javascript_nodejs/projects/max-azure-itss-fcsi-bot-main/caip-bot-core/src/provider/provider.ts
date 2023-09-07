import { ProviderOauthInfo, ProviderJwtInfo, ProviderInfo } from './providerInfo';
import axios, { AxiosInstance } from "axios"
import { OAuthTokenFetcher } from "./oauthTokenFetcher";
import { Logger } from "../utils/logger";
import axiosRetry from "axios-retry";
import Agent from 'agentkeepalive';

const defaulthttpAgent = {
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000, // active socket keepalive for 60 seconds
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
}

export class Provider {
  protected client: AxiosInstance;
  protected isRefreshing: boolean = false;
  protected subscribers: any = [];
  protected tokenFetcher: OAuthTokenFetcher;
  protected isAuthenticationHeader: boolean;
  protected customHeaders: Map<string, string>;
  logger = new Logger(__filename);

  constructor(providerInfo: ProviderInfo) {
    this.customHeaders = providerInfo.customHeaders || undefined;
    // Token fetcher for token caching and use of OAuth 2.0 protocol.
    this.tokenFetcher = new OAuthTokenFetcher(providerInfo);
    // Creating an Axios global instance
    this.logger.info('Provider', 'Creating client provider instance');

    const keepaliveAgent = providerInfo.httpAgent || new Agent(defaulthttpAgent);

    this.client = axios.create({ httpAgent: keepaliveAgent, timeout: providerInfo.timeout || 0, timeoutErrorMessage:'this request timed out!' });

    const retryCountLocal = providerInfo.retryCount || 0;

    if (retryCountLocal > 0) {
      axiosRetry(this.client, {
        retries: retryCountLocal,
        shouldResetTimeout: true,
        retryDelay: (retryCount: number) => {
          this.logger.debug('Provider', `Retry attempt: ${retryCount}`);
          return providerInfo.retryDelay || 2000; // time interval between retries
        },
        retryCondition: (_error: any) => true, // retry no matter what
      });
    }
    this.client.interceptors.request.use(req => this.interceptRequests(req));
  }

  customHeadersFunction = function (jwtToken: string, customHeadersLocal: Map<string, string>) {
    const headers: any = {
      'Content-Type': 'application/json',
      AUTHORIZATION: `Bearer ${jwtToken}`
    };

    if (customHeadersLocal) {
      customHeadersLocal.forEach((value: string, key: string) => {
        headers[key] = value;
      });
    }
    return headers;
  }

  // Creating a Request Handler for Axios Request Interceptor
  async interceptRequests(request: any) {

    return await this.tokenFetcher
      .getToken()
      .then(token => {
        request.headers = this.customHeadersFunction(token, this.customHeaders);
        this.logger.debug('interceptRequests', 'Succesfully fetched the token');
        return request;
      })
      .catch(err => {
        this.logger.error('interceptRequests', `Failed to provide a valid token, Reason: ${err.message}`);
        throw err;
      });
  }
}