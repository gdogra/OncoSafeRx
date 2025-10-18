import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type VerifyResult = {
  ok: boolean;
  status: number;
  body?: any;
  error?: string;
};

function decodeJwt(token: string | null): any | null {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const json = atob(padded);
    return JSON.parse(json);
  } catch (_e) {
    return null;
  }
}

const AuthDiagnostics: React.FC = () => {
  const { state: authState } = useAuth();
  const navigate = useNavigate();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [claims, setClaims] = useState<any | null>(null);
  const [serverVerify, setServerVerify] = useState<VerifyResult | null>(null);
  const [profileRow, setProfileRow] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [configCheck, setConfigCheck] = useState<any | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionMsg, setSessionMsg] = useState<string | null>(null);

  const withTimeout = async <T,>(p: Promise<T>, ms: number): Promise<T> => {
    return await Promise.race<T>([
      p,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)) as Promise<T>,
    ]);
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const { data: { session }, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) setSessionError(sessErr.message);
      const token = session?.access_token || null;
      setSessionToken(token);
      setClaims(decodeJwt(token));

      // Server verification (always call, include token if available)
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch('/api/supabase-auth/verify', { headers });
        const body = await res.json().catch(() => ({}));
        setServerVerify({ ok: res.ok, status: res.status, body });
      } catch (e: any) {
        setServerVerify({ ok: false, status: 0, error: e?.message || 'Network error' });
      }

      // Profile presence
      setProfileError(null);
      if (session?.user?.id) {
        try {
          // Prefer richer selection; fall back to minimal if columns missing
          let q: any = supabase.from('users').select('id,email,role,full_name,first_name,last_name,specialty,institution,license_number,years_experience,preferences,persona,created_at,updated_at').eq('id', session.user.id).maybeSingle();
          let result: any = await withTimeout(q, 4000);
          if (result?.error && /column/i.test(result.error.message)) {
            q = supabase.from('users').select('id,email,role,full_name').eq('id', session.user.id).maybeSingle();
            result = await withTimeout(q, 4000);
          }
          if (result?.error) {
            setProfileError(result.error.message || 'Profile query error');
          }
          setProfileRow(result?.data || null);
        } catch (e: any) {
          setProfileError(e?.message === 'timeout' ? 'Profile query timed out' : (e?.message || 'Network error'));
          setProfileRow(null);
        }
      } else {
        setProfileRow(null);
      }

      // Server config check
      try {
        const configRes = await fetch('/api/config/check');
        const configData = await configRes.json();
        setConfigCheck(configData);
        setConfigError(null);
      } catch (e: any) {
        setConfigError(e?.message || 'Failed to fetch server config');
        setConfigCheck(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => { if (!cancelled) setLoading(false); }, 2500);
    refresh().catch(() => setLoading(false));
    return () => { cancelled = true; clearTimeout(t); };
  }, []);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  const exp = claims?.exp ? new Date(claims.exp * 1000) : null;
  const now = new Date();
  const secondsLeft = exp ? Math.max(0, Math.floor((exp.getTime() - now.getTime()) / 1000)) : null;

  const createDemoSession = async () => {
    setSessionLoading(true);
    setSessionMsg(null);
    try {
      const resp = await fetch('/api/supabase-auth/demo/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const body = await resp.json();
      if (!resp.ok) {
        setSessionMsg(body?.error || 'Failed to create session');
        return;
      }
      
      // Store the session in localStorage to simulate Supabase session
      localStorage.setItem('sb-emfrwckxctyarphjvfeu-auth-token', JSON.stringify({
        access_token: body.session.access_token,
        refresh_token: 'dev-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: body.session.user
      }));
      
      setSessionMsg('Demo session created! You can now create patients with proper user association.');
      await refresh();
    } catch (e: any) {
      setSessionMsg(e?.message || 'Session creation failed');
    } finally {
      setSessionLoading(false);
    }
  };

  const createDemoProfile = async () => {
    setCreateMsg(null);
    setCreateLoading(true);
    try {
      // Try client-side if session exists, else hit server demo endpoint
      const { data: userRes } = await supabase.auth.getUser();
      const email = authState.user?.email || userRes?.user?.email || 'user@example.com';
      const role = (authState.user?.role as any) || 'oncologist';
      const first = (authState.user?.firstName) || (userRes?.user?.user_metadata?.first_name) || (email.split('@')[0]);
      const last = (authState.user?.lastName) || (userRes?.user?.user_metadata?.last_name) || 'User';

      if (userRes?.user?.id) {
        const { error: upErr } = await supabase
          .from('users')
          .upsert({ id: userRes.user.id, email, first_name: first, last_name: last, role, created_at: new Date().toISOString() }, { onConflict: 'id' });
        if (upErr) {
          setCreateMsg(`Failed to create profile: ${upErr.message}`);
          return;
        }
        setCreateMsg('Demo profile created/updated successfully.');
        await refresh();
      } else {
        const id = crypto.randomUUID(); // proper UUID for demo profile
        const resp = await fetch('/api/supabase-auth/demo/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, email, role, first_name: first, last_name: last })
        });
        const body = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          setCreateMsg(body?.error || 'Server demo profile creation failed');
          return;
        }
        setCreateMsg('Demo profile created on server.');
        await refresh();
      }
    } catch (e: any) {
      setCreateMsg(e?.message || 'Unexpected error while creating profile');
    } finally {
      setCreateLoading(false);
    }
  };

  const deleteDemoProfile = async () => {
    if (!profileRow?.id) return;
    if (!confirm('Delete this demo profile row?')) return;
    setDeleteMsg(null);
    setDeleteLoading(true);
    try {
      // Try client-side if session id matches
      const { data: userRes } = await supabase.auth.getUser();
      if (userRes?.user?.id === profileRow.id) {
        const { error } = await supabase.from('users').delete().eq('id', profileRow.id);
        if (error) {
          setDeleteMsg(`Failed to delete: ${error.message}`);
        } else {
          setDeleteMsg('Profile row deleted.');
          await refresh();
        }
      } else {
        const resp = await fetch(`/api/supabase-auth/demo/profile/${encodeURIComponent(profileRow.id)}`, { method: 'DELETE' });
        const body = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          setDeleteMsg(body?.error || 'Server deletion failed');
        } else {
          setDeleteMsg('Profile row deleted on server.');
          await refresh();
        }
      }
    } catch (e: any) {
      setDeleteMsg(e?.message || 'Unexpected error while deleting profile');
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetToDemoUser = async () => {
    setResetMsg(null);
    setResetLoading(true);
    try {
      // Prefer real auth user id if present; fall back to stable dev id
      const { data: userRes } = await supabase.auth.getUser();
      const authId = userRes?.user?.id || profileRow?.id || 'dev-demo-user';
      const email = authState.user?.email || userRes?.user?.email || 'test@example.local';
      const role = (authState.user?.role as any) || 'oncologist';
      const first = 'Demo';
      const last = 'Clinician';

      const resp = await fetch('/api/supabase-auth/demo/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: authId, email, role, first_name: first, last_name: last, updateAuth: !!userRes?.user?.id })
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setResetMsg(body?.error || 'Reset failed');
      } else {
        setResetMsg('Reset to demo user successful.');
        await refresh();
      }
    } catch (e: any) {
      setResetMsg(e?.message || 'Unexpected error during reset');
    } finally {
      setResetLoading(false);
    }
  };

  const syncAuthToProfile = async () => {
    setSyncMsg(null);
    setSyncLoading(true);
    try {
      const { data: userRes, error } = await supabase.auth.getUser();
      if (error || !userRes?.user) {
        setSyncMsg('Supabase session required to sync from auth.');
        return;
      }
      const u = userRes.user;
      const email = u.email || '';
      const role = (u.user_metadata?.role as any) || 'oncologist';
      const first = (u.user_metadata?.first_name) || 'Demo';
      const last = (u.user_metadata?.last_name) || 'Clinician';

      const { error: upErr } = await supabase
        .from('users')
        .upsert({ id: u.id, email, role, first_name: first, last_name: last, created_at: new Date().toISOString() }, { onConflict: 'id' });
      if (upErr) {
        setSyncMsg(`Sync failed: ${upErr.message}`);
      } else {
        setSyncMsg('Synced auth metadata to profile.');
        await refresh();
      }
    } catch (e: any) {
      setSyncMsg(e?.message || 'Unexpected error during sync');
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Auth Diagnostics</h1>
      <p className="text-sm text-gray-600 mb-6">View current session, verify with backend, and confirm profile row. Dev auth is supported.</p>
      {/* Quick Actions */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(`/auth?next=${encodeURIComponent('/auth-diagnostics')}`)}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Sign in via Supabase
        </button>
        <button
          onClick={() => refresh()}
          className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
        >
          Refresh Session
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded p-4">
          <div className="mb-3 text-xs text-gray-600">
            App auth: {authState.isAuthenticated ? 'Authenticated' : 'Not authenticated'} • User: {authState.user?.email || 'n/a'} • Role: {authState.user?.role || 'n/a'}
            {!sessionToken && (
              <div className="mt-1 text-yellow-700">No Supabase session detected (using app-level auth). This is normal in development bypass.</div>
            )}
          </div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium text-gray-900">Session</h2>
            <div className="flex gap-2">
              <button onClick={refresh} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded">Refresh</button>
              {sessionToken && (
                <button onClick={() => copy(sessionToken)} className="px-3 py-1.5 text-sm bg-gray-100 border rounded">Copy Token</button>
              )}
            </div>
          </div>
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : sessionToken ? (
            <div className="text-sm">
              {sessionError && (
                <div className="mb-2 text-xs text-yellow-700">Session warning: {sessionError}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-gray-500">Subject (sub)</div>
                  <div className="font-medium text-gray-900 break-all">{claims?.sub || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Email</div>
                  <div className="font-medium text-gray-900">{claims?.email || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Expires</div>
                  <div className="font-medium text-gray-900">{exp?.toISOString() || '—'} {secondsLeft !== null && `(in ${secondsLeft}s)`}</div>
                </div>
                <div>
                  <div className="text-gray-500">Issuer</div>
                  <div className="font-medium text-gray-900 break-all">{claims?.iss || '—'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-red-700">No active session</div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Backend Verification</h2>
          {serverVerify ? (
            <div className="text-sm">
              <div className="mb-1">Status: <span className={serverVerify.ok ? 'text-green-700' : 'text-red-700'}>{serverVerify.ok ? 'OK' : 'Failed'}</span> ({serverVerify.status})</div>
              {serverVerify.body && (
                <pre className="bg-gray-50 border rounded p-2 overflow-auto text-xs">
{JSON.stringify(serverVerify.body, null, 2)}
                </pre>
              )}
              {serverVerify.error && <div className="text-red-700">{serverVerify.error}</div>}
            </div>
          ) : (
            <div className="text-sm text-gray-500">Waiting…</div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Profile Row (public.users)</h2>
          {profileError && (
            <div className="mb-2 text-sm text-yellow-700">{profileError}</div>
          )}
          {profileRow ? (
            <>
            <pre className="bg-gray-50 border rounded p-2 overflow-auto text-xs">
{JSON.stringify(profileRow, null, 2)}
            </pre>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button onClick={syncAuthToProfile} disabled={syncLoading} className="px-3 py-1.5 text-sm bg-gray-100 border rounded disabled:opacity-50">
                {syncLoading ? 'Syncing…' : 'Sync Auth Metadata to Profile'}
              </button>
              <button onClick={resetToDemoUser} disabled={resetLoading} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded disabled:opacity-50">
                {resetLoading ? 'Resetting…' : 'Reset to Demo User'}
              </button>
              <button onClick={deleteDemoProfile} disabled={deleteLoading} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded disabled:opacity-50">
                {deleteLoading ? 'Deleting…' : 'Delete Demo Profile Row'}
              </button>
              {(syncMsg || resetMsg || deleteMsg) && <div className="text-xs text-gray-600">{syncMsg || resetMsg || deleteMsg}</div>}
            </div>
            </>
          ) : (
            <div>
              <div className="text-sm text-yellow-700 mb-3">No profile row found for current user.</div>
              <div className="flex items-center gap-2">
                <button onClick={syncAuthToProfile} disabled={syncLoading || !sessionToken} className="px-3 py-1.5 text-sm bg-gray-100 border rounded disabled:opacity-50" title={!sessionToken ? 'Requires Supabase session' : ''}>
                  {syncLoading ? 'Syncing…' : 'Sync Auth Metadata to Profile'}
                </button>
                <button onClick={resetToDemoUser} disabled={resetLoading} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded disabled:opacity-50">
                  {resetLoading ? 'Resetting…' : 'Reset to Demo User'}
                </button>
                <button onClick={createDemoProfile} disabled={createLoading} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded disabled:opacity-50">
                  {createLoading ? 'Creating…' : 'Create Demo Profile Row'}
                </button>
                <button onClick={createDemoSession} disabled={sessionLoading} className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded disabled:opacity-50">
                  {sessionLoading ? 'Creating…' : 'Create Auth Session'}
                </button>
                {(syncMsg || resetMsg || createMsg || sessionMsg) && <div className="text-xs text-gray-600">{syncMsg || resetMsg || createMsg || sessionMsg}</div>}
              </div>
              {!sessionToken && (
                <div className="mt-2 text-xs text-gray-500">Tip: No Supabase session detected. The server demo endpoint will be used to insert a profile row (dev-only).</div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Server Config Check</h2>
          {configError && <div className="text-sm text-red-700">{configError}</div>}
          {configCheck ? (
            <div className="text-sm text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <div className="font-medium">Supabase</div>
                <div>Enabled: {String(configCheck.supabase?.enabled)}</div>
                <div>URL present: {String(configCheck.supabase?.urlPresent)}</div>
                <div>Service role present: {String(configCheck.supabase?.serviceRolePresent)}</div>
                <div>JWT secret present: {String(configCheck.supabase?.jwtSecretPresent)}</div>
              </div>
              <div>
                <div className="font-medium">Deploy Integrations</div>
                <div>Netlify configured: {String(configCheck.netlify?.configured)}</div>
                <div>Render configured: {String(configCheck.render?.configured)}</div>
              </div>
              {configCheck.warnings?.length > 0 && (
                <div className="md:col-span-2 text-xs text-yellow-700">Warnings: {configCheck.warnings.join(', ')}</div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">Loading…</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthDiagnostics;
