import {
    BlobsTranscriptStore
  } from "botbuilder-azure-blobs";
import { Activity } from "botbuilder";


export class FetchTranscript{
    protected connectionString: string;
    protected containerName: string;

    constructor(connectionString: string, containerName: string){
        this.connectionString = connectionString;
        this.containerName = containerName;
    }

    async getTranscriptStore(connectionString: string, containerName: string): Promise<BlobsTranscriptStore> {
        return new BlobsTranscriptStore(connectionString, containerName);
    }

    

    async fetchTranscript(conversationId: string, channelId?: string): Promise<Partial<Activity>[]>{
        let result;
        try {
  
        if(!this.containerName || !this.connectionString) {
          throw new Error("Containername or connectionstring for transcriptstore incorrect in appsettings");
        }
        const transcriptStore = await this.getTranscriptStore(this.connectionString,this.containerName);
  
        let continuationToken = '';
        const transcriptArray = [];
        let count = 0;
        let transcript = await transcriptStore.getTranscriptActivities(channelId, conversationId);
  
        /*This count is to ensure there is no infinite loop in case continuationToken is never '' */
        do {
          for(var i = 0; i<transcript.items.length; i++) {
            if(transcript.items[i].type === 'message') {
                transcriptArray.push(transcript.items[i]);
            }
          }
          continuationToken = transcript.continuationToken;
          if(continuationToken === '') {
            break;
          }
          transcript = await transcriptStore.getTranscriptActivities(channelId, conversationId, continuationToken);
          count++;
        } while(count < 200);
        result = transcriptArray;
        return result;
      }
      catch( error: any) {
        
        console.log(`Error Retrieving Transcript : ${error.message}`);
        throw new Error(`Error during Fetch transcript: Trace ${error}`);
        
      }
    
      
    }

}