import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * Minimal OAuth callback handler.
 *
 * With `detectSessionInUrl: true` in the Supabase client, the SDK
 * auto-exchanges the ?code= param during client initialization — we
 * only need to wait for the session to appear and then redirect.
 *
 * We avoid calling into SupabaseAuthService.handleOAuthCallback() /
 * buildUserProfile() here because those do multiple DB/REST lookups
 * that can hang for brand-new users.
 */
const VALID_ROLES = new Set([
  'patient', 'caregiver', 'oncologist', 'pharmacist',
  'nurse', 'researcher', 'student', 'admin', 'super_admin'
]);

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    console.log('🔍 OAuth callback mounted', {
      hasCode: !!searchParams.get('code'),
      hasHash: !!window.location.hash,
      url: window.location.pathname + window.location.search,
    });

    // Surface Google-side errors from the redirect URL
    const errorParam = searchParams.get('error');
    if (errorParam) {
      console.error('OAuth error from URL params:', errorParam);
      setError(searchParams.get('error_description') || errorParam);
      return;
    }

    let settled = false;
    const settle = (user: any | null, fail?: string) => {
      if (settled) return;
      settled = true;

      if (fail || !user) {
        setError(fail || 'Sign-in failed. Please try again.');
        return;
      }

      // Strip ?code/?state so refresh doesn't re-exchange
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        window.history.replaceState({}, '', url.pathname + (url.search || '') + url.hash);
      } catch {}

      const metadataRole = user.user_metadata?.role;
      const provider = user.app_metadata?.provider;
      const isOAuthSignup = provider === 'google' || provider === 'github';
      const hasValidRole = typeof metadataRole === 'string' && VALID_ROLES.has(metadataRole);

      if (isOAuthSignup && !hasValidRole) {
        console.log('🆕 OAuth user needs role selection', { metadataRole, provider });
        navigate('/auth/select-role', { replace: true });
      } else {
        console.log('✅ Session ready, redirecting to dashboard');
        setTimeout(() => navigate('/', { replace: true }), 200);
      }
    };

    // 1) Listen for SIGNED_IN — fires when SDK finishes auto-exchange
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 onAuthStateChange:', event, !!session?.user);
      if (event === 'SIGNED_IN' && session?.user) {
        settle(session.user);
      }
    });

    // 2) Also poll getSession() in case the event fired before we subscribed
    (async () => {
      const deadline = Date.now() + 8000;
      while (!settled && Date.now() < deadline) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            settle(data.session.user);
            return;
          }
        } catch (e) {
          console.warn('getSession poll error:', e);
        }
        await new Promise(r => setTimeout(r, 300));
      }
      if (!settled) settle(null, 'Sign-in timed out. Please try again.');
    })();

    return () => {
      settled = true;
      sub?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => navigate('/auth', { replace: true }), 3000);
      return () => clearTimeout(timer);
    }
  }, [error, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to sign-in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign-in…</h2>
        <p className="text-gray-600">One moment while we finish setting up your account.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
