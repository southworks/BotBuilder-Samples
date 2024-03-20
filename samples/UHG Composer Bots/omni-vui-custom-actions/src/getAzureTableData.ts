import {
  Expression,
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

import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';

export interface AzureStorageDialogConfiguration extends DialogConfiguration {
  accountName: string | Expression | StringExpression;
  key: string | Expression | StringExpression;
  tableName: string | Expression | StringExpression;
  tableQuery: string | Expression | StringExpression;
  resultProperty?: string | Expression | StringExpression;

}

export class GetAzureTableDataDialog
  extends Dialog
  implements AzureStorageDialogConfiguration {
  public static $kind = "Optum.GetAzureTableDataDialog";

  public accountName: StringExpression = new StringExpression("accountName");
  public key: StringExpression = new StringExpression("key");
  public tableName: StringExpression = new StringExpression("tableName");
  public tableQuery: StringExpression = new StringExpression("tableQuery");
  public resultProperty?: StringExpression;

  public getConverter(
    property: keyof AzureStorageDialogConfiguration
  ): Converter | ConverterFactory {

    switch (property) {
      case "accountName":
        return new StringExpressionConverter();
      case "key":
        return new StringExpressionConverter();
      case "tableName":
        return new StringExpressionConverter();
      case "tableQuery":
        return new StringExpressionConverter();
      case "resultProperty":
        return new StringExpressionConverter();
      default:
        return super.getConverter(property);
    }
  }

  public async beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
    let result: any; let finalresult: any;
    const accountname = this.accountName.getValue(dc.state);
    const accountkey = this.key.getValue(dc.state);
    const tablename = this.tableName.getValue(dc.state);
    const tableQuery = this.tableQuery.getValue(dc.state);

    try {
      if (accountname == undefined || accountkey == undefined || tablename == undefined || tableQuery == undefined) {
        throw new Error(
          "Please provide Account Name, Key, Table Name and Query to fetch data"
        );
      }
      const credential = new AzureNamedKeyCredential(accountname, accountkey);
      const tableClient = this.getTableClient(credential, tablename, accountname);

      const listEntitiesOptions = {
        queryOptions: { filter: tableQuery },
      };

      result = await this.getTableEntities(tableClient, listEntitiesOptions);

      finalresult = { "status": "success", "data": result };
      const resTelemetryVal = {
        "name": "Omni_Azure_Table_Output_Peg", properties: {
          "Response": finalresult,
          "customMetrics": [{
            "Response": finalresult
          }]
        }
      }
      this.telemetryClient.trackEvent(resTelemetryVal);

    }
    catch (e: any) {
      finalresult = { "status": "failure", "data": e.message };
      const resTelemetryVal = {
        "name": "Omni_Azure_Table_Error_Peg", properties: {
          "Response": finalresult,
          "customMetrics": [{
            "Response": finalresult
          }]
        }
      }
      this.telemetryClient.trackEvent(resTelemetryVal);
    }

    if (this.resultProperty) {
      dc.state.setValue(this.resultProperty.getValue(dc.state), finalresult);
    }

    return dc.endDialog(finalresult);
  }

  public getTableClient(credential: any, tablename: string, accountname: string) {

    const tableClient = new TableClient(
      `https://${accountname}.table.core.windows.net`,
      tablename,
      credential
    );

    return tableClient;
  }

  public async getTableEntities(tableClient: TableClient, listEntitiesOptions: any) {

    const listentities = tableClient.listEntities(listEntitiesOptions);
    const entities = [];

    for await (let entity of listentities) {
      entities.push(entity);
    }

    return entities;
  }

  protected onComputeId(): string {
    return "Optum.GetAzureTableDataDialog";
  }
}
