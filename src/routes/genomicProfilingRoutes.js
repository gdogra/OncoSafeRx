import express from 'express';
import genomicProfilingService from '../services/genomicProfilingService.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest, patientContextSchema as sharedPatientContextSchema } from '../middleware/validation.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const variantSchema = Joi.object({
  gene: Joi.string().required(),
  chromosome: Joi.string().optional(),
  position: Joi.number().integer().optional(),
  ref: Joi.string().optional(),
  alt: Joi.string().optional(),
  alteration: Joi.string().optional(),
  type: Joi.string().valid('snv', 'indel', 'cnv', 'fusion', 'structural').optional(),
  consequence: Joi.string().optional(),
  impact: Joi.string().valid('high', 'moderate', 'low', 'modifier').optional(),
  clinicalSignificance: Joi.string().valid(
    'pathogenic', 'likely_pathogenic', 'uncertain_significance', 
    'likely_benign', 'benign'
  ).optional(),
  alleleFrequency: Joi.number().min(0).max(1).optional(),
  coverage: Joi.number().integer().min(0).optional(),
  transcript: Joi.string().optional(),
  proteinChange: Joi.string().optional(),
  cosmicId: Joi.string().optional(),
  clinvarId: Joi.string().optional(),
  dbsnpId: Joi.string().optional()
});

const genomicDataSchema = Joi.object({
  sampleId: Joi.string().required(),
  cancerType: Joi.string().optional(),
  sampleType: Joi.string().valid('tumor', 'normal', 'liquid_biopsy').optional(),
  sequencingPlatform: Joi.string().optional(),
  panelType: Joi.string().optional(),
  variants: Joi.array().items(variantSchema).optional(),
  structuralVariants: Joi.array().items(Joi.object()).optional(),
  copyNumberVariations: Joi.array().items(Joi.object()).optional(),
  msiMarkers: Joi.object().optional(),
  tumorPurity: Joi.number().min(0).max(1).optional(),
  ploidy: Joi.number().optional(),
  qualityMetrics: Joi.object({
    meanCoverage: Joi.number().optional(),
    percentTargetCovered: Joi.number().min(0).max(100).optional(),
    uniformityMetric: Joi.number().optional()
  }).optional()
});

const patientContextSchema = sharedPatientContextSchema;

/**
 * Comprehensive genomic profile analysis
 * POST /api/genomics/analyze-profile
 */
router.post('/analyze-profile',
  authenticateToken,
  validateRequest({
    body: Joi.object({
      genomicData: genomicDataSchema.required(),
      patientContext: patientContextSchema.optional(),
      analysisOptions: Joi.object({
        includeMutationalSignatures: Joi.boolean().default(true),
        includeTMB: Joi.boolean().default(true),
        includeMSI: Joi.boolean().default(true),
        includeHRD: Joi.boolean().default(true),
        includeTherapeuticTargets: Joi.boolean().default(true),
        includeClinicalTrials: Joi.boolean().default(false),
        reportFormat: Joi.string().valid('comprehensive', 'summary', 'clinical').default('comprehensive')
      }).optional()
    })
  }),
  async (req, res) => {
    try {
      const { 
        genomicData, 
        patientContext = {}, 
        analysisOptions = {} 
      } = req.body;

      const analysis = await genomicProfilingService.analyzeGenomicProfile(
        genomicData,
        patientContext
      );

      // Filter results based on analysis options
      const filteredAnalysis = filterAnalysisResults(analysis, analysisOptions);

      res.json({
        success: true,
        data: filteredAnalysis,
        metadata: {
          timestamp: new Date().toISOString(),
          analysisType: 'genomic_profiling',
          version: '1.0',
          options: analysisOptions,
          sampleInfo: {
            sampleId: genomicData.sampleId,
            cancerType: genomicData.cancerType,
            sequencingPlatform: genomicData.sequencingPlatform
          }
        }
      });

    } catch (error) {
      console.error('Genomic profiling analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze genomic profile',
        message: error.message
      });
    }
  }
);

/**
 * Variant interpretation and annotation
 * POST /api/genomics/interpret-variants
 */
router.post('/interpret-variants',
  authenticateToken,
  validateRequest({
    body: Joi.object({
      variants: Joi.array().items(variantSchema).min(1).required(),
      cancerType: Joi.string().optional(),
      includeTherapeuticImplications: Joi.boolean().default(true),
      includePrognosticImplications: Joi.boolean().default(true),
      includeResistanceImplications: Joi.boolean().default(true)
    })
  }),
  async (req, res) => {
    try {
      const { 
        variants, 
        cancerType, 
        includeTherapeuticImplications = true,
        includePrognosticImplications = true,
        includeResistanceImplications = true
      } = req.body;

      const interpretation = await genomicProfilingService.analyzeVariants(variants);

      // Enhance with additional context if requested
      if (includeTherapeuticImplications || includePrognosticImplications || includeResistanceImplications) {
        for (let variant of interpretation.actionableVariants) {
          if (includeTherapeuticImplications) {
            variant.therapeuticOptions = await getTherapeuticOptions(variant, cancerType);
          }
          if (includePrognosticImplications) {
            variant.prognosticContext = await getPrognosticContext(variant, cancerType);
          }
          if (includeResistanceImplications) {
            variant.resistanceProfile = await getResistanceProfile(variant);
          }
        }
      }

      res.json({
        success: true,
        data: interpretation,
        metadata: {
          timestamp: new Date().toISOString(),
          analysisType: 'variant_interpretation',
          cancerType,
          variantsAnalyzed: variants.length
        }
      });

    } catch (error) {
      console.error('Variant interpretation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to interpret variants',
        message: error.message
      });
    }
  }
);

/**
 * Tumor Mutational Burden analysis
 * POST /api/genomics/analyze-tmb
 */
router.post('/analyze-tmb',
  authenticateToken,
  validateRequest({
    body: Joi.object({
      variants: Joi.array().items(variantSchema).required(),
      cancerType: Joi.string().optional(),
      sequencingInfo: Joi.object({
        targetedRegionSize: Joi.number().optional(), // in Mb
        platform: Joi.string().optional(),
        panelType: Joi.string().optional()
      }).optional()
    })
  }),
  async (req, res) => {
    try {
      const { variants, cancerType, sequencingInfo = {} } = req.body;

      const genomicData = {
        variants,
        cancerType,
        sequencingInfo
      };

      const tmbAnalysis = await genomicProfilingService.calculateTMB(genomicData);

      res.json({
        success: true,
        data: {
          ...tmbAnalysis,
          interpretation: interpretTMBResults(tmbAnalysis),
          recommendations: generateTMBRecommendations(tmbAnalysis, cancerType)
        },
        metadata: {
          timestamp: new Date().toISOString(),
          analysisType: 'tumor_mutational_burden',
          cancerType,
          variantsAnalyzed: variants.length
        }
      });

    } catch (error) {
      console.error('TMB analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze TMB',
        message: error.message
      });
    }
  }
);

/**
 * Microsatellite Instability analysis
 * POST /api/genomics/analyze-msi
 */
router.post('/analyze-msi',
  authenticateToken,
  validateRequest({
    body: Joi.object({
      msiMarkers: Joi.object().optional(),
      variants: Joi.array().items(variantSchema).optional(),
      cancerType: Joi.string().optional()
    })
  }),
  async (req, res) => {
    try {
      const { msiMarkers, variants = [], cancerType } = req.body;

      const genomicData = {
        msiMarkers,
        variants,
        cancerType
      };

      const msiAnalysis = await genomicProfilingService.analyzeMSI(genomicData);

      res.json({
        success: true,
        data: {
          ...msiAnalysis,
          interpretation: interpretMSIResults(msiAnalysis),
          clinicalImplications: getMSIClinicalImplications(msiAnalysis, cancerType)
        },
        metadata: {
          timestamp: new Date().toISOString(),
          analysisType: 'microsatellite_instability',
          cancerType
        }
      });

    } catch (error) {
      console.error('MSI analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze MSI',
        message: error.message
      });
    }
  }
);

/**
 * Homologous Recombination Deficiency analysis
 * POST /api/genomics/analyze-hrd
 */
router.post('/analyze-hrd',
  authenticateToken,
  validateRequest({
    body: Joi.object({
      variants: Joi.array().items(variantSchema).required(),
      structuralVariants: Joi.array().items(Joi.object()).optional(),
      cancerType: Joi.string().optional()
    })
  }),
  async (req, res) => {
    try {
      const { variants, structuralVariants = [], cancerType } = req.body;

      const genomicData = {
        variants,
        structuralVariants,
        cancerType
      };

      const hrdAnalysis = await genomicProfilingService.analyzeHRD(genomicData);

      res.json({
        success: true,
        data: {
          ...hrdAnalysis,
          interpretation: interpretHRDResults(hrdAnalysis),
          therapeuticOptions: getHRDTherapeuticOptions(hrdAnalysis, cancerType)
        },
        metadata: {
          timestamp: new Date().toISOString(),
          analysisType: 'homologous_recombination_deficiency',
          cancerType
        }
      });

    } catch (error) {
      console.error('HRD analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze HRD',
        message: error.message
      });
    }
  }
);

/**
 * Therapeutic target identification
 * POST /api/genomics/identify-targets
 */
router.post('/identify-targets',
  authenticateToken,
  validateRequest({
    body: Joi.object({
      variants: Joi.array().items(variantSchema).required(),
      cancerType: Joi.string().optional(),
      includeClinicalTrials: Joi.boolean().default(false),
      evidenceLevels: Joi.array().items(
        Joi.string().valid('A', 'B', 'C', 'D')
      ).default(['A', 'B'])
    })
  }),
  async (req, res) => {
    try {
      const { 
        variants, 
        cancerType, 
        includeClinicalTrials = false, 
        evidenceLevels = ['A', 'B'] 
      } = req.body;

      const genomicData = { variants, cancerType };
      const targets = await genomicProfilingService.identifyTherapeuticTargets(genomicData);

      // Filter by evidence levels
      const filteredTargets = filterTargetsByEvidenceLevel(targets, evidenceLevels);

      // Add clinical trials if requested
      if (includeClinicalTrials) {
        for (let tier of Object.values(filteredTargets)) {
          for (let target of tier) {
            target.clinicalTrials = await findRelevantClinicalTrials(target, cancerType);
          }
        }
      }

      res.json({
        success: true,
        data: {
          targets: filteredTargets,
          summary: generateTargetSummary(filteredTargets),
          prioritizedRecommendations: prioritizeTargets(filteredTargets, cancerType)
        },
        metadata: {
          timestamp: new Date().toISOString(),
          analysisType: 'therapeutic_targets',
          cancerType,
          evidenceLevels,
          includeClinicalTrials
        }
      });

    } catch (error) {
      console.error('Target identification error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to identify therapeutic targets',
        message: error.message
      });
    }
  }
);

// Helper functions
function filterAnalysisResults(analysis, options) {
  const filtered = { ...analysis };
  if (!filtered.results) {
    filtered.results = {};
  }
  
  if (options && !options.includeMutationalSignatures) {
    delete filtered.results?.mutationalSignatures;
  }
  
  if (options && !options.includeTMB) {
    delete filtered.results?.tumorMutationalBurden;
  }
  
  if (options && !options.includeMSI) {
    delete filtered.results?.microsatelliteInstability;
  }
  
  if (options && !options.includeHRD) {
    delete filtered.results?.homologousRecombinationDeficiency;
  }
  
  if (options && !options.includeTherapeuticTargets) {
    delete filtered.results?.therapeuticTargets;
  }
  
  return filtered;
}

function interpretTMBResults(tmbAnalysis) {
  const { tmb, tmbCategory } = tmbAnalysis;
  
  let interpretation = '';
  
  switch (tmbCategory) {
    case 'very_high':
      interpretation = 'Very high TMB suggests strong potential for immunotherapy response';
      break;
    case 'high':
      interpretation = 'High TMB indicates good candidate for immunotherapy';
      break;
    case 'intermediate':
      interpretation = 'Intermediate TMB may benefit from immunotherapy in combination';
      break;
    case 'low':
      interpretation = 'Low TMB suggests limited immunotherapy benefit';
      break;
  }
  
  return {
    category: tmbCategory,
    description: interpretation,
    clinicalRelevance: tmb >= 10 ? 'high' : tmb >= 6 ? 'moderate' : 'low'
  };
}

function generateTMBRecommendations(tmbAnalysis, cancerType) {
  const recommendations = [];
  
  if (tmbAnalysis.tmbCategory === 'high' || tmbAnalysis.tmbCategory === 'very_high') {
    recommendations.push({
      type: 'therapeutic',
      priority: 'high',
      recommendation: 'Consider immune checkpoint inhibitor therapy',
      evidence: 'High TMB associated with improved immunotherapy response',
      drugs: ['Pembrolizumab', 'Nivolumab', 'Atezolizumab']
    });
  }
  
  return recommendations;
}

// Placeholder helper functions
async function getTherapeuticOptions(variant, cancerType) { return []; }
async function getPrognosticContext(variant, cancerType) { return {}; }
async function getResistanceProfile(variant) { return {}; }
function interpretMSIResults(msiAnalysis) { return {}; }
function getMSIClinicalImplications(msiAnalysis, cancerType) { return []; }
function interpretHRDResults(hrdAnalysis) { return {}; }
function getHRDTherapeuticOptions(hrdAnalysis, cancerType) { return []; }
function filterTargetsByEvidenceLevel(targets, levels) { return targets; }
async function findRelevantClinicalTrials(target, cancerType) { return []; }
function generateTargetSummary(targets) { return {}; }
function prioritizeTargets(targets, cancerType) { return []; }

export default router;
