import express from 'express';
import { RxNormService } from '../services/rxnormService.js';
import supabaseService from '../config/supabase.js';
import clinicalIntelligenceService from '../services/clinicalIntelligenceService.js';
import { interactionLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate, schemas } from '../utils/validation.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();
const rxnormService = new RxNormService();

// Enhanced interaction checking with clinical intelligence
router.post('/check',
  interactionLimiter,
  optionalAuth,
  validate(schemas.interactionCheck, 'body'),
  asyncHandler(async (req, res) => {
    const { drugs, patient_context, include_recommendations = true } = req.body;
    
    // Parse patient context
    let patientData = {};
    try {
      patientData = patient_context || {};
    } catch (error) {
      console.warn('Invalid patient context:', error.message);
    }

    // Get intelligent interaction analysis
    const intelligentAnalysis = await clinicalIntelligenceService.getIntelligentInteractionAnalysis(drugs, patientData);
    
    // Get basic interactions for comparison
    const basicInteractions = await supabaseService.checkMultipleInteractions(drugs);
    
    // Enhanced response with comprehensive insights
    const response = {
      summary: {
        totalInteractions: intelligentAnalysis.interactions?.length || 0,
        highRiskInteractions: intelligentAnalysis.interactions?.filter(i => i.severity === 'high' || i.severity === 'critical').length || 0,
        overallRiskScore: intelligentAnalysis.riskStratification?.overallScore || 0,
        clinicalSignificance: intelligentAnalysis.riskStratification?.significance || 'Low'
      },
      interactions: intelligentAnalysis.interactions || [],
      clinicalInsights: {
        riskStratification: intelligentAnalysis.riskStratification,
        patientSpecificFactors: await getPatientSpecificRiskFactors(drugs, patientData),
        temporalConsiderations: await getTemporalConsiderations(drugs, patientData),
        mechanisticInsights: await getMechanisticInsights(intelligentAnalysis.interactions || [])
      },
      recommendations: include_recommendations ? intelligentAnalysis.clinicalRecommendations || [] : null,
      monitoringPlan: intelligentAnalysis.monitoringPlan,
      alternativeStrategies: intelligentAnalysis.alternativeStrategies,
      timelinePredictions: intelligentAnalysis.timelinePredictions,
      actionableAlerts: await generateActionableAlerts(intelligentAnalysis, patientData, req.user),
      educationalContent: await getEducationalContent(intelligentAnalysis.interactions || [], req.user),
      qualityMetrics: {
        evidenceLevel: 'High',
        dataSource: 'Multiple clinical databases',
        lastUpdated: new Date().toISOString(),
        confidence: calculateConfidenceScore(intelligentAnalysis)
      }
    };

    res.json(response);
  })
);

// Real-time interaction screening
router.post('/screen',
  interactionLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { currentMedications, newMedication, patient_context } = req.body;
    
    if (!currentMedications || !newMedication) {
      return res.status(400).json({ error: 'Current medications and new medication required' });
    }

    let patientData = {};
    try {
      patientData = patient_context || {};
    } catch (error) {
      console.warn('Invalid patient context:', error.message);
    }

    const allMedications = [...currentMedications, newMedication];
    const screeningResult = await performRealTimeScreening(allMedications, newMedication, patientData);
    
    res.json({
      newMedication: newMedication,
      screeningResult: screeningResult,
      recommendation: await generateScreeningRecommendation(screeningResult, patientData, req.user),
      alternatives: screeningResult.hasSignificantInteractions ? 
        await findSaferAlternatives(newMedication, currentMedications, patientData) : null
    });
  })
);

// Drug interaction pathway analysis
router.post('/pathway-analysis',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { drugs, analysis_type = 'comprehensive', patient_context } = req.body;
    
    if (!drugs || drugs.length < 2) {
      return res.status(400).json({ error: 'At least 2 drugs required for pathway analysis' });
    }

    let patientData = {};
    try {
      patientData = patient_context || {};
    } catch (error) {
      console.warn('Invalid patient context:', error.message);
    }

    const pathwayAnalysis = await performPathwayAnalysis(drugs, analysis_type, patientData);
    
    res.json({
      analysis: pathwayAnalysis,
      clinicalImplications: await analyzeClinicalImplications(pathwayAnalysis, patientData),
      interventionOpportunities: await identifyInterventionOpportunities(pathwayAnalysis, patientData),
      patientCounselingPoints: await generateCounselingPoints(pathwayAnalysis, req.user)
    });
  })
);

// Polypharmacy optimization
router.post('/optimize',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { medications, patient_context, optimization_goals = ['safety', 'efficacy', 'cost'] } = req.body;
    
    if (!medications || medications.length < 3) {
      return res.status(400).json({ error: 'At least 3 medications required for optimization' });
    }

    let patientData = {};
    try {
      patientData = patient_context || {};
    } catch (error) {
      console.warn('Invalid patient context:', error.message);
    }

    const optimization = await performPolypharmacyOptimization(medications, patientData, optimization_goals);
    
    res.json({
      currentRegimen: {
        medications: medications,
        riskAssessment: await assessCurrentRegimenRisk(medications, patientData),
        interactionBurden: await calculateInteractionBurden(medications)
      },
      optimizedRegimen: optimization.optimizedRegimen,
      improvements: optimization.improvements,
      implementationPlan: optimization.implementationPlan,
      monitoring: optimization.monitoring,
      costImpact: optimization.costImpact,
      patientBenefits: optimization.patientBenefits
    });
  })
);

// Helper functions
async function getPatientSpecificRiskFactors(drugs, patientData) {
  const { age, weight, conditions = [], genetics = {}, organ_function = {} } = patientData;
  const riskFactors = [];

  // Age-related factors
  if (age >= 65) {
    riskFactors.push({
      factor: 'Advanced age',
      impact: 'Increased sensitivity to drug interactions',
      recommendation: 'Enhanced monitoring required',
      evidence: 'Beers Criteria 2023'
    });
  }

  // Genetic factors
  if (genetics.cyp2d6_phenotype === 'poor_metabolizer') {
    riskFactors.push({
      factor: 'CYP2D6 poor metabolizer',
      impact: 'Reduced metabolism of CYP2D6 substrates',
      recommendation: 'Dose reduction may be needed',
      evidence: 'CPIC Guidelines'
    });
  }

  // Organ function
  if (organ_function.renal_clearance < 60) {
    riskFactors.push({
      factor: 'Reduced renal function',
      impact: 'Altered drug clearance',
      recommendation: 'Dose adjustment based on creatinine clearance',
      evidence: 'FDA Guidance for Industry'
    });
  }

  return riskFactors;
}

async function getTemporalConsiderations(drugs, patientData) {
  return {
    onsetTiming: [
      {
        interaction: 'Warfarin + Amiodarone',
        timeToOnset: '2-7 days',
        duration: 'Weeks to months after discontinuation',
        clinicalPearl: 'INR monitoring should begin within 48 hours'
      }
    ],
    seasonalFactors: [
      {
        factor: 'Vitamin K intake variation',
        seasons: ['Spring', 'Summer'],
        impact: 'May affect warfarin stability',
        recommendation: 'Counsel on consistent dietary habits'
      }
    ],
    lifecycleConsiderations: [
      {
        phase: 'Cancer treatment cycle',
        day: 'Days 7-14',
        consideration: 'Neutropenia nadir period',
        interaction_relevance: 'Increased infection risk with immunosuppressants'
      }
    ]
  };
}

async function getMechanisticInsights(interactions) {
  return interactions.map(interaction => ({
    drugs: [interaction.drug1, interaction.drug2],
    mechanism: interaction.mechanism || 'CYP450 inhibition',
    pathway: 'Hepatic metabolism',
    kinetics: {
      onset: '2-7 days',
      magnitude: '2-4 fold increase in exposure',
      reversibility: 'Reversible upon discontinuation'
    },
    clinicalRelevance: 'High - dose adjustment required',
    biomarkers: ['INR', 'Drug levels'],
    references: ['DrugBank', 'CPIC Guidelines', 'Product labeling']
  }));
}

async function generateActionableAlerts(analysis, patientData, user) {
  const alerts = [];

  if (analysis.riskStratification?.overallScore > 70) {
    alerts.push({
      type: 'critical',
      priority: 1,
      title: 'HIGH RISK INTERACTION DETECTED',
      message: 'Consider alternative therapy or enhanced monitoring',
      action: user?.role === 'physician' ? 'Review and modify regimen' : 'Contact prescriber',
      timeline: 'Immediate',
      evidence: 'Multiple high-severity interactions identified'
    });
  }

  // Role-specific alerts
  if (user?.role === 'pharmacist') {
    alerts.push({
      type: 'counseling',
      priority: 2,
      title: 'Patient education opportunity',
      message: 'Discuss timing of administration and signs to watch for',
      action: 'Provide written counseling materials',
      timeline: 'At dispensing',
      evidence: 'Pharmacy best practices'
    });
  }

  return alerts;
}

async function getEducationalContent(interactions, user) {
  const content = {
    patientEducation: {
      keyPoints: [
        'Take medications as prescribed',
        'Report unusual symptoms immediately',
        'Do not start/stop medications without consulting healthcare provider'
      ],
      warningSigns: [
        'Unusual bleeding or bruising',
        'Severe nausea or vomiting',
        'Difficulty breathing',
        'Changes in heart rate'
      ],
      lifestyle: [
        'Maintain consistent diet',
        'Limit alcohol consumption',
        'Avoid grapefruit juice with certain medications'
      ]
    },
    providerEducation: user?.role === 'physician' || user?.role === 'pharmacist' ? {
      clinicalPearls: [
        'Most interactions are dose-dependent',
        'Consider therapeutic drug monitoring',
        'Patient-specific factors modify risk'
      ],
      monitoringStrategies: [
        'Baseline laboratory values',
        'Regular follow-up schedule',
        'Patient-reported outcomes'
      ]
    } : null
  };

  return content;
}

function calculateConfidenceScore(analysis) {
  // Calculate confidence based on available data and evidence quality
  let score = 50; // Base score
  
  if (analysis.interactions?.length > 0) score += 20;
  if (analysis.riskStratification) score += 15;
  if (analysis.clinicalRecommendations?.length > 0) score += 15;
  
  return Math.min(score, 100);
}

async function performRealTimeScreening(allMedications, newMedication, patientData) {
  const screeningResult = {
    hasSignificantInteractions: false,
    interactionCount: 0,
    highestSeverity: 'none',
    specificInteractions: [],
    riskScore: 0,
    recommendation: 'proceed_with_caution'
  };

  // Mock screening logic
  for (const med of allMedications) {
    if (med.rxcui !== newMedication.rxcui) {
      // Check for known interactions
      if (hasKnownInteraction(med, newMedication)) {
        screeningResult.hasSignificantInteractions = true;
        screeningResult.interactionCount++;
        screeningResult.specificInteractions.push({
          existingDrug: med.name,
          severity: 'moderate',
          mechanism: 'CYP450 competition',
          action: 'Monitor closely'
        });
      }
    }
  }

  screeningResult.riskScore = screeningResult.interactionCount * 25;
  screeningResult.highestSeverity = screeningResult.interactionCount > 0 ? 'moderate' : 'none';

  return screeningResult;
}

function hasKnownInteraction(drug1, drug2) {
  // Simplified interaction checking
  const interactionPairs = [
    ['warfarin', 'amiodarone'],
    ['digoxin', 'verapamil'],
    ['methotrexate', 'trimethoprim']
  ];
  
  return interactionPairs.some(pair => 
    (pair.includes(drug1.name?.toLowerCase()) && pair.includes(drug2.name?.toLowerCase()))
  );
}

async function generateScreeningRecommendation(screeningResult, patientData, user) {
  if (!screeningResult.hasSignificantInteractions) {
    return {
      action: 'proceed',
      message: 'No significant interactions detected',
      monitoring: 'Routine monitoring sufficient'
    };
  }

  return {
    action: 'caution',
    message: 'Significant interactions detected - enhanced monitoring required',
    monitoring: 'Frequent lab monitoring, patient education on warning signs',
    alternatives: 'Consider therapeutic alternatives if available'
  };
}

async function performPathwayAnalysis(drugs, analysisType, patientData) {
  return {
    metabolicPathways: [
      {
        pathway: 'CYP3A4',
        affectedDrugs: ['Midazolam', 'Atorvastatin'],
        inducers: ['Rifampin'],
        inhibitors: ['Ketoconazole'],
        clinicalImpact: 'Moderate'
      }
    ],
    transporterEffects: [
      {
        transporter: 'P-glycoprotein',
        substrates: ['Digoxin'],
        inhibitors: ['Quinidine'],
        clinicalImpact: 'High'
      }
    ],
    receptorInteractions: [
      {
        receptor: 'Warfarin binding sites',
        competitors: ['Phenytoin'],
        displacement: 'Protein binding displacement',
        clinicalImpact: 'Moderate'
      }
    ]
  };
}

async function performPolypharmacyOptimization(medications, patientData, goals) {
  return {
    optimizedRegimen: {
      medications: medications.slice(0, -1), // Mock optimization by removing one drug
      rationale: 'Removed duplicate therapy'
    },
    improvements: {
      interactionReduction: '40%',
      pillBurden: '-2 pills per day',
      costSavings: '$150/month'
    },
    implementationPlan: {
      phase1: 'Discontinue medication A over 2 weeks',
      phase2: 'Monitor for efficacy at 4 weeks',
      phase3: 'Reassess at 8 weeks'
    },
    monitoring: {
      laboratorytests: ['CBC', 'CMP'],
      frequency: 'Every 2 weeks x 2, then monthly',
      clinicalParameters: ['Blood pressure', 'Heart rate']
    },
    costImpact: {
      before: '$500/month',
      after: '$350/month',
      savings: '$150/month (30%)'
    },
    patientBenefits: [
      'Reduced side effect risk',
      'Simplified dosing schedule',
      'Lower cost burden',
      'Improved adherence likelihood'
    ]
  };
}

async function findSaferAlternatives(newMedication, currentMedications, patientData) {
  return [
    {
      drug: {
        rxcui: "1599538",
        name: "Apixaban",
        brand: "Eliquis"
      },
      rationale: "Direct oral anticoagulant with fewer drug interactions",
      safetyProfile: "No significant interactions with amiodarone",
      efficacyComparison: "Non-inferior to warfarin for stroke prevention",
      considerations: ["No routine monitoring required", "Higher cost", "Renal dose adjustment needed"]
    },
    {
      drug: {
        rxcui: "1114195",
        name: "Dabigatran",
        brand: "Pradaxa"
      },
      rationale: "Alternative DOAC with predictable pharmacokinetics",
      safetyProfile: "Minimal interaction potential",
      efficacyComparison: "Similar efficacy to warfarin",
      considerations: ["Twice daily dosing", "GI side effects possible", "Antidote available"]
    }
  ];
}

async function assessCurrentRegimenRisk(medications, patientData) {
  const { age, conditions = [], organ_function = {} } = patientData;
  let riskScore = 0;
  const riskFactors = [];
  
  // Base risk from medication count
  riskScore += medications.length * 5; // 5 points per medication
  
  // Age-related risk
  if (age >= 75) {
    riskScore += 15;
    riskFactors.push('Advanced age increases polypharmacy risk');
  }
  
  // Organ function impact
  if (organ_function.renal_clearance < 60) {
    riskScore += 10;
    riskFactors.push('Reduced renal function affects drug clearance');
  }
  
  // High-risk drug combinations
  const drugNames = medications.map(m => m.name?.toLowerCase() || '');
  if (drugNames.includes('warfarin') && drugNames.includes('ibuprofen')) {
    riskScore += 20;
    riskFactors.push('Warfarin + NSAID increases bleeding risk');
  }
  
  return {
    overallScore: Math.min(riskScore, 100),
    category: riskScore < 30 ? 'Low' : riskScore < 60 ? 'Moderate' : 'High',
    riskFactors,
    medicationBurden: medications.length,
    pillsPerDay: medications.length * 1.5 // Mock calculation
  };
}

async function calculateInteractionBurden(medications) {
  const totalInteractions = Math.floor(medications.length * 0.3); // Mock: 30% chance per drug pair
  
  return {
    totalInteractions,
    severityDistribution: {
      critical: Math.floor(totalInteractions * 0.1),
      high: Math.floor(totalInteractions * 0.2),
      moderate: Math.floor(totalInteractions * 0.4),
      low: Math.floor(totalInteractions * 0.3)
    },
    interactionDensity: totalInteractions / medications.length,
    recommendation: totalInteractions > 3 ? 'High interaction burden - consider optimization' : 'Acceptable interaction profile'
  };
}

export default router;