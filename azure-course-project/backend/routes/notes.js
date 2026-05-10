// Module 04 · Azure Cosmos DB — Notes CRUD
const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const cosmos = require('../services/cosmos');
const serviceBus = require('../services/serviceBus'); // Module 10

// GET /api/notes — list all notes for the authenticated user
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.oid; // from JWT (Module 06)
    const notes = await cosmos.queryNotes(userId);
    res.json(notes);
  } catch (err) {
    next(err);
  }
});

// GET /api/notes/:id — get single note
router.get('/:id', async (req, res, next) => {
  try {
    const note = await cosmos.getNote(req.params.id, req.user.oid);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    next(err);
  }
});

// POST /api/notes — create note
router.post('/', async (req, res, next) => {
  try {
    const { title, body } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const note = {
      id: uuidv4(),
      userId: req.user.oid,
      title,
      body: body || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await cosmos.createNote(note);

    // Module 10 · Push to Service Bus queue for async processing
    await serviceBus.sendMessage('notes-queue', {
      event: 'noteCreated',
      noteId: created.id,
      userId: created.userId,
    });

    // Module 11 · Track custom event in App Insights
    if (process.env.APPINSIGHTS_CONNECTION_STRING) {
      const ai = require('applicationinsights');
      ai.defaultClient?.trackEvent({ name: 'noteCreated', properties: { noteId: created.id } });
    }

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// PUT /api/notes/:id — update note
router.put('/:id', async (req, res, next) => {
  try {
    const { title, body } = req.body;
    const updated = await cosmos.updateNote(req.params.id, req.user.oid, { title, body });
    if (!updated) return res.status(404).json({ error: 'Note not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notes/:id — delete note
router.delete('/:id', async (req, res, next) => {
  try {
    await cosmos.deleteNote(req.params.id, req.user.oid);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
