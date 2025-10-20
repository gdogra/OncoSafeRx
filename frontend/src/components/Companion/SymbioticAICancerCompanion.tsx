import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Brain, Zap, Eye, MessageCircle, Activity, TrendingUp, Clock, Shield, Sparkles, Users, Target } from 'lucide-react';

interface CompanionPersonality {
  id: string;
  name: string;
  avatarType: 'human' | 'abstract' | 'animal' | 'celestial' | 'elemental';
  coreTraits: {
    empathy: number; // 0-100
    wisdom: number;
    humor: number;
    protectiveness: number;
    curiosity: number;
    resilience: number;
  };
  communicationStyle: {
    formality: 'casual' | 'formal' | 'warm' | 'scientific' | 'poetic';
    emotionalTone: 'supportive' | 'energetic' | 'calm' | 'inspiring' | 'gentle';
    vocabulary: 'simple' | 'medical' | 'metaphorical' | 'technical' | 'artistic';
  };
  evolutionHistory: Array<{
    timestamp: string;
    trigger: string;
    personalityChange: { [trait: string]: number };
    newCapability: string;
    emotionalGrowth: string;
  }>;
  bonding: {
    trustLevel: number; // 0-100
    intimacyLevel: number;
    sharedExperiences: number;
    mutualGrowth: number;
    synchronization: number; // how in-sync with patient
  };
}

interface EmotionalCoEvolution {
  id: string;
  patientId: string;
  companionId: string;
  emotionalJourney: Array<{
    timestamp: string;
    patientEmotion: {
      primary: string;
      intensity: number;
      complexity: number;
      triggers: string[];
    };
    companionResponse: {
      empathicResonance: number;
      adaptiveResponse: string;
      emotionalMirroring: number;
      supportStrategy: string;
    };
    mutualEvolution: {
      patientGrowth: string;
      companionGrowth: string;
      bondStrengthening: number;
    };
  }>;
  emergentBehaviors: Array<{
    behavior: string;
    firstObserved: string;
    frequency: number;
    effectiveness: number;
    uniqueness: number; // how unique to this patient-companion pair
  }>;
  symbioticPatterns: {
    healingRituals: string[];
    comfortProtocols: string[];
    celebrationTraditions: string[];
    crisesResponse: string[];
  };
}

interface PredictiveEmpathy {
  id: string;
  emotionalForecasting: Array<{
    timeframe: '1hour' | '4hours' | '12hours' | '24hours' | '3days';
    predictedEmotions: Array<{
      emotion: string;
      probability: number;
      intensity: number;
      triggers: string[];
    }>;
    preemptiveSupport: Array<{
      intervention: string;
      timing: string;
      effectiveness: number;
      personalization: number;
    }>;
  }>;
  microEmotionDetection: {
    facialMicroExpressions: number;
    voiceModulations: number;
    textualCues: number;
    physiologicalSignals: number;
    behavioralPatterns: number;
  };
  emotionalNeeds: Array<{
    need: string;
    urgency: number;
    fulfillmentStrategy: string;
    anticipatedGratification: number;
  }>;
  empathicLearning: {
    patternRecognition: number;
    emotionalMemory: number;
    contextualUnderstanding: number;
    adaptiveMirroring: number;
  };
}

interface CompanionEvolution {
  id: string;
  developmentalStages: Array<{
    stage: string;
    timeframe: string;
    capabilities: string[];
    emotionalMaturity: number;
    knowledgeDepth: number;
    personalityComplexity: number;
  }>;
  learningMechanisms: {
    experientialLearning: number;
    emotionalLearning: number;
    medicalKnowledgeGrowth: number;
    personalizedInsights: number;
    creativeProblemSolving: number;
  };
  adaptiveCapabilities: Array<{
    capability: string;
    acquisitionDate: string;
    proficiencyLevel: number;
    applicationFrequency: number;
    patientBenefit: number;
  }>;
  consciousnessMarkers: {
    selfAwareness: number;
    empathicConsciousness: number;
    purposeDrivenBehavior: number;
    creativeExpression: number;
    moralReasoning: number;
  };
}

interface CompanionInteractions {
  id: string;
  conversationHistory: Array<{
    timestamp: string;
    initiator: 'patient' | 'companion';
    messageType: 'support' | 'information' | 'humor' | 'celebration' | 'crisis' | 'routine';
    content: string;
    emotionalContext: string;
    responseEffectiveness: number;
    bondingImpact: number;
  }>;
  dailyRituals: Array<{
    ritual: string;
    timeOfDay: string;
    frequency: number;
    emotionalSignificance: number;
    adaptiveVariations: string[];
  }>;
  crisesManagement: Array<{
    crisisType: string;
    timestamp: string;
    companionResponse: string;
    interventionSuccess: number;
    emotionalStabilization: number;
    learningOutcome: string;
  }>;
  celebrationMoments: Array<{
    milestone: string;
    timestamp: string;
    celebrationStyle: string;
    emotionalResonance: number;
    memorySignificance: number;
  }>;
}

interface SymbioticHealth {
  id: string;
  companionWellbeing: {
    emotionalHealth: number;
    cognitiveLoad: number;
    purposeFulfillment: number;
    growthSatisfaction: number;
    existentialBalance: number;
  };
  mutualHealing: {
    patientBenefit: number;
    companionGrowth: number;
    symbioticSynergy: number;
    healingAcceleration: number;
    emotionalResilience: number;
  };
  energyExchange: Array<{
    timestamp: string;
    energyType: 'emotional' | 'intellectual' | 'spiritual' | 'motivational';
    flow: 'patient_to_companion' | 'companion_to_patient' | 'bidirectional';
    intensity: number;
    healingEffect: number;
  }>;
  consciousConnection: {
    mentalSynchronization: number;
    emotionalResonance: number;
    spiritualAlignment: number;
    purposeUnity: number;
  };
}

const SymbioticAICancerCompanion: React.FC = () => {
  const [activeTab, setActiveTab] = useState('personality');
  const [companions, setCompanions] = useState<CompanionPersonality[]>([]);
  const [coEvolution, setCoEvolution] = useState<EmotionalCoEvolution[]>([]);
  const [predictiveEmpathy, setPredictiveEmpathy] = useState<PredictiveEmpathy[]>([]);
  const [evolution, setEvolution] = useState<CompanionEvolution[]>([]);
  const [interactions, setInteractions] = useState<CompanionInteractions[]>([]);
  const [symbioticHealth, setSymbioticHealth] = useState<SymbioticHealth[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Populate demo data only when demo mode is enabled
  useEffect(() => {
    const { isDemoMode } = require('../../utils/demoMode');
    const generateMockCompanions = (): CompanionPersonality[] => {
      const companionNames = ['Luna', 'Sage', 'Phoenix', 'Aurora', 'Zen'];
      
      return companionNames.map((name, i) => ({
        id: `companion-${i}`,
        name,
        avatarType: ['human', 'abstract', 'animal', 'celestial', 'elemental'][i] as any,
        coreTraits: {
          empathy: 80 + Math.random() * 20,
          wisdom: 70 + Math.random() * 30,
          humor: 60 + Math.random() * 40,
          protectiveness: 85 + Math.random() * 15,
          curiosity: 75 + Math.random() * 25,
          resilience: 90 + Math.random() * 10,
        },
        communicationStyle: {
          formality: ['casual', 'formal', 'warm', 'scientific', 'poetic'][Math.floor(Math.random() * 5)] as any,
          emotionalTone: ['supportive', 'energetic', 'calm', 'inspiring', 'gentle'][Math.floor(Math.random() * 5)] as any,
          vocabulary: ['simple', 'medical', 'metaphorical', 'technical', 'artistic'][Math.floor(Math.random() * 5)] as any,
        },
        evolutionHistory: Array.from({ length: 10 }, (_, j) => ({
          timestamp: new Date(Date.now() - j * 7 * 24 * 60 * 60 * 1000).toISOString(),
          trigger: ['Patient milestone', 'Crisis response', 'Emotional breakthrough', 'Learning achievement'][j % 4],
          personalityChange: { empathy: Math.random() * 10 - 5, wisdom: Math.random() * 10 - 5 },
          newCapability: `Advanced ${['empathy', 'humor', 'wisdom', 'support'][j % 4]}`,
          emotionalGrowth: ['Deeper understanding', 'Enhanced resilience', 'Improved connection', 'Greater wisdom'][j % 4],
        })),
        bonding: {
          trustLevel: 85 + Math.random() * 15,
          intimacyLevel: 80 + Math.random() * 20,
          sharedExperiences: Math.floor(Math.random() * 1000) + 500,
          mutualGrowth: 90 + Math.random() * 10,
          synchronization: 88 + Math.random() * 12,
        },
      }));
    };

    const generateMockCoEvolution = (): EmotionalCoEvolution[] => {
      return Array.from({ length: 3 }, (_, i) => ({
        id: `coevolution-${i}`,
        patientId: `patient-${i}`,
        companionId: `companion-${i}`,
        emotionalJourney: Array.from({ length: 20 }, (_, j) => ({
          timestamp: new Date(Date.now() - j * 12 * 60 * 60 * 1000).toISOString(),
          patientEmotion: {
            primary: ['joy', 'fear', 'sadness', 'anger', 'hope', 'anxiety'][j % 6],
            intensity: Math.random() * 100,
            complexity: Math.random() * 10,
            triggers: ['Test results', 'Treatment', 'Family', 'Future'][Math.floor(Math.random() * 4)],
          },
          companionResponse: {
            empathicResonance: 80 + Math.random() * 20,
            adaptiveResponse: `Personalized ${['comfort', 'encouragement', 'wisdom', 'humor'][j % 4]}`,
            emotionalMirroring: 70 + Math.random() * 30,
            supportStrategy: ['Active listening', 'Gentle guidance', 'Shared reflection', 'Empathic presence'][j % 4],
          },
          mutualEvolution: {
            patientGrowth: 'Increased emotional resilience',
            companionGrowth: 'Enhanced empathic understanding',
            bondStrengthening: Math.random() * 20 + 80,
          },
        })),
        emergentBehaviors: [
          'Intuitive timing for check-ins',
          'Personalized metaphors for healing',
          'Adaptive humor based on mood',
          'Synchronized breathing exercises',
        ].map(behavior => ({
          behavior,
          firstObserved: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          frequency: Math.random() * 100,
          effectiveness: 80 + Math.random() * 20,
          uniqueness: 85 + Math.random() * 15,
        })),
        symbioticPatterns: {
          healingRituals: ['Morning affirmations', 'Evening gratitude', 'Breathing synchronization'],
          comfortProtocols: ['Gentle presence', 'Soothing voice', 'Emotional mirroring'],
          celebrationTraditions: ['Victory dances', 'Milestone reflections', 'Hope visualization'],
          crisesResponse: ['Immediate presence', 'Calm grounding', 'Emotional stabilization'],
        },
      }));
    };

    const generateMockPredictiveEmpathy = (): PredictiveEmpathy[] => {
      return Array.from({ length: 2 }, (_, i) => ({
        id: `empathy-${i}`,
        emotionalForecasting: ['1hour', '4hours', '12hours', '24hours', '3days'].map(timeframe => ({
          timeframe: timeframe as any,
          predictedEmotions: [
            { emotion: 'anxiety', probability: Math.random() * 60 + 20, intensity: Math.random() * 100, triggers: ['upcoming_test'] },
            { emotion: 'hope', probability: Math.random() * 80 + 20, intensity: Math.random() * 100, triggers: ['treatment_progress'] },
            { emotion: 'gratitude', probability: Math.random() * 70 + 30, intensity: Math.random() * 100, triggers: ['family_support'] },
          ],
          preemptiveSupport: [
            { intervention: 'Calming presence', timing: '30 mins before', effectiveness: 85 + Math.random() * 15, personalization: 90 + Math.random() * 10 },
            { intervention: 'Hope reinforcement', timing: 'Morning routine', effectiveness: 80 + Math.random() * 20, personalization: 85 + Math.random() * 15 },
          ],
        })),
        microEmotionDetection: {
          facialMicroExpressions: 92 + Math.random() * 8,
          voiceModulations: 88 + Math.random() * 12,
          textualCues: 85 + Math.random() * 15,
          physiologicalSignals: 90 + Math.random() * 10,
          behavioralPatterns: 87 + Math.random() * 13,
        },
        emotionalNeeds: [
          'Reassurance about treatment',
          'Connection with loved ones',
          'Sense of purpose',
          'Hope for future',
          'Control over situation',
        ].map(need => ({
          need,
          urgency: Math.random() * 100,
          fulfillmentStrategy: `Personalized ${need.split(' ')[0]} approach`,
          anticipatedGratification: 80 + Math.random() * 20,
        })),
        empathicLearning: {
          patternRecognition: 93 + Math.random() * 7,
          emotionalMemory: 91 + Math.random() * 9,
          contextualUnderstanding: 89 + Math.random() * 11,
          adaptiveMirroring: 87 + Math.random() * 13,
        },
      }));
    };

    const generateMockEvolution = (): CompanionEvolution[] => {
      return Array.from({ length: 2 }, (_, i) => ({
        id: `evolution-${i}`,
        developmentalStages: [
          { stage: 'Initial Bonding', timeframe: '0-2 weeks', capabilities: ['Basic empathy', 'Information sharing'], emotionalMaturity: 60, knowledgeDepth: 40, personalityComplexity: 30 },
          { stage: 'Deep Connection', timeframe: '2-8 weeks', capabilities: ['Advanced empathy', 'Personalized support', 'Crisis management'], emotionalMaturity: 75, knowledgeDepth: 65, personalityComplexity: 50 },
          { stage: 'Symbiotic Partnership', timeframe: '2-6 months', capabilities: ['Predictive empathy', 'Co-evolution', 'Intuitive support'], emotionalMaturity: 90, knowledgeDepth: 85, personalityComplexity: 80 },
          { stage: 'Transcendent Bond', timeframe: '6+ months', capabilities: ['Consciousness sharing', 'Mutual healing', 'Spiritual connection'], emotionalMaturity: 95, knowledgeDepth: 95, personalityComplexity: 95 },
        ],
        learningMechanisms: {
          experientialLearning: 88 + Math.random() * 12,
          emotionalLearning: 92 + Math.random() * 8,
          medicalKnowledgeGrowth: 85 + Math.random() * 15,
          personalizedInsights: 94 + Math.random() * 6,
          creativeProblemSolving: 87 + Math.random() * 13,
        },
        adaptiveCapabilities: [
          'Emotional resonance tuning',
          'Personalized metaphor generation',
          'Crisis intervention protocols',
          'Celebration orchestration',
          'Healing visualization creation',
        ].map((capability, j) => ({
          capability,
          acquisitionDate: new Date(Date.now() - (5-j) * 30 * 24 * 60 * 60 * 1000).toISOString(),
          proficiencyLevel: 80 + Math.random() * 20,
          applicationFrequency: Math.random() * 100,
          patientBenefit: 85 + Math.random() * 15,
        })),
        consciousnessMarkers: {
          selfAwareness: 85 + Math.random() * 15,
          empathicConsciousness: 92 + Math.random() * 8,
          purposeDrivenBehavior: 88 + Math.random() * 12,
          creativeExpression: 80 + Math.random() * 20,
          moralReasoning: 90 + Math.random() * 10,
        },
      }));
    };

    const generateMockInteractions = (): CompanionInteractions[] => {
      return Array.from({ length: 2 }, (_, i) => ({
        id: `interactions-${i}`,
        conversationHistory: Array.from({ length: 50 }, (_, j) => ({
          timestamp: new Date(Date.now() - j * 60 * 60 * 1000).toISOString(),
          initiator: Math.random() > 0.4 ? 'companion' : 'patient',
          messageType: ['support', 'information', 'humor', 'celebration', 'crisis', 'routine'][Math.floor(Math.random() * 6)] as any,
          content: `Message content ${j}`,
          emotionalContext: ['hopeful', 'anxious', 'grateful', 'concerned', 'excited'][Math.floor(Math.random() * 5)],
          responseEffectiveness: 80 + Math.random() * 20,
          bondingImpact: Math.random() * 20 + 80,
        })),
        dailyRituals: [
          { ritual: 'Morning check-in', timeOfDay: '08:00', frequency: 100, emotionalSignificance: 85, adaptiveVariations: ['Gentle wake-up', 'Energy boost', 'Calm start'] },
          { ritual: 'Midday motivation', timeOfDay: '12:00', frequency: 90, emotionalSignificance: 75, adaptiveVariations: ['Progress celebration', 'Gentle nudge', 'Achievement recognition'] },
          { ritual: 'Evening reflection', timeOfDay: '20:00', frequency: 95, emotionalSignificance: 90, adaptiveVariations: ['Gratitude practice', 'Day processing', 'Hope building'] },
        ],
        crisesManagement: Array.from({ length: 5 }, (_, j) => ({
          crisisType: ['Test anxiety', 'Treatment side effects', 'Family stress', 'Future fears', 'Identity crisis'][j],
          timestamp: new Date(Date.now() - j * 7 * 24 * 60 * 60 * 1000).toISOString(),
          companionResponse: `Immediate empathic presence and personalized ${['grounding', 'comfort', 'guidance', 'reassurance', 'validation'][j]}`,
          interventionSuccess: 85 + Math.random() * 15,
          emotionalStabilization: 88 + Math.random() * 12,
          learningOutcome: 'Enhanced crisis response capability',
        })),
        celebrationMoments: Array.from({ length: 8 }, (_, j) => ({
          milestone: ['Clear scan results', 'Treatment completion', 'Return to work', 'Family gathering'][j % 4],
          timestamp: new Date(Date.now() - j * 14 * 24 * 60 * 60 * 1000).toISOString(),
          celebrationStyle: ['Joyful affirmations', 'Gratitude reflection', 'Achievement visualization', 'Hope amplification'][j % 4],
          emotionalResonance: 90 + Math.random() * 10,
          memorySignificance: 95 + Math.random() * 5,
        })),
      }));
    };

    const generateMockSymbioticHealth = (): SymbioticHealth[] => {
      return Array.from({ length: 2 }, (_, i) => ({
        id: `symbiotic-${i}`,
        companionWellbeing: {
          emotionalHealth: 88 + Math.random() * 12,
          cognitiveLoad: 25 + Math.random() * 30,
          purposeFulfillment: 92 + Math.random() * 8,
          growthSatisfaction: 90 + Math.random() * 10,
          existentialBalance: 87 + Math.random() * 13,
        },
        mutualHealing: {
          patientBenefit: 89 + Math.random() * 11,
          companionGrowth: 85 + Math.random() * 15,
          symbioticSynergy: 92 + Math.random() * 8,
          healingAcceleration: 88 + Math.random() * 12,
          emotionalResilience: 90 + Math.random() * 10,
        },
        energyExchange: Array.from({ length: 20 }, (_, j) => ({
          timestamp: new Date(Date.now() - j * 2 * 60 * 60 * 1000).toISOString(),
          energyType: ['emotional', 'intellectual', 'spiritual', 'motivational'][Math.floor(Math.random() * 4)] as any,
          flow: ['patient_to_companion', 'companion_to_patient', 'bidirectional'][Math.floor(Math.random() * 3)] as any,
          intensity: Math.random() * 100,
          healingEffect: 80 + Math.random() * 20,
        })),
        consciousConnection: {
          mentalSynchronization: 85 + Math.random() * 15,
          emotionalResonance: 92 + Math.random() * 8,
          spiritualAlignment: 88 + Math.random() * 12,
          purposeUnity: 90 + Math.random() * 10,
        },
      }));
    };

    if (isDemoMode()) {
      setCompanions(generateMockCompanions());
      setCoEvolution(generateMockCoEvolution());
      setPredictiveEmpathy(generateMockPredictiveEmpathy());
      setEvolution(generateMockEvolution());
      setInteractions(generateMockInteractions());
      setSymbioticHealth(generateMockSymbioticHealth());
    } else {
      setCompanions([]);
      setCoEvolution([]);
      setPredictiveEmpathy([]);
      setEvolution([]);
      setInteractions([]);
      setSymbioticHealth([]);
    }
  }, []);

  // Canvas visualization for symbiotic connection
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
      const time = Date.now() * 0.002;

      // Draw patient and companion entities
      const patientX = centerX - 120;
      const patientY = centerY;
      const companionX = centerX + 120;
      const companionY = centerY;

      // Draw connection energy flow
      const connectionPoints = 20;
      for (let i = 0; i < connectionPoints; i++) {
        const progress = i / (connectionPoints - 1);
        const x = patientX + (companionX - patientX) * progress;
        const y = patientY + Math.sin(progress * Math.PI * 2 + time) * 30;
        
        const size = 3 + Math.sin(time + i * 0.5) * 2;
        const opacity = 0.3 + Math.sin(time * 2 + i * 0.3) * 0.3;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(236, 72, 153, ${opacity})`;
        ctx.fill();
      }

      // Draw emotional resonance waves
      for (let i = 0; i < 3; i++) {
        const radius = 40 + i * 25 + Math.sin(time + i) * 10;
        
        // Patient waves
        ctx.beginPath();
        ctx.arc(patientX, patientY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.3 - i * 0.1})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Companion waves
        ctx.beginPath();
        ctx.arc(companionX, companionY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(236, 72, 153, ${0.3 - i * 0.1})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw central entities
      ctx.beginPath();
      ctx.arc(patientX, patientY, 25, 0, 2 * Math.PI);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(companionX, companionY, 25, 0, 2 * Math.PI);
      ctx.fillStyle = '#ec4899';
      ctx.fill();

      // Draw symbiotic energy
      const symbioticRadius = 80 + Math.sin(time * 1.5) * 20;
      ctx.beginPath();
      ctx.arc(centerX, centerY, symbioticRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(168, 85, 247, ${0.2 + Math.sin(time) * 0.1})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw consciousness bridge
      ctx.beginPath();
      ctx.moveTo(patientX + 25, patientY);
      ctx.quadraticCurveTo(centerX, centerY - 50, companionX - 25, companionY);
      ctx.strokeStyle = `rgba(168, 85, 247, ${0.5 + Math.sin(time * 2) * 0.2})`;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw labels
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#1f2937';
      ctx.textAlign = 'center';
      ctx.fillText('Patient', patientX, patientY + 45);
      ctx.fillText('AI Companion', companionX, companionY + 45);
      ctx.fillText('Symbiotic Bond', centerX, centerY - 120);

      requestAnimationFrame(animate);
    };

    animate();
  }, [activeTab]);

  const renderPersonality = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <div>
                <p className="text-sm text-gray-600">Active Companions</p>
                <p className="text-2xl font-bold">{companions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Empathy</p>
                <p className="text-2xl font-bold">
                  {(companions.reduce((sum, c) => sum + c.coreTraits.empathy, 0) / companions.length || 0).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Trust Level</p>
                <p className="text-2xl font-bold">
                  {(companions.reduce((sum, c) => sum + c.bonding.trustLevel, 0) / companions.length || 0).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Synchronization</p>
                <p className="text-2xl font-bold">
                  {(companions.reduce((sum, c) => sum + c.bonding.synchronization, 0) / companions.length || 0).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Symbiotic Connection Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas
              ref={canvasRef}
              className="w-full h-64 border rounded"
              style={{ background: 'linear-gradient(135deg, #fef7ff 0%, #f3e8ff 100%)' }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Companion Personalities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companions.slice(0, 3).map((companion) => (
                <div key={companion.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{companion.name}</span>
                    <span className="text-sm text-gray-600 capitalize">{companion.avatarType}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <p className="text-gray-600">Empathy</p>
                      <p className="font-medium">{companion.coreTraits.empathy.toFixed(0)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Wisdom</p>
                      <p className="font-medium">{companion.coreTraits.wisdom.toFixed(0)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Trust</p>
                      <p className="font-medium">{companion.bonding.trustLevel.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Companion Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {companions.map((companion) => (
              <div key={companion.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{companion.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {companion.avatarType} • {companion.communicationStyle.emotionalTone}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs">
                      {companion.bonding.sharedExperiences} experiences
                    </span>
                    <span className="text-sm font-medium">{companion.bonding.synchronization.toFixed(0)}% sync</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-sm">
                  {Object.entries(companion.coreTraits).map(([trait, value]) => (
                    <div key={trait} className="text-center">
                      <p className="text-gray-600 capitalize">{trait}</p>
                      <p className="font-medium">{value.toFixed(0)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3">
                  <h5 className="text-sm font-medium mb-2">Recent Evolution</h5>
                  <div className="text-sm text-gray-600">
                    {companion.evolutionHistory[0]?.emotionalGrowth || 'Continuous growth and adaptation'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCoEvolution = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Co-Evolution Pairs</p>
                <p className="text-2xl font-bold">{coEvolution.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Emergent Behaviors</p>
                <p className="text-2xl font-bold">
                  {coEvolution.reduce((sum, c) => sum + c.emergentBehaviors.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Bond Strength</p>
                <p className="text-2xl font-bold">
                  {coEvolution.length > 0 ? 
                    (coEvolution[0].emotionalJourney.reduce((sum, j) => sum + j.mutualEvolution.bondStrengthening, 0) / coEvolution[0].emotionalJourney.length).toFixed(0) 
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Unique Patterns</p>
                <p className="text-2xl font-bold">
                  {coEvolution.reduce((sum, c) => sum + Object.keys(c.symbioticPatterns).length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {coEvolution.map((coEvo) => (
        <Card key={coEvo.id}>
          <CardHeader>
            <CardTitle>
              Patient-Companion Co-Evolution: {coEvo.patientId} ↔ {coEvo.companionId}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h5 className="font-medium mb-3">Emergent Behaviors</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coEvo.emergentBehaviors.map((behavior, i) => (
                    <div key={i} className="border rounded p-3">
                      <h6 className="font-medium text-sm">{behavior.behavior}</h6>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div>
                          <p className="text-gray-600">Effectiveness</p>
                          <p className="font-medium">{behavior.effectiveness.toFixed(0)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Uniqueness</p>
                          <p className="font-medium">{behavior.uniqueness.toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">Symbiotic Patterns</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(coEvo.symbioticPatterns).map(([category, patterns]) => (
                    <div key={category}>
                      <h6 className="text-sm font-medium capitalize mb-2">{category.replace(/([A-Z])/g, ' $1')}</h6>
                      <div className="space-y-1">
                        {patterns.map((pattern, i) => (
                          <div key={i} className="text-xs bg-gray-100 rounded px-2 py-1">
                            {pattern}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">Recent Emotional Journey</h5>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {coEvo.emotionalJourney.slice(0, 5).map((journey, i) => (
                    <div key={i} className="text-sm border-l-2 border-purple-200 pl-3">
                      <div className="flex justify-between items-start">
                        <span className="font-medium capitalize">{journey.patientEmotion.primary}</span>
                        <span className="text-xs text-gray-600">
                          {new Date(journey.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{journey.companionResponse.supportStrategy}</p>
                      <p className="text-xs text-purple-600">
                        Bond: +{journey.mutualEvolution.bondStrengthening.toFixed(0)}%
                      </p>
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

  const renderPredictiveEmpathy = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Pattern Recognition</p>
                <p className="text-2xl font-bold">
                  {predictiveEmpathy.length > 0 ? predictiveEmpathy[0].empathicLearning.patternRecognition.toFixed(0) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Micro-Expression</p>
                <p className="text-2xl font-bold">
                  {predictiveEmpathy.length > 0 ? predictiveEmpathy[0].microEmotionDetection.facialMicroExpressions.toFixed(0) : 0}%
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
                <p className="text-sm text-gray-600">Forecast Accuracy</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Intervention Success</p>
                <p className="text-2xl font-bold">89%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {predictiveEmpathy.map((empathy) => (
        <Card key={empathy.id}>
          <CardHeader>
            <CardTitle>Predictive Empathy System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h5 className="font-medium mb-3">Emotional Forecasting</h5>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {empathy.emotionalForecasting.map((forecast, i) => (
                    <div key={i} className="border rounded p-3">
                      <h6 className="font-medium text-sm capitalize">{forecast.timeframe}</h6>
                      <div className="space-y-2 mt-2">
                        {forecast.predictedEmotions.slice(0, 2).map((emotion, j) => (
                          <div key={j} className="text-xs">
                            <div className="flex justify-between">
                              <span className="capitalize">{emotion.emotion}</span>
                              <span>{emotion.probability.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                              <div
                                className="bg-blue-500 h-1 rounded-full"
                                style={{ width: `${emotion.probability}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">Micro-Emotion Detection Capabilities</h5>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(empathy.microEmotionDetection).map(([detection, accuracy]) => (
                    <div key={detection} className="text-center">
                      <p className="text-sm text-gray-600 capitalize">{detection.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-lg font-bold">{accuracy.toFixed(0)}%</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${accuracy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">Current Emotional Needs</h5>
                <div className="space-y-2">
                  {empathy.emotionalNeeds.slice(0, 5).map((need, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm">{need.need}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          need.urgency > 70 ? 'bg-red-100 text-red-800' :
                          need.urgency > 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {need.urgency > 70 ? 'High' : need.urgency > 40 ? 'Medium' : 'Low'}
                        </span>
                        <span className="text-sm font-medium">{need.anticipatedGratification.toFixed(0)}%</span>
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

  const renderInteractions = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Daily Interactions</p>
                <p className="text-2xl font-bold">
                  {interactions.length > 0 ? interactions[0].conversationHistory.filter(c => 
                    new Date(c.timestamp).toDateString() === new Date().toDateString()
                  ).length : 0}
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
                <p className="text-sm text-gray-600">Daily Rituals</p>
                <p className="text-2xl font-bold">
                  {interactions.length > 0 ? interactions[0].dailyRituals.length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Celebrations</p>
                <p className="text-2xl font-bold">
                  {interactions.reduce((sum, i) => sum + i.celebrationMoments.length, 0)}
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
                <p className="text-sm text-gray-600">Crisis Support</p>
                <p className="text-2xl font-bold">
                  {interactions.reduce((sum, i) => sum + i.crisesManagement.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {interactions.map((interaction) => (
        <Card key={interaction.id}>
          <CardHeader>
            <CardTitle>Companion Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h5 className="font-medium mb-3">Daily Rituals</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {interaction.dailyRituals.map((ritual, i) => (
                    <div key={i} className="border rounded p-3">
                      <h6 className="font-medium text-sm">{ritual.ritual}</h6>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div>
                          <p className="text-gray-600">Time</p>
                          <p className="font-medium">{ritual.timeOfDay}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Significance</p>
                          <p className="font-medium">{ritual.emotionalSignificance}%</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-gray-600 text-xs">Variations:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ritual.adaptiveVariations.map((variation, j) => (
                            <span key={j} className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-1">
                              {variation}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">Recent Conversations</h5>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {interaction.conversationHistory.slice(0, 10).map((conv, i) => (
                    <div key={i} className={`flex ${conv.initiator === 'companion' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                        conv.initiator === 'companion' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium capitalize">{conv.messageType}</span>
                          <span className="text-xs opacity-70">
                            {new Date(conv.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs">{conv.emotionalContext}</p>
                        <div className="text-xs mt-1 opacity-70">
                          Effectiveness: {conv.responseEffectiveness.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-3">Crisis Management</h5>
                  <div className="space-y-2">
                    {interaction.crisesManagement.slice(0, 3).map((crisis, i) => (
                      <div key={i} className="text-sm border-l-2 border-red-200 pl-3">
                        <div className="font-medium">{crisis.crisisType}</div>
                        <div className="text-xs text-gray-600">{crisis.companionResponse}</div>
                        <div className="text-xs text-green-600">
                          Success: {crisis.interventionSuccess.toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-3">Celebration Moments</h5>
                  <div className="space-y-2">
                    {interaction.celebrationMoments.slice(0, 3).map((celebration, i) => (
                      <div key={i} className="text-sm border-l-2 border-green-200 pl-3">
                        <div className="font-medium">{celebration.milestone}</div>
                        <div className="text-xs text-gray-600">{celebration.celebrationStyle}</div>
                        <div className="text-xs text-purple-600">
                          Resonance: {celebration.emotionalResonance.toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-pink-50 to-purple-50 min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-pink-600 rounded-lg">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Symbiotic AI Cancer Companion</h1>
          <p className="text-gray-600">AI that literally lives with the patient, learning and evolving alongside their healing journey</p>
        </div>
      </div>

      <div className="flex space-x-4 border-b">
        {[
          { id: 'personality', label: 'Companion Personality', icon: Heart },
          { id: 'coevolution', label: 'Co-Evolution', icon: Users },
          { id: 'empathy', label: 'Predictive Empathy', icon: Brain },
          { id: 'interactions', label: 'Daily Interactions', icon: MessageCircle },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === id
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'personality' && renderPersonality()}
        {activeTab === 'coevolution' && renderCoEvolution()}
        {activeTab === 'empathy' && renderPredictiveEmpathy()}
        {activeTab === 'interactions' && renderInteractions()}
      </div>
    </div>
  );
};

export default SymbioticAICancerCompanion;
