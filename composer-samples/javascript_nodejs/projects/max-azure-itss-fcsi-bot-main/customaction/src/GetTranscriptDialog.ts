// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
  NumberExpression,
  NumberExpressionConverter,
  ObjectExpression,
  ObjectExpressionConverter,
  StringExpression,
  StringExpressionConverter,
} from "adaptive-expressions";
import { ActivityTypes } from "botbuilder";

import {
  Converter,
  ConverterFactory,
  Dialog,
  DialogContext,
  DialogTurnResult,
} from "botbuilder-dialogs";

export class GetTranscriptDialog extends Dialog {
  public static $kind = "GetTranscriptDialog";

  public conversationId = new StringExpression();
  public resultProperty?: StringExpression;

  public getConverter(property: any): Converter | ConverterFactory {
    switch (property) {
      case "conversationId":
        return new StringExpressionConverter();
      case "resultProperty":
        return new StringExpressionConverter();
      default:
        return super.getConverter(property);
    }
  }

  public beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
    const input = [
      this.conversationId.getValue(dc.state),
    ].join(", ");
    dc.context.sendActivities([
      { type: ActivityTypes.Event, text: `${input}` },
    ]);
    dc.context.sendActivities([
      { type: ActivityTypes.Message, text: this.onComputeId() },
    ]);

    return dc.endDialog();
  }

  protected onComputeId(): string {
    return "GetTranscriptDialog";
  }
}
