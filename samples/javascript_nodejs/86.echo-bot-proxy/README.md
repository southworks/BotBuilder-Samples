# echo-bot-proxy

Bot Framework v4 echo bot sample

This bot has been created using [Bot Framework](https://dev.botframework.com), it shows how to configure the bot to use it behind a corporative proxy.

## Prerequisites

- [Node.js](https://nodejs.org) version 16.16.0 or higher

    ```bash
    # determine node version
    node --version
    ```

## To try this sample

- Clone the repository

    ```bash
    git clone https://github.com/microsoft/botbuilder-samples.git
    ```

- In a terminal, navigate to `samples/javascript_nodejs/86.echo-bot-proxy`

    ```bash
    cd samples/javascript_nodejs/86.echo-bot-proxy
    ```

- Install modules

    ```bash
    npm install
    ```

- Set up the proxy variables

    This sample provides two options to work behind a proxy:
    
    **Option #1: Setting up the proxy variables globally for NodeJS**.
    
    - Add the `HTTP_PROXY` and `HTTPS_PROXY` values in the **.env** file. For testing you can use the localhost and an available port: 
    ```
        HTTP_PROXY=http://127.0.0.1:8080
        HTTPS_PROXY=http://127.0.0.1:8080
    ```
    - Make sure the code marked as option #1 is enabled in **index.js**.
    It will use the `node-global-proxy` package to configure and start the proxy with the provided env variables.

    > This option will route all the requests the bot make through the proxy.

    **Option #2: Setting up the proxy in the Connector Client Options**
    - Make sure the code marked as option #2 is enabled in **index.js**.
    - Fill in the `proxySettings` of _ConnectorClientOptions_ with the `host` and `port` for your proxy. For testing you can use the localhost and an available port:
    ```JavaScript
        { proxySettings: { host: '127.0.0.1', port: 8080 } }
    ```
    > This option will route the authentication requests that botbuilder make through the proxy. Other requests like calls to intranet APIs, will go out directly. 

    You can verify the routed requests with a tool like [straightforward](https://github.com/berstend/straightforward).

- Start the bot

    ```bash
    npm start
    ```

## Testing the bot using Bot Framework Emulator

[Bot Framework Emulator](https://github.com/microsoft/botframework-emulator) is a desktop application that allows bot developers to test and debug their bots on localhost or running remotely through a tunnel.

- Install the latest Bot Framework Emulator from [here](https://github.com/Microsoft/BotFramework-Emulator/releases)

### Connect to the bot using Bot Framework Emulator

- Launch Bot Framework Emulator
- File -> Open Bot
- Enter a Bot URL of `http://localhost:3978/api/messages`

## Interacting with the bot

Enter text in the emulator.  The text will be echoed back by the bot.

## Deploy the bot to Azure

To learn more about deploying a bot to Azure, see [Deploy your bot to Azure](https://aka.ms/azuredeployment) for a complete list of deployment instructions.

## Further reading

- [Bot Framework Documentation](https://docs.botframework.com)
- [Bot Basics](https://docs.microsoft.com/azure/bot-service/bot-builder-basics?view=azure-bot-service-4.0)
- [Activity processing](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-activity-processing?view=azure-bot-service-4.0)
- [Azure Bot Service Introduction](https://docs.microsoft.com/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
- [Azure Bot Service Documentation](https://docs.microsoft.com/azure/bot-service/?view=azure-bot-service-4.0)
- [Azure CLI](https://docs.microsoft.com/cli/azure/?view=azure-cli-latest)
- [Azure Portal](https://portal.azure.com)
- [Channels and Bot Connector Service](https://docs.microsoft.com/en-us/azure/bot-service/bot-concepts?view=azure-bot-service-4.0)
- [Restify](https://www.npmjs.com/package/restify)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [node-global-proxy](https://www.npmjs.com/package/node-global-proxy)
