import express from 'express';
import { validate, schemas } from '../utils/validation.js';
import { GeneDrugInteraction } from '../models/Interaction.js';
import CPIC_GUIDELINES_DB from '../data/cpicGuidelines.js';
import mapObservationsToPhenotypes, { mapHLAFromObservations } from '../engine/pgxPhenotype.js';
import PGX_PANEL from '../data/pgxPanel.js';
import PGX_VERSION_LOG from '../data/pgxVersionLog.js';

const router = express.Router();

// Get CPIC guidelines from local curated dataset
router.get('/cpic/guidelines', async (req, res) => {
  try {
    const { gene, drug } = req.query;

    // Use local dataset
    let guidelines = [...CPIC_GUIDELINES_DB];

    // Filter by gene or drug if specified
    if (gene) {
      guidelines = guidelines.filter(g => g.gene_symbol.toLowerCase() === gene.toLowerCase());
    }
    if (drug) {
      guidelines = guidelines.filter(g => 
        g.drug?.name?.toLowerCase().includes(drug.toLowerCase()) ||
        g.drug?.generic_name?.toLowerCase().includes(drug.toLowerCase())
      );
    }

    res.json({
      message: 'CPIC guidelines sample',
      count: guidelines.length,
      guidelines: guidelines.map(g => ({
        gene: g.gene_symbol,
        geneName: g.gene?.name,
        drug: g.drug?.name,
        drugRxcui: g.drug_rxcui,
        phenotype: g.phenotype,
        recommendation: g.recommendation,
        evidenceLevel: g.evidence_level,
        implications: g.implications,
        dosageAdjustment: g.dosage_adjustment,
        sources: g.sources
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pharmacogenomic recommendations for a drug (from local dataset)
router.get('/drug/:rxcui/genomics', async (req, res) => {
  try {
    const { rxcui } = req.params;
    // Filter local dataset by RXCUI
    const interactions = CPIC_GUIDELINES_DB.filter(i => i.drug_rxcui === rxcui);

    // Extract unique genes involved
    const genes = [...new Set(interactions.map(i => i.gene_symbol))];
    
    res.json({
      rxcui,
      drugName: interactions[0]?.drug?.name || 'Unknown',
      geneCount: genes.length,
      genes: genes,
      interactionCount: interactions.length,
      recommendations: interactions.map(i => ({
        gene: i.gene_symbol,
        geneName: i.gene?.name,
        geneFunction: i.gene?.function,
        phenotype: i.phenotype,
        recommendation: i.recommendation,
        evidenceLevel: i.evidence_level,
        implications: i.implications,
        dosageAdjustment: i.dosage_adjustment,
        sources: i.sources
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check genomic profile against drug list
router.post('/profile/check', validate(schemas.genomicsProfile, 'body'), async (req, res) => {
  try {
    const { genes, drugs, observations = [], phenotypes = {} } = req.body;
    
    if (!genes || !drugs) {
      return res.status(400).json({ 
        error: 'Please provide both genes and drugs arrays' 
      });
    }

    // Enhanced analysis using CPIC guidelines
    const analysis = {
      inputGenes: genes,
      inputDrugs: drugs,
      phenotypes,
      hlaFindings: mapHLAFromObservations(observations),
      recommendations: [],
      alerts: [],
      dosing: [],
      alternatives: []
    };

    // Analyze each drug against provided genes/phenotypes
    for (const drugRxcui of drugs) {
      const drugGuidelines = CPIC_GUIDELINES_DB.filter(g => g.drug_rxcui === drugRxcui);
      
      for (const guideline of drugGuidelines) {
        const geneSymbol = guideline.gene_symbol;
        
        // Check if we have phenotype data for this gene
        if (genes.includes(geneSymbol) && phenotypes[geneSymbol]) {
          const patientPhenotype = phenotypes[geneSymbol];
          
          // Check if patient phenotype matches or relates to guideline phenotype
          const phenotypeMatch = guideline.phenotype.toLowerCase().includes(patientPhenotype.toLowerCase()) ||
                                patientPhenotype.toLowerCase().includes(guideline.phenotype.toLowerCase());

          if (phenotypeMatch) {
            analysis.recommendations.push({
              gene: geneSymbol,
              drug: guideline.drug?.name,
              drugRxcui: guideline.drug_rxcui,
              phenotype: guideline.phenotype,
              recommendation: guideline.recommendation,
              evidenceLevel: guideline.evidence_level,
              implications: guideline.implications,
              sources: guideline.sources
            });

            // Categorize alerts by severity
            const implications = guideline.implications?.toLowerCase() || '';
            let alertSeverity = 'LOW';
            
            if (implications.includes('severe') || implications.includes('toxicity')) {
              alertSeverity = 'CRITICAL';
            } else if (implications.includes('increased risk') || implications.includes('reduced')) {
              alertSeverity = 'HIGH';
            } else if (implications.includes('monitor') || implications.includes('consider')) {
              alertSeverity = 'MODERATE';
            }

            if (alertSeverity !== 'LOW') {
              analysis.alerts.push({
                gene: geneSymbol,
                drug: guideline.drug?.name,
                risk: guideline.implications,
                severity: alertSeverity.toLowerCase(),
                action: guideline.recommendation
              });
            }

            // Add dosing recommendations
            if (guideline.dosage_adjustment) {
              analysis.dosing.push({
                drug: guideline.drug?.name,
                recommendedDose: guideline.dosage_adjustment,
                rationale: `${geneSymbol} ${patientPhenotype}: ${guideline.implications}`
              });
            }
          }
        }
      }
    }

    // Add general recommendations based on findings
    if (analysis.alerts.length === 0) {
      analysis.recommendations.push({
        general: true,
        text: 'No significant pharmacogenomic interactions detected with current genetic profile'
      });
    }

    res.json({
      message: 'Enhanced pharmacogenomics analysis',
      success: true,
      analysis,
      metadata: {
        guidelinesEvaluated: CPIC_GUIDELINES_DB.length,
        matchingGuidelines: analysis.recommendations.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Genomics profile check error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
// FHIR PGx phenotype mapping (MVP stub)
export const fhirRouter = express.Router();

// Map FHIR Observations to coarse phenotypes (demo logic)
fhirRouter.post('/fhir/phenotype', async (req, res) => {
  try {
    const { observations = [] } = req.body || {};
    const phenotypes = mapObservationsToPhenotypes(observations);
    const hla = mapHLAFromObservations(observations);
    res.json({ count: phenotypes.length + hla.length, phenotypes, hla });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Panel descriptor (17 genes + 4 HLA overview)
router.get('/panel', (req, res) => {
  res.json(PGX_PANEL);
});

// Panel CSV export
router.get('/panel.csv', (req, res) => {
  try {
    const rows = [];
    rows.push(['type', 'symbol', 'implemented']);
    (PGX_PANEL.genes || []).forEach(g => rows.push(['gene', g.symbol, g.implemented ? 'true' : 'false']));
    (PGX_PANEL.hla || []).forEach(h => rows.push(['hla', h.symbol, h.implemented ? 'true' : 'false']));
    const csv = rows.map(r => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="pgx_panel.csv"');
    res.send(csv);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Dynamic report version info
router.get('/versions', (req, res) => {
  res.json(PGX_VERSION_LOG);
});

// Versions CSV export (one row per note)
router.get('/versions.csv', (req, res) => {
  try {
    const rows = [];
    rows.push(['version', 'date', 'note']);
    (PGX_VERSION_LOG.changes || []).forEach(chg => {
      if (Array.isArray(chg.notes) && chg.notes.length) {
        chg.notes.forEach(n => rows.push([chg.version, chg.date, n]));
      } else {
        rows.push([chg.version, chg.date, '']);
      }
    });
    const csv = rows.map(r => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="pgx_versions.csv"');
    res.send(csv);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Bundle panel + versions as JSON
router.get('/panel.bundle', (req, res) => {
  res.json({
    generatedAt: new Date().toISOString(),
    panel: PGX_PANEL,
    versions: PGX_VERSION_LOG,
  });
});

// Dynamic PGx report for a drug (aggregates recommendations + version metadata)
router.get('/report/:rxcui', (req, res) => {
  const { rxcui } = req.params;
  const items = CPIC_GUIDELINES_DB.filter(i => i.drug_rxcui === rxcui);
  res.json({
    rxcui,
    count: items.length,
    version: PGX_VERSION_LOG.currentVersion,
    lastUpdated: PGX_VERSION_LOG.changes?.[0]?.date,
    recommendations: items.map(i => ({
      gene: i.gene_symbol,
      phenotype: i.phenotype,
      recommendation: i.recommendation,
      evidenceLevel: i.evidence_level,
      sources: i.sources
    }))
  });
});
