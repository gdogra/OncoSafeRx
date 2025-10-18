import express from 'express';
import REGIMENS from '../data/regimens.js';
import { calculateBSA, calculateCrCl } from '../engine/calculators.js';

const router = express.Router();

// Context-aware dosing (MVP rules)
router.post('/adjust', (req, res) => {
  const { regimenId, labs = {}, phenotypes = {}, patient = {}, rounding = 5 } = req.body || {};
  const regimen = REGIMENS.find(r => r.id.toLowerCase() === String(regimenId || '').toLowerCase());
  if (!regimen) return res.status(404).json({ error: 'Regimen not found' });

  const recs = [];
  const anc = labs.ANC;
  const platelets = labs.platelets;
  const crcl = labs.CrCl;
  const lvef = labs.LVEF;
  // Calculate CrCl if not provided
  let computedCrCl = crcl;
  if (!computedCrCl && patient && (patient.ageYears && patient.weightKg && patient.serumCreatinineMgDl)) {
    computedCrCl = calculateCrCl(patient);
  }
  if (computedCrCl) labs.CrCl = computedCrCl;
  // Calculate BSA if height/weight supplied
  let bsa = null;
  if (patient && (patient.heightCm && patient.weightKg)) {
    bsa = calculateBSA(patient.heightCm, patient.weightKg);
  }

  if (anc !== undefined && anc < 1500) recs.push('Delay cycle due to low ANC; consider G-CSF per risk.');
  if (platelets !== undefined && platelets < 100000) recs.push('Delay cycle due to thrombocytopenia.');
  if (computedCrCl !== undefined && computedCrCl !== null && computedCrCl < 30) recs.push('Renal impairment: reduce 5-FU dose and use caution with oxaliplatin.');
  if (lvef !== undefined && lvef < 50) recs.push('Low LVEF: hold anthracycline; cardiology evaluation.');

  // PGx demo rule: DPYD poor metabolizer with 5-FU regimens
  if (/5-FU/i.test(JSON.stringify(regimen.components || [])) && /poor/i.test((phenotypes.DPYD || '').toString())) {
    recs.push('DPYD PM: consider avoiding 5-FU or reduce starting dose by ≥50%.');
  }

  
  // Compute BSA-based doses where possible
  let calculatedDoses = [];
  const roundUnit = Number(rounding) && Number(rounding) > 0 ? Number(rounding) : 5;
  if (bsa && regimen.components && regimen.components.length) {
    calculatedDoses = regimen.components.map(c => {
      const m = /([0-9]+\.?[0-9]*)\s*mg\s*\/\s*m\^?2/i.exec(c.dose || '');
      if (m) {
        const mgPerM2 = parseFloat(m[1]);
        const totalMg = mgPerM2 * bsa;
        // Round to nearest N mg for practicality
        const rounded = Math.round(totalMg / roundUnit) * roundUnit;
        const roundingNote = `Rounded to nearest ${roundUnit} mg from ${Math.round(totalMg)} mg`;
        return { component: c.name, dose: c.dose, calculatedMg: Math.round(totalMg), roundedMg: rounded, note: roundingNote };
      }
      return { component: c.name, dose: c.dose };
    });
  }

  // Warnings (MVP): Vincristine max 2 mg cap; Capecitabine avoid if CrCl < 30; Anthracycline with low LVEF
  const warnings = [];
  const compsStr = JSON.stringify(regimen.components || []).toLowerCase();
  const vin = calculatedDoses.find(d => /vincristine/i.test(d.component || ""));
  if (vin && typeof vin.calculatedMg === "number" && vin.calculatedMg > 2000) {
    warnings.push("Vincristine dose exceeds 2 mg cap. Consider capping at 2 mg.");
  }
  if (typeof computedCrCl === "number" && computedCrCl < 30 && /capecitabine/.test(compsStr)) {
    warnings.push("CrCl < 30 mL/min: Avoid capecitabine per renal dosing guidance.");
  }
  if (typeof lvef === "number" && lvef < 50 && /doxorubicin/.test(compsStr)) {
    warnings.push("Low LVEF with anthracycline present (e.g., doxorubicin): hold and obtain cardiology evaluation.");
  }

  res.json({ regimen: { id: regimen.id, name: regimen.name }, calculators: { BSA: bsa, CrCl: computedCrCl }, recommendations: recs, warnings, calculatedDoses });

});

export default router;
