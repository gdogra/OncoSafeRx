import React, { useState, useEffect, useRef } from 'react';
import { 
  Glasses, 
  Camera, 
  Layers, 
  Target,
  Eye,
  Brain,
  Zap,
  Activity,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Maximize,
  Minimize,
  Move3D,
  Rotate3D,
  Scan,
  ScanLine,
  Focus,
  Grid,
  Ruler,
  Crosshair,
  Navigation,
  Compass,
  MapPin,
  Gauge,
  Monitor,
  Smartphone,
  Tablet,
  Gamepad2,
  Headphones,
  Mic,
  Volume2,
  VolumeX,
  Wifi,
  Bluetooth,
  Battery,
  Signal,
  Download,
  Upload,
  Share2,
  Save,
  FileText,
  Image,
  Video,
  Lock,
  Unlock,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  User,
  Users,
  Search,
  Filter,
  Bell,
  Star,
  Heart,
  Bookmark,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  X
} from 'lucide-react';

interface AR3DModel {
  id: string;
  type: 'organ' | 'tumor' | 'surgical_tool' | 'radiation_beam' | 'anatomy';
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  opacity: number;
  visible: boolean;
  interactive: boolean;
  metadata: {
    volume: number;
    density: number;
    material: string;
    healthStatus: 'normal' | 'abnormal' | 'cancerous' | 'at_risk';
  };
}

interface TreatmentPlan {
  id: string;
  patientId: string;
  name: string;
  type: 'surgery' | 'radiation' | 'chemotherapy' | 'immunotherapy' | 'combination';
  status: 'planning' | 'approved' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  phases: Array<{
    id: string;
    name: string;
    duration: number;
    startDate: string;
    interventions: Array<{
      type: string;
      target: string;
      parameters: { [key: string]: any };
      expectedOutcome: string;
    }>;
  }>;
  arVisualization: {
    models: AR3DModel[];
    annotations: Array<{
      id: string;
      position: [number, number, number];
      text: string;
      type: 'info' | 'warning' | 'measurement' | 'instruction';
    }>;
    trajectories: Array<{
      id: string;
      points: [number, number, number][];
      type: 'surgical_path' | 'radiation_beam' | 'catheter_route';
      color: string;
    }>;
  };
  riskAssessment: {
    overall: number;
    surgical: number;
    radiation: number;
    complications: string[];
    mitigationStrategies: string[];
  };
}

interface ARSession {
  id: string;
  isActive: boolean;
  deviceType: 'hololens' | 'magic_leap' | 'arkit' | 'arcore' | 'web_ar';
  trackingQuality: number;
  frameRate: number;
  latency: number;
  calibrationStatus: 'calibrated' | 'calibrating' | 'needs_calibration';
  participants: Array<{
    id: string;
    name: string;
    role: 'surgeon' | 'oncologist' | 'radiologist' | 'student' | 'observer';
    isPresent: boolean;
  }>;
}

interface SurgicalGuidance {
  id: string;
  phase: string;
  currentStep: number;
  totalSteps: number;
  instructions: string[];
  warnings: string[];
  nextActions: string[];
  visualCues: Array<{
    type: 'highlight' | 'outline' | 'arrow' | 'measurement';
    target: string;
    color: string;
    animation: 'pulse' | 'blink' | 'rotate' | 'none';
  }>;
  realTimeMetrics: {
    precision: number;
    safety: number;
    progress: number;
    timeElapsed: number;
    estimatedRemaining: number;
  };
}

const AugmentedRealityTreatmentPlanning: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [arSession, setArSession] = useState<ARSession | null>(null);
  const [surgicalGuidance, setSurgicalGuidance] = useState<SurgicalGuidance | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [viewMode, setViewMode] = useState<'3d' | 'ar' | 'mixed'>('3d');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const arCanvasRef = useRef<HTMLCanvasElement>(null);
  const planningCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const { isDemoMode } = require('../../utils/demoMode');
    if (isDemoMode()) {
      generateMockARData();
    } else {
      setTreatmentPlans([]);
      setArSession(null);
      setSurgicalGuidance(null);
    }
    if (arCanvasRef.current) {
      renderARScene();
    }
    if (planningCanvasRef.current) {
      renderPlanningVisualization();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isARActive && arSession) {
      interval = setInterval(() => {
        updateARSession();
        if (arCanvasRef.current) {
          renderARScene();
        }
      }, 33); // ~30 FPS
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isARActive, arSession]);

  const generateMockARData = () => {
    const mockPlans: TreatmentPlan[] = [
      {
        id: 'tp001',
        patientId: 'patient123',
        name: 'Robotic-Assisted Lung Tumor Resection',
        type: 'surgery',
        status: 'planning',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        phases: [
          {
            id: 'phase1',
            name: 'Pre-operative Planning',
            duration: 120,
            startDate: new Date().toISOString(),
            interventions: [
              {
                type: 'CT-guided Planning',
                target: 'Left Upper Lobe',
                parameters: { slice_thickness: 1, contrast: true },
                expectedOutcome: 'Precise tumor localization'
              }
            ]
          },
          {
            id: 'phase2',
            name: 'Minimally Invasive Resection',
            duration: 180,
            startDate: new Date(Date.now() + 86400000).toISOString(),
            interventions: [
              {
                type: 'VATS Lobectomy',
                target: 'Left Upper Lobe Tumor',
                parameters: { approach: 'anterior', ports: 3 },
                expectedOutcome: 'Complete tumor removal with margin'
              }
            ]
          }
        ],
        arVisualization: {
          models: [
            {
              id: 'lung_left',
              type: 'organ',
              name: 'Left Lung',
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              scale: [1, 1, 1],
              color: '#ec4899',
              opacity: 0.7,
              visible: true,
              interactive: true,
              metadata: {
                volume: 2800,
                density: 0.25,
                material: 'lung_tissue',
                healthStatus: 'abnormal'
              }
            },
            {
              id: 'tumor_primary',
              type: 'tumor',
              name: 'Primary Tumor',
              position: [-0.3, 0.2, 0.1],
              rotation: [0, 0, 0],
              scale: [0.8, 0.8, 0.8],
              color: '#dc2626',
              opacity: 0.9,
              visible: true,
              interactive: true,
              metadata: {
                volume: 15.7,
                density: 1.2,
                material: 'malignant_tissue',
                healthStatus: 'cancerous'
              }
            },
            {
              id: 'surgical_path',
              type: 'surgical_tool',
              name: 'Planned Incision Path',
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              scale: [1, 1, 1],
              color: '#10b981',
              opacity: 0.8,
              visible: true,
              interactive: false,
              metadata: {
                volume: 0,
                density: 0,
                material: 'virtual',
                healthStatus: 'normal'
              }
            }
          ],
          annotations: [
            {
              id: 'ann1',
              position: [-0.3, 0.2, 0.1],
              text: 'Primary tumor: 15.7cm³',
              type: 'info'
            },
            {
              id: 'ann2',
              position: [-0.1, 0.3, 0.2],
              text: 'Safe margin: 2cm',
              type: 'measurement'
            },
            {
              id: 'ann3',
              position: [0.2, 0.1, -0.1],
              text: 'Critical: Avoid major vessels',
              type: 'warning'
            }
          ],
          trajectories: [
            {
              id: 'traj1',
              points: [
                [0.5, 0, 0],
                [0.2, 0.1, 0.1],
                [-0.3, 0.2, 0.1]
              ],
              type: 'surgical_path',
              color: '#10b981'
            }
          ]
        },
        riskAssessment: {
          overall: 0.23,
          surgical: 0.18,
          radiation: 0,
          complications: ['bleeding', 'pneumothorax', 'infection'],
          mitigationStrategies: [
            'Pre-operative imaging review',
            'Experienced surgical team',
            'Real-time AR guidance'
          ]
        }
      }
    ];

    const mockSession: ARSession = {
      id: 'session001',
      isActive: false,
      deviceType: 'hololens',
      trackingQuality: 0.95,
      frameRate: 60,
      latency: 12,
      calibrationStatus: 'calibrated',
      participants: [
        {
          id: 'user1',
          name: 'Dr. Sarah Chen',
          role: 'surgeon',
          isPresent: true
        },
        {
          id: 'user2',
          name: 'Dr. Michael Rodriguez',
          role: 'oncologist',
          isPresent: true
        },
        {
          id: 'user3',
          name: 'Dr. Emily Zhang',
          role: 'radiologist',
          isPresent: false
        }
      ]
    };

    const mockGuidance: SurgicalGuidance = {
      id: 'guidance001',
      phase: 'Tumor Localization',
      currentStep: 3,
      totalSteps: 8,
      instructions: [
        'Position endoscope at 45-degree angle',
        'Identify anatomical landmarks',
        'Confirm tumor location using AR overlay'
      ],
      warnings: [
        'Maintain safe distance from pulmonary artery',
        'Monitor for bleeding at incision site'
      ],
      nextActions: [
        'Begin dissection along planned trajectory',
        'Activate real-time navigation system'
      ],
      visualCues: [
        {
          type: 'highlight',
          target: 'tumor_primary',
          color: '#dc2626',
          animation: 'pulse'
        },
        {
          type: 'arrow',
          target: 'surgical_path',
          color: '#10b981',
          animation: 'none'
        }
      ],
      realTimeMetrics: {
        precision: 0.94,
        safety: 0.89,
        progress: 0.375,
        timeElapsed: 45,
        estimatedRemaining: 75
      }
    };

    setTreatmentPlans(mockPlans);
    setArSession(mockSession);
    setSurgicalGuidance(mockGuidance);
  };

  const updateARSession = () => {
    if (arSession) {
      setArSession(prev => prev ? {
        ...prev,
        trackingQuality: 0.9 + Math.random() * 0.1,
        frameRate: 58 + Math.random() * 4,
        latency: 10 + Math.random() * 5
      } : null);
    }

    if (surgicalGuidance) {
      setSurgicalGuidance(prev => prev ? {
        ...prev,
        realTimeMetrics: {
          ...prev.realTimeMetrics,
          precision: 0.9 + Math.random() * 0.1,
          safety: 0.85 + Math.random() * 0.15,
          timeElapsed: prev.realTimeMetrics.timeElapsed + 1
        }
      } : null);
    }
  };

  const renderARScene = () => {
    const canvas = arCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 400;

    // Fill background with AR-style dark overlay
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add AR grid pattern
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1;
    const gridSize = 20;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const time = Date.now() * 0.001;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw 3D lung model (simplified)
    const lungWidth = 120;
    const lungHeight = 180;
    const lungX = centerX - lungWidth / 2;
    const lungY = centerY - lungHeight / 2;

    // Draw lung outline
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(lungX + lungWidth / 2, lungY + lungHeight / 2, lungWidth / 2, lungHeight / 2, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Fill lung with semi-transparent color
    ctx.fillStyle = '#ec489944';
    ctx.fill();

    // Draw tumor as pulsing red sphere
    const tumorX = lungX + lungWidth * 0.3;
    const tumorY = lungY + lungHeight * 0.4;
    const tumorSize = 15 + Math.sin(time * 3) * 3;

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(tumorX, tumorY, tumorSize, 0, Math.PI * 2);
    ctx.fill();

    // Draw surgical path
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(centerX + 200, centerY);
    ctx.lineTo(centerX + 100, centerY - 20);
    ctx.lineTo(tumorX, tumorY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw AR annotations
    const annotations = [
      { x: tumorX, y: tumorY - 40, text: 'Primary Tumor', color: '#dc2626' },
      { x: tumorX + 50, y: tumorY - 20, text: '15.7 cm³', color: '#ffffff' },
      { x: centerX + 150, y: centerY - 40, text: 'Planned Path', color: '#10b981' }
    ];

    annotations.forEach(ann => {
      // Draw annotation background
      ctx.fillStyle = '#00000088';
      const textWidth = ctx.measureText(ann.text).width;
      ctx.fillRect(ann.x - textWidth / 2 - 5, ann.y - 15, textWidth + 10, 20);

      // Draw annotation text
      ctx.fillStyle = ann.color;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ann.text, ann.x, ann.y);

      // Draw connecting line
      ctx.strokeStyle = ann.color + '88';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ann.x, ann.y + 5);
      ctx.lineTo(ann.x, ann.y + 20);
      ctx.stroke();
    });

    // Draw AR UI elements
    if (isARActive) {
      // Draw tracking status
      ctx.fillStyle = '#10b981';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('AR TRACKING: ACTIVE', 20, 30);
      ctx.fillText(`QUALITY: ${((arSession?.trackingQuality || 0) * 100).toFixed(0)}%`, 20, 50);
      ctx.fillText(`FPS: ${arSession?.frameRate.toFixed(0) || 0}`, 20, 70);

      // Draw crosshair
      ctx.strokeStyle = '#ffffff88';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 20, centerY);
      ctx.lineTo(centerX + 20, centerY);
      ctx.moveTo(centerX, centerY - 20);
      ctx.lineTo(centerX, centerY + 20);
      ctx.stroke();

      // Draw progress indicators if in surgical mode
      if (surgicalGuidance) {
        const progressWidth = 200;
        const progressX = canvas.width - progressWidth - 20;
        const progressY = 20;

        ctx.fillStyle = '#374151';
        ctx.fillRect(progressX, progressY, progressWidth, 8);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(progressX, progressY, progressWidth * surgicalGuidance.realTimeMetrics.progress, 8);

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`Step ${surgicalGuidance.currentStep}/${surgicalGuidance.totalSteps}`, canvas.width - 20, progressY + 25);
      }
    }
  };

  const renderPlanningVisualization = () => {
    const canvas = planningCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 500;
    canvas.height = 300;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw planning timeline
    const timelineY = 150;
    const timelineWidth = 400;
    const timelineX = 50;

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(timelineX, timelineY);
    ctx.lineTo(timelineX + timelineWidth, timelineY);
    ctx.stroke();

    // Draw timeline phases
    if (treatmentPlans.length > 0) {
      const plan = treatmentPlans[0];
      const totalDuration = plan.phases.reduce((sum, phase) => sum + phase.duration, 0);
      let currentX = timelineX;

      plan.phases.forEach((phase, index) => {
        const phaseWidth = (phase.duration / totalDuration) * timelineWidth;
        const phaseColor = index === 0 ? '#3b82f6' : '#10b981';

        // Draw phase bar
        ctx.fillStyle = phaseColor + '44';
        ctx.fillRect(currentX, timelineY - 20, phaseWidth, 40);
        
        ctx.strokeStyle = phaseColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(currentX, timelineY - 20, phaseWidth, 40);

        // Draw phase label
        ctx.fillStyle = '#1f2937';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(phase.name, currentX + phaseWidth / 2, timelineY - 30);
        ctx.fillText(`${phase.duration}min`, currentX + phaseWidth / 2, timelineY + 35);

        currentX += phaseWidth;
      });
    }

    // Draw risk assessment chart
    const chartX = 50;
    const chartY = 50;
    const chartWidth = 150;
    const chartHeight = 80;

    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(chartX, chartY, chartWidth, chartHeight);
    ctx.strokeStyle = '#64748b';
    ctx.strokeRect(chartX, chartY, chartWidth, chartHeight);

    if (treatmentPlans.length > 0) {
      const risks = [
        { label: 'Overall', value: treatmentPlans[0].riskAssessment.overall, color: '#ef4444' },
        { label: 'Surgical', value: treatmentPlans[0].riskAssessment.surgical, color: '#f59e0b' }
      ];

      risks.forEach((risk, index) => {
        const barY = chartY + 20 + index * 25;
        const barWidth = (risk.value * (chartWidth - 80));

        ctx.fillStyle = risk.color + '66';
        ctx.fillRect(chartX + 60, barY, barWidth, 15);

        ctx.fillStyle = '#1f2937';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(risk.label, chartX + 5, barY + 12);
        ctx.textAlign = 'right';
        ctx.fillText(`${(risk.value * 100).toFixed(0)}%`, chartX + chartWidth - 5, barY + 12);
      });
    }

    // Draw 3D model preview
    const modelX = 300;
    const modelY = 50;
    const modelSize = 80;

    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(modelX, modelY, modelSize, modelSize);
    ctx.strokeStyle = '#64748b';
    ctx.strokeRect(modelX, modelY, modelSize, modelSize);

    // Simple 3D lung representation
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.ellipse(modelX + modelSize / 2, modelY + modelSize / 2, 30, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tumor dot
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(modelX + modelSize / 2 - 10, modelY + modelSize / 2 - 8, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1f2937';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('3D Model Preview', modelX + modelSize / 2, modelY + modelSize + 15);
  };

  const toggleARSession = () => {
    setIsARActive(prev => {
      const newState = !prev;
      if (arSession) {
        setArSession(prev => prev ? { ...prev, isActive: newState } : null);
      }
      return newState;
    });
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Glasses className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AR Session</h3>
                <p className="text-sm text-gray-600">Status</p>
              </div>
            </div>
            <span className={`text-2xl font-bold ${isARActive ? 'text-green-600' : 'text-gray-400'}`}>
              {isARActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          <div className={`flex items-center space-x-2 ${
            isARActive ? 'text-green-600' : 'text-gray-500'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isARActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
            <span className="text-sm font-medium">
              {isARActive ? 'Real-time tracking' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tracking Quality</h3>
                <p className="text-sm text-gray-600">AR precision</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {((arSession?.trackingQuality || 0) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(arSession?.trackingQuality || 0) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Participants</h3>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {arSession?.participants.filter(p => p.isPresent).length || 0}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Treatment Plans</h3>
                <p className="text-sm text-gray-600">Available</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-orange-600">{treatmentPlans.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Camera className="h-5 w-5 text-blue-500" />
              <span>AR Treatment Visualization</span>
            </h3>
            <div className="flex items-center space-x-2">
              <select 
                value={viewMode} 
                onChange={(e) => setViewMode(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="3d">3D View</option>
                <option value="ar">AR View</option>
                <option value="mixed">Mixed Reality</option>
              </select>
              <button
                onClick={toggleARSession}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isARActive 
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isARActive ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span>Stop AR</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Start AR</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            <canvas
              ref={arCanvasRef}
              className="border border-gray-300 rounded-lg bg-black"
            />
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Interactive 3D visualization with real-time AR tracking and surgical guidance
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Layers className="h-5 w-5 text-purple-500" />
            <span>Treatment Planning Dashboard</span>
          </h3>
          <div className="flex justify-center">
            <canvas
              ref={planningCanvasRef}
              className="border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
        </div>
      </div>

      {arSession && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Monitor className="h-5 w-5 text-green-500" />
            <span>AR Session Monitoring</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Frame Rate:</span>
                  <span className="font-medium">{arSession.frameRate.toFixed(0)} FPS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Latency:</span>
                  <span className="font-medium">{arSession.latency.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Device:</span>
                  <span className="font-medium capitalize">{arSession.deviceType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Calibration:</span>
                  <span className={`font-medium capitalize ${
                    arSession.calibrationStatus === 'calibrated' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {arSession.calibrationStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Active Participants</h4>
              <div className="space-y-2">
                {arSession.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        participant.isPresent ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <span className="font-medium">{participant.name}</span>
                    </div>
                    <span className="text-gray-600 capitalize">{participant.role}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">AR Controls</h4>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium hover:bg-purple-200">
                  <Settings className="h-4 w-4 inline mr-2" />
                  Calibrate Tracking
                </button>
                <button className="w-full px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-200">
                  <Save className="h-4 w-4 inline mr-2" />
                  Save Session
                </button>
                <button className="w-full px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200">
                  <Share2 className="h-4 w-4 inline mr-2" />
                  Share View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTreatmentPlans = () => (
    <div className="space-y-6">
      {treatmentPlans.map((plan) => (
        <div key={plan.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span>{plan.name}</span>
            </h3>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                plan.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                plan.status === 'approved' ? 'bg-green-100 text-green-800' :
                plan.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {plan.status.replace('_', ' ').toUpperCase()}
              </span>
              <button
                onClick={() => setSelectedPlan(plan.id === selectedPlan ? null : plan.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {selectedPlan === plan.id ? 'Hide Details' : 'View in AR'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Treatment Type</h4>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1 capitalize">
                  {plan.type}
                </div>
                <div className="text-sm text-gray-600">
                  {plan.phases.length} phases planned
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Risk Assessment</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Overall Risk:</span>
                  <span className={`font-medium ${
                    plan.riskAssessment.overall < 0.3 ? 'text-green-600' :
                    plan.riskAssessment.overall < 0.6 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {(plan.riskAssessment.overall * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Surgical Risk:</span>
                  <span className={`font-medium ${
                    plan.riskAssessment.surgical < 0.3 ? 'text-green-600' :
                    plan.riskAssessment.surgical < 0.6 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {(plan.riskAssessment.surgical * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">AR Models</h4>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {plan.arVisualization.models.length}
                </div>
                <div className="text-sm text-gray-600">3D models loaded</div>
                <div className="text-xs text-green-600 mt-1">
                  {plan.arVisualization.annotations.length} annotations
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Treatment Phases</h4>
              <div className="space-y-3">
                {plan.phases.map((phase, idx) => (
                  <div key={phase.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{phase.name}</span>
                      <span className="text-sm text-gray-600">{phase.duration} min</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {phase.interventions.length} intervention(s) planned
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Start: {new Date(phase.startDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">AR Visualization Components</h4>
              <div className="space-y-2">
                {plan.arVisualization.models.slice(0, 3).map((model) => (
                  <div 
                    key={model.id} 
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: model.color }}
                      />
                      <span className="text-sm font-medium">{model.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        model.visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {model.visible ? 'Visible' : 'Hidden'}
                      </span>
                      <button className="text-xs text-blue-600 hover:text-blue-800">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedPlan === plan.id && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-gray-900 mb-3">AR Session Ready</h4>
              <p className="text-sm text-gray-600 mb-4">
                This treatment plan is optimized for augmented reality visualization. 
                Start an AR session to view 3D models, surgical trajectories, and real-time guidance.
              </p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleARSession}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Glasses className="h-4 w-4" />
                  <span>Launch AR Session</span>
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
                  <Share2 className="h-4 w-4" />
                  <span>Share with Team</span>
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Save Configuration</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderSurgicalGuidance = () => (
    <div className="space-y-6">
      {surgicalGuidance && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Navigation className="h-5 w-5 text-green-500" />
              <span>Real-Time Surgical Guidance</span>
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Phase: {surgicalGuidance.phase}
              </span>
              <div className="text-lg font-bold text-green-600">
                {surgicalGuidance.currentStep}/{surgicalGuidance.totalSteps}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(surgicalGuidance.realTimeMetrics.precision * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Precision</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(surgicalGuidance.realTimeMetrics.safety * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Safety Score</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(surgicalGuidance.realTimeMetrics.progress * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {surgicalGuidance.realTimeMetrics.estimatedRemaining}
                </div>
                <div className="text-sm text-gray-600">Min Remaining</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span>Current Instructions</span>
              </h4>
              <div className="space-y-2">
                {surgicalGuidance.instructions.map((instruction, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{instruction}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span>Active Warnings</span>
              </h4>
              <div className="space-y-2">
                {surgicalGuidance.warnings.map((warning, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{warning}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-500" />
                <span>Next Actions</span>
              </h4>
              <div className="space-y-2">
                {surgicalGuidance.nextActions.map((action, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Visual Guidance Cues</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {surgicalGuidance.visualCues.map((cue, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: cue.color }}
                    />
                    <span className="font-medium text-gray-900 capitalize">
                      {cue.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Target: {cue.target}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Settings className="h-5 w-5 text-purple-500" />
          <span>AR Guidance Controls</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Display Options</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Show anatomical labels</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Display measurements</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Show risk zones</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Real-time tracking</span>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Guidance Level</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="radio" name="guidance" value="basic" className="rounded" />
                <span className="text-sm">Basic guidance</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="guidance" value="advanced" defaultChecked className="rounded" />
                <span className="text-sm">Advanced guidance</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="guidance" value="expert" className="rounded" />
                <span className="text-sm">Expert mode</span>
              </label>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Safety Features</h4>
            <div className="space-y-2">
              <button className="w-full px-3 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200">
                Emergency Stop
              </button>
              <button className="w-full px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-200">
                Pause Guidance
              </button>
              <button className="w-full px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200">
                Recalibrate System
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'AR Overview', icon: Eye },
    { id: 'plans', label: 'Treatment Plans', icon: FileText },
    { id: 'guidance', label: 'Surgical Guidance', icon: Navigation },
    { id: 'models', label: '3D Models', icon: Layers }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Glasses className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Augmented Reality Treatment Planning
            </h1>
            <p className="text-gray-600">
              Immersive 3D visualization and real-time surgical guidance
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
        {activeTab === 'plans' && renderTreatmentPlans()}
        {activeTab === 'guidance' && renderSurgicalGuidance()}
        {activeTab === 'models' && renderOverview()} {/* Reuse overview for models tab */}
      </div>
    </div>
  );
};

export default AugmentedRealityTreatmentPlanning;
