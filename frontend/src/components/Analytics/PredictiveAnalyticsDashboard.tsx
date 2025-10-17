import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Brain, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  BarChart3, 
  PieChart, 
  LineChart,
  Calendar,
  Clock,
  Users,
  Heart,
  Zap,
  Shield,
  Microscope,
  TestTube,
  Pill,
  Stethoscope,
  Eye,
  Download,
  Filter,
  RefreshCw,
  Settings,
  Info,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Star,
  AlertCircle,
  Database,
  Cpu,
  Network,
  BarChart,
  Map,
  Layers,
  Search,
  Bell,
  BookOpen,
  FileText,
  Share
} from 'lucide-react';

interface PredictionModel {
  id: string;
  name: string;
  type: 'survival' | 'response' | 'toxicity' | 'recurrence' | 'progression' | 'quality_of_life';
  accuracy: number;
  confidence: number;
  lastTrained: string;
  dataPoints: number;
  status: 'active' | 'training' | 'validation' | 'deprecated';
  description: string;
  version: string;
}

interface PatientCohort {
  id: string;
  name: string;
  size: number;
  diagnosis: string;
  stage: string;
  averageAge: number;
  survivalRate: number;
  responseRate: number;
  riskFactors: string[];
  treatmentProtocols: string[];
  followUpMonths: number;
}

interface TrendAnalysis {
  id: string;
  metric: string;
  currentValue: number;
  previousValue: number;
  changePercent: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  significance: 'high' | 'medium' | 'low';
  timeframe: string;
  category: 'clinical' | 'operational' | 'safety' | 'quality';
  prediction: {
    nextMonth: number;
    nextQuarter: number;
    confidence: number;
  };
}

interface RiskAlert {
  id: string;
  patientId: string;
  patientName: string;
  riskType: 'progression' | 'toxicity' | 'adverse_event' | 'non_compliance' | 'mortality';
  riskScore: number;
  probability: number;
  timeframe: string;
  factors: Array<{
    factor: string;
    weight: number;
    impact: 'positive' | 'negative';
  }>;
  recommendations: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  status: 'new' | 'acknowledged' | 'acted_upon' | 'resolved';
}

interface OutcomeMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: number;
  benchmark: number;
  category: 'survival' | 'response' | 'safety' | 'quality';
  timeSeriesData: Array<{
    date: string;
    value: number;
    predicted?: boolean;
  }>;
}

export const PredictiveAnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'cohorts' | 'trends' | 'alerts' | 'outcomes'>('overview');
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [cohorts, setCohorts] = useState<PatientCohort[]>([]);
  const [trends, setTrends] = useState<TrendAnalysis[]>([]);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeMetric[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('3M');
  const [filterCategory, setFilterCategory] = useState<'all' | 'clinical' | 'operational' | 'safety' | 'quality'>('all');

  useEffect(() => {
    // Mock data initialization
    const mockModels: PredictionModel[] = [
      {
        id: '1',
        name: 'Breast Cancer Survival Predictor',
        type: 'survival',
        accuracy: 87.3,
        confidence: 92.1,
        lastTrained: '2024-10-15T08:00:00Z',
        dataPoints: 15420,
        status: 'active',
        description: 'Predicts 5-year survival rates for breast cancer patients based on clinical and genomic factors',
        version: '2.1.4'
      },
      {
        id: '2',
        name: 'Immunotherapy Response Model',
        type: 'response',
        accuracy: 79.8,
        confidence: 85.6,
        lastTrained: '2024-10-14T12:00:00Z',
        dataPoints: 8750,
        status: 'active',
        description: 'Predicts response to checkpoint inhibitor therapy using biomarker and clinical data',
        version: '1.8.2'
      },
      {
        id: '3',
        name: 'Chemotherapy Toxicity Predictor',
        type: 'toxicity',
        accuracy: 82.5,
        confidence: 78.9,
        lastTrained: '2024-10-16T06:00:00Z',
        dataPoints: 12100,
        status: 'training',
        description: 'Predicts likelihood and severity of chemotherapy-related adverse events',
        version: '3.0.1'
      },
      {
        id: '4',
        name: 'Cancer Recurrence Risk Assessment',
        type: 'recurrence',
        accuracy: 84.7,
        confidence: 89.3,
        lastTrained: '2024-10-13T14:00:00Z',
        dataPoints: 9800,
        status: 'active',
        description: 'Assesses risk of cancer recurrence within 2 years post-treatment',
        version: '2.5.0'
      }
    ];

    const mockCohorts: PatientCohort[] = [
      {
        id: '1',
        name: 'Stage III Breast Cancer Cohort',
        size: 450,
        diagnosis: 'Breast Cancer',
        stage: 'Stage III',
        averageAge: 56.2,
        survivalRate: 78.5,
        responseRate: 65.8,
        riskFactors: ['HER2+', 'Node positive', 'High grade'],
        treatmentProtocols: ['Neoadjuvant chemotherapy', 'Surgery', 'Adjuvant therapy'],
        followUpMonths: 36
      },
      {
        id: '2',
        name: 'Lung Cancer Immunotherapy Group',
        size: 320,
        diagnosis: 'Non-Small Cell Lung Cancer',
        stage: 'Stage IV',
        averageAge: 62.8,
        survivalRate: 42.3,
        responseRate: 38.9,
        riskFactors: ['PD-L1 high', 'Smoker', 'Metastatic'],
        treatmentProtocols: ['Pembrolizumab', 'Combination therapy'],
        followUpMonths: 24
      },
      {
        id: '3',
        name: 'Colorectal Cancer MSI-H Cohort',
        size: 180,
        diagnosis: 'Colorectal Cancer',
        stage: 'Stage II-III',
        averageAge: 59.1,
        survivalRate: 85.2,
        responseRate: 72.4,
        riskFactors: ['MSI-H', 'Lynch syndrome', 'Right-sided'],
        treatmentProtocols: ['FOLFOX', 'Adjuvant immunotherapy'],
        followUpMonths: 48
      }
    ];

    const mockTrends: TrendAnalysis[] = [
      {
        id: '1',
        metric: 'Treatment Response Rate',
        currentValue: 68.5,
        previousValue: 64.2,
        changePercent: 6.7,
        trend: 'increasing',
        significance: 'high',
        timeframe: 'Last 6 months',
        category: 'clinical',
        prediction: {
          nextMonth: 69.8,
          nextQuarter: 72.1,
          confidence: 87.3
        }
      },
      {
        id: '2',
        metric: 'Average Time to Treatment',
        currentValue: 12.3,
        previousValue: 15.7,
        changePercent: -21.7,
        trend: 'decreasing',
        significance: 'high',
        timeframe: 'Last 3 months',
        category: 'operational',
        prediction: {
          nextMonth: 11.8,
          nextQuarter: 10.9,
          confidence: 82.5
        }
      },
      {
        id: '3',
        metric: 'Grade 3+ Adverse Events',
        currentValue: 18.2,
        previousValue: 22.1,
        changePercent: -17.6,
        trend: 'decreasing',
        significance: 'medium',
        timeframe: 'Last 4 months',
        category: 'safety',
        prediction: {
          nextMonth: 17.1,
          nextQuarter: 15.8,
          confidence: 79.2
        }
      },
      {
        id: '4',
        metric: 'Patient Satisfaction Score',
        currentValue: 4.7,
        previousValue: 4.4,
        changePercent: 6.8,
        trend: 'increasing',
        significance: 'medium',
        timeframe: 'Last 2 months',
        category: 'quality',
        prediction: {
          nextMonth: 4.8,
          nextQuarter: 4.9,
          confidence: 75.6
        }
      }
    ];

    const mockAlerts: RiskAlert[] = [
      {
        id: '1',
        patientId: 'p001',
        patientName: 'Emily Rodriguez',
        riskType: 'progression',
        riskScore: 8.2,
        probability: 78.5,
        timeframe: 'Next 3 months',
        factors: [
          { factor: 'Rising tumor markers', weight: 0.35, impact: 'negative' },
          { factor: 'Treatment resistance genes', weight: 0.28, impact: 'negative' },
          { factor: 'Poor treatment adherence', weight: 0.22, impact: 'negative' },
          { factor: 'Age factor', weight: 0.15, impact: 'negative' }
        ],
        recommendations: [
          'Consider imaging studies',
          'Review treatment protocol',
          'Genetic counseling consultation',
          'Enhanced monitoring schedule'
        ],
        priority: 'high',
        createdAt: '2024-10-17T09:30:00Z',
        status: 'new'
      },
      {
        id: '2',
        patientId: 'p002',
        patientName: 'Michael Chen',
        riskType: 'toxicity',
        riskScore: 7.1,
        probability: 65.3,
        timeframe: 'Next cycle',
        factors: [
          { factor: 'Declining renal function', weight: 0.42, impact: 'negative' },
          { factor: 'Previous grade 2 neuropathy', weight: 0.31, impact: 'negative' },
          { factor: 'Age > 70', weight: 0.27, impact: 'negative' }
        ],
        recommendations: [
          'Dose reduction consideration',
          'Enhanced toxicity monitoring',
          'Nephrology consultation',
          'Alternative regimen evaluation'
        ],
        priority: 'medium',
        createdAt: '2024-10-17T08:15:00Z',
        status: 'acknowledged'
      },
      {
        id: '3',
        patientId: 'p003',
        patientName: 'Sarah Johnson',
        riskType: 'non_compliance',
        riskScore: 6.8,
        probability: 58.7,
        timeframe: 'Ongoing',
        factors: [
          { factor: 'Missed appointments', weight: 0.38, impact: 'negative' },
          { factor: 'Social barriers', weight: 0.32, impact: 'negative' },
          { factor: 'Complex regimen', weight: 0.30, impact: 'negative' }
        ],
        recommendations: [
          'Social worker consultation',
          'Simplified medication schedule',
          'Patient education reinforcement',
          'Transportation assistance'
        ],
        priority: 'medium',
        createdAt: '2024-10-17T07:45:00Z',
        status: 'acted_upon'
      }
    ];

    const mockOutcomes: OutcomeMetric[] = [
      {
        id: '1',
        name: 'Overall Survival Rate',
        value: 73.2,
        unit: '%',
        trend: 2.1,
        benchmark: 70.5,
        category: 'survival',
        timeSeriesData: [
          { date: '2024-01', value: 71.1 },
          { date: '2024-02', value: 71.8 },
          { date: '2024-03', value: 72.3 },
          { date: '2024-04', value: 72.1 },
          { date: '2024-05', value: 72.9 },
          { date: '2024-06', value: 73.2 },
          { date: '2024-07', value: 73.8, predicted: true },
          { date: '2024-08', value: 74.1, predicted: true }
        ]
      },
      {
        id: '2',
        name: 'Complete Response Rate',
        value: 41.7,
        unit: '%',
        trend: 3.8,
        benchmark: 38.5,
        category: 'response',
        timeSeriesData: [
          { date: '2024-01', value: 38.9 },
          { date: '2024-02', value: 39.2 },
          { date: '2024-03', value: 40.1 },
          { date: '2024-04', value: 40.8 },
          { date: '2024-05', value: 41.2 },
          { date: '2024-06', value: 41.7 },
          { date: '2024-07', value: 42.3, predicted: true },
          { date: '2024-08', value: 42.9, predicted: true }
        ]
      },
      {
        id: '3',
        name: 'Grade 3+ Toxicity Rate',
        value: 15.4,
        unit: '%',
        trend: -2.3,
        benchmark: 18.0,
        category: 'safety',
        timeSeriesData: [
          { date: '2024-01', value: 17.8 },
          { date: '2024-02', value: 17.2 },
          { date: '2024-03', value: 16.9 },
          { date: '2024-04', value: 16.3 },
          { date: '2024-05', value: 15.8 },
          { date: '2024-06', value: 15.4 },
          { date: '2024-07', value: 14.9, predicted: true },
          { date: '2024-08', value: 14.5, predicted: true }
        ]
      }
    ];

    setModels(mockModels);
    setCohorts(mockCohorts);
    setTrends(mockTrends);
    setAlerts(mockAlerts);
    setOutcomes(mockOutcomes);
  }, []);

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'validation': return 'bg-yellow-100 text-yellow-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'decreasing': return <ArrowDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <ChevronRight className="h-4 w-4 text-gray-600" />;
      default: return <ChevronRight className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRiskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredTrends = trends.filter(trend => 
    filterCategory === 'all' || trend.category === filterCategory
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Predictive Analytics Dashboard</h1>
        <p className="text-gray-600">Advanced insights and forecasting for improved patient outcomes</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'models', label: 'AI Models', icon: Brain },
            { id: 'cohorts', label: 'Patient Cohorts', icon: Users },
            { id: 'trends', label: 'Trend Analysis', icon: TrendingUp },
            { id: 'alerts', label: 'Risk Alerts', icon: AlertTriangle },
            { id: 'outcomes', label: 'Outcome Metrics', icon: Target }
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
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <Brain className="h-8 w-8" />
                <div className="ml-4">
                  <p className="text-blue-100">Active AI Models</p>
                  <p className="text-2xl font-bold">{models.filter(m => m.status === 'active').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <Users className="h-8 w-8" />
                <div className="ml-4">
                  <p className="text-green-100">Patient Cohorts</p>
                  <p className="text-2xl font-bold">{cohorts.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8" />
                <div className="ml-4">
                  <p className="text-orange-100">Active Alerts</p>
                  <p className="text-2xl font-bold">{alerts.filter(a => a.status === 'new').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <Target className="h-8 w-8" />
                <div className="ml-4">
                  <p className="text-purple-100">Prediction Accuracy</p>
                  <p className="text-2xl font-bold">84.2%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Predictions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Latest AI Predictions</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Brain className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900">High-risk progression prediction</p>
                    <p className="text-sm text-blue-700">Patient cohort analysis completed with 87% confidence</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600">2 hours ago</p>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">Treatment response forecast updated</p>
                    <p className="text-sm text-green-700">Immunotherapy cohort showing improved response rates</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600">4 hours ago</p>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium">View Details</button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-900">Toxicity risk assessment</p>
                    <p className="text-sm text-yellow-700">3 patients flagged for enhanced monitoring</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-yellow-600">6 hours ago</p>
                  <button className="text-yellow-600 hover:text-yellow-800 text-sm font-medium">View Details</button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Model Performance Summary</h3>
              <div className="space-y-3">
                {models.slice(0, 3).map(model => (
                  <div key={model.id} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{model.name}</span>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${model.accuracy}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{model.accuracy}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Risk Alert Distribution</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Critical Risk</span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    {alerts.filter(a => a.priority === 'critical').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">High Risk</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    {alerts.filter(a => a.priority === 'high').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Medium Risk</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    {alerts.filter(a => a.priority === 'medium').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Low Risk</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {alerts.filter(a => a.priority === 'low').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Models Tab */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">AI Prediction Models</h2>
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retrain All
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                New Model
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {models.map(model => (
              <div key={model.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getModelStatusColor(model.status)}`}>
                    {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Accuracy</p>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${model.accuracy}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-green-600">{model.accuracy}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Confidence</p>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${model.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{model.confidence}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Version:</span>
                    <span className="font-medium">{model.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data Points:</span>
                    <span className="font-medium">{model.dataPoints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Trained:</span>
                    <span className="font-medium">{new Date(model.lastTrained).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700">
                    View Details
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg">
                    <Settings className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient Cohorts Tab */}
      {activeTab === 'cohorts' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Patient Cohorts Analysis</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Create Cohort
            </button>
          </div>

          <div className="space-y-6">
            {cohorts.map(cohort => (
              <div key={cohort.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{cohort.name}</h3>
                    <p className="text-gray-600">{cohort.diagnosis} - {cohort.stage}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{cohort.size}</p>
                    <p className="text-sm text-gray-500">patients</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{cohort.survivalRate}%</p>
                    <p className="text-sm text-gray-500">Survival Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{cohort.responseRate}%</p>
                    <p className="text-sm text-gray-500">Response Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{cohort.averageAge}</p>
                    <p className="text-sm text-gray-500">Avg Age</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{cohort.followUpMonths}</p>
                    <p className="text-sm text-gray-500">Follow-up (mo)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Risk Factors</h4>
                    <div className="flex flex-wrap gap-2">
                      {cohort.riskFactors.map(factor => (
                        <span key={factor} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Treatment Protocols</h4>
                    <div className="flex flex-wrap gap-2">
                      {cohort.treatmentProtocols.map(protocol => (
                        <span key={protocol} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {protocol}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    View Analysis
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend Analysis Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Trend Analysis</h2>
            <div className="flex space-x-3">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
              >
                <option value="all">All Categories</option>
                <option value="clinical">Clinical</option>
                <option value="operational">Operational</option>
                <option value="safety">Safety</option>
                <option value="quality">Quality</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              >
                <option value="1M">1 Month</option>
                <option value="3M">3 Months</option>
                <option value="6M">6 Months</option>
                <option value="1Y">1 Year</option>
                <option value="ALL">All Time</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTrends.map(trend => (
              <div key={trend.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{trend.metric}</h3>
                    <p className="text-sm text-gray-500">{trend.timeframe}</p>
                  </div>
                  <div className="flex items-center">
                    {getTrendIcon(trend.trend)}
                    <span className={`ml-1 text-sm font-medium ${
                      trend.trend === 'increasing' ? 'text-green-600' :
                      trend.trend === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {Math.abs(trend.changePercent)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Value</p>
                    <p className="text-2xl font-bold text-gray-900">{trend.currentValue}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Previous Value</p>
                    <p className="text-xl font-semibold text-gray-600">{trend.previousValue}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Predictions</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Next Month:</span>
                      <span className="font-medium">{trend.prediction.nextMonth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Quarter:</span>
                      <span className="font-medium">{trend.prediction.nextQuarter}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence:</span>
                      <span className="font-medium text-blue-600">{trend.prediction.confidence}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    trend.significance === 'high' ? 'bg-red-100 text-red-800' :
                    trend.significance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {trend.significance} significance
                  </span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Chart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Risk Alerts</h2>
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Configure Alerts
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {alerts.map(alert => (
              <div key={alert.id} className={`bg-white rounded-lg border-2 p-6 ${getRiskPriorityColor(alert.priority)}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{alert.patientName}</h3>
                      <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${getRiskPriorityColor(alert.priority)}`}>
                        {alert.priority} risk
                      </span>
                    </div>
                    <p className="text-gray-600">{alert.riskType.replace('_', ' ').charAt(0).toUpperCase() + alert.riskType.replace('_', ' ').slice(1)} risk in {alert.timeframe}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">{alert.probability}%</p>
                    <p className="text-sm text-gray-500">probability</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Risk Factors</h4>
                    <div className="space-y-2">
                      {alert.factors.map((factor, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">{factor.factor}</span>
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${factor.impact === 'negative' ? 'bg-red-500' : 'bg-green-500'}`}
                                style={{ width: `${factor.weight * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{Math.round(factor.weight * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                    <ul className="space-y-1">
                      {alert.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Created: {new Date(alert.createdAt).toLocaleString()}
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                      View Patient
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm">
                      Acknowledge
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outcome Metrics Tab */}
      {activeTab === 'outcomes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Outcome Metrics</h2>
            <div className="flex space-x-3">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              >
                <option value="1M">1 Month</option>
                <option value="3M">3 Months</option>
                <option value="6M">6 Months</option>
                <option value="1Y">1 Year</option>
                <option value="ALL">All Time</option>
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outcomes.map(outcome => (
              <div key={outcome.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{outcome.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{outcome.category}</p>
                  </div>
                  <div className="flex items-center">
                    {outcome.trend > 0 ? (
                      <ArrowUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`ml-1 text-sm font-medium ${
                      outcome.trend > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(outcome.trend)}%
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-3xl font-bold text-gray-900">{outcome.value}</span>
                    <span className="text-lg text-gray-500">{outcome.unit}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>Benchmark: {outcome.benchmark}{outcome.unit}</span>
                    {outcome.value > outcome.benchmark ? (
                      <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500 ml-2" />
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Trend (6 months)</p>
                  <div className="h-16 bg-gray-50 rounded-lg flex items-end justify-center">
                    <div className="flex items-end space-x-1 h-full py-2">
                      {outcome.timeSeriesData.slice(-6).map((point, index) => (
                        <div
                          key={index}
                          className={`w-3 rounded-t ${point.predicted ? 'bg-blue-300' : 'bg-blue-600'}`}
                          style={{ height: `${(point.value / Math.max(...outcome.timeSeriesData.map(d => d.value))) * 100}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700">
                    View Details
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg">
                    <BarChart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveAnalyticsDashboard;