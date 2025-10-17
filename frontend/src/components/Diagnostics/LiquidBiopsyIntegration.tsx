import React, { useState, useEffect, useRef } from 'react';
import { 
  Droplet, 
  Microscope, 
  Activity, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  DNA,
  Target,
  Brain,
  Waves,
  BarChart3,
  LineChart,
  Eye,
  Play,
  Pause,
  RefreshCcw,
  Download,
  Share2,
  Settings,
  Filter,
  Search,
  Bell,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Gauge,
  Hexagon,
  Triangle,
  Circle,
  Square,
  Star
} from 'lucide-react';

interface CirculatingTumorCell {
  id: string;
  patientId: string;
  timestamp: string;
  cellType: 'CTC' | 'CEC' | 'CAR-T' | 'CTM';
  count: number;
  viability: number;
  morphology: {
    size: number;
    shape: 'round' | 'irregular' | 'elongated';
    nucleus: 'large' | 'normal' | 'fragmented';
  };
  biomarkers: {
    EpCAM: number;
    CK: number;
    CD45: number;
    Vimentin: number;
  };
  geneticProfile: {
    mutations: string[];
    expressionLevels: { [gene: string]: number };
  };
  drugResistance: {
    markers: string[];
    resistanceLevel: number;
  };
}

interface LiquidBiopsyResult {
  id: string;
  patientId: string;
  sampleType: 'blood' | 'urine' | 'saliva' | 'csf';
  collectionTime: string;
  processingTime: string;
  ctDNA: {
    concentration: number;
    fragmentSize: number;
    mutations: Array<{
      gene: string;
      position: string;
      change: string;
      frequency: number;
      clinicalSignificance: 'pathogenic' | 'likely_pathogenic' | 'uncertain' | 'benign';
    }>;
  };
  ctcs: CirculatingTumorCell[];
  exosomes: {
    count: number;
    miRNA: { [miRNA: string]: number };
    proteins: { [protein: string]: number };
  };
  metabolites: {
    glucose: number;
    lactate: number;
    amino_acids: { [acid: string]: number };
  };
  realTimeAnalysis: {
    isLive: boolean;
    lastUpdate: string;
    processingRate: number;
    accuracy: number;
  };
}

interface RealTimeAlert {
  id: string;
  timestamp: string;
  type: 'mutation_detected' | 'resistance_marker' | 'tumor_burden_change' | 'metabolic_shift';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: string;
  actionRequired: boolean;
}

const LiquidBiopsyIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [biopsyResults, setBiopsyResults] = useState<LiquidBiopsyResult[]>([]);
  const [realTimeAlerts, setRealTimeAlerts] = useState<RealTimeAlert[]>([]);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [processingRate, setProcessingRate] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    generateMockBiopsyData();
    if (canvasRef.current) {
      drawCTCVisualization();
    }
  }, []);

  useEffect(() => {
    if (isRealTimeActive) {
      intervalRef.current = setInterval(() => {
        setProcessingRate(prev => Math.min(prev + Math.random() * 10, 100));
        generateRealTimeAlert();
        if (canvasRef.current) {
          drawCTCVisualization();
        }
      }, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRealTimeActive]);

  const generateMockBiopsyData = () => {
    const mockResults: LiquidBiopsyResult[] = [
      {
        id: 'lb001',
        patientId: 'patient123',
        sampleType: 'blood',
        collectionTime: new Date(Date.now() - 3600000).toISOString(),
        processingTime: new Date().toISOString(),
        ctDNA: {
          concentration: 12.7,
          fragmentSize: 167,
          mutations: [
            {
              gene: 'TP53',
              position: 'c.524G>A',
              change: 'p.Arg175His',
              frequency: 0.23,
              clinicalSignificance: 'pathogenic'
            },
            {
              gene: 'KRAS',
              position: 'c.182A>G',
              change: 'p.Gln61Arg',
              frequency: 0.15,
              clinicalSignificance: 'pathogenic'
            },
            {
              gene: 'EGFR',
              position: 'c.2573T>G',
              change: 'p.Leu858Arg',
              frequency: 0.08,
              clinicalSignificance: 'likely_pathogenic'
            }
          ]
        },
        ctcs: [
          {
            id: 'ctc001',
            patientId: 'patient123',
            timestamp: new Date().toISOString(),
            cellType: 'CTC',
            count: 47,
            viability: 0.89,
            morphology: {
              size: 15.2,
              shape: 'irregular',
              nucleus: 'large'
            },
            biomarkers: {
              EpCAM: 0.78,
              CK: 0.65,
              CD45: 0.12,
              Vimentin: 0.34
            },
            geneticProfile: {
              mutations: ['TP53', 'KRAS', 'PIK3CA'],
              expressionLevels: {
                'MYC': 2.3,
                'VEGF': 1.8,
                'PD-L1': 0.7
              }
            },
            drugResistance: {
              markers: ['ABCB1', 'ERCC1'],
              resistanceLevel: 0.42
            }
          }
        ],
        exosomes: {
          count: 8.4e9,
          miRNA: {
            'miR-21': 145.2,
            'miR-155': 87.3,
            'miR-200c': 62.7,
            'miR-210': 134.8
          },
          proteins: {
            'HSP70': 23.4,
            'TSG101': 15.7,
            'CD63': 41.2,
            'CD81': 38.9
          }
        },
        metabolites: {
          glucose: 5.8,
          lactate: 2.1,
          amino_acids: {
            'alanine': 0.42,
            'glutamine': 0.68,
            'serine': 0.23,
            'glycine': 0.31
          }
        },
        realTimeAnalysis: {
          isLive: true,
          lastUpdate: new Date().toISOString(),
          processingRate: 87.3,
          accuracy: 0.94
        }
      }
    ];

    setBiopsyResults(mockResults);
  };

  const generateRealTimeAlert = () => {
    if (Math.random() > 0.3) return; // 30% chance of alert

    const alertTypes = [
      { type: 'mutation_detected', message: 'New mutation detected in ctDNA', severity: 'high' },
      { type: 'resistance_marker', message: 'Drug resistance marker identified', severity: 'medium' },
      { type: 'tumor_burden_change', message: 'CTC count increased by 15%', severity: 'high' },
      { type: 'metabolic_shift', message: 'Metabolic profile changed significantly', severity: 'medium' }
    ] as const;

    const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    
    const newAlert: RealTimeAlert = {
      id: `alert_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      details: `Detected at ${new Date().toLocaleTimeString()} during real-time analysis`,
      actionRequired: alert.severity === 'high' || alert.severity === 'critical'
    };

    setRealTimeAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
  };

  const drawCTCVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 500;
    canvas.height = 300;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const time = Date.now() * 0.001;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw blood vessel
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();

    // Draw CTCs
    const ctcCount = 12;
    for (let i = 0; i < ctcCount; i++) {
      const progress = ((time * 30 + i * 40) % canvas.width);
      const x = progress;
      const y = centerY + Math.sin(time + i) * 20;
      
      const size = 4 + Math.sin(time + i) * 2;
      
      // Cell body
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, '#60a5fa');
      gradient.addColorStop(0.7, '#3b82f6');
      gradient.addColorStop(1, '#1d4ed8');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      // Nucleus
      ctx.fillStyle = '#1e40af';
      ctx.beginPath();
      ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Biomarker indicators
      if (i % 3 === 0) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(x + size * 0.6, y - size * 0.6, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw exosomes
    const exosomeCount = 25;
    for (let i = 0; i < exosomeCount; i++) {
      const progress = ((time * 50 + i * 25) % canvas.width);
      const x = progress;
      const y = centerY + Math.sin(time * 2 + i) * 40;
      
      ctx.fillStyle = '#a78bfa';
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw ctDNA fragments
    const dnaCount = 30;
    for (let i = 0; i < dnaCount; i++) {
      const progress = ((time * 40 + i * 15) % canvas.width);
      const x = progress;
      const y = centerY + Math.sin(time * 1.5 + i) * 30;
      
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 3, y);
      ctx.lineTo(x + 3, y);
      ctx.stroke();
    }

    // Add labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.fillText('CTCs', 20, 30);
    ctx.fillText('Exosomes', 20, 50);
    ctx.fillText('ctDNA', 20, 70);
    ctx.fillText(`Rate: ${processingRate.toFixed(1)}/min`, canvas.width - 120, 30);
  };

  const toggleRealTimeAnalysis = () => {
    setIsRealTimeActive(prev => !prev);
    if (!isRealTimeActive) {
      setProcessingRate(0);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Droplet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Samples</h3>
                <p className="text-sm text-gray-600">Processing</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-600">{biopsyResults.length}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <DNA className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">ctDNA</h3>
                <p className="text-sm text-gray-600">Mutations</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {biopsyResults[0]?.ctDNA.mutations.length || 0}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Microscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">CTCs</h3>
                <p className="text-sm text-gray-600">Detected</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {biopsyResults[0]?.ctcs[0]?.count || 0}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Alerts</h3>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-orange-600">{realTimeAlerts.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <span>Real-Time Liquid Biopsy Analysis</span>
          </h3>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${
              isRealTimeActive ? 'text-green-600' : 'text-gray-500'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isRealTimeActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
              <span className="text-sm font-medium">
                {isRealTimeActive ? 'Live Analysis' : 'Inactive'}
              </span>
            </div>
            <button
              onClick={toggleRealTimeAnalysis}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                isRealTimeActive 
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isRealTimeActive ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Start</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="flex justify-center mb-4">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded-lg bg-slate-900"
          />
        </div>
        
        <div className="text-center text-sm text-gray-600">
          Real-time visualization of circulating tumor cells, exosomes, and ctDNA in bloodstream
        </div>
      </div>

      {realTimeAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span>Real-Time Alerts</span>
          </h3>
          <div className="space-y-3">
            {realTimeAlerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg p-4 border-l-4 ${
                  alert.severity === 'critical' 
                    ? 'bg-red-50 border-red-500'
                    : alert.severity === 'high'
                    ? 'bg-orange-50 border-orange-500'
                    : alert.severity === 'medium'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{alert.message}</p>
                    <p className="text-sm text-gray-600">{alert.details}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCTDNA = () => (
    <div className="space-y-6">
      {biopsyResults.map((result) => (
        <div key={result.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <DNA className="h-5 w-5 text-purple-500" />
              <span>Circulating Tumor DNA Analysis</span>
            </h3>
            <div className="text-sm text-gray-600">
              {new Date(result.processingTime).toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Concentration</div>
              <div className="text-xl font-bold text-purple-600">
                {result.ctDNA.concentration} ng/mL
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Fragment Size</div>
              <div className="text-xl font-bold text-blue-600">
                {result.ctDNA.fragmentSize} bp
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Mutations Found</div>
              <div className="text-xl font-bold text-green-600">
                {result.ctDNA.mutations.length}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Detected Mutations</h4>
            <div className="space-y-3">
              {result.ctDNA.mutations.map((mutation, idx) => (
                <div 
                  key={idx} 
                  className={`rounded-lg p-4 border ${
                    mutation.clinicalSignificance === 'pathogenic' 
                      ? 'bg-red-50 border-red-200'
                      : mutation.clinicalSignificance === 'likely_pathogenic'
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Gene:</span>
                      <div className="font-bold text-gray-900">{mutation.gene}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Position:</span>
                      <div className="font-mono text-sm text-gray-900">{mutation.position}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Change:</span>
                      <div className="font-mono text-sm text-gray-900">{mutation.change}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Frequency:</span>
                      <div className="font-bold text-gray-900">
                        {(mutation.frequency * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Significance:</span>
                      <div className={`font-medium capitalize ${
                        mutation.clinicalSignificance === 'pathogenic' 
                          ? 'text-red-600'
                          : mutation.clinicalSignificance === 'likely_pathogenic'
                          ? 'text-orange-600'
                          : 'text-gray-600'
                      }`}>
                        {mutation.clinicalSignificance.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCTCs = () => (
    <div className="space-y-6">
      {biopsyResults.map((result) => (
        <div key={result.id}>
          {result.ctcs.map((ctc) => (
            <div key={ctc.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Microscope className="h-5 w-5 text-green-500" />
                  <span>Circulating Tumor Cells Analysis</span>
                </h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Count: {ctc.count} cells/mL</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ctc.viability > 0.8 ? 'bg-green-100 text-green-800' :
                    ctc.viability > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {(ctc.viability * 100).toFixed(0)}% viable
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Morphology</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{ctc.morphology.size} μm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shape:</span>
                      <span className="font-medium capitalize">{ctc.morphology.shape}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nucleus:</span>
                      <span className="font-medium capitalize">{ctc.morphology.nucleus}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Biomarkers</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(ctc.biomarkers).map(([marker, value]) => (
                      <div key={marker} className="flex justify-between">
                        <span className="text-gray-600">{marker}:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${value * 100}%` }}
                            />
                          </div>
                          <span className="font-medium">{(value * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Drug Resistance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className={`font-medium ${
                        ctc.drugResistance.resistanceLevel > 0.7 ? 'text-red-600' :
                        ctc.drugResistance.resistanceLevel > 0.4 ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {(ctc.drugResistance.resistanceLevel * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Markers:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {ctc.drugResistance.markers.map((marker) => (
                          <span key={marker} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                            {marker}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Genetic Profile</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Mutations:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {ctc.geneticProfile.mutations.map((mutation) => (
                          <span key={mutation} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                            {mutation}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Expression Levels:</span>
                      <div className="mt-2 space-y-2">
                        {Object.entries(ctc.geneticProfile.expressionLevels).map(([gene, level]) => (
                          <div key={gene} className="flex justify-between items-center">
                            <span className="text-gray-700">{gene}:</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${Math.min(level / 3 * 100, 100)}%` }}
                                />
                              </div>
                              <span className="font-medium">{level.toFixed(1)}x</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-cyan-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Cell Classification</h4>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500 rounded-full mb-3">
                      <span className="text-white font-bold text-lg">{ctc.cellType}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {ctc.cellType === 'CTC' && 'Circulating Tumor Cell'}
                      {ctc.cellType === 'CEC' && 'Circulating Endothelial Cell'}
                      {ctc.cellType === 'CAR-T' && 'CAR-T Cell'}
                      {ctc.cellType === 'CTM' && 'Circulating Tumor Microemboli'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const renderExosomes = () => (
    <div className="space-y-6">
      {biopsyResults.map((result) => (
        <div key={result.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Hexagon className="h-5 w-5 text-cyan-500" />
              <span>Exosome Analysis</span>
            </h3>
            <div className="text-sm text-gray-600">
              Count: {result.exosomes.count.toExponential(2)} particles/mL
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">microRNA Profile</h4>
              <div className="space-y-3">
                {Object.entries(result.exosomes.miRNA).map(([mirna, value]) => (
                  <div key={mirna} className="flex justify-between items-center">
                    <span className="text-gray-700 font-mono text-sm">{mirna}:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min(value / 200 * 100, 100)}%` }}
                        />
                      </div>
                      <span className="font-medium text-sm">{value.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Protein Markers</h4>
              <div className="space-y-3">
                {Object.entries(result.exosomes.proteins).map(([protein, value]) => (
                  <div key={protein} className="flex justify-between items-center">
                    <span className="text-gray-700 font-mono text-sm">{protein}:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${Math.min(value / 50 * 100, 100)}%` }}
                        />
                      </div>
                      <span className="font-medium text-sm">{value.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Real-Time Overview', icon: Eye },
    { id: 'ctdna', label: 'ctDNA Analysis', icon: DNA },
    { id: 'ctcs', label: 'Circulating Cells', icon: Microscope },
    { id: 'exosomes', label: 'Exosomes & miRNA', icon: Hexagon }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl">
            <Droplet className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Liquid Biopsy Integration
            </h1>
            <p className="text-gray-600">
              Real-time analysis of circulating biomarkers and tumor DNA
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
        {activeTab === 'ctdna' && renderCTDNA()}
        {activeTab === 'ctcs' && renderCTCs()}
        {activeTab === 'exosomes' && renderExosomes()}
      </div>
    </div>
  );
};

export default LiquidBiopsyIntegration;