// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
  StringExpression,
  StringExpressionConverter,
  ObjectExpression,
  ObjectExpressionConverter,
} from "adaptive-expressions";

import {
  Converter,
  ConverterFactory,
  Dialog,
  DialogConfiguration,
  DialogContext,
  DialogTurnResult,
} from "botbuilder-dialogs";

export interface TopThreeIntentsConfiguration extends DialogConfiguration {
  intents: ObjectExpression<object>;
  resultProperty?: string | StringExpression;
}

export class TopThreeIntents
  extends Dialog
  implements TopThreeIntentsConfiguration {
  public static $kind = "TopThreeIntents";

  public intents: ObjectExpression<object> = new ObjectExpression();
  public resultProperty?: StringExpression;

  public getConverter(
    property: keyof TopThreeIntentsConfiguration
  ): Converter | ConverterFactory {
    switch (property) {
      case "intents":
        return new ObjectExpressionConverter();
      case "resultProperty":
        return new StringExpressionConverter();
      default:
        return super.getConverter(property);
    }
  }

  public beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
    const intents = this.intents.getValue(dc.state);
    const initials: Object = intents;

    const is:Array<any>=[];
    

    for (const [key, value] of Object.entries(initials)) {
      const score = value.score;
      const intent = key;
      const a:Array<any> = [`${intent}`, `${score}`];
        is.push(a);
    }
    
    const topThree:Array<any> = [];
    for (let i =0; i<15; i++) {
        topThree[i]=is[i];
    }

    const result = topThree;

    if (this.resultProperty) {
      dc.state.setValue(this.resultProperty.getValue(dc.state), result);
    }

    return dc.endDialog(result);
  }

  protected onComputeId(): string {
    return "TopThreeIntents";
  }
}
