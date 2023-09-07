import { EmailManager } from "../../src/email-manager/emailManager";
import { ServiceBusProvider } from "../../src/email-manager/servicebusProvider"
//import { describe } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

const Mocha = require('mocha');

const mocha = new Mocha({ ui: 'bdd' });

describe('test the EmailManager sendEmail function', () => {

    const activeConnectionString = "Endpoint=sb://xyz.com/;SharedAccessKeyName=keyName;SharedAccessKey=Activekey";
    const passiveConnectionString = "Endpoint=sb://xyz.com/;SharedAccessKeyName=keyName;SharedAccessKey=passiveKey";

    before(() => {
        process.env.CAIP_BOT_CORE_LOG_LEVEL = 'DEBUG'
    });

    const emailPayload = {
        "senderEmail": "UnitedHealthcare Automated Response <noreply-email@uhc.com>",
        "recipientEmail": "saravanan_kandaswamy@optum.com",
        "source": "chatbot",
        "emailTemplate": "uhc-tenant-uniqueId-benefits-ava-chatbot",
        "emailSubject": "Information You Requested",
        "contract": "This is Contract",
        "emailDetails": {
            "emailHeader": "Information You Requested",
            "emailBody": {
                "message": " Hello World"
            }
        }
    };

    const serviceBusInfoWithoutProxy = {
        "activeConnectionString":activeConnectionString,
        "passiveConnectionString":passiveConnectionString,
        "queueName":"queueName",
        "proxyInfo":"no_proxy"
    }

    const serviceBusInfoWithProxy = {
        "activeConnectionString":activeConnectionString,
        "passiveConnectionString":passiveConnectionString,
        "queueName":"queueName",
        "proxyInfo":"http://localhost:8080"
    }

    it('should send the email', () => {
        let emailManager = new EmailManager (serviceBusInfoWithProxy);

        let stubSP = sinon.stub(ServiceBusProvider.prototype, "sendMessage").returnsThis();

        const sendEmaileSpy = sinon.spy(emailManager, 'sendEmail');
        emailManager.sendEmail(emailPayload);
        expect(sendEmaileSpy.callCount).equal(1);

        stubSP.restore();

    });

    it('should send the email with Proxy', () => {
        let emailManager = new EmailManager (serviceBusInfoWithoutProxy);

        let stubSP = sinon.stub(ServiceBusProvider.prototype, "sendMessage").returnsThis();

        const sendEmaileSpy = sinon.spy(emailManager, 'sendEmail');
        emailManager.sendEmail(emailPayload);
        expect(sendEmaileSpy.callCount).equal(1);

        stubSP.restore();

    });
})