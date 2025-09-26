import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../UI/Toast';
import { usePatient } from '../../context/PatientContext';
import { PatientProfile, PatientDemographics } from '../../types';
import Card from '../UI/Card';
import Tooltip from '../UI/Tooltip';
import ComprehensivePatientForm from './ComprehensivePatientForm';
import { 
  Search, 
  User, 
  Plus, 
  Calendar, 
  FileText, 
  Clock,
  Star,
  Info,
  Trash2,
  RefreshCw
} from 'lucide-react';

const PatientSelector: React.FC = () => {
  const { state, actions } = usePatient();
  const { showToast } = useToast();
  const { currentPatient, recentPatients } = state;
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  

  // Patient search: prefer server when authenticated; fallback to local recent patients
  const searchPatients = async (query: string): Promise<PatientProfile[]> => {
    if (!query.trim()) return [];
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token;
      if (token) {
        const params = new URLSearchParams({ q: query, page: '1', pageSize: '10' });
        const resp = await fetch(`/api/patients?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
        if (resp.ok) {
          const body = await resp.json();
          const list = Array.isArray(body?.patients) ? body.patients : [];
          return list.map((p: any) => p.data || p);
        }
      }
    } catch {}
    const q = query.toLowerCase();
    return recentPatients.filter(patient => 
      `${patient.demographics.firstName} ${patient.demographics.lastName}`
        .toLowerCase()
        .includes(q) ||
      (patient.demographics.mrn || '').toLowerCase().includes(q)
    );
  };

  const [searchResults, setSearchResults] = useState<PatientProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAllPatients, setShowAllPatients] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPatients(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectPatient = (patient: PatientProfile) => {
    actions.setCurrentPatient(patient);
    setSearchQuery('');
    setSearchResults([]);
    setShowAllPatients(false);
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim() === '') {
      setShowAllPatients(true);
      setSearchResults(recentPatients);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding to allow for clicks
    setTimeout(() => {
      setShowAllPatients(false);
      if (searchQuery.trim() === '') {
        setSearchResults([]);
      }
    }, 200);
  };

  const createNewPatient = async (patientData: any) => {
    // Extract demographics and other data from comprehensive form
    const demographics: PatientDemographics = {
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      dateOfBirth: patientData.dateOfBirth,
      sex: patientData.sex,
      mrn: patientData.mrn,
      heightCm: patientData.heightCm,
      weightKg: patientData.weightKg,
    };

    // Determine creator from Supabase auth if available
    let createdBy = 'guest';
    try {
      const { data: sess } = await supabase.auth.getSession();
      createdBy = sess?.session?.user?.id || createdBy;
    } catch {}

    const newPatient: PatientProfile = {
      id: `patient-${Date.now()}`,
      demographics,
      allergies: patientData.allergies || [],
      medications: [],
      conditions: patientData.medicalConditions || [],
      labValues: patientData.labValues ? [patientData.labValues] : [],
      genetics: [],
      vitals: patientData.vitals ? [patientData.vitals] : [],
      treatmentHistory: [],
      notes: [],
      preferences: {},
      lastUpdated: new Date().toISOString(),
      createdBy,
      isActive: true,
    };

    // Optimistically set current and then try to persist
    actions.setCurrentPatient(newPatient);

    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token;
      if (token) {
        await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ patient: newPatient })
        });
        showToast('success', 'Patient created');
      }
    } catch {
      showToast('warning', 'Saved locally (offline)');
    }
    setShowCreateForm(false);
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Current Patient Display */}
      {currentPatient && (
        <Card className="bg-primary-50 border-primary-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary-900">
                  {currentPatient.demographics.firstName} {currentPatient.demographics.lastName}
                </h3>
                <div className="flex items-center space-x-3 text-sm text-primary-700">
                  <span>{calculateAge(currentPatient.demographics.dateOfBirth)} years old</span>
                  <span className="capitalize">{currentPatient.demographics.sex}</span>
                  {currentPatient.demographics.mrn && (
                    <span>MRN: {currentPatient.demographics.mrn}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Tooltip content="Currently selected patient">
                <Star className="w-5 h-5 text-primary-600 fill-current" />
              </Tooltip>
            </div>
          </div>
        </Card>
      )}

      {/* Patient Search */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <Search className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Patient Search</h3>
          <Tooltip 
            content="Search for existing patients by name or MRN, or create a new patient profile. Focus on the search field to see all available patients."
            type="help"
            position="bottom"
          >
            <Info className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help transition-colors" />
          </Tooltip>
        </div>

        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              placeholder="Search by patient name or MRN..."
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {isSearching && (
              <div className="absolute right-3 top-2.5">
                <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <Tooltip 
            content="Create a new patient profile with comprehensive clinical information"
            position="bottom"
          >
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
            >
              <Plus className="w-4 h-4" />
              <span>New Patient</span>
            </button>
          </Tooltip>
          <Tooltip content="Sync patients from server" position="bottom">
            <button
              onClick={() => actions.syncFromServer()}
              className="flex items-center space-x-2 px-3 py-2 bg-white border text-sm font-medium rounded-md hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sync</span>
            </button>
          </Tooltip>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              {showAllPatients ? 'Available Patients:' : 'Search Results:'}
            </h4>
            {searchResults.map((patient) => (
              <div
                key={patient.id}
                onClick={() => selectPatient(patient)}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {patient.demographics.firstName} {patient.demographics.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {calculateAge(patient.demographics.dateOfBirth)} years • {patient.demographics.sex} • MRN: {patient.demographics.mrn}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date(patient.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchQuery.length >= 1 && searchResults.length === 0 && !isSearching && (
          <div className="mt-4 text-sm text-gray-500">
            No patients found matching "{searchQuery}"
          </div>
        )}
      </Card>

      {/* Recent Patients */}
      {recentPatients.length > 0 && (
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
            <Tooltip content="Recently accessed patient profiles for quick selection">
              <Info className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {recentPatients.slice(0, 6).map((patient) => (
              <div
                key={patient.id}
                onClick={() => selectPatient(patient)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  currentPatient?.id === patient.id
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {patient.demographics.firstName} {patient.demographics.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {calculateAge(patient.demographics.dateOfBirth)} years • MRN: {patient.demographics.mrn}
                    </div>
                  </div>
                  <button
                    className="p-1 text-gray-400 hover:text-red-600"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!confirm('Delete this patient?')) return;
                      const deleted = patient;
                      actions.removePatient(patient.id);
                      showToast('success', 'Patient deleted', 5000, {
                        label: 'Undo',
                        onClick: async () => {
                          // Restore locally and attempt to persist server-side
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
                    title="Delete patient"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Create New Patient Form */}
      {showCreateForm && (
        <ComprehensivePatientForm
          onSubmit={createNewPatient}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
      {/* Toasts are rendered by ToastProvider */}
    </div>
  );
};

export default PatientSelector;
