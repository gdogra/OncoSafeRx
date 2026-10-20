import express from 'express';
import REGIMENS from '../data/regimens.js';
import { evaluateRegimen } from '../engine/dosing/evaluate.js';

const router = express.Router();

// Context-aware dosing support.
// Rules live in data/dosing_rules.yaml (reviewable data); this route only wires them up.
// Output is decision support for a qualified clinician. Doses in calculatedDoses are the
// standard regimen doses and are NOT adjusted for the findings.
router.post('/adjust', (req, res) => {
  const { regimenId, labs = {}, phenotypes = {}, patient = {}, rounding = 5, medications = [], riskConditions = [] } = req.body || {};
  const regimen = REGIMENS.find((r) => r.id.toLowerCase() === String(regimenId || '').toLowerCase());
  if (!regimen) return res.status(404).json({ error: 'Regimen not found' });

  const { calculators, findings, calculatedDoses, interactionScreens } = evaluateRegimen({ regimen, labs, phenotypes, patient, rounding, medications, riskConditions });

  const messages = (pred) => findings.filter(pred).map((f) => f.message);
  res.json({
    regimen: { id: regimen.id, name: regimen.name },
    calculators,
    findings,
    // Flat lists kept for existing clients
    recommendations: messages((f) => ['delay', 'hold', 'reduce_dose', 'monitor', 'review'].includes(f.action)),
    warnings: messages((f) => ['avoid', 'cap'].includes(f.action)),
    dataGaps: messages((f) => f.kind === 'data_gap'),
    calculatedDoses,
    interactionScreens,
    regimenAdjustments: regimen.adjustments || [],
    disclaimer: 'Decision support only. Rules are drafts pending pharmacist/oncologist review. Verify against current labeling and your institutional protocol.',
  });
});

export default router;
