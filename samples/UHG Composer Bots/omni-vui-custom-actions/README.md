# omni-vui-custom-actions

Install this package from NPM to integrate some default custom actions into a Bot built with Bot Composer

## Local build

```bash
npm install
npm run build
```

## Install

```bash
npm install @advanceddevelopment/omni-vui-custom-actions
```
## Install

  Option #1: using Bot Composer
  
  ![image](https://github.optum.com/storage/user/49507/files/71a60dfd-7260-4a34-884e-f0102be48e80)

  Option #2: using cmd/shell

  ```
  1. npm install @advanceddevelopment/omni-vui-custom-actions

  2. add following to appsettings
      "components": [
      "@advanceddevelopment/omni-vui-custom-actions"
    ],

  3. update the bot schema by running following command in 'schemas' dir
      Windows: update-schema.ps1
      Linux: update-schema.sh
  ```

## Functionalities

## Configuration Loader
- Configuration Loader - fetch TFN configuration Azure Bolb Storage.

### Capabilities

- Validate the required parameter.
- fetch the configuration data from as json.
- save it to the result parameter provided.

### Getting Started

- add below configuration to appsettings.json or Key Vault.

- Connection String - Connection String for Azure Blob Storage.
- Container Name - Containter Name of Azure Blob Storage.

- Use/Integration in Bot Composer: click on + icon -> Custom Actions -> Configuration Loader

![image](https://github.optum.com/storage/user/49507/files/1748c262-0b14-4031-bfe0-286289557ef4)

## Functionalities
Omni-Logger : Encrypt the console logs in PROD.
Omni-TelemetryLogger : Track a custom event using the registered Telemetry Client and Encrypt in PROD.

## Omni-Logger
Encrypt the console logs in PROD. Appsettings should have the 32 Char Encryption Key and Environment details(like shown below)

"ENVIRONMENT": "Prod",
"ENCRYPTION_KEY": "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3",

In lower environments (other than 'PROD'), the values will not be encrypted. It will be in plain text only.
If App setting details are not available, the logs will be in plain text only.
Log setting option (Encrypted / Plain text) option will enable the encryption ON\OFF in the  'PROD' environment.

Note: the "ENCRYPTION_KEY" is required to decrypt the encrypted values. Sample code available in docs folder.

## Omni-TelemetryLogger
Track a custom event using the registered Telemetry Client and Encrypt in PROD. Appsettings should have the 32 Char Encryption Key and Environment details (like shown below)

"ENVIRONMENT": "Prod",
"ENCRYPTION_KEY": "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3",

In log option - Encrypted, if a particular "key - value" should be in plain text; use #PT# prefix in the respective key Example (#PT#Keyname).The component will skip the encryption for the particular key and rest will be encrypted. 

In lower environments (other than 'PROD'), the values will not be encrypted. It will be in plain text only.
If App setting details are not available, the logs will be in plain text only.
Log setting option (Encrypted / Plain text) option will enable the encryption ON\OFF in the  'PROD' environment.

Note: the "ENCRYPTION_KEY" is required to decrypt the encrypted values. Sample code available in docs folder.

## Omni-SensitiveData
Setting the 'Sensitive Data' dropdown to 'YES' will 

1) disable the TTS cache for a specific response from the bot.
2) hide sensitive information in syslog message of the VoiceAI.
3) disable the logging of user utterances in the LUIS.

Note:
Please let the lubuild to generate a configuration like this

"predictionOptions":{
  "log": "=dialog.log"
   }

Settings at VoiceAI and Luis should be set appropriately.

## Omni-Http Request
- HTTP Request - Make a HTTP request with timeout option and token cache.

### Capabilities
- Get Access Token with provided credentials with timeout option
- Make Http Request with timeout option.
- Use OAuth or Authorization Header for Authorization.
- Prompt Message to user during the Http Request in the given time interval.
- Add Custom Telemetry Event for the Prompt message, if provided.
- Retry ans Time Delay between Retry Options.
- Centralized Token Cache using Azure Blob Storage.
- Added Azure Blob Connection String and Container Name parameters.

Default Values
- Access Token Timeout : 1000 ms
- Http Request Timeout : 2000 ms
- Prompt Time : 1000 ms
- Token Content Type : application/json
- Http Request Content Type : application/json
- Retry : 0

- Retry option or verbiage Toggle any one option should be used.
- The Http request timeout should be a multiple of Prompt time.
- verbiage Toggle is true then First Prompt and Repeat Prompt message is mandatory.
- The Prompt message should contains Text and Speech.
- The Telemetry parameter should be a JSON Object and it should contain key "name".
- For Example :
{
  name: "Bot_Prompt_Peg", 
	properties: {
    "peg": "pegID",
    "pegType": "General",
    "request": =module.sendactivity(),
    "response": "",
    "appName": "BOTAI",
    "customMetrics": [{
      "AppName": "BOTAI",
      "Peg": "pegID",
      "PegType": "General",
      "Request": =module.sendactivity(),
      "Response": ""
   }
}

## Omni-TraceActivity
Send a encrypted trace activity to the transcript logger and/ or Bot Framework Emulator. Appsettings should have the 32 Char Encryption Key and Environment details (like shown below)

"ENVIRONMENT": "Prod",
"ENCRYPTION_KEY": "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3",

In lower environments (other than 'PROD'), the values will not be encrypted. It will be in plain text only.
If App setting details are not available, the logs will be in plain text only.
Log setting option (Encrypted / Plain text) option will enable the encryption ON\OFF in the  'PROD' environment.

Note: the "ENCRYPTION_KEY" is required to decrypt the encrypted values. Sample code available in docs folder.

