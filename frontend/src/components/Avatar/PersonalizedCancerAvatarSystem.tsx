import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Users, 
  Brain, 
  DNA,
  Heart,
  Lungs,
  Activity,
  Zap,
  Target,
  Eye,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Save,
  Share2,
  Download,
  Upload,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Gauge,
  Layers,
  Grid,
  Move3D,
  Rotate3D,
  Maximize,
  Minimize,
  Filter,
  Search,
  Star,
  Bookmark,
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
  Shield,
  Lock,
  Unlock,
  Microscope,
  FlaskConical,
  Atom,
  Molecule,
  Beaker,
  Cpu,
  Network,
  Wifi,
  Signal
} from 'lucide-react';

interface CancerAvatar {
  id: string;
  patientId: string;
  name: string;
  createdAt: string;
  lastUpdated: string;
  version: number;
  status: 'initializing' | 'training' | 'ready' | 'updating' | 'error';
  accuracy: number;
  confidence: number;
  personalizedFeatures: {
    genetics: {
      mutationProfile: { [gene: string]: number };
      heritabilityScore: number;
      pharmacogenomics: { [drug: string]: 'poor' | 'intermediate' | 'normal' | 'ultrarapid' };
    };
    physiology: {
      organFunction: { [organ: string]: number };
      metabolicRate: number;
      immuneProfile: { [marker: string]: number };
      biorhythms: { [cycle: string]: number };
    };
    behavior: {
      adherenceScore: number;
      lifestyleFactors: { [factor: string]: number };
      stressResponse: number;
      copingMechanisms: string[];
    };
    environment: {
      exposureHistory: { [toxin: string]: number };
      socialSupport: number;
      accessToCare: number;
      socioeconomicFactors: { [factor: string]: number };
    };
  };
  tumorCharacteristics: {
    primarySite: string;
    histology: string;
    grade: string;
    stage: string;
    size: number;
    growthRate: number;
    aggressiveness: number;
    metastaticPotential: number;
    drugResistance: { [drug: string]: number };
    immuneEvasion: number;
  };
  treatmentSimulations: Array<{
    id: string;
    name: string;
    type: 'chemotherapy' | 'radiation' | 'surgery' | 'immunotherapy' | 'targeted' | 'combination';
    parameters: { [key: string]: any };
    predictedOutcomes: {
      efficacy: number;
      toxicity: number;
      survivalBenefit: number;
      qualityOfLife: number;
      timeToProgression: number;
    };
    confidence: number;
    runCount: number;
    lastRun: string;
  }>;
  digitalTwin: {
    physiologicalModel: {
      cardiovascular: { [parameter: string]: number };
      respiratory: { [parameter: string]: number };
      hepatic: { [parameter: string]: number };
      renal: { [parameter: string]: number };
      neurological: { [parameter: string]: number };
    };
    pharmacokinetics: {
      absorption: number;
      distribution: number;
      metabolism: number;
      excretion: number;
      halfLife: { [drug: string]: number };
    };
    diseaseProgression: {
      currentState: string;
      trajectoryPrediction: Array<{
        timepoint: string;
        tumorBurden: number;
        symptoms: string[];
        functionality: number;
      }>;
      riskFactors: string[];
    };
  };
}

interface AvatarPrediction {
  id: string;
  avatarId: string;
  type: 'treatment_response' | 'disease_progression' | 'side_effects' | 'survival' | 'quality_of_life';
  timeframe: string;
  prediction: any;
  confidence: number;
  methodology: string;
  validationMetrics: {
    accuracy: number;
    precision: number;
    recall: number;
    auc: number;
  };
  clinicalRelevance: number;
  actionableInsights: string[];
  generatedAt: string;
}

interface AvatarComparison {
  id: string;
  avatarIds: string[];
  comparisonType: 'treatment_options' | 'outcome_prediction' | 'biomarker_analysis' | 'risk_stratification';
  results: {
    similarities: { [aspect: string]: number };
    differences: { [aspect: string]: number };
    recommendations: string[];
    insights: string[];
  };
  visualizations: Array<{
    type: 'radar_chart' | 'heatmap' | 'scatter_plot' | 'network_graph';
    data: any;
    title: string;
  }>;
}

interface AvatarLearning {
  id: string;
  avatarId: string;
  learningType: 'outcome_feedback' | 'new_biomarker' | 'treatment_response' | 'real_world_data';
  dataSource: string;
  learningMetrics: {
    modelImprovement: number;
    predictionAccuracy: number;
    convergenceRate: number;
    dataQuality: number;
  };
  updatesSinceLastTraining: number;
  nextTrainingScheduled: string;
  continuousLearning: boolean;
}

const PersonalizedCancerAvatarSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [cancerAvatars, setCancerAvatars] = useState<CancerAvatar[]>([]);
  const [avatarPredictions, setAvatarPredictions] = useState<AvatarPrediction[]>([]);
  const [avatarComparisons, setAvatarComparisons] = useState<AvatarComparison[]>([]);
  const [avatarLearning, setAvatarLearning] = useState<AvatarLearning[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [viewMode, setViewMode] = useState<'3d' | 'data' | 'comparison'>('3d');
  const avatarCanvasRef = useRef<HTMLCanvasElement>(null);
  const simulationCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateMockAvatarData();
    if (avatarCanvasRef.current) {
      renderAvatarVisualization();
    }
    if (simulationCanvasRef.current) {
      renderSimulationVisualization();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSimulating) {
      interval = setInterval(() => {
        updateSimulationProgress();
        if (simulationCanvasRef.current) {
          renderSimulationVisualization();
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating]);

  const generateMockAvatarData = () => {
    const mockAvatars: CancerAvatar[] = [
      {
        id: 'avatar001',
        patientId: 'patient123',
        name: 'Primary Cancer Avatar',
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        lastUpdated: new Date().toISOString(),
        version: 2.3,
        status: 'ready',
        accuracy: 0.94,
        confidence: 0.87,
        personalizedFeatures: {
          genetics: {
            mutationProfile: {
              'TP53': 0.85,
              'BRCA1': 0.72,
              'KRAS': 0.45,
              'EGFR': 0.33,
              'PIK3CA': 0.67
            },
            heritabilityScore: 0.68,
            pharmacogenomics: {
              'tamoxifen': 'poor',
              'carboplatin': 'normal',
              'bevacizumab': 'normal',
              'pembrolizumab': 'ultrarapid'
            }
          },
          physiology: {
            organFunction: {
              'liver': 0.92,
              'kidney': 0.88,
              'heart': 0.95,
              'lung': 0.78,
              'brain': 0.96
            },
            metabolicRate: 1.15,
            immuneProfile: {
              'CD4': 850,
              'CD8': 620,
              'NK_cells': 280,
              'B_cells': 190,
              'neutrophils': 4200
            },
            biorhythms: {
              'circadian': 0.82,
              'ultradian': 0.76,
              'sleep_wake': 0.89
            }
          },
          behavior: {
            adherenceScore: 0.91,
            lifestyleFactors: {
              'exercise': 0.75,
              'diet': 0.83,
              'smoking': 0.0,
              'alcohol': 0.2,
              'stress': 0.65
            },
            stressResponse: 0.58,
            copingMechanisms: ['social_support', 'meditation', 'exercise', 'therapy']
          },
          environment: {
            exposureHistory: {
              'air_pollution': 0.35,
              'chemical_exposure': 0.12,
              'radiation': 0.08,
              'pesticides': 0.15
            },
            socialSupport: 0.89,
            accessToCare: 0.92,
            socioeconomicFactors: {
              'income': 0.78,
              'education': 0.85,
              'insurance': 0.95
            }
          }
        },
        tumorCharacteristics: {
          primarySite: 'Breast',
          histology: 'Invasive Ductal Carcinoma',
          grade: '2',
          stage: 'IIB',
          size: 2.3,
          growthRate: 0.45,
          aggressiveness: 0.62,
          metastaticPotential: 0.34,
          drugResistance: {
            'doxorubicin': 0.23,
            'paclitaxel': 0.18,
            'carboplatin': 0.31,
            'trastuzumab': 0.15
          },
          immuneEvasion: 0.42
        },
        treatmentSimulations: [
          {
            id: 'sim001',
            name: 'AC-T Chemotherapy Protocol',
            type: 'chemotherapy',
            parameters: {
              cycles: 6,
              dose_intensity: 0.85,
              schedule: 'q3w'
            },
            predictedOutcomes: {
              efficacy: 0.78,
              toxicity: 0.42,
              survivalBenefit: 18.5,
              qualityOfLife: 0.71,
              timeToProgression: 24.8
            },
            confidence: 0.89,
            runCount: 15,
            lastRun: new Date().toISOString()
          },
          {
            id: 'sim002',
            name: 'Immunotherapy + Targeted Therapy',
            type: 'combination',
            parameters: {
              immunotherapy: 'pembrolizumab',
              targeted_therapy: 'trastuzumab',
              duration: 12
            },
            predictedOutcomes: {
              efficacy: 0.82,
              toxicity: 0.28,
              survivalBenefit: 22.3,
              qualityOfLife: 0.84,
              timeToProgression: 28.7
            },
            confidence: 0.91,
            runCount: 8,
            lastRun: new Date(Date.now() - 3600000).toISOString()
          }
        ],
        digitalTwin: {
          physiologicalModel: {
            cardiovascular: {
              'heart_rate': 72,
              'blood_pressure_systolic': 125,
              'blood_pressure_diastolic': 80,
              'ejection_fraction': 0.62
            },
            respiratory: {
              'respiratory_rate': 16,
              'oxygen_saturation': 0.98,
              'lung_capacity': 3200
            },
            hepatic: {
              'alt': 28,
              'ast': 32,
              'bilirubin': 0.8,
              'albumin': 4.2
            },
            renal: {
              'creatinine': 0.9,
              'gfr': 85,
              'bun': 15
            },
            neurological: {
              'cognitive_function': 0.95,
              'motor_function': 0.98,
              'sensory_function': 0.96
            }
          },
          pharmacokinetics: {
            absorption: 0.88,
            distribution: 0.72,
            metabolism: 0.91,
            excretion: 0.85,
            halfLife: {
              'doxorubicin': 24.5,
              'paclitaxel': 15.8,
              'carboplatin': 3.2,
              'pembrolizumab': 504
            }
          },
          diseaseProgression: {
            currentState: 'Stable Disease',
            trajectoryPrediction: [
              {
                timepoint: '3 months',
                tumorBurden: 85,
                symptoms: ['fatigue', 'mild nausea'],
                functionality: 0.89
              },
              {
                timepoint: '6 months',
                tumorBurden: 72,
                symptoms: ['fatigue'],
                functionality: 0.92
              },
              {
                timepoint: '12 months',
                tumorBurden: 58,
                symptoms: [],
                functionality: 0.96
              }
            ],
            riskFactors: ['family_history', 'genetic_mutations', 'age']
          }
        }
      }
    ];

    const mockPredictions: AvatarPrediction[] = [
      {
        id: 'pred001',
        avatarId: 'avatar001',
        type: 'treatment_response',
        timeframe: '6 months',
        prediction: {
          response_rate: 0.82,
          complete_response: 0.15,
          partial_response: 0.67,
          stable_disease: 0.15,
          progressive_disease: 0.03
        },
        confidence: 0.91,
        methodology: 'Ensemble Machine Learning with Digital Twin Simulation',
        validationMetrics: {
          accuracy: 0.89,
          precision: 0.87,
          recall: 0.84,
          auc: 0.92
        },
        clinicalRelevance: 0.94,
        actionableInsights: [
          'High probability of response to combination therapy',
          'Consider dose escalation if well tolerated',
          'Monitor for cardiac toxicity due to patient profile'
        ],
        generatedAt: new Date().toISOString()
      },
      {
        id: 'pred002',
        avatarId: 'avatar001',
        type: 'side_effects',
        timeframe: 'Throughout treatment',
        prediction: {
          neuropathy: 0.35,
          cardiotoxicity: 0.12,
          neutropenia: 0.58,
          nausea: 0.72,
          fatigue: 0.89,
          hair_loss: 0.95
        },
        confidence: 0.86,
        methodology: 'Pharmacokinetic-Pharmacodynamic Modeling',
        validationMetrics: {
          accuracy: 0.83,
          precision: 0.81,
          recall: 0.79,
          auc: 0.88
        },
        clinicalRelevance: 0.87,
        actionableInsights: [
          'Premedicate for nausea and vomiting',
          'Monitor CBC regularly for neutropenia',
          'Consider prophylactic growth factor support'
        ],
        generatedAt: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    const mockComparisons: AvatarComparison[] = [
      {
        id: 'comp001',
        avatarIds: ['avatar001'],
        comparisonType: 'treatment_options',
        results: {
          similarities: {
            'genetic_profile': 0.72,
            'tumor_characteristics': 0.68,
            'immune_profile': 0.81
          },
          differences: {
            'age': 0.23,
            'comorbidities': 0.45,
            'prior_treatments': 0.67
          },
          recommendations: [
            'Consider immunotherapy based on similar patient outcomes',
            'Adjust dosing based on pharmacogenomic profile',
            'Monitor for unique toxicity patterns'
          ],
          insights: [
            'Patient shows high similarity to responders in clinical trials',
            'Genetic markers suggest favorable immunotherapy response',
            'Metabolic profile indicates standard dosing appropriate'
          ]
        },
        visualizations: [
          {
            type: 'radar_chart',
            data: {},
            title: 'Multi-dimensional Patient Similarity'
          },
          {
            type: 'heatmap',
            data: {},
            title: 'Treatment Response Prediction Matrix'
          }
        ]
      }
    ];

    const mockLearning: AvatarLearning[] = [
      {
        id: 'learn001',
        avatarId: 'avatar001',
        learningType: 'treatment_response',
        dataSource: 'Real-world treatment outcomes',
        learningMetrics: {
          modelImprovement: 0.08,
          predictionAccuracy: 0.94,
          convergenceRate: 0.89,
          dataQuality: 0.92
        },
        updatesSinceLastTraining: 23,
        nextTrainingScheduled: new Date(Date.now() + 86400000).toISOString(),
        continuousLearning: true
      }
    ];

    setCancerAvatars(mockAvatars);
    setAvatarPredictions(mockPredictions);
    setAvatarComparisons(mockComparisons);
    setAvatarLearning(mockLearning);
  };

  const updateSimulationProgress = () => {
    if (cancerAvatars.length > 0) {
      setCancerAvatars(prev => prev.map(avatar => ({
        ...avatar,
        accuracy: Math.min(0.99, avatar.accuracy + (Math.random() - 0.5) * 0.02),
        confidence: Math.min(0.99, avatar.confidence + (Math.random() - 0.5) * 0.02)
      })));
    }
  };

  const renderAvatarVisualization = () => {
    const canvas = avatarCanvasRef.current;
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

    // Draw human avatar outline
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    
    // Head
    ctx.beginPath();
    ctx.arc(centerX, centerY - 100, 40, 0, Math.PI * 2);
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.rect(centerX - 30, centerY - 60, 60, 120);
    ctx.stroke();

    // Arms
    ctx.beginPath();
    ctx.moveTo(centerX - 30, centerY - 40);
    ctx.lineTo(centerX - 70, centerY - 20);
    ctx.lineTo(centerX - 80, centerY + 20);
    ctx.moveTo(centerX + 30, centerY - 40);
    ctx.lineTo(centerX + 70, centerY - 20);
    ctx.lineTo(centerX + 80, centerY + 20);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY + 60);
    ctx.lineTo(centerX - 20, centerY + 120);
    ctx.moveTo(centerX + 10, centerY + 60);
    ctx.lineTo(centerX + 20, centerY + 120);
    ctx.stroke();

    if (cancerAvatars.length > 0) {
      const avatar = cancerAvatars[0];

      // Draw organ systems with health indicators
      const organs = [
        { name: 'Heart', x: centerX - 10, y: centerY - 20, health: avatar.personalizedFeatures.physiology.organFunction.heart },
        { name: 'Lungs', x: centerX, y: centerY - 30, health: avatar.personalizedFeatures.physiology.organFunction.lung },
        { name: 'Liver', x: centerX + 15, y: centerY - 10, health: avatar.personalizedFeatures.physiology.organFunction.liver },
        { name: 'Brain', x: centerX, y: centerY - 100, health: avatar.personalizedFeatures.physiology.organFunction.brain }
      ];

      organs.forEach((organ, index) => {
        const healthColor = organ.health > 0.8 ? '#10b981' : organ.health > 0.6 ? '#f59e0b' : '#ef4444';
        const pulseSize = 8 + Math.sin(time + index) * 2 * organ.health;

        ctx.fillStyle = healthColor + '88';
        ctx.beginPath();
        ctx.arc(organ.x, organ.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        // Organ labels
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(organ.name, organ.x, organ.y + pulseSize + 15);
        ctx.fillText(`${(organ.health * 100).toFixed(0)}%`, organ.x, organ.y + pulseSize + 28);
      });

      // Draw tumor location (breast cancer)
      const tumorX = centerX - 20;
      const tumorY = centerY - 15;
      const tumorSize = 12 + Math.sin(time * 2) * 3;

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(tumorX, tumorY, tumorSize, 0, Math.PI * 2);
      ctx.fill();

      // Tumor annotation
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Primary Tumor', tumorX + 20, tumorY - 10);
      ctx.fillText(`${avatar.tumorCharacteristics.size} cm`, tumorX + 20, tumorY + 5);

      // Draw genetic mutation indicators
      const mutations = Object.entries(avatar.personalizedFeatures.genetics.mutationProfile).slice(0, 3);
      mutations.forEach((mutation, index) => {
        const x = 50 + index * 30;
        const y = 50;
        const intensity = mutation[1];

        ctx.fillStyle = `rgba(139, 92, 246, ${intensity})`;
        ctx.fillRect(x, y, 20, 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(mutation[0], x + 10, y + 13);
      });

      // Draw data streams (representing continuous learning)
      if (isSimulating) {
        for (let i = 0; i < 20; i++) {
          const angle = (time + i * 0.3) % (Math.PI * 2);
          const radius = 150 + Math.sin(time + i) * 30;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          ctx.fillStyle = `hsl(${(time * 50 + i * 30) % 360}, 70%, 60%)`;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Draw status indicators
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Personalized Cancer Avatar', 20, 30);
    if (cancerAvatars.length > 0) {
      ctx.fillText(`Accuracy: ${(cancerAvatars[0].accuracy * 100).toFixed(1)}%`, 20, 50);
      ctx.fillText(`Status: ${cancerAvatars[0].status.toUpperCase()}`, 20, 70);
    }
  };

  const renderSimulationVisualization = () => {
    const canvas = simulationCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 300;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (cancerAvatars.length > 0 && cancerAvatars[0].treatmentSimulations.length > 0) {
      const simulations = cancerAvatars[0].treatmentSimulations;
      const chartWidth = 300;
      const chartHeight = 200;
      const chartX = 50;
      const chartY = 50;

      // Draw chart background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(chartX, chartY, chartWidth, chartHeight);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(chartX, chartY, chartWidth, chartHeight);

      // Draw grid lines
      for (let i = 0; i <= 5; i++) {
        const y = chartY + (i / 5) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(chartX, y);
        ctx.lineTo(chartX + chartWidth, y);
        ctx.stroke();
      }

      // Draw simulation results as bars
      const barWidth = chartWidth / simulations.length - 20;
      simulations.forEach((sim, index) => {
        const x = chartX + index * (chartWidth / simulations.length) + 10;
        const efficacyHeight = sim.predictedOutcomes.efficacy * chartHeight;
        const toxicityHeight = sim.predictedOutcomes.toxicity * chartHeight;

        // Efficacy bar (green)
        ctx.fillStyle = '#10b981';
        ctx.fillRect(x, chartY + chartHeight - efficacyHeight, barWidth / 2, efficacyHeight);

        // Toxicity bar (red)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + barWidth / 2, chartY + chartHeight - toxicityHeight, barWidth / 2, toxicityHeight);

        // Labels
        ctx.fillStyle = '#1f2937';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(sim.type, x + barWidth / 2, chartY + chartHeight + 15);
      });

      // Chart title and legend
      ctx.fillStyle = '#1f2937';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Treatment Simulation Results', chartX + chartWidth / 2, chartY - 20);

      // Legend
      ctx.fillStyle = '#10b981';
      ctx.fillRect(chartX, chartY + chartHeight + 30, 15, 10);
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Efficacy', chartX + 20, chartY + chartHeight + 39);

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(chartX + 80, chartY + chartHeight + 30, 15, 10);
      ctx.fillStyle = '#1f2937';
      ctx.fillText('Toxicity', chartX + 100, chartY + chartHeight + 39);
    }
  };

  const toggleSimulation = () => {
    setIsSimulating(prev => !prev);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Active Avatars</h3>
                <p className="text-sm text-gray-600">Ready for use</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-600">{cancerAvatars.length}</span>
          </div>
          <div className="text-sm text-gray-600">
            Version {cancerAvatars[0]?.version.toFixed(1) || '0.0'}
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
                <p className="text-sm text-gray-600">Prediction model</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {((cancerAvatars[0]?.accuracy || 0) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(cancerAvatars[0]?.accuracy || 0) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Simulations</h3>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {cancerAvatars[0]?.treatmentSimulations.reduce((sum, sim) => sum + sim.runCount, 0) || 0}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Predictions</h3>
                <p className="text-sm text-gray-600">Generated</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-orange-600">{avatarPredictions.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-500" />
              <span>Personalized Avatar Visualization</span>
            </h3>
            <div className="flex items-center space-x-2">
              <select 
                value={viewMode} 
                onChange={(e) => setViewMode(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="3d">3D Avatar</option>
                <option value="data">Data View</option>
                <option value="comparison">Comparison</option>
              </select>
              <button
                onClick={toggleSimulation}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isSimulating 
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isSimulating ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Simulate</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            <canvas
              ref={avatarCanvasRef}
              className="border border-gray-300 rounded-lg bg-slate-900"
            />
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Interactive avatar showing personalized cancer characteristics and treatment responses
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            <span>Treatment Simulation Results</span>
          </h3>
          <div className="flex justify-center">
            <canvas
              ref={simulationCanvasRef}
              className="border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Comparing efficacy and toxicity across different treatment options
          </div>
        </div>
      </div>

      {cancerAvatars.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <DNA className="h-5 w-5 text-green-500" />
            <span>Personalized Features Summary</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Genetic Profile</h4>
              <div className="space-y-2">
                {Object.entries(cancerAvatars[0].personalizedFeatures.genetics.mutationProfile).slice(0, 3).map(([gene, score]) => (
                  <div key={gene} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{gene}:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${score * 100}%` }}
                        />
                      </div>
                      <span className="text-xs">{(score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Organ Function</h4>
              <div className="space-y-2">
                {Object.entries(cancerAvatars[0].personalizedFeatures.physiology.organFunction).slice(0, 3).map(([organ, score]) => (
                  <div key={organ} className="flex justify-between items-center text-sm">
                    <span className="font-medium capitalize">{organ}:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${score * 100}%` }}
                        />
                      </div>
                      <span className="text-xs">{(score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Behavior Factors</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Adherence:</span>
                  <span className="text-purple-600 font-bold">
                    {(cancerAvatars[0].personalizedFeatures.behavior.adherenceScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Stress Response:</span>
                  <span className="text-purple-600 font-bold">
                    {(cancerAvatars[0].personalizedFeatures.behavior.stressResponse * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Coping: {cancerAvatars[0].personalizedFeatures.behavior.copingMechanisms.slice(0, 2).join(', ')}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Tumor Profile</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Site:</span>
                  <span className="text-orange-600">{cancerAvatars[0].tumorCharacteristics.primarySite}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Stage:</span>
                  <span className="text-orange-600">{cancerAvatars[0].tumorCharacteristics.stage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Size:</span>
                  <span className="text-orange-600">{cancerAvatars[0].tumorCharacteristics.size} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Aggressiveness:</span>
                  <span className="text-orange-600">
                    {(cancerAvatars[0].tumorCharacteristics.aggressiveness * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPredictions = () => (
    <div className="space-y-6">
      {avatarPredictions.map((prediction) => (
        <div key={prediction.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-500" />
              <span className="capitalize">{prediction.type.replace('_', ' ')} Prediction</span>
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Timeframe: {prediction.timeframe}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                prediction.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                prediction.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {(prediction.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Prediction Results</h4>
              <div className="space-y-3">
                {Object.entries(prediction.prediction).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">
                      {key.replace('_', ' ')}:
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
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

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Validation Metrics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {(prediction.validationMetrics.accuracy * 100).toFixed(0)}%
                  </div>
                  <div className="text-gray-600">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {(prediction.validationMetrics.precision * 100).toFixed(0)}%
                  </div>
                  <div className="text-gray-600">Precision</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {(prediction.validationMetrics.recall * 100).toFixed(0)}%
                  </div>
                  <div className="text-gray-600">Recall</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {prediction.validationMetrics.auc.toFixed(2)}
                  </div>
                  <div className="text-gray-600">AUC</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Methodology</h4>
            <p className="text-sm text-gray-700">{prediction.methodology}</p>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Actionable Insights</h4>
            <div className="space-y-2">
              {prediction.actionableInsights.map((insight, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{insight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <span>Generated: {new Date(prediction.generatedAt).toLocaleString()}</span>
            <span>Clinical Relevance: {(prediction.clinicalRelevance * 100).toFixed(0)}%</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDigitalTwin = () => (
    <div className="space-y-6">
      {cancerAvatars.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-purple-500" />
            <span>Digital Twin Physiological Model</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {Object.entries(cancerAvatars[0].digitalTwin.physiologicalModel).map(([system, parameters]) => (
              <div key={system} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 capitalize">
                  {system.replace('_', ' ')} System
                </h4>
                <div className="space-y-2">
                  {Object.entries(parameters).map(([param, value]) => (
                    <div key={param} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 capitalize">
                        {param.replace('_', ' ')}:
                      </span>
                      <span className="font-medium">
                        {typeof value === 'number' ? value.toFixed(1) : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Pharmacokinetics Profile</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {(cancerAvatars[0].digitalTwin.pharmacokinetics.absorption * 100).toFixed(0)}%
                    </div>
                    <div className="text-gray-600">Absorption</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {(cancerAvatars[0].digitalTwin.pharmacokinetics.distribution * 100).toFixed(0)}%
                    </div>
                    <div className="text-gray-600">Distribution</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {(cancerAvatars[0].digitalTwin.pharmacokinetics.metabolism * 100).toFixed(0)}%
                    </div>
                    <div className="text-gray-600">Metabolism</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">
                      {(cancerAvatars[0].digitalTwin.pharmacokinetics.excretion * 100).toFixed(0)}%
                    </div>
                    <div className="text-gray-600">Excretion</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Drug Half-Lives</h5>
                  <div className="space-y-1 text-sm">
                    {Object.entries(cancerAvatars[0].digitalTwin.pharmacokinetics.halfLife).slice(0, 3).map(([drug, halfLife]) => (
                      <div key={drug} className="flex justify-between">
                        <span className="text-gray-600">{drug}:</span>
                        <span className="font-medium">{halfLife.toFixed(1)}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Disease Progression Model</h4>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600 mb-1">
                    {cancerAvatars[0].digitalTwin.diseaseProgression.currentState}
                  </div>
                  <div className="text-sm text-gray-600">Current Status</div>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Trajectory Prediction</h5>
                  <div className="space-y-2">
                    {cancerAvatars[0].digitalTwin.diseaseProgression.trajectoryPrediction.map((point, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{point.timepoint}:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${point.functionality * 100}%` }}
                            />
                          </div>
                          <span className="font-medium">{(point.functionality * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Risk Factors</h5>
                  <div className="flex flex-wrap gap-1">
                    {cancerAvatars[0].digitalTwin.diseaseProgression.riskFactors.map((factor) => (
                      <span key={factor} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        {factor.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {avatarLearning.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Brain className="h-5 w-5 text-orange-500" />
            <span>Continuous Learning System</span>
          </h3>
          
          {avatarLearning.map((learning) => (
            <div key={learning.id} className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 capitalize">
                  {learning.learningType.replace('_', ' ')} Learning
                </h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    learning.continuousLearning 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {learning.continuousLearning ? 'Active' : 'Paused'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {learning.updatesSinceLastTraining} updates pending
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {(learning.learningMetrics.modelImprovement * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">Model Improvement</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {(learning.learningMetrics.predictionAccuracy * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">Prediction Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {(learning.learningMetrics.convergenceRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">Convergence Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {(learning.learningMetrics.dataQuality * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">Data Quality</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Data Source: {learning.dataSource}
                </span>
                <span className="text-gray-600">
                  Next Training: {new Date(learning.nextTrainingScheduled).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Avatar Overview', icon: Eye },
    { id: 'predictions', label: 'AI Predictions', icon: Target },
    { id: 'digital_twin', label: 'Digital Twin', icon: Cpu },
    { id: 'learning', label: 'Continuous Learning', icon: Brain }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Personalized Cancer Avatar System
            </h1>
            <p className="text-gray-600">
              AI-powered digital twin for personalized cancer treatment prediction
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
                  ? 'border-purple-500 text-purple-600'
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
        {activeTab === 'predictions' && renderPredictions()}
        {activeTab === 'digital_twin' && renderDigitalTwin()}
        {activeTab === 'learning' && renderDigitalTwin()} {/* Reuse digital twin for learning tab */}
      </div>
    </div>
  );
};

export default PersonalizedCancerAvatarSystem;