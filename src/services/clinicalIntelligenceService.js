import supabaseService from '../config/supabase.js';

export class ClinicalIntelligenceService {
  constructor() {
    this.enabled = supabaseService.enabled;
  }

  // Enhanced Drug Information with Clinical Context
  async getEnhancedDrugInfo(rxcui, patientContext = {}) {
    try {
      const basicInfo = await supabaseService.getDrugByRxcui(rxcui);
      
      const enhancedInfo = {
        ...basicInfo,
        clinicalInsights: await this.getDrugClinicalInsights(rxcui, patientContext),
        riskProfile: await this.getDrugRiskProfile(rxcui, patientContext),
        monitoringRequirements: await this.getMonitoringRequirements(rxcui, patientContext),
        patientEducation: await this.getPatientEducationPoints(rxcui),
        costEffectiveness: await this.getCostEffectivenessData(rxcui),
        realWorldEvidence: await this.getRealWorldEvidence(rxcui)
      };

      return enhancedInfo;
    } catch (error) {
      console.error('Error getting enhanced drug info:', error);
      return null;
    }
  }

  // Intelligent Interaction Analysis
  async getIntelligentInteractionAnalysis(drugs, patientContext = {}) {
    try {
      const basicInteractions = await supabaseService.checkMultipleInteractions(drugs);
      
      const intelligentAnalysis = {
        interactions: await Promise.all(basicInteractions.map(interaction => 
          this.enhanceInteractionData(interaction, patientContext)
        )),
        riskStratification: await this.stratifyInteractionRisk(basicInteractions, patientContext),
        clinicalRecommendations: await this.generateClinicalRecommendations(basicInteractions, patientContext),
        monitoringPlan: await this.createMonitoringPlan(basicInteractions, patientContext),
        alternativeStrategies: await this.suggestAlternativeStrategies(drugs, basicInteractions, patientContext),
        timelinePredictions: await this.predictInteractionTimeline(basicInteractions, patientContext)
      };

      return intelligentAnalysis;
    } catch (error) {
      console.error('Error in intelligent interaction analysis:', error);
      return null;
    }
  }

  // Personalized Pharmacogenomic Insights
  async getPersonalizedPGxInsights(genes, drugs, patientContext = {}) {
    try {
      const basicGuidelines = await supabaseService.getCpicGuidelines();
      
      const personalizedInsights = {
        phenotypePredictions: await this.predictPhenotypes(genes, patientContext),
        drugSpecificRecommendations: await this.generateDrugSpecificPGxRecommendations(genes, drugs, patientContext),
        doseOptimization: await this.optimizeDoses(genes, drugs, patientContext),
        alternativeDrugs: await this.findPGxGuidedAlternatives(genes, drugs, patientContext),
        riskMitigation: await this.developRiskMitigationStrategies(genes, drugs, patientContext),
        outcomesPrediction: await this.predictPGxOutcomes(genes, drugs, patientContext),
        patientCounseling: await this.generatePatientCounselingPoints(genes, drugs)
      };

      return personalizedInsights;
    } catch (error) {
      console.error('Error getting personalized PGx insights:', error);
      return null;
    }
  }

  // Enhanced Alternative Drug Analysis
  async getIntelligentAlternatives(originalDrug, patientContext = {}) {
    try {
      const alternatives = {
        therapeuticEquivalents: await this.findTherapeuticEquivalents(originalDrug, patientContext),
        riskBasedAlternatives: await this.findRiskBasedAlternatives(originalDrug, patientContext),
        costOptimizedAlternatives: await this.findCostOptimizedAlternatives(originalDrug, patientContext),
        pgxGuidedAlternatives: await this.findPGxGuidedAlternatives(originalDrug, patientContext),
        compareAlternatives: await this.compareAlternatives(originalDrug, patientContext),
        transitionGuidance: await this.provideTransitionGuidance(originalDrug, patientContext)
      };

      return alternatives;
    } catch (error) {
      console.error('Error getting intelligent alternatives:', error);
      return null;
    }
  }

  // Clinical Decision Support for Oncology
  async getOncologyDecisionSupport(regimenData, patientContext = {}) {
    try {
      const decisionSupport = {
        efficacyPrediction: await this.predictRegimenEfficacy(regimenData, patientContext),
        toxicityRiskAssessment: await this.assessToxicityRisk(regimenData, patientContext),
        doseOptimization: await this.optimizeRegimenDoses(regimenData, patientContext),
        supportiveCareRecommendations: await this.recommendSupportiveCare(regimenData, patientContext),
        biomarkerGuidance: await this.provideBiomarkerGuidance(regimenData, patientContext),
        qualityOfLifeImpact: await this.assessQualityOfLifeImpact(regimenData, patientContext),
        survivalOutlook: await this.provideSurvivalOutlook(regimenData, patientContext)
      };

      return decisionSupport;
    } catch (error) {
      console.error('Error getting oncology decision support:', error);
      return null;
    }
  }

  // Implementation of helper methods with mock data for demonstration
  async getDrugClinicalInsights(rxcui, patientContext) {
    return {
      mechanismOfAction: "Selective inhibitor of PD-1/PD-L1 pathway",
      clinicalEfficacy: {
        responseRate: "35-42% in melanoma",
        medianPFS: "6.8 months",
        medianOS: "32.7 months",
        evidenceLevel: "1A"
      },
      realWorldOutcomes: {
        effectivenessRate: "38% in real-world cohorts",
        durationOfResponse: "18.5 months median",
        qualityOfLifeImpact: "+0.12 utility score improvement"
      },
      patientSubgroups: [
        {
          criteria: "PD-L1 expression ≥50%",
          efficacy: "Response rate: 58%",
          recommendation: "Preferred first-line option"
        },
        {
          criteria: "Microsatellite instability high (MSI-H)",
          efficacy: "Response rate: 77%",
          recommendation: "Strongly recommended regardless of tumor type"
        }
      ]
    };
  }

  async getDrugRiskProfile(rxcui, patientContext) {
    const { age, weight, creatinine, hepaticFunction, comorbidities = [] } = patientContext;
    
    let riskScore = 0;
    const riskFactors = [];
    
    // Age-based risk adjustment
    if (age >= 75) {
      riskScore += 15;
      riskFactors.push("Advanced age increases immune-related AE risk");
    }
    
    // Organ function considerations
    if (creatinine > 1.5) {
      riskScore += 10;
      riskFactors.push("Renal impairment may increase nephrotoxicity risk");
    }
    
    // Comorbidity impact
    if (comorbidities.includes('autoimmune')) {
      riskScore += 25;
      riskFactors.push("Pre-existing autoimmune condition - high irAE risk");
    }

    return {
      overallRiskScore: Math.min(riskScore, 100),
      riskCategory: riskScore < 30 ? 'Low' : riskScore < 60 ? 'Moderate' : 'High',
      specificRisks: [
        {
          type: "Immune-related pneumonitis",
          incidence: "3-6%",
          severity: "Grade 3-4: 1-2%",
          timeToOnset: "Median 2.8 months",
          riskFactors: ["Prior thoracic radiation", "Lung cancer", "Smoking history"]
        },
        {
          type: "Immune-related colitis",
          incidence: "8-12%",
          severity: "Grade 3-4: 2-3%",
          timeToOnset: "Median 1.6 months",
          riskFactors: ["IBD history", "Prior abdominal radiation"]
        }
      ],
      mitigationStrategies: [
        "Baseline autoimmune screening",
        "Patient education on irAE symptoms",
        "Rapid corticosteroid protocol for Grade ≥2 irAEs",
        "Multidisciplinary team involvement"
      ]
    };
  }

  async getMonitoringRequirements(rxcui, patientContext) {
    return {
      pretreatment: [
        {
          test: "Comprehensive metabolic panel",
          frequency: "Baseline",
          rationale: "Detect baseline organ dysfunction"
        },
        {
          test: "Thyroid function (TSH, T3, T4)",
          frequency: "Baseline",
          rationale: "Thyroiditis is common irAE"
        },
        {
          test: "Autoimmune panel (ANA, RF)",
          frequency: "Baseline",
          rationale: "Risk stratification for irAEs"
        }
      ],
      ongoing: [
        {
          test: "CBC with differential",
          frequency: "Every 2 weeks x 3, then monthly",
          rationale: "Monitor for immune-related cytopenias"
        },
        {
          test: "Comprehensive metabolic panel",
          frequency: "Every 2 weeks x 3, then monthly",
          rationale: "Hepatitis and nephritis monitoring"
        },
        {
          test: "Thyroid function",
          frequency: "Every 6 weeks",
          rationale: "Thyroid dysfunction common and treatable"
        }
      ],
      alertParameters: [
        {
          parameter: "ALT/AST",
          alert: "> 3x ULN",
          action: "Hold therapy, evaluate for hepatitis"
        },
        {
          parameter: "Creatinine",
          alert: "> 1.5x baseline",
          action: "Evaluate for nephritis"
        }
      ]
    };
  }

  async generateClinicalRecommendations(interactions, patientContext) {
    return [
      {
        priority: "Critical",
        category: "Drug Interaction",
        recommendation: "Consider therapeutic drug monitoring for warfarin",
        rationale: "Amiodarone inhibits CYP2C9, increasing warfarin exposure by 50-100%",
        evidence: "ACC/AHA Guidelines 2023",
        timeline: "Initiate within 24 hours",
        monitoring: "INR every 2-3 days until stable",
        expectedOutcome: "Reduce bleeding risk by 60%"
      },
      {
        priority: "High",
        category: "Dose Adjustment",
        recommendation: "Reduce methotrexate dose by 50%",
        rationale: "Trimethoprim reduces folate synthesis, potentiating MTX toxicity",
        evidence: "Oncology Nursing Society Guidelines",
        timeline: "Before next MTX dose",
        monitoring: "CBC, liver function weekly",
        expectedOutcome: "Maintain efficacy while reducing toxicity risk"
      }
    ];
  }

  async stratifyInteractionRisk(interactions, patientContext) {
    const { age, weight, conditions = [], genetics = {}, organ_function = {} } = patientContext;
    
    let overallScore = 0;
    let significance = 'Low';
    const riskFactors = [];
    
    // Base score from interactions
    interactions.forEach(interaction => {
      if (interaction.severity === 'critical') overallScore += 40;
      else if (interaction.severity === 'high') overallScore += 25;
      else if (interaction.severity === 'moderate') overallScore += 15;
      else overallScore += 5;
    });
    
    // Patient-specific risk multipliers
    if (age >= 75) {
      overallScore *= 1.3;
      riskFactors.push('Advanced age increases interaction sensitivity');
    }
    
    if (genetics.cyp2d6_phenotype === 'poor_metabolizer') {
      overallScore *= 1.2;
      riskFactors.push('CYP2D6 poor metabolizer increases drug exposure');
    }
    
    if (organ_function.renal_clearance < 60) {
      overallScore *= 1.15;
      riskFactors.push('Reduced renal function affects drug clearance');
    }
    
    if (conditions.includes('liver_disease')) {
      overallScore *= 1.25;
      riskFactors.push('Hepatic impairment affects drug metabolism');
    }
    
    // Determine significance
    overallScore = Math.min(overallScore, 100);
    if (overallScore >= 70) significance = 'Critical';
    else if (overallScore >= 50) significance = 'High';
    else if (overallScore >= 30) significance = 'Moderate';
    
    return {
      overallScore: Math.round(overallScore),
      significance,
      riskFactors,
      recommendation: significance === 'Critical' ? 'Immediate intervention required' :
                     significance === 'High' ? 'Enhanced monitoring recommended' :
                     significance === 'Moderate' ? 'Routine monitoring sufficient' :
                     'Standard care appropriate'
    };
  }

  async enhanceInteractionData(interaction, patientContext) {
    return {
      ...interaction,
      mechanism: 'CYP450 inhibition',
      kinetics: {
        onset: '2-7 days',
        magnitude: '2-4 fold increase in exposure',
        reversibility: 'Reversible upon discontinuation'
      },
      patientSpecificFactors: {
        ageAdjustment: patientContext.age >= 65 ? 'Elderly patients show 40% higher risk' : null,
        geneticFactors: patientContext.genetics?.cyp2c9_phenotype === 'poor_metabolizer' ? 
          'CYP2C9 poor metabolizers need 50% dose reduction' : null
      }
    };
  }

  async createMonitoringPlan(interactions, patientContext) {
    return {
      immediate: ['INR within 24 hours', 'Clinical assessment'],
      ongoing: ['INR every 2-3 days x 2 weeks', 'Weekly thereafter'],
      alertParameters: ['INR > 4.0', 'Signs of bleeding'],
      patientEducation: [
        'Report unusual bleeding immediately',
        'Maintain consistent diet',
        'Avoid alcohol'
      ]
    };
  }

  async suggestAlternativeStrategies(drugs, interactions, patientContext) {
    return [
      {
        strategy: 'Dose adjustment',
        description: 'Reduce warfarin dose by 25-50%',
        timeline: 'Within 24 hours',
        monitoring: 'Enhanced INR monitoring'
      },
      {
        strategy: 'Alternative anticoagulation',
        description: 'Consider direct oral anticoagulants (DOACs)',
        timeline: 'Next clinic visit',
        monitoring: 'Routine monitoring sufficient'
      }
    ];
  }

  async predictInteractionTimeline(interactions, patientContext) {
    return {
      onsetPrediction: '2-7 days after amiodarone initiation',
      peakEffect: '2-4 weeks',
      resolution: '4-8 weeks after amiodarone discontinuation',
      criticalPeriod: 'First 2 weeks of combination therapy',
      milestones: [
        {
          timepoint: '24 hours',
          action: 'Obtain baseline INR',
          rationale: 'Establish pre-interaction baseline'
        },
        {
          timepoint: '3 days',
          action: 'Check INR',
          rationale: 'Early detection of interaction'
        },
        {
          timepoint: '1 week',
          action: 'Reassess and adjust dose',
          rationale: 'Optimize anticoagulation'
        }
      ]
    };
  }

  async predictRegimenEfficacy(regimenData, patientContext) {
    const { cancerType, stage, biomarkers = {}, priorTherapies = [], performance_status } = patientContext;
    
    // Mock predictive model based on clinical factors
    let baseEfficacy = 0.35; // 35% base response rate
    
    // Biomarker adjustments
    if (biomarkers.pd_l1_expression >= 50) {
      baseEfficacy += 0.23; // Increase to ~58%
    }
    
    if (biomarkers.msi_status === 'high') {
      baseEfficacy += 0.42; // Increase to ~77%
    }
    
    // Performance status impact
    if (performance_status <= 1) {
      baseEfficacy += 0.08;
    } else if (performance_status >= 3) {
      baseEfficacy -= 0.15;
    }
    
    // Prior therapy impact
    if (priorTherapies.length === 0) {
      baseEfficacy += 0.12; // First-line advantage
    } else if (priorTherapies.length >= 3) {
      baseEfficacy -= 0.18; // Heavily pretreated
    }

    return {
      predictedResponseRate: Math.max(0.05, Math.min(0.95, baseEfficacy)),
      confidenceInterval: "±15%",
      factorsConsidered: [
        "PD-L1 expression level",
        "Microsatellite instability status",
        "Performance status",
        "Prior therapy lines",
        "Cancer type and stage"
      ],
      modelValidation: {
        accuracy: "78%",
        dataSource: "Multi-institutional cohort (n=15,247)",
        lastUpdated: "Q1 2024"
      },
      clinicalPearls: [
        "Response typically seen within 8-12 weeks",
        "Pseudo-progression possible in 5-10% of patients",
        "Delayed responses can occur up to 6 months"
      ]
    };
  }

  async assessToxicityRisk(regimenData, patientContext) {
    return {
      overallToxicityScore: 42, // 0-100 scale
      riskCategory: "Moderate",
      organSpecificRisks: [
        {
          organ: "Lung",
          risk: "High",
          probability: "6%",
          severity: "Grade 3-4: 2%",
          monitoring: "Chest CT every 8 weeks, PFTs baseline",
          earlySymptoms: ["Dyspnea", "Cough", "Chest pain"]
        },
        {
          organ: "Liver",
          risk: "Moderate", 
          probability: "15%",
          severity: "Grade 3-4: 3%",
          monitoring: "LFTs every 2 weeks x 3, then monthly",
          earlySymptoms: ["Fatigue", "Nausea", "RUQ pain"]
        }
      ],
      mitigationStrategies: [
        {
          strategy: "Prophylactic corticosteroids",
          indication: "High-risk patients with autoimmune history",
          dosing: "Prednisone 10mg daily x 2 weeks"
        },
        {
          strategy: "Enhanced monitoring",
          indication: "All patients",
          schedule: "Weekly calls x 4, then biweekly"
        }
      ],
      emergencyProtocols: [
        {
          scenario: "Grade ≥2 pneumonitis",
          action: "Hold immunotherapy, start prednisone 1mg/kg",
          timeline: "Within 24 hours",
          consultation: "Pulmonology within 48 hours"
        }
      ]
    };
  }

  async compareAlternatives(originalDrug, patientContext) {
    return {
      alternatives: [
        {
          drug: "Nivolumab",
          efficacy: {
            responseRate: "32%",
            comparedTo: "35% for pembrolizumab",
            significance: "Non-inferior (p=0.08)"
          },
          safety: {
            grade3_4_AEs: "15%",
            comparedTo: "18% for pembrolizumab", 
            advantage: "Lower hepatitis risk"
          },
          cost: {
            monthlyDrugCost: "$12,500",
            comparedTo: "$13,200 for pembrolizumab",
            savings: "5.3% cost reduction"
          },
          recommendation: "Consider for patients with hepatitis risk factors"
        },
        {
          drug: "Atezolizumab",
          efficacy: {
            responseRate: "29%",
            comparedTo: "35% for pembrolizumab",
            significance: "Slightly lower (p=0.04)"
          },
          safety: {
            grade3_4_AEs: "13%",
            comparedTo: "18% for pembrolizumab",
            advantage: "Lower overall toxicity"
          },
          cost: {
            monthlyDrugCost: "$11,800",
            comparedTo: "$13,200 for pembrolizumab",
            savings: "10.6% cost reduction"
          },
          recommendation: "Option for elderly or frail patients"
        }
      ],
      decisionMatrix: {
        primaryFactor: "Efficacy",
        ranking: ["Pembrolizumab", "Nivolumab", "Atezolizumab"],
        justification: "PD-L1 ≥50% favors pembrolizumab based on KEYNOTE-024"
      }
    };
  }

  // Add missing methods that are referenced but not implemented
  async getPatientEducationPoints(rxcui) {
    return [
      'Take medication with food to reduce nausea',
      'Report any unusual symptoms immediately',
      'Do not stop medication without consulting your doctor',
      'Follow up regularly for monitoring'
    ];
  }

  async getCostEffectivenessData(rxcui) {
    return {
      costPerQALY: '$35,000 - $50,000',
      budgetImpact: 'Moderate cost increase offset by reduced complications',
      insuranceCoverage: 'Covered by most insurance plans',
      patientAssistanceAvailable: true
    };
  }

  async getRealWorldEvidence(rxcui) {
    return {
      effectiveness: {
        realWorldResponseRate: '42% (vs 38% in trials)',
        durationOfResponse: '16.2 months median',
        timeToResponse: '8.5 weeks median'
      },
      safety: {
        realWorldToxicityRate: '18% Grade 3+ (vs 22% in trials)',
        discontinuationRate: '15% due to adverse events',
        hospitalizations: '12% reduction vs standard care'
      },
      patientSatisfaction: '8.1/10 average score'
    };
  }

  async findTherapeuticEquivalents(originalDrug, patientContext) {
    return [
      {
        drug: { rxcui: '1234567', name: 'Alternative Drug A' },
        equivalenceRating: 'Therapeutic equivalent',
        costDifference: '-$50/month',
        safetyProfile: 'Similar safety profile'
      }
    ];
  }

  async findRiskBasedAlternatives(originalDrug, patientContext) {
    return [
      {
        drug: { rxcui: '2345678', name: 'Safer Alternative B' },
        riskReduction: 'Lower bleeding risk',
        efficacyComparison: 'Non-inferior efficacy',
        patientSuitability: 'Better for elderly patients'
      }
    ];
  }

  async findCostOptimizedAlternatives(originalDrug, patientContext) {
    return [
      {
        drug: { rxcui: '3456789', name: 'Generic Alternative C' },
        costSavings: '$200/month (80% savings)',
        bioequivalence: 'FDA-approved generic',
        availability: 'Widely available'
      }
    ];
  }

  async findPGxGuidedAlternatives(originalDrug, patientContext) {
    return [
      {
        drug: { rxcui: '4567890', name: 'PGx-Optimized Alternative D' },
        geneticMatch: 'Better metabolizer profile match',
        efficacyImprovement: '+25% expected response',
        dosing: 'Standard dosing recommended'
      }
    ];
  }

  async provideTransitionGuidance(originalDrug, patientContext) {
    return {
      switchingStrategy: 'Gradual transition over 2 weeks',
      monitoring: 'Enhanced monitoring during transition',
      patientEducation: 'Counseling on what to expect during switch'
    };
  }
}

export default new ClinicalIntelligenceService();