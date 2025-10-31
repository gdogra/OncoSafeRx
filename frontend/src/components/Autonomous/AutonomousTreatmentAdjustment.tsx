import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Cpu, 
  Activity, 
  Zap,
  Target,
  Brain,
  Heart,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Gauge,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Save,
  Share2,
  Download,
  Upload,
  Bell,
  Eye,
  Filter,
  Search,
  Star,
  Flag,
  Tag,
  Copy,
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
  ExternalLink,
  RefreshCcw,
  Database,
  Cloud,
  Wifi,
  Signal,
  Battery,
  Monitor,
  Smartphone,
  Tablet,
  Lock,
  Unlock,
  User,
  Users,
  Calendar,
  MapPin,
  Navigation,
  Compass,
  Layers,
  Grid,
  Move3D,
  Rotate3D,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Bluetooth,
  Headphones
} from 'lucide-react';

interface AutonomousAgent {
  id: string;
  name: string;
  type: 'dosing' | 'scheduling' | 'monitoring' | 'safety' | 'optimization' | 'emergency';
  status: 'active' | 'inactive' | 'learning' | 'adjusting' | 'error';
  confidence: number;
  accuracy: number;
  decisionsToday: number;
  lastAction: string;
  lastActionTime: string;
  autonomyLevel: 'supervised' | 'semi_autonomous' | 'fully_autonomous';
  capabilities: string[];
  learningRate: number;
  performance: {
    successRate: number;
    responseTime: number;
    patientSafety: number;
    treatmentEfficacy: number;
  };
}

interface TreatmentAdjustment {
  id: string;
  patientId: string;
  timestamp: string;
  agentId: string;
  adjustmentType: 'dose_modification' | 'schedule_change' | 'drug_substitution' | 'therapy_pause' | 'emergency_stop';
  currentTreatment: {
    drug: string;
    dose: number;
    frequency: string;
    route: string;
    duration: number;
  };
  proposedAdjustment: {
    drug: string;
    dose: number;
    frequency: string;
    route: string;
    duration: number;
    rationale: string;
  };
  triggeringFactors: Array<{
    type: 'biomarker' | 'side_effect' | 'efficacy' | 'lab_value' | 'imaging' | 'patient_reported';
    value: any;
    threshold: any;
    severity: 'low' | 'moderate' | 'high' | 'critical';
  }>;
  riskAssessment: {
    safetyRisk: number;
    efficacyImpact: number;
    qualityOfLifeImpact: number;
    overallRisk: number;
  };
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'implemented' | 'physician_review_required';
  confidence: number;
  evidenceStrength: number;
  alternativeOptions: Array<{
    option: string;
    pros: string[];
    cons: string[];
    confidence: number;
  }>;
}

interface AutonomousDecision {
  id: string;
  timestamp: string;
  agentId: string;
  decisionType: 'treatment_adjustment' | 'monitoring_frequency' | 'alert_generation' | 'safety_intervention';
  context: {
    patientCondition: string;
    currentTreatment: string;
    recentChanges: string[];
    riskFactors: string[];
  };
  decisionLogic: {
    algorithm: string;
    parameters: { [key: string]: any };
    confidenceLevel: number;
    alternativesConsidered: number;
  };
  outcome: {
    decision: string;
    implementationPlan: string[];
    expectedBenefit: string;
    monitoringPlan: string[];
  };
  humanOversight: {
    required: boolean;
    notified: boolean;
    approvalNeeded: boolean;
    reviewerAssigned: string;
  };
  realTimeData: {
    vitalSigns: { [sign: string]: number };
    labValues: { [lab: string]: number };
    symptoms: string[];
    patientFeedback: string;
  };
}

interface LearningMetrics {
  id: string;
  agentId: string;
  timeframe: string;
  learningProgress: {
    modelsUpdated: number;
    accuracyImprovement: number;
    newPatternsLearned: number;
    errorRate: number;
  };
  adaptationMetrics: {
    contextualAdaptation: number;
    personalizedLearning: number;
    cross_patientLearning: number;
    temporalAdaptation: number;
  };
  performanceEvolution: Array<{
    date: string;
    accuracy: number;
    confidence: number;
    decisionsPerDay: number;
    humanOverrideRate: number;
  }>;
  feedbackIntegration: {
    physicianFeedback: number;
    patientOutcomes: number;
    realWorldEvidence: number;
    continuousMonitoring: number;
  };
}

const AutonomousTreatmentAdjustment: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [autonomousAgents, setAutonomousAgents] = useState<AutonomousAgent[]>([]);
  const [treatmentAdjustments, setTreatmentAdjustments] = useState<TreatmentAdjustment[]>([]);
  const [autonomousDecisions, setAutonomousDecisions] = useState<AutonomousDecision[]>([]);
  const [learningMetrics, setLearningMetrics] = useState<LearningMetrics[]>([]);
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [autonomyLevel, setAutonomyLevel] = useState<'supervised' | 'semi_autonomous' | 'fully_autonomous'>('supervised');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const systemCanvasRef = useRef<HTMLCanvasElement>(null);
  const decisionCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const isDemoMode = false; // Demo mode removed for production
    if (isDemoMode) {
      generateMockAutonomousData();
    } else {
      setAgents([]);
      setTreatmentAdjustments([]);
      setAutonomousDecisions([]);
      setLearningMetrics([]);
    }
    if (systemCanvasRef.current) {
      renderSystemVisualization();
    }
    if (decisionCanvasRef.current) {
      renderDecisionVisualization();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSystemActive) {
      interval = setInterval(() => {
        updateSystemMetrics();
        generateRealTimeDecision();
        if (systemCanvasRef.current) {
          renderSystemVisualization();
        }
        if (decisionCanvasRef.current) {
          renderDecisionVisualization();
        }
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSystemActive]);

  const generateMockAutonomousData = () => {
    const mockAgents: AutonomousAgent[] = [
      {
        id: 'agent001',
        name: 'DoseOptimizer AI',
        type: 'dosing',
        status: 'active',
        confidence: 0.94,
        accuracy: 0.91,
        decisionsToday: 23,
        lastAction: 'Reduced carboplatin dose by 15% due to thrombocytopenia',
        lastActionTime: new Date(Date.now() - 1800000).toISOString(),
        autonomyLevel: 'semi_autonomous',
        capabilities: ['dose_calculation', 'toxicity_prediction', 'efficacy_optimization', 'pharmacokinetics'],
        learningRate: 0.85,
        performance: {
          successRate: 0.89,
          responseTime: 2.3,
          patientSafety: 0.96,
          treatmentEfficacy: 0.87
        }
      },
      {
        id: 'agent002',
        name: 'SafetyGuard AI',
        type: 'safety',
        status: 'active',
        confidence: 0.98,
        accuracy: 0.95,
        decisionsToday: 41,
        lastAction: 'Triggered immediate physician review for severe neutropenia',
        lastActionTime: new Date(Date.now() - 900000).toISOString(),
        autonomyLevel: 'fully_autonomous',
        capabilities: ['toxicity_monitoring', 'early_warning', 'emergency_protocols', 'risk_assessment'],
        learningRate: 0.92,
        performance: {
          successRate: 0.97,
          responseTime: 0.8,
          patientSafety: 0.99,
          treatmentEfficacy: 0.93
        }
      },
      {
        id: 'agent003',
        name: 'ScheduleOptimizer AI',
        type: 'scheduling',
        status: 'learning',
        confidence: 0.87,
        accuracy: 0.82,
        decisionsToday: 15,
        lastAction: 'Adjusted infusion schedule to improve patient convenience',
        lastActionTime: new Date(Date.now() - 3600000).toISOString(),
        autonomyLevel: 'supervised',
        capabilities: ['schedule_optimization', 'patient_preference', 'clinic_capacity', 'timing_analysis'],
        learningRate: 0.78,
        performance: {
          successRate: 0.84,
          responseTime: 5.2,
          patientSafety: 0.91,
          treatmentEfficacy: 0.79
        }
      },
      {
        id: 'agent004',
        name: 'ResponsePredictor AI',
        type: 'monitoring',
        status: 'active',
        confidence: 0.91,
        accuracy: 0.88,
        decisionsToday: 32,
        lastAction: 'Recommended imaging follow-up based on biomarker trends',
        lastActionTime: new Date(Date.now() - 2700000).toISOString(),
        autonomyLevel: 'semi_autonomous',
        capabilities: ['biomarker_analysis', 'imaging_interpretation', 'response_prediction', 'progression_detection'],
        learningRate: 0.89,
        performance: {
          successRate: 0.86,
          responseTime: 3.1,
          patientSafety: 0.94,
          treatmentEfficacy: 0.91
        }
      }
    ];

    const mockAdjustments: TreatmentAdjustment[] = [
      {
        id: 'adj001',
        patientId: 'patient123',
        timestamp: new Date().toISOString(),
        agentId: 'agent001',
        adjustmentType: 'dose_modification',
        currentTreatment: {
          drug: 'Carboplatin',
          dose: 400,
          frequency: 'q3w',
          route: 'IV',
          duration: 4
        },
        proposedAdjustment: {
          drug: 'Carboplatin',
          dose: 340,
          frequency: 'q3w',
          route: 'IV',
          duration: 4,
          rationale: 'Platelet count dropped to 95,000/μL, requiring 15% dose reduction per protocol'
        },
        triggeringFactors: [
          {
            type: 'lab_value',
            value: 95000,
            threshold: 100000,
            severity: 'moderate'
          },
          {
            type: 'side_effect',
            value: 'thrombocytopenia',
            threshold: 'grade_2',
            severity: 'moderate'
          }
        ],
        riskAssessment: {
          safetyRisk: 0.23,
          efficacyImpact: 0.12,
          qualityOfLifeImpact: 0.08,
          overallRisk: 0.18
        },
        approvalStatus: 'approved',
        confidence: 0.91,
        evidenceStrength: 0.87,
        alternativeOptions: [
          {
            option: 'Delay cycle by 1 week',
            pros: ['Maintains full dose', 'Allows platelet recovery'],
            cons: ['Treatment delay', 'Patient inconvenience'],
            confidence: 0.78
          },
          {
            option: 'Switch to alternative agent',
            pros: ['Different toxicity profile', 'Maintains schedule'],
            cons: ['Unknown efficacy', 'Additional monitoring needed'],
            confidence: 0.65
          }
        ]
      },
      {
        id: 'adj002',
        patientId: 'patient123',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        agentId: 'agent002',
        adjustmentType: 'emergency_stop',
        currentTreatment: {
          drug: 'Pembrolizumab',
          dose: 200,
          frequency: 'q3w',
          route: 'IV',
          duration: 1
        },
        proposedAdjustment: {
          drug: 'None',
          dose: 0,
          frequency: 'hold',
          route: 'N/A',
          duration: 0,
          rationale: 'Severe immune-related pneumonitis requiring immediate treatment discontinuation'
        },
        triggeringFactors: [
          {
            type: 'imaging',
            value: 'ground_glass_opacities',
            threshold: 'grade_3_pneumonitis',
            severity: 'high'
          },
          {
            type: 'patient_reported',
            value: 'severe_dyspnea',
            threshold: 'grade_3',
            severity: 'high'
          }
        ],
        riskAssessment: {
          safetyRisk: 0.89,
          efficacyImpact: 0.67,
          qualityOfLifeImpact: 0.45,
          overallRisk: 0.78
        },
        approvalStatus: 'implemented',
        confidence: 0.96,
        evidenceStrength: 0.94,
        alternativeOptions: [
          {
            option: 'Reduce dose by 50%',
            pros: ['Maintains some treatment', 'Lower toxicity risk'],
            cons: ['Still significant safety risk', 'Uncertain efficacy'],
            confidence: 0.23
          }
        ]
      }
    ];

    const mockDecisions: AutonomousDecision[] = [
      {
        id: 'dec001',
        timestamp: new Date().toISOString(),
        agentId: 'agent001',
        decisionType: 'treatment_adjustment',
        context: {
          patientCondition: 'Stable disease with manageable toxicity',
          currentTreatment: 'Carboplatin + Paclitaxel',
          recentChanges: ['Reduced carboplatin dose', 'Added anti-emetic'],
          riskFactors: ['Age > 65', 'Previous cardiac history', 'Baseline neuropathy']
        },
        decisionLogic: {
          algorithm: 'Reinforcement Learning with Safety Constraints',
          parameters: {
            learningRate: 0.01,
            explorationRate: 0.1,
            safetyThreshold: 0.95,
            efficacyWeight: 0.6,
            safetyWeight: 0.4
          },
          confidenceLevel: 0.89,
          alternativesConsidered: 7
        },
        outcome: {
          decision: 'Continue current regimen with enhanced monitoring',
          implementationPlan: [
            'Maintain current doses',
            'Increase CBC monitoring to weekly',
            'Add cardiac function assessment',
            'Schedule patient check-in at day 10'
          ],
          expectedBenefit: 'Maintain treatment efficacy while minimizing toxicity risk',
          monitoringPlan: [
            'Daily symptom tracking via app',
            'Weekly lab draws',
            'Bi-weekly physician assessment',
            'Continuous vital sign monitoring'
          ]
        },
        humanOversight: {
          required: false,
          notified: true,
          approvalNeeded: false,
          reviewerAssigned: 'Dr. Sarah Chen'
        },
        realTimeData: {
          vitalSigns: {
            heartRate: 72,
            bloodPressure: 125,
            temperature: 98.6,
            oxygenSaturation: 98
          },
          labValues: {
            hemoglobin: 11.2,
            platelets: 145000,
            neutrophils: 3200,
            creatinine: 0.9
          },
          symptoms: ['mild_fatigue', 'occasional_nausea'],
          patientFeedback: 'Feeling better than last week, manageable side effects'
        }
      }
    ];

    const mockLearning: LearningMetrics[] = [
      {
        id: 'learn001',
        agentId: 'agent001',
        timeframe: 'Last 30 days',
        learningProgress: {
          modelsUpdated: 47,
          accuracyImprovement: 0.08,
          newPatternsLearned: 23,
          errorRate: 0.09
        },
        adaptationMetrics: {
          contextualAdaptation: 0.85,
          personalizedLearning: 0.91,
          cross_patientLearning: 0.78,
          temporalAdaptation: 0.82
        },
        performanceEvolution: [
          {
            date: '2024-10-01',
            accuracy: 0.83,
            confidence: 0.79,
            decisionsPerDay: 18,
            humanOverrideRate: 0.23
          },
          {
            date: '2024-10-08',
            accuracy: 0.87,
            confidence: 0.84,
            decisionsPerDay: 21,
            humanOverrideRate: 0.19
          },
          {
            date: '2024-10-15',
            accuracy: 0.91,
            confidence: 0.89,
            decisionsPerDay: 23,
            humanOverrideRate: 0.14
          }
        ],
        feedbackIntegration: {
          physicianFeedback: 0.94,
          patientOutcomes: 0.87,
          realWorldEvidence: 0.92,
          continuousMonitoring: 0.96
        }
      }
    ];

    setAutonomousAgents(mockAgents);
    setTreatmentAdjustments(mockAdjustments);
    setAutonomousDecisions(mockDecisions);
    setLearningMetrics(mockLearning);
  };

  const updateSystemMetrics = () => {
    setAutonomousAgents(prev => prev.map(agent => ({
      ...agent,
      confidence: Math.min(0.99, agent.confidence + (Math.random() - 0.5) * 0.02),
      accuracy: Math.min(0.99, agent.accuracy + (Math.random() - 0.5) * 0.02),
      decisionsToday: agent.decisionsToday + (Math.random() > 0.7 ? 1 : 0)
    })));
  };

  const generateRealTimeDecision = () => {
    if (Math.random() > 0.6) {
      const newDecision: AutonomousDecision = {
        id: `dec_${Date.now()}`,
        timestamp: new Date().toISOString(),
        agentId: autonomousAgents[Math.floor(Math.random() * autonomousAgents.length)]?.id || 'agent001',
        decisionType: ['treatment_adjustment', 'monitoring_frequency', 'alert_generation'][Math.floor(Math.random() * 3)] as any,
        context: {
          patientCondition: 'Real-time assessment',
          currentTreatment: 'Active monitoring',
          recentChanges: ['System adjustment'],
          riskFactors: ['Automated detection']
        },
        decisionLogic: {
          algorithm: 'Real-time ML',
          parameters: {},
          confidenceLevel: Math.random() * 0.3 + 0.7,
          alternativesConsidered: Math.floor(Math.random() * 5) + 2
        },
        outcome: {
          decision: 'Automated adjustment recommended',
          implementationPlan: ['Monitor closely'],
          expectedBenefit: 'Optimized treatment',
          monitoringPlan: ['Continuous tracking']
        },
        humanOversight: {
          required: Math.random() > 0.8,
          notified: true,
          approvalNeeded: Math.random() > 0.7,
          reviewerAssigned: 'Dr. Sarah Chen'
        },
        realTimeData: {
          vitalSigns: {
            heartRate: 65 + Math.random() * 20,
            bloodPressure: 120 + Math.random() * 20,
            temperature: 98 + Math.random() * 2,
            oxygenSaturation: 95 + Math.random() * 5
          },
          labValues: {},
          symptoms: [],
          patientFeedback: 'Real-time monitoring'
        }
      };

      setAutonomousDecisions(prev => [newDecision, ...prev.slice(0, 9)]);
    }
  };

  const renderSystemVisualization = () => {
    const canvas = systemCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 400;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() * 0.001;

    // Draw central AI brain
    const brainRadius = 60;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, brainRadius);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(0.7, '#1d4ed8');
    gradient.addColorStop(1, '#1e3a8a');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, brainRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw pulsing effect if system is active
    if (isSystemActive) {
      const pulseRadius = brainRadius + Math.sin(time * 3) * 10;
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw AI agents around the center
    const agentPositions = [
      { x: centerX - 150, y: centerY - 100, agent: autonomousAgents[0] },
      { x: centerX + 150, y: centerY - 100, agent: autonomousAgents[1] },
      { x: centerX - 150, y: centerY + 100, agent: autonomousAgents[2] },
      { x: centerX + 150, y: centerY + 100, agent: autonomousAgents[3] }
    ];

    agentPositions.forEach((pos, index) => {
      if (!pos.agent) return;

      const agentRadius = 25 + pos.agent.confidence * 10;
      const statusColor = 
        pos.agent.status === 'active' ? '#10b981' :
        pos.agent.status === 'learning' ? '#f59e0b' :
        pos.agent.status === 'adjusting' ? '#8b5cf6' :
        pos.agent.status === 'error' ? '#ef4444' : '#6b7280';

      // Agent circle
      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, agentRadius, 0, Math.PI * 2);
      ctx.fill();

      // Connection to center
      ctx.strokeStyle = statusColor + '88';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      // Agent label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pos.agent.name, pos.x, pos.y + agentRadius + 15);
      ctx.fillText(`${(pos.agent.accuracy * 100).toFixed(0)}%`, pos.x, pos.y + agentRadius + 28);

      // Activity indicator
      if (pos.agent.status === 'active' && isSystemActive) {
        const activityRadius = 5 + Math.sin(time * 4 + index) * 2;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pos.x + agentRadius - 8, pos.y - agentRadius + 8, activityRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw data flow lines
    if (isSystemActive) {
      for (let i = 0; i < 20; i++) {
        const angle = (time + i * 0.3) % (Math.PI * 2);
        const radius = 80 + Math.sin(time + i) * 20;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        ctx.fillStyle = `hsl(${(time * 50 + i * 30) % 360}, 70%, 60%)`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // System status
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Autonomous Treatment System', centerX, 30);
    ctx.font = '12px sans-serif';
    ctx.fillText(`Status: ${isSystemActive ? 'ACTIVE' : 'INACTIVE'}`, centerX, 50);
    ctx.fillText(`Autonomy: ${autonomyLevel.toUpperCase()}`, centerX, 70);
  };

  const renderDecisionVisualization = () => {
    const canvas = decisionCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 500;
    canvas.height = 300;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw decision timeline
    const timelineY = 150;
    const timelineWidth = 400;
    const timelineX = 50;

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(timelineX, timelineY);
    ctx.lineTo(timelineX + timelineWidth, timelineY);
    ctx.stroke();

    // Draw recent decisions
    const recentDecisions = autonomousDecisions.slice(0, 5);
    recentDecisions.forEach((decision, index) => {
      const x = timelineX + (index / 4) * timelineWidth;
      const decisionColor = 
        decision.decisionType === 'treatment_adjustment' ? '#3b82f6' :
        decision.decisionType === 'safety_intervention' ? '#ef4444' :
        decision.decisionType === 'monitoring_frequency' ? '#10b981' : '#f59e0b';

      // Decision point
      ctx.fillStyle = decisionColor;
      ctx.beginPath();
      ctx.arc(x, timelineY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Confidence indicator
      const confidenceHeight = decision.decisionLogic.confidenceLevel * 50;
      ctx.fillStyle = decisionColor + '66';
      ctx.fillRect(x - 5, timelineY - confidenceHeight - 10, 10, confidenceHeight);

      // Decision label
      ctx.fillStyle = '#1f2937';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(decision.decisionType.split('_')[0], x, timelineY + 25);
      ctx.fillText(`${(decision.decisionLogic.confidenceLevel * 100).toFixed(0)}%`, x, timelineY + 38);
    });

    // Chart title
    ctx.fillStyle = '#1f2937';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Recent Autonomous Decisions', canvas.width / 2, 30);

    // Legend
    const legendItems = [
      { color: '#3b82f6', label: 'Treatment' },
      { color: '#ef4444', label: 'Safety' },
      { color: '#10b981', label: 'Monitoring' },
      { color: '#f59e0b', label: 'Alert' }
    ];

    legendItems.forEach((item, index) => {
      const x = 50 + index * 80;
      const y = 250;
      
      ctx.fillStyle = item.color;
      ctx.fillRect(x, y, 15, 10);
      ctx.fillStyle = '#1f2937';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, x + 20, y + 8);
    });
  };

  const toggleSystem = () => {
    setIsSystemActive(prev => !prev);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Agents</h3>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {autonomousAgents.filter(a => a.status === 'active').length}
            </span>
          </div>
          <div className={`flex items-center space-x-2 ${
            isSystemActive ? 'text-green-600' : 'text-gray-500'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isSystemActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
            <span className="text-sm font-medium">
              {isSystemActive ? 'System Active' : 'System Inactive'}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Accuracy</h3>
                <p className="text-sm text-gray-600">System average</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {autonomousAgents.length > 0 ? (autonomousAgents.reduce((sum, agent) => sum + agent.accuracy, 0) / autonomousAgents.length * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Decisions</h3>
                <p className="text-sm text-gray-600">Today</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {autonomousAgents.reduce((sum, agent) => sum + agent.decisionsToday, 0)}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Safety Score</h3>
                <p className="text-sm text-gray-600">Patient safety</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-orange-600">
              {autonomousAgents.length > 0 ? (autonomousAgents.reduce((sum, agent) => sum + agent.performance.patientSafety, 0) / autonomousAgents.length * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-blue-500" />
              <span>Autonomous System Architecture</span>
            </h3>
            <div className="flex items-center space-x-2">
              <select 
                value={autonomyLevel} 
                onChange={(e) => setAutonomyLevel(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="supervised">Supervised</option>
                <option value="semi_autonomous">Semi-Autonomous</option>
                <option value="fully_autonomous">Fully Autonomous</option>
              </select>
              <button
                onClick={toggleSystem}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isSystemActive 
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isSystemActive ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span>Stop System</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Start System</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            <canvas
              ref={systemCanvasRef}
              className="border border-gray-300 rounded-lg bg-slate-900"
            />
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Real-time visualization of AI agents working together for autonomous treatment optimization
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Activity className="h-5 w-5 text-purple-500" />
            <span>Decision Timeline</span>
          </h3>
          <div className="flex justify-center">
            <canvas
              ref={decisionCanvasRef}
              className="border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Chronological view of autonomous decisions with confidence levels
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Bot className="h-5 w-5 text-green-500" />
          <span>AI Agent Status Dashboard</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {autonomousAgents.map((agent) => (
            <div 
              key={agent.id} 
              className={`rounded-lg p-4 border ${
                agent.status === 'active' ? 'bg-green-50 border-green-200' :
                agent.status === 'learning' ? 'bg-blue-50 border-blue-200' :
                agent.status === 'adjusting' ? 'bg-purple-50 border-purple-200' :
                agent.status === 'error' ? 'bg-red-50 border-red-200' :
                'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    agent.type === 'dosing' ? 'bg-blue-500' :
                    agent.type === 'safety' ? 'bg-red-500' :
                    agent.type === 'scheduling' ? 'bg-green-500' :
                    agent.type === 'monitoring' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`}>
                    {agent.type === 'dosing' && <Target className="h-4 w-4 text-white" />}
                    {agent.type === 'safety' && <Shield className="h-4 w-4 text-white" />}
                    {agent.type === 'scheduling' && <Calendar className="h-4 w-4 text-white" />}
                    {agent.type === 'monitoring' && <Activity className="h-4 w-4 text-white" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{agent.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{agent.type} agent</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  agent.status === 'active' ? 'bg-green-100 text-green-800' :
                  agent.status === 'learning' ? 'bg-blue-100 text-blue-800' :
                  agent.status === 'adjusting' ? 'bg-purple-100 text-purple-800' :
                  agent.status === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {agent.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {(agent.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-gray-600">Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {(agent.accuracy * 100).toFixed(0)}%
                  </div>
                  <div className="text-gray-600">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {agent.decisionsToday}
                  </div>
                  <div className="text-gray-600">Decisions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {agent.performance.responseTime.toFixed(1)}s
                  </div>
                  <div className="text-gray-600">Response</div>
                </div>
              </div>

              <div className="text-xs text-gray-600 mb-2">
                <strong>Last Action:</strong> {agent.lastAction}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(agent.lastActionTime).toLocaleString()}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  agent.autonomyLevel === 'fully_autonomous' ? 'bg-green-100 text-green-800' :
                  agent.autonomyLevel === 'semi_autonomous' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {agent.autonomyLevel.replace('_', ' ').toUpperCase()}
                </span>
                <button 
                  onClick={() => setSelectedAgent(agent.id === selectedAgent ? null : agent.id)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {selectedAgent === agent.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              {selectedAgent === agent.id && (
                <div className="mt-4 p-3 bg-white rounded-lg border">
                  <h5 className="font-medium text-gray-900 mb-2">Capabilities</h5>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {agent.capabilities.map((capability) => (
                      <span key={capability} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {capability.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Learning Rate:</span>
                      <span className="font-medium">{(agent.learningRate * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="font-medium">{(agent.performance.successRate * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Safety Score:</span>
                      <span className="font-medium">{(agent.performance.patientSafety * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Efficacy:</span>
                      <span className="font-medium">{(agent.performance.treatmentEfficacy * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAdjustments = () => (
    <div className="space-y-6">
      {treatmentAdjustments.map((adjustment) => (
        <div key={adjustment.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-500" />
              <span className="capitalize">{adjustment.adjustmentType.replace('_', ' ')}</span>
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Agent: {autonomousAgents.find(a => a.id === adjustment.agentId)?.name || 'Unknown'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                adjustment.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                adjustment.approvalStatus === 'implemented' ? 'bg-blue-100 text-blue-800' :
                adjustment.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                adjustment.approvalStatus === 'physician_review_required' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {adjustment.approvalStatus.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Current Treatment</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Drug:</span>
                  <span className="font-medium">{adjustment.currentTreatment.drug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dose:</span>
                  <span className="font-medium">{adjustment.currentTreatment.dose} mg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frequency:</span>
                  <span className="font-medium">{adjustment.currentTreatment.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Route:</span>
                  <span className="font-medium">{adjustment.currentTreatment.route}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Proposed Adjustment</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Drug:</span>
                  <span className="font-medium">{adjustment.proposedAdjustment.drug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dose:</span>
                  <span className="font-medium">{adjustment.proposedAdjustment.dose} mg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frequency:</span>
                  <span className="font-medium">{adjustment.proposedAdjustment.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Route:</span>
                  <span className="font-medium">{adjustment.proposedAdjustment.route}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Rationale</h4>
            <p className="text-sm text-gray-700">{adjustment.proposedAdjustment.rationale}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Triggering Factors</h4>
              <div className="space-y-2">
                {adjustment.triggeringFactors.map((factor, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border ${
                    factor.severity === 'critical' ? 'bg-red-50 border-red-200' :
                    factor.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                    factor.severity === 'moderate' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">{factor.type.replace('_', ' ')}:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        factor.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        factor.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        factor.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {factor.severity}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Value: {typeof factor.value === 'string' ? factor.value : factor.value.toLocaleString()}
                      {factor.threshold && ` (Threshold: ${typeof factor.threshold === 'string' ? factor.threshold : factor.threshold.toLocaleString()})`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Risk Assessment</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Safety Risk:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${adjustment.riskAssessment.safetyRisk * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{(adjustment.riskAssessment.safetyRisk * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Efficacy Impact:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${adjustment.riskAssessment.efficacyImpact * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{(adjustment.riskAssessment.efficacyImpact * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">QoL Impact:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${adjustment.riskAssessment.qualityOfLifeImpact * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{(adjustment.riskAssessment.qualityOfLifeImpact * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium text-gray-900">Overall Risk:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gray-700 h-3 rounded-full"
                        style={{ width: `${adjustment.riskAssessment.overallRisk * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">{(adjustment.riskAssessment.overallRisk * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Confidence: {(adjustment.confidence * 100).toFixed(0)}%
              </span>
              <span className="text-gray-600">
                Evidence: {(adjustment.evidenceStrength * 100).toFixed(0)}%
              </span>
            </div>
            <span className="text-gray-500">
              {new Date(adjustment.timestamp).toLocaleString()}
            </span>
          </div>

          {adjustment.alternativeOptions.length > 0 && (
            <div className="mt-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Alternative Options Considered</h4>
              <div className="space-y-2">
                {adjustment.alternativeOptions.map((option, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{option.option}</span>
                      <span className="text-sm text-blue-600 font-medium">
                        {(option.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-600 font-medium">Pros:</span>
                        <ul className="list-disc list-inside text-gray-600 ml-2">
                          {option.pros.map((pro, proIdx) => (
                            <li key={proIdx}>{pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-red-600 font-medium">Cons:</span>
                        <ul className="list-disc list-inside text-gray-600 ml-2">
                          {option.cons.map((con, conIdx) => (
                            <li key={conIdx}>{con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'System Overview', icon: Eye },
    { id: 'adjustments', label: 'Treatment Adjustments', icon: Target },
    { id: 'decisions', label: 'Decision Log', icon: Activity },
    { id: 'learning', label: 'Learning Metrics', icon: Brain }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Autonomous Treatment Adjustment
            </h1>
            <p className="text-gray-600">
              AI-powered real-time treatment optimization with safety oversight
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
                  ? 'border-blue-500 text-blue-600'
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
        {activeTab === 'adjustments' && renderAdjustments()}
        {activeTab === 'decisions' && renderOverview()} {/* Reuse overview for decisions tab */}
        {activeTab === 'learning' && renderOverview()} {/* Reuse overview for learning tab */}
      </div>
    </div>
  );
};

export default AutonomousTreatmentAdjustment;
