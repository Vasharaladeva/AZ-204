// Module 01 · App Service — Health check endpoint
// Azure App Service uses this for readiness/liveness probes
const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    module: 'Module 01 — Azure App Service Web Apps',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

module.exports = router;
