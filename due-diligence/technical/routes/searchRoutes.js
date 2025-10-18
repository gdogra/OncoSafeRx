import express from 'express';
import { RxNormService } from '../services/rxnormService.js';

const router = express.Router();
const rx = new RxNormService();

// Basic synonyms map (placeholder for vector search)
const SYNONYMS = {
  'acetylsalicylic acid': ['aspirin'],
  'proton pump inhibitor': ['omeprazole', 'pantoprazole', 'esomeprazole']
};

router.get('/synonyms', (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  const hits = Object.entries(SYNONYMS)
    .filter(([k]) => k.includes(q))
    .map(([k, v]) => ({ term: k, synonyms: v }));
  res.json({ count: hits.length, results: hits });
});

router.get('/drugs', async (req, res) => {
  try {
    const q = String(req.query.q || '');
    const a = await rx.searchDrugs(q);
    res.json({ count: a.length, results: a });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

