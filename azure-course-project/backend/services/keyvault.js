// Module 07 · Azure Key Vault — fetch secrets at startup using Managed Identity
// In production the App Service has a System-Assigned Managed Identity
// that is granted "Key Vault Secrets User" role. No credentials needed.
const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');

let secretClient;

function getClient() {
  if (!secretClient) {
    const vaultUrl = `https://${process.env.KEY_VAULT_NAME}.vault.azure.net`;
    // DefaultAzureCredential works with Managed Identity in Azure
    // and with az login / environment variables locally
    secretClient = new SecretClient(vaultUrl, new DefaultAzureCredential());
  }
  return secretClient;
}

/**
 * Fetch a single secret by name.
 * Usage: const key = await keyVault.getSecret('cosmos-key');
 */
async function getSecret(name) {
  try {
    const secret = await getClient().getSecret(name);
    return secret.value;
  } catch (err) {
    console.error(`[KeyVault] Failed to get secret '${name}':`, err.message);
    throw err;
  }
}

/**
 * Bootstrap — called once at startup to hydrate process.env with
 * secrets from Key Vault. Falls back gracefully if Key Vault is not
 * configured (local dev with .env file).
 *
 * Module 07 step-by-step:
 * 1. Enable System-Assigned Managed Identity on the App Service
 * 2. Grant it "Key Vault Secrets User" role on the vault
 * 3. Store each secret with these exact names in Key Vault
 * 4. Call loadSecrets() before your express app starts
 */
async function loadSecrets() {
  if (!process.env.KEY_VAULT_NAME) {
    console.log('[KeyVault] KEY_VAULT_NAME not set — using .env file (local dev)');
    return;
  }

  console.log('[KeyVault] Loading secrets from vault:', process.env.KEY_VAULT_NAME);
  const secretMap = {
    'cosmos-key':                     'COSMOS_KEY',
    'cosmos-endpoint':                'COSMOS_ENDPOINT',
    'storage-connection-string':      'AZURE_STORAGE_CONNECTION_STRING',
    'service-bus-connection-string':  'SERVICE_BUS_CONNECTION_STRING',
    'appinsights-connection-string':  'APPINSIGHTS_CONNECTION_STRING',
  };

  await Promise.all(
    Object.entries(secretMap).map(async ([kvName, envName]) => {
      try {
        process.env[envName] = await getSecret(kvName);
        console.log(`[KeyVault]  ✓ ${kvName} → process.env.${envName}`);
      } catch {
        console.warn(`[KeyVault]  ✗ ${kvName} not found — keeping existing env value`);
      }
    })
  );
}

module.exports = { getSecret, loadSecrets };
