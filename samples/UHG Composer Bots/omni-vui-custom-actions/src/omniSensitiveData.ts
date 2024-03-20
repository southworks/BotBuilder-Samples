 import {
    BoolExpression,
    BoolExpressionConverter,
    Expression,
    EnumExpression,
    EnumExpressionConverter,
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
    NO = 'disabled',
    YES = 'enabled'
  }

export interface SensitiveDataConfiguration extends DialogConfiguration {
    logType : string | Expression | EnumExpression<LogType>;
    disabled?: boolean | string | BoolExpression;
}

/**
 * Handling of sensitive data.
 */
export class OmniSensitiveData<O extends object = {}> extends Dialog<O> implements SensitiveDataConfiguration {
    public static $kind = 'OmniSensitiveData';
    public logType: EnumExpression<LogType> = new EnumExpression<LogType>(LogType.YES);
    /**
     * Creates a new `Sensitive Data` instance.
        */
    public constructor(logType?: LogType) {
        super();
        if(logType){
            this.logType = new EnumExpression<LogType>(logType);
          }
    }

 
    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public getConverter(property: keyof SensitiveDataConfiguration): Converter | ConverterFactory {
        switch (property) {
            case "logType":
        return new EnumExpressionConverter<LogType>(LogType);
            case 'disabled':
                return new BoolExpressionConverter();
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
    public async beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }
        const _logType = this.logType?.getValue(dc.state);
        const property_TTS = "conversation.channelData.activityParams.disableTtsCache";
        const property_SysLog = "conversation.channelData.activityParams.sensitiveInfo";
        const property_azureLog = "dialog.log";

        if (_logType == LogType.YES)
        {
            dc.state.setValue(property_TTS, true),
            dc.state.setValue(property_SysLog, true),
            dc.state.setValue(property_azureLog, false);
           
        }
        else if (_logType == LogType.NO)
        {
            dc.state.setValue(property_TTS, false),
            dc.state.setValue(property_SysLog, false),
            dc.state.setValue(property_azureLog, true);
                                           }
        return await dc.endDialog();
    }
    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `SensitiveData`;
    }
}
