import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';
import { PatientProfile } from '../../types';
import Card from '../UI/Card';
import Alert from '../UI/Alert';
import Tooltip from '../UI/Tooltip';
import LoadingSpinner from '../UI/LoadingSpinner';
import MedicationManager from './MedicationManager';
import GenomicsManager from './GenomicsManager';
import TreatmentTimeline from './TreatmentTimeline';
import OutcomeTracker from './OutcomeTracker';
import DataExporter from './DataExporter';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  Activity, 
  AlertTriangle,
  Plus,
  Edit,
  Eye,
  Clock,
  FileText,
  Pill,
  TestTube,
  Dna,
  Stethoscope,
  History,
  Bell,
  Info,
  Brain,
  Shield,
  TrendingUp,
  MessageSquare,
  Smartphone,
  Target,
  ArrowRight,
  Sparkles,
  Calculator,
  Trash2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../UI/Toast';
import { calculateAgeFromDOB } from '../../utils/patientDisplay';

const PatientDashboard: React.FC = () => {
  const { state, actions } = usePatient();
  const { showToast } = useToast();
  const { currentPatient, alerts, isLoading, error } = state;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'medications' | 'labs' | 'genetics' | 'history' | 'outcomes' | 'export'>('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentPatient) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-500">No Patient Selected</p>
        <p className="text-sm text-gray-400">Select a patient to view their clinical profile</p>
      </div>
    );
  }

  const calculateAge = (dateOfBirth: string): number => (calculateAgeFromDOB(dateOfBirth) ?? 0);

  const calculateBSA = (heightCm?: number, weightKg?: number): number | null => {
    if (!heightCm || !weightKg) return null;
    // Mosteller formula: BSA = sqrt((height * weight) / 3600)
    return Math.sqrt((heightCm * weightKg) / 3600);
  };

  const getActiveAlerts = () => alerts.filter(alert => 
    alert.patientId === currentPatient.id && !alert.isAcknowledged
  );

  const getRecentLabs = () => (currentPatient.labValues || [])
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const getActiveMedications = () => (currentPatient.medications || []).filter(med => med.isActive);

  const getRecentVitals = () => {
    const vitals = currentPatient.vitals || [];
    return vitals.length > 0 
      ? vitals.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
      : null;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'labs', label: 'Lab Values', icon: TestTube },
    { id: 'genetics', label: 'Genomics', icon: Dna },
    { id: 'history', label: 'History', icon: History },
    { id: 'outcomes', label: 'Outcomes', icon: Activity },
    { id: 'export', label: 'Export', icon: FileText },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Patient actions */}
      <div className="flex items-center justify-end">
        <button
          onClick={async () => {
            if (!currentPatient) return;
            if (!confirm('Delete this patient?')) return;
            const deleted = currentPatient;
            actions.removePatient(currentPatient.id);
            showToast('success', 'Patient deleted', 5000, {
              label: 'Undo',
              onClick: async () => {
                actions.setCurrentPatient(deleted);
                try {
                  const { data: sess } = await supabase.auth.getSession();
                  const token = sess?.session?.access_token;
                  if (token) {
                    await fetch('/api/patients', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ patient: deleted })
                    });
                  }
                } catch {}
              }
            });
          }}
          className="inline-flex items-center px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
        >
          <Trash2 className="w-4 h-4 mr-1" /> Delete Patient
        </button>
      </div>
      {/* Error Display */}
      {error && (
        <Alert type="error" title="Error">
          {error}
        </Alert>
      )}

      {/* Active Alerts */}
      {getActiveAlerts().length > 0 && (
        <div className="space-y-2">
          {getActiveAlerts().map((alert, index) => (
            <Alert
              key={alert.id || `alert-${index}`}
              type={alert.severity === 'critical' ? 'error' : alert.severity === 'high' ? 'warning' : 'info'}
              title={alert.message}
            >
              <div className="flex items-center justify-between">
                <div>
                  {alert.details && <p className="text-sm mt-1">{alert.details}</p>}
                  {alert.recommendedAction && (
                    <p className="text-sm mt-2 font-medium">
                      Recommended: {alert.recommendedAction}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => actions.acknowledgeAlert(alert.id)}
                  className="ml-4 px-3 py-1 text-xs bg-white bg-opacity-20 rounded hover:bg-opacity-30"
                >
                  Acknowledge
                </button>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Patient Header */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary-600" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentPatient.demographics.firstName} {currentPatient.demographics.lastName}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{calculateAge(currentPatient.demographics.dateOfBirth)} years old</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span className="capitalize">{currentPatient.demographics.sex}</span>
                </div>
                {currentPatient.demographics.mrn && (
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>MRN: {currentPatient.demographics.mrn}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Tooltip content="Edit patient information">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Edit className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="View clinical alerts">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-4 h-4" />
                {getActiveAlerts().length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Activity className="w-4 h-4" />
              <span>Height/Weight</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {currentPatient.demographics.heightCm ? `${currentPatient.demographics.heightCm} cm` : 'N/A'} / {' '}
              {currentPatient.demographics.weightKg ? `${currentPatient.demographics.weightKg} kg` : 'N/A'}
            </div>
            {currentPatient.demographics.heightCm && currentPatient.demographics.weightKg && (
              <div className="text-xs text-gray-500">
                BSA: {calculateBSA(currentPatient.demographics.heightCm, currentPatient.demographics.weightKg)?.toFixed(2)} m²
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Pill className="w-4 h-4" />
              <span>Active Medications</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {getActiveMedications().length}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <AlertTriangle className="w-4 h-4" />
              <span>Allergies</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {(currentPatient.allergies || []).length}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Last Updated</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 mt-1">
              {new Date(currentPatient.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <Card>
                  <div className="flex items-center space-x-2 mb-4">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                  </div>
                  <div className="space-y-3">
                    {currentPatient.demographics.contact?.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{currentPatient.demographics.contact.phone}</span>
                      </div>
                    )}
                    {currentPatient.demographics.contact?.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{currentPatient.demographics.contact.email}</span>
                      </div>
                    )}
                    {currentPatient.demographics.contact?.address && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{currentPatient.demographics.contact.address}</span>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Recent Vitals */}
                <Card>
                  <div className="flex items-center space-x-2 mb-4">
                    <Stethoscope className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900">Recent Vitals</h3>
                    <Tooltip content="Most recent vital signs and performance status">
                      <Info className="w-4 h-4 text-gray-400" />
                    </Tooltip>
                  </div>
                  {getRecentVitals() ? (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {getRecentVitals().bloodPressureSystolic && (
                        <div key="blood-pressure">
                          <span className="text-gray-600">BP:</span>
                          <span className="ml-1 font-medium">
                            {getRecentVitals().bloodPressureSystolic}/{getRecentVitals().bloodPressureDiastolic}
                          </span>
                        </div>
                      )}
                      {getRecentVitals().heartRate && (
                        <div key="heart-rate">
                          <span className="text-gray-600">HR:</span>
                          <span className="ml-1 font-medium">{getRecentVitals().heartRate} bpm</span>
                        </div>
                      )}
                      {getRecentVitals().temperature && (
                        <div key="temperature">
                          <span className="text-gray-600">Temp:</span>
                          <span className="ml-1 font-medium">{getRecentVitals().temperature}°C</span>
                        </div>
                      )}
                      {getRecentVitals().performanceStatus !== undefined && (
                        <div key="performance-status">
                          <span className="text-gray-600">ECOG:</span>
                          <span className="ml-1 font-medium">{getRecentVitals().performanceStatus}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No recent vitals recorded</p>
                  )}
                </Card>
              </div>

              {/* Allergies */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Allergies</h3>
                    <Tooltip content="Known drug and environmental allergies with severity levels">
                      <Info className="w-4 h-4 text-gray-400" />
                    </Tooltip>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {(currentPatient.allergies || []).length > 0 ? (
                  <div className="space-y-2">
                    {(currentPatient.allergies || []).map((allergy, index) => (
                      <div
                        key={allergy.id || `allergy-${index}`}
                        className={`p-3 rounded-lg border-l-4 ${
                          allergy.severity === 'life-threatening' ? 'border-red-500 bg-red-50' :
                          allergy.severity === 'severe' ? 'border-orange-500 bg-orange-50' :
                          allergy.severity === 'moderate' ? 'border-yellow-500 bg-yellow-50' :
                          'border-gray-500 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900">{allergy.allergen}</span>
                            <span className="text-sm text-gray-600 ml-2">({allergy.allergenType})</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            allergy.severity === 'life-threatening' ? 'bg-red-100 text-red-800' :
                            allergy.severity === 'severe' ? 'bg-orange-100 text-orange-800' :
                            allergy.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {allergy.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{allergy.reaction}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No known allergies</p>
                )}
              </Card>

              {/* Recent Lab Values */}
              <Card>
                <div className="flex items-center space-x-2 mb-4">
                  <TestTube className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900">Recent Lab Values</h3>
                  <Tooltip content="Most recent laboratory test results with reference ranges">
                    <Info className="w-4 h-4 text-gray-400" />
                  </Tooltip>
                </div>
                {getRecentLabs().length > 0 ? (
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Test</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {getRecentLabs().map((lab, index) => (
                          <tr key={`${lab.labType}-${lab.timestamp}-${index}`}>
                            <td className="px-3 py-2 text-sm font-medium text-gray-900">{lab.labType}</td>
                            <td className={`px-3 py-2 text-sm ${lab.isAbnormal ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                              {lab.value} {lab.unit}
                              {lab.criticalFlag && <span className="ml-1 text-red-500">⚠</span>}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-600">{lab.referenceRange}</td>
                            <td className="px-3 py-2 text-sm text-gray-600">
                              {new Date(lab.timestamp).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No recent lab values</p>
                )}
              </Card>

              {/* AI & Advanced Features Quick Access */}
              <Card>
                <div className="flex items-center space-x-2 mb-6">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900">AI & Advanced Features</h3>
                  <Tooltip content="Access powerful AI and analytics tools for this patient">
                    <Info className="w-4 h-4 text-gray-400" />
                  </Tooltip>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* AI Decision Engine */}
                  <div className="group bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                       onClick={() => setTimeout(() => navigate('/ai-decision-engine'), 100)}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Brain className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">AI Decision Engine</h4>
                        <p className="text-xs text-gray-600">Clinical decision support</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">Get AI-powered clinical recommendations and drug interaction analysis</p>
                    <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                      <span>Launch AI Analysis</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Safety Alert System */}
                  <div className="group bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                       onClick={() => setTimeout(() => navigate('/safety-alerts'), 100)}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Safety Alerts</h4>
                        <p className="text-xs text-gray-600">Real-time monitoring</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">Monitor drug safety alerts and potential adverse events</p>
                    <div className="flex items-center text-green-600 text-sm font-medium group-hover:text-green-700">
                      <span>View Safety Dashboard</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* ML Analytics */}
                  <div className="group bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                       onClick={() => setTimeout(() => navigate('/ml-analytics'), 100)}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">ML Analytics</h4>
                        <p className="text-xs text-gray-600">Advanced insights</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">Access machine learning analytics and predictive models</p>
                    <div className="flex items-center text-orange-600 text-sm font-medium group-hover:text-orange-700">
                      <span>Open Analytics</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Predictive Outcomes */}
                  <div className="group bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                       onClick={() => setTimeout(() => navigate('/predictive-outcomes'), 100)}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Predictive Outcomes</h4>
                        <p className="text-xs text-gray-600">Treatment predictions</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">Generate AI-powered treatment outcome predictions</p>
                    <div className="flex items-center text-purple-600 text-sm font-medium group-hover:text-purple-700">
                      <span>Generate Predictions</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Clinical Communication */}
                  <div className="group bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                       onClick={() => setTimeout(() => navigate('/clinical-communication'), 100)}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Team Communication</h4>
                        <p className="text-xs text-gray-600">HIPAA-compliant messaging</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">Secure team communication and collaboration</p>
                    <div className="flex items-center text-teal-600 text-sm font-medium group-hover:text-teal-700">
                      <span>Open Messenger</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* IoT Monitoring */}
                  <div className="group bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                       onClick={() => setTimeout(() => navigate('/iot-monitoring'), 100)}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">IoT Monitoring</h4>
                        <p className="text-xs text-gray-600">Connected devices</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">Monitor connected health devices and sensors</p>
                    <div className="flex items-center text-indigo-600 text-sm font-medium group-hover:text-indigo-700">
                      <span>View Devices</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  
                  {/* Opioid Risk Report */}
                  <div className="group bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                       onClick={() => setTimeout(() => navigate('/opioid-risk-report'), 100)}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Calculator className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Opioid Risk Report</h4>
                        <p className="text-xs text-gray-600">Addiction risk assessment</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">Comprehensive addiction risk and pharmacogenomic analysis</p>
                    <div className="flex items-center text-red-600 text-sm font-medium group-hover:text-red-700">
                      <span>View Risk Assessment</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Medications Tab */}
          {activeTab === 'medications' && (
            <MedicationManager />
          )}

          {/* Genomics Tab */}
          {activeTab === 'genetics' && (
            <GenomicsManager />
          )}

          {/* Treatment History Tab */}
          {activeTab === 'history' && (
            <TreatmentTimeline />
          )}

          {/* Outcomes Tab */}
          {activeTab === 'outcomes' && (
            <OutcomeTracker />
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <DataExporter />
          )}

          {/* Other tabs content will be implemented in subsequent components */}
          {activeTab === 'labs' && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <TestTube className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-lg font-medium text-gray-500">Lab Management</p>
              <p className="text-sm text-gray-400">Coming soon in Phase 2</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
