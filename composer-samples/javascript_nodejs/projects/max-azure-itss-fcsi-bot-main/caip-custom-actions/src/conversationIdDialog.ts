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
import {UserConvMapper} from '@advanceddevelopment/caip-bot-core';


import {
BlobsStorage
} from "botbuilder-azure-blobs";
import {BlobServiceClient, ContainerClient} from "@azure/storage-blob";




export interface ConversationIdDialogConfiguration extends DialogConfiguration {
  resultProperty?: string | Expression | StringExpression;
}

export class ConversationIdDialog
  extends Dialog
  implements ConversationIdDialogConfiguration {
  public static $kind = "ConversationIdDialog";
  public resultProperty?: StringExpression;

  public getConverter(
    property: keyof ConversationIdDialogConfiguration
  ): Converter | ConverterFactory {
    switch (property) {
      case "resultProperty":
        return new StringExpressionConverter();
      default:
        return super.getConverter(property);
    }
  }
  

  public async beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
    const userKey = dc.context.activity.from.id;
    const settings = dc.parent?.state.getValue("settings");
    const containerName = settings.runtimeSettings?.containerName;
    const connectionString = settings.runtimeSettings?.features?.blobTranscript?.connectionString || settings.runtimeSettings?.features?.blobTranscript?.connectionStringNew;

    let res;

    try{

      if(!containerName) {
        throw new Error("Containername not defined, check runtimeSettings.containerName;");
      }

      if(!connectionString) {
        throw new Error("Connectionstring not defined, check runtimeSettings.features.blobTranscript.connectionString or connectionStringNew");
      }
      const mapper = new UserConvMapper(connectionString,containerName);
      await mapper.eraseConversationMap(userKey);
      res = "DeletionSucessful"
    }

    catch(err:any){
      console.log(`Error while clearing conversation : ${err.message}`);
      res =  `Error: Erase Action Failed`;

    }

    // set the result
    if (this.resultProperty) {
      dc.state.setValue(this.resultProperty.getValue(dc.state), res);
    }
    return dc.endDialog(res);
  }

  protected onComputeId(): string {
    return "ConversationIdDialog";
  }
}
