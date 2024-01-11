import * as crypto from 'crypto';
const algorithm = "aes-256-cbc";
const IV_LENGTH = 16;
import { Activity, ActivityTypes } from 'botbuilder';

import {
    Expression,
    BoolExpression,
    BoolExpressionConverter,
    StringExpression,
    StringExpressionConverter,
    EnumExpression,
    EnumExpressionConverter,
    ValueExpression,
    ValueExpressionConverter,
} from 'adaptive-expressions';

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from 'botbuilder-dialogs';

export enum LogType {
    plaintext = 'plaintext',
    encrypted = 'encrypt'
  }

export interface OmniTraceActivityConfiguration extends DialogConfiguration {
    name?: StringExpression;
    valueType?: StringExpression;
    value?: unknown;
    label?: StringExpression;
    disabled?: BoolExpression;
    logType?: string | Expression | EnumExpression<LogType>;
}

/**
 * Send an trace activity back to the transcript.
 */
export class OmniTraceActivity<O extends object = {}> extends Dialog<O> implements OmniTraceActivityConfiguration {
    public static $kind = 'OmniTraceActivity';
    private ekeystr: string = "${settings.ENCRYPTION_KEY}";
    private envstr: string = "${settings.ENVIRONMENT}";
    public ekey: StringExpression = new StringExpression(this.ekeystr);
    public env: StringExpression = new StringExpression(this.envstr);
    public logType: EnumExpression<LogType> = new EnumExpression<LogType>(LogType.encrypted);

     public constructor(ekey: string, env: string, name: string, valueType: string, value: any, label: string, logType?: LogType);

    /**
     * Initializes a new instance of the [TraceActivity](xref:botbuilder-dialogs-adaptive.TraceActivity) class.
     * @param name Optional. Name of the trace activity.
     * @param valueType Optional. Value type of the trace activity.
     * @param value Optional. Value expression to send as the value.
     * @param label Optional. Label to use when describing a trace activity.
     */
    public constructor(ekey: string, env: string, name?: string, valueType?: string, value?: any, label?: string, logType?: LogType) {
        super();
        if (logType) {
            this.logType = new EnumExpression<LogType>(logType);
          }
        if (name) {
            this.name = new StringExpression(name);
        }
        if (valueType) {
            this.valueType = new StringExpression(valueType);
        }
        if (value) {
            this.value = new ValueExpression(value);
        }
        if (label) {
            this.label = new StringExpression(label);
        }
        if (ekey) {
            this.ekey = new StringExpression(ekey);
          }
      
          if (env) {
            this.env = new StringExpression(env);
          }
    }

    /**
     * Gets or sets name of the trace activity.
     */
    public name?: StringExpression;

    /**
     * Gets or sets value type of the trace activity.
     */
    public valueType?: StringExpression;

    /**
     * Gets or sets value expression to send as the value.
     */
    public value?: ValueExpression;

    /**
     * Gets or sets a label to use when describing a trace activity.
     */
    public label?: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public getConverter(property: keyof OmniTraceActivityConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'name':
                return new StringExpressionConverter();
            case 'valueType':
                return new StringExpressionConverter();
            case 'value':
                return new ValueExpressionConverter();
            case 'label':
                return new StringExpressionConverter();
            case 'disabled':
                return new BoolExpressionConverter();
            case "logType":
                return new EnumExpressionConverter<LogType>(LogType);
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }
        let ENCRYPTION_KEY = this.ekey?.getValue(dc.state);
        let ENVIRONMENT = this.env?.getValue(dc.state);
        const _logType = this.logType?.getValue(dc.state);

        let value: any;

        if (this.value) {
            value = this.value.getValue(dc.state);
        } else {
            value = dc.state.getMemorySnapshot();
        }

        let _message = this.value?.getValue(dc.state);
        

        if (typeof _message == 'object') {
            const replacer = (key: string, value: string) => typeof value === 'undefined' ? 'undefined' : value;
            _message = JSON.stringify(_message, replacer);
      
          }

          if (_logType == LogType.plaintext && ENVIRONMENT.toUpperCase() == 'PROD' && ENCRYPTION_KEY.length == 32) {
            value = _message;
            
          }
          else if (_logType == LogType.encrypted && ENVIRONMENT.toUpperCase() == 'PROD' && ENCRYPTION_KEY.length == 32) {
            const encryptedText = this.encrypt(_message, ENCRYPTION_KEY);
            value = encryptedText;
           
          }
          else {
             value = _message;
            
          }

        const name = (this.name && this.name.getValue(dc.state)) || 'Trace';
        const valueType = (this.valueType && this.valueType.getValue(dc.state)) || 'State';
        const label =
            (this.label && this.label.getValue(dc.state)) ||
            (dc.parent && dc.parent.activeDialog && dc.parent.activeDialog.id) ||
            '';

        const traceActivity: Partial<Activity> = {
            type: ActivityTypes.Trace,
            timestamp: new Date(),
            name,
            value,
            valueType,
            label,
        };
        await dc.context.sendActivity(traceActivity);
        return await dc.endDialog(traceActivity);
    }

    // Encrpt the values
    public encrypt(text: string, ENCRYPTION_KEY:string): string {
        let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `OmniTraceActivity`;
    }
}
