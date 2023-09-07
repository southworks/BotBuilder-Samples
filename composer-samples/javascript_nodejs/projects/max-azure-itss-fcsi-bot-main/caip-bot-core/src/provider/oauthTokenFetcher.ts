import { ProviderInfo } from './providerInfo';
import axios from "axios";
import qs from "qs"
import {Logger} from "../utils/logger";
const JWT = require("jsonwebtoken");

export class OAuthTokenFetcher {
  logger = new Logger(__filename);

  private token: string;
  private tokenExpireTime: number;
  private readonly stargateInfo: ProviderInfo;
  private tokenExpireMilliSeconds: number;

  constructor(stargateInfo: ProviderInfo) {
    this.token = "";
    this.tokenExpireTime = Date.now();
    this.tokenExpireMilliSeconds = stargateInfo.tokenExpireSeconds*1000 || 30*60000; // default 30 minutes
    this.stargateInfo = stargateInfo;
  }

  /**
   * Issues a new access token or reuse the existing cached token.
  */
  async getToken() {
    this.logger.debug('getToken', 'Getting the access token from the API provider.');
    // expire token 5% before to be on safer side to renew token
    const isTokenExpired = this.tokenExpireTime - Date.now() < (this.tokenExpireMilliSeconds*.05); 
    if (!isTokenExpired && this.token) {
      this.logger.debug('getToken', "returning existing token");
      return this.token;
    }
    try {
      this.token = await this.issueAccessToken();
    } catch (error) {
      throw error;
    }
    return this.token;
  }

  /**
   * Issues a new access token.
   */  
  async issueAccessToken() {
    if(this.stargateInfo.authType === "jwt") {
      return this.issueJwtToken();
    }
    
    return this.issueClientCredToken();
  }

  /**
   * Issues a new access token for client credentials grant.
   */
  async issueClientCredToken() {
    const postData = {
      grant_type: "client_credentials",
      client_id: this.stargateInfo.clientId,
      client_secret: this.stargateInfo.clientSecret,
      ...this.stargateInfo.tokenBodyParams
    };
    try {
      this.logger.debug('issueAccessToken', 'Issuing a new access token from the API provider.');
      const response = await axios.post(this.stargateInfo.tokenUrl, qs.stringify(postData, { encode: false }), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      this.logger.info('issueAccessToken', "Token endpoint called");
      this.tokenExpireMilliSeconds = response.data.expires_in * 1000;
      this.tokenExpireTime = Date.now() + this.tokenExpireMilliSeconds;
      return response.data.access_token;
    } catch (err) {
      this.logger.error('issueAccessToken', "Failed to fetch a valid token from the gateway."+err);
      throw err;
    }
  }

  /**
   * issue JWT token for stargate
   */
 async issueJwtToken()
 {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + (this.tokenExpireMilliSeconds / 1000);

  const payload = {
    iat: iat,
    exp: exp,
    iss: this.stargateInfo.clientId
  };

  const signingOptions = {
    algorithm: "HS256"
  };

  this.tokenExpireTime = Date.now() + this.tokenExpireMilliSeconds;
  return JWT.sign(payload, this.stargateInfo.clientSecret, signingOptions);
 } 
}

