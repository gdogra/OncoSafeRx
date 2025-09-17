import express from 'express';
import REGIMENS from '../data/regimens.js';

const router = express.Router();

// Context-aware dosing (MVP rules)
router.post('/adjust', (req, res) => {
  const { regimenId, labs = {}, phenotypes = {} } = req.body || {};
  const regimen = REGIMENS.find(r => r.id.toLowerCase() === String(regimenId || '').toLowerCase());
  if (!regimen) return res.status(404).json({ error: 'Regimen not found' });

  const recs = [];
  const anc = labs.ANC;
  const platelets = labs.platelets;
  const crcl = labs.CrCl;
  const lvef = labs.LVEF;

  if (anc !== undefined && anc < 1500) recs.push('Delay cycle due to low ANC; consider G-CSF per risk.');
  if (platelets !== undefined && platelets < 100000) recs.push('Delay cycle due to thrombocytopenia.');
  if (crcl !== undefined && crcl < 30) recs.push('Renal impairment: reduce 5-FU dose and use caution with oxaliplatin.');
  if (lvef !== undefined && lvef < 50) recs.push('Low LVEF: hold anthracycline; cardiology evaluation.');

  // PGx demo rule: DPYD poor metabolizer with 5-FU regimens
  if (/5-FU/i.test(JSON.stringify(regimen.components || [])) && /poor/i.test((phenotypes.DPYD || '').toString())) {
    recs.push('DPYD PM: consider avoiding 5-FU or reduce starting dose by ≥50%.');
  }

  res.json({ regimen: { id: regimen.id, name: regimen.name }, recommendations: recs });
});

export default router;

