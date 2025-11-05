import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PatientProfile, ClinicalAlert, ClinicalSession } from '../types';

interface PatientState {
  currentPatient: PatientProfile | null;
  recentPatients: PatientProfile[];
  alerts: ClinicalAlert[];
  activeSessions: ClinicalSession[];
  isLoading: boolean;
  error: string | null;
  lastSaveOffline?: boolean;
  offlineNote?: string | null;
  showOfflineBanner?: boolean;
  hydrated?: boolean;
}

type PatientAction =
  | { type: 'SET_CURRENT_PATIENT'; payload: PatientProfile | null }
  | { type: 'UPDATE_PATIENT_DATA'; payload: Partial<PatientProfile> }
  | { type: 'ADD_RECENT_PATIENT'; payload: PatientProfile }
  | { type: 'SET_RECENT_PATIENTS'; payload: PatientProfile[] }
  | { type: 'REMOVE_PATIENT'; payload: { id: string } }
  | { type: 'SET_ALERTS'; payload: ClinicalAlert[] }
  | { type: 'ADD_ALERT'; payload: ClinicalAlert }
  | { type: 'ACKNOWLEDGE_ALERT'; payload: { alertId: string; userId: string } }
  | { type: 'START_SESSION'; payload: ClinicalSession }
  | { type: 'END_SESSION'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_OFFLINE_SAVE'; payload: { offline: boolean; note?: string | null } }
  | { type: 'DISMISS_OFFLINE_BANNER' }
  | { type: 'SET_HYDRATED'; payload: boolean };

const initialState: PatientState = {
  currentPatient: null,
  recentPatients: [],
  alerts: [],
  activeSessions: [],
  isLoading: false,
  error: null,
  lastSaveOffline: false,
  offlineNote: null,
  showOfflineBanner: false,
  hydrated: false,
};

function patientReducer(state: PatientState, action: PatientAction): PatientState {
  switch (action.type) {
    case 'SET_CURRENT_PATIENT':
      return {
        ...state,
        currentPatient: action.payload,
        error: null,
      };

    case 'UPDATE_PATIENT_DATA':
      if (!state.currentPatient) return state;
      const updatedPatient = {
        ...state.currentPatient,
        ...action.payload,
        lastUpdated: new Date().toISOString(),
      };
      return {
        ...state,
        currentPatient: updatedPatient,
        recentPatients: state.recentPatients.map(p => 
          p.id === updatedPatient.id ? updatedPatient : p
        ),
      };

    case 'ADD_RECENT_PATIENT':
      const existingIndex = state.recentPatients.findIndex(p => p.id === action.payload.id);
      let newRecentPatients;
      
      if (existingIndex >= 0) {
        // Move to front if already exists
        newRecentPatients = [
          action.payload,
          ...state.recentPatients.filter(p => p.id !== action.payload.id)
        ];
      } else {
        // Add to front, keep max 10 recent patients
        newRecentPatients = [action.payload, ...state.recentPatients].slice(0, 10);
      }

      return {
        ...state,
        recentPatients: newRecentPatients,
      };

    case 'SET_RECENT_PATIENTS':
      return {
        ...state,
        recentPatients: action.payload.slice(0, 10),
      };

    case 'REMOVE_PATIENT':
      return {
        ...state,
        currentPatient: state.currentPatient?.id === action.payload.id ? null : state.currentPatient,
        recentPatients: state.recentPatients.filter(p => p.id !== action.payload.id),
      };

    case 'SET_ALERTS':
      return {
        ...state,
        alerts: action.payload,
      };

    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [action.payload, ...state.alerts],
      };

    case 'ACKNOWLEDGE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map(alert =>
          alert.id === action.payload.alertId
            ? {
                ...alert,
                isAcknowledged: true,
                acknowledgedAt: new Date().toISOString(),
                acknowledgedBy: action.payload.userId,
              }
            : alert
        ),
      };

    case 'START_SESSION':
      return {
        ...state,
        activeSessions: [...state.activeSessions, action.payload],
      };

    case 'END_SESSION':
      return {
        ...state,
        activeSessions: state.activeSessions.map(session =>
          session.id === action.payload
            ? { ...session, endTime: new Date().toISOString() }
            : session
        ).filter(session => !session.endTime),
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_OFFLINE_SAVE':
      return {
        ...state,
        lastSaveOffline: action.payload.offline,
        offlineNote: action.payload.note ?? null,
        // When we get a new offline signal, re-show the banner. Hide when offline=false
        showOfflineBanner: action.payload.offline ? true : false,
      };

    case 'DISMISS_OFFLINE_BANNER':
      return {
        ...state,
        showOfflineBanner: false,
      };

    case 'SET_HYDRATED':
      return {
        ...state,
        hydrated: action.payload,
      };

    default:
      return state;
  }
}

const PatientContext = createContext<{
  state: PatientState;
  dispatch: React.Dispatch<PatientAction>;
  actions: {
    setCurrentPatient: (patient: PatientProfile | null) => void;
    updatePatientData: (data: Partial<PatientProfile>) => void;
    addRecentPatient: (patient: PatientProfile) => void;
    removePatient: (id: string) => Promise<void> | void;
    syncFromServer: () => Promise<void> | void;
    addAlert: (alert: ClinicalAlert) => void;
    acknowledgeAlert: (alertId: string) => void;
    startSession: (session: ClinicalSession) => void;
    endSession: (sessionId: string) => void;
    clearError: () => void;
  };
} | null>(null);

// Helper function to safely get auth context
const useAuthSafely = () => {
  try {
    const { useAuth } = require('./AuthContext');
    return useAuth();
  } catch {
    return { state: { user: null } };
  }
};

// Feature flag to disable patient functionality in the UI
const PATIENTS_DISABLED = String((import.meta as any)?.env?.VITE_PATIENTS_DISABLED || '').toLowerCase() === 'true';
// Feature flag: disable fallback sample patients entirely
const DISABLE_SAMPLE_PATIENTS = String((import.meta as any)?.env?.VITE_DISABLE_SAMPLE_PATIENTS || '').toLowerCase() === 'true';
// Feature flag: enable backend patient API calls
const ENABLE_PATIENT_API = String((import.meta as any)?.env?.VITE_ENABLE_PATIENT_API || '').toLowerCase() === 'true';

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (PATIENTS_DISABLED) {
    const noopActions = {
      setCurrentPatient: (_p: PatientProfile | null) => {},
      updatePatientData: (_d: Partial<PatientProfile>) => {},
      addRecentPatient: (_p: PatientProfile) => {},
      removePatient: async (_id: string) => {},
      syncFromServer: async () => {},
      addAlert: (_a: ClinicalAlert) => {},
      acknowledgeAlert: (_id: string) => {},
      startSession: (_s: ClinicalSession) => {},
      endSession: (_id: string) => {},
      clearError: () => {},
    };
    const value = { state: initialState, dispatch: (() => undefined) as any, actions: noopActions } as any;
    return (
      <PatientContext.Provider value={value}>
        {children}
      </PatientContext.Provider>
    );
  }

  const [state, dispatch] = useReducer(patientReducer, initialState);
  const authContext = useAuthSafely();

  const currentUserId: string = authContext.state?.user?.id || 'guest';
  const lsKey = (name: string) => `oncosaferx:${currentUserId}:${name}`;

  // Load persisted data per user (and migrate old keys if found)
  useEffect(() => {
    try {
      const nsCurrent = localStorage.getItem(lsKey('current_patient'));
      const nsRecents = localStorage.getItem(lsKey('recent_patients'));

      // Migration from legacy global keys (non-namespaced)
      const legacyCurrent = localStorage.getItem('oncosaferx_current_patient');
      const legacyRecents = localStorage.getItem('oncosaferx_recent_patients');

      const toUseCurrent = nsCurrent || legacyCurrent;
      const toUseRecents = nsRecents || legacyRecents;

      // Reset state before loading (switching users)
      dispatch({ type: 'SET_CURRENT_PATIENT', payload: null });
      // Reset offline banner dismissed flag per session; we re-respect sessionStorage dismissal below
      const keyDismiss = 'oncosaferx:offline_banner_dismissed';
      const dismissed = (() => { try { return sessionStorage.getItem(keyDismiss) === '1'; } catch { return false; } })();
      if (dismissed) {
        dispatch({ type: 'SET_OFFLINE_SAVE', payload: { offline: false } });
      }

      if (toUseCurrent) {
        const patient = JSON.parse(toUseCurrent);
        dispatch({ type: 'SET_CURRENT_PATIENT', payload: patient });
      }

      if (toUseRecents) {
        const recents = JSON.parse(toUseRecents);
        recents.forEach((patient: PatientProfile) => {
          dispatch({ type: 'ADD_RECENT_PATIENT', payload: patient });
        });
        // Auto-select most recent patient if none currently selected
        if (!toUseCurrent && Array.isArray(recents) && recents.length > 0) {
          dispatch({ type: 'SET_CURRENT_PATIENT', payload: recents[0] });
        }
      } else {
        // Try to fetch from patient API
        (async () => {
          try {
            const API_BASE = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${API_BASE}/patients`);
          
          if (response.ok) {
            const apiPatientsData = await response.json();
            if (apiPatientsData?.patients?.length > 0) {
              apiPatientsData.patients.forEach((patient: any) => {
                const patientProfile: PatientProfile = {
                  id: patient.id,
                  demographics: {
                    firstName: patient.demographics.firstName,
                    lastName: patient.demographics.lastName,
                    dateOfBirth: patient.demographics.dateOfBirth || patient.demographics.age ? 
                      new Date(Date.now() - (patient.demographics.age * 365.25 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : 
                      '1980-01-01',
                    sex: patient.demographics.sex || patient.demographics.gender || 'other',
                    mrn: patient.demographics.mrn,
                    heightCm: patient.demographics.height,
                    weightKg: patient.demographics.weight,
                  },
                  allergies: (patient.allergies || []).map((allergy: any) => ({
                    id: allergy.id || `allergy-${Math.random()}`,
                    allergen: allergy.allergen || allergy.name,
                    allergenType: allergy.type || 'drug',
                    reaction: allergy.reaction || 'Unknown reaction',
                    severity: allergy.severity || 'moderate',
                    dateReported: allergy.dateReported || new Date().toISOString(),
                    verified: allergy.verified || false,
                  })),
                  medications: (patient.medications || []).map((med: any) => ({
                    id: med.id || `med-${Math.random()}`,
                    drugName: med.drug || med.drugName || med.name,
                    dosage: med.dosage || med.dose || 'Unknown',
                    frequency: med.frequency || 'Unknown',
                    route: med.route || 'Oral',
                    startDate: med.startDate || new Date().toISOString().split('T')[0],
                    isActive: med.isActive !== false,
                    prescribedBy: med.prescribedBy || med.prescriber || 'Dr. Unknown',
                  })),
                  conditions: (patient.conditions || []).map((condition: any) => ({
                    id: condition.id || `condition-${Math.random()}`,
                    name: condition.condition || condition.name,
                    status: condition.status || 'active',
                    dateOfOnset: condition.dateOfOnset || condition.diagnosisDate || new Date().toISOString().split('T')[0],
                    notes: condition.notes || '',
                  })),
                  labValues: patient.labValues || [],
                  genetics: patient.genetics || [],
                  vitals: patient.vitals || [],
                  treatmentHistory: patient.treatmentHistory || [],
                  notes: patient.notes || [],
                  preferences: patient.preferences || { primaryLanguage: 'English' },
                  lastUpdated: patient.lastUpdated || new Date().toISOString(),
                  createdBy: patient.createdBy || 'system',
                  isActive: patient.isActive !== false,
                };
                dispatch({ type: 'ADD_RECENT_PATIENT', payload: patientProfile });
              });
              return; // Exit early if API data was successful
            }
          }
          } catch (error) {
            console.warn('Failed to fetch patients from API, using sample data:', error);
          }
        })();

        if (DISABLE_SAMPLE_PATIENTS) {
          // Skip adding sample patients when disabled
          // As a last resort, try global last selected patient
          try {
            const last = localStorage.getItem('osrx_last_patient');
            if (last) {
              const lastPatient = JSON.parse(last);
              dispatch({ type: 'SET_CURRENT_PATIENT', payload: lastPatient });
              dispatch({ type: 'ADD_RECENT_PATIENT', payload: lastPatient });
            }
          } catch {}
          return;
        }

        // Add sample patients if API fails or returns no data
        const samplePatients: PatientProfile[] = [
          {
            id: 'patient-001',
            demographics: {
              firstName: 'Sarah',
              lastName: 'Johnson',
              dateOfBirth: '1975-03-15',
              sex: 'female',
              mrn: 'MRN-001234',
              heightCm: 165,
              weightKg: 68.5,
            },
            allergies: [
              {
                id: 'allergy-1',
                allergen: 'Penicillin',
                allergenType: 'drug',
                reaction: 'Rash and itching',
                severity: 'moderate',
                dateReported: '2023-01-15T00:00:00Z',
                verified: true,
              }
            ],
            medications: [
              {
                id: 'med-1',
                drug: { rxcui: '', name: 'Tamoxifen' } as any,
                drugName: 'Tamoxifen',
                dosage: '20 mg',
                frequency: 'Daily',
                route: 'Oral',
                startDate: '2024-01-01',
                indication: 'Breast Cancer',
                isActive: true,
                prescriber: 'Dr. Smith',
              }
            ],
            conditions: [
              {
                id: 'cond-1',
                condition: 'Breast Cancer',
                icd10: 'C50.9',
                dateOfOnset: '2023-12-15',
                status: 'active',
                stage: 'T2N0M0',
              }
            ],
            labValues: [
              {
                id: 'lab-1',
                labType: 'Complete Blood Count',
                value: 4.5,
                unit: 'x10^9/L',
                referenceRange: '4.0-11.0',
                timestamp: '2024-01-15T10:00:00Z',
                isAbnormal: false,
                criticalFlag: false,
              }
            ],
            genetics: [],
            vitals: [
              {
                id: 'vitals-1',
                timestamp: '2024-01-15T09:00:00Z',
                bloodPressureSystolic: 120,
                bloodPressureDiastolic: 80,
                heartRate: 72,
                temperature: 36.5,
                performanceStatus: 0,
              }
            ],
            treatmentHistory: [],
            appointments: [],
            sideEffectReports: [],
            notes: [],
            preferences: {},
            lastUpdated: '2024-01-15T10:00:00Z',
            createdBy: currentUserId,
            isActive: true,
          },
          {
            id: 'patient-002',
            demographics: {
              firstName: 'Michael',
              lastName: 'Chen',
              dateOfBirth: '1962-08-22',
              sex: 'male',
              mrn: 'MRN-005678',
              heightCm: 178,
              weightKg: 85.2,
            },
            allergies: [],
            medications: [
              {
                id: 'med-2',
                drug: { rxcui: '', name: 'Carboplatin' } as any,
                drugName: 'Carboplatin',
                dosage: 'AUC 5',
                frequency: 'Every 3 weeks',
                route: 'IV',
                startDate: '2024-01-08',
                indication: 'NSCLC',
                isActive: true,
                prescriber: 'Dr. Johnson',
              }
            ],
            conditions: [
              {
                id: 'cond-2',
                condition: 'Non-Small Cell Lung Cancer',
                icd10: 'C78.0',
                dateOfOnset: '2023-11-20',
                status: 'active',
                stage: 'IIIA',
              }
            ],
            labValues: [
              {
                id: 'lab-2',
                labType: 'Creatinine',
                value: 1.2,
                unit: 'mg/dL',
                referenceRange: '0.7-1.3',
                timestamp: '2024-01-14T08:30:00Z',
                isAbnormal: false,
                criticalFlag: false,
              }
            ],
            genetics: [],
            vitals: [
              {
                id: 'vitals-2',
                timestamp: '2024-01-14T14:00:00Z',
                bloodPressureSystolic: 135,
                bloodPressureDiastolic: 85,
                heartRate: 78,
                temperature: 36.8,
                performanceStatus: 1,
              }
            ],
            treatmentHistory: [],
            appointments: [],
            sideEffectReports: [],
            notes: [],
            preferences: {},
            lastUpdated: '2024-01-14T14:00:00Z',
            createdBy: currentUserId,
            isActive: true,
          },
          {
            id: 'patient-003',
            demographics: {
              firstName: 'Emma',
              lastName: 'Rodriguez',
              dateOfBirth: '1958-12-03',
              sex: 'female',
              mrn: 'MRN-009012',
              heightCm: 160,
              weightKg: 72.8,
            },
            allergies: [
              {
                id: 'allergy-2',
                allergen: 'Sulfa drugs',
                allergenType: 'drug',
                reaction: 'Stevens-Johnson syndrome',
                severity: 'severe',
                dateReported: '2020-05-10T00:00:00Z',
                verified: true,
              }
            ],
            medications: [
              {
                id: 'med-3',
                drug: { rxcui: '', name: 'Bevacizumab' } as any,
                drugName: 'Bevacizumab',
                dosage: '15 mg/kg',
                frequency: 'Every 3 weeks',
                route: 'IV',
                startDate: '2024-01-02',
                indication: 'Colorectal Cancer',
                isActive: true,
                prescriber: 'Dr. Williams',
              }
            ],
            conditions: [
              {
                id: 'cond-3',
                condition: 'Colorectal Cancer',
                icd10: 'C18.9',
                dateOfOnset: '2023-10-05',
                status: 'active',
                stage: 'IV',
              }
            ],
            labValues: [
              {
                id: 'lab-3',
                labType: 'CEA',
                value: 8.5,
                unit: 'ng/mL',
                referenceRange: '<3.0',
                timestamp: '2024-01-13T11:15:00Z',
                isAbnormal: true,
                criticalFlag: false,
              }
            ],
            genetics: [],
            vitals: [
              {
                id: 'vitals-3',
                timestamp: '2024-01-13T09:30:00Z',
                bloodPressureSystolic: 110,
                bloodPressureDiastolic: 70,
                heartRate: 68,
                temperature: 37.1,
                performanceStatus: 2,
              }
            ],
            treatmentHistory: [],
            appointments: [],
            sideEffectReports: [],
            notes: [],
            preferences: {},
            lastUpdated: '2024-01-13T11:15:00Z',
            createdBy: currentUserId,
            isActive: true,
          }
        ];
        
        samplePatients.forEach(patient => {
          dispatch({ type: 'ADD_RECENT_PATIENT', payload: patient });
        });
        // Select the first sample patient by default to unify context
        dispatch({ type: 'SET_CURRENT_PATIENT', payload: samplePatients[0] });
      }

      // Persist migrated data into namespaced keys
      if (!nsCurrent && legacyCurrent) {
        localStorage.setItem(lsKey('current_patient'), legacyCurrent);
      }
      if (!nsRecents && legacyRecents) {
        localStorage.setItem(lsKey('recent_patients'), legacyRecents);
      }

      // Try to hydrate from server if available (flag-controlled)
      (async () => {
        try {
          if (!ENABLE_PATIENT_API) return;
          const { authedFetch } = await import('../utils/authedFetch');
          const resp = await authedFetch('/api/patients');
          if (!resp.ok) return;
          const body = await resp.json();
          if (Array.isArray(body?.patients) && body.patients.length) {
            const recents = body.patients.map((p: any) => p.data || p);
            recents.forEach((patient: any) => dispatch({ type: 'ADD_RECENT_PATIENT', payload: patient }));
          }
        } catch {}
      })();

      // Mark hydration complete
      dispatch({ type: 'SET_HYDRATED', payload: true });
    } catch (error) {
      console.warn('Failed to load patient data from localStorage:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // Persist current patient to localStorage (per user)
  useEffect(() => {
    if (state.currentPatient) {
      localStorage.setItem(lsKey('current_patient'), JSON.stringify(state.currentPatient));
      (async () => {
        try {
          if (!ENABLE_PATIENT_API) {
            dispatch({ type: 'SET_OFFLINE_SAVE', payload: { offline: true, note: 'Working in offline mode' } });
            return;
          }
          const { authedFetch } = await import('../utils/authedFetch');
          const resp = await authedFetch('/api/patients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patient: state.currentPatient })
          } as any);
          try {
            const body = await resp.json();
            if (body && typeof body.offline !== 'undefined') {
              dispatch({ type: 'SET_OFFLINE_SAVE', payload: { offline: !!body.offline, note: body.note || null } });
            } else {
              dispatch({ type: 'SET_OFFLINE_SAVE', payload: { offline: false } });
            }
          } catch {
            dispatch({ type: 'SET_OFFLINE_SAVE', payload: { offline: false } });
          }
        } catch {}
      })();
    } else {
      localStorage.removeItem(lsKey('current_patient'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentPatient, currentUserId]);

  // Persist recent patients to localStorage (per user)
  useEffect(() => {
    localStorage.setItem(lsKey('recent_patients'), JSON.stringify(state.recentPatients));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.recentPatients, currentUserId]);

  // Auto-provision a default patient profile for logged-in patient users
  useEffect(() => {
    try {
      const user = authContext.state?.user as any;
      if (!state.hydrated) return;
      if (state.currentPatient) return;
      if (!user) return;
      const roles: string[] = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []);
      const isPatient = roles.includes('patient');
      if (!isPatient) return;

      const firstName = user.firstName || user.user_metadata?.first_name || (user.email?.split('@')[0] || 'Patient');
      const lastName = user.lastName || user.user_metadata?.last_name || '';

      // Calculate dateOfBirth from user.age if available
      const currentYear = new Date().getFullYear();
      const birthYear = user.age ? currentYear - user.age : 1980;
      const dateOfBirth = user.age ? `${birthYear}-01-01` : '1980-01-01';

      const defaultProfile: PatientProfile = {
        id: `patient-${user.id}`,
        demographics: {
          firstName,
          lastName,
          dateOfBirth,
          sex: user.sex || 'other',
          mrn: undefined as any,
          heightCm: 170,
          weightKg: user.weight || undefined,
        } as any,
        allergies: [],
        medications: [],
        conditions: [],
        labValues: [],
        genetics: [],
        vitals: [],
        treatmentHistory: [],
        appointments: [],
        sideEffectReports: [],
        notes: [],
        preferences: {},
        lastUpdated: new Date().toISOString(),
        createdBy: user.id,
        isActive: true,
      } as any;

      dispatch({ type: 'SET_CURRENT_PATIENT', payload: defaultProfile });
      dispatch({ type: 'ADD_RECENT_PATIENT', payload: defaultProfile });
    } catch (e) {
      console.warn('Auto-provision patient profile failed:', e);
    }
  }, [state.hydrated, state.currentPatient, authContext.state?.user]);

  const actions = {
    setCurrentPatient: (patient: PatientProfile | null) => {
      dispatch({ type: 'SET_CURRENT_PATIENT', payload: patient });
      if (patient) {
        dispatch({ type: 'ADD_RECENT_PATIENT', payload: patient });
        try { localStorage.setItem('osrx_last_patient', JSON.stringify(patient)); } catch {}
      } else {
        try { localStorage.removeItem('osrx_last_patient'); } catch {}
      }
    },
    
    updatePatientData: (data: Partial<PatientProfile>) => {
      dispatch({ type: 'UPDATE_PATIENT_DATA', payload: data });
    },
    
    addRecentPatient: (patient: PatientProfile) => {
      dispatch({ type: 'ADD_RECENT_PATIENT', payload: patient });
    },

    removePatient: async (id: string) => {
      try {
        dispatch({ type: 'REMOVE_PATIENT', payload: { id } });
        if (!ENABLE_PATIENT_API) return;
        const { authedFetch } = await import('../utils/authedFetch');
        await authedFetch(`/api/patients/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        } as any);
      } catch (_) {}
    },

    syncFromServer: async () => {
      try {
        if (!ENABLE_PATIENT_API) return;
        const { authedFetch } = await import('../utils/authedFetch');
        const resp = await authedFetch('/api/patients');
        if (!resp.ok) return;
        const body = await resp.json();
        if (Array.isArray(body?.patients)) {
          const recents = body.patients.map((p: any) => p.data || p);
          dispatch({ type: 'SET_RECENT_PATIENTS', payload: recents });
        }
      } catch (_) {}
    },
    
    addAlert: (alert: ClinicalAlert) => {
      dispatch({ type: 'ADD_ALERT', payload: alert });
    },
    
    acknowledgeAlert: (alertId: string) => {
      const userId = authContext.state?.user?.id || 'unknown-user';
      dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: { alertId, userId } });
    },
    
    startSession: (session: ClinicalSession) => {
      dispatch({ type: 'START_SESSION', payload: session });
    },
    
    endSession: (sessionId: string) => {
      dispatch({ type: 'END_SESSION', payload: sessionId });
    },
    
    clearError: () => {
      dispatch({ type: 'CLEAR_ERROR' });
    },
  };

  return (
    <PatientContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    // During development, context might be temporarily null during hot reloads
    console.warn('usePatient called outside PatientProvider, this may be a development hot-reload issue');
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};
