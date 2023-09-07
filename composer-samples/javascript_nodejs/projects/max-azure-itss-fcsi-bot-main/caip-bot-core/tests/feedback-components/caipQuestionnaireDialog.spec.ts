
import { assert } from 'chai';
// import "mocha";

import { CAIPQuestionnaireComponent } from "../../src/feedback-components"


const Mocha = require('mocha');

const mocha = new Mocha({ ui: 'bdd' });

describe("CAIP Questionnaire Component", () => {
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

  it("should return the correct CAIP Questionnaire JSON with Rating as 5", () => {
    const rating = 5;
    const questionnaireJSON = CAIPQuestionnaireComponent.generate(rating, config);
    const expectedResult = `{"$schema": "http://adaptivecards.io/schemas/adaptive-card.json","id":"caipQuestionnaireComponent","type": "AdaptiveCard","version": "1.3","body": [{"type": "TextBlock","text": "What worked well for you?","weight": "Bolder","size": "Medium","wrap": true},{"type": "Input.ChoiceSet","id": "options", "wrap":true, "label" : "Options:","isMultiSelect": true,"isRequired" : true,"errorMessage": "Please select at least one option.","choices": [{"title":"choice5","value":"choice5"},{"title":"choice6","value":"choice6"}]},{"type": "Input.Text","label": "Additional Comments","isMultiline": true,"id": "comments"}],"actions": [{"type": "Action.Submit","title": "Submit Feedback"}]}`
    assert.equal(expectedResult, questionnaireJSON);
  });

  it("should return the correct CAIP Questionnaire JSON with Rating as 2", () => {
    const rating = 2;
    const questionnaireJSON = CAIPQuestionnaireComponent.generate(rating, config);
    const expectedResult = `{"$schema": "http://adaptivecards.io/schemas/adaptive-card.json","id":"caipQuestionnaireComponent","type": "AdaptiveCard","version": "1.3","body": [{"type": "TextBlock","text": "What advice would you give us?","weight": "Bolder","size": "Medium","wrap": true},{"type": "Input.ChoiceSet","id": "options", "wrap":true, "label" : "Options:","isMultiSelect": true,"isRequired" : true,"errorMessage": "Please select at least one option.","choices": [{"title":"choice1","value":"choice1"},{"title":"choice2","value":"choice2"},{"title":"choice3","value":"choice3"},{"title":"choice4","value":"choice4"}]},{"type": "Input.Text","label": "Additional Comments","isMultiline": true,"id": "comments"}],"actions": [{"type": "Action.Submit","title": "Submit Feedback"}]}`
    assert.equal(expectedResult, questionnaireJSON);
  });

  it("should return the correct CAIP Questionnaire JSON without Rating", () => {
    let rating: number;
    const questionnaireJSON = CAIPQuestionnaireComponent.generate(rating, config);
    const expectedResult = `{"$schema": "http://adaptivecards.io/schemas/adaptive-card.json","id":"caipQuestionnaireComponent","type": "AdaptiveCard","version": "1.3","body": [{"type": "TextBlock","text": "What advice would you give us?","weight": "Bolder","size": "Medium","wrap": true},{"type": "Input.ChoiceSet","id": "options", "wrap":true, "label" : "Options:","isMultiSelect": true,"isRequired" : true,"errorMessage": "Please select at least one option.","choices": [{"title":"choice1","value":"choice1"},{"title":"choice2","value":"choice2"},{"title":"choice3","value":"choice3"},{"title":"choice4","value":"choice4"}]},{"type": "Input.Text","label": "Additional Comments","isMultiline": true,"id": "comments"}],"actions": [{"type": "Action.Submit","title": "Submit Feedback"}]}`
    assert.equal(expectedResult, questionnaireJSON);
  });

  it("should return the correct CAIP Questionnaire JSON without Single questionnaire without Rating", () => {
    let rating: number;
    config.questionnaire.pop();
    const questionnaireJSON = CAIPQuestionnaireComponent.generate(rating, config);
    const expectedResult = `{"$schema": "http://adaptivecards.io/schemas/adaptive-card.json","id":"caipQuestionnaireComponent","type": "AdaptiveCard","version": "1.3","body": [{"type": "TextBlock","text": "What advice would you give us?","weight": "Bolder","size": "Medium","wrap": true},{"type": "Input.ChoiceSet","id": "options", "wrap":true, "label" : "Options:","isMultiSelect": true,"isRequired" : true,"errorMessage": "Please select at least one option.","choices": [{"title":"choice1","value":"choice1"},{"title":"choice2","value":"choice2"},{"title":"choice3","value":"choice3"},{"title":"choice4","value":"choice4"}]},{"type": "Input.Text","label": "Additional Comments","isMultiline": true,"id": "comments"}],"actions": [{"type": "Action.Submit","title": "Submit Feedback"}]}`
    assert.equal(expectedResult, questionnaireJSON);
  });
});
