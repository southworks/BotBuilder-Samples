//import { describe } from 'mocha';
import { expect } from 'chai';
import sinon, { stub } from 'sinon';
import { ServiceBusProvider } from '../../src/email-manager/servicebusProvider';
import { ServiceBusMessage, ServiceBusSender, ServiceBusClient } from "@azure/service-bus";

const Mocha = require('mocha');

const mocha = new Mocha({ ui: 'bdd' });



describe('test the sendMessage function', () => {

    const activeConnectionString = "Endpoint=sb://xyz.com/;SharedAccessKeyName=keyName;SharedAccessKey=Activekey";
    const passiveConnectionString = "Endpoint=sb://xyz.com/;SharedAccessKeyName=keyName;SharedAccessKey=passiveKey";

    const testMessage: ServiceBusMessage = {
        body: { message: 'This is testMessage' }
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

    it('should send the message to the serviceBus', () => {

        let serviceBusProvider = new ServiceBusProvider(serviceBusInfoWithoutProxy);
      

        let mockServiceBusSender = <ServiceBusSender><unknown>{
            entityPath: "entityPath",
            isClosed: false,
            sendMessages: sinon.stub().returnsThis(),
            scheduleMessages: sinon.stub().returnsThis(),
            cancelScheduledMessages: sinon.stub().returnsThis(),
            close: sinon.stub().returnsThis(),
            createMessageBatch: sinon.stub().returnsThis()
        };

        let stubSB =  sinon.stub(ServiceBusClient.prototype, "createSender").returns(mockServiceBusSender);

        const sendMessageSpy = sinon.spy(serviceBusProvider, 'sendMessage');
        serviceBusProvider.sendMessage(testMessage);
        expect(sendMessageSpy.callCount).equal(1);

        sendMessageSpy.restore();
        stubSB.restore();
    });

    it('should thrown an error when sendMessage is called', () => {

        let serviceBusProvider = new ServiceBusProvider(serviceBusInfoWithoutProxy);

        let stubSB = sinon.stub(ServiceBusClient.prototype, "createSender").throws();

        const sendMessageSpy = sinon.spy(serviceBusProvider, 'sendMessage');
        serviceBusProvider.sendMessage(testMessage);
        expect(sendMessageSpy.callCount).equal(1);

        sendMessageSpy.restore();
        stubSB.restore();
    });

    it('should send the message to the serviceBus to Test Active/Passive Flow', ()=> {

        let serviceBusProvider = new ServiceBusProvider(serviceBusInfoWithoutProxy);

        let mockServiceBusSender = <ServiceBusSender><unknown>{
            entityPath: "entityPath",
            isClosed: false,
            sendMessages: sinon.stub().rejects('reject'),
            scheduleMessages: sinon.stub().returnsThis(),
            cancelScheduledMessages: sinon.stub().returnsThis(),
            close: sinon.stub().returnsThis(),
            createMessageBatch: sinon.stub().returnsThis()
        };

        let stubSB =  sinon.stub(ServiceBusClient.prototype, "createSender").returns(mockServiceBusSender);
        const sendMessageSpy = sinon.spy(serviceBusProvider, 'sendMessageWithActivePassive');
        serviceBusProvider.sendMessage(testMessage);
        expect(sendMessageSpy.callCount).equal(1);
        sendMessageSpy.restore();
        stubSB.restore();        
    });


    it('should send the message to the serviceBus with proxy setting', () => {

        let serviceBusProvider = new ServiceBusProvider(serviceBusInfoWithProxy);
      

        let mockServiceBusSender = <ServiceBusSender><unknown>{
            entityPath: "entityPath",
            isClosed: false,
            sendMessages: sinon.stub().returnsThis(),
            scheduleMessages: sinon.stub().returnsThis(),
            cancelScheduledMessages: sinon.stub().returnsThis(),
            close: sinon.stub().returnsThis(),
            createMessageBatch: sinon.stub().returnsThis()
        };

        let stubSB =  sinon.stub(ServiceBusClient.prototype, "createSender").returns(mockServiceBusSender);

        const sendMessageSpy = sinon.spy(serviceBusProvider, 'sendMessage');
        serviceBusProvider.sendMessage(testMessage);
        expect(sendMessageSpy.callCount).equal(1);

        sendMessageSpy.restore();
        stubSB.restore();
    });

});