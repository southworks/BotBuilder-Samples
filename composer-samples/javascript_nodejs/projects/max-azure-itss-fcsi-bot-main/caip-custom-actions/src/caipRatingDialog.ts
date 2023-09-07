

import {
    Expression,
    ObjectExpression,
    ObjectExpressionConverter,
    StringExpression,
    StringExpressionConverter
  } from "adaptive-expressions";

  import { CAIPRatingComponent } from '@advanceddevelopment/caip-bot-core';
  
  import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
  } from "botbuilder-dialogs";
  
  export interface CAIPRatingDialogConfiguration extends DialogConfiguration {
    ratingConfig: object | Expression | ObjectExpression<{}>;
    ratingAdaptiveJSON?: string | Expression | StringExpression;
  }
  
  export class CAIPRatingDialog
    extends Dialog
    implements CAIPRatingDialogConfiguration {
    public static $kind = "CAIPRatingDialog";
  
    public ratingConfig: ObjectExpression<{}> = new ObjectExpression({});
    public ratingAdaptiveJSON?: StringExpression;
  
    public getConverter(
      property: keyof CAIPRatingDialogConfiguration
    ): Converter | ConverterFactory {
        switch (property) {
          case "ratingConfig":
            return new ObjectExpressionConverter();
          case "ratingAdaptiveJSON":
            return new StringExpressionConverter();
          default:
            return super.getConverter(property);
        }
    }
  
    public async beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
      const ratingConfig: any = this.ratingConfig.getValue(dc.state);
      const ratingJson: any = CAIPRatingComponent.generate(ratingConfig);
      if (this.ratingAdaptiveJSON) {
        dc.state.setValue(this.ratingAdaptiveJSON.getValue(dc.state), ratingJson);
      }

      return dc.endDialog(ratingJson);
    }
  
    protected onComputeId(): string {
      return "CAIPRatingDialog";
    }
  }
