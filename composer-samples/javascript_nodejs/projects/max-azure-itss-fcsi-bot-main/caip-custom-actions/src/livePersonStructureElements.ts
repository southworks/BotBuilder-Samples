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


export interface LivePersonStructureElementsConfiguration extends DialogConfiguration {
  dataToStructure?: object | Expression | ObjectExpression<{}>;
  result?: string | Expression | StringExpression;
}
/**
 * Custom command makes request to a stargate endpoint.
 */
export class LivePersonStructureElements
  extends Dialog
  implements LivePersonStructureElementsConfiguration
{
  public static $kind = "LivePersonStructureElements";

  public dataToStructure?: ObjectExpression<{}> = new ObjectExpression({});
  public result?: StringExpression;

  public getConverter(
    property: keyof LivePersonStructureElementsConfiguration
  ): Converter | ConverterFactory {
    switch (property) {
      case "dataToStructure":
        return new ObjectExpressionConverter();
      case "result":
        return new StringExpressionConverter();
      default:
        return super.getConverter(property);
    }
  }
  
  public async beginDialog(
    dc: DialogContext,
  ): Promise<DialogTurnResult> {
    try {
      const rawDataToStructure = this.dataToStructure?.getValue(dc.state);
      if (!rawDataToStructure) {
        throw new Error('missing data to structure');
      }

      const finalStructure = this.structureLivePersonContent(rawDataToStructure);

      if (this.result) {
        dc.state.setValue(this.result.getValue(dc.state), finalStructure);
      }

      return dc.endDialog(this.result);
    } catch (error: any) {
      this.telemetryClient.trackException({ exception: error });
      throw new Error(`Error Structuring Data : ${error.message}`);
    }
  }

  private structureLivePersonContent(elements: any): any {
    const structure = 
    {
      "structuredContent": {
        "type": "vertical",
        "elements": elements
      }
    };
    return structure;
  }

  protected onComputeId(): string {
    return "LivePersonStructureElements";
  }
}
