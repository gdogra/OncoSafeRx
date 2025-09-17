import express from 'express';

const router = express.Router();

// Simple SIG formatter
router.post('/sig', (req, res) => {
  const { drug = {}, dose, route, frequency, duration, indication } = req.body || {};
  const name = drug.name || 'Medication';
  const parts = [name];
  if (dose) parts.push(dose);
  if (route) parts.push(route);
  if (frequency) parts.push(frequency);
  if (duration) parts.push(`for ${duration}`);
  if (indication) parts.push(`for ${indication}`);
  const sig = parts.join(' ');
  res.json({ sig, drug: { name, rxcui: drug.rxcui || null } });
});

export default router;

