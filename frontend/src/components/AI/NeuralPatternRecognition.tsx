import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Eye, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Camera, 
  Mic, 
  Watch, 
  Smartphone,
  Zap,
  Target,
  Clock,
  Calendar,
  BarChart3,
  LineChart,
  Pulse,
  Users,
  Shield,
  Star,
  Bell,
  Play,
  Pause,
  RefreshCw,
  Download,
  Share,
  Settings,
  Info,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Waves,
  Fingerprint,
  Scan,
  Radar,
  Database,
  Cpu,
  Network
} from 'lucide-react';

interface NeuralPattern {
  id: string;
  patientId: string;
  timestamp: string;
  type: 'behavioral' | 'vocal' | 'visual' | 'cognitive' | 'motor';
  patterns: {
    sleepQuality: number;
    activityLevel: number;
    speechCadence: number;
    microExpressions: number;
    cognitiveLoad: number;
    motorCoordination: number;
  };
  anomalyScore: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  predictions: {
    recurrenceRisk: number;
    timeframe: string;
    confidence: number;
  };
}

interface SymptomConstellation {
  id: string;
  name: string;
  patterns: string[];
  severity: number;
  emergingRisk: number;
  detectionWindow: string;
  clinicalCorrelation: number;
  description: string;
}

interface BehavioralMetric {
  id: string;
  name: string;
  currentValue: number;
  baseline: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  deviation: number;
  significance: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: string;
}

interface MicroExpression {
  id: string;
  timestamp: string;
  emotion: 'pain' | 'fatigue' | 'anxiety' | 'depression' | 'discomfort';
  intensity: number;
  duration: number;
  frequency: number;
  context: string;
  aiConfidence: number;
}

export const NeuralPatternRecognition: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'constellations' | 'expressions' | 'predictions' | 'monitoring'>('overview');
  const [neuralPatterns, setNeuralPatterns] = useState<NeuralPattern[]>([]);
  const [symptomConstellations, setSymptomConstellations] = useState<SymptomConstellation[]>([]);
  const [behavioralMetrics, setBehavioralMetrics] = useState<BehavioralMetric[]>([]);
  const [microExpressions, setMicroExpressions] = useState<MicroExpression[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    // Mock neural pattern data
    const mockPatterns: NeuralPattern[] = [
      {
        id: '1',
        patientId: 'patient-001',
        timestamp: '2024-10-17T08:30:00Z',
        type: 'behavioral',
        patterns: {
          sleepQuality: 0.72,
          activityLevel: 0.68,
          speechCadence: 0.85,
          microExpressions: 0.79,
          cognitiveLoad: 0.73,
          motorCoordination: 0.81
        },
        anomalyScore: 0.23,
        confidence: 0.89,
        riskLevel: 'low',
        predictions: {
          recurrenceRisk: 0.15,
          timeframe: '6 months',
          confidence: 0.87
        }
      },
      {
        id: '2',
        patientId: 'patient-001',
        timestamp: '2024-10-16T14:20:00Z',
        type: 'vocal',
        patterns: {
          sleepQuality: 0.65,
          activityLevel: 0.58,
          speechCadence: 0.71,
          microExpressions: 0.74,
          cognitiveLoad: 0.69,
          motorCoordination: 0.76
        },
        anomalyScore: 0.34,
        confidence: 0.82,
        riskLevel: 'medium',
        predictions: {
          recurrenceRisk: 0.28,
          timeframe: '4 months',
          confidence: 0.79
        }
      },
      {
        id: '3',
        patientId: 'patient-001',
        timestamp: '2024-10-15T11:45:00Z',
        type: 'visual',
        patterns: {
          sleepQuality: 0.58,
          activityLevel: 0.52,
          speechCadence: 0.64,
          microExpressions: 0.67,
          cognitiveLoad: 0.61,
          motorCoordination: 0.69
        },
        anomalyScore: 0.45,
        confidence: 0.91,
        riskLevel: 'high',
        predictions: {
          recurrenceRisk: 0.42,
          timeframe: '3 months',
          confidence: 0.88
        }
      }
    ];

    const mockConstellations: SymptomConstellation[] = [
      {
        id: '1',
        name: 'Early Fatigue Syndrome',
        patterns: ['Decreased morning activity', 'Micro-sleep episodes', 'Reduced speech energy', 'Facial micro-expressions of exhaustion'],
        severity: 0.34,
        emergingRisk: 0.67,
        detectionWindow: '2-4 weeks before clinical manifestation',
        clinicalCorrelation: 0.89,
        description: 'Constellation of patterns indicating emerging cancer-related fatigue before clinical symptoms appear'
      },
      {
        id: '2',
        name: 'Cognitive Decline Precursors',
        patterns: ['Delayed response times', 'Reduced verbal fluency', 'Working memory lapses', 'Executive function markers'],
        severity: 0.28,
        emergingRisk: 0.45,
        detectionWindow: '3-6 weeks before clinical detection',
        clinicalCorrelation: 0.76,
        description: 'Neural patterns suggesting early chemo-brain or disease progression effects on cognition'
      },
      {
        id: '3',
        name: 'Pain Anticipation Patterns',
        patterns: ['Protective movement patterns', 'Facial micro-grimacing', 'Stress hormone indicators', 'Sleep fragmentation'],
        severity: 0.41,
        emergingRisk: 0.72,
        detectionWindow: '1-3 weeks before pain reports',
        clinicalCorrelation: 0.83,
        description: 'Behavioral patterns indicating developing pain before patient conscious awareness'
      }
    ];

    const mockBehavioralMetrics: BehavioralMetric[] = [
      {
        id: '1',
        name: 'Sleep Quality Index',
        currentValue: 7.2,
        baseline: 8.1,
        trend: 'decreasing',
        deviation: -11.1,
        significance: 'medium',
        lastUpdated: '2024-10-17T08:00:00Z'
      },
      {
        id: '2',
        name: 'Daily Activity Score',
        currentValue: 68.5,
        baseline: 75.3,
        trend: 'decreasing',
        deviation: -9.0,
        significance: 'medium',
        lastUpdated: '2024-10-17T07:45:00Z'
      },
      {
        id: '3',
        name: 'Speech Pattern Coherence',
        currentValue: 85.2,
        baseline: 89.7,
        trend: 'decreasing',
        deviation: -5.0,
        significance: 'low',
        lastUpdated: '2024-10-17T08:15:00Z'
      },
      {
        id: '4',
        name: 'Cognitive Response Time',
        currentValue: 1.47,
        baseline: 1.23,
        trend: 'increasing',
        deviation: 19.5,
        significance: 'high',
        lastUpdated: '2024-10-17T08:30:00Z'
      }
    ];

    const mockMicroExpressions: MicroExpression[] = [
      {
        id: '1',
        timestamp: '2024-10-17T08:25:00Z',
        emotion: 'fatigue',
        intensity: 0.67,
        duration: 2.3,
        frequency: 8,
        context: 'Morning routine',
        aiConfidence: 0.89
      },
      {
        id: '2',
        timestamp: '2024-10-17T08:22:00Z',
        emotion: 'discomfort',
        intensity: 0.45,
        duration: 1.8,
        frequency: 3,
        context: 'Movement transition',
        aiConfidence: 0.82
      },
      {
        id: '3',
        timestamp: '2024-10-17T08:18:00Z',
        emotion: 'anxiety',
        intensity: 0.38,
        duration: 3.1,
        frequency: 5,
        context: 'Device interaction',
        aiConfidence: 0.76
      }
    ];

    setNeuralPatterns(mockPatterns);
    setSymptomConstellations(mockConstellations);
    setBehavioralMetrics(mockBehavioralMetrics);
    setMicroExpressions(mockMicroExpressions);
  }, []);

  const startVideoMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setIsMonitoring(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopVideoMonitoring = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setIsMonitoring(false);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'low': return 'text-blue-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <ArrowDown className="h-4 w-4 text-blue-500" />;
      case 'stable': return <ChevronRight className="h-4 w-4 text-gray-500" />;
      default: return <ChevronRight className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Neural Pattern Recognition</h1>
        <p className="text-gray-600">AI-powered early detection through behavioral and physiological pattern analysis</p>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Brain className="h-6 w-6 text-blue-600 mr-2" />
              <span className="font-semibold text-gray-900">AI Monitoring Status</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${isMonitoring ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {isMonitoring ? 'Active' : 'Inactive'}
            </div>
          </div>
          <div className="flex space-x-3">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            {!isMonitoring ? (
              <button
                onClick={startVideoMonitoring}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Monitoring
              </button>
            ) : (
              <button
                onClick={stopVideoMonitoring}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
              >
                <Pause className="h-4 w-4 mr-2" />
                Stop Monitoring
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'patterns', label: 'Neural Patterns', icon: Brain },
            { id: 'constellations', label: 'Symptom Constellations', icon: Target },
            { id: 'expressions', label: 'Micro-Expressions', icon: Eye },
            { id: 'predictions', label: 'Predictions', icon: TrendingUp },
            { id: 'monitoring', label: 'Live Monitoring', icon: Camera }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-5 w-5 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <Brain className="h-8 w-8" />
                <div className="ml-4">
                  <p className="text-blue-100">Neural Patterns Detected</p>
                  <p className="text-2xl font-bold">{neuralPatterns.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <Target className="h-8 w-8" />
                <div className="ml-4">
                  <p className="text-green-100">Active Constellations</p>
                  <p className="text-2xl font-bold">{symptomConstellations.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <Eye className="h-8 w-8" />
                <div className="ml-4">
                  <p className="text-purple-100">Micro-Expressions</p>
                  <p className="text-2xl font-bold">{microExpressions.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8" />
                <div className="ml-4">
                  <p className="text-orange-100">Risk Alerts</p>
                  <p className="text-2xl font-bold">{neuralPatterns.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Behavioral Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Behavioral Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {behavioralMetrics.map(metric => (
                <div key={metric.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{metric.name}</h3>
                    <div className="flex items-center">
                      {getTrendIcon(metric.trend)}
                      <span className={`ml-1 text-sm font-medium ${getSignificanceColor(metric.significance)}`}>
                        {Math.abs(metric.deviation)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-gray-900">{metric.currentValue}</span>
                    <span className="text-sm text-gray-500">Baseline: {metric.baseline}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metric.significance === 'critical' ? 'bg-red-500' :
                        metric.significance === 'high' ? 'bg-orange-500' :
                        metric.significance === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${(metric.currentValue / metric.baseline) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Last updated: {new Date(metric.lastUpdated).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Neural Pattern Alerts</h2>
            <div className="space-y-4">
              {neuralPatterns.slice(0, 3).map(pattern => (
                <div key={pattern.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Brain className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {pattern.type.charAt(0).toUpperCase() + pattern.type.slice(1)} Pattern Detected
                      </p>
                      <p className="text-sm text-gray-600">
                        Anomaly Score: {(pattern.anomalyScore * 100).toFixed(1)}% | Confidence: {(pattern.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(pattern.riskLevel)}`}>
                      {pattern.riskLevel.charAt(0).toUpperCase() + pattern.riskLevel.slice(1)} Risk
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(pattern.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Neural Patterns Tab */}
      {activeTab === 'patterns' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {neuralPatterns.map(pattern => (
              <div key={pattern.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">{pattern.type} Pattern</h3>
                    <p className="text-sm text-gray-500">{new Date(pattern.timestamp).toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(pattern.riskLevel)}`}>
                    {pattern.riskLevel}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sleep Quality</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${pattern.patterns.sleepQuality * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{(pattern.patterns.sleepQuality * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Activity Level</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${pattern.patterns.activityLevel * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{(pattern.patterns.activityLevel * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Speech Cadence</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${pattern.patterns.speechCadence * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{(pattern.patterns.speechCadence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cognitive Load</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${pattern.patterns.cognitiveLoad * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{(pattern.patterns.cognitiveLoad * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Anomaly Score</span>
                    <span className="text-sm font-bold text-red-600">{(pattern.anomalyScore * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">AI Confidence</span>
                    <span className="text-sm font-bold text-blue-600">{(pattern.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Symptom Constellations Tab */}
      {activeTab === 'constellations' && (
        <div className="space-y-6">
          {symptomConstellations.map(constellation => (
            <div key={constellation.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{constellation.name}</h3>
                  <p className="text-gray-600 mt-2">{constellation.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">{(constellation.emergingRisk * 100).toFixed(0)}%</div>
                  <div className="text-sm text-gray-500">Emerging Risk</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{(constellation.severity * 100).toFixed(0)}%</div>
                  <div className="text-sm text-gray-500">Current Severity</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{(constellation.clinicalCorrelation * 100).toFixed(0)}%</div>
                  <div className="text-sm text-gray-500">Clinical Correlation</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{constellation.detectionWindow}</div>
                  <div className="text-sm text-gray-500">Detection Window</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Detected Patterns</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {constellation.patterns.map((pattern, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-700">{pattern}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Micro-Expressions Tab */}
      {activeTab === 'expressions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {microExpressions.map(expression => (
              <div key={expression.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">{expression.emotion}</h3>
                    <p className="text-sm text-gray-500">{expression.context}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">{(expression.intensity * 100).toFixed(0)}%</div>
                    <div className="text-xs text-gray-500">Intensity</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="text-sm font-medium">{expression.duration}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Frequency</span>
                    <span className="text-sm font-medium">{expression.frequency} times</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">AI Confidence</span>
                    <span className="text-sm font-medium text-blue-600">{(expression.aiConfidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Detected</span>
                    <span className="text-sm font-medium">{new Date(expression.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Live Facial Expression Monitoring</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 bg-gray-100 rounded-lg object-cover"
                  />
                  {cameraActive && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                        LIVE
                      </div>
                    </div>
                  )}
                  {!cameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Camera not active</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Real-Time Analysis</h3>
                {isMonitoring ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-900">AI Analysis Active</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">Monitoring micro-expressions and behavioral patterns</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Fatigue Indicators</span>
                        <span className="text-sm font-medium text-yellow-600">Low</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pain Signals</span>
                        <span className="text-sm font-medium text-green-600">None</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Stress Markers</span>
                        <span className="text-sm font-medium text-blue-600">Baseline</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Analysis Confidence</span>
                        <span className="text-sm font-medium text-blue-600">89%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <Pause className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Monitoring paused</p>
                    <p className="text-sm text-gray-500">Start monitoring to begin real-time analysis</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NeuralPatternRecognition;