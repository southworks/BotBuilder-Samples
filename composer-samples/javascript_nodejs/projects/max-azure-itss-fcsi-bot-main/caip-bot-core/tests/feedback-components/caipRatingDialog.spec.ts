import { assert } from "chai";
import "mocha";
import { CAIPRatingComponent, CAIPRatingType } from '../../src/feedback-components/ratingComponent';

const Mocha = require('mocha');

const mocha = new Mocha({ ui: 'bdd' });

describe("CAIP Rating Dialog", () => {

  [
    {
      "config": {
        "type": CAIPRatingType.RATING_NUMBER,
        "title": "This is title",
        "range": {
          "start": 1,
          "end": 2
        }
      },
      "expectedResult": {
        columnSetLength: 2,
        ratingType: "number"
      }
    },
    {
      "config": {
        "type": CAIPRatingType.RATING_STAR,
        "title": "This is title",
        "range": {
          "start": 1,
          "end": 5
        }
      },
      "expectedResult": {
        columnSetLength: 5,
        ratingType: "star"
      }
    },
    {
      "config": {
        "type": CAIPRatingType.RATING_NUMBER,
        "title": "This is title",
        "range": {
          "start": 0,
          "end": 10
        }
      },
      "expectedResult": {
        columnSetLength: 6,
        ratingType: "number"
      }
    }
  ].forEach((test: any) => {
    it(`should return the correct CAIP Rating JSON for ${test.config.type}`, () => {
      const ratingJSON = JSON.parse(CAIPRatingComponent.generate(test.config));
      assert.equal(ratingJSON.body[0].columns[0].items[0].type, "TextBlock")
      assert.equal(ratingJSON.body[0].columns[0].items[1].type, "ColumnSet")
      assert.equal(ratingJSON.body[0].columns[0].items[1].columns.length, test.expectedResult.columnSetLength);
      assert.isTrue(ratingJSON.body[0].columns[0].items[1].columns[0].items[0].url.includes(test.expectedResult.ratingType));
    });
  });

});
