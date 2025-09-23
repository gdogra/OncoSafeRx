import React, { useState, useEffect } from 'react';
import { usePatient } from '../../context/PatientContext';
import Card from '../UI/Card';
import Alert from '../UI/Alert';
import Tooltip from '../UI/Tooltip';
import LoadingSpinner from '../UI/LoadingSpinner';
import { 
  Brain, 
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Clock,
  Users,
  Star,
  BarChart3,
  LineChart,
  PieChart,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  Eye,
  Microscope,
  Dna,
  Pill,
  Heart,
  Stethoscope,
  Timer,
  Award,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Info,
  Filter,
  Download,
  Sparkles
} from 'lucide-react';

interface PredictionModel {
  id: string;
  name: string;
  type: 'survival' | 'response' | 'toxicity' | 'recurrence' | 'quality_of_life';
  version: string;
  accuracy: number;
  last_trained: string;
  training_size: number;
  features_used: string[];
  validation_method: string;
  performance_metrics: {
    auc: number;
    sensitivity: number;
    specificity: number;
    precision: number;
    recall: number;
  };
}

interface TreatmentPrediction {
  id: string;
  model_id: string;
  patient_id: string;
  treatment_option: {
    name: string;
    regimen: string;
    duration_weeks: number;
    administration: string;
  };
  predictions: {
    overall_survival_months: number;
    progression_free_survival_months: number;
    response_probability: number;
    complete_response_probability: number;
    toxicity_risk: {
      grade_3_4_probability: number;
      specific_toxicities: {
        name: string;
        probability: number;
        severity: 'mild' | 'moderate' | 'severe';
      }[];
    };
    quality_of_life_score: number;
    biomarker_response: {
      marker: string;
      predicted_change: number;
      confidence: number;
    }[];
  };
  confidence_interval: {
    lower: number;
    upper: number;
  };
  risk_factors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }[];
  similar_patients: {
    count: number;
    characteristics: string[];
    outcomes: {
      median_survival: number;
      response_rate: number;
    };
  };
  recommendations: {
    level: 'strong' | 'moderate' | 'weak';
    rationale: string;
    considerations: string[];
  };
  uncertainty_factors: string[];
  generated_at: string;
}

interface PopulationComparison {
  metric: string;
  patient_value: number;
  population_median: number;
  population_range: [number, number];
  percentile: number;
  cohort_size: number;
  status: 'better' | 'similar' | 'worse';
}

interface ClinicalTrial {
  id: string;
  title: string;
  phase: '1' | '2' | '3' | '4';
  status: 'recruiting' | 'active' | 'completed';
  eligibility_match: number;
  primary_endpoint: string;
  estimated_completion: string;
  location: string;
  sponsor: string;
  predicted_benefit: number;
}

const TreatmentOutcomesEngine: React.FC = () => {
  const { state } = usePatient();
  const { currentPatient } = state;
  const [predictions, setPredictions] = useState<TreatmentPrediction[]>([]);
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);
  const [populationComparisons, setPopulationComparisons] = useState<PopulationComparison[]>([]);
  const [clinicalTrials, setClinicalTrials] = useState<ClinicalTrial[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'3m' | '6m' | '1y' | '2y' | '5y'>('1y');
  const [riskProfile, setRiskProfile] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

  useEffect(() => {
    if (currentPatient) {
      initializePredictiveData();
    }
  }, [currentPatient]);

  const initializePredictiveData = () => {
    if (!currentPatient) return;

    // Initialize AI models
    const aiModels: PredictionModel[] = [
      {
        id: 'model-1',
        name: 'OncoPredict Survival Model',
        type: 'survival',
        version: '3.2.1',
        accuracy: 0.87,
        last_trained: '2024-01-15',
        training_size: 15840,
        features_used: ['age', 'stage', 'biomarkers', 'genomics', 'comorbidities', 'performance_status'],
        validation_method: 'Cross-validation',
        performance_metrics: {
          auc: 0.89,
          sensitivity: 0.84,
          specificity: 0.91,
          precision: 0.86,
          recall: 0.84
        }
      },
      {
        id: 'model-2',
        name: 'ToxiGuard Risk Predictor',
        type: 'toxicity',
        version: '2.8.4',
        accuracy: 0.82,
        last_trained: '2024-01-20',
        training_size: 23150,
        features_used: ['genetics', 'prior_treatments', 'organ_function', 'drug_interactions'],
        validation_method: 'External validation',
        performance_metrics: {
          auc: 0.85,
          sensitivity: 0.79,
          specificity: 0.88,
          precision: 0.83,
          recall: 0.79
        }
      },
      {
        id: 'model-3',
        name: 'ResponseNet Predictor',
        type: 'response',
        version: '4.1.0',
        accuracy: 0.91,
        last_trained: '2024-01-25',
        training_size: 18920,
        features_used: ['tumor_markers', 'imaging', 'genomic_profile', 'immune_status'],
        validation_method: 'Prospective validation',
        performance_metrics: {
          auc: 0.93,
          sensitivity: 0.89,
          specificity: 0.94,
          precision: 0.92,
          recall: 0.89
        }
      }
    ];

    // Generate treatment predictions
    const treatmentPredictions: TreatmentPrediction[] = [
      {
        id: 'pred-1',
        model_id: 'model-1',
        patient_id: currentPatient.id,
        treatment_option: {
          name: 'FOLFOX + Bevacizumab',
          regimen: '5-FU, Leucovorin, Oxaliplatin + Bevacizumab',
          duration_weeks: 24,
          administration: 'IV every 2 weeks'
        },
        predictions: {
          overall_survival_months: 28.4,
          progression_free_survival_months: 12.8,
          response_probability: 0.72,
          complete_response_probability: 0.18,
          toxicity_risk: {
            grade_3_4_probability: 0.34,
            specific_toxicities: [
              { name: 'Peripheral neuropathy', probability: 0.42, severity: 'moderate' },
              { name: 'Neutropenia', probability: 0.28, severity: 'severe' },
              { name: 'Diarrhea', probability: 0.35, severity: 'mild' }
            ]
          },
          quality_of_life_score: 7.2,
          biomarker_response: [
            { marker: 'CEA', predicted_change: -65, confidence: 0.85 },
            { marker: 'CA 19-9', predicted_change: -48, confidence: 0.78 }
          ]
        },
        confidence_interval: { lower: 22.1, upper: 34.7 },
        risk_factors: [
          { factor: 'Age > 65', impact: 'negative', weight: 0.15 },
          { factor: 'Good performance status', impact: 'positive', weight: 0.25 },
          { factor: 'MSI-High tumor', impact: 'positive', weight: 0.35 },
          { factor: 'Stage IV disease', impact: 'negative', weight: 0.40 }
        ],
        similar_patients: {
          count: 1247,
          characteristics: ['Stage IV colorectal cancer', 'MSI-High', 'Age 60-70'],
          outcomes: {
            median_survival: 26.8,
            response_rate: 0.68
          }
        },
        recommendations: {
          level: 'strong',
          rationale: 'High predicted response rate and favorable genetic profile',
          considerations: [
            'Monitor for peripheral neuropathy',
            'Consider prophylactic antiemetics',
            'Regular liver function monitoring'
          ]
        },
        uncertainty_factors: [
          'Limited data for this specific genetic subtype',
          'Potential drug interactions not fully modeled'
        ],
        generated_at: new Date().toISOString()
      },
      {
        id: 'pred-2',
        model_id: 'model-2',
        patient_id: currentPatient.id,
        treatment_option: {
          name: 'Pembrolizumab Monotherapy',
          regimen: 'Pembrolizumab 200mg',
          duration_weeks: 48,
          administration: 'IV every 3 weeks'
        },
        predictions: {
          overall_survival_months: 32.1,
          progression_free_survival_months: 18.6,
          response_probability: 0.84,
          complete_response_probability: 0.28,
          toxicity_risk: {
            grade_3_4_probability: 0.18,
            specific_toxicities: [
              { name: 'Immune-related pneumonitis', probability: 0.08, severity: 'severe' },
              { name: 'Thyroiditis', probability: 0.15, severity: 'mild' },
              { name: 'Fatigue', probability: 0.45, severity: 'moderate' }
            ]
          },
          quality_of_life_score: 8.1,
          biomarker_response: [
            { marker: 'PD-L1 expression', predicted_change: -75, confidence: 0.92 },
            { marker: 'Tumor mutational burden', predicted_change: -45, confidence: 0.87 }
          ]
        },
        confidence_interval: { lower: 26.8, upper: 37.4 },
        risk_factors: [
          { factor: 'MSI-High tumor', impact: 'positive', weight: 0.45 },
          { factor: 'High PD-L1 expression', impact: 'positive', weight: 0.35 },
          { factor: 'No prior immunotherapy', impact: 'positive', weight: 0.20 }
        ],
        similar_patients: {
          count: 894,
          characteristics: ['MSI-High colorectal cancer', 'PD-L1 positive', 'Treatment-naive'],
          outcomes: {
            median_survival: 30.5,
            response_rate: 0.81
          }
        },
        recommendations: {
          level: 'strong',
          rationale: 'Excellent predicted response due to MSI-High status and high PD-L1 expression',
          considerations: [
            'Monitor for immune-related adverse events',
            'Baseline thyroid function assessment',
            'Patient education on immune toxicities'
          ]
        },
        uncertainty_factors: [
          'Individual immune system variability',
          'Long-term durability data still maturing'
        ],
        generated_at: new Date().toISOString()
      },
      {
        id: 'pred-3',
        model_id: 'model-3',
        patient_id: currentPatient.id,
        treatment_option: {
          name: 'FOLFIRI + Cetuximab',
          regimen: '5-FU, Leucovorin, Irinotecan + Cetuximab',
          duration_weeks: 20,
          administration: 'IV every 2 weeks'
        },
        predictions: {
          overall_survival_months: 24.2,
          progression_free_survival_months: 10.4,
          response_probability: 0.58,
          complete_response_probability: 0.12,
          toxicity_risk: {
            grade_3_4_probability: 0.41,
            specific_toxicities: [
              { name: 'Skin rash', probability: 0.78, severity: 'moderate' },
              { name: 'Diarrhea', probability: 0.52, severity: 'severe' },
              { name: 'Hypomagnesemia', probability: 0.38, severity: 'mild' }
            ]
          },
          quality_of_life_score: 6.8,
          biomarker_response: [
            { marker: 'EGFR expression', predicted_change: -58, confidence: 0.76 },
            { marker: 'KRAS wild-type benefit', predicted_change: 25, confidence: 0.89 }
          ]
        },
        confidence_interval: { lower: 19.8, upper: 28.6 },
        risk_factors: [
          { factor: 'KRAS wild-type', impact: 'positive', weight: 0.40 },
          { factor: 'Left-sided primary', impact: 'positive', weight: 0.25 },
          { factor: 'Multiple metastatic sites', impact: 'negative', weight: 0.30 }
        ],
        similar_patients: {
          count: 756,
          characteristics: ['KRAS wild-type', 'Left-sided primary', 'Multiple organ involvement'],
          outcomes: {
            median_survival: 23.1,
            response_rate: 0.55
          }
        },
        recommendations: {
          level: 'moderate',
          rationale: 'Reasonable option for KRAS wild-type tumors but higher toxicity profile',
          considerations: [
            'Prophylactic skin care regimen',
            'Aggressive anti-diarrheal management',
            'Regular electrolyte monitoring'
          ]
        },
        uncertainty_factors: [
          'Skin toxicity tolerance varies significantly',
          'Prior anti-EGFR exposure not fully accounted for'
        ],
        generated_at: new Date().toISOString()
      }
    ];

    // Population comparisons
    const comparisons: PopulationComparison[] = [
      {
        metric: 'Predicted Overall Survival',
        patient_value: 28.4,
        population_median: 22.8,
        population_range: [12.5, 48.2],
        percentile: 72,
        cohort_size: 3247,
        status: 'better'
      },
      {
        metric: 'Response Probability',
        patient_value: 0.72,
        population_median: 0.65,
        population_range: [0.35, 0.92],
        percentile: 68,
        cohort_size: 2891,
        status: 'better'
      },
      {
        metric: 'Toxicity Risk',
        patient_value: 0.34,
        population_median: 0.41,
        population_range: [0.18, 0.72],
        percentile: 35,
        cohort_size: 2654,
        status: 'better'
      }
    ];

    // Clinical trials
    const trials: ClinicalTrial[] = [
      {
        id: 'trial-1',
        title: 'Phase III Study of Novel Immunotherapy Combination',
        phase: '3',
        status: 'recruiting',
        eligibility_match: 0.91,
        primary_endpoint: 'Overall Survival',
        estimated_completion: '2026-12-31',
        location: 'UCSF Medical Center',
        sponsor: 'Bristol Myers Squibb',
        predicted_benefit: 0.78
      },
      {
        id: 'trial-2',
        title: 'Personalized CAR-T Cell Therapy Study',
        phase: '2',
        status: 'recruiting',
        eligibility_match: 0.84,
        primary_endpoint: 'Progression-Free Survival',
        estimated_completion: '2025-08-15',
        location: 'Stanford Medical Center',
        sponsor: 'Novartis',
        predicted_benefit: 0.85
      }
    ];

    setModels(aiModels);
    setPredictions(treatmentPredictions);
    setSelectedPrediction(treatmentPredictions[0].id);
    setPopulationComparisons(comparisons);
    setClinicalTrials(trials);
  };

  const generateNewPredictions = async () => {
    setIsGenerating(true);
    // Simulate AI prediction generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Refresh predictions with updated data
    initializePredictiveData();
    setIsGenerating(false);
  };

  const getPredictionIcon = (type: string) => {
    switch (type) {
      case 'survival': return <Timer className="w-5 h-5" />;
      case 'response': return <Target className="w-5 h-5" />;
      case 'toxicity': return <Shield className="w-5 h-5" />;
      case 'recurrence': return <Activity className="w-5 h-5" />;
      case 'quality_of_life': return <Heart className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getRecommendationColor = (level: string) => {
    switch (level) {
      case 'strong': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'weak': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'negative': return <ArrowDown className="w-4 h-4 text-red-600" />;
      case 'neutral': return <Minus className="w-4 h-4 text-gray-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getComparisonIcon = (status: string) => {
    switch (status) {
      case 'better': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'worse': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'similar': return <Minus className="w-4 h-4 text-gray-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const selectedPredictionData = selectedPrediction 
    ? predictions.find(p => p.id === selectedPrediction) 
    : null;

  if (!currentPatient) {
    return (
      <Card>
        <div className="text-center py-12">
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">Predictive Analytics Engine</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Select a patient to generate AI-powered treatment outcome predictions and personalized recommendations
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
              <h1 className="text-2xl font-bold text-gray-900">Predictive Analytics Engine</h1>
              <p className="text-gray-600">
                AI-powered treatment outcome predictions for {currentPatient.demographics.firstName} {currentPatient.demographics.lastName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={generateNewPredictions}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              {isGenerating ? <LoadingSpinner size="sm" /> : <Sparkles className="w-4 h-4" />}
              <span>{isGenerating ? 'Generating...' : 'Generate Predictions'}</span>
            </button>
          </div>
        </div>
      </Card>

      {/* AI Models Overview */}
      <Card>
        <div className="flex items-center space-x-2 mb-6">
          <Microscope className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">AI Models Performance</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {models.map((model) => (
            <div key={model.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                {getPredictionIcon(model.type)}
                <h3 className="font-semibold text-gray-900">{model.name}</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-medium">{(model.accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">AUC:</span>
                  <span className="font-medium">{model.performance_metrics.auc.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Training Size:</span>
                  <span className="font-medium">{model.training_size.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">v{model.version}</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Key Features:</div>
                <div className="flex flex-wrap gap-1">
                  {model.features_used.slice(0, 3).map((feature, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                      {feature}
                    </span>
                  ))}
                  {model.features_used.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{model.features_used.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Treatment Predictions */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Target className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">Treatment Outcome Predictions</h2>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="3m">3 Months</option>
              <option value="6m">6 Months</option>
              <option value="1y">1 Year</option>
              <option value="2y">2 Years</option>
              <option value="5y">5 Years</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {predictions.map((prediction) => (
            <div
              key={prediction.id}
              onClick={() => setSelectedPrediction(prediction.id)}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedPrediction === prediction.id ? 'ring-2 ring-purple-500 bg-purple-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{prediction.treatment_option.name}</h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getRecommendationColor(prediction.recommendations.level)}`}>
                  {prediction.recommendations.level}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Overall Survival:</span>
                  <span className="font-medium">{prediction.predictions.overall_survival_months.toFixed(1)} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Rate:</span>
                  <span className="font-medium">{(prediction.predictions.response_probability * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toxicity Risk:</span>
                  <span className={`font-medium ${
                    prediction.predictions.toxicity_risk.grade_3_4_probability < 0.3 ? 'text-green-600' :
                    prediction.predictions.toxicity_risk.grade_3_4_probability < 0.5 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {(prediction.predictions.toxicity_risk.grade_3_4_probability * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">QoL Score:</span>
                  <span className="font-medium">{prediction.predictions.quality_of_life_score}/10</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-600 mb-1">Regimen:</div>
                <p className="text-xs text-gray-800">{prediction.treatment_option.regimen}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Prediction View */}
        {selectedPredictionData && (
          <div className="border-t border-gray-200 pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Prediction Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Predictions</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Timer className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium text-blue-900">Survival Outcomes</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Overall Survival:</div>
                        <div className="font-semibold text-blue-900">
                          {selectedPredictionData.predictions.overall_survival_months.toFixed(1)} months
                        </div>
                        <div className="text-xs text-gray-500">
                          95% CI: {selectedPredictionData.confidence_interval.lower.toFixed(1)}-{selectedPredictionData.confidence_interval.upper.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Progression-Free:</div>
                        <div className="font-semibold text-blue-900">
                          {selectedPredictionData.predictions.progression_free_survival_months.toFixed(1)} months
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium text-green-900">Response Predictions</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Overall Response:</div>
                        <div className="font-semibold text-green-900">
                          {(selectedPredictionData.predictions.response_probability * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Complete Response:</div>
                        <div className="font-semibold text-green-900">
                          {(selectedPredictionData.predictions.complete_response_probability * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-medium text-yellow-900">Toxicity Risk</h4>
                    </div>
                    <div className="mb-3">
                      <div className="text-sm text-gray-600">Grade 3-4 Toxicity Risk:</div>
                      <div className="font-semibold text-yellow-900">
                        {(selectedPredictionData.predictions.toxicity_risk.grade_3_4_probability * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="space-y-2">
                      {selectedPredictionData.predictions.toxicity_risk.specific_toxicities.map((toxicity, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">{toxicity.name}:</span>
                          <span className={`font-medium ${
                            toxicity.severity === 'mild' ? 'text-green-600' :
                            toxicity.severity === 'moderate' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {(toxicity.probability * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Factors & Recommendations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors & Recommendations</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Key Risk Factors</h4>
                    <div className="space-y-2">
                      {selectedPredictionData.risk_factors.map((factor, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            {getImpactIcon(factor.impact)}
                            <span className="text-sm text-gray-800">{factor.factor}</span>
                          </div>
                          <div className="text-sm font-medium">
                            Weight: {(factor.weight * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${getRecommendationColor(selectedPredictionData.recommendations.level)}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-5 h-5" />
                      <h4 className="font-medium">Clinical Recommendation</h4>
                    </div>
                    <p className="text-sm mb-3">{selectedPredictionData.recommendations.rationale}</p>
                    <div className="space-y-1">
                      {selectedPredictionData.recommendations.considerations.map((consideration, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-sm">
                          <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0" />
                          <span>{consideration}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Similar Patients Outcomes</h4>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Cohort Size:</span>
                          <span className="font-medium">{selectedPredictionData.similar_patients.count} patients</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Median Survival:</span>
                          <span className="font-medium">{selectedPredictionData.similar_patients.outcomes.median_survival} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Response Rate:</span>
                          <span className="font-medium">{(selectedPredictionData.similar_patients.outcomes.response_rate * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Population Comparison */}
      <Card>
        <div className="flex items-center space-x-2 mb-6">
          <Users className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-semibold text-gray-900">Population Comparison</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {populationComparisons.map((comparison, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{comparison.metric}</h3>
                {getComparisonIcon(comparison.status)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Patient:</span>
                  <span className="font-semibold">{comparison.patient_value}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Population:</span>
                  <span className="font-medium">{comparison.population_median}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Percentile:</span>
                  <span className={`font-medium ${
                    comparison.percentile > 70 ? 'text-green-600' :
                    comparison.percentile > 30 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {comparison.percentile}th
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Cohort: {comparison.cohort_size.toLocaleString()} patients
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Clinical Trials Matching */}
      <Card>
        <div className="flex items-center space-x-2 mb-6">
          <Stethoscope className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-semibold text-gray-900">Matching Clinical Trials</h2>
        </div>
        <div className="space-y-4">
          {clinicalTrials.map((trial) => (
            <div key={trial.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{trial.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Phase {trial.phase}</span>
                    <span>•</span>
                    <span className="capitalize">{trial.status}</span>
                    <span>•</span>
                    <span>{trial.sponsor}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    trial.eligibility_match > 0.8 ? 'bg-green-100 text-green-600' :
                    trial.eligibility_match > 0.6 ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {(trial.eligibility_match * 100).toFixed(0)}% match
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Primary Endpoint:</div>
                  <div className="font-medium">{trial.primary_endpoint}</div>
                </div>
                <div>
                  <div className="text-gray-600">Location:</div>
                  <div className="font-medium">{trial.location}</div>
                </div>
                <div>
                  <div className="text-gray-600">Completion:</div>
                  <div className="font-medium">{new Date(trial.estimated_completion).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-gray-600">Predicted Benefit:</div>
                  <div className={`font-medium ${
                    trial.predicted_benefit > 0.7 ? 'text-green-600' :
                    trial.predicted_benefit > 0.5 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {(trial.predicted_benefit * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TreatmentOutcomesEngine;