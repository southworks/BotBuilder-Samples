import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential,ClientSecretCredential, TokenCredential } from "@azure/identity";
import { Logger } from "..//utils/logger";

export class KeyVaultSecretsFetcher {
  
    protected keyVaultUrl: string;
    protected tenantId:string;
    protected clientId:string;
    protected secret:string;
    protected client:SecretClient;
    
    logger = new Logger(__filename);

    constructor(keyVaultUrl: string, tenantId?:string, clientId?:string, secret?:string) {
        this.tenantId = tenantId;
        this.clientId = clientId;
        this.secret = secret;
        this.keyVaultUrl = keyVaultUrl;
        const tokenCredential = this.getTokenCredentials();
        this.logger.info('KeyVaultSecretsFetcher', 'Creating KeyVaultSecretsFetcher instance');
        this.client = new SecretClient(this.keyVaultUrl,tokenCredential );
    }

    protected getTokenCredentials():TokenCredential{
        if(this.clientId ===undefined || this.secret === undefined || this.tenantId === undefined){

            // DefaultAzureCredential expects the following three environment variables:
            // - AZURE_TENANT_ID: The tenant ID in Azure Active Directory
            // - AZURE_CLIENT_ID: The application (client) ID registered in the AAD tenant
            // - AZURE_CLIENT_SECRET: The client secret for the registered application
            return new DefaultAzureCredential();
        } else{

            return new ClientSecretCredential(
                this.tenantId, 
                this.clientId,
                this.secret 
              );     
        }
    }

    async getSecretForKey(secretName: string): Promise<string> {
        this.logger.debug('KeyVaultSecretsFetcher', 'Retrieving the particular set of Key Vault');
        const secretKey = await this.client.getSecret(secretName);
        this.logger.debug('KeyVaultSecretsFetcher', 'Retrieved the particular set of Key Vault');
        return secretKey.value;
    }
}
