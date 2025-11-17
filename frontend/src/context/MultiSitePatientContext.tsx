/**
 * Multi-Site Patient Context
 * Extends the existing PatientContext with multi-site network capabilities
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { PatientProfile, ClinicalAlert, ClinicalSession } from '../types';
import { MultiSitePatientProfile, NetworkSite, CrossSiteReferral, CrossSiteConsultation } from '../types/multiSite';
import { multiSiteAccessService } from '../services/multiSiteAccessService';
import { useAuth } from './AuthContext';

interface MultiSitePatientState {
  // Extended patient data
  currentPatient: MultiSitePatientProfile | null;
  recentPatients: MultiSitePatientProfile[];
  
  // Multi-site specific state
  accessibleSites: NetworkSite[];
  currentSiteContext: string | null;
  crossSiteActivity: {
    referrals: CrossSiteReferral[];
    consultations: CrossSiteConsultation[];
    pendingTransfers: any[];
  };
  
  // Access and permissions
  patientAccessMap: Map<string, {
    canView: boolean;
    canEdit: boolean;
    accessLevel: string;
    siteContext: string;
    lastChecked: string;
  }>;
  
  // UI and interaction state
  showSiteSelector: boolean;
  networkConnected: boolean;
  
  // Legacy compatibility
  alerts: ClinicalAlert[];
  activeSessions: ClinicalSession[];
  isLoading: boolean;
  error: string | null;
  lastSaveOffline?: boolean;
  offlineNote?: string | null;
  showOfflineBanner?: boolean;
  hydrated?: boolean;
}

type MultiSitePatientAction =
  // Extended patient actions
  | { type: 'SET_CURRENT_PATIENT'; payload: MultiSitePatientProfile | null }
  | { type: 'UPDATE_PATIENT_DATA'; payload: Partial<MultiSitePatientProfile> }
  | { type: 'ADD_RECENT_PATIENT'; payload: MultiSitePatientProfile }
  | { type: 'SET_RECENT_PATIENTS'; payload: MultiSitePatientProfile[] }
  
  // Multi-site specific actions
  | { type: 'SET_ACCESSIBLE_SITES'; payload: NetworkSite[] }
  | { type: 'SET_SITE_CONTEXT'; payload: string | null }
  | { type: 'SET_PATIENT_ACCESS'; payload: { patientId: string; access: any } }
  | { type: 'ADD_CROSS_SITE_REFERRAL'; payload: CrossSiteReferral }
  | { type: 'ADD_CROSS_SITE_CONSULTATION'; payload: CrossSiteConsultation }
  | { type: 'SET_NETWORK_STATUS'; payload: boolean }
  | { type: 'TOGGLE_SITE_SELECTOR'; payload?: boolean }
  
  // Legacy actions for compatibility
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

const initialState: MultiSitePatientState = {
  // Extended patient state
  currentPatient: null,
  recentPatients: [],
  
  // Multi-site state
  accessibleSites: [],
  currentSiteContext: null,
  crossSiteActivity: {
    referrals: [],
    consultations: [],
    pendingTransfers: []
  },
  patientAccessMap: new Map(),
  showSiteSelector: false,
  networkConnected: true,
  
  // Legacy compatibility
  alerts: [],
  activeSessions: [],
  isLoading: false,
  error: null,
  lastSaveOffline: false,
  offlineNote: null,
  showOfflineBanner: false,
  hydrated: false,
};

function multiSitePatientReducer(state: MultiSitePatientState, action: MultiSitePatientAction): MultiSitePatientState {
  switch (action.type) {
    case 'SET_CURRENT_PATIENT':
      return {
        ...state,
        currentPatient: action.payload,
        error: null,
        // Update site context when patient changes
        currentSiteContext: action.payload?.siteMetadata.primarySite || null,
      };

    case 'UPDATE_PATIENT_DATA':
      if (!state.currentPatient) return state;
      const updatedPatient: MultiSitePatientProfile = {
        ...state.currentPatient,
        ...action.payload,
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
        newRecentPatients = [
          action.payload,
          ...state.recentPatients.filter(p => p.id !== action.payload.id)
        ];
      } else {
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

    case 'SET_ACCESSIBLE_SITES':
      return {
        ...state,
        accessibleSites: action.payload,
        // Set default site context if not set
        currentSiteContext: state.currentSiteContext || action.payload[0]?.siteId || null,
      };

    case 'SET_SITE_CONTEXT':
      return {
        ...state,
        currentSiteContext: action.payload,
      };

    case 'SET_PATIENT_ACCESS':
      const newAccessMap = new Map(state.patientAccessMap);
      newAccessMap.set(action.payload.patientId, action.payload.access);
      return {
        ...state,
        patientAccessMap: newAccessMap,
      };

    case 'ADD_CROSS_SITE_REFERRAL':
      return {
        ...state,
        crossSiteActivity: {
          ...state.crossSiteActivity,
          referrals: [...state.crossSiteActivity.referrals, action.payload],
        },
      };

    case 'ADD_CROSS_SITE_CONSULTATION':
      return {
        ...state,
        crossSiteActivity: {
          ...state.crossSiteActivity,
          consultations: [...state.crossSiteActivity.consultations, action.payload],
        },
      };

    case 'SET_NETWORK_STATUS':
      return {
        ...state,
        networkConnected: action.payload,
      };

    case 'TOGGLE_SITE_SELECTOR':
      return {
        ...state,
        showSiteSelector: action.payload ?? !state.showSiteSelector,
      };

    // Legacy actions for backward compatibility
    case 'REMOVE_PATIENT':
      return {
        ...state,
        recentPatients: state.recentPatients.filter(p => p.id !== action.payload.id),
        currentPatient: state.currentPatient?.id === action.payload.id ? null : state.currentPatient,
      };

    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };

    case 'ADD_ALERT':
      return { ...state, alerts: [...state.alerts, action.payload] };

    case 'ACKNOWLEDGE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map(alert =>
          alert.id === action.payload.alertId 
            ? { ...alert, acknowledgedBy: action.payload.userId, acknowledgedAt: new Date().toISOString() }
            : alert
        ),
      };

    case 'START_SESSION':
      return { ...state, activeSessions: [...state.activeSessions, action.payload] };

    case 'END_SESSION':
      return {
        ...state,
        activeSessions: state.activeSessions.filter(session => session.id !== action.payload),
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'SET_OFFLINE_SAVE':
      return {
        ...state,
        lastSaveOffline: action.payload.offline,
        offlineNote: action.payload.note || null,
        showOfflineBanner: action.payload.offline,
      };

    case 'DISMISS_OFFLINE_BANNER':
      return { ...state, showOfflineBanner: false };

    case 'SET_HYDRATED':
      return { ...state, hydrated: action.payload };

    default:
      return state;
  }
}

// Context creation
const MultiSitePatientContext = createContext<{
  state: MultiSitePatientState;
  dispatch: React.Dispatch<MultiSitePatientAction>;
  
  // Enhanced methods for multi-site functionality
  selectPatient: (patientId: string, siteContext?: string) => Promise<void>;
  checkPatientAccess: (patientId: string, action?: string) => Promise<boolean>;
  switchSiteContext: (siteId: string) => void;
  createCrossSiteReferral: (referralData: any) => Promise<void>;
  requestConsultation: (consultationData: any) => Promise<void>;
  getAccessiblePatients: (filters?: any) => Promise<MultiSitePatientProfile[]>;
  
  // Legacy methods for backward compatibility
  updatePatientData: (data: Partial<PatientProfile>) => void;
  addAlert: (alert: ClinicalAlert) => void;
  acknowledgeAlert: (alertId: string, userId: string) => void;
  startSession: (session: ClinicalSession) => void;
  endSession: (sessionId: string) => void;
} | null>(null);

// Provider component
export function MultiSitePatientProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(multiSitePatientReducer, initialState);
  const { user } = useAuth();

  // Initialize multi-site access service
  useEffect(() => {
    if (user?.id) {
      multiSiteAccessService.initialize(user.id)
        .then(async () => {
          // Load accessible sites
          const sites = multiSiteAccessService.getAccessibleSites();
          dispatch({ type: 'SET_ACCESSIBLE_SITES', payload: sites });
          
          // Load recent patients for accessible sites
          const { patients } = await multiSiteAccessService.getAccessiblePatients();
          dispatch({ type: 'SET_RECENT_PATIENTS', payload: patients });
          
          dispatch({ type: 'SET_HYDRATED', payload: true });
        })
        .catch(error => {
          console.error('Failed to initialize multi-site access:', error);
          dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize network access' });
        });
    }
  }, [user?.id]);

  // Enhanced patient selection with access checking
  const selectPatient = useCallback(async (patientId: string, siteContext?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Check access first
      const accessCheck = await multiSiteAccessService.canAccessPatient(patientId);
      if (!accessCheck.allowed) {
        throw new Error(accessCheck.reason || 'Access denied');
      }

      // Cache access information
      dispatch({
        type: 'SET_PATIENT_ACCESS',
        payload: {
          patientId,
          access: {
            canView: true,
            canEdit: accessCheck.allowed,
            accessLevel: 'standard',
            siteContext: accessCheck.siteContext || siteContext,
            lastChecked: new Date().toISOString()
          }
        }
      });

      // Fetch patient data
      const response = await fetch(`/api/patients/${patientId}/multi-site`);
      if (!response.ok) throw new Error('Failed to fetch patient');
      
      const patient: MultiSitePatientProfile = await response.json();
      
      dispatch({ type: 'SET_CURRENT_PATIENT', payload: patient });
      dispatch({ type: 'ADD_RECENT_PATIENT', payload: patient });
      
    } catch (error) {
      console.error('Error selecting patient:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load patient' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Check patient access
  const checkPatientAccess = useCallback(async (patientId: string, action = 'view'): Promise<boolean> => {
    const accessCheck = await multiSiteAccessService.canAccessPatient(patientId, action as any);
    return accessCheck.allowed;
  }, []);

  // Switch site context
  const switchSiteContext = useCallback((siteId: string) => {
    dispatch({ type: 'SET_SITE_CONTEXT', payload: siteId });
    // Reload patients for new site context if needed
    multiSiteAccessService.getAccessiblePatients({ siteId })
      .then(({ patients }) => {
        dispatch({ type: 'SET_RECENT_PATIENTS', payload: patients });
      })
      .catch(error => {
        console.error('Error switching site context:', error);
      });
  }, []);

  // Create cross-site referral
  const createCrossSiteReferral = useCallback(async (referralData: any) => {
    try {
      const referral = await multiSiteAccessService.createCrossSiteReferral(referralData);
      dispatch({ type: 'ADD_CROSS_SITE_REFERRAL', payload: referral });
    } catch (error) {
      console.error('Error creating referral:', error);
      throw error;
    }
  }, []);

  // Request consultation
  const requestConsultation = useCallback(async (consultationData: any) => {
    try {
      const response = await fetch('/api/consultations/cross-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consultationData)
      });
      
      const consultation = await response.json();
      dispatch({ type: 'ADD_CROSS_SITE_CONSULTATION', payload: consultation });
    } catch (error) {
      console.error('Error requesting consultation:', error);
      throw error;
    }
  }, []);

  // Get accessible patients
  const getAccessiblePatients = useCallback(async (filters?: any): Promise<MultiSitePatientProfile[]> => {
    const { patients } = await multiSiteAccessService.getAccessiblePatients(filters);
    return patients;
  }, []);

  // Legacy compatibility methods
  const updatePatientData = useCallback((data: Partial<PatientProfile>) => {
    dispatch({ type: 'UPDATE_PATIENT_DATA', payload: data });
  }, []);

  const addAlert = useCallback((alert: ClinicalAlert) => {
    dispatch({ type: 'ADD_ALERT', payload: alert });
  }, []);

  const acknowledgeAlert = useCallback((alertId: string, userId: string) => {
    dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: { alertId, userId } });
  }, []);

  const startSession = useCallback((session: ClinicalSession) => {
    dispatch({ type: 'START_SESSION', payload: session });
  }, []);

  const endSession = useCallback((sessionId: string) => {
    dispatch({ type: 'END_SESSION', payload: sessionId });
  }, []);

  return (
    <MultiSitePatientContext.Provider value={{
      state,
      dispatch,
      selectPatient,
      checkPatientAccess,
      switchSiteContext,
      createCrossSiteReferral,
      requestConsultation,
      getAccessiblePatients,
      updatePatientData,
      addAlert,
      acknowledgeAlert,
      startSession,
      endSession,
    }}>
      {children}
    </MultiSitePatientContext.Provider>
  );
}

// Hook to use the multi-site patient context
export function useMultiSitePatient() {
  const context = useContext(MultiSitePatientContext);
  if (!context) {
    throw new Error('useMultiSitePatient must be used within a MultiSitePatientProvider');
  }
  return context;
}

// Backward compatibility hook that maps to legacy PatientContext interface
export function usePatient() {
  const multiSiteContext = useMultiSitePatient();
  
  // Map multi-site state to legacy interface
  return {
    state: {
      currentPatient: multiSiteContext.state.currentPatient,
      recentPatients: multiSiteContext.state.recentPatients,
      alerts: multiSiteContext.state.alerts,
      activeSessions: multiSiteContext.state.activeSessions,
      isLoading: multiSiteContext.state.isLoading,
      error: multiSiteContext.state.error,
      lastSaveOffline: multiSiteContext.state.lastSaveOffline,
      offlineNote: multiSiteContext.state.offlineNote,
      showOfflineBanner: multiSiteContext.state.showOfflineBanner,
      hydrated: multiSiteContext.state.hydrated,
    },
    dispatch: multiSiteContext.dispatch,
    updatePatientData: multiSiteContext.updatePatientData,
    addAlert: multiSiteContext.addAlert,
    acknowledgeAlert: multiSiteContext.acknowledgeAlert,
    startSession: multiSiteContext.startSession,
    endSession: multiSiteContext.endSession,
  };
}