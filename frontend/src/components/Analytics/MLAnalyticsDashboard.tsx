import React, { useState, useEffect, useMemo } from 'react';
import { usePatient } from '../../context/PatientContext';
import Card from '../UI/Card';
import Tooltip from '../UI/Tooltip';
import LoadingSpinner from '../UI/LoadingSpinner';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  Activity,
  Users,
  Clock,
  Zap,
  Shield,
  Database,
  Eye,
  Filter,
  Download,
  RefreshCw,
  Settings,
  AlertTriangle,
  CheckCircle,
  Star,
  Award,
  Calendar,
  Lightbulb
} from 'lucide-react';

interface MLInsight {
  id: string;
  category: 'predictive' | 'diagnostic' | 'optimization' | 'risk_assessment' | 'outcome_prediction';
  title: string;
  description: string;
  confidence: number;
  impact_score: number;
  model_used: string;
  data_sources: string[];
  recommendation: string;
  time_horizon: string;
  last_updated: string;
}

interface PredictiveModel {
  name: string;
  type: 'survival' | 'response' | 'toxicity' | 'cost' | 'quality_of_life';
  accuracy: number;
  prediction: {
    value: number;
    confidence_interval: [number, number];
    probability: number;
    risk_factors: string[];
    protective_factors: string[];
  };
  training_data_size: number;
  last_trained: string;
}

interface PopulationBenchmark {
  metric: string;
  patient_value: number;
  population_mean: number;
  population_percentile: number;
  category: 'better' | 'average' | 'worse';
  sample_size: number;
}

interface TrendAnalysis {
  metric: string;
  current_value: number;
  trend_direction: 'improving' | 'stable' | 'declining';
  rate_of_change: number;
  time_period: string;
  prediction_30_days: number;
  confidence: number;
}

const MLAnalyticsDashboard: React.FC = () => {
  const { state } = usePatient();
  const { currentPatient } = state;
  const [mlInsights, setMlInsights] = useState<MLInsight[]>([]);
  const [predictiveModels, setPredictiveModels] = useState<PredictiveModel[]>([]);
  const [populationBenchmarks, setPopulationBenchmarks] = useState<PopulationBenchmark[]>([]);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const generateMLInsights = async () => {
    if (!currentPatient) return;

    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate ML processing

    // Generate realistic ML insights
    const insights: MLInsight[] = [
      {
        id: 'ml-1',
        category: 'predictive',
        title: 'Treatment Response Prediction',
        description: 'Advanced ML model predicts 89% likelihood of achieving partial response or better within 12 weeks',
        confidence: 89,
        impact_score: 95,
        model_used: 'Deep Neural Network v3.2',
        data_sources: ['Clinical trials database (n=45,000)', 'Real-world evidence', 'Genomic markers'],
        recommendation: 'Continue current regimen with enhanced monitoring for early response indicators',
        time_horizon: '12 weeks',
        last_updated: new Date().toISOString()
      },
      {
        id: 'ml-2',
        category: 'risk_assessment',
        title: 'Toxicity Risk Stratification',
        description: 'ML algorithm identifies patient as moderate risk (34%) for Grade 3+ toxicity based on multifactorial analysis',
        confidence: 76,
        impact_score: 82,
        model_used: 'Random Forest Classifier v2.1',
        data_sources: ['Historical toxicity data', 'Patient genetics', 'Comorbidity profiles'],
        recommendation: 'Implement weekly CBC monitoring and consider prophylactic supportive care',
        time_horizon: '6 months',
        last_updated: new Date().toISOString()
      },
      {
        id: 'ml-3',
        category: 'optimization',
        title: 'Dosing Optimization',
        description: 'Pharmacokinetic modeling suggests 15% dose increase could improve efficacy without significant toxicity increase',
        confidence: 71,
        impact_score: 78,
        model_used: 'Population PK/PD Model v1.8',
        data_sources: ['PK data (n=12,000)', 'Patient covariates', 'Therapeutic drug monitoring'],
        recommendation: 'Consider dose escalation to 115% of current dose with TDM guidance',
        time_horizon: '4 weeks',
        last_updated: new Date().toISOString()
      },
      {
        id: 'ml-4',
        category: 'diagnostic',
        title: 'Biomarker Pattern Recognition',
        description: 'AI pattern analysis of serial biomarkers suggests early molecular response consistent with treatment efficacy',
        confidence: 83,
        impact_score: 88,
        model_used: 'Convolutional Neural Network v4.0',
        data_sources: ['Serial biomarker data', 'Imaging correlates', 'Response patterns'],
        recommendation: 'Continue current therapy; consider extending treatment duration based on molecular response',
        time_horizon: '8 weeks',
        last_updated: new Date().toISOString()
      },
      {
        id: 'ml-5',
        category: 'outcome_prediction',
        title: 'Long-term Survival Projection',
        description: '5-year overall survival estimated at 78% based on comprehensive prognostic modeling',
        confidence: 69,
        impact_score: 92,
        model_used: 'Cox Proportional Hazards with ML Enhancement',
        data_sources: ['Survival databases', 'Treatment history', 'Molecular markers'],
        recommendation: 'Excellent prognosis; focus on quality of life and long-term surveillance planning',
        time_horizon: '5 years',
        last_updated: new Date().toISOString()
      }
    ];

    // Generate predictive models
    const models: PredictiveModel[] = [
      {
        name: 'Survival Predictor Pro',
        type: 'survival',
        accuracy: 0.87,
        prediction: {
          value: 78,
          confidence_interval: [68, 88],
          probability: 0.78,
          risk_factors: ['Age >65', 'Multiple comorbidities', 'Previous treatment lines'],
          protective_factors: ['Good performance status', 'Favorable genetics', 'Early stage']
        },
        training_data_size: 125000,
        last_trained: '2024-01-15'
      },
      {
        name: 'Response Predictor Elite',
        type: 'response',
        accuracy: 0.82,
        prediction: {
          value: 89,
          confidence_interval: [82, 96],
          probability: 0.89,
          risk_factors: ['Large tumor burden', 'Multiple metastases'],
          protective_factors: ['Biomarker positive', 'Treatment naive', 'Young age']
        },
        training_data_size: 89000,
        last_trained: '2024-01-10'
      },
      {
        name: 'Toxicity Guard AI',
        type: 'toxicity',
        accuracy: 0.79,
        prediction: {
          value: 34,
          confidence_interval: [24, 44],
          probability: 0.34,
          risk_factors: ['Baseline organ dysfunction', 'Concomitant medications', 'Genetic variants'],
          protective_factors: ['Good nutritional status', 'No prior severe toxicity', 'Optimal supportive care']
        },
        training_data_size: 67000,
        last_trained: '2024-01-08'
      }
    ];

    // Generate population benchmarks
    const benchmarks: PopulationBenchmark[] = [
      {
        metric: 'Treatment Response Rate',
        patient_value: 89,
        population_mean: 72,
        population_percentile: 85,
        category: 'better',
        sample_size: 45000
      },
      {
        metric: 'Quality of Life Score',
        patient_value: 78,
        population_mean: 71,
        population_percentile: 68,
        category: 'better',
        sample_size: 23000
      },
      {
        metric: 'Time to Progression (months)',
        patient_value: 14.2,
        population_mean: 11.8,
        population_percentile: 72,
        category: 'better',
        sample_size: 38000
      },
      {
        metric: 'Toxicity Incidence (%)',
        patient_value: 34,
        population_mean: 42,
        population_percentile: 32,
        category: 'better',
        sample_size: 56000
      }
    ];

    // Generate trend analysis
    const trends: TrendAnalysis[] = [
      {
        metric: 'Tumor Markers',
        current_value: 8.5,
        trend_direction: 'declining',
        rate_of_change: -12.5,
        time_period: '8 weeks',
        prediction_30_days: 6.8,
        confidence: 0.82
      },
      {
        metric: 'Performance Status',
        current_value: 1,
        trend_direction: 'stable',
        rate_of_change: 0,
        time_period: '12 weeks',
        prediction_30_days: 1,
        confidence: 0.76
      },
      {
        metric: 'Quality of Life',
        current_value: 78,
        trend_direction: 'improving',
        rate_of_change: 8.3,
        time_period: '6 weeks',
        prediction_30_days: 82,
        confidence: 0.71
      }
    ];

    setMlInsights(insights);
    setPredictiveModels(models);
    setPopulationBenchmarks(benchmarks);
    setTrendAnalysis(trends);
    setIsAnalyzing(false);
  };

  const filteredInsights = useMemo(() => {
    return mlInsights.filter(insight => 
      selectedCategory === 'all' || insight.category === selectedCategory
    );
  }, [mlInsights, selectedCategory]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (confidence >= 60) return <Clock className="w-4 h-4 text-yellow-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'predictive': return <Brain className="w-4 h-4" />;
      case 'diagnostic': return <Eye className="w-4 h-4" />;
      case 'optimization': return <Target className="w-4 h-4" />;
      case 'risk_assessment': return <Shield className="w-4 h-4" />;
      case 'outcome_prediction': return <TrendingUp className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getBenchmarkColor = (category: string) => {
    switch (category) {
      case 'better': return 'text-green-600 bg-green-50';
      case 'average': return 'text-blue-600 bg-blue-50';
      case 'worse': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  if (!currentPatient) {
    return (
      <Card>
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">ML Analytics Dashboard</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Select a patient to access advanced machine learning analytics and insights
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ML Analytics Dashboard</h1>
              <p className="text-gray-600">
                Advanced machine learning insights for {currentPatient.demographics.firstName} {currentPatient.demographics.lastName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={generateMLInsights}
              disabled={isAnalyzing}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? <LoadingSpinner size="sm" /> : <Brain className="w-5 h-5" />}
              <span>{isAnalyzing ? 'Analyzing...' : 'Run ML Analysis'}</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Processing Status */}
      {isAnalyzing && (
        <Card>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <LoadingSpinner size="lg" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">ML Processing in Progress</h3>
              <p className="text-gray-600 mb-2">
                Running advanced machine learning models across multiple data sources...
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Deep learning models</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Population comparisons</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span>Predictive modeling</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span>Trend analysis</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Controls */}
      {mlInsights.length > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Categories</option>
                  <option value="predictive">Predictive</option>
                  <option value="diagnostic">Diagnostic</option>
                  <option value="optimization">Optimization</option>
                  <option value="risk_assessment">Risk Assessment</option>
                  <option value="outcome_prediction">Outcome Prediction</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Auto-refresh:</span>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoRefresh ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                    autoRefresh ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Database className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Predictive Models Overview */}
      {predictiveModels.length > 0 && (
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <Target className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">Predictive Models</h2>
            <Tooltip content="AI-powered predictive models trained on large clinical datasets">
              <Lightbulb className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {predictiveModels.map((model, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{model.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs font-medium text-gray-600">{Math.round(model.accuracy * 100)}%</span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Prediction:</span>
                    <span className="font-bold text-lg text-blue-600">{model.prediction.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${model.prediction.value}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    CI: {model.prediction.confidence_interval[0]}% - {model.prediction.confidence_interval[1]}%
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-medium text-red-600">Risk factors:</span>
                    <div className="text-gray-600">
                      {model.prediction.risk_factors.slice(0, 2).map(factor => `• ${factor}`).join(' ')}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-green-600">Protective factors:</span>
                    <div className="text-gray-600">
                      {model.prediction.protective_factors.slice(0, 2).map(factor => `• ${factor}`).join(' ')}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                  <div>Training data: {model.training_data_size.toLocaleString()} patients</div>
                  <div>Last trained: {new Date(model.last_trained).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Population Benchmarks */}
      {populationBenchmarks.length > 0 && (
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <Users className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">Population Benchmarks</h2>
            <Tooltip content="How this patient compares to similar patients in large clinical databases">
              <Award className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {populationBenchmarks.map((benchmark, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getBenchmarkColor(benchmark.category)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{benchmark.metric}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    benchmark.category === 'better' ? 'bg-green-100 text-green-800' :
                    benchmark.category === 'average' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {benchmark.category === 'better' ? 'Above Average' :
                     benchmark.category === 'average' ? 'Average' : 'Below Average'}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Patient</div>
                    <div className="font-bold text-lg">{benchmark.patient_value}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Population</div>
                    <div className="font-medium">{benchmark.population_mean}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Percentile</div>
                    <div className="font-medium">{benchmark.population_percentile}th</div>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  Based on {benchmark.sample_size.toLocaleString()} similar patients
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Trend Analysis */}
      {trendAnalysis.length > 0 && (
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-gray-900">Trend Analysis</h2>
            <Tooltip content="AI-powered trend analysis and 30-day predictions">
              <Activity className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {trendAnalysis.map((trend, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{trend.metric}</h3>
                  {getTrendIcon(trend.trend_direction)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current:</span>
                    <span className="font-medium">{trend.current_value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">30-day forecast:</span>
                    <span className="font-medium">{trend.prediction_30_days}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Change rate:</span>
                    <span className={`font-medium ${
                      trend.rate_of_change > 0 ? 'text-green-600' :
                      trend.rate_of_change < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {trend.rate_of_change > 0 ? '+' : ''}{trend.rate_of_change}%
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Confidence: {Math.round(trend.confidence * 100)}%</span>
                    <span>Period: {trend.time_period}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ML Insights */}
      <div className="space-y-4">
        {filteredInsights.length === 0 && mlInsights.length === 0 && !isAnalyzing && (
          <Card>
            <div className="text-center py-12">
              <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No ML Analysis Available</h3>
              <p className="text-gray-400">Click "Run ML Analysis" to generate advanced insights</p>
            </div>
          </Card>
        )}

        {filteredInsights.map((insight) => (
          <Card key={insight.id} className="border-l-4 border-purple-500">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                {getCategoryIcon(insight.category)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium capitalize">
                    {insight.category.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-1">
                    {getConfidenceIcon(insight.confidence)}
                    <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                      {insight.confidence}% confidence
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Impact: {insight.impact_score}%
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
                <p className="text-gray-700 mb-3">{insight.description}</p>
                
                <div className="bg-purple-50 p-3 rounded-lg mb-3">
                  <div className="text-sm font-medium text-purple-800 mb-1">AI Recommendation:</div>
                  <p className="text-sm text-purple-700">{insight.recommendation}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-700 mb-1">Model Used:</div>
                    <p className="text-gray-600">{insight.model_used}</p>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700 mb-1">Time Horizon:</div>
                    <p className="text-gray-600">{insight.time_horizon}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">Data Sources:</div>
                  <div className="flex flex-wrap gap-1">
                    {insight.data_sources.map((source, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Last updated: {new Date(insight.last_updated).toLocaleString()}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Statistics */}
      {mlInsights.length > 0 && (
        <Card className="bg-gray-50">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">ML Analysis Summary</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{mlInsights.length}</div>
              <div className="text-sm text-gray-600">Total Insights</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(mlInsights.reduce((sum, i) => sum + i.confidence, 0) / mlInsights.length)}%
              </div>
              <div className="text-sm text-gray-600">Avg. Confidence</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(mlInsights.reduce((sum, i) => sum + i.impact_score, 0) / mlInsights.length)}%
              </div>
              <div className="text-sm text-gray-600">Avg. Impact</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {mlInsights.filter(i => i.confidence >= 80).length}
              </div>
              <div className="text-sm text-gray-600">High Confidence</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {mlInsights.filter(i => i.impact_score >= 85).length}
              </div>
              <div className="text-sm text-gray-600">High Impact</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MLAnalyticsDashboard;