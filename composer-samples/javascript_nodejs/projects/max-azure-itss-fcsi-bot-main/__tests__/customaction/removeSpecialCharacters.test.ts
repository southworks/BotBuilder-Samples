  import {
    Expression,
    StringExpression,
    StringExpressionConverter,
} from "adaptive-expressions";
import { Assertion, expect } from "chai";
import * as sinon from "sinon";
import "mocha";
import { RemoveSpecialCharacters } from "../../customaction/src/removeSpecialCharacters";
import { DialogContext } from "botbuilder-dialogs";
  
  describe("Remove special characters from the user utterance", () => {
    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });
    afterEach(() => {
      sandbox.restore();
    });

  
    it("should remove the special charecters from the provided utterance", () => {
      const dialog = new RemoveSpecialCharacters();
      expect(dialog.id).equals("RemoveSpecialCharacters");
  
      const userIssueConvert = dialog.getConverter("userIssue");
      const resConvert = dialog.getConverter("resultProperty");
      const undefConvert = dialog.getConverter("id");
      expect(userIssueConvert).instanceOf(StringExpressionConverter);
      expect(resConvert).instanceOf(StringExpressionConverter);
      expect(undefConvert).to.be.undefined;

        dialog.userIssue = new StringExpression("Network íssûes fácing in lócâl maçhînè Every/[`~!@alternate#$%^day&*_|regularly+\=?;,<from>\{\}\[\]\\\/]\”one week");
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
      sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, 'Network issues facing in local machine Every      alternate    day    regularly      from         one week');
      sinon.assert.calledOnce(endDialogFake);
    });
  });