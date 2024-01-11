// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, ActivityTypes, EndOfConversationCodes } = require('botbuilder');

class EchoBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            if(context.activity.name === 'connectToLiveAgent'){
                await context.sendActivity(`'Manx' has joined the Chat. You can now begin the conversation.`);
                return next();
            }

            if(!context.activity.text){
                return next();
            }


            // setTimeout(() => {
            //     console.log("before timeout")
            //     context.sendActivity(`Timeout activity after EoC: '${ context.activity.text }'`);
            //     console.log("after timeout")
            //     // context.sendActivity({
            //     //     type: ActivityTypes.EndOfConversation,
            //     //     // code: EndOfConversationCodes.CompletedSuccessfully,
            //     //     // text: "Do you need help with another issue?"
            //     // });
            // }, 25000);

            const wait = (t) => new Promise(res => {
                setTimeout(() => {
                    res()
                }, t);
            })

            switch (context.activity.text.toLowerCase()) {
            case 'quit':
            case 'end':
            case 'stop':
                // await wait(3 * 60000);
                console.log("[1] Skill EoC", new Date().toISOString())
                await context.sendActivity({
                    type: ActivityTypes.EndOfConversation,
                    code: EndOfConversationCodes.CompletedSuccessfully,
                });
                console.log("[2] Skill EoC", new Date().toISOString())
                // await context.sendActivity({
                //     type: ActivityTypes.EndOfConversation,
                //     code: EndOfConversationCodes.CompletedSuccessfully,
                //     // text: "Do you need help with another issue?"
                // });
                // context.sendActivity(`EoC from onEndOfConversation method: '${ context.activity.text }'`);
                break;
            default:
                await context.sendActivity(`Echo (JS) : '${ context.activity.text }'`);
                // await context.sendActivity('Say "end" or "stop" and I\'ll end the conversation and back to the parent.');
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onEndOfConversation(async (context, next) => {
            console.log("before")
            await context.sendActivity(`EoC from onEndOfConversation method: '${ context.activity.text }'`);
            console.log("after")
            // await context.sendActivity({
            //     type: ActivityTypes.EndOfConversation,
            //     // code: EndOfConversationCodes.CompletedSuccessfully,
            //     // text: "Do you need help with another issue?"
            // });
            // This will be called if the root bot is ending the conversation.  Sending additional messages should be
            // avoided as the conversation may have been deleted.
            // Perform cleanup of resources if needed.

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.EchoBot = EchoBot;
