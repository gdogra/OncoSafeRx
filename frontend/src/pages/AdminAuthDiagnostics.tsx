import React from 'react';
import Card from '../components/UI/Card';
import { useToast } from '../components/UI/Toast';

const AdminAuthDiagnostics: React.FC = () => {
  const [result, setResult] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const { showToast } = useToast();
  const run = async () => {
    setLoading(true);
    const out: any = { steps: [] };
    try {
      const tokensRaw = localStorage.getItem('osrx_auth_tokens');
      const backendRaw = localStorage.getItem('osrx_backend_jwt');
      out.tokens = { supabase: !!tokensRaw, backend: !!backendRaw };
      if (tokensRaw) {
        try { const t = JSON.parse(tokensRaw).access_token; const p = JSON.parse(atob(t.split('.')[1])); out.supabasePayload = { email: p.email, role: p.role, exp: p.exp }; } catch {}
      }
      if (backendRaw) {
        try { const t = JSON.parse(backendRaw).token; const p = JSON.parse(atob(t.split('.')[1])); out.backendPayload = { email: p.email, role: p.role, exp: p.exp }; } catch {}
      }
      // Probe dashboard with Authorization header
      const anyToken = (() => {
        try { return JSON.parse(backendRaw||'{}').token } catch { return null }
      })() || (() => {
        try { return JSON.parse(tokensRaw||'{}').access_token } catch { return null }
      })();
      if (anyToken) {
        const resp = await fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${anyToken}` } });
        out.probeDashboard = { status: resp.status };
      } else {
        out.probeDashboard = { status: 'no-token' };
      }
      // Probe exchange route
      if (tokensRaw) {
        const supa = JSON.parse(tokensRaw).access_token;
        const resp = await fetch('/api/supabase-auth/exchange/backend-jwt', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${supa}` } });
        out.probeExchange = { status: resp.status };
      }
      // Server-side diagnostics
      try {
        const diag = await fetch('/api/auth/diagnostics');
        out.serverDiagnostics = { status: diag.status };
        if (diag.ok) out.serverDiagnostics.body = await diag.json();
      } catch (e: any) {
        out.serverDiagnostics = { error: e?.message || 'fetch_failed' };
      }

      setResult(out);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { run(); }, []);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-xl font-semibold mb-2">Admin Auth Diagnostics</h1>
        <p className="text-sm text-gray-600 mb-4">Quick checks for admin API authentication.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={run} disabled={loading} className="px-3 py-1.5 rounded bg-gray-800 text-white text-sm disabled:opacity-50">{loading ? 'Running…' : 'Run Checks'}</button>
          <button
            onClick={() => {
              try { localStorage.setItem('osrx_allow_query_token','true'); showToast('success','Query-token fallback enabled for this browser',3000); } catch {}
            }}
            className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm"
          >
            Enable Query-Token Fallback
          </button>
          <button
            onClick={async () => {
              try {
                const tokensRaw = localStorage.getItem('osrx_auth_tokens');
                const backendRaw = localStorage.getItem('osrx_backend_jwt');
                const tok = (backendRaw && JSON.parse(backendRaw).token) || (tokensRaw && JSON.parse(tokensRaw).access_token);
                if (!tok) { showToast('error','No token found'); return; }
                const allowQuery = localStorage.getItem('osrx_allow_query_token') === 'true';
                const url = allowQuery ? 'http://localhost:3000/api/admin/dashboard?token=REDACTED' : 'http://localhost:3000/api/admin/dashboard';
                const curl = allowQuery
                  ? `curl "${url}" -H "Content-Type: application/json"`
                  : `curl "${url}" -H "Authorization: Bearer REDACTED" -H "Content-Type: application/json"`;
                await navigator.clipboard.writeText(curl);
                showToast('success','Copied curl command (token redacted)');
              } catch {
                showToast('error','Failed to copy curl');
              }
            }}
            className="px-3 py-1.5 rounded bg-gray-100 text-gray-900 text-sm border"
          >
            Copy curl for /api/admin/dashboard
          </button>
        </div>
        <pre className="mt-4 bg-gray-50 border border-gray-200 rounded p-3 text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        <div className="mt-4 text-sm text-gray-700">
          <p className="font-medium mb-1">Expected for success:</p>
          <ul className="list-disc list-inside">
            <li>probeDashboard.status = 200</li>
            <li>probeExchange.status = 200 (if your backend deployed the exchange route)</li>
            <li>serverDiagnostics.status = 200 and backendJwtValid=true OR supabaseIntrospectionConfigured=true</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default AdminAuthDiagnostics;
