import {BlobServiceClient, ContainerClient, BlockBlobClient} from "@azure/storage-blob";
import { Logger } from "..//utils/logger";

export class UserConvMapper{
    protected connectionString: string;
    protected containerName: string;
    logger = new Logger(__filename);

    constructor(connectionString: string, containerName: string){
        this.connectionString = connectionString;
        this.containerName = containerName;
    }


    // returns the blobClient 
    async getClient(userKey: string): Promise<BlockBlobClient> {
        if(!this.connectionString || !this.containerName){
            throw new Error("Required details for connection to Storage Account are missing");
        };
        const blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
        const containerClient = blobServiceClient.getContainerClient(this.containerName);
        const containerExists = await containerClient.exists();
        if(!containerExists){
            await containerClient.create();
            this.logger.info("Container Created Successfully",containerClient);
        }
        const blobName = userKey + '.json';
        const blobClient = containerClient.getBlockBlobClient(blobName);
        return blobClient; 
    }


    // util method to read from the blob
    async streamToBuffer(readableStream: any) {
        return new Promise((resolve, reject) => {
        const chunks: any = [];
        readableStream.on("data", (data: any) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on("end", () => {
        resolve(Buffer.concat(chunks));
        });
        readableStream.on("error", reject);
        });
    }

    // creates/updates the  user-conv mapping in blob
    async uploadConversationMap(userKey: string, conversationId: string){
        try{
        const blobClient = await this.getClient(userKey);
        const content = {'conversationId':conversationId,'timestamp':Date.now()};
        await blobClient.upload(JSON.stringify(content),content.toLocaleString.length);
        }
        catch(e){
            this.logger.error(`Error in upload: Trace ${e}`);
            throw e;
        }
    }

    // gets the conversation Data 
    async getConversationData(userKey: string): Promise<any>{

        try{

            const blobClient = await this.getClient(userKey);
            const blobExists: boolean = await blobClient.exists();
            if(!blobExists){
                return null;
            }
            else{
                const downloadBlockBlobResponse = await blobClient.download();
                const downloaded: any = await this.streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
                const conversationResponse = JSON.parse(downloaded.toString());
                return conversationResponse;
            }

        }

        catch(e){
            this.logger.error(`Error occured during getConversationMap: Trace ${e}`);
            throw e;
        }
}

    // removes the userConv Mapping for the given userKey
    async eraseConversationMap(userKey: string){
        try{
        const blobClient = await this.getClient(userKey);
        await blobClient.deleteIfExists();
        }
        catch(e){
            this.logger.error(`Error in eraseMap operation: Trace ${e}`);
            throw e;
        }
    }
    
}