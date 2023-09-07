// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
  Expression,
  StringExpression,
  StringExpressionConverter,
} from "adaptive-expressions";

import {
  Converter,
  ConverterFactory,
  Dialog,
  DialogConfiguration,
  DialogContext,
  DialogTurnResult,
} from "botbuilder-dialogs";

import {
  BlobsTranscriptStore
} from "botbuilder-azure-blobs";
import { TurnContext } from "botbuilder";

type STRING = string | Expression | StringExpression;

export interface GetTranscriptDialogConfiguration extends DialogConfiguration {
  conversationId: STRING;
  resultProperty?: STRING;
}

export class GetTranscriptDialog
  extends Dialog
  implements GetTranscriptDialogConfiguration {
  public static $kind = "GetTranscriptDialog";

  public conversationId: StringExpression = new StringExpression();
  public resultProperty?: StringExpression;

  public getConverter(
    property: keyof GetTranscriptDialogConfiguration
  ): Converter | ConverterFactory {
    switch (property) {
      case "conversationId":
        return new StringExpressionConverter();
      case "resultProperty":
        return new StringExpressionConverter();
      default:
        return super.getConverter(property);
    }
  }

  public async getTranscriptStore(connectionString: string, containerName: string): Promise<BlobsTranscriptStore> {
    return new BlobsTranscriptStore(connectionString, containerName);
  }
  
  public addLastTurnMessages(transcriptArray:string[], context:TurnContext):string[] {
    if(context?.activity?.text) {
      transcriptArray.push(`${context.activity.from.name}: ${context.activity.text}`)
    }
    return transcriptArray;
  }

  public async beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
    const settings = dc.parent?.state.getValue("settings");
    const containerName = settings?.runtimeSettings?.features?.blobTranscript?.containerName;
    const connectionString = settings?.runtimeSettings?.features?.blobTranscript?.connectionString || settings?.runtimeSettings?.features?.blobTranscript?.connectionStringNew;
    let result = "";
    try {

      if(!containerName || !connectionString) {
        throw new Error("Containername or connectionstring for transcriptstore incorrect in appsettings");
      }

      let conversationId = this.conversationId.getValue(dc.state);
      if (conversationId === undefined || conversationId === "") {
        conversationId = dc.context.activity.conversation.id;
      }
      const transcriptStore = await this.getTranscriptStore(connectionString,containerName);

      let continuationToken = '';
      const transcriptArray = [];
      let count = 0;

      let transcript = await transcriptStore.getTranscriptActivities(dc.context.activity.channelId, conversationId);

      /*This count is to ensure there is no infinite loop in case continuationToken is never '' */
      do {
        for(var i = 0; i<transcript.items.length; i++) {
          const transcriptText = this.getTextFromTranscript(transcript.items[i]);
          if(transcriptText !== undefined) {
            transcriptArray.push(`${transcript.items[i].from.name}: ${transcriptText}`);
          }
        }
        continuationToken = transcript.continuationToken;
        if(continuationToken === '') {
          break;
        }
        transcript = await transcriptStore.getTranscriptActivities(dc.context.activity.channelId, conversationId, continuationToken);
        count++;
      } while(count < 200);
      const transcriptArrayNew = this.addLastTurnMessages(transcriptArray, dc.context);
      result = transcriptArrayNew.join('\r\n');
    }
    catch( error: any) {
      this.telemetryClient.trackException({ exception: error });
      result = `Error Retrieving Transcript : ${error.message}`;
    }
    if (this.resultProperty) {
      dc.state.setValue(this.resultProperty.getValue(dc.state), result);
    }
    return dc.endDialog(result);
  }

  protected getTextFromTranscript(activity: any) {
    let transcriptText;
    if (activity.type === 'message') {
      if (activity.attachments && activity.attachments.length > 0) {
        const attachment = activity.attachments[0];
        if (attachment.contentType === "application/caip.custom.link") {
          transcriptText = `${attachment.content.linkPrefix} ${attachment.content.linkText} ${attachment.content.linkSuffix}`;
        } else {
          transcriptText = attachment.content?.text;
        }
      } else {
        transcriptText = activity?.text;
      }
    }
    return transcriptText;
  }


  protected onComputeId(): string {
    return "GetTranscriptDialog";
  }
}
