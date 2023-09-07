import {
  Expression,
  StringExpression,
  StringExpressionConverter,
  IntExpression,
  IntExpressionConverter,
  ValueExpression,
  ValueExpressionConverter,
} from "adaptive-expressions";
import {
  Converter,
  ConverterFactory,
  Dialog,
  DialogConfiguration,
  DialogContext,
  DialogTurnResult,
} from "botbuilder-dialogs";

import {
  stargateJwtProvider,
  stargateOauthProvider,
} from "@advanceddevelopment/caip-bot-core";
import { Int } from "adaptive-expressions/lib/builtinFunctions";

/**
 * Configuration for a `StargateProvider`.
 */
export interface StargateProviderConfiguration extends DialogConfiguration {
  httpMethod: string | StringExpression;
  url: string | StringExpression;
  authType: string | StringExpression;
  retryCount: Int | IntExpression;
  contentType: string | StringExpression;
  postBodyOrGetParams: ValueExpression;
  resultProperty: string | Expression | StringExpression;
}

/**
 * Custom command makes request to a stargate endpoint.
 */
export class StargateProvider
  extends Dialog
  implements StargateProviderConfiguration
{
  public static $kind = "StargateProvider";

  /**
   * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
   * @param dc The `DialogContext` for the current turn of conversation.
   * @param options Optional. Initial information to pass to the dialog.
   * @returns A `Promise` representing the asynchronous operation.
   */
  public async beginDialog(
    dc: DialogContext,
    options?: {}
  ): Promise<DialogTurnResult> {
    let stargateResponse;
    try {
      const stargateInfo = this.getStargateInfo(dc);
      const stargateProvider = this.getStargateProvider(stargateInfo);
      stargateResponse = await this.getStargetResponse(
        stargateInfo,
        stargateProvider
      );
    } catch (error: any) {
      this.telemetryClient.trackException({ exception: error });
      stargateResponse = this.getHttpResponse(500, error.message);
    }

    if (this.resultProperty) {
      dc.state.setValue(
        this.resultProperty.getValue(dc.state),
        stargateResponse
      );
    }

    return dc.endDialog(stargateResponse);
  }

  private getStargateInfo(dc: DialogContext): StargateInfo {
    const settings = dc.parent?.state.getValue("settings");
    if (
      !settings.stargateToken ||
      !settings.stargateToken.clientID ||
      !settings.stargateToken.clientSecret
    ) {
      throw new Error(
        "StargateProvider requires stargate client_id and client_secret properties to be set in appsettings.json"
      );
    }

    const stargateInfo: StargateInfo = {
      tokenUrl: settings.stargateToken.URL,
      clientId: settings.stargateToken.clientID,
      clientSecret: settings.stargateToken.clientSecret,
      httpMethod: this.httpMethod.getValue(dc.state),
      postBodyOrGetParams: this.postBodyOrGetParams.getValue(dc.state),
      contentType: this.contentType.getValue(dc.state) || "application/json",
      authType: this.authType.getValue(dc.state) || "oauth2",
      retryCount: this.retryCount.getValue(dc.state) || 0,
      apiUrl: this.url.getValue(dc.state),
    };

    if (stargateInfo.authType === "oauth2" && !settings.stargateToken.URL) {
      throw new Error(
        "StargateProvider requires stargate token url to be set in appsettings.json"
      );
    }

    const tokenBodyParams = settings.stargateToken.tokenBodyParams;
    if (tokenBodyParams) {
      stargateInfo.tokenBodyParams = tokenBodyParams;
    }
    return stargateInfo;
  }

  private getStargateProvider(stargateInfo: StargateInfo) {
    let stargateProvider: any;
    const customHeader = new Map<string, string>();
    customHeader.set("Content-Type", stargateInfo.contentType);
    switch (stargateInfo.authType && stargateInfo.authType.toLowerCase()) {
      case "oauth2":
        stargateProvider = stargateOauthProvider({
          clientId: stargateInfo.clientId,
          clientSecret: stargateInfo.clientSecret,
          tokenUrl: stargateInfo.tokenUrl,
          retryCount: stargateInfo.retryCount,
          customHeaders: customHeader,
          tokenBodyParams : stargateInfo.tokenBodyParams
        });
        break;
      case "jwt":
        stargateProvider = stargateJwtProvider({
          clientId: stargateInfo.clientId,
          clientSecret: stargateInfo.clientSecret,
          retryCount: stargateInfo.retryCount,
          customHeaders: customHeader,
          tokenBodyParams : stargateInfo.tokenBodyParams
        });
        break;
      default:
        throw new Error(
          "StargateProvider invalid authType. valid authTypes are oauth2 and jwt"
        );
    }

    return stargateProvider;
  }

  private async getStargetResponse(
    stargateInfo: StargateInfo,
    stargateProvider: any
  ) {
    let stargateResponse;
    let stargateRequest: Promise<any>;
    switch (stargateInfo.httpMethod && stargateInfo.httpMethod.toLowerCase()) {
      case "post":
        stargateRequest = stargateProvider.post(
          stargateInfo.apiUrl,
          stargateInfo.postBodyOrGetParams
        );
        break;
      case "get":
        stargateRequest = stargateProvider.get(
          stargateInfo.apiUrl,
          stargateInfo.postBodyOrGetParams
        );
        break;
      case "put":
        stargateRequest = stargateProvider.put(
          stargateInfo.apiUrl,
          stargateInfo.postBodyOrGetParams
        );
        break;
      default:
        throw new Error(
          "Invalid Http method. (supported methods: get, post and put)"
        );
    }

    await stargateRequest
      .then((response: any) => {
        stargateResponse = this.getHttpResponse(200, response);
      })
      .catch((error: any) => {
        if (
          error.response &&
          error.response.status &&
          error.response.statusText
        ) {
          this.telemetryClient.trackException({
            exception: error,
            properties: {
              "Response Code": error.response.status,
              Message: error.response.statusText,
            },
          });
          stargateResponse = this.getHttpResponse(
            error.response.status,
            error.response.statusText
          );
        } else {
          this.telemetryClient.trackException({ exception: error });
          stargateResponse = this.getHttpResponse(500, error.message);
        }
      });

    return stargateResponse;
  }

  private getHttpResponse(statusCode: number, data: any) {
    return {
      statusCode: statusCode,
      content: data,
    };
  }

  /**
   * Gets or sets stargate authType (ex: oauth2 and jwt).
   */
  public authType: StringExpression = new StringExpression();

  /**
   * Gets or sets memory path to bind to httpMethod (ex: conversation.httpMethod).
   */
  public httpMethod: StringExpression = new StringExpression();

  /**
   * Gets or sets memory path to bind to url (ex: conversation.url).
   */
  public url: StringExpression = new StringExpression();

  /**
   * Gets or sets retry count.
   */
  public retryCount: IntExpression = new IntExpression();

  /**
   * Gets or sets memory path to bind to contentType (ex: conversation.contentType).
   */
  public contentType: StringExpression = new StringExpression();

  /**
   * Gets or sets memory path to bind to body (ex: conversation.body).
   */
  public postBodyOrGetParams: ValueExpression = new ValueExpression();

  /**
   * Gets or sets caller's memory path to store the result of this step in (ex: conversation.area).
   */
  public resultProperty: StringExpression = new StringExpression();

  /**
   * Get type converter for each property.
   * @param property Property name.
   */
  public getConverter(
    property: keyof StargateProviderConfiguration
  ): Converter | ConverterFactory {
    switch (property) {
      case "authType":
        return new StringExpressionConverter();
      case "httpMethod":
        return new StringExpressionConverter();
      case "url":
        return new StringExpressionConverter();
      case "retryCount":
        return new IntExpressionConverter();
      case "contentType":
        return new StringExpressionConverter();
      case "postBodyOrGetParams":
        return new ValueExpressionConverter();
      case "resultProperty":
        return new StringExpressionConverter();
      default:
        return super.getConverter(property);
    }
  }

  /**
   * @protected
   * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
   * @returns A `string` representing the compute Id.
   */
  protected onComputeId(): string {
    return "StargateProvider";
  }
}

type StargateInfo = {
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  apiUrl: string;
  httpMethod: string;
  authType: string;
  retryCount: number;
  contentType: string;
  postBodyOrGetParams: string;
  tokenBodyParams?: any;
};
