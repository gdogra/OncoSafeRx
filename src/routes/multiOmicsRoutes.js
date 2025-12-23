import express from 'express';
import multiOmicsIntegrationService from '../services/multiOmicsIntegrationService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Multi-Omics Data Integration API Routes
 * Comprehensive molecular profiling across genomics, proteomics, metabolomics
 */

// Submit multi-omics data for integration
router.post('/integrate', authenticateToken, async (req, res) => {
  try {
    const { patientId, omicsData } = req.body;

    if (!patientId || !omicsData) {
      return res.status(400).json({ 
        error: 'Patient ID and omics data are required' 
      });
    }

    const integration = await multiOmicsIntegrationService.integrateOmicsData(
      patientId, 
      omicsData
    );

    res.json({
      success: true,
      data: integration,
      message: 'Multi-omics integration completed successfully'
    });

  } catch (error) {
    console.error('Multi-omics integration error:', error);
    res.status(500).json({ 
      error: 'Failed to integrate omics data',
      details: error.message 
    });
  }
});

// Get integrated omics profile for patient
router.get('/profile/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { includeRawData = false } = req.query;

    const profile = await multiOmicsIntegrationService.getIntegratedProfile(
      patientId,
      { includeRawData: includeRawData === 'true' }
    );

    res.json({
      success: true,
      data: profile,
      retrievedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve omics profile',
      details: error.message 
    });
  }
});

// Get pathway analysis results
router.get('/pathways/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { 
      pathwayDatabase = 'all',
      pValueThreshold = 0.05,
      minGenes = 3 
    } = req.query;

    const pathways = await multiOmicsIntegrationService.getPathwayAnalysis(
      patientId,
      {
        database: pathwayDatabase,
        pValueThreshold: parseFloat(pValueThreshold),
        minGenes: parseInt(minGenes)
      }
    );

    res.json({
      success: true,
      data: pathways,
      parameters: { pathwayDatabase, pValueThreshold, minGenes },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Pathway analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve pathway analysis',
      details: error.message 
    });
  }
});

// Get multi-omics biomarkers
router.get('/biomarkers/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { 
      biomarkerType = 'all',
      evidenceLevel = 'all',
      clinicalUtility = 'all' 
    } = req.query;

    const biomarkers = await multiOmicsIntegrationService.getMultiOmicsBiomarkers(
      patientId,
      {
        type: biomarkerType,
        evidenceLevel,
        clinicalUtility
      }
    );

    res.json({
      success: true,
      data: biomarkers,
      filters: { biomarkerType, evidenceLevel, clinicalUtility },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Biomarker retrieval error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve biomarkers',
      details: error.message 
    });
  }
});

// Get therapeutic implications
router.get('/therapeutics/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { 
      includeNovelTargets = true,
      includeCombinations = true,
      evidenceFilter = 'all' 
    } = req.query;

    const therapeutics = await multiOmicsIntegrationService.getTherapeuticImplications(
      patientId,
      {
        includeNovelTargets: includeNovelTargets === 'true',
        includeCombinations: includeCombinations === 'true',
        evidenceFilter
      }
    );

    res.json({
      success: true,
      data: therapeutics,
      options: { includeNovelTargets, includeCombinations, evidenceFilter },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Therapeutic implications error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve therapeutic implications',
      details: error.message 
    });
  }
});

// Get network analysis results
router.get('/networks/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { 
      networkType = 'all',
      interactionConfidence = 0.4,
      maxNodes = 500 
    } = req.query;

    const networks = await multiOmicsIntegrationService.getNetworkAnalysis(
      patientId,
      {
        type: networkType,
        confidence: parseFloat(interactionConfidence),
        maxNodes: parseInt(maxNodes)
      }
    );

    res.json({
      success: true,
      data: networks,
      parameters: { networkType, interactionConfidence, maxNodes },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Network analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve network analysis',
      details: error.message 
    });
  }
});

// Get disease subtyping results
router.get('/subtyping/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { includeConfidence = true } = req.query;

    const subtyping = await multiOmicsIntegrationService.getDiseaseSubtyping(
      patientId,
      { includeConfidence: includeConfidence === 'true' }
    );

    res.json({
      success: true,
      data: subtyping,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Disease subtyping error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve disease subtyping',
      details: error.message 
    });
  }
});

// Compare omics profiles between patients
router.post('/compare', authenticateToken, async (req, res) => {
  try {
    const { patientIds, comparisonType = 'similarity' } = req.body;

    if (!patientIds || !Array.isArray(patientIds) || patientIds.length < 2) {
      return res.status(400).json({ 
        error: 'At least 2 patient IDs required for comparison' 
      });
    }

    const comparison = await multiOmicsIntegrationService.compareOmicsProfiles(
      patientIds,
      { type: comparisonType }
    );

    res.json({
      success: true,
      data: comparison,
      patientIds,
      comparisonType,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Omics comparison error:', error);
    res.status(500).json({ 
      error: 'Failed to compare omics profiles',
      details: error.message 
    });
  }
});

// Get data quality report
router.get('/quality/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;

    const qualityReport = await multiOmicsIntegrationService.getDataQualityReport(
      patientId
    );

    res.json({
      success: true,
      data: qualityReport,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Quality report error:', error);
    res.status(500).json({ 
      error: 'Failed to generate quality report',
      details: error.message 
    });
  }
});

// Update omics data for patient
router.patch('/update/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { omicsUpdates, reprocessing = true } = req.body;

    if (!omicsUpdates) {
      return res.status(400).json({ 
        error: 'Omics updates are required' 
      });
    }

    const result = await multiOmicsIntegrationService.updateOmicsData(
      patientId,
      omicsUpdates,
      { reprocess: reprocessing === true }
    );

    res.json({
      success: true,
      data: result,
      message: 'Omics data updated successfully'
    });

  } catch (error) {
    console.error('Omics update error:', error);
    res.status(500).json({ 
      error: 'Failed to update omics data',
      details: error.message 
    });
  }
});

// Export integrated omics data
router.get('/export/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { 
      format = 'json',
      includeRawData = false,
      includePaths = true 
    } = req.query;

    const exportData = await multiOmicsIntegrationService.exportIntegratedData(
      patientId,
      {
        format,
        includeRawData: includeRawData === 'true',
        includePathways: includePaths === 'true'
      }
    );

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=omics_${patientId}.csv`);
    } else {
      res.setHeader('Content-Type', 'application/json');
    }

    res.send(exportData);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      error: 'Failed to export omics data',
      details: error.message 
    });
  }
});

export default router;