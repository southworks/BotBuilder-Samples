
import {
    Expression,
    ObjectExpression,
    ObjectExpressionConverter,
    StringExpression,
    StringExpressionConverter,
    NumberExpression,
    NumberExpressionConverter
  } from "adaptive-expressions";

  import { CAIPQuestionnaireComponent } from '@advanceddevelopment/caip-bot-core';
  
  import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
  } from "botbuilder-dialogs";

  export interface CAIPQuestionnaireDialogConfiguration extends DialogConfiguration {
    rating: number | Expression | NumberExpression;
    questionnaireConfig: object | Expression | ObjectExpression<{}>;
    questionnaireAdaptiveJSON?: string | Expression | StringExpression;
  }
  
  export class CAIPQuestionnaireDialog
    extends Dialog
    implements CAIPQuestionnaireDialogConfiguration {
    public static $kind = "CAIPQuestionnaireDialog";
  
  
    public rating: NumberExpression = new NumberExpression(0);
    public questionnaireConfig: ObjectExpression<{}> = new ObjectExpression({});
    public questionnaireAdaptiveJSON?: StringExpression;
  
    public getConverter(
      property: keyof CAIPQuestionnaireDialogConfiguration
    ): Converter | ConverterFactory {
        switch (property) {
          case "rating":
            return new NumberExpressionConverter();
          case "questionnaireConfig":
            return new ObjectExpressionConverter();
          case "questionnaireAdaptiveJSON":
            return new StringExpressionConverter();
          default:
            return super.getConverter(property);
        }
    }
  
    public async beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
      const rating: number = this.rating.getValue(dc.state);
      const questionnaireConfig: any = this.questionnaireConfig.getValue(dc.state);
      const questionnaireJSON: any = CAIPQuestionnaireComponent.generate(rating, questionnaireConfig);
      if (this.questionnaireAdaptiveJSON) {
        dc.state.setValue(this.questionnaireAdaptiveJSON.getValue(dc.state), questionnaireJSON);
      }
      return dc.endDialog(questionnaireJSON);
    }
  
    protected onComputeId(): string {
      return "CAIPQuestionnaireDialog";
    }
  }
