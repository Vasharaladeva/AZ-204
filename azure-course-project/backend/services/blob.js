// Module 03 · Azure Blob Storage — file upload / list / SAS URL / delete
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} = require('@azure/storage-blob');

let blobServiceClient;
const CONTAINER = process.env.AZURE_STORAGE_CONTAINER_NAME || 'uploads';

function getClient() {
  if (!blobServiceClient) {
    blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );
  }
  return blobServiceClient;
}

/**
 * Upload a file buffer to Blob Storage.
 * Blobs are namespaced by userId: <container>/<userId>/<fileName>
 */
async function uploadFile(userId, fileName, buffer, contentType) {
  const client = getClient();
  const containerClient = client.getContainerClient(CONTAINER);
  await containerClient.createIfNotExists({ access: 'private' });

  const blobName = `${userId}/${fileName}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType },
  });

  return {
    blobName,
    fileName,
    userId,
    contentType,
    size: buffer.length,
    uploadedAt: new Date().toISOString(),
    url: blockBlobClient.url,
  };
}

/**
 * List all blobs for a given userId prefix.
 */
async function listFiles(userId) {
  const containerClient = getClient().getContainerClient(CONTAINER);
  const files = [];

  for await (const blob of containerClient.listBlobsFlat({ prefix: `${userId}/` })) {
    files.push({
      blobName: blob.name,
      fileName: blob.name.replace(`${userId}/`, ''),
      size: blob.properties.contentLength,
      contentType: blob.properties.contentType,
      lastModified: blob.properties.lastModified,
    });
  }
  return files;
}

/**
 * Generate a short-lived SAS download URL (1 hour).
 * Module 03 — SAS tokens: time-limited, scoped access to a single blob.
 */
async function getSasUrl(userId, fileName) {
  const blobName = `${userId}/${fileName}`;
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

  // If we have explicit account credentials, generate SAS client-side
  if (accountName && accountKey) {
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const expiresOn = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: CONTAINER,
        blobName,
        permissions: BlobSASPermissions.parse('r'),
        expiresOn,
      },
      sharedKeyCredential
    ).toString();

    return `https://${accountName}.blob.core.windows.net/${CONTAINER}/${blobName}?${sasToken}`;
  }

  // Fallback: return the direct URL (works for public containers in dev)
  const containerClient = getClient().getContainerClient(CONTAINER);
  return containerClient.getBlockBlobClient(blobName).url;
}

async function deleteFile(userId, fileName) {
  const containerClient = getClient().getContainerClient(CONTAINER);
  await containerClient.getBlockBlobClient(`${userId}/${fileName}`).deleteIfExists();
}

module.exports = { uploadFile, listFiles, getSasUrl, deleteFile };
