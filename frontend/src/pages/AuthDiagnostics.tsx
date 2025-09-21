import React, { useEffect, useState } from 'react';
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
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [claims, setClaims] = useState<any | null>(null);
  const [serverVerify, setServerVerify] = useState<VerifyResult | null>(null);
  const [profileRow, setProfileRow] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || null;
      setSessionToken(token);
      setClaims(decodeJwt(token));

      // Server verification
      if (token) {
        try {
          const res = await fetch('/api/supabase-auth/verify', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const body = await res.json().catch(() => ({}));
          setServerVerify({ ok: res.ok, status: res.status, body });
        } catch (e: any) {
          setServerVerify({ ok: false, status: 0, error: e?.message || 'Network error' });
        }
      } else {
        setServerVerify({ ok: false, status: 401, error: 'No session token' });
      }

      // Profile presence
      if (session?.user?.id) {
        const { data } = await supabase
          .from('users')
          .select('id,email,first_name,last_name,role,created_at')
          .eq('id', session.user.id)
          .maybeSingle();
        setProfileRow(data || null);
      } else {
        setProfileRow(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
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

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Auth Diagnostics</h1>
      <p className="text-sm text-gray-600 mb-6">View current Supabase session, verify with backend, and confirm profile row.</p>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded p-4">
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
          {profileRow ? (
            <pre className="bg-gray-50 border rounded p-2 overflow-auto text-xs">
{JSON.stringify(profileRow, null, 2)}
            </pre>
          ) : (
            <div className="text-sm text-yellow-700">No profile row found for current user.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthDiagnostics;

