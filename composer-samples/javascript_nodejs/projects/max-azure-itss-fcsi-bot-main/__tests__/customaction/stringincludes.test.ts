import {
	StringExpression,
	StringExpressionConverter,
	ObjectExpression,
	ObjectExpressionConverter,
} from "adaptive-expressions";
import { expect } from "chai";
import sinon, { SinonStub } from "sinon";
import "mocha";
import { StringIncludes } from "../../customaction/src/stringIncludes";
import { DialogContext } from "botbuilder-dialogs";

describe("String Includes", async () => {
	let sandbox: sinon.SinonSandbox;
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	afterEach(() => {
		sandbox.restore();
	});

	it("should end dialog if fails to check if the string exists in user utterance", async () => {
		const dialog = new StringIncludes();
		expect(dialog.id).equals("StringIncludes");

		const sentenceConvert = dialog.getConverter("sentence");
		const wordConvert = dialog.getConverter("word");
		const resultPropertyconvert = dialog.getConverter("resultProperty");
		const undefConvert = dialog.getConverter("id");

		expect(sentenceConvert).instanceOf(StringExpressionConverter);
		expect(wordConvert).instanceOf(StringExpressionConverter);
		expect(resultPropertyconvert).instanceOf(StringExpressionConverter);
		expect(undefConvert).to.be.undefined;

		dialog.sentence = new StringExpression("i am having problem with pass word");
		dialog.word = new StringExpression("password");

		dialog.resultProperty = new StringExpression("false");

		const setValueFake = sinon.fake();
		const endDialogFake = sinon.fake();

		const dc = {
			state: {
				setValue: setValueFake,
			},
			endDialog: endDialogFake,
		} as unknown as DialogContext;

		await dialog.beginDialog(dc);
		sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, false);
		sinon.assert.calledOnce(endDialogFake);
	});

	it("should return true if the keyword exists in the utterance", async () => {
		const dialog = new StringIncludes();
		expect(dialog.id).equals("StringIncludes");

		const sentenceConvert = dialog.getConverter("sentence");
		const wordConvert = dialog.getConverter("word");
		const resultPropertyconvert = dialog.getConverter("resultProperty");
		const undefConvert = dialog.getConverter("id");

		expect(sentenceConvert).instanceOf(StringExpressionConverter);
		expect(wordConvert).instanceOf(StringExpressionConverter);
		expect(resultPropertyconvert).instanceOf(StringExpressionConverter);
		expect(undefConvert).to.be.undefined;

		dialog.sentence = new StringExpression("Not able to access the following url https://securidssp.uhc.com/");
		dialog.word = new StringExpression("https://securidssp.uhc.com/");

		dialog.resultProperty = new StringExpression("true");

		const setValueFake = sinon.fake();
		const endDialogFake = sinon.fake();

		const dc = {
			state: {
				setValue: setValueFake,
			},
			endDialog: endDialogFake,
		} as unknown as DialogContext;

		await dialog.beginDialog(dc);
		sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, true);
		sinon.assert.calledOnce(endDialogFake);
	});

	it("should return false if the keyword does not exists in the utterance", async () => {
		const dialog = new StringIncludes();
		expect(dialog.id).equals("StringIncludes");

		const sentenceConvert = dialog.getConverter("sentence");
		const wordConvert = dialog.getConverter("word");
		const resultPropertyconvert = dialog.getConverter("resultProperty");
		const undefConvert = dialog.getConverter("id");

		expect(sentenceConvert).instanceOf(StringExpressionConverter);
		expect(wordConvert).instanceOf(StringExpressionConverter);
		expect(resultPropertyconvert).instanceOf(StringExpressionConverter);
		expect(undefConvert).to.be.undefined;

		dialog.sentence = new StringExpression("iphone is not working with soft token");
		dialog.word = new StringExpression("iphone soft token");

		dialog.resultProperty = new StringExpression("false");

		const setValueFake = sinon.fake();
		const endDialogFake = sinon.fake();

		const dc = {
			state: {
				setValue: setValueFake,
			},
			endDialog: endDialogFake,
		} as unknown as DialogContext;

		await dialog.beginDialog(dc);
		sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, false);
		sinon.assert.calledOnce(endDialogFake);
	});
});