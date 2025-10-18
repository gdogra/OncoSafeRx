import express from 'express';

const router = express.Router();
const changes = [];

router.get('/versions', (req, res) => {
  res.json({ count: changes.length, changes });
});

router.post('/versions', (req, res) => {
  const { component, version, description, author } = req.body || {};
  const entry = {
    id: String(changes.length + 1),
    component: component || 'unknown',
    version: version || new Date().toISOString(),
    description: description || '',
    author: author || 'system',
    timestamp: new Date().toISOString()
  };
  changes.unshift(entry);
  res.status(201).json(entry);
});

export default router;

