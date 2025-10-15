import React, { useEffect, useState } from 'react';
import Card from '../components/UI/Card';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import { Link } from 'react-router-dom';
import { Shield, Users, FileText, Activity, Settings as SettingsIcon, MessageSquare, BarChart3, Eye } from 'lucide-react';
import { adminApi } from '../utils/adminApi';
import AdminAuthBanner from '../components/Admin/AdminAuthBanner';

type DashboardStats = {
  users: { total: number; active: number; inactive: number; byRole: Record<string, number> };
  system: { supabase: boolean; timestamp: string };
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

const AdminHome: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [auditTotal, setAuditTotal] = useState<number | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState<number | null>(null);
  const [authStatus, setAuthStatus] = useState<{ status: 'ok'|'unauthorized'|'error'|'unknown'; detail: string }>({ status: 'unknown', detail: 'Not checked' });
  const [tokenInfo, setTokenInfo] = useState<{ supaRole?: string; backendRole?: string }>({});
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Dashboard stats
        const d = await adminApi.get('/api/admin/dashboard');
        const body = await d.json();
        setStats(body?.stats || null);
        setAuthStatus({ status: 'ok', detail: '200 OK' });
      } catch {}
      try {
        // Load visitor tracking summary (last 7 days)
        const a = await adminApi.get('/api/analytics/metrics?range=7d');
        const body = await a.json();
        setAnalytics(body || null);
      } catch {}
      try {
        // Get audit total cheaply (limit 1, rely on count on backend)
        const a = await adminApi.get('/api/admin/audit?page=1&limit=1');
        const body = await a.json();
        setAuditTotal(body?.pagination?.total ?? null);
      } catch {}
      try {
        // Load recent system logs to compute last sync time and error count
        const r = await adminApi.get('/api/admin/logs?page=1&limit=25');
        const body = await r.json();
        const logs = (body?.logs || []) as Array<any>;
        const latest = logs[0]?.created_at || logs[0]?.started_at || null;
        setLastSyncAt(latest ? new Date(latest).toISOString() : null);
        const errors = logs.filter((l: any) => (String(l.status || '').toLowerCase() !== 'completed')).length;
        setErrorCount(errors);
      } catch {}
      try {
        // Decode tokens for display
        const tokensRaw = localStorage.getItem('osrx_auth_tokens');
        const backendRaw = localStorage.getItem('osrx_backend_jwt');
        const info: any = {};
        if (tokensRaw) { try { const t = JSON.parse(tokensRaw).access_token; const p = JSON.parse(atob(t.split('.')[1])); info.supaRole = p.role; } catch {} }
        if (backendRaw) { try { const t = JSON.parse(backendRaw).token; const p = JSON.parse(atob(t.split('.')[1])); info.backendRole = p.role; } catch {} }
        setTokenInfo(info);
      } catch {}
      // If dashboard failed above, reflect unauthorized/error
      try {
        const resp = await fetch('/api/admin/dashboard', { method: 'GET' });
        if (!resp.ok) {
          setAuthStatus({ status: resp.status === 401 || resp.status === 403 ? 'unauthorized' : 'error', detail: String(resp.status) });
        }
      } catch {
        setAuthStatus({ status: 'error', detail: 'Network/Error' });
      }
    };
    load();
  }, []);

  const tiles = [
    { path: '/admin/console', label: 'Admin Console', desc: 'Administrative overview & tools', icon: Shield, color: 'text-red-600', bg: 'bg-red-50', badge: null as React.ReactNode },
    { path: '/admin/users', label: 'User Management', desc: 'Manage user accounts and roles', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', badge: stats ? `${stats.users.active}/${stats.users.total}` : null },
    { path: '/admin/audit', label: 'Audit Logs', desc: 'Administrative audit trail', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50', badge: auditTotal !== null ? String(auditTotal) : null },
    { path: '/admin/health', label: 'System Health', desc: 'Platform status and services', icon: Activity, color: 'text-green-600', bg: 'bg-green-50', badge: stats ? (stats.system.supabase ? 'Healthy' : 'Offline') : null },
    { path: '/admin/settings', label: 'Admin Settings', desc: 'Maintenance and utilities', icon: SettingsIcon, color: 'text-gray-700', bg: 'bg-gray-100', badge: null as React.ReactNode },
    { path: '/admin/feedback', label: 'Feedback Admin', desc: 'Triage feedback and integrations', icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50', badge: null as React.ReactNode },
    { path: '/visitor-analytics', label: 'Visitor Analytics', desc: 'Tracking metrics and top pages', icon: BarChart3, color: 'text-teal-600', bg: 'bg-teal-50', badge: analytics ? String(analytics.uniqueVisitors) : null },
    { path: '/admin/auth-diagnostics', label: 'Auth Status', desc: `Admin API ${authStatus.detail}`, icon: Shield, color: authStatus.status==='ok'?'text-green-600':authStatus.status==='unauthorized'?'text-red-600':'text-yellow-600', bg: authStatus.status==='ok'?'bg-green-50':authStatus.status==='unauthorized'?'bg-red-50':'bg-yellow-50', badge: tokenInfo.backendRole || tokenInfo.supaRole || null },
  ];

  return (
    <div className="space-y-6">
      <AdminAuthBanner />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Admin' }]} />
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin</h1>
        <p className="text-gray-600 mt-1">Central hub for administrative tools and monitoring</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiles.map(({ path, label, desc, icon: Icon, color, bg, badge }) => (
          <Link key={path} to={path} className="block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg">
            <Card className="p-6 h-full hover:shadow-md transition-shadow relative">
              {badge !== null && (
                <span className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {badge}
                </span>
              )}
              <div className="flex items-start pr-8">
                <div className={`p-2 rounded-lg ${bg} mr-3`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">{label}</div>
                  <div className="text-sm text-gray-600 mt-1">{desc}</div>
                  {path === '/admin/health' && (
                    <div className="mt-2 text-xs text-gray-600">
                      <div>Last Sync: {lastSyncAt ? new Date(lastSyncAt).toLocaleString() : '—'}</div>
                      <div>Recent Errors: {errorCount !== null ? errorCount : '—'}</div>
                    </div>
                  )}
                  {path === '/visitor-analytics' && (
                    <div className="mt-2 text-xs text-gray-600">
                      <div>Unique Visitors (7d): {analytics ? analytics.uniqueVisitors : '—'}</div>
                      <div>Page Views (7d): {analytics ? analytics.pageViews : '—'}</div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Tracking Metrics */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Visitor Tracking (7 days)</h2>
            <p className="text-sm text-gray-600">Quick glance at traffic and engagement</p>
          </div>
          <Link to="/visitor-analytics" className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
            <BarChart3 className="w-4 h-4" />
            Open Analytics
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Visitors</div>
                <div className="text-2xl font-bold text-gray-900">{analytics ? analytics.totalVisitors : '—'}</div>
              </div>
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Unique Visitors</div>
                <div className="text-2xl font-bold text-gray-900">{analytics ? analytics.uniqueVisitors : '—'}</div>
              </div>
              <UserIcon />
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Page Views</div>
                <div className="text-2xl font-bold text-gray-900">{analytics ? analytics.pageViews : '—'}</div>
              </div>
              <Eye className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Top Page</div>
            <div className="text-sm text-gray-900 truncate">
              {analytics?.topPages?.[0] ? `${analytics.topPages[0].url} — ${analytics.topPages[0].views} views` : '—'}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminHome;

// Small helper to avoid adding a lucide import for a single-user icon if not needed
const UserIcon = () => <div className="p-1.5 bg-green-100 rounded"><Users className="w-5 h-5 text-green-700" /></div>;
