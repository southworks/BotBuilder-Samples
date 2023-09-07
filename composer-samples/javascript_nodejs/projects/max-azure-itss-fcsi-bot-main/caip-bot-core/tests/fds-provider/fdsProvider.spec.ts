import { fdsOauthProvider } from './../../src/fds-provider/fdsProvider';
import { FdsPostBody, FdsGetBody } from './../../src/fds-provider/fdsInfo';
import { ProviderOauthInfo, ProviderInfo} from '../../src/provider/providerInfo'

import nock from 'nock'
//import { describe } from 'mocha';
import { assert } from 'chai';
import { AxiosRequestConfig } from 'axios';
import Agent from 'agentkeepalive';

const Mocha = require('mocha');

const mocha = new Mocha({ ui: 'bdd' });

describe('fds provider tests', () => {
    before(() => {
        process.env.CAIP_BOT_CORE_LOG_LEVEL='INFO'
    });
    describe('fds oauth provider tests', () => {

        const fdsTokenResponse = {
            token_type: "bearer",
            access_token: "MockAccessToken",
            expires_in: 3600
        }
        
        const fdsResponse = {
            result: 'success post data'
        }

        const fdsOauthInfo: ProviderOauthInfo = {
            clientId: 'clientid',
            clientSecret: 'clientsecrert',
            tokenUrl: 'https://fds-unittests.optum.com/oauth/token'
        }

        const endpoint = "https://fds-unittests.optum.com/api/documents";

        beforeEach(() => {
            if (!nock.isActive()) {
                nock.activate();
            }
             
            nock("https://fds-unittests.optum.com")
                .put("/api/url")
                .reply(200, fdsResponse);  

            nock("https://fds-unittests.optum.com")
                .post("/oauth/token")
                .reply(200, fdsTokenResponse);
        });
        afterEach(() => {
            nock.cleanAll();
            nock.restore();
        });    

        it('fds oauth provider post calls interceptor to fetch token', async () => {
            const request: AxiosRequestConfig = {
                method: 'POST',
                baseURL: 'http://caip-unit-test-site.com',
                url: '/api/path'
              };
            const expectedResponse = "Bearer MockAccessToken"
            const requestWithToken = await fdsOauthProvider(fdsOauthInfo).interceptRequests(request);
            const oauthToken = requestWithToken.headers['fds-authorization'];
            assert.equal(oauthToken, expectedResponse);
        });

        it('fds Oauth provider post should return a valid result', async () => {
            nock("https://fds-unittests.optum.com")
                .post("/api/documents/space-id-1234?expiryDate=2021%2F07%2F31")
                .reply(function(){
                    return [200, fdsResponse]
                });

            const fdsPostBody: FdsPostBody = {
                fileName: "idcard6.pdf",
                file: "./data.pdf",
                spaceId: "space-id-1234",
                expiryDate: "2021/07/31"
            }
            const response1= await fdsOauthProvider(fdsOauthInfo)
            .post(endpoint, fdsPostBody);
            assert.deepEqual(response1, fdsResponse);
        });

        it('fds Oauth provider post should throw error when issue arise', async () => {

            nock("https://fds-unittests.optum.com")
                .post("/api/documents/space-id-1234?expiryDate=2021%2F07%2F31")
                .reply(500, "FAILED");

            const fdsPostBody: FdsPostBody = {
                fileName: "idcard6.pdf",
                file: "./data.pdf",
                spaceId: "space-id-1234",
                expiryDate: "2021/07/31"
            }
            await fdsOauthProvider(fdsOauthInfo)
            .post(endpoint, fdsPostBody)
            .catch(error => {
                assert.deepEqual(error.toString(), "Error: Request failed with status code 500");
            })
        });

        it('fds Oauth provider get should return a valid result', async () => {
            nock("https://fds-unittests.optum.com")
                .get("/api/documents/space-id-1234/doc-test-1234?timeToLive=604800")
                .reply(200, fdsResponse);

            const fdsGetBody: FdsGetBody = {
                spaceId: "space-id-1234",
                documentId: "doc-test-1234",
                timeToLive: "604800" // 7 days in seconds
            }
            const response = await fdsOauthProvider(fdsOauthInfo).get(endpoint, fdsGetBody);
            assert.deepEqual(response, fdsResponse);
        });

        it('fds Oauth provider get should throw error when issue arise', async () => {
            nock("https://fds-unittests.optum.com")
                .get("/api/documents/space-id-1234/doc-test-1234?timeToLive=604800")
                .reply(500, "FAILED");

            const fdsGetBody: FdsGetBody = {
                spaceId: "space-id-1234",
                documentId: "doc-test-1234",
                timeToLive: "604800" // 7 days in seconds
            }
            await fdsOauthProvider(fdsOauthInfo).get(endpoint, fdsGetBody).catch(error =>{
                assert.deepEqual(error.toString(), "Error: Request failed with status code 500");
            });
        });

        it('fds Oauth provider post should return a valid result w/ documentid', async () => {
            nock("https://fds-unittests.optum.com")
                .post("/api/documents/space-id-1234/12345/attachments?expiryDate=2021%2F07%2F31")
                .reply(function(){
                    return [200, fdsResponse]
                });

            const fdsPostBody: FdsPostBody = {
                fileName: "idcard6.pdf",
                file: "./data.pdf",
                spaceId: "space-id-1234",
                expiryDate: "2021/07/31",
                documentId: "12345"
            }
            const response1= await fdsOauthProvider(fdsOauthInfo)
            .post(endpoint, fdsPostBody);
            assert.deepEqual(response1, fdsResponse);
        });
    });
})