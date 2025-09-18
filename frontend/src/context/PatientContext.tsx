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
  | { type: 'ACKNOWLEDGE_ALERT'; payload: string }
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
          alert.id === action.payload
            ? {
                ...alert,
                isAcknowledged: true,
                acknowledgedAt: new Date().toISOString(),
                acknowledgedBy: 'current-user', // TODO: Get from auth context
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

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(patientReducer, initialState);

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
      dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: alertId });
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