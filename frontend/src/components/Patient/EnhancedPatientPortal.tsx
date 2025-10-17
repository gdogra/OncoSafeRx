import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Pill, 
  Activity, 
  TrendingUp, 
  Heart, 
  Brain, 
  Dna, 
  Users, 
  Camera,
  Mic,
  Shield,
  Target,
  Zap,
  Eye,
  Moon,
  Thermometer,
  Scale,
  Clock
} from 'lucide-react';
import Card from '../UI/Card';
import { useAuth } from '../../context/AuthContext';

interface PatientVitals {
  weight: number;
  bloodPressure: string;
  temperature: number;
  heartRate: number;
  oxygenSaturation: number;
  painLevel: number;
  energyLevel: number;
  moodScore: number;
  sleepQuality: number;
  timestamp: Date;
}

interface GenomicInsight {
  id: string;
  gene: string;
  variant: string;
  drugResponse: string;
  significance: 'high' | 'medium' | 'low';
  recommendation: string;
  lastUpdated: Date;
}

interface TreatmentPhase {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  medications: string[];
  status: 'active' | 'completed' | 'upcoming';
  sideEffects: string[];
  efficacyScore: number;
}

interface SymptomEntry {
  id: string;
  symptom: string;
  severity: number;
  timestamp: Date;
  triggers?: string[];
  notes?: string;
  photo?: string;
}

const EnhancedPatientPortal: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  
  const [activeTab, setActiveTab] = useState<'overview' | 'genomics' | 'symptoms' | 'vitals' | 'network'>('overview');
  const [vitals, setVitals] = useState<PatientVitals | null>(null);
  const [genomicInsights, setGenomicInsights] = useState<GenomicInsight[]>([]);
  const [treatmentPhases, setTreatmentPhases] = useState<TreatmentPhase[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  // Mock data - in real implementation, this would come from APIs
  useEffect(() => {
    // Mock patient vitals
    setVitals({
      weight: 72.5,
      bloodPressure: '125/80',
      temperature: 36.8,
      heartRate: 78,
      oxygenSaturation: 98,
      painLevel: 3,
      energyLevel: 7,
      moodScore: 6,
      sleepQuality: 7,
      timestamp: new Date()
    });

    // Mock genomic insights
    setGenomicInsights([
      {
        id: '1',
        gene: 'CYP2D6',
        variant: '*1/*4',
        drugResponse: 'Intermediate metabolizer',
        significance: 'high',
        recommendation: 'Consider 50% dose reduction for tamoxifen',
        lastUpdated: new Date()
      },
      {
        id: '2',
        gene: 'BRCA1',
        variant: 'Wild type',
        drugResponse: 'Standard response to PARP inhibitors',
        significance: 'medium',
        recommendation: 'Standard dosing protocols apply',
        lastUpdated: new Date()
      }
    ]);

    // Mock treatment phases
    setTreatmentPhases([
      {
        id: '1',
        name: 'Neoadjuvant Chemotherapy',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-04-15'),
        medications: ['Doxorubicin', 'Cyclophosphamide', 'Paclitaxel'],
        status: 'completed',
        sideEffects: ['Fatigue', 'Nausea', 'Hair loss'],
        efficacyScore: 85
      },
      {
        id: '2',
        name: 'Targeted Therapy',
        startDate: new Date('2024-05-01'),
        medications: ['Trastuzumab', 'Pertuzumab'],
        status: 'active',
        sideEffects: ['Mild fatigue', 'Joint pain'],
        efficacyScore: 92
      }
    ]);

    // Mock symptoms
    setSymptoms([
      {
        id: '1',
        symptom: 'Fatigue',
        severity: 6,
        timestamp: new Date(),
        notes: 'Worse in the afternoon'
      },
      {
        id: '2',
        symptom: 'Nausea',
        severity: 3,
        timestamp: new Date(Date.now() - 86400000),
        triggers: ['After medication']
      }
    ]);
  }, []);

  const handleVoiceSymptomEntry = () => {
    setIsRecording(!isRecording);
    // In real implementation, this would start voice recording
    console.log('Voice recording:', isRecording ? 'stopped' : 'started');
  };

  const getDashboardCards = () => {
    if (!user) return [];

    return [
      {
        title: 'Today\'s Health Score',
        value: '7.2/10',
        change: '+0.3 from yesterday',
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      {
        title: 'Treatment Progress',
        value: '68%',
        change: 'On schedule',
        icon: Target,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        title: 'Next Appointment',
        value: 'Oct 20, 2:30 PM',
        change: 'Dr. Johnson - Oncology',
        icon: Calendar,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      },
      {
        title: 'Genetic Compatibility',
        value: '94%',
        change: 'Optimal for current regimen',
        icon: Dna,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      }
    ];
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Please log in to access your patient portal.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}
          </h1>
          <p className="text-gray-600 mt-1">
            Your personalized cancer care dashboard
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleVoiceSymptomEntry}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isRecording 
                ? 'bg-red-100 text-red-700 border border-red-300' 
                : 'bg-blue-100 text-blue-700 border border-blue-300'
            } hover:bg-opacity-80 transition-colors`}
          >
            <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
            <span>{isRecording ? 'Stop Recording' : 'Log Symptoms'}</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getDashboardCards().map((card, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.change}</p>
              </div>
              <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'genomics', label: 'Genetic Journey', icon: Dna },
            { id: 'symptoms', label: 'Symptoms & Vitals', icon: Activity },
            { id: 'vitals', label: 'Digital Biomarkers', icon: Heart },
            { id: 'network', label: 'Care Network', icon: Users }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Treatment Timeline */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Treatment Timeline
            </h2>
            <div className="space-y-4">
              {treatmentPhases.map((phase, index) => (
                <div key={phase.id} className="flex items-start space-x-4">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    phase.status === 'active' ? 'bg-blue-500' :
                    phase.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{phase.name}</h3>
                    <p className="text-sm text-gray-600">
                      {phase.startDate.toLocaleDateString()} - 
                      {phase.endDate ? phase.endDate.toLocaleDateString() : 'Ongoing'}
                    </p>
                    <div className="mt-2">
                      <div className="text-xs text-gray-500">Efficacy Score</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${phase.efficacyScore}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{phase.efficacyScore}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Symptoms */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recent Symptoms
            </h2>
            <div className="space-y-3">
              {symptoms.slice(0, 5).map((symptom) => (
                <div key={symptom.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{symptom.symptom}</p>
                    <p className="text-sm text-gray-600">
                      {symptom.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      symptom.severity > 7 ? 'bg-red-500' :
                      symptom.severity > 4 ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <span className="text-sm font-medium">{symptom.severity}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'genomics' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Dna className="w-5 h-5 mr-2" />
              Your Genetic Journey
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {genomicInsights.map((insight) => (
                <div key={insight.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{insight.gene}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      insight.significance === 'high' ? 'bg-red-100 text-red-800' :
                      insight.significance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {insight.significance} impact
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{insight.variant}</p>
                  <p className="text-sm text-gray-800 mb-3">{insight.drugResponse}</p>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">{insight.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'symptoms' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Symptom Tracker
            </h2>
            <div className="space-y-4">
              {symptoms.map((symptom) => (
                <div key={symptom.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{symptom.symptom}</h3>
                    <span className="text-lg font-bold">{symptom.severity}/10</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {symptom.timestamp.toLocaleString()}
                  </p>
                  {symptom.notes && (
                    <p className="text-sm text-gray-800">{symptom.notes}</p>
                  )}
                  {symptom.triggers && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">Triggers: </span>
                      <span className="text-xs text-gray-700">{symptom.triggers.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Current Vitals
            </h2>
            {vitals && (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Scale className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="text-lg font-bold">{vitals.weight} kg</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Heart className="w-8 h-8 mx-auto text-red-600 mb-2" />
                  <p className="text-sm text-gray-600">Heart Rate</p>
                  <p className="text-lg font-bold">{vitals.heartRate} bpm</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Thermometer className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                  <p className="text-sm text-gray-600">Temperature</p>
                  <p className="text-lg font-bold">{vitals.temperature}°C</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Zap className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
                  <p className="text-sm text-gray-600">Energy</p>
                  <p className="text-lg font-bold">{vitals.energyLevel}/10</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'vitals' && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            Digital Biomarkers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Moon className="w-12 h-12 mx-auto text-purple-600 mb-3" />
              <h3 className="font-medium text-gray-900">Sleep Quality</h3>
              <p className="text-2xl font-bold text-purple-600">{vitals?.sleepQuality}/10</p>
              <p className="text-sm text-gray-600">7.2 hrs avg</p>
            </div>
            <div className="text-center">
              <Brain className="w-12 h-12 mx-auto text-blue-600 mb-3" />
              <h3 className="font-medium text-gray-900">Mood Score</h3>
              <p className="text-2xl font-bold text-blue-600">{vitals?.moodScore}/10</p>
              <p className="text-sm text-gray-600">Stable trend</p>
            </div>
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto text-green-600 mb-3" />
              <h3 className="font-medium text-gray-900">Pain Level</h3>
              <p className="text-2xl font-bold text-green-600">{vitals?.painLevel}/10</p>
              <p className="text-sm text-gray-600">Manageable</p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'network' && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Your Care Network
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">Dr. Sarah Johnson</h3>
              <p className="text-sm text-gray-600">Oncologist</p>
              <p className="text-xs text-gray-500 mt-1">Next: Oct 20, 2:30 PM</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">Maria Rodriguez</h3>
              <p className="text-sm text-gray-600">Nurse Navigator</p>
              <p className="text-xs text-gray-500 mt-1">Available 24/7</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">Genetic Twins</h3>
              <p className="text-sm text-gray-600">3 matches found</p>
              <p className="text-xs text-gray-500 mt-1">Similar genomic profile</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EnhancedPatientPortal;