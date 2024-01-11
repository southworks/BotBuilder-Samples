import {
  OmniTraceActivity,
  LogType

} from "../src/omniTraceActivity";
import { DialogContext } from "botbuilder-dialogs";
import { expect } from "chai";
import * as sinon from "sinon";
import "mocha";
import {
  BoolExpression,
  BoolExpressionConverter,
  EnumExpression,
  EnumExpressionConverter,
  ValueExpression,
  ValueExpressionConverter,
  ObjectExpression,
  ObjectExpressionConverter,
  StringExpression,
  StringExpressionConverter,
  } from "adaptive-expressions";

describe("Omni Trace Activity", () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
     });
  afterEach(() => {
    sandbox.restore();
  });
  
  context("Encrypted Log", () => {
    it("should encrypt the values", () => {
      const value = "secret message";
      const ekey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";
      const name = "testName";
      const valueType ="testValueType";
      const label = "testLabel";
      const env = "PROD"
      const logType = LogType.encrypted;
      const dialog = new OmniTraceActivity(ekey, env,name,valueType,value, label, logType);
      expect(dialog.id).equals("OmniTraceActivity");
      const messageConvert = dialog.getConverter("value");
      const logTypeConvert = dialog.getConverter("logType");
      const nameConvert = dialog.getConverter("name");
      const labelConvert = dialog.getConverter("label");
      const valueTypeConvert = dialog.getConverter("valueType");
      const valueConvert = dialog.getConverter("value");
      const disableConvert = dialog.getConverter("disabled");
      const undefConvert = dialog.getConverter("id");
      expect(messageConvert).instanceOf(ValueExpressionConverter);
      expect(logTypeConvert).instanceOf(EnumExpressionConverter);
      expect(disableConvert).instanceOf(BoolExpressionConverter);
      expect(nameConvert).instanceOf(StringExpressionConverter);
      expect(labelConvert).instanceOf(StringExpressionConverter);
      expect(valueTypeConvert).instanceOf(StringExpressionConverter);
      expect(valueConvert).instanceOf(ValueExpressionConverter);
      expect(undefConvert).to.be.undefined;
      const setValueFake = sandbox.fake();
     dialog.value = new ValueExpression("secret message");
      const endDialogFake = sandbox.fake();
      const dc = ({
        endDialog: endDialogFake,
      } as unknown) as DialogContext;
      dialog.beginDialog(dc);
      sinon.assert.neverCalledWith(endDialogFake);
     
    });

  });
  
  context("Plain text Log", () => {
    it("should NOT encrypt the values", () => {
      const value = "secret message";
      const ekey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";
      const name = "testName";
      const valueType ="testValueType";
      const label = "testLabel";
      const env = "PROD"
      const logType = LogType.plaintext;
      const dialog = new OmniTraceActivity(ekey, env,name,valueType,value, label, logType);
      expect(dialog.id).equals("OmniTraceActivity");
      const messageConvert = dialog.getConverter("value");
      const logTypeConvert = dialog.getConverter("logType");
      const nameConvert = dialog.getConverter("name");
      const labelConvert = dialog.getConverter("label");
      const valueTypeConvert = dialog.getConverter("valueType");
      const valueConvert = dialog.getConverter("value");
      const disableConvert = dialog.getConverter("disabled");
      const undefConvert = dialog.getConverter("id");
      expect(messageConvert).instanceOf(ValueExpressionConverter);
      expect(logTypeConvert).instanceOf(EnumExpressionConverter);
      expect(disableConvert).instanceOf(BoolExpressionConverter);
      expect(nameConvert).instanceOf(StringExpressionConverter);
      expect(labelConvert).instanceOf(StringExpressionConverter);
      expect(valueTypeConvert).instanceOf(StringExpressionConverter);
      expect(valueConvert).instanceOf(ValueExpressionConverter);
      expect(undefConvert).to.be.undefined;
      const setValueFake = sandbox.fake();
      dialog.value = new ValueExpression("secret message");
      const endDialogFake = sandbox.fake();
      const dc = ({
        endDialog: endDialogFake,
      } as unknown) as DialogContext;
      dialog.beginDialog(dc);
      sinon.assert.neverCalledWith(endDialogFake);
     
    });
  });
  context("No Encryption Key", () => {
    it("should log in plain text", () => {
      const value = "secret message";
      const ekey = " ";
      const name = "testName";
      const valueType ="testValueType";
      const label = "testLabel";
      const env = "PROD"
      const logType = LogType.encrypted;
      const dialog = new OmniTraceActivity(ekey, env,name,valueType,value, label, logType);
      expect(dialog.id).equals("OmniTraceActivity");
      const messageConvert = dialog.getConverter("value");
      const logTypeConvert = dialog.getConverter("logType");
      const nameConvert = dialog.getConverter("name");
      const labelConvert = dialog.getConverter("label");
      const valueTypeConvert = dialog.getConverter("valueType");
      const valueConvert = dialog.getConverter("value");
      const disableConvert = dialog.getConverter("disabled");
      const undefConvert = dialog.getConverter("id");
      expect(messageConvert).instanceOf(ValueExpressionConverter);
      expect(logTypeConvert).instanceOf(EnumExpressionConverter);
      expect(disableConvert).instanceOf(BoolExpressionConverter);
      expect(nameConvert).instanceOf(StringExpressionConverter);
      expect(labelConvert).instanceOf(StringExpressionConverter);
      expect(valueTypeConvert).instanceOf(StringExpressionConverter);
      expect(valueConvert).instanceOf(ValueExpressionConverter);
      expect(undefConvert).to.be.undefined;
      const setValueFake = sandbox.fake();
      dialog.value = new ValueExpression("secret message");
      const endDialogFake = sandbox.fake();
      const dc = ({
        endDialog: endDialogFake,
      } as unknown) as DialogContext;
      dialog.beginDialog(dc);
      sinon.assert.neverCalledWith(endDialogFake);
     
    });

  });

});
