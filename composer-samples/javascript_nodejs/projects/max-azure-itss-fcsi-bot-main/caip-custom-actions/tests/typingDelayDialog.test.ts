import {
  NumberExpression,
  NumberExpressionConverter,
} from "adaptive-expressions";
import { expect } from "chai";
import * as sinon from "sinon";
import "mocha";
import { TypingDelayDialog } from "../src/typingDelayDialog";
import { DialogContext } from "botbuilder-dialogs";
import {
  ActivityTypes,
  CloudAdapterBase,
  ConversationReference,
  TurnContext,
} from "botbuilder";
import {
  ClaimsIdentity,
  BotFrameworkAuthenticationFactory,
} from "botframework-connector";
class TestAdapter extends CloudAdapterBase {
  async continueConversationAsync(
    botAppIdOrClaimsIdentity: string | ClaimsIdentity,
    reference: Partial<ConversationReference>,
    logicOrAudience: string | ((context: TurnContext) => Promise<void>),
    maybeLogic: (context: any) => Promise<void>
  ): Promise<void> {
    return Promise.resolve();
  }
}
describe("Typing and Delay Indicator", () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it("should return the typing and delay indicators", async () => {

    const authentication = BotFrameworkAuthenticationFactory.create();
    const adapter = new TestAdapter(authentication);
    const dialog = new TypingDelayDialog();
    expect(dialog.id).equals("TypingDelayIndicator");

    const delayConvert = dialog.getConverter("delay");
    const undefConvert = dialog.getConverter("id");
    expect(delayConvert).instanceOf(NumberExpressionConverter);
    expect(undefConvert).to.be.undefined;

    dialog.delay = new NumberExpression(1000);

    const endDialogFake = sandbox.fake();
    const setValueFake = sandbox.fake();
    const setActivitiesFake = sandbox.fake();

    const dc = {
      endDialog: endDialogFake,
      state: {
        setValue: setValueFake,
      },
      context: {
        sendActivities: setActivitiesFake,
        activity: sandbox.fake(),
        adapter: adapter,
        turnState: {
          get: sandbox.fake(),
        },
      },
      parent: {
        state: {
          getValue: sandbox.fake(),
        },
      },
    } as unknown as DialogContext;

    sinon
      .stub(adapter, "continueConversationAsync")
      .callsFake(function (
        botAppIdOrClaimsIdentity: string | ClaimsIdentity,
        reference: Partial<ConversationReference>,
        logicOrAudience: string | ((context: TurnContext) => Promise<void>),
        maybeLogic: (context: any) => Promise<void>
      ): Promise<void> {
        maybeLogic(dc.context);
        return Promise.resolve();
      });
    await dialog.beginDialog(dc);

    sinon.assert.calledOnceWithExactly(setActivitiesFake, [
      { type: "typing" },
      { type: "delay", value: 1000 },
    ]);
    sinon.assert.calledOnce(endDialogFake);
  });
});
