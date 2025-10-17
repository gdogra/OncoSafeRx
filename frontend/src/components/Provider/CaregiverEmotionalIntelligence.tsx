import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Shield, Users, Brain, Zap, Activity, TrendingUp, Clock, AlertTriangle, Eye, MessageCircle, Target } from 'lucide-react';

interface CaregiverProfile {
  id: string;
  name: string;
  role: 'nurse' | 'social_worker' | 'chaplain' | 'therapist' | 'family_coordinator' | 'patient_navigator';
  experience: number; // years
  emotionalIntelligence: {
    selfAwareness: number; // 0-100
    selfRegulation: number;
    empathy: number;
    socialSkills: number;
    motivation: number;
  };
  currentState: {
    emotionalWellbeing: number;
    stressLevel: number;
    burnoutRisk: number;
    compassionFatigue: number;
    resilience: number;
  };
  workload: {
    patientsAssigned: number;
    hoursWorked: number;
    emotionalIntensityScore: number;
    complexCases: number;
  };
  supportNeeds: {
    emotionalSupport: number;
    skillDevelopment: number;
    workloadAdjustment: number;
    peerConnection: number;
  };
}

interface EmotionalMonitoring {
  id: string;
  caregiverId: string;
  realTimeIndicators: {
    facialExpressions: {
      stress: number;
      fatigue: number;
      frustration: number;
      compassion: number;
      engagement: number;
    };
    voiceAnalysis: {
      toneVariability: number;
      stressMarkers: number;
      emotionalRange: number;
      energyLevel: number;
    };
    physiologicalSigns: {
      heartRateVariability: number;
      cortisol: number;
      bloodPressure: number;
      sleepQuality: number;
    };
    behavioralPatterns: {
      interactionFrequency: number;
      responseTime: number;
      empathicResponses: number;
      withdrawalTendency: number;
    };
  };
  emotionalHistory: Array<{
    timestamp: string;
    primaryEmotion: string;
    intensity: number;
    trigger: string;
    duration: number;
    copingMechanism: string;
    outcomeRating: number;
  }>;
  riskAlerts: Array<{
    alertType: 'burnout_warning' | 'compassion_fatigue' | 'stress_overload' | 'emotional_exhaustion';
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    indicators: string[];
    recommendedActions: string[];
  }>;
}

interface EmpathyEnhancement {
  id: string;
  caregiverId: string;
  empathyMetrics: {
    cognitiveEmpathy: number; // understanding others' emotions
    affectiveEmpathy: number; // feeling others' emotions
    compassionateEmpathy: number; // moved to help others
    empathicAccuracy: number; // correctly reading emotions
  };
  enhancementTools: {
    emotionRecognitionTraining: {
      accuracy: number;
      speed: number;
      culturalSensitivity: number;
      nonverbalCues: number;
    };
    perspectiveTaking: {
      patientViewpoint: number;
      familyDynamics: number;
      culturalContext: number;
      lifeCircumstances: number;
    };
    compassionCultivation: {
      lovingKindness: number;
      selfCompassion: number;
      boundaryMaintenance: number;
      emotionalRegulation: number;
    };
  };
  realTimeCoaching: Array<{
    timestamp: string;
    situation: string;
    coachingType: 'empathy_boost' | 'boundary_reminder' | 'stress_reduction' | 'communication_enhancement';
    intervention: string;
    caregiverResponse: string;
    effectiveness: number;
  }>;
  empathyGrowth: Array<{
    date: string;
    metric: string;
    previousValue: number;
    currentValue: number;
    improvementFactor: number;
    contributingFactors: string[];
  }>;
}

interface CommunicationAugmentation {
  id: string;
  caregiverId: string;
  communicationSkills: {
    activeListening: number;
    nonverbalCommunication: number;
    culturalCompetence: number;
    difficultConversations: number;
    familyDynamics: number;
    conflictResolution: number;
  };
  realTimeAssistance: {
    conversationAnalysis: {
      emotionalTone: string;
      empathyLevel: number;
      clarityScore: number;
      culturalSensitivity: number;
    };
    suggestedResponses: Array<{
      context: string;
      response: string;
      empathyRating: number;
      culturallyAppropriate: boolean;
      therapeuticValue: number;
    }>;
    nonverbalFeedback: {
      bodyLanguage: string;
      facialExpressions: string;
      voiceTone: string;
      recommendations: string[];
    };
  };
  conversationOutcomes: Array<{
    timestamp: string;
    patientId: string;
    conversationType: 'diagnosis_delivery' | 'emotional_support' | 'care_coordination' | 'family_meeting' | 'crisis_intervention';
    durationMinutes: number;
    empathyScore: number;
    patientSatisfaction: number;
    therapeuticImpact: number;
    caregiverConfidence: number;
  }>;
  skillDevelopment: {
    trainingModules: Array<{
      module: string;
      completionRate: number;
      skillImprovement: number;
      practiceScenarios: number;
    }>;
    mentorshipProgram: {
      mentorId: string;
      sessionsCompleted: number;
      skillsWorkedOn: string[];
      progressRating: number;
    };
  };
}

interface BurnoutPrevention {
  id: string;
  caregiverId: string;
  burnoutAssessment: {
    emotionalExhaustion: number;
    depersonalization: number;
    personalAccomplishment: number;
    overallBurnoutRisk: number;
  };
  earlyWarningSystem: {
    predictiveModel: {
      timeToRisk: number; // days
      riskProbability: number;
      primaryRiskFactors: string[];
      protectiveFactors: string[];
    };
    interventionTriggers: Array<{
      trigger: string;
      threshold: number;
      currentValue: number;
      timeToThreshold: number;
    }>;
  };
  preventiveInterventions: Array<{
    interventionType: 'workload_adjustment' | 'peer_support' | 'mindfulness_training' | 'counseling' | 'time_off';
    timestamp: string;
    duration: number;
    effectiveness: number;
    participantSatisfaction: number;
    longTermImpact: number;
  }>;
  resilienceBuilding: {
    mindfulnessPractice: {
      dailyMinutes: number;
      consistency: number;
      stressReduction: number;
      emotionalRegulation: number;
    };
    peerSupport: {
      groupParticipation: number;
      socialConnections: number;
      emotionalSharing: number;
      receivedSupport: number;
    };
    professionalDevelopment: {
      skillsLearned: number;
      competenceFeeling: number;
      careerSatisfaction: number;
      purposeSense: number;
    };
  };
}

interface TeamDynamics {
  id: string;
  teamId: string;
  teamMembers: CaregiverProfile[];
  collectiveEmotionalIntelligence: {
    teamEmpathy: number;
    emotionalContagion: number;
    supportCulture: number;
    conflictResolution: number;
    sharedValues: number;
  };
  teamHealthMetrics: {
    averageBurnoutRisk: number;
    emotionalSupport: number;
    workloadDistribution: number;
    communicationEffectiveness: number;
    jobSatisfaction: number;
  };
  teamInterventions: Array<{
    interventionType: 'team_building' | 'communication_training' | 'stress_management' | 'conflict_resolution' | 'appreciation_activities';
    timestamp: string;
    participants: string[];
    outcomes: {
      teamCohesion: number;
      communicationImprovement: number;
      stressReduction: number;
      jobSatisfactionIncrease: number;
    };
  }>;
  realTimeTeamSupport: {
    emotionalClimate: string;
    supportRequests: Array<{
      requesterId: string;
      supportType: string;
      urgency: number;
      availableHelpers: string[];
    }>;
    teamStressLevel: number;
    recommendedActions: string[];
  };
}

interface WellnessPersonalization {
  id: string;
  caregiverId: string;
  personalityProfile: {
    introversion: number; // 0-100
    neuroticism: number;
    openness: number;
    agreeableness: number;
    conscientiousness: number;
  };
  copingStyles: {
    problemFocused: number;
    emotionFocused: number;
    avoidance: number;
    socialSupport: number;
    meaningMaking: number;
  };
  personalizedWellnessPlan: {
    stressManagement: Array<{
      technique: string;
      personalityFit: number;
      effectiveness: number;
      frequency: string;
    }>;
    emotionalRegulation: Array<{
      strategy: string;
      situationalUse: string;
      skillLevel: number;
      practiceNeeded: number;
    }>;
    selfCareActivities: Array<{
      activity: string;
      personalPreference: number;
      accessibilityScore: number;
      timeCommitment: number;
      wellnessImpact: number;
    }>;
  };
  adaptiveSuggestions: Array<{
    timestamp: string;
    context: string;
    suggestion: string;
    personalizationScore: number;
    implementationBarriers: string[];
    successPrediction: number;
  }>;
}

const CaregiverEmotionalIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profiles');
  const [caregivers, setCaregivers] = useState<CaregiverProfile[]>([]);
  const [monitoring, setMonitoring] = useState<EmotionalMonitoring[]>([]);
  const [empathy, setEmpathy] = useState<EmpathyEnhancement[]>([]);
  const [communication, setCommunication] = useState<CommunicationAugmentation[]>([]);
  const [burnout, setBurnout] = useState<BurnoutPrevention[]>([]);
  const [teamDynamics, setTeamDynamics] = useState<TeamDynamics[]>([]);
  const [wellness, setWellness] = useState<WellnessPersonalization[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate mock data
  useEffect(() => {
    const generateMockCaregivers = (): CaregiverProfile[] => {
      const roles: CaregiverProfile['role'][] = ['nurse', 'social_worker', 'chaplain', 'therapist', 'family_coordinator', 'patient_navigator'];
      const names = ['Sarah Chen', 'Marcus Johnson', 'Dr. Patel', 'Lisa Rodriguez', 'David Kim', 'Amy Thompson'];
      
      return roles.map((role, i) => ({
        id: `caregiver-${i}`,
        name: names[i],
        role,
        experience: Math.floor(Math.random() * 15) + 2,
        emotionalIntelligence: {
          selfAwareness: 70 + Math.random() * 30,
          selfRegulation: 65 + Math.random() * 35,
          empathy: 80 + Math.random() * 20,
          socialSkills: 75 + Math.random() * 25,
          motivation: 85 + Math.random() * 15,
        },
        currentState: {
          emotionalWellbeing: 60 + Math.random() * 30,
          stressLevel: 30 + Math.random() * 50,
          burnoutRisk: 20 + Math.random() * 40,
          compassionFatigue: 25 + Math.random() * 45,
          resilience: 70 + Math.random() * 30,
        },
        workload: {
          patientsAssigned: Math.floor(Math.random() * 15) + 8,
          hoursWorked: 35 + Math.random() * 15,
          emotionalIntensityScore: 40 + Math.random() * 40,
          complexCases: Math.floor(Math.random() * 8) + 2,
        },
        supportNeeds: {
          emotionalSupport: 30 + Math.random() * 50,
          skillDevelopment: 20 + Math.random() * 60,
          workloadAdjustment: 25 + Math.random() * 55,
          peerConnection: 40 + Math.random() * 40,
        },
      }));
    };

    const generateMockMonitoring = (): EmotionalMonitoring[] => {
      return Array.from({ length: 4 }, (_, i) => ({
        id: `monitoring-${i}`,
        caregiverId: `caregiver-${i}`,
        realTimeIndicators: {
          facialExpressions: {
            stress: Math.random() * 60 + 20,
            fatigue: Math.random() * 50 + 10,
            frustration: Math.random() * 40 + 5,
            compassion: Math.random() * 40 + 60,
            engagement: Math.random() * 30 + 70,
          },
          voiceAnalysis: {
            toneVariability: Math.random() * 40 + 60,
            stressMarkers: Math.random() * 50 + 10,
            emotionalRange: Math.random() * 30 + 70,
            energyLevel: Math.random() * 40 + 50,
          },
          physiologicalSigns: {
            heartRateVariability: Math.random() * 30 + 50,
            cortisol: Math.random() * 40 + 20,
            bloodPressure: Math.random() * 30 + 70,
            sleepQuality: Math.random() * 40 + 50,
          },
          behavioralPatterns: {
            interactionFrequency: Math.random() * 30 + 70,
            responseTime: Math.random() * 40 + 60,
            empathicResponses: Math.random() * 20 + 80,
            withdrawalTendency: Math.random() * 40 + 10,
          },
        },
        emotionalHistory: Array.from({ length: 20 }, (_, j) => ({
          timestamp: new Date(Date.now() - j * 2 * 60 * 60 * 1000).toISOString(),
          primaryEmotion: ['compassion', 'stress', 'empathy', 'frustration', 'satisfaction', 'concern'][j % 6],
          intensity: Math.random() * 100,
          trigger: ['Patient interaction', 'Family meeting', 'Difficult diagnosis', 'Treatment success', 'Workload pressure'][j % 5],
          duration: Math.floor(Math.random() * 180) + 30,
          copingMechanism: ['Deep breathing', 'Peer support', 'Brief walk', 'Mindfulness', 'Professional consultation'][j % 5],
          outcomeRating: Math.random() * 40 + 60,
        })),
        riskAlerts: Array.from({ length: Math.floor(Math.random() * 3) }, (_, j) => ({
          alertType: ['burnout_warning', 'compassion_fatigue', 'stress_overload', 'emotional_exhaustion'][j % 4] as any,
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
          timestamp: new Date(Date.now() - j * 6 * 60 * 60 * 1000).toISOString(),
          indicators: ['Elevated stress markers', 'Decreased empathy scores', 'Withdrawal behaviors'],
          recommendedActions: ['Schedule break', 'Peer support session', 'Workload adjustment', 'Counseling referral'],
        })),
      }));
    };

    const generateMockEmpathy = (): EmpathyEnhancement[] => {
      return Array.from({ length: 3 }, (_, i) => ({
        id: `empathy-${i}`,
        caregiverId: `caregiver-${i}`,
        empathyMetrics: {
          cognitiveEmpathy: 75 + Math.random() * 25,
          affectiveEmpathy: 70 + Math.random() * 30,
          compassionateEmpathy: 80 + Math.random() * 20,
          empathicAccuracy: 72 + Math.random() * 28,
        },
        enhancementTools: {
          emotionRecognitionTraining: {
            accuracy: 85 + Math.random() * 15,
            speed: 80 + Math.random() * 20,
            culturalSensitivity: 75 + Math.random() * 25,
            nonverbalCues: 82 + Math.random() * 18,
          },
          perspectiveTaking: {
            patientViewpoint: 88 + Math.random() * 12,
            familyDynamics: 78 + Math.random() * 22,
            culturalContext: 72 + Math.random() * 28,
            lifeCircumstances: 85 + Math.random() * 15,
          },
          compassionCultivation: {
            lovingKindness: 80 + Math.random() * 20,
            selfCompassion: 70 + Math.random() * 30,
            boundaryMaintenance: 75 + Math.random() * 25,
            emotionalRegulation: 82 + Math.random() * 18,
          },
        },
        realTimeCoaching: Array.from({ length: 15 }, (_, j) => ({
          timestamp: new Date(Date.now() - j * 4 * 60 * 60 * 1000).toISOString(),
          situation: `Patient interaction scenario ${j}`,
          coachingType: ['empathy_boost', 'boundary_reminder', 'stress_reduction', 'communication_enhancement'][j % 4] as any,
          intervention: `Coaching intervention ${j}`,
          caregiverResponse: `Response ${j}`,
          effectiveness: 70 + Math.random() * 30,
        })),
        empathyGrowth: Array.from({ length: 12 }, (_, j) => ({
          date: new Date(Date.now() - j * 7 * 24 * 60 * 60 * 1000).toISOString(),
          metric: ['cognitiveEmpathy', 'affectiveEmpathy', 'compassionateEmpathy'][j % 3],
          previousValue: 70 + Math.random() * 20,
          currentValue: 75 + Math.random() * 25,
          improvementFactor: 1 + Math.random() * 0.3,
          contributingFactors: ['Training completion', 'Peer feedback', 'Practice scenarios', 'Mindfulness practice'],
        })),
      }));
    };

    const generateMockCommunication = (): CommunicationAugmentation[] => {
      return Array.from({ length: 3 }, (_, i) => ({
        id: `communication-${i}`,
        caregiverId: `caregiver-${i}`,
        communicationSkills: {
          activeListening: 80 + Math.random() * 20,
          nonverbalCommunication: 75 + Math.random() * 25,
          culturalCompetence: 70 + Math.random() * 30,
          difficultConversations: 65 + Math.random() * 35,
          familyDynamics: 78 + Math.random() * 22,
          conflictResolution: 72 + Math.random() * 28,
        },
        realTimeAssistance: {
          conversationAnalysis: {
            emotionalTone: ['supportive', 'empathetic', 'professional', 'warm'][Math.floor(Math.random() * 4)],
            empathyLevel: 75 + Math.random() * 25,
            clarityScore: 80 + Math.random() * 20,
            culturalSensitivity: 85 + Math.random() * 15,
          },
          suggestedResponses: Array.from({ length: 5 }, (_, j) => ({
            context: `Conversation context ${j}`,
            response: `Suggested response ${j}`,
            empathyRating: 70 + Math.random() * 30,
            culturallyAppropriate: Math.random() > 0.2,
            therapeuticValue: 75 + Math.random() * 25,
          })),
          nonverbalFeedback: {
            bodyLanguage: 'Open and welcoming',
            facialExpressions: 'Warm and attentive',
            voiceTone: 'Calm and reassuring',
            recommendations: ['Maintain eye contact', 'Lean in slightly', 'Use open gestures'],
          },
        },
        conversationOutcomes: Array.from({ length: 20 }, (_, j) => ({
          timestamp: new Date(Date.now() - j * 8 * 60 * 60 * 1000).toISOString(),
          patientId: `patient-${Math.floor(Math.random() * 50)}`,
          conversationType: ['diagnosis_delivery', 'emotional_support', 'care_coordination', 'family_meeting', 'crisis_intervention'][j % 5] as any,
          durationMinutes: Math.floor(Math.random() * 60) + 15,
          empathyScore: 70 + Math.random() * 30,
          patientSatisfaction: 75 + Math.random() * 25,
          therapeuticImpact: 70 + Math.random() * 30,
          caregiverConfidence: 75 + Math.random() * 25,
        })),
        skillDevelopment: {
          trainingModules: [
            'Active Listening Mastery',
            'Cultural Competence',
            'Difficult Conversations',
            'Family Dynamics',
            'Conflict Resolution'
          ].map(module => ({
            module,
            completionRate: Math.random() * 40 + 60,
            skillImprovement: Math.random() * 30 + 15,
            practiceScenarios: Math.floor(Math.random() * 20) + 10,
          })),
          mentorshipProgram: {
            mentorId: `mentor-${i}`,
            sessionsCompleted: Math.floor(Math.random() * 15) + 5,
            skillsWorkedOn: ['Empathy', 'Communication', 'Boundary setting'],
            progressRating: 80 + Math.random() * 20,
          },
        },
      }));
    };

    const generateMockBurnout = (): BurnoutPrevention[] => {
      return Array.from({ length: 3 }, (_, i) => ({
        id: `burnout-${i}`,
        caregiverId: `caregiver-${i}`,
        burnoutAssessment: {
          emotionalExhaustion: 30 + Math.random() * 40,
          depersonalization: 20 + Math.random() * 30,
          personalAccomplishment: 70 + Math.random() * 30,
          overallBurnoutRisk: 25 + Math.random() * 35,
        },
        earlyWarningSystem: {
          predictiveModel: {
            timeToRisk: Math.floor(Math.random() * 90) + 30,
            riskProbability: Math.random() * 40 + 20,
            primaryRiskFactors: ['High workload', 'Emotional intensity', 'Limited support'],
            protectiveFactors: ['Strong team', 'Good self-care', 'Professional development'],
          },
          interventionTriggers: [
            { trigger: 'Stress level', threshold: 80, currentValue: 60 + Math.random() * 25, timeToThreshold: Math.floor(Math.random() * 30) + 5 },
            { trigger: 'Empathy decline', threshold: 60, currentValue: 70 + Math.random() * 20, timeToThreshold: Math.floor(Math.random() * 45) + 10 },
            { trigger: 'Sleep quality', threshold: 40, currentValue: 50 + Math.random() * 30, timeToThreshold: Math.floor(Math.random() * 20) + 5 },
          ],
        },
        preventiveInterventions: Array.from({ length: 8 }, (_, j) => ({
          interventionType: ['workload_adjustment', 'peer_support', 'mindfulness_training', 'counseling', 'time_off'][j % 5] as any,
          timestamp: new Date(Date.now() - j * 7 * 24 * 60 * 60 * 1000).toISOString(),
          duration: Math.floor(Math.random() * 120) + 30,
          effectiveness: 70 + Math.random() * 30,
          participantSatisfaction: 75 + Math.random() * 25,
          longTermImpact: 65 + Math.random() * 35,
        })),
        resilienceBuilding: {
          mindfulnessPractice: {
            dailyMinutes: Math.floor(Math.random() * 30) + 10,
            consistency: 60 + Math.random() * 40,
            stressReduction: 70 + Math.random() * 30,
            emotionalRegulation: 75 + Math.random() * 25,
          },
          peerSupport: {
            groupParticipation: 80 + Math.random() * 20,
            socialConnections: 75 + Math.random() * 25,
            emotionalSharing: 70 + Math.random() * 30,
            receivedSupport: 85 + Math.random() * 15,
          },
          professionalDevelopment: {
            skillsLearned: Math.floor(Math.random() * 10) + 5,
            competenceFeeling: 80 + Math.random() * 20,
            careerSatisfaction: 75 + Math.random() * 25,
            purposeSense: 85 + Math.random() * 15,
          },
        },
      }));
    };

    const generateMockTeamDynamics = (): TeamDynamics[] => {
      return Array.from({ length: 1 }, (_, i) => ({
        id: `team-${i}`,
        teamId: `oncology-team-${i}`,
        teamMembers: caregivers,
        collectiveEmotionalIntelligence: {
          teamEmpathy: 82 + Math.random() * 18,
          emotionalContagion: 75 + Math.random() * 25,
          supportCulture: 88 + Math.random() * 12,
          conflictResolution: 70 + Math.random() * 30,
          sharedValues: 90 + Math.random() * 10,
        },
        teamHealthMetrics: {
          averageBurnoutRisk: 30 + Math.random() * 20,
          emotionalSupport: 85 + Math.random() * 15,
          workloadDistribution: 70 + Math.random() * 30,
          communicationEffectiveness: 80 + Math.random() * 20,
          jobSatisfaction: 78 + Math.random() * 22,
        },
        teamInterventions: Array.from({ length: 6 }, (_, j) => ({
          interventionType: ['team_building', 'communication_training', 'stress_management', 'conflict_resolution', 'appreciation_activities'][j % 5] as any,
          timestamp: new Date(Date.now() - j * 14 * 24 * 60 * 60 * 1000).toISOString(),
          participants: [`caregiver-${j % 4}`, `caregiver-${(j + 1) % 4}`, `caregiver-${(j + 2) % 4}`],
          outcomes: {
            teamCohesion: 75 + Math.random() * 25,
            communicationImprovement: 70 + Math.random() * 30,
            stressReduction: 65 + Math.random() * 35,
            jobSatisfactionIncrease: 72 + Math.random() * 28,
          },
        })),
        realTimeTeamSupport: {
          emotionalClimate: ['supportive', 'collaborative', 'high-energy', 'focused'][Math.floor(Math.random() * 4)],
          supportRequests: Array.from({ length: 3 }, (_, j) => ({
            requesterId: `caregiver-${j}`,
            supportType: ['Emotional support', 'Workload assistance', 'Skill guidance'][j],
            urgency: Math.floor(Math.random() * 10) + 1,
            availableHelpers: [`caregiver-${(j + 1) % 4}`, `caregiver-${(j + 2) % 4}`],
          })),
          teamStressLevel: 40 + Math.random() * 30,
          recommendedActions: ['Team check-in', 'Workload redistribution', 'Appreciation activity'],
        },
      }));
    };

    const generateMockWellness = (): WellnessPersonalization[] => {
      return Array.from({ length: 3 }, (_, i) => ({
        id: `wellness-${i}`,
        caregiverId: `caregiver-${i}`,
        personalityProfile: {
          introversion: Math.random() * 100,
          neuroticism: Math.random() * 60 + 20,
          openness: Math.random() * 40 + 60,
          agreeableness: Math.random() * 30 + 70,
          conscientiousness: Math.random() * 40 + 60,
        },
        copingStyles: {
          problemFocused: Math.random() * 40 + 60,
          emotionFocused: Math.random() * 50 + 30,
          avoidance: Math.random() * 40 + 10,
          socialSupport: Math.random() * 40 + 50,
          meaningMaking: Math.random() * 30 + 70,
        },
        personalizedWellnessPlan: {
          stressManagement: [
            { technique: 'Mindfulness meditation', personalityFit: 85, effectiveness: 80, frequency: 'Daily' },
            { technique: 'Progressive muscle relaxation', personalityFit: 70, effectiveness: 75, frequency: 'As needed' },
            { technique: 'Breathing exercises', personalityFit: 90, effectiveness: 85, frequency: 'Multiple times daily' },
          ],
          emotionalRegulation: [
            { strategy: 'Cognitive reframing', situationalUse: 'Difficult patient interactions', skillLevel: 75, practiceNeeded: 25 },
            { strategy: 'Emotion labeling', situationalUse: 'High stress moments', skillLevel: 80, practiceNeeded: 20 },
            { strategy: 'Self-compassion', situationalUse: 'After challenging cases', skillLevel: 70, practiceNeeded: 30 },
          ],
          selfCareActivities: [
            { activity: 'Nature walks', personalPreference: 85, accessibilityScore: 90, timeCommitment: 30, wellnessImpact: 80 },
            { activity: 'Reading', personalPreference: 75, accessibilityScore: 95, timeCommitment: 45, wellnessImpact: 70 },
            { activity: 'Exercise', personalPreference: 70, accessibilityScore: 80, timeCommitment: 60, wellnessImpact: 85 },
          ],
        },
        adaptiveSuggestions: Array.from({ length: 10 }, (_, j) => ({
          timestamp: new Date(Date.now() - j * 12 * 60 * 60 * 1000).toISOString(),
          context: `Stress management suggestion ${j}`,
          suggestion: `Personalized wellness recommendation ${j}`,
          personalizationScore: 80 + Math.random() * 20,
          implementationBarriers: ['Time constraints', 'Energy levels', 'Privacy needs'],
          successPrediction: 70 + Math.random() * 30,
        })),
      }));
    };

    setCaregivers(generateMockCaregivers());
    setMonitoring(generateMockMonitoring());
    setEmpathy(generateMockEmpathy());
    setCommunication(generateMockCommunication());
    setBurnout(generateMockBurnout());
    setTeamDynamics(generateMockTeamDynamics());
    setWellness(generateMockWellness());
  }, []);

  // Canvas visualization for emotional intelligence network
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

      // Draw caregiver network
      const caregiverCount = 6;
      const radius = Math.min(canvas.width, canvas.height) / 3;
      
      const caregiverPositions = Array.from({ length: caregiverCount }, (_, i) => {
        const angle = (i / caregiverCount) * 2 * Math.PI;
        return {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          emotionalState: Math.random(),
          supportLevel: Math.random(),
        };
      });

      // Draw emotional connections
      caregiverPositions.forEach((caregiver, i) => {
        caregiverPositions.forEach((otherCaregiver, j) => {
          if (i !== j && Math.random() > 0.6) {
            ctx.beginPath();
            ctx.moveTo(caregiver.x, caregiver.y);
            ctx.lineTo(otherCaregiver.x, otherCaregiver.y);
            ctx.strokeStyle = `rgba(236, 72, 153, ${0.2 + caregiver.supportLevel * 0.3})`;
            ctx.lineWidth = 1 + caregiver.supportLevel * 2;
            ctx.stroke();
          }
        });
      });

      // Draw support waves
      caregiverPositions.forEach((caregiver, i) => {
        for (let wave = 0; wave < 3; wave++) {
          ctx.beginPath();
          ctx.arc(
            caregiver.x, 
            caregiver.y, 
            20 + wave * 15 + Math.sin(time * 2 + i + wave) * 5, 
            0, 
            2 * Math.PI
          );
          ctx.strokeStyle = `rgba(34, 197, 94, ${0.4 - wave * 0.1})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // Draw caregivers
      caregiverPositions.forEach((caregiver, i) => {
        // Main caregiver circle
        ctx.beginPath();
        ctx.arc(caregiver.x, caregiver.y, 15, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${200 + caregiver.emotionalState * 60}, 70%, 60%)`;
        ctx.fill();

        // Emotional state indicator
        ctx.beginPath();
        ctx.arc(caregiver.x, caregiver.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + caregiver.emotionalState * 0.5})`;
        ctx.fill();

        // Support level ring
        ctx.beginPath();
        ctx.arc(caregiver.x, caregiver.y, 18, 0, 2 * Math.PI * caregiver.supportLevel);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.stroke();
      });

      // Draw central emotional intelligence hub
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.8)';
      ctx.fill();

      // Draw emotional intelligence pulses
      for (let pulse = 0; pulse < 4; pulse++) {
        ctx.beginPath();
        ctx.arc(
          centerX, 
          centerY, 
          40 + pulse * 20 + Math.sin(time + pulse) * 10, 
          0, 
          2 * Math.PI
        );
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.3 - pulse * 0.05})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw labels
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#1f2937';
      ctx.textAlign = 'center';
      ctx.fillText('Emotional', centerX, centerY - 5);
      ctx.fillText('Intelligence', centerX, centerY + 8);

      requestAnimationFrame(animate);
    };

    animate();
  }, [activeTab]);

  const renderProfiles = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Active Caregivers</p>
                <p className="text-2xl font-bold">{caregivers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Empathy</p>
                <p className="text-2xl font-bold">
                  {(caregivers.reduce((sum, c) => sum + c.emotionalIntelligence.empathy, 0) / caregivers.length || 0).toFixed(0)}
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
                <p className="text-sm text-gray-600">Resilience</p>
                <p className="text-2xl font-bold">
                  {(caregivers.reduce((sum, c) => sum + c.currentState.resilience, 0) / caregivers.length || 0).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Burnout Risk</p>
                <p className="text-2xl font-bold">
                  {(caregivers.reduce((sum, c) => sum + c.currentState.burnoutRisk, 0) / caregivers.length || 0).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Emotional Intelligence Network</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas
              ref={canvasRef}
              className="w-full h-64 border rounded"
              style={{ background: 'linear-gradient(135deg, #fef7ff 0%, #f0f9ff 100%)' }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Emotional Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['emotionalWellbeing', 'stressLevel', 'resilience'].map((metric) => {
                const average = caregivers.reduce((sum, c) => sum + c.currentState[metric as keyof typeof c.currentState], 0) / caregivers.length;
                return (
                  <div key={metric} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-sm font-medium">{average.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          metric === 'stressLevel' ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${average}%` }}
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
          <CardTitle>Caregiver Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {caregivers.map((caregiver) => (
              <div key={caregiver.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{caregiver.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {caregiver.role.replace('_', ' ')} • {caregiver.experience} years experience
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      caregiver.currentState.burnoutRisk < 30 ? 'bg-green-100 text-green-800' :
                      caregiver.currentState.burnoutRisk < 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {caregiver.currentState.burnoutRisk.toFixed(0)}% Burnout Risk
                    </span>
                    <span className="text-sm font-medium">
                      {caregiver.emotionalIntelligence.empathy.toFixed(0)} Empathy
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  {Object.entries(caregiver.emotionalIntelligence).map(([skill, value]) => (
                    <div key={skill} className="text-center">
                      <p className="text-gray-600 capitalize text-xs">{skill.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="font-medium">{value.toFixed(0)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Patients</p>
                    <p className="font-medium">{caregiver.workload.patientsAssigned}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Hours/Week</p>
                    <p className="font-medium">{caregiver.workload.hoursWorked.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Stress Level</p>
                    <p className="font-medium">{caregiver.currentState.stressLevel.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Resilience</p>
                    <p className="font-medium">{caregiver.currentState.resilience.toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMonitoring = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Active Monitoring</p>
                <p className="text-2xl font-bold">{monitoring.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Risk Alerts</p>
                <p className="text-2xl font-bold">
                  {monitoring.reduce((sum, m) => sum + m.riskAlerts.length, 0)}
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
                <p className="text-sm text-gray-600">Avg Engagement</p>
                <p className="text-2xl font-bold">
                  {monitoring.length > 0 ? 
                    (monitoring.reduce((sum, m) => sum + m.realTimeIndicators.facialExpressions.engagement, 0) / monitoring.length).toFixed(0) 
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Compassion</p>
                <p className="text-2xl font-bold">
                  {monitoring.length > 0 ? 
                    (monitoring.reduce((sum, m) => sum + m.realTimeIndicators.facialExpressions.compassion, 0) / monitoring.length).toFixed(0) 
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {monitoring.map((monitor) => (
        <Card key={monitor.id}>
          <CardHeader>
            <CardTitle>Real-Time Emotional Monitoring: {monitor.caregiverId}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border rounded p-4">
                  <h5 className="font-medium mb-3">Facial Expressions</h5>
                  <div className="space-y-2">
                    {Object.entries(monitor.realTimeIndicators.facialExpressions).map(([expression, value]) => (
                      <div key={expression} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{expression}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{value.toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded p-4">
                  <h5 className="font-medium mb-3">Voice Analysis</h5>
                  <div className="space-y-2">
                    {Object.entries(monitor.realTimeIndicators.voiceAnalysis).map(([metric, value]) => (
                      <div key={metric} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-sm font-medium">{value.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded p-4">
                  <h5 className="font-medium mb-3">Physiological Signs</h5>
                  <div className="space-y-2">
                    {Object.entries(monitor.realTimeIndicators.physiologicalSigns).map(([sign, value]) => (
                      <div key={sign} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{sign.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-sm font-medium">{value.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded p-4">
                  <h5 className="font-medium mb-3">Behavioral Patterns</h5>
                  <div className="space-y-2">
                    {Object.entries(monitor.realTimeIndicators.behavioralPatterns).map(([pattern, value]) => (
                      <div key={pattern} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{pattern.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-sm font-medium">{value.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {monitor.riskAlerts.length > 0 && (
                <div>
                  <h5 className="font-medium mb-3">Current Risk Alerts</h5>
                  <div className="space-y-2">
                    {monitor.riskAlerts.map((alert, i) => (
                      <div key={i} className={`border rounded p-3 ${
                        alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                        alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                        alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <h6 className="font-medium capitalize">{alert.alertType.replace(/_/g, ' ')}</h6>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-600 mb-1">Indicators:</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {alert.indicators.map((indicator, j) => (
                              <span key={j} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                {indicator}
                              </span>
                            ))}
                          </div>
                          <p className="text-gray-600 mb-1">Recommended Actions:</p>
                          <div className="flex flex-wrap gap-1">
                            {alert.recommendedActions.map((action, j) => (
                              <span key={j} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                {action}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h5 className="font-medium mb-3">Recent Emotional History</h5>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {monitor.emotionalHistory.slice(0, 8).map((emotion, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-l-2 border-purple-200 pl-3">
                      <div>
                        <span className="font-medium capitalize">{emotion.primaryEmotion}</span>
                        <span className="text-gray-600 ml-2">({emotion.trigger})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{emotion.duration}min</span>
                        <span className="text-xs font-medium">{emotion.outcomeRating.toFixed(0)}%</span>
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

  const renderEmpathy = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Cognitive Empathy</p>
                <p className="text-2xl font-bold">
                  {empathy.length > 0 ? 
                    (empathy.reduce((sum, e) => sum + e.empathyMetrics.cognitiveEmpathy, 0) / empathy.length).toFixed(0) 
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Empathic Accuracy</p>
                <p className="text-2xl font-bold">
                  {empathy.length > 0 ? 
                    (empathy.reduce((sum, e) => sum + e.empathyMetrics.empathicAccuracy, 0) / empathy.length).toFixed(0) 
                    : 0}%
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
                <p className="text-sm text-gray-600">Coaching Sessions</p>
                <p className="text-2xl font-bold">
                  {empathy.reduce((sum, e) => sum + e.realTimeCoaching.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Coaching Effect</p>
                <p className="text-2xl font-bold">
                  {empathy.length > 0 && empathy[0].realTimeCoaching.length > 0 ? 
                    (empathy[0].realTimeCoaching.reduce((sum, c) => sum + c.effectiveness, 0) / empathy[0].realTimeCoaching.length).toFixed(0) 
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {empathy.map((emp) => (
        <Card key={emp.id}>
          <CardHeader>
            <CardTitle>Empathy Enhancement: {emp.caregiverId}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(emp.empathyMetrics).map(([metric, value]) => (
                  <div key={metric} className="text-center">
                    <p className="text-sm text-gray-600 capitalize">{metric.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-2xl font-bold">{value.toFixed(0)}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded p-4">
                  <h5 className="font-medium mb-3">Emotion Recognition Training</h5>
                  <div className="space-y-2">
                    {Object.entries(emp.enhancementTools.emotionRecognitionTraining).map(([skill, value]) => (
                      <div key={skill} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{skill.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-sm font-medium">{value.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded p-4">
                  <h5 className="font-medium mb-3">Perspective Taking</h5>
                  <div className="space-y-2">
                    {Object.entries(emp.enhancementTools.perspectiveTaking).map(([skill, value]) => (
                      <div key={skill} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{skill.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-sm font-medium">{value.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded p-4">
                  <h5 className="font-medium mb-3">Compassion Cultivation</h5>
                  <div className="space-y-2">
                    {Object.entries(emp.enhancementTools.compassionCultivation).map(([skill, value]) => (
                      <div key={skill} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{skill.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-sm font-medium">{value.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">Recent Real-Time Coaching</h5>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {emp.realTimeCoaching.slice(0, 6).map((coaching, i) => (
                    <div key={i} className="border rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium capitalize">{coaching.coachingType.replace(/_/g, ' ')}</span>
                        <span className="text-sm text-gray-600">
                          {new Date(coaching.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{coaching.situation}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Effectiveness: {coaching.effectiveness.toFixed(0)}%</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${coaching.effectiveness}%` }}
                          />
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

  const renderCommunication = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Empathy Score</p>
                <p className="text-2xl font-bold">
                  {communication.length > 0 && communication[0].conversationOutcomes.length > 0 ? 
                    (communication[0].conversationOutcomes.reduce((sum, c) => sum + c.empathyScore, 0) / communication[0].conversationOutcomes.length).toFixed(0) 
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Patient Satisfaction</p>
                <p className="text-2xl font-bold">
                  {communication.length > 0 && communication[0].conversationOutcomes.length > 0 ? 
                    (communication[0].conversationOutcomes.reduce((sum, c) => sum + c.patientSatisfaction, 0) / communication[0].conversationOutcomes.length).toFixed(0) 
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Cultural Sensitivity</p>
                <p className="text-2xl font-bold">
                  {communication.length > 0 ? 
                    communication[0].realTimeAssistance.conversationAnalysis.culturalSensitivity.toFixed(0) 
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Therapeutic Impact</p>
                <p className="text-2xl font-bold">
                  {communication.length > 0 && communication[0].conversationOutcomes.length > 0 ? 
                    (communication[0].conversationOutcomes.reduce((sum, c) => sum + c.therapeuticImpact, 0) / communication[0].conversationOutcomes.length).toFixed(0) 
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {communication.map((comm) => (
        <Card key={comm.id}>
          <CardHeader>
            <CardTitle>Communication Augmentation: {comm.caregiverId}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h5 className="font-medium mb-3">Communication Skills</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(comm.communicationSkills).map(([skill, value]) => (
                    <div key={skill} className="text-center">
                      <p className="text-sm text-gray-600 capitalize">{skill.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-lg font-bold">{value.toFixed(0)}%</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded p-4">
                  <h5 className="font-medium mb-3">Real-Time Conversation Analysis</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Emotional Tone</span>
                      <span className="text-sm font-medium capitalize">{comm.realTimeAssistance.conversationAnalysis.emotionalTone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Empathy Level</span>
                      <span className="text-sm font-medium">{comm.realTimeAssistance.conversationAnalysis.empathyLevel.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Clarity Score</span>
                      <span className="text-sm font-medium">{comm.realTimeAssistance.conversationAnalysis.clarityScore.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Cultural Sensitivity</span>
                      <span className="text-sm font-medium">{comm.realTimeAssistance.conversationAnalysis.culturalSensitivity.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded p-4">
                  <h5 className="font-medium mb-3">Nonverbal Feedback</h5>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Body Language:</span>
                      <p className="text-sm">{comm.realTimeAssistance.nonverbalFeedback.bodyLanguage}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Voice Tone:</span>
                      <p className="text-sm">{comm.realTimeAssistance.nonverbalFeedback.voiceTone}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Recommendations:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {comm.realTimeAssistance.nonverbalFeedback.recommendations.map((rec, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {rec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">Recent Conversation Outcomes</h5>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {comm.conversationOutcomes.slice(0, 6).map((outcome, i) => (
                    <div key={i} className="border rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium capitalize">{outcome.conversationType.replace(/_/g, ' ')}</span>
                        <span className="text-sm text-gray-600">{outcome.durationMinutes}min</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Empathy:</span>
                          <span className="font-medium ml-1">{outcome.empathyScore.toFixed(0)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Satisfaction:</span>
                          <span className="font-medium ml-1">{outcome.patientSatisfaction.toFixed(0)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Impact:</span>
                          <span className="font-medium ml-1">{outcome.therapeuticImpact.toFixed(0)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Confidence:</span>
                          <span className="font-medium ml-1">{outcome.caregiverConfidence.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">Skill Development Progress</h5>
                <div className="space-y-2">
                  {comm.skillDevelopment.trainingModules.slice(0, 3).map((module, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm">{module.module}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600">{module.completionRate.toFixed(0)}% complete</span>
                        <span className="text-xs font-medium">+{module.skillImprovement.toFixed(0)}% skill</span>
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

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-red-50 to-pink-50 min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-red-600 rounded-lg">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Caregiver Emotional Intelligence & Support System</h1>
          <p className="text-gray-600">AI-powered emotional monitoring, empathy enhancement, and burnout prevention for healthcare teams</p>
        </div>
      </div>

      <div className="flex space-x-4 border-b">
        {[
          { id: 'profiles', label: 'Caregiver Profiles', icon: Users },
          { id: 'monitoring', label: 'Emotional Monitoring', icon: Activity },
          { id: 'empathy', label: 'Empathy Enhancement', icon: Heart },
          { id: 'communication', label: 'Communication Support', icon: MessageCircle },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === id
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'profiles' && renderProfiles()}
        {activeTab === 'monitoring' && renderMonitoring()}
        {activeTab === 'empathy' && renderEmpathy()}
        {activeTab === 'communication' && renderCommunication()}
      </div>
    </div>
  );
};

export default CaregiverEmotionalIntelligence;