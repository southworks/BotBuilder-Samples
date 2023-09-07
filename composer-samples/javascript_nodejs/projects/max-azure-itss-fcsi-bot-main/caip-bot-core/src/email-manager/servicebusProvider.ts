import { ServiceBusClient, ServiceBusMessage, ServiceBusSender, ServiceBusClientOptions } from "@azure/service-bus";
import { Logger } from "..//utils/logger";
import WebSocket from "ws";
import { HttpsProxyAgent } from "https-proxy-agent";
import { ServiceBusInfo } from "./emailManager";

export class ServiceBusProvider {

    protected sender: ServiceBusSender;
    protected queueClient: ServiceBusClient;
    protected serviceBusInfo: ServiceBusInfo;
    maxRetries : number = 3;
    retryDelay: number = 2000;
    
    logger = new Logger(__filename);

    constructor(serviceBusInfo:ServiceBusInfo) {
        this.serviceBusInfo = serviceBusInfo;
        if(!this.serviceBusInfo.maxRetries){
            this.serviceBusInfo.maxRetries = this.maxRetries;
        }
        if(!this.serviceBusInfo.retryDelay){
            this.serviceBusInfo.retryDelay = this.retryDelay;
        }

        this.logger.info('ServiceBusProvider', 'Creating client ServiceBusProvider instance');
    }

    getQueueClient(connectionString: string): ServiceBusClient {
        if (this.serviceBusInfo.proxyInfo === null || this.serviceBusInfo.proxyInfo === 'no_proxy') {
            return new ServiceBusClient(connectionString);
        } else {
            const proxyAgent = new HttpsProxyAgent(this.serviceBusInfo.proxyInfo);
            return new ServiceBusClient(connectionString, {
                webSocketOptions: {
                    webSocket: WebSocket,
                    webSocketConstructorOptions: { agent: proxyAgent }
                }
            });
        }
    }


    async sendMessage(message: ServiceBusMessage) {
        try {
            await this.sendMessageWithActivePassive(message);
        } catch (e) {
            this.logger.error('ServiceBusProvider', 'Unable to send the Message:'+e);
        }
        finally {
            this.logger.debug('ServiceBusProvider', 'Closed the ServiceBus Sender');
        }
    }

    async sendMessageWithActivePassive(message: ServiceBusMessage) {

        let isActive: boolean = true;
        let maxRetries = this.serviceBusInfo.maxRetries;
        do {
            try {
                const connectionString = (isActive? this.serviceBusInfo.activeConnectionString :
                        this.serviceBusInfo.passiveConnectionString);
                this.queueClient = this.getQueueClient(connectionString);
                this.sender =  this.queueClient.createSender(this.serviceBusInfo.queueName);
                this.logger.debug('ServiceBusProvider', 'Created the ServiceBus Sender');
                // Send the message
                await this.sender.sendMessages(message);
                this.logger.debug('ServiceBusProvider', 'Successfully sent the messages');
                return;
            } catch (e) {
                this.logger.error('ServiceBusProvider', 'Unable to send Message using active/passive config:' + isActive+'  ' + e);
                isActive = !isActive;
                this.logger.info('ServiceBusProvider', 'Using the Active/Passive Config:' + isActive);
                maxRetries--;
                await this.delay(2000);
            } finally{
                await this.queueClient.close();
            }
        } while (maxRetries > 0)

        throw new Error('Unable to send Message from Both Active & Passive Configurations');
    }

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}
