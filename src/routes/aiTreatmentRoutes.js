import express from 'express';
import aiTreatmentPredictionService from '../services/aiTreatmentPredictionService.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const treatmentSchema = Joi.object({
  regimen: Joi.string().required(),
  type: Joi.string().valid('chemotherapy', 'immunotherapy', 'targeted', 'combination', 'radiation', 'surgery').optional(),
  agents: Joi.array().items(Joi.string()).optional(),
  dosing: Joi.object().optional(),
  schedule: Joi.string().optional(),
  duration: Joi.number().optional(),
  evidence: Joi.string().valid('A', 'B', 'C', 'D').optional(),
  approvalStatus: Joi.string().optional()
});

const biomarkersSchema = Joi.object({
  her2: Joi.string().valid('positive', 'negative', 'unknown').optional(),
  er: Joi.string().valid('positive', 'negative', 'unknown').optional(),
  pr: Joi.string().valid('positive', 'negative', 'unknown').optional(),
  pdl1: Joi.number().min(0).max(100).optional(),
  msi: Joi.string().valid('high', 'stable', 'unknown').optional(),
  tmb: Joi.number().min(0).optional(),
  brca1: Joi.string().valid('mutation', 'wild_type', 'unknown').optional(),
  brca2: Joi.string().valid('mutation', 'wild_type', 'unknown').optional(),
  kras: Joi.string().valid('mutation', 'wild_type', 'unknown').optional(),
  egfr: Joi.string().valid('mutation', 'wild_type', 'unknown').optional(),
  braf: Joi.string().valid('mutation', 'wild_type', 'unknown').optional()
});

const genomicsSchema = Joi.object({
  variants: Joi.array().items(Joi.object({
    gene: Joi.string().required(),
    alteration: Joi.string().optional(),
    clinicalSignificance: Joi.string().optional(),
    alleleFrequency: Joi.number().min(0).max(1).optional()
  })).optional(),
  mutationalSignatures: Joi.array().items(Joi.string()).optional(),
  tumorMutationalBurden: Joi.number().min(0).optional(),
  microsatelliteInstability: Joi.string().valid('high', 'stable', 'unknown').optional(),
  homologousRecombinationDeficiency: Joi.string().valid('positive', 'negative', 'unknown').optional()
});

const patientDataSchema = Joi.object({
  patientId: Joi.string().optional(),
  age: Joi.number().integer().min(0).max(120).required(),
  sex: Joi.string().valid('male', 'female', 'other').required(),
  cancerType: Joi.string().required(),
  cancerStage: Joi.string().required(),
  histology: Joi.string().optional(),
  performanceStatus: Joi.number().integer().min(0).max(4).required(),
  comorbidities: Joi.array().items(Joi.string()).optional(),
  biomarkers: biomarkersSchema.optional(),
  genomics: genomicsSchema.optional(),
  priorTreatments: Joi.array().items(Joi.object({
    regimen: Joi.string().required(),
    response: Joi.string().valid('CR', 'PR', 'SD', 'PD').optional(),
    duration: Joi.number().optional(),
    endReason: Joi.string().optional()
  })).optional(),
  laboratoryValues: Joi.object({
    hemoglobin: Joi.number().min(0).optional(),
    neutrophils: Joi.number().min(0).optional(),
    platelets: Joi.number().min(0).optional(),
    creatinine: Joi.number().min(0).optional(),
    bilirubin: Joi.number().min(0).optional(),
    alt: Joi.number().min(0).optional(),
    ast: Joi.number().min(0).optional()
  }).optional(),
  kidneyFunction: Joi.number().min(0).max(200).optional(),
  liverFunction: Joi.object().optional(),
  cardiacFunction: Joi.object().optional(),
  metastaticSites: Joi.array().items(Joi.string()).optional()
});

/**
 * Comprehensive AI treatment prediction
 * POST /api/ai/predict-treatment
 */
router.post('/predict-treatment',
  authenticateToken,
  validateRequest({
    body: Joi.object({
      patientData: patientDataSchema.required(),
      availableTreatments: Joi.array().items(treatmentSchema).min(1).required(),
      predictionOptions: Joi.object({
        includeResponsePrediction: Joi.boolean().default(true),
        includeSurvivalPrediction: Joi.boolean().default(true),
        includeToxicityPrediction: Joi.boolean().default(true),
        includeQualityOfLife: Joi.boolean().default(false),
        includeBiomarkerAnalysis: Joi.boolean().default(true),
        confidenceLevel: Joi.number().min(0.8).max(0.99).default(0.95),
        timeHorizon: Joi.number().integer().min(6).max(60).default(24) // months
      }).optional()
    })
  }),
  async (req, res) => {
    try {
      const { 
        patientData, 
        availableTreatments, 
        predictionOptions = {} 
      } = req.body;

      const prediction = await aiTreatmentPredictionService.predictOptimalTreatment(
        patientData,
        availableTreatments
      );

      // Filter results based on prediction options
      const filteredPrediction = filterPredictionResults(prediction, predictionOptions);

      res.json({
        success: true,
        data: filteredPrediction,
        metadata: {
          timestamp: new Date().toISOString(),
          analysisType: 'ai_treatment_prediction',
          version: '2.0',
          modelVersions: {
            responsePredictor: '2.1.0',
            survivalPredictor: '1.8.0',
            toxicityPredictor: '1.5.0'
          },
          options: predictionOptions,
          patientSummary: {
            age: patientData.age,
            cancerType: patientData.cancerType,
            stage: patientData.cancerStage,
            performanceStatus: patientData.performanceStatus
          }
        }
      });

    } catch (error) {
      console.error('AI treatment prediction error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to predict optimal treatment',
        message: error.message
      });
    }
  }
);

/**
 * Treatment response prediction
 * POST /api/ai/predict-response
 */
router.post('/predict-response',
  authenticateToken,
  validateRequest({
    body: Joi.object({
      patientData: patientDataSchema.required(),
      treatment: treatmentSchema.required(),
      responseMetrics: Joi.array().items(
        Joi.string().valid('ORR', 'DCR', 'PFS', 'OS', 'duration')
      ).default(['ORR', 'DCR'])
    })
  }),
  async (req, res) => {
    try {
      const { patientData, treatment, responseMetrics } = req.body;

      const responsePrediction = await aiTreatmentPredictionService.predictTreatmentResponse(
        patientData,
        [treatment]
      );

      const enhancedPrediction = {
        ...responsePrediction[0],
        responseMetrics: await generateResponseMetrics(responsePrediction[0], responseMetrics),
        patientSpecificFactors: await identifyPatientSpecificFactors(patientData, treatment),
        mechanismOfAction: await analyzeMechanismOfAction(treatment, patientData.biomarkers),
        monitoringPlan: await generateResponseMonitoringPlan(patientData, treatment)
      };

      res.json({
        success: true,
        data: enhancedPrediction,
        metadata: {
          timestamp: new Date().toISOString(),
          analysisType: 'response_prediction',
          treatment: treatment.regimen,
          metricsRequested: responseMetrics
        }
      });

    } catch (error) {
      console.error('Response prediction error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to predict treatment response',
        message: error.message
      });
    }
  }
);

/**
 * Survival outcome prediction
 * POST /api/ai/predict-survival
 */
router.post('/predict-survival',
  authenticateToken,
  validateRequest({
    body: Joi.object({
      patientData: patientDataSchema.required(),
      treatments: Joi.array().items(treatmentSchema).min(1).required(),
      survivalMetrics: Joi.array().items(
        Joi.string().valid('OS', 'PFS', 'DFS', 'RFS')
      ).default(['OS', 'PFS']),
      timePoints: Joi.array().items(Joi.number().integer().min(1).max(120)).default([6, 12, 24, 36])
    })
  }),
  async (req, res) => {
    try {
      const { patientData, treatments, survivalMetrics, timePoints } = req.body;

      const survivalPredictions = await aiTreatmentPredictionService.predictSurvivalOutcomes(
        patientData,
        treatments
      );

      const enhancedPredictions = await Promise.all(
        survivalPredictions.map(async (prediction) => ({
          ...prediction,
          kaplanMeierCurve: await generateKaplanMeierEstimate(prediction, timePoints),
          prognosticModel: await generatePrognosticModel(patientData, prediction),
          riskStratification: await performRiskStratification(patientData, prediction),
          comparativeAnalysis: await compareToHistoricalData(prediction, patientData.cancerType)
        }))
      );

      res.json({
        success: true,
        data: {
          predictions: enhancedPredictions,
          treatmentRanking: rankTreatmentsBySurvival(enhancedPredictions),
          prognosticFactors: await identifyPrognosticFactors(patientData),
          riskScore: await calculateOverallRiskScore(patientData)
        },
        metadata: {
          timestamp: new Date().toISOString(),
          analysisType: 'survival_prediction',
          metricsAnalyzed: survivalMetrics,
          timePoints: timePoints
        }
      });

    } catch (error) {
      console.error('Survival prediction error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to predict survival outcomes',
        message: error.message
      });
    }
  }
);

/**
 * Toxicity risk prediction
 * POST /api/ai/predict-toxicity
 */
router.post('/predict-toxicity',
  authenticateToken,
  validateRequest({
    body: Joi.object({
      patientData: patientDataSchema.required(),
      treatment: treatmentSchema.required(),
      toxicityTypes: Joi.array().items(
        Joi.string().valid('hematologic', 'gastrointestinal', 'neurologic', 'cardiac', 'hepatic', 'renal', 'dermatologic')
      ).optional(),
      severityLevels: Joi.array().items(
        Joi.string().valid('grade1', 'grade2', 'grade3', 'grade4', 'grade5')
      ).default(['grade3', 'grade4'])
    })
  }),
  async (req, res) => {
    try {
      const { patientData, treatment, toxicityTypes, severityLevels } = req.body;

      const toxicityPrediction = await aiTreatmentPredictionService.predictToxicityRisks(
        patientData,
        [treatment]
      );

      const enhancedPrediction = {
        ...toxicityPrediction[0],
        organSpecificToxicities: await predictOrganSpecificToxicities(patientData, treatment, toxicityTypes),
        timeToOnset: await predictToxicityOnset(patientData, treatment),
        mitigationStrategies: await generateMitigationStrategies(patientData, treatment),
        monitoringSchedule: await generateToxicityMonitoringSchedule(patientData, treatment),
        doseModifications: await suggestDoseModifications(patientData, treatment),
        supportiveCare: await recommendSupportiveCare(patientData, treatment)
      };

      res.json({
        success: true,
        data: enhancedPrediction,
        metadata: {
          timestamp: new Date().toISOString(),
          analysisType: 'toxicity_prediction',
          treatment: treatment.regimen,
          severityLevels: severityLevels
        }
      });

    } catch (error) {
      console.error('Toxicity prediction error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to predict toxicity risks',
        message: error.message
      });
    }
  }
);

/**
 * Treatment comparison and ranking
 * POST /api/ai/compare-treatments
 */
router.post('/compare-treatments',
  authenticateToken,
  validateRequest({
    body: Joi.object({
      patientData: patientDataSchema.required(),
      treatments: Joi.array().items(treatmentSchema).min(2).required(),
      comparisonCriteria: Joi.object({
        weightResponse: Joi.number().min(0).max(1).default(0.3),
        weightSurvival: Joi.number().min(0).max(1).default(0.4),
        weightToxicity: Joi.number().min(0).max(1).default(0.2),
        weightQualityOfLife: Joi.number().min(0).max(1).default(0.1)
      }).optional(),
      includeEconomicAnalysis: Joi.boolean().default(false)
    })
  }),
  async (req, res) => {
    try {
      const { patientData, treatments, comparisonCriteria = {}, includeEconomicAnalysis } = req.body;

      const comparison = await performTreatmentComparison(
        patientData,
        treatments,
        comparisonCriteria
      );

      if (includeEconomicAnalysis) {
        comparison.economicAnalysis = await performEconomicAnalysis(
          patientData,
          treatments,
          comparison.predictions
        );
      }

      res.json({
        success: true,
        data: {
          ...comparison,
          recommendations: await generateComparativeRecommendations(comparison),
          decisionSupport: await generateDecisionSupportSummary(comparison, patientData)
        },
        metadata: {
          timestamp: new Date().toISOString(),
          analysisType: 'treatment_comparison',
          treatmentsCompared: treatments.length,
          criteria: comparisonCriteria
        }
      });

    } catch (error) {
      console.error('Treatment comparison error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to compare treatments',
        message: error.message
      });
    }
  }
);

/**
 * Generate treatment explanation
 * POST /api/ai/explain-prediction
 */
router.post('/explain-prediction',
  authenticateToken,
  validateRequest({
    body: Joi.object({
      predictionId: Joi.string().required(),
      explanationType: Joi.string().valid('detailed', 'summary', 'patient_friendly').default('summary'),
      includeVisualization: Joi.boolean().default(false)
    })
  }),
  async (req, res) => {
    try {
      const { predictionId, explanationType, includeVisualization } = req.body;

      const explanation = await generatePredictionExplanation(
        predictionId,
        explanationType
      );

      if (includeVisualization) {
        explanation.visualizations = await generatePredictionVisualizations(predictionId);
      }

      res.json({
        success: true,
        data: explanation,
        metadata: {
          timestamp: new Date().toISOString(),
          analysisType: 'prediction_explanation',
          predictionId,
          explanationType
        }
      });

    } catch (error) {
      console.error('Prediction explanation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate prediction explanation',
        message: error.message
      });
    }
  }
);

// Helper functions
function filterPredictionResults(prediction, options) {
  const filtered = { ...prediction };
  if (!filtered.predictions) {
    filtered.predictions = {};
  }
  
  if (options && !options.includeResponsePrediction) {
    delete filtered.predictions?.responseRates;
  }
  
  if (options && !options.includeSurvivalPrediction) {
    delete filtered.predictions?.survivalOutcomes;
  }
  
  if (options && !options.includeToxicityPrediction) {
    delete filtered.predictions?.toxicityRisks;
  }
  
  if (options && !options.includeQualityOfLife) {
    delete filtered.predictions?.qualityOfLife;
  }
  
  if (options && !options.includeBiomarkerAnalysis) {
    delete filtered.predictions?.biomarkerResponse;
  }
  
  return filtered;
}

// Placeholder helper functions
async function generateResponseMetrics(prediction, metrics) { return {}; }
async function identifyPatientSpecificFactors(patientData, treatment) { return []; }
async function analyzeMechanismOfAction(treatment, biomarkers) { return {}; }
async function generateResponseMonitoringPlan(patientData, treatment) { return {}; }
async function generateKaplanMeierEstimate(prediction, timePoints) { return {}; }
async function generatePrognosticModel(patientData, prediction) { return {}; }
async function performRiskStratification(patientData, prediction) { return {}; }
async function compareToHistoricalData(prediction, cancerType) { return {}; }
function rankTreatmentsBySurvival(predictions) { return []; }
async function identifyPrognosticFactors(patientData) { return []; }
async function calculateOverallRiskScore(patientData) { return 0.5; }
async function predictOrganSpecificToxicities(patientData, treatment, types) { return {}; }
async function predictToxicityOnset(patientData, treatment) { return {}; }
async function generateMitigationStrategies(patientData, treatment) { return []; }
async function generateToxicityMonitoringSchedule(patientData, treatment) { return {}; }
async function suggestDoseModifications(patientData, treatment) { return []; }
async function recommendSupportiveCare(patientData, treatment) { return []; }
async function performTreatmentComparison(patientData, treatments, criteria) { return {}; }
async function performEconomicAnalysis(patientData, treatments, predictions) { return {}; }
async function generateComparativeRecommendations(comparison) { return []; }
async function generateDecisionSupportSummary(comparison, patientData) { return {}; }
async function generatePredictionExplanation(predictionId, type) { return {}; }
async function generatePredictionVisualizations(predictionId) { return {}; }

export default router;
