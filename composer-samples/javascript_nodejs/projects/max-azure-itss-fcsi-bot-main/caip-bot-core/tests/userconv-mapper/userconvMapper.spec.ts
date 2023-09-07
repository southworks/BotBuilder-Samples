import {UserConvMapper} from '../../src/userconv-mapper';
import { expect } from 'chai';
import sinon from 'sinon';
import {BlobServiceClient} from "@azure/storage-blob";
import { Readable } from "stream";
import { assert } from 'chai';


describe("Test cases for user-conv Mapper",async ()=>{

    it("getClient throws error if the connectionString or containerName not available",()=>{
        const mapper = new UserConvMapper(undefined,undefined);
        mapper.getClient("test").catch(error =>{
            assert.deepEqual(error.toString(), "Required details for connection to Storage Account are missing");
        });
        

    })
    it("Test the getClient fucntion",async ()=>{
        const testConnectionString = "https://test.com";
        const testContainerName = "test"
        const mapper = new UserConvMapper(testConnectionString,testContainerName);
        const pt = {
            download : async function () {
               console.log("inside pt  fetch");
               return {
                   readableStreamBody:"test"
               }
           },
           delete : async function () {
               console.log("inside pt  fetch");
               return "abc"
           },
           upload : async function (co : string) {
               return "abc"
           }
       }
       const containerClient = {
           getBlockBlobClient: function ( co: string) {
               return pt;
           },
           exists: function(){
               return true;
           }
       }
        const ts = {
            getContainerClient: function ( co: string) {
                return containerClient;
                }
              }
        let stubBSC =  sinon.stub(BlobServiceClient,<any>"fromConnectionString").returns(ts);
        const client = await mapper.getClient("mockKey");
        expect(client).equals(pt);

        

    });

    it("Test the streamToBuffer method",()=>{
        const test = new Buffer("test");
        const testConnectionString = "https://test.com";
        const testContainerName = "test"
        
        const streamMapper =  new UserConvMapper(testConnectionString,testContainerName);
        const mockedStream = new Readable();
        mockedStream._read = function(size) { /* do nothing */ };
    
        
        streamMapper.streamToBuffer(mockedStream);
        mockedStream.emit('data',test);
        mockedStream.emit('error');
        mockedStream.emit('end');
      
    
    });


   

    it("Test for getConversationData", async ()=>{
        const testConnectionString = "https://test.com";
        const testContainerName = "test"
        const mapper = new UserConvMapper(testConnectionString,testContainerName);
       
        const mockClient = {
            exists: function(){
                return false;
            }

        }
        const stubClient = sinon.stub(mapper,<any>"getClient").returns(mockClient);
        const result = await mapper.getConversationData("testKey");
        expect(result).equals(null);
        
        
    });



    it("Test for getConversationData", async ()=>{
        const testConnectionString = "https://test.com";
        const testContainerName = "test"
        const mapper = new UserConvMapper(testConnectionString,testContainerName);
       
        const mockClient = {
            exists: function(){
                return false;
            }

        }
        const stubClient = sinon.stub(mapper,<any>"getClient").throws("Test Error");
        mapper.getConversationData("testKey").catch(error =>{
            assert.deepEqual(error.toString(), "Test Error");
        });
        
    });

    it("Test for uploadConversation Map Error Scenario", async ()=>{
        const testConnectionString = "https://test.com";
        const testContainerName = "test"
        const mapper = new UserConvMapper(testConnectionString,testContainerName);
        const stubClient = sinon.stub(mapper,<any>"getClient").throws("Test Error");
        mapper.uploadConversationMap("testKey","testID").catch(error =>{
            assert.deepEqual(error.toString(), "Test Error");
        });
    });

    it("Test for eraseConversation Map Error Scenario", async ()=>{
        const testConnectionString = "https://test.com";
        const testContainerName = "test"
        const mapper = new UserConvMapper(testConnectionString,testContainerName);
        const stubClient = sinon.stub(mapper,<any>"getClient").throws("Test Error");
        mapper.eraseConversationMap("test").catch(error =>{
            assert.deepEqual(error.toString(), "Test Error");
        });
    });


    it("Test for getConversationData when the blob exists", async ()=>{
        const testConnectionString = "https://test.com";
        const testContainerName = "test"
        const mapper = new UserConvMapper(testConnectionString,testContainerName);
        const mockClient = {
            exists: function(){
                return true;
            },
            download : async function () {
                return {
                    readableStreamBody:"test"
                }
            },
            deleteIfExists : async function () {
                console.log("inside pt  fetch");
                return "abc"
            },
            upload : async function (co : string) {
                return "abc"
            }


        }
        const stubClient = sinon.stub(UserConvMapper.prototype,<any>"getClient").returns(mockClient);
        const test = new Buffer('{"test":"test"}');
        sinon.stub(UserConvMapper.prototype, <any>"streamToBuffer").returns(test);
        const result = await mapper.getConversationData("testKey");
        const json_data = JSON.parse(test.toString());
        assert.deepEqual(result,json_data);
        
    });


    it("Test for uploadConversation Map", async ()=>{
        const testConnectionString = "https://test.com";
        const testContainerName = "test"
        const mapper = new UserConvMapper(testConnectionString,testContainerName);
        await mapper.uploadConversationMap("testKey","testID");
    });


    


    it("Test for eraseConversation Map", async ()=>{
        const testConnectionString = "https://test.com";
        const testContainerName = "test"
        const mapper = new UserConvMapper(testConnectionString,testContainerName);  
        await mapper.eraseConversationMap("testKey");
    });




})