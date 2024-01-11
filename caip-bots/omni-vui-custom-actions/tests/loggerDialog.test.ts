import {
  LoggerDialog,
  LogType

} from "../src/loggerDialog";
import { DialogContext } from "botbuilder-dialogs";
import { expect } from "chai";
import * as sinon from "sinon";
import "mocha";
import {
  BoolExpression,
  BoolExpressionConverter,
  EnumExpression,
  EnumExpressionConverter,
  ObjectExpression,
  ObjectExpressionConverter,
  StringExpression,
  StringExpressionConverter,
} from "adaptive-expressions";

describe("Logger Dialog", () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
     });
  afterEach(() => {
    sandbox.restore();
  });
  
  context("Encrypted Log", () => {
    it("should encrypt the values", () => {
      const message = "secret message";
      const ekey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";
      const env = "PROD"
      const logType = LogType.encrypted;
      const dialog = new LoggerDialog(message, ekey, env, logType);
      expect(dialog.id).equals("LoggerDialog");
      const messageConvert = dialog.getConverter("message");
      const logTypeConvert = dialog.getConverter("logType");
      const undefConvert = dialog.getConverter("id");
      expect(messageConvert).instanceOf(StringExpressionConverter);
      expect(logTypeConvert).instanceOf(EnumExpressionConverter);
      expect(undefConvert).to.be.undefined;
      const setValueFake = sandbox.fake();
      dialog.message = new StringExpression("secret message");
      const endDialogFake = sandbox.fake();
      const dc = ({
        endDialog: endDialogFake,
      } as unknown) as DialogContext;
      dialog.beginDialog(dc);
      sinon.assert.calledOnce(endDialogFake);
     
    });

  });
  
  context("Plain text Log", () => {
    it("should NOT encrypt the values", () => {
      const message = "secret message";
      const ekey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";
      const env = "stage"
      const logType = LogType.encrypted;
      const dialog = new LoggerDialog(message, ekey, env, logType);
      expect(dialog.id).equals("LoggerDialog");
      const messageConvert = dialog.getConverter("message");
      const logTypeConvert = dialog.getConverter("logType");
      const undefConvert = dialog.getConverter("id");
      expect(messageConvert).instanceOf(StringExpressionConverter);
      expect(logTypeConvert).instanceOf(EnumExpressionConverter);
      expect(undefConvert).to.be.undefined;
      const setValueFake = sandbox.fake();
      dialog.message = new StringExpression("secret message");
      const endDialogFake = sandbox.fake();
      const dc = ({
        endDialog: endDialogFake,
      } as unknown) as DialogContext;
      dialog.beginDialog(dc);
      sinon.assert.calledOnce(endDialogFake);
     
    });
  });
  context("No Encryption Key", () => {
    it("should log in plain text", () => {
      const message = "secret message";
      const ekey = " ";
      const env = "PROD"
      const logType = LogType.encrypted;
      const dialog = new LoggerDialog(message, ekey, env, logType);
      expect(dialog.id).equals("LoggerDialog");
      const messageConvert = dialog.getConverter("message");
      const logTypeConvert = dialog.getConverter("logType");
      const undefConvert = dialog.getConverter("id");
      expect(messageConvert).instanceOf(StringExpressionConverter);
      expect(logTypeConvert).instanceOf(EnumExpressionConverter);
      expect(undefConvert).to.be.undefined;
      const setValueFake = sandbox.fake();
      dialog.message = new StringExpression("secret message");
      const endDialogFake = sandbox.fake();
      const dc = ({
        endDialog: endDialogFake,
      } as unknown) as DialogContext;
      dialog.beginDialog(dc);
      sinon.assert.calledOnce(endDialogFake);
     
    });

  });

});
