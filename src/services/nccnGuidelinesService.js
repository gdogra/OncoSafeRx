import axios from 'axios';
import { randomUUID } from 'crypto';

export class NCCNGuidelinesService {
  constructor() {
    this.baseUrl = process.env.NCCN_API_URL || 'https://api.nccn.org/guidelines';
    this.apiKey = process.env.NCCN_API_KEY;
    this.cache = new Map();
    this.cacheTimeout = 1000 * 60 * 60 * 24; // 24 hours for guidelines
    
    // Initialize HTTP client
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (this.apiKey) {
      this.client.defaults.headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    // Load static guidelines data for development
    this.staticGuidelines = this.loadStaticGuidelines();
  }

  /**
   * Get treatment recommendations based on cancer type, stage, and biomarkers
   */
  async getTreatmentRecommendations(cancerType, patientProfile = {}) {
    try {
      const cacheKey = `treatment_${cancerType}_${JSON.stringify(patientProfile)}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      let recommendations;

      try {
        // Try NCCN API first
        recommendations = await this.fetchNCCNRecommendations(cancerType, patientProfile);
      } catch (apiError) {
        console.warn('NCCN API unavailable, using static guidelines:', apiError.message);
        // Fallback to static guidelines
        recommendations = await this.getStaticRecommendations(cancerType, patientProfile);
      }

      // Cache the results
      this.cache.set(cacheKey, {
        data: recommendations,
        timestamp: Date.now()
      });

      return recommendations;

    } catch (error) {
      console.error('Error getting treatment recommendations:', error);
      throw new Error('Failed to retrieve treatment recommendations');
    }
  }

  /**
   * Get drug-specific guidelines and protocols
   */
  async getDrugGuidelines(drugName, indication = null) {
    try {
      const cacheKey = `drug_${drugName}_${indication}`;
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      const guidelines = await this.fetchDrugGuidelines(drugName, indication);
      
      this.cache.set(cacheKey, {
        data: guidelines,
        timestamp: Date.now()
      });

      return guidelines;

    } catch (error) {
      console.error('Error getting drug guidelines:', error);
      return this.getStaticDrugGuidelines(drugName, indication);
    }
  }

  /**
   * Get monitoring guidelines for specific treatments
   */
  async getMonitoringGuidelines(treatmentProtocol, patientProfile = {}) {
    try {
      const guidelines = {
        protocolId: randomUUID(),
        treatmentProtocol,
        monitoringSchedule: await this.getMonitoringSchedule(treatmentProtocol),
        laboratoryTests: await this.getRequiredLabTests(treatmentProtocol),
        imagingRequirements: await this.getImagingRequirements(treatmentProtocol),
        clinicalAssessments: await this.getClinicalAssessments(treatmentProtocol),
        emergencyProtocols: await this.getEmergencyProtocols(treatmentProtocol),
        patientSpecificConsiderations: await this.getPatientSpecificConsiderations(treatmentProtocol, patientProfile)
      };

      return guidelines;

    } catch (error) {
      console.error('Error getting monitoring guidelines:', error);
      return this.getDefaultMonitoringGuidelines(treatmentProtocol);
    }
  }

  /**
   * Get treatment pathway flowcharts
   */
  async getTreatmentPathways(cancerType, stage, biomarkers = {}) {
    try {
      const pathways = {
        cancerType,
        stage,
        biomarkers,
        primaryPathway: await this.getPrimaryTreatmentPathway(cancerType, stage, biomarkers),
        alternativePathways: await this.getAlternativePathways(cancerType, stage, biomarkers),
        conditionalRecommendations: await this.getConditionalRecommendations(cancerType, stage, biomarkers),
        sequentialTherapy: await this.getSequentialTherapyRecommendations(cancerType, stage),
        supportiveCare: await this.getSupportiveCareGuidelines(cancerType, stage)
      };

      return pathways;

    } catch (error) {
      console.error('Error getting treatment pathways:', error);
      return this.getStaticTreatmentPathways(cancerType, stage);
    }
  }

  /**
   * Fetch NCCN recommendations from API
   */
  async fetchNCCNRecommendations(cancerType, patientProfile) {
    const response = await this.client.get('/treatment-recommendations', {
      params: {
        cancer_type: cancerType,
        stage: patientProfile.stage,
        performance_status: patientProfile.performanceStatus,
        age: patientProfile.age,
        biomarkers: JSON.stringify(patientProfile.biomarkers || {})
      }
    });

    return this.processNCCNResponse(response.data);
  }

  /**
   * Get static recommendations when API is unavailable
   */
  async getStaticRecommendations(cancerType, patientProfile) {
    const guidelines = this.staticGuidelines[cancerType.toLowerCase()];
    
    if (!guidelines) {
      return this.getGenericRecommendations(cancerType);
    }

    // Filter recommendations based on patient profile
    return this.filterRecommendationsByProfile(guidelines, patientProfile);
  }

  /**
   * Load static NCCN guidelines data for development/fallback
   */
  loadStaticGuidelines() {
    return {
      'breast_cancer': {
        version: '2024.1',
        lastUpdated: '2024-01-15',
        stages: {
          'I': {
            her2_positive: {
              recommendations: [
                {
                  category: 'Preferred',
                  regimen: 'Trastuzumab + Pertuzumab + Docetaxel',
                  duration: '12 weeks',
                  evidence: '1A',
                  considerations: 'Consider cardiac monitoring'
                },
                {
                  category: 'Alternative',
                  regimen: 'Trastuzumab + Carboplatin + Docetaxel',
                  duration: '6 cycles',
                  evidence: '1A',
                  considerations: 'For patients with contraindication to anthracyclines'
                }
              ],
              monitoring: {
                cardiac: 'ECHO/MUGA every 3 months',
                laboratory: 'CBC, CMP every cycle',
                clinical: 'Performance status, toxicity assessment'
              }
            },
            her2_negative: {
              hormone_positive: {
                recommendations: [
                  {
                    category: 'Preferred',
                    regimen: 'Endocrine therapy (Tamoxifen or AI)',
                    duration: '5-10 years',
                    evidence: '1A',
                    considerations: 'Choice based on menopausal status'
                  }
                ]
              },
              triple_negative: {
                recommendations: [
                  {
                    category: 'Preferred',
                    regimen: 'Carboplatin + Paclitaxel',
                    duration: '12 weeks',
                    evidence: '1A',
                    considerations: 'BRCA testing recommended'
                  }
                ]
              }
            }
          },
          'IV': {
            her2_positive: {
              recommendations: [
                {
                  category: 'Preferred',
                  regimen: 'Trastuzumab + Pertuzumab + Docetaxel',
                  duration: 'Until progression',
                  evidence: '1A',
                  considerations: 'First-line metastatic therapy'
                },
                {
                  category: 'Subsequent',
                  regimen: 'T-DM1 (Trastuzumab emtansine)',
                  duration: 'Until progression',
                  evidence: '1A',
                  considerations: 'Second-line after pertuzumab-based therapy'
                }
              ]
            }
          }
        },
        biomarkerTesting: {
          required: ['ER', 'PR', 'HER2'],
          recommended: ['Ki-67', 'Oncotype DX'],
          emerging: ['PIK3CA', 'ESR1', 'BRCA1/2']
        }
      },

      'lung_cancer': {
        version: '2024.1',
        lastUpdated: '2024-01-20',
        subtypes: {
          'non_small_cell': {
            stages: {
              'IV': {
                molecularTesting: {
                  required: ['EGFR', 'ALK', 'ROS1', 'BRAF', 'KRAS', 'PD-L1'],
                  timeframe: 'Within 2 weeks of diagnosis'
                },
                egfr_positive: {
                  recommendations: [
                    {
                      category: 'Preferred',
                      regimen: 'Osimertinib',
                      duration: 'Until progression',
                      evidence: '1A',
                      considerations: 'First-line for common EGFR mutations'
                    }
                  ]
                },
                alk_positive: {
                  recommendations: [
                    {
                      category: 'Preferred',
                      regimen: 'Alectinib',
                      duration: 'Until progression',
                      evidence: '1A',
                      considerations: 'Superior CNS penetration'
                    }
                  ]
                },
                no_targetable_mutations: {
                  pdl1_high: {
                    recommendations: [
                      {
                        category: 'Preferred',
                        regimen: 'Pembrolizumab monotherapy',
                        duration: '2 years or until progression',
                        evidence: '1A',
                        considerations: 'PD-L1 ≥50%'
                      }
                    ]
                  },
                  pdl1_low: {
                    recommendations: [
                      {
                        category: 'Preferred',
                        regimen: 'Pembrolizumab + Carboplatin + Pemetrexed',
                        duration: 'Pembrolizumab until progression',
                        evidence: '1A',
                        considerations: 'Non-squamous histology'
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      },

      'colorectal_cancer': {
        version: '2024.1',
        lastUpdated: '2024-01-10',
        stages: {
          'IV': {
            molecularTesting: {
              required: ['KRAS', 'NRAS', 'BRAF', 'MSI/MMR', 'HER2'],
              recommended: ['UGT1A1', 'DPYD']
            },
            msi_high: {
              recommendations: [
                {
                  category: 'Preferred',
                  regimen: 'Pembrolizumab',
                  duration: 'Until progression',
                  evidence: '1A',
                  considerations: 'Tissue-agnostic approval for MSI-H'
                }
              ]
            },
            msi_stable: {
              kras_wild_type: {
                recommendations: [
                  {
                    category: 'Preferred',
                    regimen: 'FOLFOX + Bevacizumab',
                    duration: '12 cycles, bevacizumab until progression',
                    evidence: '1A',
                    considerations: 'Left-sided tumors may benefit from anti-EGFR'
                  }
                ]
              }
            }
          }
        }
      }
    };
  }

  /**
   * Process NCCN API response
   */
  processNCCNResponse(data) {
    return {
      guidelineVersion: data.version,
      lastUpdated: data.lastUpdated,
      recommendations: data.recommendations.map(rec => ({
        category: rec.category,
        regimen: rec.regimen,
        evidence: rec.evidenceLevel,
        duration: rec.duration,
        considerations: rec.considerations,
        alternatives: rec.alternatives || []
      })),
      monitoring: data.monitoring,
      biomarkerRequirements: data.biomarkerRequirements
    };
  }

  /**
   * Filter recommendations based on patient profile
   */
  filterRecommendationsByProfile(guidelines, profile) {
    const { stage, biomarkers = {}, age, performanceStatus } = profile;
    
    let recommendations = guidelines.stages?.[stage] || guidelines.stages?.['IV'] || {};
    
    // Filter by biomarkers
    if (biomarkers.her2 === 'positive' && recommendations.her2_positive) {
      recommendations = recommendations.her2_positive;
    } else if (biomarkers.her2 === 'negative' && recommendations.her2_negative) {
      recommendations = recommendations.her2_negative;
    }

    // Further filtering based on other biomarkers
    if (biomarkers.er === 'positive' && recommendations.hormone_positive) {
      recommendations = recommendations.hormone_positive;
    } else if (biomarkers.er === 'negative' && biomarkers.pr === 'negative' && recommendations.triple_negative) {
      recommendations = recommendations.triple_negative;
    }

    return {
      guidelineVersion: guidelines.version,
      lastUpdated: guidelines.lastUpdated,
      recommendations: recommendations.recommendations || [],
      monitoring: recommendations.monitoring || {},
      biomarkerTesting: guidelines.biomarkerTesting || {}
    };
  }

  // Helper methods for monitoring guidelines
  async getMonitoringSchedule(protocol) {
    return {
      'pre_treatment': 'Within 2 weeks of starting therapy',
      'during_treatment': 'Before each cycle',
      'post_treatment': '3 months, 6 months, then annually'
    };
  }

  async getRequiredLabTests(protocol) {
    return [
      'Complete Blood Count (CBC)',
      'Comprehensive Metabolic Panel (CMP)',
      'Liver Function Tests (LFTs)',
      'Performance Status Assessment'
    ];
  }

  async getImagingRequirements(protocol) {
    return [
      {
        type: 'CT Chest/Abdomen/Pelvis',
        frequency: 'Every 8-12 weeks',
        purpose: 'Response assessment'
      },
      {
        type: 'Brain MRI',
        frequency: 'Every 12 weeks if CNS metastases',
        purpose: 'CNS response monitoring'
      }
    ];
  }

  async getClinicalAssessments(protocol) {
    return [
      'Performance status (ECOG)',
      'Toxicity assessment (CTCAE)',
      'Symptom evaluation',
      'Quality of life assessment'
    ];
  }

  async getEmergencyProtocols(protocol) {
    return [
      {
        scenario: 'Severe infusion reaction',
        action: 'Stop infusion, epinephrine, corticosteroids',
        followUp: 'Cardiology consultation'
      },
      {
        scenario: 'Febrile neutropenia',
        action: 'Blood cultures, broad-spectrum antibiotics',
        followUp: 'Infectious disease consultation'
      }
    ];
  }

  // Placeholder methods
  async fetchDrugGuidelines(drugName, indication) { return {}; }
  async getStaticDrugGuidelines(drugName, indication) { return {}; }
  async getPatientSpecificConsiderations(protocol, profile) { return []; }
  async getDefaultMonitoringGuidelines(protocol) { return {}; }
  async getPrimaryTreatmentPathway(type, stage, biomarkers) { return {}; }
  async getAlternativePathways(type, stage, biomarkers) { return []; }
  async getConditionalRecommendations(type, stage, biomarkers) { return []; }
  async getSequentialTherapyRecommendations(type, stage) { return []; }
  async getSupportiveCareGuidelines(type, stage) { return {}; }
  async getStaticTreatmentPathways(type, stage) { return {}; }
  getGenericRecommendations(cancerType) { return { recommendations: [], monitoring: {} }; }
}

export default new NCCNGuidelinesService();
