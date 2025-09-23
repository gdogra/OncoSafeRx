import express from 'express';
import { calculateMME } from '../engine/calculators.js';
import { validate, schemas } from '../utils/validation.js';

const router = express.Router();

// Calculate Morphine Milligram Equivalent (MME)
router.post('/opiates/mme',
  validate(schemas.mmeCalc || schemas.passthrough, 'body'),
  (req, res) => {
    try {
      const { medications = [], patient_context = {} } = req.body || {};
      const result = calculateMME(medications);

      const risk = [];
      if (result.thresholds.cautionAt50) risk.push('Total MME ≥ 50/day');
      if (result.thresholds.avoidAbove90) risk.push('Total MME ≥ 90/day');

      // Patient-specific flags
      if ((patient_context.age || 0) >= 65) risk.push('Age ≥ 65: increased sensitivity');
      if (patient_context.respiratory || patient_context.sleep_apnea) risk.push('Respiratory disease or OSA');
      if (patient_context.pregnancy) risk.push('Pregnancy: avoid chronic opioid use');

      const recommendations = [];
      if (result.thresholds.cautionAt50) recommendations.push('Consider naloxone co-prescription and risk mitigation.');
      if (result.thresholds.avoidAbove90) recommendations.push('Avoid or justify high MME; taper to safer dose if possible.');

      res.json({
        totalMME: result.totalMME,
        perMedication: result.details,
        riskFlags: risk,
        recommendations
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Opioid safety check: co-prescribing, CYP risks, QT, organ function
router.post('/opiates/safety-check',
  validate(schemas.painSafetyCheck || schemas.passthrough, 'body'),
  (req, res) => {
    try {
      const { medications = [], patient_context = {}, phenotypes = {} } = req.body || {};
      const names = medications.map(m => String(m.name || m).toLowerCase());

      const findings = [];

      // CNS depressant combinations
      const hasOpioid = names.some(n => /(morphine|hydrocodone|oxycodone|hydromorphone|oxymorphone|codeine|tramadol|tapentadol|fentanyl|methadone|buprenorphine)/.test(n));
      const hasBenzo = names.some(n => /(diazepam|lorazepam|clonazepam|alprazolam|temazepam|midazolam)/.test(n));
      const hasZHypnotic = names.some(n => /(zolpidem|zopiclone|eszopiclone|zaleplon)/.test(n));
      const hasGabapentinoid = names.some(n => /(gabapentin|pregabalin)/.test(n));
      if (hasOpioid && (hasBenzo || hasZHypnotic)) {
        findings.push({
          severity: 'major',
          issue: 'Opioid + benzodiazepine/Z-drug',
          recommendation: 'Avoid co-prescribing; consider taper and non-sedating alternatives; ensure naloxone availability.',
          reason: 'Opioid + benzo/Z-drug',
          explanation: 'Additive CNS/respiratory depression; avoid co-prescribing or use lowest doses and consider naloxone.',
          references: [{ label: 'CDC Guideline 2022', url: 'https://www.cdc.gov/mmwr/volumes/71/rr/rr7103a1.htm' }]
        });
      }
      if (hasOpioid && hasGabapentinoid) {
        findings.push({
          severity: 'moderate',
          issue: 'Opioid + gabapentinoid',
          recommendation: 'Increased sedation/respiratory depression; use lowest effective doses and monitor.',
          reason: 'Opioid + gabapentinoid',
          explanation: 'Increased sedation/respiratory depression; FDA warns of serious breathing problems with co-use.',
          references: [{ label: 'FDA Safety', url: 'https://www.fda.gov/drugs/drug-safety-and-availability/fda-warns-about-serious-breathing-problems-seizure-and-nerve-pain-medicines-gabapentin-neurontin' }]
        });
      }

      // CYP3A4 inhibitors/inducers with oxycodone, fentanyl, methadone
      const cyp3a4Inhibitors = /(ketoconazole|itraconazole|voriconazole|clarithromycin|erythromycin|ritonavir|cobicistat|diltiazem|verapamil|grapefruit)/;
      const cyp3a4Inducers = /(rifampin|rifampicin|carbamazepine|phenytoin|phenobarbital|St\.?\s*john|nevirapine|efavirenz)/;
      const has3a4Inhib = names.some(n => cyp3a4Inhibitors.test(n));
      const has3a4Induc = names.some(n => cyp3a4Inducers.test(n));
      const affects3a4Opioid = names.some(n => /(oxycodone|fentanyl|methadone|hydrocodone)/.test(n));
      if (affects3a4Opioid && has3a4Inhib) {
        findings.push({ 
          severity: 'major', 
          issue: 'CYP3A4 inhibitor with opioid substrate', 
          recommendation: 'Avoid combination or reduce opioid dose; monitor for toxicity.',
          reason: 'CYP3A4 inhibitor present',
          explanation: 'CYP3A4 inhibitors can raise opioid levels (e.g., oxycodone/fentanyl/methadone/hydrocodone) → overdose risk; reduce dose/avoid and monitor.',
          references: [{ label: 'FDA Label', url: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2013/019516s074lbl.pdf' }]
        });
      }
      if (affects3a4Opioid && has3a4Induc) {
        findings.push({ 
          severity: 'moderate', 
          issue: 'CYP3A4 inducer with opioid substrate', 
          recommendation: 'May reduce analgesia; avoid or monitor closely.',
          reason: 'CYP3A4 inducer present',
          explanation: 'CYP3A4 inducers can lower opioid exposure → loss of analgesia or withdrawal; avoid or monitor closely.',
          references: [{ label: 'FDA Label', url: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2013/019516s074lbl.pdf' }]
        });
      }

      // CYP2D6 phenotype with codeine/tramadol
      const cyp2d6 = String(phenotypes.CYP2D6 || phenotypes.cyp2d6 || '').toLowerCase();
      const hasCodeineOrTramadol = names.some(n => /(codeine|tramadol)/.test(n));
      if (hasCodeineOrTramadol && (cyp2d6.includes('poor') || cyp2d6.includes('intermediate'))) {
        findings.push({ severity: 'major', issue: 'CYP2D6 PM/IM with codeine/tramadol', recommendation: 'Avoid; use non–CYP2D6-dependent opioid (e.g., morphine).', reason: 'CYP2D6 PM/IM reduces activation', explanation: 'Codeine/tramadol require CYP2D6 for activation; PM/IM phenotypes reduce analgesia and increase risk.', references: [{ label: 'CPIC Codeine', url: 'https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/' }] });
      }

      // Methadone + QT prolongation risk
      const hasMethadone = names.some(n => /methadone/.test(n));
      const qtAgents = /(amiodarone|sotalol|quinolone|ciprofloxacin|levofloxacin|ondansetron|haloperidol|ziprasidone|citalopram)/;
      const hasQTRisk = names.some(n => qtAgents.test(n));
      if (hasMethadone && hasQTRisk) {
        findings.push({ severity: 'major', issue: 'Methadone + QT-prolonging agents', recommendation: 'Avoid if possible; baseline and follow-up ECG; monitor electrolytes.', reason: 'QT-prolonging agents with methadone', explanation: 'Additive QT prolongation increases torsades risk; baseline/follow-up ECG and electrolytes; avoid if possible.', references: [{ label: 'FDA Methadone', url: 'https://www.fda.gov/drugs/postmarket-drug-safety-information-patients-and-providers/methadone-information' }] });
      }

      // Organ function cautions
      if (patient_context.renal_clearance !== undefined) {
        const crcl = Number(patient_context.renal_clearance);
        if (Number.isFinite(crcl) && crcl < 30 && names.some(n => /(morphine|codeine)/.test(n))) {
          findings.push({ severity: 'moderate', issue: 'Renal impairment with morphine/codeine', recommendation: 'Accumulation of active metabolites; prefer hydromorphone/fentanyl with careful dosing.', reason: 'CrCl < 30 with morphine/codeine', explanation: 'Active metabolites can accumulate in renal impairment; prefer alternatives with careful dosing.' });
        }
      }

      if (patient_context.liver_disease && names.some(n => /(oxycodone|hydrocodone|methadone)/.test(n))) {
        findings.push({ severity: 'moderate', issue: 'Hepatic impairment with CYP-metabolized opioids', recommendation: 'Start low and go slow; consider non-hepatic routes or agents.' });
      }

      // Naloxone suggestions
      const suggestNaloxone = (patient_context.age >= 65) || hasBenzo || (req.body.totalMME && req.body.totalMME >= 50) || patient_context.respiratory || patient_context.opioid_use_disorder;
      const recommendations = [];
      if (suggestNaloxone) {
        recommendations.push('Offer naloxone and counsel household on use.');
      }

      res.json({ findings, recommendations });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
