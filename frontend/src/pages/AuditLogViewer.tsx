import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/UI/Card';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import { useToast } from '../components/UI/Toast';
import { Download, Filter, RefreshCw, Search } from 'lucide-react';
import { adminApi } from '../utils/adminApi';
import AccessDeniedBanner from '../components/Admin/AccessDeniedBanner';
import { useNavigate } from 'react-router-dom';

type AuditLog = {
  id: string;
  actor_id: string;
  target_user_id: string | null;
  action: string;
  details?: any;
  created_at: string;
};

type Pagination = { page: number; limit: number; total: number; pages: number };

const AuditLogViewer: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, pages: 0 });
  const [unauthorized, setUnauthorized] = useState(false);

  // Filters
  const [actor, setActor] = useState('');
  const [target, setTarget] = useState('');
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const params = useMemo(() => {
    const p = new URLSearchParams({ page: String(pagination.page), limit: String(pagination.limit) });
    if (actor) p.append('actor', actor.trim());
    if (target) p.append('target', target.trim());
    if (action) p.append('action', action.trim());
    if (from) p.append('from', new Date(from).toISOString());
    if (to) p.append('to', new Date(to).toISOString());
    return p.toString();
  }, [actor, target, action, from, to, pagination.page, pagination.limit]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const resp = await adminApi.get(`/api/admin/audit?${params}`);
      const body = await resp.json();
      setLogs(body.logs || []);
      if (body.pagination) setPagination((prev) => ({ ...prev, ...body.pagination }));
    } catch (e: any) {
      console.error('Audit fetch failed:', e);
      if (e?.status === 401 || e?.status === 403) { setUnauthorized(true); navigate('/'); }
      showToast('error', e?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const exportCsv = () => {
    const rows = [
      ['created_at', 'actor_id', 'target_user_id', 'action', 'details'],
      ...logs.map((l) => [
        l.created_at,
        l.actor_id,
        l.target_user_id || '',
        l.action,
        JSON.stringify(l.details || {})
      ])
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin_audit_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('success', 'Exported CSV');
  };

  const clearFilters = () => {
    setActor('');
    setTarget('');
    setAction('');
    setFrom('');
    setTo('');
    setPagination((p) => ({ ...p, page: 1 }));
  };

  return (
    <div className="space-y-6">
      {unauthorized && <AccessDeniedBanner />}
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Admin', href: '/admin/console' }, { label: 'Audit Logs' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">Administrative actions and sensitive events</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadLogs} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Actor (User ID)</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input value={actor} onChange={(e) => setActor(e.target.value)} placeholder="actor user id"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Target (User ID)</label>
            <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="target user id"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Action</label>
            <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="e.g., role_update"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-end gap-2">
            <button onClick={() => setPagination((p) => ({ ...p, page: 1 }))} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">
              <Filter size={16} /> Apply
            </button>
            <button onClick={clearFilters} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">Clear</button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-6 text-center text-gray-600">Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-6 text-center text-gray-500">No audit entries</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.actor_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.target_user_id || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.action}</td>
                    <td className="px-6 py-4 text-xs text-gray-600 max-w-lg truncate">{(() => { try { return JSON.stringify(log.details) } catch { return '' } })()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="text-sm text-gray-600">Total: {pagination.total}</div>
          <div className="flex items-center gap-2">
            <button disabled={pagination.page <= 1} onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">Prev</button>
            <span className="text-sm text-gray-700">Page {pagination.page} / {Math.max(1, pagination.pages || Math.ceil((pagination.total || 0) / (pagination.limit || 50)))}</span>
            <button disabled={pagination.page >= (pagination.pages || 1)} onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuditLogViewer;
