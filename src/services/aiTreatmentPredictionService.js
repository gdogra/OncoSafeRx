import axios from 'axios';
import { randomUUID } from 'crypto';

export class AITreatmentPredictionService {
  constructor() {
    this.aiModels = {
      responsePredictor: {
        version: '2.1.0',
        endpoint: process.env.AI_RESPONSE_PREDICTOR_URL,
        apiKey: process.env.AI_MODEL_API_KEY,
        enabled: !!process.env.AI_RESPONSE_PREDICTOR_URL
      },
      survivalPredictor: {
        version: '1.8.0',
        endpoint: process.env.AI_SURVIVAL_PREDICTOR_URL,
        apiKey: process.env.AI_MODEL_API_KEY,
        enabled: !!process.env.AI_SURVIVAL_PREDICTOR_URL
      },
      toxicityPredictor: {
        version: '1.5.0',
        endpoint: process.env.AI_TOXICITY_PREDICTOR_URL,
        apiKey: process.env.AI_MODEL_API_KEY,
        enabled: !!process.env.AI_TOXICITY_PREDICTOR_URL
      }
    };

    this.cache = new Map();
    this.cacheTimeout = 1000 * 60 * 30; // 30 minutes for AI predictions

    // Initialize AI model clients
    this.aiClients = {};
    Object.entries(this.aiModels).forEach(([key, config]) => {
      if (config.enabled) {
        this.aiClients[key] = axios.create({
          baseURL: config.endpoint,
          timeout: 60000, // 60 seconds for AI models
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          }
        });
      }
    });

    // Load pre-trained models and datasets
    this.modelFeatures = this.loadModelFeatures();
    this.treatmentProtocols = this.loadTreatmentProtocols();
    this.outcomeData = this.loadHistoricalOutcomes();
  }

  /**
   * Comprehensive AI-driven treatment prediction
   */
  async predictOptimalTreatment(patientData, availableTreatments = []) {
    try {
      const predictionId = randomUUID();
      
      const prediction = {
        predictionId,
        timestamp: new Date().toISOString(),
        patientData,
        availableTreatments,
        predictions: {
          responseRates: await this.predictTreatmentResponse(patientData, availableTreatments),
          survivalOutcomes: await this.predictSurvivalOutcomes(patientData, availableTreatments),
          toxicityRisks: await this.predictToxicityRisks(patientData, availableTreatments),
          qualityOfLife: await this.predictQualityOfLife(patientData, availableTreatments),
          biomarkerResponse: await this.predictBiomarkerResponse(patientData, availableTreatments)
        },
        recommendations: await this.generateAIRecommendations(patientData, availableTreatments),
        confidenceScores: await this.calculateConfidenceScores(patientData),
        alternativeStrategies: await this.generateAlternativeStrategies(patientData),
        monitoring: await this.generateMonitoringPlan(patientData),
        explanation: await this.generateExplanation(patientData)
      };

      return prediction;

    } catch (error) {
      console.error('Error predicting optimal treatment:', error);
      throw new Error('Failed to predict optimal treatment');
    }
  }

  /**
   * Predict treatment response rates using AI
   */
  async predictTreatmentResponse(patientData, treatments) {
    try {
      const responses = [];

      for (const treatment of treatments) {
        const features = this.extractFeatures(patientData, treatment);
        let responseRate = 0.5; // Default fallback

        if (this.aiClients.responsePredictor) {
          try {
            const response = await this.aiClients.responsePredictor.post('/predict', {
              features,
              treatment: treatment.regimen,
              patient_profile: this.normalizePatientProfile(patientData)
            });

            responseRate = response.data.predicted_response_rate;
          } catch (apiError) {
            console.warn('AI response predictor unavailable, using fallback model');
            responseRate = await this.fallbackResponsePrediction(patientData, treatment);
          }
        } else {
          responseRate = await this.fallbackResponsePrediction(patientData, treatment);
        }

        responses.push({
          treatment: treatment.regimen,
          predictedResponseRate: responseRate,
          confidenceInterval: this.calculateConfidenceInterval(responseRate, features),
          responseType: this.categorizeResponse(responseRate),
          factors: this.identifyResponseFactors(patientData, treatment),
          duration: await this.predictResponseDuration(patientData, treatment)
        });
      }

      return responses.sort((a, b) => b.predictedResponseRate - a.predictedResponseRate);

    } catch (error) {
      console.error('Error predicting treatment response:', error);
      return [];
    }
  }

  /**
   * Predict survival outcomes using AI models
   */
  async predictSurvivalOutcomes(patientData, treatments) {
    try {
      const survivalPredictions = [];

      for (const treatment of treatments) {
        const features = this.extractSurvivalFeatures(patientData, treatment);
        let survivalData = {
          medianOS: 12,
          medianPFS: 6,
          oneYearSurvival: 0.7,
          twoYearSurvival: 0.5
        };

        if (this.aiClients.survivalPredictor) {
          try {
            const response = await this.aiClients.survivalPredictor.post('/predict', {
              features,
              treatment: treatment.regimen,
              followup_months: 24
            });

            survivalData = response.data.survival_predictions;
          } catch (apiError) {
            console.warn('AI survival predictor unavailable, using fallback model');
            survivalData = await this.fallbackSurvivalPrediction(patientData, treatment);
          }
        } else {
          survivalData = await this.fallbackSurvivalPrediction(patientData, treatment);
        }

        survivalPredictions.push({
          treatment: treatment.regimen,
          overallSurvival: {
            median: survivalData.medianOS,
            oneYear: survivalData.oneYearSurvival,
            twoYear: survivalData.twoYearSurvival,
            hazardRatio: survivalData.hazardRatio || 1.0
          },
          progressionFreeSurvival: {
            median: survivalData.medianPFS,
            sixMonth: survivalData.sixMonthPFS || 0.6,
            oneYear: survivalData.oneYearPFS || 0.4
          },
          prognosticFactors: this.identifyPrognosticFactors(patientData),
          riskStratification: this.stratifyRisk(patientData, survivalData)
        });
      }

      return survivalPredictions;

    } catch (error) {
      console.error('Error predicting survival outcomes:', error);
      return [];
    }
  }

  /**
   * Predict toxicity risks using AI models
   */
  async predictToxicityRisks(patientData, treatments) {
    try {
      const toxicityPredictions = [];

      for (const treatment of treatments) {
        const features = this.extractToxicityFeatures(patientData, treatment);
        let toxicityData = {
          grade3_4_hematologic: 0.3,
          grade3_4_nonhematologic: 0.2,
          serious_adverse_events: 0.1
        };

        if (this.aiClients.toxicityPredictor) {
          try {
            const response = await this.aiClients.toxicityPredictor.post('/predict', {
              features,
              treatment: treatment.regimen,
              patient_factors: this.extractToxicityRiskFactors(patientData)
            });

            toxicityData = response.data.toxicity_predictions;
          } catch (apiError) {
            console.warn('AI toxicity predictor unavailable, using fallback model');
            toxicityData = await this.fallbackToxicityPrediction(patientData, treatment);
          }
        } else {
          toxicityData = await this.fallbackToxicityPrediction(patientData, treatment);
        }

        toxicityPredictions.push({
          treatment: treatment.regimen,
          hematologicToxicity: {
            grade1_2: toxicityData.grade1_2_hematologic || 0.6,
            grade3_4: toxicityData.grade3_4_hematologic,
            specificToxicities: this.predictSpecificHematologicToxicities(patientData, treatment)
          },
          nonHematologicToxicity: {
            grade1_2: toxicityData.grade1_2_nonhematologic || 0.5,
            grade3_4: toxicityData.grade3_4_nonhematologic,
            specificToxicities: this.predictSpecificNonHematologicToxicities(patientData, treatment)
          },
          seriousAdverseEvents: toxicityData.serious_adverse_events,
          riskFactors: this.identifyToxicityRiskFactors(patientData, treatment),
          mitigationStrategies: this.suggestToxicityMitigation(patientData, treatment)
        });
      }

      return toxicityPredictions;

    } catch (error) {
      console.error('Error predicting toxicity risks:', error);
      return [];
    }
  }

  /**
   * Predict quality of life outcomes
   */
  async predictQualityOfLife(patientData, treatments) {
    const qolPredictions = [];

    for (const treatment of treatments) {
      const qolData = {
        treatment: treatment.regimen,
        physicalFunction: await this.predictPhysicalFunction(patientData, treatment),
        emotionalWellbeing: await this.predictEmotionalWellbeing(patientData, treatment),
        socialFunction: await this.predictSocialFunction(patientData, treatment),
        cognitiveFunction: await this.predictCognitiveFunction(patientData, treatment),
        overallQoL: 0,
        symptomBurden: await this.predictSymptomBurden(patientData, treatment),
        functionalCapacity: await this.predictFunctionalCapacity(patientData, treatment)
      };

      // Calculate overall QoL score
      qolData.overallQoL = (
        qolData.physicalFunction.score * 0.3 +
        qolData.emotionalWellbeing.score * 0.25 +
        qolData.socialFunction.score * 0.2 +
        qolData.cognitiveFunction.score * 0.25
      );

      qolPredictions.push(qolData);
    }

    return qolPredictions;
  }

  /**
   * Predict biomarker-based response
   */
  async predictBiomarkerResponse(patientData, treatments) {
    const biomarkerPredictions = [];

    for (const treatment of treatments) {
      const biomarkers = patientData.biomarkers || {};
      const genomics = patientData.genomics || {};

      const prediction = {
        treatment: treatment.regimen,
        biomarkerProfile: biomarkers,
        genomicProfile: genomics,
        predictedResponse: 'unknown',
        mechanismOfAction: await this.analyzeMechanismOfAction(treatment, biomarkers),
        resistanceMechanisms: await this.predictResistanceMechanisms(treatment, genomics),
        combinationOpportunities: await this.identifyCombinationOpportunities(treatment, biomarkers),
        monitoringBiomarkers: await this.identifyMonitoringBiomarkers(treatment, biomarkers)
      };

      // Analyze specific biomarker patterns
      prediction.predictedResponse = this.predictBiomarkerResponseForTreatment(treatment, biomarkers, genomics);

      biomarkerPredictions.push(prediction);
    }

    return biomarkerPredictions;
  }

  /**
   * Generate AI-driven treatment recommendations
   */
  async generateAIRecommendations(patientData, treatments) {
    const recommendations = {
      primaryRecommendation: null,
      alternativeOptions: [],
      sequencingStrategy: [],
      combinationTherapy: [],
      personalizationFactors: [],
      monitoring: [],
      supportiveCare: []
    };

    // Analyze all predictions to generate recommendations
    const predictions = {
      response: await this.predictTreatmentResponse(patientData, treatments),
      survival: await this.predictSurvivalOutcomes(patientData, treatments),
      toxicity: await this.predictToxicityRisks(patientData, treatments),
      qol: await this.predictQualityOfLife(patientData, treatments)
    };

    // Score treatments based on multiple factors
    const scoredTreatments = this.scoreTreatments(predictions, patientData);

    // Generate primary recommendation
    if (scoredTreatments.length > 0) {
      const topTreatment = scoredTreatments[0];
      recommendations.primaryRecommendation = {
        treatment: topTreatment.treatment,
        score: topTreatment.score,
        rationale: topTreatment.rationale,
        expectedOutcomes: topTreatment.expectedOutcomes,
        riskBenefit: topTreatment.riskBenefit
      };

      // Alternative options
      recommendations.alternativeOptions = scoredTreatments.slice(1, 4).map(t => ({
        treatment: t.treatment,
        score: t.score,
        rationale: t.rationale,
        considerations: t.considerations
      }));
    }

    // Generate sequencing strategy
    recommendations.sequencingStrategy = await this.generateSequencingStrategy(patientData, treatments);

    // Identify combination opportunities
    recommendations.combinationTherapy = await this.identifyCombinationOpportunities(patientData, treatments);

    return recommendations;
  }

  // Feature extraction methods
  extractFeatures(patientData, treatment) {
    return {
      age: patientData.age || 65,
      sex: patientData.sex === 'female' ? 1 : 0,
      performanceStatus: patientData.performanceStatus || 1,
      stage: this.encodeStage(patientData.cancerStage),
      histology: this.encodeHistology(patientData.histology),
      biomarkers: this.encodeBiomarkers(patientData.biomarkers || {}),
      comorbidities: this.encodeComorbidities(patientData.comorbidities || []),
      priorTreatments: this.encodePriorTreatments(patientData.priorTreatments || []),
      genomics: this.encodeGenomics(patientData.genomics || {}),
      treatment: this.encodeTreatment(treatment)
    };
  }

  extractSurvivalFeatures(patientData, treatment) {
    const baseFeatures = this.extractFeatures(patientData, treatment);
    return {
      ...baseFeatures,
      prognosticScore: this.calculatePrognosticScore(patientData),
      diseaseExtent: this.encodeDiseaseExtent(patientData),
      tumorBurden: this.encodeTumorBurden(patientData),
      metastaticSites: this.encodeMetastaticSites(patientData.metastaticSites || [])
    };
  }

  extractToxicityFeatures(patientData, treatment) {
    const baseFeatures = this.extractFeatures(patientData, treatment);
    return {
      ...baseFeatures,
      renalFunction: patientData.kidneyFunction || 90,
      hepaticFunction: this.encodeHepaticFunction(patientData.liverFunction || {}),
      cardiacFunction: this.encodeCardiacFunction(patientData.cardiacFunction || {}),
      hematopoieticReserve: this.encodeHematopoieticReserve(patientData.laboratoryValues || {}),
      drugMetabolism: this.encodeDrugMetabolism(patientData.genetics || {})
    };
  }

  // Fallback prediction methods (when AI models are unavailable)
  async fallbackResponsePrediction(patientData, treatment) {
    // Use clinical rules and historical data
    let baseResponse = 0.4; // Default response rate

    // Adjust based on biomarkers
    const biomarkers = patientData.biomarkers || {};
    if (biomarkers.her2 === 'positive' && treatment.regimen.includes('trastuzumab')) {
      baseResponse += 0.3;
    }
    if (biomarkers.pdl1 >= 50 && treatment.type === 'immunotherapy') {
      baseResponse += 0.25;
    }

    // Adjust based on performance status
    if (patientData.performanceStatus >= 2) {
      baseResponse -= 0.15;
    }

    // Adjust based on prior treatments
    const priorLines = (patientData.priorTreatments || []).length;
    baseResponse -= Math.min(priorLines * 0.1, 0.3);

    return Math.max(0.1, Math.min(0.9, baseResponse));
  }

  async fallbackSurvivalPrediction(patientData, treatment) {
    const responseRate = await this.fallbackResponsePrediction(patientData, treatment);
    
    // Estimate survival based on response rate and other factors
    const baseOS = 12; // months
    const basePFS = 6; // months

    const adjustedOS = baseOS * (1 + responseRate);
    const adjustedPFS = basePFS * (1 + responseRate * 0.8);

    return {
      medianOS: adjustedOS,
      medianPFS: adjustedPFS,
      oneYearSurvival: Math.min(0.9, 0.5 + responseRate * 0.4),
      twoYearSurvival: Math.min(0.8, 0.3 + responseRate * 0.3)
    };
  }

  async fallbackToxicityPrediction(patientData, treatment) {
    let baseToxicity = 0.25; // Default grade 3-4 toxicity rate

    // Adjust based on age
    if (patientData.age >= 70) {
      baseToxicity += 0.1;
    }

    // Adjust based on performance status
    if (patientData.performanceStatus >= 2) {
      baseToxicity += 0.15;
    }

    // Adjust based on comorbidities
    const comorbidityCount = (patientData.comorbidities || []).length;
    baseToxicity += Math.min(comorbidityCount * 0.05, 0.2);

    return {
      grade3_4_hematologic: Math.min(0.6, baseToxicity + 0.1),
      grade3_4_nonhematologic: Math.min(0.5, baseToxicity),
      serious_adverse_events: Math.min(0.3, baseToxicity * 0.5)
    };
  }

  // Helper methods
  loadModelFeatures() {
    return {
      demographic: ['age', 'sex', 'race', 'ethnicity'],
      clinical: ['stage', 'histology', 'performance_status', 'comorbidities'],
      molecular: ['biomarkers', 'genomics', 'expression_profile'],
      treatment: ['regimen', 'dosing', 'schedule', 'prior_treatments']
    };
  }

  loadTreatmentProtocols() {
    return {
      chemotherapy: ['FOLFOX', 'FOLFIRI', 'AC-T', 'TCH'],
      immunotherapy: ['Pembrolizumab', 'Nivolumab', 'Atezolizumab'],
      targeted: ['Trastuzumab', 'Bevacizumab', 'Osimertinib'],
      combinations: ['Chemo-Immuno', 'Targeted-Chemo', 'Dual-Targeted']
    };
  }

  loadHistoricalOutcomes() {
    return {
      responseRates: {},
      survivalData: {},
      toxicityProfiles: {},
      qualityOfLife: {}
    };
  }

  // Encoding methods
  encodeStage(stage) {
    const stageMap = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4 };
    return stageMap[stage] || 4;
  }

  encodeHistology(histology) {
    // Return encoded histology value
    return 0;
  }

  encodeBiomarkers(biomarkers) {
    return {
      her2: biomarkers.her2 === 'positive' ? 1 : 0,
      er: biomarkers.er === 'positive' ? 1 : 0,
      pr: biomarkers.pr === 'positive' ? 1 : 0,
      pdl1: biomarkers.pdl1 || 0
    };
  }

  encodeComorbidities(comorbidities) {
    return comorbidities.length;
  }

  encodePriorTreatments(priorTreatments) {
    return priorTreatments.length;
  }

  encodeGenomics(genomics) {
    return Object.keys(genomics).length;
  }

  encodeTreatment(treatment) {
    return {
      type: treatment.type || 'chemotherapy',
      complexity: (treatment.agents || []).length
    };
  }

  // Placeholder methods for complex calculations
  calculateConfidenceInterval(rate, features) { return [rate - 0.1, rate + 0.1]; }
  categorizeResponse(rate) { return rate > 0.6 ? 'high' : rate > 0.3 ? 'moderate' : 'low'; }
  identifyResponseFactors(patientData, treatment) { return []; }
  async predictResponseDuration(patientData, treatment) { return 6; }
  identifyPrognosticFactors(patientData) { return []; }
  stratifyRisk(patientData, survivalData) { return 'intermediate'; }
  extractToxicityRiskFactors(patientData) { return {}; }
  predictSpecificHematologicToxicities(patientData, treatment) { return []; }
  predictSpecificNonHematologicToxicities(patientData, treatment) { return []; }
  identifyToxicityRiskFactors(patientData, treatment) { return []; }
  suggestToxicityMitigation(patientData, treatment) { return []; }
  async predictPhysicalFunction(patientData, treatment) { return { score: 0.7 }; }
  async predictEmotionalWellbeing(patientData, treatment) { return { score: 0.6 }; }
  async predictSocialFunction(patientData, treatment) { return { score: 0.8 }; }
  async predictCognitiveFunction(patientData, treatment) { return { score: 0.75 }; }
  async predictSymptomBurden(patientData, treatment) { return {}; }
  async predictFunctionalCapacity(patientData, treatment) { return {}; }
  async analyzeMechanismOfAction(treatment, biomarkers) { return {}; }
  async predictResistanceMechanisms(treatment, genomics) { return []; }
  async identifyCombinationOpportunities(treatment, biomarkers) { return []; }
  async identifyMonitoringBiomarkers(treatment, biomarkers) { return []; }
  // Renamed to avoid collision with the public method above
  predictBiomarkerResponseForTreatment(treatment, biomarkers, genomics) { return 'responsive'; }
  scoreTreatments(predictions, patientData) { return []; }
  async generateSequencingStrategy(patientData, treatments) { return []; }
  async calculateConfidenceScores(patientData) { return {}; }
  async generateAlternativeStrategies(patientData) { return []; }
  async generateMonitoringPlan(patientData) { return {}; }
  async generateExplanation(patientData) { return {}; }
  normalizePatientProfile(patientData) { return {}; }
  calculatePrognosticScore(patientData) { return 0.5; }
  encodeDiseaseExtent(patientData) { return 0; }
  encodeTumorBurden(patientData) { return 0; }
  encodeMetastaticSites(sites) { return sites.length; }
  encodeHepaticFunction(liverFunction) { return 0; }
  encodeCardiacFunction(cardiacFunction) { return 0; }
  encodeHematopoieticReserve(labValues) { return 0; }
  encodeDrugMetabolism(genetics) { return 0; }
}

export default new AITreatmentPredictionService();
