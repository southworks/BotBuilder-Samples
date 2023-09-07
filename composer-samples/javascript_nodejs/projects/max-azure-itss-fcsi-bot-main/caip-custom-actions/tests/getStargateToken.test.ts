import { GetStargateToken } from "../src/getStargateToken";
import {
  StringExpression,
  StringExpressionConverter,
} from "adaptive-expressions";
import { DialogContext } from "botbuilder-dialogs";
import "mocha";
import { expect } from "chai";
import * as sinon from "sinon";
import * as JWT from "jsonwebtoken";

describe("Get Stargate Token", () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it("should return jwt token", () => {
    const dialog = new GetStargateToken();
    expect(dialog.id).equals("GetStargateToken");

    const keyConvert = dialog.getConverter("key");
    const secretConvert = dialog.getConverter("secret");
    const resConvert = dialog.getConverter("resultProperty");
    const undefConvert = dialog.getConverter("id");
    expect(keyConvert).instanceOf(StringExpressionConverter);
    expect(secretConvert).instanceOf(StringExpressionConverter);
    expect(resConvert).instanceOf(StringExpressionConverter);
    expect(undefConvert).to.be.undefined;

    dialog.key = new StringExpression("stargateKey");
    dialog.secret = new StringExpression("stargateSecret");
    dialog.resultProperty = new StringExpression("dialog.res");
    const endDialogFake = sandbox.fake();
    const setValueFake = sandbox.fake();
    const dc = {
      endDialog: endDialogFake,
      state: {
        setValue: setValueFake,
      },
    } as unknown as DialogContext;

    const nowTime = Math.floor(Date.now() / 1000);
    sandbox
      .stub(GetStargateToken.prototype, <any>"currentTime")
      .returns(nowTime);
    const payload = {
      iat: nowTime,
      exp: nowTime + 30,
      iss: "stargateKey",
    };
    const signingOptions = {
      algorithm: "HS256",
    };
    const result = JWT.sign(payload, "stargateSecret", { algorithm: "HS256" });

    dialog.beginDialog(dc);
    sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, result);
    sinon.assert.calledOnce(endDialogFake);
  });
});
