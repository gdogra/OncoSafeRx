import React from 'react';
import Card from '../components/UI/Card';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import { adminApi } from '../utils/adminApi';
import { Download, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '../components/UI/Toast';
import AccessDeniedBanner from '../components/Admin/AccessDeniedBanner';
import { useNavigate } from 'react-router-dom';

const AdminSettings: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [unauthorized, setUnauthorized] = React.useState(false);

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
    </div>
  );
};

export default AdminSettings;
