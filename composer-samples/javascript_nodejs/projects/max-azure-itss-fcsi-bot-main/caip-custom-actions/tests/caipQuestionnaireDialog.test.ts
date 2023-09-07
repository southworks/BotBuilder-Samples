import {
  StringExpression,
  StringExpressionConverter,
  ObjectExpressionConverter,
  ObjectExpression,
  NumberExpressionConverter,
  NumberExpression,
} from "adaptive-expressions";
import { expect } from "chai";
import * as sinon from "sinon";
import "mocha";
import { DialogContext } from "botbuilder-dialogs";
import { CAIPQuestionnaireDialog } from '../src/caipQuestionnaireDialog';
import { CAIPQuestionnaireComponent } from '@advanceddevelopment/caip-bot-core';

describe("CAIP Questionnaire Dialog", () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });

  const config = {
    "questionnaire": [
      {
        "title": "What advice would you give us?",
        "range": {
          "start": 1,
          "end": 3
        },
        "options": [
          {
            "title": "choice1",
            "value": "choice1"
          },
          {
            "title": "choice2",
            "value": "choice2"
          },
          {
            "title": "choice3",
            "value": "choice3"
          },
          {
            "title": "choice4",
            "value": "choice4"
          }
        ]
      },
      {
        "title": "What worked well for you?",
        "range": {
          "start": 4,
          "end": 5
        },
        "options": [
          {
            "title": "choice5",
            "value": "choice5"
          },
          {
            "title": "choice6",
            "value": "choice6"
          }
        ]
      }
    ]
  };

  it("should return the correct CAIP Questionnaire JSON with Rating", () => {
    const dialog = new CAIPQuestionnaireDialog();
    expect(dialog.id).equals("CAIPQuestionnaireDialog");

    const rating = dialog.getConverter("rating");
    const questionnaireConfig = dialog.getConverter("questionnaireConfig");
    const questionnaireAdaptiveJSON = dialog.getConverter("questionnaireAdaptiveJSON");
    const undefConvert = dialog.getConverter("id");
    expect(rating).instanceOf(NumberExpressionConverter);
    expect(questionnaireConfig).instanceOf(ObjectExpressionConverter);
    expect(questionnaireAdaptiveJSON).instanceOf(StringExpressionConverter);
    expect(undefConvert).to.be.undefined;

    const ratingConfig = 5;

    dialog.questionnaireConfig = new ObjectExpression(config);
    const questionnaireJSON = CAIPQuestionnaireComponent.generate(ratingConfig, config);
    dialog.rating = new NumberExpression(ratingConfig);
    dialog.questionnaireAdaptiveJSON = new StringExpression("");
    const endDialogFake = sandbox.fake();
    const setValueFake = sandbox.fake();
    const dc = ({
      endDialog: endDialogFake,
      state: {
        setValue: setValueFake,
      },
    } as unknown) as DialogContext;
    dialog.beginDialog(dc);
    sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, questionnaireJSON);
    sinon.assert.calledOnce(endDialogFake);
  });

  it("should return the correct CAIP Questionnaire JSON without Rating", () => {
    const dialog = new CAIPQuestionnaireDialog();
    expect(dialog.id).equals("CAIPQuestionnaireDialog");

    const rating = dialog.getConverter("rating");
    const questionnaireConfig = dialog.getConverter("questionnaireConfig");
    const questionnaireAdaptiveJSON = dialog.getConverter("questionnaireAdaptiveJSON");
    const undefConvert = dialog.getConverter("id");
    expect(rating).instanceOf(NumberExpressionConverter);
    expect(questionnaireConfig).instanceOf(ObjectExpressionConverter);
    expect(questionnaireAdaptiveJSON).instanceOf(StringExpressionConverter);
    expect(undefConvert).to.be.undefined;

    const ratingConfig = -1;

    dialog.questionnaireConfig = new ObjectExpression(config);
    const questionnaireJSON = CAIPQuestionnaireComponent.generate(ratingConfig, config);
    dialog.rating = new NumberExpression(ratingConfig);
    dialog.questionnaireAdaptiveJSON = new StringExpression("");
    const endDialogFake = sandbox.fake();
    const setValueFake = sandbox.fake();
    const dc = ({
      endDialog: endDialogFake,
      state: {
        setValue: setValueFake,
      },
    } as unknown) as DialogContext;
    dialog.beginDialog(dc);
    sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, questionnaireJSON);
    sinon.assert.calledOnce(endDialogFake);
  });

  it("should return the correct CAIP Questionnaire JSON without Single questionnaire without Rating", () => {
    const dialog = new CAIPQuestionnaireDialog();
    expect(dialog.id).equals("CAIPQuestionnaireDialog");

    const rating = dialog.getConverter("rating");
    const questionnaireConfig = dialog.getConverter("questionnaireConfig");
    const questionnaireAdaptiveJSON = dialog.getConverter("questionnaireAdaptiveJSON");
    const undefConvert = dialog.getConverter("id");
    expect(rating).instanceOf(NumberExpressionConverter);
    expect(questionnaireConfig).instanceOf(ObjectExpressionConverter);
    expect(questionnaireAdaptiveJSON).instanceOf(StringExpressionConverter);
    expect(undefConvert).to.be.undefined;

    const ratingConfig = -1;

    config.questionnaire.pop();

    dialog.questionnaireConfig = new ObjectExpression(config);
    const questionnaireJSON = CAIPQuestionnaireComponent.generate(ratingConfig, config);
    dialog.rating = new NumberExpression(ratingConfig);
    dialog.questionnaireAdaptiveJSON = new StringExpression("");
    const endDialogFake = sandbox.fake();
    const setValueFake = sandbox.fake();
    const dc = ({
      endDialog: endDialogFake,
      state: {
        setValue: setValueFake,
      },
    } as unknown) as DialogContext;
    dialog.beginDialog(dc);
    sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, questionnaireJSON);
    sinon.assert.calledOnce(endDialogFake);
  });
});
