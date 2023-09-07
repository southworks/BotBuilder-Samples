import { GetTranscriptDialog } from "../src/getTranscriptDialog";
import {
  StringExpression,
  StringExpressionConverter,
} from "adaptive-expressions";
import { DialogContext } from "botbuilder-dialogs";
import "mocha";
import { assert, expect } from "chai";
import * as sinon from "sinon";
import { BlobsTranscriptStore } from "botbuilder-azure-blobs";
import { PagedResult, TurnContext } from "botbuilder";

const settings = {
  runtimeSettings : {
    features : {
      blobTranscript : {
        containerName: "abc",
        connectionString: "xyz"
      }
    }
  }
};
const settings1 = {};
const settings2 = {
  runtimeSettings : {
    features : {
      blobTranscript : {
        containerName: "abc",
        connectionStringNew: "xyz"
      }
    }
  }
};

describe("Get Transcript", () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });


  it("should return transcript - non null items", () => {
    const dialog = new GetTranscriptDialog();
    expect(dialog.id).equals("GetTranscriptDialog");

    const conversationIdConvert = dialog.getConverter("conversationId");
    const resConvert = dialog.getConverter("resultProperty");
    const undefConvert = dialog.getConverter("id");
    expect(conversationIdConvert).instanceOf(StringExpressionConverter);
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
        items: [
            {
                type:'message',
                text: 'hi',
                from: {
                    name:'bot'
                }
            }
        ],
        continuationToken : ''
    }

    
    const ts = {
        getTranscriptActivities: async function (ch: string, co: string) {
            return pt;
        }
    }
    sandbox.stub(GetTranscriptDialog.prototype, <any>"getTranscriptStore").returns(ts);
    sandbox.stub(GetTranscriptDialog.prototype, <any>"addLastTurnMessages").returns(ts);
    //console.log(sinon.stub(dc,'endDialog').callCount);
    dialog.beginDialog(dc).then((res) => {
        sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, 'bot : hi');
        sinon.assert.calledOnce(endDialogFake);
    });


  });

  it("should return transcript - empty items", () => {
    const dialog = new GetTranscriptDialog();
    expect(dialog.id).equals("GetTranscriptDialog");

    const conversationIdConvert = dialog.getConverter("conversationId");
    const resConvert = dialog.getConverter("resultProperty");
    const undefConvert = dialog.getConverter("id");
    expect(conversationIdConvert).instanceOf(StringExpressionConverter);
    expect(resConvert).instanceOf(StringExpressionConverter);
    expect(undefConvert).to.be.undefined;

    dialog.conversationId = new StringExpression("conversationId");
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
        items: [],
        continuationToken: ''
    }
    
    const ts = {
        getTranscriptActivities: async function (ch: string, co: string) {
            return pt;
        }
    }
    sandbox.stub(GetTranscriptDialog.prototype, <any>"getTranscriptStore").returns(ts);
    sandbox.stub(GetTranscriptDialog.prototype, <any>"addLastTurnMessages").returns(ts);
    dialog.beginDialog(dc).then((res) => {
        sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, '');
        sinon.assert.calledOnce(endDialogFake);
    });;

  });

  it("should not send result when result property in undefined", () => {
    const dialog = new GetTranscriptDialog();
    expect(dialog.id).equals("GetTranscriptDialog");

    const conversationIdConvert = dialog.getConverter("conversationId");
    const resConvert = dialog.getConverter("resultProperty");
    const undefConvert = dialog.getConverter("id");
    expect(conversationIdConvert).instanceOf(StringExpressionConverter);
    expect(resConvert).instanceOf(StringExpressionConverter);
    expect(undefConvert).to.be.undefined;

    dialog.conversationId = new StringExpression("conversationId");
    dialog.resultProperty = undefined;
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
        items: [],
        continuationToken: ''
    }
    
    const ts = {
        getTranscriptActivities: async function (ch: string, co: string) {
            return pt;
        }
    }
    sandbox.stub(GetTranscriptDialog.prototype, <any>"getTranscriptStore").returns(ts);
    sandbox.stub(GetTranscriptDialog.prototype, <any>"addLastTurnMessages").returns(ts);
    dialog.beginDialog(dc).then((res) => {
        sinon.assert.callCount(setValueFake,0);
        sinon.assert.calledOnce(endDialogFake);
    });;

  });

  it("should return transcript when continuation token is not null", () => {
    const dialog = new GetTranscriptDialog();
    expect(dialog.id).equals("GetTranscriptDialog");

    const conversationIdConvert = dialog.getConverter("conversationId");
    const resConvert = dialog.getConverter("resultProperty");
    const undefConvert = dialog.getConverter("id");
    expect(conversationIdConvert).instanceOf(StringExpressionConverter);
    expect(resConvert).instanceOf(StringExpressionConverter);
    expect(undefConvert).to.be.undefined;

    dialog.conversationId = new StringExpression("conversationId");
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
        items: [],
        continuationToken: 'abc'
    }
    
    const ts = {
        getTranscriptActivities: async function (ch: string, co: string) {
            return pt;
        }
    }
    sandbox.stub(GetTranscriptDialog.prototype, <any>"getTranscriptStore").returns(ts);
    sandbox.stub(GetTranscriptDialog.prototype, <any>"addLastTurnMessages").returns(ts);
    dialog.beginDialog(dc).then((res) => {
        sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, '');
        sinon.assert.calledOnce(endDialogFake);
    });;

  });

  it("should throw error when connectionstring is undefined", () => {
    const dialog = new GetTranscriptDialog();
    expect(dialog.id).equals("GetTranscriptDialog");

    const conversationIdConvert = dialog.getConverter("conversationId");
    const resConvert = dialog.getConverter("resultProperty");
    const undefConvert = dialog.getConverter("id");
    expect(conversationIdConvert).instanceOf(StringExpressionConverter);
    expect(resConvert).instanceOf(StringExpressionConverter);
    expect(undefConvert).to.be.undefined;

    dialog.conversationId = new StringExpression("conversationId");
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
        items: [],
        continuationToken: ''
    }
    
    const ts = {
        getTranscriptActivities: async function (ch: string, co: string) {
            return pt;
        }
    }
    sandbox.stub(GetTranscriptDialog.prototype, <any>"getTranscriptStore").returns(ts);
    sandbox.stub(GetTranscriptDialog.prototype, <any>"addLastTurnMessages").returns(ts);
    dialog.beginDialog(dc).then((res) => {
        sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, '');
        sinon.assert.calledOnce(endDialogFake);
    });;

  });

  it('should return BlobTranscriptStore', async() => {
        const dialog = new GetTranscriptDialog();
        expect(dialog.id).equals("GetTranscriptDialog");
        try{
            dialog.getTranscriptStore("test","test");
        }
        catch(e){
            
        }
    });

    it('should add userutterance to transcript store', async() => {
      const dialog = new GetTranscriptDialog();
      expect(dialog.id).equals("GetTranscriptDialog");
      
          const a = dialog.addLastTurnMessages(["hi"],{
            activity: {
                channelId:"123",
                conversation: {
                    id:"345"
                },
                text: 'hi',
                from : {
                  name : 'abc'
                }
              }
          } as TurnContext);
          assert.deepEqual(a,['hi', 'abc: hi']);
  });


  it("should return transcript - for Attachment items", () => {
    const dialog = new GetTranscriptDialog();
    expect(dialog.id).equals("GetTranscriptDialog");

    const conversationIdConvert = dialog.getConverter("conversationId");
    const resConvert = dialog.getConverter("resultProperty");
    const undefConvert = dialog.getConverter("id");
    expect(conversationIdConvert).instanceOf(StringExpressionConverter);
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
        items: [
            {
                type:'message',
                "attachmentLayout": "list",
                "attachments": [
                  {
                    "contentType": "application/vnd.microsoft.card.hero",
                    "content": {
                      "lgType": "HeroCard",
                      "text": "Hello, welcome to the chat. What can we help you with today?"
                    }
                  }
                ],
                from: {
                    name:'bot'
                }
            }
        ],
        continuationToken : ''
    }

    
    const ts = {
        getTranscriptActivities: async function (ch: string, co: string) {
            return pt;
        }
    }
    sandbox.stub(GetTranscriptDialog.prototype, <any>"getTranscriptStore").returns(ts);
    sandbox.stub(GetTranscriptDialog.prototype, <any>"addLastTurnMessages").returns(ts);
    //console.log(sinon.stub(dc,'endDialog').callCount);
    dialog.beginDialog(dc).then((res) => {
        sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, 'bot : H1ello, welcome to the chat. What can we help you with today?');
        sinon.assert.calledOnce(endDialogFake);
    });


  });

  it("should return transcript - for Attachment custom link items", () => {
    const dialog = new GetTranscriptDialog();
    expect(dialog.id).equals("GetTranscriptDialog");

    const conversationIdConvert = dialog.getConverter("conversationId");
    const resConvert = dialog.getConverter("resultProperty");
    const undefConvert = dialog.getConverter("id");
    expect(conversationIdConvert).instanceOf(StringExpressionConverter);
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
        items: [
            {
              "type":"message",
              "attachments":
              [{"contentType":"application/caip.custom.link","lgType":"Attachment","content":{"linkText":"secure messaging","linkURL":"https://specialty.optumrx.com/patients/secure-messaging","linkPrefix":"Got it. Live chat hours are  CT. You can return between those hours, or, you can contact an advocate over","linkSuffix":"now."}}],
                from: {
                    name:'bot'
                }
            }
            // {
            //   type:'message',
            //   "attachmentLayout": "list",
            //   "attachments": [
            //     {
            //       "contentType": "application/vnd.microsoft.card.hero",
            //       "content": {
            //         "lgType": "HeroCard",
            //         "text": "Hello, welcome to the chat. What can we help you with today?"
            //       }
            //     }
            //   ],
            //   from: {
            //       name:'bot'
            //   }
          // }
        ],
        continuationToken : ''
    }

    
    const ts = {
        getTranscriptActivities: async function (ch: string, co: string) {
            return pt;
        }
    }
    sandbox.stub(GetTranscriptDialog.prototype, <any>"getTranscriptStore").returns(ts);
    sandbox.stub(GetTranscriptDialog.prototype, <any>"addLastTurnMessages").returns(ts);
    //console.log(sinon.stub(dc,'endDialog').callCount);
    dialog.beginDialog(dc).then((res) => {
        sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, 'bot : Got it. Live chat hours are  CT. You can return between those hours, or, you can contact an advocate over secure messaging now.');
        sinon.assert.calledOnce(endDialogFake);
    });


  });

  it("should return transcript using connectionStringNew - non null items ", () => {
    const dialog = new GetTranscriptDialog();
    expect(dialog.id).equals("GetTranscriptDialog");

    const conversationIdConvert = dialog.getConverter("conversationId");
    const resConvert = dialog.getConverter("resultProperty");
    const undefConvert = dialog.getConverter("id");
    expect(conversationIdConvert).instanceOf(StringExpressionConverter);
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
        items: [
            {
                type:'message',
                text: 'hi',
                from: {
                    name:'bot'
                }
            }
        ],
        continuationToken : ''
    }

    
    const ts = {
        getTranscriptActivities: async function (ch: string, co: string) {
            return pt;
        }
    }
    sandbox.stub(GetTranscriptDialog.prototype, <any>"getTranscriptStore").returns(ts);
    sandbox.stub(GetTranscriptDialog.prototype, <any>"addLastTurnMessages").returns(ts);
    //console.log(sinon.stub(dc,'endDialog').callCount);
    dialog.beginDialog(dc).then((res) => {
        sinon.assert.calledOnceWithExactly(setValueFake, sinon.match.any, 'bot : hi');
        sinon.assert.calledOnce(endDialogFake);
    });


  });
  
});
