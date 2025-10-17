import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Box, Zap, Activity, Brain, Heart, Layers, RotateCcw, Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

interface HolographicLayer {
  id: string;
  name: string;
  type: 'anatomical' | 'physiological' | 'molecular' | 'temporal' | 'genetic' | 'metabolic';
  opacity: number;
  visibility: boolean;
  dataSource: string;
  lastUpdate: string;
  resolution: 'cellular' | 'tissue' | 'organ' | 'system' | 'molecular';
  interactivity: {
    clickable: boolean;
    hoverable: boolean;
    manipulatable: boolean;
    zoomable: boolean;
  };
  renderingMode: '3D_mesh' | 'volumetric' | 'point_cloud' | 'wireframe' | 'surface';
}

interface HologramData {
  id: string;
  patientId: string;
  timestamp: string;
  dimensions: {
    anatomical: {
      organs: Array<{
        name: string;
        health: number;
        volume: number;
        density: number;
        bloodFlow: number;
        abnormalities: string[];
        coordinates: { x: number; y: number; z: number };
      }>;
      tissues: Array<{
        type: string;
        health: number;
        oxygenation: number;
        inflammation: number;
        cellDensity: number;
      }>;
      vasculature: {
        arteries: number;
        veins: number;
        capillaries: number;
        perfusion: number;
        resistance: number;
      };
    };
    physiological: {
      vitalSigns: {
        heartRate: number;
        bloodPressure: { systolic: number; diastolic: number };
        respiratoryRate: number;
        temperature: number;
        oxygenSaturation: number;
      };
      systemFunction: {
        cardiovascular: number;
        respiratory: number;
        neurological: number;
        digestive: number;
        immune: number;
        endocrine: number;
      };
      biomarkers: Array<{
        name: string;
        value: number;
        normalRange: { min: number; max: number };
        trend: 'increasing' | 'decreasing' | 'stable';
      }>;
    };
    molecular: {
      genetics: {
        mutations: Array<{
          gene: string;
          variant: string;
          pathogenicity: number;
          expression: number;
        }>;
        methylation: number;
        transcriptomics: { [gene: string]: number };
        proteomics: { [protein: string]: number };
      };
      cellular: {
        proliferation: number;
        apoptosis: number;
        differentiation: number;
        migration: number;
        angiogenesis: number;
      };
      microenvironment: {
        oxygenLevel: number;
        pH: number;
        nutrientDensity: number;
        toxinLevel: number;
        immuneInfiltration: number;
      };
    };
    temporal: {
      diseaseProgression: Array<{
        timepoint: string;
        stage: string;
        tumorSize: number;
        metastases: number;
        response: number;
      }>;
      treatmentHistory: Array<{
        treatment: string;
        startDate: string;
        endDate: string;
        response: number;
        toxicity: number;
      }>;
      predictions: Array<{
        timeframe: string;
        probability: number;
        outcome: string;
        confidence: number;
      }>;
    };
  };
}

interface InteractionControls {
  rotation: { x: number; y: number; z: number };
  zoom: number;
  pan: { x: number; y: number };
  timepoint: number;
  playback: {
    isPlaying: boolean;
    speed: number;
    loop: boolean;
    startTime: number;
    endTime: number;
  };
  filters: {
    healthyTissue: boolean;
    abnormalTissue: boolean;
    bloodVessels: boolean;
    nervePathways: boolean;
    lymphatics: boolean;
  };
  visualization: {
    colorScheme: 'medical' | 'thermal' | 'functional' | 'pathology';
    transparency: number;
    lighting: 'ambient' | 'directional' | 'volumetric';
    effects: string[];
  };
}

interface HologramAnalytics {
  id: string;
  patientId: string;
  analysisType: 'disease_progression' | 'treatment_response' | 'risk_assessment' | 'surgical_planning';
  insights: Array<{
    category: string;
    finding: string;
    significance: number;
    confidence: number;
    clinicalImplication: string;
    recommendation: string;
  }>;
  spatialAnalysis: {
    tumorVolume: number;
    invasionDepth: number;
    proximityToOrgans: Array<{
      organ: string;
      distance: number;
      riskLevel: number;
    }>;
    vascularInvolvement: number;
    neurologicalInvolvement: number;
  };
  temporalAnalysis: {
    growthRate: number;
    doubleTime: number;
    treatmentResponse: Array<{
      timepoint: string;
      responseRate: number;
      volumeChange: number;
    }>;
    projectedOutcome: {
      timeline: string;
      scenario: string;
      probability: number;
    };
  };
  comparativeAnalysis: {
    normalTissue: number;
    similarCases: Array<{
      caseId: string;
      similarity: number;
      outcome: string;
      treatment: string;
    }>;
    populationAverage: number;
  };
}

interface SurgicalPlanning {
  id: string;
  procedureType: string;
  patientId: string;
  hologramId: string;
  planningData: {
    approachOptions: Array<{
      approach: string;
      difficulty: number;
      riskLevel: number;
      estimatedTime: number;
      advantages: string[];
      disadvantages: string[];
    }>;
    criticalStructures: Array<{
      structure: string;
      location: { x: number; y: number; z: number };
      importance: number;
      riskOfInjury: number;
      protectionStrategy: string;
    }>;
    resectionMargins: {
      minimum: number;
      optimal: number;
      achievable: number;
      confidence: number;
    };
    reconstructionOptions: Array<{
      method: string;
      feasibility: number;
      functionalOutcome: number;
      cosmeticOutcome: number;
    }>;
  };
  simulationResults: {
    successProbability: number;
    complicationRisk: number;
    functionalPreservation: number;
    recoveryTime: number;
    qualityOfLifeImpact: number;
  };
  intraoperativeGuidance: {
    realTimeTracking: boolean;
    augmentedReality: boolean;
    navigationAccuracy: number;
    safetyAlerts: string[];
  };
}

interface CollaborativeViewing {
  id: string;
  sessionId: string;
  participants: Array<{
    userId: string;
    role: string;
    permissions: string[];
    viewpoint: {
      position: { x: number; y: number; z: number };
      orientation: { x: number; y: number; z: number };
    };
    annotations: Array<{
      id: string;
      type: 'pointer' | 'measurement' | 'note' | 'highlight';
      position: { x: number; y: number; z: number };
      content: string;
      timestamp: string;
    }>;
  }>;
  sharedState: {
    currentTimepoint: number;
    activeLayer: string;
    zoom: number;
    focusPoint: { x: number; y: number; z: number };
  };
  communication: {
    voiceChat: boolean;
    videoConference: boolean;
    realTimeAnnotations: boolean;
    screenSharing: boolean;
  };
  decisionMaking: {
    votingActive: boolean;
    proposals: Array<{
      proposer: string;
      proposal: string;
      votes: { [userId: string]: 'approve' | 'reject' | 'abstain' };
      status: 'pending' | 'approved' | 'rejected';
    }>;
  };
}

interface HologramPerformance {
  id: string;
  renderingMetrics: {
    frameRate: number;
    renderTime: number;
    polygonCount: number;
    textureMemory: number;
    shaderComplexity: number;
  };
  userInteraction: {
    responseTime: number;
    accuracy: number;
    errorRate: number;
    userSatisfaction: number;
  };
  dataProcessing: {
    loadTime: number;
    compressionRatio: number;
    streamingQuality: number;
    cacheEfficiency: number;
  };
  clinicalUtility: {
    diagnosticAccuracy: number;
    timeToDecision: number;
    treatmentPlanChanges: number;
    outcomeImprovement: number;
  };
}

const MultidimensionalPatientHologram: React.FC = () => {
  const [activeTab, setActiveTab] = useState('hologram');
  const [layers, setLayers] = useState<HolographicLayer[]>([]);
  const [hologramData, setHologramData] = useState<HologramData[]>([]);
  const [controls, setControls] = useState<InteractionControls>({
    rotation: { x: 0, y: 0, z: 0 },
    zoom: 1,
    pan: { x: 0, y: 0 },
    timepoint: 0,
    playback: { isPlaying: false, speed: 1, loop: false, startTime: 0, endTime: 100 },
    filters: { healthyTissue: true, abnormalTissue: true, bloodVessels: true, nervePathways: false, lymphatics: false },
    visualization: { colorScheme: 'medical', transparency: 0.8, lighting: 'volumetric', effects: [] }
  });
  const [analytics, setAnalytics] = useState<HologramAnalytics[]>([]);
  const [surgical, setSurgical] = useState<SurgicalPlanning[]>([]);
  const [collaboration, setCollaboration] = useState<CollaborativeViewing[]>([]);
  const [performance, setPerformance] = useState<HologramPerformance[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate mock data
  useEffect(() => {
    const generateMockLayers = (): HolographicLayer[] => {
      return [
        { id: 'anatomical', name: 'Anatomical Structure', type: 'anatomical', opacity: 0.8, visibility: true, dataSource: 'CT/MRI', lastUpdate: new Date().toISOString(), resolution: 'organ', interactivity: { clickable: true, hoverable: true, manipulatable: true, zoomable: true }, renderingMode: '3D_mesh' },
        { id: 'physiological', name: 'Physiological Function', type: 'physiological', opacity: 0.6, visibility: true, dataSource: 'Real-time monitoring', lastUpdate: new Date().toISOString(), resolution: 'system', interactivity: { clickable: true, hoverable: true, manipulatable: false, zoomable: true }, renderingMode: 'volumetric' },
        { id: 'molecular', name: 'Molecular Pathways', type: 'molecular', opacity: 0.4, visibility: false, dataSource: 'Genomic analysis', lastUpdate: new Date().toISOString(), resolution: 'molecular', interactivity: { clickable: true, hoverable: true, manipulatable: false, zoomable: true }, renderingMode: 'point_cloud' },
        { id: 'temporal', name: 'Disease Progression', type: 'temporal', opacity: 0.7, visibility: true, dataSource: 'Longitudinal data', lastUpdate: new Date().toISOString(), resolution: 'tissue', interactivity: { clickable: false, hoverable: true, manipulatable: false, zoomable: false }, renderingMode: 'surface' },
        { id: 'genetic', name: 'Genetic Mutations', type: 'genetic', opacity: 0.5, visibility: false, dataSource: 'NGS sequencing', lastUpdate: new Date().toISOString(), resolution: 'cellular', interactivity: { clickable: true, hoverable: true, manipulatable: false, zoomable: true }, renderingMode: 'wireframe' },
        { id: 'metabolic', name: 'Metabolic Activity', type: 'metabolic', opacity: 0.6, visibility: false, dataSource: 'PET imaging', lastUpdate: new Date().toISOString(), resolution: 'tissue', interactivity: { clickable: true, hoverable: true, manipulatable: false, zoomable: true }, renderingMode: 'volumetric' }
      ];
    };

    const generateMockHologramData = (): HologramData[] => {
      return Array.from({ length: 3 }, (_, i) => ({
        id: `hologram-${i}`,
        patientId: `patient-${i}`,
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        dimensions: {
          anatomical: {
            organs: [
              { name: 'Heart', health: 85 + Math.random() * 15, volume: 300 + Math.random() * 50, density: 1.05, bloodFlow: 5000 + Math.random() * 1000, abnormalities: ['Mild calcification'], coordinates: { x: 0, y: 0, z: 0 } },
              { name: 'Lungs', health: 90 + Math.random() * 10, volume: 5500 + Math.random() * 500, density: 0.26, bloodFlow: 2500 + Math.random() * 500, abnormalities: [], coordinates: { x: 50, y: 20, z: 0 } },
              { name: 'Liver', health: 75 + Math.random() * 20, volume: 1800 + Math.random() * 200, density: 1.08, bloodFlow: 1500 + Math.random() * 300, abnormalities: ['Lesion detected'], coordinates: { x: -30, y: -10, z: 5 } }
            ],
            tissues: [
              { type: 'Tumor', health: 20 + Math.random() * 30, oxygenation: 40 + Math.random() * 20, inflammation: 70 + Math.random() * 30, cellDensity: 0.8 + Math.random() * 0.2 },
              { type: 'Normal', health: 85 + Math.random() * 15, oxygenation: 90 + Math.random() * 10, inflammation: 10 + Math.random() * 15, cellDensity: 0.6 + Math.random() * 0.2 }
            ],
            vasculature: { arteries: 95, veins: 92, capillaries: 88, perfusion: 85, resistance: 1.2 }
          },
          physiological: {
            vitalSigns: {
              heartRate: 70 + Math.random() * 20,
              bloodPressure: { systolic: 120 + Math.random() * 20, diastolic: 80 + Math.random() * 10 },
              respiratoryRate: 16 + Math.random() * 4,
              temperature: 36.5 + Math.random() * 1.5,
              oxygenSaturation: 95 + Math.random() * 5
            },
            systemFunction: {
              cardiovascular: 85 + Math.random() * 15,
              respiratory: 90 + Math.random() * 10,
              neurological: 95 + Math.random() * 5,
              digestive: 80 + Math.random() * 20,
              immune: 70 + Math.random() * 30,
              endocrine: 85 + Math.random() * 15
            },
            biomarkers: [
              { name: 'CEA', value: 3.2 + Math.random() * 2, normalRange: { min: 0, max: 5 }, trend: 'stable' },
              { name: 'CA-125', value: 35 + Math.random() * 20, normalRange: { min: 0, max: 35 }, trend: 'decreasing' }
            ]
          },
          molecular: {
            genetics: {
              mutations: [
                { gene: 'TP53', variant: 'p.R273H', pathogenicity: 0.9, expression: 0.3 },
                { gene: 'KRAS', variant: 'p.G12D', pathogenicity: 0.8, expression: 2.5 }
              ],
              methylation: 0.3 + Math.random() * 0.4,
              transcriptomics: { 'EGFR': 1.2, 'VEGF': 2.1, 'MYC': 1.8 },
              proteomics: { 'p53': 0.3, 'EGFR': 1.5, 'VEGF': 2.2 }
            },
            cellular: {
              proliferation: 60 + Math.random() * 40,
              apoptosis: 20 + Math.random() * 30,
              differentiation: 40 + Math.random() * 30,
              migration: 50 + Math.random() * 40,
              angiogenesis: 70 + Math.random() * 30
            },
            microenvironment: {
              oxygenLevel: 60 + Math.random() * 30,
              pH: 6.8 + Math.random() * 0.6,
              nutrientDensity: 70 + Math.random() * 30,
              toxinLevel: 30 + Math.random() * 40,
              immuneInfiltration: 40 + Math.random() * 40
            }
          },
          temporal: {
            diseaseProgression: Array.from({ length: 12 }, (_, j) => ({
              timepoint: `Month ${j}`,
              stage: j < 6 ? 'II' : 'III',
              tumorSize: 15 + j * 2 + Math.random() * 3,
              metastases: Math.floor(j / 4),
              response: Math.max(0, 80 - j * 5 + Math.random() * 20)
            })),
            treatmentHistory: [
              { treatment: 'Surgery', startDate: '2024-01-15', endDate: '2024-01-16', response: 85, toxicity: 20 },
              { treatment: 'Chemotherapy', startDate: '2024-02-01', endDate: '2024-05-01', response: 70, toxicity: 45 }
            ],
            predictions: [
              { timeframe: '6 months', probability: 0.75, outcome: 'Stable disease', confidence: 0.85 },
              { timeframe: '12 months', probability: 0.6, outcome: 'Partial response', confidence: 0.7 }
            ]
          }
        }
      }));
    };

    const generateMockAnalytics = (): HologramAnalytics[] => {
      return Array.from({ length: 2 }, (_, i) => ({
        id: `analytics-${i}`,
        patientId: `patient-${i}`,
        analysisType: ['disease_progression', 'treatment_response', 'risk_assessment', 'surgical_planning'][Math.floor(Math.random() * 4)] as any,
        insights: [
          { category: 'Tumor characteristics', finding: 'Increased vascularization in posterior region', significance: 0.85, confidence: 0.92, clinicalImplication: 'Higher metastatic potential', recommendation: 'Consider anti-angiogenic therapy' },
          { category: 'Treatment response', finding: 'Heterogeneous response pattern', significance: 0.75, confidence: 0.88, clinicalImplication: 'Resistance development likely', recommendation: 'Monitor closely and consider combination therapy' }
        ],
        spatialAnalysis: {
          tumorVolume: 45.2 + Math.random() * 20,
          invasionDepth: 12.5 + Math.random() * 5,
          proximityToOrgans: [
            { organ: 'Aorta', distance: 15.2, riskLevel: 0.7 },
            { organ: 'Esophagus', distance: 8.3, riskLevel: 0.9 }
          ],
          vascularInvolvement: 0.6 + Math.random() * 0.3,
          neurologicalInvolvement: 0.2 + Math.random() * 0.3
        },
        temporalAnalysis: {
          growthRate: 2.1 + Math.random() * 1.5,
          doubleTime: 45 + Math.random() * 30,
          treatmentResponse: Array.from({ length: 6 }, (_, j) => ({
            timepoint: `Week ${j * 2}`,
            responseRate: Math.max(20, 80 - j * 8 + Math.random() * 15),
            volumeChange: -5 + j * 2 + Math.random() * 5
          })),
          projectedOutcome: {
            timeline: '12 months',
            scenario: 'Stable disease with slow progression',
            probability: 0.72
          }
        },
        comparativeAnalysis: {
          normalTissue: 0.95,
          similarCases: [
            { caseId: 'case-001', similarity: 0.89, outcome: 'Complete remission', treatment: 'Immunotherapy + Surgery' },
            { caseId: 'case-002', similarity: 0.82, outcome: 'Partial response', treatment: 'Chemotherapy + Radiation' }
          ],
          populationAverage: 0.68
        }
      }));
    };

    const generateMockSurgical = (): SurgicalPlanning[] => {
      return Array.from({ length: 1 }, (_, i) => ({
        id: `surgical-${i}`,
        procedureType: 'Lung lobectomy',
        patientId: `patient-${i}`,
        hologramId: `hologram-${i}`,
        planningData: {
          approachOptions: [
            { approach: 'VATS (Video-Assisted)', difficulty: 7, riskLevel: 4, estimatedTime: 180, advantages: ['Minimal invasive', 'Faster recovery'], disadvantages: ['Limited access', 'Technical complexity'] },
            { approach: 'Open thoracotomy', difficulty: 5, riskLevel: 6, estimatedTime: 240, advantages: ['Full access', 'Better visualization'], disadvantages: ['Larger incision', 'Longer recovery'] }
          ],
          criticalStructures: [
            { structure: 'Pulmonary artery', location: { x: 25, y: 15, z: 10 }, importance: 10, riskOfInjury: 0.05, protectionStrategy: 'Careful dissection with vessel loops' },
            { structure: 'Phrenic nerve', location: { x: 30, y: 25, z: 5 }, importance: 8, riskOfInjury: 0.12, protectionStrategy: 'Electrocautery avoidance' }
          ],
          resectionMargins: { minimum: 10, optimal: 20, achievable: 18, confidence: 0.85 },
          reconstructionOptions: [
            { method: 'Primary closure', feasibility: 0.9, functionalOutcome: 0.85, cosmeticOutcome: 0.9 },
            { method: 'Mesh repair', feasibility: 0.8, functionalOutcome: 0.75, cosmeticOutcome: 0.7 }
          ]
        },
        simulationResults: {
          successProbability: 0.92,
          complicationRisk: 0.15,
          functionalPreservation: 0.88,
          recoveryTime: 21,
          qualityOfLifeImpact: 0.82
        },
        intraoperativeGuidance: {
          realTimeTracking: true,
          augmentedReality: true,
          navigationAccuracy: 0.98,
          safetyAlerts: ['Proximity to critical vessel', 'Margin adequacy check']
        }
      }));
    };

    const generateMockCollaboration = (): CollaborativeViewing[] => {
      return Array.from({ length: 1 }, (_, i) => ({
        id: `collaboration-${i}`,
        sessionId: `session-${i}`,
        participants: [
          { userId: 'surgeon-1', role: 'Thoracic Surgeon', permissions: ['view', 'annotate', 'control'], viewpoint: { position: { x: 0, y: 0, z: 100 }, orientation: { x: 0, y: 0, z: 0 } }, annotations: [{ id: 'anno-1', type: 'pointer', position: { x: 25, y: 15, z: 10 }, content: 'Critical vessel here', timestamp: new Date().toISOString() }] },
          { userId: 'onc-1', role: 'Medical Oncologist', permissions: ['view', 'annotate'], viewpoint: { position: { x: 50, y: 0, z: 100 }, orientation: { x: 15, y: 0, z: 0 } }, annotations: [] },
          { userId: 'rad-1', role: 'Radiologist', permissions: ['view', 'annotate'], viewpoint: { position: { x: 0, y: 50, z: 100 }, orientation: { x: 0, y: 15, z: 0 } }, annotations: [] }
        ],
        sharedState: { currentTimepoint: 6, activeLayer: 'anatomical', zoom: 1.5, focusPoint: { x: 25, y: 15, z: 10 } },
        communication: { voiceChat: true, videoConference: false, realTimeAnnotations: true, screenSharing: false },
        decisionMaking: {
          votingActive: true,
          proposals: [
            { proposer: 'surgeon-1', proposal: 'Proceed with VATS approach', votes: { 'surgeon-1': 'approve', 'onc-1': 'approve', 'rad-1': 'abstain' }, status: 'approved' }
          ]
        }
      }));
    };

    const generateMockPerformance = (): HologramPerformance[] => {
      return Array.from({ length: 1 }, (_, i) => ({
        id: `performance-${i}`,
        renderingMetrics: {
          frameRate: 55 + Math.random() * 10,
          renderTime: 12 + Math.random() * 5,
          polygonCount: Math.floor(Math.random() * 500000) + 1000000,
          textureMemory: Math.floor(Math.random() * 2000) + 4000,
          shaderComplexity: 8.5 + Math.random() * 1.5
        },
        userInteraction: {
          responseTime: 45 + Math.random() * 15,
          accuracy: 0.95 + Math.random() * 0.05,
          errorRate: 0.02 + Math.random() * 0.03,
          userSatisfaction: 4.6 + Math.random() * 0.4
        },
        dataProcessing: {
          loadTime: 2.1 + Math.random() * 1.5,
          compressionRatio: 0.15 + Math.random() * 0.1,
          streamingQuality: 0.92 + Math.random() * 0.08,
          cacheEfficiency: 0.88 + Math.random() * 0.12
        },
        clinicalUtility: {
          diagnosticAccuracy: 0.91 + Math.random() * 0.08,
          timeToDecision: 180 + Math.random() * 120,
          treatmentPlanChanges: 0.35 + Math.random() * 0.25,
          outcomeImprovement: 0.28 + Math.random() * 0.22
        }
      }));
    };

    setLayers(generateMockLayers());
    setHologramData(generateMockHologramData());
    setAnalytics(generateMockAnalytics());
    setSurgical(generateMockSurgical());
    setCollaboration(generateMockCollaboration());
    setPerformance(generateMockPerformance());
  }, []);

  // Canvas visualization for 3D hologram
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

      // Draw 3D holographic representation
      const rotationSpeed = 0.5;
      const rotation = time * rotationSpeed + controls.rotation.y;

      // Draw holographic grid
      for (let i = -5; i <= 5; i++) {
        for (let j = -5; j <= 5; j++) {
          const x = centerX + i * 20 * Math.cos(rotation) - j * 20 * Math.sin(rotation);
          const y = centerY + j * 20 * Math.cos(rotation * 0.7) + i * 10;
          const z = i * 20 * Math.sin(rotation) + j * 20 * Math.cos(rotation);
          
          const alpha = Math.max(0, 1 - Math.abs(z) / 100);
          ctx.fillStyle = `rgba(59, 130, 246, ${alpha * 0.3})`;
          ctx.fillRect(x - 1, y - 1, 2, 2);
        }
      }

      // Draw anatomical layers
      if (layers.find(l => l.id === 'anatomical')?.visibility) {
        // Draw organ representations
        const organData = hologramData[0]?.dimensions.anatomical.organs || [];
        organData.forEach((organ, index) => {
          const orgX = centerX + organ.coordinates.x * Math.cos(rotation) - organ.coordinates.z * Math.sin(rotation);
          const orgY = centerY + organ.coordinates.y + organ.coordinates.x * Math.sin(rotation) * 0.3;
          const orgZ = organ.coordinates.x * Math.sin(rotation) + organ.coordinates.z * Math.cos(rotation);
          
          const size = Math.max(10, organ.volume / 100) * controls.zoom;
          const alpha = Math.max(0.3, 1 - Math.abs(orgZ) / 100);
          
          // Organ health color coding
          const healthColor = organ.health > 80 ? '34, 197, 94' : organ.health > 60 ? '245, 158, 11' : '239, 68, 68';
          
          ctx.fillStyle = `rgba(${healthColor}, ${alpha * 0.7})`;
          ctx.beginPath();
          ctx.arc(orgX, orgY, size, 0, 2 * Math.PI);
          ctx.fill();
          
          // Organ label
          if (alpha > 0.5) {
            ctx.fillStyle = '#1f2937';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(organ.name, orgX, orgY + size + 15);
          }
          
          // Health indicator
          ctx.strokeStyle = `rgba(${healthColor}, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(orgX, orgY, size + 5, 0, (organ.health / 100) * 2 * Math.PI);
          ctx.stroke();
        });
      }

      // Draw physiological layer
      if (layers.find(l => l.id === 'physiological')?.visibility) {
        // Draw blood flow visualization
        for (let flow = 0; flow < 20; flow++) {
          const flowAngle = (flow / 20) * 2 * Math.PI + time * 2;
          const flowRadius = 80 + Math.sin(time * 3 + flow) * 20;
          const flowX = centerX + Math.cos(flowAngle) * flowRadius;
          const flowY = centerY + Math.sin(flowAngle) * flowRadius * 0.5;
          
          ctx.fillStyle = `rgba(220, 38, 127, ${0.4 + Math.sin(time * 4 + flow) * 0.3})`;
          ctx.beginPath();
          ctx.arc(flowX, flowY, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      // Draw molecular layer
      if (layers.find(l => l.id === 'molecular')?.visibility) {
        // Draw molecular pathways
        for (let mol = 0; mol < 50; mol++) {
          const molX = centerX + (Math.random() - 0.5) * 200;
          const molY = centerY + (Math.random() - 0.5) * 200;
          const molActivity = Math.sin(time * 5 + mol) * 0.5 + 0.5;
          
          ctx.fillStyle = `rgba(168, 85, 247, ${molActivity * 0.6})`;
          ctx.fillRect(molX - 1, molY - 1, 2, 2);
        }
      }

      // Draw temporal progression
      if (layers.find(l => l.id === 'temporal')?.visibility) {
        const timelineY = canvas.height - 50;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(50, timelineY);
        ctx.lineTo(canvas.width - 50, timelineY);
        ctx.stroke();
        
        // Current timepoint indicator
        const timePosition = 50 + (controls.timepoint / 100) * (canvas.width - 100);
        ctx.fillStyle = 'rgba(245, 158, 11, 1)';
        ctx.beginPath();
        ctx.arc(timePosition, timelineY, 6, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Draw holographic effects
      for (let effect = 0; effect < 8; effect++) {
        const effectAngle = (effect / 8) * 2 * Math.PI + time * 0.3;
        const effectRadius = 150 + Math.sin(time + effect) * 30;
        const effectX = centerX + Math.cos(effectAngle) * effectRadius;
        const effectY = centerY + Math.sin(effectAngle) * effectRadius * 0.7;
        
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 + Math.sin(time * 2 + effect) * 0.1})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(effectX, effectY, 10, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Draw central hologram emitter
      ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
      ctx.beginPath();
      ctx.arc(centerX, centerY + 180, 15, 0, 2 * Math.PI);
      ctx.fill();

      // Draw hologram info
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#1f2937';
      ctx.textAlign = 'center';
      ctx.fillText('Patient Hologram', centerX, 30);
      ctx.fillText(`Time: ${controls.timepoint}%`, centerX, canvas.height - 20);

      requestAnimationFrame(animate);
    };

    animate();
  }, [controls, layers, hologramData, activeTab]);

  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visibility: !layer.visibility } : layer
    ));
  };

  const updateControls = (updates: Partial<InteractionControls>) => {
    setControls(prev => ({ ...prev, ...updates }));
  };

  const renderHologram = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Active Layers</p>
                <p className="text-2xl font-bold">{layers.filter(l => l.visibility).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Box className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Resolution</p>
                <p className="text-2xl font-bold">
                  {performance.length > 0 ? `${(performance[0].renderingMetrics.polygonCount / 1000000).toFixed(1)}M` : '0M'}
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
                <p className="text-sm text-gray-600">Frame Rate</p>
                <p className="text-2xl font-bold">
                  {performance.length > 0 ? `${performance[0].renderingMetrics.frameRate.toFixed(0)}fps` : '0fps'}
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
                <p className="text-sm text-gray-600">Render Time</p>
                <p className="text-2xl font-bold">
                  {performance.length > 0 ? `${performance[0].renderingMetrics.renderTime.toFixed(0)}ms` : '0ms'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>3D Patient Hologram</CardTitle>
            </CardHeader>
            <CardContent>
              <canvas
                ref={canvasRef}
                className="w-full h-96 border rounded cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)' }}
                onMouseMove={(e) => {
                  if (e.buttons === 1) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const deltaX = (e.clientX - rect.left - rect.width / 2) * 0.01;
                    const deltaY = (e.clientY - rect.top - rect.height / 2) * 0.01;
                    updateControls({
                      rotation: {
                        ...controls.rotation,
                        x: controls.rotation.x + deltaY,
                        y: controls.rotation.y + deltaX
                      }
                    });
                  }
                }}
                onWheel={(e) => {
                  e.preventDefault();
                  const newZoom = Math.max(0.1, Math.min(5, controls.zoom + e.deltaY * -0.001));
                  updateControls({ zoom: newZoom });
                }}
              />
              
              {/* Playback Controls */}
              <div className="flex items-center justify-center space-x-4 mt-4">
                <button
                  onClick={() => updateControls({ timepoint: 0 })}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <SkipBack className="h-4 w-4" />
                </button>
                <button
                  onClick={() => updateControls({
                    playback: { ...controls.playback, isPlaying: !controls.playback.isPlaying }
                  })}
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {controls.playback.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => updateControls({ timepoint: 100 })}
                  className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
                <div className="flex items-center space-x-2">
                  <RotateCcw className="h-4 w-4 text-gray-600" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={controls.timepoint}
                    onChange={(e) => updateControls({ timepoint: parseInt(e.target.value) })}
                    className="w-24"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Holographic Layers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {layers.map((layer) => (
                  <div key={layer.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={layer.visibility}
                        onChange={() => toggleLayer(layer.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{layer.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={layer.opacity}
                        onChange={(e) => {
                          const newOpacity = parseFloat(e.target.value);
                          setLayers(prev => prev.map(l => 
                            l.id === layer.id ? { ...l, opacity: newOpacity } : l
                          ));
                        }}
                        className="w-16"
                      />
                      <span className="text-xs text-gray-600">{layer.opacity.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visualization Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Color Scheme</label>
                  <select
                    value={controls.visualization.colorScheme}
                    onChange={(e) => updateControls({
                      visualization: {
                        ...controls.visualization,
                        colorScheme: e.target.value as any
                      }
                    })}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="medical">Medical</option>
                    <option value="thermal">Thermal</option>
                    <option value="functional">Functional</option>
                    <option value="pathology">Pathology</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Lighting</label>
                  <select
                    value={controls.visualization.lighting}
                    onChange={(e) => updateControls({
                      visualization: {
                        ...controls.visualization,
                        lighting: e.target.value as any
                      }
                    })}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="ambient">Ambient</option>
                    <option value="directional">Directional</option>
                    <option value="volumetric">Volumetric</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Transparency</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={controls.visualization.transparency}
                    onChange={(e) => updateControls({
                      visualization: {
                        ...controls.visualization,
                        transparency: parseFloat(e.target.value)
                      }
                    })}
                    className="w-full mt-1"
                  />
                  <span className="text-xs text-gray-600">{controls.visualization.transparency.toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {hologramData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Real-Time Patient Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h5 className="font-medium mb-3">Vital Signs</h5>
                <div className="space-y-2">
                  {Object.entries(hologramData[0].dimensions.physiological.vitalSigns).map(([sign, value]) => (
                    <div key={sign} className="flex justify-between">
                      <span className="text-sm capitalize">{sign.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-sm font-medium">
                        {typeof value === 'object' ? `${value.systolic}/${value.diastolic}` : value.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">System Function</h5>
                <div className="space-y-2">
                  {Object.entries(hologramData[0].dimensions.physiological.systemFunction).map(([system, value]) => (
                    <div key={system} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{system}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${value > 80 ? 'bg-green-500' : value > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{value.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">Organs Status</h5>
                <div className="space-y-2">
                  {hologramData[0].dimensions.anatomical.organs.map((organ) => (
                    <div key={organ.name} className="flex justify-between items-center">
                      <span className="text-sm">{organ.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${organ.health > 80 ? 'bg-green-500' : organ.health > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${organ.health}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{organ.health.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Active Analyses</p>
                <p className="text-2xl font-bold">{analytics.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Layers className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Tumor Volume</p>
                <p className="text-2xl font-bold">
                  {analytics.length > 0 ? `${analytics[0].spatialAnalysis.tumorVolume.toFixed(1)}cm³` : '0cm³'}
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
                <p className="text-sm text-gray-600">Growth Rate</p>
                <p className="text-2xl font-bold">
                  {analytics.length > 0 ? `${analytics[0].temporalAnalysis.growthRate.toFixed(1)}%/mo` : '0%/mo'}
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
                <p className="text-sm text-gray-600">Vascular Involvement</p>
                <p className="text-2xl font-bold">
                  {analytics.length > 0 ? `${(analytics[0].spatialAnalysis.vascularInvolvement * 100).toFixed(0)}%` : '0%'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {analytics.map((analysis) => (
        <Card key={analysis.id}>
          <CardHeader>
            <CardTitle className="capitalize">
              {analysis.analysisType.replace('_', ' ')} Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h5 className="font-medium mb-3">Key Insights</h5>
                <div className="space-y-3">
                  {analysis.insights.map((insight, i) => (
                    <div key={i} className="border rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h6 className="font-medium">{insight.category}</h6>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-600">Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            insight.significance > 0.8 ? 'bg-red-100 text-red-800' :
                            insight.significance > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {insight.significance > 0.8 ? 'Critical' : insight.significance > 0.6 ? 'Important' : 'Notable'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{insight.finding}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Clinical Implication:</span>
                          <p>{insight.clinicalImplication}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Recommendation:</span>
                          <p>{insight.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium mb-3">Spatial Analysis</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Tumor Volume</span>
                      <span className="text-sm font-medium">{analysis.spatialAnalysis.tumorVolume.toFixed(1)} cm³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Invasion Depth</span>
                      <span className="text-sm font-medium">{analysis.spatialAnalysis.invasionDepth.toFixed(1)} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Vascular Involvement</span>
                      <span className="text-sm font-medium">{(analysis.spatialAnalysis.vascularInvolvement * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Neural Involvement</span>
                      <span className="text-sm font-medium">{(analysis.spatialAnalysis.neurologicalInvolvement * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h6 className="text-sm font-medium mb-2">Proximity to Critical Structures</h6>
                    <div className="space-y-1">
                      {analysis.spatialAnalysis.proximityToOrgans.map((proximity, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-xs">{proximity.organ}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs">{proximity.distance.toFixed(1)}mm</span>
                            <div className={`w-3 h-3 rounded-full ${
                              proximity.riskLevel > 0.7 ? 'bg-red-500' :
                              proximity.riskLevel > 0.4 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-3">Temporal Analysis</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Growth Rate</span>
                      <span className="text-sm font-medium">{analysis.temporalAnalysis.growthRate.toFixed(1)}%/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Doubling Time</span>
                      <span className="text-sm font-medium">{analysis.temporalAnalysis.doubleTime.toFixed(0)} days</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h6 className="text-sm font-medium mb-2">Treatment Response Timeline</h6>
                    <div className="space-y-1">
                      {analysis.temporalAnalysis.treatmentResponse.slice(0, 4).map((response, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-xs">{response.timepoint}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs">{response.responseRate.toFixed(0)}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-blue-500 h-1 rounded-full"
                                style={{ width: `${response.responseRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <h6 className="text-sm font-medium mb-1">Projected Outcome</h6>
                    <p className="text-sm">{analysis.temporalAnalysis.projectedOutcome.scenario}</p>
                    <p className="text-xs text-gray-600">
                      {analysis.temporalAnalysis.projectedOutcome.timeline} • {(analysis.temporalAnalysis.projectedOutcome.probability * 100).toFixed(0)}% probability
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-3">Comparative Analysis</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">vs Normal Tissue</p>
                    <p className="text-2xl font-bold">{(analysis.comparativeAnalysis.normalTissue * 100).toFixed(0)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">vs Population Average</p>
                    <p className="text-2xl font-bold">{(analysis.comparativeAnalysis.populationAverage * 100).toFixed(0)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Similar Cases</p>
                    <p className="text-2xl font-bold">{analysis.comparativeAnalysis.similarCases.length}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h6 className="text-sm font-medium mb-2">Similar Cases Analysis</h6>
                  <div className="space-y-2">
                    {analysis.comparativeAnalysis.similarCases.map((similarCase, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span>{similarCase.caseId}</span>
                        <span>Similarity: {(similarCase.similarity * 100).toFixed(0)}%</span>
                        <span>{similarCase.outcome}</span>
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

  const renderSurgical = () => (
    <div className="space-y-6">
      {surgical.map((plan) => (
        <div key={plan.id} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Success Probability</p>
                    <p className="text-2xl font-bold">{(plan.simulationResults.successProbability * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Complication Risk</p>
                    <p className="text-2xl font-bold">{(plan.simulationResults.complicationRisk * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Function Preservation</p>
                    <p className="text-2xl font-bold">{(plan.simulationResults.functionalPreservation * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Recovery Time</p>
                    <p className="text-2xl font-bold">{plan.simulationResults.recoveryTime} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Surgical Planning: {plan.procedureType}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h5 className="font-medium mb-3">Approach Options</h5>
                  <div className="space-y-3">
                    {plan.planningData.approachOptions.map((approach, i) => (
                      <div key={i} className="border rounded p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h6 className="font-medium">{approach.approach}</h6>
                          <div className="flex items-center space-x-4 text-sm">
                            <span>Difficulty: {approach.difficulty}/10</span>
                            <span>Risk: {approach.riskLevel}/10</span>
                            <span>Time: {approach.estimatedTime}min</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h6 className="text-sm font-medium mb-1 text-green-700">Advantages</h6>
                            <ul className="text-sm space-y-1">
                              {approach.advantages.map((advantage, j) => (
                                <li key={j} className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                                  <span>{advantage}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h6 className="text-sm font-medium mb-1 text-red-700">Disadvantages</h6>
                            <ul className="text-sm space-y-1">
                              {approach.disadvantages.map((disadvantage, j) => (
                                <li key={j} className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                                  <span>{disadvantage}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-3">Critical Structures</h5>
                  <div className="space-y-2">
                    {plan.planningData.criticalStructures.map((structure, i) => (
                      <div key={i} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <span className="font-medium">{structure.structure}</span>
                          <p className="text-sm text-gray-600">{structure.protectionStrategy}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-xs text-gray-600">Importance</p>
                            <p className="font-medium">{structure.importance}/10</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-600">Risk</p>
                            <p className="font-medium">{(structure.riskOfInjury * 100).toFixed(0)}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium mb-3">Resection Margins</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Minimum</span>
                        <span className="text-sm font-medium">{plan.planningData.resectionMargins.minimum}mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Optimal</span>
                        <span className="text-sm font-medium">{plan.planningData.resectionMargins.optimal}mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Achievable</span>
                        <span className="text-sm font-medium">{plan.planningData.resectionMargins.achievable}mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Confidence</span>
                        <span className="text-sm font-medium">{(plan.planningData.resectionMargins.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-3">Reconstruction Options</h5>
                    <div className="space-y-2">
                      {plan.planningData.reconstructionOptions.map((option, i) => (
                        <div key={i} className="border rounded p-2">
                          <h6 className="text-sm font-medium">{option.method}</h6>
                          <div className="grid grid-cols-3 gap-2 mt-1 text-xs">
                            <div className="text-center">
                              <p className="text-gray-600">Feasibility</p>
                              <p>{(option.feasibility * 100).toFixed(0)}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600">Function</p>
                              <p>{(option.functionalOutcome * 100).toFixed(0)}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600">Cosmetic</p>
                              <p>{(option.cosmeticOutcome * 100).toFixed(0)}%</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-3">Intraoperative Guidance</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Real-time Tracking</p>
                      <p className="text-lg font-bold text-green-600">
                        {plan.intraoperativeGuidance.realTimeTracking ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Augmented Reality</p>
                      <p className="text-lg font-bold text-blue-600">
                        {plan.intraoperativeGuidance.augmentedReality ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Navigation Accuracy</p>
                      <p className="text-lg font-bold text-purple-600">
                        {(plan.intraoperativeGuidance.navigationAccuracy * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Safety Alerts</p>
                      <p className="text-lg font-bold text-yellow-600">
                        {plan.intraoperativeGuidance.safetyAlerts.length}
                      </p>
                    </div>
                  </div>

                  {plan.intraoperativeGuidance.safetyAlerts.length > 0 && (
                    <div className="mt-4">
                      <h6 className="text-sm font-medium mb-2">Active Safety Alerts</h6>
                      <div className="space-y-1">
                        {plan.intraoperativeGuidance.safetyAlerts.map((alert, i) => (
                          <div key={i} className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                            {alert}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );

  const renderCollaboration = () => (
    <div className="space-y-6">
      {collaboration.map((session) => (
        <div key={session.id} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Active Participants</p>
                    <p className="text-2xl font-bold">{session.participants.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Shared Viewpoint</p>
                    <p className="text-2xl font-bold">Synchronized</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Voice Chat</p>
                    <p className="text-2xl font-bold">
                      {session.communication.voiceChat ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">Annotations</p>
                    <p className="text-2xl font-bold">
                      {session.participants.reduce((sum, p) => sum + p.annotations.length, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Collaborative Viewing Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h5 className="font-medium mb-3">Session Participants</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {session.participants.map((participant) => (
                      <div key={participant.userId} className="border rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h6 className="font-medium">{participant.userId}</h6>
                            <p className="text-sm text-gray-600">{participant.role}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {participant.permissions.map((permission, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-sm">
                          <p className="text-gray-600">Viewpoint:</p>
                          <p>Position: ({participant.viewpoint.position.x}, {participant.viewpoint.position.y}, {participant.viewpoint.position.z})</p>
                          <p>Orientation: ({participant.viewpoint.orientation.x}°, {participant.viewpoint.orientation.y}°, {participant.viewpoint.orientation.z}°)</p>
                        </div>

                        {participant.annotations.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Annotations: {participant.annotations.length}</p>
                            {participant.annotations.slice(0, 2).map((annotation, i) => (
                              <div key={i} className="text-xs bg-gray-50 rounded p-2 mt-1">
                                <span className="font-medium capitalize">{annotation.type}:</span> {annotation.content}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium mb-3">Shared State</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Current Timepoint</span>
                        <span className="text-sm font-medium">{session.sharedState.currentTimepoint}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Active Layer</span>
                        <span className="text-sm font-medium capitalize">{session.sharedState.activeLayer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Zoom Level</span>
                        <span className="text-sm font-medium">{session.sharedState.zoom.toFixed(1)}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Focus Point</span>
                        <span className="text-sm font-medium">
                          ({session.sharedState.focusPoint.x}, {session.sharedState.focusPoint.y}, {session.sharedState.focusPoint.z})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-3">Communication Tools</h5>
                    <div className="space-y-2">
                      {Object.entries(session.communication).map(([tool, active]) => (
                        <div key={tool} className="flex justify-between items-center">
                          <span className="text-sm capitalize">{tool.replace(/([A-Z])/g, ' $1')}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {session.decisionMaking.votingActive && (
                  <div>
                    <h5 className="font-medium mb-3">Decision Making</h5>
                    <div className="space-y-3">
                      {session.decisionMaking.proposals.map((proposal, i) => (
                        <div key={i} className="border rounded p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h6 className="font-medium">{proposal.proposal}</h6>
                              <p className="text-sm text-gray-600">Proposed by: {proposal.proposer}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              proposal.status === 'approved' ? 'bg-green-100 text-green-800' :
                              proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {proposal.status}
                            </span>
                          </div>
                          
                          <div>
                            <h6 className="text-sm font-medium mb-1">Votes:</h6>
                            <div className="flex space-x-4">
                              {Object.entries(proposal.votes).map(([voter, vote]) => (
                                <span key={voter} className="text-sm">
                                  {voter}: <span className={`font-medium ${
                                    vote === 'approve' ? 'text-green-600' :
                                    vote === 'reject' ? 'text-red-600' :
                                    'text-gray-600'
                                  }`}>{vote}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-indigo-600 rounded-lg">
          <Box className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Multidimensional Patient Hologram Visualization</h1>
          <p className="text-gray-600">Revolutionary 3D holographic patient representation with real-time physiological state visualization</p>
        </div>
      </div>

      <div className="flex space-x-4 border-b">
        {[
          { id: 'hologram', label: '3D Hologram', icon: Box },
          { id: 'analytics', label: 'Holographic Analytics', icon: Brain },
          { id: 'surgical', label: 'Surgical Planning', icon: Activity },
          { id: 'collaboration', label: 'Collaborative Viewing', icon: Users },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'hologram' && renderHologram()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'surgical' && renderSurgical()}
        {activeTab === 'collaboration' && renderCollaboration()}
      </div>
    </div>
  );
};

export default MultidimensionalPatientHologram;