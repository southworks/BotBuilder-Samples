// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as path from "path";

import { config } from "dotenv";
const ENV_FILE = path.join(__dirname, "..", ".env");
config({ path: ENV_FILE });

import * as restify from "restify";

import { INodeSocket } from "botframework-streaming";

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
import {
  CloudAdapter,
  ConfigurationServiceClientCredentialFactory,
  ConfigurationBotFrameworkAuthentication,
  ConfigurationBotFrameworkAuthenticationOptions,
} from "botbuilder";
import { MsalServiceClientCredentialsFactory } from "botframework-connector";
import { ConfidentialClientApplication } from "@azure/msal-node";

// This bot's main dialog.
import { EchoBot } from "./bot";

// Create HTTP server.
const server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`\n${server.name} listening to ${server.url}`);
  console.log(
    "\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator"
  );
  console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

// const [host, port] = process.env.HTTPS_PROXY.split(":");
// console.log({ host, port: Number(port) });

// HTTPS_PROXY=127.0.0.1:9191
// HTTPS_PROXY=143.110.190.83:8080

const authority = "https://login.microsoftonline.com/botframework.com"; // works
// const authority = "https://login.microsoftonline.com/common"; // works
// const authority = "https://login.microsoftonline.com"; // works
// const authority = "https://login.microsoftonline.com/b25036e3-de39-4fec-a4aa-bda41b870d38"; // 401 error
// const authority = "https://api.botframework.com"; // doesnt work
// const authority = "https://sts.windows.net"; // doesnt work
// const authority = "https://botframework.com"; // causes the error

// const authority = "https://login.microsoftonline.com";
// const factory = new MsalServiceClientCredentialsFactory(
//   process.env.MicrosoftAppId,
//   new ConfidentialClientApplication({
//     auth: {
//       clientId: process.env.MicrosoftAppId,
//       clientSecret: process.env.MicrosoftAppPassword,
//       authority
//       // authority: undefined,
//       // knownAuthorities: ["https://login.microsoftonline.com","143.110.190.83"]
//       // knownAuthorities: [
//       //   "<login.microsoftonline.com>",
//       //   "login.microsoftonline.com",
//       //   "webchat.botframework.com",
//       //   "<webchat.botframework.com>",
//       // ],
//     },
//     system: {
//       proxyUrl: `https://127.0.0.1:9191`
//     },
//   })
// );


const adapterVars = {
  MicrosoftAppId: process.env.MicrosoftAppId,
  MicrosoftAppPassword: process.env.MicrosoftAppPassword,
}

const factory = new MsalServiceClientCredentialsFactory(
  adapterVars.MicrosoftAppId,
  new ConfidentialClientApplication({
    auth: {
      clientId: adapterVars.MicrosoftAppId,
      clientSecret: adapterVars.MicrosoftAppPassword,
      authority: "https://login.microsoftonline.com/botframework.com"
    },
    system: {
      proxyUrl: `<proxy_url>`
    },
  })
);

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
  adapterVars as ConfigurationBotFrameworkAuthenticationOptions,
  factory,
);

// const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
//   adapterVars as ConfigurationBotFrameworkAuthenticationOptions,
//   factory,
//   // null,
//   // null
//   // { proxySettings: { host: "127.0.0.1", port: 9191 } }

//   // { proxySettings: { host, port: Number(port) } }
//   //   { proxySettings: { host: "188.87.102.128", port: 3128 } }
//   //   { proxySettings: { host: "http://localhost", port: 80 } }
// );

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about how bots work.
const adapter = new CloudAdapter(botFrameworkAuthentication);

// Catch-all for errors.
const onTurnErrorHandler = async (context, error) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights.
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Send a trace activity, which will be displayed in Bot Framework Emulator
  await context.sendTraceActivity(
    "OnTurnError Trace",
    `${error}`,
    "https://www.botframework.com/schemas/error",
    "TurnError"
  );

  // Send a message to the user
  await context.sendActivity("The bot encountered an error or bug.");
  await context.sendActivity(
    "To continue to run this bot, please fix the bot source code."
  );
};

// Set the onTurnError for the singleton CloudAdapter.
adapter.onTurnError = onTurnErrorHandler;

// Create the main dialog.
const myBot = new EchoBot();

// Listen for incoming requests.
server.post("/api/messages", async (req, res, next) => {
  // Route received a request to adapter for processing
  await adapter.process(req, res, (context) => myBot.run(context));
});

// Listen for Upgrade requests for Streaming.
server.on("upgrade", async (req, socket, head) => {
  // Create an adapter scoped to this WebSocket connection to allow storing session data.
  const streamingAdapter = new CloudAdapter(botFrameworkAuthentication);

  // Set onTurnError for the CloudAdapter created for each connection.
  streamingAdapter.onTurnError = onTurnErrorHandler;

  await streamingAdapter.process(
    req,
    socket as unknown as INodeSocket,
    head,
    (context) => myBot.run(context)
  );
});
