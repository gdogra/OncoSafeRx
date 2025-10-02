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
  console.log('AuthReducer: Action received:', action.type, action);
  switch (action.type) {
    case 'AUTH_START':
      console.log('AuthReducer: Starting authentication...');
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      console.log('AuthReducer: Authentication successful, user:', action.payload);
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      console.log('AuthReducer: Authentication failed:', action.payload);
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

// AuthService is imported as alias from SupabaseAuthService

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const actions: AuthActions = {
    login: async (data: LoginData) => {
      console.log('AuthContext: Starting login for', data.email);
      dispatch({ type: 'AUTH_START' });
      
      // Critical UI-level timeout to prevent infinite spinning (extended for JWT parsing)
      const loginTimeout = setTimeout(() => {
        console.log('🛑 CRITICAL: Login exceeded 15 seconds - forcing failure');
        dispatch({ type: 'AUTH_FAILURE', payload: 'Login timeout - please try again' });
      }, 15000);
      
      try {
        const user = await SupabaseAuthService.login(data);
        clearTimeout(loginTimeout);
        console.log('AuthContext: Login successful, user:', user);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } catch (error) {
        clearTimeout(loginTimeout);
        console.error('AuthContext: Login failed:', error);
        console.error('AuthContext: Login error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          type: typeof error,
          error
        });
        dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Login failed' });
        throw error; // Re-throw so the component can handle it
      }
    },

    signup: async (data: SignupData) => {
      dispatch({ type: 'AUTH_START' });
      try {
        const user = await SupabaseAuthService.signup(data);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } catch (error) {
        console.error('AuthContext: Signup failed:', error);
        dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Signup failed' });
        throw error; // Re-throw so the component can handle it
      }
    },

    logout: () => {
      SupabaseAuthService.logout();
      dispatch({ type: 'AUTH_LOGOUT' });
    },

    updateProfile: async (updates: Partial<UserProfile>) => {
      console.log('🔧 SIMPLE AuthContext.updateProfile called with:', updates);
      
      try {
        // Get or create user ID
        const userId = state.user?.id || localStorage.getItem('osrx_session_user_id') || `user-${Date.now()}`;
        if (!state.user) {
          localStorage.setItem('osrx_session_user_id', userId);
        }
        
        // Update profile using simple service
        const updatedUser = await SupabaseAuthService.updateProfile(userId, updates);
        
        // Update state
        if (state.user) {
          dispatch({ type: 'UPDATE_PROFILE', payload: updates });
        } else {
          dispatch({ type: 'AUTH_SUCCESS', payload: updatedUser });
        }
        
        console.log('✅ SIMPLE: Profile update completed successfully');
      } catch (error) {
        console.error('❌ SIMPLE: Profile update failed:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update profile' });
      }
    },

    switchPersona: async (persona: UserPersona) => {
      if (!state.user) return;
      
      try {
        await SupabaseAuthService.updateProfile(state.user.id, { persona });
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
        console.log('🔍 AuthContext: Checking for existing user session...');
        const user = await SupabaseAuthService.getCurrentUser();
        if (mounted && user) {
          console.log('✅ AuthContext: Restored user session on page load:', { id: user.id, email: user.email });
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } else {
          console.log('🚫 AuthContext: No existing user session found');
        }
      } catch (error) {
        console.error('❌ AuthContext: Error checking current user:', error);
      }
    };

    checkCurrentUser();

    // Set up auth state listener
    const { data: { subscription } } = SupabaseAuthService.onAuthStateChange((user) => {
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