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
          console.log('✅ OAuth callback successful, redirecting to dashboard');
          // Give a moment for the auth context to update
          setTimeout(() => {
            navigate('/', { replace: true });
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
          <p className="text-gray-600">
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
          <p className="text-sm text-gray-500">
            You will be redirected to the sign-in page in a few seconds.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;