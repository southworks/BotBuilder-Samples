import {
  Expression,
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
import { replaceJsonRecursively } from "./jsonExtensions";

/**
 * Configuration for a `SendTraceTelemetry`.
 */
export interface SendTraceTelemetryConfiguration extends DialogConfiguration {
  message: string | Expression | StringExpression;
  properties: object | Expression | ObjectExpression<{}>;
}

/**
 * Configuration for a `SendEventTelemetry`.
 */
export interface SendEventTelemetryConfiguration extends DialogConfiguration {
  name: string | Expression | StringExpression;
  properties: object | Expression | ObjectExpression<{}>;
}

/**
 * Custom command which takes takes message and properties to send trace telemetry
 */
export class SendTraceTelemetry
  extends Dialog
  implements SendTraceTelemetryConfiguration {
  public static $kind = "SendTraceTelemetry";
  public message: StringExpression = new StringExpression("message");
  public properties: ObjectExpression<{}> = new ObjectExpression({});

  /**
   * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
   * @param dc The `DialogContext` for the current turn of conversation.
   * @param options Optional. Initial information to pass to the dialog.
   * @returns A `Promise` representing the asynchronous operation.
   */
  public beginDialog(
    dc: DialogContext,
    options?: {}
  ): Promise<DialogTurnResult> {
    const message = this.message.getValue(dc.state);
    const properties = this.properties.getValue(dc.state);

    const parsedProperties = replaceJsonRecursively(dc.state, properties);

    this.telemetryClient.trackTrace({
      message: message,
      properties: parsedProperties,
    });

    return dc.endDialog();
  }

  /**
   * Get type converter for each property.
   * @param property Property name.
   */
  public getConverter(
    property: keyof SendTraceTelemetryConfiguration
  ): Converter | ConverterFactory {
    switch (property) {
      case "message":
        return new StringExpressionConverter();
      case "properties":
        return new ObjectExpressionConverter();
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
    return "SendTraceTelemetry";
  }
}

/**
 * Custom command which takes takes name and properties to send customEvent telemetry
 */
export class SendEventTelemetry
  extends Dialog
  implements SendEventTelemetryConfiguration {
  public static $kind = "SendEventTelemetry";
  public name: StringExpression = new StringExpression("Event");
  public properties: ObjectExpression<{}> = new ObjectExpression({});

  /**
   * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
   * @param dc The `DialogContext` for the current turn of conversation.
   * @param options Optional. Initial information to pass to the dialog.
   * @returns A `Promise` representing the asynchronous operation.
   */
  public beginDialog(
    dc: DialogContext,
    options?: {}
  ): Promise<DialogTurnResult> {
    const name = this.name.getValue(dc.state);
    const properties = this.properties.getValue(dc.state);

    const parsedProperties = replaceJsonRecursively(dc.state, properties);

    this.telemetryClient.trackEvent({
      name: name,
      properties: parsedProperties,
    });

    return dc.endDialog();
  }

  /**
   * Get type converter for each property.
   * @param property Property name.
   */
  public getConverter(
    property: keyof SendEventTelemetryConfiguration
  ): Converter | ConverterFactory {
    switch (property) {
      case "name":
        return new StringExpressionConverter();
      case "properties":
        return new ObjectExpressionConverter();
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
    return "SendEventTelemetry";
  }
}

/**
 * Custom command which flushes queued telemetry
 */
export class FlushTelemetry extends Dialog {
  public static $kind = "FlushTelemetry";

  /**
   * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
   * @param dc The `DialogContext` for the current turn of conversation.
   * @param options Optional. Initial information to pass to the dialog.
   * @returns A `Promise` representing the asynchronous operation.
   */
  public beginDialog(
    dc: DialogContext,
    options?: {}
  ): Promise<DialogTurnResult> {
    this.telemetryClient.flush();
    return dc.endDialog();
  }

  /**
   * @protected
   * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
   * @returns A `string` representing the compute Id.
   */
  protected onComputeId(): string {
    return "FlushTelemetry";
  }
}
