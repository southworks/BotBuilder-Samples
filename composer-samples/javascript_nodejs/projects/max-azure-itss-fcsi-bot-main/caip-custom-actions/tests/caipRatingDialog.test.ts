import {
  NumberExpression,
  NumberExpressionConverter,
  StringExpression,
  StringExpressionConverter,
  ObjectExpressionConverter,
  ObjectExpression,
} from "adaptive-expressions";
import { expect } from "chai";
import * as sinon from "sinon";
import "mocha";
import { DialogContext } from "botbuilder-dialogs";
import { CAIPRatingDialog } from '../src/caipRatingDialog';
import { CAIPRatingConfig,  CAIPRatingComponent} from '@advanceddevelopment/caip-bot-core';

describe("CAIP Rating Dialog", () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });

  [{
    "type": "RATING_NUMBER",
    "title": "This is title",
    "range": {
      "start": 1,
      "end": 2
    }
  },
  {
    "type": "RATING_STAR",
    "title": "This is title",
    "range": {
      "start": 1,
      "end": 5
    }
  }
  ].forEach((config: CAIPRatingConfig) => {
    it(`should return the correct CAIP Rating JSON for ${config.type}`, () => {
    const dialog = new CAIPRatingDialog();
    expect(dialog.id).equals("CAIPRatingDialog");

    let ratingConfig = dialog.getConverter("ratingConfig");
    const ratingAdaptiveJSON = dialog.getConverter("ratingAdaptiveJSON");
    const undefConvert = dialog.getConverter("id");
    expect(ratingConfig).instanceOf(ObjectExpressionConverter);
    expect(ratingAdaptiveJSON).instanceOf(StringExpressionConverter);
    expect(undefConvert).to.be.undefined;

    dialog.ratingConfig = new ObjectExpression(config);
    const ratingJSON = CAIPRatingComponent.generate(config);
    dialog.ratingAdaptiveJSON = new StringExpression("");
    const endDialogFake = sandbox.fake();
    const setValueFake = sandbox.fake();
    const dc = ({
      endDialog: endDialogFake,
      state: {
        setValue: setValueFake,
      },
    } as unknown) as DialogContext;
    dialog.beginDialog(dc);
    sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, ratingJSON);
    sinon.assert.calledOnce(endDialogFake);
  });
});

});
