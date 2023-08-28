import {
    Expression,
    StringExpression,
    StringExpressionConverter,
} from "adaptive-expressions";
import { expect } from "chai";
import sinon, { SinonStub } from "sinon";
import "mocha";
import { SendAttachment } from "../../customaction/src/sendAttachment";
import { DialogContext } from "botbuilder-dialogs";

describe("Send Attachment", async () => {
    let dialog: SendAttachment;
    let getUploadedDataStub: SinonStub;
    let postAttachmentStub: SinonStub;
    beforeEach(() => {
        getUploadedDataStub = sinon.stub(SendAttachment.prototype, "getUploadedData")
        postAttachmentStub = sinon.stub(SendAttachment.prototype, "postAttachment")
        dialog = new SendAttachment();

        // dialog.url = new StringExpression("");
        // dialog.authKey = new StringExpression("");
        // dialog.attachmentType = new StringExpression("");
        // dialog.attachmentUrl = new StringExpression("");
        // dialog.resultProperty = new StringExpression("");
    });
    afterEach(() => {
        getUploadedDataStub.restore();
        postAttachmentStub.restore();
    });


    it("should end dialog if fails to captured uploaded data", async () => {
        const urlconvert= dialog.getConverter("url");
      const authKeyconvert = dialog.getConverter("authKey");
      const attachmentTypeconvert = dialog.getConverter("attachmentType");
      const attachmentUrlconvert = dialog.getConverter("attachmentUrl");
      const resultPropertyconvert = dialog.getConverter("resultProperty");
      const undefConvert = dialog.getConverter("id");
      

      expect(urlconvert).instanceOf(StringExpressionConverter);
      expect(authKeyconvert).instanceOf(StringExpressionConverter);
      expect(attachmentTypeconvert).instanceOf(StringExpressionConverter);
      expect(attachmentUrlconvert).instanceOf(StringExpressionConverter);
      expect(resultPropertyconvert).instanceOf(StringExpressionConverter);
      expect(undefConvert).to.be.undefined;


        const endDialogFake = sinon.fake();
        const dc = ({
            state: {
                setValue: sinon.fake(),
            },
            endDialog: endDialogFake
        } as unknown) as DialogContext;
    
        getUploadedDataStub.returns(Promise.reject());
        dialog.attachmentUrl = new StringExpression("dummyUrl");

        // @ts-ignore: Object is possibly 'null'.
        await dialog.beginDialog(dc);

        sinon.assert.calledOnceWithExactly(getUploadedDataStub, "dummyUrl");
        sinon.assert.calledOnce(endDialogFake);
    })

    it("should invoke axios for downloading data with the attachment URL", async () => {
        const endDialogFake = sinon.fake();
        const dc = ({
            state: {
                setValue: sinon.fake(),
            },
            endDialog: endDialogFake
        } as unknown) as DialogContext;
    
        getUploadedDataStub.returns(Promise.reject());
        dialog.attachmentUrl = new StringExpression("dummyUrl");

        // @ts-ignore: Object is possibly 'null'.
        await dialog.beginDialog(dc);

        sinon.assert.calledOnceWithExactly(getUploadedDataStub, "dummyUrl");
        sinon.assert.calledOnce(endDialogFake);
    })

    it("should invoke postAttachment with the required ", async () => {
        const endDialogFake = sinon.fake();
        const dc = ({
            state: {
                setValue: sinon.fake(),
            },
            endDialog: endDialogFake
        } as unknown) as DialogContext;
    
        getUploadedDataStub.returns(Promise.resolve({"a": "b"}));
        dialog.attachmentType = new StringExpression("dummyType");
        dialog.url = new StringExpression("dummyUrl");
        dialog.authKey = new StringExpression("authKey");
        dialog.resultProperty = new StringExpression("dialog.res");
        postAttachmentStub.returns(Promise.reject());

        // @ts-ignore: Object is possibly 'null'.
        await dialog.beginDialog(dc);

        sinon.assert.calledOnceWithExactly(postAttachmentStub, "dummyType", "authKey", "dummyUrl", {"a": "b"});
        sinon.assert.calledOnce(endDialogFake);
    })

    it("should invoke postAttachment with the required ", async () => {
        const dialogTwo = new SendAttachment();
        expect(dialogTwo.id).equals("SendAttachment");

        const endDialogFake = sinon.fake();
        const dc = ({
            state: {
                setValue: sinon.fake(),
            },
            endDialog: endDialogFake
        } as unknown) as DialogContext;

    
        getUploadedDataStub.returns(Promise.resolve({"a": "b"}));
        dialog.attachmentType = new StringExpression("dummyType");
        dialog.url = new StringExpression("dummyUrl");
        dialog.authKey = new StringExpression("authKey");
        dialog.resultProperty = new StringExpression("dialog.res");
        postAttachmentStub.returns(Promise.resolve("abc"));

        // @ts-ignore: Object is possibly 'null'.
        await dialog.beginDialog(dc);

        sinon.assert.calledOnceWithExactly(postAttachmentStub, "dummyType", "authKey", "dummyUrl", {"a": "b"});
        sinon.assert.calledOnce(endDialogFake);
    })
});