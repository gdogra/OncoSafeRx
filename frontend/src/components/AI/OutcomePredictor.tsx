import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, ComposedChart, Bar } from 'recharts';
import { TrendingUp, Heart, Activity, Clock, Brain, Target, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import Card from '../UI/Card';
import LoadingSpinner from '../UI/LoadingSpinner';
import FeatureErrorBoundary from '../ErrorBoundary/FeatureErrorBoundary';

interface SurvivalCurve {
  timePoint: number;
  survivalProbability: number;
  confidenceLower: number;
  confidenceUpper: number;
  atRisk: number;
}

interface QualityOfLifeMetric {
  timePoint: number;
  physicalFunction: number;
  emotionalWellbeing: number;
  socialFunction: number;
  overallQoL: number;
  fatigue: number;
  pain: number;
}

interface BiomarkerPrediction {
  biomarker: string;
  baseline: number;
  timeline: Array<{
    timePoint: number;
    predicted: number;
    confidence: number;
    clinicalThreshold: number;
  }>;
  prognosticValue: 'high' | 'medium' | 'low';
}

interface ToxicityProbability {
  toxicity: string;
  grade: 1 | 2 | 3 | 4;
  probability: number;
  timeToOnset: number;
  duration: number;
  management: string;
  reversible: boolean;
}

interface OutcomePrediction {
  treatmentName: string;
  overallSurvival: SurvivalCurve[];
  progressionFreeSurvival: SurvivalCurve[];
  responseRate: {
    complete: number;
    partial: number;
    stable: number;
    progression: number;
    confidenceInterval: [number, number];
  };
  qualityOfLife: QualityOfLifeMetric[];
  biomarkers: BiomarkerPrediction[];
  toxicities: ToxicityProbability[];
  keyMilestones: Array<{
    timePoint: number;
    event: string;
    probability: number;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
  confidence: number;
  alternativeScenarios: Array<{
    scenario: string;
    probability: number;
    outcomeChange: number;
  }>;
}

const OutcomePredictor: React.FC = () => {
  const [predictions, setPredictions] = useState<OutcomePrediction[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<OutcomePrediction | null>(null);
  const [timeHorizon, setTimeHorizon] = useState<12 | 24 | 36>(24);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'survival' | 'quality' | 'biomarkers' | 'toxicity'>('survival');
  const [comparisonMode, setComparisonMode] = useState(false);

  useEffect(() => {
    generatePredictions();
  }, [timeHorizon]);

  const generatePredictions = async () => {
    setIsCalculating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockPredictions: OutcomePrediction[] = [
        {
          treatmentName: 'AI-Optimized Immunotherapy',
          overallSurvival: generateSurvivalCurve(78, timeHorizon),
          progressionFreeSurvival: generateSurvivalCurve(65, timeHorizon),
          responseRate: {
            complete: 24,
            partial: 58,
            stable: 15,
            progression: 3,
            confidenceInterval: [76, 88]
          },
          qualityOfLife: generateQualityOfLifeData(timeHorizon),
          biomarkers: [
            {
              biomarker: 'CEA',
              baseline: 45.2,
              timeline: generateBiomarkerTimeline(45.2, 8.5, timeHorizon),
              prognosticValue: 'high'
            },
            {
              biomarker: 'CA 19-9',
              baseline: 120.8,
              timeline: generateBiomarkerTimeline(120.8, 25.3, timeHorizon),
              prognosticValue: 'medium'
            },
            {
              biomarker: 'PD-L1',
              baseline: 85,
              timeline: generateBiomarkerTimeline(85, 45, timeHorizon),
              prognosticValue: 'high'
            }
          ],
          toxicities: [
            {
              toxicity: 'Immune-related pneumonitis',
              grade: 2,
              probability: 12,
              timeToOnset: 8,
              duration: 6,
              management: 'Corticosteroids',
              reversible: true
            },
            {
              toxicity: 'Fatigue',
              grade: 2,
              probability: 45,
              timeToOnset: 2,
              duration: 12,
              management: 'Supportive care',
              reversible: true
            },
            {
              toxicity: 'Thyroid dysfunction',
              grade: 1,
              probability: 28,
              timeToOnset: 12,
              duration: 24,
              management: 'Hormone replacement',
              reversible: false
            }
          ],
          keyMilestones: [
            { timePoint: 3, event: 'First response assessment', probability: 85, impact: 'positive' },
            { timePoint: 6, event: 'Confirmed response', probability: 78, impact: 'positive' },
            { timePoint: 12, event: 'Disease control', probability: 82, impact: 'positive' },
            { timePoint: 18, event: 'Potential progression', probability: 25, impact: 'negative' }
          ],
          confidence: 89,
          alternativeScenarios: [
            { scenario: 'Optimal responder', probability: 25, outcomeChange: +15 },
            { scenario: 'Standard response', probability: 60, outcomeChange: 0 },
            { scenario: 'Poor responder', probability: 15, outcomeChange: -20 }
          ]
        },
        {
          treatmentName: 'Standard Chemotherapy',
          overallSurvival: generateSurvivalCurve(52, timeHorizon),
          progressionFreeSurvival: generateSurvivalCurve(38, timeHorizon),
          responseRate: {
            complete: 8,
            partial: 35,
            stable: 42,
            progression: 15,
            confidenceInterval: [38, 48]
          },
          qualityOfLife: generateQualityOfLifeData(timeHorizon, -10),
          biomarkers: [
            {
              biomarker: 'CEA',
              baseline: 45.2,
              timeline: generateBiomarkerTimeline(45.2, 18.2, timeHorizon),
              prognosticValue: 'medium'
            },
            {
              biomarker: 'CA 19-9',
              baseline: 120.8,
              timeline: generateBiomarkerTimeline(120.8, 45.6, timeHorizon),
              prognosticValue: 'medium'
            }
          ],
          toxicities: [
            {
              toxicity: 'Neutropenia',
              grade: 3,
              probability: 35,
              timeToOnset: 2,
              duration: 1,
              management: 'G-CSF support',
              reversible: true
            },
            {
              toxicity: 'Neuropathy',
              grade: 2,
              probability: 55,
              timeToOnset: 12,
              duration: 24,
              management: 'Dose reduction',
              reversible: false
            },
            {
              toxicity: 'Nausea/Vomiting',
              grade: 2,
              probability: 68,
              timeToOnset: 1,
              duration: 6,
              management: 'Antiemetics',
              reversible: true
            }
          ],
          keyMilestones: [
            { timePoint: 3, event: 'First response assessment', probability: 65, impact: 'positive' },
            { timePoint: 6, event: 'Confirmed response', probability: 48, impact: 'positive' },
            { timePoint: 12, event: 'Disease control', probability: 58, impact: 'positive' },
            { timePoint: 18, event: 'Potential progression', probability: 55, impact: 'negative' }
          ],
          confidence: 92,
          alternativeScenarios: [
            { scenario: 'Optimal responder', probability: 15, outcomeChange: +12 },
            { scenario: 'Standard response', probability: 70, outcomeChange: 0 },
            { scenario: 'Poor responder', probability: 15, outcomeChange: -15 }
          ]
        }
      ];
      
      setPredictions(mockPredictions);
      setSelectedPrediction(mockPredictions[0]);
      
    } catch (error) {
      console.error('Error generating predictions:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const generateSurvivalCurve = (medianSurvival: number, horizon: number): SurvivalCurve[] => {
    const curve: SurvivalCurve[] = [];
    const lambda = Math.log(2) / medianSurvival;
    
    for (let month = 0; month <= horizon; month++) {
      const survival = Math.exp(-lambda * month) * 100;
      const atRisk = Math.round(survival * 2.5);
      
      curve.push({
        timePoint: month,
        survivalProbability: Math.round(survival * 10) / 10,
        confidenceLower: Math.max(0, Math.round((survival - 8) * 10) / 10),
        confidenceUpper: Math.min(100, Math.round((survival + 8) * 10) / 10),
        atRisk
      });
    }
    
    return curve;
  };

  const generateQualityOfLifeData = (horizon: number, offset: number = 0): QualityOfLifeMetric[] => {
    const data: QualityOfLifeMetric[] = [];
    
    for (let month = 0; month <= horizon; month++) {
      const decay = Math.exp(-month / 18);
      const recovery = month > 6 ? Math.min(1, (month - 6) / 12) : 0;
      
      data.push({
        timePoint: month,
        physicalFunction: Math.round((75 + offset + decay * 15 + recovery * 5) * 10) / 10,
        emotionalWellbeing: Math.round((80 + offset + decay * 10 + recovery * 8) * 10) / 10,
        socialFunction: Math.round((70 + offset + decay * 20 + recovery * 10) * 10) / 10,
        overallQoL: Math.round((75 + offset + decay * 15 + recovery * 7) * 10) / 10,
        fatigue: Math.round((30 - offset + Math.sin(month / 3) * 10) * 10) / 10,
        pain: Math.round((25 - offset + Math.sin(month / 4) * 8) * 10) / 10
      });
    }
    
    return data;
  };

  const generateBiomarkerTimeline = (baseline: number, target: number, horizon: number) => {
    const timeline = [];
    
    for (let month = 0; month <= horizon; month++) {
      const progress = 1 - Math.exp(-month / 8);
      const predicted = baseline + (target - baseline) * progress;
      const noise = (Math.random() - 0.5) * baseline * 0.1;
      
      timeline.push({
        timePoint: month,
        predicted: Math.round((predicted + noise) * 10) / 10,
        confidence: Math.round((95 - month * 1.5 + Math.random() * 5) * 10) / 10,
        clinicalThreshold: target * 1.2
      });
    }
    
    return timeline;
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'survival': return <Heart className="w-5 h-5 text-red-500" />;
      case 'quality': return <Activity className="w-5 h-5 text-blue-500" />;
      case 'biomarkers': return <Target className="w-5 h-5 text-green-500" />;
      case 'toxicity': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getToxicityColor = (grade: number) => {
    switch (grade) {
      case 1: return 'text-green-600 bg-green-100';
      case 2: return 'text-yellow-600 bg-yellow-100';
      case 3: return 'text-orange-600 bg-orange-100';
      case 4: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Comprehensive Outcome Predictor</h1>
            <p className="text-gray-600">AI-powered survival curves, quality of life, and biomarker predictions</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeHorizon}
            onChange={(e) => setTimeHorizon(Number(e.target.value) as 12 | 24 | 36)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value={12}>12 months</option>
            <option value={24}>24 months</option>
            <option value={36}>36 months</option>
          </select>
          <button
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              comparisonMode 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Compare Treatments
          </button>
        </div>
      </div>

      {/* Calculation Status */}
      {isCalculating && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="sm" />
              <div>
                <h3 className="font-medium text-gray-900">Generating Outcome Predictions</h3>
                <p className="text-sm text-gray-600">
                  Processing survival models, quality of life assessments, and biomarker trajectories...
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Survival Models</span>
                <span className="text-green-600">Complete</span>
              </div>
              <div className="flex justify-between">
                <span>QoL Assessment</span>
                <span className="text-blue-600">Processing...</span>
              </div>
              <div className="flex justify-between">
                <span>Biomarker Prediction</span>
                <span className="text-yellow-600">Pending</span>
              </div>
              <div className="flex justify-between">
                <span>Toxicity Modeling</span>
                <span className="text-gray-500">Queued</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Treatment Selection */}
      {predictions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {predictions.map((prediction, index) => (
            <Card 
              key={index}
              className={`cursor-pointer transition-all ${
                selectedPrediction?.treatmentName === prediction.treatmentName 
                  ? 'ring-2 ring-purple-500 bg-purple-50' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedPrediction(prediction)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{prediction.treatmentName}</h3>
                    <p className="text-sm text-gray-600">
                      Confidence: {prediction.confidence}%
                    </p>
                  </div>
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Overall Response</p>
                    <p className="text-lg font-semibold text-green-600">
                      {prediction.responseRate.complete + prediction.responseRate.partial}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">24-Month Survival</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {prediction.overallSurvival.find(s => s.timePoint === 24)?.survivalProbability || 'N/A'}%
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Complete Response</span>
                    <span className="font-medium">{prediction.responseRate.complete}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Partial Response</span>
                    <span className="font-medium">{prediction.responseRate.partial}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Disease Control</span>
                    <span className="font-medium">
                      {prediction.responseRate.complete + prediction.responseRate.partial + prediction.responseRate.stable}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Metric Selection */}
      {selectedPrediction && (
        <Card>
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-900">View:</span>
              {(['survival', 'quality', 'biomarkers', 'toxicity'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    selectedMetric === metric
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getMetricIcon(metric)}
                  <span className="capitalize">{metric === 'quality' ? 'Quality of Life' : metric}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Detailed Predictions */}
      {selectedPrediction && (
        <div className="space-y-6">
          {/* Survival Curves */}
          {selectedMetric === 'survival' && (
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Heart className="w-5 h-5 text-red-500" />
                  <h3 className="text-xl font-semibold">Survival Predictions</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Overall Survival */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Overall Survival</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={selectedPrediction.overallSurvival}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timePoint" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip 
                          formatter={(value: number) => [`${value}%`, 'Survival']}
                          labelFormatter={(month: number) => `Month ${month}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="confidenceUpper"
                          stackId="1"
                          stroke="none"
                          fill="#e0e7ff"
                        />
                        <Area
                          type="monotone"
                          dataKey="survivalProbability"
                          stackId="1"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.6}
                        />
                        <Line
                          type="monotone"
                          dataKey="confidenceLower"
                          stroke="#3b82f6"
                          strokeDasharray="5 5"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Progression-Free Survival */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Progression-Free Survival</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={selectedPrediction.progressionFreeSurvival}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timePoint" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip 
                          formatter={(value: number) => [`${value}%`, 'PFS']}
                          labelFormatter={(month: number) => `Month ${month}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="survivalProbability"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Key Milestones */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Treatment Milestones</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedPrediction.keyMilestones.map((milestone, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          {milestone.impact === 'positive' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : milestone.impact === 'negative' ? (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-500" />
                          )}
                          <div>
                            <span className="font-medium">{milestone.event}</span>
                            <p className="text-sm text-gray-600">Month {milestone.timePoint}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-blue-600">{milestone.probability}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Quality of Life */}
          {selectedMetric === 'quality' && (
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <h3 className="text-xl font-semibold">Quality of Life Predictions</h3>
                </div>

                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={selectedPrediction.qualityOfLife}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timePoint" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [`${value}`, name]}
                      labelFormatter={(month: number) => `Month ${month}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="overallQoL" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Overall Quality of Life"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="physicalFunction" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Physical Function"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="emotionalWellbeing" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      name="Emotional Well-being"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="socialFunction" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Social Function"
                    />
                  </LineChart>
                </ResponsiveContainer>

                <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {['physicalFunction', 'emotionalWellbeing', 'socialFunction', 'overallQoL'].map((metric) => (
                    <div key={metric} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">
                        {selectedPrediction.qualityOfLife[6]?.[metric as keyof QualityOfLifeMetric] || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {metric.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </div>
                      <div className="text-xs text-gray-500">at 6 months</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Biomarkers */}
          {selectedMetric === 'biomarkers' && (
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Target className="w-5 h-5 text-green-500" />
                  <h3 className="text-xl font-semibold">Biomarker Predictions</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {selectedPrediction.biomarkers.map((biomarker, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{biomarker.biomarker}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          biomarker.prognosticValue === 'high' ? 'bg-green-100 text-green-800' :
                          biomarker.prognosticValue === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {biomarker.prognosticValue} prognostic value
                        </span>
                      </div>
                      <ResponsiveContainer width="100%" height={250}>
                        <ComposedChart data={biomarker.timeline}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="timePoint" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="clinicalThreshold" fill="#ef4444" opacity={0.3} />
                          <Line 
                            type="monotone" 
                            dataKey="predicted" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Toxicity */}
          {selectedMetric === 'toxicity' && (
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-xl font-semibold">Toxicity Predictions</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {selectedPrediction.toxicities.map((toxicity, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{toxicity.toxicity}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${getToxicityColor(toxicity.grade)}`}>
                          Grade {toxicity.grade}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Probability:</span>
                          <span className="font-medium">{toxicity.probability}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time to Onset:</span>
                          <span>{toxicity.timeToOnset} weeks</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{toxicity.duration} weeks</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reversible:</span>
                          <span className={toxicity.reversible ? 'text-green-600' : 'text-red-600'}>
                            {toxicity.reversible ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-2 bg-blue-50 rounded">
                        <p className="text-sm text-blue-700">
                          <strong>Management:</strong> {toxicity.management}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Alternative Scenarios */}
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Zap className="w-5 h-5 text-purple-500" />
                <h3 className="text-xl font-semibold">Alternative Scenarios</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedPrediction.alternativeScenarios.map((scenario, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <h4 className="font-medium text-gray-900 mb-2">{scenario.scenario}</h4>
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {scenario.probability}%
                      </div>
                      <div className="text-sm text-gray-600 mb-2">Probability</div>
                      <div className={`text-lg font-semibold ${
                        scenario.outcomeChange > 0 ? 'text-green-600' : 
                        scenario.outcomeChange < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {scenario.outcomeChange > 0 ? '+' : ''}{scenario.outcomeChange}%
                      </div>
                      <div className="text-xs text-gray-500">Outcome Change</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Comparison Mode */}
      {comparisonMode && predictions.length > 1 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-xl font-semibold">Treatment Comparison</h3>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timePoint" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                {predictions.map((prediction, index) => (
                  <Line
                    key={index}
                    data={prediction.overallSurvival}
                    type="monotone"
                    dataKey="survivalProbability"
                    stroke={index === 0 ? '#3b82f6' : '#10b981'}
                    strokeWidth={3}
                    name={prediction.treatmentName}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
};

const OutcomePredictorWithBoundary: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Comprehensive Outcome Predictor"
      fallbackMessage="The outcome prediction system is temporarily unavailable. This feature requires advanced survival modeling and AI analysis."
    >
      <OutcomePredictor />
    </FeatureErrorBoundary>
  );
};

export default OutcomePredictorWithBoundary;