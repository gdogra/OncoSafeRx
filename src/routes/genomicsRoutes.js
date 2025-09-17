import express from 'express';
import { GeneDrugInteraction } from '../models/Interaction.js';
import CPIC_GUIDELINES_DB from '../data/cpicGuidelines.js';

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
router.post('/profile/check', async (req, res) => {
  try {
    const { genes, drugs } = req.body;
    
    if (!genes || !drugs) {
      return res.status(400).json({ 
        error: 'Please provide both genes and drugs arrays' 
      });
    }

    // Sample response - replace with actual genomic analysis
    const analysis = {
      inputGenes: genes,
      inputDrugs: drugs,
      alerts: [
        {
          gene: 'CYP2D6',
          drug: 'codeine',
          severity: 'HIGH',
          recommendation: 'Avoid codeine - use alternative analgesic',
          evidence: 'CPIC Level A'
        }
      ],
      recommendations: [
        'Consider genetic testing for CYP2D6 before prescribing codeine',
        'Monitor for adverse effects with current medication regimen'
      ]
    };

    res.json({
      message: 'Sample genomic analysis - full implementation coming in next phase',
      analysis
    });
  } catch (error) {
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
    const phenotypes = [];

    const map = {
      'CYP2D6 *1/*1': 'Normal metabolizer',
      'CYP2D6 *1/*4': 'Intermediate metabolizer',
      'CYP2D6 *4/*4': 'Poor metabolizer'
    };

    for (const obs of observations) {
      const text = (obs.valueString || obs.value || obs.interpretation?.text || '').toString();
      const codeText = `${obs.code?.text || ''} ${text}`.trim();
      const matched = Object.keys(map).find(k => codeText.toUpperCase().includes(k.toUpperCase()));
      if (matched) {
        const gene = matched.split(' ')[0];
        phenotypes.push({ gene, phenotype: map[matched] });
      }
    }

    res.json({ count: phenotypes.length, phenotypes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
