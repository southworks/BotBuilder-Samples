import {
	StringExpression,
	StringExpressionConverter,
} from "adaptive-expressions";
import { expect } from "chai";
import sinon, { SinonStub } from "sinon";
import "mocha";
import { ConvertCSTtoUTC } from "../../customaction/src/convertCSTtoUTC";
import { DialogContext } from "botbuilder-dialogs";

describe("convert CST to UTC", async () => {
	let sandbox: sinon.SinonSandbox;
	let clock: sinon.SinonFakeTimers;
	beforeEach(() => {
		sandbox = sinon.createSandbox();
	});
	afterEach(() => {
		sandbox.restore();
		clock.restore();
	});

	it("should end dialog if fails to convert morning CST time to UTC", async () => {
		clock = sinon.useFakeTimers({
			now: new Date("2023-03-21T07:42:10.037Z"),
			// shouldAdvanceTime: true,
			toFake: ["Date"],
		});
		const dialog = new ConvertCSTtoUTC();
		expect(dialog.id).equals("convertCSTtoUTC");

		const resultPropertyconvert = dialog.getConverter("resultProperty");
		const undefConvert = dialog.getConverter("id");

		expect(resultPropertyconvert).instanceOf(StringExpressionConverter);
		expect(undefConvert).to.be.undefined;

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
		sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, '2023-03-21T02:42:10');
		sinon.assert.calledOnce(endDialogFake);
	});
	it("should end dialog if fails to convert evening CST time to UTC", async () => {
		clock = sinon.useFakeTimers({
			now: new Date("2023-03-21T22:42:10.037Z"),
			// shouldAdvanceTime: true,
			toFake: ["Date"],
		});
		const dialog = new ConvertCSTtoUTC();
		expect(dialog.id).equals("convertCSTtoUTC");

		const resultPropertyconvert = dialog.getConverter("resultProperty");
		const undefConvert = dialog.getConverter("id");

		expect(resultPropertyconvert).instanceOf(StringExpressionConverter);
		expect(undefConvert).to.be.undefined;

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
		sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, '2023-03-21T17:42:10');
		sinon.assert.calledOnce(endDialogFake);
	});
	it("should end dialog if fails to convert without DST", async () => {
		clock = sinon.useFakeTimers({
			now: new Date("2023-11-08T22:15:40.037Z"),
			// shouldAdvanceTime: true,
			toFake: ["Date"],
		});
		const dialog = new ConvertCSTtoUTC();
		expect(dialog.id).equals("convertCSTtoUTC");

		const resultPropertyconvert = dialog.getConverter("resultProperty");
		const undefConvert = dialog.getConverter("id");

		expect(resultPropertyconvert).instanceOf(StringExpressionConverter);
		expect(undefConvert).to.be.undefined;

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
		sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, '2023-11-08T16:15:40');
		sinon.assert.calledOnce(endDialogFake);
	});
	it("should end dialog if fails to convert 12 PM CST time to UTC", async () => {
		clock = sinon.useFakeTimers({
			now: new Date("2023-03-30T17:07:08.326Z"),
			toFake: ["Date"],
		});
		const dialog = new ConvertCSTtoUTC();
		expect(dialog.id).equals("convertCSTtoUTC");

		const resultPropertyconvert = dialog.getConverter("resultProperty");
		const undefConvert = dialog.getConverter("id");

		expect(resultPropertyconvert).instanceOf(StringExpressionConverter);
		expect(undefConvert).to.be.undefined;

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
		sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, '2023-03-30T12:07:08');
		sinon.assert.calledOnce(endDialogFake);
	});
	it("should end dialog if fails to convert 12 AM CST time to UTC", async () => {
		clock = sinon.useFakeTimers({
			now: new Date("2023-03-30T05:07:08.326Z"),
			toFake: ["Date"],
		});
		const dialog = new ConvertCSTtoUTC();
		expect(dialog.id).equals("convertCSTtoUTC");

		const resultPropertyconvert = dialog.getConverter("resultProperty");
		const undefConvert = dialog.getConverter("id");

		expect(resultPropertyconvert).instanceOf(StringExpressionConverter);
		expect(undefConvert).to.be.undefined;

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
		sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, '2023-03-30T00:07:08');
		sinon.assert.calledOnce(endDialogFake);
	});
	it("should end dialog if fails to date change when converting CST time to UTC", async () => {
		clock = sinon.useFakeTimers({
			now: new Date("2023-03-30T03:07:08.326Z"),
			toFake: ["Date"],
		});
		const dialog = new ConvertCSTtoUTC();
		expect(dialog.id).equals("convertCSTtoUTC");

		const resultPropertyconvert = dialog.getConverter("resultProperty");
		const undefConvert = dialog.getConverter("id");

		expect(resultPropertyconvert).instanceOf(StringExpressionConverter);
		expect(undefConvert).to.be.undefined;

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
		sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, '2023-03-29T22:07:08');
		sinon.assert.calledOnce(endDialogFake);
	});
});
