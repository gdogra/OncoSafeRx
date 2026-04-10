import { Router } from 'express';
import biomarkerService from '../services/biomarkerTherapyService.js';

const router = Router();

/**
 * GET /api/biomarkers/therapies/:biomarker
 * Look up approved therapies for a biomarker.
 */
router.get('/therapies/:biomarker', (req, res) => {
  const results = biomarkerService.getTherapiesForBiomarker(req.params.biomarker);
  res.json({ success: true, data: results, count: results.length });
});

/**
 * GET /api/biomarkers/tumor/:tumorType
 * Get all actionable biomarkers for a tumor type.
 */
router.get('/tumor/:tumorType', (req, res) => {
  const results = biomarkerService.getBiomarkersForTumor(req.params.tumorType);
  res.json({ success: true, data: results, count: results.length });
});

/**
 * GET /api/biomarkers/drug/:drugName
 * Check biomarker requirements for a drug.
 */
router.get('/drug/:drugName', (req, res) => {
  const results = biomarkerService.getBiomarkerRequirements(req.params.drugName);
  const pgx = biomarkerService.getPGxForDrug(req.params.drugName);
  res.json({ success: true, data: { biomarkerRequirements: results, pgxGuidelines: pgx } });
});

/**
 * POST /api/biomarkers/patient-match
 * Match a patient's biomarker profile to actionable therapies.
 * Body: { cancerType, biomarkers: ['EGFR L858R', ...], medications: ['tamoxifen', ...] }
 */
router.post('/patient-match', (req, res) => {
  const { cancerType, biomarkers, medications } = req.body;
  if (!cancerType) return res.status(400).json({ error: 'cancerType is required' });
  const results = biomarkerService.getActionableTherapies({
    cancerType,
    biomarkers: biomarkers || [],
    medications: medications || [],
  });
  res.json({ success: true, data: results });
});

/**
 * GET /api/biomarkers/all
 * List all biomarker-therapy mappings (reference endpoint).
 */
router.get('/all', (req, res) => {
  res.json({
    success: true,
    data: biomarkerService.BIOMARKER_THERAPY_MAP,
    count: biomarkerService.BIOMARKER_THERAPY_MAP.length,
  });
});

export default router;
