// Module 10 · Azure Service Bus — send messages to a queue
// Used for reliable async processing (e.g. note summaries, notifications)
const { ServiceBusClient } = require('@azure/service-bus');

let sbClient;

function getClient() {
  if (!process.env.SERVICE_BUS_CONNECTION_STRING) return null;
  if (!sbClient) {
    sbClient = new ServiceBusClient(process.env.SERVICE_BUS_CONNECTION_STRING);
  }
  return sbClient;
}

/**
 * Send a JSON message to the specified Service Bus queue.
 * Module 10 — message-based solutions:
 *   - Sender (here) puts messages on the queue
 *   - Receiver (functions/queueWorker.js) processes them async
 */
async function sendMessage(queueName, payload) {
  const client = getClient();
  if (!client) {
    console.log('[ServiceBus] Not configured — skipping message send:', payload);
    return;
  }

  const sender = client.createSender(queueName);
  try {
    await sender.sendMessages({ body: payload, contentType: 'application/json' });
    console.log(`[ServiceBus] Message sent to queue '${queueName}':`, payload);
  } finally {
    await sender.close();
  }
}

module.exports = { sendMessage };
