import * as crypto from 'crypto';
const algorithm = "aes-256-cbc";
const IV_LENGTH = 16;

import {
  Expression,
  EnumExpression,
  EnumExpressionConverter,
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
import { Any } from 'adaptive-expressions/lib/builtinFunctions';

export enum LogType {
  plaintext = 'plaintext',
  encrypted = 'encrypt'
}

export interface LoggerDialogConfiguration extends DialogConfiguration {
  message?: string | Expression | StringExpression;
  logType?: string | Expression | EnumExpression<LogType>;
}

export class LoggerDialog
  extends Dialog
  implements LoggerDialogConfiguration {
  public static $kind = "LoggerDialog";
  private ekeystr: string = "${settings.ENCRYPTION_KEY}";
  private envstr: string = "${settings.ENVIRONMENT}";
  public message: StringExpression = new StringExpression('');
  public ekey: StringExpression = new StringExpression(this.ekeystr);
  public env: StringExpression = new StringExpression(this.envstr);
  public logType: EnumExpression<LogType> = new EnumExpression<LogType>(LogType.encrypted);


  public constructor(message: string, ekey: string, env: string, logType?: LogType) {
    super();
    if (logType) {
      this.logType = new EnumExpression<LogType>(logType);
    }

    if (message) {
      this.message = new StringExpression(message);
    }

    if (ekey) {
      this.ekey = new StringExpression(ekey);
    }

    if (env) {
      this.env = new StringExpression(env);
    }
  }


  public getConverter(
    property: keyof LoggerDialogConfiguration
  ): Converter | ConverterFactory {
    switch (property) {
      case "message":
        return new StringExpressionConverter();
      case "logType":
        return new EnumExpressionConverter<LogType>(LogType);
      default:
        return super.getConverter(property);
    }
  }

  public beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
    let _message = this.message?.getValue(dc.state);
    let ENCRYPTION_KEY = this.ekey?.getValue(dc.state);
    let ENVIRONMENT = this.env?.getValue(dc.state);
    const _logType = this.logType?.getValue(dc.state);

    if (typeof _message == 'object') {
      const replacer = (key: string, value: string) => typeof value === 'undefined' ? 'undefined' : value;
      _message = JSON.stringify(_message, replacer);

    }
    if (_logType == LogType.plaintext && ENVIRONMENT.toUpperCase() == 'PROD' && ENCRYPTION_KEY.length == 32) {
      console.log(_message);
    }
    else if (_logType == LogType.encrypted && ENVIRONMENT.toUpperCase() == 'PROD' && ENCRYPTION_KEY.length == 32) {
      const encryptedText = this.encrypt(_message, ENCRYPTION_KEY);
      console.log(encryptedText);
    }
    else {
      console.log(_message);
    }
    return dc.endDialog();
  }

  // Encrypt the logs
  public encrypt(text: string, ENCRYPTION_KEY: string): string {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }


  protected onComputeId(): string {
    return "LoggerDialog";
  }
}
