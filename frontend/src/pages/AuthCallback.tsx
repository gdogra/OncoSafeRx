import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SupabaseAuthService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { actions } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔍 OAuth callback processing...');
        
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

          // Detect "new" Google users who haven't picked a role yet.
          // A user is considered "new" when their Supabase user_metadata has
          // no role AND they haven't been assigned one from the DB. In that
          // case buildUserProfile falls back to a generic default — we want
          // to explicitly prompt for role selection before proceeding.
          const { supabase } = await import('../lib/supabase');
          const { data: sess } = await supabase.auth.getSession();
          const u = sess.session?.user;
          const metadataRole = u?.user_metadata?.role;
          const provider = u?.app_metadata?.provider;
          const isOAuthSignup = provider === 'google' || provider === 'github';

          // Check the users table for an existing role
          let dbRole: string | null = null;
          if (u?.id) {
            try {
              const { data: dbUser } = await supabase
                .from('users')
                .select('role')
                .eq('id', u.id)
                .maybeSingle();
              dbRole = (dbUser as any)?.role || null;
            } catch { /* non-blocking */ }
          }

          const needsRoleSelection = isOAuthSignup && !metadataRole && !dbRole;

          setTimeout(() => {
            if (needsRoleSelection) {
              console.log('🆕 New OAuth user — prompting for role selection');
              navigate('/auth/select-role', { replace: true });
            } else {
              console.log('✅ Existing role detected, redirecting to dashboard');
              navigate('/', { replace: true });
            }
          }, 100);
        } else {
          console.warn('⚠️ No user profile returned from OAuth callback');
          setError('Authentication failed. Please try again.');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('❌ OAuth callback error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

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