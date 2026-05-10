// Module 04 · Azure Cosmos DB — data access layer
// Uses the @azure/cosmos SDK to perform CRUD on the 'notes' container
const { CosmosClient } = require('@azure/cosmos');

let client, database, container;

/**
 * Lazily initialise the Cosmos client once on first use.
 * Module 07: in production, the COSMOS_KEY is fetched from Key Vault
 * at startup and injected into process.env by keyvault.js.
 */
async function getContainer() {
  if (container) return container;

  client = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY,
  });

  // Create the database and container if they don't exist (handy for local dev)
  const dbResponse = await client.databases.createIfNotExists({
    id: process.env.COSMOS_DATABASE || 'azurecourse',
  });
  database = dbResponse.database;

  const ctResponse = await database.containers.createIfNotExists({
    id: process.env.COSMOS_CONTAINER || 'notes',
    partitionKey: { paths: ['/userId'] },
  });
  container = ctResponse.container;

  console.log('[Cosmos] Connected to database:', database.id);
  return container;
}

// ── Notes ─────────────────────────────────────────────────────

async function queryNotes(userId) {
  const c = await getContainer();
  const { resources } = await c.items
    .query({
      query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC',
      parameters: [{ name: '@userId', value: userId }],
    })
    .fetchAll();
  return resources;
}

async function getNote(id, userId) {
  const c = await getContainer();
  const { resource } = await c.item(id, userId).read();
  return resource;
}

async function createNote(note) {
  const c = await getContainer();
  const { resource } = await c.items.create(note);
  return resource;
}

async function updateNote(id, userId, fields) {
  const c = await getContainer();
  const { resource: existing } = await c.item(id, userId).read();
  if (!existing) return null;
  const updated = { ...existing, ...fields, updatedAt: new Date().toISOString() };
  const { resource } = await c.item(id, userId).replace(updated);
  return resource;
}

async function deleteNote(id, userId) {
  const c = await getContainer();
  await c.item(id, userId).delete();
}

// ── File metadata (used by Module 09 Event Grid handler) ──────

async function markFileProcessed(userId, fileName) {
  const c = await getContainer();
  // Query for a file metadata record and mark it processed
  const { resources } = await c.items
    .query({
      query: 'SELECT * FROM c WHERE c.userId = @userId AND c.fileName = @fileName AND c.type = "file"',
      parameters: [
        { name: '@userId', value: userId },
        { name: '@fileName', value: fileName },
      ],
    })
    .fetchAll();

  if (resources.length === 0) return;
  const doc = resources[0];
  await c.item(doc.id, userId).replace({ ...doc, processed: true, processedAt: new Date().toISOString() });
}

module.exports = { queryNotes, getNote, createNote, updateNote, deleteNote, markFileProcessed };
