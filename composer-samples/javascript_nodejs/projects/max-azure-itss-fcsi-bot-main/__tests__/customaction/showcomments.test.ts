import {
	StringExpression,
	StringExpressionConverter,
	ObjectExpression,
	ObjectExpressionConverter,
} from "adaptive-expressions";
import { expect } from "chai";
import sinon, { SinonStub } from "sinon";
import "mocha";
import { ShowComments } from "../../customaction/src/showComments";
import { DialogContext } from "botbuilder-dialogs";

describe("Show comments", async () => {
	let sandbox: sinon.SinonSandbox;
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	afterEach(() => {
		sandbox.restore();
	});

	it("should end dialog if fails to convert", async () => {
		const dialog = new ShowComments();
		expect(dialog.id).equals("ShowComments");

		const commentsconvert = dialog.getConverter("comments");
		const resultPropertyconvert = dialog.getConverter("resultProperty");
		const undefConvert = dialog.getConverter("id");

		expect(commentsconvert).instanceOf(StringExpressionConverter);
		expect(resultPropertyconvert).instanceOf(StringExpressionConverter);
		expect(undefConvert).to.be.undefined;

		dialog.comments = new StringExpression(
			"05/05/2022 03:07:23 - RAVI RAUSHAN (Additional comments) I'm currently working on a ServiceNow integration project, and one of the requirements is that the external system (which in this case is NetSuite) needs to be able both add and retrieve the comments and work notes that are associated with an incident.\n\n They're listed in the Activities area of the form. (Note that there is an additional audit-related entry that lists the field changes.)\n\n05/05/2022 01:48:50 - RAVI RAUSHAN (Additional comments) user visible notes one\n\n05/04/2022 10:07:19 - CAIP ITSS MAX Integration (Additional comments) this is something wrong\n\n"
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
		sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, [
			[
				"05/05/2022 03:07:23",
				"RAVI RAUSHAN",
				" I'm currently working on a ServiceNow integration project, and one of the requirements is that the external system (which in this case is NetSuite) needs to be able both add and retrieve the comments and work notes that are associated with an incident.",
			],
			["05/05/2022 01:48:50", "RAVI RAUSHAN", " user visible notes one"],
			[
				"05/04/2022 10:07:19",
				"CAIP ITSS MAX Integration",
				" this is something wrong",
			],
		]);
		sinon.assert.calledOnce(endDialogFake);
	});
});
