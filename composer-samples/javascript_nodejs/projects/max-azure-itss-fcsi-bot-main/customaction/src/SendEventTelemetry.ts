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

export class SendEventTelemetry extends Dialog {
  public static $kind = "SendEventTelemetry";

  public name = new StringExpression();
  public properties = new ObjectExpression();

  public getConverter(property: any): Converter | ConverterFactory {
    switch (property) {
      case "name":
        return new StringExpressionConverter();
      case "properties":
        return new ObjectExpressionConverter();
      default:
        return super.getConverter(property);
    }
  }

  public beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
    const input = [
      this.name.getValue(dc.state),
      this.properties.getValue(dc.state),
    ].join(", ");
    // dc.context.sendActivities([
    //   { type: ActivityTypes.Event, text: `${input}` },
    // ]);
    // dc.context.sendActivities([
    //   { type: ActivityTypes.Message, text: this.onComputeId() },
    // ]);

    return dc.endDialog();
  }

  protected onComputeId(): string {
    return "SendEventTelemetry";
  }
}
