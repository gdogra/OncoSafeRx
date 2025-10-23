/**
 * DDI Mining API Routes
 * 
 * REST API endpoints for the DDI mining system
 * Provides interfaces for mining, monitoring, and managing DDI evidence extraction
 */

import express from 'express';
import DDIMiningOrchestrator from '../services/ddiMiningOrchestrator.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate, schemas } from '../utils/validation.js';

const router = express.Router();
const orchestrator = new DDIMiningOrchestrator();

// Initialize orchestrator
let isInitialized = false;
async function ensureInitialized() {
  if (!isInitialized) {
    await orchestrator.initialize();
    isInitialized = true;
  }
}

/**
 * GET /api/ddi-mining/status
 * Get current mining status and progress
 */
router.get('/status', asyncHandler(async (req, res) => {
  await ensureInitialized();
  
  const progress = orchestrator.getProgress();
  const cacheStats = orchestrator.getCacheStats();
  
  res.json({
    status: 'success',
    progress,
    cacheStats,
    timestamp: new Date().toISOString()
  });
}));

/**
 * GET /api/ddi-mining/config
 * Get current mining configuration
 */
router.get('/config', asyncHandler(async (req, res) => {
  await ensureInitialized();
  
  res.json({
    status: 'success',
    config: orchestrator.config
  });
}));

/**
 * PUT /api/ddi-mining/config
 * Update mining configuration
 */
router.put('/config', asyncHandler(async (req, res) => {
  await ensureInitialized();
  
  const { config } = req.body;
  
  if (!config || typeof config !== 'object') {
    return res.status(400).json({
      status: 'error',
      message: 'Valid configuration object required'
    });
  }
  
  try {
    orchestrator.updateConfig(config);
    orchestrator.validateConfig();
    
    res.json({
      status: 'success',
      message: 'Configuration updated successfully',
      config: orchestrator.config
    });
    
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: `Configuration validation failed: ${error.message}`
    });
  }
}));

/**
 * POST /api/ddi-mining/mine-drug
 * Mine DDI evidence for a single drug
 */
router.post('/mine-drug', asyncHandler(async (req, res) => {
  await ensureInitialized();
  
  const { drugName, options = {} } = req.body;
  
  if (!drugName || typeof drugName !== 'string') {
    return res.status(400).json({
      status: 'error',
      message: 'Drug name is required'
    });
  }
  
  try {
    const evidence = await orchestrator.mineDDIForSingleDrug(drugName.trim(), options);
    
    res.json({
      status: 'success',
      drug: drugName,
      evidenceCount: evidence.length,
      evidence: evidence.slice(0, 100), // Limit response size
      message: evidence.length > 100 ? 'Results truncated to first 100 entries' : null
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Mining failed for ${drugName}: ${error.message}`
    });
  }
}));

/**
 * POST /api/ddi-mining/mine-drugs
 * Mine DDI evidence for multiple drugs
 */
router.post('/mine-drugs', asyncHandler(async (req, res) => {
  await ensureInitialized();
  
  const { drugs, options = {} } = req.body;
  
  if (!Array.isArray(drugs) || drugs.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Array of drug names is required'
    });
  }
  
  if (drugs.length > 50) {
    return res.status(400).json({
      status: 'error',
      message: 'Maximum 50 drugs allowed per request'
    });
  }
  
  // Start mining asynchronously
  const miningPromise = orchestrator.mineDDIForMultipleDrugs(drugs, options);
  
  // Return immediate response with status
  res.json({
    status: 'accepted',
    message: 'Mining started for multiple drugs',
    drugs: drugs,
    drugCount: drugs.length,
    estimatedDuration: `${Math.ceil(drugs.length * 0.5)} minutes`,
    checkStatusAt: '/api/ddi-mining/status'
  });
  
  // Handle mining completion in background
  miningPromise.catch(error => {
    console.error('Background mining failed:', error);
  });
}));

/**
 * POST /api/ddi-mining/mine-all-oncology
 * Mine DDI evidence for all oncology drugs
 */
router.post('/mine-all-oncology', asyncHandler(async (req, res) => {
  await ensureInitialized();
  
  const { options = {} } = req.body;
  
  // Start mining asynchronously
  const miningPromise = orchestrator.mineAllOncologyDrugs(options);
  
  const drugCount = orchestrator.oncologyDrugs.size;
  
  res.json({
    status: 'accepted',
    message: 'Mining started for all oncology drugs',
    drugCount: drugCount,
    estimatedDuration: `${Math.ceil(drugCount * 0.5)} minutes`,
    checkStatusAt: '/api/ddi-mining/status'
  });
  
  // Handle mining completion in background
  miningPromise.catch(error => {
    console.error('Background oncology mining failed:', error);
  });
}));

/**
 * POST /api/ddi-mining/mine-indications
 * Mine DDI evidence for specific cancer indications
 */
router.post('/mine-indications', asyncHandler(async (req, res) => {
  await ensureInitialized();
  
  const { indications, options = {} } = req.body;
  
  if (!Array.isArray(indications) || indications.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Array of cancer indications is required'
    });
  }
  
  try {
    // Start mining asynchronously
    const miningPromise = orchestrator.mineDDIForIndications(indications, options);
    
    res.json({
      status: 'accepted',
      message: 'Mining started for cancer indications',
      indications: indications,
      estimatedDuration: '10-30 minutes',
      checkStatusAt: '/api/ddi-mining/status'
    });
    
    // Handle mining completion in background
    miningPromise.catch(error => {
      console.error('Background indication mining failed:', error);
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Mining failed for indications: ${error.message}`
    });
  }
}));

/**
 * GET /api/ddi-mining/results
 * Get mining results
 */
router.get('/results', asyncHandler(async (req, res) => {
  await ensureInitialized();
  
  const { format = 'json', limit = 1000 } = req.query;
  
  try {
    const results = orchestrator.getResults();
    
    if (format.toLowerCase() === 'json') {
      // Limit results for JSON response
      const limitedResults = {
        ...results,
        rawEvidence: results.rawEvidence.slice(0, limit),
        normalizedEvidence: results.normalizedEvidence.slice(0, limit)
      };
      
      res.json({
        status: 'success',
        results: limitedResults,
        truncated: results.normalizedEvidence.length > limit
      });
      
    } else if (['csv', 'tsv'].includes(format.toLowerCase())) {
      const exportData = orchestrator.exportResults(format);
      const mimeType = format === 'csv' ? 'text/csv' : 'text/tab-separated-values';
      const filename = `ddi-evidence-${Date.now()}.${format}`;
      
      res.setHeader('Content-Type', `${mimeType}; charset=utf-8`);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(exportData);
      
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Supported formats: json, csv, tsv'
      });
    }
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Failed to get results: ${error.message}`
    });
  }
}));

/**
 * GET /api/ddi-mining/reports
 * Get mining and normalization reports
 */
router.get('/reports', asyncHandler(async (req, res) => {
  await ensureInitialized();
  
  const results = orchestrator.getResults();
  
  res.json({
    status: 'success',
    reports: {
      extraction: results.extractionReport,
      normalization: results.normalizationReport
    },
    metadata: {
      startTime: results.startTime,
      endTime: results.endTime,
      duration: results.totalDuration
    }
  });
}));

/**
 * POST /api/ddi-mining/stop
 * Stop current mining operation
 */
router.post('/stop', asyncHandler(async (req, res) => {
  await ensureInitialized();
  
  // Note: This is a placeholder - actual implementation would need
  // to track and cancel ongoing operations
  orchestrator.reset();
  
  res.json({
    status: 'success',
    message: 'Mining operations stopped and state reset'
  });
}));

/**
 * POST /api/ddi-mining/clear-cache
 * Clear all mining caches
 */
router.post('/clear-cache', asyncHandler(async (req, res) => {
  await ensureInitialized();
  
  orchestrator.clearCaches();
  
  res.json({
    status: 'success',
    message: 'All caches cleared successfully'
  });
}));

/**
 * GET /api/ddi-mining/oncology-drugs
 * Get list of oncology drugs
 */
router.get('/oncology-drugs', asyncHandler(async (req, res) => {
  await ensureInitialized();
  
  const drugs = Array.from(orchestrator.oncologyDrugs).sort();
  
  res.json({
    status: 'success',
    count: drugs.length,
    drugs: drugs
  });
}));

/**
 * POST /api/ddi-mining/validate-evidence
 * Validate extracted evidence entries
 */
router.post('/validate-evidence', asyncHandler(async (req, res) => {
  await ensureInitialized();
  
  const { evidence } = req.body;
  
  if (!Array.isArray(evidence)) {
    return res.status(400).json({
      status: 'error',
      message: 'Evidence array is required'
    });
  }
  
  try {
    const validation = orchestrator.normalizationService.validateNormalizedEvidence(evidence);
    
    res.json({
      status: 'success',
      validation: {
        total: evidence.length,
        valid: validation.valid.length,
        invalid: validation.invalid.length,
        validationRate: Math.round((validation.valid.length / evidence.length) * 100),
        warnings: validation.warnings
      }
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Validation failed: ${error.message}`
    });
  }
}));

/**
 * POST /api/ddi-mining/test-extractors
 * Test individual extraction modules
 */
router.post('/test-extractors', asyncHandler(async (req, res) => {
  await ensureInitialized();
  
  const { drug = 'doxorubicin', testOptions = {} } = req.body;
  
  try {
    const testResults = {};
    
    // Test clinical trials extractor
    try {
      const ctEvidence = await orchestrator.clinicalTrialsExtractor.extractDDIForDrug(drug, {
        maxStudies: 5,
        ...testOptions
      });
      testResults.clinicalTrials = {
        status: 'success',
        evidenceCount: ctEvidence.length,
        sampleEvidence: ctEvidence.slice(0, 2)
      };
    } catch (error) {
      testResults.clinicalTrials = {
        status: 'error',
        error: error.message
      };
    }
    
    // Test regulatory extractor
    try {
      const regEvidence = await orchestrator.regulatoryExtractor.extractDDIForDrug(drug, {
        maxResults: 5,
        ...testOptions
      });
      testResults.regulatory = {
        status: 'success',
        evidenceCount: regEvidence.length,
        sampleEvidence: regEvidence.slice(0, 2)
      };
    } catch (error) {
      testResults.regulatory = {
        status: 'error',
        error: error.message
      };
    }
    
    // Test publication extractor
    try {
      const pubEvidence = await orchestrator.publicationExtractor.extractDDIForDrug(drug, {
        maxResults: 5,
        yearRange: 2,
        ...testOptions
      });
      testResults.publications = {
        status: 'success',
        evidenceCount: pubEvidence.length,
        sampleEvidence: pubEvidence.slice(0, 2)
      };
    } catch (error) {
      testResults.publications = {
        status: 'error',
        error: error.message
      };
    }
    
    res.json({
      status: 'success',
      testDrug: drug,
      testResults: testResults
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Extractor testing failed: ${error.message}`
    });
  }
}));

/**
 * WebSocket endpoint for real-time progress updates
 * Note: This would require WebSocket setup in the main application
 */
router.get('/progress-stream', (req, res) => {
  res.status(501).json({
    status: 'error',
    message: 'WebSocket progress streaming not implemented. Use /status endpoint for polling.'
  });
});

export default router;