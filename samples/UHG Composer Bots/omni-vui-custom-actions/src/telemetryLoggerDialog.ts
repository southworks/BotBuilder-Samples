import * as crypto from 'crypto';
const algorithm = "aes-256-cbc";
const IV_LENGTH = 16;
import {
    Expression,
    EnumExpression,
    EnumExpressionConverter,
    BoolExpression,
    BoolExpressionConverter,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from 'botbuilder-dialogs';


type PropertiesInput = Record<string, string>;
type PropertiesOutput = Record<string, StringExpression>;

/**
 * Converter to convert telemetry properties configuration.
 */
export class TelemetryPropertiesConverter implements Converter<PropertiesInput, PropertiesOutput> {
    /**
     * Converts a [PropertiesInput](xref:botbuilder-dialogs-adaptive.PropertiesInput) or [PropertiesOutput](xref:botbuilder-dialogs-adaptive.PropertiesOutput) into telemetry [PropertiesOutput](xref:botbuilder-dialogs-adaptive.PropertiesOutput).
     * @param properties The [PropertiesInput](xref:botbuilder-dialogs-adaptive.PropertiesInput) or [PropertiesOutput](xref:botbuilder-dialogs-adaptive.PropertiesOutput) to convert.
     * @returns The converted [StringExpression](xref:adaptive-expressions.StringExpression).
     */
    public convert(value: PropertiesInput | PropertiesOutput): PropertiesOutput {
        return Object.entries(value).reduce((properties, [key, value]) => {
            const property = value instanceof StringExpression ? value : new StringExpression(value);
            return { ...properties, [key]: property };
        }, {});
    }
}

export enum LogType {
    plaintext = 'plaintext',
    encrypted = 'encrypt'
}
export interface TelemetryLoggerDialogConfiguration extends DialogConfiguration {
    disabled?: BoolExpression;
    eventName?: String |Expression | StringExpression;
    logType?: string | Expression | EnumExpression<LogType>;
    properties?: PropertiesInput | PropertiesOutput;
}

/**
 * Track a custom event.
 */
export class TelemetryLoggerDialog<O extends object = {}>
    extends Dialog
    implements TelemetryLoggerDialogConfiguration {
    public static $kind = 'TelemetryLoggerDialog';
    public logType: EnumExpression<LogType> = new EnumExpression<LogType>(LogType.encrypted);
    /**
     * Initializes a new instance of the [TelemetryTrackEventAction](xref:botbuilder-dialogs-adaptive.TelemetryTrackEventAction) class.
     * @param eventName Name to use for the event.
     * @param properties Properties to attach to the tracked event.
     */
     public ekey: StringExpression = new StringExpression("${settings.ENCRYPTION_KEY}");
     public env: StringExpression = new StringExpression("${settings.ENVIRONMENT}");
    public constructor(eventName: string, ekey:string, env:string, logType: LogType, properties: { [name: string]: string });

    /**
     * Initializes a new instance of the [TelemetryTrackEventAction](xref:botbuilder-dialogs-adaptive.TelemetryTrackEventAction) class.
     * @param eventName Optional. Name to use for the event.
     * @param properties Optional. Properties to attach to the tracked event.
     */
    public constructor(eventName?: string, ekey?:string, env?:string, logType?: LogType, properties?: { [name: string]: string }) {

        super();

        if(logType){
            this.logType = new EnumExpression<LogType>(logType);
          }
          if(ekey){
            this.ekey = new StringExpression(ekey);
          }
          if(env){
            this.env = new StringExpression(env);
          }
                if (eventName) {
            this.eventName = new StringExpression(eventName);
        }
        if (properties) {
            this.properties = {};
            for (const name in properties) {
                this.properties[name] = new StringExpression(properties[name]);
            }
        }
    }
   
    public disabled: BoolExpression = new BoolExpression;
    public eventName: StringExpression = new StringExpression;
    public properties: { [name: string]: StringExpression } = { };

    public getConverter(property: keyof TelemetryLoggerDialogConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'eventName':
                return new StringExpressionConverter();
            case 'properties':
                return new TelemetryPropertiesConverter();
            case 'disabled':
                return new BoolExpressionConverter();
            case "logType":
                return new EnumExpressionConverter<LogType>(LogType);
            default:
                return super.getConverter(property);
        }
    }
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        let ENCRYPTION_KEY = this.ekey?.getValue(dc.state);
        let ENVIRONMENT = this.env?.getValue(dc.state);
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (this.eventName) {
            const name = this.eventName.getValue(dc.state);
            const _logType = this.logType?.getValue(dc.state);

            const properties :{ [name: string]: string } = {};
           let temp_properties :{ [name: string]: string } = {};
            if (this.properties) {
                for (const name in this.properties) {

                    if(_logType == LogType.encrypted && ENVIRONMENT.toUpperCase() == 'PROD' && name.toUpperCase().startsWith("#PT#") == true && ENCRYPTION_KEY.length == 32)
                    {
                        
                       
                        properties[(name.substring(4))] = this.properties[name].getValue(dc.state);
                                           
                    }
                    
                    else if (_logType == LogType.encrypted && ENVIRONMENT.toUpperCase() == 'PROD'  && ENCRYPTION_KEY.length == 32) {

                            
                            temp_properties[name] = JSON.stringify(this.properties[name].getValue(dc.state));
                            properties[name] = this.encrypt(temp_properties[name],ENCRYPTION_KEY);
                    
                    }
                    
                    else if(_logType == LogType.plaintext && ENVIRONMENT.toUpperCase() == 'PROD' && ENCRYPTION_KEY.length == 32)
                    {
                        
                       
                        properties[name] = this.properties[name].getValue(dc.state);
                                           
                    }

                    else {
                        
                        properties[name] = this.properties[name].getValue(dc.state);
                    }

                }
            }

            this.telemetryClient.trackEvent({name,properties});
        }

        return await dc.endDialog();
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
        return `TelemetryLoggerDialog[${this.eventName && this.eventName.toString()}]`;
    }
}
