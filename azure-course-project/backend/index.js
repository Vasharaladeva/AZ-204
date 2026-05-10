// ─────────────────────────────────────────────────────────────
// Module 11 · Application Insights — must be initialised FIRST
// before any other require() so the SDK can monkey-patch http
// ─────────────────────────────────────────────────────────────
require('dotenv').config();

if (process.env.APPINSIGHTS_CONNECTION_STRING) {
  const appInsights = require('applicationinsights');
  appInsights
    .setup(process.env.APPINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .start();
  console.log('[AppInsights] Telemetry enabled');
}

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const healthRouter  = require('./routes/health');   // Module 01
const notesRouter   = require('./routes/notes');    // Module 04
const filesRouter   = require('./routes/files');    // Module 03
const eventsRouter  = require('./routes/events');   // Module 09
const { verifyToken } = require('./middleware/auth'); // Module 06

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

// ── Public routes ─────────────────────────────────────────────
app.use('/health', healthRouter);
app.use('/api/events/grid', eventsRouter); // Event Grid webhook (unauthenticated)

// ── Protected routes (Module 06 — JWT validation) ─────────────
app.use('/api', verifyToken);
app.use('/api/notes', notesRouter);
app.use('/api/files', filesRouter);

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);

  // Module 11 · Track exceptions in App Insights
  if (process.env.APPINSIGHTS_CONNECTION_STRING) {
    const appInsights = require('applicationinsights');
    appInsights.defaultClient?.trackException({ exception: err });
  }

  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`[Server] Running on http://localhost:${PORT}`));
