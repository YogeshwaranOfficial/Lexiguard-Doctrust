import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { logger } from './logger';

let containerClient: ContainerClient | null = null;

function getContainerClient(): ContainerClient {
  if (containerClient) return containerClient;

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'lexiguard-documents';

  if (!connectionString) {
    // For local dev without Azure, use a mock
    logger.warn('Azure Storage connection string not set — using mock mode');
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not configured');
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  containerClient = blobServiceClient.getContainerClient(containerName);
  return containerClient;
}

export async function uploadToBlob(
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  try {
    const client = getContainerClient();
    await client.createIfNotExists({ access: 'blob' });

    const timestamp = Date.now();
    const blobName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const blockBlobClient = client.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    logger.info(`Uploaded blob: ${blobName}`);
    return blockBlobClient.url;
  } catch (error) {
    logger.error('Blob upload error:', error);
    // In dev/mock mode, return a fake URL
    if (process.env.NODE_ENV === 'development') {
      return `https://mock-storage.blob.core.windows.net/lexiguard-documents/${Date.now()}-${fileName}`;
    }
    throw error;
  }
}

export async function deleteBlob(blobUrl: string): Promise<void> {
  try {
    const client = getContainerClient();
    const blobName = blobUrl.split('/').pop() || '';
    const blockBlobClient = client.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
    logger.info(`Deleted blob: ${blobName}`);
  } catch (error) {
    logger.error('Blob delete error:', error);
  }
}
