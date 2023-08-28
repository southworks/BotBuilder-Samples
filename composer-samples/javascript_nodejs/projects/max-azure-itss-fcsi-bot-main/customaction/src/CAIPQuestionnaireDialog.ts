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
  DialogConfiguration,
  DialogContext,
  DialogTurnResult,
} from "botbuilder-dialogs";

export class CAIPQuestionnaireDialog extends Dialog {
  public static $kind = "CAIPQuestionnaireDialog";

  public rating = new NumberExpression();
  public questionnaireConfig = new ObjectExpression();
  public questionnaireAdaptiveJSON = new StringExpression();

  public getConverter(property: any): Converter | ConverterFactory {
    switch (property) {
      case "rating":
        return new NumberExpressionConverter();
      case "questionnaireConfig":
        return new ObjectExpressionConverter();
      case "questionnaireAdaptiveJSON":
        return new StringExpressionConverter();
      default:
        return super.getConverter(property);
    }
  }

  public beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
    const input = [
      this.rating.getValue(dc.state),
      this.questionnaireConfig.getValue(dc.state),
      this.questionnaireAdaptiveJSON.getValue(dc.state),
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
    return "CAIPQuestionnaireDialog";
  }
}
