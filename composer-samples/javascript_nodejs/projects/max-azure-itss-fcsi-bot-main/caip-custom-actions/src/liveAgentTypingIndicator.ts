import {
  Expression,
  StringExpression,
  StringExpressionConverter,
} from "adaptive-expressions";
import { ActivityTypes, TurnContext } from "botbuilder";

import {
  Converter,
  ConverterFactory,
  Dialog,
  DialogConfiguration,
  DialogContext,
  DialogTurnResult,
} from "botbuilder-dialogs";

export interface LiveAgentTypingIndicatorConfiguration
  extends DialogConfiguration {
  typingEvent: number | Expression | StringExpression;
}

export class LiveAgentTypingIndicatorDialog
  extends Dialog
  implements LiveAgentTypingIndicatorConfiguration
{
  public static $kind = "LiveAgentTypingIndicator";

  public typingEvent: StringExpression = new StringExpression("start");
  public startTyping: boolean = false;
  public sendingTyping: boolean = false;
  public getConverter(
    property: keyof LiveAgentTypingIndicatorConfiguration
  ): Converter | ConverterFactory {
    if (property === "typingEvent") {
      return new StringExpressionConverter();
    }
    return super.getConverter(property);
  }

  public async beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
    const typingEvent = this.typingEvent.getValue(dc.state);
    if (typingEvent === "Start") {
      this.startTyping = true;
    } else {
      this.startTyping = false;
    }

    if (this.startTyping && !this.sendingTyping) {
      try {
        const settings = dc.parent?.state.getValue("settings");
        const delay = process.env.LIVE_AGENT_TYPING_DELAY || 4000;
        const maxTypingDuration =
          process.env.LIVE_AGENT_TYPING_MAX_DURATION || 30000;
        const convRef = TurnContext.getConversationReference(
          dc.context.activity
        );
        var startTime = Date.now();
        await dc.context.adapter.continueConversationAsync(
          settings?.MicrosoftAppId,
          convRef,
          dc.context.turnState.get(dc.context.adapter?.OAuthScopeKey),
          async (context) => {
            do {
              this.sendingTyping = true;
              await context.sendActivities([
                { type: ActivityTypes.Typing },
                { type: "delay", value: delay },
              ]);
            } while (
              this.startTyping &&
              Date.now() - startTime < maxTypingDuration
            );
            this.sendingTyping = false;
          }
        );
      } catch (error: any) {
        console.log(
          `Error in Send Typing Indicator: Message: ${error?.message} Stack: ${error?.stack}`
        );
      }
    }
    return dc.endDialog();
  }

  protected onComputeId(): string {
    return "TypingtypingEventIndicator";
  }
}
