import React, { useEffect, useState } from 'react';
import Card from '../components/UI/Card';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import { Activity, CheckCircle, XCircle, Users as UsersIcon, Eye, BarChart3 } from 'lucide-react';
import { useToast } from '../components/UI/Toast';
import { adminApi } from '../utils/adminApi';
import AccessDeniedBanner from '../components/Admin/AccessDeniedBanner';
import { useNavigate } from 'react-router-dom';

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

type AnalyticsMetrics = {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  averageSessionDuration?: number;
  bounceRate?: number;
  topPages: Array<{ url: string; views: number }>;
  userRoles: Array<{ role: string; count: number }>;
  deviceTypes: Array<{ type: string; count: number }>;
  geographicDistribution: Array<{ location: string; count: number }>;
};

const AdminSystemHealth: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [range, setRange] = useState<'1d'|'7d'|'30d'|'90d'>('7d');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await adminApi.get('/api/admin/dashboard');
        const body = await resp.json();
        setStats(body.stats);
      } catch (e: any) {
        console.error(e);
        if (e?.status === 401 || e?.status === 403) { setUnauthorized(true); navigate('/'); }
        showToast('error', e?.message || 'Failed to load system health');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showToast]);

  useEffect(() => {
    const loadMetrics = async () => {
      setMetricsLoading(true);
      try {
        const resp = await adminApi.get(`/api/analytics/metrics?range=${range}`);
        const body = await resp.json();
        setMetrics(body || null);
      } catch (e) {
        console.warn('Failed to load tracking metrics:', e);
      } finally {
        setMetricsLoading(false);
      }
    };
    loadMetrics();
  }, [range]);

  return (
    <div className="space-y-6">
      {unauthorized && <AccessDeniedBanner />}
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

      {/* Tracking Metrics */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Visitor Tracking</h3>
            <p className="text-sm text-gray-600">Traffic and engagement from the last {range}</p>
          </div>
          <div className="flex items-center gap-2">
            {(['1d','7d','30d','90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded border text-sm ${range===r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                {r}
              </button>
            ))}
            <a href="/visitor-analytics" className="ml-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
              <BarChart3 className="w-4 h-4" /> Full Analytics
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Visitors</div>
                <div className="text-2xl font-bold text-gray-900">{metricsLoading ? '—' : (metrics?.totalVisitors ?? 0)}</div>
              </div>
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Unique Visitors</div>
                <div className="text-2xl font-bold text-gray-900">{metricsLoading ? '—' : (metrics?.uniqueVisitors ?? 0)}</div>
              </div>
              <div className="p-1.5 bg-green-100 rounded"><UsersIcon className="w-5 h-5 text-green-700" /></div>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Page Views</div>
                <div className="text-2xl font-bold text-gray-900">{metricsLoading ? '—' : (metrics?.pageViews ?? 0)}</div>
              </div>
              <Eye className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Top Page</div>
            <div className="text-sm text-gray-900 truncate">
              {metricsLoading ? '—' : (metrics?.topPages?.[0] ? `${metrics.topPages[0].url} — ${metrics.topPages[0].views} views` : '—')}
            </div>
          </div>
        </div>
      </Card>

      {/* Details: Top Pages and Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Top Pages</h3>
            <span className="text-xs text-gray-500">{range}</span>
          </div>
          {metricsLoading ? (
            <div className="text-gray-600">Loading…</div>
          ) : (metrics?.topPages?.length ? (
            <div className="space-y-3">
              {metrics.topPages.slice(0, 5).map((p, i) => (
                <div key={`${p.url}-${i}`} className="flex items-center justify-between">
                  <div className="min-w-0 mr-3">
                    <div className="text-sm text-gray-900 truncate" title={p.url}>{i + 1}. {p.url}</div>
                    <div className="text-xs text-gray-500">{p.views} views</div>
                  </div>
                  <div className="w-28 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(p.views / Math.max(1, metrics.topPages[0]?.views || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-600">No pageview data</div>
          ))}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Role Distribution</h3>
            <span className="text-xs text-gray-500">{range}</span>
          </div>
          {metricsLoading ? (
            <div className="text-gray-600">Loading…</div>
          ) : (metrics?.userRoles?.length ? (
            <div className="space-y-3">
              {metrics.userRoles.map(r => (
                <div key={r.role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 rounded"><UsersIcon className="w-4 h-4 text-indigo-600" /></div>
                    <span className="text-sm text-gray-900 capitalize">{r.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">{r.count}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${(r.count / Math.max(1, metrics.totalVisitors || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-600">No role data</div>
          ))}
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
