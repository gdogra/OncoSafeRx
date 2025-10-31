import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Zap, 
  Activity, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Waves,
  Eye,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Download,
  Share2,
  Bell,
  Cpu,
  Smartphone,
  Wifi,
  Battery,
  Signal,
  MonitorSpeaker,
  Headphones,
  Bluetooth,
  Gauge,
  LineChart,
  BarChart3,
  PieChart,
  Radio,
  Microscope,
  FlaskConical,
  Sparkles,
  Shield,
  Lock,
  Unlock,
  Power,
  Pause as PauseIcon,
  Volume2,
  VolumeX,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus
} from 'lucide-react';

interface NeuralSignal {
  id: string;
  timestamp: string;
  type: 'EEG' | 'fMRI' | 'MEG' | 'ECoG' | 'LFP' | 'Single_Unit';
  frequency: number;
  amplitude: number;
  location: {
    region: string;
    coordinates: [number, number, number];
    hemisphere: 'left' | 'right' | 'bilateral';
  };
  significance: 'normal' | 'abnormal' | 'tumor_related' | 'treatment_response';
  correlations: {
    symptoms: string[];
    medications: string[];
    treatments: string[];
  };
}

interface BrainMapping {
  id: string;
  patientId: string;
  timestamp: string;
  regions: Array<{
    name: string;
    activity: number;
    tumorProximity: number;
    functionalStatus: 'normal' | 'impaired' | 'hyperactive' | 'silent';
    connectivity: number;
    plasticity: number;
  }>;
  networks: Array<{
    name: string;
    strength: number;
    efficiency: number;
    disruption: number;
  }>;
  biomarkers: {
    neurotransmitters: { [key: string]: number };
    proteins: { [key: string]: number };
    metabolites: { [key: string]: number };
  };
}

interface NeuralStimulation {
  id: string;
  timestamp: string;
  type: 'TMS' | 'DBS' | 'tDCS' | 'Optogenetics' | 'Ultrasound' | 'Magnetic';
  target: string;
  parameters: {
    frequency: number;
    intensity: number;
    duration: number;
    waveform: 'sine' | 'square' | 'sawtooth' | 'pulse';
  };
  response: {
    immediate: string;
    sustained: string;
    sideEffects: string[];
  };
  efficacy: number;
  safety: number;
}

interface CognitiveAssessment {
  id: string;
  timestamp: string;
  domains: {
    memory: { score: number; change: number };
    attention: { score: number; change: number };
    language: { score: number; change: number };
    executive: { score: number; change: number };
    visuospatial: { score: number; change: number };
    processing: { score: number; change: number };
  };
  overallScore: number;
  riskFactors: string[];
  recommendations: string[];
}

const NeuralInterfaceIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [neuralSignals, setNeuralSignals] = useState<NeuralSignal[]>([]);
  const [brainMapping, setBrainMapping] = useState<BrainMapping[]>([]);
  const [stimulationData, setStimulationData] = useState<NeuralStimulation[]>([]);
  const [cognitiveData, setCognitiveData] = useState<CognitiveAssessment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [batteryLevel, setBatteryLevel] = useState(87);
  const [signalQuality, setSignalQuality] = useState(0.92);
  const brainCanvasRef = useRef<HTMLCanvasElement>(null);
  const signalCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const isDemoMode = false; // Demo mode removed for production
    if (isDemoMode) {
      generateMockNeuralData();
    } else {
      setNeuralSignals([]);
      setBrainMapping([]);
      setStimulationData([]);
      setCognitiveData([]);
    }
    if (brainCanvasRef.current) {
      drawBrainVisualization();
    }
    if (signalCanvasRef.current) {
      drawSignalVisualization();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        generateRealTimeSignal();
        setBatteryLevel(prev => Math.max(prev - 0.1, 0));
        setSignalQuality(0.85 + Math.random() * 0.15);
        if (signalCanvasRef.current) {
          drawSignalVisualization();
        }
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const generateMockNeuralData = () => {
    const mockSignals: NeuralSignal[] = [
      {
        id: 'ns001',
        timestamp: new Date().toISOString(),
        type: 'EEG',
        frequency: 12.5,
        amplitude: 45.3,
        location: {
          region: 'Frontal Cortex',
          coordinates: [0.2, 0.8, 0.3],
          hemisphere: 'left'
        },
        significance: 'tumor_related',
        correlations: {
          symptoms: ['headache', 'cognitive decline'],
          medications: ['temozolomide'],
          treatments: ['radiation therapy']
        }
      },
      {
        id: 'ns002',
        timestamp: new Date().toISOString(),
        type: 'fMRI',
        frequency: 0.1,
        amplitude: 2.8,
        location: {
          region: 'Hippocampus',
          coordinates: [-0.3, 0.1, -0.2],
          hemisphere: 'bilateral'
        },
        significance: 'treatment_response',
        correlations: {
          symptoms: ['memory loss'],
          medications: ['bevacizumab'],
          treatments: ['immunotherapy']
        }
      }
    ];

    const mockMapping: BrainMapping = {
      id: 'bm001',
      patientId: 'patient123',
      timestamp: new Date().toISOString(),
      regions: [
        {
          name: 'Prefrontal Cortex',
          activity: 0.78,
          tumorProximity: 0.23,
          functionalStatus: 'normal',
          connectivity: 0.85,
          plasticity: 0.67
        },
        {
          name: 'Motor Cortex',
          activity: 0.92,
          tumorProximity: 0.78,
          functionalStatus: 'impaired',
          connectivity: 0.34,
          plasticity: 0.82
        },
        {
          name: 'Visual Cortex',
          activity: 0.65,
          tumorProximity: 0.12,
          functionalStatus: 'normal',
          connectivity: 0.91,
          plasticity: 0.45
        },
        {
          name: 'Temporal Lobe',
          activity: 0.43,
          tumorProximity: 0.89,
          functionalStatus: 'hyperactive',
          connectivity: 0.28,
          plasticity: 0.73
        }
      ],
      networks: [
        {
          name: 'Default Mode Network',
          strength: 0.74,
          efficiency: 0.68,
          disruption: 0.32
        },
        {
          name: 'Executive Control Network',
          strength: 0.56,
          efficiency: 0.42,
          disruption: 0.58
        }
      ],
      biomarkers: {
        neurotransmitters: {
          'dopamine': 2.3,
          'serotonin': 1.8,
          'GABA': 4.2,
          'glutamate': 12.7
        },
        proteins: {
          'tau': 0.8,
          'amyloid': 0.3,
          'neurofilament': 1.2
        },
        metabolites: {
          'lactate': 1.4,
          'NAA': 8.2,
          'choline': 2.1
        }
      }
    };

    const mockStimulation: NeuralStimulation[] = [
      {
        id: 'st001',
        timestamp: new Date().toISOString(),
        type: 'TMS',
        target: 'Motor Cortex',
        parameters: {
          frequency: 20,
          intensity: 110,
          duration: 300,
          waveform: 'pulse'
        },
        response: {
          immediate: 'Improved motor function',
          sustained: 'Lasting 4 hours',
          sideEffects: ['mild headache']
        },
        efficacy: 0.73,
        safety: 0.95
      }
    ];

    const mockCognitive: CognitiveAssessment = {
      id: 'ca001',
      timestamp: new Date().toISOString(),
      domains: {
        memory: { score: 78, change: -5 },
        attention: { score: 85, change: 2 },
        language: { score: 92, change: -1 },
        executive: { score: 71, change: -8 },
        visuospatial: { score: 88, change: 3 },
        processing: { score: 83, change: -2 }
      },
      overallScore: 82,
      riskFactors: ['tumor location', 'treatment effects'],
      recommendations: ['cognitive rehabilitation', 'neural stimulation']
    };

    setNeuralSignals(mockSignals);
    setBrainMapping([mockMapping]);
    setStimulationData(mockStimulation);
    setCognitiveData([mockCognitive]);
  };

  const generateRealTimeSignal = () => {
    if (Math.random() > 0.8) {
      const newSignal: NeuralSignal = {
        id: `ns_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: ['EEG', 'fMRI', 'MEG'][Math.floor(Math.random() * 3)] as any,
        frequency: Math.random() * 100,
        amplitude: Math.random() * 100,
        location: {
          region: ['Frontal', 'Parietal', 'Temporal', 'Occipital'][Math.floor(Math.random() * 4)] + ' Cortex',
          coordinates: [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
          hemisphere: Math.random() > 0.5 ? 'left' : 'right'
        },
        significance: ['normal', 'abnormal', 'tumor_related'][Math.floor(Math.random() * 3)] as any,
        correlations: {
          symptoms: [],
          medications: [],
          treatments: []
        }
      };

      setNeuralSignals(prev => [newSignal, ...prev.slice(0, 99)]);
    }
  };

  const drawBrainVisualization = () => {
    const canvas = brainCanvasRef.current;
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

    // Draw brain outline
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 180, 140, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Draw brain regions with activity
    const regions = [
      { name: 'Frontal', x: centerX - 80, y: centerY - 60, activity: 0.78, color: '#ef4444' },
      { name: 'Parietal', x: centerX, y: centerY - 80, activity: 0.65, color: '#3b82f6' },
      { name: 'Temporal', x: centerX - 120, y: centerY + 20, activity: 0.43, color: '#10b981' },
      { name: 'Occipital', x: centerX + 80, y: centerY - 20, activity: 0.92, color: '#f59e0b' },
      { name: 'Motor', x: centerX - 40, y: centerY - 40, activity: 0.89, color: '#8b5cf6' },
      { name: 'Visual', x: centerX + 60, y: centerY + 40, activity: 0.56, color: '#ec4899' }
    ];

    regions.forEach((region, index) => {
      const pulseSize = 15 + Math.sin(time + index) * 5 * region.activity;
      
      const gradient = ctx.createRadialGradient(
        region.x, region.y, 0,
        region.x, region.y, pulseSize
      );
      gradient.addColorStop(0, region.color + 'CC');
      gradient.addColorStop(0.7, region.color + '66');
      gradient.addColorStop(1, region.color + '00');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(region.x, region.y, pulseSize, 0, Math.PI * 2);
      ctx.fill();

      // Draw region label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(region.name, region.x, region.y + pulseSize + 15);
    });

    // Draw neural connections
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    for (let i = 0; i < regions.length; i++) {
      for (let j = i + 1; j < regions.length; j++) {
        const r1 = regions[i];
        const r2 = regions[j];
        const distance = Math.sqrt((r1.x - r2.x) ** 2 + (r1.y - r2.y) ** 2);
        if (distance < 150 && Math.random() > 0.3) {
          ctx.globalAlpha = 0.3 + (r1.activity + r2.activity) * 0.35;
          ctx.beginPath();
          ctx.moveTo(r1.x, r1.y);
          ctx.lineTo(r2.x, r2.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    // Draw tumor location if applicable
    if (brainMapping[0]?.regions.some(r => r.tumorProximity > 0.5)) {
      const tumorRegion = brainMapping[0].regions.find(r => r.tumorProximity > 0.5);
      if (tumorRegion) {
        const tumorRegionViz = regions.find(r => r.name.includes(tumorRegion.name.split(' ')[0]));
        if (tumorRegionViz) {
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(tumorRegionViz.x, tumorRegionViz.y, 25, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }
  };

  const drawSignalVisualization = () => {
    const canvas = signalCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 300;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const time = Date.now() * 0.005;
    const channels = 8;
    const channelHeight = canvas.height / channels;

    // Draw EEG-like signals
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;

    for (let channel = 0; channel < channels; channel++) {
      const baseY = (channel + 0.5) * channelHeight;
      
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += 2) {
        const frequency = 8 + channel * 2; // Different frequencies per channel
        const amplitude = 20 + Math.sin(time * 0.1 + channel) * 10;
        const noise = (Math.random() - 0.5) * 5;
        const y = baseY + Math.sin((x + time * 50) * frequency * 0.01) * amplitude + noise;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Channel labels
      ctx.fillStyle = '#64748b';
      ctx.font = '12px monospace';
      ctx.fillText(`CH${channel + 1}`, 10, baseY - channelHeight / 2 + 15);
    }

    // Draw frequency spectrum overlay
    ctx.fillStyle = '#3b82f6';
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 50; i++) {
      const frequency = i * 2;
      const amplitude = Math.random() * 50 + 10;
      const x = canvas.width - 100 + i;
      const barHeight = amplitude;
      ctx.fillRect(x, canvas.height - barHeight, 1, barHeight);
    }
    ctx.globalAlpha = 1;

    // Add real-time indicators
    ctx.fillStyle = '#ef4444';
    if (isRecording) {
      ctx.beginPath();
      ctx.arc(canvas.width - 30, 30, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Quality: ${(signalQuality * 100).toFixed(0)}%`, canvas.width - 120, 20);
    ctx.fillText(`Battery: ${batteryLevel.toFixed(0)}%`, canvas.width - 120, 40);
  };

  const toggleRecording = () => {
    setIsRecording(prev => !prev);
    if (!isRecording) {
      setConnectionStatus('connecting');
      setTimeout(() => setConnectionStatus('connected'), 1000);
    } else {
      setConnectionStatus('disconnected');
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Neural Signals</h3>
                <p className="text-sm text-gray-600">Active channels</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-600">{neuralSignals.length}</span>
          </div>
          <div className={`flex items-center space-x-2 ${
            connectionStatus === 'connected' ? 'text-green-600' : 
            connectionStatus === 'connecting' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium capitalize">{connectionStatus}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Signal Quality</h3>
                <p className="text-sm text-gray-600">Current</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {(signalQuality * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${signalQuality * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Battery className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Battery</h3>
                <p className="text-sm text-gray-600">Device power</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-green-600">{batteryLevel.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                batteryLevel > 50 ? 'bg-green-500' : 
                batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${batteryLevel}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Stimulations</h3>
                <p className="text-sm text-gray-600">Today</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-orange-600">{stimulationData.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <span>Brain Activity Mapping</span>
            </h3>
            <button
              onClick={toggleRecording}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isRecording ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Record</span>
                </>
              )}
            </button>
          </div>
          <div className="flex justify-center">
            <canvas
              ref={brainCanvasRef}
              className="border border-gray-300 rounded-lg bg-slate-900"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Waves className="h-5 w-5 text-green-500" />
            <span>Real-Time Neural Signals</span>
          </h3>
          <div className="flex justify-center">
            <canvas
              ref={signalCanvasRef}
              className="border border-gray-300 rounded-lg bg-slate-900"
            />
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Multi-channel neural activity monitoring with real-time analysis
          </div>
        </div>
      </div>

      {cognitiveData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <span>Cognitive Function Assessment</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(cognitiveData[0].domains).map(([domain, data]) => (
              <div key={domain} className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {data.score}
                </div>
                <div className="text-sm font-medium text-gray-900 capitalize mb-1">
                  {domain}
                </div>
                <div className={`text-xs flex items-center justify-center space-x-1 ${
                  data.change > 0 ? 'text-green-600' : 
                  data.change < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {data.change > 0 ? <ArrowUp className="h-3 w-3" /> : 
                   data.change < 0 ? <ArrowDown className="h-3 w-3" /> : 
                   <Minus className="h-3 w-3" />}
                  <span>{Math.abs(data.change)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderBrainMapping = () => (
    <div className="space-y-6">
      {brainMapping.map((mapping) => (
        <div key={mapping.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-500" />
            <span>Functional Brain Mapping</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Brain Region Analysis</h4>
              <div className="space-y-3">
                {mapping.regions.map((region, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{region.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        region.functionalStatus === 'normal' ? 'bg-green-100 text-green-800' :
                        region.functionalStatus === 'impaired' ? 'bg-red-100 text-red-800' :
                        region.functionalStatus === 'hyperactive' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {region.functionalStatus}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Activity:</span>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${region.activity * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{(region.activity * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Connectivity:</span>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${region.connectivity * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{(region.connectivity * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tumor Proximity:</span>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${region.tumorProximity * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{(region.tumorProximity * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">Neural Networks</h4>
              <div className="space-y-3">
                {mapping.networks.map((network, idx) => (
                  <div key={idx} className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900">{network.name}</span>
                      <span className="text-sm text-purple-600 font-medium">
                        {(network.strength * 100).toFixed(0)}% strength
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Efficiency:</span>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${network.efficiency * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{(network.efficiency * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Disruption:</span>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${network.disruption * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{(network.disruption * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Neurotransmitters</h4>
              <div className="space-y-2 text-sm">
                {Object.entries(mapping.biomarkers.neurotransmitters).map(([nt, value]) => (
                  <div key={nt} className="flex justify-between items-center">
                    <span className="text-gray-600 capitalize">{nt}:</span>
                    <span className="font-medium">{value.toFixed(1)} μM</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Proteins</h4>
              <div className="space-y-2 text-sm">
                {Object.entries(mapping.biomarkers.proteins).map(([protein, value]) => (
                  <div key={protein} className="flex justify-between items-center">
                    <span className="text-gray-600">{protein}:</span>
                    <span className="font-medium">{value.toFixed(1)} ng/mL</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Metabolites</h4>
              <div className="space-y-2 text-sm">
                {Object.entries(mapping.biomarkers.metabolites).map(([metabolite, value]) => (
                  <div key={metabolite} className="flex justify-between items-center">
                    <span className="text-gray-600">{metabolite}:</span>
                    <span className="font-medium">{value.toFixed(1)} mM</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderNeuralStimulation = () => (
    <div className="space-y-6">
      {stimulationData.map((stimulation) => (
        <div key={stimulation.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span>Neural Stimulation Protocol</span>
            </h3>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                stimulation.safety > 0.9 ? 'bg-green-100 text-green-800' :
                stimulation.safety > 0.7 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {(stimulation.safety * 100).toFixed(0)}% safe
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                stimulation.efficacy > 0.7 ? 'bg-blue-100 text-blue-800' :
                stimulation.efficacy > 0.5 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {(stimulation.efficacy * 100).toFixed(0)}% efficacy
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Stimulation Type</h4>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-2">
                  {stimulation.type}
                </div>
                <div className="text-sm text-gray-600">
                  Target: {stimulation.target}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Parameters</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Frequency:</span>
                  <span className="font-medium">{stimulation.parameters.frequency} Hz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Intensity:</span>
                  <span className="font-medium">{stimulation.parameters.intensity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{stimulation.parameters.duration}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Waveform:</span>
                  <span className="font-medium capitalize">{stimulation.parameters.waveform}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Response</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Immediate:</span>
                  <p className="font-medium text-gray-900">{stimulation.response.immediate}</p>
                </div>
                <div>
                  <span className="text-gray-600">Sustained:</span>
                  <p className="font-medium text-gray-900">{stimulation.response.sustained}</p>
                </div>
                <div>
                  <span className="text-gray-600">Side Effects:</span>
                  <div className="mt-1">
                    {stimulation.response.sideEffects.map((effect, idx) => (
                      <span key={idx} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-1">
                        {effect}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <Settings className="h-4 w-4 text-purple-500" />
          <span>Stimulation Protocol Designer</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select className="w-full p-2 border border-gray-300 rounded-lg">
              <option>TMS</option>
              <option>DBS</option>
              <option>tDCS</option>
              <option>Optogenetics</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Region</label>
            <select className="w-full p-2 border border-gray-300 rounded-lg">
              <option>Motor Cortex</option>
              <option>Prefrontal Cortex</option>
              <option>Visual Cortex</option>
              <option>Temporal Lobe</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency (Hz)</label>
            <input type="number" className="w-full p-2 border border-gray-300 rounded-lg" placeholder="20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (s)</label>
            <input type="number" className="w-full p-2 border border-gray-300 rounded-lg" placeholder="300" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Design Protocol
          </button>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Neural Overview', icon: Eye },
    { id: 'mapping', label: 'Brain Mapping', icon: Brain },
    { id: 'stimulation', label: 'Neural Stimulation', icon: Zap },
    { id: 'signals', label: 'Signal Analysis', icon: Waves }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Neural Interface Integration
            </h1>
            <p className="text-gray-600">
              Advanced brain-computer interface for cancer neurology monitoring
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
        {activeTab === 'mapping' && renderBrainMapping()}
        {activeTab === 'stimulation' && renderNeuralStimulation()}
        {activeTab === 'signals' && renderOverview()} {/* Reuse overview for signals tab */}
      </div>
    </div>
  );
};

export default NeuralInterfaceIntegration;
