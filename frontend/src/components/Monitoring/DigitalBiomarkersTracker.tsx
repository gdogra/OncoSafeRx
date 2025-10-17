import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Watch, 
  Mic, 
  Camera, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Heart, 
  Brain, 
  Moon, 
  Footprints, 
  Volume2, 
  Eye, 
  Timer, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  Target, 
  Clock, 
  Wifi, 
  Battery, 
  Signal
} from 'lucide-react';
import Card from '../UI/Card';

interface BiometricReading {
  id: string;
  timestamp: Date;
  type: 'heart_rate' | 'gait' | 'voice' | 'sleep' | 'cognitive' | 'activity' | 'mood';
  value: number;
  unit: string;
  deviceSource: string;
  confidence: number;
  rawData?: any;
}

interface GaitAnalysis {
  stepCount: number;
  stepLength: number;
  walkingSpeed: number;
  symmetry: number;
  stability: number;
  cadence: number;
  timestamp: Date;
  riskScore: number;
}

interface VoiceAnalysis {
  speakingRate: number;
  pauseFrequency: number;
  voiceStability: number;
  cognitiveLoad: number;
  emotionalState: 'positive' | 'neutral' | 'negative';
  fatigueIndicators: number;
  timestamp: Date;
}

interface SleepMetrics {
  duration: number;
  efficiency: number;
  deepSleepPercentage: number;
  remSleepPercentage: number;
  restlessness: number;
  heartRateVariability: number;
  timestamp: Date;
}

interface DeviceStatus {
  name: string;
  type: 'smartphone' | 'smartwatch' | 'fitness_tracker' | 'smart_scale' | 'blood_pressure_monitor';
  connected: boolean;
  batteryLevel?: number;
  lastSync: Date;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface HealthTrend {
  metric: string;
  trend: 'improving' | 'stable' | 'declining';
  changePercent: number;
  significance: 'high' | 'medium' | 'low';
  timeframe: string;
}

const DigitalBiomarkersTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'gait' | 'voice' | 'sleep' | 'devices'>('overview');
  const [biometricReadings, setBiometricReadings] = useState<BiometricReading[]>([]);
  const [gaitData, setGaitData] = useState<GaitAnalysis[]>([]);
  const [voiceData, setVoiceData] = useState<VoiceAnalysis[]>([]);
  const [sleepData, setSleepData] = useState<SleepMetrics[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<DeviceStatus[]>([]);
  const [healthTrends, setHealthTrends] = useState<HealthTrend[]>([]);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isAnalyzingGait, setIsAnalyzingGait] = useState(false);

  useEffect(() => {
    // Mock data initialization
    setBiometricReadings([
      {
        id: '1',
        timestamp: new Date(),
        type: 'heart_rate',
        value: 78,
        unit: 'bpm',
        deviceSource: 'Apple Watch Series 8',
        confidence: 95
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000),
        type: 'activity',
        value: 7854,
        unit: 'steps',
        deviceSource: 'iPhone 15 Pro',
        confidence: 88
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 7200000),
        type: 'mood',
        value: 7.2,
        unit: 'score',
        deviceSource: 'Voice Analysis AI',
        confidence: 76
      }
    ]);

    setGaitData([
      {
        stepCount: 7854,
        stepLength: 0.68,
        walkingSpeed: 1.32,
        symmetry: 92,
        stability: 85,
        cadence: 112,
        timestamp: new Date(),
        riskScore: 15
      }
    ]);

    setVoiceData([
      {
        speakingRate: 165,
        pauseFrequency: 0.12,
        voiceStability: 87,
        cognitiveLoad: 35,
        emotionalState: 'neutral',
        fatigueIndicators: 28,
        timestamp: new Date()
      }
    ]);

    setSleepData([
      {
        duration: 7.2,
        efficiency: 84,
        deepSleepPercentage: 18,
        remSleepPercentage: 22,
        restlessness: 12,
        heartRateVariability: 45,
        timestamp: new Date(Date.now() - 86400000)
      }
    ]);

    setConnectedDevices([
      {
        name: 'Apple Watch Series 8',
        type: 'smartwatch',
        connected: true,
        batteryLevel: 78,
        lastSync: new Date(),
        dataQuality: 'excellent'
      },
      {
        name: 'iPhone 15 Pro',
        type: 'smartphone',
        connected: true,
        batteryLevel: 92,
        lastSync: new Date(),
        dataQuality: 'excellent'
      },
      {
        name: 'Withings Body+',
        type: 'smart_scale',
        connected: true,
        batteryLevel: 45,
        lastSync: new Date(Date.now() - 3600000),
        dataQuality: 'good'
      },
      {
        name: 'Omron HeartGuide',
        type: 'blood_pressure_monitor',
        connected: false,
        lastSync: new Date(Date.now() - 86400000),
        dataQuality: 'fair'
      }
    ]);

    setHealthTrends([
      {
        metric: 'Gait Stability',
        trend: 'improving',
        changePercent: 12,
        significance: 'high',
        timeframe: 'Past 2 weeks'
      },
      {
        metric: 'Voice Fatigue Indicators',
        trend: 'stable',
        changePercent: -2,
        significance: 'medium',
        timeframe: 'Past week'
      },
      {
        metric: 'Sleep Efficiency',
        trend: 'declining',
        changePercent: -8,
        significance: 'high',
        timeframe: 'Past month'
      },
      {
        metric: 'Heart Rate Variability',
        trend: 'improving',
        changePercent: 15,
        significance: 'medium',
        timeframe: 'Past 3 weeks'
      }
    ]);
  }, []);

  const startVoiceAnalysis = () => {
    setIsRecordingVoice(true);
    // Mock voice recording analysis
    setTimeout(() => {
      setIsRecordingVoice(false);
      // Add new voice analysis result
      const newVoiceData: VoiceAnalysis = {
        speakingRate: 158 + Math.random() * 20,
        pauseFrequency: 0.08 + Math.random() * 0.08,
        voiceStability: 80 + Math.random() * 15,
        cognitiveLoad: 25 + Math.random() * 30,
        emotionalState: Math.random() > 0.6 ? 'positive' : 'neutral',
        fatigueIndicators: 20 + Math.random() * 40,
        timestamp: new Date()
      };
      setVoiceData(prev => [newVoiceData, ...prev.slice(0, 9)]);
    }, 3000);
  };

  const startGaitAnalysis = () => {
    setIsAnalyzingGait(true);
    // Mock gait analysis
    setTimeout(() => {
      setIsAnalyzingGait(false);
      // Add new gait analysis result
      const newGaitData: GaitAnalysis = {
        stepCount: Math.floor(Math.random() * 100) + 50,
        stepLength: 0.6 + Math.random() * 0.2,
        walkingSpeed: 1.1 + Math.random() * 0.5,
        symmetry: 85 + Math.random() * 10,
        stability: 80 + Math.random() * 15,
        cadence: 100 + Math.random() * 20,
        timestamp: new Date(),
        riskScore: Math.floor(Math.random() * 30)
      };
      setGaitData(prev => [newGaitData, ...prev.slice(0, 9)]);
    }, 5000);
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone': return <Smartphone className="w-5 h-5" />;
      case 'smartwatch': return <Watch className="w-5 h-5" />;
      case 'fitness_tracker': return <Activity className="w-5 h-5" />;
      case 'smart_scale': return <BarChart3 className="w-5 h-5" />;
      case 'blood_pressure_monitor': return <Heart className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getDataQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score < 20) return 'text-green-600 bg-green-50';
    if (score < 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Activity className="w-8 h-8 mr-3 text-blue-600" />
            Digital Biomarkers
          </h1>
          <p className="text-gray-600 mt-1">
            Continuous health monitoring through your devices
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={startVoiceAnalysis}
            disabled={isRecordingVoice}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isRecordingVoice 
                ? 'bg-red-100 text-red-700 border border-red-300' 
                : 'bg-blue-100 text-blue-700 border border-blue-300'
            } hover:bg-opacity-80 transition-colors disabled:opacity-50`}
          >
            <Mic className={`w-4 h-4 ${isRecordingVoice ? 'animate-pulse' : ''}`} />
            <span>{isRecordingVoice ? 'Analyzing Voice...' : 'Voice Check'}</span>
          </button>
          <button
            onClick={startGaitAnalysis}
            disabled={isAnalyzingGait}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isAnalyzingGait 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-purple-100 text-purple-700 border border-purple-300'
            } hover:bg-opacity-80 transition-colors disabled:opacity-50`}
          >
            <Footprints className={`w-4 h-4 ${isAnalyzingGait ? 'animate-pulse' : ''}`} />
            <span>{isAnalyzingGait ? 'Analyzing Gait...' : 'Gait Check'}</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'gait', label: 'Gait Analysis', icon: Footprints },
            { id: 'voice', label: 'Voice Patterns', icon: Volume2 },
            { id: 'sleep', label: 'Sleep Quality', icon: Moon },
            { id: 'devices', label: 'Connected Devices', icon: Smartphone }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Health Trends */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Health Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {healthTrends.map((trend, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 text-sm">{trend.metric}</h3>
                    {getTrendIcon(trend.trend)}
                  </div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-lg font-bold ${
                      trend.trend === 'improving' ? 'text-green-600' :
                      trend.trend === 'declining' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {trend.changePercent > 0 ? '+' : ''}{trend.changePercent}%
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      trend.significance === 'high' ? 'bg-red-100 text-red-800' :
                      trend.significance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {trend.significance}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{trend.timeframe}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Biomarker Readings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Biomarker Readings</h2>
            <div className="space-y-3">
              {biometricReadings.map((reading) => (
                <div key={reading.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {reading.type === 'heart_rate' && <Heart className="w-5 h-5 text-red-600" />}
                      {reading.type === 'activity' && <Footprints className="w-5 h-5 text-green-600" />}
                      {reading.type === 'mood' && <Brain className="w-5 h-5 text-purple-600" />}
                      {reading.type === 'sleep' && <Moon className="w-5 h-5 text-blue-600" />}
                      {reading.type === 'cognitive' && <Brain className="w-5 h-5 text-orange-600" />}
                      {reading.type === 'voice' && <Volume2 className="w-5 h-5 text-teal-600" />}
                      {reading.type === 'gait' && <Footprints className="w-5 h-5 text-indigo-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {reading.type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600">{reading.deviceSource}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {reading.value} {reading.unit}
                    </p>
                    <p className="text-xs text-gray-500">
                      {reading.confidence}% confidence
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Gait Analysis Tab */}
      {activeTab === 'gait' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Gait Analysis</h2>
            {gaitData.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Footprints className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-sm text-gray-600">Steps</p>
                  <p className="text-lg font-bold">{gaitData[0].stepCount}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Target className="w-8 h-8 mx-auto text-green-600 mb-2" />
                  <p className="text-sm text-gray-600">Step Length</p>
                  <p className="text-lg font-bold">{gaitData[0].stepLength}m</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Zap className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
                  <p className="text-sm text-gray-600">Speed</p>
                  <p className="text-lg font-bold">{gaitData[0].walkingSpeed} m/s</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Activity className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                  <p className="text-sm text-gray-600">Symmetry</p>
                  <p className="text-lg font-bold">{gaitData[0].symmetry}%</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 mx-auto text-teal-600 mb-2" />
                  <p className="text-sm text-gray-600">Stability</p>
                  <p className="text-lg font-bold">{gaitData[0].stability}%</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                  <p className="text-sm text-gray-600">Cadence</p>
                  <p className="text-lg font-bold">{gaitData[0].cadence} spm</p>
                </div>
              </div>
            )}
            
            {gaitData.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-blue-900">Fall Risk Assessment</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskScoreColor(gaitData[0].riskScore)}`}>
                    Risk Score: {gaitData[0].riskScore}%
                  </span>
                </div>
                <p className="text-sm text-blue-800">
                  {gaitData[0].riskScore < 20 ? 'Low fall risk. Gait patterns appear stable.' :
                   gaitData[0].riskScore < 40 ? 'Moderate fall risk. Consider balance exercises.' :
                   'Higher fall risk detected. Recommend consultation with healthcare provider.'}
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Voice Analysis Tab */}
      {activeTab === 'voice' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Voice Pattern Analysis</h2>
            {voiceData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Speech Characteristics
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Speaking Rate</span>
                      <span className="text-sm font-medium">{voiceData[0].speakingRate} wpm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Voice Stability</span>
                      <span className="text-sm font-medium">{voiceData[0].voiceStability}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pause Frequency</span>
                      <span className="text-sm font-medium">{voiceData[0].pauseFrequency.toFixed(2)}/sec</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    Cognitive Indicators
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cognitive Load</span>
                      <span className={`text-sm font-medium ${
                        voiceData[0].cognitiveLoad < 30 ? 'text-green-600' :
                        voiceData[0].cognitiveLoad < 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {voiceData[0].cognitiveLoad}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fatigue Indicators</span>
                      <span className={`text-sm font-medium ${
                        voiceData[0].fatigueIndicators < 30 ? 'text-green-600' :
                        voiceData[0].fatigueIndicators < 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {voiceData[0].fatigueIndicators}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Emotional State</span>
                      <span className={`text-sm font-medium capitalize ${
                        voiceData[0].emotionalState === 'positive' ? 'text-green-600' :
                        voiceData[0].emotionalState === 'negative' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {voiceData[0].emotionalState}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Health Insights
                  </h3>
                  <div className="space-y-2">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-blue-900">AI Analysis</p>
                      <p className="text-sm text-blue-800">
                        {voiceData[0].fatigueIndicators < 30 ? 
                          'Voice patterns suggest good energy levels' :
                        voiceData[0].fatigueIndicators < 60 ? 
                          'Mild fatigue detected in speech patterns' :
                          'Significant fatigue indicators present'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Sleep Analysis Tab */}
      {activeTab === 'sleep' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sleep Quality Analysis</h2>
            {sleepData.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-lg font-bold">{sleepData[0].duration}h</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Target className="w-8 h-8 mx-auto text-green-600 mb-2" />
                  <p className="text-sm text-gray-600">Efficiency</p>
                  <p className="text-lg font-bold">{sleepData[0].efficiency}%</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Moon className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                  <p className="text-sm text-gray-600">Deep Sleep</p>
                  <p className="text-lg font-bold">{sleepData[0].deepSleepPercentage}%</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Brain className="w-8 h-8 mx-auto text-teal-600 mb-2" />
                  <p className="text-sm text-gray-600">REM Sleep</p>
                  <p className="text-lg font-bold">{sleepData[0].remSleepPercentage}%</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Activity className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                  <p className="text-sm text-gray-600">Restlessness</p>
                  <p className="text-lg font-bold">{sleepData[0].restlessness}%</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Heart className="w-8 h-8 mx-auto text-red-600 mb-2" />
                  <p className="text-sm text-gray-600">HRV</p>
                  <p className="text-lg font-bold">{sleepData[0].heartRateVariability}ms</p>
                </div>
              </div>
            )}

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">Sleep Quality Assessment</h3>
              <p className="text-sm text-purple-800">
                {sleepData[0]?.efficiency > 85 ? 
                  'Excellent sleep quality. Your recovery patterns are optimal.' :
                sleepData[0]?.efficiency > 75 ? 
                  'Good sleep quality with room for improvement in efficiency.' :
                  'Sleep quality could be improved. Consider sleep hygiene practices.'}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Devices Tab */}
      {activeTab === 'devices' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Connected Devices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectedDevices.map((device, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${device.connected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                        {getDeviceIcon(device.type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{device.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{device.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {device.connected ? (
                        <div className="flex items-center space-x-1">
                          <Wifi className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-green-600">Connected</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-xs text-red-600">Disconnected</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {device.batteryLevel && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Battery Level</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                device.batteryLevel > 50 ? 'bg-green-500' :
                                device.batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${device.batteryLevel}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{device.batteryLevel}%</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Data Quality</span>
                      <span className={`text-sm font-medium ${getDataQualityColor(device.dataQuality)}`}>
                        {device.dataQuality}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Sync</span>
                      <span className="text-sm text-gray-600">
                        {device.lastSync.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DigitalBiomarkersTracker;