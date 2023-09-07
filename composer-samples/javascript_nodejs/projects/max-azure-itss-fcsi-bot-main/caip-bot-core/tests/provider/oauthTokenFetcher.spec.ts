import { OAuthTokenFetcher } from '../../src/provider/oauthTokenFetcher';
import {  ProviderInfo } from '../../src/provider/providerInfo';
import nock from 'nock'
// import { describe } from 'mocha';
import { assert } from 'chai';
import "mocha";

describe('oauth token fetcher tests', () => {
    before(() => {
        process.env.CAIP_BOT_CORE_LOG_LEVEL='DEBUG'
    });

    describe('JWT token fetcher tests', () => {
        it('fetch new jwt token', async () => {
            const stargateInfo: ProviderInfo = {
                clientId: 'clientid',
                clientSecret: 'clientsecrert',
                tokenUrl: 'https://stargate.optum.com',
                authType: 'jwt',
                tokenExpireSeconds: 30
            }

            let oauthTokenFetcher = new OAuthTokenFetcher(stargateInfo);
            const jwtToken = await oauthTokenFetcher.getToken();        
            assert.equal(jwtToken.split('.').length, 3); //jwt token with 2 dots
        });

        it('reuse token - fetch existing jwt token if used within expire duration', async () => {
            const stargateInfo: ProviderInfo = {
                clientId: 'clientid',
                clientSecret: 'clientsecrert',
                tokenUrl: 'https://stargate.optum.com',
                authType: 'jwt',
                tokenExpireSeconds: 30
            }

            let oauthTokenFetcher = new OAuthTokenFetcher(stargateInfo);
            const jwtToken = await oauthTokenFetcher.getToken();        
            assert.equal(jwtToken.split('.').length, 3); //jwt token with 2 dots

            const reusedJwtToken = await oauthTokenFetcher.getToken();        
            assert.equal(reusedJwtToken.split('.').length, 3); //jwt token with 2 dots

            assert.equal(jwtToken, reusedJwtToken);        
        });
        
        it('refresh token - fetch new jwt token if used after expire duration', async () => {
            const stargateInfo: ProviderInfo = {
                clientId: 'clientid',
                clientSecret: 'clientsecrert',
                tokenUrl: 'https://stargate.optum.com',
                authType: 'jwt',
                tokenExpireSeconds: 1/60
            }

            let oauthTokenFetcher = new OAuthTokenFetcher(stargateInfo);
            const jwtToken = await oauthTokenFetcher.getToken();        
            assert.equal(jwtToken.split('.').length, 3); //jwt token with 2 dots

            const sleep = (waitTimeInMs: number) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
            await sleep(1000);

            const reusedJwtToken = await oauthTokenFetcher.getToken();        
            assert.equal(reusedJwtToken.split('.').length, 3); //jwt token with 2 dots
            assert.notEqual(jwtToken, reusedJwtToken);                
        });    
    });

     [
        {
            testName : "without tokenBodyParam",
            stargateInfo : {
                clientId: 'clientid',
                clientSecret: 'clientsecrert',
                tokenUrl: 'https://stargate-unittests.optum.com/oauth/token',
                authType: 'oauth',
                tokenBodyParams : {
                    resource : "resourceId"
                }
            }
        },
        {
            testName : "with tokenBodyParam",
            stargateInfo : {
                clientId: 'clientid',
                clientSecret: 'clientsecrert',
                tokenUrl: 'https://stargate-unittests.optum.com/oauth/token',
                authType: 'oauth',
                tokenBodyParams : {
                    resource : "resourceId"
                }
            }
        }
    ].forEach((test) => {
        describe(`Client Credentials token fetcher tests ${test.testName}`, () => {
            const stargateInfo: ProviderInfo =  test.stargateInfo;      

            const stargateResponse = {
                token_type: "bearer",
                access_token: "MockAccessToken",
                expires_in: 3600
            }

            beforeEach(() => {
                if (!nock.isActive()) {
                    nock.activate();
                }
                nock("https://stargate-unittests.optum.com")
                    .post("/oauth/token")
                    .reply(200, stargateResponse);
            });
            afterEach(() => {
                nock.cleanAll();
                nock.restore();
            });      

            it('fetch new oauth token', async () => {
                let oauthTokenFetcher = new OAuthTokenFetcher(stargateInfo);
                const oauthToken = await oauthTokenFetcher.getToken();        
                assert.equal(stargateResponse.access_token, oauthToken);
            });

            it('reuse token - fetch existing oauth token if used within expire duration', async () => {
                let oauthTokenFetcher = new OAuthTokenFetcher(stargateInfo);
                const oauthToken = await oauthTokenFetcher.getToken();        
                assert.equal(stargateResponse.access_token, oauthToken);
    
                nock("https://stargate-unittests.optum.com")
                    .post("/oauth/token")
                    .reply(200, {
                        token_type: "bearer",
                        access_token: "MockAccessToken_new",
                        expires_in: 3600
                    });

                const newOauthToken = await oauthTokenFetcher.getToken();        
                assert.equal(stargateResponse.access_token, newOauthToken);
                assert.equal(oauthToken, newOauthToken);
            });

            it('refresh token - fetch new oauth1 token if used after expire duration', async () => {
                nock.cleanAll();
                nock("https://stargate-unittests.optum.com")
                    .post("/oauth/token")
                    .reply(200, {
                        token_type: "bearer",
                        access_token: "MockAccessToken",
                        expires_in: 1
                    });

                let oauthTokenFetcher = new OAuthTokenFetcher(stargateInfo);
                const oauthToken = await oauthTokenFetcher.getToken();        
                assert.equal(stargateResponse.access_token, oauthToken);

                const sleep = (waitTimeInMs: number) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
                await sleep(1000);
                
                nock.cleanAll();
                nock("https://stargate-unittests.optum.com")
                    .post("/oauth/token")
                    .reply(200, {
                        token_type: "bearer",
                        access_token: "MockAccessToken_new",
                        expires_in: 1
                    });

                const newOauthToken = await oauthTokenFetcher.getToken();        
                assert.equal("MockAccessToken_new", newOauthToken);
                assert.notEqual(oauthToken, newOauthToken);
            });
        });
    });
})