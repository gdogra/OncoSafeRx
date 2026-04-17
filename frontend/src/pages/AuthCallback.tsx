import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SupabaseAuthService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { actions } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    // React StrictMode runs effects twice in dev; guard against double-exchange
    if (ranRef.current) return;
    ranRef.current = true;

    // Safety net: if anything hangs for >20s, surface a visible error
    const hangTimer = setTimeout(() => {
      console.error('⏱️ OAuth callback timed out after 20s');
      setError('Sign-in is taking too long. Please try again.');
      setIsProcessing(false);
    }, 20_000);

    const handleCallback = async () => {
      try {
        console.log('🔍 OAuth callback processing...', {
          hasCode: !!searchParams.get('code'),
          hasHash: !!window.location.hash,
          url: window.location.pathname + window.location.search,
        });
        
        // Check for error parameters in URL
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          console.error('OAuth error from URL params:', errorParam, errorDescription);
          setError(errorDescription || errorParam);
          setIsProcessing(false);
          return;
        }

        // Handle the OAuth callback
        const userProfile = await SupabaseAuthService.handleOAuthCallback();

        if (userProfile) {
          console.log('✅ OAuth callback successful');

          // Detect "new" OAuth users who haven't picked a valid role yet.
          //
          // A role is considered "valid" only if it's in our supported set.
          // The Supabase DB trigger handle_new_user() auto-inserts new auth
          // users into public.users with role='user' — which is NOT a valid
          // application role. We must treat that as "needs selection".
          const VALID_ROLES = new Set([
            'patient', 'caregiver', 'oncologist', 'pharmacist',
            'nurse', 'researcher', 'student', 'admin', 'super_admin'
          ]);
          const isValidRole = (r: unknown): r is string =>
            typeof r === 'string' && VALID_ROLES.has(r);

          const { supabase } = await import('../lib/supabase');
          const { data: sess } = await supabase.auth.getSession();
          const u = sess.session?.user;
          const metadataRole = u?.user_metadata?.role;
          const provider = u?.app_metadata?.provider;
          const isOAuthSignup = provider === 'google' || provider === 'github';

          // Check the users table for an existing valid role (5s timeout
          // so a slow/blocked RLS query can't stall the whole callback)
          let dbRole: string | null = null;
          if (u?.id) {
            try {
              const query = supabase
                .from('users')
                .select('role')
                .eq('id', u.id)
                .maybeSingle();
              const result: any = await Promise.race([
                query,
                new Promise(resolve => setTimeout(() => resolve({ data: null, timedOut: true }), 5000))
              ]);
              if (result?.timedOut) {
                console.warn('⏱️ users role lookup timed out — treating as no role');
              } else {
                dbRole = (result?.data as any)?.role || null;
              }
            } catch (e) {
              console.warn('users role lookup error (non-blocking):', e);
            }
          }

          // Needs role selection if OAuth signup AND neither source has a
          // *valid* application role (a trigger-inserted 'user' doesn't count)
          const needsRoleSelection =
            isOAuthSignup && !isValidRole(metadataRole) && !isValidRole(dbRole);

          if (needsRoleSelection) {
            console.log('🆕 OAuth user without valid role — prompting for role selection', {
              metadataRole, dbRole
            });
            navigate('/auth/select-role', { replace: true });
          } else {
            console.log('✅ Valid role detected, redirecting to dashboard', {
              metadataRole, dbRole
            });
            // Small delay to let AuthContext's onAuthStateChange listener
            // dispatch AUTH_SUCCESS before ProtectedRoute checks isAuthenticated
            setTimeout(() => navigate('/', { replace: true }), 300);
          }
        } else {
          console.warn('⚠️ No user profile returned from OAuth callback');
          setError('Authentication failed. Please try again.');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('❌ OAuth callback error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        setIsProcessing(false);
      } finally {
        clearTimeout(hangTimer);
      }
    };

    handleCallback();
    return () => { clearTimeout(hangTimer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle errors by redirecting back to auth page
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        navigate('/auth', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, navigate]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Completing sign-in...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we finish setting up your account.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You will be redirected to the sign-in page in a few seconds.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;