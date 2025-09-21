import express from 'express';
import partnerPGxService from '../services/geneDoseService.js';

const router = express.Router();

// Summarize PGx issues across a medication list (partner stub)
router.post('/partner/gene-dose/summarize', async (req, res) => {
  try {
    const { medications = [], phenotypes = {} } = req.body || {};
    const result = await partnerPGxService.summarizeMedList({ medications, phenotypes });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

