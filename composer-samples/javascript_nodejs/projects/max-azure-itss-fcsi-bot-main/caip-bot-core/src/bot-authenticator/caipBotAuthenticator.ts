import axios, { AxiosRequestConfig } from "axios";
import { UserConvMapper } from "../userconv-mapper";
import {
  BotAuthenticatorUserInfo,
  BotAuthenticatorInfo,
} from "./botAuthenticatorInfo";
import { Logger } from "../utils/logger";

export class CaipBotAuthenticator {
  private botSecret: string;
  private logger = new Logger(__filename);
  constructor(botSecret: string) {
    this.botSecret = botSecret;
  }

  /**
   *
   * @param tokenParams
   * @returns string
   */
  public async getToken(botAuthenticatorInfo: BotAuthenticatorInfo = {}) {
    const continueConversationConfig =
      botAuthenticatorInfo.ContinueConversationConfig;
    const botAuthenticatorUserInfo =
      botAuthenticatorInfo.BotAuthenticatorUserInfo;
    if (continueConversationConfig === undefined) {
      return await this.getTokenForNewConversationId(botAuthenticatorUserInfo);
    }
    const fallBackToNewConversation =
      continueConversationConfig.fallBackToNewConversation === undefined
        ? true
        : continueConversationConfig.fallBackToNewConversation;

    const daysToContinueConversation =
      continueConversationConfig.daysToContinueConversation === undefined
        ? 14
        : continueConversationConfig.daysToContinueConversation;

      const clearExpiredConversation = 
        continueConversationConfig.clearExpiredConversation === undefined
        ? false
        : continueConversationConfig.clearExpiredConversation;

    if (
      !continueConversationConfig.storageAcccountConnectionString ||
      !continueConversationConfig.userId ||
      !daysToContinueConversation ||
      daysToContinueConversation > 14
    ) {
      const errorMessage =
        "Required Details not passed in continueConversation Config";
      this.logger.error("getToken", errorMessage);
      throw new Error(errorMessage);
    }
    let generateNewConversationId: boolean = false;
    let conversationData: any;

    const convMapper = new UserConvMapper(
      continueConversationConfig.storageAcccountConnectionString,
      "convmapperstorage"
    );
    try {
      conversationData = await convMapper.getConversationData(
        continueConversationConfig.userId
      );
    } catch (error) {
      this.logger.info(
        "getToken",
        `Failed to retrieve Blob for userID: ${continueConversationConfig.userId}. This is expected if no history is to be replayed.`
      );
      generateNewConversationId = true;
    }

    if (generateNewConversationId || conversationData === null) {
      return await this.getTokenForNewConversationId(botAuthenticatorUserInfo);
    }

    //Validate the conversation Id retrieved
    const isValidConversationId = this.checkConversationIdValidity(
      conversationData.timestamp,
      daysToContinueConversation
    );
    if (isValidConversationId) {
      try {
        return await this.getTokenForConversationId(
          conversationData.conversationId
        );
      } catch (err) {
        if (fallBackToNewConversation === false) {
          const errorMessage = `Unable to fetch token for the conversationId: ${
            conversationData.conversationId
          }, Time difference is ${Date.now() - conversationData.timestamp}`;
          this.logger.error("getToken", errorMessage);
          throw err;
        }
      }
    } else if(!isValidConversationId && clearExpiredConversation) {
      // clear conversation map if config clearExpiredConversation is passed & conversation is invalid
      await convMapper.eraseConversationMap(continueConversationConfig.userId);
    }
    return await this.getTokenForNewConversationId(botAuthenticatorUserInfo);
  }

  private async getTokenForNewConversationId(
    botAuthenticatorUserInfo?: BotAuthenticatorUserInfo
  ) {
    const requestParams: AxiosRequestConfig = {
      url: "https://directline.botframework.com/v3/directline/tokens/generate",
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.botSecret,
      },
    };
    if (botAuthenticatorUserInfo !== undefined) {
      requestParams.headers["Content-type"] = "application/json";
      requestParams.data = JSON.stringify(botAuthenticatorUserInfo);
    }
    try {
      const response = await axios(requestParams);
      return response.data.token;
    } catch (error) {
      this.logger.error(
        "getTokenForNewConversationId",
        "Token Generation API failed -" + error.message
      );
    }
  }

  private async getTokenForConversationId(conversationId: string) {
    const requestParams: AxiosRequestConfig = {
      url: `https://directline.botframework.com/v3/directline/conversations/${conversationId}?watermark=0`,
      method: "GET",
      headers: {
        Authorization: "Bearer " + this.botSecret,
      },
    };
    const response = await axios(requestParams);
    return response.data.token;
  }

  private checkConversationIdValidity(
    timestamp: number,
    daysToContinueConversation: number
  ) {
    if (
      Date.now() - timestamp >=
      daysToContinueConversation * 24 * 60 * 60 * 1000
    )
      return false;
    return true;
  }
}
