// Module 02 · Azure Functions — HTTP Trigger example
// Deploy this as an Azure Function App (separate from your App Service)
// Run locally with: func start
//
// Module 10 · Queue Worker — processes Service Bus messages async

// ─── HTTP Trigger (Module 02) ──────────────────────────────────────────────
// Triggered by POST /api/HttpTrigger
// Example: resize an image, send an email, run a scheduled task
async function httpTrigger(context, req) {
  context.log('[Function] HTTP trigger received');

  const action = req.body?.action || req.query?.action;

  if (action === 'ping') {
    return context.res = {
      status: 200,
      body: { message: 'Azure Function is running!', timestamp: new Date().toISOString() },
    };
  }

  context.res = {
    status: 400,
    body: { error: 'Unknown action. Try: { "action": "ping" }' },
  };
}

// ─── Service Bus Queue Trigger (Module 10) ─────────────────────────────────
// Triggered automatically when a message arrives on 'notes-queue'
// Bind this in function.json as a serviceBusTrigger
async function queueWorker(context, message) {
  context.log('[Function] Queue message received:', message);

  const { event, noteId, userId } = message;

  if (event === 'noteCreated') {
    // Simulate async processing — e.g. generate a summary, send a notification
    context.log(`[Function] Processing noteCreated for note ${noteId} by user ${userId}`);

    // In a real app you might call an AI service, update Cosmos DB, or send an email
    // const summary = await callOpenAI(noteContent);
    // await cosmos.updateNote(noteId, userId, { summary });
    context.log(`[Function] Note ${noteId} processed successfully`);
  }
}

// ─── Blob Trigger (Module 03 → Module 02) ──────────────────────────────────
// Triggered when a new blob lands in the 'uploads' container
// Bind in function.json: blobTrigger on "uploads/{name}"
async function blobTrigger(context, blobContent) {
  const blobName = context.bindingData.name;
  context.log(`[Function] Blob trigger fired for: ${blobName}`);

  // Example: validate file type, generate thumbnail, extract metadata
  const sizeKB = Math.round(blobContent.length / 1024);
  context.log(`[Function] Blob size: ${sizeKB} KB`);
}

module.exports = { httpTrigger, queueWorker, blobTrigger };
