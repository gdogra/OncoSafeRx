import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Zap, 
  Brain, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  LineChart,
  PieChart,
  Gauge,
  Molecule,
  FlaskConical,
  Atom,
  Waves,
  Eye,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Download,
  Share2,
  Filter,
  Search,
  Bell,
  Thermometer,
  Battery,
  Wind,
  Droplets,
  Flame,
  Snowflake,
  Heart,
  Beaker,
  Microscope,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface MetabolicProfile {
  id: string;
  patientId: string;
  timestamp: string;
  energyMetabolism: {
    glucose: number;
    lactate: number;
    pyruvate: number;
    atp: number;
    adp: number;
    phosphocreatine: number;
  };
  aminoAcids: {
    glutamine: number;
    alanine: number;
    serine: number;
    glycine: number;
    methionine: number;
    tryptophan: number;
    tyrosine: number;
    phenylalanine: number;
  };
  lipidProfile: {
    cholesterol: number;
    triglycerides: number;
    phospholipids: number;
    sphingolipids: number;
    ceramides: number;
    fattyAcids: number;
  };
  nucleotides: {
    dna: number;
    rna: number;
    purines: number;
    pyrimidines: number;
    nucleosides: number;
  };
  oxidativeStress: {
    ros: number;
    glutathione: number;
    catalase: number;
    superoxideDismutase: number;
    malondialdehyde: number;
  };
  tumorMarkers: {
    lactateDehydrogenase: number;
    hexokinase: number;
    pkm2: number;
    idh1: number;
    succinate: number;
  };
}

interface MetabolicShift {
  id: string;
  timestamp: string;
  shiftType: 'glycolytic' | 'oxidative' | 'glutaminolytic' | 'lipogenic' | 'nucleotide_synthesis';
  intensity: number;
  duration: number;
  affectedPathways: string[];
  clinicalSignificance: 'low' | 'moderate' | 'high' | 'critical';
  predictedOutcome: {
    tumorGrowth: number;
    metastasisRisk: number;
    drugResistance: number;
    therapyResponse: number;
  };
}

interface MetabolicAlert {
  id: string;
  timestamp: string;
  type: 'warburg_effect' | 'glutamine_addiction' | 'lipid_dysregulation' | 'nucleotide_imbalance' | 'oxidative_stress';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metabolites: string[];
  actionRequired: boolean;
  recommendations: string[];
}

const MetabolicSignatureTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [metabolicProfiles, setMetabolicProfiles] = useState<MetabolicProfile[]>([]);
  const [metabolicShifts, setMetabolicShifts] = useState<MetabolicShift[]>([]);
  const [alerts, setAlerts] = useState<MetabolicAlert[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathwayCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateMockMetabolicData();
    if (canvasRef.current) {
      drawMetabolicVisualization();
    }
    if (pathwayCanvasRef.current) {
      drawPathwayNetwork();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTracking) {
      interval = setInterval(() => {
        updateRealTimeMetabolics();
        if (canvasRef.current) {
          drawMetabolicVisualization();
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking]);

  const generateMockMetabolicData = () => {
    const mockProfile: MetabolicProfile = {
      id: 'mp001',
      patientId: 'patient123',
      timestamp: new Date().toISOString(),
      energyMetabolism: {
        glucose: 5.2,
        lactate: 2.8,
        pyruvate: 0.15,
        atp: 4.2,
        adp: 1.8,
        phosphocreatine: 3.1
      },
      aminoAcids: {
        glutamine: 0.58,
        alanine: 0.42,
        serine: 0.23,
        glycine: 0.31,
        methionine: 0.18,
        tryptophan: 0.09,
        tyrosine: 0.14,
        phenylalanine: 0.12
      },
      lipidProfile: {
        cholesterol: 4.8,
        triglycerides: 1.2,
        phospholipids: 2.3,
        sphingolipids: 0.8,
        ceramides: 0.45,
        fattyAcids: 0.92
      },
      nucleotides: {
        dna: 12.5,
        rna: 18.3,
        purines: 8.7,
        pyrimidines: 6.2,
        nucleosides: 4.1
      },
      oxidativeStress: {
        ros: 2.3,
        glutathione: 15.8,
        catalase: 42.1,
        superoxideDismutase: 38.7,
        malondialdehyde: 3.2
      },
      tumorMarkers: {
        lactateDehydrogenase: 245,
        hexokinase: 18.5,
        pkm2: 12.3,
        idh1: 8.7,
        succinate: 4.2
      }
    };

    const mockShifts: MetabolicShift[] = [
      {
        id: 'ms001',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        shiftType: 'glycolytic',
        intensity: 0.78,
        duration: 3.5,
        affectedPathways: ['Glycolysis', 'Pentose Phosphate', 'Lactate Production'],
        clinicalSignificance: 'high',
        predictedOutcome: {
          tumorGrowth: 0.65,
          metastasisRisk: 0.42,
          drugResistance: 0.38,
          therapyResponse: 0.23
        }
      },
      {
        id: 'ms002',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        shiftType: 'glutaminolytic',
        intensity: 0.62,
        duration: 2.8,
        affectedPathways: ['Glutaminolysis', 'TCA Cycle', 'Amino Acid Synthesis'],
        clinicalSignificance: 'moderate',
        predictedOutcome: {
          tumorGrowth: 0.48,
          metastasisRisk: 0.35,
          drugResistance: 0.29,
          therapyResponse: 0.41
        }
      }
    ];

    const mockAlerts: MetabolicAlert[] = [
      {
        id: 'ma001',
        timestamp: new Date().toISOString(),
        type: 'warburg_effect',
        severity: 'high',
        message: 'Enhanced glycolytic metabolism detected',
        metabolites: ['glucose', 'lactate', 'pyruvate'],
        actionRequired: true,
        recommendations: [
          'Consider glucose metabolism inhibitors',
          'Monitor lactate levels closely',
          'Assess for tumor progression'
        ]
      },
      {
        id: 'ma002',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        type: 'glutamine_addiction',
        severity: 'medium',
        message: 'Increased glutamine consumption observed',
        metabolites: ['glutamine', 'glutamate', 'alpha-ketoglutarate'],
        actionRequired: false,
        recommendations: [
          'Monitor glutamine levels',
          'Consider glutaminase inhibitors if progression occurs'
        ]
      }
    ];

    setMetabolicProfiles([mockProfile]);
    setMetabolicShifts(mockShifts);
    setAlerts(mockAlerts);
  };

  const updateRealTimeMetabolics = () => {
    const newAlert: MetabolicAlert = {
      id: `ma_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: ['warburg_effect', 'glutamine_addiction', 'lipid_dysregulation', 'oxidative_stress'][Math.floor(Math.random() * 4)] as any,
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      message: 'Real-time metabolic change detected',
      metabolites: ['glucose', 'lactate', 'glutamine', 'atp'][Math.floor(Math.random() * 4)] ? [['glucose', 'lactate', 'glutamine', 'atp'][Math.floor(Math.random() * 4)]] : [],
      actionRequired: Math.random() > 0.7,
      recommendations: ['Monitor closely', 'Consider therapeutic intervention']
    };

    if (Math.random() > 0.6) {
      setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
    }
  };

  const drawMetabolicVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 400;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const time = Date.now() * 0.001;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw metabolic pathways as interconnected circles
    const pathways = [
      { name: 'Glycolysis', x: centerX - 150, y: centerY - 100, color: '#ef4444', activity: 0.8 },
      { name: 'TCA Cycle', x: centerX, y: centerY - 50, color: '#3b82f6', activity: 0.6 },
      { name: 'Glutaminolysis', x: centerX + 150, y: centerY - 100, color: '#10b981', activity: 0.7 },
      { name: 'Lipogenesis', x: centerX - 100, y: centerY + 80, color: '#f59e0b', activity: 0.4 },
      { name: 'Nucleotide Synthesis', x: centerX + 100, y: centerY + 80, color: '#8b5cf6', activity: 0.5 }
    ];

    // Draw connections between pathways
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    for (let i = 0; i < pathways.length; i++) {
      for (let j = i + 1; j < pathways.length; j++) {
        const p1 = pathways[i];
        const p2 = pathways[j];
        const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
        if (distance < 200) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    // Draw pathway nodes
    pathways.forEach((pathway, index) => {
      const pulseSize = 30 + Math.sin(time + index) * 5 * pathway.activity;
      
      const gradient = ctx.createRadialGradient(
        pathway.x, pathway.y, 0,
        pathway.x, pathway.y, pulseSize
      );
      gradient.addColorStop(0, pathway.color + 'CC');
      gradient.addColorStop(0.7, pathway.color + '88');
      gradient.addColorStop(1, pathway.color + '00');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pathway.x, pathway.y, pulseSize, 0, Math.PI * 2);
      ctx.fill();

      // Draw pathway name
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pathway.name, pathway.x, pathway.y + pulseSize + 15);
      
      // Draw activity level
      ctx.fillText(`${(pathway.activity * 100).toFixed(0)}%`, pathway.x, pathway.y + pulseSize + 30);
    });

    // Draw metabolic flow particles
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
  };

  const drawPathwayNetwork = () => {
    const canvas = pathwayCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 300;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw simplified metabolic network
    const nodes = [
      { x: 50, y: 150, label: 'Glucose', color: '#ef4444' },
      { x: 150, y: 100, label: 'Pyruvate', color: '#f59e0b' },
      { x: 150, y: 200, label: 'Lactate', color: '#ec4899' },
      { x: 250, y: 150, label: 'Acetyl-CoA', color: '#3b82f6' },
      { x: 350, y: 150, label: 'ATP', color: '#10b981' }
    ];

    const edges = [
      [0, 1], [1, 2], [1, 3], [3, 4]
    ];

    // Draw edges
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    edges.forEach(([from, to]) => {
      ctx.beginPath();
      ctx.moveTo(nodes[from].x, nodes[from].y);
      ctx.lineTo(nodes[to].x, nodes[to].y);
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach((node) => {
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + 25);
    });
  };

  const getMetaboliteValue = (profile: MetabolicProfile, category: string, metabolite: string): number => {
    const categoryData = (profile as any)[category];
    return categoryData ? categoryData[metabolite] || 0 : 0;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Energy Status</h3>
                <p className="text-sm text-gray-600">ATP/ADP ratio</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-red-600">
              {metabolicProfiles[0] ? (metabolicProfiles[0].energyMetabolism.atp / metabolicProfiles[0].energyMetabolism.adp).toFixed(1) : '0'}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Metabolic Shifts</h3>
                <p className="text-sm text-gray-600">Active changes</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-600">{metabolicShifts.length}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Molecule className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tumor Markers</h3>
                <p className="text-sm text-gray-600">Elevated</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-green-600">3</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-6 border border-orange-200">
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
            <span className="text-2xl font-bold text-orange-600">{alerts.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Waves className="h-5 w-5 text-blue-500" />
              <span>Metabolic Pathway Activity</span>
            </h3>
            <button
              onClick={() => setIsTracking(!isTracking)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                isTracking 
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isTracking ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Track</span>
                </>
              )}
            </button>
          </div>
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="border border-gray-300 rounded-lg bg-slate-900"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-500" />
            <span>Pathway Network</span>
          </h3>
          <div className="flex justify-center">
            <canvas
              ref={pathwayCanvasRef}
              className="border border-gray-300 rounded-lg bg-slate-800"
            />
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span>Recent Metabolic Alerts</span>
          </h3>
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
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
                    <p className="text-sm text-gray-600">
                      Metabolites: {alert.metabolites.join(', ')}
                    </p>
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

  const renderEnergyMetabolism = () => (
    <div className="space-y-6">
      {metabolicProfiles.map((profile) => (
        <div key={profile.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Zap className="h-5 w-5 text-red-500" />
            <span>Energy Metabolism Profile</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Glycolysis</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Glucose:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${Math.min(profile.energyMetabolism.glucose / 10 * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{profile.energyMetabolism.glucose.toFixed(1)} mM</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Lactate:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${Math.min(profile.energyMetabolism.lactate / 5 * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{profile.energyMetabolism.lactate.toFixed(1)} mM</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pyruvate:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${Math.min(profile.energyMetabolism.pyruvate / 1 * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{profile.energyMetabolism.pyruvate.toFixed(2)} mM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Energy Carriers</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ATP:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(profile.energyMetabolism.atp / 10 * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{profile.energyMetabolism.atp.toFixed(1)} mM</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ADP:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(profile.energyMetabolism.adp / 5 * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{profile.energyMetabolism.adp.toFixed(1)} mM</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Phosphocreatine:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(profile.energyMetabolism.phosphocreatine / 5 * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{profile.energyMetabolism.phosphocreatine.toFixed(1)} mM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Energy Ratios</h4>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {(profile.energyMetabolism.atp / profile.energyMetabolism.adp).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">ATP/ADP Ratio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {(profile.energyMetabolism.lactate / profile.energyMetabolism.pyruvate).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Lactate/Pyruvate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAminoAcids = () => (
    <div className="space-y-6">
      {metabolicProfiles.map((profile) => (
        <div key={profile.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Molecule className="h-5 w-5 text-purple-500" />
            <span>Amino Acid Profile</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(profile.aminoAcids).map(([amino, value]) => (
              <div key={amino} className="bg-purple-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600 mb-1">
                    {value.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {amino.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-xs text-gray-500">mM</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${Math.min(value / 1 * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <h4 className="font-medium text-gray-900 mb-3">Metabolic Significance</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-purple-600">Glutamine:</span>
                <span className="text-gray-600 ml-2">Primary fuel for rapidly dividing cells</span>
              </div>
              <div>
                <span className="font-medium text-purple-600">Methionine:</span>
                <span className="text-gray-600 ml-2">Essential for methylation reactions</span>
              </div>
              <div>
                <span className="font-medium text-purple-600">Serine:</span>
                <span className="text-gray-600 ml-2">Critical for nucleotide synthesis</span>
              </div>
              <div>
                <span className="font-medium text-purple-600">Tryptophan:</span>
                <span className="text-gray-600 ml-2">Precursor to serotonin and NAD+</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMetabolicShifts = () => (
    <div className="space-y-6">
      {metabolicShifts.map((shift) => (
        <div key={shift.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <span>Metabolic Shift Analysis</span>
            </h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              shift.clinicalSignificance === 'critical' ? 'bg-red-100 text-red-800' :
              shift.clinicalSignificance === 'high' ? 'bg-orange-100 text-orange-800' :
              shift.clinicalSignificance === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {shift.clinicalSignificance} significance
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Shift Characteristics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{shift.shiftType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Intensity:</span>
                  <span className="font-medium">{(shift.intensity * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{shift.duration.toFixed(1)} hours</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Predicted Outcomes</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tumor Growth:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${shift.predictedOutcome.tumorGrowth * 100}%` }}
                      />
                    </div>
                    <span className="font-medium">{(shift.predictedOutcome.tumorGrowth * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Metastasis Risk:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${shift.predictedOutcome.metastasisRisk * 100}%` }}
                      />
                    </div>
                    <span className="font-medium">{(shift.predictedOutcome.metastasisRisk * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Drug Resistance:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${shift.predictedOutcome.drugResistance * 100}%` }}
                      />
                    </div>
                    <span className="font-medium">{(shift.predictedOutcome.drugResistance * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Therapy Response:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${shift.predictedOutcome.therapyResponse * 100}%` }}
                      />
                    </div>
                    <span className="font-medium">{(shift.predictedOutcome.therapyResponse * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Affected Pathways</h4>
            <div className="flex flex-wrap gap-2">
              {shift.affectedPathways.map((pathway) => (
                <span
                  key={pathway}
                  className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                >
                  {pathway}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Metabolic Overview', icon: Eye },
    { id: 'energy', label: 'Energy Metabolism', icon: Zap },
    { id: 'amino', label: 'Amino Acids', icon: Molecule },
    { id: 'shifts', label: 'Metabolic Shifts', icon: TrendingUp }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Metabolic Signature Cancer Tracking
            </h1>
            <p className="text-gray-600">
              Real-time monitoring of metabolic changes and tumor signatures
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
        {activeTab === 'energy' && renderEnergyMetabolism()}
        {activeTab === 'amino' && renderAminoAcids()}
        {activeTab === 'shifts' && renderMetabolicShifts()}
      </div>
    </div>
  );
};

export default MetabolicSignatureTracking;