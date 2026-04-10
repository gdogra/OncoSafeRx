/**
 * Regimen-Level Interaction Checker
 *
 * Unlike standard drug-drug interaction checkers that only compare pairs,
 * this service analyzes ENTIRE treatment regimens including:
 * - All pairwise interactions within the chemo regimen
 * - Interactions between regimen drugs and the patient's other medications
 * - Cumulative toxicity risks (nephrotoxicity, hepatotoxicity, QT prolongation, etc.)
 * - PGx alerts for any drug in the regimen
 *
 * This is OncoSafeRx's key differentiator vs Lexicomp/UpToDate.
 */

import { KNOWN_INTERACTIONS } from '../data/knownInteractions.js';
import { getPGxForDrug } from './biomarkerTherapyService.js';

/**
 * Toxicity domains that can accumulate across multiple drugs.
 */
const CUMULATIVE_TOXICITY_DOMAINS = {
  nephrotoxicity: {
    label: 'Nephrotoxicity',
    drugs: ['cisplatin', 'carboplatin', 'methotrexate', 'ifosfamide', 'pemetrexed', 'zoledronic acid', 'ibuprofen', 'naproxen', 'celecoxib', 'ketorolac', 'vancomycin', 'gentamicin', 'amphotericin b', 'tenofovir', 'lisinopril', 'enalapril', 'losartan', 'cyclosporine', 'tacrolimus'],
    severity: 'high',
    monitoring: 'Monitor SCr, BUN, GFR before each cycle. Hold nephrotoxic agents if GFR <60.',
  },
  hepatotoxicity: {
    label: 'Hepatotoxicity',
    drugs: ['methotrexate', 'gemcitabine', 'irinotecan', 'temozolomide', 'acetaminophen', 'imatinib', 'crizotinib', 'pazopanib', 'regorafenib', 'nivolumab', 'pembrolizumab', 'ipilimumab', 'isoniazid', 'rifampin', 'ketoconazole', 'valproic acid', 'atorvastatin', 'amiodarone'],
    severity: 'high',
    monitoring: 'Monitor LFTs before each cycle. Hold hepatotoxic agents if ALT/AST >5x ULN.',
  },
  myelosuppression: {
    label: 'Myelosuppression',
    drugs: ['cyclophosphamide', 'doxorubicin', 'cisplatin', 'carboplatin', 'etoposide', 'paclitaxel', 'docetaxel', 'gemcitabine', 'irinotecan', 'fluorouracil', 'capecitabine', 'pemetrexed', 'temozolomide', 'methotrexate', 'vinblastine', 'vincristine', 'topotecan', 'oxaliplatin'],
    severity: 'high',
    monitoring: 'CBC with differential before each cycle. Dose-reduce or delay for Grade 3-4 cytopenias.',
  },
  cardiotoxicity: {
    label: 'Cardiotoxicity',
    drugs: ['doxorubicin', 'epirubicin', 'trastuzumab', 'pertuzumab', 'sunitinib', 'sorafenib', 'bevacizumab', 'fluorouracil', 'capecitabine', 'cyclophosphamide', 'osimertinib', 'ribociclib', 'nilotinib', 'dasatinib', 'ponatinib'],
    severity: 'high',
    monitoring: 'Baseline and periodic LVEF monitoring (echo or MUGA). Hold if LVEF drops >10% or below 50%.',
  },
  qtProlongation: {
    label: 'QT Prolongation',
    drugs: ['arsenic trioxide', 'vandetanib', 'sunitinib', 'sorafenib', 'nilotinib', 'crizotinib', 'ribociclib', 'osimertinib', 'ondansetron', 'granisetron', 'haloperidol', 'methadone', 'ciprofloxacin', 'levofloxacin', 'moxifloxacin', 'azithromycin', 'fluconazole', 'amiodarone'],
    severity: 'moderate',
    monitoring: 'Baseline ECG; repeat if ≥2 QT-prolonging drugs. Hold if QTc >500ms. Correct electrolytes (K+, Mg2+).',
  },
  neurotoxicity: {
    label: 'Peripheral Neuropathy',
    drugs: ['vincristine', 'paclitaxel', 'docetaxel', 'oxaliplatin', 'cisplatin', 'bortezomib', 'thalidomide', 'lenalidomide', 'eribulin'],
    severity: 'moderate',
    monitoring: 'Assess neuropathy grade at each visit. Dose-reduce for Grade 2, hold for Grade 3.',
  },
  pulmonaryToxicity: {
    label: 'Pulmonary Toxicity',
    drugs: ['bleomycin', 'busulfan', 'methotrexate', 'gemcitabine', 'nivolumab', 'pembrolizumab', 'atezolizumab', 'everolimus', 'temsirolimus'],
    severity: 'high',
    monitoring: 'Baseline PFTs for bleomycin. Monitor for cough, dyspnea. Hold immunotherapy for Grade 2+ pneumonitis.',
  },
};

/**
 * Analyze a complete treatment regimen for interactions and toxicity risks.
 *
 * @param {Object} params
 * @param {string[]} params.regimenDrugs - Drugs in the chemo regimen (e.g., ['fluorouracil', 'leucovorin', 'oxaliplatin'])
 * @param {string[]} params.concomitantDrugs - Patient's other medications (e.g., ['warfarin', 'omeprazole', 'amlodipine'])
 * @param {Object} [params.pgxProfile] - Patient's PGx data (e.g., { DPYD: 'Intermediate Metabolizer' })
 * @returns {Object} Complete regimen safety analysis
 */
export function analyzeRegimen({ regimenDrugs = [], concomitantDrugs = [], pgxProfile = {} }) {
  const allDrugs = [...regimenDrugs, ...concomitantDrugs];
  const allDrugsLower = allDrugs.map(d => d.toLowerCase());

  // 1. Find all pairwise interactions
  const interactions = findAllInteractions(allDrugs);

  // 2. Classify interactions by type
  const withinRegimen = interactions.filter(i =>
    regimenDrugs.some(d => d.toLowerCase() === i.drug1.toLowerCase()) &&
    regimenDrugs.some(d => d.toLowerCase() === i.drug2.toLowerCase())
  );
  const regimenVsConcomitant = interactions.filter(i =>
    (regimenDrugs.some(d => d.toLowerCase() === i.drug1.toLowerCase()) &&
     concomitantDrugs.some(d => d.toLowerCase() === i.drug2.toLowerCase())) ||
    (concomitantDrugs.some(d => d.toLowerCase() === i.drug1.toLowerCase()) &&
     regimenDrugs.some(d => d.toLowerCase() === i.drug2.toLowerCase()))
  );

  // 3. Cumulative toxicity analysis
  const cumulativeToxicities = analyzeCumulativeToxicity(allDrugsLower);

  // 4. PGx alerts
  const pgxAlerts = [];
  for (const drug of allDrugs) {
    const guidelines = getPGxForDrug(drug);
    if (guidelines.length > 0) {
      const patientPhenotype = pgxProfile[guidelines[0].gene_symbol];
      pgxAlerts.push({
        drug,
        gene: guidelines[0].gene_symbol,
        patientPhenotype: patientPhenotype || 'Unknown — testing recommended',
        guidelines: guidelines.map(g => ({
          phenotype: g.phenotype,
          recommendation: g.recommendation,
          evidence: g.evidence_level,
          sources: g.sources,
        })),
        actionRequired: !!patientPhenotype,
      });
    }
  }

  // 5. Overall risk assessment
  const majorInteractions = interactions.filter(i => i.severity === 'major').length;
  const moderateInteractions = interactions.filter(i => i.severity === 'moderate').length;
  const highToxicities = cumulativeToxicities.filter(t => t.count >= 3).length;

  let overallRisk = 'low';
  if (majorInteractions >= 2 || highToxicities >= 2) overallRisk = 'high';
  else if (majorInteractions >= 1 || moderateInteractions >= 3 || highToxicities >= 1) overallRisk = 'moderate';

  return {
    summary: {
      totalDrugs: allDrugs.length,
      regimenDrugs: regimenDrugs.length,
      concomitantDrugs: concomitantDrugs.length,
      totalInteractions: interactions.length,
      majorInteractions,
      moderateInteractions,
      minorInteractions: interactions.filter(i => i.severity === 'minor').length,
      cumulativeToxicityRisks: cumulativeToxicities.filter(t => t.count >= 2).length,
      pgxAlertsCount: pgxAlerts.length,
      overallRisk,
    },
    interactions: {
      withinRegimen,
      regimenVsConcomitant,
      all: interactions,
    },
    cumulativeToxicities,
    pgxAlerts,
    recommendations: generateRecommendations(interactions, cumulativeToxicities, pgxAlerts),
  };
}

/**
 * Find all pairwise interactions between a list of drugs.
 */
function findAllInteractions(drugs) {
  const interactions = [];
  const seen = new Set();

  for (let i = 0; i < drugs.length; i++) {
    for (let j = i + 1; j < drugs.length; j++) {
      const d1 = drugs[i].toLowerCase();
      const d2 = drugs[j].toLowerCase();
      const key = [d1, d2].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);

      // Search curated interactions
      const match = KNOWN_INTERACTIONS.find(ix =>
        (ix.drug1?.toLowerCase() === d1 && ix.drug2?.toLowerCase() === d2) ||
        (ix.drug1?.toLowerCase() === d2 && ix.drug2?.toLowerCase() === d1)
      );

      if (match) {
        interactions.push({
          drug1: drugs[i],
          drug2: drugs[j],
          severity: match.severity || 'moderate',
          mechanism: match.mechanism || 'Unknown',
          effect: match.effect || match.description || '',
          management: match.management || '',
          evidence: match.evidence_level || 'Established',
          sources: match.sources || [],
        });
      }
    }
  }

  return interactions;
}

/**
 * Analyze cumulative toxicity risk across all drugs.
 */
function analyzeCumulativeToxicity(drugsLower) {
  const results = [];

  for (const [domain, info] of Object.entries(CUMULATIVE_TOXICITY_DOMAINS)) {
    const matchingDrugs = drugsLower.filter(d =>
      info.drugs.some(td => d.includes(td) || td.includes(d))
    );

    if (matchingDrugs.length >= 2) {
      results.push({
        domain: info.label,
        severity: info.severity,
        count: matchingDrugs.length,
        drugs: matchingDrugs,
        monitoring: info.monitoring,
        risk: matchingDrugs.length >= 3 ? 'high' : 'moderate',
      });
    }
  }

  return results.sort((a, b) => b.count - a.count);
}

/**
 * Generate actionable recommendations based on the analysis.
 */
function generateRecommendations(interactions, toxicities, pgxAlerts) {
  const recs = [];

  // Major interactions → specific action
  for (const ix of interactions.filter(i => i.severity === 'major')) {
    recs.push({
      priority: 'critical',
      type: 'interaction',
      message: `MAJOR interaction: ${ix.drug1} + ${ix.drug2}. ${ix.management || 'Consider alternative or close monitoring.'}`,
      drugs: [ix.drug1, ix.drug2],
    });
  }

  // High cumulative toxicity → monitoring
  for (const tox of toxicities.filter(t => t.count >= 3)) {
    recs.push({
      priority: 'high',
      type: 'cumulative_toxicity',
      message: `High cumulative ${tox.domain} risk from ${tox.count} agents: ${tox.drugs.join(', ')}. ${tox.monitoring}`,
      drugs: tox.drugs,
    });
  }

  // PGx alerts → testing/dose adjustment
  for (const pgx of pgxAlerts) {
    if (pgx.patientPhenotype === 'Unknown — testing recommended') {
      recs.push({
        priority: 'high',
        type: 'pgx_testing',
        message: `${pgx.gene} testing recommended before starting ${pgx.drug}. ${pgx.guidelines[0]?.recommendation || ''}`,
        drugs: [pgx.drug],
      });
    }
  }

  return recs.sort((a, b) => {
    const priority = { critical: 0, high: 1, moderate: 2, low: 3 };
    return (priority[a.priority] || 3) - (priority[b.priority] || 3);
  });
}

export default { analyzeRegimen };
