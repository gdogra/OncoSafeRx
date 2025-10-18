import express from 'express';

const router = express.Router();
const overrides = [];

// Record an override decision
// Body: { userId?, patientId?, context: { hook?: string, drugs?: any, regimenId?: string }, reason: string, action: 'override'|'accept' }
router.post('/', (req, res) => {
  const { userId, patientId, context = {}, reason, action } = req.body || {};
  if (!reason || !action) return res.status(400).json({ error: 'reason and action are required' });
  const rec = {
    id: String(overrides.length + 1),
    userId: userId || 'anon',
    patientId: patientId || null,
    context,
    reason,
    action,
    timestamp: new Date().toISOString()
  };
  overrides.unshift(rec);
  res.status(201).json(rec);
});

// List recent overrides
router.get('/', (req, res) => {
  const limit = parseInt(String(req.query.limit || '50'), 10);
  res.json({ count: overrides.length, overrides: overrides.slice(0, limit) });
});

export default router;

