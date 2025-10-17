import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Scan, 
  Bell, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Pill, 
  Calendar, 
  TrendingUp, 
  Brain, 
  Zap, 
  Shield, 
  Target, 
  Activity, 
  Heart, 
  Smartphone, 
  Watch, 
  Settings, 
  Info, 
  Star,
  BarChart3,
  Timer,
  Droplets,
  Thermometer,
  Sunrise,
  Sunset,
  Moon,
  Sun,
  MapPin,
  Volume2,
  Vibrate
} from 'lucide-react';
import Card from '../UI/Card';

interface Medication {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  route: 'oral' | 'injection' | 'topical' | 'inhalation';
  startDate: Date;
  endDate?: Date;
  prescribedBy: string;
  purpose: string;
  interactions: DrugInteraction[];
  sideEffects: string[];
  foodRestrictions: string[];
  timingInstructions: string;
  pillIdentification: {
    shape: string;
    color: string;
    markings: string;
    size: string;
  };
}

interface DrugInteraction {
  drugName: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  recommendation: string;
  evidenceLevel: 'high' | 'medium' | 'low';
}

interface SmartReminder {
  id: string;
  medicationId: string;
  scheduledTime: Date;
  actualTime?: Date;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  adaptiveDelay?: number;
  personalizedMessage: string;
  contextualFactors: {
    mealTiming: boolean;
    sideEffectWindow: boolean;
    sleepPattern: boolean;
    activityLevel: boolean;
  };
}

interface DoseAdjustment {
  medicationId: string;
  currentDose: string;
  recommendedDose: string;
  reason: string;
  geneticFactor?: string;
  responsePattern?: string;
  confidence: number;
  approvalRequired: boolean;
}

interface MedicationResponse {
  medicationId: string;
  efficacyScore: number;
  sideEffectSeverity: number;
  adherenceRate: number;
  qualityOfLifeImpact: number;
  biomarkerChanges: { [key: string]: number };
  patientReportedOutcomes: { [key: string]: number };
}

interface PillRecognition {
  confidence: number;
  identifiedMedication: Medication | null;
  alternativeMatches: Medication[];
  safetyWarnings: string[];
}

const MedicationIntelligenceEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reminders' | 'scanner' | 'interactions' | 'optimization'>('reminders');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [reminders, setReminders] = useState<SmartReminder[]>([]);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [doseAdjustments, setDoseAdjustments] = useState<DoseAdjustment[]>([]);
  const [responses, setResponses] = useState<MedicationResponse[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<PillRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [adherenceStats, setAdherenceStats] = useState({
    overall: 87,
    thisWeek: 92,
    onTime: 78,
    missed: 8
  });

  useEffect(() => {
    // Mock data initialization
    setMedications([
      {
        id: '1',
        name: 'Olaparib',
        genericName: 'olaparib',
        dosage: '150mg',
        frequency: 'Twice daily',
        route: 'oral',
        startDate: new Date('2024-03-01'),
        prescribedBy: 'Dr. Johnson',
        purpose: 'PARP inhibitor maintenance therapy',
        interactions: [
          {
            drugName: 'Warfarin',
            severity: 'severe',
            description: 'Increased bleeding risk',
            recommendation: 'Monitor INR closely, consider dose adjustment',
            evidenceLevel: 'high'
          }
        ],
        sideEffects: ['Fatigue', 'Nausea', 'Anemia'],
        foodRestrictions: ['Take with or without food'],
        timingInstructions: 'Take 12 hours apart, same times each day',
        pillIdentification: {
          shape: 'Capsule',
          color: 'Purple and white',
          markings: 'OLAPARIB 150',
          size: '8mm'
        }
      },
      {
        id: '2',
        name: 'Ondansetron',
        genericName: 'ondansetron',
        dosage: '8mg',
        frequency: 'As needed',
        route: 'oral',
        startDate: new Date('2024-03-01'),
        prescribedBy: 'Dr. Johnson',
        purpose: 'Nausea control',
        interactions: [],
        sideEffects: ['Headache', 'Constipation'],
        foodRestrictions: ['Can take with or without food'],
        timingInstructions: 'Take 30 minutes before chemotherapy or as needed for nausea',
        pillIdentification: {
          shape: 'Round',
          color: 'White',
          markings: 'ONB 8',
          size: '6mm'
        }
      }
    ]);

    setReminders([
      {
        id: '1',
        medicationId: '1',
        scheduledTime: new Date(Date.now() + 1800000), // 30 minutes from now
        status: 'pending',
        personalizedMessage: 'Time for your morning Olaparib. Remember to take with water.',
        contextualFactors: {
          mealTiming: true,
          sideEffectWindow: false,
          sleepPattern: true,
          activityLevel: false
        }
      },
      {
        id: '2',
        medicationId: '1',
        scheduledTime: new Date(Date.now() - 43200000), // 12 hours ago
        actualTime: new Date(Date.now() - 43080000), // taken 2 minutes late
        status: 'taken',
        adaptiveDelay: 2,
        personalizedMessage: 'Evening Olaparib dose',
        contextualFactors: {
          mealTiming: false,
          sideEffectWindow: true,
          sleepPattern: false,
          activityLevel: false
        }
      }
    ]);

    setDoseAdjustments([
      {
        medicationId: '1',
        currentDose: '150mg twice daily',
        recommendedDose: '100mg twice daily',
        reason: 'Grade 2 fatigue and anemia',
        responsePattern: 'Decreased energy levels for 3 consecutive days',
        confidence: 78,
        approvalRequired: true
      }
    ]);

    setResponses([
      {
        medicationId: '1',
        efficacyScore: 85,
        sideEffectSeverity: 6,
        adherenceRate: 94,
        qualityOfLifeImpact: 72,
        biomarkerChanges: {
          'Hemoglobin': -1.2,
          'Platelet count': -15,
          'CA 15-3': -45
        },
        patientReportedOutcomes: {
          'Fatigue': 6,
          'Nausea': 3,
          'Overall wellbeing': 7
        }
      }
    ]);
  }, []);

  const handlePillScan = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsScanning(true);
      // Mock pill recognition API call
      setTimeout(() => {
        setScanResult({
          confidence: 92,
          identifiedMedication: medications[0],
          alternativeMatches: [medications[1]],
          safetyWarnings: []
        });
        setIsScanning(false);
      }, 2000);
    }
  };

  const markMedicationTaken = (reminderId: string) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === reminderId 
        ? { ...reminder, status: 'taken', actualTime: new Date() }
        : reminder
    ));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'text-red-600 bg-red-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'mild': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRouteIcon = (route: string) => {
    switch (route) {
      case 'oral': return <Pill className="w-4 h-4" />;
      case 'injection': return <Zap className="w-4 h-4" />;
      case 'topical': return <Droplets className="w-4 h-4" />;
      case 'inhalation': return <Activity className="w-4 h-4" />;
      default: return <Pill className="w-4 h-4" />;
    }
  };

  const getTimeIcon = (time: Date) => {
    const hour = time.getHours();
    if (hour >= 6 && hour < 12) return <Sunrise className="w-4 h-4 text-yellow-500" />;
    if (hour >= 12 && hour < 18) return <Sun className="w-4 h-4 text-orange-500" />;
    if (hour >= 18 && hour < 21) return <Sunset className="w-4 h-4 text-red-500" />;
    return <Moon className="w-4 h-4 text-blue-500" />;
  };

  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-blue-600" />
            Medication Intelligence Engine
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered medication management with smart reminders and optimization
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{adherenceStats.overall}%</p>
            <p className="text-xs text-gray-500">Overall Adherence</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{adherenceStats.thisWeek}%</p>
            <p className="text-xs text-gray-500">This Week</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'reminders', label: 'Smart Reminders', icon: Bell },
            { id: 'scanner', label: 'Pill Scanner', icon: Camera },
            { id: 'interactions', label: 'Interaction Checker', icon: AlertTriangle },
            { id: 'optimization', label: 'Dose Optimization', icon: Target }
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

      {/* Smart Reminders Tab */}
      {activeTab === 'reminders' && (
        <div className="space-y-6">
          {/* Adherence Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">On Time</p>
                  <p className="text-2xl font-bold text-green-600">{adherenceStats.onTime}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Missed Doses</p>
                  <p className="text-2xl font-bold text-red-600">{adherenceStats.missed}%</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-blue-600">{adherenceStats.thisWeek}%</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Trend</p>
                  <p className="text-2xl font-bold text-green-600">+5%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </Card>
          </div>

          {/* Current Medications */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Medications</h2>
            <div className="space-y-4">
              {medications.map((medication) => (
                <div key={medication.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{medication.name}</h3>
                      <p className="text-sm text-gray-600">{medication.genericName}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getRouteIcon(medication.route)}
                      <span className="text-sm text-gray-600">{medication.dosage}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Frequency: </span>
                      <span className="text-gray-600">{medication.frequency}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Purpose: </span>
                      <span className="text-gray-600">{medication.purpose}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Prescribed by: </span>
                      <span className="text-gray-600">{medication.prescribedBy}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="font-medium text-gray-700 text-sm">Timing: </span>
                    <span className="text-sm text-gray-600">{medication.timingInstructions}</span>
                  </div>

                  {medication.foodRestrictions.length > 0 && (
                    <div className="mt-2 bg-blue-50 p-2 rounded">
                      <span className="font-medium text-blue-900 text-sm">Food Instructions: </span>
                      <span className="text-sm text-blue-800">{medication.foodRestrictions.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Reminders */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Reminders</h2>
            <div className="space-y-3">
              {reminders.filter(r => r.status === 'pending').map((reminder) => {
                const medication = medications.find(m => m.id === reminder.medicationId);
                return (
                  <div key={reminder.id} className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {getTimeIcon(reminder.scheduledTime)}
                        <div>
                          <h3 className="font-medium text-gray-900">{medication?.name}</h3>
                          <p className="text-sm text-gray-600">
                            {reminder.scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => markMedicationTaken(reminder.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Mark Taken
                      </button>
                    </div>
                    <p className="text-sm text-blue-800">{reminder.personalizedMessage}</p>
                    
                    {/* Contextual factors */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {reminder.contextualFactors.mealTiming && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          Consider meal timing
                        </span>
                      )}
                      {reminder.contextualFactors.sideEffectWindow && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                          Side effect monitoring period
                        </span>
                      )}
                      {reminder.contextualFactors.sleepPattern && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                          Optimal timing for sleep
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Pill Scanner Tab */}
      {activeTab === 'scanner' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Pill Recognition</h2>
            
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Camera className="w-12 h-12 text-blue-600" />
              </div>
              
              <button
                onClick={handlePillScan}
                disabled={isScanning}
                className={`px-6 py-3 rounded-lg font-medium ${
                  isScanning 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isScanning ? (
                  <span className="flex items-center space-x-2">
                    <Scan className="w-4 h-4 animate-spin" />
                    <span>Scanning...</span>
                  </span>
                ) : (
                  'Scan Pill'
                )}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              
              <p className="text-sm text-gray-600 mt-2">
                Take a photo of your pill for instant identification and safety verification
              </p>
            </div>

            {/* Scan Results */}
            {scanResult && (
              <div className="border-t pt-6">
                <h3 className="font-medium text-gray-900 mb-4">Scan Results</h3>
                
                {scanResult.identifiedMedication && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-green-900">
                        {scanResult.identifiedMedication.name}
                      </h4>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                        {scanResult.confidence}% confidence
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-green-900">Dosage: </span>
                        <span className="text-green-800">{scanResult.identifiedMedication.dosage}</span>
                      </div>
                      <div>
                        <span className="font-medium text-green-900">Purpose: </span>
                        <span className="text-green-800">{scanResult.identifiedMedication.purpose}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 bg-green-100 p-3 rounded">
                      <h5 className="font-medium text-green-900 mb-1">Pill Characteristics</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
                        <div>Shape: {scanResult.identifiedMedication.pillIdentification.shape}</div>
                        <div>Color: {scanResult.identifiedMedication.pillIdentification.color}</div>
                        <div>Markings: {scanResult.identifiedMedication.pillIdentification.markings}</div>
                        <div>Size: {scanResult.identifiedMedication.pillIdentification.size}</div>
                      </div>
                    </div>
                  </div>
                )}

                {scanResult.alternativeMatches.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Alternative Matches</h4>
                    <div className="space-y-2">
                      {scanResult.alternativeMatches.map((match, idx) => (
                        <div key={idx} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{match.name}</span>
                            <span className="text-sm text-gray-600">{match.dosage}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {scanResult.safetyWarnings.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Safety Warnings
                    </h4>
                    <ul className="text-sm text-red-800 space-y-1">
                      {scanResult.safetyWarnings.map((warning, idx) => (
                        <li key={idx}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Interaction Checker Tab */}
      {activeTab === 'interactions' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Drug Interaction Analysis</h2>
            
            {interactions.length > 0 ? (
              <div className="space-y-4">
                {medications.map((medication) => {
                  const medInteractions = medication.interactions;
                  if (medInteractions.length === 0) return null;
                  
                  return (
                    <div key={medication.id} className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">{medication.name}</h3>
                      <div className="space-y-3">
                        {medInteractions.map((interaction, idx) => (
                          <div key={idx} className={`border rounded-lg p-3 ${
                            interaction.severity === 'severe' ? 'bg-red-50 border-red-200' :
                            interaction.severity === 'moderate' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-blue-50 border-blue-200'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{interaction.drugName}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(interaction.severity)}`}>
                                {interaction.severity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{interaction.description}</p>
                            <div className="bg-white p-2 rounded">
                              <span className="font-medium text-gray-900 text-sm">Recommendation: </span>
                              <span className="text-sm text-gray-700">{interaction.recommendation}</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                              <span>Evidence Level: {interaction.evidenceLevel}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-medium text-green-900">No Interactions Detected</p>
                <p className="text-sm text-green-700">Your current medications appear to be safe together.</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Dose Optimization Tab */}
      {activeTab === 'optimization' && (
        <div className="space-y-6">
          {/* Medication Response Tracking */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Response Tracking</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {responses.map((response, idx) => {
                const medication = medications.find(m => m.id === response.medicationId);
                return (
                  <div key={idx} className="border rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">{medication?.name}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">Efficacy</p>
                        <p className="text-xl font-bold text-green-600">{response.efficacyScore}%</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">Adherence</p>
                        <p className={`text-xl font-bold ${getAdherenceColor(response.adherenceRate)}`}>
                          {response.adherenceRate}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Side Effect Severity</span>
                        <span className={`text-sm font-medium ${
                          response.sideEffectSeverity <= 3 ? 'text-green-600' :
                          response.sideEffectSeverity <= 6 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {response.sideEffectSeverity}/10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Quality of Life Impact</span>
                        <span className={`text-sm font-medium ${
                          response.qualityOfLifeImpact >= 70 ? 'text-green-600' :
                          response.qualityOfLifeImpact >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {response.qualityOfLifeImpact}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Dose Adjustment Recommendations */}
          {doseAdjustments.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Dose Recommendations</h2>
              <div className="space-y-4">
                {doseAdjustments.map((adjustment, idx) => {
                  const medication = medications.find(m => m.id === adjustment.medicationId);
                  return (
                    <div key={idx} className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{medication?.name}</h3>
                          <p className="text-sm text-gray-600">Dose adjustment recommended</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          adjustment.confidence >= 80 ? 'bg-green-100 text-green-800' :
                          adjustment.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {adjustment.confidence}% confidence
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <span className="font-medium text-gray-700 text-sm">Current: </span>
                          <span className="text-sm text-gray-600">{adjustment.currentDose}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 text-sm">Recommended: </span>
                          <span className="text-sm text-blue-600 font-medium">{adjustment.recommendedDose}</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className="font-medium text-gray-700 text-sm">Reason: </span>
                        <span className="text-sm text-gray-600">{adjustment.reason}</span>
                      </div>

                      {adjustment.responsePattern && (
                        <div className="mb-3">
                          <span className="font-medium text-gray-700 text-sm">Pattern Detected: </span>
                          <span className="text-sm text-gray-600">{adjustment.responsePattern}</span>
                        </div>
                      )}

                      {adjustment.approvalRequired && (
                        <div className="bg-white p-3 rounded border-l-4 border-orange-400">
                          <p className="text-sm text-orange-800">
                            <strong>Provider approval required.</strong> This recommendation will be sent to your healthcare team for review.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicationIntelligenceEngine;