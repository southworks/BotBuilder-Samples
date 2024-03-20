import {
  OmniSensitiveData,
  LogType
} from "../src/omniSensitiveData";
import { DialogContext } from "botbuilder-dialogs";
import { expect } from "chai";
import * as sinon from "sinon";
import "mocha";
import {
  BoolExpression,
  BoolExpressionConverter,
  EnumExpression,
  EnumExpressionConverter,
  } from "adaptive-expressions";

describe("Sensitive Data Handling", () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
     });
  afterEach(() => {
    sandbox.restore();
  });
  
  context("TTS Cache", () => {
    it("should be set according to the input", () => {
      const logType = LogType.YES;
      const dialog = new OmniSensitiveData(logType);
      expect(dialog.id).equals("SensitiveData");
      const logTypeConvert = dialog.getConverter("logType");
      const disableConvert = dialog.getConverter("disabled");
      const undefConvert = dialog.getConverter("id");
      expect(logTypeConvert).instanceOf(EnumExpressionConverter);
      expect(disableConvert).instanceOf(BoolExpressionConverter);
      expect(undefConvert).to.be.undefined;
      const setValueFake = sandbox.fake();
      dialog.logType = new EnumExpression(LogType.YES);
      const endDialogFake = sandbox.fake();
      const dc = ({
        endDialog: endDialogFake,
      } as unknown) as DialogContext;
      dialog.beginDialog(dc);
      sinon.assert.neverCalledWith(endDialogFake);
     
    });

  });
  
  context("SysLog", () => {
    it("should be set according to the input", () => {
      const logType = LogType.NO;
      const dialog = new OmniSensitiveData(logType);
      expect(dialog.id).equals("SensitiveData");
      const logTypeConvert = dialog.getConverter("logType");
      const disableConvert = dialog.getConverter("disabled");
      const undefConvert = dialog.getConverter("id");
      expect(logTypeConvert).instanceOf(EnumExpressionConverter);
      expect(disableConvert).instanceOf(BoolExpressionConverter);
      expect(undefConvert).to.be.undefined;
      const setValueFake = sandbox.fake();
      dialog.logType = new EnumExpression(LogType.NO);
      const endDialogFake = sandbox.fake();
      const dc = ({
        endDialog: endDialogFake,
      } as unknown) as DialogContext;
      dialog.beginDialog(dc);
    sinon.assert.neverCalledWith(endDialogFake);
    
    });
  });

  context("Disabled", () => {
    it("Ends the dialog", () => {
      const logType = LogType.NO;
      const dialog = new OmniSensitiveData(logType);
      expect(dialog.id).equals("SensitiveData");
      const logTypeConvert = dialog.getConverter("logType");
      const disableConvert = dialog.getConverter("disabled");
      const undefConvert = dialog.getConverter("id");
      expect(logTypeConvert).instanceOf(EnumExpressionConverter);
      expect(disableConvert).instanceOf(BoolExpressionConverter);
      expect(undefConvert).to.be.undefined;
      const setValueFake = sandbox.fake();
      dialog.logType = new EnumExpression(LogType.NO);
      dialog.disabled = new BoolExpression(false);
      const endDialogFake = sandbox.fake();
      const dc = ({
        endDialog: endDialogFake,
      } as unknown) as DialogContext;
      dialog.beginDialog(dc);
    sinon.assert.neverCalledWith(endDialogFake);
    
    });
  });
  
});
