import { ConversationIdDialog } from "../src/conversationIdDialog";
import {
  StringExpression,
  StringExpressionConverter,
} from "adaptive-expressions";
import { DialogContext } from "botbuilder-dialogs";
import "mocha";
import { expect } from "chai";
import * as sinon from "sinon";
import {UserConvMapper} from '@advanceddevelopment/caip-bot-core';

//const EventEmitter = require('events');




const settings = {
  runtimeSettings : {
    containerName:'abc',
    features : {
      blobTranscript : {
        connectionString : 'xyz'
      }
    }
  }
};
const settings1 = {};

const settings2 = {
  runtimeSettings : {
    containerName:'abc',
    features : {
      blobTranscript : {
      }
    }
  }
};

describe("Get ConversationID Mapper", () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it("should call beginDialog with erase", () => {
    const dialog = new ConversationIdDialog();
    expect(dialog.id).equals("ConversationIdDialog");

    const resConvert = dialog.getConverter("resultProperty");
    const undefConvert = dialog.getConverter("id");
    expect(resConvert).instanceOf(StringExpressionConverter);
    expect(undefConvert).to.be.undefined;
    dialog.resultProperty = new StringExpression("dialog.res");
    const endDialogFake = sandbox.fake();
    const setValueFake = sandbox.fake();

    const dc = {
      endDialog: endDialogFake,
      state: {
        setValue: setValueFake,
      },
      context: {
          activity: {
              channelId:"123",
              conversation: {
                  id:"345"
              },
              from : {
                id: 'abc'
              }
          }
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      }
    } as unknown as DialogContext;

    const pt = {
         download : async function () {
            console.log("inside pt  fetch");
            return {
                readableStreamBody:"test"
            }
        },
        delete : async function () {
            console.log("inside pt  fetch");
            return "abc"
        },
        upload : async function (co : string) {
            return "abc"
        }
    }
    const ts = {
        getBlockBlobClient: function ( co: string) {
            return pt;
        }
    }
    sandbox.stub(UserConvMapper.prototype, <any>"eraseConversationMap").resolves({});
    //console.log(sinon.stub(dc,'endDialog').callCount);
    dialog.beginDialog(dc).then((res) => {
        sinon.assert.calledOnce(endDialogFake);
    });


  });

  it("should call beginDialog with erase and throws error", () => {
    const dialog = new ConversationIdDialog();
    expect(dialog.id).equals("ConversationIdDialog");

    const resConvert = dialog.getConverter("resultProperty");
    const undefConvert = dialog.getConverter("id");
    expect(resConvert).instanceOf(StringExpressionConverter);
    expect(undefConvert).to.be.undefined;
    dialog.resultProperty = new StringExpression("dialog.res");
    const endDialogFake = sandbox.fake();
    const setValueFake = sandbox.fake();

    const dc = {
      endDialog: endDialogFake,
      state: {
        setValue: setValueFake,
      },
      context: {
          activity: {
              channelId:"123",
              conversation: {
                  id:"345"
              },
              from : {
                id: 'abc'
              }
          }
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      }
    } as unknown as DialogContext;

    const pt = {
         download : async function () {
            console.log("inside pt  fetch");
            return {
                readableStreamBody:"test"
            }
        },
        delete : async function () {
            console.log("inside pt  fetch");
            return "abc"
        },
        upload : async function (co : string) {
            return "abc"
        }
    }
    const ts = {
        getBlockBlobClient: function ( co: string) {
            return pt;
        }
    }
    sandbox.stub(UserConvMapper.prototype, <any>"eraseConversationMap").throws(new Error());
    //console.log(sinon.stub(dc,'endDialog').callCount);
    dialog.beginDialog(dc).then((res) => {
        sinon.assert.calledOnce(endDialogFake);
    });


  });

  it("should call beginDialog with containername undefined", () => {
    const dialog = new ConversationIdDialog();
    expect(dialog.id).equals("ConversationIdDialog");

    const resConvert = dialog.getConverter("resultProperty");
    const undefConvert = dialog.getConverter("id");
    expect(resConvert).instanceOf(StringExpressionConverter);
    expect(undefConvert).to.be.undefined;
    dialog.resultProperty = new StringExpression("dialog.res");
    const endDialogFake = sandbox.fake();
    const setValueFake = sandbox.fake();

    const dc = {
      endDialog: endDialogFake,
      state: {
        setValue: setValueFake,
      },
      context: {
          activity: {
              channelId:"123",
              conversation: {
                  id:"345"
              },
              from : {
                id: 'abc'
              }
          }
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings2),
        },
      }
    } as unknown as DialogContext;

    const pt = {
         download : async function () {
            console.log("inside pt  fetch");
            return {
                readableStreamBody:"test"
            }
        },
        delete : async function () {
            console.log("inside pt  fetch");
            return "abc"
        },
        upload : async function (co : string) {
            return "abc"
        }
    }
    const ts = {
        getBlockBlobClient: function ( co: string) {
            return pt;
        }
    }
    //console.log(sinon.stub(dc,'endDialog').callCount);
    dialog.beginDialog(dc).then((res) => {
      sinon.assert.calledOnce(endDialogFake);
  });


  });

  it("should call beginDialog with containername undefined", () => {
    const dialog = new ConversationIdDialog();
    expect(dialog.id).equals("ConversationIdDialog");

    const resConvert = dialog.getConverter("resultProperty");
    const undefConvert = dialog.getConverter("id");
    expect(resConvert).instanceOf(StringExpressionConverter);
    expect(undefConvert).to.be.undefined;
    dialog.resultProperty = new StringExpression("dialog.res");
    const endDialogFake = sandbox.fake();
    const setValueFake = sandbox.fake();

    const dc = {
      endDialog: endDialogFake,
      state: {
        setValue: setValueFake,
      },
      context: {
          activity: {
              channelId:"123",
              conversation: {
                  id:"345"
              },
              from : {
                id: 'abc'
              }
          }
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings1),
        },
      }
    } as unknown as DialogContext;

    const pt = {
         download : async function () {
            console.log("inside pt  fetch");
            return {
                readableStreamBody:"test"
            }
        },
        delete : async function () {
            console.log("inside pt  fetch");
            return "abc"
        },
        upload : async function (co : string) {
            return "abc"
        }
    }
    const ts = {
        getBlockBlobClient: function ( co: string) {
            return pt;
        }
    }
    //console.log(sinon.stub(dc,'endDialog').callCount);
    dialog.beginDialog(dc).then((res) => {
      sinon.assert.calledOnce(endDialogFake);
  });


  });
});
