import { FdsPostBody, FdsGetBody} from './fdsInfo';
import { Provider} from '../provider/provider'
import { ProviderOauthInfo, ProviderInfo} from '../provider/providerInfo'
import _ from 'lodash';
import hash from 'object-hash';
import FormData from 'form-data';

class FdsProvider extends Provider{

   constructor(fdsInfo: ProviderInfo){
     super(fdsInfo)
     this.client.interceptors.request.use(req => this.interceptRequests(req));
   }
  
  // Creating a Request Handler for Axios Request Interceptor
  async interceptRequests(request: any) {
    return await this.tokenFetcher
      .getToken()
      .then(token => {
        request.headers = {
          ...(request.headers || {}),
          'fds-authorization': `Bearer ${token}`,
        };
        this.logger.debug('interceptRequests', 'Succesfully fetched the token');
        return request;
      })
      .catch(err => {
        this.logger.error('interceptRequests', `Failed to provide a valid token, Reason: ${err.message}`);
        throw err;
      });
  }

  async post(endpoint: string, data: FdsPostBody) {
    this.logger.debug(__filename, 'post', `Requesting the endpoint ${endpoint} with the post request.`);
    let url = _.join([endpoint, data.spaceId], '/');
    if(data.documentId){
      url = _.join([url, data.documentId, "attachments"], '/');
    }
    var formData = new FormData();
    formData.append("file", data.file, {filename: data.fileName});
    return this.client
      .post(url, formData, {headers: formData.getHeaders(), params: { expiryDate: data.expiryDate }})
      .then(response => response.data)
      .catch(error => {
        this.logger.error('post', 'Error occured while making post request to fds provider');
        throw error;
      });
  }

  async get(endpoint: string, data: FdsGetBody) {
    this.logger.debug(__filename, 'get', `Requesting the endpoint ${endpoint} with the get request.`);
    const url = _.join([endpoint, data.spaceId, data.documentId], '/');
    return this.client
    .get(url, { params: { timeToLive: data.timeToLive} })
    .then(response => response.data)
    .catch(error => {
      this.logger.error('get', 'Error occured while making get request to fds provider');
      throw error;
    });
  }
}

const fdsOauthInstanceMap: Map<string, FdsProvider> = new Map<string, FdsProvider>();
/**
 * fds Oauth provider
 * 
 * @param ProviderOauthInfo: fds info to generate oauth token
 */
export const fdsOauthProvider = (fdsOauthInfo: ProviderOauthInfo) => {
  const key = hash(fdsOauthInfo);
  let fdsOauthInstance = fdsOauthInstanceMap.get(key);
  if (fdsOauthInstance) {
    return fdsOauthInstance;
  }

  const fdsInfo: ProviderInfo = {
    ...fdsOauthInfo,
    authType: "oauth"
  }

  fdsOauthInstance = new FdsProvider(fdsInfo);
  fdsOauthInstanceMap.set(key, fdsOauthInstance);
  return fdsOauthInstance;
};