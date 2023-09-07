import {
    StringExpression,
    StringExpressionConverter,
    ObjectExpressionConverter,
    ObjectExpression
  } from "adaptive-expressions";
import { expect } from "chai";
import * as sinon from "sinon";
import { DialogContext } from "botbuilder-dialogs";
import "mocha";
import { LivePersonStructureElements } from "../src/livePersonStructureElements";

describe("Live Person Button List", () => {
    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
      });
    afterEach(() => {
    sandbox.restore();
    });

    it("should return a structure content for live person", () => {
        const dialog = new LivePersonStructureElements();
        expect(dialog.id).equals("LivePersonStructureElements");

        const dataToStructure = dialog.getConverter("dataToStructure");
        const result = dialog.getConverter("result");
        const undefConvert = dialog.getConverter("id");
        expect(dataToStructure).instanceOf(ObjectExpressionConverter);
        expect(result).instanceOf(StringExpressionConverter);
        expect(undefConvert).to.be.undefined;

        const config = [{"title":"AUSTEDO TAB 6MG 367838633, ordered 04/14/23 ","type":"button","click":{"actions":[{"type":"publishText","text":"AUSTEDO TAB 6MG 367838633, ordered 04/14/23 "}],"metadata":[{"type":"ExternalId","id":"573796207-1"}]}},{"title":"IMATINIB MES TAB 400MG 367838426, ordered 04/06/23 ","type":"button","click":{"actions":[{"type":"publishText","text":"IMATINIB MES TAB 400MG 367838426, ordered 04/06/23 "}],"metadata":[{"type":"ExternalId","id":"573793366-1"}]}},{"title":"DIOVAN TAB 40MG 367848656, ordered 04/12/23 ","type":"button","click":{"actions":[{"type":"publishText","text":"DIOVAN TAB 40MG 367848656, ordered 04/12/23 "}],"metadata":[{"type":"ExternalId","id":"573794083-1"}]}},{"title":"DUPIXENT PFS 300MG/2ML 367838414, ordered 04/06/23 ","type":"button","click":{"actions":[{"type":"publishText","text":"DUPIXENT PFS 300MG/2ML 367838414, ordered 04/06/23 "}],"metadata":[{"type":"ExternalId","id":"573793361-1"}]}},{"title":"Show more orders","type":"button","click":{"actions":[{"type":"publishText","text":"Show more orders"}],"metadata":[{"type":"ExternalId","id":"Show more orders"}]}}];        

        dialog.dataToStructure = new ObjectExpression(config);
        dialog.result = new StringExpression("dialog.res");
        const endDialogFake = sandbox.fake();
        const setValueFake = sandbox.fake();
        const dc = ({
        endDialog: endDialogFake,
        state: {
            setValue: setValueFake,
        },
        } as unknown) as DialogContext;

        // const livePersonStructureButtonList = dialog.livePersonStructuredButtonListContent(config);

        dialog.beginDialog(dc);
        // sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, livePersonStructureButtonList);
        sinon.assert.calledOnce(endDialogFake);
    });

    it("should return error when dataToStructure is missing", () => {
        const dialog = new LivePersonStructureElements();
        expect(dialog.id).equals("LivePersonStructureElements");

        const dataToStructure = dialog.getConverter("dataToStructure");
        const result = dialog.getConverter("result");
        const undefConvert = dialog.getConverter("id");
        expect(dataToStructure).instanceOf(ObjectExpressionConverter);
        expect(result).instanceOf(StringExpressionConverter);
        expect(undefConvert).to.be.undefined;       

        dialog.dataToStructure = undefined;
        dialog.result = new StringExpression("dialog.res");
        const endDialogFake = sandbox.fake();
        const setValueFake = sandbox.fake();
        const dc = ({
        endDialog: endDialogFake,
        state: {
            setValue: setValueFake,
        },
        } as unknown) as DialogContext;

        // dialog.livePersonStructuredButtonListContent("");

        dialog.beginDialog(dc).then((res) => {
            sinon.assert.callCount(setValueFake,0);
            sinon.assert.calledOnce(endDialogFake);
        });;
    });

});