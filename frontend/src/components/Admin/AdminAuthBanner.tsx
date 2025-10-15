import React from 'react';
import { Shield, Settings, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { useToast } from '../UI/Toast';
import { Link } from 'react-router-dom';
import { refreshAdminTokens } from '../../utils/tokenRefresh';
import { adminApi } from '../../utils/adminApi';

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center text-xs"><span className="w-48 text-gray-600">{label}</span><span className="text-gray-900">{value}</span></div>
);

const AdminAuthBanner: React.FC = () => {
  const { showToast } = useToast();
  const [diag, setDiag] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/auth/diagnostics');
      const body = await resp.json().catch(() => null);
      setDiag({ status: resp.status, body });
    } catch (e: any) {
      setDiag({ error: e?.message || 'failed' });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const enableQueryToken = () => {
    try { localStorage.setItem('osrx_allow_query_token','true'); showToast('success','Query-token fallback enabled'); } catch {}
  };

  const guidance = () => {
    const b = diag?.body || {};
    const notes: React.ReactNode[] = [];
    if (diag?.status !== 200) {
      notes.push(<div key="status" className="text-sm text-red-800">Auth diagnostics endpoint returned {String(diag?.status)}</div>);
    }
    if (!b.supabaseIntrospectionConfigured) {
      notes.push(<div key="srk" className="text-sm text-yellow-800">Set <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> on the API server for secure verification.</div>);
    }
    if (!b.backendJwtValid && !b.fallbackAllowed) {
      notes.push(<div key="fallback" className="text-sm text-yellow-800">Enable dev fallback: set <code>ALLOW_SUPABASE_JWT_FALLBACK=true</code> on the API server (development only).</div>);
    }
    if (b.allowQueryToken !== true) {
      notes.push(<div key="qt" className="text-sm text-gray-800">If your proxy strips Authorization, set <code>ALLOW_QUERY_TOKEN=true</code> on the API server and click “Enable Query-Token”.</div>);
    }
    return notes;
  };

  const body = diag?.body || {};
  const show = diag && (diag.status !== 200 || !body.backendJwtValid) ;
  if (!show) return null;

  return (
    <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200 text-yellow-900">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-yellow-100 rounded"><Shield className="w-5 h-5 text-yellow-700" /></div>
        <div className="flex-1">
          <div className="font-semibold">Admin API Authentication Check</div>
          <div className="mt-1 space-y-1">
            {guidance()}
          </div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button onClick={load} disabled={loading} className="px-3 py-1.5 rounded bg-gray-900 text-white text-xs disabled:opacity-50"><Settings className="w-3.5 h-3.5 inline mr-1" /> {loading ? 'Rechecking…' : 'Recheck'}</button>
            <button onClick={enableQueryToken} className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs"><LinkIcon className="w-3.5 h-3.5 inline mr-1" /> Enable Query-Token</button>
            <Link to="/admin/auth-diagnostics" className="px-3 py-1.5 rounded border text-xs">Open Detailed Diagnostics</Link>
            <button
              onClick={async () => {
                try {
                  const ok = await refreshAdminTokens();
                  if (!ok) { showToast('error','Token exchange failed'); return; }
                  // Try an authenticated admin call
                  const resp = await adminApi.get('/api/admin/dashboard');
                  if (resp.ok) {
                    showToast('success','Admin access restored', 3000);
                    // Refresh diagnostics view
                    await load();
                  } else {
                    showToast('warning', `Still unauthorized (${resp.status})`);
                  }
                } catch (e: any) {
                  showToast('error', e?.message || 'Retry failed');
                }
              }}
              className="px-3 py-1.5 rounded bg-green-600 text-white text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Retry With Token
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
            <Row label="Token present" value={String(body.tokenPresent)} />
            <Row label="Backend JWT valid" value={String(body.backendJwtValid)} />
            <Row label="Supabase configured" value={String(body.supabaseIntrospectionConfigured)} />
            <Row label="Fallback allowed" value={String(body.fallbackAllowed)} />
            <Row label="Allow query token" value={String(body.allowQueryToken)} />
            <Row label="User hint" value={body.userHint ? `${body.userHint.email || ''} (${body.userHint.role || 'n/a'})` : '—'} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthBanner;
