import express from 'express';
import REGIMENS from '../data/regimens.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { q } = req.query;
  let items = [...REGIMENS];
  if (q) {
    const t = String(q).toLowerCase();
    items = items.filter(r => r.name.toLowerCase().includes(t) || r.indication.toLowerCase().includes(t));
  }
  res.json({ count: items.length, regimens: items.map(r => ({ id: r.id, name: r.name, indication: r.indication })) });
});

router.get('/:id', (req, res) => {
  const item = REGIMENS.find(r => r.id.toLowerCase() === String(req.params.id).toLowerCase());
  if (!item) return res.status(404).json({ error: 'Regimen not found' });
  res.json(item);
});

export default router;

