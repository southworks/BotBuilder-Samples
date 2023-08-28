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

const axios = require('axios');

export interface SendAttachmentConfiguration extends DialogConfiguration {
  attachmentUrl:  string | StringExpression;
  attachmentType: string | StringExpression;
  url: string | StringExpression;
  authKey: string | StringExpression;
  resultProperty?: string | StringExpression;
}

export class SendAttachment
  extends Dialog
  implements SendAttachmentConfiguration {
  public static $kind = "SendAttachment";

  public url: StringExpression = new StringExpression();
  public authKey: StringExpression = new StringExpression();
  public attachmentType: StringExpression = new StringExpression();
  public attachmentUrl: StringExpression = new StringExpression();
  public resultProperty?: StringExpression;

  public getConverter(
    property: keyof SendAttachmentConfiguration
  ): Converter | ConverterFactory {
    switch (property) {
      case "url":
        return new StringExpressionConverter();
      case "authKey":
        return new StringExpressionConverter();
      case "attachmentUrl":
        return new StringExpressionConverter();
      case "attachmentType":
        return new StringExpressionConverter();
      case "resultProperty":
        return new StringExpressionConverter();
      default:
        return super.getConverter(property);
    }
  }

  getUploadedData(attachmentUrl: String) {
    return axios.get(attachmentUrl, {
      responseType: 'arraybuffer',
    }).then(function (response: any) {
        return response.data;
      });
  }

  postAttachment(attachmentType: String, authKey: String, url: String, data: Array<Buffer>) {
    return axios({
      method: 'post',
      url,
      data,
      headers: {
        'Authorization': authKey,
        'Accept': 'application/json',
        'Content-Type': attachmentType
      }
    })
  }

  public beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
    const attachmentType = this.attachmentType.getValue(dc.state);
    const attachmentUrl = this.attachmentUrl.getValue(dc.state);
    const url = this.url.getValue(dc.state);
    const authKey = this.authKey.getValue(dc.state);

    // Make a request for a user with a given ID
    return this.getUploadedData(attachmentUrl)
      .then((data: any) => {
        return this.postAttachment(attachmentType, authKey, url, data)
      })
      .then((result: any) => {
        if (this.resultProperty) {
          dc.state.setValue(this.resultProperty.getValue(dc.state), result.data);
        }
        return dc.endDialog(result);
      })
      .catch(function (error: any) {
        // handle error
        return dc.endDialog(error);
      });
  }

  protected onComputeId(): string {
    return "SendAttachment";
  }
}
