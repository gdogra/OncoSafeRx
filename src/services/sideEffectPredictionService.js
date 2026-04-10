/**
 * Side Effect Prediction Service
 *
 * Combines FAERS adverse event data with PGx pharmacogenomic data to
 * estimate personalized side effect risk for a patient.
 *
 * This is NOT a validated clinical prediction model — it's an evidence
 * synthesis tool that surfaces relevant safety data. All output must be
 * interpreted by a qualified healthcare professional.
 *
 * Methodology:
 * 1. FAERS baseline: frequency of each adverse event for the drug
 * 2. PGx modifier: known gene-drug interactions that increase/decrease risk
 * 3. Concomitant drug modifier: cumulative toxicity domains
 * 4. Patient factor modifier: age, organ function (if available)
 */

import faersService from './faersService.js';
import { CPIC_GUIDELINES_EXPANDED } from '../data/cpicGuidelinesExpanded.js';

/**
 * Predict personalized side effect risks for a drug in context.
 *
 * @param {Object} params
 * @param {string} params.drug - The drug to assess
 * @param {Object} [params.pgxProfile] - Patient's PGx results { DPYD: 'PM', ... }
 * @param {string[]} [params.concomitantDrugs] - Other medications
 * @param {Object} [params.patientFactors] - { age, renalFunction, hepaticFunction }
 * @returns {Promise<Object>} Personalized risk assessment
 */
export async function predictSideEffects({
  drug,
  pgxProfile = {},
  concomitantDrugs = [],
  patientFactors = {},
}) {
  // 1. Get FAERS baseline adverse events
  const faersData = await faersService.getAdverseEvents(drug, 15);
  const baselineEvents = faersData.events || [];
  const totalReports = faersData.total || 1;

  // 2. Check PGx modifiers
  const pgxModifiers = [];
  const drugGuidelines = CPIC_GUIDELINES_EXPANDED.filter(g =>
    g.drug.generic_name.toLowerCase().includes(drug.toLowerCase()) ||
    g.drug.name.toLowerCase().includes(drug.toLowerCase())
  );

  for (const guideline of drugGuidelines) {
    const phenotype = pgxProfile[guideline.gene_symbol];
    if (phenotype) {
      const isHighRisk =
        phenotype.toLowerCase().includes('poor') ||
        phenotype.toLowerCase().includes('intermediate') ||
        phenotype.toLowerCase().includes('ultrarapid') ||
        phenotype.toLowerCase().includes('deficient');

      if (isHighRisk) {
        pgxModifiers.push({
          gene: guideline.gene_symbol,
          phenotype,
          riskModifier: 'increased',
          mechanism: guideline.implications,
          recommendation: guideline.recommendation,
          affectedSideEffects: extractAffectedSideEffects(guideline),
          evidence: guideline.evidence_level,
          sources: guideline.sources,
        });
      }
    }
  }

  // 3. Cumulative toxicity from concomitant drugs
  const toxicityRisks = assessCumulativeRisk(drug, concomitantDrugs);

  // 4. Patient factor adjustments
  const patientRisks = assessPatientFactors(drug, patientFactors);

  // 5. Build personalized risk profile
  const personalizedEvents = baselineEvents.map(event => {
    const baseFrequency = event.count / totalReports;
    let riskLevel = baseFrequency > 0.1 ? 'common' : baseFrequency > 0.01 ? 'uncommon' : 'rare';

    // Check if any PGx modifier affects this event
    const pgxImpact = pgxModifiers.find(m =>
      m.affectedSideEffects.some(se =>
        event.event.toLowerCase().includes(se.toLowerCase())
      )
    );

    // Check if cumulative toxicity applies
    const toxImpact = toxicityRisks.find(t =>
      t.relatedEvents.some(re =>
        event.event.toLowerCase().includes(re.toLowerCase())
      )
    );

    let personalizedRisk = riskLevel;
    const riskFactors = [];

    if (pgxImpact) {
      personalizedRisk = elevateRisk(riskLevel);
      riskFactors.push(`${pgxImpact.gene} ${pgxImpact.phenotype}: ${pgxImpact.mechanism}`);
    }

    if (toxImpact) {
      personalizedRisk = elevateRisk(personalizedRisk);
      riskFactors.push(`Cumulative ${toxImpact.domain} with ${toxImpact.drugs.join(', ')}`);
    }

    return {
      event: event.event,
      baselineReports: event.count,
      baselineRisk: riskLevel,
      personalizedRisk,
      riskFactors,
      elevated: riskFactors.length > 0,
    };
  });

  return {
    drug,
    personalizedEvents: personalizedEvents.sort((a, b) =>
      (b.elevated ? 1 : 0) - (a.elevated ? 1 : 0) || b.baselineReports - a.baselineReports
    ),
    pgxModifiers,
    cumulativeToxicityRisks: toxicityRisks,
    patientFactorRisks: patientRisks,
    summary: {
      totalEventsAnalyzed: personalizedEvents.length,
      elevatedRiskEvents: personalizedEvents.filter(e => e.elevated).length,
      pgxFactors: pgxModifiers.length,
      cumulativeRisks: toxicityRisks.length,
    },
    methodology: 'FAERS baseline frequency + CPIC PGx modifiers + cumulative toxicity analysis',
    disclaimer: 'This is an evidence synthesis, not a validated prediction model. Clinical judgment required.',
    source: 'FDA FAERS + CPIC Guidelines',
  };
}

function extractAffectedSideEffects(guideline) {
  const effects = [];
  const text = `${guideline.implications || ''} ${guideline.recommendation || ''}`.toLowerCase();
  if (text.includes('neutropenia') || text.includes('myelosuppression')) effects.push('neutropenia', 'leukopenia', 'thrombocytopenia');
  if (text.includes('mucositis') || text.includes('stomatitis')) effects.push('stomatitis', 'mucositis');
  if (text.includes('diarrhea') || text.includes('diarrhoea')) effects.push('diarrhoea', 'diarrhea');
  if (text.includes('nausea')) effects.push('nausea', 'vomiting');
  if (text.includes('hepatotox') || text.includes('liver')) effects.push('hepatotoxicity', 'liver injury');
  if (text.includes('nephrotox') || text.includes('renal')) effects.push('renal failure', 'nephrotoxicity');
  if (text.includes('neuropath')) effects.push('neuropathy', 'peripheral neuropathy');
  if (text.includes('cardiotox') || text.includes('cardiac')) effects.push('cardiac failure', 'cardiomyopathy');
  if (text.includes('respiratory') || text.includes('pneumonitis')) effects.push('pneumonitis', 'dyspnoea');
  if (text.includes('hypersensitivity') || text.includes('sjs') || text.includes('steven')) effects.push('stevens-johnson syndrome', 'hypersensitivity');
  if (effects.length === 0) effects.push('toxicity'); // generic
  return effects;
}

function assessCumulativeRisk(drug, concomitantDrugs) {
  const risks = [];
  const allDrugs = [drug, ...concomitantDrugs].map(d => d.toLowerCase());

  const domains = {
    nephrotoxicity: {
      drugs: ['cisplatin', 'carboplatin', 'methotrexate', 'ibuprofen', 'naproxen', 'vancomycin', 'gentamicin'],
      relatedEvents: ['renal failure', 'nephrotoxicity', 'renal impairment', 'acute kidney injury'],
    },
    myelosuppression: {
      drugs: ['cyclophosphamide', 'doxorubicin', 'cisplatin', 'carboplatin', 'etoposide', 'paclitaxel', 'fluorouracil', 'gemcitabine'],
      relatedEvents: ['neutropenia', 'thrombocytopenia', 'anaemia', 'leukopenia', 'pancytopenia', 'febrile neutropenia'],
    },
    hepatotoxicity: {
      drugs: ['methotrexate', 'imatinib', 'acetaminophen', 'isoniazid', 'valproic acid'],
      relatedEvents: ['hepatotoxicity', 'liver injury', 'hepatic failure', 'jaundice', 'transaminases increased'],
    },
    cardiotoxicity: {
      drugs: ['doxorubicin', 'trastuzumab', 'sunitinib', 'fluorouracil'],
      relatedEvents: ['cardiac failure', 'cardiomyopathy', 'ejection fraction decreased', 'heart failure'],
    },
  };

  for (const [domain, info] of Object.entries(domains)) {
    const matching = allDrugs.filter(d => info.drugs.some(td => d.includes(td)));
    if (matching.length >= 2) {
      risks.push({
        domain,
        drugs: matching,
        count: matching.length,
        relatedEvents: info.relatedEvents,
        risk: matching.length >= 3 ? 'high' : 'moderate',
      });
    }
  }

  return risks;
}

function assessPatientFactors(drug, factors) {
  const risks = [];
  if (factors.age && factors.age > 70) {
    risks.push({ factor: 'Age > 70', impact: 'Increased risk of myelosuppression and organ toxicity', recommendation: 'Consider dose reduction per guidelines' });
  }
  if (factors.renalFunction && factors.renalFunction < 60) {
    risks.push({ factor: `Reduced renal function (GFR ${factors.renalFunction})`, impact: 'Reduced clearance of renally-excreted drugs', recommendation: 'Check dose adjustment for renal impairment' });
  }
  if (factors.hepaticFunction && factors.hepaticFunction === 'impaired') {
    risks.push({ factor: 'Hepatic impairment', impact: 'Reduced metabolism of hepatically-cleared drugs', recommendation: 'Check dose adjustment for hepatic impairment' });
  }
  return risks;
}

function elevateRisk(current) {
  const levels = ['rare', 'uncommon', 'common', 'very common'];
  const idx = levels.indexOf(current);
  return idx < levels.length - 1 ? levels[idx + 1] : current;
}

export default { predictSideEffects };
