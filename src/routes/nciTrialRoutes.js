import { Router } from 'express';
import nciTrialService from '../services/nciTrialService.js';

const router = Router();

/**
 * GET /api/nci-trials/biomarker/:biomarker
 * Search NCI clinical trials by biomarker.
 */
router.get('/biomarker/:biomarker', async (req, res) => {
  try {
    const { biomarker } = req.params;
    const { cancerType, phase, limit } = req.query;
    const results = await nciTrialService.searchTrialsByBiomarker(biomarker, {
      cancerType: cancerType?.toString(),
      phase: phase?.toString(),
      limit: limit ? parseInt(limit.toString()) : 10,
    });
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/nci-trials/:nctId
 * Get trial detail by NCT ID.
 */
router.get('/:nctId', async (req, res) => {
  try {
    const trial = await nciTrialService.getTrialByNctId(req.params.nctId);
    if (!trial) return res.status(404).json({ success: false, error: 'Trial not found' });
    res.json({ success: true, data: trial });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
