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

export class MultiplyDialog extends Dialog {
  public static $kind = "MultiplyDialog";

  public arg1 = new NumberExpression();
  public arg2 = new NumberExpression();
  public resultProperty?: StringExpression;

  public getConverter(property: any): Converter | ConverterFactory {
    switch (property) {
      case "arg1":
        return new NumberExpressionConverter();
      case "arg2":
        return new NumberExpressionConverter();
      case "resultProperty":
        return new StringExpressionConverter();
      default:
        return super.getConverter(property);
    }
  }

  public beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
    const input = [
      this.arg1.getValue(dc.state),
      this.arg2.getValue(dc.state),
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
    return "MultiplyDialog";
  }
}
