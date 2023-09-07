/**
 *
 * @interface ContinueConversationConfig
 * @storageAcccountConnectionString {string} ConnectionString of account that contains the mapping container
 * @userId {string} Unique UserID for which to replay conversation
 * @daysToContinueConversation {number} Invalidate the conversation if older than days. Max value: 14 days
 * @fallBackToNewConversation {boolean} Defaults to true. If true, token for new conversation will be returned in case of error
 *  while continuing old conversation. If false, it will throw error
 */
export interface ContinueConversationConfig {
  storageAcccountConnectionString: string;
  userId: string;
  daysToContinueConversation?: number;
  fallBackToNewConversation?: boolean;
  clearExpiredConversation?: boolean;
}

/**
 *
 * @interface BotAuthenticatorUserInfo
 * @user {obj} {id: userId, name: userName}
 * @trustedOrigins {Array<string>} Trusted Origins
 */
export interface BotAuthenticatorUserInfo {
  /* Refer to MS directline documentation for passing user info while token generation */
  user: {
    id: string;
    name: string;
  };
  trustedOrigins?: Array<string>;
}

/**
 *
 * @interface BotAuthenticatorInfo
 * @BotAuthenticatorUserInfo {BotAuthenticatorUserInfo} Used to pass UserId, username and trusted source
 * @ContinueConversationConfig {ContinueConversationConfig} Used to pass config for continueConversation
 */
export interface BotAuthenticatorInfo {
  BotAuthenticatorUserInfo?: BotAuthenticatorUserInfo;
  ContinueConversationConfig?: ContinueConversationConfig;
}
