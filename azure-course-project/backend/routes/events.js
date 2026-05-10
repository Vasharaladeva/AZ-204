// Module 09 · Azure Event Grid — Webhook receiver
// Event Grid sends events here when blobs are created/updated
const router = require('express').Router();
const cosmos = require('../services/cosmos');

router.post('/', async (req, res) => {
  const events = req.body;
  if (!Array.isArray(events)) return res.status(400).send('Expected array');

  for (const event of events) {
    // ── Event Grid subscription validation handshake ──────────
    // When you first register this webhook, Event Grid sends a
    // validation event. You must echo back the validationCode.
    if (event.eventType === 'Microsoft.EventGrid.SubscriptionValidationEvent') {
      console.log('[EventGrid] Subscription validation handshake');
      return res.json({ validationResponse: event.data.validationCode });
    }

    // ── Handle blob created events (Module 03 → Module 09) ────
    if (event.eventType === 'Microsoft.Storage.BlobCreated') {
      const { url } = event.data;
      console.log('[EventGrid] Blob created:', url);

      // Extract userId and fileName from blob URL path convention:
      // https://<account>.blob.core.windows.net/<container>/<userId>/<fileName>
      const parts = new URL(url).pathname.split('/');
      const userId = parts[parts.length - 2];
      const fileName = parts[parts.length - 1];

      // Update the note/file metadata record in Cosmos DB
      try {
        await cosmos.markFileProcessed(userId, fileName);
        console.log(`[EventGrid] Marked ${fileName} as processed for user ${userId}`);
      } catch (err) {
        console.error('[EventGrid] Failed to update Cosmos:', err.message);
      }
    }
  }

  res.status(200).send('OK');
});

module.exports = router;
