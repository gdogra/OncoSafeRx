/**
 * Regimen Cost Estimator Service
 *
 * Estimates chemo regimen costs using the NADAC (National Average Drug
 * Acquisition Cost) database from CMS. NADAC provides actual pharmacy
 * acquisition costs — more accurate than AWP (average wholesale price).
 *
 * Source: https://data.medicaid.gov/dataset/dfa2ab14-06c2-457a-9e36-5cb6d80f8d93
 * Free, no API key required, updated weekly by CMS.
 *
 * Note: These are ACQUISITION costs — patient out-of-pocket depends on
 * insurance, copays, and financial assistance programs.
 */

import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 86400 * 7 }); // 7-day cache (NADAC updates weekly)

// NADAC API (CMS Medicaid)
const NADAC_BASE = 'https://data.medicaid.gov/resource/dfa2ab14-06c2-457a-9e36-5cb6d80f8d93.json';

/**
 * Look up NADAC acquisition cost for a drug.
 * @param {string} drugName - Generic drug name
 * @returns {Promise<Object>} Cost data
 */
export async function getDrugCost(drugName) {
  const key = `nadac:${drugName.toLowerCase()}`;
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const url = `${NADAC_BASE}?$where=lower(ndc_description) like '%${drugName.toLowerCase()}%'&$limit=5&$order=as_of_date DESC`;
    const res = await fetch(url);
    if (!res.ok) return { drug: drugName, cost: null, error: `NADAC ${res.status}` };
    const data = await res.json();

    if (!data || data.length === 0) {
      // Fall back to curated oncology drug costs
      const fallback = ONCOLOGY_COSTS[drugName.toLowerCase()];
      if (fallback) {
        const result = { drug: drugName, ...fallback, source: 'Estimated (OncoSafeRx curated)' };
        cache.set(key, result);
        return result;
      }
      return { drug: drugName, cost: null, source: 'NADAC', note: 'Not found in NADAC database' };
    }

    const entry = data[0];
    const result = {
      drug: drugName,
      ndcDescription: entry.ndc_description,
      nadacPerUnit: parseFloat(entry.nadac_per_unit) || 0,
      pricingUnit: entry.pricing_unit,
      asOfDate: entry.as_of_date,
      source: 'CMS NADAC (National Average Drug Acquisition Cost)',
    };
    cache.set(key, result);
    return result;
  } catch (err) {
    // Fall back to curated costs
    const fallback = ONCOLOGY_COSTS[drugName.toLowerCase()];
    if (fallback) {
      return { drug: drugName, ...fallback, source: 'Estimated (OncoSafeRx curated)' };
    }
    return { drug: drugName, cost: null, error: err.message };
  }
}

/**
 * Estimate total cost for a chemotherapy regimen.
 *
 * @param {Object} params
 * @param {string} params.regimen - Regimen name
 * @param {number} params.cycles - Number of cycles
 * @param {number} [params.bsa] - Body surface area in m² (default 1.7)
 * @param {number} [params.weight] - Weight in kg (for weight-based dosing)
 * @returns {Promise<Object>} Cost estimate breakdown
 */
export async function estimateRegimenCost({ regimen, cycles = 6, bsa = 1.7, weight = 70 }) {
  const regimenDrugs = REGIMEN_DOSING[regimen.toUpperCase()];
  if (!regimenDrugs) {
    return {
      regimen,
      error: `Regimen "${regimen}" not found. Available: ${Object.keys(REGIMEN_DOSING).join(', ')}`,
    };
  }

  const drugCosts = [];
  let totalPerCycle = 0;

  for (const drugDef of regimenDrugs) {
    const costData = await getDrugCost(drugDef.name);

    // Calculate dose
    let dose;
    if (drugDef.dosingBasis === 'bsa') {
      dose = drugDef.dose * bsa;
    } else if (drugDef.dosingBasis === 'weight') {
      dose = drugDef.dose * weight;
    } else {
      dose = drugDef.dose; // flat dose
    }

    // Estimate cost per cycle
    let costPerCycle = 0;
    if (costData.nadacPerUnit && costData.nadacPerUnit > 0) {
      costPerCycle = dose * drugDef.days * costData.nadacPerUnit;
    } else if (costData.estimatedCostPerCycle) {
      costPerCycle = costData.estimatedCostPerCycle;
    }

    drugCosts.push({
      drug: drugDef.name,
      dose: `${Math.round(dose)} ${drugDef.unit}`,
      dosingBasis: drugDef.dosingBasis === 'bsa' ? `${drugDef.dose} ${drugDef.unit}/m²` : `${drugDef.dose} ${drugDef.unit}/kg`,
      days: drugDef.days,
      costPerCycle: Math.round(costPerCycle * 100) / 100,
      source: costData.source || 'Unknown',
    });

    totalPerCycle += costPerCycle;
  }

  const totalCost = totalPerCycle * cycles;

  return {
    regimen,
    cycles,
    bsa,
    weight,
    drugCosts,
    totalPerCycle: Math.round(totalPerCycle * 100) / 100,
    totalEstimatedCost: Math.round(totalCost * 100) / 100,
    disclaimer: 'Costs are estimated from NADAC acquisition costs. Patient out-of-pocket depends on insurance, copays, financial assistance, and institutional pricing.',
    financialAssistance: [
      { program: 'CancerCare Co-Payment Assistance', url: 'https://www.cancercare.org/copayfoundation' },
      { program: 'Patient Advocate Foundation', url: 'https://www.patientadvocate.org/' },
      { program: 'NeedyMeds', url: 'https://www.needymeds.org/' },
      { program: 'RxAssist', url: 'https://www.rxassist.org/' },
    ],
    source: 'CMS NADAC + OncoSafeRx estimates',
  };
}

// Curated oncology drug cost estimates (per cycle, approximate)
// Used as fallback when NADAC doesn't have the entry
const ONCOLOGY_COSTS = {
  'fluorouracil': { estimatedCostPerCycle: 15, unit: 'mg', note: 'Generic, widely available' },
  'leucovorin': { estimatedCostPerCycle: 25, unit: 'mg', note: 'Generic' },
  'oxaliplatin': { estimatedCostPerCycle: 150, unit: 'mg', note: 'Generic available' },
  'irinotecan': { estimatedCostPerCycle: 200, unit: 'mg', note: 'Generic available' },
  'carboplatin': { estimatedCostPerCycle: 50, unit: 'mg', note: 'Generic' },
  'cisplatin': { estimatedCostPerCycle: 30, unit: 'mg', note: 'Generic' },
  'paclitaxel': { estimatedCostPerCycle: 100, unit: 'mg', note: 'Generic available' },
  'docetaxel': { estimatedCostPerCycle: 300, unit: 'mg', note: 'Generic available' },
  'doxorubicin': { estimatedCostPerCycle: 200, unit: 'mg', note: 'Generic' },
  'cyclophosphamide': { estimatedCostPerCycle: 50, unit: 'mg', note: 'Generic' },
  'etoposide': { estimatedCostPerCycle: 100, unit: 'mg', note: 'Generic' },
  'gemcitabine': { estimatedCostPerCycle: 150, unit: 'mg', note: 'Generic available' },
  'pemetrexed': { estimatedCostPerCycle: 3000, unit: 'mg', note: 'Generic available' },
  'rituximab': { estimatedCostPerCycle: 4000, unit: 'mg', note: 'Biosimilars available' },
  'trastuzumab': { estimatedCostPerCycle: 3500, unit: 'mg', note: 'Biosimilars available' },
  'pembrolizumab': { estimatedCostPerCycle: 10000, unit: 'mg', note: 'Brand only (Keytruda)' },
  'nivolumab': { estimatedCostPerCycle: 7000, unit: 'mg', note: 'Brand only (Opdivo)' },
  'atezolizumab': { estimatedCostPerCycle: 8000, unit: 'mg', note: 'Brand only (Tecentriq)' },
  'osimertinib': { estimatedCostPerCycle: 14000, unit: 'mg/month', note: 'Brand only (Tagrisso), oral' },
  'olaparib': { estimatedCostPerCycle: 12000, unit: 'mg/month', note: 'Brand only (Lynparza), oral' },
  'imatinib': { estimatedCostPerCycle: 400, unit: 'mg/month', note: 'Generic available' },
  'vincristine': { estimatedCostPerCycle: 30, unit: 'mg', note: 'Generic' },
  'prednisone': { estimatedCostPerCycle: 5, unit: 'mg', note: 'Generic, inexpensive' },
};

// Regimen dosing for cost estimation (standard doses)
const REGIMEN_DOSING = {
  'FOLFOX': [
    { name: 'oxaliplatin', dose: 85, unit: 'mg', dosingBasis: 'bsa', days: 1 },
    { name: 'leucovorin', dose: 400, unit: 'mg', dosingBasis: 'bsa', days: 1 },
    { name: 'fluorouracil', dose: 2400, unit: 'mg', dosingBasis: 'bsa', days: 2 },
  ],
  'FOLFIRI': [
    { name: 'irinotecan', dose: 180, unit: 'mg', dosingBasis: 'bsa', days: 1 },
    { name: 'leucovorin', dose: 400, unit: 'mg', dosingBasis: 'bsa', days: 1 },
    { name: 'fluorouracil', dose: 2400, unit: 'mg', dosingBasis: 'bsa', days: 2 },
  ],
  'R-CHOP': [
    { name: 'rituximab', dose: 375, unit: 'mg', dosingBasis: 'bsa', days: 1 },
    { name: 'cyclophosphamide', dose: 750, unit: 'mg', dosingBasis: 'bsa', days: 1 },
    { name: 'doxorubicin', dose: 50, unit: 'mg', dosingBasis: 'bsa', days: 1 },
    { name: 'vincristine', dose: 1.4, unit: 'mg', dosingBasis: 'bsa', days: 1 },
    { name: 'prednisone', dose: 100, unit: 'mg', dosingBasis: 'flat', days: 5 },
  ],
  'CARBOPLATIN-PACLITAXEL': [
    { name: 'carboplatin', dose: 5, unit: 'mg·min/mL', dosingBasis: 'auc', days: 1 },
    { name: 'paclitaxel', dose: 175, unit: 'mg', dosingBasis: 'bsa', days: 1 },
  ],
  'CISPLATIN-ETOPOSIDE': [
    { name: 'cisplatin', dose: 80, unit: 'mg', dosingBasis: 'bsa', days: 1 },
    { name: 'etoposide', dose: 100, unit: 'mg', dosingBasis: 'bsa', days: 3 },
  ],
  'PEMBROLIZUMAB': [
    { name: 'pembrolizumab', dose: 200, unit: 'mg', dosingBasis: 'flat', days: 1 },
  ],
  'NIVOLUMAB': [
    { name: 'nivolumab', dose: 240, unit: 'mg', dosingBasis: 'flat', days: 1 },
  ],
};

export default { getDrugCost, estimateRegimenCost, REGIMEN_DOSING };
