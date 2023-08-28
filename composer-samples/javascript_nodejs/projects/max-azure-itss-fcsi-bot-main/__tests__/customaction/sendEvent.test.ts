import {
  StringExpression,
  StringExpressionConverter,
} from "adaptive-expressions";
import { expect } from "chai";
import "mocha";
import { SendEvent } from "../../customaction/src/sendEvent";

describe("Send Event", async () => {
  it("should end dialog if fails to convert", async () => {
    const dialog = new SendEvent();
    expect(dialog.id).equals("SendEvent");

    const input = dialog.getConverter("input");
    const undefConvert = dialog.getConverter("id");

    expect(input).instanceOf(StringExpressionConverter);
    expect(undefConvert).to.be.undefined;

    dialog.input = new StringExpression("Enable");
  });
});
