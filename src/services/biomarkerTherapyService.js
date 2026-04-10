/**
 * Biomarker-to-Therapy Mapping Service
 *
 * Maps actionable biomarkers to FDA-approved therapies and evidence levels.
 * Sources: FDA approvals, NCCN Compendium, OncoKB, CPIC guidelines.
 *
 * This is the core precision oncology feature — given a tumor's biomarker
 * profile, return all approved/guideline-recommended therapies.
 */

import { CPIC_GUIDELINES_EXPANDED } from '../data/cpicGuidelinesExpanded.js';

/**
 * Actionable biomarker database.
 * Each entry: biomarker → tumor type → approved therapies.
 */
const BIOMARKER_THERAPY_MAP = [
  // ── NSCLC ──────────────────────────────────────────────────────
  { biomarker: 'EGFR exon 19 del / L858R', tumorTypes: ['NSCLC'], therapies: [
    { drug: 'Osimertinib', line: '1L', evidence: 'FDA/NCCN Category 1', note: 'Preferred first-line for EGFR-mutant NSCLC' },
    { drug: 'Erlotinib', line: '1L/2L', evidence: 'FDA', note: 'First-gen TKI; osimertinib now preferred' },
    { drug: 'Gefitinib', line: '1L', evidence: 'FDA', note: 'First-gen TKI' },
    { drug: 'Afatinib', line: '1L', evidence: 'FDA', note: 'Second-gen TKI' },
    { drug: 'Dacomitinib', line: '1L', evidence: 'FDA', note: 'Second-gen TKI' },
  ]},
  { biomarker: 'EGFR T790M', tumorTypes: ['NSCLC'], therapies: [
    { drug: 'Osimertinib', line: '2L+', evidence: 'FDA', note: 'Only TKI active against T790M resistance mutation' },
  ]},
  { biomarker: 'EGFR exon 20 insertion', tumorTypes: ['NSCLC'], therapies: [
    { drug: 'Amivantamab', line: '2L+', evidence: 'FDA', note: 'Bispecific EGFR-MET antibody' },
    { drug: 'Mobocertinib', line: '2L+', evidence: 'FDA (withdrawn)', note: 'Voluntarily withdrawn; check current status' },
  ]},
  { biomarker: 'ALK fusion', tumorTypes: ['NSCLC'], therapies: [
    { drug: 'Alectinib', line: '1L', evidence: 'FDA/NCCN Preferred', note: 'CNS-penetrant; preferred over crizotinib' },
    { drug: 'Brigatinib', line: '1L/2L', evidence: 'FDA', note: 'Active against some ALK resistance mutations' },
    { drug: 'Lorlatinib', line: '2L+', evidence: 'FDA', note: 'Third-gen ALK TKI; also 1L option' },
    { drug: 'Crizotinib', line: '1L', evidence: 'FDA', note: 'First ALK inhibitor; alectinib now preferred' },
    { drug: 'Ceritinib', line: '1L/2L', evidence: 'FDA', note: 'Active against crizotinib-resistant ALK+ NSCLC' },
  ]},
  { biomarker: 'ROS1 fusion', tumorTypes: ['NSCLC'], therapies: [
    { drug: 'Crizotinib', line: '1L', evidence: 'FDA', note: 'Standard for ROS1+ NSCLC' },
    { drug: 'Entrectinib', line: '1L', evidence: 'FDA', note: 'CNS-penetrant; preferred if brain mets' },
  ]},
  { biomarker: 'BRAF V600E', tumorTypes: ['NSCLC', 'Melanoma', 'Colorectal', 'Thyroid', 'Hairy Cell Leukemia'], therapies: [
    { drug: 'Dabrafenib + Trametinib', line: '1L/2L', evidence: 'FDA', note: 'BRAF + MEK inhibitor combination' },
    { drug: 'Vemurafenib', line: '1L (melanoma)', evidence: 'FDA', note: 'Single-agent or with cobimetinib' },
    { drug: 'Encorafenib + Binimetinib', line: '1L (melanoma)', evidence: 'FDA', note: 'BRAF + MEK inhibitor combination' },
    { drug: 'Encorafenib + Cetuximab', line: '3L+ (CRC)', evidence: 'FDA', note: 'BRAF V600E CRC-specific combination' },
  ]},
  { biomarker: 'RET fusion', tumorTypes: ['NSCLC', 'Thyroid'], therapies: [
    { drug: 'Selpercatinib', line: '1L+', evidence: 'FDA', note: 'Selective RET inhibitor' },
    { drug: 'Pralsetinib', line: '1L+', evidence: 'FDA', note: 'Selective RET inhibitor' },
  ]},
  { biomarker: 'RET mutation', tumorTypes: ['Medullary Thyroid Cancer'], therapies: [
    { drug: 'Selpercatinib', line: '1L+', evidence: 'FDA', note: 'For RET-mutant MTC' },
    { drug: 'Cabozantinib', line: '2L+', evidence: 'FDA', note: 'Multi-kinase including RET' },
    { drug: 'Vandetanib', line: '2L+', evidence: 'FDA', note: 'Multi-kinase including RET' },
  ]},
  { biomarker: 'MET exon 14 skipping', tumorTypes: ['NSCLC'], therapies: [
    { drug: 'Capmatinib', line: '1L+', evidence: 'FDA', note: 'Selective MET inhibitor' },
    { drug: 'Tepotinib', line: '1L+', evidence: 'FDA', note: 'Selective MET inhibitor' },
  ]},
  { biomarker: 'MET amplification', tumorTypes: ['NSCLC'], therapies: [
    { drug: 'Capmatinib', line: '2L+', evidence: 'FDA', note: 'For high-level MET amplification' },
  ]},
  { biomarker: 'KRAS G12C', tumorTypes: ['NSCLC', 'Colorectal'], therapies: [
    { drug: 'Sotorasib', line: '2L+ (NSCLC)', evidence: 'FDA', note: 'First KRAS-targeted therapy' },
    { drug: 'Adagrasib', line: '2L+ (NSCLC)', evidence: 'FDA', note: 'Second KRAS G12C inhibitor' },
  ]},
  { biomarker: 'NTRK fusion', tumorTypes: ['Any solid tumor'], therapies: [
    { drug: 'Larotrectinib', line: 'Any', evidence: 'FDA (tissue-agnostic)', note: 'For NTRK1/2/3 fusions' },
    { drug: 'Entrectinib', line: 'Any', evidence: 'FDA (tissue-agnostic)', note: 'Also covers ROS1' },
  ]},
  { biomarker: 'HER2 amplification/overexpression', tumorTypes: ['Breast', 'Gastric/GEJ', 'Colorectal', 'NSCLC'], therapies: [
    { drug: 'Trastuzumab', line: '1L', evidence: 'FDA', note: 'Standard HER2-targeted therapy' },
    { drug: 'Trastuzumab deruxtecan (T-DXd)', line: '2L+ (breast/gastric), HER2-low', evidence: 'FDA', note: 'ADC; active in HER2-low breast cancer' },
    { drug: 'Pertuzumab + Trastuzumab', line: '1L (breast)', evidence: 'FDA', note: 'Dual HER2 blockade' },
    { drug: 'Tucatinib + Trastuzumab', line: '3L+ (breast)', evidence: 'FDA', note: 'CNS-penetrant; for brain mets' },
    { drug: 'Trastuzumab emtansine (T-DM1)', line: '2L+ (breast)', evidence: 'FDA', note: 'ADC' },
  ]},

  // ── Pan-tumor Biomarkers ───────────────────────────────────────
  { biomarker: 'MSI-H / dMMR', tumorTypes: ['Any solid tumor'], therapies: [
    { drug: 'Pembrolizumab', line: '2L+ (tissue-agnostic); 1L (CRC)', evidence: 'FDA', note: 'First tissue-agnostic approval based on biomarker' },
    { drug: 'Nivolumab ± Ipilimumab', line: '2L+ (CRC)', evidence: 'FDA', note: 'For MSI-H/dMMR CRC' },
    { drug: 'Dostarlimab', line: '2L+ (solid tumors)', evidence: 'FDA', note: 'For dMMR recurrent/advanced solid tumors' },
  ]},
  { biomarker: 'TMB-High (≥10 mut/Mb)', tumorTypes: ['Any solid tumor'], therapies: [
    { drug: 'Pembrolizumab', line: '2L+', evidence: 'FDA', note: 'For TMB-H solid tumors after prior therapy' },
  ]},
  { biomarker: 'PD-L1 ≥50%', tumorTypes: ['NSCLC'], therapies: [
    { drug: 'Pembrolizumab', line: '1L', evidence: 'FDA/NCCN Preferred', note: 'Monotherapy for PD-L1 ≥50% without EGFR/ALK' },
    { drug: 'Atezolizumab', line: '1L', evidence: 'FDA', note: 'Alternative anti-PD-L1 monotherapy' },
  ]},

  // ── Breast Cancer ──────────────────────────────────────────────
  { biomarker: 'BRCA1/2 mutation (germline)', tumorTypes: ['Breast', 'Ovarian', 'Pancreatic', 'Prostate'], therapies: [
    { drug: 'Olaparib', line: '1L+ maintenance or later lines', evidence: 'FDA', note: 'PARP inhibitor across BRCA-mutant tumor types' },
    { drug: 'Talazoparib', line: '1L+ (gBRCA breast)', evidence: 'FDA', note: 'Most potent PARP trapper' },
    { drug: 'Rucaparib', line: '2L+ (ovarian, prostate)', evidence: 'FDA', note: 'PARP inhibitor' },
    { drug: 'Niraparib', line: 'Maintenance (ovarian)', evidence: 'FDA', note: 'PARP inhibitor; works in HRD+ beyond BRCA' },
  ]},
  { biomarker: 'PIK3CA mutation', tumorTypes: ['Breast'], therapies: [
    { drug: 'Alpelisib + Fulvestrant', line: '2L+ (HR+/HER2-)', evidence: 'FDA', note: 'PI3Kα-selective inhibitor' },
  ]},
  { biomarker: 'ESR1 mutation', tumorTypes: ['Breast'], therapies: [
    { drug: 'Elacestrant', line: '2L+ (HR+/HER2-)', evidence: 'FDA', note: 'Oral SERD for ESR1-mutant ER+ breast cancer' },
  ]},

  // ── Colorectal Cancer ──────────────────────────────────────────
  { biomarker: 'KRAS/NRAS wild-type', tumorTypes: ['Colorectal'], therapies: [
    { drug: 'Cetuximab', line: '1L-3L', evidence: 'FDA', note: 'Anti-EGFR; only for RAS wild-type (left-sided preferred)' },
    { drug: 'Panitumumab', line: '1L-3L', evidence: 'FDA', note: 'Anti-EGFR; only for RAS wild-type' },
  ]},

  // ── Hematologic Malignancies ───────────────────────────────────
  { biomarker: 'BCR-ABL1 (Philadelphia chromosome)', tumorTypes: ['CML', 'Ph+ ALL'], therapies: [
    { drug: 'Imatinib', line: '1L (CML)', evidence: 'FDA', note: 'Standard first-line for CP-CML' },
    { drug: 'Dasatinib', line: '1L/2L', evidence: 'FDA', note: 'Second-gen TKI' },
    { drug: 'Nilotinib', line: '1L/2L', evidence: 'FDA', note: 'Second-gen TKI' },
    { drug: 'Bosutinib', line: '2L+', evidence: 'FDA', note: 'For TKI-resistant CML' },
    { drug: 'Ponatinib', line: '3L+ / T315I', evidence: 'FDA', note: 'Only TKI for T315I mutation' },
    { drug: 'Asciminib', line: '3L+', evidence: 'FDA', note: 'Allosteric BCR-ABL inhibitor (STAMP inhibitor)' },
  ]},
  { biomarker: 'FLT3-ITD / FLT3-TKD', tumorTypes: ['AML'], therapies: [
    { drug: 'Midostaurin + chemotherapy', line: '1L', evidence: 'FDA', note: 'Added to 7+3 induction for FLT3+ AML' },
    { drug: 'Gilteritinib', line: '2L+ (R/R AML)', evidence: 'FDA', note: 'Selective FLT3 inhibitor' },
    { drug: 'Quizartinib', line: '1L (FLT3-ITD)', evidence: 'FDA', note: 'Selective FLT3-ITD inhibitor' },
  ]},
  { biomarker: 'IDH1 R132 mutation', tumorTypes: ['AML', 'Cholangiocarcinoma'], therapies: [
    { drug: 'Ivosidenib', line: '1L (AML); 2L+ (cholangiocarcinoma)', evidence: 'FDA', note: 'IDH1 inhibitor' },
  ]},
  { biomarker: 'IDH2 mutation', tumorTypes: ['AML'], therapies: [
    { drug: 'Enasidenib', line: '2L+ (R/R AML)', evidence: 'FDA', note: 'IDH2 inhibitor' },
  ]},

  // ── GI Cancers ─────────────────────────────────────────────────
  { biomarker: 'FGFR2 fusion/rearrangement', tumorTypes: ['Cholangiocarcinoma'], therapies: [
    { drug: 'Pemigatinib', line: '2L+', evidence: 'FDA', note: 'FGFR1-3 inhibitor' },
    { drug: 'Futibatinib', line: '2L+', evidence: 'FDA', note: 'Irreversible FGFR1-4 inhibitor' },
    { drug: 'Infigratinib', line: '2L+', evidence: 'FDA', note: 'FGFR1-3 inhibitor' },
  ]},
  { biomarker: 'Claudin 18.2 positive', tumorTypes: ['Gastric/GEJ'], therapies: [
    { drug: 'Zolbetuximab + chemotherapy', line: '1L', evidence: 'FDA', note: 'First Claudin 18.2-targeted therapy' },
  ]},
];

/**
 * Look up therapies for a given biomarker.
 * @param {string} biomarker - e.g., "EGFR exon 19 del", "BRCA1 mutation"
 * @returns {Array} Matching biomarker-therapy entries
 */
export function getTherapiesForBiomarker(biomarker) {
  const q = biomarker.toLowerCase();
  return BIOMARKER_THERAPY_MAP.filter(entry =>
    entry.biomarker.toLowerCase().includes(q)
  );
}

/**
 * Look up biomarkers and therapies for a tumor type.
 * @param {string} tumorType - e.g., "NSCLC", "Breast", "CML"
 * @returns {Array} All actionable biomarkers for that tumor type
 */
export function getBiomarkersForTumor(tumorType) {
  const q = tumorType.toLowerCase();
  return BIOMARKER_THERAPY_MAP.filter(entry =>
    entry.tumorTypes.some(t => t.toLowerCase().includes(q))
  );
}

/**
 * Check if a drug has biomarker-based prescribing requirements.
 * @param {string} drugName - e.g., "osimertinib", "pembrolizumab"
 * @returns {Array} Biomarkers required for the drug
 */
export function getBiomarkerRequirements(drugName) {
  const q = drugName.toLowerCase();
  return BIOMARKER_THERAPY_MAP
    .filter(entry =>
      entry.therapies.some(t => t.drug.toLowerCase().includes(q))
    )
    .map(entry => ({
      biomarker: entry.biomarker,
      tumorTypes: entry.tumorTypes,
      therapy: entry.therapies.find(t => t.drug.toLowerCase().includes(q)),
    }));
}

/**
 * Get PGx (pharmacogenomic) requirements for a drug from CPIC.
 */
export function getPGxForDrug(drugName) {
  const q = drugName.toLowerCase();
  return CPIC_GUIDELINES_EXPANDED.filter(g =>
    g.drug.generic_name.toLowerCase().includes(q) ||
    g.drug.name.toLowerCase().includes(q)
  );
}

/**
 * Get all actionable biomarkers for a patient profile.
 * @param {Object} profile - { cancerType, biomarkers: ['EGFR L858R', 'PD-L1 80%'], genes: { CYP2D6: 'PM' } }
 */
export function getActionableTherapies(profile) {
  const results = {
    targetedTherapies: [],
    immunotherapies: [],
    pgxAlerts: [],
    clinicalTrialBiomarkers: [],
  };

  // Match tumor biomarkers to therapies
  for (const bm of (profile.biomarkers || [])) {
    const matches = getTherapiesForBiomarker(bm);
    for (const match of matches) {
      const relevant = match.tumorTypes.some(t =>
        t.toLowerCase() === 'any solid tumor' ||
        t.toLowerCase().includes((profile.cancerType || '').toLowerCase())
      );
      if (relevant) {
        const category = match.biomarker.toLowerCase().includes('pd-l1') ||
                        match.biomarker.toLowerCase().includes('msi') ||
                        match.biomarker.toLowerCase().includes('tmb')
          ? 'immunotherapies' : 'targetedTherapies';
        results[category].push({
          biomarker: match.biomarker,
          therapies: match.therapies,
        });
      }
    }
  }

  // Check PGx for any drugs in the patient's medication list
  for (const drug of (profile.medications || [])) {
    const pgx = getPGxForDrug(drug);
    if (pgx.length > 0) {
      results.pgxAlerts.push({ drug, guidelines: pgx });
    }
  }

  return results;
}

export default {
  getTherapiesForBiomarker,
  getBiomarkersForTumor,
  getBiomarkerRequirements,
  getPGxForDrug,
  getActionableTherapies,
  BIOMARKER_THERAPY_MAP,
};
