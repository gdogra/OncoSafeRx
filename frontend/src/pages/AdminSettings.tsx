import React from 'react';
import Card from '../components/UI/Card';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import { adminApi } from '../utils/adminApi';
import { Download, RefreshCw, AlertTriangle, Plus, X } from 'lucide-react';
import { useToast } from '../components/UI/Toast';
import AccessDeniedBanner from '../components/Admin/AccessDeniedBanner';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminSettings: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [unauthorized, setUnauthorized] = React.useState(false);
  const [aliases, setAliases] = React.useState<Record<string, string | null>>({});
  const [unknown, setUnknown] = React.useState<Array<{ term: string; count: number }>>([]);
  const [brand, setBrand] = React.useState('');
  const [generic, setGeneric] = React.useState('');
  const location = useLocation();
  const aliasesRef = React.useRef<HTMLDivElement>(null);

  const loadAliases = async () => {
    try {
      const resp = await adminApi.get('/api/drugs/admin/aliases');
      const body = await resp.json();
      setAliases(body.aliases || {});
    } catch {}
  };
  const loadUnknown = async () => {
    try {
      const resp = await adminApi.get('/api/drugs/admin/aliases/unknown');
      const body = await resp.json();
      setUnknown(body.items || []);
    } catch {}
  };
  React.useEffect(() => { loadAliases(); loadUnknown(); }, []);
  React.useEffect(() => {
    if (location.hash === '#aliases' && aliasesRef.current) {
      setTimeout(() => aliasesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [location.hash]);

  const exportFile = async (type: 'users' | 'stats') => {
    try {
      const resp = await adminApi.get(`/api/admin/export/${type}`);
      if (!resp.ok) throw new Error('Export failed');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('success', `Exported ${type}`);
    } catch (e: any) {
      console.error(e);
      if (e?.status === 401 || e?.status === 403) { setUnauthorized(true); navigate('/'); }
      showToast('error', e?.message || 'Export failed');
    }
  };

  const bumpGuidanceVersion = async () => {
    try {
      const resp = await adminApi.post('/api/admin/guidance-version/bump', {});
      const body = await resp.json().catch(() => ({} as any));
      const v = body?.guidanceVersion ?? 'updated';
      showToast('success', `Guidance version bumped (${v}). New sessions will see tips/tours.`);
    } catch (e: any) {
      console.error(e);
      showToast('error', 'Backend does not support global guidance reset. You can set VITE_GUIDANCE_VERSION and redeploy as a fallback.');
    }
  };

  const clientOnlyReset = () => {
    try {
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || '';
        if (k.startsWith('osrx_tip_dismissed:')) toRemove.push(k);
        if (k.startsWith('osrx_wizard_seen:')) toRemove.push(k);
        if (k === 'osrx_wizard_suppressed' || k === 'osrx_wizard_suppressed_version') toRemove.push(k);
      }
      toRemove.forEach(k => localStorage.removeItem(k));
      showToast('success', 'Client-only guidance reset complete for this browser.');
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to reset client guidance');
    }
  };

  return (
    <div className="space-y-6">
      {unauthorized && <AccessDeniedBanner />}
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Admin', href: '/admin/console' }, { label: 'Admin Settings' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600 mt-1">Maintenance and utilities</p>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export</h3>
        <div className="flex gap-3">
          <button onClick={() => exportFile('users')} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            <Download size={16} /> Export Users
          </button>
          <button onClick={() => exportFile('stats')} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            <Download size={16} /> Export Stats
          </button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Guidance & Tours</h3>
        <p className="text-sm text-gray-600 mb-4">Reset in‑app tips and onboarding tours globally or for this browser only.</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={bumpGuidanceVersion}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            title="Requires backend support"
          >
            <RefreshCw size={16} /> Global Reset (all users)
          </button>
          <button
            onClick={clientOnlyReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw size={16} /> Client‑only Reset (this browser)
          </button>
        </div>
        <div className="mt-3 text-xs text-gray-600 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
          <span>
            If the global reset endpoint is not available, set <code>VITE_GUIDANCE_VERSION</code> and redeploy to force a reset for all users.
          </span>
        </div>
      </Card>

      <Card className="p-6" ref={aliasesRef} id="aliases">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Drug Brand Aliases</h3>
        <p className="text-sm text-gray-600 mb-4">Map international brand names to generics to improve search coverage.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Brand (e.g., cilicar)"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={generic}
            onChange={(e) => setGeneric(e.target.value)}
            placeholder="Generic (e.g., cilnidipine) — or leave blank to set null"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <button
            onClick={async () => {
              if (!brand.trim()) { showToast('error', 'Brand is required'); return; }
              try {
                const resp = await adminApi.post('/api/drugs/admin/aliases/promote', {
                  brand: brand.trim(),
                  generic: generic.trim() ? generic.trim() : null
                });
                if (!resp.ok) throw new Error('Failed to save alias');
                setBrand(''); setGeneric('');
                await loadAliases();
                await loadUnknown();
                showToast('success', 'Alias saved');
              } catch (e: any) {
                showToast('error', e?.message || 'Failed to save alias');
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus size={16} /> Save Alias
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Unknown Brands</h4>
            <div className="border rounded-md divide-y">
              {unknown.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">No unknown brands logged.</div>
              ) : unknown.slice(0, 20).map((u) => (
                <div key={u.term} className="p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{u.term}</div>
                    <div className="text-xs text-gray-500">{u.count} hits</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBrand(u.term)}
                      className="text-xs px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                    >Use</button>
                    <button
                      onClick={async () => { try { await adminApi.delete(`/api/drugs/admin/aliases/unknown?brand=${encodeURIComponent(u.term)}`); await loadUnknown(); } catch {} }}
                      className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                      title="Remove from log"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {unknown.length > 0 && (
              <button
                onClick={async () => { try { await adminApi.delete('/api/drugs/admin/aliases/unknown?all=1'); await loadUnknown(); } catch {} }}
                className="mt-2 text-xs text-red-700 hover:text-red-900"
              >Clear all</button>
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Current Aliases</h4>
            <div className="border rounded-md divide-y max-h-64 overflow-auto">
              {Object.keys(aliases).length === 0 ? (
                <div className="p-3 text-sm text-gray-500">No aliases configured.</div>
              ) : Object.entries(aliases).sort(([a],[b]) => a.localeCompare(b)).map(([k, v]) => (
                <div key={k} className="p-3 flex items-center justify-between">
                  <div className="text-sm text-gray-800">{k} → <span className="font-medium">{String(v || 'null')}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminSettings;
