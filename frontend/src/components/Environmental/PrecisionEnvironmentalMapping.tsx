import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Wind, 
  Thermometer,
  Droplets,
  Sun,
  Cloud,
  Zap,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  Settings,
  Filter,
  Search,
  Bell,
  Target,
  Layers,
  BarChart3,
  LineChart,
  PieChart,
  Gauge,
  Microscope,
  FlaskConical,
  Atom,
  Beaker,
  TreePine,
  Factory,
  Car,
  Home,
  Building,
  Plane,
  Ship,
  Truck,
  Waves,
  Mountain,
  Globe,
  Satellite,
  Radar,
  Radio,
  Wifi,
  Signal,
  Database,
  Cloud as CloudIcon,
  Download,
  Upload,
  Share2,
  RefreshCcw,
  Calendar,
  Clock,
  MapIcon,
  Navigation
} from 'lucide-react';

interface EnvironmentalFactor {
  id: string;
  type: 'air_quality' | 'water_quality' | 'radiation' | 'chemical' | 'noise' | 'electromagnetic';
  name: string;
  value: number;
  unit: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  coordinates: [number, number];
  timestamp: string;
  source: string;
  healthImpact: {
    cancerRisk: number;
    respiratoryImpact: number;
    cardiovascularImpact: number;
    neurologicalImpact: number;
  };
}

interface CancerCluster {
  id: string;
  location: {
    center: [number, number];
    radius: number;
    address: string;
  };
  cancerTypes: Array<{
    type: string;
    incidenceRate: number;
    expectedRate: number;
    statisticalSignificance: number;
  }>;
  environmentalCorrelations: Array<{
    factor: string;
    correlationStrength: number;
    confidenceInterval: [number, number];
  }>;
  timeframe: {
    startDate: string;
    endDate: string;
    duration: number;
  };
  population: {
    affected: number;
    total: number;
    demographics: {
      ageGroups: { [key: string]: number };
      genders: { [key: string]: number };
      ethnicities: { [key: string]: number };
    };
  };
}

interface PersonalExposure {
  id: string;
  patientId: string;
  timestamp: string;
  location: [number, number];
  exposures: Array<{
    factor: string;
    duration: number;
    intensity: number;
    cumulativeExposure: number;
    riskContribution: number;
  }>;
  riskScore: {
    current: number;
    cumulative: number;
    predicted: number;
  };
  recommendations: string[];
  mitigationStrategies: string[];
}

interface EnvironmentalAlert {
  id: string;
  type: 'exposure_spike' | 'cluster_detected' | 'risk_threshold' | 'correlation_found';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: [number, number];
  affectedRadius: number;
  timestamp: string;
  actionRequired: boolean;
  recommendations: string[];
}

const PrecisionEnvironmentalMapping: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [environmentalFactors, setEnvironmentalFactors] = useState<EnvironmentalFactor[]>([]);
  const [cancerClusters, setCancerClusters] = useState<CancerCluster[]>([]);
  const [personalExposures, setPersonalExposures] = useState<PersonalExposure[]>([]);
  const [environmentalAlerts, setEnvironmentalAlerts] = useState<EnvironmentalAlert[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateMockEnvironmentalData();
    if (mapCanvasRef.current) {
      drawEnvironmentalMap();
    }
    if (heatmapCanvasRef.current) {
      drawRiskHeatmap();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTracking) {
      interval = setInterval(() => {
        updateRealTimeData();
        if (mapCanvasRef.current) {
          drawEnvironmentalMap();
        }
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking]);

  const generateMockEnvironmentalData = () => {
    const mockFactors: EnvironmentalFactor[] = [
      {
        id: 'ef001',
        type: 'air_quality',
        name: 'PM2.5',
        value: 35.2,
        unit: 'μg/m³',
        riskLevel: 'moderate',
        coordinates: [-71.0589, 42.3601],
        timestamp: new Date().toISOString(),
        source: 'EPA Monitor Station',
        healthImpact: {
          cancerRisk: 0.23,
          respiratoryImpact: 0.67,
          cardiovascularImpact: 0.45,
          neurologicalImpact: 0.12
        }
      },
      {
        id: 'ef002',
        type: 'chemical',
        name: 'Benzene',
        value: 1.8,
        unit: 'ppb',
        riskLevel: 'low',
        coordinates: [-71.0589, 42.3601],
        timestamp: new Date().toISOString(),
        source: 'Industrial Monitoring',
        healthImpact: {
          cancerRisk: 0.15,
          respiratoryImpact: 0.28,
          cardiovascularImpact: 0.08,
          neurologicalImpact: 0.35
        }
      },
      {
        id: 'ef003',
        type: 'radiation',
        name: 'Background Radiation',
        value: 0.12,
        unit: 'μSv/h',
        riskLevel: 'low',
        coordinates: [-71.0589, 42.3601],
        timestamp: new Date().toISOString(),
        source: 'RadNet Station',
        healthImpact: {
          cancerRisk: 0.08,
          respiratoryImpact: 0.02,
          cardiovascularImpact: 0.03,
          neurologicalImpact: 0.05
        }
      },
      {
        id: 'ef004',
        type: 'water_quality',
        name: 'Lead',
        value: 8.5,
        unit: 'ppb',
        riskLevel: 'moderate',
        coordinates: [-71.0589, 42.3601],
        timestamp: new Date().toISOString(),
        source: 'Municipal Water Testing',
        healthImpact: {
          cancerRisk: 0.12,
          respiratoryImpact: 0.05,
          cardiovascularImpact: 0.18,
          neurologicalImpact: 0.78
        }
      }
    ];

    const mockClusters: CancerCluster[] = [
      {
        id: 'cc001',
        location: {
          center: [-71.0589, 42.3601],
          radius: 2.5,
          address: 'East Boston Industrial Area'
        },
        cancerTypes: [
          {
            type: 'Lung Cancer',
            incidenceRate: 85.4,
            expectedRate: 62.1,
            statisticalSignificance: 0.008
          },
          {
            type: 'Mesothelioma',
            incidenceRate: 12.8,
            expectedRate: 3.2,
            statisticalSignificance: 0.001
          }
        ],
        environmentalCorrelations: [
          {
            factor: 'Asbestos Exposure',
            correlationStrength: 0.84,
            confidenceInterval: [0.72, 0.93]
          },
          {
            factor: 'PM2.5 Levels',
            correlationStrength: 0.67,
            confidenceInterval: [0.52, 0.79]
          }
        ],
        timeframe: {
          startDate: '2015-01-01',
          endDate: '2024-12-31',
          duration: 10
        },
        population: {
          affected: 247,
          total: 15600,
          demographics: {
            ageGroups: { '40-60': 0.45, '60-80': 0.38, '20-40': 0.17 },
            genders: { 'Male': 0.68, 'Female': 0.32 },
            ethnicities: { 'White': 0.52, 'Hispanic': 0.28, 'Other': 0.20 }
          }
        }
      }
    ];

    const mockExposures: PersonalExposure[] = [
      {
        id: 'pe001',
        patientId: 'patient123',
        timestamp: new Date().toISOString(),
        location: [-71.0589, 42.3601],
        exposures: [
          {
            factor: 'PM2.5',
            duration: 8.5,
            intensity: 35.2,
            cumulativeExposure: 2847.3,
            riskContribution: 0.23
          },
          {
            factor: 'Benzene',
            duration: 6.2,
            intensity: 1.8,
            cumulativeExposure: 456.8,
            riskContribution: 0.15
          },
          {
            factor: 'Electromagnetic',
            duration: 16.0,
            intensity: 0.8,
            cumulativeExposure: 1250.4,
            riskContribution: 0.08
          }
        ],
        riskScore: {
          current: 0.46,
          cumulative: 0.68,
          predicted: 0.73
        },
        recommendations: [
          'Limit outdoor activities during high pollution days',
          'Use air purifier in living spaces',
          'Consider relocation from high-risk area'
        ],
        mitigationStrategies: [
          'Indoor plants for air purification',
          'N95 masks during outdoor activities',
          'Regular health screenings'
        ]
      }
    ];

    const mockAlerts: EnvironmentalAlert[] = [
      {
        id: 'ea001',
        type: 'exposure_spike',
        severity: 'high',
        title: 'Air Quality Alert',
        description: 'PM2.5 levels have exceeded safe thresholds in your area. Immediate action recommended.',
        location: [-71.0589, 42.3601],
        affectedRadius: 5.0,
        timestamp: new Date().toISOString(),
        actionRequired: true,
        recommendations: [
          'Stay indoors with air filtration',
          'Avoid outdoor exercise',
          'Use N95 mask if going outside'
        ]
      },
      {
        id: 'ea002',
        type: 'cluster_detected',
        severity: 'medium',
        title: 'Cancer Cluster Investigation',
        description: 'Statistical analysis has identified a potential cancer cluster in the East Boston area.',
        location: [-71.0589, 42.3601],
        affectedRadius: 2.5,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        actionRequired: false,
        recommendations: [
          'Enhanced environmental monitoring',
          'Community health screening program',
          'Further epidemiological investigation'
        ]
      }
    ];

    setEnvironmentalFactors(mockFactors);
    setCancerClusters(mockClusters);
    setPersonalExposures(mockExposures);
    setEnvironmentalAlerts(mockAlerts);
  };

  const updateRealTimeData = () => {
    setEnvironmentalFactors(prev => prev.map(factor => ({
      ...factor,
      value: factor.value + (Math.random() - 0.5) * factor.value * 0.1,
      timestamp: new Date().toISOString()
    })));

    if (Math.random() > 0.7) {
      const newAlert: EnvironmentalAlert = {
        id: `ea_${Date.now()}`,
        type: 'exposure_spike',
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        title: 'Real-time Environmental Change',
        description: 'Environmental conditions have changed in your monitoring area.',
        location: [-71.0589 + (Math.random() - 0.5) * 0.1, 42.3601 + (Math.random() - 0.5) * 0.1],
        affectedRadius: Math.random() * 5 + 1,
        timestamp: new Date().toISOString(),
        actionRequired: Math.random() > 0.5,
        recommendations: ['Monitor conditions closely', 'Follow safety protocols']
      };

      setEnvironmentalAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
    }
  };

  const drawEnvironmentalMap = () => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 400;

    // Fill background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw map grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * canvas.width;
      const y = (i / 10) * canvas.height;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const time = Date.now() * 0.001;

    // Draw environmental factors
    environmentalFactors.forEach((factor, index) => {
      const x = 300 + Math.sin(time + index) * 100;
      const y = 200 + Math.cos(time + index) * 80;

      const colorMap: { [key: string]: string } = {
        'air_quality': '#ef4444',
        'water_quality': '#3b82f6',
        'radiation': '#f59e0b',
        'chemical': '#8b5cf6',
        'noise': '#10b981',
        'electromagnetic': '#ec4899'
      };

      const riskColorMap: { [key: string]: number } = {
        'low': 0.3,
        'moderate': 0.6,
        'high': 0.8,
        'extreme': 1.0
      };

      const intensity = riskColorMap[factor.riskLevel] || 0.5;
      const size = 10 + intensity * 15;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, colorMap[factor.type] + 'CC');
      gradient.addColorStop(0.7, colorMap[factor.type] + '66');
      gradient.addColorStop(1, colorMap[factor.type] + '00');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      // Draw factor label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(factor.name, x, y + size + 15);
      ctx.fillText(`${factor.value.toFixed(1)} ${factor.unit}`, x, y + size + 28);
    });

    // Draw cancer clusters
    cancerClusters.forEach((cluster, index) => {
      const x = 200 + index * 150;
      const y = 150;
      const radius = cluster.location.radius * 20;

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Cluster label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Cancer Cluster', x, y + radius + 20);
    });

    // Draw legend
    const legendItems = [
      { color: '#ef4444', label: 'Air Quality' },
      { color: '#3b82f6', label: 'Water Quality' },
      { color: '#f59e0b', label: 'Radiation' },
      { color: '#8b5cf6', label: 'Chemical' },
      { color: '#dc2626', label: 'Cancer Cluster' }
    ];

    legendItems.forEach((item, index) => {
      const y = 20 + index * 20;
      ctx.fillStyle = item.color;
      ctx.fillRect(20, y, 15, 15);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, 45, y + 12);
    });
  };

  const drawRiskHeatmap = () => {
    const canvas = heatmapCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 300;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create heatmap grid
    const gridSize = 20;
    const cols = Math.floor(canvas.width / gridSize);
    const rows = Math.floor(canvas.height / gridSize);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * gridSize;
        const y = row * gridSize;

        // Calculate risk level based on position (simplified)
        const centerX = cols / 2;
        const centerY = rows / 2;
        const distance = Math.sqrt((col - centerX) ** 2 + (row - centerY) ** 2);
        const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
        const riskLevel = Math.max(0, 1 - distance / maxDistance);

        // Add some noise for realistic variation
        const noise = (Math.random() - 0.5) * 0.3;
        const adjustedRisk = Math.max(0, Math.min(1, riskLevel + noise));

        // Color based on risk level
        const hue = (1 - adjustedRisk) * 240; // Blue to red
        const saturation = 70;
        const lightness = 30 + adjustedRisk * 40;

        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fillRect(x, y, gridSize, gridSize);
      }
    }

    // Add overlay patterns for different risk types
    ctx.globalAlpha = 0.6;
    environmentalFactors.forEach((factor, index) => {
      const centerX = (index + 1) * (canvas.width / (environmentalFactors.length + 1));
      const centerY = canvas.height / 2;
      const radius = 50;

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, factor.riskLevel === 'high' ? '#ef444480' : '#fbbf2480');
      gradient.addColorStop(1, '#00000000');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Add scale
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.fillText('Risk Level: Low', 10, canvas.height - 30);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(80, canvas.height - 35, 20, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('High', canvas.width - 50, canvas.height - 30);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(canvas.width - 80, canvas.height - 35, 20, 10);
  };

  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'extreme': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskBgColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'low': return 'bg-green-50 border-green-200';
      case 'moderate': return 'bg-yellow-50 border-yellow-200';
      case 'high': return 'bg-orange-50 border-orange-200';
      case 'extreme': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-orange-100 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <Wind className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Air Quality</h3>
                <p className="text-sm text-gray-600">PM2.5 levels</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-red-600">
              {environmentalFactors.find(f => f.type === 'air_quality')?.value.toFixed(1) || 0}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            μg/m³ (WHO guideline: 15)
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Water Quality</h3>
                <p className="text-sm text-gray-600">Lead levels</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {environmentalFactors.find(f => f.type === 'water_quality')?.value.toFixed(1) || 0}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            ppb (EPA action: 15)
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Radiation</h3>
                <p className="text-sm text-gray-600">Background</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-yellow-600">
              {environmentalFactors.find(f => f.type === 'radiation')?.value.toFixed(2) || 0}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            μSv/h (Normal: 0.05-0.2)
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Alerts</h3>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-purple-600">{environmentalAlerts.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span>Environmental Monitoring Map</span>
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
                  <Bell className="h-4 w-4" />
                  <span>Stop Tracking</span>
                </>
              ) : (
                <>
                  <Satellite className="h-4 w-4" />
                  <span>Start Tracking</span>
                </>
              )}
            </button>
          </div>
          <div className="flex justify-center">
            <canvas
              ref={mapCanvasRef}
              className="border border-gray-300 rounded-lg bg-slate-900"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Thermometer className="h-5 w-5 text-red-500" />
            <span>Cancer Risk Heatmap</span>
          </h3>
          <div className="flex justify-center">
            <canvas
              ref={heatmapCanvasRef}
              className="border border-gray-300 rounded-lg bg-slate-900"
            />
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Color-coded cancer risk levels based on environmental exposure data
          </div>
        </div>
      </div>

      {personalExposures.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-500" />
            <span>Personal Exposure Assessment</span>
          </h3>
          {personalExposures.map((exposure) => (
            <div key={exposure.id} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(exposure.riskScore.current * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Current Risk</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {(exposure.riskScore.cumulative * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Cumulative Risk</div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(exposure.riskScore.predicted * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Predicted Risk</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Top Exposures</h4>
                  <div className="space-y-2">
                    {exposure.exposures.map((exp, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-900">{exp.factor}</span>
                          <div className="text-sm text-gray-600">
                            {exp.duration.toFixed(1)}h daily exposure
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-purple-600">
                            {(exp.riskContribution * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-500">contribution</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {exposure.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {environmentalAlerts.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Bell className="h-5 w-5 text-orange-500" />
            <span>Environmental Alerts</span>
          </h3>
          <div className="space-y-3">
            {environmentalAlerts.slice(0, 3).map((alert) => (
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
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    {alert.recommendations.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Recommendations:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                          {alert.recommendations.slice(0, 2).map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                    {alert.actionRequired && (
                      <div className="mt-1">
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                          Action Required
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderFactors = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Microscope className="h-5 w-5 text-green-500" />
            <span>Environmental Factor Analysis</span>
          </h3>
          <div className="flex items-center space-x-2">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
              Update
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {environmentalFactors.map((factor) => (
            <div key={factor.id} className={`rounded-lg p-4 border ${getRiskBgColor(factor.riskLevel)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    factor.type === 'air_quality' ? 'bg-red-500' :
                    factor.type === 'water_quality' ? 'bg-blue-500' :
                    factor.type === 'radiation' ? 'bg-yellow-500' :
                    factor.type === 'chemical' ? 'bg-purple-500' :
                    factor.type === 'noise' ? 'bg-green-500' :
                    'bg-pink-500'
                  }`}>
                    {factor.type === 'air_quality' && <Wind className="h-4 w-4 text-white" />}
                    {factor.type === 'water_quality' && <Droplets className="h-4 w-4 text-white" />}
                    {factor.type === 'radiation' && <Zap className="h-4 w-4 text-white" />}
                    {factor.type === 'chemical' && <FlaskConical className="h-4 w-4 text-white" />}
                    {factor.type === 'noise' && <Volume2 className="h-4 w-4 text-white" />}
                    {factor.type === 'electromagnetic' && <Radio className="h-4 w-4 text-white" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{factor.name}</h4>
                    <p className="text-sm text-gray-600">{factor.source}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {factor.value.toFixed(factor.type === 'radiation' ? 2 : 1)}
                  </div>
                  <div className="text-sm text-gray-600">{factor.unit}</div>
                  <div className={`text-xs font-medium capitalize ${getRiskColor(factor.riskLevel)}`}>
                    {factor.riskLevel} risk
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {(factor.healthImpact.cancerRisk * 100).toFixed(0)}%
                  </div>
                  <div className="text-gray-600">Cancer Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {(factor.healthImpact.respiratoryImpact * 100).toFixed(0)}%
                  </div>
                  <div className="text-gray-600">Respiratory</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {(factor.healthImpact.cardiovascularImpact * 100).toFixed(0)}%
                  </div>
                  <div className="text-gray-600">Cardiovascular</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {(factor.healthImpact.neurologicalImpact * 100).toFixed(0)}%
                  </div>
                  <div className="text-gray-600">Neurological</div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Last updated: {new Date(factor.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderClusters = () => (
    <div className="space-y-6">
      {cancerClusters.map((cluster) => (
        <div key={cluster.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Target className="h-5 w-5 text-red-500" />
              <span>Cancer Cluster Analysis</span>
            </h3>
            <div className="text-sm text-gray-600">
              {cluster.location.address}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Affected Population</h4>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {cluster.population.affected}
                </div>
                <div className="text-sm text-gray-600">
                  out of {cluster.population.total.toLocaleString()} residents
                </div>
                <div className="text-lg font-medium text-red-600 mt-2">
                  {((cluster.population.affected / cluster.population.total) * 100).toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Timeframe</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{cluster.timeframe.duration} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start:</span>
                  <span className="font-medium">{new Date(cluster.timeframe.startDate).getFullYear()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Radius:</span>
                  <span className="font-medium">{cluster.location.radius} km</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Statistical Significance</h4>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {cluster.cancerTypes[0]?.statisticalSignificance.toFixed(3) || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">p-value</div>
                <div className="text-sm font-medium text-green-600 mt-2">
                  {(cluster.cancerTypes[0]?.statisticalSignificance || 0) < 0.05 ? 'Statistically Significant' : 'Not Significant'}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Cancer Types</h4>
              <div className="space-y-3">
                {cluster.cancerTypes.map((cancer, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{cancer.type}</span>
                      <span className="text-sm text-red-600 font-medium">
                        {((cancer.incidenceRate / cancer.expectedRate - 1) * 100).toFixed(0)}% above expected
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Observed:</span>
                        <div className="font-bold">{cancer.incidenceRate.toFixed(1)}/100k</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Expected:</span>
                        <div className="font-bold">{cancer.expectedRate.toFixed(1)}/100k</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Environmental Correlations</h4>
              <div className="space-y-3">
                {cluster.environmentalCorrelations.map((correlation, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{correlation.factor}</span>
                      <span className="text-sm font-medium text-blue-600">
                        r = {correlation.correlationStrength.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Confidence:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${correlation.correlationStrength * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        [{correlation.confidenceInterval[0].toFixed(2)}, {correlation.confidenceInterval[1].toFixed(2)}]
                      </span>
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
    { id: 'overview', label: 'Environmental Overview', icon: Eye },
    { id: 'factors', label: 'Environmental Factors', icon: Microscope },
    { id: 'clusters', label: 'Cancer Clusters', icon: Target },
    { id: 'personal', label: 'Personal Exposure', icon: MapPin }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Precision Environmental Cancer Mapping
            </h1>
            <p className="text-gray-600">
              Real-time environmental monitoring and cancer risk assessment
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
                  ? 'border-green-500 text-green-600'
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
        {activeTab === 'factors' && renderFactors()}
        {activeTab === 'clusters' && renderClusters()}
        {activeTab === 'personal' && renderOverview()} {/* Reuse overview for personal tab */}
      </div>
    </div>
  );
};

export default PrecisionEnvironmentalMapping;