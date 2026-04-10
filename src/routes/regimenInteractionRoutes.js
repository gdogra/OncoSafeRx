import { Router } from 'express';
import regimenService from '../services/regimenInteractionService.js';

const router = Router();

/**
 * POST /api/regimen/analyze
 * Analyze a complete treatment regimen for interactions, cumulative toxicity, and PGx alerts.
 *
 * Body: {
 *   regimenDrugs: ['fluorouracil', 'leucovorin', 'oxaliplatin'],
 *   concomitantDrugs: ['warfarin', 'omeprazole', 'metformin'],
 *   pgxProfile: { DPYD: 'Intermediate Metabolizer', CYP2D6: 'Normal Metabolizer' }
 * }
 */
router.post('/analyze', (req, res) => {
  try {
    const { regimenDrugs, concomitantDrugs, pgxProfile } = req.body;

    if (!regimenDrugs || !Array.isArray(regimenDrugs) || regimenDrugs.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'regimenDrugs array is required (e.g., ["fluorouracil", "leucovorin", "oxaliplatin"])',
      });
    }

    const result = regimenService.analyzeRegimen({
      regimenDrugs,
      concomitantDrugs: concomitantDrugs || [],
      pgxProfile: pgxProfile || {},
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
