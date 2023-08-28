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

export interface SendEventConfiguration extends DialogConfiguration {
  input: string | Expression | StringExpression;
}

export class SendEvent extends Dialog implements SendEventConfiguration {
  public static $kind = "SendEvent";

  public input: StringExpression = new StringExpression();

  public getConverter(
    property: keyof SendEventConfiguration
  ): Converter | ConverterFactory {
    switch (property) {
      case "input":
        return new StringExpressionConverter();
      default:
        return super.getConverter(property);
    }
  }

  public beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
    const input = this.input.getValue(dc.state);
    dc.context.sendActivities([{ type: "Event", name: `${input}` }]);
    return dc.endDialog();
  }

  protected onComputeId(): string {
    return "SendEvent";
  }
}
