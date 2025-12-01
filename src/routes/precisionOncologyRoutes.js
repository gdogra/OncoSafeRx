import express from 'express';
import precisionOncologyEngine from '../services/precisionOncologyEngine.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { optionalAuth } from '../middleware/auth.js';
import { searchLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * Generate comprehensive precision oncology recommendations
 */
router.post('/recommendations',
  searchLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { patientProfile, analysisType = 'comprehensive' } = req.body;
    
    if (!patientProfile) {
      return res.status(400).json({
        error: 'Patient profile is required',
        code: 'MISSING_PATIENT_PROFILE'
      });
    }

    try {
      let recommendations;
      
      switch (analysisType) {
        case 'comprehensive':
          recommendations = await precisionOncologyEngine.generateComprehensiveTreatmentRecommendations(patientProfile);
          break;
        
        case 'molecular':
          recommendations = {
            molecularSignature: await precisionOncologyEngine.analyzeMolecularProfile(patientProfile)
          };
          break;
        
        case 'resistance':
          recommendations = {
            resistancePrediction: await precisionOncologyEngine.predictResistance(patientProfile)
          };
          break;
        
        case 'combination':
          recommendations = {
            combinationTherapyOptimization: await precisionOncologyEngine.optimizeCombinations(patientProfile)
          };
          break;
        
        default:
          recommendations = await precisionOncologyEngine.generateComprehensiveTreatmentRecommendations(patientProfile);
      }

      res.json({
        success: true,
        analysisType,
        recommendations,
        requestId: req.id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Precision oncology analysis error:', error);
      res.status(500).json({
        error: 'Analysis failed',
        details: error.message,
        code: 'ANALYSIS_ERROR',
        requestId: req.id
      });
    }
  })
);

/**
 * Analyze molecular profile specifically
 */
router.post('/molecular-analysis',
  searchLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { genomicData, tumorType, stage, priorTherapies } = req.body;
    
    const patientProfile = {
      genomicData,
      tumorType,
      stage,
      priorTherapies
    };

    try {
      const molecularAnalysis = await precisionOncologyEngine.analyzeMolecularProfile(patientProfile);
      
      res.json({
        success: true,
        analysis: molecularAnalysis,
        actionableFindings: molecularAnalysis.driverMutations?.length || 0,
        evidenceLevel: molecularAnalysis.evidenceLevel,
        requestId: req.id
      });

    } catch (error) {
      console.error('Molecular analysis error:', error);
      res.status(500).json({
        error: 'Molecular analysis failed',
        details: error.message,
        requestId: req.id
      });
    }
  })
);

/**
 * Predict resistance mechanisms and timeline
 */
router.post('/resistance-prediction',
  searchLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { patientProfile } = req.body;
    
    if (!patientProfile.currentTreatment) {
      return res.status(400).json({
        error: 'Current treatment information required for resistance prediction',
        code: 'MISSING_TREATMENT_INFO'
      });
    }

    try {
      const resistancePrediction = await precisionOncologyEngine.predictResistance(patientProfile);
      
      res.json({
        success: true,
        resistancePrediction,
        riskLevel: resistancePrediction.primaryResistance.likelihood > 0.7 ? 'High' : 
                  resistancePrediction.primaryResistance.likelihood > 0.3 ? 'Moderate' : 'Low',
        monitoringRecommendations: resistancePrediction.acquiredResistance.monitoringStrategy,
        requestId: req.id
      });

    } catch (error) {
      console.error('Resistance prediction error:', error);
      res.status(500).json({
        error: 'Resistance prediction failed',
        details: error.message,
        requestId: req.id
      });
    }
  })
);

/**
 * Optimize combination therapies
 */
router.post('/combination-optimization',
  searchLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { patientProfile } = req.body;

    try {
      const combinationOptimization = await precisionOncologyEngine.optimizeCombinations(patientProfile);
      
      res.json({
        success: true,
        combinations: combinationOptimization,
        recommendedCombinations: combinationOptimization.synergistic?.length || 0,
        safetyAlerts: combinationOptimization.contraindications?.length || 0,
        requestId: req.id
      });

    } catch (error) {
      console.error('Combination optimization error:', error);
      res.status(500).json({
        error: 'Combination optimization failed',
        details: error.message,
        requestId: req.id
      });
    }
  })
);

/**
 * Track biomarker evolution
 */
router.post('/biomarker-tracking',
  searchLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { patientProfile } = req.body;
    
    if (!patientProfile.biomarkerHistory || patientProfile.biomarkerHistory.length < 2) {
      return res.status(400).json({
        error: 'At least 2 biomarker timepoints required for tracking analysis',
        code: 'INSUFFICIENT_BIOMARKER_DATA'
      });
    }

    try {
      const biomarkerTracking = await precisionOncologyEngine.trackBiomarkerChanges(patientProfile);
      
      res.json({
        success: true,
        tracking: biomarkerTracking,
        trendsDetected: biomarkerTracking.trends?.length || 0,
        resistanceSignals: biomarkerTracking.resistanceSignals?.length || 0,
        nextAssessment: biomarkerTracking.nextAssessment,
        requestId: req.id
      });

    } catch (error) {
      console.error('Biomarker tracking error:', error);
      res.status(500).json({
        error: 'Biomarker tracking failed',
        details: error.message,
        requestId: req.id
      });
    }
  })
);

/**
 * Get real-world outcomes matching
 */
router.post('/real-world-outcomes',
  searchLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { patientProfile } = req.body;

    try {
      const realWorldData = await precisionOncologyEngine.matchRealWorldData(patientProfile);
      
      res.json({
        success: true,
        realWorldData,
        similarPatients: realWorldData.similarPatients?.length || 0,
        evidenceLevel: realWorldData.evidenceLevel,
        predictiveAccuracy: realWorldData.similarPatients?.length > 20 ? 'High' : 
                           realWorldData.similarPatients?.length > 10 ? 'Moderate' : 'Low',
        requestId: req.id
      });

    } catch (error) {
      console.error('Real-world outcomes error:', error);
      res.status(500).json({
        error: 'Real-world outcomes analysis failed',
        details: error.message,
        requestId: req.id
      });
    }
  })
);

/**
 * Calculate prognostic score
 */
router.post('/prognostic-score',
  searchLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { patientProfile } = req.body;

    try {
      const prognosticScore = await precisionOncologyEngine.calculatePrognosticScore(patientProfile);
      
      res.json({
        success: true,
        prognosticScore,
        riskStratification: prognosticScore.riskCategory,
        survivalPrediction: prognosticScore.survivalPrediction,
        confidence: prognosticScore.confidence,
        requestId: req.id
      });

    } catch (error) {
      console.error('Prognostic scoring error:', error);
      res.status(500).json({
        error: 'Prognostic scoring failed',
        details: error.message,
        requestId: req.id
      });
    }
  })
);

/**
 * Get actionable mutations summary
 */
router.post('/actionable-mutations',
  searchLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { patientProfile } = req.body;
    
    if (!patientProfile.genomicData?.mutations) {
      return res.status(400).json({
        error: 'Genomic mutations data required',
        code: 'MISSING_GENOMIC_DATA'
      });
    }

    try {
      const actionableMutations = await precisionOncologyEngine.identifyActionableMutations(patientProfile);
      
      res.json({
        success: true,
        actionableMutations,
        totalActionable: actionableMutations.length,
        highEvidence: actionableMutations.filter(m => m.actionabilityLevel >= 3).length,
        clinicalTrialsAvailable: actionableMutations.filter(m => m.clinicalTrials?.length > 0).length,
        requestId: req.id
      });

    } catch (error) {
      console.error('Actionable mutations analysis error:', error);
      res.status(500).json({
        error: 'Actionable mutations analysis failed',
        details: error.message,
        requestId: req.id
      });
    }
  })
);

/**
 * Health check for precision oncology engine
 */
router.get('/health',
  asyncHandler(async (req, res) => {
    try {
      const status = {
        service: 'Precision Oncology Engine',
        status: 'healthy',
        version: '2.1.0',
        capabilities: [
          'molecular_profiling',
          'resistance_prediction', 
          'combination_optimization',
          'biomarker_tracking',
          'real_world_matching',
          'prognostic_scoring'
        ],
        modelVersions: precisionOncologyEngine.modelVersions,
        cacheStatus: {
          enabled: true,
          entries: precisionOncologyEngine.cache.size,
          timeout: '15 minutes'
        },
        knowledgeBases: {
          pathways: precisionOncologyEngine.pathwayDatabase.size,
          resistanceMutations: precisionOncologyEngine.resistanceMutations.size,
          drugTargets: precisionOncologyEngine.drugTargetInteractions.size
        },
        timestamp: new Date().toISOString()
      };

      res.json(status);
    } catch (error) {
      res.status(503).json({
        service: 'Precision Oncology Engine',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  })
);

/**
 * Clear analysis cache (admin function)
 */
router.post('/admin/clear-cache',
  optionalAuth,
  asyncHandler(async (req, res) => {
    // In production, add proper admin authentication
    try {
      precisionOncologyEngine.clearCache();
      
      res.json({
        success: true,
        message: 'Analysis cache cleared',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to clear cache',
        details: error.message
      });
    }
  })
);

export default router;