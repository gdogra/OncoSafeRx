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
    const settle = async (user: any | null, fail?: string) => {
      if (settled) return;
      settled = true;

      if (fail || !user) {
        setError(fail || 'Sign-in failed. Please try again.');
        return;
      }

      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        window.history.replaceState({}, '', url.pathname + (url.search || '') + url.hash);
      } catch {}

      const metadataRole = user.user_metadata?.role;
      const provider = user.app_metadata?.provider;
      const isOAuthSignup = provider === 'google' || provider === 'github';
      const metadataHasRole =
        typeof metadataRole === 'string' && VALID_ROLES.has(metadataRole);

      // Returning signin path: if metadata is missing the role but
      // public.users already has one (from a prior signup before
      // metadata writes were consistent), use that and back-fill
      // metadata so the next signin is fast. Only OAuth users go
      // through this — email signups already write metadata at signup.
      let hasValidRole = metadataHasRole;
      if (isOAuthSignup && !metadataHasRole) {
        try {
          const { data: row } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
          const dbRole = (row as any)?.role;
          if (typeof dbRole === 'string' && VALID_ROLES.has(dbRole)) {
            console.log('↩️ Backfilling user_metadata.role from public.users:', dbRole);
            // Best-effort metadata sync — don't block the redirect on it
            supabase.auth.updateUser({ data: { role: dbRole } }).catch(() => {});
            hasValidRole = true;
          }
        } catch (err) {
          console.warn('public.users role lookup failed, defaulting to select-role flow:', err);
        }
      }

      if (isOAuthSignup && !hasValidRole) {
        console.log('🆕 OAuth user needs role selection', { metadataRole, provider });
        navigate('/auth/select-role', { replace: true });
      } else {
        console.log('✅ Session ready, redirecting to dashboard');
        setTimeout(() => navigate('/', { replace: true }), 200);
      }
    };

    const withTimeout = <T,>(p: Promise<T>, ms: number, label: string): Promise<T> =>
      Promise.race([
        p,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)),
      ]);

    // Absolute ceiling for the whole callback
    const ceiling = setTimeout(() => {
      if (!settled) settle(null, 'Sign-in timed out. Please try again.');
    }, 30000);

    const directExchange = async (code: string): Promise<any> => {
      const su = ((import.meta as any)?.env?.VITE_SUPABASE_URL as string || '').trim();
      const sk = ((import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string || '').trim();
      if (!su || !sk) throw new Error('Supabase env missing for direct exchange');

      // PKCE verifier is stored by supabase-js under a key derived from the project ref
      let verifier = '';
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i) || '';
          if (k.endsWith('-code-verifier')) {
            verifier = localStorage.getItem(k) || '';
            if (verifier) break;
          }
        }
      } catch {}
      if (!verifier) throw new Error('PKCE code_verifier missing from storage');

      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 20000);
      try {
        const resp = await fetch(`${su}/auth/v1/token?grant_type=pkce`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: sk,
            Authorization: `Bearer ${sk}`,
          },
          body: JSON.stringify({ auth_code: code, code_verifier: verifier }),
          signal: ctrl.signal,
        });
        const body = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(body?.error_description || body?.msg || `token exchange ${resp.status}`);
        return body;
      } finally {
        clearTimeout(timer);
      }
    };

    // Race SIGNED_IN event against getSession polling — whichever fires
    // first wins. On implicit flow, detectSessionInUrl auto-consumes the
    // hash and fires SIGNED_IN within a few hundred ms, which is more
    // reliable than waiting for getSession to serialize behind the
    // client's internal init work.
    const authSub = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && !settled) {
        console.log('🔔 onAuthStateChange: SIGNED_IN detected');
        settle(session.user);
      }
    });

    (async () => {
      const code = searchParams.get('code');
      try {
        // PKCE path — only hit when URL actually has ?code=
        if (code) {
          console.log('🔐 Exchanging OAuth code for session (SDK)…');
          try {
            const { data, error } = await withTimeout(
              supabase.auth.exchangeCodeForSession(code),
              12000,
              'exchangeCodeForSession'
            ) as any;
            if (error) throw error;
            if (data?.session?.user) {
              console.log('✅ SDK exchange succeeded');
              settle(data.session.user);
              return;
            }
          } catch (sdkErr: any) {
            console.warn('⚠️ SDK exchange failed, trying direct fetch:', sdkErr?.message);
            const tokens = await directExchange(code);
            if (tokens?.access_token) {
              console.log('✅ Direct exchange succeeded, seeding session');
              const { data: setData, error: setErr } = await withTimeout(
                supabase.auth.setSession({
                  access_token: tokens.access_token,
                  refresh_token: tokens.refresh_token,
                }),
                8000,
                'setSession'
              ) as any;
              if (setErr) throw setErr;
              const user = setData?.session?.user || tokens.user;
              if (user) {
                settle(user);
                return;
              }
            }
            throw sdkErr;
          }
        }

        // Implicit flow / hash path: poll getSession with retries. Each
        // call has a 5s timeout, but we retry up to ~25s so we don't
        // fail just because the first call serialized behind the SDK's
        // hash consumption. SIGNED_IN listener above will shortcut us
        // out the moment the session is ready.
        const deadline = Date.now() + 25_000;
        while (!settled && Date.now() < deadline) {
          try {
            const { data } = await withTimeout(
              supabase.auth.getSession(),
              5000,
              'getSession'
            ) as any;
            if (data?.session?.user) {
              settle(data.session.user);
              return;
            }
          } catch (err: any) {
            // Timeout on one attempt is expected while the hash is still
            // being consumed — log and retry rather than failing.
            console.log(`getSession attempt timed out (${err?.message || 'unknown'}) — retrying`);
          }
          await new Promise(r => setTimeout(r, 500));
        }

        if (!settled) {
          settle(null, 'No session established. Please try again.');
        }
      } catch (e: any) {
        console.error('❌ OAuth callback error:', e);
        settle(null, e?.message || 'Authentication failed');
      }
    })();

    return () => {
      settled = true;
      clearTimeout(ceiling);
      authSub?.data?.subscription?.unsubscribe?.();
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
