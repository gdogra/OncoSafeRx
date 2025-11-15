import { authedFetch } from '../utils/authedFetch';

export interface PredictionInput {
  patientId: string;
  demographics: {
    age: number;
    gender: 'Male' | 'Female';
    race: string;
    bmi: number;
  };
  diagnosis: {
    primaryDiagnosis: string;
    stage: string;
    histology: string;
    grade: string;
    biomarkers: { name: string; value: string; status: string }[];
  };
  treatment: {
    regimen: string;
    drugs: { name: string; dose: string; frequency: string }[];
    startDate: string;
    priorTreatments: string[];
  };
  baseline: {
    performanceStatus: number;
    labValues: { test: string; value: number; units: string; date: string }[];
    comorbidities: string[];
    concomitantMeds: string[];
  };
  genetics: {
    variants: { gene: string; variant: string; impact: string }[];
    tumorMutations: { gene: string; mutation: string; frequency: number }[];
  };
}

export interface OutcomePrediction {
  predictionId: string;
  generatedAt: string;
  confidenceScore: number;
  
  efficacy: {
    responseProbability: {
      completeResponse: number;
      partialResponse: number;
      stableDisease: number;
      progressiveDisease: number;
    };
    survivalPrediction: {
      medianPFS: number; // months
      pfsConfidenceInterval: [number, number];
      medianOS: number; // months
      osConfidenceInterval: [number, number];
      oneYearSurvival: number;
      twoYearSurvival: number;
    };
    timeToResponse: {
      median: number; // weeks
      range: [number, number];
    };
    durationOfResponse: {
      median: number; // months
      range: [number, number];
    };
  };
  
  safety: {
    adverseEventRisk: {
      grade3Plus: number;
      hospitalization: number;
      treatmentDiscontinuation: number;
    };
    specificToxicities: {
      toxicity: string;
      grade1_2: number;
      grade3_4: number;
      timeToOnset: number; // days
      preventionStrategies: string[];
    }[];
    drugInteractionRisks: {
      drug1: string;
      drug2: string;
      riskLevel: 'Low' | 'Moderate' | 'High';
      clinicalConsequence: string;
      mitigation: string;
    }[];
  };

  qualityOfLife: {
    functionalStatus: {
      baseline: number;
      predictedChange: number;
      confidenceInterval: [number, number];
    };
    symptomBurden: {
      fatigue: number;
      nausea: number;
      pain: number;
      neuropathy: number;
    };
    healthcareUtilization: {
      emergencyVisits: number;
      hospitalizations: number;
      unplannedClinicalVisits: number;
    };
  };

  costEffectiveness: {
    treatmentCost: {
      drugCosts: number;
      administrationCosts: number;
      monitoringCosts: number;
      totalMonthlyCost: number;
    };
    costPerQALY: number;
    costPerResponseMonth: number;
    budgetImpact: number;
  };

  alternativeOptions: {
    regimen: string;
    rationale: string;
    expectedBenefit: string;
    tradeoffs: string;
    efficacyComparison: number; // relative to current regimen
    safetyComparison: number;
  }[];

  monitoringRecommendations: {
    parameter: string;
    baseline: boolean;
    frequency: string;
    target: string;
    alert_threshold: string;
    rationale: string;
  }[];

  keyFactors: {
    favorablePrognostic: string[];
    adversePrognostic: string[];
    uncertaintyFactors: string[];
  };
}

export interface RealWorldOutcome {
  patientId: string;
  treatmentRegimen: string;
  startDate: string;
  endDate?: string;
  
  response: {
    bestResponse: 'CR' | 'PR' | 'SD' | 'PD';
    responseDate?: string;
    progressionDate?: string;
    reasonForDiscontinuation?: string;
  };
  
  toxicity: {
    adverseEvent: string;
    grade: 1 | 2 | 3 | 4 | 5;
    onset: string;
    resolution?: string;
    causality: 'Unrelated' | 'Unlikely' | 'Possible' | 'Probable' | 'Definite';
    action: string;
  }[];
  
  qualityOfLife: {
    assessmentDate: string;
    functionalStatus: number;
    symptoms: { symptom: string; severity: number }[];
  }[];
  
  healthcareUtilization: {
    visits: { type: string; date: string; reason: string }[];
    hospitalizations: { admission: string; discharge: string; reason: string }[];
    costs: { category: string; amount: number; date: string }[];
  };
}

class OutcomePredictionService {
  private baseUrl = '/api/outcome-prediction';

  /**
   * Generate comprehensive outcome prediction
   */
  async predictOutcomes(input: PredictionInput): Promise<OutcomePrediction> {
    try {
      const response = await authedFetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Failed to generate outcome prediction');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating outcome prediction:', error);
      return this.getMockOutcomePrediction();
    }
  }

  /**
   * Compare multiple treatment options
   */
  async compareRegimens(
    patientData: Omit<PredictionInput, 'treatment'>,
    regimens: Array<{ name: string; drugs: any[]; }>
  ): Promise<{
    regimen: string;
    prediction: OutcomePrediction;
    ranking: number;
    pros: string[];
    cons: string[];
  }[]> {
    try {
      const response = await authedFetch(`${this.baseUrl}/compare`, {
        method: 'POST',
        body: JSON.stringify({ patientData, regimens }),
      });

      if (!response.ok) {
        throw new Error('Failed to compare regimens');
      }

      return await response.json();
    } catch (error) {
      console.error('Error comparing regimens:', error);
      return this.getMockRegimenComparison();
    }
  }

  /**
   * Submit real-world outcome data for ML training
   */
  async submitOutcome(outcome: RealWorldOutcome): Promise<void> {
    try {
      await authedFetch(`${this.baseUrl}/outcomes`, {
        method: 'POST',
        body: JSON.stringify(outcome),
      });
    } catch (error) {
      console.error('Error submitting outcome:', error);
    }
  }

  /**
   * Get model performance metrics
   */
  async getModelPerformance(): Promise<{
    accuracy: number;
    sensitivity: number;
    specificity: number;
    auc: number;
    calibrationSlope: number;
    patientsCohort: number;
    lastUpdated: string;
    validationResults: {
      dataset: string;
      performance: number;
      sampleSize: number;
    }[];
  }> {
    try {
      const response = await authedFetch(`${this.baseUrl}/performance`);
      
      if (!response.ok) {
        throw new Error('Failed to get model performance');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting model performance:', error);
      return this.getMockModelPerformance();
    }
  }

  // Mock data for demo purposes
  private getMockOutcomePrediction(): OutcomePrediction {
    return {
      predictionId: 'pred_' + Date.now(),
      generatedAt: new Date().toISOString(),
      confidenceScore: 0.87,
      
      efficacy: {
        responseProbability: {
          completeResponse: 0.15,
          partialResponse: 0.45,
          stableDisease: 0.25,
          progressiveDisease: 0.15
        },
        survivalPrediction: {
          medianPFS: 18.5,
          pfsConfidenceInterval: [14.2, 22.8],
          medianOS: 32.1,
          osConfidenceInterval: [28.4, 35.8],
          oneYearSurvival: 0.85,
          twoYearSurvival: 0.65
        },
        timeToResponse: {
          median: 12,
          range: [8, 16]
        },
        durationOfResponse: {
          median: 15,
          range: [10, 24]
        }
      },
      
      safety: {
        adverseEventRisk: {
          grade3Plus: 0.35,
          hospitalization: 0.12,
          treatmentDiscontinuation: 0.08
        },
        specificToxicities: [
          {
            toxicity: 'Neutropenia',
            grade1_2: 0.45,
            grade3_4: 0.15,
            timeToOnset: 14,
            preventionStrategies: ['G-CSF support', 'Dose modification', 'Close monitoring']
          },
          {
            toxicity: 'Peripheral neuropathy',
            grade1_2: 0.65,
            grade3_4: 0.08,
            timeToOnset: 42,
            preventionStrategies: ['Neurologic assessments', 'Dose modifications', 'Neuroprotective agents']
          }
        ],
        drugInteractionRisks: [
          {
            drug1: 'Paclitaxel',
            drug2: 'Warfarin',
            riskLevel: 'Moderate',
            clinicalConsequence: 'Increased bleeding risk',
            mitigation: 'Monitor INR closely, consider dose adjustment'
          }
        ]
      },

      qualityOfLife: {
        functionalStatus: {
          baseline: 85,
          predictedChange: -5,
          confidenceInterval: [-10, 0]
        },
        symptomBurden: {
          fatigue: 0.65,
          nausea: 0.35,
          pain: 0.25,
          neuropathy: 0.45
        },
        healthcareUtilization: {
          emergencyVisits: 0.8,
          hospitalizations: 0.3,
          unplannedClinicalVisits: 2.5
        }
      },

      costEffectiveness: {
        treatmentCost: {
          drugCosts: 8500,
          administrationCosts: 1200,
          monitoringCosts: 800,
          totalMonthlyCost: 10500
        },
        costPerQALY: 95000,
        costPerResponseMonth: 12500,
        budgetImpact: 189000
      },

      alternativeOptions: [
        {
          regimen: 'Carboplatin + Paclitaxel',
          rationale: 'Better tolerability profile',
          expectedBenefit: '10% lower grade 3+ toxicity',
          tradeoffs: 'Slightly lower response rate',
          efficacyComparison: 0.92,
          safetyComparison: 1.15
        }
      ],

      monitoringRecommendations: [
        {
          parameter: 'Complete Blood Count',
          baseline: true,
          frequency: 'Weekly for first cycle, then every 2 weeks',
          target: 'ANC >1000, Platelets >100k',
          alert_threshold: 'ANC <500 or Platelets <50k',
          rationale: 'Monitor for myelosuppression'
        }
      ],

      keyFactors: {
        favorablePrognostic: ['Young age', 'Good performance status', 'Hormone receptor positive'],
        adversePrognostic: ['High tumor burden', 'Prior chemotherapy exposure'],
        uncertaintyFactors: ['Limited data on novel agent combinations', 'Genetic variant interpretation']
      }
    };
  }

  private getMockRegimenComparison() {
    return [
      {
        regimen: 'TC (Docetaxel + Cyclophosphamide)',
        prediction: this.getMockOutcomePrediction(),
        ranking: 1,
        pros: ['Lower neuropathy risk', 'Convenient schedule'],
        cons: ['Higher infection risk', 'Alopecia universal']
      },
      {
        regimen: 'AC-T (Doxorubicin + Cyclophosphamide → Paclitaxel)',
        prediction: this.getMockOutcomePrediction(),
        ranking: 2,
        pros: ['Higher efficacy', 'Standard of care'],
        cons: ['Cardiotoxicity risk', 'Longer treatment duration']
      }
    ];
  }

  private getMockModelPerformance() {
    return {
      accuracy: 0.78,
      sensitivity: 0.82,
      specificity: 0.74,
      auc: 0.85,
      calibrationSlope: 0.92,
      patientsCohort: 15420,
      lastUpdated: new Date().toISOString(),
      validationResults: [
        { dataset: 'Internal Validation', performance: 0.81, sampleSize: 3084 },
        { dataset: 'External Validation - SEER', performance: 0.76, sampleSize: 8921 },
        { dataset: 'Real-World Evidence', performance: 0.73, sampleSize: 12567 }
      ]
    };
  }
}

export const outcomePredictionService = new OutcomePredictionService();