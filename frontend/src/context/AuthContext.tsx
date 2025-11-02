import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { UserProfile, AuthState, SignupData, LoginData, UserPersona } from '../types/user';
import { getRoleConfig } from '../utils/roleConfig';
import { SupabaseAuthService } from '../services/authService';

interface AuthActions {
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
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
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'AUTH_INITIALIZED' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading until initialization is complete
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
    case 'AUTH_INITIALIZED':
      return { ...state, isLoading: false };
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
      
      // Remove aggressive UI timeout; rely on service-level timeouts/fallbacks
      // Keep a soft watchdog for logging only (no user-facing error)
      const loginWatchdog = setTimeout(() => {
        console.log('⏰ Notice: Login taking longer than expected...');
      }, 10000);
      
      try {
        const user = await SupabaseAuthService.login(data);
        clearTimeout(loginWatchdog);
        console.log('AuthContext: Login successful, user:', user);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } catch (error) {
        clearTimeout(loginWatchdog);
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

    signInWithGoogle: async () => {
      console.log('AuthContext: Starting Google OAuth sign-in');
      dispatch({ type: 'AUTH_START' });
      try {
        await SupabaseAuthService.signInWithGoogle();
        // Note: OAuth redirects to callback page, so we don't dispatch success here
        // The success will be handled after the OAuth redirect in handleOAuthCallback
      } catch (error) {
        console.error('AuthContext: Google OAuth failed:', error);
        dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Google sign-in failed' });
        throw error;
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

    // Detect hard refresh and clear auth if needed - DISABLED FOR PRODUCTION STABILITY
    const detectHardRefresh = () => {
      // TEMPORARILY DISABLE hard refresh detection due to production authentication issues
      // The detection was too aggressive and clearing auth on normal page loads
      
      console.log('⚠️ Hard refresh detection DISABLED for production stability');
      
      // Set session flag for tracking but don't clear auth
      sessionStorage.setItem('osrx_session_active', 'true');
      
      // Always return false to preserve authentication
      return false;
      
      /* ORIGINAL LOGIC COMMENTED OUT FOR SAFETY:
      
      let isHardRefresh = false;
      
      try {
        const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
        if (navigationEntry?.type === 'reload') {
          isHardRefresh = true;
        }
      } catch (e) {
        try {
          if (performance.navigation && performance.navigation.type === 1) {
            isHardRefresh = true;
          }
        } catch (e2) {
          console.log('Navigation API not available');
        }
      }
      
      const sessionFlag = sessionStorage.getItem('osrx_session_active');
      if (!sessionFlag) {
        isHardRefresh = true;
      }
      
      if (isHardRefresh) {
        console.log('🔄 Hard refresh detected - clearing authentication state');
        SupabaseAuthService.logout();
        localStorage.removeItem('osrx_session_user_id');
        localStorage.removeItem('osrx_last_path');
        sessionStorage.clear();
        sessionStorage.setItem('osrx_session_active', 'true');
        return true;
      }
      
      sessionStorage.setItem('osrx_session_active', 'true');
      return false;
      
      */
    };

    // Failsafe timeout to prevent infinite loading - increased for better auth restoration
    const failsafeTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('🚨 AuthContext: Failsafe timeout triggered after 15 seconds - forcing initialization complete');
        dispatch({ type: 'AUTH_INITIALIZED' });
      }
    }, 15000); // 15 second timeout for production auth restoration

    // Check for current session
    const checkCurrentUser = async () => {
      try {
        // First check if this was a hard refresh
        if (detectHardRefresh()) {
          console.log('🚫 AuthContext: Hard refresh detected - skipping session restoration');
          if (mounted) {
            clearTimeout(failsafeTimeout);
            dispatch({ type: 'AUTH_INITIALIZED' });
          }
          return;
        }

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
      } finally {
        // Always mark as initialized, even if there's no user
        if (mounted) {
          clearTimeout(failsafeTimeout);
          dispatch({ type: 'AUTH_INITIALIZED' });
        }
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
      clearTimeout(failsafeTimeout);
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
