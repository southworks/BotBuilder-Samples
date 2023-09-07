import { stargateJwtProvider, stargateOauthProvider } from './../../src/stargate-provider/stargateProvider';
import { ProviderJwtInfo, ProviderOauthInfo } from '../../src/provider/providerInfo';
import nock from 'nock'
// import { describe } from 'mocha';
import { assert } from 'chai';
import { AxiosRequestConfig } from 'axios';
import Agent from 'agentkeepalive';
import "mocha";

describe('stargate provider tests', () => {
    before(() => {
        process.env.CAIP_BOT_CORE_LOG_LEVEL='INFO'
    });
    describe('stargate JWT provider tests', () => {
        const stargateResponse = {
            result: 'success post data'
        }

        const stargateTokenResponse = {
            token_type: "bearer",
            access_token: "MockAccessToken",
            expires_in: 3600
        }

        const stargateJwtInfo: ProviderJwtInfo = {
            clientId: 'clientid',
            clientSecret: 'clientsecrert',
            tokenExpireSeconds: 30
        }

        const endpoint = "https://stargate-unittests.optum.com/api/url";

        beforeEach(() => {
            if (!nock.isActive()) {
                nock.activate();
            }               
        });
        afterEach(() => {
            nock.cleanAll();
            nock.restore();
        });      

        it('stargate JWT provider post calls interceptor to fetch token', async () => {
            const request: AxiosRequestConfig = {
                method: 'POST',
                baseURL: 'http://caip-unit-test-site.com',
                url: '/api/path',
                headers: {
                    'content-type': 'application/json'
                  }
              };
              
            const requestWithToken = await stargateJwtProvider(stargateJwtInfo).interceptRequests(request);
            const jwtToken = requestWithToken.headers['AUTHORIZATION'];
            assert.equal(jwtToken.split('.').length, 3); //jwt token with 2 dots
        });

        it('stargate JWT post call with retryCount', async () => {
            nock("https://stargate-unittests.optum.com")
                .post("/api/url")
                .reply(200, stargateResponse);

            nock("https://stargate-unittests.optum.com")
                .get("/api/url")
                .reply(200, stargateResponse);
            const response = await stargateJwtProvider({...stargateJwtInfo, retryCount: 1}).get(endpoint, null);
            assert.deepEqual(response, stargateResponse);
        });

        it('stargate JWT get call', async () => {
            nock("https://stargate-unittests.optum.com")
                .post("/api/url")
                .reply(200, stargateResponse);

            nock("https://stargate-unittests.optum.com")
                .get("/api/url")
                .reply(200, stargateResponse); 
            const response = await stargateJwtProvider(stargateJwtInfo).get(endpoint, null);
            assert.deepEqual(response, stargateResponse);
        });

        it('calling stargate JWT provider post twice with different value for content type', async () => {
            let reqs: any[] = [];

            nock("https://stargate-unittests.optum.com")
                .post("/api/url")
                .reply(function(){
                    reqs.push(this.req);
                    return [200, stargateResponse]
                });

            nock("https://stargate-unittests.optum.com")
                .post("/api/url")
                .reply(function(){
                    reqs.push(this.req);
                    return [200, stargateResponse]
                });
        
            const response1= await stargateJwtProvider(stargateJwtInfo)
            .post(endpoint, null);


            const customHeadersMap2 = new Map<string, string>();
            customHeadersMap2.set('Content-Type', 'text/xml')

            const stargateJwtInfo2: ProviderJwtInfo = {
                clientId: 'clientid',
                clientSecret: 'clientsecrert',
                tokenExpireSeconds: 30,
                customHeaders: customHeadersMap2
            }

            const response2= await stargateJwtProvider(stargateJwtInfo2)
            .post(endpoint, null);

            assert.deepEqual(response1, stargateResponse);
            assert.equal(reqs.length, 2);
            const contentType1 = reqs[0].headers['content-type'];
            assert.equal(contentType1, 'application/json');

            assert.deepEqual(response2, stargateResponse);
            const contentType2 = reqs[1].headers['content-type'];
            assert.equal(contentType2, 'text/xml');
        });

        it('calling stargate JWT provider post twice with httpAgent defined and different value for the content type', async () => {
            let reqs: any[] = [];

            const keepaliveAgent = new Agent({
                maxSockets: 100,
                maxFreeSockets: 10,
                timeout: 60000, // active socket keepalive for 60 seconds
                freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
            });
            
            // This can be removed when we are caching the token accross instance of the providers.
            nock("https://stargate-unittests.optum.com")
                .post("/oauth/token")
                .reply(200, stargateTokenResponse);

            nock("https://stargate-unittests.optum.com")
                .post("/api/url")
                .reply(function(){
                    reqs.push(this.req);
                    return [200, stargateResponse]
                });

            nock("https://stargate-unittests.optum.com")
                .post("/api/url")
                .reply(function(){
                    reqs.push(this.req);
                    return [200, stargateResponse]
                });

            const customHeadersMap = new Map<string, string>();
            customHeadersMap.set('Content-Type', 'text/xml')

            const stargateJwtInfo: ProviderJwtInfo = {
                clientId: 'clientid',
                clientSecret: 'clientsecret',
                tokenExpireSeconds: 30,
                httpAgent: keepaliveAgent,
                customHeaders: customHeadersMap
            }
        
            const response1= await stargateJwtProvider(stargateJwtInfo)
            .post(endpoint, null);


            const customHeadersMap2 = new Map<string, string>();
            customHeadersMap2.set('Content-Type', 'application/json')

            const stargateJwtInfo2: ProviderJwtInfo = {
                clientId: 'clientid',
                clientSecret: 'clientsecret',
                tokenExpireSeconds: 30,
                httpAgent: keepaliveAgent,
                customHeaders: customHeadersMap2
            }

            const response2= await stargateJwtProvider(stargateJwtInfo2)
            .post(endpoint, null);

            assert.deepEqual(response1, stargateResponse);
            assert.equal(reqs.length, 2);
            const contentType1 = reqs[0].headers['content-type'];
            assert.equal(contentType1, 'text/xml');

            assert.deepEqual(response2, stargateResponse);
            const contentType2 = reqs[1].headers['content-type'];
            assert.equal(contentType2, 'application/json');
        });

    });

    describe('stargate client credentials provider tests', () => {
        const stargateResponse = {
            result: 'success post data'
        }

        const customHeadersMap = new Map<string, string>();
        customHeadersMap.set('Content-Type', 'text/xml')

        const stargateOauthInfo: ProviderOauthInfo = {
            clientId: 'clientid',
            clientSecret: 'clientsecrert',
            tokenUrl: 'https://stargate-unittests.optum.com/oauth/token',
            customHeaders: customHeadersMap
        }

        const stargateTokenResponse = {
            token_type: "bearer",
            access_token: "MockAccessToken",
            expires_in: 3600
        }        

        const endpoint = "https://stargate-unittests.optum.com/api/url";

        beforeEach(() => {
            if (!nock.isActive()) {
                nock.activate();
            }
             
            nock("https://stargate-unittests.optum.com")
                .put("/api/url")
                .reply(200, stargateResponse);  

            nock("https://stargate-unittests.optum.com")
                .post("/oauth/token")
                .reply(200, stargateTokenResponse);
        });
        afterEach(() => {
            nock.cleanAll();
            nock.restore();
        });      

        it('stargate Oauth provider post calls interceptor to fetch token', async () => {
            const request: AxiosRequestConfig = {
                method: 'POST',
                baseURL: 'http://caip-unit-test-site.com',
                url: '/api/path',
                headers: {
                    'content-type': 'application/json'
                  }
              };
              
            const requestWithToken = await stargateOauthProvider(stargateOauthInfo).interceptRequests(request);
            const oauthToken = requestWithToken.headers['AUTHORIZATION'];
            assert.equal(`Bearer ${stargateTokenResponse.access_token}`, oauthToken);
        });

        it('stargate Oauth provider post calls interceptor to update the content type', async () => {
            let reqs: any[] = [];

            nock("https://stargate-unittests.optum.com")
                .post("/api/url")
                .reply(function(){
                    reqs.push(this.req);
                    return [200, stargateResponse]
                });
        
            const response = await stargateOauthProvider(stargateOauthInfo)
            .post(endpoint, null)

            assert.deepEqual(response, stargateResponse);
            assert.equal(reqs.length, 1);
            const contentType = reqs[0].headers['content-type'];
            assert.equal(contentType, 'text/xml');
        });

        it('calling stargate Oauth provider post twice with different value for content type', async () => {
            let reqs: any[] = [];

            nock("https://stargate-unittests.optum.com")
                .post("/api/url")
                .reply(function(){
                    reqs.push(this.req);
                    return [200, stargateResponse]
                });

            nock("https://stargate-unittests.optum.com")
                .post("/api/url")
                .reply(function(){
                    reqs.push(this.req);
                    return [200, stargateResponse]
                });
        
            const response1= await stargateOauthProvider(stargateOauthInfo)
            .post(endpoint, null);


            const customHeadersMap2 = new Map<string, string>();
            customHeadersMap2.set('Content-Type', 'application/json')

            const stargateOauthInfo2: ProviderOauthInfo = {
                clientId: 'clientid',
                clientSecret: 'clientsecrert',
                tokenUrl: 'https://stargate-unittests.optum.com/oauth/token',
                customHeaders: customHeadersMap2
            }

            const response2= await stargateOauthProvider(stargateOauthInfo2)
            .post(endpoint, null);

            assert.deepEqual(response1, stargateResponse);
            assert.equal(reqs.length, 2);
            const contentType1 = reqs[0].headers['content-type'];
            assert.equal(contentType1, 'text/xml');

            assert.deepEqual(response2, stargateResponse);
            const contentType2 = reqs[1].headers['content-type'];
            assert.equal(contentType2, 'application/json');
        });

        it('calling stargate Oauth provider post twice with httpAgent defined and different value for the content type', async () => {
            let reqs: any[] = [];

            const keepaliveAgent = new Agent({
                maxSockets: 100,
                maxFreeSockets: 10,
                timeout: 60000, // active socket keepalive for 60 seconds
                freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
            });
            
            // This can be removed when we are caching the token accross instance of the providers.
            nock("https://stargate-unittests.optum.com")
                .post("/oauth/token")
                .reply(200, stargateTokenResponse);

            nock("https://stargate-unittests.optum.com")
                .post("/api/url")
                .reply(function(){
                    reqs.push(this.req);
                    return [200, stargateResponse]
                });

            nock("https://stargate-unittests.optum.com")
                .post("/api/url")
                .reply(function(){
                    reqs.push(this.req);
                    return [200, stargateResponse]
                });

            const customHeadersMap = new Map<string, string>();
            customHeadersMap.set('Content-Type', 'text/xml')

            const stargateOauthInfo: ProviderOauthInfo = {
                clientId: 'clientid',
                clientSecret: 'clientsecret',
                tokenUrl: 'https://stargate-unittests.optum.com/oauth/token',
                httpAgent: keepaliveAgent,
                customHeaders: customHeadersMap
            }
        
            const response1= await stargateOauthProvider(stargateOauthInfo)
            .post(endpoint, null);


            const customHeadersMap2 = new Map<string, string>();
            customHeadersMap2.set('Content-Type', 'application/json')

            const stargateOauthInfo2: ProviderOauthInfo = {
                clientId: 'clientid',
                clientSecret: 'clientsecret',
                tokenUrl: 'https://stargate-unittests.optum.com/oauth/token',
                httpAgent: keepaliveAgent,
                customHeaders: customHeadersMap2
            }

            const response2= await stargateOauthProvider(stargateOauthInfo2)
            .post(endpoint, null);

            assert.deepEqual(response1, stargateResponse);
            assert.equal(reqs.length, 2);
            const contentType1 = reqs[0].headers['content-type'];
            assert.equal(contentType1, 'text/xml');

            assert.deepEqual(response2, stargateResponse);
            const contentType2 = reqs[1].headers['content-type'];
            assert.equal(contentType2, 'application/json');
        });

        it('calling stargate Oauth provider post twice with different httpAgent', async () => {
            let reqs: any[] = [];

            const keepaliveAgent = new Agent({
                maxSockets: 50,
                maxFreeSockets: 10,
                timeout: 60000, // active socket keepalive for 60 seconds
                freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
            });

            const keepaliveAgent1 = new Agent({
                maxSockets: 100,
                maxFreeSockets: 10,
                timeout: 60000, // active socket keepalive for 60 seconds
                freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
            });

            nock("https://stargate-unittests.optum.com")
                .post("/oauth/token")
                .reply(200, stargateTokenResponse);

            nock("https://stargate-unittests.optum.com")
                .post("/api/url")
                .reply(function(){
                    reqs.push(this.req);
                    return [200, stargateResponse]
                });

            nock("https://stargate-unittests.optum.com")
                .post("/api/url")
                .reply(function(){
                    reqs.push(this.req);
                    return [200, stargateResponse]
                });

            const customHeadersMap = new Map<string, string>();
            customHeadersMap.set('Content-Type', 'application/json')

            const stargateOauthInfo: ProviderOauthInfo = {
                clientId: 'clientid',
                clientSecret: 'clientsecret',
                tokenUrl: 'https://stargate-unittests.optum.com/oauth/token',
                httpAgent: keepaliveAgent,
                customHeaders: customHeadersMap
            }
        
            const provider1 = stargateOauthProvider(stargateOauthInfo)
        
            const stargateOauthInfo2: ProviderOauthInfo = {
                ...stargateOauthInfo,
                httpAgent: keepaliveAgent1,
            }
            const provider2 =  stargateOauthProvider(stargateOauthInfo2)

            assert.notEqual(provider1, provider2);
        });

        it('stargate Oauth post call', async () => {
            nock("https://stargate-unittests.optum.com")
                .post("/api/url")
                .reply(200, stargateResponse);
            const response = await stargateOauthProvider(stargateOauthInfo).post(endpoint, null);
            assert.deepEqual(response, stargateResponse);
        });

        it('stargate Oauth get call', async () => {
            nock("https://stargate-unittests.optum.com")
                .get("/api/url")
                .reply(200, stargateResponse);

            const response = await stargateOauthProvider(stargateOauthInfo).put(endpoint, null);
            assert.deepEqual(response, stargateResponse);
        });
    });
})