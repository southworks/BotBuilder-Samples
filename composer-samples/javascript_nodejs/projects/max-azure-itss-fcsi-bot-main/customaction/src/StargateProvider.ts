// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
  IntExpression,
  IntExpressionConverter,
  NumberExpression,
  NumberExpressionConverter,
  ObjectExpression,
  ObjectExpressionConverter,
  StringExpression,
  StringExpressionConverter,
  ValueExpression,
  ValueExpressionConverter,
} from "adaptive-expressions";
import { ActivityTypes } from "botbuilder";

import {
  Converter,
  ConverterFactory,
  Dialog,
  DialogContext,
  DialogTurnResult,
} from "botbuilder-dialogs";

export class StargateProvider extends Dialog {
  public static $kind = "StargateProvider";

  public httpMethod = new StringExpression();
  public url = new StringExpression();
  public authType = new StringExpression();
  public retryCount = new IntExpression();
  public postBodyOrGetParams = new ValueExpression();
  public contentType = new StringExpression();
  public resultProperty?: StringExpression;

  public getConverter(property: any): Converter | ConverterFactory {
    switch (property) {
      case "httpMethod":
        return new StringExpressionConverter();
      case "url":
        return new StringExpressionConverter();
      case "authType":
        return new StringExpressionConverter();
      case "retryCount":
        return new IntExpressionConverter();
      case "postBodyOrGetParams":
        return new ValueExpressionConverter();
      case "contentType":
        return new StringExpressionConverter();
      case "resultProperty":
        return new StringExpressionConverter();
      default:
        return super.getConverter(property);
    }
  }

  public beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
    const input = [
      this.httpMethod.getValue(dc.state),
      this.url.getValue(dc.state),
      this.authType.getValue(dc.state),
      this.retryCount.getValue(dc.state),
      this.postBodyOrGetParams.getValue(dc.state),
      this.contentType.getValue(dc.state),
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
    return "StargateProvider";
  }
}
