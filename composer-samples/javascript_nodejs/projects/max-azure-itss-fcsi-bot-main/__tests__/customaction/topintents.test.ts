import {
    StringExpression,
    StringExpressionConverter,
    ObjectExpression,
    ObjectExpressionConverter,
} from "adaptive-expressions";
import { expect } from "chai";
import sinon, { SinonStub } from "sinon";
import "mocha";
import { TopThreeIntents } from "../../customaction/src/topThreeIntents";
import { DialogContext } from "botbuilder-dialogs";

describe("Top Three Intents", async () => {

    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });


    it("should end dialog if fails to convert", async () => {
      const dialog = new TopThreeIntents;
      expect(dialog.id).equals("TopThreeIntents");

      const intentsconvert= dialog.getConverter("intents");
      const resultPropertyconvert = dialog.getConverter("resultProperty");
      const undefConvert = dialog.getConverter("id");
      

      expect(intentsconvert).instanceOf(ObjectExpressionConverter);
      expect(resultPropertyconvert).instanceOf(StringExpressionConverter);
      expect(undefConvert).to.be.undefined;


      dialog.intents = new ObjectExpression({
            'Slow or No Response': { score: 0.14142075 },
            'Computer or Desktop or Laptop Slow': { score: 0.062018085 },
            'DeferToRecognizer_QnA_itss-fcsi-bot': { score: 0.061290365 },
            'Login issue': { score: 0.055140395 },
            'Application Issue': { score: 0.04487593 },
            'Multifactor Authentication Issue': { score: 0.035563648 },
            'Audio or Headset issue': { score: 0.03349712 },
            'Application Install or uninstall issue': { score: 0.023322232 },
            'Cancel a secure request': { score: 0.018967532 },
            'Submit bulk request': { score: 0.018482596 },
            'App or Charts Configuration Issue': { score: 0.017875249 },
            'Troubleshoot MS Domain Password Issues': { score: 0.014007936 },
            'Course Error Issue': { score: 0.010792983 },
            'Global Address List /(GAL/) Related Issue': { score: 0.009943217 },
            'Mail Archive Access Issue': { score: 0.00983299 },
            'Course Video Issue': { score: 0.009235496 },
            'Call Connectivity/Drop Issue': { score: 0.008623087 },
            'Unable to join/schedule meetings issue': { score: 0.008579694 },
            'Video Issue': { score: 0.008558251 }
        });

          dialog.resultProperty = new StringExpression('dialog.res');

          const setValueFake = sinon.fake();
          const endDialogFake = sinon.fake();

          const dc = ({
                state: {
                    setValue: setValueFake,
                },
                endDialog: endDialogFake
          } as unknown) as DialogContext;
          
          await dialog.beginDialog(dc);
          sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, [
            [ 'Slow or No Response', '0.14142075' ],
            [ 'Computer or Desktop or Laptop Slow', '0.062018085' ],
            [ 'DeferToRecognizer_QnA_itss-fcsi-bot', '0.061290365' ],
			['Login issue', '0.055140395' ],
			['Application Issue', '0.04487593' ],
			['Multifactor Authentication Issue', '0.035563648' ],
			['Audio or Headset issue', '0.03349712' ],
			['Application Install or uninstall issue', '0.023322232' ],
			['Cancel a secure request', '0.018967532' ],
			['Submit bulk request', '0.018482596' ],
			['App or Charts Configuration Issue', '0.017875249' ],
			['Troubleshoot MS Domain Password Issues', '0.014007936' ],
			['Course Error Issue', '0.010792983' ],
			['Global Address List /(GAL/) Related Issue', '0.009943217' ],
			['Mail Archive Access Issue', '0.00983299' ],
			
          ]);
          sinon.assert.calledOnce(endDialogFake);
    });
});