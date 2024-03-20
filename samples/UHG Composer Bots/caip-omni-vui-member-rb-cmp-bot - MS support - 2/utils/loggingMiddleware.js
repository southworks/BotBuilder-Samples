const _ = require('lodash');
const { ActivityTypes } = require('botbuilder');
const { TurnContext } = require('botbuilder-core');
const { BlobServiceClient } = require("@azure/storage-blob");

class LoggingMiddleware {
  /**
   * Middleware for logging requests.
   * @param {Configuration} configuration 
   * @param {ConversationState} conversationState
   */
  constructor(configuration, conversationState, userState, telemetryMiddleware) {

    this.configuration = configuration;
    this.conversationState = conversationState;
    this.conversationDataAccessor = this.conversationState.createProperty('ConversationData');
    this.userState = userState;
    this.telemetryMiddleware = telemetryMiddleware;
    const azureStorageUrl = configuration.string(['commonStoreConnectionString']);
    const containername = configuration.string(['transcriptContainerName']);
    this.containerName = containername;
    this.blobServiceClient = BlobServiceClient.fromConnectionString(azureStorageUrl);
  }
  /**
   * @param {TurnContext} context
   * @param next Function to call at the end of the middleware chain.
   */
  async onTurn(context, next) {

    try {
      if (!context) {
        throw new Error('Context is returning null');
      }

      console.log(`calling middleware`);

      let convdata = await this.conversationDataAccessor.get(context, {});
      const timestamp = new Date().toISOString();
      const old_conv_id = context.activity.conversation.id;
      const conv_id = old_conv_id.replace("|livechat", "");

      console.log(`conversation id : ${conv_id}`);

      if ((context.activity.type === ActivityTypes.Message && context.activity.text) || (context.activity.name == "DTMF")) {

        convdata.turn_count = !convdata.turn_count ? 1 : convdata.turn_count + 1;
        const user_input = (context.activity.name == "DTMF") ? context.activity.value : context.activity.text;
        console.log(`[${timestamp}] User : ${user_input}  \n`);

        const newitem = {

          timestamp: timestamp,
          text: user_input,
          role: 'CUSTOMER',
          turn: convdata.turn_count
        }

        await this.uploadTranscriptToBlobStorage(conv_id, newitem, context);

      }

      context.onSendActivities(

        async (sendcontext, activities, nextsend) => {

          for (const activity of activities) {
            if (activity.type === ActivityTypes.Message && activity.text) {

              console.log(`[${timestamp}] Bot : ${activity.text} \n`);

              convdata.turn_count = !convdata.turn_count ? 1 : convdata.turn_count + 1;
              const newitem = {

                timestamp: timestamp,
                text: activity.text,
                role: 'BOT',
                turn: convdata.turn_count
              }

              await this.uploadTranscriptToBlobStorage(conv_id, newitem, context);

            }
          }

          await nextsend();
        }
      );

      await this.conversationState.saveChanges(context, convdata);

    }
    catch (error) {

      console.log(`Error captured : ${error.message}`);
    }

    await next();
  }

  async uploadTranscriptToBlobStorage(convid, transcript_content, context) {

    try {

      let convdata = await this.conversationState.get(context);
      const containerClient = await this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(`${convid}.json`);

      const exists = await blockBlobClient.exists();
      if (exists) {
        const downloadResponse = await blockBlobClient.download();
        const downloaded = await streamToBuffer(downloadResponse.readableStreamBody);

        const existingarray = downloaded.toString() ? JSON.parse(downloaded.toString()).conversation_info : [];

        existingarray.push(transcript_content);

        const updated_transcript = JSON.stringify({ conv_id: convid, conversation_info: existingarray }, null, 2);

        await blockBlobClient.upload(updated_transcript, updated_transcript.length, {
          blobHTTPHeaders: { blobContentType: 'application/json' },
          overwrite: true
        });

        convdata.transcript_json = updated_transcript;
        await this.conversationState.saveChanges(context, convdata);

      }
      else {

        const existingarray = [];

        existingarray.push(transcript_content);

        const updated_transcript = JSON.stringify({ conv_id: convid, conversation_info: existingarray }, null, 2);

        await blockBlobClient.upload(updated_transcript, updated_transcript.length, {
          blobHTTPHeaders: { blobContentType: 'application/json' },
          overwrite: true
        });

        convdata.transcript_json = updated_transcript;
        await this.conversationState.saveChanges(context, convdata);

      }

    }
    catch (error) {

      console.log(`Error in upload ConfigUi To Azure Storage : ${error.message}`);
    }

  }

}

async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
}

exports.useMiddleware = (
  configuration,
  conversationState,
  userState,
  telemetryMiddleware
) => {
  return new LoggingMiddleware(configuration, conversationState, userState, telemetryMiddleware);
};

exports.setupMiddleware = (services, configuration) => {
  services.addFactory(
    'middlewares',
    ['conversationState', 'userState', 'telemetryMiddleware'],
    ({ conversationState, userState, telemetryMiddleware }, middlewareSet) => {
      middlewareSet.use(
        this.useMiddleware(configuration, conversationState, userState, telemetryMiddleware)
      );

      return middlewareSet;
    }
  );
};