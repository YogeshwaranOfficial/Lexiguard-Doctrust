import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import { logger } from './logger';

let secretClient: SecretClient | null = null;

function getSecretClient(): SecretClient {
  if (secretClient) return secretClient;

  const vaultUrl = process.env.AZURE_KEY_VAULT_URL;
  if (!vaultUrl) {
    throw new Error('AZURE_KEY_VAULT_URL is not configured');
  }

  const credential = new DefaultAzureCredential();
  secretClient = new SecretClient(vaultUrl, credential);
  return secretClient;
}

export async function getSecret(secretName: string): Promise<string> {
  try {
    const client = getSecretClient();
    const secret = await client.getSecret(secretName);
    return secret.value || '';
  } catch (error) {
    logger.error(`Failed to retrieve secret '${secretName}':`, error);
    // Fallback to env var in dev
    const envValue = process.env[secretName.toUpperCase().replace(/-/g, '_')];
    if (envValue) {
      logger.warn(`Using env var fallback for '${secretName}'`);
      return envValue;
    }
    throw error;
  }
}

export async function initSecretsFromKeyVault(): Promise<void> {
  if (!process.env.AZURE_KEY_VAULT_URL) {
    logger.info('Key Vault URL not set, skipping Key Vault initialization');
    return;
  }

  try {
    logger.info('Initializing secrets from Azure Key Vault...');
    const [dbUrl, storageConn, jwtSecret] = await Promise.all([
      getSecret('database-url'),
      getSecret('azure-storage-connection-string'),
      getSecret('jwt-secret'),
    ]);

    if (dbUrl) process.env.DATABASE_URL = dbUrl;
    if (storageConn) process.env.AZURE_STORAGE_CONNECTION_STRING = storageConn;
    if (jwtSecret) process.env.JWT_SECRET = jwtSecret;

    logger.info('Secrets loaded from Key Vault successfully');
  } catch (error) {
    logger.warn('Key Vault initialization failed, using env vars:', error);
  }
}
