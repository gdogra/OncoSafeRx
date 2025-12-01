import express from 'express';
import liquidBiopsyService from '../services/liquidBiopsyIntegrationService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { optionalAuth } from '../middleware/auth.js';
import { searchLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * Process comprehensive ctDNA analysis
 */
router.post('/process',
  searchLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { ctDNAData } = req.body;
    
    if (!ctDNAData) {
      return res.status(400).json({
        error: 'ctDNA data is required',
        code: 'MISSING_CTDNA_DATA'
      });
    }

    try {
      const analysis = await liquidBiopsyService.processCirculatingTumorDNA(ctDNAData);
      
      res.json({
        success: true,
        analysis,
        sampleId: ctDNAData.sampleId,
        analysisTimestamp: analysis.metadata.analysisTimestamp,
        confidence: analysis.metadata.confidence,
        requestId: req.id
      });

    } catch (error) {
      console.error('ctDNA analysis error:', error);
      res.status(500).json({
        error: 'ctDNA analysis failed',
        details: error.message,
        code: 'ANALYSIS_ERROR',
        requestId: req.id
      });
    }
  })
);

/**
 * Detect minimal residual disease (MRD)
 */
router.post('/mrd-detection',
  searchLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { ctDNAData } = req.body;
    
    if (!ctDNAData || !ctDNAData.mutations) {
      return res.status(400).json({
        error: 'ctDNA data with mutations is required',
        code: 'MISSING_MUTATION_DATA'
      });
    }

    try {
      const mrdAnalysis = await liquidBiopsyService.detectMRD(ctDNAData);
      
      res.json({
        success: true,
        mrdAnalysis,
        status: mrdAnalysis.status,
        sensitivity: mrdAnalysis.sensitivity,
        clinicalSignificance: mrdAnalysis.clinicalSignificance,
        requestId: req.id
      });

    } catch (error) {
      console.error('MRD detection error:', error);
      res.status(500).json({
        error: 'MRD detection failed',
        details: error.message,
        requestId: req.id
      });
    }
  })
);

/**
 * Identify emerging mutations
 */
router.post('/emerging-mutations',
  searchLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { ctDNAData } = req.body;
    
    if (!ctDNAData || !ctDNAData.patientBaseline) {
      return res.status(400).json({
        error: 'ctDNA data with patient baseline is required',
        code: 'MISSING_BASELINE_DATA'
      });
    }

    try {
      const newMutations = await liquidBiopsyService.identifyNewMutations(ctDNAData);
      
      res.json({
        success: true,
        newMutations,
        emergingCount: newMutations.emergingMutations.length,
        resistanceCount: newMutations.resistanceMutations.length,
        actionableCount: newMutations.actionableFindings.length,
        requestId: req.id
      });

    } catch (error) {
      console.error('Emerging mutations analysis error:', error);
      res.status(500).json({
        error: 'Emerging mutations analysis failed',
        details: error.message,
        requestId: req.id
      });
    }
  })
);

/**
 * Assess treatment response via ctDNA
 */
router.post('/treatment-response',
  searchLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { ctDNAData } = req.body;
    
    if (!ctDNAData || !ctDNAData.treatmentHistory) {
      return res.status(400).json({
        error: 'ctDNA data with treatment history is required',
        code: 'MISSING_TREATMENT_HISTORY'
      });
    }

    try {
      const responseAssessment = await liquidBiopsyService.assessResponse(ctDNAData);
      
      res.json({
        success: true,
        responseAssessment,
        overallResponse: responseAssessment.overallResponse,
        ctDNATrend: responseAssessment.ctDNATrends?.trend,
        responseMetrics: responseAssessment.responseMetrics,
        requestId: req.id
      });

    } catch (error) {
      console.error('Treatment response assessment error:', error);
      res.status(500).json({
        error: 'Treatment response assessment failed',
        details: error.message,
        requestId: req.id
      });
    }
  })
);

/**
 * Detect resistance markers
 */
router.post('/resistance-detection',
  searchLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { ctDNAData } = req.body;
    
    if (!ctDNAData || !ctDNAData.treatmentHistory) {
      return res.status(400).json({
        error: 'ctDNA data with treatment history is required',
        code: 'MISSING_TREATMENT_DATA'
      });
    }

    try {
      const resistanceAnalysis = await liquidBiopsyService.detectResistance(ctDNAData);
      
      res.json({
        success: true,
        resistanceAnalysis,
        resistanceScore: resistanceAnalysis.resistanceScore,
        emergingResistanceCount: resistanceAnalysis.emergingResistance.length,
        detectedMechanisms: resistanceAnalysis.detectedMechanisms.length,
        requestId: req.id
      });

    } catch (error) {
      console.error('Resistance detection error:', error);
      res.status(500).json({
        error: 'Resistance detection failed',
        details: error.message,
        requestId: req.id
      });
    }
  })
);

/**
 * Generate actionable clinical alerts
 */
router.post('/alerts',
  searchLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { ctDNAData } = req.body;
    
    if (!ctDNAData) {
      return res.status(400).json({
        error: 'ctDNA data is required',
        code: 'MISSING_CTDNA_DATA'
      });
    }

    try {
      const alerts = await liquidBiopsyService.generateAlerts(ctDNAData);
      
      res.json({
        success: true,
        alerts,
        urgentAlerts: alerts.urgent.length,
        importantAlerts: alerts.important.length,
        summary: {
          totalAlerts: alerts.urgent.length + alerts.important.length + 
                     alerts.informational.length + alerts.trending.length,
          highPriorityAlerts: alerts.urgent.length + alerts.important.length
        },
        requestId: req.id
      });

    } catch (error) {
      console.error('Alert generation error:', error);
      res.status(500).json({
        error: 'Alert generation failed',
        details: error.message,
        requestId: req.id
      });
    }
  })
);

/**
 * Get sample quality metrics
 */
router.post('/quality-assessment',
  searchLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { sampleData } = req.body;
    
    if (!sampleData) {
      return res.status(400).json({
        error: 'Sample data is required',
        code: 'MISSING_SAMPLE_DATA'
      });
    }

    try {
      const qualityMetrics = liquidBiopsyService.calculateQualityMetrics(sampleData);
      
      res.json({
        success: true,
        qualityMetrics,
        overallQuality: qualityMetrics.overallQuality,
        passesThreshold: qualityMetrics.overallQuality >= 0.8,
        recommendations: qualityMetrics.overallQuality < 0.8 ? 
          ['Consider sample recollection', 'Review processing protocols'] : 
          ['Sample quality acceptable', 'Proceed with analysis'],
        requestId: req.id
      });

    } catch (error) {
      console.error('Quality assessment error:', error);
      res.status(500).json({
        error: 'Quality assessment failed',
        details: error.message,
        requestId: req.id
      });
    }
  })
);

/**
 * Get assay sensitivity information
 */
router.get('/assay-sensitivity/:assayType',
  asyncHandler(async (req, res) => {
    const { assayType } = req.params;
    
    try {
      const sensitivity = liquidBiopsyService.getSensitivityForAssay(assayType);
      
      if (!sensitivity) {
        return res.status(404).json({
          error: 'Unknown assay type',
          code: 'UNKNOWN_ASSAY_TYPE',
          supportedAssays: Object.keys(liquidBiopsyService.sensitivityThresholds)
        });
      }

      res.json({
        success: true,
        assayType,
        sensitivity,
        limitOfDetection: sensitivity.limit_of_detection,
        quantitativeRange: sensitivity.quantitative_range,
        requestId: req.id
      });

    } catch (error) {
      console.error('Assay sensitivity retrieval error:', error);
      res.status(500).json({
        error: 'Failed to retrieve assay sensitivity',
        details: error.message,
        requestId: req.id
      });
    }
  })
);

/**
 * Health check for liquid biopsy service
 */
router.get('/health',
  asyncHandler(async (req, res) => {
    try {
      const status = {
        service: 'Liquid Biopsy Integration Service',
        status: 'healthy',
        version: '1.0.0',
        capabilities: [
          'ctdna_analysis',
          'mrd_detection',
          'emerging_mutation_identification',
          'treatment_response_assessment',
          'resistance_detection',
          'clinical_alert_generation',
          'quality_assessment'
        ],
        analysisModels: liquidBiopsyService.analysisModels,
        supportedAssays: Object.keys(liquidBiopsyService.sensitivityThresholds),
        cacheStatus: {
          enabled: true,
          entries: liquidBiopsyService.cache.size,
          timeout: '10 minutes'
        },
        biomarkerDatabase: {
          resistanceMarkers: liquidBiopsyService.resistanceMarkers.size,
          genes: Array.from(liquidBiopsyService.resistanceMarkers.keys())
        },
        timestamp: new Date().toISOString()
      };

      res.json(status);
    } catch (error) {
      res.status(503).json({
        service: 'Liquid Biopsy Integration Service',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  })
);

/**
 * Get supported biomarkers
 */
router.get('/biomarkers',
  asyncHandler(async (req, res) => {
    try {
      const biomarkers = {
        resistanceMarkers: {},
        trackableMutations: [],
        supportedGenes: Array.from(liquidBiopsyService.resistanceMarkers.keys()),
        assayCompatibility: {}
      };

      // Convert Map to Object for API response
      for (const [gene, mutations] of liquidBiopsyService.resistanceMarkers.entries()) {
        biomarkers.resistanceMarkers[gene] = mutations;
      }

      // Add commonly trackable mutations
      biomarkers.trackableMutations = [
        { gene: 'EGFR', variants: ['L858R', 'exon19del', 'T790M', 'C797S'] },
        { gene: 'KRAS', variants: ['G12C', 'G12D', 'G12V'] },
        { gene: 'ALK', variants: ['fusion', 'G1269A', 'L1196M'] },
        { gene: 'BRAF', variants: ['V600E', 'V600K'] },
        { gene: 'PIK3CA', variants: ['E542K', 'E545K', 'H1047R'] }
      ];

      res.json({
        success: true,
        biomarkers,
        totalGenes: biomarkers.supportedGenes.length,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Biomarkers retrieval error:', error);
      res.status(500).json({
        error: 'Failed to retrieve biomarker information',
        details: error.message
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
      liquidBiopsyService.clearCache();
      
      res.json({
        success: true,
        message: 'Liquid biopsy analysis cache cleared',
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