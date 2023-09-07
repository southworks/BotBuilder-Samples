
// import "mocha";
import { assert } from 'chai';
import { RenderTranscript, botCredentials } from "../../src/replay-transcripts"
import { Activity } from "botbuilder";
import axios from 'axios';
import * as sinon from "sinon";


const Mocha = require('mocha');

const mocha = new Mocha({ ui: 'bdd' });

describe("Render Transcript", () => {

    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    const cred: botCredentials = {
        msAppId: "abc",
        msAppPassword: "def"
    }
    const curTime = new Date();
    //This second activity of sample will change in conversationId update test case 
    const activitiesSample: Partial<Activity>[] = [
        {
            type: "message",
            id: "KfbhVBWsxaxAz2gg3JNOJb-us|0000001",
            timestamp: curTime,
            localTimestamp: curTime,
            localTimezone: "Asia/Calcutta",
            serviceUrl: "https://directline.botframework.com/",
            channelId: "directline",
            from: {
                id: "uID1",
                name: "Aditya",
                role: "user"
            },
            conversation: {
                id: "KfbhVBWsxaxAz2gg3JNOJb-us",
                isGroup: false,
                name: "sample",
                conversationType: "xyz"

            },
            recipient: {
                "id": "omni-root-bot-dev-v1@E5iLbqSa9Uc",
                "name": "omni-root-bot-dev-v1"
            },
            textFormat: "plain",
            locale: "en-GB",
            text: "kepp",
            channelData: {
                clientActivityID: "1661347298310eu69lqgamsp",
                clientTimestamp: "2022-08-24T13:21:38.31Z"
            },
            replyToId:"abc"
        },
        {
            type: "event",
            id: "KfbhVBWsxaxAz2gg3JNOJb-us|0000001",
            timestamp: curTime,
            localTimestamp: curTime,
            localTimezone: "Asia/Calcutta",
            serviceUrl: "https://directline.botframework.com/",
            channelId: "directline",
            from: {
                id: "uID1",
                name: "Aditya",
                role: "user"
            },
            conversation: {
                id: "KfbhVBWsxaxAz2gg3JNOJb-us",
                isGroup: false,
                name: "sample",
                conversationType: "xyz"

            },
            recipient: {
                "id": "omni-root-bot-dev-v1@E5iLbqSa9Uc",
                "name": "omni-root-bot-dev-v1"
            },
            textFormat: "plain",
            locale: "en-GB",
            text: "kepp",
            channelData: {
                clientActivityID: "1661347298310eu69lqgamsp",
                clientTimestamp: "2022-08-24T13:21:38.31Z"
            }
        }

    ]

    const cleanActivitySample: Partial<Activity>[] = [
        {
            type: "message",
            id: "KfbhVBWsxaxAz2gg3JNOJb-us|0000001",
            timestamp: curTime,
            serviceUrl: "https://directline.botframework.com/",
            channelId: "directline",
            from: {
                id: "uID1",
                name: "Aditya",
                role: "user"
            },
            conversation: {
                id: "KfbhVBWsxaxAz2gg3JNOJb-us",
                isGroup: false,
                name: "sample",
                conversationType: "xyz"

            },
            recipient: {
                "id": "omni-root-bot-dev-v1@E5iLbqSa9Uc",
                "name": "omni-root-bot-dev-v1"
            },
            text: "kepp",
            
        }
    ]
    const renderTranscrpt = new RenderTranscript();


    it("should return an authtoken", async () => {

        sandbox.stub(axios,'post').resolves(Promise.resolve({data: {access_token : "abc"}}));
        const res = await renderTranscrpt.getAuthToken(cred);
        assert.isString(res);
    });

    it("should preProcess activities", async () => {
        sandbox.stub(RenderTranscript.prototype, <any>"filterTypeMessage").returns([activitiesSample[0]]);
        sandbox.stub(RenderTranscript.prototype, <any>"removeExtraFields").returns([{type:"message"}]);
        
        const preProcessedActivities = renderTranscrpt.preProcessActivities(activitiesSample, "abc")
        assert.deepEqual(preProcessedActivities, [{type:"message"}]);
    });

    it("should filter activities of type message", async () => {

        const res = renderTranscrpt.filterTypeMessage(activitiesSample);
        const expected = [activitiesSample[0]]
        assert.deepEqual(res, expected);
    });


    it("should remove extraFields", async () => {
        const res = renderTranscrpt.removeExtraFields([activitiesSample[0]]);
        const expected = [{
            type: "message",
            id: "KfbhVBWsxaxAz2gg3JNOJb-us|0000001",
            timestamp: curTime,
            serviceUrl: "https://directline.botframework.com/",
            channelId: "directline",
            from: {
                id: "uID1",
                name: "Aditya",
                role: "user"
            },
            conversation: {
                id: "KfbhVBWsxaxAz2gg3JNOJb-us",
                isGroup : false,
                name : "sample",
                conversationType :"xyz"

            },
            recipient: {
                "id": "omni-root-bot-dev-v1@E5iLbqSa9Uc",
                "name": "omni-root-bot-dev-v1"
            },
            text: "kepp"
        }]
        assert.deepEqual(res, expected);
    });

    it("should remove extraFields with fields already not present", async () => {
        const res = renderTranscrpt.removeExtraFields([cleanActivitySample[0]]);
        const expected = [{
            type: "message",
            id: "KfbhVBWsxaxAz2gg3JNOJb-us|0000001",
            timestamp: curTime,
            serviceUrl: "https://directline.botframework.com/",
            channelId: "directline",
            from: {
                id: "uID1",
                name: "Aditya",
                role: "user"
            },
            conversation: {
                id: "KfbhVBWsxaxAz2gg3JNOJb-us",
                isGroup : false,
                name : "sample",
                conversationType :"xyz"

            },
            recipient: {
                "id": "omni-root-bot-dev-v1@E5iLbqSa9Uc",
                "name": "omni-root-bot-dev-v1"
            },
            text: "kepp"
        }]
        assert.deepEqual(res, expected);
    });


    it("should invoke History API", async () => {
    
        sandbox.stub(RenderTranscript.prototype, <any>"getAuthToken").returns("abc");
        sandbox.stub(RenderTranscript.prototype, <any>"preProcessActivities").returns("abc");
        sandbox.stub(axios, 'post').returns(new Promise(() => { return "abc" }));
    
        renderTranscrpt.invokeHistoryAPI(activitiesSample, "abc", cred);
    });

    it("should invoke History API", async () => {
    
        sandbox.stub(RenderTranscript.prototype, <any>"getAuthToken").throws("abc");
        sandbox.stub(RenderTranscript.prototype, <any>"preProcessActivities").returns("abc");
        sandbox.stub(axios, 'post').returns(new Promise(() => { return "abc" }));
    
        renderTranscrpt.invokeHistoryAPI(activitiesSample, "abc", cred);
    });
});
