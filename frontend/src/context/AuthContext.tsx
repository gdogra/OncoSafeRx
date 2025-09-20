import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { UserProfile, AuthState, SignupData, LoginData, UserPersona } from '../types/user';
import { getRoleConfig } from '../utils/roleConfig';
import { SupabaseAuthService } from '../services/authService';

interface AuthActions {
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  switchPersona: (persona: UserPersona) => Promise<void>;
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

// Use Supabase authentication service
const AuthService = SupabaseAuthService;

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

    updateProfile: async (updates: Partial<UserProfile>) => {
      if (!state.user) return;
      
      try {
        const updatedUser = await AuthService.updateProfile(state.user.id, updates);
        dispatch({ type: 'UPDATE_PROFILE', payload: updates });
      } catch (error) {
        dispatch({ type: 'AUTH_FAILURE', payload: 'Failed to update profile' });
      }
    },

    switchPersona: async (persona: UserPersona) => {
      if (!state.user) return;
      
      try {
        await AuthService.updateProfile(state.user.id, { persona });
        dispatch({ type: 'SWITCH_PERSONA', payload: persona });
      } catch (error) {
        dispatch({ type: 'AUTH_FAILURE', payload: 'Failed to update persona' });
      }
    },

    setError: (error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },
  };

  // Check for existing user on mount and set up auth state listener
  useEffect(() => {
    let mounted = true;

    // Check for current session
    const checkCurrentUser = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        if (mounted && user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        }
      } catch (error) {
        console.error('Error checking current user:', error);
      }
    };

    checkCurrentUser();

    // Set up auth state listener
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      if (mounted) {
        if (user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
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