import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  Calendar, 
  Activity,
  User,
  FileText,
  Dna,
  AlertTriangle,
  Target,
  BarChart3,
  Clock,
  Heart,
  Beaker,
  X
} from 'lucide-react';
import Card from '../components/UI/Card';
import { Patient } from '../types/clinical';
import { patientService } from '../services/patientService';

const EnhancedPatients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'details' | 'timeline' | 'create'>('list');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const initializeData = async () => {
      await loadPatients();
      await loadStats();
    };
    initializeData();
  }, []);

  const loadPatients = async () => {
    const allPatients = await patientService.getPatients();
    setPatients(allPatients);
  };

  const loadStats = async () => {
    const patientStats = await patientService.getPatientStats();
    setStats(patientStats);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = await patientService.searchPatients(query);
      setPatients(results);
    } else {
      await loadPatients();
    }
  };

  const handleCreatePatient = () => {
    setViewMode('create');
    setSelectedPatient(null);
  };

  const handleSavePatient = async (patientData: any) => {
    try {
      await patientService.savePatient(patientData);
      await loadPatients();
      await loadStats();
      setViewMode('list');
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Failed to save patient. Please try again.');
    }
  };

  const handleCancelCreate = () => {
    setViewMode('list');
    setSelectedPatient(null);
  };

  const getPatientAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getPatientStatus = (patient: Patient): { status: string; color: string } => {
    const hasActiveTreatment = patient.treatmentHistory?.some(course => !course.endDate);
    
    if (hasActiveTreatment) {
      return { status: 'On Treatment', color: 'bg-green-100 text-green-800' };
    }
    
    const hasRecentTreatment = patient.treatmentHistory?.some(course => {
      const endDate = new Date(course.endDate || '');
      const monthsAgo = (Date.now() - endDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsAgo < 3;
    });
    
    if (hasRecentTreatment) {
      return { status: 'Follow-up', color: 'bg-blue-100 text-blue-800' };
    }
    
    return { status: 'Inactive', color: 'bg-gray-100 text-gray-800' };
  };

  const PatientCard: React.FC<{ patient: Patient }> = ({ patient }) => {
    const age = getPatientAge(patient.dateOfBirth);
    const status = getPatientStatus(patient);
    const latestLab = patient.labValues?.[0];
    
    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => {
          setSelectedPatient(patient);
          setViewMode('details');
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>MRN: {patient.mrn} • Age: {age} • {patient.gender}</div>
                <div className="font-medium">{patient.diagnosis}</div>
                {patient.stage && <div>Stage: {patient.stage}</div>}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
              {status.status}
            </span>
            {patient.ecogPerformanceStatus !== undefined && (
              <span className="text-xs text-gray-500">
                ECOG: {patient.ecogPerformanceStatus}
              </span>
            )}
          </div>
        </div>
        
        {latestLab && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div>
                <div className="text-gray-500">Hgb</div>
                <div className="font-medium">{latestLab.hemoglobin}</div>
              </div>
              <div>
                <div className="text-gray-500">ANC</div>
                <div className="font-medium">{latestLab.anc}</div>
              </div>
              <div>
                <div className="text-gray-500">Plt</div>
                <div className="font-medium">{latestLab.platelets}</div>
              </div>
              <div>
                <div className="text-gray-500">Date</div>
                <div className="font-medium">{new Date(latestLab.date).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  };

  const PatientDetails: React.FC<{ patient: Patient }> = ({ patient }) => {
    const age = getPatientAge(patient.dateOfBirth);
    const [timeline, setTimeline] = useState<any[]>([]);
    
    useEffect(() => {
      const loadTimeline = async () => {
        const timelineData = await patientService.getTreatmentTimeline(patient.id);
        setTimeline(timelineData);
      };
      loadTimeline();
    }, [patient.id]);
    
    return (
      <div className="space-y-6">
        {/* Patient Header */}
        <Card>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {patient.firstName} {patient.lastName}
                </h2>
                <div className="text-gray-600 space-y-1">
                  <div>MRN: {patient.mrn} • Age: {age} • {patient.gender}</div>
                  <div className="text-lg font-medium">{patient.diagnosis}</div>
                  {patient.stage && <div>Stage: {patient.stage}</div>}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => setViewMode('timeline')}
                className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                <Clock className="w-4 h-4 inline mr-1" />
                Timeline
              </button>
              <button className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                Edit
              </button>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Clinical Status */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Clinical Status
              </h3>
              
              <div className="space-y-4">
                {patient.ecogPerformanceStatus !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ECOG Performance Status</span>
                    <span className="font-medium">{patient.ecogPerformanceStatus}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Height</span>
                  <span className="font-medium">{patient.height} cm</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight</span>
                  <span className="font-medium">{patient.weight} kg</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Creatinine</span>
                  <span className="font-medium">{patient.renalFunction?.creatinine || 'N/A'} mg/dL</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Bilirubin</span>
                  <span className="font-medium">{patient.hepaticFunction?.bilirubin || 'N/A'} mg/dL</span>
                </div>
              </div>
            </Card>

            {/* Current Medications */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Current Medications
              </h3>
              
              <div className="space-y-3">
                {patient.currentMedications?.map((med, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{med.name}</div>
                    <div className="text-sm text-gray-600">{med.dose} • {med.frequency}</div>
                    <div className="text-xs text-gray-500">Started: {new Date(med.startDate).toLocaleDateString()}</div>
                  </div>
                ))}
                
                {(!patient.currentMedications || patient.currentMedications.length === 0) && (
                  <div className="text-gray-500 text-center py-4">No current medications</div>
                )}
              </div>
            </Card>

            {/* Biomarkers */}
            {patient.biomarkers && patient.biomarkers.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Dna className="w-5 h-5 mr-2" />
                  Biomarkers
                </h3>
                
                <div className="space-y-3">
                  {patient.biomarkers?.map((biomarker, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600">{biomarker.name}</span>
                      <div className="text-right">
                        <div className="font-medium">{biomarker.value}</div>
                        <div className="text-xs text-gray-500">{new Date(biomarker.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Treatment History & Labs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Treatment History */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Treatment History
              </h3>
              
              <div className="space-y-4">
                {patient.treatmentHistory?.map((course, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{course.regimenName}</h4>
                      {course.response && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          course.response === 'CR' || course.response === 'PR' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.response}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        Started: {new Date(course.startDate).toLocaleDateString()}
                        {course.endDate && ` • Ended: ${new Date(course.endDate).toLocaleDateString()}`}
                      </div>
                      <div>Cycles: {course.cycles}</div>
                      
                      {course.toxicities?.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-medium text-gray-700 mb-1">Toxicities:</div>
                          {course.toxicities?.map((tox, toxIndex) => (
                            <div key={toxIndex} className="text-xs">
                              • {tox.name} (Grade {tox.grade}) - {tox.attribution}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!patient.treatmentHistory || patient.treatmentHistory.length === 0) && (
                  <div className="text-gray-500 text-center py-8">No treatment history</div>
                )}
              </div>
            </Card>

            {/* Lab Values Trend */}
            {patient.labValues && patient.labValues.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Beaker className="w-5 h-5 mr-2" />
                  Recent Lab Values
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Date</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Hgb</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">ANC</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Platelets</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">WBC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patient.labValues?.slice(0, 5).map((lab, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 text-sm">{new Date(lab.date).toLocaleDateString()}</td>
                          <td className={`py-2 text-sm ${lab.hemoglobin < 10 ? 'text-red-600 font-medium' : ''}`}>
                            {lab.hemoglobin}
                          </td>
                          <td className={`py-2 text-sm ${lab.anc < 1.5 ? 'text-red-600 font-medium' : ''}`}>
                            {lab.anc}
                          </td>
                          <td className={`py-2 text-sm ${lab.platelets < 100 ? 'text-red-600 font-medium' : ''}`}>
                            {lab.platelets}
                          </td>
                          <td className="py-2 text-sm">{lab.wbc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  };

  const PatientTimeline: React.FC<{ patient: Patient }> = ({ patient }) => {
    const timeline = patientService.getTreatmentTimeline(patient.id);
    
    const getSeverityIcon = (severity?: string) => {
      switch (severity) {
        case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
        case 'medium': return <Activity className="w-4 h-4 text-yellow-500" />;
        default: return <Target className="w-4 h-4 text-blue-500" />;
      }
    };

    const getSeverityColor = (severity?: string) => {
      switch (severity) {
        case 'high': return 'border-red-200 bg-red-50';
        case 'medium': return 'border-yellow-200 bg-yellow-50';
        default: return 'border-blue-200 bg-blue-50';
      }
    };

    return (
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Treatment Timeline - {patient.firstName} {patient.lastName}
            </h2>
            <button 
              onClick={() => setViewMode('details')}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Back to Details
            </button>
          </div>
          
          <div className="space-y-4">
            {timeline.map((event, index) => (
              <div key={index} className={`p-4 border rounded-lg ${getSeverityColor(event.severity)}`}>
                <div className="flex items-start space-x-3">
                  {getSeverityIcon(event.severity)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <span className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                      event.type === 'treatment' ? 'bg-blue-100 text-blue-800' :
                      event.type === 'toxicity' ? 'bg-red-100 text-red-800' :
                      event.type === 'response' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {timeline.length === 0 && (
              <div className="text-gray-500 text-center py-8">No timeline events</div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  if (viewMode === 'details' && selectedPatient) {
    return <PatientDetails patient={selectedPatient} />;
  }

  if (viewMode === 'timeline' && selectedPatient) {
    return <PatientTimeline patient={selectedPatient} />;
  }

  if (viewMode === 'create') {
    const CreatePatientForm: React.FC = () => {
      const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        mrn: '',
        dateOfBirth: '',
        gender: 'male',
        height: '',
        weight: '',
        diagnosis: ''
      });

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const patientData = {
          id: `patient_${Date.now()}`,
          ...formData,
          height: parseFloat(formData.height) || 170,
          weight: parseFloat(formData.weight) || 70,
          renalFunction: { creatinine: 1.0 },
          hepaticFunction: { bilirubin: 0.8, alt: 25, ast: 25, albumin: 4.0 },
          labValues: [],
          allergies: [],
          contraindications: [],
          currentMedications: [],
          treatmentHistory: [],
          biomarkers: []
        };
        handleSavePatient(patientData);
      };

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create New Patient</h2>
            <button 
              onClick={handleCancelCreate}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MRN*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mrn}
                    onChange={(e) => setFormData({...formData, mrn: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth*
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis
                  </label>
                  <input
                    type="text"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Primary diagnosis"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelCreate}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Patient
                </button>
              </div>
            </form>
          </Card>
        </div>
      );
    };

    return <CreatePatientForm />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
            <p className="text-gray-600">Comprehensive patient care and treatment tracking</p>
          </div>
        </div>
        
        <button 
          onClick={handleCreatePatient}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Patient</span>
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card padding="sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalPatients}</div>
              <div className="text-sm text-gray-600">Total Patients</div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activePatients}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.patientsOnTreatment}</div>
              <div className="text-sm text-gray-600">On Treatment</div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.completedTreatments}</div>
              <div className="text-sm text-gray-600">Completed Tx</div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.averageAge}</div>
              <div className="text-sm text-gray-600">Avg Age</div>
            </div>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients by name, MRN, or diagnosis..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </Card>

      {/* Patient List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>

      {patients.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first patient'}
            </p>
            <button 
              onClick={handleCreatePatient}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Patient</span>
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EnhancedPatients;
