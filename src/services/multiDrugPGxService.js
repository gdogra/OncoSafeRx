/**
 * Multi-Drug PGx Report Service
 *
 * Given a patient's complete medication list and PGx test results,
 * generates a comprehensive report showing ALL actionable gene-drug
 * interactions across the entire regimen at once.
 *
 * This replaces checking one drug at a time — oncologists can see
 * the full PGx picture for a patient in one view.
 */

import { CPIC_GUIDELINES_EXPANDED } from '../data/cpicGuidelinesExpanded.js';

/**
 * Generate a comprehensive multi-drug PGx report.
 *
 * @param {Object} params
 * @param {string[]} params.medications - All patient medications
 * @param {Object} params.pgxResults - Gene test results { DPYD: 'Intermediate Metabolizer', CYP2D6: 'Poor Metabolizer', ... }
 * @returns {Object} Complete PGx report
 */
export function generateMultiDrugPGxReport({ medications = [], pgxResults = {} }) {
  const report = {
    medicationsAnalyzed: medications.length,
    genesEvaluated: Object.keys(pgxResults).length,
    actionRequired: [],
    informational: [],
    noActionNeeded: [],
    untestableGenes: [],
    summary: {},
  };

  const testedGenes = new Set(Object.keys(pgxResults));

  for (const drug of medications) {
    const drugLower = drug.toLowerCase();

    // Find all CPIC guidelines for this drug
    const guidelines = CPIC_GUIDELINES_EXPANDED.filter(g =>
      g.drug.generic_name.toLowerCase().includes(drugLower) ||
      g.drug.name.toLowerCase().includes(drugLower)
    );

    if (guidelines.length === 0) {
      report.noActionNeeded.push({
        drug,
        status: 'No CPIC guidelines',
        detail: 'No pharmacogenomic guidelines published for this drug.',
      });
      continue;
    }

    // Group by gene
    const geneMap = new Map();
    for (const g of guidelines) {
      if (!geneMap.has(g.gene_symbol)) geneMap.set(g.gene_symbol, []);
      geneMap.get(g.gene_symbol).push(g);
    }

    for (const [gene, geneGuidelines] of geneMap) {
      const patientPhenotype = pgxResults[gene];

      if (!patientPhenotype) {
        // Gene not tested
        const criticalGenes = ['DPYD', 'UGT1A1', 'TPMT', 'NUDT15', 'HLA-B', 'G6PD'];
        if (criticalGenes.includes(gene)) {
          report.untestableGenes.push({
            drug,
            gene,
            geneName: geneGuidelines[0]?.gene?.name || gene,
            urgency: 'high',
            recommendation: `${gene} testing STRONGLY recommended before starting ${drug}`,
            guidelines: geneGuidelines.map(g => ({
              phenotype: g.phenotype,
              recommendation: g.recommendation,
              evidence: g.evidence_level,
            })),
            pmids: [...new Set(geneGuidelines.flatMap(g => g.pmids || []))],
          });
        } else {
          report.informational.push({
            drug,
            gene,
            geneName: geneGuidelines[0]?.gene?.name || gene,
            status: 'Not tested',
            detail: `${gene} testing may provide additional dosing guidance for ${drug}.`,
          });
        }
        continue;
      }

      // Gene IS tested — find matching phenotype
      const matchingGuideline = geneGuidelines.find(g =>
        patientPhenotype.toLowerCase().includes(g.phenotype.toLowerCase()) ||
        g.phenotype.toLowerCase().includes(patientPhenotype.toLowerCase())
      );

      if (matchingGuideline) {
        const isActionable =
          matchingGuideline.recommendation.toLowerCase().includes('avoid') ||
          matchingGuideline.recommendation.toLowerCase().includes('reduce') ||
          matchingGuideline.recommendation.toLowerCase().includes('contraindicated') ||
          matchingGuideline.recommendation.toLowerCase().includes('alternative') ||
          matchingGuideline.recommendation.toLowerCase().includes('do not');

        const entry = {
          drug,
          gene,
          geneName: matchingGuideline.gene?.name || gene,
          patientPhenotype,
          recommendation: matchingGuideline.recommendation,
          dosageAdjustment: matchingGuideline.dosage_adjustment || null,
          implications: matchingGuideline.implications || null,
          evidence: matchingGuideline.evidence_level,
          sources: matchingGuideline.sources || [],
          pmids: matchingGuideline.pmids || [],
        };

        if (isActionable) {
          report.actionRequired.push(entry);
        } else {
          report.informational.push(entry);
        }
      } else {
        // Tested but phenotype doesn't match any guideline (e.g., Normal Metabolizer)
        report.noActionNeeded.push({
          drug,
          gene,
          patientPhenotype,
          status: 'Standard dosing appropriate',
          detail: `${patientPhenotype} for ${gene} — no dosage adjustment needed for ${drug}.`,
        });
      }
    }
  }

  // Summary
  report.summary = {
    totalMedications: medications.length,
    actionRequired: report.actionRequired.length,
    testingRecommended: report.untestableGenes.length,
    informational: report.informational.length,
    noChanges: report.noActionNeeded.length,
    overallAssessment: report.actionRequired.length > 0
      ? 'ACTION REQUIRED — dosage adjustments or drug changes needed'
      : report.untestableGenes.length > 0
      ? 'TESTING RECOMMENDED — critical genes untested'
      : 'No actionable PGx findings',
  };

  return report;
}

export default { generateMultiDrugPGxReport };
