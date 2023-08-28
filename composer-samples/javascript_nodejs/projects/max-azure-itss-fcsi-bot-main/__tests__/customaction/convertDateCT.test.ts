import {
	StringExpression,
	StringExpressionConverter,
} from "adaptive-expressions";
import { expect } from "chai";
import sinon, { SinonStub } from "sinon";
import "mocha";
import { ConvertDateCT } from "../../customaction/src/convertDateCT";
import { DialogContext } from "botbuilder-dialogs";

describe("convert Date in CT", async () => {
	let sandbox: sinon.SinonSandbox;
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	afterEach(() => {
		sandbox.restore();
	});

	it("should end dialog if fails to convert", async () => {
		const dialog = new ConvertDateCT();
		expect(dialog.id).equals("ConvertDateCT");

		const dateconvert = dialog.getConverter("date");
		const resultPropertyconvert = dialog.getConverter("resultProperty");
		const undefConvert = dialog.getConverter("id");

		expect(dateconvert).instanceOf(StringExpressionConverter);
		expect(resultPropertyconvert).instanceOf(StringExpressionConverter);
		expect(undefConvert).to.be.undefined;

		dialog.date = new StringExpression(
			'01/18/2022 04:15:00'
		);

		dialog.resultProperty = new StringExpression("dialog.res");

		const setValueFake = sinon.fake();
		const endDialogFake = sinon.fake();

		const dc = {
			state: {
				setValue: setValueFake,
			},
			endDialog: endDialogFake,
		} as unknown as DialogContext;

		await dialog.beginDialog(dc);
		sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, 'Jan 18, 2022  04:15 AM');
		sinon.assert.calledOnce(endDialogFake);
	});
});
