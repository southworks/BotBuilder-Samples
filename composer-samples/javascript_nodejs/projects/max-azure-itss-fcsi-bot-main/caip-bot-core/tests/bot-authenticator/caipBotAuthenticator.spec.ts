import {
  CaipBotAuthenticator,
  BotAuthenticatorUserInfo,
  ContinueConversationConfig,
} from "../../src/bot-authenticator";
import sinon from "sinon";
const sandbox = sinon.createSandbox();
import { assert } from "chai";
import nock from "nock";
import { UserConvMapper } from "../../src/userconv-mapper";

const response = {
  token: "abcd",
};
const newTokenIdResp = {
  token: "newConvIdToken",
};
const oldTokenIdResp = {
  token: "oldConvIdToken",
};
describe("Class - CaipBotAuthenticator", async () => {
  describe("Function - getToken", async () => {
    let sandbox: any;
    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });
    afterEach((done) => {
      sandbox.restore();
      sinon.restore();
      nock.cleanAll();
      done();
    });
    it("should return new token when no userinfo and continueConversationConfig is passed", async () => {
      const botAuthenticator = new CaipBotAuthenticator("abcd");
      nock("https://directline.botframework.com/v3/directline")
        .post("/tokens/generate")
        .reply(200, newTokenIdResp);
      const token = await botAuthenticator.getToken({});
      assert.equal("newConvIdToken", token);
    });

    it("should return new token when no userinfo and continueConversationConfig is passed", async () => {
      const botAuthenticator = new CaipBotAuthenticator("abcd");
      nock("https://directline.botframework.com/v3/directline")
        .post("/tokens/generate")
        .reply(404, newTokenIdResp);
      const token = await botAuthenticator.getToken({});
      assert.equal(undefined, token);
    });

    it("should return new token when no parameter is passed", async () => {
      const botAuthenticator = new CaipBotAuthenticator("abcd");
      nock("https://directline.botframework.com/v3/directline")
        .post("/tokens/generate")
        .reply(200, newTokenIdResp);
      const token = await botAuthenticator.getToken();
      assert.equal("newConvIdToken", token);
    });

    it("should return new token when userinfo is passed and no continueConversationConfig is passed", async () => {
      const botAuthenticator = new CaipBotAuthenticator("abcd");
      nock("https://directline.botframework.com/v3/directline")
        .post("/tokens/generate")
        .reply(200, newTokenIdResp);
      const botAuthenticatorUserInfo: BotAuthenticatorUserInfo = {
        user: { id: "", name: "" },
        trustedOrigins: [],
      };
      const token = await botAuthenticator.getToken({
        BotAuthenticatorUserInfo: botAuthenticatorUserInfo,
      });
      assert.equal("newConvIdToken", token);
    });

    it("should return new token when continueConversationConfig is passed and error occurs while getting data from storage", async () => {
      const botAuthenticator = new CaipBotAuthenticator("abcd");
      const continueConversationConfig: ContinueConversationConfig = {
        storageAcccountConnectionString: "abc",
        userId: "abc",
        daysToContinueConversation: 4,
        fallBackToNewConversation: false,
      };
      nock("https://directline.botframework.com/v3/directline")
        .post("/tokens/generate")
        .reply(200, newTokenIdResp);
      const token = await botAuthenticator.getToken({
        ContinueConversationConfig: continueConversationConfig,
      });
      assert.equal("newConvIdToken", token);
    });

    it("should return new token when continueConversationConfig is passed without noofDays and error occurs while getting data from storage", async () => {
      const botAuthenticator = new CaipBotAuthenticator("abcd");
      const continueConversationConfig: ContinueConversationConfig = {
        storageAcccountConnectionString: "abc",
        userId: "abc",
        fallBackToNewConversation: false,
      };
      nock("https://directline.botframework.com/v3/directline")
        .post("/tokens/generate")
        .reply(200, newTokenIdResp);
      const token = await botAuthenticator.getToken({
        ContinueConversationConfig: continueConversationConfig,
      });
      assert.equal("newConvIdToken", token);
    });

    it("should throw error when incomplete continueConversation Config is passed", async () => {
      const botAuthenticator = new CaipBotAuthenticator("abcd");
      const continueConversationConfig: any = {
        storageAcccountConnectionString: "abc",
        daysToContinueConversation: 4,
      };
      try {
        const token = await botAuthenticator.getToken({
          ContinueConversationConfig: continueConversationConfig,
        });
      } catch (error) {
        assert.equal(
          error.message,
          "Required Details not passed in continueConversation Config"
        );
      }
    });

    it("should return new token when continueConversationConfig is passed and null data received storage", async () => {
      const botAuthenticator = new CaipBotAuthenticator("abcd");
      const continueConversationConfig: ContinueConversationConfig = {
        storageAcccountConnectionString: "abc",
        userId: "abc",
        daysToContinueConversation: 4,
        fallBackToNewConversation: false,
      };
      nock("https://directline.botframework.com/v3/directline")
        .post("/tokens/generate")
        .reply(200, newTokenIdResp);
      const getConversationDataStub = sinon
        .stub(UserConvMapper.prototype, "getConversationData")
        .returns(Promise.resolve(null));
      const token = await botAuthenticator.getToken({
        ContinueConversationConfig: continueConversationConfig,
      });
      sinon.assert.callCount(getConversationDataStub, 1);
      assert.equal("newConvIdToken", token);
    });

    it("should return new token when continueConversationConfig is passed and conversationValidityCheck failed", async () => {
      const botAuthenticator = new CaipBotAuthenticator("abcd");
      const continueConversationConfig: ContinueConversationConfig = {
        storageAcccountConnectionString: "abc",
        userId: "abc",
        daysToContinueConversation: 4,
        fallBackToNewConversation: false,
      };
      nock("https://directline.botframework.com/v3/directline")
        .post("/tokens/generate")
        .reply(200, newTokenIdResp);
      const getConversationDataStub = sinon
        .stub(UserConvMapper.prototype, "getConversationData")
        .returns(
          Promise.resolve({
            conversationId: "oldId",
            timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
          })
        );
      const token = await botAuthenticator.getToken({
        ContinueConversationConfig: continueConversationConfig,
      });
      sinon.assert.callCount(getConversationDataStub, 1);
      assert.equal("newConvIdToken", token);
    });

    it("should return new token & clear old conversation when continueConversationConfig is passed with clearExpiredConversation: true and conversationValidityCheck failed", async () => {
      const botAuthenticator = new CaipBotAuthenticator("abcd");
      const continueConversationConfig: ContinueConversationConfig = {
        storageAcccountConnectionString: "abc",
        userId: "abc",
        daysToContinueConversation: 4,
        fallBackToNewConversation: false,
        clearExpiredConversation: true
      };
      nock("https://directline.botframework.com/v3/directline")
        .post("/tokens/generate")
        .reply(200, newTokenIdResp);
      const getConversationDataStub = sinon
        .stub(UserConvMapper.prototype, "getConversationData")
        .returns(
          Promise.resolve({
            conversationId: "oldId",
            timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
          })
        );
      const eraseConversationMapStub = sinon
        .stub(UserConvMapper.prototype, "eraseConversationMap")
        .returns(
          Promise.resolve()
        );
      const token = await botAuthenticator.getToken({
        ContinueConversationConfig: continueConversationConfig,
      });
      sinon.assert.callCount(eraseConversationMapStub, 1);
      assert.equal("newConvIdToken", token);
    });

    it("should return  token for oldConversation Id when continueConversationConfig is passed", async () => {
      const botAuthenticator = new CaipBotAuthenticator("abcd");
      const continueConversationConfig: ContinueConversationConfig = {
        storageAcccountConnectionString: "abc",
        userId: "abc",
        daysToContinueConversation: 4,
        fallBackToNewConversation: false,
      };
      nock("https://directline.botframework.com/v3/directline")
        .get(`/conversations/oldId?watermark=0`)
        .reply(200, oldTokenIdResp);
      const getConversationDataStub = sinon
        .stub(UserConvMapper.prototype, "getConversationData")
        .returns(
          Promise.resolve({
            conversationId: "oldId",
            timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
          })
        );
      const token = await botAuthenticator.getToken({
        ContinueConversationConfig: continueConversationConfig,
      });
      sinon.assert.callCount(getConversationDataStub, 1);
      assert.equal("oldConvIdToken", token);
    });

    it("should return token for new conversation Id when continueConversationConfig is passed and old token fetching fails", async () => {
      const botAuthenticator = new CaipBotAuthenticator("abcd");
      const continueConversationConfig: ContinueConversationConfig = {
        storageAcccountConnectionString: "abc",
        userId: "abc",
        daysToContinueConversation: 4,
        fallBackToNewConversation: true,
      };
      nock("https://directline.botframework.com/v3/directline")
        .get(`/conversations/oldId?watermark=0`)
        .reply(404, response);

      const getTokenForNewConversationIdStub = sandbox
        .stub(CaipBotAuthenticator.prototype, "getTokenForNewConversationId")
        .returns(Promise.resolve("newToken"));
      const getConversationDataStub = sinon
        .stub(UserConvMapper.prototype, "getConversationData")
        .returns(
          Promise.resolve({ conversationId: "oldId", timestamp: Date.now() })
        );
      const token = await botAuthenticator.getToken({
        ContinueConversationConfig: continueConversationConfig,
      });
      sinon.assert.callCount(getConversationDataStub, 1);
      sinon.assert.calledOnceWithExactly(
        getTokenForNewConversationIdStub,
        undefined
      );
      assert.equal("newToken", token);
    });

    it("should throw error when fallBack is false and old token fetching fails", async () => {
      const botAuthenticator = new CaipBotAuthenticator("abcd");
      const continueConversationConfig: ContinueConversationConfig = {
        storageAcccountConnectionString: "abc",
        userId: "abc",
        daysToContinueConversation: 13,
        fallBackToNewConversation: false,
      };
      nock("https://directline.botframework.com/v3/directline")
        .get(`/conversations/oldId?watermark=0`)
        .reply(404, response);

      const getConversationDataStub = sinon
        .stub(UserConvMapper.prototype, "getConversationData")
        .returns(
          Promise.resolve({
            conversationId: "oldId",
            timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
          })
        );
      try {
        const token = await botAuthenticator.getToken({
          ContinueConversationConfig: continueConversationConfig,
        });
      } catch (error) {
        assert.equal(error.message, "Request failed with status code 404");
      }
      sinon.assert.callCount(getConversationDataStub, 1);
    });
  });
});
