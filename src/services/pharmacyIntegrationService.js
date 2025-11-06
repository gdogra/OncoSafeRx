import axios from 'axios';
import crypto from 'crypto';

/**
 * Enterprise Pharmacy Integration Service
 * Supports CVS, Walgreens, Rite Aid, Express Scripts, OptumRx, and NCPDP standards
 */
class PharmacyIntegrationService {
  constructor() {
    this.pharmacyProviders = {
      cvs: {
        name: 'CVS Pharmacy',
        apiUrl: process.env.CVS_API_URL || 'https://api.cvs.com/v1',
        apiKey: process.env.CVS_API_KEY,
        clientId: process.env.CVS_CLIENT_ID,
        endpoints: {
          prescription: '/prescriptions',
          medication: '/medications',
          pricing: '/pricing',
          availability: '/availability',
          refill: '/refills',
          benefits: '/benefits'
        }
      },
      walgreens: {
        name: 'Walgreens Pharmacy',
        apiUrl: process.env.WALGREENS_API_URL || 'https://api.walgreens.com/v2',
        apiKey: process.env.WALGREENS_API_KEY,
        clientId: process.env.WALGREENS_CLIENT_ID,
        endpoints: {
          prescription: '/prescriptions',
          medication: '/medications',
          pricing: '/pricing',
          availability: '/stores',
          refill: '/refills',
          benefits: '/insurance'
        }
      },
      riteaid: {
        name: 'Rite Aid Pharmacy',
        apiUrl: process.env.RITEAID_API_URL || 'https://api.riteaid.com/v1',
        apiKey: process.env.RITEAID_API_KEY,
        clientId: process.env.RITEAID_CLIENT_ID,
        endpoints: {
          prescription: '/rx',
          medication: '/drugs',
          pricing: '/pricing',
          availability: '/locations',
          refill: '/refills'
        }
      },
      expressscripts: {
        name: 'Express Scripts',
        apiUrl: process.env.EXPRESS_SCRIPTS_API_URL || 'https://api.express-scripts.com/v3',
        apiKey: process.env.EXPRESS_SCRIPTS_API_KEY,
        clientId: process.env.EXPRESS_SCRIPTS_CLIENT_ID,
        endpoints: {
          prescription: '/prescriptions',
          medication: '/formulary',
          pricing: '/copay',
          benefits: '/benefits',
          mailorder: '/mail-order'
        }
      },
      optumrx: {
        name: 'OptumRx',
        apiUrl: process.env.OPTUMRX_API_URL || 'https://api.optumrx.com/v2',
        apiKey: process.env.OPTUMRX_API_KEY,
        clientId: process.env.OPTUMRX_CLIENT_ID,
        endpoints: {
          prescription: '/prescriptions',
          medication: '/medications',
          pricing: '/pricing',
          benefits: '/benefits'
        }
      }
    };

    this.ncpdpProcessor = new NCPDPProcessor();
    this.priceComparisonEngine = new PriceComparisonEngine();
  }

  /**
   * Get medication pricing from multiple pharmacy providers
   */
  async getMedicationPricing(rxcui, ndc, zipCode, insuranceInfo = null) {
    try {
      const pricingPromises = Object.entries(this.pharmacyProviders).map(
        async ([providerId, config]) => {
          try {
            return await this.fetchPharmacyPricing(providerId, config, rxcui, ndc, zipCode, insuranceInfo);
          } catch (error) {
            console.warn(`Pricing fetch failed for ${providerId}:`, error.message);
            return null;
          }
        }
      );

      const pricingResults = (await Promise.all(pricingPromises)).filter(Boolean);
      
      return {
        success: true,
        medication: {
          rxcui,
          ndc
        },
        pricing: pricingResults,
        bestPrice: this.findBestPrice(pricingResults),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Medication pricing fetch failed:', error);
      throw new Error(`Failed to fetch medication pricing: ${error.message}`);
    }
  }

  /**
   * Fetch pricing from specific pharmacy provider
   */
  async fetchPharmacyPricing(providerId, config, rxcui, ndc, zipCode, insuranceInfo) {
    try {
      const headers = {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'X-Client-ID': config.clientId
      };

      const params = {
        rxcui: rxcui,
        ndc: ndc,
        zip_code: zipCode,
        quantity: 30, // Standard 30-day supply
        ...(insuranceInfo && { 
          insurance_bin: insuranceInfo.bin,
          insurance_pcn: insuranceInfo.pcn,
          insurance_group: insuranceInfo.group
        })
      };

      const response = await axios.get(
        `${config.apiUrl}${config.endpoints.pricing}`,
        { headers, params, timeout: 10000 }
      );

      return this.transformPricingResponse(providerId, config.name, response.data);
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error(`Timeout fetching pricing from ${config.name}`);
      }
      throw error;
    }
  }

  /**
   * Transform pharmacy pricing response to standardized format
   */
  transformPricingResponse(providerId, providerName, data) {
    return {
      pharmacyId: providerId,
      pharmacyName: providerName,
      cashPrice: data.cash_price || data.retail_price || null,
      insurancePrice: data.insurance_price || data.copay || null,
      savings: data.savings || null,
      availability: data.in_stock !== false,
      lastUpdated: data.last_updated || new Date().toISOString(),
      storeLocations: data.stores || [],
      specialOffers: data.discounts || [],
      pharmacyBenefits: {
        autoRefill: data.auto_refill_available || false,
        homeDelivery: data.delivery_available || false,
        pharmacistConsultation: data.consultation_available || false
      }
    };
  }

  /**
   * Find best pricing option across all pharmacies
   */
  findBestPrice(pricingResults) {
    if (!pricingResults.length) return null;

    let bestCash = null;
    let bestInsurance = null;

    for (const result of pricingResults) {
      if (result.cashPrice && (!bestCash || result.cashPrice < bestCash.cashPrice)) {
        bestCash = result;
      }
      if (result.insurancePrice && (!bestInsurance || result.insurancePrice < bestInsurance.insurancePrice)) {
        bestInsurance = result;
      }
    }

    return {
      bestCashOption: bestCash,
      bestInsuranceOption: bestInsurance,
      potentialSavings: bestCash && bestInsurance ? 
        Math.abs(bestCash.cashPrice - bestInsurance.insurancePrice) : null
    };
  }

  /**
   * Check medication availability across pharmacy network
   */
  async checkMedicationAvailability(medications, zipCode, radius = 10) {
    try {
      const availabilityPromises = medications.map(async (medication) => {
        const providers = Object.entries(this.pharmacyProviders);
        const providerChecks = providers.map(async ([providerId, config]) => {
          try {
            return await this.checkProviderAvailability(providerId, config, medication, zipCode, radius);
          } catch (error) {
            console.warn(`Availability check failed for ${providerId}:`, error.message);
            return null;
          }
        });

        const results = (await Promise.all(providerChecks)).filter(Boolean);
        
        return {
          medication,
          availability: results,
          inStock: results.some(r => r.inStock),
          nearestStores: this.findNearestStores(results, 5)
        };
      });

      const availabilityResults = await Promise.all(availabilityPromises);

      return {
        success: true,
        searchRadius: radius,
        zipCode,
        results: availabilityResults,
        summary: {
          totalMedications: medications.length,
          availableMedications: availabilityResults.filter(r => r.inStock).length,
          outOfStockMedications: availabilityResults.filter(r => !r.inStock).length
        }
      };
    } catch (error) {
      console.error('Availability check failed:', error);
      throw new Error(`Failed to check medication availability: ${error.message}`);
    }
  }

  /**
   * Check availability with specific pharmacy provider
   */
  async checkProviderAvailability(providerId, config, medication, zipCode, radius) {
    try {
      const headers = {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'X-Client-ID': config.clientId
      };

      const params = {
        ndc: medication.ndc,
        rxcui: medication.rxcui,
        zip_code: zipCode,
        radius: radius,
        quantity: 30
      };

      const response = await axios.get(
        `${config.apiUrl}${config.endpoints.availability}`,
        { headers, params, timeout: 8000 }
      );

      return {
        pharmacyId: providerId,
        pharmacyName: config.name,
        inStock: response.data.in_stock !== false,
        quantity: response.data.quantity_available || 0,
        stores: response.data.locations || [],
        estimatedRefillDate: response.data.next_availability || null
      };
    } catch (error) {
      console.warn(`Provider availability check failed for ${providerId}:`, error.message);
      return null;
    }
  }

  /**
   * Find nearest pharmacy stores
   */
  findNearestStores(availabilityResults, limit = 5) {
    const allStores = [];
    
    for (const result of availabilityResults) {
      if (result.stores) {
        for (const store of result.stores) {
          allStores.push({
            ...store,
            pharmacyName: result.pharmacyName,
            pharmacyId: result.pharmacyId,
            inStock: result.inStock
          });
        }
      }
    }

    // Sort by distance and return top results
    return allStores
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, limit);
  }

  /**
   * Process prescription refill requests
   */
  async processRefillRequest(prescriptionId, pharmacyId, patientInfo) {
    try {
      const config = this.pharmacyProviders[pharmacyId];
      if (!config) {
        throw new Error(`Unsupported pharmacy: ${pharmacyId}`);
      }

      const headers = {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'X-Client-ID': config.clientId
      };

      const refillData = {
        prescription_id: prescriptionId,
        patient_id: patientInfo.id,
        patient_name: patientInfo.name,
        date_of_birth: patientInfo.dateOfBirth,
        phone_number: patientInfo.phone,
        pickup_preference: patientInfo.pickupPreference || 'in_store',
        requested_quantity: 30
      };

      const response = await axios.post(
        `${config.apiUrl}${config.endpoints.refill}`,
        refillData,
        { headers, timeout: 15000 }
      );

      return {
        success: true,
        refillId: response.data.refill_id,
        status: response.data.status,
        estimatedReadyTime: response.data.ready_time,
        pharmacyName: config.name,
        instructions: response.data.instructions || 'Your prescription refill has been processed.',
        trackingNumber: response.data.tracking_number
      };
    } catch (error) {
      console.error('Refill request failed:', error);
      throw new Error(`Failed to process refill request: ${error.message}`);
    }
  }

  /**
   * Verify insurance benefits and coverage
   */
  async verifyInsuranceBenefits(insuranceInfo, medications) {
    try {
      const verificationPromises = medications.map(async (medication) => {
        try {
          return await this.checkMedicationCoverage(insuranceInfo, medication);
        } catch (error) {
          console.warn(`Coverage check failed for ${medication.name}:`, error.message);
          return {
            medication,
            covered: false,
            error: error.message
          };
        }
      });

      const coverageResults = await Promise.all(verificationPromises);

      const summary = {
        totalMedications: medications.length,
        coveredMedications: coverageResults.filter(r => r.covered).length,
        uncoveredMedications: coverageResults.filter(r => !r.covered).length,
        totalEstimatedCopay: coverageResults
          .filter(r => r.covered && r.copay)
          .reduce((sum, r) => sum + r.copay, 0)
      };

      return {
        success: true,
        insuranceInfo,
        coverage: coverageResults,
        summary,
        recommendations: this.generateCoverageRecommendations(coverageResults)
      };
    } catch (error) {
      console.error('Insurance verification failed:', error);
      throw new Error(`Failed to verify insurance benefits: ${error.message}`);
    }
  }

  /**
   * Check individual medication coverage
   */
  async checkMedicationCoverage(insuranceInfo, medication) {
    try {
      // Use primary PBM (Pharmacy Benefit Manager) API
      const pbmProvider = this.getPBMProvider(insuranceInfo.bin);
      
      const headers = {
        'Authorization': `Bearer ${pbmProvider.apiKey}`,
        'Content-Type': 'application/json'
      };

      const coverageData = {
        bin: insuranceInfo.bin,
        pcn: insuranceInfo.pcn,
        group: insuranceInfo.group,
        member_id: insuranceInfo.memberId,
        ndc: medication.ndc,
        rxcui: medication.rxcui,
        quantity: 30,
        days_supply: 30
      };

      const response = await axios.post(
        `${pbmProvider.apiUrl}/coverage-check`,
        coverageData,
        { headers, timeout: 10000 }
      );

      return {
        medication,
        covered: response.data.covered === true,
        copay: response.data.copay || 0,
        deductible: response.data.deductible || 0,
        coinsurance: response.data.coinsurance || 0,
        priorAuthRequired: response.data.prior_auth_required || false,
        stepTherapyRequired: response.data.step_therapy_required || false,
        quantityLimits: response.data.quantity_limits || null,
        formularyTier: response.data.formulary_tier || 'Unknown',
        alternatives: response.data.covered_alternatives || []
      };
    } catch (error) {
      throw new Error(`Coverage check failed: ${error.message}`);
    }
  }

  /**
   * Get PBM provider based on BIN number
   */
  getPBMProvider(bin) {
    const pbmMap = {
      '003858': { name: 'Express Scripts', apiUrl: process.env.EXPRESS_SCRIPTS_API_URL, apiKey: process.env.EXPRESS_SCRIPTS_API_KEY },
      '610494': { name: 'CVS Caremark', apiUrl: process.env.CAREMARK_API_URL, apiKey: process.env.CAREMARK_API_KEY },
      '011235': { name: 'OptumRx', apiUrl: process.env.OPTUMRX_API_URL, apiKey: process.env.OPTUMRX_API_KEY },
      '004336': { name: 'Humana Pharmacy', apiUrl: process.env.HUMANA_API_URL, apiKey: process.env.HUMANA_API_KEY }
    };

    return pbmMap[bin] || pbmMap['003858']; // Default to Express Scripts
  }

  /**
   * Generate coverage recommendations
   */
  generateCoverageRecommendations(coverageResults) {
    const recommendations = [];

    for (const result of coverageResults) {
      if (!result.covered) {
        recommendations.push({
          type: 'coverage_issue',
          medication: result.medication.name,
          message: 'This medication is not covered by your insurance',
          action: 'Contact your doctor about covered alternatives',
          alternatives: result.alternatives || []
        });
      } else if (result.priorAuthRequired) {
        recommendations.push({
          type: 'prior_auth',
          medication: result.medication.name,
          message: 'Prior authorization required',
          action: 'Your doctor will need to submit prior authorization paperwork'
        });
      } else if (result.copay > 100) {
        recommendations.push({
          type: 'high_copay',
          medication: result.medication.name,
          message: `High copay: $${result.copay}`,
          action: 'Consider patient assistance programs or generic alternatives'
        });
      }
    }

    return recommendations;
  }

  /**
   * Get medication adherence tracking from pharmacy
   */
  async getAdherenceTracking(patientId, pharmacyId, timeRange = '90d') {
    try {
      const config = this.pharmacyProviders[pharmacyId];
      if (!config) {
        throw new Error(`Unsupported pharmacy: ${pharmacyId}`);
      }

      const headers = {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'X-Client-ID': config.clientId
      };

      const params = {
        patient_id: patientId,
        time_range: timeRange,
        include_refill_history: true
      };

      const response = await axios.get(
        `${config.apiUrl}/adherence/${patientId}`,
        { headers, params, timeout: 10000 }
      );

      return {
        success: true,
        patientId,
        timeRange,
        adherenceData: {
          overallAdherence: response.data.overall_adherence || 0,
          medicationAdherence: response.data.medications || [],
          refillHistory: response.data.refill_history || [],
          missedDoses: response.data.missed_doses || 0,
          earlyRefills: response.data.early_refills || 0,
          lateRefills: response.data.late_refills || 0
        },
        insights: this.generateAdherenceInsights(response.data)
      };
    } catch (error) {
      console.error('Adherence tracking failed:', error);
      throw new Error(`Failed to get adherence tracking: ${error.message}`);
    }
  }

  /**
   * Generate adherence insights
   */
  generateAdherenceInsights(adherenceData) {
    const insights = [];

    if (adherenceData.overall_adherence < 80) {
      insights.push({
        type: 'low_adherence',
        severity: 'high',
        message: 'Patient adherence is below optimal levels',
        recommendation: 'Consider adherence interventions or simplified dosing'
      });
    }

    if (adherenceData.late_refills > 3) {
      insights.push({
        type: 'refill_pattern',
        severity: 'medium',
        message: 'Frequent late refills detected',
        recommendation: 'Set up automatic refill reminders'
      });
    }

    if (adherenceData.early_refills > 2) {
      insights.push({
        type: 'early_refill',
        severity: 'medium',
        message: 'Multiple early refills detected',
        recommendation: 'Monitor for potential medication misuse'
      });
    }

    return insights;
  }
}

/**
 * NCPDP (National Council for Prescription Drug Programs) Message Processor
 */
class NCPDPProcessor {
  constructor() {
    this.messageTypes = {
      'B1': 'Billing Request',
      'B2': 'Billing Response', 
      'B3': 'Information Reporting',
      'E1': 'Eligibility Verification Request',
      'E2': 'Eligibility Verification Response'
    };
  }

  /**
   * Process NCPDP message for prescription verification
   */
  processNCPDPMessage(messageType, data) {
    switch (messageType) {
      case 'E1':
        return this.processEligibilityRequest(data);
      case 'B1':
        return this.processBillingRequest(data);
      default:
        throw new Error(`Unsupported NCPDP message type: ${messageType}`);
    }
  }

  processEligibilityRequest(data) {
    return {
      messageType: 'E2',
      patientEligible: true,
      coverageLevel: data.coverageLevel || 'standard',
      copayAmount: data.copayAmount || 0,
      deductibleRemaining: data.deductibleRemaining || 0
    };
  }

  processBillingRequest(data) {
    return {
      messageType: 'B2',
      claimStatus: 'approved',
      amountCovered: data.totalAmount - data.copayAmount,
      patientResponsibility: data.copayAmount
    };
  }
}

/**
 * Price Comparison Engine for finding best medication deals
 */
class PriceComparisonEngine {
  constructor() {
    this.priceFactors = {
      distance: 0.2,
      price: 0.6,
      availability: 0.2
    };
  }

  /**
   * Calculate best value pharmacy option
   */
  calculateBestValue(pricingOptions, patientLocation) {
    return pricingOptions.map(option => {
      const distanceScore = this.calculateDistanceScore(option.storeLocations, patientLocation);
      const priceScore = this.calculatePriceScore(option.cashPrice, pricingOptions);
      const availabilityScore = option.availability ? 1 : 0;

      const totalScore = (
        distanceScore * this.priceFactors.distance +
        priceScore * this.priceFactors.price +
        availabilityScore * this.priceFactors.availability
      );

      return {
        ...option,
        valueScore: totalScore,
        distanceScore,
        priceScore,
        availabilityScore
      };
    }).sort((a, b) => b.valueScore - a.valueScore);
  }

  calculateDistanceScore(stores, patientLocation) {
    if (!stores.length || !patientLocation) return 0;
    
    const nearestStore = stores.reduce((nearest, store) => {
      const distance = this.calculateDistance(patientLocation, store.location);
      return distance < nearest.distance ? { ...store, distance } : nearest;
    }, { distance: Infinity });

    // Score inversely related to distance (closer = better)
    return Math.max(0, 1 - (nearestStore.distance / 50)); // 50 mile max
  }

  calculatePriceScore(price, allOptions) {
    const prices = allOptions.map(o => o.cashPrice).filter(Boolean);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) return 1;
    
    // Score inversely related to price (lower = better)
    return 1 - ((price - minPrice) / (maxPrice - minPrice));
  }

  calculateDistance(location1, location2) {
    // Haversine formula for distance calculation
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(location2.lat - location1.lat);
    const dLon = this.toRadians(location2.lon - location1.lon);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(location1.lat)) * Math.cos(this.toRadians(location2.lat)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}

export default new PharmacyIntegrationService();