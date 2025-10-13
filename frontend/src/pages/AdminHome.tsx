import React, { useEffect, useState } from 'react';
import Card from '../components/UI/Card';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import { Link } from 'react-router-dom';
import { Shield, Users, FileText, Activity, Settings as SettingsIcon, MessageSquare } from 'lucide-react';

type DashboardStats = {
  users: { total: number; active: number; inactive: number; byRole: Record<string, number> };
  system: { supabase: boolean; timestamp: string };
};

const AdminHome: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [auditTotal, setAuditTotal] = useState<number | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Dashboard stats
        const d = await fetch('/api/admin/dashboard');
        if (d.ok) {
          const body = await d.json();
          setStats(body?.stats || null);
        }
      } catch {}
      try {
        // Get audit total cheaply (limit 1, rely on count on backend)
        const a = await fetch('/api/admin/audit?page=1&limit=1');
        if (a.ok) {
          const body = await a.json();
          setAuditTotal(body?.pagination?.total ?? null);
        }
      } catch {}
      try {
        // Load recent system logs to compute last sync time and error count
        const r = await fetch('/api/admin/logs?page=1&limit=25');
        if (r.ok) {
          const body = await r.json();
          const logs = (body?.logs || []) as Array<any>;
          const latest = logs[0]?.created_at || logs[0]?.started_at || null;
          setLastSyncAt(latest ? new Date(latest).toISOString() : null);
          const errors = logs.filter((l: any) => (String(l.status || '').toLowerCase() !== 'completed')).length;
          setErrorCount(errors);
        }
      } catch {}
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
  ];

  return (
    <div className="space-y-6">
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
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminHome;
