import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Brain, Target, Clock, AlertTriangle, TrendingUp, Activity, Eye, BarChart3, Lightbulb, Shield, Users } from 'lucide-react';

interface OracleQuery {
  id: string;
  patientId: string;
  oncologistId: string;
  timestamp: string;
  queryType: 'treatment_selection' | 'drug_combination' | 'timing_optimization' | 'risk_assessment' | 'emergency_decision';
  clinicalContext: {
    cancerType: string;
    stage: string;
    priorTreatments: string[];
    comorbidities: string[];
    geneticProfile: string[];
    currentSymptoms: string[];
    urgency: number; // 0-100
  };
  patientFactors: {
    age: number;
    performanceStatus: number;
    qualityOfLifeGoals: string[];
    treatmentPreferences: string[];
    familyDynamics: string;
    culturalFactors: string[];
  };
}

interface OracleRecommendation {
  id: string;
  queryId: string;
  primaryRecommendation: {
    treatment: string;
    reasoning: string;
    confidenceLevel: number; // 0-100
    evidenceStrength: number;
    expectedOutcome: {
      responseRate: number;
      survivalBenefit: number;
      qualityOfLifeImpact: number;
      toxicityRisk: number;
    };
  };
  alternativeOptions: Array<{
    treatment: string;
    reasoning: string;
    pros: string[];
    cons: string[];
    outcomeComparison: {
      efficacy: number;
      safety: number;
      tolerability: number;
      convenience: number;
    };
    suitabilityScore: number;
  }>;
  riskBenefitAnalysis: {
    benefitScore: number;
    riskScore: number;
    riskFactors: Array<{
      factor: string;
      probability: number;
      severity: number;
      mitigation: string;
    }>;
    benefitFactors: Array<{
      factor: string;
      magnitude: number;
      timeframe: string;
      certainty: number;
    }>;
  };
  ethicalConsiderations: {
    autonomyRespect: number;
    beneficiencePrinciple: number;
    nonMaleficence: number;
    justiceConsiderations: string[];
    culturalSensitivity: string[];
  };
}

interface MultiUniverseSimulation {
  id: string;
  recommendationId: string;
  simulationParameters: {
    universeCount: number;
    timeHorizon: number; // months
    variabilityFactors: string[];
    uncertaintyLevels: { [factor: string]: number };
  };
  outcomes: Array<{
    universeId: string;
    treatmentPath: string;
    timeline: Array<{
      timePoint: number; // months
      diseaseStatus: string;
      qualityOfLife: number;
      treatmentResponse: number;
      sideEffects: string[];
      interventions: string[];
    }>;
    finalOutcome: {
      overallSurvival: number;
      progressionFreeSurvival: number;
      qualityAdjustedLifeYears: number;
      treatmentBurden: number;
      patientSatisfaction: number;
    };
    probability: number;
  }>;
  convergenceAnalysis: {
    optimalPathProbability: number;
    robustnesScore: number;
    sensitivityFactors: Array<{
      factor: string;
      impactMagnitude: number;
      criticalThreshold: number;
    }>;
  };
}

interface RealTimeUpdates {
  id: string;
  patientId: string;
  lastUpdate: string;
  dataStreams: {
    labResults: {
      lastUpdate: string;
      criticalChanges: Array<{
        parameter: string;
        oldValue: number;
        newValue: number;
        significance: number;
        treatmentImplications: string;
      }>;
    };
    imagingResults: {
      lastUpdate: string;
      findings: Array<{
        finding: string;
        change: 'new' | 'improved' | 'worsened' | 'stable';
        significance: number;
        treatmentImplications: string;
      }>;
    };
    symptoms: {
      lastUpdate: string;
      reportedSymptoms: Array<{
        symptom: string;
        severity: number;
        trend: 'improving' | 'worsening' | 'stable';
        impactOnTreatment: string;
      }>;
    };
    vitalSigns: {
      lastUpdate: string;
      alerts: Array<{
        parameter: string;
        value: number;
        normalRange: { min: number; max: number };
        urgency: number;
        recommendedAction: string;
      }>;
    };
  };
  impactAssessment: {
    treatmentPlanModification: boolean;
    urgencyEscalation: boolean;
    consultationNeeded: string[];
    timeToDecision: number; // minutes
  };
}

interface DecisionConfidence {
  id: string;
  recommendationId: string;
  confidenceMetrics: {
    evidenceQuality: number; // 0-100
    dataCompleteness: number;
    consensusLevel: number;
    outcomePredicition: number;
    riskAssessment: number;
  };
  uncertaintyFactors: Array<{
    factor: string;
    uncertaintyLevel: number;
    impactOnDecision: number;
    informationNeeded: string;
    timeToResolve: number;
  }>;
  sensitivityAnalysis: {
    robustDecision: boolean;
    criticalAssumptions: string[];
    alternativeScenarios: Array<{
      scenario: string;
      probability: number;
      recommendationChange: boolean;
    }>;
  };
  improvementSuggestions: Array<{
    suggestion: string;
    confidenceIncrease: number;
    feasibility: number;
    timeRequired: number;
  }>;
}

interface CollaborativeDecision {
  id: string;
  oracleRecommendationId: string;
  multidisciplinaryTeam: Array<{
    specialistId: string;
    specialty: string;
    recommendation: string;
    confidenceLevel: number;
    reasoning: string;
    criticalConcerns: string[];
  }>;
  consensusBuilding: {
    agreementLevel: number;
    majorDiscrepancies: Array<{
      issue: string;
      positions: Array<{
        specialist: string;
        position: string;
        evidence: string;
      }>;
      resolutionPath: string;
    }>;
    finalConsensus: {
      recommendation: string;
      supportLevel: number;
      dissenting: string[];
      compromises: string[];
    };
  };
  patientFamilyInput: {
    preferences: string[];
    concerns: string[];
    questions: string[];
    decisionReadiness: number;
    culturalConsiderations: string[];
  };
  implementationPlan: {
    timeline: Array<{
      phase: string;
      duration: number;
      milestones: string[];
      riskPoints: string[];
    }>;
    monitoringPlan: string[];
    contingencyPlans: Array<{
      trigger: string;
      action: string;
      responsibility: string;
    }>;
  };
}

interface OraclePerformance {
  id: string;
  timeframe: string;
  metrics: {
    totalQueries: number;
    averageResponseTime: number; // seconds
    recommendationAccuracy: number; // %
    outcomeAlignment: number; // %
    physicinagreement: number; // %
    patientSatisfaction: number; // %
  };
  learningProgress: {
    knowledgeBaseUpdates: number;
    modelImprovements: Array<{
      improvement: string;
      impactMagnitude: number;
      implementationDate: string;
    }>;
    feedbackIntegration: {
      outcomeData: number;
      physicianFeedback: number;
      patientReported: number;
    };
  };
  complexityHandling: {
    routineCases: { accuracy: number; confidence: number };
    moderateComplexity: { accuracy: number; confidence: number };
    highComplexity: { accuracy: number; confidence: number };
    rareConditions: { accuracy: number; confidence: number };
  };
}

const RealTimeTreatmentOracle: React.FC = () => {
  const [activeTab, setActiveTab] = useState('queries');
  const [queries, setQueries] = useState<OracleQuery[]>([]);
  const [recommendations, setRecommendations] = useState<OracleRecommendation[]>([]);
  const [simulations, setSimulations] = useState<MultiUniverseSimulation[]>([]);
  const [updates, setUpdates] = useState<RealTimeUpdates[]>([]);
  const [confidence, setConfidence] = useState<DecisionConfidence[]>([]);
  const [collaboration, setCollaboration] = useState<CollaborativeDecision[]>([]);
  const [performance, setPerformance] = useState<OraclePerformance[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate mock data
  useEffect(() => {
    const generateMockQueries = (): OracleQuery[] => {
      return Array.from({ length: 8 }, (_, i) => ({
        id: `query-${i}`,
        patientId: `patient-${i}`,
        oncologistId: `oncologist-${Math.floor(Math.random() * 5)}`,
        timestamp: new Date(Date.now() - i * 2 * 60 * 60 * 1000).toISOString(),
        queryType: ['treatment_selection', 'drug_combination', 'timing_optimization', 'risk_assessment', 'emergency_decision'][Math.floor(Math.random() * 5)] as any,
        clinicalContext: {
          cancerType: ['Breast Cancer', 'Lung Cancer', 'Colorectal Cancer', 'Prostate Cancer', 'Lymphoma'][i % 5],
          stage: ['I', 'II', 'III', 'IV'][Math.floor(Math.random() * 4)],
          priorTreatments: ['Surgery', 'Chemotherapy', 'Radiation'].filter(() => Math.random() > 0.5),
          comorbidities: ['Diabetes', 'Hypertension', 'Heart Disease'].filter(() => Math.random() > 0.6),
          geneticProfile: ['BRCA1', 'TP53', 'KRAS'].filter(() => Math.random() > 0.7),
          currentSymptoms: ['Fatigue', 'Pain', 'Nausea'].filter(() => Math.random() > 0.5),
          urgency: Math.floor(Math.random() * 60) + 20,
        },
        patientFactors: {
          age: Math.floor(Math.random() * 40) + 40,
          performanceStatus: Math.floor(Math.random() * 5),
          qualityOfLifeGoals: ['Maintain independence', 'Minimize side effects', 'Maximize survival'],
          treatmentPreferences: ['Oral medications', 'Outpatient treatment', 'Minimal disruption'],
          familyDynamics: 'Strong family support with shared decision-making',
          culturalFactors: ['Religious considerations', 'Language preferences', 'Traditional healing integration'],
        },
      }));
    };

    const generateMockRecommendations = (): OracleRecommendation[] => {
      return Array.from({ length: 6 }, (_, i) => ({
        id: `recommendation-${i}`,
        queryId: `query-${i}`,
        primaryRecommendation: {
          treatment: `Treatment Protocol ${i + 1}`,
          reasoning: `Based on extensive analysis of patient factors, current evidence suggests this approach offers optimal balance of efficacy and tolerability.`,
          confidenceLevel: 85 + Math.random() * 15,
          evidenceStrength: 80 + Math.random() * 20,
          expectedOutcome: {
            responseRate: 60 + Math.random() * 35,
            survivalBenefit: 65 + Math.random() * 30,
            qualityOfLifeImpact: 70 + Math.random() * 25,
            toxicityRisk: 15 + Math.random() * 25,
          },
        },
        alternativeOptions: Array.from({ length: 3 }, (_, j) => ({
          treatment: `Alternative Treatment ${j + 1}`,
          reasoning: `Alternative approach with different risk-benefit profile`,
          pros: ['Lower toxicity', 'Oral administration', 'Proven efficacy'],
          cons: ['Limited long-term data', 'Cost considerations', 'Monitoring requirements'],
          outcomeComparison: {
            efficacy: 60 + Math.random() * 30,
            safety: 70 + Math.random() * 30,
            tolerability: 75 + Math.random() * 25,
            convenience: 80 + Math.random() * 20,
          },
          suitabilityScore: 70 + Math.random() * 25,
        })),
        riskBenefitAnalysis: {
          benefitScore: 75 + Math.random() * 25,
          riskScore: 20 + Math.random() * 30,
          riskFactors: [
            { factor: 'Neutropenia', probability: 0.15, severity: 0.6, mitigation: 'Growth factor support' },
            { factor: 'Peripheral neuropathy', probability: 0.25, severity: 0.4, mitigation: 'Dose modification' },
            { factor: 'Cardiotoxicity', probability: 0.05, severity: 0.8, mitigation: 'Cardiac monitoring' },
          ],
          benefitFactors: [
            { factor: 'Tumor response', magnitude: 0.7, timeframe: '3-6 months', certainty: 0.85 },
            { factor: 'Symptom relief', magnitude: 0.6, timeframe: '2-4 weeks', certainty: 0.75 },
            { factor: 'Survival extension', magnitude: 0.8, timeframe: '12-24 months', certainty: 0.70 },
          ],
        },
        ethicalConsiderations: {
          autonomyRespect: 90 + Math.random() * 10,
          beneficiencePrinciple: 85 + Math.random() * 15,
          nonMaleficence: 88 + Math.random() * 12,
          justiceConsiderations: ['Insurance coverage', 'Access to care', 'Resource allocation'],
          culturalSensitivity: ['Religious considerations', 'Family involvement', 'Communication preferences'],
        },
      }));
    };

    const generateMockSimulations = (): MultiUniverseSimulation[] => {
      return Array.from({ length: 4 }, (_, i) => ({
        id: `simulation-${i}`,
        recommendationId: `recommendation-${i}`,
        simulationParameters: {
          universeCount: Math.floor(Math.random() * 50000) + 50000,
          timeHorizon: Math.floor(Math.random() * 36) + 24,
          variabilityFactors: ['Genetic expression', 'Drug metabolism', 'Immune response', 'Disease progression'],
          uncertaintyLevels: {
            'Drug efficacy': 0.15 + Math.random() * 0.15,
            'Toxicity severity': 0.20 + Math.random() * 0.20,
            'Disease progression': 0.25 + Math.random() * 0.15,
          },
        },
        outcomes: Array.from({ length: 5 }, (_, j) => ({
          universeId: `universe-${i}-${j}`,
          treatmentPath: `Treatment path variant ${j + 1}`,
          timeline: Array.from({ length: 12 }, (_, k) => ({
            timePoint: k + 1,
            diseaseStatus: ['Responding', 'Stable', 'Progressive'][Math.floor(Math.random() * 3)],
            qualityOfLife: 60 + Math.random() * 40,
            treatmentResponse: 40 + Math.random() * 50,
            sideEffects: ['Fatigue', 'Nausea', 'Neuropathy'].filter(() => Math.random() > 0.6),
            interventions: ['Dose reduction', 'Supportive care', 'Monitoring'].filter(() => Math.random() > 0.7),
          })),
          finalOutcome: {
            overallSurvival: 60 + Math.random() * 35,
            progressionFreeSurvival: 45 + Math.random() * 40,
            qualityAdjustedLifeYears: 3 + Math.random() * 4,
            treatmentBurden: 30 + Math.random() * 40,
            patientSatisfaction: 70 + Math.random() * 30,
          },
          probability: Math.random() * 0.4 + 0.1,
        })),
        convergenceAnalysis: {
          optimalPathProbability: 0.7 + Math.random() * 0.25,
          robustnesScore: 0.8 + Math.random() * 0.2,
          sensitivityFactors: [
            { factor: 'Initial response', impactMagnitude: 0.7, criticalThreshold: 0.5 },
            { factor: 'Toxicity tolerance', impactMagnitude: 0.5, criticalThreshold: 0.3 },
            { factor: 'Genetic factors', impactMagnitude: 0.6, criticalThreshold: 0.4 },
          ],
        },
      }));
    };

    const generateMockUpdates = (): RealTimeUpdates[] => {
      return Array.from({ length: 4 }, (_, i) => ({
        id: `update-${i}`,
        patientId: `patient-${i}`,
        lastUpdate: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
        dataStreams: {
          labResults: {
            lastUpdate: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString(),
            criticalChanges: [
              { parameter: 'Neutrophils', oldValue: 2.5, newValue: 1.2, significance: 0.8, treatmentImplications: 'Consider dose reduction' },
              { parameter: 'Creatinine', oldValue: 1.0, newValue: 1.4, significance: 0.6, treatmentImplications: 'Monitor renal function' },
            ],
          },
          imagingResults: {
            lastUpdate: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
            findings: [
              { finding: 'Primary tumor', change: 'improved', significance: 0.9, treatmentImplications: 'Continue current therapy' },
              { finding: 'Lymph nodes', change: 'stable', significance: 0.5, treatmentImplications: 'Maintain monitoring' },
            ],
          },
          symptoms: {
            lastUpdate: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString(),
            reportedSymptoms: [
              { symptom: 'Neuropathy', severity: 6, trend: 'worsening', impactOnTreatment: 'May require dose modification' },
              { symptom: 'Fatigue', severity: 4, trend: 'stable', impactOnTreatment: 'Supportive care adequate' },
            ],
          },
          vitalSigns: {
            lastUpdate: new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString(),
            alerts: [
              { parameter: 'Blood pressure', value: 160, normalRange: { min: 90, max: 140 }, urgency: 0.7, recommendedAction: 'Cardiology consultation' },
            ],
          },
        },
        impactAssessment: {
          treatmentPlanModification: Math.random() > 0.6,
          urgencyEscalation: Math.random() > 0.8,
          consultationNeeded: ['Cardiology', 'Nephrology'].filter(() => Math.random() > 0.5),
          timeToDecision: Math.floor(Math.random() * 120) + 30,
        },
      }));
    };

    const generateMockConfidence = (): DecisionConfidence[] => {
      return Array.from({ length: 4 }, (_, i) => ({
        id: `confidence-${i}`,
        recommendationId: `recommendation-${i}`,
        confidenceMetrics: {
          evidenceQuality: 80 + Math.random() * 20,
          dataCompleteness: 75 + Math.random() * 25,
          consensusLevel: 85 + Math.random() * 15,
          outcomePredicition: 78 + Math.random() * 22,
          riskAssessment: 82 + Math.random() * 18,
        },
        uncertaintyFactors: [
          { factor: 'Long-term toxicity', uncertaintyLevel: 0.3, impactOnDecision: 0.6, informationNeeded: 'Extended follow-up data', timeToResolve: 180 },
          { factor: 'Drug interactions', uncertaintyLevel: 0.2, impactOnDecision: 0.4, informationNeeded: 'Pharmacokinetic studies', timeToResolve: 30 },
          { factor: 'Genetic variability', uncertaintyLevel: 0.4, impactOnDecision: 0.7, informationNeeded: 'Genomic profiling', timeToResolve: 14 },
        ],
        sensitivityAnalysis: {
          robustDecision: Math.random() > 0.3,
          criticalAssumptions: ['Response rate assumptions', 'Toxicity profile', 'Patient compliance'],
          alternativeScenarios: [
            { scenario: 'Lower efficacy', probability: 0.2, recommendationChange: false },
            { scenario: 'Higher toxicity', probability: 0.15, recommendationChange: true },
            { scenario: 'Drug resistance', probability: 0.1, recommendationChange: true },
          ],
        },
        improvementSuggestions: [
          { suggestion: 'Additional genomic testing', confidenceIncrease: 15, feasibility: 0.8, timeRequired: 7 },
          { suggestion: 'Functional imaging', confidenceIncrease: 10, feasibility: 0.9, timeRequired: 3 },
          { suggestion: 'Specialist consultation', confidenceIncrease: 12, feasibility: 0.7, timeRequired: 2 },
        ],
      }));
    };

    const generateMockCollaboration = (): CollaborativeDecision[] => {
      return Array.from({ length: 3 }, (_, i) => ({
        id: `collaboration-${i}`,
        oracleRecommendationId: `recommendation-${i}`,
        multidisciplinaryTeam: [
          { specialistId: 'onc-001', specialty: 'Medical Oncology', recommendation: 'Agree with primary recommendation', confidenceLevel: 90, reasoning: 'Strong evidence base', criticalConcerns: [] },
          { specialistId: 'surg-001', specialty: 'Surgical Oncology', recommendation: 'Consider surgical consultation', confidenceLevel: 75, reasoning: 'Potential for resection', criticalConcerns: ['Operative risk'] },
          { specialistId: 'rad-001', specialty: 'Radiation Oncology', recommendation: 'Sequential radiation therapy', confidenceLevel: 85, reasoning: 'Good target volume', criticalConcerns: ['Normal tissue tolerance'] },
        ],
        consensusBuilding: {
          agreementLevel: 85,
          majorDiscrepancies: [
            {
              issue: 'Treatment sequencing',
              positions: [
                { specialist: 'Medical Oncology', position: 'Systemic therapy first', evidence: 'Superior survival data' },
                { specialist: 'Surgical Oncology', position: 'Surgery first', evidence: 'Better local control' },
              ],
              resolutionPath: 'Multidisciplinary discussion with patient preferences',
            },
          ],
          finalConsensus: {
            recommendation: 'Combined modality approach with patient preference consideration',
            supportLevel: 88,
            dissenting: [],
            compromises: ['Treatment sequencing flexibility', 'Regular reassessment'],
          },
        },
        patientFamilyInput: {
          preferences: ['Minimal hospital time', 'Oral medications when possible', 'Family involvement in decisions'],
          concerns: ['Treatment side effects', 'Financial impact', 'Work schedule disruption'],
          questions: ['Treatment timeline', 'Success rates', 'Alternative options'],
          decisionReadiness: 75,
          culturalConsiderations: ['Family decision-making', 'Religious beliefs', 'Traditional medicine integration'],
        },
        implementationPlan: {
          timeline: [
            { phase: 'Initial treatment', duration: 12, milestones: ['Response assessment', 'Toxicity monitoring'], riskPoints: ['Severe toxicity', 'Disease progression'] },
            { phase: 'Consolidation', duration: 8, milestones: ['Imaging response', 'Surgical evaluation'], riskPoints: ['Operative complications'] },
            { phase: 'Maintenance', duration: 24, milestones: ['Long-term monitoring', 'Quality of life assessment'], riskPoints: ['Late toxicity', 'Recurrence'] },
          ],
          monitoringPlan: ['Weekly labs during treatment', 'Monthly imaging first year', 'Quality of life assessments'],
          contingencyPlans: [
            { trigger: 'Grade 3-4 toxicity', action: 'Dose modification or discontinuation', responsibility: 'Medical Oncology' },
            { trigger: 'Disease progression', action: 'Second-line therapy evaluation', responsibility: 'Multidisciplinary team' },
            { trigger: 'Patient preference change', action: 'Care plan revision', responsibility: 'Primary oncologist' },
          ],
        },
      }));
    };

    const generateMockPerformance = (): OraclePerformance[] => {
      return Array.from({ length: 1 }, (_, i) => ({
        id: `performance-${i}`,
        timeframe: 'Last 30 days',
        metrics: {
          totalQueries: Math.floor(Math.random() * 500) + 1000,
          averageResponseTime: Math.random() * 10 + 5,
          recommendationAccuracy: 88 + Math.random() * 10,
          outcomeAlignment: 85 + Math.random() * 12,
          physicinagreement: 82 + Math.random() * 15,
          patientSatisfaction: 87 + Math.random() * 10,
        },
        learningProgress: {
          knowledgeBaseUpdates: Math.floor(Math.random() * 50) + 100,
          modelImprovements: [
            { improvement: 'Enhanced drug interaction detection', impactMagnitude: 0.15, implementationDate: '2024-10-15' },
            { improvement: 'Improved rare cancer recommendations', impactMagnitude: 0.12, implementationDate: '2024-10-10' },
            { improvement: 'Better toxicity prediction', impactMagnitude: 0.18, implementationDate: '2024-10-05' },
          ],
          feedbackIntegration: {
            outcomeData: Math.floor(Math.random() * 200) + 500,
            physicianFeedback: Math.floor(Math.random() * 100) + 200,
            patientReported: Math.floor(Math.random() * 150) + 300,
          },
        },
        complexityHandling: {
          routineCases: { accuracy: 95 + Math.random() * 5, confidence: 92 + Math.random() * 8 },
          moderateComplexity: { accuracy: 88 + Math.random() * 10, confidence: 85 + Math.random() * 12 },
          highComplexity: { accuracy: 78 + Math.random() * 15, confidence: 75 + Math.random() * 20 },
          rareConditions: { accuracy: 70 + Math.random() * 20, confidence: 65 + Math.random() * 25 },
        },
      }));
    };

    setQueries(generateMockQueries());
    setRecommendations(generateMockRecommendations());
    setSimulations(generateMockSimulations());
    setUpdates(generateMockUpdates());
    setConfidence(generateMockConfidence());
    setCollaboration(generateMockCollaboration());
    setPerformance(generateMockPerformance());
  }, []);

  // Canvas visualization for oracle decision network
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const time = Date.now() * 0.001;

      // Draw oracle decision matrix
      const gridSize = 8;
      const cellSize = Math.min(canvas.width, canvas.height) / (gridSize + 2);
      
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const x = centerX - (gridSize * cellSize) / 2 + i * cellSize;
          const y = centerY - (gridSize * cellSize) / 2 + j * cellSize;
          
          // Decision node activity
          const activity = Math.sin(time + i * 0.5 + j * 0.3) * 0.5 + 0.5;
          const confidence = Math.cos(time * 0.7 + i * 0.3 + j * 0.2) * 0.3 + 0.7;
          
          // Draw decision cell
          ctx.fillStyle = `rgba(59, 130, 246, ${activity * 0.6 + 0.2})`;
          ctx.fillRect(x, y, cellSize * 0.8, cellSize * 0.8);
          
          // Draw confidence indicator
          ctx.fillStyle = `rgba(168, 85, 247, ${confidence * 0.8})`;
          ctx.fillRect(x + cellSize * 0.1, y + cellSize * 0.1, cellSize * 0.6, cellSize * 0.6);
          
          // Draw connections to adjacent cells
          if (i < gridSize - 1) {
            ctx.beginPath();
            ctx.moveTo(x + cellSize * 0.8, y + cellSize * 0.4);
            ctx.lineTo(x + cellSize, y + cellSize * 0.4);
            ctx.strokeStyle = `rgba(34, 197, 94, ${activity * 0.5 + 0.2})`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          
          if (j < gridSize - 1) {
            ctx.beginPath();
            ctx.moveTo(x + cellSize * 0.4, y + cellSize * 0.8);
            ctx.lineTo(x + cellSize * 0.4, y + cellSize);
            ctx.strokeStyle = `rgba(34, 197, 94, ${activity * 0.5 + 0.2})`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      }

      // Draw central oracle hub
      ctx.beginPath();
      ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
      ctx.fill();

      // Draw oracle energy pulses
      for (let pulse = 0; pulse < 4; pulse++) {
        ctx.beginPath();
        ctx.arc(
          centerX, 
          centerY, 
          35 + pulse * 20 + Math.sin(time * 2 + pulse) * 8, 
          0, 
          2 * Math.PI
        );
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.4 - pulse * 0.08})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw decision beams
      for (let beam = 0; beam < 12; beam++) {
        const angle = (beam / 12) * 2 * Math.PI + time * 0.3;
        const startRadius = 40;
        const endRadius = Math.min(canvas.width, canvas.height) / 2 - 20;
        
        const startX = centerX + Math.cos(angle) * startRadius;
        const startY = centerY + Math.sin(angle) * startRadius;
        const endX = centerX + Math.cos(angle) * endRadius;
        const endY = centerY + Math.sin(angle) * endRadius;
        
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.6)');
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw labels
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#1f2937';
      ctx.textAlign = 'center';
      ctx.fillText('Treatment', centerX, centerY - 5);
      ctx.fillText('Oracle', centerX, centerY + 8);

      requestAnimationFrame(animate);
    };

    animate();
  }, [activeTab]);

  const renderQueries = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Active Queries</p>
                <p className="text-2xl font-bold">{queries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold">
                  {performance.length > 0 ? `${performance[0].metrics.averageResponseTime.toFixed(1)}s` : '0s'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">High Urgency</p>
                <p className="text-2xl font-bold">
                  {queries.filter(q => q.clinicalContext.urgency > 70).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Oracle Accuracy</p>
                <p className="text-2xl font-bold">
                  {performance.length > 0 ? `${performance[0].metrics.recommendationAccuracy.toFixed(0)}%` : '0%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Oracle Decision Network</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas
              ref={canvasRef}
              className="w-full h-64 border rounded"
              style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Query Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['treatment_selection', 'drug_combination', 'timing_optimization', 'risk_assessment', 'emergency_decision'].map((type) => {
                const count = queries.filter(q => q.queryType === type).length;
                const percentage = (count / queries.length) * 100;
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                      <span className="text-sm font-medium">{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Oracle Queries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {queries.map((query) => (
              <div key={query.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium capitalize">{query.queryType.replace('_', ' ')}</h4>
                    <p className="text-sm text-gray-600">
                      {query.clinicalContext.cancerType} • Stage {query.clinicalContext.stage}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      query.clinicalContext.urgency > 70 ? 'bg-red-100 text-red-800' :
                      query.clinicalContext.urgency > 40 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {query.clinicalContext.urgency}% urgency
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(query.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Patient Age</p>
                    <p className="font-medium">{query.patientFactors.age}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Performance Status</p>
                    <p className="font-medium">{query.patientFactors.performanceStatus}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Prior Treatments</p>
                    <p className="font-medium">{query.clinicalContext.priorTreatments.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Comorbidities</p>
                    <p className="font-medium">{query.clinicalContext.comorbidities.length}</p>
                  </div>
                </div>

                {query.clinicalContext.currentSymptoms.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-sm font-medium mb-2">Current Symptoms</h5>
                    <div className="flex flex-wrap gap-2">
                      {query.clinicalContext.currentSymptoms.map((symptom, i) => (
                        <span key={i} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Recommendations</p>
                <p className="text-2xl font-bold">{recommendations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold">
                  {(recommendations.reduce((sum, r) => sum + r.primaryRecommendation.confidenceLevel, 0) / recommendations.length || 0).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Benefit Score</p>
                <p className="text-2xl font-bold">
                  {(recommendations.reduce((sum, r) => sum + r.riskBenefitAnalysis.benefitScore, 0) / recommendations.length || 0).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Risk Score</p>
                <p className="text-2xl font-bold">
                  {(recommendations.reduce((sum, r) => sum + r.riskBenefitAnalysis.riskScore, 0) / recommendations.length || 0).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {recommendations.map((rec) => (
        <Card key={rec.id}>
          <CardHeader>
            <CardTitle>Oracle Recommendation: {rec.queryId}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="border rounded p-4 bg-blue-50">
                <h5 className="font-medium mb-2 text-blue-900">Primary Recommendation</h5>
                <p className="font-medium text-lg mb-2">{rec.primaryRecommendation.treatment}</p>
                <p className="text-sm text-gray-700 mb-3">{rec.primaryRecommendation.reasoning}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Confidence</p>
                    <p className="text-lg font-bold text-blue-600">{rec.primaryRecommendation.confidenceLevel.toFixed(0)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Response Rate</p>
                    <p className="text-lg font-bold text-green-600">{rec.primaryRecommendation.expectedOutcome.responseRate.toFixed(0)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Survival Benefit</p>
                    <p className="text-lg font-bold text-purple-600">{rec.primaryRecommendation.expectedOutcome.survivalBenefit.toFixed(0)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Toxicity Risk</p>
                    <p className="text-lg font-bold text-red-600">{rec.primaryRecommendation.expectedOutcome.toxicityRisk.toFixed(0)}%</p>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">Alternative Treatment Options</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rec.alternativeOptions.map((alt, i) => (
                    <div key={i} className="border rounded p-3">
                      <h6 className="font-medium mb-2">{alt.treatment}</h6>
                      <p className="text-sm text-gray-600 mb-2">{alt.reasoning}</p>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-600">Pros:</p>
                          <div className="flex flex-wrap gap-1">
                            {alt.pros.slice(0, 2).map((pro, j) => (
                              <span key={j} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                {pro}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-600">Cons:</p>
                          <div className="flex flex-wrap gap-1">
                            {alt.cons.slice(0, 2).map((con, j) => (
                              <span key={j} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                                {con}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Suitability Score</p>
                          <p className="font-bold">{alt.suitabilityScore.toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded p-4">
                  <h5 className="font-medium mb-3">Risk Factors</h5>
                  <div className="space-y-2">
                    {rec.riskBenefitAnalysis.riskFactors.map((risk, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-sm">{risk.factor}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-600">{(risk.probability * 100).toFixed(0)}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${risk.severity * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded p-4">
                  <h5 className="font-medium mb-3">Benefit Factors</h5>
                  <div className="space-y-2">
                    {rec.riskBenefitAnalysis.benefitFactors.map((benefit, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-sm">{benefit.factor}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-600">{benefit.timeframe}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${benefit.magnitude * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">Ethical Considerations</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Autonomy</p>
                    <p className="font-bold">{rec.ethicalConsiderations.autonomyRespect.toFixed(0)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Beneficence</p>
                    <p className="font-bold">{rec.ethicalConsiderations.beneficiencePrinciple.toFixed(0)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Non-maleficence</p>
                    <p className="font-bold">{rec.ethicalConsiderations.nonMaleficence.toFixed(0)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Cultural Sensitivity</p>
                    <p className="font-bold">{rec.ethicalConsiderations.culturalSensitivity.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderSimulations = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Active Simulations</p>
                <p className="text-2xl font-bold">{simulations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Universes</p>
                <p className="text-2xl font-bold">
                  {simulations.reduce((sum, s) => sum + s.simulationParameters.universeCount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Convergence</p>
                <p className="text-2xl font-bold">
                  {(simulations.reduce((sum, s) => sum + s.convergenceAnalysis.optimalPathProbability, 0) / simulations.length * 100 || 0).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Robustness Score</p>
                <p className="text-2xl font-bold">
                  {(simulations.reduce((sum, s) => sum + s.convergenceAnalysis.robustnesScore, 0) / simulations.length * 100 || 0).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {simulations.map((sim) => (
        <Card key={sim.id}>
          <CardHeader>
            <CardTitle>Multi-Universe Simulation: {sim.recommendationId}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="border rounded p-4">
                  <h5 className="font-medium mb-2">Simulation Scale</h5>
                  <p className="text-2xl font-bold text-blue-600">{sim.simulationParameters.universeCount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Parallel Universes</p>
                </div>
                <div className="border rounded p-4">
                  <h5 className="font-medium mb-2">Time Horizon</h5>
                  <p className="text-2xl font-bold text-green-600">{sim.simulationParameters.timeHorizon}</p>
                  <p className="text-sm text-gray-600">Months</p>
                </div>
                <div className="border rounded p-4">
                  <h5 className="font-medium mb-2">Optimal Path</h5>
                  <p className="text-2xl font-bold text-purple-600">{(sim.convergenceAnalysis.optimalPathProbability * 100).toFixed(0)}%</p>
                  <p className="text-sm text-gray-600">Probability</p>
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">Uncertainty Levels</h5>
                <div className="space-y-2">
                  {Object.entries(sim.simulationParameters.uncertaintyLevels).map(([factor, level]) => (
                    <div key={factor} className="flex justify-between items-center">
                      <span className="text-sm">{factor}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${level * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{(level * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">Outcome Scenarios</h5>
                <div className="space-y-3">
                  {sim.outcomes.slice(0, 3).map((outcome, i) => (
                    <div key={i} className="border rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h6 className="font-medium">{outcome.treatmentPath}</h6>
                        <span className="text-sm text-gray-600">{(outcome.probability * 100).toFixed(1)}% probability</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                        <div className="text-center">
                          <p className="text-gray-600">Overall Survival</p>
                          <p className="font-medium">{outcome.finalOutcome.overallSurvival.toFixed(0)}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">PFS</p>
                          <p className="font-medium">{outcome.finalOutcome.progressionFreeSurvival.toFixed(0)}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">QALYs</p>
                          <p className="font-medium">{outcome.finalOutcome.qualityAdjustedLifeYears.toFixed(1)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Treatment Burden</p>
                          <p className="font-medium">{outcome.finalOutcome.treatmentBurden.toFixed(0)}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Satisfaction</p>
                          <p className="font-medium">{outcome.finalOutcome.patientSatisfaction.toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">Sensitivity Analysis</h5>
                <div className="space-y-2">
                  {sim.convergenceAnalysis.sensitivityFactors.map((factor, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm">{factor.factor}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600">Impact: {factor.impactMagnitude.toFixed(2)}</span>
                        <span className="text-xs text-gray-600">Threshold: {factor.criticalThreshold.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      {performance.map((perf) => (
        <div key={perf.id} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Queries</p>
                    <p className="text-2xl font-bold">{perf.metrics.totalQueries.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold">{perf.metrics.averageResponseTime.toFixed(1)}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Recommendation Accuracy</p>
                    <p className="text-2xl font-bold">{perf.metrics.recommendationAccuracy.toFixed(0)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">Physician Agreement</p>
                    <p className="text-2xl font-bold">{perf.metrics.physicinagreement.toFixed(0)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Outcome Alignment</p>
                    <p className="text-2xl font-bold">{perf.metrics.outcomeAlignment.toFixed(0)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Patient Satisfaction</p>
                    <p className="text-2xl font-bold">{perf.metrics.patientSatisfaction.toFixed(0)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Complexity Handling Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(perf.complexityHandling).map(([complexity, metrics]) => (
                    <div key={complexity} className="space-y-2">
                      <h5 className="text-sm font-medium capitalize">{complexity.replace(/([A-Z])/g, ' $1')}</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Accuracy</p>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${metrics.accuracy}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{metrics.accuracy.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Confidence</p>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${metrics.confidence}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{metrics.confidence.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">Knowledge Base Updates</h5>
                    <p className="text-2xl font-bold text-blue-600">{perf.learningProgress.knowledgeBaseUpdates}</p>
                    <p className="text-sm text-gray-600">Updates this month</p>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Recent Model Improvements</h5>
                    <div className="space-y-2">
                      {perf.learningProgress.modelImprovements.slice(0, 3).map((improvement, i) => (
                        <div key={i} className="text-sm">
                          <p className="font-medium">{improvement.improvement}</p>
                          <p className="text-gray-600">Impact: +{(improvement.impactMagnitude * 100).toFixed(0)}%</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Feedback Integration</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Outcome Data</span>
                        <span className="font-medium">{perf.learningProgress.feedbackIntegration.outcomeData}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Physician Feedback</span>
                        <span className="font-medium">{perf.learningProgress.feedbackIntegration.physicianFeedback}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Patient Reported</span>
                        <span className="font-medium">{perf.learningProgress.feedbackIntegration.patientReported}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-yellow-50 to-orange-50 min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-yellow-600 rounded-lg">
          <Lightbulb className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real-Time Treatment Decision Oracle</h1>
          <p className="text-gray-600">AI oracle providing instant treatment recommendations with multi-universe outcome simulation</p>
        </div>
      </div>

      <div className="flex space-x-4 border-b">
        {[
          { id: 'queries', label: 'Oracle Queries', icon: Zap },
          { id: 'recommendations', label: 'Recommendations', icon: Brain },
          { id: 'simulations', label: 'Multi-Universe Simulations', icon: Activity },
          { id: 'performance', label: 'Oracle Performance', icon: BarChart3 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === id
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'queries' && renderQueries()}
        {activeTab === 'recommendations' && renderRecommendations()}
        {activeTab === 'simulations' && renderSimulations()}
        {activeTab === 'performance' && renderPerformance()}
      </div>
    </div>
  );
};

export default RealTimeTreatmentOracle;