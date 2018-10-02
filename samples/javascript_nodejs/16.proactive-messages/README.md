This sample demonstrates how to send proactive messages to users by
capturing a conversation reference, then using it later to initialize
outbound messages.

# To try this sample
- Clone the repository
    ```bash
    git clone https://github.com/microsoft/botbuilder-samples.git
    ```
- In a terminal, navigate to samples/javascript_nodejs/16.proactive-messages
    ```bash
    cd samples/javascript_nodejs/16.proactive-messages
    ```
- Install modules and start the bot
    ```bash
    npm i && npm start
    ```

# Testing the bot using Bot Framework Emulator
[Microsoft Bot Framework Emulator](https://github.com/microsoft/botframework-emulator) is
a desktop application that allows bot developers to test and debug their bots on localhost
or running remotely through a tunnel.

- Install the Bot Framework Emulator from [here](https://aka.ms/botframework-emulator)

Build run your bot locally and open two instances of the emulator.

1. In the first emulator, type "run" to simulate a job being added to the queue.
1. Copy the job number from the emulator log.
1. In the second emulator, type "done <jobNumber>", where "<jobNumber>" is the job number, without the angle brackets, that you copied in the previous step. This will cause the bot to complete the job.
1. Note that the bot sends a message proactively to the user in the first emulator when the job is completed.

## Connect to bot using Bot Framework Emulator V4
- Launch Bot Framework Emulator
- File -> Open Bot Configuration and navigate to javascript_nodejs/17.proactive-messages
- Select proactive-messages.bot file

# Deploy this bot to Azure
You can use the [MSBot](https://github.com/microsoft/botbuilder-tools) Bot Builder CLI tool to clone and configure any services this sample depends on. 

To install all Bot Builder tools - 

Ensure you have [Node.js](https://nodejs.org/) version 8.5 or higher

```bash
npm i -g msbot chatdown ludown qnamaker luis-apis botdispatch luisgen
```

To clone this bot, run
```
msbot clone services -f deploymentScripts/msbotClone -n <BOT-NAME> -l <Azure-location> --subscriptionId <Azure-subscription-id>
```

# Proactive Messages
In addition to responding to incoming messages, bots are frequently called on to send "proactive" messages
based on activity, scheduled tasks, or external events.

In order to send a proactive message using Botbuilder, the bot must first capture a conversation reference
from an incoming message using `TurnContext.getConversationReference()`. This reference can be stored for
later use.

To send proactive messages, acquire a conversation reference, then use `adapter.continueConversation()` to
create a TurnContext object that will allow the bot to deliver the new outgoing message.


# Further reading
- [Send proactive messages](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-proactive-message?view=azure-bot-service-4.0&tabs=js)
- [continueConversation Method](https://docs.microsoft.com/en-us/javascript/api/botbuilder/botframeworkadapter#continueconversation)
- [getConversationReference Method](https://docs.microsoft.com/en-us/javascript/api/botbuilder-core/turncontext#getconversationreference)