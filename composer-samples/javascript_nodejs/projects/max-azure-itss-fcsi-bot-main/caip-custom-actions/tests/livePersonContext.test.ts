import { StringExpression } from "adaptive-expressions";
import {
  StringExpressionConverter,
} from "adaptive-expressions";
import { DialogContext } from "botbuilder-dialogs";
import { expect } from "chai";
import * as sinon from "sinon";
import * as nock from "nock";
import { LivePersonContext } from "../src/livePersonContext";

const settings = {
  livePerson: {
    baseURL: "https://livepersonapifake.com",
    accountId: "123456",
    namespace: "testNamespace",
    contextKey: "lpcontext",
    user: "testuser",
    pass : "passw0rd"
  }
};

const authToken = {
  token: "newConvIdToken",
}

const lpContextResponse = {
  "documentType": "CONTEXT",
  "tenantId": "123456",
  "documentKey": "123456:testNamespace:1234",
  "accountId": "123456",
  "nameSpace": "testNamespace",
  "sessionId": "1234",
  "ttl": "2024-08-03T10:04:25.807Z",
  "payload": {
      "userSkillSelection": "hi"
  }
}

const lpSdes = {
  authenticatedSdes: {
    customerInfo: {
      type: "ctmrinfo",
      acr: "loa1",
      iss: "https://test.com",
      customerInfo: {
        customerId: "1234567890",
        socialId: "[{\"key\":\"ENT_Client\"},{\"key\":\"ENT_MarketSegment\"},{\"key\":\"ENT_MedInsProvider\"},{\"key\":\"ENT_OffshoreRestrictFlag\",\"value\":\"N\"},{\"key\":\"ENT_Sector\"},{\"key\":\"ENT_VendorRestrictFlag\",\"value\":\"N\"}]",
        imei: "",
        userName: "1234"
      },
      auth: {}
    },
    personalInfo: {
      type: "personal",
      acr: "loa1",
      iss: "https://test.com",
      personalInfo: {
        firstname: "Test",
        lastname: "User",
        age: {
          age: 99,
          year: 1923,
          month: 10,
          day: 25
        },
        gender: "male",
        language: "en",
        contacts: [
          {
            email: "",
            phone: ""
          }
        ],
        company: "1923-10-25"
      },
      auth: {}
    }
  },
  unauthenticatedSdes: {
    customerInfo: {
      serverTimeStamp: 1691773565159,
      customerInfo: {
        customerStatus: "chat-eligible:not-white-label",
        customerType: "myself",
        customerId: "1234567890",
        userName: "1234",
        accountName: "clientName",
      }
    }
  }
}

const lpEvent = {
  serverTimestamp: 1691773622127,
  event: {
    type: "ContentEvent",
    message: "hi",
    contentType: "text/plain"
  },
  dialogId: "12345",
  messageAudience: "ALL",
  __isMe: false,
  conversationContext: {
    skillId: "12345",
    campaignId: 12345,
    engagementId: 12345,
    type: "MESSAGING",
    integration: "WEB_SDK",
    contextType: "SharkContext",
    visitor: {
      sharkVisitorId: "Y212345",
      sharkSessionId: "Ej12345",
      consumerId: "4"
    },
    participants: [
      {
        pid: "1",
        role: "ASSIGNED_AGENT"
      },
      {
        pid: "2",
        role: "CONTROLLER"
      },
      {
        pid: "3",
        role: "CONSUMER"
      }
    ]
  }
}

describe("LivePerson", () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach((done) => {
    sandbox.restore();
    sinon.restore();
    nock.cleanAll();
    done();
  });

  it("should properties match", () => {
    const livePersonContext = new LivePersonContext();
    expect(livePersonContext.id).equal("LivePersonContext");

    const resultContextConverter = livePersonContext.getConverter("resultContext");
    const resultTokenConverter = livePersonContext.getConverter("resultToken");
    const resultSDEsConverter = livePersonContext.getConverter("resultSDEs");
    const undefConverter = livePersonContext.getConverter("id");

    expect(undefConverter).to.be.undefined;
    expect(livePersonContext.id).equal("LivePersonContext");
    expect(resultContextConverter).instanceOf(StringExpressionConverter);
    expect(resultTokenConverter).instanceOf(StringExpressionConverter);
    expect(resultSDEsConverter).instanceOf(StringExpressionConverter);
  });

  it("valid config", async () => {
    const livePersonContext = new LivePersonContext();
    const endDialog = sandbox.fake();
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: sandbox.fake(),
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
      context: {
        activity: {
          channelData: {
            context: {
              convId: "1234"
            }
          }
        }
      }
    } as unknown as DialogContext;

    await livePersonContext.beginDialog(dc);
    sinon.assert.calledWith(endDialog, "livePersonContext set");
  });

  it("invalid config", async () => {
    const livePersonContext = new LivePersonContext();
    livePersonContext.resultContext = new StringExpression("resultContext");
    livePersonContext.resultToken = new StringExpression("resultToken");
    const endDialog = sandbox.fake();
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: sandbox.fake(),
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns({}),
        },
      },
      context: {
        activity: {
          channelData: {
            context: {
              convId: "1234"
            }
          }
        }
      }
    } as unknown as DialogContext;

    const expectedResponse = { statusCode: 500, content: "livePersonContext requires livePerson properties baseURL, accountId, namespace, contextKey, user & pass to be set in appsettings.json" };
    await livePersonContext.beginDialog(dc);
    sinon.assert.calledWith(endDialog, expectedResponse);
  });

  it("missing sessionId", async () => {
    const livePersonContext = new LivePersonContext();
    const endDialog = sandbox.fake();
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: sandbox.fake(),
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
    } as unknown as DialogContext;

    const expectedResponse = { statusCode: 500, content: "livePersonContext requires a sessionId from LivePerson" };
    await livePersonContext.beginDialog(dc);
    sinon.assert.calledWith(endDialog, expectedResponse);
  });

  it("get LP token valid", async () => {
    const livePersonContext = new LivePersonContext();
    const endDialog = sandbox.fake();
    const setValueFake = sandbox.fake();
    nock("https://livepersonapifake.com")
      .get("/v2/authenticate/login")
      .reply(200, authToken);
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: setValueFake,
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
      context: {
        activity: {
          channelData: {
            context: {
              convId: "1234"
            }
          }
        }
      }
    } as unknown as DialogContext;

    await livePersonContext.beginDialog(dc);
    sinon.assert.calledWithExactly(setValueFake, sinon.match.any, authToken.token);
    sinon.assert.calledWith(endDialog, "livePersonContext set");
  });

  it("get LP token invalid", async () => {
    const livePersonContext = new LivePersonContext();
    const endDialog = sandbox.fake();
    const setValueFake = sandbox.fake();
    nock("https://livepersonapifake.com")
      .get("/v2/authenticate/login")
      .reply(401, "Denied!");
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: setValueFake,
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
      context: {
        activity: {
          channelData: {
            context: {
              convId: "1234"
            }
          }
        }
      }
    } as unknown as DialogContext;
  
    await livePersonContext.beginDialog(dc);
    sinon.assert.calledWithExactly(setValueFake, sinon.match.any, { statusCode: 500, content: 'Request failed with status code 401' });
    sinon.assert.calledWith(endDialog, "livePersonContext set");
  });

  it("get LP context valid", async () => {
    const livePersonContext = new LivePersonContext();
    const endDialog = sandbox.fake();
    const setValueFake = sandbox.fake();
    nock("https://livepersonapifake.com")
      .get("/v2/authenticate/login")
      .reply(200, authToken);
    nock("https://livepersonapifake.com")
      .get(`/v2/context/document/123456/testNamespace/1234`)
      .reply(200, lpContextResponse);
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: setValueFake,
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
      context: {
        activity: {
          channelData: {
            context: {
              convId: "1234"
            }
          }
        }
      }
    } as unknown as DialogContext;
  
    await livePersonContext.beginDialog(dc);
    sinon.assert.calledWithExactly(setValueFake, sinon.match.any, lpContextResponse);
    sinon.assert.calledWith(endDialog, "livePersonContext set");
  });

  it("get LP context invalid", async () => {
    const livePersonContext = new LivePersonContext();
    const endDialog = sandbox.fake();
    const setValueFake = sandbox.fake();
    nock("https://livepersonapifake.com")
      .get("/v2/authenticate/login")
      .reply(200, authToken);
    nock("https://livepersonapifake.com")
      .get(`/v2/context/document/123456/testNamespace/1234`)
      .reply(404, "Not found");
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: setValueFake,
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
      context: {
        activity: {
          channelData: {
            context: {
              convId: "1234"
            }
          }
        }
      }
    } as unknown as DialogContext;
  
    await livePersonContext.beginDialog(dc);
    sinon.assert.calledWithExactly(setValueFake, sinon.match.any, { statusCode: 500, content: 'Request failed with status code 404' });
    sinon.assert.calledWith(endDialog, "livePersonContext set");
  });

  it("get LP context from channel valid", async () => {
    const livePersonContext = new LivePersonContext();
    const endDialog = sandbox.fake();
    const setValueFake = sandbox.fake();
    nock("https://livepersonapifake.com")
      .get("/v2/authenticate/login")
      .reply(200, authToken);
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: setValueFake,
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
      context: {
        activity: {
          channelData: {
            context: {
              convId: "1234",
              lpEvent: lpEvent
            }
          }
        }
      }
    } as unknown as DialogContext;
  
    await livePersonContext.beginDialog(dc);
    sinon.assert.calledWithExactly(setValueFake, sinon.match.any, {convId: "1234", lpEvent: lpEvent});
    sinon.assert.calledWith(endDialog, "livePersonContext set");
  });

  it("get LP context from channel invalid", async () => {
    const livePersonContext = new LivePersonContext();
    const endDialog = sandbox.fake();
    const setValueFake = sandbox.fake();
    nock("https://livepersonapifake.com")
      .get("/v2/authenticate/login")
      .reply(200, authToken);
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: setValueFake,
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
      context: {
        activity: {
          channelData: {
            context: {
              convId: "1234",
              lpEvent: {}
            }
          }
        }
      }
    } as unknown as DialogContext;
  
    await livePersonContext.beginDialog(dc);
    sinon.assert.calledWithExactly(setValueFake, sinon.match.any, { convId: '1234', lpEvent: {} });
    sinon.assert.calledWith(endDialog, "livePersonContext set");
  });

  it("get LP Sdes valid", async () => {
    const livePersonContext = new LivePersonContext();
    const endDialog = sandbox.fake();
    const setValueFake = sandbox.fake();
    nock("https://livepersonapifake.com")
      .get("/v2/authenticate/login")
      .reply(200, authToken);
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: setValueFake,
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
      context: {
        activity: {
          channelData: {
            context: {
              convId: "1234",
              lpSdes: lpSdes
            }
          }
        }
      }
    } as unknown as DialogContext;
  
    await livePersonContext.beginDialog(dc);
    sinon.assert.calledWithExactly(setValueFake, sinon.match.any, lpSdes);
    sinon.assert.calledWith(endDialog, "livePersonContext set");
  });


  it("get LP Sdes invalid", async () => {
    const livePersonContext = new LivePersonContext();
    const endDialog = sandbox.fake();
    const setValueFake = sandbox.fake();
    nock("https://livepersonapifake.com")
      .get("/v2/authenticate/login")
      .reply(200, authToken);
    const dc = {
      endDialog: endDialog,
      state: {
        setValue: setValueFake,
      },
      parent: {
        state: {
          getValue: sandbox.stub().returns(settings),
        },
      },
      context: {
        activity: {
          channelData: {
            context: {
              convId: "1234",
              lpEvent: lpEvent,
              lpSdes: {}
            }
          }
        }
      }
    } as unknown as DialogContext;
  
    await livePersonContext.beginDialog(dc);
    sinon.assert.calledWithExactly(setValueFake, sinon.match.any, {});
    sinon.assert.calledWith(endDialog, "livePersonContext set");
  });
});
