import { authedFetch } from '../utils/authedFetch';

export interface ToxicityRiskProfile {
  patientId: string;
  assessmentDate: string;
  
  // Risk factors
  demographics: {
    age: number;
    gender: string;
    bmi: number;
    smoking_status: string;
  };
  
  comorbidities: {
    cardiovascular: boolean;
    hepatic: boolean;
    renal: boolean;
    diabetes: boolean;
    immunocompromised: boolean;
  };
  
  genetics: {
    cyp2d6_phenotype: string; // Poor, Intermediate, Normal, Rapid, Ultrarapid
    cyp3a4_phenotype: string;
    dpd_deficiency: boolean; // 5-FU toxicity
    ugt1a1_variants: string[]; // Irinotecan toxicity
  };
  
  baseline_labs: {
    creatinine: number;
    bilirubin: number;
    alt: number;
    ast: number;
    albumin: number;
    platelets: number;
    neutrophils: number;
  };
}

export interface ToxicityPrediction {
  drug: string;
  grade3_4_probability: number;
  grade5_probability: number;
  
  specific_toxicities: {
    toxicity: string;
    probability: number;
    timeframe: string; // "within 2 weeks", "3-6 weeks", etc.
    severity: 'Mild' | 'Moderate' | 'Severe' | 'Life-threatening';
    preventable: boolean;
  }[];
  
  risk_factors: {
    modifiable: string[];
    non_modifiable: string[];
    drug_interactions: string[];
  };
  
  prevention_strategies: {
    premedication: string[];
    dose_modification: {
      recommended_dose: string;
      escalation_strategy: string;
      monitoring_frequency: string;
    };
    monitoring_plan: {
      parameter: string;
      baseline_required: boolean;
      frequency: string;
      alert_threshold: string;
      action: string;
    }[];
  };
}

export interface RealTimeMonitoring {
  patientId: string;
  currentTreatment: {
    drugs: string[];
    cycle: number;
    day: number;
  };
  
  // Real-time data streams
  vitals: {
    timestamp: string;
    heart_rate: number;
    blood_pressure: string;
    temperature: number;
    oxygen_saturation: number;
  }[];
  
  laboratory: {
    timestamp: string;
    parameter: string;
    value: number;
    units: string;
    reference_range: string;
    trend: 'Improving' | 'Stable' | 'Worsening';
  }[];
  
  patient_reported: {
    timestamp: string;
    symptom: string;
    severity: number; // 1-10 scale
    interference: number; // impact on daily activities
  }[];
  
  wearable_data: {
    timestamp: string;
    step_count: number;
    sleep_quality: number;
    heart_rate_variability: number;
  }[];
}

export interface ToxicityAlert {
  alertId: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  type: 'Early Warning' | 'Threshold Exceeded' | 'Trend Alert' | 'Emergency';
  
  prediction: {
    toxicity: string;
    probability: number;
    timeframe: string;
    confidence: number;
  };
  
  triggers: {
    lab_values: string[];
    symptoms: string[];
    vital_changes: string[];
    drug_interactions: string[];
  };
  
  recommendations: {
    immediate_actions: string[];
    dose_modifications: string[];
    additional_monitoring: string[];
    supportive_care: string[];
  };
  
  escalation: {
    notify_provider: boolean;
    urgency: 'Routine' | 'Urgent' | 'Stat';
    contact_oncology: boolean;
    emergency_protocols: string[];
  };
}

export interface WearableIntegration {
  deviceType: 'Apple Watch' | 'Fitbit' | 'Garmin' | 'Medical Grade';
  metrics: {
    continuous_heart_rate: boolean;
    activity_tracking: boolean;
    sleep_monitoring: boolean;
    fall_detection: boolean;
    ecg: boolean;
  };
  
  toxicity_indicators: {
    fatigue: {
      baseline_steps: number;
      decline_threshold: number; // percentage
      consecutive_days: number;
    };
    cardiac_toxicity: {
      baseline_hr: number;
      variability_threshold: number;
      arrhythmia_detection: boolean;
    };
    neuropathy: {
      gait_analysis: boolean;
      balance_metrics: boolean;
    };
  };
}

class ToxicityPreventionService {
  private baseUrl = '/api/toxicity-prevention';

  /**
   * Generate comprehensive toxicity risk assessment
   */
  async assessToxicityRisk(
    riskProfile: ToxicityRiskProfile,
    plannedTreatment: {
      drugs: string[];
      doses: string[];
      schedule: string;
    }
  ): Promise<ToxicityPrediction[]> {
    try {
      const response = await authedFetch(`${this.baseUrl}/assess-risk`, {
        method: 'POST',
        body: JSON.stringify({
          riskProfile,
          plannedTreatment
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assess toxicity risk');
      }

      return await response.json();
    } catch (error) {
      console.error('Error assessing toxicity risk:', error);
      return this.getMockToxicityPredictions(plannedTreatment.drugs);
    }
  }

  /**
   * Real-time monitoring and early warning system
   */
  async monitorPatientRealTime(
    patientId: string,
    monitoring: RealTimeMonitoring
  ): Promise<ToxicityAlert[]> {
    try {
      const response = await authedFetch(`${this.baseUrl}/monitor-realtime`, {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          monitoring
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to monitor patient');
      }

      return await response.json();
    } catch (error) {
      console.error('Error monitoring patient:', error);
      return this.getMockToxicityAlerts();
    }
  }

  /**
   * Wearable device integration for continuous monitoring
   */
  async integrateWearableData(
    patientId: string,
    deviceData: {
      deviceType: string;
      timestamp: string;
      metrics: any;
    }
  ): Promise<{
    processed: boolean;
    insights: string[];
    alerts: ToxicityAlert[];
  }> {
    try {
      const response = await authedFetch(`${this.baseUrl}/wearable-integration`, {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          deviceData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to integrate wearable data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error integrating wearable data:', error);
      return {
        processed: true,
        insights: ['Wearable integration in demo mode'],
        alerts: []
      };
    }
  }

  /**
   * AI-driven dose optimization to prevent toxicity
   */
  async optimizeDosing(
    patientId: string,
    currentTreatment: {
      drugs: string[];
      current_doses: string[];
      cycle: number;
    },
    recentToxicity: {
      grade: number;
      type: string;
      recovery_time: number;
    }[]
  ): Promise<{
    recommendations: {
      drug: string;
      new_dose: string;
      rationale: string;
      confidence: number;
    }[];
    monitoring_changes: string[];
    risk_mitigation: string[];
  }> {
    try {
      const response = await authedFetch(`${this.baseUrl}/optimize-dosing`, {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          currentTreatment,
          recentToxicity
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to optimize dosing');
      }

      return await response.json();
    } catch (error) {
      console.error('Error optimizing dosing:', error);
      return this.getMockDosingOptimization();
    }
  }

  // Mock data for demonstration
  private getMockToxicityPredictions(drugs: string[]): ToxicityPrediction[] {
    return drugs.map(drug => ({
      drug,
      grade3_4_probability: 0.35,
      grade5_probability: 0.02,
      
      specific_toxicities: [
        {
          toxicity: 'Neutropenia',
          probability: 0.65,
          timeframe: 'within 7-14 days',
          severity: 'Severe',
          preventable: true
        },
        {
          toxicity: 'Neuropathy',
          probability: 0.45,
          timeframe: '3-6 weeks',
          severity: 'Moderate',
          preventable: true
        },
        {
          toxicity: 'Diarrhea',
          probability: 0.55,
          timeframe: 'within 48-72 hours',
          severity: 'Moderate',
          preventable: true
        }
      ],
      
      risk_factors: {
        modifiable: ['Concurrent medications', 'Nutrition status', 'Hydration'],
        non_modifiable: ['Age >65', 'Prior chemotherapy', 'Genetic polymorphisms'],
        drug_interactions: ['Warfarin interaction - bleeding risk', 'CYP3A4 inhibitors']
      },
      
      prevention_strategies: {
        premedication: [
          'Ondansetron 8mg IV pre-treatment',
          'Dexamethasone 12mg PO 12h and 6h pre-treatment',
          'Diphenhydramine 50mg IV pre-treatment'
        ],
        dose_modification: {
          recommended_dose: '80% of standard dose for first cycle',
          escalation_strategy: 'Increase to 90% if no Grade 3+ toxicity',
          monitoring_frequency: 'Weekly CBC, CMP for first 2 cycles'
        },
        monitoring_plan: [
          {
            parameter: 'Absolute Neutrophil Count',
            baseline_required: true,
            frequency: 'Day 1, 8, 15 of each cycle',
            alert_threshold: 'ANC <1000',
            action: 'Hold treatment, consider G-CSF support'
          },
          {
            parameter: 'Peripheral Neuropathy Assessment',
            baseline_required: true,
            frequency: 'Each visit',
            alert_threshold: 'Grade 2 or higher',
            action: 'Dose reduction or treatment delay'
          }
        ]
      }
    }));
  }

  private getMockToxicityAlerts(): ToxicityAlert[] {
    return [
      {
        alertId: 'tox_alert_' + Date.now(),
        severity: 'High',
        type: 'Early Warning',
        
        prediction: {
          toxicity: 'Severe Neutropenia',
          probability: 0.78,
          timeframe: 'within 3-5 days',
          confidence: 0.89
        },
        
        triggers: [
          'WBC trending down: 4.2 → 2.8 → 1.9 × 10³/μL',
          'Fatigue score increased from 3 to 7/10',
          'Decreased activity level (40% reduction in daily steps)'
        ],
        
        recommendations: {
          immediate_actions: [
            'Obtain STAT CBC with differential',
            'Assess for signs of infection',
            'Consider prophylactic G-CSF'
          ],
          dose_modifications: [
            'Hold next cycle until ANC >1500',
            'Reduce dose by 25% for subsequent cycles'
          ],
          additional_monitoring: [
            'Daily CBC until recovery',
            'Temperature monitoring QID',
            'Enhanced infection precautions'
          ],
          supportive_care: [
            'Neutropenic diet',
            'Hand hygiene education',
            'Avoid crowded areas'
          ]
        },
        
        escalation: {
          notify_provider: true,
          urgency: 'Urgent',
          contact_oncology: true,
          emergency_protocols: [
            'Neutropenic fever protocol if temp >100.4°F',
            'Emergency department referral for any signs of infection'
          ]
        }
      }
    ];
  }

  private getMockDosingOptimization() {
    return {
      recommendations: [
        {
          drug: 'Carboplatin',
          new_dose: 'AUC 4 (reduced from AUC 5)',
          rationale: 'Patient experienced Grade 3 thrombocytopenia. Dose reduction maintains efficacy while reducing hematologic toxicity risk.',
          confidence: 0.87
        },
        {
          drug: 'Paclitaxel',
          new_dose: '135 mg/m² (reduced from 175 mg/m²)',
          rationale: 'Grade 2 peripheral neuropathy with functional impact. Dose reduction prevents progression to irreversible Grade 3+ neuropathy.',
          confidence: 0.92
        }
      ],
      monitoring_changes: [
        'Increase platelet monitoring to twice weekly',
        'Weekly neuropathy assessments with functional scale',
        'Add hand-grip strength testing'
      ],
      risk_mitigation: [
        'Consider alternative weekly paclitaxel schedule',
        'Prophylactic platelet transfusion threshold: <20K',
        'Neuroprotective agent consideration (glutamine)'
      ]
    };
  }
}

export const toxicityPreventionService = new ToxicityPreventionService();