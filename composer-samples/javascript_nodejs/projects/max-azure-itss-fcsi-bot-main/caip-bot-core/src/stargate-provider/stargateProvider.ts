import { ProviderOauthInfo, ProviderJwtInfo, ProviderInfo } from '../provider/providerInfo';
import {Provider} from "../provider/provider"
import hash from 'object-hash';

class StargateProvider extends Provider{
  constructor(stargateInfo: ProviderInfo) {
    super(stargateInfo)
  }
  
  async post(endpoint: string, data: any) {
    this.logger.debug(__filename, 'post', `Requesting the endpoint ${endpoint} with the post request.`);
    return this.client
      .post(endpoint, data)
      .then(response => response.data)
      .catch(error => {
        this.logger.error('post', 'Error occured while making post request to stargate provider');
        throw error;
      });
  }

  async fetch(endpoint: string, data: any) {
    return this.client.post(endpoint, data).then(response => response.data);
  }

  async get(endpoint: string, parameters: any) {
    return this.client.get(endpoint, { params: parameters }).then(response => response.data);
  }

  async put(endpoint: string, data: string) {
    return this.client.put(endpoint, data).then(response => response.data);
  }
}

const stargateJwtInstanceMap: Map<string, StargateProvider> = new Map<string, StargateProvider>();
const stargateOauthInstanceMap: Map<string, StargateProvider> = new Map<string, StargateProvider>();

/**
 * stargate JWT provider
 * 
 * @param ProviderJwtInfo: stargate info to generate jwt token
 */
export const stargateJwtProvider = (stargateJwtInfo: ProviderJwtInfo) => {
  const key = hash(stargateJwtInfo);
  let stargateJwtInstance = stargateJwtInstanceMap.get(key);
  if (stargateJwtInstance) {
    return stargateJwtInstance;
  }

  const stargateInfo: ProviderInfo = {
    ...stargateJwtInfo,
    authType: "jwt"
  }

  stargateJwtInstance = new StargateProvider(stargateInfo);
  stargateJwtInstanceMap.set(key, stargateJwtInstance);
  return stargateJwtInstance;
};

/**
 * stargate oauth provider for client credentials flow
 * 
 * @param ProviderOauthInfo: stargate info to generate bearer token
 */
export const stargateOauthProvider = (stargateOauthInfo: ProviderOauthInfo) => {
  const key = hash(stargateOauthInfo);
  let stargateOauthInstance = stargateOauthInstanceMap.get(key);
  if (stargateOauthInstance) {
    return stargateOauthInstance;
  }

  const stargateInfo: ProviderInfo = {
    ...stargateOauthInfo,
    authType: "oauth"
  }

  stargateOauthInstance = new StargateProvider(stargateInfo);
  stargateOauthInstanceMap.set(key, stargateOauthInstance);
  return stargateOauthInstance;
};