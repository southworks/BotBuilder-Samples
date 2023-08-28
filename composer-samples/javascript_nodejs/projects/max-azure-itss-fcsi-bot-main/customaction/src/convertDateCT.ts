// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
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

export interface ConvertDateCTConfiguration extends DialogConfiguration {
  date: string | StringExpression;
  resultProperty?: string | StringExpression;
}

export class ConvertDateCT
  extends Dialog
  implements ConvertDateCTConfiguration
{
  public static $kind = "ConvertDateCT";

  public date: StringExpression = new StringExpression();
  public resultProperty?: StringExpression;

  public getConverter(
    property: keyof ConvertDateCTConfiguration
  ): Converter | ConverterFactory {
    switch (property) {
      case "date":
        return new StringExpressionConverter();
      case "resultProperty":
        return new StringExpressionConverter();
      default:
        return super.getConverter(property);
    }
  }

  public beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
    const dateInput = this.date.getValue(dc.state);

    const monthMap = new Map([
      [0, "Jan"],
      [1, "Feb"],
      [2, "Mar"],
      [3, "Apr"],
      [4, "May"],
      [5, "Jun"],
      [6, "Jul"],
      [7, "Aug"],
      [8, "Sep"],
      [9, "Oct"],
      [10, "Nov"],
      [11, "Dec"],
    ]);

    const date = new Date(dateInput);

    const regexDate = new RegExp(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/g);
    let result = "";
    if (!regexDate.test(dateInput)) {
      result = dateInput;
    } else {
      let hours = date.getHours().toString();
      let minutes = date.getMinutes().toString();
      const ampm = Number(hours) >= 12 ? "PM" : "AM";
      hours = (Number(hours) % 12).toString();

      hours = (Number(hours) ? hours : 12).toString(); // the hour '0' should be '12'
      minutes = Number(minutes) < 10 ? "0" + minutes : minutes;
      hours = Number(hours) < 10 ? "0" + hours : hours;
      const strTime = hours + ":" + minutes + " " + ampm;
      const finalValue =
        monthMap.get(date.getMonth()) +
        " " +
        date.getDate() +
        ", " +
        date.getFullYear() +
        "  " +
        strTime;
      result = finalValue;
    }

    if (this.resultProperty) {
      dc.state.setValue(this.resultProperty.getValue(dc.state), result);
    }

    return dc.endDialog(result);
  }

  protected onComputeId(): string {
    return "ConvertDateCT";
  }
}
