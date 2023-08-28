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

export interface StringIncludesConfiguration extends DialogConfiguration {
  sentence: string | StringExpression;
  word: string | StringExpression;
  resultProperty?: string | StringExpression;
}

export class StringIncludes
  extends Dialog
  implements StringIncludesConfiguration
{
  public static $kind = "StringIncludes";

  public sentence: StringExpression = new StringExpression();
  public word: StringExpression = new StringExpression();
  public resultProperty?: StringExpression;

  public getConverter(
    property: keyof StringIncludesConfiguration
  ): Converter | ConverterFactory {
    switch (property) {
      case "sentence":
        return new StringExpressionConverter();
      case "word":
        return new StringExpressionConverter();
      case "resultProperty":
        return new StringExpressionConverter();
      default:
        return super.getConverter(property);
    }
  }

  private findWordInArr(arr: string[], wordArr: string[]): boolean {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === wordArr[0]) {
        let match = 1;
        for (let j = 1; j < wordArr.length && (i + j) < arr.length; j++) {
          if (arr[i + j] === wordArr[j]) {
            match++;
          } else {
            break;
          }
        }
        if (match === wordArr.length) {
          return true;
        }
      }
    }
    return false;
  }

  private normalizeSentence(sentence: string, word: string): string {
    if (word.includes(".com") || word.includes("http") || word.includes("-") || word.includes("/") || word.includes(".")) {
      return sentence;
    } else {
      return sentence.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[`~!@#$%^&*_|+\=?;:.'"”,<>\{\}\[\]\\\/-]/gi, ' ');
    }
  }

  public async beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
    const sentence = this.sentence.getValue(dc.state);
    const word = this.word.getValue(dc.state);
    let result = false;

    const sentenceSearch = this.normalizeSentence(sentence, word);
    const wordArr = word.split(" ");
    const arr = sentenceSearch.split(" ");

    if (wordArr.length === 1) {
      result = arr.includes(word);
    } else {
      result = this.findWordInArr(arr, wordArr);
    }

    if (this.resultProperty) {
      dc.state.setValue(this.resultProperty.getValue(dc.state), result);
    }

    return dc.endDialog(result);
  }


  protected onComputeId(): string {
    return "StringIncludes";
  }
}
