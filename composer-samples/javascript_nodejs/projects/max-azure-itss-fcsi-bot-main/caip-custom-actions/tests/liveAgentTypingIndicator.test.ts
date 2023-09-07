import { expect } from "chai";
import * as sinon from "sinon";
import "mocha";
import { LiveAgentTypingIndicatorDialog } from "../src/liveAgentTypingIndicator";
import { DialogContext } from "botbuilder-dialogs";
import {
  StringExpression,
  StringExpressionConverter,
} from "adaptive-expressions";
import {
  ClaimsIdentity,
  BotFrameworkAuthenticationFactory,
} from "botframework-connector";
import {
  ActivityTypes,
  CloudAdapterBase,
  ConversationReference,
  TurnContext,
} from "botbuilder";
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
describe("liveAgentTypingIndicatorr", () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it("should return the typing and delay activities until stop event recieved", async () => {
    const authentication = BotFrameworkAuthenticationFactory.create();
    const adapter = new TestAdapter(authentication);
    const dialog = new LiveAgentTypingIndicatorDialog();
    expect(dialog.id).equals("TypingtypingEventIndicator");

    const typingEventConvert = dialog.getConverter("typingEvent");
    const undefConvert = dialog.getConverter("id");
    expect(typingEventConvert).instanceOf(StringExpressionConverter);
    expect(undefConvert).to.be.undefined;

    dialog.typingEvent = new StringExpression("Start");

    const endDialogFake = sandbox.fake();
    const setValueFake = sandbox.fake();
    const sendActivitiesFake = sandbox.stub().callsFake(async function () {
      await new Promise((resolve) => setTimeout(resolve, 4000));
    });
    const dc = {
      endDialog: endDialogFake,
      state: {
        setValue: setValueFake,
      },
      context: {
        sendActivities: sendActivitiesFake,
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
    dialog.beginDialog(dc);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    sinon.assert.calledOnce(endDialogFake);
    sinon.assert.calledThrice(sendActivitiesFake);
    dialog.typingEvent = new StringExpression("stop");
    dialog.beginDialog(dc);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    sinon.assert.calledTwice(endDialogFake);
    sinon.assert.calledThrice(sendActivitiesFake);
  }).timeout(30000);

  it("should return the typing and delay activities until max typing duration if stop typing not recieved", async () => {
    const authentication = BotFrameworkAuthenticationFactory.create();
    const adapter = new TestAdapter(authentication);
    const dialog = new LiveAgentTypingIndicatorDialog();
    expect(dialog.id).equals("TypingtypingEventIndicator");

    const typingEventConvert = dialog.getConverter("typingEvent");
    const undefConvert = dialog.getConverter("id");
    expect(typingEventConvert).instanceOf(StringExpressionConverter);
    expect(undefConvert).to.be.undefined;

    dialog.typingEvent = new StringExpression("Start");

    const endDialogFake = sandbox.fake();
    const setValueFake = sandbox.fake();
    const sendActivitiesFake = sandbox.stub().callsFake(async function () {
      await new Promise((resolve) => setTimeout(resolve, 4000));
    });
    const sendActivitiesSpy = sinon.spy(sendActivitiesFake);
    const dc = {
      endDialog: endDialogFake,
      state: {
        setValue: setValueFake,
      },
      context: {
        sendActivities: sendActivitiesSpy,
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
    dialog.beginDialog(dc);
    await new Promise((resolve) => setTimeout(resolve, 35000));
    sinon.assert.calledOnce(endDialogFake);
    expect(sendActivitiesSpy.callCount).equal(8);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    expect(sendActivitiesSpy.callCount).equal(8);
    sinon.assert.calledOnce(endDialogFake);
  }).timeout(50000);

  it("should return the typing and delay activities if multiple start and stop occurs until stop event recieved", async () => {
    const authentication = BotFrameworkAuthenticationFactory.create();
    const adapter = new TestAdapter(authentication);
    const dialog = new LiveAgentTypingIndicatorDialog();
    expect(dialog.id).equals("TypingtypingEventIndicator");

    const typingEventConvert = dialog.getConverter("typingEvent");
    const undefConvert = dialog.getConverter("id");
    expect(typingEventConvert).instanceOf(StringExpressionConverter);
    expect(undefConvert).to.be.undefined;

    dialog.typingEvent = new StringExpression("Start");

    const endDialogFake = sandbox.fake();
    const setValueFake = sandbox.fake();
    const sendActivitiesFake = sandbox.stub().callsFake(async function () {
      await new Promise((resolve) => setTimeout(resolve, 4000));
    });
    const dc = {
      endDialog: endDialogFake,
      state: {
        setValue: setValueFake,
      },
      context: {
        sendActivities: sendActivitiesFake,
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
    dialog.beginDialog(dc);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    sinon.assert.calledOnce(endDialogFake);
    dialog.typingEvent = new StringExpression("Start");
    dialog.beginDialog(dc);
    dialog.typingEvent = new StringExpression("Start");
    dialog.beginDialog(dc);
    sinon.assert.calledThrice(endDialogFake);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    dialog.typingEvent = new StringExpression("stop");
    dialog.beginDialog(dc);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    sinon.assert.calledTwice(sendActivitiesFake);
    await new Promise((resolve) => setTimeout(resolve, 4000));
    dialog.typingEvent = new StringExpression("Start");
    dialog.beginDialog(dc);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    dialog.typingEvent = new StringExpression("stop");
    dialog.beginDialog(dc);
    sinon.assert.calledThrice(sendActivitiesFake);
  }).timeout(30000);
});
