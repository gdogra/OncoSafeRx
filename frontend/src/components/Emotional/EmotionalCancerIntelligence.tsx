import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Brain, 
  Smile,
  Frown,
  Meh,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Eye,
  Mic,
  Camera,
  MessageCircle,
  Phone,
  Video,
  Monitor,
  Headphones,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Settings,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  User,
  Users,
  Star,
  Flag,
  Tag,
  Bookmark,
  Share2,
  Download,
  Upload,
  Save,
  Edit,
  Trash2,
  Plus,
  Minus,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Info,
  HelpCircle,
  RefreshCcw,
  Search,
  Filter,
  Grid,
  List,
  Map,
  Compass,
  Navigation,
  Target,
  Shield,
  Lock,
  Unlock,
  Database,
  Cloud,
  Wifi,
  Signal,
  Battery,
  Smartphone,
  Tablet
} from 'lucide-react';

interface EmotionalState {
  id: string;
  patientId: string;
  timestamp: string;
  primaryEmotion: 'joy' | 'sadness' | 'anger' | 'fear' | 'disgust' | 'surprise' | 'neutral';
  emotionIntensity: number;
  emotionalComplexity: {
    valence: number; // -1 (negative) to 1 (positive)
    arousal: number; // 0 (calm) to 1 (excited)
    dominance: number; // 0 (submissive) to 1 (dominant)
  };
  contextualFactors: {
    treatmentPhase: string;
    recentEvents: string[];
    socialSupport: number;
    physicalDiscomfort: number;
    uncertaintyLevel: number;
  };
  physiologicalCorrelates: {
    heartRateVariability: number;
    cortisol: number;
    bloodPressure: number;
    sleepQuality: number;
    appetite: number;
  };
  cognitivePatterns: {
    attentionFocus: 'internal' | 'external' | 'mixed';
    memoryRecall: number;
    decisionMaking: number;
    problemSolving: number;
    rumination: number;
  };
  copistrategies: {
    adaptiveCoping: string[];
    maladaptiveCoping: string[];
    copingEffectiveness: number;
    supportSeeking: number;
  };
}

interface EmotionalAnalysis {
  id: string;
  patientId: string;
  analysisDate: string;
  timeframe: string;
  emotionalTrajectory: {
    trend: 'improving' | 'declining' | 'stable' | 'fluctuating';
    changeRate: number;
    keyMilestones: Array<{
      date: string;
      event: string;
      emotionalImpact: number;
    }>;
  };
  patterns: {
    cyclic: boolean;
    cyclePeriod?: number;
    triggers: Array<{
      trigger: string;
      frequency: number;
      intensity: number;
      duration: number;
    }>;
    resilience: {
      score: number;
      factors: string[];
      adaptability: number;
    };
  };
  riskAssessment: {
    depressionRisk: number;
    anxietyRisk: number;
    ptsdRisk: number;
    suicidalIdeation: number;
    overallMentalHealth: number;
  };
  interventionRecommendations: Array<{
    type: 'therapeutic' | 'pharmacological' | 'social' | 'lifestyle';
    intervention: string;
    urgency: 'low' | 'moderate' | 'high' | 'urgent';
    expectedBenefit: number;
    evidence: string;
  }>;
}

interface SupportIntervention {
  id: string;
  patientId: string;
  interventionType: 'ai_companion' | 'peer_support' | 'professional_therapy' | 'family_connection' | 'mindfulness' | 'creative_therapy';
  status: 'active' | 'scheduled' | 'completed' | 'cancelled';
  trigger: string;
  content: {
    title: string;
    description: string;
    duration: number;
    materials: string[];
    techniques: string[];
  };
  personalization: {
    emotionalNeed: string;
    preferredStyle: string;
    culturalConsiderations: string[];
    languagePreference: string;
  };
  effectiveness: {
    immediateResponse: number;
    shortTermBenefit: number;
    longTermImpact: number;
    patientSatisfaction: number;
  };
  aiInsights: {
    emotionalContext: string;
    recommendedTiming: string;
    adaptations: string[];
    followUpActions: string[];
  };
}

interface EmotionalBiomarker {
  id: string;
  patientId: string;
  timestamp: string;
  voiceAnalysis: {
    pitch: number;
    tempo: number;
    volume: number;
    tonalQuality: string;
    speechPatterns: string[];
    emotionalMarkers: { [emotion: string]: number };
  };
  facialAnalysis: {
    microExpressions: { [expression: string]: number };
    eyeMovement: string;
    muscleTension: number;
    skinConductance: number;
    facialSymmetry: number;
  };
  textualAnalysis: {
    sentiment: number;
    emotionalWords: string[];
    linguisticPatterns: string[];
    communicationStyle: string;
    urgencyMarkers: number;
  };
  behavioralSignals: {
    activityLevel: number;
    socialEngagement: number;
    sleepPatterns: string;
    appetiteChanges: number;
    medicationAdherence: number;
  };
  neurophysiological: {
    brainwavePatterns: { [band: string]: number };
    neurotransmitterLevels: { [neurotransmitter: string]: number };
    stressHormones: { [hormone: string]: number };
    inflammatoryMarkers: { [marker: string]: number };
  };
}

const EmotionalCancerIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [emotionalStates, setEmotionalStates] = useState<EmotionalState[]>([]);
  const [emotionalAnalyses, setEmotionalAnalyses] = useState<EmotionalAnalysis[]>([]);
  const [supportInterventions, setSupportInterventions] = useState<SupportIntervention[]>([]);
  const [emotionalBiomarkers, setEmotionalBiomarkers] = useState<EmotionalBiomarker[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [viewMode, setViewMode] = useState<'real_time' | 'analysis' | 'intervention'>('real_time');
  const emotionCanvasRef = useRef<HTMLCanvasElement>(null);
  const biometricCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateMockEmotionalData();
    if (emotionCanvasRef.current) {
      renderEmotionVisualization();
    }
    if (biometricCanvasRef.current) {
      renderBiometricVisualization();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isMonitoring) {
      interval = setInterval(() => {
        updateRealTimeEmotions();
        if (emotionCanvasRef.current) {
          renderEmotionVisualization();
        }
        if (biometricCanvasRef.current) {
          renderBiometricVisualization();
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  const generateMockEmotionalData = () => {
    const mockStates: EmotionalState[] = [
      {
        id: 'es001',
        patientId: 'patient123',
        timestamp: new Date().toISOString(),
        primaryEmotion: 'sadness',
        emotionIntensity: 0.67,
        emotionalComplexity: {
          valence: -0.45,
          arousal: 0.32,
          dominance: 0.28
        },
        contextualFactors: {
          treatmentPhase: 'Active Chemotherapy',
          recentEvents: ['Treatment side effects', 'Family visit', 'Lab results received'],
          socialSupport: 0.78,
          physicalDiscomfort: 0.65,
          uncertaintyLevel: 0.82
        },
        physiologicalCorrelates: {
          heartRateVariability: 0.45,
          cortisol: 18.5,
          bloodPressure: 142,
          sleepQuality: 0.52,
          appetite: 0.34
        },
        cognitivePatterns: {
          attentionFocus: 'internal',
          memoryRecall: 0.68,
          decisionMaking: 0.72,
          problemSolving: 0.58,
          rumination: 0.78
        },
        copistrategies: {
          adaptiveCoping: ['Social support', 'Mindfulness', 'Exercise'],
          maladaptiveCoping: ['Avoidance', 'Rumination'],
          copingEffectiveness: 0.64,
          supportSeeking: 0.73
        }
      },
      {
        id: 'es002',
        patientId: 'patient123',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        primaryEmotion: 'fear',
        emotionIntensity: 0.84,
        emotionalComplexity: {
          valence: -0.72,
          arousal: 0.89,
          dominance: 0.15
        },
        contextualFactors: {
          treatmentPhase: 'Pre-Surgery Consultation',
          recentEvents: ['Surgery scheduled', 'Risk discussion', 'Consent signing'],
          socialSupport: 0.82,
          physicalDiscomfort: 0.23,
          uncertaintyLevel: 0.95
        },
        physiologicalCorrelates: {
          heartRateVariability: 0.28,
          cortisol: 24.8,
          bloodPressure: 158,
          sleepQuality: 0.31,
          appetite: 0.45
        },
        cognitivePatterns: {
          attentionFocus: 'external',
          memoryRecall: 0.85,
          decisionMaking: 0.42,
          problemSolving: 0.38,
          rumination: 0.92
        },
        copistrategies: {
          adaptiveCoping: ['Information seeking', 'Support groups', 'Prayer'],
          maladaptiveCoping: ['Catastrophizing', 'Withdrawal'],
          copingEffectiveness: 0.48,
          supportSeeking: 0.89
        }
      }
    ];

    const mockAnalyses: EmotionalAnalysis[] = [
      {
        id: 'ea001',
        patientId: 'patient123',
        analysisDate: new Date().toISOString(),
        timeframe: 'Last 30 days',
        emotionalTrajectory: {
          trend: 'fluctuating',
          changeRate: 0.32,
          keyMilestones: [
            {
              date: '2024-10-01',
              event: 'Diagnosis received',
              emotionalImpact: -0.85
            },
            {
              date: '2024-10-15',
              event: 'Treatment plan established',
              emotionalImpact: 0.42
            },
            {
              date: '2024-10-22',
              event: 'First chemotherapy cycle',
              emotionalImpact: -0.63
            }
          ]
        },
        patterns: {
          cyclic: true,
          cyclePeriod: 21, // 3-week treatment cycles
          triggers: [
            {
              trigger: 'Treatment days',
              frequency: 0.67,
              intensity: 0.78,
              duration: 3.5
            },
            {
              trigger: 'Medical appointments',
              frequency: 0.89,
              intensity: 0.65,
              duration: 2.0
            },
            {
              trigger: 'Family interactions',
              frequency: 0.34,
              intensity: 0.45,
              duration: 1.5
            }
          ],
          resilience: {
            score: 0.72,
            factors: ['Strong family support', 'Previous adversity experience', 'Spiritual beliefs'],
            adaptability: 0.78
          }
        },
        riskAssessment: {
          depressionRisk: 0.45,
          anxietyRisk: 0.67,
          ptsdRisk: 0.23,
          suicidalIdeation: 0.08,
          overallMentalHealth: 0.65
        },
        interventionRecommendations: [
          {
            type: 'therapeutic',
            intervention: 'Cognitive Behavioral Therapy for Cancer Patients',
            urgency: 'moderate',
            expectedBenefit: 0.78,
            evidence: 'Strong evidence for CBT in cancer-related anxiety and depression'
          },
          {
            type: 'pharmacological',
            intervention: 'Consider anxiolytic for acute anxiety episodes',
            urgency: 'low',
            expectedBenefit: 0.54,
            evidence: 'Limited use recommended due to interaction concerns'
          },
          {
            type: 'social',
            intervention: 'Peer support group participation',
            urgency: 'moderate',
            expectedBenefit: 0.82,
            evidence: 'Consistent benefits shown in cancer patient populations'
          }
        ]
      }
    ];

    const mockInterventions: SupportIntervention[] = [
      {
        id: 'si001',
        patientId: 'patient123',
        interventionType: 'ai_companion',
        status: 'active',
        trigger: 'Elevated anxiety detected during treatment preparation',
        content: {
          title: 'Calming Conversation and Guided Breathing',
          description: 'AI-guided relaxation session with personalized breathing exercises',
          duration: 15,
          materials: ['Guided audio', 'Visual breathing prompts', 'Calming music'],
          techniques: ['Deep breathing', 'Progressive muscle relaxation', 'Mindfulness']
        },
        personalization: {
          emotionalNeed: 'Anxiety reduction and emotional regulation',
          preferredStyle: 'Gentle and encouraging tone',
          culturalConsiderations: ['Family-centered approach', 'Religious sensitivity'],
          languagePreference: 'English'
        },
        effectiveness: {
          immediateResponse: 0.78,
          shortTermBenefit: 0.65,
          longTermImpact: 0.42,
          patientSatisfaction: 0.89
        },
        aiInsights: {
          emotionalContext: 'Pre-treatment anxiety with anticipatory fear',
          recommendedTiming: 'During preparation for medical procedures',
          adaptations: ['Shortened session due to fatigue', 'Added spiritual elements'],
          followUpActions: ['Check-in after 2 hours', 'Offer additional resources']
        }
      },
      {
        id: 'si002',
        patientId: 'patient123',
        interventionType: 'mindfulness',
        status: 'scheduled',
        trigger: 'Pattern of rumination and negative thought cycling',
        content: {
          title: 'Mindful Moment: Breaking the Worry Cycle',
          description: 'Structured mindfulness practice to interrupt rumination patterns',
          duration: 10,
          materials: ['Mindfulness bell', 'Nature sounds', 'Grounding exercises'],
          techniques: ['Present moment awareness', 'Thought observation', 'Body scan']
        },
        personalization: {
          emotionalNeed: 'Interrupting negative thought patterns',
          preferredStyle: 'Structured and clear instructions',
          culturalConsiderations: ['Secular approach preferred'],
          languagePreference: 'English'
        },
        effectiveness: {
          immediateResponse: 0.72,
          shortTermBenefit: 0.84,
          longTermImpact: 0.76,
          patientSatisfaction: 0.91
        },
        aiInsights: {
          emotionalContext: 'Cognitive rumination with moderate distress',
          recommendedTiming: 'Early morning or before sleep',
          adaptations: ['Simplified instructions', 'Shorter attention spans'],
          followUpActions: ['Track thought patterns', 'Offer follow-up session']
        }
      }
    ];

    const mockBiomarkers: EmotionalBiomarker[] = [
      {
        id: 'eb001',
        patientId: 'patient123',
        timestamp: new Date().toISOString(),
        voiceAnalysis: {
          pitch: 185.5,
          tempo: 0.72,
          volume: 0.65,
          tonalQuality: 'strained',
          speechPatterns: ['hesitation', 'vocal_fry', 'uptalk'],
          emotionalMarkers: {
            sadness: 0.67,
            fear: 0.45,
            fatigue: 0.78,
            uncertainty: 0.82
          }
        },
        facialAnalysis: {
          microExpressions: {
            sadness: 0.58,
            fear: 0.42,
            contempt: 0.15,
            surprise: 0.08
          },
          eyeMovement: 'downward_gaze',
          muscleTension: 0.72,
          skinConductance: 0.68,
          facialSymmetry: 0.85
        },
        textualAnalysis: {
          sentiment: -0.45,
          emotionalWords: ['worried', 'tired', 'uncertain', 'scared', 'hope'],
          linguisticPatterns: ['negative_framing', 'future_uncertainty', 'help_seeking'],
          communicationStyle: 'hesitant_but_open',
          urgencyMarkers: 0.32
        },
        behavioralSignals: {
          activityLevel: 0.42,
          socialEngagement: 0.68,
          sleepPatterns: 'fragmented',
          appetiteChanges: -0.35,
          medicationAdherence: 0.89
        },
        neurophysiological: {
          brainwavePatterns: {
            alpha: 0.45,
            beta: 0.78,
            theta: 0.62,
            delta: 0.23
          },
          neurotransmitterLevels: {
            serotonin: 0.68,
            dopamine: 0.52,
            norepinephrine: 0.84,
            gaba: 0.45
          },
          stressHormones: {
            cortisol: 18.5,
            adrenaline: 0.72,
            noradrenaline: 0.68
          },
          inflammatoryMarkers: {
            il6: 2.8,
            tnf_alpha: 1.2,
            crp: 3.4
          }
        }
      }
    ];

    setEmotionalStates(mockStates);
    setEmotionalAnalyses(mockAnalyses);
    setSupportInterventions(mockInterventions);
    setEmotionalBiomarkers(mockBiomarkers);
  };

  const updateRealTimeEmotions = () => {
    const emotions = ['joy', 'sadness', 'anger', 'fear', 'neutral'];
    const newState: EmotionalState = {
      id: `es_${Date.now()}`,
      patientId: 'patient123',
      timestamp: new Date().toISOString(),
      primaryEmotion: emotions[Math.floor(Math.random() * emotions.length)] as any,
      emotionIntensity: Math.random(),
      emotionalComplexity: {
        valence: (Math.random() - 0.5) * 2,
        arousal: Math.random(),
        dominance: Math.random()
      },
      contextualFactors: {
        treatmentPhase: 'Real-time monitoring',
        recentEvents: ['System update'],
        socialSupport: Math.random(),
        physicalDiscomfort: Math.random(),
        uncertaintyLevel: Math.random()
      },
      physiologicalCorrelates: {
        heartRateVariability: Math.random(),
        cortisol: 10 + Math.random() * 20,
        bloodPressure: 120 + Math.random() * 40,
        sleepQuality: Math.random(),
        appetite: Math.random()
      },
      cognitivePatterns: {
        attentionFocus: ['internal', 'external', 'mixed'][Math.floor(Math.random() * 3)] as any,
        memoryRecall: Math.random(),
        decisionMaking: Math.random(),
        problemSolving: Math.random(),
        rumination: Math.random()
      },
      copistrategies: {
        adaptiveCoping: ['Support', 'Exercise'],
        maladaptiveCoping: ['Avoidance'],
        copingEffectiveness: Math.random(),
        supportSeeking: Math.random()
      }
    };

    setEmotionalStates(prev => [newState, ...prev.slice(0, 9)]);
  };

  const renderEmotionVisualization = () => {
    const canvas = emotionCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 500;
    canvas.height = 400;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() * 0.001;

    if (emotionalStates.length > 0) {
      const currentState = emotionalStates[0];
      
      // Draw emotion wheel
      const emotions = [
        { name: 'Joy', angle: 0, color: '#fbbf24' },
        { name: 'Surprise', angle: 60, color: '#a78bfa' },
        { name: 'Fear', angle: 120, color: '#ef4444' },
        { name: 'Sadness', angle: 180, color: '#3b82f6' },
        { name: 'Disgust', angle: 240, color: '#10b981' },
        { name: 'Anger', angle: 300, color: '#f59e0b' }
      ];

      emotions.forEach((emotion, index) => {
        const angle = (emotion.angle * Math.PI) / 180;
        const radius = 80;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        const intensity = emotion.name.toLowerCase() === currentState.primaryEmotion ? currentState.emotionIntensity : 0.2;
        const emotionRadius = 15 + intensity * 20;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, emotionRadius);
        gradient.addColorStop(0, emotion.color);
        gradient.addColorStop(0.7, emotion.color + '88');
        gradient.addColorStop(1, emotion.color + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, emotionRadius, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing effect for active emotion
        if (emotion.name.toLowerCase() === currentState.primaryEmotion && isMonitoring) {
          const pulseRadius = emotionRadius + Math.sin(time * 4) * 8;
          ctx.strokeStyle = emotion.color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Emotion labels
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(emotion.name, x, y + emotionRadius + 20);
      });

      // Draw emotional complexity visualization
      const complexityX = centerX;
      const complexityY = centerY;

      // Valence line (horizontal)
      const valenceX = complexityX + currentState.emotionalComplexity.valence * 60;
      ctx.strokeStyle = currentState.emotionalComplexity.valence > 0 ? '#10b981' : '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(complexityX, complexityY);
      ctx.lineTo(valenceX, complexityY);
      ctx.stroke();

      // Arousal line (vertical)
      const arousalY = complexityY - currentState.emotionalComplexity.arousal * 60;
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(complexityX, complexityY);
      ctx.lineTo(complexityX, arousalY);
      ctx.stroke();

      // Central emotion indicator
      ctx.fillStyle = emotions.find(e => e.name.toLowerCase() === currentState.primaryEmotion)?.color || '#ffffff';
      ctx.beginPath();
      ctx.arc(complexityX, complexityY, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw status information
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Emotional Intelligence Monitor', 20, 30);
    ctx.font = '12px sans-serif';
    if (emotionalStates.length > 0) {
      ctx.fillText(`Current: ${emotionalStates[0].primaryEmotion.toUpperCase()}`, 20, 50);
      ctx.fillText(`Intensity: ${(emotionalStates[0].emotionIntensity * 100).toFixed(0)}%`, 20, 70);
      ctx.fillText(`Valence: ${emotionalStates[0].emotionalComplexity.valence.toFixed(2)}`, 20, 90);
    }
  };

  const renderBiometricVisualization = () => {
    const canvas = biometricCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 300;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const time = Date.now() * 0.001;

    // Draw heart rate variability simulation
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let x = 0; x < canvas.width; x += 2) {
      const baseY = canvas.height / 2;
      const hrv = emotionalStates.length > 0 ? emotionalStates[0].physiologicalCorrelates.heartRateVariability : 0.5;
      const y = baseY + Math.sin((x + time * 100) * 0.1) * 30 * hrv + Math.sin((x + time * 50) * 0.05) * 10;
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw biomarker indicators
    if (emotionalBiomarkers.length > 0) {
      const biomarker = emotionalBiomarkers[0];
      
      // Voice pitch indicator
      const pitchHeight = (biomarker.voiceAnalysis.pitch / 300) * 50;
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(50, 50, 20, pitchHeight);
      
      // Facial tension indicator
      const tensionHeight = biomarker.facialAnalysis.muscleTension * 50;
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(80, 50, 20, tensionHeight);
      
      // Activity level indicator
      const activityHeight = biomarker.behavioralSignals.activityLevel * 50;
      ctx.fillStyle = '#10b981';
      ctx.fillRect(110, 50, 20, activityHeight);
    }

    // Labels
    ctx.fillStyle = '#1f2937';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Heart Rate Variability', canvas.width / 2, 30);
    ctx.font = '10px sans-serif';
    ctx.fillText('Voice', 60, 120);
    ctx.fillText('Facial', 90, 120);
    ctx.fillText('Activity', 120, 120);
  };

  const toggleMonitoring = () => {
    setIsMonitoring(prev => !prev);
  };

  const getEmotionColor = (emotion: string): string => {
    switch (emotion) {
      case 'joy': return '#fbbf24';
      case 'sadness': return '#3b82f6';
      case 'anger': return '#ef4444';
      case 'fear': return '#f59e0b';
      case 'disgust': return '#10b981';
      case 'surprise': return '#a78bfa';
      default: return '#6b7280';
    }
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'joy': return Smile;
      case 'sadness': return Frown;
      case 'fear': return AlertTriangle;
      default: return Meh;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-xl p-6 border border-pink-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-500 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Emotional State</h3>
                <p className="text-sm text-gray-600">Current primary</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-pink-600 capitalize">
                {emotionalStates[0]?.primaryEmotion || 'Unknown'}
              </div>
              <div className="text-sm text-gray-600">
                {((emotionalStates[0]?.emotionIntensity || 0) * 100).toFixed(0)}% intensity
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Mental Health</h3>
                <p className="text-sm text-gray-600">Overall score</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {((emotionalAnalyses[0]?.riskAssessment.overallMentalHealth || 0) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(emotionalAnalyses[0]?.riskAssessment.overallMentalHealth || 0) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Resilience</h3>
                <p className="text-sm text-gray-600">Coping ability</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {((emotionalAnalyses[0]?.patterns.resilience.score || 0) * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Interventions</h3>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {supportInterventions.filter(i => i.status === 'active').length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <span>Real-Time Emotional Monitoring</span>
            </h3>
            <div className="flex items-center space-x-2">
              <select 
                value={viewMode} 
                onChange={(e) => setViewMode(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="real_time">Real-Time</option>
                <option value="analysis">Analysis</option>
                <option value="intervention">Intervention</option>
              </select>
              <button
                onClick={toggleMonitoring}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isMonitoring 
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isMonitoring ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Monitor</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            <canvas
              ref={emotionCanvasRef}
              className="border border-gray-300 rounded-lg bg-slate-900"
            />
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Multi-dimensional emotion wheel showing valence, arousal, and dominance
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <span>Physiological Biomarkers</span>
          </h3>
          <div className="flex justify-center">
            <canvas
              ref={biometricCanvasRef}
              className="border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Real-time emotional biomarkers including voice, facial, and behavioral signals
          </div>
        </div>
      </div>

      {emotionalStates.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <span>Current Emotional Profile</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Emotional Complexity</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Valence:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          emotionalStates[0].emotionalComplexity.valence > 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.abs(emotionalStates[0].emotionalComplexity.valence) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {emotionalStates[0].emotionalComplexity.valence.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Arousal:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${emotionalStates[0].emotionalComplexity.arousal * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {emotionalStates[0].emotionalComplexity.arousal.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dominance:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${emotionalStates[0].emotionalComplexity.dominance * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {emotionalStates[0].emotionalComplexity.dominance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Contextual Factors</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Treatment Phase:</span>
                  <span className="font-medium">{emotionalStates[0].contextualFactors.treatmentPhase}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Social Support:</span>
                  <span className="font-medium">
                    {(emotionalStates[0].contextualFactors.socialSupport * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Physical Discomfort:</span>
                  <span className="font-medium">
                    {(emotionalStates[0].contextualFactors.physicalDiscomfort * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uncertainty Level:</span>
                  <span className="font-medium">
                    {(emotionalStates[0].contextualFactors.uncertaintyLevel * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Coping Strategies</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 font-medium">Adaptive:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {emotionalStates[0].copistrategies.adaptiveCoping.map((strategy) => (
                      <span key={strategy} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {strategy}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600 font-medium">Maladaptive:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {emotionalStates[0].copistrategies.maladaptiveCoping.map((strategy) => (
                      <span key={strategy} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        {strategy}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Effectiveness:</span>
                  <span className="font-medium">
                    {(emotionalStates[0].copistrategies.copingEffectiveness * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalysis = () => (
    <div className="space-y-6">
      {emotionalAnalyses.map((analysis) => (
        <div key={analysis.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <span>Emotional Trajectory Analysis</span>
            </h3>
            <div className="text-sm text-gray-600">
              Timeframe: {analysis.timeframe}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Trajectory Overview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Trend:</span>
                  <span className={`font-medium capitalize ${
                    analysis.emotionalTrajectory.trend === 'improving' ? 'text-green-600' :
                    analysis.emotionalTrajectory.trend === 'declining' ? 'text-red-600' :
                    analysis.emotionalTrajectory.trend === 'stable' ? 'text-blue-600' :
                    'text-orange-600'
                  }`}>
                    {analysis.emotionalTrajectory.trend}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Change Rate:</span>
                  <span className="font-medium">{analysis.emotionalTrajectory.changeRate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Key Milestones:</span>
                  <span className="font-medium">{analysis.emotionalTrajectory.keyMilestones.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Resilience Assessment</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Resilience Score:</span>
                  <span className="font-bold text-green-600">
                    {(analysis.patterns.resilience.score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Adaptability:</span>
                  <span className="font-medium">
                    {(analysis.patterns.resilience.adaptability * 100).toFixed(0)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Factors:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {analysis.patterns.resilience.factors.slice(0, 2).map((factor) => (
                      <span key={factor} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Key Emotional Milestones</h4>
            <div className="space-y-3">
              {analysis.emotionalTrajectory.keyMilestones.map((milestone, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${
                  milestone.emotionalImpact > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">{milestone.event}</span>
                      <div className="text-sm text-gray-600">
                        {new Date(milestone.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${
                      milestone.emotionalImpact > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {milestone.emotionalImpact > 0 ? '+' : ''}{(milestone.emotionalImpact * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Risk Assessment</h4>
              <div className="space-y-3">
                {Object.entries(analysis.riskAssessment).map(([risk, value]) => (
                  <div key={risk} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">
                      {risk.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            typeof value === 'number' && value > 0.7 ? 'bg-red-500' :
                            typeof value === 'number' && value > 0.4 ? 'bg-orange-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${typeof value === 'number' ? value * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {typeof value === 'number' ? `${(value * 100).toFixed(0)}%` : value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Pattern Triggers</h4>
              <div className="space-y-2">
                {analysis.patterns.triggers.slice(0, 3).map((trigger, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">{trigger.trigger}</span>
                      <span className="text-gray-600">{(trigger.frequency * 100).toFixed(0)}% freq</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Intensity: {(trigger.intensity * 100).toFixed(0)}% | 
                      Duration: {trigger.duration.toFixed(1)}h
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Intervention Recommendations</h4>
            <div className="space-y-2">
              {analysis.interventionRecommendations.map((rec, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{rec.intervention}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rec.urgency === 'urgent' ? 'bg-red-100 text-red-800' :
                      rec.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                      rec.urgency === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {rec.urgency} priority
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium ml-1 capitalize">{rec.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Expected Benefit:</span>
                      <span className="font-medium ml-1">{(rec.expectedBenefit * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    Evidence: {rec.evidence}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderInterventions = () => (
    <div className="space-y-6">
      {supportInterventions.map((intervention) => (
        <div key={intervention.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <span>{intervention.content.title}</span>
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 capitalize">
                {intervention.interventionType.replace('_', ' ')}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                intervention.status === 'active' ? 'bg-green-100 text-green-800' :
                intervention.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                intervention.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>
                {intervention.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Trigger</h4>
            <p className="text-sm text-gray-700">{intervention.trigger}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Intervention Content</h4>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">{intervention.content.description}</p>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{intervention.content.duration} minutes</span>
                </div>
                <div>
                  <span className="text-gray-600">Techniques:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {intervention.content.techniques.map((technique) => (
                      <span key={technique} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {technique}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Personalization</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Emotional Need:</span>
                  <p className="font-medium">{intervention.personalization.emotionalNeed}</p>
                </div>
                <div>
                  <span className="text-gray-600">Preferred Style:</span>
                  <p className="font-medium">{intervention.personalization.preferredStyle}</p>
                </div>
                <div>
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium ml-1">{intervention.personalization.languagePreference}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {(intervention.effectiveness.immediateResponse * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600">Immediate Response</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {(intervention.effectiveness.shortTermBenefit * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600">Short-term Benefit</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {(intervention.effectiveness.longTermImpact * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600">Long-term Impact</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {(intervention.effectiveness.patientSatisfaction * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600">Patient Satisfaction</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">AI Insights & Recommendations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 font-medium">Context:</span>
                <p className="text-gray-700">{intervention.aiInsights.emotionalContext}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Timing:</span>
                <p className="text-gray-700">{intervention.aiInsights.recommendedTiming}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Adaptations:</span>
                <ul className="list-disc list-inside text-gray-700 ml-2">
                  {intervention.aiInsights.adaptations.map((adaptation, idx) => (
                    <li key={idx}>{adaptation}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Follow-up:</span>
                <ul className="list-disc list-inside text-gray-700 ml-2">
                  {intervention.aiInsights.followUpActions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Emotional Overview', icon: Eye },
    { id: 'analysis', label: 'Trajectory Analysis', icon: BarChart3 },
    { id: 'interventions', label: 'Support Interventions', icon: Heart },
    { id: 'biomarkers', label: 'Emotional Biomarkers', icon: Activity }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Emotional Cancer Intelligence
            </h1>
            <p className="text-gray-600">
              AI-powered emotional support and mental health monitoring for cancer patients
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap border-b border-gray-200 mb-8">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-screen">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'analysis' && renderAnalysis()}
        {activeTab === 'interventions' && renderInterventions()}
        {activeTab === 'biomarkers' && renderOverview()} {/* Reuse overview for biomarkers tab */}
      </div>
    </div>
  );
};

export default EmotionalCancerIntelligence;