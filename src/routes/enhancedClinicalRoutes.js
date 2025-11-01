import express from 'express';
import enhancedInteractionEngine from '../services/enhancedInteractionEngine.js';
import clinicalDecisionSupport from '../services/clinicalDecisionSupport.js';
import pharmacogenomicsService from '../services/pharmacogenomicsService.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest, medicationSchema as sharedMedicationSchema, patientContextSchema as sharedPatientContextSchema, prescriptionSchema as sharedPrescriptionSchema } from '../middleware/validation.js';
import Joi from 'joi';

const router = express.Router();

// Use shared validation schemas
const medicationSchema = sharedMedicationSchema;
const patientContextSchema = sharedPatientContextSchema;
const prescriptionSchema = sharedPrescriptionSchema;

/**
 * Enhanced drug interaction analysis
 * POST /api/clinical/analyze-interactions
 */
router.post('/analyze-interactions', 
  authenticateToken,
  validateRequest({
    body: Joi.object({
      medications: Joi.array().items(medicationSchema).min(2).required(),
      patientContext: patientContextSchema.optional()
    })
  }),
  async (req, res) => {
    try {
      const { medications, patientContext = {} } = req.body;

      const analysis = await enhancedInteractionEngine.analyzeInteractions(
        medications,
        patientContext
      );

      res.json({
        success: true,
        data: analysis,
        metadata: {
          timestamp: new Date().toISOString(),
          analysisType: 'enhanced_drug_interactions',
          version: '2.0'
        }
      });

    } catch (error) {
      console.error('Enhanced interaction analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze drug interactions',
        message: error.message
      });
    }
  }
);

/**
 * Comprehensive clinical decision support
 * POST /api/clinical/decision-support
 */
router.post('/decision-support',
  authenticateToken,
  validateRequest({
    body: prescriptionSchema
  }),
  async (req, res) => {
    try {
      const { medications, patientContext = {} } = req.body;

      const decisionSupport = await clinicalDecisionSupport.provideClinicalDecisionSupport(
        { medications },
        patientContext
      );

      res.json({
        success: true,
        data: decisionSupport,
        metadata: {
          timestamp: new Date().toISOString(),
          analysisType: 'clinical_decision_support',
          version: '2.0'
        }
      });

    } catch (error) {
      console.error('Clinical decision support error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to provide clinical decision support',
        message: error.message
      });
    }
  }
);

/**
 * Pharmacogenomic analysis
 * POST /api/clinical/pharmacogenomics
 */
router.post('/pharmacogenomics',
  authenticateToken,
  validateRequest({
    body: Joi.object({
      medications: Joi.array().items(medicationSchema).min(1).required(),
      genetics: Joi.object().pattern(Joi.string(), Joi.any()).required(),
      patientContext: patientContextSchema.optional()
    })
  }),
  async (req, res) => {
    try {
      const { medications, genetics, patientContext = {} } = req.body;

      const pgxAnalysis = await pharmacogenomicsService.analyzePharmacogenomics(
        medications,
        genetics,
        patientContext
      );

      res.json({
        success: true,
        data: pgxAnalysis,
        metadata: {
          timestamp: new Date().toISOString(),
          analysisType: 'pharmacogenomic_analysis',
          version: '2.0'
        }
      });

    } catch (error) {
      console.error('Pharmacogenomic analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze pharmacogenomics',
        message: error.message
      });
    }
  }
);

/**
 * Comprehensive prescription analysis (all services combined)
 * POST /api/clinical/comprehensive-analysis
 */
router.post('/comprehensive-analysis',
  authenticateToken,
  validateRequest({
    body: Joi.object({
      medications: Joi.array().items(medicationSchema).min(1).required(),
      patientContext: patientContextSchema.optional(),
      includePharmacogenomics: Joi.boolean().default(false),
      includeInteractions: Joi.boolean().default(true),
      includeDecisionSupport: Joi.boolean().default(true)
    })
  }),
  async (req, res) => {
    try {
      const { 
        medications, 
        patientContext = {}, 
        includePharmacogenomics = false,
        includeInteractions = true,
        includeDecisionSupport = true
      } = req.body;

      const comprehensiveAnalysis = {
        sessionId: req.body.sessionId || `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
        medications,
        patientContext,
        analyses: {}
      };

      // Drug interaction analysis
      if (includeInteractions && medications.length > 1) {
        comprehensiveAnalysis.analyses.interactions = await enhancedInteractionEngine.analyzeInteractions(
          medications,
          patientContext
        );
      }

      // Clinical decision support
      if (includeDecisionSupport) {
        comprehensiveAnalysis.analyses.decisionSupport = await clinicalDecisionSupport.provideClinicalDecisionSupport(
          { medications },
          patientContext
        );
      }

      // Pharmacogenomic analysis (if genetic data available)
      if (includePharmacogenomics && patientContext.genetics) {
        comprehensiveAnalysis.analyses.pharmacogenomics = await pharmacogenomicsService.analyzePharmacogenomics(
          medications,
          patientContext.genetics,
          patientContext
        );
      }

      // Generate integrated summary
      comprehensiveAnalysis.summary = generateIntegratedSummary(comprehensiveAnalysis.analyses);

      res.json({
        success: true,
        data: comprehensiveAnalysis,
        metadata: {
          timestamp: new Date().toISOString(),
          analysisType: 'comprehensive_clinical_analysis',
          version: '2.0',
          servicesIncluded: {
            interactions: includeInteractions && medications.length > 1,
            decisionSupport: includeDecisionSupport,
            pharmacogenomics: includePharmacogenomics && !!patientContext.genetics
          }
        }
      });

    } catch (error) {
      console.error('Comprehensive analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to perform comprehensive analysis',
        message: error.message
      });
    }
  }
);

/**
 * Get drug information with clinical context
 * GET /api/clinical/drug-info/:rxcui
 */
router.get('/drug-info/:rxcui',
  authenticateToken,
  validateRequest({
    params: Joi.object({ rxcui: Joi.string().required() }),
    query: Joi.object({ patientContext: Joi.string().optional() })
  }),
  async (req, res) => {
    try {
      const { rxcui } = req.params;
      let patientContext = {};
      try {
        patientContext = req.query.patientContext ? JSON.parse(req.query.patientContext) : {};
      } catch (e) {
        return res.status(400).json({ success: false, error: 'Invalid patientContext JSON', message: e.message });
      }

      // This would integrate with our enhanced drug database
      const drugInfo = {
        rxcui,
        basicInfo: await getDrugBasicInfo(rxcui),
        clinicalInfo: await getDrugClinicalInfo(rxcui, patientContext),
        interactions: await getDrugInteractionProfile(rxcui),
        pharmacogenomics: await getDrugPharmacogenomics(rxcui),
        monitoringRequirements: await getDrugMonitoring(rxcui, patientContext)
      };

      res.json({
        success: true,
        data: drugInfo,
        metadata: {
          timestamp: new Date().toISOString(),
          dataType: 'enhanced_drug_information',
          version: '2.0'
        }
      });

    } catch (error) {
      console.error('Drug info error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve drug information',
        message: error.message
      });
    }
  }
);

/**
 * Get alternative drug suggestions
 * POST /api/clinical/alternatives
 */
router.post('/alternatives',
  authenticateToken,
  validateRequest({
    body: Joi.object({
      medication: medicationSchema.required(),
      patientContext: patientContextSchema.optional(),
      reason: Joi.string().valid('interaction', 'contraindication', 'intolerance', 'efficacy', 'cost').optional()
    })
  }),
  async (req, res) => {
    try {
      const { medication, patientContext = {}, reason = 'general' } = req.body;

      const alternatives = await findAlternativeDrugs(medication, patientContext, reason);

      res.json({
        success: true,
        data: {
          originalMedication: medication,
          alternatives,
          reason,
          selectionCriteria: getAlternativeSelectionCriteria(reason)
        },
        metadata: {
          timestamp: new Date().toISOString(),
          analysisType: 'drug_alternatives',
          version: '2.0'
        }
      });

    } catch (error) {
      console.error('Alternatives analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to find alternative drugs',
        message: error.message
      });
    }
  }
);

// Helper functions
function generateIntegratedSummary(analyses) {
  const summary = {
    overallRisk: 'low',
    totalAlerts: 0,
    criticalIssues: [],
    recommendations: [],
    actionRequired: false
  };

  // Aggregate from interaction analysis
  if (analyses.interactions) {
    const interactionSummary = analyses.interactions.summary || { totalInteractions: 0 };
    const list = Array.isArray(analyses.interactions.interactions) ? analyses.interactions.interactions : [];
    summary.totalAlerts += Number(interactionSummary.totalInteractions || list.length);
    summary.criticalIssues.push(...list.filter(i => i.severity === 'critical'));
  }

  // Aggregate from decision support
  if (analyses.decisionSupport) {
    const dsSummary = analyses.decisionSupport.summary || { totalAlerts: 0, actionRequired: false };
    const recs = Array.isArray(analyses.decisionSupport.recommendations) ? analyses.decisionSupport.recommendations : [];
    summary.totalAlerts += Number(dsSummary.totalAlerts || recs.length || 0);
    summary.actionRequired = summary.actionRequired || !!dsSummary.actionRequired;
    summary.recommendations.push(...recs);
  }

  // Aggregate from pharmacogenomics
  if (analyses.pharmacogenomics) {
    const pgxSummary = analyses.pharmacogenomics.riskAssessment;
    if (pgxSummary.riskCategory === 'high') {
      summary.overallRisk = 'high';
      summary.actionRequired = true;
    }
  }

  // Determine overall risk
  if (summary.criticalIssues.length > 0) {
    summary.overallRisk = 'critical';
    summary.actionRequired = true;
  } else if (summary.totalAlerts > 5) {
    summary.overallRisk = 'moderate';
  }

  return summary;
}

// Placeholder helper functions
async function getDrugBasicInfo(rxcui) { return {}; }
async function getDrugClinicalInfo(rxcui, context) { return {}; }
async function getDrugInteractionProfile(rxcui) { return []; }
async function getDrugPharmacogenomics(rxcui) { return {}; }
async function getDrugMonitoring(rxcui, context) { return []; }
async function findAlternativeDrugs(medication, context, reason) { return []; }
function getAlternativeSelectionCriteria(reason) { return []; }

export default router;
