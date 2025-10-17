import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock, Brain, Target, AlertTriangle, Activity, BarChart3, Zap, Calendar, LineChart } from 'lucide-react';

interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  prediction: number;
  confidence: number;
  anomaly: boolean;
  biomarker: string;
}

interface PredictionModel {
  id: string;
  name: string;
  type: 'LSTM' | 'ARIMA' | 'Prophet' | 'Transformer' | 'GRU' | 'CNN-LSTM';
  accuracy: number;
  horizon: number; // prediction horizon in days
  features: string[];
  lastTrained: string;
  performance: {
    mae: number; // Mean Absolute Error
    rmse: number; // Root Mean Square Error
    mape: number; // Mean Absolute Percentage Error
    r2Score: number; // R-squared
  };
  hyperparameters: {
    learningRate: number;
    epochs: number;
    batchSize: number;
    hiddenLayers: number;
  };
}

interface CancerProgression {
  id: string;
  patientId: string;
  cancerType: string;
  stage: string;
  timeline: TimeSeriesDataPoint[];
  futureProjection: {
    timeHorizons: Array<{
      days: number;
      probability: number;
      confidence: number;
      riskLevel: 'low' | 'moderate' | 'high' | 'critical';
      expectedStage: string;
      treatmentWindow: {
        optimal: boolean;
        urgency: 'routine' | 'priority' | 'urgent' | 'emergency';
      };
    }>;
  };
  seasonalPatterns: {
    detected: boolean;
    cycles: Array<{
      period: number; // days
      amplitude: number;
      phase: number;
    }>;
  };
  trendAnalysis: {
    direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    velocity: number;
    acceleration: number;
    changePoints: Array<{
      timestamp: string;
      significance: number;
      cause: string;
    }>;
  };
}

interface RiskForecast {
  id: string;
  patientId: string;
  forecastType: 'recurrence' | 'metastasis' | 'progression' | 'survival';
  timeframe: {
    short: { days: 30; probability: number; };
    medium: { days: 90; probability: number; };
    long: { days: 365; probability: number; };
    extended: { days: 1825; probability: number; }; // 5 years
  };
  riskFactors: Array<{
    factor: string;
    weight: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    contribution: number;
  }>;
  interventionOpportunities: Array<{
    window: { start: string; end: string; };
    intervention: string;
    impactScore: number;
    urgency: number;
  }>;
}

interface TemporalBiomarker {
  id: string;
  name: string;
  category: 'protein' | 'genetic' | 'imaging' | 'clinical' | 'metabolic';
  unit: string;
  normalRange: { min: number; max: number; };
  currentValue: number;
  trend: {
    direction: 'up' | 'down' | 'stable';
    rate: number; // change per day
    volatility: number;
  };
  forecast: Array<{
    date: string;
    predicted: number;
    confidence: number;
    clinicalSignificance: 'normal' | 'borderline' | 'abnormal' | 'critical';
  }>;
  correlations: Array<{
    biomarker: string;
    correlation: number;
    lag: number; // days
  }>;
}

const TimeSeriesCancerPrediction: React.FC = () => {
  const [activeTab, setActiveTab] = useState('models');
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [progressions, setProgressions] = useState<CancerProgression[]>([]);
  const [riskForecasts, setRiskForecasts] = useState<RiskForecast[]>([]);
  const [biomarkers, setBiomarkers] = useState<TemporalBiomarker[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate mock data
  useEffect(() => {
    const generateMockModels = (): PredictionModel[] => {
      const modelTypes: PredictionModel['type'][] = ['LSTM', 'ARIMA', 'Prophet', 'Transformer', 'GRU', 'CNN-LSTM'];
      
      return modelTypes.map((type, i) => ({
        id: `model-${i}`,
        name: `${type} Cancer Progression Model`,
        type,
        accuracy: 85 + Math.random() * 12,
        horizon: [30, 90, 180, 365][Math.floor(Math.random() * 4)],
        features: ['PSA', 'CTC Count', 'Tumor Volume', 'Genetic Markers', 'Clinical Symptoms'],
        lastTrained: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        performance: {
          mae: Math.random() * 0.1,
          rmse: Math.random() * 0.15,
          mape: Math.random() * 5 + 2,
          r2Score: 0.8 + Math.random() * 0.18,
        },
        hyperparameters: {
          learningRate: 0.001 + Math.random() * 0.009,
          epochs: Math.floor(Math.random() * 200) + 100,
          batchSize: [16, 32, 64, 128][Math.floor(Math.random() * 4)],
          hiddenLayers: Math.floor(Math.random() * 8) + 2,
        },
      }));
    };

    const generateMockProgressions = (): CancerProgression[] => {
      return Array.from({ length: 5 }, (_, i) => {
        const timeline = Array.from({ length: 60 }, (_, j) => ({
          timestamp: new Date(Date.now() - (60 - j) * 24 * 60 * 60 * 1000).toISOString(),
          value: 50 + Math.sin(j * 0.1) * 20 + Math.random() * 10,
          prediction: 50 + Math.sin(j * 0.1) * 20 + Math.random() * 5,
          confidence: 0.7 + Math.random() * 0.25,
          anomaly: Math.random() < 0.05,
          biomarker: ['PSA', 'CEA', 'CA-125', 'AFP'][Math.floor(Math.random() * 4)],
        }));

        return {
          id: `progression-${i}`,
          patientId: `patient-${i}`,
          cancerType: ['Prostate', 'Breast', 'Lung', 'Colorectal', 'Pancreatic'][i],
          stage: ['I', 'II', 'III', 'IV'][Math.floor(Math.random() * 4)],
          timeline,
          futureProjection: {
            timeHorizons: [30, 90, 180, 365].map(days => ({
              days,
              probability: Math.random() * 100,
              confidence: 0.6 + Math.random() * 0.3,
              riskLevel: ['low', 'moderate', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
              expectedStage: ['I', 'II', 'III', 'IV'][Math.floor(Math.random() * 4)],
              treatmentWindow: {
                optimal: Math.random() > 0.3,
                urgency: ['routine', 'priority', 'urgent', 'emergency'][Math.floor(Math.random() * 4)] as any,
              },
            })),
          },
          seasonalPatterns: {
            detected: Math.random() > 0.5,
            cycles: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
              period: Math.floor(Math.random() * 90) + 30,
              amplitude: Math.random() * 20,
              phase: Math.random() * 2 * Math.PI,
            })),
          },
          trendAnalysis: {
            direction: ['increasing', 'decreasing', 'stable', 'volatile'][Math.floor(Math.random() * 4)] as any,
            velocity: (Math.random() - 0.5) * 2,
            acceleration: (Math.random() - 0.5) * 0.1,
            changePoints: Array.from({ length: Math.floor(Math.random() * 3) }, (_, j) => ({
              timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
              significance: Math.random(),
              cause: ['Treatment Response', 'Disease Progression', 'Medication Change'][j % 3],
            })),
          },
        };
      });
    };

    const generateMockRiskForecasts = (): RiskForecast[] => {
      return Array.from({ length: 3 }, (_, i) => ({
        id: `forecast-${i}`,
        patientId: `patient-${i}`,
        forecastType: ['recurrence', 'metastasis', 'progression', 'survival'][i] as any,
        timeframe: {
          short: { days: 30, probability: Math.random() * 30 },
          medium: { days: 90, probability: Math.random() * 50 },
          long: { days: 365, probability: Math.random() * 70 },
          extended: { days: 1825, probability: Math.random() * 85 },
        },
        riskFactors: [
          'Age', 'Tumor Grade', 'Genetic Markers', 'Treatment History', 'Lifestyle Factors'
        ].map(factor => ({
          factor,
          weight: Math.random(),
          trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any,
          contribution: Math.random() * 0.3,
        })),
        interventionOpportunities: Array.from({ length: 3 }, (_, j) => ({
          window: {
            start: new Date(Date.now() + j * 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date(Date.now() + (j + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          intervention: ['Chemotherapy', 'Radiation', 'Immunotherapy'][j],
          impactScore: Math.random() * 100,
          urgency: Math.random() * 100,
        })),
      }));
    };

    const generateMockBiomarkers = (): TemporalBiomarker[] => {
      const biomarkerNames = ['PSA', 'CEA', 'CA-125', 'AFP', 'HCG', 'LDH'];
      
      return biomarkerNames.map((name, i) => ({
        id: `biomarker-${i}`,
        name,
        category: ['protein', 'genetic', 'imaging', 'clinical', 'metabolic'][Math.floor(Math.random() * 5)] as any,
        unit: ['ng/mL', 'IU/mL', 'U/mL', 'mg/dL'][Math.floor(Math.random() * 4)],
        normalRange: { min: Math.random() * 5, max: Math.random() * 20 + 10 },
        currentValue: Math.random() * 30,
        trend: {
          direction: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any,
          rate: (Math.random() - 0.5) * 2,
          volatility: Math.random() * 0.5,
        },
        forecast: Array.from({ length: 30 }, (_, j) => ({
          date: new Date(Date.now() + j * 24 * 60 * 60 * 1000).toISOString(),
          predicted: Math.random() * 30,
          confidence: 0.7 + Math.random() * 0.25,
          clinicalSignificance: ['normal', 'borderline', 'abnormal', 'critical'][Math.floor(Math.random() * 4)] as any,
        })),
        correlations: biomarkerNames.filter(n => n !== name).map(biomarker => ({
          biomarker,
          correlation: (Math.random() - 0.5) * 2,
          lag: Math.floor(Math.random() * 14),
        })),
      }));
    };

    setModels(generateMockModels());
    setProgressions(generateMockProgressions());
    setRiskForecasts(generateMockRiskForecasts());
    setBiomarkers(generateMockBiomarkers());
  }, []);

  // Canvas visualization for time series
  useEffect(() => {
    if (!canvasRef.current || progressions.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const progression = progressions[0];
      if (!progression) return;

      const margin = 40;
      const chartWidth = canvas.width - 2 * margin;
      const chartHeight = canvas.height - 2 * margin;

      // Draw grid
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        const y = margin + (i / 10) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(margin, y);
        ctx.lineTo(margin + chartWidth, y);
        ctx.stroke();
      }

      for (let i = 0; i <= 10; i++) {
        const x = margin + (i / 10) * chartWidth;
        ctx.beginPath();
        ctx.moveTo(x, margin);
        ctx.lineTo(x, margin + chartHeight);
        ctx.stroke();
      }

      // Draw historical data
      const maxValue = Math.max(...progression.timeline.map(p => p.value));
      const minValue = Math.min(...progression.timeline.map(p => p.value));
      const range = maxValue - minValue;

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();

      progression.timeline.forEach((point, i) => {
        const x = margin + (i / (progression.timeline.length - 1)) * chartWidth;
        const y = margin + chartHeight - ((point.value - minValue) / range) * chartHeight;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Draw predictions
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();

      progression.timeline.forEach((point, i) => {
        const x = margin + (i / (progression.timeline.length - 1)) * chartWidth;
        const y = margin + chartHeight - ((point.prediction - minValue) / range) * chartHeight;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw confidence bands
      ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
      ctx.beginPath();
      
      progression.timeline.forEach((point, i) => {
        const x = margin + (i / (progression.timeline.length - 1)) * chartWidth;
        const yUpper = margin + chartHeight - ((point.prediction + point.confidence * 10 - minValue) / range) * chartHeight;
        const yLower = margin + chartHeight - ((point.prediction - point.confidence * 10 - minValue) / range) * chartHeight;
        
        if (i === 0) {
          ctx.moveTo(x, yUpper);
        } else {
          ctx.lineTo(x, yUpper);
        }
      });

      for (let i = progression.timeline.length - 1; i >= 0; i--) {
        const x = margin + (i / (progression.timeline.length - 1)) * chartWidth;
        const yLower = margin + chartHeight - ((progression.timeline[i].prediction - progression.timeline[i].confidence * 10 - minValue) / range) * chartHeight;
        ctx.lineTo(x, yLower);
      }
      
      ctx.closePath();
      ctx.fill();

      // Draw anomalies
      progression.timeline.forEach((point, i) => {
        if (point.anomaly) {
          const x = margin + (i / (progression.timeline.length - 1)) * chartWidth;
          const y = margin + chartHeight - ((point.value - minValue) / range) * chartHeight;
          
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [activeTab, progressions]);

  const renderModels = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Active Models</p>
                <p className="text-2xl font-bold">{models.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Accuracy</p>
                <p className="text-2xl font-bold">
                  {(models.reduce((sum, m) => sum + m.accuracy, 0) / models.length || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Max Horizon</p>
                <p className="text-2xl font-bold">
                  {Math.max(...models.map(m => m.horizon))} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Best R²</p>
                <p className="text-2xl font-bold">
                  {Math.max(...models.map(m => m.performance.r2Score)).toFixed(3)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prediction Models</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {models.map((model) => (
              <div key={model.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{model.name}</h4>
                    <p className="text-sm text-gray-600">{model.type} • {model.horizon} days horizon</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{model.accuracy.toFixed(1)}% accuracy</span>
                    <div className={`px-2 py-1 rounded text-xs ${
                      model.accuracy > 90 ? 'bg-green-100 text-green-800' :
                      model.accuracy > 80 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {model.accuracy > 90 ? 'Excellent' : model.accuracy > 80 ? 'Good' : 'Needs Improvement'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">MAE</p>
                    <p className="font-medium">{model.performance.mae.toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">RMSE</p>
                    <p className="font-medium">{model.performance.rmse.toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">MAPE</p>
                    <p className="font-medium">{model.performance.mape.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">R² Score</p>
                    <p className="font-medium">{model.performance.r2Score.toFixed(3)}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {model.features.map((feature) => (
                    <span key={feature} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProgression = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Active Cases</p>
                <p className="text-2xl font-bold">{progressions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Improving</p>
                <p className="text-2xl font-bold">
                  {progressions.filter(p => p.trendAnalysis.direction === 'decreasing').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Worsening</p>
                <p className="text-2xl font-bold">
                  {progressions.filter(p => p.trendAnalysis.direction === 'increasing').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Seasonal Patterns</p>
                <p className="text-2xl font-bold">
                  {progressions.filter(p => p.seasonalPatterns.detected).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Time Series Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas
              ref={canvasRef}
              className="w-full h-64 border rounded"
              style={{ background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' }}
            />
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-0.5 bg-blue-500"></div>
                <span>Historical</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-0.5 bg-red-500 border-dashed"></div>
                <span>Predicted</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Anomaly</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Future Projections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progressions[0]?.futureProjection.timeHorizons.map((horizon) => (
                <div key={horizon.days} className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">{horizon.days} days</span>
                    <p className="text-xs text-gray-600">
                      Stage {horizon.expectedStage} • {horizon.treatmentWindow.urgency}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded text-xs ${
                      horizon.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                      horizon.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      horizon.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {horizon.riskLevel}
                    </div>
                    <span className="text-sm font-medium">{horizon.probability.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderRiskForecasts = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">High Risk (30d)</p>
                <p className="text-2xl font-bold">
                  {riskForecasts.filter(r => r.timeframe.short.probability > 20).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Intervention Windows</p>
                <p className="text-2xl font-bold">
                  {riskForecasts.reduce((sum, r) => sum + r.interventionOpportunities.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Urgent Cases</p>
                <p className="text-2xl font-bold">
                  {riskForecasts.filter(r => 
                    r.interventionOpportunities.some(i => i.urgency > 80)
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Improving Trends</p>
                <p className="text-2xl font-bold">
                  {riskForecasts.filter(r => 
                    r.riskFactors.filter(f => f.trend === 'decreasing').length > 
                    r.riskFactors.filter(f => f.trend === 'increasing').length
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {riskForecasts.map((forecast) => (
          <Card key={forecast.id}>
            <CardHeader>
              <CardTitle className="capitalize">
                {forecast.forecastType} Risk Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(forecast.timeframe).map(([period, data]) => (
                    <div key={period} className="text-center">
                      <p className="text-sm text-gray-600 capitalize">{period}</p>
                      <p className="text-lg font-bold">{data.probability.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">{data.days} days</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Risk Factors</h4>
                  <div className="space-y-2">
                    {forecast.riskFactors.slice(0, 3).map((factor) => (
                      <div key={factor.factor} className="flex justify-between items-center">
                        <span className="text-sm">{factor.factor}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs ${
                            factor.trend === 'increasing' ? 'text-red-500' :
                            factor.trend === 'decreasing' ? 'text-green-500' :
                            'text-gray-500'
                          }`}>
                            {factor.trend === 'increasing' ? '↗' : factor.trend === 'decreasing' ? '↘' : '→'}
                          </span>
                          <span className="text-sm font-medium">{(factor.contribution * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderBiomarkers = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Tracked Biomarkers</p>
                <p className="text-2xl font-bold">{biomarkers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Improving</p>
                <p className="text-2xl font-bold">
                  {biomarkers.filter(b => b.trend.direction === 'down').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Worsening</p>
                <p className="text-2xl font-bold">
                  {biomarkers.filter(b => b.trend.direction === 'up').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">High Volatility</p>
                <p className="text-2xl font-bold">
                  {biomarkers.filter(b => b.trend.volatility > 0.3).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {biomarkers.map((biomarker) => (
          <Card key={biomarker.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{biomarker.name}</span>
                <span className="text-sm text-gray-600">{biomarker.unit}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Value</span>
                  <span className="font-medium">{biomarker.currentValue.toFixed(2)} {biomarker.unit}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Normal Range</span>
                  <span className="text-sm">{biomarker.normalRange.min.toFixed(1)} - {biomarker.normalRange.max.toFixed(1)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Trend</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${
                      biomarker.trend.direction === 'up' ? 'text-red-500' :
                      biomarker.trend.direction === 'down' ? 'text-green-500' :
                      'text-gray-500'
                    }`}>
                      {biomarker.trend.direction === 'up' ? '↗' : biomarker.trend.direction === 'down' ? '↘' : '→'}
                    </span>
                    <span className="text-sm">{Math.abs(biomarker.trend.rate).toFixed(3)}/day</span>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium mb-2">Correlations</h5>
                  <div className="space-y-1">
                    {biomarker.correlations.slice(0, 3).map((corr) => (
                      <div key={corr.biomarker} className="flex justify-between text-xs">
                        <span>{corr.biomarker}</span>
                        <span className={corr.correlation > 0 ? 'text-blue-500' : 'text-red-500'}>
                          {corr.correlation > 0 ? '+' : ''}{corr.correlation.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-indigo-50 to-cyan-50 min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-indigo-600 rounded-lg">
          <LineChart className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Time-Series Cancer Prediction</h1>
          <p className="text-gray-600">Advanced temporal modeling and forecasting for cancer progression</p>
        </div>
      </div>

      <div className="flex space-x-4 border-b">
        {[
          { id: 'models', label: 'Prediction Models', icon: Brain },
          { id: 'progression', label: 'Cancer Progression', icon: TrendingUp },
          { id: 'forecasts', label: 'Risk Forecasts', icon: AlertTriangle },
          { id: 'biomarkers', label: 'Temporal Biomarkers', icon: BarChart3 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'models' && renderModels()}
        {activeTab === 'progression' && renderProgression()}
        {activeTab === 'forecasts' && renderRiskForecasts()}
        {activeTab === 'biomarkers' && renderBiomarkers()}
      </div>
    </div>
  );
};

export default TimeSeriesCancerPrediction;