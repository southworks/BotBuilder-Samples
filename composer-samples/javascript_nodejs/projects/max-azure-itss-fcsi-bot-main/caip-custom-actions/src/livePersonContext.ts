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
import axios from 'axios';
/**
 * Configuration for a `LivePersonContext`.
 */
export interface LivePersonContextConfiguration extends DialogConfiguration {
  resultContext: string | Expression | StringExpression;
  resultToken: string | Expression | StringExpression;
  resultSDEs: string | Expression | StringExpression;
}
/**
 * Custom command makes request to a stargate endpoint.
 */
export class LivePersonContext
  extends Dialog
  implements LivePersonContextConfiguration
{
  public static $kind = "LivePersonContext";
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
    let result;
    try {
      const livePersonConfig = this.getLivePersonConfig(dc);
      const livePersonToken = await this.getLivePersonToken(livePersonConfig);
      if (this.resultToken) {
        dc.state.setValue(
          this.resultToken.getValue(dc.state),
          livePersonToken
        );
      }
      const livePersonContext = await this.getLivePersonContext(
        dc,
        livePersonConfig,
        livePersonToken
      );
      if (this.resultContext) {
        dc.state.setValue(
          this.resultContext.getValue(dc.state),
          livePersonContext
        );
      }
      const livePersonSDEs = await this.getLivePersonSDEs(dc);
      if (this.resultSDEs) {
        dc.state.setValue(
          this.resultSDEs.getValue(dc.state),
          livePersonSDEs
        );
      }
      result = "livePersonContext set";
      this.telemetryClient.trackTrace({
        message: "livePersonContext",
        severityLevel: 3,
        properties: {
            "value": JSON.stringify(livePersonContext)
        }
      });
    } catch (error: any) {
      this.telemetryClient.trackException({ exception: error });
      result = this.getHttpResponse(500, error.message);
    }
    return dc.endDialog(result);
  }
  private getLivePersonConfig(dc: DialogContext): LivePersonConfig {
    const settings = dc.parent?.state.getValue("settings");
    if (
      !settings.livePerson ||
      !settings.livePerson.baseURL ||
      !settings.livePerson.accountId ||
      !settings.livePerson.namespace ||
      !settings.livePerson.contextKey ||
      !settings.livePerson.user ||
      !settings.livePerson.pass
    ) {
      this._throw(
        "livePersonContext requires livePerson properties baseURL, accountId, namespace, contextKey, user & pass to be set in appsettings.json"
      );
    }
    dc.context?.activity?.channelData?.context?.convId ? null : this._throw("livePersonContext requires a sessionId from LivePerson");
    const livePersonConfig: LivePersonConfig = {
      baseUrl: settings.livePerson.baseURL,
      accountId: settings.livePerson.accountId,
      namespace: settings.livePerson.namespace,
      contextKey: settings.livePerson.contextKey,
      user: settings.livePerson.user,
      pass: settings.livePerson.pass,
      sessionId: dc.context.activity.channelData.context.convId
    };
    return livePersonConfig;
  }
  private async getLivePersonToken(
    livePersonConfig: LivePersonConfig
  ) {
    let livePersonResponse;
    const base64data = Buffer.from(livePersonConfig.user+ ':' + livePersonConfig.pass).toString('base64');
    try {
      const response = await axios.get(livePersonConfig.baseUrl + '/v2/authenticate/login', {
        headers: {
          'Authorization': 'Basic ' + base64data
        }
      });
      livePersonResponse = response.data.token;
    } catch (error: any) {
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
      } else {
        this.telemetryClient.trackException({ exception: error });
        livePersonResponse =  this.getHttpResponse(500, error.message);
      }
    }
    return livePersonResponse;
  }
  private async getLivePersonContext(
    dc: DialogContext,
    livePersonConfig: LivePersonConfig,
    token: String
  ) {
    const livePersonContextUrl = [livePersonConfig.baseUrl, 'v2/context/document', livePersonConfig.accountId, livePersonConfig.namespace, livePersonConfig.sessionId].join('/');
    let livePersonContext = {};
    if (dc?.context?.activity?.channelData?.context?.lpEvent) {
      livePersonContext = dc.context.activity.channelData.context;
    } else {
      try {
        const response = await axios.get(livePersonContextUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+ token
          },
        });
        livePersonContext = response.data;
      }
      catch (error: any) {
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
          } else {
            this.telemetryClient.trackException({ exception: error });
            livePersonContext =  this.getHttpResponse(500, error.message);
          }
      }
    }
    return livePersonContext;
  }
  private async getLivePersonSDEs(
    dc: DialogContext,
  ) {
    let livePersonSDEs = {};
    if (dc?.context?.activity?.channelData?.context?.lpSdes) {
      livePersonSDEs = dc.context.activity.channelData.context.lpSdes;
    }
    return livePersonSDEs;
  }
  private getHttpResponse(statusCode: number, data: any) {
    return {
      statusCode: statusCode,
      content: data,
    };
  }
  private _throw(message: any) {
    throw new Error( message )
  };
  /**
   * Gets or sets caller's memory path to store the result of this step in (ex: conversation.area).
   */
  public resultContext: StringExpression = new StringExpression();
    /**
   * Gets or sets caller's memory path to store the result of this step in (ex: conversation.area).
   */
  public resultToken: StringExpression = new StringExpression();
    /**
   * Gets or sets caller's memory path to store the result of this step in (ex: conversation.area).
   */
  public resultSDEs: StringExpression = new StringExpression();
  /**
   * Get type converter for each property.
   * @param property Property name.
   */
  public getConverter(
    property: keyof LivePersonContextConfiguration
  ): Converter | ConverterFactory {
    switch (property) {
      case "resultContext":
        return new StringExpressionConverter();
      case "resultToken":
        return new StringExpressionConverter();
      case "resultSDEs":
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
    return "LivePersonContext";
  }
}
type LivePersonConfig = {
  baseUrl: string;
  accountId: string;
  namespace: string;
  contextKey: string;
  user: string;
  pass: string;
  sessionId: string;
};
