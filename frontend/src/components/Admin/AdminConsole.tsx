import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  BarChart3,
  Settings,
  Eye,
  UserCheck,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Globe,
  Monitor,
  Smartphone,
  FileText,
  Download,
  Search,
  Filter,
  RefreshCw,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Plus,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, Legend, LineChart, Line } from 'recharts';
import { useRBAC, ROLES, PERMISSIONS } from '../../utils/rbac';
import visitorTracking from '../../services/visitorTracking';
import LogoutButton from './LogoutButton';
import { useToast } from '../UI/Toast';
import Breadcrumbs from '../UI/Breadcrumbs';
import AdminAuthBanner from './AdminAuthBanner';
import AccessDeniedBanner from './AccessDeniedBanner';
import { adminApi } from '../../utils/adminApi';
import FeatureTour from '../UI/FeatureTour';
// useRBAC already imported above

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  lastLogin: string;
  loginCount: number;
  organizationId?: string;
}

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  onlineUsers: number;
  systemUptime: string;
  memoryUsage: number;
  cpuUsage: number;
  databaseConnections: number;
  errorRate: number;
}

const AdminConsole: React.FC = () => {
  const PUSH_ADMIN_ENABLED = String((import.meta as any)?.env?.VITE_ENABLE_PUSH_ADMIN || '').toLowerCase() === 'true';
  
  const { state: authState } = useAuth();
  const { user } = authState;
  const rbac = useRBAC(user);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system' | 'audit' | 'auth' | 'scientist' | 'analytics' | 'integrations' | 'role_management'>('overview');
  const [pushStatus, setPushStatus] = useState<string>('');
  const [pushForm, setPushForm] = useState<{ title: string; body: string; url: string; requireInteraction: boolean }>({ title: '', body: '', url: '/', requireInteraction: false });
  const [subs, setSubs] = useState<Array<{ endpoint: string }>>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [schedForm, setSchedForm] = useState<{ title: string; body: string; url: string; requireInteraction: boolean; scheduledAt: string; audience: 'all' | 'endpoint'; endpoint?: string }>({ title: '', body: '', url: '/', requireInteraction: false, scheduledAt: '', audience: 'all' });
  const [roleUsers, setRoleUsers] = useState<Array<{ id: string; email: string; full_name: string; role: string }>>([]);
  const [roleBusy, setRoleBusy] = useState<string>('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [authDiag, setAuthDiag] = useState<any>(null);
  const [authDiagLoading, setAuthDiagLoading] = useState(false);
  const [authDiagError, setAuthDiagError] = useState<string | null>(null);
  const { showToast } = useToast();
  // Integrations state
  const [intHealth, setIntHealth] = useState<{ ok: boolean; tenants: Array<{ tenant: string; hasActive: boolean; hasNext: boolean; activeCount: number; nextCount: number }>; missingActive: string[] } | null>(null);
  const [intUsage, setIntUsage] = useState<Record<string, { active: number; next: number; total: number; active24h?: number; next24h?: number; total24h?: number; lastUsed?: string | null; lastPhase?: string | null }>>({});
  const [intForm, setIntForm] = useState<{ tenant: string; nextKeys: string; promote: boolean; retireActive: boolean }>({ tenant: '', nextKeys: '', promote: false, retireActive: true });
  const [intUpdate, setIntUpdate] = useState<{ tenant: string; phase: 'active' | 'next'; add: string; remove: string }>({ tenant: '', phase: 'active', add: '', remove: '' });
  const [intBusyRotate, setIntBusyRotate] = useState(false);
  const [intBusyUpdate, setIntBusyUpdate] = useState(false);
  const [intForceDangerous, setIntForceDangerous] = useState(false);
  const [rowForce, setRowForce] = useState<Record<string, boolean>>({});
  const [issuesOnly, setIssuesOnly] = useState(false);
  const [intSeries, setIntSeries] = useState<Record<string, Array<{ date: string; active: number; next: number; total: number }>>>({});
  
  // Scientist Mode state
  const [scientistConfig, setScientistConfig] = useState<any>(null);
  const [scientistLoading, setScientistLoading] = useState(false);
  const [seriesDays, setSeriesDays] = useState(30);
  const [seriesExpanded, setSeriesExpanded] = useState(false);
  const [highlightZeros, setHighlightZeros] = useState(true);
  const [hideNoActivity, setHideNoActivity] = useState(false);
  const [seriesExportTenant, setSeriesExportTenant] = useState<string>('');
  // System tools state
  const [backfillBusy, setBackfillBusy] = useState(false);
  const [backfillResult, setBackfillResult] = useState<any | null>(null);
  // What's New drawer
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  const [whatsNewLoading, setWhatsNewLoading] = useState(false);
  const [whatsNewError, setWhatsNewError] = useState<string | null>(null);
  const [whatsNew, setWhatsNew] = useState<any | null>(null);

  const openWhatsNew = async () => {
    try {
      setWhatsNewOpen(true);
      setWhatsNewLoading(true);
      setWhatsNewError(null);
      const resp = await fetch('/api/release-notes');
      const body = await resp.json().catch(() => null);
      if (!resp.ok) throw new Error(body?.error || `HTTP ${resp.status}`);
      setWhatsNew(body);
    } catch (e: any) {
      setWhatsNew(null);
      setWhatsNewError(e?.message || 'Failed to load release notes');
    } finally {
      setWhatsNewLoading(false);
    }
  };

  // Feature tour (v20.2.0)
  const TOUR_KEY = 'osrx_tour_v20_2_0_dismissed';
  const [tourOpen, setTourOpen] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const tourSteps = [
    {
      title: 'Welcome to v20.2.0',
      body: (
        <>
          <p>New in this release: Integrations dashboards and key rotation, Auth diagnostics, and a “What’s New” drawer summarizing changes.</p>
          <p>Use this short tour to jump to the highlights.</p>
        </>
      )
    },
    {
      title: 'Auth Diagnostics',
      body: (
        <>
          <p>Visit the <b>Auth</b> tab to confirm tokens are present and that the backend is configured to verify Supabase JWTs (HS256 or service-role).</p>
          <p>Use “Verify Auth” to test <code>/api/patients</code> with your current session.</p>
        </>
      ),
      ctaLabel: 'Go to Auth',
      onCta: () => setActiveTab('auth')
    },
    {
      title: 'Integrations & API Keys',
      body: (
        <>
          <p>The <b>Integrations</b> tab shows tenant key health, usage, CSV exports, and trends. You can add/rotate keys safely with built-in guardrails.</p>
          <p>Use the “Promote NEXT” or “Promote (merge)” buttons to switch keys during rotation.</p>
        </>
      ),
      ctaLabel: 'Go to Integrations',
      onCta: () => setActiveTab('integrations')
    },
    {
      title: 'What’s New & OpenAPI',
      body: (
        <>
          <p>Click <b>What’s New</b> in the header to read the latest release notes. The OpenAPI spec is available at <code>/openapi.yaml</code> for integrations.</p>
          <p>The in-app assistant can answer “What’s new?” using these notes.</p>
        </>
      ),
      ctaLabel: 'Open What’s New',
      onCta: () => openWhatsNew()
    }
  ];

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(TOUR_KEY) === 'true';
      // Auto-open for users who can manage system settings
      if (!dismissed && rbac.hasPermission('manage_system_settings')) {
        setTimeout(() => setTourOpen(true), 400);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Audit log state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditMeta, setAuditMeta] = useState<{ total: number; pages: number; page: number }>({ total: 0, pages: 1, page: 1 });
  const [auditFilters, setAuditFilters] = useState<{ actor: string; target: string; action: string; from: string; to: string }>({ actor: '', target: '', action: '', from: '', to: '' });

  useEffect(() => {
    console.log('AdminConsole useEffect - checking access');
    console.log('AdminConsole useEffect - user:', user);
    console.log('AdminConsole useEffect - rbac object:', rbac);
    
    const canAccess = rbac.canAccessAdminConsole();
    console.log('AdminConsole useEffect - canAccessAdminConsole result:', canAccess);
    
    if (!canAccess) {
      console.log('AdminConsole useEffect - Access DENIED, returning early');
      return;
    }
    console.log('AdminConsole useEffect - Access GRANTED, loading admin data');
    loadAdminData();
  }, []);

  // Load scientist mode config when tab becomes active
  useEffect(() => {
    if (activeTab === 'scientist' && !scientistConfig) {
      loadScientistConfig();
    }
  }, [activeTab]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Fetch real admin dashboard data
      const dashboardResponse = await adminApi.get('/api/admin/dashboard');
      const dashboardData = await dashboardResponse.json();
      
      // Fetch users data
      const usersResponse = await adminApi.get('/api/admin/users?limit=100');
      const usersData = await usersResponse.json();
      
      // Transform users data to match expected format
      const transformedUsers = usersData.users.map((user: any) => ({
        id: user.id,
        email: user.email,
        firstName: user.full_name?.split(' ')[0] || 'Unknown',
        lastName: user.full_name?.split(' ').slice(1).join(' ') || '',
        roles: [user.role],
        isActive: user.is_active,
        lastLogin: user.last_login || new Date().toISOString(),
        loginCount: user.login_count || 0,
        organizationId: user.organization_id || null
      }));
      
      setUsers(transformedUsers);

      // Set system metrics from dashboard data
      const userStats = dashboardData.stats?.users;
      setSystemMetrics({
        totalUsers: userStats?.total || 0,
        activeUsers: userStats?.active || 0,
        onlineUsers: Math.floor((userStats?.active || 0) * 0.1), // Estimate 10% online
        systemUptime: '15d 4h 32m', // Keep static for now
        memoryUsage: 68.5, // Keep static for now
        cpuUsage: 23.1, // Keep static for now
        databaseConnections: 12, // Keep static for now
        errorRate: 0.02 // Keep static for now
      });

    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestPush = async () => {
    try {
      const resp = await fetch('/api/push/test', { method: 'POST' } as any);
      const body = await resp.json();
      if (resp.ok) setPushStatus(`OK • Subscribers: ${body.subscribers}`);
      else setPushStatus(`Error: ${body?.error || resp.status}`);
    } catch (e: any) {
      setPushStatus(`Error: ${e?.message || 'failed'}`);
    }
  };

  const handleSendCustomPush = async () => {
    try {
      const resp = await fetch('/api/push/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pushForm) } as any);
      const body = await resp.json();
      if (resp.ok) setPushStatus(`Sent: ${body.sent} • Subscribers: ${body.subscribers}`);
      else setPushStatus(`Error: ${body?.error || resp.status}`);
    } catch (e: any) {
      setPushStatus(`Error: ${e?.message || 'failed'}`);
    }
  };

  const loadSubs = async () => {
    try {
      const resp = await fetch('/api/push/subscriptions');
      const body = await resp.json();
      if (resp.ok) setSubs((body?.subscriptions || []).map((e: string) => ({ endpoint: e })));
    } catch {}
  };
  const removeSub = async (endpoint: string) => {
    try { await fetch('/api/push/unsubscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint }) } as any); loadSubs(); } catch {}
  };

  const loadSchedules = async () => {
    try { const resp = await fetch('/api/push/schedules'); const body = await resp.json(); if (resp.ok) setSchedules(body?.schedules || []); } catch {}
  };

  // Integrations: loaders and actions
  const loadIntegrations = async () => {
    try {
      const h = await adminApi.get('/api/admin/integrations/keys/health');
      const hb = await h.json();
      setIntHealth(hb);
    } catch (e) { setIntHealth(null as any); }
    try {
      const u = await adminApi.get('/api/admin/integrations/keys/usage');
      const ub = await u.json();
      setIntUsage(ub?.usage || {});
    } catch (e) { setIntUsage({}); }
    try {
      const ts = await adminApi.get(`/api/admin/integrations/keys/usage/timeseries?days=${seriesDays}`);
      const tb = await ts.json();
      setIntSeries(tb?.series || {});
    } catch (e) { setIntSeries({}); }
  };

  // CSV helpers
  const downloadCsv = (filename: string, rows: string[][]) => {
    const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const exportHealthCsv = () => {
    if (!intHealth) return;
    const rows: string[][] = [[ 'tenant','hasActive','hasNext','activeCount','nextCount' ]];
    (intHealth.tenants || []).forEach(t => rows.push([t.tenant, String(t.hasActive), String(t.hasNext), String(t.activeCount), String(t.nextCount)]));
    downloadCsv(`tenant_health_${new Date().toISOString().slice(0,10)}.csv`, rows);
  };
  const exportUsageCsv = () => {
    const rows: string[][] = [[ 'tenant','active','next','total','active24h','next24h','total24h','lastUsed','lastPhase' ]];
    Object.entries(intUsage).forEach(([tenant, v]: any) => rows.push([
      tenant, String(v.active||0), String(v.next||0), String(v.total||0), String(v.active24h||0), String(v.next24h||0), String(v.total24h||0), v.lastUsed || '', v.lastPhase || ''
    ]));
    downloadCsv(`tenant_usage_${new Date().toISOString().slice(0,10)}.csv`, rows);
  };
  const exportSeriesCsvAll = () => {
    const rows: string[][] = [[ 'tenant','date','active','next','total' ]];
    Object.entries(intSeries).forEach(([tenant, arr]: any) => {
      (arr || []).forEach((p: any) => rows.push([tenant, p.date, String(p.active||0), String(p.next||0), String(p.total||0)]));
    });
    downloadCsv(`tenant_timeseries_${seriesDays}d_${new Date().toISOString().slice(0,10)}.csv`, rows);
  };
  const exportSeriesCsvTenant = () => {
    const t = seriesExportTenant || Object.keys(intSeries)[0];
    if (!t) return;
    const arr: any[] = (intSeries as any)[t] || [];
    const rows: string[][] = [[ 'tenant','date','active','next','total' ]];
    arr.forEach((p: any) => rows.push([t, p.date, String(p.active||0), String(p.next||0), String(p.total||0)]));
    downloadCsv(`tenant_${t}_timeseries_${seriesDays}d_${new Date().toISOString().slice(0,10)}.csv`, rows);
  };
  const rotateKeys = async () => {
    try {
      const nextKeysArr = intForm.nextKeys.split(/\s|,|\n/).map(s => s.trim()).filter(Boolean);
      if (!intForm.tenant) { showToast('error', 'Tenant is required'); return; }
      if (!intForm.promote && nextKeysArr.length === 0) { showToast('error', 'Provide next keys or enable promote'); return; }
      const body = {
        tenant: intForm.tenant,
        nextKeys: nextKeysArr,
        promote: intForm.promote,
        retireActive: intForm.retireActive
      };
      if (body.promote && body.retireActive) {
        const ok = window.confirm('This will promote NEXT keys and retire current ACTIVE keys for this tenant. Existing clients using old keys will stop working. Continue?');
        if (!ok) return;
      }
      setIntBusyRotate(true);
      const resp = await adminApi.post('/api/admin/integrations/keys/rotate', body);
      const data = await resp.json();
      await loadIntegrations();
      setIntForm({ tenant: '', nextKeys: '', promote: false, retireActive: true });
      showToast('success', data?.promoted ? 'Keys promoted' : 'Next keys added');
    } catch (e: any) {
      showToast('error', e?.message || 'Rotation failed');
    } finally {
      setIntBusyRotate(false);
    }
  };
  const updateKeys = async () => {
    try {
      const addArr = intUpdate.add.split(/\s|,|\n/).map(s => s.trim()).filter(Boolean);
      const removeArr = intUpdate.remove.split(/\s|,|\n/).map(s => s.trim()).filter(Boolean);
      if (!intUpdate.tenant) { showToast('error', 'Tenant is required'); return; }
      if (addArr.length === 0 && removeArr.length === 0) { showToast('error', 'Provide keys to add or remove'); return; }
      const body = {
        tenant: intUpdate.tenant,
        phase: intUpdate.phase,
        add: addArr,
        remove: removeArr,
        force: intForceDangerous
      };
      setIntBusyUpdate(true);
      const resp = await adminApi.post('/api/admin/integrations/keys/update', body);
      const data = await resp.json();
      await loadIntegrations();
      setIntUpdate({ tenant: '', phase: 'active', add: '', remove: '' });
      showToast('success', 'Keys updated');
    } catch (e: any) {
      showToast('error', e?.message || 'Update failed');
    } finally {
      setIntBusyUpdate(false);
    }
  };

  const clearPhase = async (tenant: string, phase: 'active'|'next', forceOverride?: boolean) => {
    try {
      const danger = phase === 'active' ? 'This will remove all ACTIVE keys for this tenant and may lock out integrations if no NEXT keys are promoted. Continue?' : 'This will remove all NEXT keys for this tenant. Continue?'
      const ok = window.confirm(danger)
      if (!ok) return
      const effectiveForce = typeof forceOverride === 'boolean' ? forceOverride : (rowForce[tenant] || intForceDangerous)
      const resp = await adminApi.post('/api/admin/integrations/keys/clear', { tenant, phase, force: effectiveForce })
      await resp.json()
      await loadIntegrations()
      showToast('success', `Cleared ${phase} keys for ${tenant}`)
    } catch (e: any) {
      showToast('error', e?.message || 'Clear failed')
    }
  }
  const createSchedule = async () => {
    try { const resp = await fetch('/api/push/schedules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(schedForm) } as any); if (resp.ok) { setPushStatus('Schedule created'); setSchedForm({ title: '', body: '', url: '/', requireInteraction: false, scheduledAt: '', audience: 'all' }); loadSchedules(); } } catch {}
  };
  const deleteSchedule = async (id: string) => { try { await fetch(`/api/push/schedules/${id}`, { method: 'DELETE' } as any); loadSchedules(); } catch {} };
  const sendScheduleNow = async (id: string) => { try { await fetch(`/api/push/schedules/${id}/send`, { method: 'POST' } as any); loadSchedules(); } catch {} };

  useEffect(() => {
    // Non-essential tabs removed; no additional tab-specific loads
  }, [activeTab]);

  const loadRoleUsers = async () => {
    try {
      const resp = await adminApi.get('/api/admin/users?limit=200');
      const body = await resp.json();
      if (resp.ok) setRoleUsers((body?.users || []).map((u: any) => ({ id: u.id, email: u.email, full_name: u.full_name, role: u.role })));
    } catch {}
  };
  const saveUserRole = async (userId: string, newRole: string) => {
    setRoleBusy(userId);
    try {
      const resp = await adminApi.put(`/api/admin/users/${encodeURIComponent(userId)}`, { role: newRole });
      const body = await resp.json();
      if (resp.ok) {
        setRoleUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setPushStatus('Role updated');
      } else {
        setPushStatus(body?.error || 'Failed to update role');
      }
    } catch (e: any) {
      setPushStatus(e?.message || 'Network error');
    } finally {
      setRoleBusy('');
    }
  };

  const loadAudit = async (page: number = 1) => {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '50' });
      if (auditFilters.actor) params.append('actor', auditFilters.actor);
      if (auditFilters.target) params.append('target', auditFilters.target);
      if (auditFilters.action) params.append('action', auditFilters.action);
      if (auditFilters.from) params.append('from', auditFilters.from);
      if (auditFilters.to) params.append('to', auditFilters.to);
      
      const resp = await adminApi.get(`/api/admin/audit?${params.toString()}`);
      const body = await resp.json();
      if (resp.ok) {
        setAuditLogs(body?.logs || []);
        setAuditMeta({ total: body?.total || 0, pages: body?.pages || 1, page: body?.page || 1 });
      }
    } catch (e) {
      console.error('Failed to load audit logs:', e);
      setAuditLogs([]);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Auth diagnostics loader (placed near other loaders)
  const loadAuthDiagnostics = async () => {
    try {
      setAuthDiagLoading(true);
      setAuthDiagError(null);
      const resp = await adminApi.get('/api/auth/diagnostics');
      const body = await resp.json();
      setAuthDiag(body);
    } catch (e: any) {
      setAuthDiag(null);
      setAuthDiagError(e?.message || 'Failed to load diagnostics');
    } finally {
      setAuthDiagLoading(false);
    }
  };

  const getRoleDisplayName = (roleId: string) => {
    const role = ROLES[roleId.toUpperCase()];
    return role ? role.name : roleId;
  };

  const formatLastLogin = (timestamp: string) => {
    const now = new Date();
    const loginTime = new Date(timestamp);
    const diffMs = now.getTime() - loginTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <AdminAuthBanner />
      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics?.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Online Now</p>
              <p className="text-2xl font-bold text-green-600">{systemMetrics?.onlineUsers}</p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Uptime</p>
              <p className="text-2xl font-bold text-purple-600">{systemMetrics?.systemUptime}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Error Rate</p>
              <p className="text-2xl font-bold text-orange-600">{(systemMetrics?.errorRate || 0 * 100).toFixed(2)}%</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* System Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">System Performance</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Memory Usage</span>
                <span className="font-medium">{systemMetrics?.memoryUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${systemMetrics?.memoryUsage}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">CPU Usage</span>
                <span className="font-medium">{systemMetrics?.cpuUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${systemMetrics?.cpuUsage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{systemMetrics?.databaseConnections}</p>
                <p className="text-sm text-gray-600">DB Connections</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{systemMetrics?.activeUsers}</p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-1 bg-green-100 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">System backup completed</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-1 bg-blue-100 rounded-full">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New user registered</p>
                  <p className="text-xs text-gray-500">15 minutes ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-1 bg-orange-100 rounded-full">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">High memory usage detected</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-1 bg-purple-100 rounded-full">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Analytics report generated</p>
                  <p className="text-xs text-gray-500">3 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {rbac.hasPermission('manage_users') && (
              <button 
                onClick={() => setActiveTab('users')}
                className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Users className="w-6 h-6 text-blue-600" />
                <span className="font-medium text-blue-900">Manage Users</span>
              </button>
            )}

            {rbac.hasPermission('view_visitor_analytics') && (
              <button 
                onClick={() => navigate('/admin/trial-analytics')}
                className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <BarChart3 className="w-6 h-6 text-green-600" />
                <span className="font-medium text-green-900">Trial Analytics</span>
              </button>
            )}

            {rbac.hasPermission('view_audit_logs') && (
              <button 
                onClick={() => setActiveTab('audit')}
                className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <FileText className="w-6 h-6 text-purple-600" />
                <span className="font-medium text-purple-900">Audit Logs</span>
              </button>
            )}

            {rbac.hasPermission('manage_system_settings') && (
              <button 
                onClick={() => navigate('/admin/health')}
                className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Settings className="w-6 h-6 text-orange-600" />
                <span className="font-medium text-orange-900">System Health</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Scientist Mode functions
  const loadScientistConfig = async () => {
    try {
      setScientistLoading(true);
      const response = await adminApi.get('/scientist-mode/config');
      setScientistConfig(response);
    } catch (error) {
      console.error('Failed to load scientist mode config:', error);
      showToast('error', 'Failed to load scientist mode configuration');
    } finally {
      setScientistLoading(false);
    }
  };

  const updateScientistConfig = async (updates: any) => {
    try {
      setScientistLoading(true);
      const response = await adminApi.post('/scientist-mode/config', updates);
      setScientistConfig(response);
      showToast('success', 'Scientist mode configuration updated successfully');
    } catch (error) {
      console.error('Failed to update scientist mode config:', error);
      showToast('error', 'Failed to update scientist mode configuration');
    } finally {
      setScientistLoading(false);
    }
  };

  const resetScientistConfig = async () => {
    try {
      setScientistLoading(true);
      const response = await adminApi.post('/scientist-mode/reset', {});
      setScientistConfig(response);
      showToast('success', 'Scientist mode configuration reset to defaults');
    } catch (error) {
      console.error('Failed to reset scientist mode config:', error);
      showToast('error', 'Failed to reset scientist mode configuration');
    } finally {
      setScientistLoading(false);
    }
  };

  const renderScientistMode = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Scientist Mode Configuration</h3>
            <p className="text-sm text-gray-600 mt-1">
              Transform OncoSafeRx into a pure scientific instrument by controlling feature availability
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={loadScientistConfig}
              disabled={scientistLoading}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4 inline mr-1" />
              Refresh
            </button>
            <button
              onClick={resetScientistConfig}
              disabled={scientistLoading}
              className="px-3 py-1 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded border disabled:opacity-50"
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        {scientistLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading configuration...</span>
          </div>
        ) : scientistConfig ? (
          <div className="space-y-6">
            {/* Current Configuration Display */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Current Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Active Settings</h5>
                  {Object.entries(scientistConfig.current || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                      <span className={`px-2 py-1 rounded text-xs ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {value ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Environment Variables</h5>
                  {Object.entries(scientistConfig.environment || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-mono text-xs">{key}:</span>
                      <span className="text-gray-800">{String(value) || 'unset'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Toggle Controls */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Feature Controls</h4>
              
              {/* Master Scientist Mode Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex-1">
                  <h5 className="font-medium text-blue-900">Scientist Mode</h5>
                  <p className="text-sm text-blue-700 mt-1">
                    {scientistConfig.description?.enabled || 'Master toggle for scientist mode'}
                  </p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scientistConfig.current?.enabled || false}
                    onChange={(e) => updateScientistConfig({ enabled: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    scientistConfig.current?.enabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      scientistConfig.current?.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </label>
              </div>

              {/* Feature Toggles */}
              {['enableAnalytics', 'enableFeedback', 'enableSocial'].map((feature) => (
                <div key={feature} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').replace('enable', '').trim()}
                    </h5>
                    <p className="text-sm text-gray-600 mt-1">
                      {scientistConfig.description?.[feature] || `Control ${feature.replace('enable', '').toLowerCase()} features`}
                    </p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scientistConfig.current?.[feature] || false}
                      onChange={(e) => updateScientistConfig({ [feature]: e.target.checked })}
                      className="sr-only"
                      disabled={!scientistConfig.current?.enabled}
                    />
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      scientistConfig.current?.[feature] ? 'bg-green-600' : 'bg-gray-300'
                    } ${!scientistConfig.current?.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        scientistConfig.current?.[feature] ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </div>
                  </label>
                </div>
              ))}
            </div>

            {/* Help Text */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-medium text-yellow-900 mb-2">Important Notes</h5>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Changes are applied immediately but will reset on server restart</li>
                <li>• For persistent changes, update environment variables and restart the server</li>
                <li>• Scientist mode transforms the app into a pure scientific instrument</li>
                <li>• Disabled features return 404 responses when scientist mode is active</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Click "Refresh" to load scientist mode configuration</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Comprehensive User Management</h4>
            <p className="text-gray-600 mb-6">
              Access full user management capabilities including creation, editing, role management, and bulk operations.
            </p>
            <button 
              onClick={() => navigate('/admin/users')}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Users className="w-5 h-5" />
              <span>Open User Management</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Quick User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{systemMetrics?.totalUsers || 0}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">{systemMetrics?.activeUsers || 0}</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.roles.some(role => role.toLowerCase().includes('admin'))).length}
              </p>
              <p className="text-sm text-gray-600">Admin Users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Dashboard Access</h3>
        <p className="text-gray-600 mb-4">
          Access comprehensive visitor analytics and real-time tracking data.
        </p>
        <button 
          onClick={() => navigate('/visitor-analytics')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Open Analytics Dashboard</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  console.log('AdminConsole render - checking access again for render');
  console.log('AdminConsole render - user:', user);
  const canAccessForRender = rbac.canAccessAdminConsole();
  console.log('AdminConsole render - canAccessAdminConsole for render:', canAccessForRender);

  if (!canAccessForRender) {
    console.log('AdminConsole render - Showing Access Denied banner');
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">You don't have permission to access the admin console.</p>
          <p className="text-red-600 text-sm mt-2">Required permissions: Admin Console Access</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading admin console...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Admin Console' }]} />
      {/* Logout Button */}
      <LogoutButton />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
            <p className="text-gray-600">System administration and visitor analytics management</p>
            <button
              onClick={openWhatsNew}
              className="ml-2 inline-flex items-center px-2 py-1 text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded hover:opacity-90"
              title="What's New"
            >
              What's New
            </button>
            <button
              onClick={() => { setTourIndex(0); setTourOpen(true); }}
              className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded border hover:bg-gray-200"
              title="Start Tour"
            >
              Start Tour
            </button>
          </div>
        </div>
        {!PUSH_ADMIN_ENABLED && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-sm">
            Push admin features are disabled. Set VITE_ENABLE_PUSH_ADMIN=true to enable push tabs.
          </div>
        )}
      </div>

      {/* What's New Drawer */}
      {whatsNewOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setWhatsNewOpen(false)}></div>
          <div className="relative ml-auto h-full w-full max-w-xl bg-white shadow-xl border-l border-gray-200">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Release Notes</div>
                <div className="text-lg font-semibold text-gray-900">{whatsNew?.version || 'Latest'} {whatsNew?.date ? `• ${whatsNew.date}` : ''}</div>
              </div>
              <button onClick={() => setWhatsNewOpen(false)} className="px-2 py-1 text-sm border rounded">Close</button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-56px)]">
              {whatsNewLoading && <div className="text-sm text-gray-600">Loading release notes…</div>}
              {whatsNewError && <div className="text-sm text-red-600">{whatsNewError}</div>}
              {whatsNew && (
                <>
                  {whatsNew.added && (
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Added</div>
                      <pre className="text-sm bg-gray-50 border border-gray-200 rounded p-3 whitespace-pre-wrap">{whatsNew.added}</pre>
                    </div>
                  )}
                  {whatsNew.changed && (
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Changed</div>
                      <pre className="text-sm bg-gray-50 border border-gray-200 rounded p-3 whitespace-pre-wrap">{whatsNew.changed}</pre>
                    </div>
                  )}
                  {whatsNew.fixed && (
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Fixed</div>
                      <pre className="text-sm bg-gray-50 border border-gray-200 rounded p-3 whitespace-pre-wrap">{whatsNew.fixed}</pre>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <a href="/openapi.yaml" className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 border rounded hover:bg-gray-200">View OpenAPI</a>
                    <button onClick={() => setActiveTab('auth')} className="inline-flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">Go to Auth</button>
                    <button onClick={() => setActiveTab('integrations')} className="inline-flex items-center px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700">Go to Integrations</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Info Bar */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Logged in as: {user?.firstName} {user?.lastName} ({user?.roles.map(role => getRoleDisplayName(role)).join(', ')})
            </span>
          </div>
          <div className="text-sm text-blue-700">
            Hierarchy Level: {rbac.getUserHierarchyLevel()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Monitor, permission: null },
            { id: 'users', label: 'Users', icon: Users, permission: 'manage_users' },
            { id: 'system', label: 'System', icon: Settings, permission: 'manage_system_settings' },
            { id: 'scientist', label: 'Scientist Mode', icon: Eye, permission: 'manage_system_settings' },
            { id: 'audit', label: 'Audit Logs', icon: FileText, permission: 'view_audit_logs' },
            { id: 'auth', label: 'Auth', icon: Lock, permission: 'admin_console_access' }
          ].filter(tab => !tab.permission || rbac.hasPermission(tab.permission)).map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="relative inline-flex items-center">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'analytics' && renderAnalytics()}
      {activeTab === 'scientist' && renderScientistMode()}
      {activeTab === 'auth' && (
        <div className="space-y-6">
          <div className="bg-white rounded border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Auth Diagnostics</h3>
              <button onClick={loadAuthDiagnostics} className="px-2 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 text-gray-800">Refresh</button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Checks token presence and backend verification paths for Supabase and backend JWTs.</p>
            {authDiagLoading && (<div className="text-sm text-gray-600">Loading…</div>)}
            {authDiagError && (<div className="text-sm text-red-600">{authDiagError}</div>)}
            {authDiag && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 border rounded">
                    <div className="text-sm font-medium text-gray-900 mb-1">Incoming Request</div>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>Token present: <span className={authDiag.tokenPresent ? 'text-green-600' : 'text-red-600'}>{String(!!authDiag.tokenPresent)}</span></li>
                      <li>Backend JWT valid: <span className={authDiag.backendJwtValid ? 'text-green-600' : 'text-red-600'}>{String(!!authDiag.backendJwtValid)}</span></li>
                      <li>User hint: <span className="text-gray-800">{authDiag.userHint ? `${authDiag.userHint.email || authDiag.userHint.id} (${authDiag.userHint.role || authDiag.userHint.path})` : 'n/a'}</span></li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="text-sm font-medium text-gray-900 mb-1">Server Config</div>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>Supabase HS256 configured: <span className={authDiag.supabaseHs256Configured ? 'text-green-600' : 'text-red-600'}>{String(!!authDiag.supabaseHs256Configured)}</span></li>
                      <li>Service-role introspection: <span className={authDiag.supabaseIntrospectionConfigured ? 'text-green-600' : 'text-red-600'}>{String(!!authDiag.supabaseIntrospectionConfigured)}</span></li>
                      <li>Fallback allowed (dev): <span className="text-gray-800">{String(!!authDiag.fallbackAllowed)}</span></li>
                      <li>Query token allowed (dev): <span className="text-gray-800">{String(!!authDiag.allowQueryToken)}</span></li>
                    </ul>
                  </div>
                </div>
                {(!authDiag.supabaseHs256Configured && !authDiag.supabaseIntrospectionConfigured) && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-900 text-sm">
                    No Supabase verification configured. Set SUPABASE_JWT_SECRET or SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY on the backend.
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900 mb-1">Raw Diagnostics</div>
                  <pre className="text-xs bg-gray-50 border border-gray-200 rounded p-3 overflow-auto max-h-64">{JSON.stringify(authDiag, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="bg-white rounded border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tenant API Keys Health</h3>
            {!intHealth ? (
              <p className="text-sm text-gray-600">Loading…</p>
            ) : (
              <div className="overflow-x-auto">
                <div className="flex items-center justify-end mb-2">
                  <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                    <input type="checkbox" checked={issuesOnly} onChange={e => setIssuesOnly(e.target.checked)} />
                    Show only issues (missing active or 0 requests in 24h)
                  </label>
                  <button onClick={exportHealthCsv} className="ml-3 px-2 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 text-gray-800">Export CSV</button>
                </div>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-600">
                      <th className="px-3 py-2">Tenant</th>
                      <th className="px-3 py-2">Active Keys</th>
                      <th className="px-3 py-2">Next Keys</th>
                      <th className="px-3 py-2">Last Used</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(intHealth.tenants || []).filter(t => {
                      if (!issuesOnly) return true;
                      const u = intUsage[t.tenant] || {} as any;
                      const zero24h = (u.total24h || 0) === 0;
                      return !t.hasActive || zero24h;
                    }).map(t => {
                      const u = intUsage[t.tenant] || { lastUsed: null, lastPhase: null, active: 0, next: 0, total: 0 } as any
                      const last = u.lastUsed ? formatLastLogin(u.lastUsed) : '—'
                      return (
                        <tr key={t.tenant} className="border-b">
                          <td className="px-3 py-2">{t.tenant}</td>
                          <td className="px-3 py-2">{t.activeCount}</td>
                          <td className="px-3 py-2">{t.nextCount}</td>
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center gap-1">
                              {last} {u.lastPhase ? `(${u.lastPhase})` : ''}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded text-xs ${t.hasActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.hasActive ? 'OK' : 'Missing active'}</span>
                          </td>
                          <td className="px-3 py-2 space-x-2">
                            <button
                              disabled={!t.hasNext}
                              onClick={async () => {
                                const ok = window.confirm(`Promote NEXT keys to ACTIVE for ${t.tenant} and retire current ACTIVE keys?`)
                                if (!ok) return
                                try {
                                  const resp = await adminApi.post('/api/admin/integrations/keys/rotate', { tenant: t.tenant, nextKeys: [], promote: true, retireActive: true })
                                  await resp.json()
                                  showToast('success', `Promoted NEXT→ACTIVE for ${t.tenant}`)
                                  loadIntegrations()
                                } catch (e: any) { showToast('error', e?.message || 'Promote failed') }
                              }}
                              className={`px-2 py-1 rounded text-xs text-white ${t.hasNext ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
                            >Promote NEXT</button>
                            <button
                              disabled={!t.hasNext}
                              onClick={async () => {
                                const ok = window.confirm(`Merge NEXT keys into ACTIVE for ${t.tenant} (keep existing ACTIVE)?`)
                                if (!ok) return
                                try {
                                  const resp = await adminApi.post('/api/admin/integrations/keys/rotate', { tenant: t.tenant, nextKeys: [], promote: true, retireActive: false })
                                  await resp.json()
                                  showToast('success', `Merged NEXT→ACTIVE for ${t.tenant}`)
                                  loadIntegrations()
                                } catch (e: any) { showToast('error', e?.message || 'Merge failed') }
                              }}
                              className={`px-2 py-1 rounded text-xs text-white ${t.hasNext ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-300 cursor-not-allowed'}`}
                            >Promote (merge)</button>
                            <button
                              disabled={!t.hasActive}
                              onClick={() => clearPhase(t.tenant, 'active', rowForce[t.tenant])}
                              className={`px-2 py-1 rounded text-xs text-white ${t.hasActive ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300 cursor-not-allowed'}`}
                            >Retire ACTIVE</button>
                            <button
                              disabled={!t.hasNext}
                              onClick={() => clearPhase(t.tenant, 'next', rowForce[t.tenant])}
                              className={`px-2 py-1 rounded text-xs text-white ${t.hasNext ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-300 cursor-not-allowed'}`}
                            >Clear NEXT</button>
                            <label className="inline-flex items-center gap-1 text-xs text-gray-700 ml-1 align-middle">
                              <input type="checkbox" checked={!!rowForce[t.tenant]} onChange={e => setRowForce(prev => ({ ...prev, [t.tenant]: e.target.checked }))} />
                              Force
                            </label>
                          </td>
                        </tr>
                      )
                    })}
                    {intHealth.tenants.length === 0 && (
                      <tr><td colSpan={4} className="px-3 py-4 text-center text-gray-600">No tenants configured</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Usage (phase)</h3>
            <div className="overflow-x-auto">
              <div className="flex items-center justify-end mb-2">
                <button onClick={exportUsageCsv} className="px-2 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 text-gray-800">Export CSV</button>
              </div>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-600">
                    <th className="px-3 py-2">Tenant</th>
                    <th className="px-3 py-2">Active</th>
                    <th className="px-3 py-2">Next</th>
                    <th className="px-3 py-2">Total</th>
                    <th className="px-3 py-2">Last 24h</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(intUsage).map(([tenant, v]: any) => (
                    <tr key={tenant} className="border-b">
                      <td className="px-3 py-2">{tenant}</td>
                      <td className="px-3 py-2">{v.active}</td>
                      <td className="px-3 py-2">{v.next}</td>
                      <td className="px-3 py-2">{v.total}</td>
                      <td className="px-3 py-2">{v.total24h || 0}</td>
                    </tr>
                  ))}
                  {Object.keys(intUsage).length === 0 && (
                    <tr><td colSpan={4} className="px-3 py-4 text-center text-gray-600">No usage recorded</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Requests in Last 24h</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(intUsage).map(([tenant, v]: any) => ({ tenant, active24h: v.active24h || 0, next24h: v.next24h || 0 }))}>
                  <XAxis dataKey="tenant" hide={Object.keys(intUsage).length > 12} interval={0} angle={-30} textAnchor="end" height={50} />
                  <YAxis allowDecimals={false} />
                  <ReTooltip />
                  <Legend />
                  <Bar dataKey="active24h" stackId="a" fill="#2563eb" name="Active 24h" />
                  <Bar dataKey="next24h" stackId="a" fill="#9333ea" name="Next 24h" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Tenant Request Trends (last {seriesDays}d)</h3>
              <div className="flex items-center gap-2">
                <select value={seriesDays} onChange={e => { setSeriesDays(parseInt(e.target.value as any)); loadIntegrations(); }} className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option value={7}>7</option>
                  <option value={14}>14</option>
                  <option value={30}>30</option>
                  <option value={60}>60</option>
                </select>
                <label className="inline-flex items-center gap-1 text-xs text-gray-700">
                  <input type="checkbox" checked={highlightZeros} onChange={e => setHighlightZeros(e.target.checked)} />
                  Highlight zeros
                </label>
                <label className="inline-flex items-center gap-1 text-xs text-gray-700">
                  <input type="checkbox" checked={hideNoActivity} onChange={e => setHideNoActivity(e.target.checked)} />
                  Hide no-activity tenants
                </label>
                <div className="hidden md:flex items-center gap-2">
                  <select value={seriesExportTenant} onChange={e => setSeriesExportTenant(e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1 min-w-[8rem]">
                    <option value="">Select tenant…</option>
                    {Object.keys(intSeries).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button onClick={exportSeriesCsvTenant} className="px-2 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 text-gray-800">Export Tenant</button>
                  <button onClick={exportSeriesCsvAll} className="px-2 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 text-gray-800">Export All</button>
                </div>
                <button onClick={() => setSeriesExpanded(!seriesExpanded)} className="px-2 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 text-gray-800">{seriesExpanded ? 'Collapse' : 'Expand'}</button>
              </div>
            </div>
            <div className={`grid gap-4 ${seriesExpanded ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {Object.entries(intSeries)
                .filter(([tenant, data]: any) => {
                  if (!hideNoActivity) return true;
                  try { return (data as any[]).some(p => (p?.total || 0) > 0); } catch { return true; }
                })
                .slice(0, seriesExpanded ? undefined : 6)
                .map(([tenant, data]: any) => {
                const zero24h = (intUsage[tenant]?.total24h || 0) === 0;
                const cardBorder = zero24h ? 'border-yellow-300' : 'border-gray-200';
                return (
                <div key={tenant} className={`border ${cardBorder} rounded p-3`}>
                  <div className="text-sm font-medium text-gray-900 mb-1">{tenant}</div>
                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data} margin={{ left: 4, right: 4, top: 4, bottom: 0 }}>
                        <ReTooltip contentStyle={{ fontSize: '0.75rem' }} />
                        <Line type="monotone" dataKey="active" stroke="#2563eb" strokeWidth={1.5}
                          dot={(props: any) => (highlightZeros && props?.payload?.active === 0 ? <circle cx={props.cx} cy={props.cy} r={2} fill="#ef4444" /> : null)}
                          name="Active" />
                        <Line type="monotone" dataKey="next" stroke="#9333ea" strokeWidth={1.5}
                          dot={(props: any) => (highlightZeros && props?.payload?.next === 0 ? <circle cx={props.cx} cy={props.cy} r={2} fill="#ef4444" /> : null)}
                          name="Next" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-gray-600">
                    <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded bg-blue-600"></span> Active</span>
                    <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded bg-purple-600"></span> Next</span>
                    {highlightZeros && (<span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded bg-red-500"></span> Zero day</span>)}
                  </div>
                </div>
              )})}
              {Object.keys(intSeries).length === 0 && (
                <div className="text-sm text-gray-600">No time series data</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rotate Keys</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Tenant ID" value={intForm.tenant} onChange={e => setIntForm({ ...intForm, tenant: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={intForm.promote} onChange={e => setIntForm({ ...intForm, promote: e.target.checked })} /> Promote after adding
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={intForm.retireActive} onChange={e => setIntForm({ ...intForm, retireActive: e.target.checked })} /> Retire existing active (replace)
              </label>
              <textarea placeholder="Next keys (one per line or comma separated)" value={intForm.nextKeys} onChange={e => setIntForm({ ...intForm, nextKeys: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm md:col-span-2" rows={3} />
            </div>
            <div className="mt-3">
              <button onClick={rotateKeys} disabled={intBusyRotate} className={`px-3 py-1.5 rounded text-sm text-white ${intBusyRotate ? 'bg-blue-400 opacity-70 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>{intBusyRotate ? 'Applying…' : 'Apply Rotation'}</button>
            </div>
          </div>

          <div className="bg-white rounded border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add/Remove Keys</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Tenant ID" value={intUpdate.tenant} onChange={e => setIntUpdate({ ...intUpdate, tenant: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" />
              <select value={intUpdate.phase} onChange={e => setIntUpdate({ ...intUpdate, phase: e.target.value as any })} className="border border-gray-300 rounded px-3 py-2 text-sm">
                <option value="active">active</option>
                <option value="next">next</option>
              </select>
              <textarea placeholder="Add keys (one per line or comma)" value={intUpdate.add} onChange={e => setIntUpdate({ ...intUpdate, add: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" rows={3} />
              <textarea placeholder="Remove keys (one per line or comma)" value={intUpdate.remove} onChange={e => setIntUpdate({ ...intUpdate, remove: e.target.value })} className="border border-gray-300 rounded px-3 py-2 text-sm" rows={3} />
              <div className="md:col-span-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={intForceDangerous} onChange={e => setIntForceDangerous(e.target.checked)} />
                  Force dangerous updates (allow removing all ACTIVE keys without NEXT)
                </label>
                <span className="text-xs text-gray-500">Use with caution</span>
              </div>
            </div>
            <div className="mt-3">
              <button onClick={updateKeys} disabled={intBusyUpdate} className={`px-3 py-1.5 rounded text-sm text-white ${intBusyUpdate ? 'bg-blue-400 opacity-70 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>{intBusyUpdate ? 'Updating…' : 'Update Keys'}</button>
            </div>
          </div>

          <div className="bg-white rounded border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Config Snapshot</h3>
            <p className="text-sm text-gray-600 mb-3">Summary of tenants, health and usage for debugging. Keys are not displayed.</p>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-500">Source: /api/admin/integrations/keys/health and /usage</div>
              <button onClick={loadIntegrations} className="px-2 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 text-gray-800">Refresh</button>
            </div>
            <pre className="text-xs bg-gray-50 border border-gray-200 rounded p-3 overflow-auto max-h-80">
{JSON.stringify({ health: intHealth, usage: intUsage }, null, 2)}
            </pre>
          </div>
        </div>
      )}
      {activeTab === 'role_management' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Management</h3>
            <p className="text-sm text-gray-600 mb-4">Manage user roles (super_admin/manage_roles only).</p>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-sm text-gray-600">
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {roleUsers.map(u => (
                    <tr key={u.id} className="border-b">
                      <td className="px-4 py-2 text-sm">{u.email}</td>
                      <td className="px-4 py-2 text-sm">{u.full_name}</td>
                      <td className="px-4 py-2">
                        <select value={u.role} onChange={(e) => setRoleUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: e.target.value } : x))} className="border border-gray-300 rounded px-2 py-1 text-sm">
                          {['super_admin', 'admin', 'oncologist', 'pharmacist', 'nurse', 'researcher', 'student', 'patient', 'caregiver'].map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <button disabled={roleBusy === u.id} onClick={() => saveUserRole(u.id, u.role)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-60">{roleBusy === u.id ? 'Saving…' : 'Save'}</button>
                      </td>
                    </tr>
                  ))}
                  {roleUsers.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-600">No users</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="text-center py-6">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-gray-900">System Tools</h3>
            <p className="text-gray-600">Administrative utilities and maintenance tasks.</p>
          </div>

          <div className="bg-white rounded border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold text-gray-900">Backfill User Profile Fields</h4>
              <button
                onClick={async () => {
                  try {
                    setBackfillBusy(true);
                    setBackfillResult(null);
                    const resp = await adminApi.post('/api/admin/users/backfill-profile-fields', {});
                    const body = await resp.json();
                    setBackfillResult(body);
                    showToast('success', `Backfill complete: updated ${body.updated}/${body.scanned}`);
                  } catch (e: any) {
                    setBackfillResult({ error: e?.message || 'failed' });
                    showToast('error', e?.message || 'Backfill failed');
                  } finally {
                    setBackfillBusy(false);
                  }
                }}
                disabled={backfillBusy}
                className={`px-3 py-1.5 rounded text-sm text-white ${backfillBusy ? 'bg-blue-400 opacity-70 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {backfillBusy ? 'Running…' : 'Run Backfill'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Ensures first/last/full_name are consistent; initializes preferences/persona JSON as needed.</p>
            {backfillResult && (
              <pre className="text-xs bg-gray-50 border border-gray-200 rounded p-3 overflow-auto max-h-64">{JSON.stringify(backfillResult, null, 2)}</pre>
            )}
          </div>
        </div>
      )}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-gray-200 rounded">
            <h3 className="font-medium text-gray-900 mb-2">Audit Logs</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
              <input placeholder="Actor ID" value={auditFilters.actor} onChange={(e) => setAuditFilters({ ...auditFilters, actor: e.target.value })} className="border border-gray-300 rounded px-2 py-1 text-sm" />
              <input placeholder="Target User ID" value={auditFilters.target} onChange={(e) => setAuditFilters({ ...auditFilters, target: e.target.value })} className="border border-gray-300 rounded px-2 py-1 text-sm" />
              <input placeholder="Action (e.g., role_update)" value={auditFilters.action} onChange={(e) => setAuditFilters({ ...auditFilters, action: e.target.value })} className="border border-gray-300 rounded px-2 py-1 text-sm" />
              <input type="datetime-local" value={auditFilters.from} onChange={(e) => setAuditFilters({ ...auditFilters, from: e.target.value })} className="border border-gray-300 rounded px-2 py-1 text-sm" />
              <input type="datetime-local" value={auditFilters.to} onChange={(e) => setAuditFilters({ ...auditFilters, to: e.target.value })} className="border border-gray-300 rounded px-2 py-1 text-sm" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => { setAuditPage(1); loadAudit(1); }} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Apply</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-sm text-gray-600">
                    <th className="px-4 py-2">Time</th>
                    <th className="px-4 py-2">Actor</th>
                    <th className="px-4 py-2">Target</th>
                    <th className="px-4 py-2">Action</th>
                    <th className="px-4 py-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b">
                      <td className="px-4 py-2 text-sm">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm">{log.actor_id}</td>
                      <td className="px-4 py-2 text-sm">{log.target_user_id}</td>
                      <td className="px-4 py-2 text-sm">{log.action}</td>
                      <td className="px-4 py-2 text-xs"><code>{JSON.stringify(log.details)}</code></td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-600">No audit entries</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-600">Page {auditPage} of {auditMeta.pages} • {auditMeta.total} entries</span>
              <div className="space-x-2">
                <button disabled={auditPage <= 1} onClick={() => { const p = Math.max(1, auditPage - 1); setAuditPage(p); loadAudit(p); }} className="px-2 py-1 text-sm border rounded disabled:opacity-50">Prev</button>
                <button disabled={auditPage >= auditMeta.pages} onClick={() => { const p = Math.min(auditMeta.pages, auditPage + 1); setAuditPage(p); loadAudit(p); }} className="px-2 py-1 text-sm border rounded disabled:opacity-50">Next</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {false && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-medium text-blue-900 mb-2">Background Push Test</h3>
            <p className="text-sm text-blue-800">Ensure a service worker is registered and VAPID keys are configured. Click to ping the server test endpoint.</p>
            <div className="mt-3 flex items-center gap-2">
              <button onClick={handleTestPush} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Send Test</button>
              {pushStatus && <span className="text-sm text-gray-700">{pushStatus}</span>}
            </div>
          </div>
          <div className="p-4 bg-white border border-gray-200 rounded">
            <h3 className="font-medium text-gray-900 mb-2">Send Custom Push</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Title</label>
                <input value={pushForm.title} onChange={(e) => setPushForm({ ...pushForm, title: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="OncoSafeRx" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">URL</label>
                <input value={pushForm.url} onChange={(e) => setPushForm({ ...pushForm, url: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="/" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Body</label>
                <textarea value={pushForm.body} onChange={(e) => setPushForm({ ...pushForm, body: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" rows={3} placeholder="Background notification" />
              </div>
              <label className="inline-flex items-center text-sm text-gray-700">
                <input type="checkbox" checked={pushForm.requireInteraction} onChange={(e) => setPushForm({ ...pushForm, requireInteraction: e.target.checked })} className="mr-2" />
                Require Interaction
              </label>
            </div>
            <div className="mt-3">
              <button onClick={handleSendCustomPush} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Send Custom Push</button>
            </div>
          </div>
        </div>
      )}
      {false && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-gray-200 rounded">
            <h3 className="font-medium text-gray-900 mb-2">Push Subscriptions</h3>
            <p className="text-sm text-gray-700 mb-2">Total: {subs.length}</p>
            <div className="space-y-2">
              {subs.map(s => (
                <div key={s.endpoint} className="flex items-center justify-between p-2 border rounded">
                  <code className="text-xs break-all mr-2">{s.endpoint}</code>
                  <button onClick={() => removeSub(s.endpoint)} className="px-2 py-1 text-xs bg-red-600 text-white rounded">Remove</button>
                </div>
              ))}
              {subs.length === 0 && <div className="text-sm text-gray-600">No subscriptions</div>}
            </div>
          </div>
        </div>
      )}
      {false && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-gray-200 rounded">
            <h3 className="font-medium text-gray-900 mb-2">Create Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Title</label>
                <input value={schedForm.title} onChange={(e) => setSchedForm({ ...schedForm, title: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">URL</label>
                <input value={schedForm.url} onChange={(e) => setSchedForm({ ...schedForm, url: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Body</label>
                <textarea value={schedForm.body} onChange={(e) => setSchedForm({ ...schedForm, body: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" rows={3} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Scheduled At</label>
                <input type="datetime-local" value={schedForm.scheduledAt} onChange={(e) => setSchedForm({ ...schedForm, scheduledAt: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Audience</label>
                <select value={schedForm.audience} onChange={(e) => setSchedForm({ ...schedForm, audience: e.target.value as any })} className="w-full border border-gray-300 rounded px-3 py-2">
                  <option value="all">All</option>
                  <option value="endpoint">Specific Endpoint</option>
                </select>
              </div>
              {schedForm.audience === 'endpoint' && (
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Endpoint</label>
                  <input value={schedForm.endpoint || ''} onChange={(e) => setSchedForm({ ...schedForm, endpoint: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2" />
                </div>
              )}
              <label className="inline-flex items-center text-sm text-gray-700">
                <input type="checkbox" checked={schedForm.requireInteraction} onChange={(e) => setSchedForm({ ...schedForm, requireInteraction: e.target.checked })} className="mr-2" />
                Require Interaction
              </label>
            </div>
            <div className="mt-3">
              <button onClick={createSchedule} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Create</button>
            </div>
          </div>
          <div className="p-4 bg-white border border-gray-200 rounded">
            <h3 className="font-medium text-gray-900 mb-2">Scheduled Notifications</h3>
            <div className="space-y-2">
              {schedules.map(s => (
                <div key={s.id} className="p-2 border rounded">
                  <div className="text-sm font-medium text-gray-900">{s.title}</div>
                  <div className="text-xs text-gray-600">{s.body}</div>
                  <div className="text-xs text-gray-500">{s.status} • {new Date(s.scheduled_at).toLocaleString()}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => sendScheduleNow(s.id)} className="px-2 py-1 text-xs bg-blue-600 text-white rounded">Send Now</button>
                    <button onClick={() => deleteSchedule(s.id)} className="px-2 py-1 text-xs bg-red-600 text-white rounded">Delete</button>
                  </div>
                </div>
              ))}
              {schedules.length === 0 && <div className="text-sm text-gray-600">No scheduled notifications</div>}
            </div>
          </div>
        </div>
      )}
      {false && (
        <FeatureTour
          open={tourOpen}
          steps={tourSteps}
          index={tourIndex}
          onClose={() => { setTourOpen(false); try { localStorage.setItem(TOUR_KEY, 'true'); } catch {} }}
          onPrev={() => setTourIndex((i) => Math.max(0, i - 1))}
          onNext={() => {
            setTourIndex((i) => {
              const next = Math.min(tourSteps.length - 1, i + 1);
              if (next === tourSteps.length - 1) {
                try { localStorage.setItem(TOUR_KEY, 'true'); } catch {}
                setTimeout(() => setTourOpen(false), 100);
              }
              return next;
            });
          }}
        />
      )}
    </div>
  );
};

export default AdminConsole;
