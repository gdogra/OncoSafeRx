import express from 'express';
import pharmacyIntegrationService from '../services/pharmacyIntegrationService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate, schemas } from '../utils/validation.js';

const router = express.Router();

// Apply authentication to all pharmacy integration routes
router.use(authenticateToken);

/**
 * @route POST /api/pharmacy-integration/pricing
 * @desc Get medication pricing from multiple pharmacy providers
 * @access Private
 */
router.post('/pricing', asyncHandler(async (req, res) => {
  const { rxcui, ndc, zipCode, insuranceInfo } = req.body;

  if (!rxcui && !ndc) {
    return res.status(400).json({
      error: 'Either RXCUI or NDC is required for medication identification'
    });
  }

  if (!zipCode) {
    return res.status(400).json({
      error: 'ZIP code is required for pricing lookup'
    });
  }

  const pricingResult = await pharmacyIntegrationService.getMedicationPricing(
    rxcui,
    ndc,
    zipCode,
    insuranceInfo
  );

  res.json({
    success: true,
    ...pricingResult
  });
}));

/**
 * @route POST /api/pharmacy-integration/availability
 * @desc Check medication availability across pharmacy network
 * @access Private
 */
router.post('/availability', asyncHandler(async (req, res) => {
  const { medications, zipCode, radius = 10 } = req.body;

  if (!medications || !Array.isArray(medications) || medications.length === 0) {
    return res.status(400).json({
      error: 'Medications array is required'
    });
  }

  if (!zipCode) {
    return res.status(400).json({
      error: 'ZIP code is required for availability check'
    });
  }

  const availabilityResult = await pharmacyIntegrationService.checkMedicationAvailability(
    medications,
    zipCode,
    radius
  );

  res.json({
    success: true,
    ...availabilityResult
  });
}));

/**
 * @route POST /api/pharmacy-integration/refill
 * @desc Process prescription refill request
 * @access Private
 */
router.post('/refill', asyncHandler(async (req, res) => {
  const { prescriptionId, pharmacyId, patientInfo } = req.body;

  if (!prescriptionId || !pharmacyId || !patientInfo) {
    return res.status(400).json({
      error: 'Prescription ID, pharmacy ID, and patient info are required'
    });
  }

  // Validate patient info
  const requiredPatientFields = ['id', 'name', 'dateOfBirth', 'phone'];
  for (const field of requiredPatientFields) {
    if (!patientInfo[field]) {
      return res.status(400).json({
        error: `Patient ${field} is required`
      });
    }
  }

  const refillResult = await pharmacyIntegrationService.processRefillRequest(
    prescriptionId,
    pharmacyId,
    patientInfo
  );

  res.json({
    success: true,
    message: 'Refill request processed successfully',
    ...refillResult
  });
}));

/**
 * @route POST /api/pharmacy-integration/benefits/verify
 * @desc Verify insurance benefits and medication coverage
 * @access Private
 */
router.post('/benefits/verify', asyncHandler(async (req, res) => {
  const { insuranceInfo, medications } = req.body;

  if (!insuranceInfo || !medications) {
    return res.status(400).json({
      error: 'Insurance information and medications are required'
    });
  }

  // Validate insurance info
  const requiredInsuranceFields = ['bin', 'pcn', 'memberId'];
  for (const field of requiredInsuranceFields) {
    if (!insuranceInfo[field]) {
      return res.status(400).json({
        error: `Insurance ${field} is required`
      });
    }
  }

  const benefitsResult = await pharmacyIntegrationService.verifyInsuranceBenefits(
    insuranceInfo,
    medications
  );

  res.json({
    success: true,
    message: 'Insurance benefits verified',
    ...benefitsResult
  });
}));

/**
 * @route GET /api/pharmacy-integration/adherence/:patientId
 * @desc Get medication adherence tracking from pharmacy
 * @access Private
 */
router.get('/adherence/:patientId', asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { pharmacyId, timeRange = '90d' } = req.query;

  if (!pharmacyId) {
    return res.status(400).json({
      error: 'Pharmacy ID is required'
    });
  }

  const adherenceResult = await pharmacyIntegrationService.getAdherenceTracking(
    patientId,
    pharmacyId,
    timeRange
  );

  res.json({
    success: true,
    message: 'Adherence data retrieved successfully',
    ...adherenceResult
  });
}));

/**
 * @route POST /api/pharmacy-integration/price-comparison
 * @desc Compare medication prices across multiple pharmacies with value scoring
 * @access Private
 */
router.post('/price-comparison', asyncHandler(async (req, res) => {
  const { medications, patientLocation, zipCode, insuranceInfo } = req.body;

  if (!medications || !Array.isArray(medications)) {
    return res.status(400).json({
      error: 'Medications array is required'
    });
  }

  if (!zipCode) {
    return res.status(400).json({
      error: 'ZIP code is required for price comparison'
    });
  }

  const comparisonPromises = medications.map(async (medication) => {
    const pricingResult = await pharmacyIntegrationService.getMedicationPricing(
      medication.rxcui,
      medication.ndc,
      zipCode,
      insuranceInfo
    );

    // Calculate best value if patient location provided
    let bestValueOptions = pricingResult.pricing;
    if (patientLocation && pricingResult.pricing.length > 0) {
      bestValueOptions = pharmacyIntegrationService.priceComparisonEngine.calculateBestValue(
        pricingResult.pricing,
        patientLocation
      );
    }

    return {
      medication,
      pricing: pricingResult.pricing,
      bestPrice: pricingResult.bestPrice,
      bestValue: bestValueOptions[0] || null,
      totalOptions: pricingResult.pricing.length
    };
  });

  const comparisonResults = await Promise.all(comparisonPromises);

  // Calculate summary statistics
  const summary = {
    totalMedications: medications.length,
    totalSavingsOpportunity: comparisonResults.reduce((sum, result) => {
      return sum + (result.bestPrice?.potentialSavings || 0);
    }, 0),
    averageOptionsPerMedication: comparisonResults.reduce((sum, result) => {
      return sum + result.totalOptions;
    }, 0) / medications.length
  };

  res.json({
    success: true,
    comparisonResults,
    summary,
    generatedAt: new Date().toISOString()
  });
}));

/**
 * @route GET /api/pharmacy-integration/providers
 * @desc Get list of supported pharmacy providers
 * @access Private
 */
router.get('/providers', asyncHandler(async (req, res) => {
  const providers = Object.entries(pharmacyIntegrationService.pharmacyProviders).map(
    ([id, config]) => ({
      id,
      name: config.name,
      services: {
        pricing: !!config.endpoints.pricing,
        availability: !!config.endpoints.availability,
        refills: !!config.endpoints.refill,
        benefits: !!config.endpoints.benefits
      },
      available: !!config.apiKey
    })
  );

  res.json({
    success: true,
    supportedProviders: providers,
    totalProviders: providers.length,
    activeProviders: providers.filter(p => p.available).length
  });
}));

/**
 * @route POST /api/pharmacy-integration/formulary-check
 * @desc Check if medications are on insurance formulary
 * @access Private
 */
router.post('/formulary-check', asyncHandler(async (req, res) => {
  const { medications, insuranceInfo } = req.body;

  if (!medications || !insuranceInfo) {
    return res.status(400).json({
      error: 'Medications and insurance information required'
    });
  }

  const formularyPromises = medications.map(async (medication) => {
    try {
      const coverage = await pharmacyIntegrationService.checkMedicationCoverage(
        insuranceInfo,
        medication
      );
      return {
        medication,
        onFormulary: coverage.covered,
        tier: coverage.formularyTier,
        copay: coverage.copay,
        restrictions: {
          priorAuth: coverage.priorAuthRequired,
          stepTherapy: coverage.stepTherapyRequired,
          quantityLimits: coverage.quantityLimits
        },
        alternatives: coverage.alternatives
      };
    } catch (error) {
      return {
        medication,
        onFormulary: false,
        error: error.message
      };
    }
  });

  const formularyResults = await Promise.all(formularyPromises);

  const summary = {
    totalMedications: medications.length,
    coveredMedications: formularyResults.filter(r => r.onFormulary).length,
    restrictedMedications: formularyResults.filter(r => 
      r.restrictions?.priorAuth || r.restrictions?.stepTherapy
    ).length,
    totalEstimatedCopay: formularyResults
      .filter(r => r.copay)
      .reduce((sum, r) => sum + r.copay, 0)
  };

  res.json({
    success: true,
    formularyResults,
    summary,
    checkedAt: new Date().toISOString()
  });
}));

/**
 * @route POST /api/pharmacy-integration/patient-assistance
 * @desc Find patient assistance programs for medications
 * @access Private
 */
router.post('/patient-assistance', asyncHandler(async (req, res) => {
  const { medications, patientInfo } = req.body;

  if (!medications || !patientInfo) {
    return res.status(400).json({
      error: 'Medications and patient information required'
    });
  }

  // Simulate patient assistance program lookup
  const assistancePrograms = medications.map(medication => {
    const programs = [];

    // Manufacturer assistance programs
    if (medication.brandName) {
      programs.push({
        type: 'manufacturer',
        name: `${medication.brandName} Patient Assistance Program`,
        provider: medication.manufacturer || 'Pharmaceutical Company',
        eligibilityRequirements: [
          'Household income below 400% of Federal Poverty Level',
          'No insurance coverage for this medication',
          'U.S. resident'
        ],
        benefits: {
          discount: '75-100%',
          maxSavings: '$1000/month',
          duration: '12 months'
        },
        applicationUrl: `https://www.${medication.brandName?.toLowerCase()}.com/patient-assistance`,
        phoneNumber: '1-800-XXX-XXXX'
      });
    }

    // Pharmacy discount programs
    programs.push({
      type: 'pharmacy_discount',
      name: 'GoodRx Discount Program',
      provider: 'GoodRx',
      eligibilityRequirements: ['No insurance required'],
      benefits: {
        discount: '10-80%',
        estimatedPrice: '$25-$150',
        duration: 'Ongoing'
      },
      applicationUrl: 'https://www.goodrx.com',
      phoneNumber: '1-855-268-2822'
    });

    // Foundation assistance programs
    if (medication.therapeuticClass?.includes('oncology')) {
      programs.push({
        type: 'foundation',
        name: 'Cancer Treatment Assistance Foundation',
        provider: 'Patient Advocate Foundation',
        eligibilityRequirements: [
          'Cancer diagnosis',
          'Financial hardship',
          'Insurance coverage gaps'
        ],
        benefits: {
          discount: 'Varies',
          maxSavings: 'Up to $10,000/year',
          duration: '12 months'
        },
        applicationUrl: 'https://www.patientadvocate.org',
        phoneNumber: '1-866-512-3861'
      });
    }

    return {
      medication,
      programs,
      totalPrograms: programs.length,
      estimatedSavings: programs.reduce((max, p) => {
        const savings = parseInt(p.benefits.maxSavings?.replace(/[^0-9]/g, '') || '0');
        return Math.max(max, savings);
      }, 0)
    };
  });

  res.json({
    success: true,
    assistancePrograms,
    summary: {
      totalMedications: medications.length,
      totalPrograms: assistancePrograms.reduce((sum, ap) => sum + ap.totalPrograms, 0),
      maxPotentialSavings: assistancePrograms.reduce((sum, ap) => sum + ap.estimatedSavings, 0)
    },
    disclaimer: 'Eligibility and benefits vary by program. Contact programs directly for current information.'
  });
}));

/**
 * @route GET /api/pharmacy-integration/health
 * @desc Health check for pharmacy integration service
 * @access Private
 */
router.get('/health', asyncHandler(async (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      pharmacyIntegration: 'active',
      priceComparison: 'active',
      ncpdpProcessor: 'active'
    },
    providers: Object.keys(pharmacyIntegrationService.pharmacyProviders).length,
    activeConnections: Object.values(pharmacyIntegrationService.pharmacyProviders)
      .filter(p => p.apiKey).length
  };

  res.json({
    success: true,
    ...healthStatus
  });
}));

export default router;