import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Brain, Target, AlertCircle, CheckCircle, Activity, Zap, Shield, Clock } from 'lucide-react';
import Card from '../UI/Card';
import LoadingSpinner from '../UI/LoadingSpinner';
import FeatureErrorBoundary from '../ErrorBoundary/FeatureErrorBoundary';

interface EfficacyPrediction {
  drugName: string;
  overallScore: number;
  confidenceInterval: [number, number];
  factors: {
    genomic: number;
    clinical: number;
    realWorld: number;
    biomarkers: number;
    interactions: number;
  };
  timeline: Array<{
    month: number;
    efficacy: number;
    confidence: number;
  }>;
  comparators: Array<{
    drug: string;
    efficacy: number;
    evidence: string;
  }>;
  riskBenefit: {
    benefit: number;
    risk: number;
    netBenefit: number;
  };
  evidenceSources: Array<{
    type: 'clinical_trial' | 'real_world' | 'genomic' | 'biomarker';
    count: number;
    quality: 'high' | 'medium' | 'low';
  }>;
}

interface PatientFactors {
  age: number;
  gender: string;
  cancerType: string;
  stage: string;
  priorTreatments: string[];
  biomarkers: Record<string, number>;
  genomicProfile: Record<string, string>;
  comorbidities: string[];
  performanceStatus: number;
}

interface ModelInputs {
  patient: PatientFactors;
  treatment: {
    drugs: string[];
    dosing: string;
    duration: string;
    combination: boolean;
  };
  context: {
    setting: 'first_line' | 'second_line' | 'salvage';
    intent: 'curative' | 'palliative' | 'adjuvant';
    timeframe: 'short' | 'medium' | 'long';
  };
}

const PredictiveEfficacyScoring: React.FC = () => {
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>(['Pembrolizumab', 'Carboplatin', 'Paclitaxel']);
  const [predictions, setPredictions] = useState<EfficacyPrediction[]>([]);
  const [modelInputs, setModelInputs] = useState<ModelInputs | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<EfficacyPrediction | null>(null);
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    loadPatientContext();
  }, []);

  useEffect(() => {
    if (modelInputs && selectedDrugs.length > 0) {
      calculatePredictions();
    }
  }, [selectedDrugs, modelInputs]);

  const loadPatientContext = async () => {
    // Simulate loading patient context
    const mockInputs: ModelInputs = {
      patient: {
        age: 64,
        gender: 'female',
        cancerType: 'NSCLC',
        stage: 'IV',
        priorTreatments: [],
        biomarkers: {
          'PD-L1': 85,
          'TMB': 12.5,
          'MSI': 0.2,
          'CEA': 8.5,
          'CYFRA21-1': 4.2
        },
        genomicProfile: {
          'EGFR': 'Wild-type',
          'ALK': 'Negative',
          'ROS1': 'Negative',
          'KRAS': 'G12C',
          'TP53': 'Mutant'
        },
        comorbidities: ['Hypertension', 'Type 2 Diabetes'],
        performanceStatus: 1
      },
      treatment: {
        drugs: selectedDrugs,
        dosing: 'Standard',
        duration: '24 months',
        combination: selectedDrugs.length > 1
      },
      context: {
        setting: 'first_line',
        intent: 'palliative',
        timeframe: 'long'
      }
    };
    
    setModelInputs(mockInputs);
  };

  const calculatePredictions = async () => {
    setIsCalculating(true);
    
    try {
      // Simulate AI model calculations
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const mockPredictions: EfficacyPrediction[] = selectedDrugs.map((drug, index) => {
        const baseEfficacy = 45 + Math.random() * 40;
        const genomicBoost = drug === 'Pembrolizumab' ? 15 : Math.random() * 10;
        const finalScore = Math.min(95, baseEfficacy + genomicBoost);
        
        return {
          drugName: drug,
          overallScore: Math.round(finalScore),
          confidenceInterval: [
            Math.round(finalScore - 8 - Math.random() * 5),
            Math.round(finalScore + 8 + Math.random() * 5)
          ] as [number, number],
          factors: {
            genomic: drug === 'Pembrolizumab' ? 92 : 75 + Math.random() * 15,
            clinical: 80 + Math.random() * 15,
            realWorld: 85 + Math.random() * 10,
            biomarkers: drug === 'Pembrolizumab' ? 95 : 70 + Math.random() * 20,
            interactions: selectedDrugs.length > 1 ? 88 : 95
          },
          timeline: Array.from({ length: 24 }, (_, month) => ({
            month: month + 1,
            efficacy: Math.round(finalScore * (1 - Math.exp(-month / 8)) + Math.random() * 5),
            confidence: Math.round(95 - month * 1.5 + Math.random() * 5)
          })),
          comparators: [
            { drug: 'Standard of Care', efficacy: 35, evidence: 'Phase III RCT' },
            { drug: 'Alternative Regimen', efficacy: 42, evidence: 'Real-world data' },
            { drug: 'Historical Control', efficacy: 28, evidence: 'Meta-analysis' }
          ],
          riskBenefit: {
            benefit: Math.round(finalScore),
            risk: Math.round(25 + Math.random() * 20),
            netBenefit: Math.round(finalScore - 25 - Math.random() * 20)
          },
          evidenceSources: [
            { type: 'clinical_trial', count: 12 + Math.floor(Math.random() * 8), quality: 'high' },
            { type: 'real_world', count: 156 + Math.floor(Math.random() * 50), quality: 'high' },
            { type: 'genomic', count: 8 + Math.floor(Math.random() * 5), quality: 'medium' },
            { type: 'biomarker', count: 24 + Math.floor(Math.random() * 10), quality: 'high' }
          ]
        };
      });
      
      setPredictions(mockPredictions);
      setSelectedPrediction(mockPredictions[0]);
      
    } catch (error) {
      console.error('Error calculating predictions:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatConfidenceInterval = (ci: [number, number]) => {
    return `${ci[0]}% - ${ci[1]}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Predictive Efficacy Scoring</h1>
            <p className="text-gray-600">AI-powered treatment efficacy predictions with confidence intervals</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              compareMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Compare Mode
          </button>
          <button
            onClick={calculatePredictions}
            disabled={isCalculating}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {isCalculating ? <LoadingSpinner size="sm" /> : <Zap className="w-4 h-4" />}
            <span>Recalculate</span>
          </button>
        </div>
      </div>

      {/* Model Status */}
      {isCalculating && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="sm" />
              <div>
                <h3 className="font-medium text-gray-900">AI Model Processing</h3>
                <p className="text-sm text-gray-600">
                  Analyzing genomic factors, clinical data, real-world evidence, and biomarkers...
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Genomic Analysis</span>
                <span className="text-green-600">Complete</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Clinical Evidence</span>
                <span className="text-green-600">Complete</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Real-World Data</span>
                <span className="text-blue-600">Processing...</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Biomarker Integration</span>
                <span className="text-gray-500">Pending</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Predictions Overview */}
      {predictions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {predictions.map((prediction, index) => (
            <Card 
              key={index}
              className={`cursor-pointer transition-all ${
                selectedPrediction?.drugName === prediction.drugName 
                  ? 'ring-2 ring-purple-500 bg-purple-50' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedPrediction(prediction)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{prediction.drugName}</h3>
                    <p className="text-sm text-gray-600">
                      CI: {formatConfidenceInterval(prediction.confidenceInterval)}
                    </p>
                  </div>
                  <Target className="w-6 h-6 text-purple-600" />
                </div>

                <div className="text-center mb-4">
                  <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${getScoreColor(prediction.overallScore)}`}>
                    {prediction.overallScore}%
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Predicted Efficacy</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Genomic Compatibility</span>
                    <span className="font-medium">{Math.round(prediction.factors.genomic)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Biomarker Score</span>
                    <span className="font-medium">{Math.round(prediction.factors.biomarkers)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Real-World Evidence</span>
                    <span className="font-medium">{Math.round(prediction.factors.realWorld)}%</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Net Benefit</span>
                    <span className={`font-semibold ${
                      prediction.riskBenefit.netBenefit > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      +{prediction.riskBenefit.netBenefit}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed Analysis */}
      {selectedPrediction && (
        <div className="space-y-6">
          {/* Factor Breakdown */}
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-semibold">Factor Analysis: {selectedPrediction.drugName}</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Radar Chart */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Multi-Factor Assessment</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={[
                      { factor: 'Genomic', score: selectedPrediction.factors.genomic },
                      { factor: 'Clinical', score: selectedPrediction.factors.clinical },
                      { factor: 'Real-World', score: selectedPrediction.factors.realWorld },
                      { factor: 'Biomarkers', score: selectedPrediction.factors.biomarkers },
                      { factor: 'Interactions', score: selectedPrediction.factors.interactions }
                    ]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="factor" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Factor Details */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Factor Contributions</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedPrediction.factors).map(([factor, score]) => (
                      <div key={factor} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="capitalize font-medium">{factor}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className="font-semibold text-blue-600">{Math.round(score)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline Prediction */}
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="text-xl font-semibold">Efficacy Timeline</h3>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={selectedPrediction.timeline.slice(0, 12)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                    labelFormatter={(month: number) => `Month ${month}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="efficacy" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Predicted Efficacy"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="confidence" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Confidence Level"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Comparative Analysis */}
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-semibold">Comparative Efficacy</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Comparators */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Alternative Treatments</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                      <div>
                        <span className="font-medium text-purple-900">{selectedPrediction.drugName}</span>
                        <p className="text-sm text-purple-700">Current prediction</p>
                      </div>
                      <span className="text-lg font-bold text-purple-600">{selectedPrediction.overallScore}%</span>
                    </div>
                    {selectedPrediction.comparators.map((comp, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-900">{comp.drug}</span>
                          <p className="text-sm text-gray-600">{comp.evidence}</p>
                        </div>
                        <span className="text-lg font-bold text-gray-600">{comp.efficacy}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk-Benefit */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Risk-Benefit Analysis</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-green-900">Expected Benefit</span>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {selectedPrediction.riskBenefit.benefit}%
                      </div>
                      <p className="text-sm text-green-700">Clinical response probability</p>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-yellow-900">Associated Risk</span>
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedPrediction.riskBenefit.risk}%
                      </div>
                      <p className="text-sm text-yellow-700">Significant toxicity risk</p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-blue-900">Net Clinical Benefit</span>
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        +{selectedPrediction.riskBenefit.netBenefit}%
                      </div>
                      <p className="text-sm text-blue-700">Overall treatment advantage</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Evidence Sources */}
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Brain className="w-5 h-5 text-purple-600" />
                <h3 className="text-xl font-semibold">Evidence Base</h3>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedPrediction.evidenceSources.map((source, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{source.count}</div>
                    <div className="text-sm font-medium text-gray-700 capitalize mb-1">
                      {source.type.replace('_', ' ')}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      source.quality === 'high' ? 'bg-green-100 text-green-800' :
                      source.quality === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {source.quality} quality
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Model Information</span>
                </div>
                <p className="text-sm text-blue-700">
                  Predictions generated using ensemble AI models trained on {' '}
                  {selectedPrediction.evidenceSources.reduce((sum, source) => sum + source.count, 0)} data points
                  from clinical trials, real-world evidence, genomic studies, and biomarker analyses.
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Compare Mode */}
      {compareMode && predictions.length > 1 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Target className="w-5 h-5 text-green-600" />
              <h3 className="text-xl font-semibold">Treatment Comparison</h3>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="drugName" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Legend />
                <Bar dataKey="overallScore" fill="#8884d8" name="Overall Efficacy" />
                <Bar dataKey="riskBenefit.netBenefit" fill="#82ca9d" name="Net Benefit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
};

const PredictiveEfficacyScoringWithBoundary: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Predictive Efficacy Scoring"
      fallbackMessage="The predictive efficacy scoring system is temporarily unavailable. This feature requires advanced AI model processing."
    >
      <PredictiveEfficacyScoring />
    </FeatureErrorBoundary>
  );
};

export default PredictiveEfficacyScoringWithBoundary;