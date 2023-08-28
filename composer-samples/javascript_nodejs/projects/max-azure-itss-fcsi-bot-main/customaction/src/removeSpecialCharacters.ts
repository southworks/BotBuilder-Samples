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
  
  export interface RemoveSpecialCharactersConfiguration extends DialogConfiguration {
    userIssue: string | Expression | StringExpression;
    resultProperty?: string | Expression | StringExpression;
  }
  
  export class RemoveSpecialCharacters
    extends Dialog
    implements RemoveSpecialCharactersConfiguration {
    public static $kind = "removeSpecialCharacters";
  
    public userIssue: StringExpression = new StringExpression();
    public resultProperty?: StringExpression;


  
    public getConverter(
      property: keyof RemoveSpecialCharactersConfiguration
    ): Converter | ConverterFactory {
      switch (property) {
        case "userIssue":
          return new StringExpressionConverter();
        case "resultProperty":
          return new StringExpressionConverter();
        default:
          return super.getConverter(property);
      }
    }
  
    public beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
        const userIssue = this.userIssue.getValue(dc.state);
        let result = "";
            result = userIssue.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[`~!@#$%^&*_|+\=?;'"”,<>\{\}\[\]\\\/]/gi, ' ');
        if (this.resultProperty) {
          dc.state.setValue(this.resultProperty.getValue(dc.state), result); 
        }
        return dc.endDialog(result);
      }

    protected onComputeId(): string {
      return "RemoveSpecialCharacters";
    }
  }
  