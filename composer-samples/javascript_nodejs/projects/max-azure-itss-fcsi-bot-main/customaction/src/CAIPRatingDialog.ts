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

export class CAIPRatingDialog extends Dialog {
  public static $kind = "CAIPRatingDialog";

  public ratingConfig = new ObjectExpression();
  public ratingAdaptiveJSON = new StringExpression();

  public getConverter(property: any): Converter | ConverterFactory {
    switch (property) {
      case "ratingConfig":
        return new ObjectExpressionConverter();
      case "ratingAdaptiveJSON":
        return new StringExpressionConverter();
      default:
        return super.getConverter(property);
    }
  }

  public beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
    const input = [
      this.ratingConfig.getValue(dc.state),
      this.ratingAdaptiveJSON.getValue(dc.state),
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
    return "CAIPRatingDialog";
  }
}
