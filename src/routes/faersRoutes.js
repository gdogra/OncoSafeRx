import { Router } from 'express';
import faersService from '../services/faersService.js';

const router = Router();

/**
 * GET /api/faers/adverse-events/:drug
 * Top adverse events for a drug from FDA FAERS.
 */
router.get('/adverse-events/:drug', async (req, res) => {
  try {
    const { drug } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const data = await faersService.getAdverseEvents(drug, limit);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/faers/serious-outcomes/:drug
 * Serious outcome breakdown (death, hospitalization, etc.) for a drug.
 */
router.get('/serious-outcomes/:drug', async (req, res) => {
  try {
    const { drug } = req.params;
    const data = await faersService.getSeriousOutcomes(drug);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/faers/concomitant/:drug
 * Most frequently co-reported drugs in adverse event reports.
 */
router.get('/concomitant/:drug', async (req, res) => {
  try {
    const { drug } = req.params;
    const limit = parseInt(req.query.limit) || 15;
    const data = await faersService.getConcomitantDrugs(drug, limit);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/faers/demographics/:drug
 * Age and sex distribution of adverse event reporters.
 */
router.get('/demographics/:drug', async (req, res) => {
  try {
    const { drug } = req.params;
    const data = await faersService.getDemographics(drug);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
