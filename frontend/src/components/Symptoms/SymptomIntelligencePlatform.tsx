import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Camera, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Brain, 
  Activity,
  Thermometer,
  Heart,
  Moon,
  Zap,
  Pill,
  Clock,
  MapPin,
  CloudRain,
  Sun,
  Wind,
  Users,
  Bell,
  Target,
  FileText,
  Download,
  Share2
} from 'lucide-react';
import Card from '../UI/Card';

interface SymptomEntry {
  id: string;
  timestamp: Date;
  symptoms: {
    name: string;
    severity: number;
    bodyLocation?: string;
    description?: string;
  }[];
  triggers?: string[];
  medications?: string[];
  activities?: string[];
  mood: number;
  energyLevel: number;
  sleepQuality: number;
  painLevel: number;
  photos?: string[];
  voiceNote?: string;
  location?: string;
  weather?: {
    temperature: number;
    humidity: number;
    condition: string;
  };
}

interface SymptomPattern {
  symptom: string;
  frequency: number;
  averageSeverity: number;
  peakTimes: string[];
  commonTriggers: string[];
  trend: 'improving' | 'worsening' | 'stable';
  correlation?: {
    medication: string;
    correlation: number;
  };
}

interface PredictiveAlert {
  id: string;
  type: 'symptom_spike' | 'hospitalization_risk' | 'medication_adjustment' | 'appointment_needed';
  severity: 'low' | 'medium' | 'high';
  message: string;
  confidence: number;
  actionRequired: string;
  timeframe: string;
}

interface BiometricData {
  heartRate?: number;
  bloodPressure?: string;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  bloodGlucose?: number;
  timestamp: Date;
}

const SymptomIntelligencePlatform: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'logger' | 'patterns' | 'predictions' | 'insights'>('logger');
  const [isRecording, setIsRecording] = useState(false);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [currentSeverity, setCurrentSeverity] = useState(5);
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [patterns, setPatterns] = useState<SymptomPattern[]>([]);
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [biometrics, setBiometrics] = useState<BiometricData[]>([]);
  const [isPhotoMode, setIsPhotoMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Common symptoms for quick selection
  const commonSymptoms = [
    'Fatigue', 'Nausea', 'Pain', 'Headache', 'Dizziness', 'Loss of appetite',
    'Constipation', 'Diarrhea', 'Shortness of breath', 'Anxiety', 'Depression',
    'Difficulty sleeping', 'Mouth sores', 'Skin changes', 'Fever', 'Chills'
  ];

  useEffect(() => {
    // Mock data initialization
    setSymptoms([
      {
        id: '1',
        timestamp: new Date(),
        symptoms: [
          { name: 'Fatigue', severity: 7, description: 'Overwhelming tiredness' },
          { name: 'Nausea', severity: 4 }
        ],
        triggers: ['After chemotherapy'],
        mood: 5,
        energyLevel: 3,
        sleepQuality: 6,
        painLevel: 3,
        location: 'Home',
        weather: { temperature: 22, humidity: 65, condition: 'Cloudy' }
      }
    ]);

    setPatterns([
      {
        symptom: 'Fatigue',
        frequency: 85,
        averageSeverity: 6.8,
        peakTimes: ['2-4 PM', 'Evening'],
        commonTriggers: ['Chemotherapy', 'Poor sleep', 'Stress'],
        trend: 'stable',
        correlation: { medication: 'Doxorubicin', correlation: 0.78 }
      },
      {
        symptom: 'Nausea',
        frequency: 60,
        averageSeverity: 5.2,
        peakTimes: ['Morning', '30min post-medication'],
        commonTriggers: ['Medication', 'Strong smells', 'Empty stomach'],
        trend: 'improving',
        correlation: { medication: 'Ondansetron', correlation: -0.65 }
      }
    ]);

    setAlerts([
      {
        id: '1',
        type: 'symptom_spike',
        severity: 'medium',
        message: 'Fatigue levels have increased 40% over the past 3 days',
        confidence: 82,
        actionRequired: 'Monitor energy levels and consider discussing with care team',
        timeframe: 'Next 2-3 days'
      },
      {
        id: '2',
        type: 'hospitalization_risk',
        severity: 'low',
        message: 'Symptom pattern suggests 15% increased risk of hospitalization',
        confidence: 67,
        actionRequired: 'Maintain current monitoring, consider preventive measures',
        timeframe: 'Next 7 days'
      }
    ]);

    setBiometrics([
      {
        heartRate: 78,
        bloodPressure: '125/80',
        temperature: 36.8,
        oxygenSaturation: 98,
        weight: 72.5,
        timestamp: new Date()
      }
    ]);
  }, []);

  const handleVoiceRecording = () => {
    setIsRecording(!isRecording);
    // In real implementation, this would start/stop voice recording
    console.log('Voice recording:', isRecording ? 'stopped' : 'started');
    
    if (!isRecording) {
      // Mock voice-to-text conversion
      setTimeout(() => {
        setCurrentSymptom('I am feeling very tired and slightly nauseous');
        setIsRecording(false);
      }, 2000);
    }
  };

  const handlePhotoCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In real implementation, this would process the image
      console.log('Photo selected:', file.name);
      // Mock processing for skin changes, surgical sites, etc.
    }
  };

  const addSymptomEntry = () => {
    const newEntry: SymptomEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      symptoms: [{ name: currentSymptom || 'General discomfort', severity: currentSeverity }],
      mood: 5,
      energyLevel: currentSeverity <= 3 ? 8 : currentSeverity >= 7 ? 3 : 5,
      sleepQuality: 6,
      painLevel: currentSeverity,
      location: 'Home'
    };

    setSymptoms(prev => [newEntry, ...prev]);
    setCurrentSymptom('');
    setCurrentSeverity(5);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'worsening': return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default: return <Activity className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'symptom_spike': return <TrendingUp className="w-5 h-5" />;
      case 'hospitalization_risk': return <AlertTriangle className="w-5 h-5" />;
      case 'medication_adjustment': return <Pill className="w-5 h-5" />;
      case 'appointment_needed': return <Calendar className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'text-green-600 bg-green-50';
    if (severity <= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-purple-600" />
            Symptom Intelligence Platform
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered symptom tracking with predictive insights
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <Share2 className="w-4 h-4" />
            <span>Share with Care Team</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'logger', label: 'Symptom Logger', icon: FileText },
            { id: 'patterns', label: 'Pattern Analysis', icon: TrendingUp },
            { id: 'predictions', label: 'Predictive Alerts', icon: Target },
            { id: 'insights', label: 'AI Insights', icon: Brain }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Symptom Logger Tab */}
      {activeTab === 'logger' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Symptom Entry */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Log Symptoms</h2>
            
            {/* Voice Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice Input
              </label>
              <div className="flex space-x-3">
                <button
                  onClick={handleVoiceRecording}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    isRecording 
                      ? 'bg-red-100 text-red-700 border border-red-300' 
                      : 'bg-blue-100 text-blue-700 border border-blue-300'
                  } hover:bg-opacity-80 transition-colors`}
                >
                  <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
                  <span>{isRecording ? 'Recording...' : 'Start Recording'}</span>
                </button>
                <button
                  onClick={handlePhotoCapture}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200"
                >
                  <Camera className="w-4 h-4" />
                  <span>Add Photo</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            {/* Manual Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your symptoms
              </label>
              <textarea
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                placeholder="How are you feeling? Describe any symptoms..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows={3}
              />
            </div>

            {/* Quick Symptom Buttons */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Select
              </label>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => setCurrentSymptom(symptom)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50"
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity Slider */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity: {currentSeverity}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={currentSeverity}
                onChange={(e) => setCurrentSeverity(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>

            <button
              onClick={addSymptomEntry}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Log Symptom
            </button>
          </Card>

          {/* Recent Entries */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Entries</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {symptoms.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {entry.timestamp.toLocaleString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{entry.location}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {entry.symptoms.map((symptom, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-gray-800">{symptom.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(symptom.severity)}`}>
                          {symptom.severity}/10
                        </span>
                      </div>
                    ))}
                  </div>
                  {entry.triggers && (
                    <div className="mt-2 text-xs text-gray-600">
                      <span className="font-medium">Triggers:</span> {entry.triggers.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Pattern Analysis Tab */}
      {activeTab === 'patterns' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Symptom Patterns</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {patterns.map((pattern, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{pattern.symptom}</h3>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(pattern.trend)}
                      <span className="text-sm text-gray-600">{pattern.trend}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Frequency</p>
                      <p className="text-lg font-semibold text-gray-900">{pattern.frequency}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Avg Severity</p>
                      <p className="text-lg font-semibold text-gray-900">{pattern.averageSeverity}/10</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Peak Times</p>
                    <p className="text-sm text-gray-600">{pattern.peakTimes.join(', ')}</p>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Common Triggers</p>
                    <p className="text-sm text-gray-600">{pattern.commonTriggers.join(', ')}</p>
                  </div>

                  {pattern.correlation && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs font-medium text-blue-900">Medication Correlation</p>
                      <p className="text-sm text-blue-800">
                        {pattern.correlation.medication}: {(pattern.correlation.correlation * 100).toFixed(0)}% correlation
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Predictive Alerts Tab */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Predictive Health Alerts</h2>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className={`border rounded-lg p-4 ${
                  alert.severity === 'high' ? 'border-red-200 bg-red-50' :
                  alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-600' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{alert.message}</h3>
                      <p className="text-sm text-gray-700 mb-2">{alert.actionRequired}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Confidence: {alert.confidence}%</span>
                        <span>Timeframe: {alert.timeframe}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Digital Biomarkers
            </h2>
            {biometrics.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Heart className="w-8 h-8 mx-auto text-red-600 mb-2" />
                  <p className="text-sm text-gray-600">Heart Rate</p>
                  <p className="text-lg font-bold">{biometrics[0].heartRate} bpm</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Thermometer className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                  <p className="text-sm text-gray-600">Temperature</p>
                  <p className="text-lg font-bold">{biometrics[0].temperature}°C</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Activity className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-sm text-gray-600">Blood Pressure</p>
                  <p className="text-lg font-bold">{biometrics[0].bloodPressure}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Zap className="w-8 h-8 mx-auto text-green-600 mb-2" />
                  <p className="text-sm text-gray-600">O2 Saturation</p>
                  <p className="text-lg font-bold">{biometrics[0].oxygenSaturation}%</p>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Environmental Correlations
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <CloudRain className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Weather Impact</p>
                  <p className="text-xs text-gray-600">Symptoms tend to worsen on rainy days (65% correlation)</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Moon className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Sleep Quality</p>
                  <p className="text-xs text-gray-600">Better sleep correlates with 40% reduction in fatigue</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Social Activity</p>
                  <p className="text-xs text-gray-600">Social interactions improve mood scores by 25%</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SymptomIntelligencePlatform;