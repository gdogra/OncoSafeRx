import React, { useEffect, useState } from 'react';
import Card from '../components/UI/Card';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import { Activity, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../components/UI/Toast';
import { adminApi } from '../utils/adminApi';

type DashboardStats = {
  users: {
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
  };
  system: {
    supabase: boolean;
    timestamp: string;
  };
  recentActivity: any[];
};

const AdminSystemHealth: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await adminApi.get('/api/admin/dashboard');
        const body = await resp.json();
        setStats(body.stats);
      } catch (e: any) {
        console.error(e);
        showToast('error', e?.message || 'Failed to load system health');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showToast]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Admin', href: '/admin/console' }, { label: 'System Health' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600 mt-1">Platform status and recent activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.users.total ?? (loading ? '—' : 0)}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">{stats?.users.active ?? (loading ? '—' : 0)}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Users</p>
              <p className="text-2xl font-bold text-red-600">{stats?.users.inactive ?? (loading ? '—' : 0)}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Services</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Supabase</div>
              <div className="text-xs text-gray-500">{stats?.system.timestamp ? new Date(stats.system.timestamp).toLocaleString() : ''}</div>
            </div>
            {stats?.system.supabase ? (
              <span className="text-green-700 text-sm">Healthy</span>
            ) : (
              <span className="text-yellow-700 text-sm">Offline</span>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : (stats?.recentActivity?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(stats?.recentActivity as any[]).map((r, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm">{r.sync_type || r.type || '—'}</td>
                    <td className="px-4 py-2 text-sm">{r.status || '—'}</td>
                    <td className="px-4 py-2 text-sm">{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-600">No recent activity</div>
        ))}
      </Card>
    </div>
  );
};

export default AdminSystemHealth;
