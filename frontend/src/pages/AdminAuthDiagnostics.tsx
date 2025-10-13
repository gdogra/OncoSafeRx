import React from 'react';
import Card from '../components/UI/Card';

const AdminAuthDiagnostics: React.FC = () => {
  const [result, setResult] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

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
        <button onClick={run} disabled={loading} className="px-3 py-1.5 rounded bg-gray-800 text-white text-sm disabled:opacity-50">{loading ? 'Running…' : 'Run Checks'}</button>
        <pre className="mt-4 bg-gray-50 border border-gray-200 rounded p-3 text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        <div className="mt-4 text-sm text-gray-700">
          <p className="font-medium mb-1">Expected for success:</p>
          <ul className="list-disc list-inside">
            <li>probeDashboard.status = 200</li>
            <li>probeExchange.status = 200 (if your backend deployed the exchange route)</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default AdminAuthDiagnostics;

