import {
    Expression,
    NumberExpression,
    NumberExpressionConverter
  } from "adaptive-expressions";
  
  import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
  } from "botbuilder-dialogs";
  
  import { TurnContext } from "botbuilder";

  export interface TypingDelayDialogConfiguration extends DialogConfiguration {
    delay: number | Expression | NumberExpression;
  }
  
  export class TypingDelayDialog
    extends Dialog
    implements TypingDelayDialogConfiguration {
    public static $kind = "TypingDelayIndicator";
  
    public delay: NumberExpression = new NumberExpression(0);
  
    public getConverter(
      property: keyof TypingDelayDialogConfiguration
    ): Converter | ConverterFactory {
        if (property === 'delay') {
          return new NumberExpressionConverter();
        }
        return super.getConverter(property);
    }
  
    public async beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
      const delay = this.delay.getValue(dc.state);
      try {
        const settings = dc.parent?.state.getValue("settings");
        const convRef = TurnContext.getConversationReference(
          dc.context.activity
        );
        await dc.context.adapter.continueConversationAsync(
          settings?.MicrosoftAppId,
          convRef,
          dc.context.turnState.get(dc.context.adapter?.OAuthScopeKey),
          async (context) => {
            await context.sendActivities([{ type: 'typing' }, { type: 'delay', value: delay }]);
          }
        );
      } catch (error: any) {
        console.log(
          `Error in Typing Delay Dialog: Message: ${error?.message} Stack: ${error?.stack}`
        );
      }
      return dc.endDialog();
    }
  
    protected onComputeId(): string {
      return "TypingDelayIndicator";
    }
  }
