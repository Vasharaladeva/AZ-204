// Module 03 · Azure Blob Storage — File upload / download / list
const router = require('express').Router();
const multer = require('multer');
const blobService = require('../services/blob');

// Use memory storage so we can stream directly to Azure
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// GET /api/files — list all files for this user
router.get('/', async (req, res, next) => {
  try {
    const files = await blobService.listFiles(req.user.oid);
    res.json(files);
  } catch (err) {
    next(err);
  }
});

// POST /api/files — upload a file
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const result = await blobService.uploadFile(
      req.user.oid,
      req.file.originalname,
      req.file.buffer,
      req.file.mimetype
    );

    // Module 11 · Track upload event
    if (process.env.APPINSIGHTS_CONNECTION_STRING) {
      const ai = require('applicationinsights');
      ai.defaultClient?.trackEvent({
        name: 'fileUploaded',
        properties: { fileName: req.file.originalname, size: String(req.file.size) },
      });
    }

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/files/:blobName/download — get a time-limited SAS download URL
router.get('/:blobName/download', async (req, res, next) => {
  try {
    const url = await blobService.getSasUrl(req.user.oid, req.params.blobName);
    res.json({ url });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/files/:blobName — delete a file
router.delete('/:blobName', async (req, res, next) => {
  try {
    await blobService.deleteFile(req.user.oid, req.params.blobName);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
