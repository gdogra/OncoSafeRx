import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { UserProfile, AuthState, SignupData, LoginData, UserPersona } from '../types/user';
import { getRoleConfig } from '../utils/roleConfig';

interface AuthActions {
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  switchPersona: (persona: UserPersona) => void;
  setError: (error: string | null) => void;
}

interface AuthContextType {
  state: AuthState;
  actions: AuthActions;
  roleConfig: ReturnType<typeof getRoleConfig> | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: UserProfile }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'SWITCH_PERSONA'; payload: UserPersona }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'SWITCH_PERSONA':
      return {
        ...state,
        user: state.user ? { ...state.user, persona: action.payload } : null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// Mock authentication service - replace with real API calls
class AuthService {
  static async login(data: LoginData): Promise<UserProfile> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data
    const mockUser: UserProfile = {
      id: 'user-123',
      email: data.email,
      firstName: 'Dr. Sarah',
      lastName: 'Chen',
      role: 'oncologist', // Default role, can be changed
      specialty: 'Medical Oncology',
      institution: 'Memorial Cancer Center',
      licenseNumber: 'MD123456',
      yearsExperience: 8,
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          criticalAlerts: true,
          weeklyReports: false,
        },
        dashboard: {
          defaultView: 'overview',
          refreshInterval: 5000,
          compactMode: false,
        },
        clinical: {
          showGenomicsByDefault: true,
          autoCalculateDosing: true,
          requireInteractionAck: true,
          showPatientPhotos: false,
        },
      },
      persona: {
        id: 'persona-1',
        name: 'Experienced Oncologist',
        description: 'Senior medical oncologist with focus on precision medicine',
        role: 'oncologist',
        experienceLevel: 'expert',
        specialties: ['breast cancer', 'lung cancer', 'precision medicine'],
        preferences: {
          riskTolerance: 'moderate',
          alertSensitivity: 'medium',
          workflowStyle: 'thorough',
          decisionSupport: 'consultative',
        },
        customSettings: {},
      },
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: new Date().toISOString(),
      isActive: true,
    };

    localStorage.setItem('oncosafe_user', JSON.stringify(mockUser));
    return mockUser;
  }

  static async signup(data: SignupData): Promise<UserProfile> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      specialty: data.specialty,
      institution: data.institution,
      licenseNumber: data.licenseNumber,
      yearsExperience: data.yearsExperience,
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          criticalAlerts: true,
          weeklyReports: true,
        },
        dashboard: {
          defaultView: 'overview',
          refreshInterval: 5000,
          compactMode: false,
        },
        clinical: {
          showGenomicsByDefault: data.role === 'oncologist' || data.role === 'pharmacist',
          autoCalculateDosing: data.role === 'oncologist' || data.role === 'pharmacist',
          requireInteractionAck: true,
          showPatientPhotos: false,
        },
      },
      persona: this.createDefaultPersona(data.role),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
    };

    localStorage.setItem('oncosafe_user', JSON.stringify(newUser));
    return newUser;
  }

  static createDefaultPersona(role: UserProfile['role']): UserPersona {
    const personaConfigs = {
      oncologist: {
        name: 'Medical Oncologist',
        description: 'Comprehensive cancer care specialist',
        experienceLevel: 'expert' as const,
        specialties: ['solid tumors', 'precision medicine'],
        preferences: {
          riskTolerance: 'moderate' as const,
          alertSensitivity: 'medium' as const,
          workflowStyle: 'thorough' as const,
          decisionSupport: 'consultative' as const,
        },
      },
      pharmacist: {
        name: 'Clinical Pharmacist',
        description: 'Medication therapy management specialist',
        experienceLevel: 'expert' as const,
        specialties: ['oncology pharmacy', 'drug interactions'],
        preferences: {
          riskTolerance: 'conservative' as const,
          alertSensitivity: 'high' as const,
          workflowStyle: 'thorough' as const,
          decisionSupport: 'guided' as const,
        },
      },
      nurse: {
        name: 'Oncology Nurse',
        description: 'Direct patient care and medication administration',
        experienceLevel: 'intermediate' as const,
        specialties: ['patient care', 'medication administration'],
        preferences: {
          riskTolerance: 'conservative' as const,
          alertSensitivity: 'high' as const,
          workflowStyle: 'efficient' as const,
          decisionSupport: 'guided' as const,
        },
      },
      researcher: {
        name: 'Clinical Researcher',
        description: 'Cancer research and data analysis specialist',
        experienceLevel: 'expert' as const,
        specialties: ['clinical trials', 'genomics research'],
        preferences: {
          riskTolerance: 'moderate' as const,
          alertSensitivity: 'low' as const,
          workflowStyle: 'collaborative' as const,
          decisionSupport: 'autonomous' as const,
        },
      },
      student: {
        name: 'Healthcare Student',
        description: 'Learning healthcare professional',
        experienceLevel: 'novice' as const,
        specialties: ['general medicine'],
        preferences: {
          riskTolerance: 'conservative' as const,
          alertSensitivity: 'high' as const,
          workflowStyle: 'guided' as const,
          decisionSupport: 'guided' as const,
        },
      },
    };

    const config = personaConfigs[role];
    return {
      id: `persona-${Date.now()}`,
      name: config.name,
      description: config.description,
      role,
      experienceLevel: config.experienceLevel,
      specialties: config.specialties,
      preferences: config.preferences,
      customSettings: {},
    };
  }

  static logout(): void {
    localStorage.removeItem('oncosafe_user');
  }

  static getCurrentUser(): UserProfile | null {
    const stored = localStorage.getItem('oncosafe_user');
    return stored ? JSON.parse(stored) : null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const actions: AuthActions = {
    login: async (data: LoginData) => {
      dispatch({ type: 'AUTH_START' });
      try {
        const user = await AuthService.login(data);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } catch (error) {
        dispatch({ type: 'AUTH_FAILURE', payload: 'Login failed' });
      }
    },

    signup: async (data: SignupData) => {
      dispatch({ type: 'AUTH_START' });
      try {
        const user = await AuthService.signup(data);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } catch (error) {
        dispatch({ type: 'AUTH_FAILURE', payload: 'Signup failed' });
      }
    },

    logout: () => {
      AuthService.logout();
      dispatch({ type: 'AUTH_LOGOUT' });
    },

    updateProfile: (updates: Partial<UserProfile>) => {
      dispatch({ type: 'UPDATE_PROFILE', payload: updates });
      if (state.user) {
        const updatedUser = { ...state.user, ...updates };
        localStorage.setItem('oncosafe_user', JSON.stringify(updatedUser));
      }
    },

    switchPersona: (persona: UserPersona) => {
      dispatch({ type: 'SWITCH_PERSONA', payload: persona });
      if (state.user) {
        const updatedUser = { ...state.user, persona };
        localStorage.setItem('oncosafe_user', JSON.stringify(updatedUser));
      }
    },

    setError: (error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },
  };

  // Check for existing user on mount
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    }
  }, []);

  const roleConfig = state.user ? getRoleConfig(state.user.role) : null;

  return (
    <AuthContext.Provider value={{ state, actions, roleConfig }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};