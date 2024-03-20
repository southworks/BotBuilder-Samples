import {
  StringExpression,
  StringExpressionConverter,
} from "adaptive-expressions";
import { expect } from "chai";
import * as sinon from "sinon";
import "mocha";
import { GetAzureTableDataDialog } from "../src/getAzureTableData";
import { DialogContext, DialogSet, DialogTurnResult, DialogTurnStatus } from "botbuilder-dialogs";
import { TableClient } from "@azure/data-tables";
import { TurnContext } from "botbuilder";

describe("GetAzureTableDataDialog", () => {
  let sandbox: sinon.SinonSandbox;
  let tableStub = sinon.createStubInstance(TableClient);
  let tcstub = sinon.createStubInstance(TurnContext);
  let dsstub = sinon.createStubInstance(DialogSet);

  let res = [{"etag":"W/\"datetime'2023-05-23T12%3A23%3A46.2123014Z'\"","partitionKey":"UserStory","rowKey":"US15","timestamp":"2023-05-23T12:23:46.2123014Z","Title":"Adding Middleware Service","EstimatedHours":"40"}];
  let success_result = {
    "status": "success",
    "data":[{"etag":"W/\"datetime'2023-05-23T12%3A23%3A46.2123014Z'\"","partitionKey":"UserStory","rowKey":"US15","timestamp":"2023-05-23T12:23:46.2123014Z","Title":"Adding Middleware Service","EstimatedHours":"40"}]
  };
  let error_result = {
    "status": "failure",
    "data": "Please provide Account Name, Key, Table Name and Query to fetch data"
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox
    .stub(GetAzureTableDataDialog.prototype, <any>"getTableClient")
    .returns(tableStub); 

    sandbox
    .stub(GetAzureTableDataDialog.prototype, <any>"getTableEntities")
    .returns(res);
    
  });
  afterEach(() => {
    sandbox.restore();
  });

  it("should return data from Azure Table", async () => {

    const dialog = new GetAzureTableDataDialog(); 
    dialog.accountName = new StringExpression("sampleAccountName");
    dialog.key = new StringExpression("sampleKey");
    dialog.tableName = new StringExpression("sampleTable");
    dialog.tableQuery = new StringExpression("sampleQuery");
    dialog.resultProperty = new StringExpression("dialog.result");
  
    const endDialogFake = sandbox.fake();
    const setValueFake = sandbox.fake();

    const dc = ({
      endDialog: endDialogFake,
      context: tcstub,
      dialogs: dsstub,
      state: {
        setValue: setValueFake
      },
    } as unknown) as DialogContext;

    await dialog.beginDialog(dc);
    sandbox.assert.calledWith(endDialogFake, success_result);

  });

  it("should return Error message for missing values", async () => {

    const dialog = new GetAzureTableDataDialog(); 
    dialog.accountName = new StringExpression();
    dialog.key = new StringExpression("sampleKey");
    dialog.tableName = new StringExpression("sampleTable");
    dialog.tableQuery = new StringExpression("sampleQuery");
    dialog.resultProperty = new StringExpression("dialog.result");
  
    const endDialogFake = sandbox.fake();
    const setValueFake = sandbox.fake();

    const dc = ({
      endDialog: endDialogFake,
      context: tcstub,
      dialogs: dsstub,
      state: {
        setValue: setValueFake
      },
    } as unknown) as DialogContext;

    await dialog.beginDialog(dc);
    sandbox.assert.calledWith(endDialogFake, error_result);

  });

});

describe("Creating TableClient Instance and align with it sub functions", () => {
  let sandbox: sinon.SinonSandbox;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });
 
  it("should create table client instance", async () => {
    const dialog = new GetAzureTableDataDialog(); 
    const tb_client =dialog.getTableClient("","",""); 
    dialog.getTableEntities(tb_client,null);

  });
});

describe("getConverter", () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it("should return promise", () => {
    
    const dialog = new GetAzureTableDataDialog();
    expect(dialog.id).equals("Optum.GetAzureTableDataDialog");

    const accountName = dialog.getConverter("accountName");
    const key = dialog.getConverter("key");
    const tableName = dialog.getConverter("tableName");
    const tableQuery = dialog.getConverter("tableQuery");
    const resConvert = dialog.getConverter("resultProperty");
  
    expect(accountName).instanceOf(StringExpressionConverter);
    expect(key).instanceOf(StringExpressionConverter);
    expect(tableName).instanceOf(StringExpressionConverter);
    expect(tableQuery).instanceOf(StringExpressionConverter);    
    expect(resConvert).instanceOf(StringExpressionConverter);
    
  });
});



