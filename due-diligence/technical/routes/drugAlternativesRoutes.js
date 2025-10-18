import express from 'express';
import drugAlternativesService from '../services/drugAlternativesService.js';

const router = express.Router();

/**
 * Find therapeutic alternatives for a drug combination
 */
router.post('/find-alternatives', async (req, res) => {
  try {
    const { drugs, patientProfile = {} } = req.body;
    
    if (!drugs || !Array.isArray(drugs) || drugs.length === 0) {
      return res.status(400).json({
        error: 'Drugs array is required and must contain at least one drug'
      });
    }

    const alternatives = await drugAlternativesService.findAlternatives(drugs, patientProfile);
    
    res.json({
      success: true,
      data: {
        alternatives,
        originalDrugs: drugs,
        patientProfile,
        totalAlternatives: alternatives.length,
        highSafetyAlternatives: alternatives.filter(alt => alt.safetyScore >= 80).length,
        recommendedAlternatives: alternatives.filter(alt => 
          alt.safetyScore >= 80 && alt.efficacyScore >= 80
        ).length
      },
      meta: {
        searchCriteria: { drugCount: drugs.length },
        analysisDate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Drug alternatives search error:', error);
    res.status(500).json({
      error: 'Failed to find drug alternatives',
      message: error.message
    });
  }
});

/**
 * Find alternatives for a specific drug
 */
router.post('/drug/:drugName/alternatives', async (req, res) => {
  try {
    const { drugName } = req.params;
    const { otherDrugs = [], patientProfile = {} } = req.body;
    
    if (!drugName) {
      return res.status(400).json({
        error: 'Drug name is required'
      });
    }

    const targetDrug = { name: drugName };
    const alternatives = await drugAlternativesService.findDrugAlternatives(
      targetDrug, 
      otherDrugs, 
      patientProfile
    );
    
    res.json({
      success: true,
      data: {
        targetDrug: drugName,
        alternatives,
        otherDrugs,
        totalAlternatives: alternatives.length
      }
    });

  } catch (error) {
    console.error(`Drug alternatives error for ${req.params.drugName}:`, error);
    res.status(500).json({
      error: 'Failed to find alternatives for specified drug',
      message: error.message
    });
  }
});

/**
 * Analyze drug interactions for potential alternatives
 */
router.post('/analyze-interactions', async (req, res) => {
  try {
    const { drug1, drug2, patientProfile = {} } = req.body;
    
    if (!drug1 || !drug2) {
      return res.status(400).json({
        error: 'Both drug1 and drug2 parameters are required'
      });
    }

    // Check interaction between the two drugs
    const interaction = drugAlternativesService.checkInteraction(drug1, drug2);
    
    // Find alternatives for each drug
    const drug1Alternatives = await drugAlternativesService.findDrugAlternatives(
      { name: drug1 }, 
      [{ name: drug2 }], 
      patientProfile
    );
    
    const drug2Alternatives = await drugAlternativesService.findDrugAlternatives(
      { name: drug2 }, 
      [{ name: drug1 }], 
      patientProfile
    );
    
    res.json({
      success: true,
      data: {
        originalInteraction: interaction || { severity: 'none', mechanism: 'No known interaction' },
        drug1: {
          name: drug1,
          alternatives: drug1Alternatives
        },
        drug2: {
          name: drug2,
          alternatives: drug2Alternatives
        },
        recommendation: interaction && interaction.severity === 'major' ? 
          'Consider alternative therapy' : 
          'Current combination may be acceptable with monitoring'
      }
    });

  } catch (error) {
    console.error('Interaction analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze drug interactions',
      message: error.message
    });
  }
});

/**
 * Get therapeutic alternatives by drug class
 */
router.get('/therapeutic-class/:drugName', async (req, res) => {
  try {
    const { drugName } = req.params;
    
    if (!drugName) {
      return res.status(400).json({
        error: 'Drug name is required'
      });
    }

    const normalizedName = drugAlternativesService.normalizeDrugName(drugName);
    const drugClass = drugAlternativesService.drugClasses[normalizedName.toLowerCase()];
    
    if (!drugClass) {
      return res.status(404).json({
        error: 'Drug class not found',
        message: `No therapeutic class identified for ${drugName}`
      });
    }

    const alternatives = drugAlternativesService.therapeuticAlternatives[drugClass] || [];
    
    res.json({
      success: true,
      data: {
        drug: drugName,
        therapeuticClass: drugClass,
        alternatives: alternatives.map(alt => ({
          name: drugAlternativesService.formatDrugName(alt),
          genericName: alt,
          route: drugAlternativesService.getDrugRoute(alt),
          typicalStrength: drugAlternativesService.getTypicalStrength(alt),
          formularyStatus: drugAlternativesService.getFormularyStatus(alt),
          monitoringRequirements: drugAlternativesService.getMonitoringRequirements(alt)
        })),
        totalAlternatives: alternatives.length
      }
    });

  } catch (error) {
    console.error(`Therapeutic class lookup error for ${req.params.drugName}:`, error);
    res.status(500).json({
      error: 'Failed to retrieve therapeutic alternatives',
      message: error.message
    });
  }
});

/**
 * Get drug interaction matrix for specific drug
 */
router.get('/interactions/:drugName', async (req, res) => {
  try {
    const { drugName } = req.params;
    
    if (!drugName) {
      return res.status(400).json({
        error: 'Drug name is required'
      });
    }

    const normalizedName = drugAlternativesService.normalizeDrugName(drugName);
    const interactions = drugAlternativesService.interactionMatrix[normalizedName.toLowerCase()] || {};
    
    res.json({
      success: true,
      data: {
        drug: drugName,
        knownInteractions: Object.keys(interactions).map(interactingDrug => ({
          drug: interactingDrug,
          severity: interactions[interactingDrug].severity,
          mechanism: interactions[interactingDrug].mechanism,
          riskScore: drugAlternativesService.getSeverityScore(interactions[interactingDrug].severity)
        })),
        totalInteractions: Object.keys(interactions).length
      }
    });

  } catch (error) {
    console.error(`Interaction lookup error for ${req.params.drugName}:`, error);
    res.status(500).json({
      error: 'Failed to retrieve drug interactions',
      message: error.message
    });
  }
});

/**
 * Clear alternatives cache (admin function)
 */
router.post('/clear-cache', async (req, res) => {
  try {
    drugAlternativesService.clearCache();
    res.json({
      success: true,
      message: 'Drug alternatives cache cleared'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error.message
    });
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Drug Alternatives API',
    status: 'operational',
    timestamp: new Date().toISOString(),
    capabilities: [
      'therapeutic alternatives',
      'interaction analysis',
      'patient-specific recommendations',
      'formulary status checking',
      'safety scoring'
    ]
  });
});

export default router;