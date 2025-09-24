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
  
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics' | 'system' | 'audit'>('overview');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
            { id: 'analytics', label: 'Analytics', icon: BarChart3, permission: 'view_visitor_analytics' },
            { id: 'system', label: 'System', icon: Settings, permission: 'manage_system_settings' },
            { id: 'audit', label: 'Audit Logs', icon: FileText, permission: 'view_audit_logs' }
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
      {activeTab === 'system' && (
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">System Settings</h3>
          <p className="text-gray-600">System configuration and settings management.</p>
        </div>
      )}
      {activeTab === 'audit' && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Audit Logs</h3>
          <p className="text-gray-600">System audit trails and compliance logging.</p>
        </div>
      )}
    </div>
  );
};

export default AdminConsole;