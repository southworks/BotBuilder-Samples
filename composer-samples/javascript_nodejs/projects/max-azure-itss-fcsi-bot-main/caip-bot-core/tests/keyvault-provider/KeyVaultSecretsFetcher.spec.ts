import {KeyVaultSecretsFetcher} from './../../src/keyvault-provider/keyVaultSecretFetcher'
//import { describe } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { SecretClient, KeyVaultSecret } from "@azure/keyvault-secrets";
import "mocha";



describe('test the KeyVaultSecretsFetcher getSecretForKey function', () => {
    before(() => {
        process.env.CAIP_BOT_CORE_LOG_LEVEL='ERROR'
    });

    it('should retrieve the Secret for the Key with DefaultCredentials', async () => {

        let keyVaultSecretFetcher = new KeyVaultSecretsFetcher(
            "https://caip-abcdd-dev.vault.azure.net/"
        );

        let sandbox = sinon.createSandbox();
        
        let keyVaultSecret = <KeyVaultSecret><unknown>{
            name:"bank",
            value:"dummy"            
        };

        let stubSB =  sandbox.stub(SecretClient.prototype, "getSecret").resolves(keyVaultSecret);
        let secretValue = await keyVaultSecretFetcher.getSecretForKey("bankSecret1620023530364");
        expect(secretValue).equal("dummy");
        expect(stubSB.callCount).equal(1);
        sandbox.restore();
        
    }); 

    it('should retrieve the Secret for the Key without DefaultCredentials', async () => {

        let keyVaultSecretFetcher = new KeyVaultSecretsFetcher(
            "tenantId",
            "clientId",
            "secret",
            "https://caip-abcdd-dev.vault.azure.net/"
        );

        let sandbox = sinon.createSandbox();
        
        let keyVaultSecret = <KeyVaultSecret><unknown>{
            name:"bank",
            value:"dummy"            
        };

        let stubSB =  sandbox.stub(SecretClient.prototype, "getSecret").resolves(keyVaultSecret);
        let secretValue = await keyVaultSecretFetcher.getSecretForKey("bankSecret1620023530364");
        expect(secretValue).equal("dummy");
        expect(stubSB.callCount).equal(1);
        sandbox.restore();
        
    }); 
})