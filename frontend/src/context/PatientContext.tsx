import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { PatientProfile, ClinicalAlert, ClinicalSession } from '../types';

interface PatientState {
  currentPatient: PatientProfile | null;
  recentPatients: PatientProfile[];
  alerts: ClinicalAlert[];
  activeSessions: ClinicalSession[];
  isLoading: boolean;
  error: string | null;
}

type PatientAction =
  | { type: 'SET_CURRENT_PATIENT'; payload: PatientProfile | null }
  | { type: 'UPDATE_PATIENT_DATA'; payload: Partial<PatientProfile> }
  | { type: 'ADD_RECENT_PATIENT'; payload: PatientProfile }
  | { type: 'SET_ALERTS'; payload: ClinicalAlert[] }
  | { type: 'ADD_ALERT'; payload: ClinicalAlert }
  | { type: 'ACKNOWLEDGE_ALERT'; payload: { alertId: string; userId: string } }
  | { type: 'START_SESSION'; payload: ClinicalSession }
  | { type: 'END_SESSION'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

const initialState: PatientState = {
  currentPatient: null,
  recentPatients: [],
  alerts: [],
  activeSessions: [],
  isLoading: false,
  error: null,
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

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(patientReducer, initialState);
  const authContext = useAuthSafely();

  // Load persisted data on mount
  useEffect(() => {
    try {
      const savedPatient = localStorage.getItem('oncosaferx_current_patient');
      const savedRecents = localStorage.getItem('oncosaferx_recent_patients');
      
      if (savedPatient) {
        const patient = JSON.parse(savedPatient);
        dispatch({ type: 'SET_CURRENT_PATIENT', payload: patient });
      }
      
      if (savedRecents) {
        const recents = JSON.parse(savedRecents);
        recents.forEach((patient: PatientProfile) => {
          dispatch({ type: 'ADD_RECENT_PATIENT', payload: patient });
        });
      } else {
        // Add sample patients if none exist
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
                drugName: 'Tamoxifen',
                dosage: '20 mg',
                frequency: 'Daily',
                route: 'Oral',
                startDate: '2024-01-01',
                isActive: true,
                prescribedBy: 'Dr. Smith',
              }
            ],
            conditions: [
              {
                id: 'cond-1',
                name: 'Breast Cancer',
                icd10: 'C50.9',
                dateOfDiagnosis: '2023-12-15',
                status: 'active',
                stage: 'T2N0M0',
              }
            ],
            labValues: [
              {
                id: 'lab-1',
                labType: 'Complete Blood Count',
                value: '4.5',
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
            notes: [],
            preferences: {},
            lastUpdated: '2024-01-15T10:00:00Z',
            createdBy: 'demo-user',
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
                drugName: 'Carboplatin',
                dosage: 'AUC 5',
                frequency: 'Every 3 weeks',
                route: 'IV',
                startDate: '2024-01-08',
                isActive: true,
                prescribedBy: 'Dr. Johnson',
              }
            ],
            conditions: [
              {
                id: 'cond-2',
                name: 'Non-Small Cell Lung Cancer',
                icd10: 'C78.0',
                dateOfDiagnosis: '2023-11-20',
                status: 'active',
                stage: 'IIIA',
              }
            ],
            labValues: [
              {
                id: 'lab-2',
                labType: 'Creatinine',
                value: '1.2',
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
            notes: [],
            preferences: {},
            lastUpdated: '2024-01-14T14:00:00Z',
            createdBy: 'demo-user',
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
                drugName: 'Bevacizumab',
                dosage: '15 mg/kg',
                frequency: 'Every 3 weeks',
                route: 'IV',
                startDate: '2024-01-02',
                isActive: true,
                prescribedBy: 'Dr. Williams',
              }
            ],
            conditions: [
              {
                id: 'cond-3',
                name: 'Colorectal Cancer',
                icd10: 'C18.9',
                dateOfDiagnosis: '2023-10-05',
                status: 'active',
                stage: 'IV',
              }
            ],
            labValues: [
              {
                id: 'lab-3',
                labType: 'CEA',
                value: '8.5',
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
            notes: [],
            preferences: {},
            lastUpdated: '2024-01-13T11:15:00Z',
            createdBy: 'demo-user',
            isActive: true,
          }
        ];
        
        samplePatients.forEach(patient => {
          dispatch({ type: 'ADD_RECENT_PATIENT', payload: patient });
        });
      }
    } catch (error) {
      console.warn('Failed to load patient data from localStorage:', error);
    }
  }, []);

  // Persist current patient to localStorage
  useEffect(() => {
    if (state.currentPatient) {
      localStorage.setItem('oncosaferx_current_patient', JSON.stringify(state.currentPatient));
    } else {
      localStorage.removeItem('oncosaferx_current_patient');
    }
  }, [state.currentPatient]);

  // Persist recent patients to localStorage
  useEffect(() => {
    localStorage.setItem('oncosaferx_recent_patients', JSON.stringify(state.recentPatients));
  }, [state.recentPatients]);

  const actions = {
    setCurrentPatient: (patient: PatientProfile | null) => {
      dispatch({ type: 'SET_CURRENT_PATIENT', payload: patient });
      if (patient) {
        dispatch({ type: 'ADD_RECENT_PATIENT', payload: patient });
      }
    },
    
    updatePatientData: (data: Partial<PatientProfile>) => {
      dispatch({ type: 'UPDATE_PATIENT_DATA', payload: data });
    },
    
    addRecentPatient: (patient: PatientProfile) => {
      dispatch({ type: 'ADD_RECENT_PATIENT', payload: patient });
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
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};