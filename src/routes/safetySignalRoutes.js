import { Router } from 'express';
import safetySignalService from '../services/safetySignalService.js';
import multiDrugPGxService from '../services/multiDrugPGxService.js';
import sideEffectPredictionService from '../services/sideEffectPredictionService.js';

const router = Router();

/**
 * GET /api/safety-signals/:drug
 * Detect FAERS disproportionality signals for a drug.
 */
router.get('/signals/:drug', async (req, res) => {
  try {
    const data = await safetySignalService.detectSignals(req.params.drug);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/safety-signals/patient-check
 * Check signals for a patient's entire medication list.
 * Body: { medications: ['cisplatin', 'warfarin', ...] }
 */
router.post('/patient-check', async (req, res) => {
  try {
    const { medications } = req.body;
    if (!medications?.length) return res.status(400).json({ error: 'medications array required' });
    const data = await safetySignalService.checkPatientMedications(medications);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/safety-signals/pgx-report
 * Generate a multi-drug PGx report for a patient.
 * Body: { medications: [...], pgxResults: { DPYD: 'PM', CYP2D6: 'IM', ... } }
 */
router.post('/pgx-report', (req, res) => {
  try {
    const { medications, pgxResults } = req.body;
    if (!medications?.length) return res.status(400).json({ error: 'medications array required' });
    const report = multiDrugPGxService.generateMultiDrugPGxReport({
      medications,
      pgxResults: pgxResults || {},
    });
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/safety-signals/predict-side-effects
 * Predict personalized side effect risks combining FAERS + PGx.
 * Body: { drug, pgxProfile, concomitantDrugs, patientFactors }
 */
router.post('/predict-side-effects', async (req, res) => {
  try {
    const { drug, pgxProfile, concomitantDrugs, patientFactors } = req.body;
    if (!drug) return res.status(400).json({ error: 'drug name required' });
    const prediction = await sideEffectPredictionService.predictSideEffects({
      drug,
      pgxProfile: pgxProfile || {},
      concomitantDrugs: concomitantDrugs || [],
      patientFactors: patientFactors || {},
    });
    res.json({ success: true, data: prediction });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
