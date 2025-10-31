import React, { useState, useEffect } from 'react';
import {
  Users,
  Eye,
  Clock,
  MousePointer,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Search,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  MapPin,
  Shield,
  UserCheck,
  AlertCircle,
  Info,
  Settings
} from 'lucide-react';
import visitorTracking, { AnalyticsMetrics, VisitorSession } from '../../services/visitorTracking';
import RealTimeTracker from './RealTimeTracker';

interface AnalyticsPeriod {
  label: string;
  value: string;
  days: number;
}

const VisitorAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [currentSession, setCurrentSession] = useState<VisitorSession | null>(null);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'realtime' | 'privacy'>('overview');

  const periods: AnalyticsPeriod[] = [
    { label: 'Last 24 Hours', value: '1d', days: 1 },
    { label: 'Last 7 Days', value: '7d', days: 7 },
    { label: 'Last 30 Days', value: '30d', days: 30 },
    { label: 'Last 90 Days', value: '90d', days: 90 }
  ];

  useEffect(() => {
    loadAnalytics();
    setCurrentSession(visitorTracking.getCurrentSession());
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      console.log('📊 Loading visitor analytics for period:', selectedPeriod);
      // Get real analytics data from visitor tracking service
      const realAnalytics = await visitorTracking.getAnalytics(selectedPeriod);
      console.log('📊 Real analytics data received:', realAnalytics);
      
      setAnalytics(realAnalytics);
      setLoading(false);
      return;
      
      // Fallback mock data if needed
      const mockAnalytics: AnalyticsMetrics = {
        totalVisitors: 1247,
        uniqueVisitors: 892,
        pageViews: 4521,
        averageSessionDuration: 285, // seconds
        bounceRate: 0.34,
        topPages: [
          { url: '/', views: 1205 },
          { url: '/search', views: 987 },
          { url: '/interactions', views: 654 },
          { url: '/protocols', views: 432 },
          { url: '/patients', views: 321 }
        ],
        userRoles: [
          { role: 'oncologist', count: 456 },
          { role: 'pharmacist', count: 234 },
          { role: 'nurse', count: 178 },
          { role: 'researcher', count: 24 }
        ],
        deviceTypes: [
          { type: 'desktop', count: 567 },
          { type: 'mobile', count: 234 },
          { type: 'tablet', count: 91 }
        ],
        geographicDistribution: [
          { location: 'United States', count: 456 },
          { location: 'Canada', count: 123 },
          { location: 'United Kingdom', count: 87 },
          { location: 'Germany', count: 65 },
          { location: 'Australia', count: 43 }
        ]
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) {
      return '0';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getChangeIndicator = (value: number, isPositive: boolean = true) => {
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    const Icon = isPositive ? TrendingUp : TrendingDown;
    
    return (
      <div className={`flex items-center space-x-1 ${color}`}>
        <Icon className="w-3 h-3" />
        <span className="text-xs">{Math.abs(value)}%</span>
      </div>
    );
  };

  const renderMetricCard = (title: string, value: string | number, icon: React.ElementType, change?: number) => {
    const Icon = icon;
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change !== undefined && (
              <div className="mt-1">
                {getChangeIndicator(change, change > 0)}
              </div>
            )}
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
    );
  };

  const renderTopPages = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Top Pages</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {analytics?.topPages.map((page, index) => (
            <div key={(page as any).path || page.url || index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{(page as any).path || page.url}</p>
                  <p className="text-xs text-gray-500">{formatNumber(page.views)} views</p>
                </div>
              </div>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ 
                    width: `${(page.views / (analytics?.topPages[0]?.views || 1)) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUserRoles = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">User Roles</h3>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {analytics?.userRoles.map((role) => (
            <div key={role.role} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900 capitalize">{role.role}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{role.count}</span>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ 
                      width: `${(role.count / (analytics?.totalVisitors || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDeviceTypes = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Device Types</h3>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {analytics?.deviceTypes.map((device) => {
            const Icon = device.type === 'desktop' ? Monitor : 
                        device.type === 'mobile' ? Smartphone : Tablet;
            
            return (
              <div key={device.type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900 capitalize">{device.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{device.count}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ 
                        width: `${(device.count / (analytics?.totalVisitors || 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderGeographicDistribution = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Geographic Distribution</h3>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {(analytics?.geographicDistribution || []).map((location, index) => (
            <div key={location.location} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-900">{location.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{location.count}</span>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ 
                      width: `${(location.count / (analytics?.geographicDistribution[0]?.count || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCurrentSession = () => {
    if (!currentSession) return null;

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Current Session</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Session ID</p>
              <p className="text-sm font-mono text-gray-900">{currentSession.sessionId.slice(0, 8)}...</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Device</p>
              <p className="text-sm text-gray-900 capitalize">{currentSession.deviceType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Browser</p>
              <p className="text-sm text-gray-900">{currentSession.browser}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Page Views</p>
              <p className="text-sm text-gray-900">{currentSession.pageViews.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Start Time</p>
              <p className="text-sm text-gray-900">{new Date(currentSession.startTime).toLocaleTimeString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">User Role</p>
              <p className="text-sm text-gray-900 capitalize">{currentSession.userRole || 'Anonymous'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPrivacySettings = () => (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Privacy Settings</h3>
          <Shield className="w-5 h-5 text-green-600" />
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">HIPAA Compliant Tracking</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Our analytics system is designed to be HIPAA compliant. We do not track or store any 
                  patient health information (PHI) or personally identifiable information (PII).
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Anonymous Analytics</p>
                <p className="text-xs text-gray-600">Track usage patterns without personal data</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-green-600">Enabled</span>
                <div className="w-8 h-4 bg-green-500 rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Performance Monitoring</p>
                <p className="text-xs text-gray-600">Monitor application performance and errors</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-green-600">Enabled</span>
                <div className="w-8 h-4 bg-green-500 rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Location Tracking</p>
                <p className="text-xs text-gray-600">Approximate geographic location (country/region only)</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-xs text-blue-600 hover:text-blue-800">
                  {visitorTracking.isOptedOut() ? 'Opt In' : 'Opt Out'}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button 
              onClick={() => {
                if (visitorTracking.isOptedOut()) {
                  visitorTracking.optIn();
                } else {
                  visitorTracking.optOut();
                }
                window.location.reload();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                visitorTracking.isOptedOut() 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {visitorTracking.isOptedOut() ? 'Enable Analytics' : 'Disable All Analytics'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading analytics data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Visitor Analytics</h1>
              <p className="text-gray-600">Comprehensive visitor tracking and usage analytics</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>{period.label}</option>
              ))}
            </select>
            
            <button
              onClick={() => setShowPrivacySettings(!showPrivacySettings)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Privacy</span>
            </button>
            
            <button
              onClick={loadAnalytics}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      {visitorTracking.isOptedOut() && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Analytics Disabled</p>
              <p className="text-sm text-yellow-700">Visitor tracking is currently disabled. Enable it to see analytics data.</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Analytics Overview', icon: BarChart3 },
            { id: 'realtime', label: 'Real-Time Tracking', icon: Activity },
            { id: 'privacy', label: 'Privacy & Settings', icon: Shield }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
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
      {activeTab === 'overview' && analytics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {renderMetricCard('Total Visitors', formatNumber(analytics.totalVisitors), Users, 12.5)}
            {renderMetricCard('Unique Visitors', formatNumber(analytics.uniqueVisitors), Eye, 8.3)}
            {renderMetricCard('Page Views', formatNumber(analytics.pageViews), MousePointer, 15.7)}
            {renderMetricCard('Avg. Session', formatDuration(analytics.averageSessionDuration), Clock, -2.1)}
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bounce Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{(analytics.bounceRate * 100).toFixed(1)}%</p>
                  {getChangeIndicator(-5.2, false)}
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pages per Session</p>
                  <p className="text-2xl font-bold text-gray-900">{(analytics.pageViews / analytics.totalVisitors).toFixed(1)}</p>
                  {getChangeIndicator(7.8, true)}
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <PieChart className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Return Visitors</p>
                  <p className="text-2xl font-bold text-gray-900">{((analytics.totalVisitors - analytics.uniqueVisitors) / analytics.totalVisitors * 100).toFixed(1)}%</p>
                  {getChangeIndicator(3.4, true)}
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {renderTopPages()}
            {renderUserRoles()}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {renderDeviceTypes()}
            {renderGeographicDistribution()}
          </div>

          {/* Current Session */}
          {currentSession && renderCurrentSession()}
        </>
      )}

      {activeTab === 'realtime' && (
        <RealTimeTracker />
      )}

      {activeTab === 'privacy' && renderPrivacySettings()}
    </div>
  );
};

export default VisitorAnalyticsDashboard;
