import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Zap, Eye, Target, AlertTriangle, TrendingUp, Clock, Shield, Lightbulb, Activity, BarChart3, Users } from 'lucide-react';

interface CognitiveAssistant {
  id: string;
  oncologistId: string;
  name: string;
  specialization: string[];
  cognitiveCapabilities: {
    patternRecognition: number; // 0-100
    knowledgeRetrieval: number;
    reasoningSpeed: number;
    diagnosticAccuracy: number;
    treatmentOptimization: number;
    riskAssessment: number;
  };
  realTimeAnalysis: {
    patientDataProcessing: number; // patients per second
    literatureScanning: number; // papers per minute
    drugInteractionChecking: number; // combinations per second
    genomicAnalysis: number; // variants per minute
  };
  decisionSupport: Array<{
    timestamp: string;
    patientId: string;
    decisionType: 'diagnosis' | 'treatment' | 'prognosis' | 'surgery' | 'emergency';
    aiRecommendation: string;
    confidenceLevel: number;
    oncologistDecision: string;
    outcomeAccuracy: number;
    timeToDecision: number; // seconds
  }>;
  cognitiveLoad: {
    currentLoad: number; // 0-100
    peakLoad: number;
    averageLoad: number;
    fatigueLevel: number;
    stressIndicators: string[];
  };
}

interface KnowledgeAugmentation {
  id: string;
  globalKnowledgeBase: {
    medicalLiterature: {
      totalPapers: number;
      recentUpdates: number;
      relevanceScore: number;
      accessTime: number; // milliseconds
    };
    clinicalTrials: {
      activeTrials: number;
      relevantTrials: number;
      enrollmentOpportunities: number;
      successPredictions: { [trialId: string]: number };
    };
    drugDatabase: {
      totalDrugs: number;
      interactions: number;
      contraindications: number;
      efficacyData: { [drug: string]: number };
    };
    geneticVariants: {
      knownVariants: number;
      therapeuticImplications: number;
      populationFrequencies: { [variant: string]: number };
    };
  };
  instantRetrieval: Array<{
    timestamp: string;
    queryType: string;
    query: string;
    resultsFound: number;
    relevanceScore: number;
    retrievalTime: number; // milliseconds
    actionTaken: string;
  }>;
  contextualInsights: Array<{
    patientContext: string;
    insight: string;
    evidenceStrength: number;
    clinicalSignificance: number;
    implementationComplexity: number;
  }>;
}

interface RealTimeDecisionOracle {
  id: string;
  patientId: string;
  currentDilemma: {
    description: string;
    complexity: number;
    urgency: number;
    stakeholders: string[];
    potentialOutcomes: Array<{
      scenario: string;
      probability: number;
      benefitScore: number;
      riskScore: number;
      qualityOfLife: number;
      survivalBenefit: number;
    }>;
  };
  multiUniverseSimulation: {
    simulatedOutcomes: number;
    convergenceScore: number;
    optimalPath: string;
    alternativePaths: Array<{
      path: string;
      probabilitySuccess: number;
      riskLevel: number;
      timeToOutcome: number;
    }>;
  };
  ethicalFramework: {
    principleWeights: {
      autonomy: number;
      beneficence: number;
      nonMaleficence: number;
      justice: number;
    };
    conflictResolution: string;
    culturalConsiderations: string[];
    familyDynamics: string;
  };
  decisionConfidence: {
    aiConfidence: number;
    evidenceQuality: number;
    consensusLevel: number;
    uncertaintyFactors: string[];
  };
}

interface CognitiveEnhancement {
  id: string;
  enhancementType: 'pattern_recognition' | 'memory_augmentation' | 'reasoning_acceleration' | 'intuition_amplification';
  baselineMetrics: {
    diagnosisAccuracy: number;
    decisionSpeed: number;
    patternDetection: number;
    knowledgeRecall: number;
  };
  augmentedMetrics: {
    diagnosisAccuracy: number;
    decisionSpeed: number;
    patternDetection: number;
    knowledgeRecall: number;
  };
  improvementFactors: {
    accuracyGain: number;
    speedIncrease: number;
    confidenceBoost: number;
    cognitiveEfficiency: number;
  };
  neuralInterface: {
    brainwaveSync: number;
    thoughtPatternRecognition: number;
    subConsciousInsights: number;
    intuitiveEnhancement: number;
  };
}

interface FatigueManagement {
  id: string;
  oncologistId: string;
  fatigueIndicators: {
    cognitiveLoad: number;
    decisionFatigue: number;
    emotionalExhaustion: number;
    physicalStress: number;
    sleepQuality: number;
  };
  performanceMetrics: {
    decisionAccuracy: Array<{ timestamp: string; accuracy: number }>;
    responseTime: Array<{ timestamp: string; time: number }>;
    errorRate: Array<{ timestamp: string; errors: number }>;
    patientsPerHour: Array<{ timestamp: string; count: number }>;
  };
  interventions: Array<{
    type: 'break_reminder' | 'cognitive_rest' | 'mindfulness' | 'nutrition' | 'hydration';
    timestamp: string;
    effectiveness: number;
    compliance: number;
    outcome: string;
  }>;
  optimizationSuggestions: {
    workloadDistribution: string;
    breakScheduling: string;
    cognitiveExercises: string[];
    stressReduction: string[];
  };
}

interface CollaborativeIntelligence {
  id: string;
  teamId: string;
  teamMembers: Array<{
    memberId: string;
    role: string;
    specialization: string;
    cognitiveStrengths: string[];
    currentLoad: number;
  }>;
  collectiveIntelligence: {
    teamIQ: number;
    consensusBuilding: number;
    knowledgeSharing: number;
    decisionSynergy: number;
  };
  realTimeCollaboration: Array<{
    timestamp: string;
    caseId: string;
    contributors: string[];
    collaborationType: 'consultation' | 'second_opinion' | 'multidisciplinary' | 'emergency';
    outcomeImprovement: number;
  }>;
  knowledgeDistribution: {
    expertiseMapping: { [expertise: string]: string[] };
    knowledgeGaps: string[];
    learningOpportunities: string[];
    mentorshipPairs: Array<{ mentor: string; mentee: string; focus: string }>;
  };
}

const OncologistCognitiveAugmentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('assistant');
  const [assistants, setAssistants] = useState<CognitiveAssistant[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeAugmentation[]>([]);
  const [oracles, setOracles] = useState<RealTimeDecisionOracle[]>([]);
  const [enhancements, setEnhancements] = useState<CognitiveEnhancement[]>([]);
  const [fatigue, setFatigue] = useState<FatigueManagement[]>([]);
  const [collaboration, setCollaboration] = useState<CollaborativeIntelligence[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate mock data
  useEffect(() => {
    const generateMockAssistants = (): CognitiveAssistant[] => {
      return Array.from({ length: 4 }, (_, i) => ({
        id: `assistant-${i}`,
        oncologistId: `oncologist-${i}`,
        name: `Dr. AI-${['Alpha', 'Beta', 'Gamma', 'Delta'][i]}`,
        specialization: [
          ['Breast Cancer', 'Immunotherapy'],
          ['Lung Cancer', 'Precision Medicine'],
          ['Hematology', 'CAR-T Therapy'],
          ['Pediatric Oncology', 'Rare Cancers']
        ][i],
        cognitiveCapabilities: {
          patternRecognition: 85 + Math.random() * 15,
          knowledgeRetrieval: 90 + Math.random() * 10,
          reasoningSpeed: 88 + Math.random() * 12,
          diagnosticAccuracy: 92 + Math.random() * 8,
          treatmentOptimization: 87 + Math.random() * 13,
          riskAssessment: 89 + Math.random() * 11,
        },
        realTimeAnalysis: {
          patientDataProcessing: Math.floor(Math.random() * 50) + 100,
          literatureScanning: Math.floor(Math.random() * 1000) + 500,
          drugInteractionChecking: Math.floor(Math.random() * 10000) + 5000,
          genomicAnalysis: Math.floor(Math.random() * 500) + 200,
        },
        decisionSupport: Array.from({ length: 20 }, (_, j) => ({
          timestamp: new Date(Date.now() - j * 2 * 60 * 60 * 1000).toISOString(),
          patientId: `patient-${Math.floor(Math.random() * 100)}`,
          decisionType: ['diagnosis', 'treatment', 'prognosis', 'surgery', 'emergency'][Math.floor(Math.random() * 5)] as any,
          aiRecommendation: `AI recommendation ${j}`,
          confidenceLevel: 80 + Math.random() * 20,
          oncologistDecision: `Oncologist decision ${j}`,
          outcomeAccuracy: 85 + Math.random() * 15,
          timeToDecision: Math.floor(Math.random() * 300) + 60,
        })),
        cognitiveLoad: {
          currentLoad: Math.floor(Math.random() * 40) + 40,
          peakLoad: Math.floor(Math.random() * 20) + 80,
          averageLoad: Math.floor(Math.random() * 30) + 50,
          fatigueLevel: Math.floor(Math.random() * 50) + 20,
          stressIndicators: ['High patient volume', 'Complex cases', 'Time pressure'].filter(() => Math.random() > 0.5),
        },
      }));
    };

    const generateMockKnowledge = (): KnowledgeAugmentation[] => {
      return Array.from({ length: 2 }, (_, i) => ({
        id: `knowledge-${i}`,
        globalKnowledgeBase: {
          medicalLiterature: {
            totalPapers: Math.floor(Math.random() * 1000000) + 5000000,
            recentUpdates: Math.floor(Math.random() * 1000) + 500,
            relevanceScore: 85 + Math.random() * 15,
            accessTime: Math.floor(Math.random() * 50) + 10,
          },
          clinicalTrials: {
            activeTrials: Math.floor(Math.random() * 10000) + 50000,
            relevantTrials: Math.floor(Math.random() * 500) + 200,
            enrollmentOpportunities: Math.floor(Math.random() * 50) + 25,
            successPredictions: {
              'trial-001': 75 + Math.random() * 20,
              'trial-002': 65 + Math.random() * 25,
              'trial-003': 80 + Math.random() * 15,
            },
          },
          drugDatabase: {
            totalDrugs: Math.floor(Math.random() * 50000) + 100000,
            interactions: Math.floor(Math.random() * 1000000) + 5000000,
            contraindications: Math.floor(Math.random() * 100000) + 500000,
            efficacyData: {
              'pembrolizumab': 70 + Math.random() * 25,
              'carboplatin': 60 + Math.random() * 20,
              'paclitaxel': 65 + Math.random() * 20,
            },
          },
          geneticVariants: {
            knownVariants: Math.floor(Math.random() * 100000) + 1000000,
            therapeuticImplications: Math.floor(Math.random() * 10000) + 50000,
            populationFrequencies: {
              'BRCA1': 0.001 + Math.random() * 0.004,
              'BRCA2': 0.001 + Math.random() * 0.003,
              'TP53': 0.0001 + Math.random() * 0.0009,
            },
          },
        },
        instantRetrieval: Array.from({ length: 15 }, (_, j) => ({
          timestamp: new Date(Date.now() - j * 30 * 60 * 1000).toISOString(),
          queryType: ['drug_interaction', 'treatment_protocol', 'genetic_variant', 'clinical_trial'][j % 4],
          query: `Query ${j}`,
          resultsFound: Math.floor(Math.random() * 1000) + 100,
          relevanceScore: 80 + Math.random() * 20,
          retrievalTime: Math.floor(Math.random() * 100) + 20,
          actionTaken: ['Applied to treatment', 'Flagged for review', 'Shared with team', 'Saved for later'][j % 4],
        })),
        contextualInsights: Array.from({ length, 10 }, (_, j) => ({
          patientContext: `Patient context ${j}`,
          insight: `Clinical insight ${j}`,
          evidenceStrength: 70 + Math.random() * 30,
          clinicalSignificance: 75 + Math.random() * 25,
          implementationComplexity: Math.floor(Math.random() * 100),
        })),
      }));
    };

    const generateMockOracles = (): RealTimeDecisionOracle[] => {
      return Array.from({ length, 3 }, (_, i) => ({
        id: `oracle-${i}`,
        patientId: `patient-${i}`,
        currentDilemma: {
          description: [
            'Stage III lung cancer treatment options',
            'Chemotherapy vs immunotherapy choice',
            'Surgical resection timing decision'
          ][i],
          complexity: 70 + Math.random() * 30,
          urgency: 60 + Math.random() * 40,
          stakeholders: ['Patient', 'Family', 'Surgeon', 'Medical Oncologist', 'Radiation Oncologist'],
          potentialOutcomes: Array.from({ length: 4 }, (_, j) => ({
            scenario: `Treatment scenario ${j + 1}`,
            probability: Math.random() * 100,
            benefitScore: 60 + Math.random() * 40,
            riskScore: 20 + Math.random() * 60,
            qualityOfLife: 70 + Math.random() * 30,
            survivalBenefit: 65 + Math.random() * 35,
          })),
        },
        multiUniverseSimulation: {
          simulatedOutcomes: Math.floor(Math.random() * 10000) + 50000,
          convergenceScore: 85 + Math.random() * 15,
          optimalPath: 'Neoadjuvant immunotherapy followed by surgery',
          alternativePaths: [
            { path: 'Surgery first, then adjuvant therapy', probabilitySuccess: 75, riskLevel: 40, timeToOutcome: 180 },
            { path: 'Concurrent chemoradiation', probabilitySuccess: 70, riskLevel: 50, timeToOutcome: 120 },
            { path: 'Immunotherapy alone', probabilitySuccess: 65, riskLevel: 30, timeToOutcome: 90 },
          ],
        },
        ethicalFramework: {
          principleWeights: {
            autonomy: 0.3 + Math.random() * 0.2,
            beneficence: 0.25 + Math.random() * 0.15,
            nonMaleficence: 0.25 + Math.random() * 0.15,
            justice: 0.2 + Math.random() * 0.1,
          },
          conflictResolution: 'Patient autonomy prioritized with full informed consent',
          culturalConsiderations: ['Family decision-making preferences', 'Religious beliefs', 'Cultural attitudes toward disclosure'],
          familyDynamics: 'Strong family support with shared decision-making preference',
        },
        decisionConfidence: {
          aiConfidence: 88 + Math.random() * 12,
          evidenceQuality: 85 + Math.random() * 15,
          consensusLevel: 80 + Math.random() * 20,
          uncertaintyFactors: ['Genomic variability', 'Individual response variation', 'Long-term effects unknown'],
        },
      }));
    };

    const generateMockEnhancements = (): CognitiveEnhancement[] => {
      return ['pattern_recognition', 'memory_augmentation', 'reasoning_acceleration', 'intuition_amplification'].map((type, i) => ({
        id: `enhancement-${i}`,
        enhancementType: type as any,
        baselineMetrics: {
          diagnosisAccuracy: 70 + Math.random() * 15,
          decisionSpeed: 60 + Math.random() * 20,
          patternDetection: 65 + Math.random() * 20,
          knowledgeRecall: 75 + Math.random() * 15,
        },
        augmentedMetrics: {
          diagnosisAccuracy: 85 + Math.random() * 15,
          decisionSpeed: 85 + Math.random() * 15,
          patternDetection: 90 + Math.random() * 10,
          knowledgeRecall: 95 + Math.random() * 5,
        },
        improvementFactors: {
          accuracyGain: 15 + Math.random() * 20,
          speedIncrease: 25 + Math.random() * 50,
          confidenceBoost: 20 + Math.random() * 30,
          cognitiveEfficiency: 30 + Math.random() * 40,
        },
        neuralInterface: {
          brainwaveSync: 80 + Math.random() * 20,
          thoughtPatternRecognition: 75 + Math.random() * 25,
          subConsciousInsights: 70 + Math.random() * 30,
          intuitiveEnhancement: 85 + Math.random() * 15,
        },
      }));
    };

    const generateMockFatigue = (): FatigueManagement[] => {
      return Array.from({ length: 2 }, (_, i) => ({
        id: `fatigue-${i}`,
        oncologistId: `oncologist-${i}`,
        fatigueIndicators: {
          cognitiveLoad: 40 + Math.random() * 40,
          decisionFatigue: 30 + Math.random() * 50,
          emotionalExhaustion: 35 + Math.random() * 45,
          physicalStress: 25 + Math.random() * 40,
          sleepQuality: 60 + Math.random() * 30,
        },
        performanceMetrics: {
          decisionAccuracy: Array.from({ length: 24 }, (_, j) => ({
            timestamp: new Date(Date.now() - j * 60 * 60 * 1000).toISOString(),
            accuracy: 80 + Math.random() * 20 - j * 0.5,
          })),
          responseTime: Array.from({ length: 24 }, (_, j) => ({
            timestamp: new Date(Date.now() - j * 60 * 60 * 1000).toISOString(),
            time: 120 + Math.random() * 60 + j * 2,
          })),
          errorRate: Array.from({ length: 24 }, (_, j) => ({
            timestamp: new Date(Date.now() - j * 60 * 60 * 1000).toISOString(),
            errors: Math.floor(Math.random() * 3) + j * 0.1,
          })),
          patientsPerHour: Array.from({ length: 24 }, (_, j) => ({
            timestamp: new Date(Date.now() - j * 60 * 60 * 1000).toISOString(),
            count: Math.floor(Math.random() * 8) + 4 - j * 0.1,
          })),
        },
        interventions: Array.from({ length: 10 }, (_, j) => ({
          type: ['break_reminder', 'cognitive_rest', 'mindfulness', 'nutrition', 'hydration'][j % 5] as any,
          timestamp: new Date(Date.now() - j * 3 * 60 * 60 * 1000).toISOString(),
          effectiveness: 70 + Math.random() * 30,
          compliance: 60 + Math.random() * 40,
          outcome: 'Improved cognitive performance',
        })),
        optimizationSuggestions: {
          workloadDistribution: 'Redistribute complex cases across team members',
          breakScheduling: 'Schedule 15-minute breaks every 2 hours',
          cognitiveExercises: ['Memory games', 'Pattern recognition training', 'Mindfulness meditation'],
          stressReduction: ['Deep breathing exercises', 'Progressive muscle relaxation', 'Peer support groups'],
        },
      }));
    };

    const generateMockCollaboration = (): CollaborativeIntelligence[] => {
      return Array.from({ length: 1 }, (_, i) => ({
        id: `collaboration-${i}`,
        teamId: `team-${i}`,
        teamMembers: [
          { memberId: 'onc-001', role: 'Medical Oncologist', specialization: 'Breast Cancer', cognitiveStrengths: ['Pattern Recognition', 'Clinical Reasoning'], currentLoad: 75 },
          { memberId: 'surg-001', role: 'Surgical Oncologist', specialization: 'Hepatobiliary', cognitiveStrengths: ['Spatial Reasoning', 'Decision Speed'], currentLoad: 60 },
          { memberId: 'rad-001', role: 'Radiation Oncologist', specialization: 'CNS Tumors', cognitiveStrengths: ['Technical Precision', 'Risk Assessment'], currentLoad: 80 },
          { memberId: 'path-001', role: 'Pathologist', specialization: 'Molecular Pathology', cognitiveStrengths: ['Detail Recognition', 'Classification'], currentLoad: 45 },
        ],
        collectiveIntelligence: {
          teamIQ: 140 + Math.random() * 20,
          consensusBuilding: 85 + Math.random() * 15,
          knowledgeSharing: 90 + Math.random() * 10,
          decisionSynergy: 88 + Math.random() * 12,
        },
        realTimeCollaboration: Array.from({ length: 15 }, (_, j) => ({
          timestamp: new Date(Date.now() - j * 4 * 60 * 60 * 1000).toISOString(),
          caseId: `case-${j}`,
          contributors: ['onc-001', 'surg-001', 'rad-001'].filter(() => Math.random() > 0.3),
          collaborationType: ['consultation', 'second_opinion', 'multidisciplinary', 'emergency'][j % 4] as any,
          outcomeImprovement: 15 + Math.random() * 25,
        })),
        knowledgeDistribution: {
          expertiseMapping: {
            'Immunotherapy': ['onc-001', 'onc-002'],
            'Surgical Techniques': ['surg-001', 'surg-002'],
            'Radiation Planning': ['rad-001'],
            'Molecular Diagnostics': ['path-001'],
          },
          knowledgeGaps: ['CAR-T therapy', 'Liquid biopsies', 'AI diagnostics'],
          learningOpportunities: ['Precision medicine workshop', 'Immunotherapy updates', 'Surgical robotics training'],
          mentorshipPairs: [
            { mentor: 'onc-001', mentee: 'onc-003', focus: 'Clinical decision making' },
            { mentor: 'surg-001', mentee: 'surg-002', focus: 'Minimally invasive techniques' },
          ],
        },
      }));
    };

    setAssistants(generateMockAssistants());
    setKnowledge(generateMockKnowledge());
    setOracles(generateMockOracles());
    setEnhancements(generateMockEnhancements());
    setFatigue(generateMockFatigue());
    setCollaboration(generateMockCollaboration());
  }, []);

  // Canvas visualization for cognitive augmentation
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

      // Draw brain network
      const brainRadius = 80;
      const nodes = 12;
      
      for (let i = 0; i < nodes; i++) {
        const angle = (i / nodes) * 2 * Math.PI;
        const x = centerX + Math.cos(angle) * brainRadius;
        const y = centerY + Math.sin(angle) * brainRadius;
        
        // Draw connections
        for (let j = i + 1; j < nodes; j++) {
          const angle2 = (j / nodes) * 2 * Math.PI;
          const x2 = centerX + Math.cos(angle2) * brainRadius;
          const y2 = centerY + Math.sin(angle2) * brainRadius;
          
          if (Math.random() > 0.7) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 + Math.sin(time + i + j) * 0.2})`;
            ctx.lineWidth = 1 + Math.sin(time + i) * 1;
            ctx.stroke();
          }
        }
        
        // Draw nodes
        ctx.beginPath();
        ctx.arc(x, y, 4 + Math.sin(time + i) * 2, 0, 2 * Math.PI);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
      }

      // Draw AI augmentation layers
      for (let layer = 1; layer <= 3; layer++) {
        const radius = brainRadius + layer * 25;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.3 - layer * 0.08})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw cognitive enhancement beams
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * 2 * Math.PI + time * 0.5;
        const startRadius = brainRadius + 20;
        const endRadius = brainRadius + 100;
        
        const startX = centerX + Math.cos(angle) * startRadius;
        const startY = centerY + Math.sin(angle) * startRadius;
        const endX = centerX + Math.cos(angle) * endRadius;
        const endY = centerY + Math.sin(angle) * endRadius;
        
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.6)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw central brain
      ctx.beginPath();
      ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
      ctx.fillStyle = '#1f2937';
      ctx.fill();

      // Draw labels
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#1f2937';
      ctx.textAlign = 'center';
      ctx.fillText('Cognitive', centerX, centerY - 5);
      ctx.fillText('Augmentation', centerX, centerY + 8);

      requestAnimationFrame(animate);
    };

    animate();
  }, [activeTab]);

  const renderAssistant = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Active Assistants</p>
                <p className="text-2xl font-bold">{assistants.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Accuracy</p>
                <p className="text-2xl font-bold">
                  {(assistants.reduce((sum, a) => sum + a.cognitiveCapabilities.diagnosticAccuracy, 0) / assistants.length || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Processing Speed</p>
                <p className="text-2xl font-bold">
                  {assistants.length > 0 ? assistants[0].realTimeAnalysis.patientDataProcessing : 0}/s
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Cognitive Load</p>
                <p className="text-2xl font-bold">
                  {(assistants.reduce((sum, a) => sum + a.cognitiveLoad.currentLoad, 0) / assistants.length || 0).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cognitive Augmentation Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas
              ref={canvasRef}
              className="w-full h-64 border rounded"
              style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)' }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cognitive Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assistants[0] && Object.entries(assistants[0].cognitiveCapabilities).map(([capability, value]) => (
                <div key={capability} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm capitalize">{capability.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-sm font-medium">{value.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Cognitive Assistants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assistants.map((assistant) => (
              <div key={assistant.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{assistant.name}</h4>
                    <p className="text-sm text-gray-600">
                      {assistant.specialization.join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      assistant.cognitiveLoad.currentLoad < 50 ? 'bg-green-100 text-green-800' :
                      assistant.cognitiveLoad.currentLoad < 80 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {assistant.cognitiveLoad.currentLoad}% Load
                    </span>
                    <span className="text-sm font-medium">
                      {assistant.cognitiveCapabilities.diagnosticAccuracy.toFixed(1)}% Accuracy
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Patient Processing</p>
                    <p className="font-medium">{assistant.realTimeAnalysis.patientDataProcessing}/s</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Literature Scan</p>
                    <p className="font-medium">{assistant.realTimeAnalysis.literatureScanning}/min</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Drug Interactions</p>
                    <p className="font-medium">{assistant.realTimeAnalysis.drugInteractionChecking}/s</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Recent Decisions</p>
                    <p className="font-medium">{assistant.decisionSupport.filter(d => 
                      new Date(d.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
                    ).length}</p>
                  </div>
                </div>

                {assistant.cognitiveLoad.stressIndicators.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-sm font-medium mb-2">Current Stress Indicators</h5>
                    <div className="flex flex-wrap gap-2">
                      {assistant.cognitiveLoad.stressIndicators.map((indicator, i) => (
                        <span key={i} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                          {indicator}
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

  const renderKnowledge = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Medical Papers</p>
                <p className="text-2xl font-bold">
                  {knowledge.length > 0 ? `${(knowledge[0].globalKnowledgeBase.medicalLiterature.totalPapers / 1000000).toFixed(1)}M` : '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Active Trials</p>
                <p className="text-2xl font-bold">
                  {knowledge.length > 0 ? `${(knowledge[0].globalKnowledgeBase.clinicalTrials.activeTrials / 1000).toFixed(0)}K` : '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Retrieval Time</p>
                <p className="text-2xl font-bold">
                  {knowledge.length > 0 ? `${knowledge[0].globalKnowledgeBase.medicalLiterature.accessTime}ms` : '0ms'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Relevance Score</p>
                <p className="text-2xl font-bold">
                  {knowledge.length > 0 ? `${knowledge[0].globalKnowledgeBase.medicalLiterature.relevanceScore.toFixed(0)}%` : '0%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {knowledge.map((kb) => (
        <Card key={kb.id}>
          <CardHeader>
            <CardTitle>Global Knowledge Augmentation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border rounded p-4">
                  <h5 className="font-medium mb-2">Medical Literature</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Papers</span>
                      <span className="font-medium">{(kb.globalKnowledgeBase.medicalLiterature.totalPapers / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recent Updates</span>
                      <span className="font-medium">{kb.globalKnowledgeBase.medicalLiterature.recentUpdates}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Access Time</span>
                      <span className="font-medium">{kb.globalKnowledgeBase.medicalLiterature.accessTime}ms</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded p-4">
                  <h5 className="font-medium mb-2">Clinical Trials</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Active Trials</span>
                      <span className="font-medium">{(kb.globalKnowledgeBase.clinicalTrials.activeTrials / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Relevant</span>
                      <span className="font-medium">{kb.globalKnowledgeBase.clinicalTrials.relevantTrials}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Enrollment Ops</span>
                      <span className="font-medium">{kb.globalKnowledgeBase.clinicalTrials.enrollmentOpportunities}</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded p-4">
                  <h5 className="font-medium mb-2">Drug Database</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Drugs</span>
                      <span className="font-medium">{(kb.globalKnowledgeBase.drugDatabase.totalDrugs / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interactions</span>
                      <span className="font-medium">{(kb.globalKnowledgeBase.drugDatabase.interactions / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contraindications</span>
                      <span className="font-medium">{(kb.globalKnowledgeBase.drugDatabase.contraindications / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded p-4">
                  <h5 className="font-medium mb-2">Genetic Variants</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Known Variants</span>
                      <span className="font-medium">{(kb.globalKnowledgeBase.geneticVariants.knownVariants / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Therapeutic</span>
                      <span className="font-medium">{(kb.globalKnowledgeBase.geneticVariants.therapeuticImplications / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">Recent Knowledge Retrievals</h5>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {kb.instantRetrieval.slice(0, 8).map((retrieval, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-l-2 border-blue-200 pl-3">
                      <div>
                        <span className="font-medium capitalize">{retrieval.queryType.replace('_', ' ')}</span>
                        <span className="text-gray-600 ml-2">({retrieval.resultsFound} results)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{retrieval.retrievalTime}ms</span>
                        <span className="text-xs font-medium">{retrieval.relevanceScore.toFixed(0)}%</span>
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

  const renderOracles = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Active Oracles</p>
                <p className="text-2xl font-bold">{oracles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">AI Confidence</p>
                <p className="text-2xl font-bold">
                  {(oracles.reduce((sum, o) => sum + o.decisionConfidence.aiConfidence, 0) / oracles.length || 0).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Simulations</p>
                <p className="text-2xl font-bold">
                  {oracles.length > 0 ? `${(oracles[0].multiUniverseSimulation.simulatedOutcomes / 1000).toFixed(0)}K` : '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Convergence</p>
                <p className="text-2xl font-bold">
                  {(oracles.reduce((sum, o) => sum + o.multiUniverseSimulation.convergenceScore, 0) / oracles.length || 0).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {oracles.map((oracle) => (
        <Card key={oracle.id}>
          <CardHeader>
            <CardTitle>Decision Oracle: Patient {oracle.patientId}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h5 className="font-medium mb-3">Current Clinical Dilemma</h5>
                <div className="border rounded p-4 bg-gray-50">
                  <p className="text-sm font-medium">{oracle.currentDilemma.description}</p>
                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-gray-600">Complexity: </span>
                      <span className="font-medium">{oracle.currentDilemma.complexity.toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Urgency: </span>
                      <span className="font-medium">{oracle.currentDilemma.urgency.toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Stakeholders: </span>
                      <span className="font-medium">{oracle.currentDilemma.stakeholders.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">Multi-Universe Simulation Results</h5>
                <div className="border rounded p-4">
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Optimal Path:</p>
                    <p className="font-medium">{oracle.multiUniverseSimulation.optimalPath}</p>
                  </div>
                  <div className="space-y-2">
                    {oracle.multiUniverseSimulation.alternativePaths.map((path, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span>{path.path}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-600">{path.probabilitySuccess}% success</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            path.riskLevel < 30 ? 'bg-green-100 text-green-800' :
                            path.riskLevel < 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {path.riskLevel}% risk
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-3">Ethical Framework</h5>
                  <div className="space-y-2">
                    {Object.entries(oracle.ethicalFramework.principleWeights).map(([principle, weight]) => (
                      <div key={principle} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{principle}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${weight * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{(weight * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-3">Decision Confidence</h5>
                  <div className="space-y-2">
                    {Object.entries(oracle.decisionConfidence).slice(0, 3).map(([metric, value]) => (
                      <div key={metric} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-sm font-medium">{typeof value === 'number' ? `${value.toFixed(0)}%` : value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">Potential Outcomes</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {oracle.currentDilemma.potentialOutcomes.slice(0, 4).map((outcome, i) => (
                    <div key={i} className="border rounded p-3">
                      <h6 className="font-medium text-sm">{outcome.scenario}</h6>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div>
                          <p className="text-gray-600">Probability</p>
                          <p className="font-medium">{outcome.probability.toFixed(0)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Benefit</p>
                          <p className="font-medium">{outcome.benefitScore.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Risk</p>
                          <p className="font-medium">{outcome.riskScore.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">QoL</p>
                          <p className="font-medium">{outcome.qualityOfLife.toFixed(0)}</p>
                        </div>
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

  const renderEnhancements = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Enhancement Types</p>
                <p className="text-2xl font-bold">{enhancements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Accuracy Gain</p>
                <p className="text-2xl font-bold">
                  {(enhancements.reduce((sum, e) => sum + e.improvementFactors.accuracyGain, 0) / enhancements.length || 0).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Speed Increase</p>
                <p className="text-2xl font-bold">
                  {(enhancements.reduce((sum, e) => sum + e.improvementFactors.speedIncrease, 0) / enhancements.length || 0).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Neural Sync</p>
                <p className="text-2xl font-bold">
                  {(enhancements.reduce((sum, e) => sum + e.neuralInterface.brainwaveSync, 0) / enhancements.length || 0).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enhancements.map((enhancement) => (
          <Card key={enhancement.id}>
            <CardHeader>
              <CardTitle className="capitalize">
                {enhancement.enhancementType.replace(/_/g, ' ')} Enhancement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium mb-3">Performance Comparison</h5>
                  <div className="space-y-3">
                    {Object.entries(enhancement.baselineMetrics).map(([metric, baseline]) => {
                      const augmented = enhancement.augmentedMetrics[metric as keyof typeof enhancement.augmentedMetrics];
                      const improvement = ((augmented - baseline) / baseline) * 100;
                      
                      return (
                        <div key={metric} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-green-600 font-medium">+{improvement.toFixed(0)}%</span>
                          </div>
                          <div className="flex space-x-2">
                            <div className="flex-1">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gray-400 h-2 rounded-full"
                                  style={{ width: `${baseline}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600">Baseline: {baseline.toFixed(0)}%</span>
                            </div>
                            <div className="flex-1">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${augmented}%` }}
                                />
                              </div>
                              <span className="text-xs text-green-600">Enhanced: {augmented.toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-3">Neural Interface Metrics</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(enhancement.neuralInterface).map(([metric, value]) => (
                      <div key={metric} className="text-center">
                        <p className="text-xs text-gray-600 capitalize">{metric.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-lg font-bold">{value.toFixed(0)}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div
                            className="bg-purple-500 h-1 rounded-full"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-3">Improvement Factors</h5>
                  <div className="space-y-2">
                    {Object.entries(enhancement.improvementFactors).map(([factor, value]) => (
                      <div key={factor} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{factor.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-sm font-medium">+{value.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-blue-600 rounded-lg">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI-Powered Oncologist Cognitive Augmentation</h1>
          <p className="text-gray-600">Revolutionary AI that enhances clinical reasoning and decision-making capabilities</p>
        </div>
      </div>

      <div className="flex space-x-4 border-b">
        {[
          { id: 'assistant', label: 'Cognitive Assistant', icon: Brain },
          { id: 'knowledge', label: 'Knowledge Augmentation', icon: BarChart3 },
          { id: 'oracles', label: 'Decision Oracles', icon: Lightbulb },
          { id: 'enhancements', label: 'Cognitive Enhancement', icon: Zap },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'assistant' && renderAssistant()}
        {activeTab === 'knowledge' && renderKnowledge()}
        {activeTab === 'oracles' && renderOracles()}
        {activeTab === 'enhancements' && renderEnhancements()}
      </div>
    </div>
  );
};

export default OncologistCognitiveAugmentation;