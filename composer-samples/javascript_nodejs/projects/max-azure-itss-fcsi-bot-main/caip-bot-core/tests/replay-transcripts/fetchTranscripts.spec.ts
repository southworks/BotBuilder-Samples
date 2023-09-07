import {FetchTranscript} from '../../src/replay-transcripts';
import { expect } from 'chai';
import sinon from 'sinon';
import {
    BlobsTranscriptStore
  } from "botbuilder-azure-blobs";
import { assert } from 'chai';
import { Activity } from 'botbuilder';


describe("Tests for fetchTranscript",()=>{
    it("Should Test client",()=>{
        const testConnectionString = "https://test.com";
        const testContainerName = "test"
        const fetchClient = new FetchTranscript(testConnectionString,testContainerName);
        fetchClient.getTranscriptStore(testConnectionString,testContainerName);
    });

    it("Should Throw Error",()=>{
        const fetchClient = new FetchTranscript(undefined,undefined);
        fetchClient.fetchTranscript("test").catch(error =>{
            assert.deepEqual(error.toString(), "Containername or connectionstring for transcriptstore incorrect in appsettings");
        });
    })

    it("It should return Transcript Object",async ()=>{
        const items: Partial<Activity> [] = [
            {
                type:'message',
                text: 'hi',
                from: {
                    name:'bot',
                    id: "test"
                },
            }
        ];
        const pt = {
            items:  items ,
            continuationToken : ''
        }
    
        
        const ts = {
            getTranscriptActivities: async function (ch: string, co: string) {
                return pt;
            }
        }
        const testConnectionString = "https://test.com";
        const testContainerName = "test"
        const fetchClient = new FetchTranscript(testConnectionString,testContainerName);
        sinon.stub(FetchTranscript.prototype, <any>"getTranscriptStore").returns(ts);
        const transcipt = await fetchClient.fetchTranscript("12345");
        assert.deepEqual(transcipt,pt.items);
    })
})