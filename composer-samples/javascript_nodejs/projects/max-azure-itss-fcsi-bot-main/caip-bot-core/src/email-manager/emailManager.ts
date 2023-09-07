import { ServiceBusProvider } from "./servicebusProvider";
import { ServiceBusMessage } from "@azure/service-bus";
export class EmailManager {

    serviceProvider: ServiceBusProvider;

    /**
     * Email Manager 
     * 
     * @param connectionString: Service Bus ConnectionString
     * @param queueName: Service Bus Queue Name
     * @param proxyInfo: Proxy Info to connect to Service Bus using HTTP(S) Proxy instead of AMQP
     */
    constructor(serviceBusInfo:ServiceBusInfo) {
        //initalize the ServiceBusProvider
        this.serviceProvider = new ServiceBusProvider(serviceBusInfo);
    }

    async sendEmail(message: EmailMessageInfo) {

        if(!this.isValidateRequest(message)){
            throw Error('Invalid Message Format');
        }

        const serviceBusMsg = <ServiceBusMessage>{
            body: message
        };

        this.serviceProvider.sendMessage(serviceBusMsg);
    }

    hasOwnProperty<X extends {}, Y extends PropertyKey>
        (obj: X, prop: Y): obj is X & Record<Y, unknown> {
        return obj.hasOwnProperty(prop)
    }

    isValidateRequest(message: Object): boolean {

        if (!message ||
            !message.hasOwnProperty('contract') ||
            !message.hasOwnProperty('recipientEmail') ||
            !message.hasOwnProperty('emailTemplate') ||
            !message.hasOwnProperty('source') ||
            !message.hasOwnProperty('emailDetails') ||
            !message.hasOwnProperty('emailSubject')) {
            return false;
        }
        return true;

    }
}

export type EmailMessageInfo = {
    senderEmail: string;
    recipientEmail: string;
    source: string;
    emailTemplate: string;
    emailSubject: string;
    contract: Object;
    emailDetails: Object;
};


export type ServiceBusInfo = {
    activeConnectionString: string;
    passiveConnectionString: string;
    queueName: string;
    proxyInfo: string;
    maxRetries?: number;
    retryDelay?: number;
}