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
import { useRBAC, ROLES, PERMISSIONS } from '../../utils/rbac';
import visitorTracking from '../../services/visitorTracking';
import LogoutButton from './LogoutButton';
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
  const { state: authState } = useAuth();
  const { user } = authState;
  const rbac = useRBAC(user);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics' | 'system' | 'audit' | 'push' | 'subscriptions' | 'schedules' | 'role_management'>('overview');
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
  const [searchTerm, setSearchTerm] = useState('');
  
  // Audit log state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditMeta, setAuditMeta] = useState<{ total: number; pages: number; page: number }>({ total: 0, pages: 1, page: 1 });
  const [auditFilters, setAuditFilters] = useState<{ actor: string; target: string; action: string; from: string; to: string }>({ actor: '', target: '', action: '', from: '', to: '' });

  useEffect(() => {
    if (!rbac.canAccessAdminConsole()) {
      // Redirect or show access denied
      return;
    }
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Simulate loading admin data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock users data
      setUsers([
        {
          id: 'user-1',
          email: 'admin@oncosaferx.com',
          firstName: 'System',
          lastName: 'Administrator',
          roles: ['super_admin'],
          isActive: true,
          lastLogin: new Date().toISOString(),
          loginCount: 156,
          organizationId: 'org-1'
        },
        {
          id: 'user-2',
          email: 'analytics@oncosaferx.com',
          firstName: 'Analytics',
          lastName: 'Manager',
          roles: ['analytics_admin'],
          isActive: true,
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          loginCount: 89,
          organizationId: 'org-1'
        },
        {
          id: 'user-3',
          email: 'dr.smith@hospital.com',
          firstName: 'Dr. Sarah',
          lastName: 'Smith',
          roles: ['oncologist'],
          isActive: true,
          lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          loginCount: 234,
          organizationId: 'org-2'
        },
        {
          id: 'user-4',
          email: 'pharmacist@hospital.com',
          firstName: 'Michael',
          lastName: 'Johnson',
          roles: ['pharmacist'],
          isActive: false,
          lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          loginCount: 45,
          organizationId: 'org-2'
        }
      ]);

      // Mock system metrics
      setSystemMetrics({
        totalUsers: 1247,
        activeUsers: 892,
        onlineUsers: 43,
        systemUptime: '15d 4h 32m',
        memoryUsage: 68.5,
        cpuUsage: 23.1,
        databaseConnections: 12,
        errorRate: 0.02
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
  const createSchedule = async () => {
    try { const resp = await fetch('/api/push/schedules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(schedForm) } as any); if (resp.ok) { setPushStatus('Schedule created'); setSchedForm({ title: '', body: '', url: '/', requireInteraction: false, scheduledAt: '', audience: 'all' }); loadSchedules(); } } catch {}
  };
  const deleteSchedule = async (id: string) => { try { await fetch(`/api/push/schedules/${id}`, { method: 'DELETE' } as any); loadSchedules(); } catch {} };
  const sendScheduleNow = async (id: string) => { try { await fetch(`/api/push/schedules/${id}/send`, { method: 'POST' } as any); loadSchedules(); } catch {} };

  useEffect(() => {
    if (activeTab === 'subscriptions') loadSubs();
    if (activeTab === 'schedules') loadSchedules();
    if (activeTab === 'role_management') loadRoleUsers();
  }, [activeTab]);

  const loadRoleUsers = async () => {
    try {
      const resp = await fetch('/api/admin/users?limit=200');
      const body = await resp.json();
      if (resp.ok) setRoleUsers((body?.users || []).map((u: any) => ({ id: u.id, email: u.email, full_name: u.full_name, role: u.role })));
    } catch {}
  };
  const saveUserRole = async (userId: string, newRole: string) => {
    setRoleBusy(userId);
    try {
      const resp = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: newRole }) } as any);
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
      
      const resp = await fetch(`/api/admin/audit?${params.toString()}`);
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
                onClick={() => setActiveTab('analytics')}
                className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <BarChart3 className="w-6 h-6 text-green-600" />
                <span className="font-medium text-green-900">View Analytics</span>
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
                onClick={() => setActiveTab('system')}
                className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Settings className="w-6 h-6 text-orange-600" />
                <span className="font-medium text-orange-900">System Settings</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      {/* User Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
          <p className="text-sm text-gray-600">Manage user accounts, roles, and permissions</p>
        </div>
        {rbac.hasPermission('manage_users') && (
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="system_admin">System Admin</option>
            <option value="analytics_admin">Analytics Admin</option>
            <option value="oncologist">Oncologist</option>
            <option value="pharmacist">Pharmacist</option>
            <option value="nurse">Nurse</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.filter(user => 
                user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(roleId => (
                        <span key={roleId} className="inline-flex px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                          {getRoleDisplayName(roleId)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatLastLogin(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.loginCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {rbac.hasPermission('manage_users') && (
                        <>
                          <button className="text-blue-600 hover:text-blue-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                        </>
                      )}
                      <button className="text-gray-600 hover:text-gray-900">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

  if (!rbac.canAccessAdminConsole()) {
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
      {/* Logout Button */}
      <LogoutButton />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
            <p className="text-gray-600">System administration and visitor analytics management</p>
          </div>
        </div>
      </div>

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
            { id: 'role_management', label: 'Role Management', icon: Users, permission: 'manage_roles' },
            { id: 'analytics', label: 'Analytics', icon: BarChart3, permission: 'view_visitor_analytics' },
            { id: 'system', label: 'System', icon: Settings, permission: 'manage_system_settings' },
            { id: 'audit', label: 'Audit Logs', icon: FileText, permission: 'view_audit_logs' },
            { id: 'push', label: 'Push', icon: Smartphone, permission: null },
            { id: 'subscriptions', label: 'Subscriptions', icon: Users, permission: null },
            { id: 'schedules', label: 'Schedules', icon: Clock, permission: null }
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
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'analytics' && renderAnalytics()}
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
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">System Settings</h3>
          <p className="text-gray-600">System configuration and settings management.</p>
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
      {activeTab === 'push' && (
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
      {activeTab === 'subscriptions' && (
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
      {activeTab === 'schedules' && (
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
    </div>
  );
};

export default AdminConsole;
