import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Network, 
  Users, 
  Share2,
  Shield,
  Lock,
  Unlock,
  Database,
  Cloud,
  Server,
  Wifi,
  Signal,
  MapPin,
  TrendingUp,
  BarChart3,
  LineChart,
  PieChart,
  Eye,
  Settings,
  Filter,
  Search,
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Brain,
  DNA,
  Microscope,
  Activity,
  Target,
  Layers,
  Link,
  Copy,
  Download,
  Upload,
  RefreshCcw,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  MoreHorizontal,
  Flag,
  Star,
  Heart,
  Bookmark
} from 'lucide-react';

interface CancerTwin {
  id: string;
  patientId: string;
  location: {
    country: string;
    city: string;
    coordinates: [number, number];
    timezone: string;
  };
  demographics: {
    age: number;
    gender: 'M' | 'F' | 'Other';
    ethnicity: string;
    genetics: string[];
  };
  cancerProfile: {
    type: string;
    stage: string;
    grade: string;
    mutations: string[];
    biomarkers: { [key: string]: number };
    histology: string;
  };
  treatmentHistory: Array<{
    type: string;
    startDate: string;
    endDate?: string;
    response: 'complete' | 'partial' | 'stable' | 'progression';
    sideEffects: string[];
  }>;
  outcomes: {
    survivalTime: number;
    qualityOfLife: number;
    toxicityScore: number;
    responseRate: number;
  };
  similarity: number;
  lastUpdate: string;
  dataSharing: {
    level: 'anonymous' | 'pseudonymized' | 'identified';
    permissions: string[];
    consent: boolean;
  };
}

interface TwinMatch {
  id: string;
  similarity: number;
  matchCriteria: {
    genetics: number;
    demographics: number;
    cancerType: number;
    treatment: number;
    outcomes: number;
  };
  predictedOutcome: {
    survivalProbability: number;
    responseRate: number;
    toxicityRisk: number;
    qualityOfLifeScore: number;
  };
  recommendations: string[];
}

interface GlobalInsight {
  id: string;
  type: 'treatment_efficacy' | 'biomarker_discovery' | 'resistance_pattern' | 'outcome_prediction';
  title: string;
  description: string;
  dataPoints: number;
  significance: number;
  regions: string[];
  generatedAt: string;
  applications: string[];
}

interface NetworkStats {
  totalTwins: number;
  activeCountries: number;
  dataContributions: number;
  matchesGenerated: number;
  insightsDiscovered: number;
  networkHealth: number;
  latestUpdate: string;
}

const GlobalCancerTwinNetwork: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [cancerTwins, setCancerTwins] = useState<CancerTwin[]>([]);
  const [twinMatches, setTwinMatches] = useState<TwinMatch[]>([]);
  const [globalInsights, setGlobalInsights] = useState<GlobalInsight[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [selectedTwin, setSelectedTwin] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  const networkCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateMockTwinData();
    if (mapCanvasRef.current) {
      drawGlobalMap();
    }
    if (networkCanvasRef.current) {
      drawNetworkVisualization();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateNetworkStats();
      if (mapCanvasRef.current) {
        drawGlobalMap();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const generateMockTwinData = () => {
    const mockTwins: CancerTwin[] = [
      {
        id: 'twin001',
        patientId: 'patient123',
        location: {
          country: 'United States',
          city: 'Boston, MA',
          coordinates: [-71.0589, 42.3601],
          timezone: 'EST'
        },
        demographics: {
          age: 54,
          gender: 'F',
          ethnicity: 'Caucasian',
          genetics: ['BRCA1', 'TP53', 'PTEN']
        },
        cancerProfile: {
          type: 'Breast Cancer',
          stage: 'IIIA',
          grade: '2',
          mutations: ['BRCA1', 'PIK3CA'],
          biomarkers: {
            'HER2': 0.8,
            'ER': 0.9,
            'PR': 0.7,
            'Ki-67': 0.25
          },
          histology: 'Invasive Ductal Carcinoma'
        },
        treatmentHistory: [
          {
            type: 'Chemotherapy',
            startDate: '2024-01-15',
            endDate: '2024-04-15',
            response: 'partial',
            sideEffects: ['nausea', 'fatigue', 'neuropathy']
          },
          {
            type: 'Targeted Therapy',
            startDate: '2024-05-01',
            response: 'stable',
            sideEffects: ['diarrhea', 'skin rash']
          }
        ],
        outcomes: {
          survivalTime: 18.5,
          qualityOfLife: 0.73,
          toxicityScore: 0.34,
          responseRate: 0.68
        },
        similarity: 0.94,
        lastUpdate: new Date().toISOString(),
        dataSharing: {
          level: 'pseudonymized',
          permissions: ['treatment_outcomes', 'biomarker_data'],
          consent: true
        }
      },
      {
        id: 'twin002',
        patientId: 'patient456',
        location: {
          country: 'Germany',
          city: 'Munich',
          coordinates: [11.5820, 48.1351],
          timezone: 'CET'
        },
        demographics: {
          age: 52,
          gender: 'F',
          ethnicity: 'Caucasian',
          genetics: ['BRCA1', 'CHEK2']
        },
        cancerProfile: {
          type: 'Breast Cancer',
          stage: 'IIIB',
          grade: '3',
          mutations: ['BRCA1', 'TP53'],
          biomarkers: {
            'HER2': 0.2,
            'ER': 0.95,
            'PR': 0.85,
            'Ki-67': 0.35
          },
          histology: 'Invasive Ductal Carcinoma'
        },
        treatmentHistory: [
          {
            type: 'Neoadjuvant Chemotherapy',
            startDate: '2023-10-01',
            endDate: '2024-01-15',
            response: 'complete',
            sideEffects: ['alopecia', 'neutropenia']
          },
          {
            type: 'Surgery',
            startDate: '2024-02-01',
            endDate: '2024-02-01',
            response: 'complete',
            sideEffects: []
          }
        ],
        outcomes: {
          survivalTime: 24.2,
          qualityOfLife: 0.89,
          toxicityScore: 0.18,
          responseRate: 0.92
        },
        similarity: 0.87,
        lastUpdate: new Date(Date.now() - 3600000).toISOString(),
        dataSharing: {
          level: 'pseudonymized',
          permissions: ['all_data'],
          consent: true
        }
      },
      {
        id: 'twin003',
        patientId: 'patient789',
        location: {
          country: 'Japan',
          city: 'Tokyo',
          coordinates: [139.6503, 35.6762],
          timezone: 'JST'
        },
        demographics: {
          age: 48,
          gender: 'F',
          ethnicity: 'Asian',
          genetics: ['BRCA2', 'PALB2']
        },
        cancerProfile: {
          type: 'Breast Cancer',
          stage: 'IIA',
          grade: '2',
          mutations: ['BRCA2', 'CDH1'],
          biomarkers: {
            'HER2': 0.15,
            'ER': 0.88,
            'PR': 0.92,
            'Ki-67': 0.18
          },
          histology: 'Invasive Lobular Carcinoma'
        },
        treatmentHistory: [
          {
            type: 'Hormonal Therapy',
            startDate: '2024-03-01',
            response: 'stable',
            sideEffects: ['hot flashes', 'joint pain']
          }
        ],
        outcomes: {
          survivalTime: 12.8,
          qualityOfLife: 0.81,
          toxicityScore: 0.12,
          responseRate: 0.75
        },
        similarity: 0.76,
        lastUpdate: new Date(Date.now() - 7200000).toISOString(),
        dataSharing: {
          level: 'anonymous',
          permissions: ['outcomes_only'],
          consent: true
        }
      }
    ];

    const mockMatches: TwinMatch[] = [
      {
        id: 'match001',
        similarity: 0.94,
        matchCriteria: {
          genetics: 0.95,
          demographics: 0.88,
          cancerType: 0.98,
          treatment: 0.82,
          outcomes: 0.89
        },
        predictedOutcome: {
          survivalProbability: 0.87,
          responseRate: 0.73,
          toxicityRisk: 0.28,
          qualityOfLifeScore: 0.81
        },
        recommendations: [
          'Consider similar chemotherapy protocol',
          'Monitor for neuropathy side effects',
          'Evaluate for targeted therapy options'
        ]
      },
      {
        id: 'match002',
        similarity: 0.87,
        matchCriteria: {
          genetics: 0.92,
          demographics: 0.85,
          cancerType: 0.96,
          treatment: 0.78,
          outcomes: 0.84
        },
        predictedOutcome: {
          survivalProbability: 0.92,
          responseRate: 0.84,
          toxicityRisk: 0.19,
          qualityOfLifeScore: 0.89
        },
        recommendations: [
          'Excellent prognosis based on similar cases',
          'Consider neoadjuvant approach',
          'Strong surgical candidacy'
        ]
      }
    ];

    const mockInsights: GlobalInsight[] = [
      {
        id: 'insight001',
        type: 'treatment_efficacy',
        title: 'BRCA1+ Breast Cancer Response Patterns',
        description: 'Analysis of 15,847 BRCA1-positive breast cancer cases reveals enhanced response to platinum-based chemotherapy across diverse populations.',
        dataPoints: 15847,
        significance: 0.94,
        regions: ['North America', 'Europe', 'Asia'],
        generatedAt: new Date().toISOString(),
        applications: ['Treatment Selection', 'Protocol Optimization', 'Outcome Prediction']
      },
      {
        id: 'insight002',
        type: 'biomarker_discovery',
        title: 'Novel HER2-Low Subtype Characteristics',
        description: 'Identification of distinct treatment response patterns in HER2-low breast cancer patients based on global cohort analysis.',
        dataPoints: 23156,
        significance: 0.89,
        regions: ['Global'],
        generatedAt: new Date(Date.now() - 3600000).toISOString(),
        applications: ['Biomarker Development', 'Patient Stratification', 'Drug Development']
      }
    ];

    const mockStats: NetworkStats = {
      totalTwins: 847362,
      activeCountries: 64,
      dataContributions: 2847291,
      matchesGenerated: 156438,
      insightsDiscovered: 1247,
      networkHealth: 0.96,
      latestUpdate: new Date().toISOString()
    };

    setCancerTwins(mockTwins);
    setTwinMatches(mockMatches);
    setGlobalInsights(mockInsights);
    setNetworkStats(mockStats);
  };

  const updateNetworkStats = () => {
    if (networkStats) {
      setNetworkStats(prev => prev ? {
        ...prev,
        totalTwins: prev.totalTwins + Math.floor(Math.random() * 10),
        dataContributions: prev.dataContributions + Math.floor(Math.random() * 50),
        matchesGenerated: prev.matchesGenerated + Math.floor(Math.random() * 5),
        networkHealth: 0.94 + Math.random() * 0.06,
        latestUpdate: new Date().toISOString()
      } : null);
    }
  };

  const drawGlobalMap = () => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 400;

    // Fill background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw simplified world map outline
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Simplified continent outlines
    ctx.rect(100, 100, 200, 80); // North America
    ctx.rect(320, 120, 150, 100); // Europe
    ctx.rect(480, 140, 180, 120); // Asia
    ctx.rect(150, 220, 120, 100); // South America
    ctx.rect(350, 240, 100, 80); // Africa
    ctx.rect(600, 280, 80, 60); // Australia
    ctx.stroke();

    // Draw twin locations
    const time = Date.now() * 0.001;
    cancerTwins.forEach((twin, index) => {
      // Convert coordinates to canvas position (simplified)
      const x = ((twin.location.coordinates[0] + 180) / 360) * canvas.width;
      const y = ((90 - twin.location.coordinates[1]) / 180) * canvas.height;

      // Draw pulsing dots for each twin
      const pulseSize = 8 + Math.sin(time + index) * 3;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, pulseSize);
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(0.7, '#1d4ed8');
      gradient.addColorStop(1, '#1e3a8a00');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
      ctx.fill();

      // Draw connection lines between similar twins
      cancerTwins.forEach((otherTwin, otherIndex) => {
        if (index !== otherIndex && twin.similarity > 0.8) {
          const otherX = ((otherTwin.location.coordinates[0] + 180) / 360) * canvas.width;
          const otherY = ((90 - otherTwin.location.coordinates[1]) / 180) * canvas.height;
          
          ctx.strokeStyle = `rgba(59, 130, 246, ${twin.similarity * 0.5})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(otherX, otherY);
          ctx.stroke();
        }
      });
    });

    // Draw network statistics overlay
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Active Twins: ${networkStats?.totalTwins.toLocaleString() || 0}`, 20, 30);
    ctx.fillText(`Countries: ${networkStats?.activeCountries || 0}`, 20, 50);
    ctx.fillText(`Network Health: ${((networkStats?.networkHealth || 0) * 100).toFixed(1)}%`, 20, 70);
  };

  const drawNetworkVisualization = () => {
    const canvas = networkCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 500;
    canvas.height = 300;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() * 0.001;

    // Draw network nodes
    const nodes = [
      { x: centerX, y: centerY, size: 20, label: 'Primary', color: '#ef4444' },
      { x: centerX - 120, y: centerY - 80, size: 15, label: 'Match 1', color: '#3b82f6' },
      { x: centerX + 100, y: centerY - 60, size: 12, label: 'Match 2', color: '#10b981' },
      { x: centerX - 80, y: centerY + 90, size: 14, label: 'Match 3', color: '#f59e0b' },
      { x: centerX + 130, y: centerY + 70, size: 11, label: 'Match 4', color: '#8b5cf6' }
    ];

    // Draw connections
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    for (let i = 1; i < nodes.length; i++) {
      const similarity = 1 - (i * 0.1);
      ctx.globalAlpha = similarity;
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      ctx.lineTo(nodes[i].x, nodes[i].y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Draw nodes
    nodes.forEach((node, index) => {
      const pulseSize = node.size + Math.sin(time + index) * 2;
      
      const gradient = ctx.createRadialGradient(
        node.x, node.y, 0,
        node.x, node.y, pulseSize
      );
      gradient.addColorStop(0, node.color);
      gradient.addColorStop(0.7, node.color + '88');
      gradient.addColorStop(1, node.color + '00');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
      ctx.fill();

      // Node labels
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + pulseSize + 15);
    });
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Global Twins</h3>
                <p className="text-sm text-gray-600">Active network</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {networkStats?.totalTwins.toLocaleString() || 0}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Flag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Countries</h3>
                <p className="text-sm text-gray-600">Contributing</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {networkStats?.activeCountries || 0}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Link className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Matches</h3>
                <p className="text-sm text-gray-600">Generated</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {networkStats?.matchesGenerated.toLocaleString() || 0}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Insights</h3>
                <p className="text-sm text-gray-600">Discovered</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-orange-600">
              {networkStats?.insightsDiscovered.toLocaleString() || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <span>Global Twin Distribution</span>
            </h3>
            <div className={`flex items-center space-x-2 ${
              (networkStats?.networkHealth || 0) > 0.9 ? 'text-green-600' : 'text-yellow-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                (networkStats?.networkHealth || 0) > 0.9 ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'
              }`} />
              <span className="text-sm font-medium">
                Network Health: {((networkStats?.networkHealth || 0) * 100).toFixed(1)}%
              </span>
            </div>
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
            <Network className="h-5 w-5 text-purple-500" />
            <span>Twin Matching Network</span>
          </h3>
          <div className="flex justify-center mb-4">
            <canvas
              ref={networkCanvasRef}
              className="border border-gray-300 rounded-lg bg-slate-900"
            />
          </div>
          <div className="text-center text-sm text-gray-600">
            Patient matched with {twinMatches.length} similar cases globally
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Brain className="h-5 w-5 text-orange-500" />
          <span>Latest Global Insights</span>
        </h3>
        <div className="space-y-4">
          {globalInsights.slice(0, 3).map((insight) => (
            <div key={insight.id} className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                </div>
                <div className="text-right text-sm">
                  <div className="font-bold text-orange-600">
                    {insight.dataPoints.toLocaleString()}
                  </div>
                  <div className="text-gray-500">data points</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {insight.applications.slice(0, 2).map((app) => (
                    <span key={app} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                      {app}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  Significance: {(insight.significance * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTwinMatches = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Link className="h-5 w-5 text-purple-500" />
            <span>Your Cancer Twin Matches</span>
          </h3>
          <button
            onClick={() => setIsConnecting(!isConnecting)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              isConnecting 
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isConnecting ? (
              <>
                <RefreshCcw className="h-4 w-4 animate-spin" />
                <span>Finding Matches...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Find New Matches</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          {twinMatches.map((match) => (
            <div key={match.id} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {(match.similarity * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Match</div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Similar Patient Profile</h4>
                    <p className="text-sm text-gray-600">
                      Based on genetics, demographics, cancer type, and treatment history
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium hover:bg-purple-200">
                  View Details
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                {Object.entries(match.matchCriteria).map(([criteria, value]) => (
                  <div key={criteria} className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {(value * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-600 capitalize">
                      {criteria.replace('_', ' ')}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-lg p-4 mb-4">
                <h5 className="font-medium text-gray-900 mb-3">Predicted Outcomes</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {(match.predictedOutcome.survivalProbability * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-600">Survival Probability</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {(match.predictedOutcome.responseRate * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-600">Response Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">
                      {(match.predictedOutcome.toxicityRisk * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-600">Toxicity Risk</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {(match.predictedOutcome.qualityOfLifeScore * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-600">Quality of Life</div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2">Clinical Recommendations</h5>
                <div className="space-y-1">
                  {match.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGlobalInsights = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Brain className="h-5 w-5 text-orange-500" />
            <span>Global Cancer Intelligence</span>
          </h3>
          <div className="flex items-center space-x-2">
            <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
              <option>All Types</option>
              <option>Treatment Efficacy</option>
              <option>Biomarker Discovery</option>
              <option>Resistance Patterns</option>
            </select>
            <button className="px-3 py-1 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">
              Filter
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {globalInsights.map((insight) => (
            <div key={insight.id} className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      insight.type === 'treatment_efficacy' ? 'bg-blue-500' :
                      insight.type === 'biomarker_discovery' ? 'bg-green-500' :
                      insight.type === 'resistance_pattern' ? 'bg-red-500' :
                      'bg-purple-500'
                    }`}>
                      {insight.type === 'treatment_efficacy' && <Target className="h-4 w-4 text-white" />}
                      {insight.type === 'biomarker_discovery' && <DNA className="h-4 w-4 text-white" />}
                      {insight.type === 'resistance_pattern' && <Shield className="h-4 w-4 text-white" />}
                      {insight.type === 'outcome_prediction' && <TrendingUp className="h-4 w-4 text-white" />}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{insight.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      insight.type === 'treatment_efficacy' ? 'bg-blue-100 text-blue-800' :
                      insight.type === 'biomarker_discovery' ? 'bg-green-100 text-green-800' :
                      insight.type === 'resistance_pattern' ? 'bg-red-100 text-red-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {insight.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{insight.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-2xl font-bold text-orange-600">
                        {insight.dataPoints.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Data Points</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-600">
                        {(insight.significance * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600">Significance</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-600">
                        {insight.regions.length}
                      </div>
                      <div className="text-sm text-gray-600">Regions</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {insight.applications.map((app) => (
                        <span key={app} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                          {app}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button className="px-3 py-1 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">
                        View Full Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Network Overview', icon: Eye },
    { id: 'matches', label: 'Twin Matches', icon: Link },
    { id: 'insights', label: 'Global Insights', icon: Brain },
    { id: 'privacy', label: 'Privacy & Sharing', icon: Shield }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Global Cancer Twin Network
            </h1>
            <p className="text-gray-600">
              Connect with similar patients worldwide for shared insights and outcomes
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
        {activeTab === 'matches' && renderTwinMatches()}
        {activeTab === 'insights' && renderGlobalInsights()}
        {activeTab === 'privacy' && renderOverview()} {/* Placeholder for privacy tab */}
      </div>
    </div>
  );
};

export default GlobalCancerTwinNetwork;