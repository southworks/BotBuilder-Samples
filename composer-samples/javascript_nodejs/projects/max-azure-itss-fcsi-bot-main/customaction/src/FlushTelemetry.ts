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

export class FlushTelemetry extends Dialog {
  public static $kind = "FlushTelemetry";

  public getConverter(property: any): Converter | ConverterFactory {
    switch (property) {
      default:
        return super.getConverter(property);
    }
  }

  public beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
    dc.context.sendActivities([
      { type: ActivityTypes.Message, text: this.onComputeId() },
    ]);

    return dc.endDialog();
  }

  protected onComputeId(): string {
    return "FlushTelemetry";
  }
}
