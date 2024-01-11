// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
    ActivityHandler,
    MessageFactory,
    ActivityTypes,
} = require("botbuilder");

class EchoBot extends ActivityHandler {
    constructor() {
        super();

        async function getResponse(context) {
            switch (context.activity.name) {
                case "preChat":
                    await context.sendActivity({
                        type: ActivityTypes.EndOfConversation,
                        code: "completedSuccessfully",
                        value: {
                            hoursOfOperationStatus: "open",
                            longestWaitTime: 300, // ms
                            chatsInQueue: 0,
                        },
                    });
                    break;
                case "preChatAsync":
                    await context.sendActivity({
                        type: ActivityTypes.EndOfConversation,
                        code: "completedSuccessfully",
                        value: {
                            asyncChatStatus: "existing",
                        },
                    });
                    break;
                case "connectToLiveAgent":
                    await context.sendActivity({
                        type: ActivityTypes.Message,
                        code: "completedSuccessfully",
                        text: context.activity.text
                    });
                    break;
                case "endChat":
                default:
                    return {};
            }
        }

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            await getResponse(context);
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = "Hello and welcome!";
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(
                        MessageFactory.text(welcomeText, welcomeText)
                    );
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.EchoBot = EchoBot;
