import {
  NumberExpression,
  NumberExpressionConverter,
  StringExpression,
  StringExpressionConverter,
} from "adaptive-expressions";
import { expect } from "chai";
import * as sinon from "sinon";
import "mocha";
import { MultiplyDialog } from "../src/multiplyDialog";
import { DialogContext } from "botbuilder-dialogs";

describe("Multiply Dialog", () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it("should return the correct multiplication", () => {
    const dialog = new MultiplyDialog();
    expect(dialog.id).equals("MultiplyDialog");

    const n1Convert = dialog.getConverter("arg1");
    const n2Convert = dialog.getConverter("arg2");
    const resConvert = dialog.getConverter("resultProperty");
    const undefConvert = dialog.getConverter("id");
    expect(n1Convert).instanceOf(NumberExpressionConverter);
    expect(n2Convert).instanceOf(NumberExpressionConverter);
    expect(resConvert).instanceOf(StringExpressionConverter);
    expect(undefConvert).to.be.undefined;

    dialog.arg1 = new NumberExpression(2);
    dialog.arg2 = new NumberExpression(3);
    dialog.resultProperty = new StringExpression("dialog.res");
    const endDialogFake = sandbox.fake();
    const setValueFake = sandbox.fake();
    const dc = ({
      endDialog: endDialogFake,
      state: {
        setValue: setValueFake,
      },
    } as unknown) as DialogContext;
    dialog.beginDialog(dc);
    sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, 6);
    sinon.assert.calledOnce(endDialogFake);
  });
});
