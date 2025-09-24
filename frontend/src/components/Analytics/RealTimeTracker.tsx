import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Users,
  Eye,
  Clock,
  MousePointer,
  TrendingUp,
  Wifi,
  Circle,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw
} from 'lucide-react';

interface LiveMetrics {
  activeUsers: number;
  currentPageViews: number;
  recentActivities: LiveActivity[];
  deviceBreakdown: { [key: string]: number };
  topPages: { url: string; activeUsers: number }[];
  averageSessionTime: number;
  bounceRate: number;
}

interface LiveActivity {
  id: string;
  type: 'page_view' | 'interaction' | 'session_start' | 'session_end';
  timestamp: string;
  userRole?: string;
  deviceType: string;
  location?: string;
  pageUrl?: string;
  details?: string;
}

const RealTimeTracker: React.FC = () => {
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    activeUsers: 0,
    currentPageViews: 0,
    recentActivities: [],
    deviceBreakdown: {},
    topPages: [],
    averageSessionTime: 0,
    bounceRate: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      // In a real implementation, this would connect to your analytics WebSocket
      // For now, we'll simulate real-time data
      simulateRealTimeData();
      setIsConnected(true);
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setIsConnected(false);
      
      // Retry connection after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 5000);
    }
  };

  const simulateRealTimeData = () => {
    const interval = setInterval(() => {
      const mockActivity: LiveActivity = {
        id: `activity-${Date.now()}`,
        type: ['page_view', 'interaction', 'session_start'][Math.floor(Math.random() * 3)] as any,
        timestamp: new Date().toISOString(),
        userRole: ['oncologist', 'pharmacist', 'nurse'][Math.floor(Math.random() * 3)],
        deviceType: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
        location: ['United States', 'Canada', 'United Kingdom'][Math.floor(Math.random() * 3)],
        pageUrl: ['/dashboard', '/search', '/interactions', '/protocols'][Math.floor(Math.random() * 4)],
        details: 'User activity detected'
      };

      setLiveMetrics(prev => ({
        activeUsers: Math.max(1, prev.activeUsers + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0)),
        currentPageViews: prev.currentPageViews + (mockActivity.type === 'page_view' ? 1 : 0),
        recentActivities: [mockActivity, ...prev.recentActivities.slice(0, 19)],
        deviceBreakdown: {
          desktop: (prev.deviceBreakdown.desktop || 0) + (mockActivity.deviceType === 'desktop' ? 1 : 0),
          mobile: (prev.deviceBreakdown.mobile || 0) + (mockActivity.deviceType === 'mobile' ? 1 : 0),
          tablet: (prev.deviceBreakdown.tablet || 0) + (mockActivity.deviceType === 'tablet' ? 1 : 0)
        },
        topPages: [
          { url: '/dashboard', activeUsers: Math.floor(Math.random() * 15) + 5 },
          { url: '/search', activeUsers: Math.floor(Math.random() * 12) + 3 },
          { url: '/interactions', activeUsers: Math.floor(Math.random() * 8) + 2 },
          { url: '/protocols', activeUsers: Math.floor(Math.random() * 6) + 1 }
        ],
        averageSessionTime: 180 + Math.floor(Math.random() * 120),
        bounceRate: 0.2 + Math.random() * 0.3
      }));

      setLastUpdate(new Date());
    }, 2000 + Math.random() * 3000); // Random interval between 2-5 seconds

    // Clean up interval after 10 minutes to prevent memory leaks
    setTimeout(() => {
      clearInterval(interval);
    }, 600000);

    return interval;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'page_view': return <Eye className="w-3 h-3" />;
      case 'interaction': return <MousePointer className="w-3 h-3" />;
      case 'session_start': return <Users className="w-3 h-3" />;
      case 'session_end': return <Users className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'page_view': return 'text-blue-600 bg-blue-100';
      case 'interaction': return 'text-green-600 bg-green-100';
      case 'session_start': return 'text-purple-600 bg-purple-100';
      case 'session_end': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop': return <Monitor className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              <Circle className={`w-2 h-2 ${isConnected ? 'fill-green-600' : 'fill-red-600'}`} />
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isConnected ? 'Live Tracking Active' : 'Connection Lost'}
              </span>
            </div>
            {lastUpdate && (
              <span className="text-xs text-gray-500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
          <button
            onClick={connectWebSocket}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">{liveMetrics.activeUsers}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Page Views</p>
              <p className="text-2xl font-bold text-blue-600">{liveMetrics.currentPageViews}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Session</p>
              <p className="text-2xl font-bold text-purple-600">{Math.floor(liveMetrics.averageSessionTime / 60)}m</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bounce Rate</p>
              <p className="text-2xl font-bold text-orange-600">{(liveMetrics.bounceRate * 100).toFixed(1)}%</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Live Activity Feed & Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Activity Feed */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {liveMetrics.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className={`p-1 rounded-full ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {activity.type.replace('_', ' ')}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {getDeviceIcon(activity.deviceType)}
                      <span className="text-xs text-gray-600 capitalize">{activity.userRole}</span>
                      {activity.pageUrl && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-600">{activity.pageUrl}</span>
                        </>
                      )}
                      {activity.location && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{activity.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device Breakdown & Top Pages */}
        <div className="space-y-6">
          {/* Device Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Live Device Breakdown</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {Object.entries(liveMetrics.deviceBreakdown).map(([device, count]) => (
                  <div key={device} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getDeviceIcon(device)}
                      <span className="text-sm font-medium text-gray-900 capitalize">{device}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{count}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ 
                            width: `${Math.min(100, (count / Math.max(1, Math.max(...Object.values(liveMetrics.deviceBreakdown)))) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Active Pages</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {liveMetrics.topPages.map((page, index) => (
                  <div key={page.url} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500 w-4">{index + 1}</span>
                      <span className="text-sm font-medium text-gray-900">{page.url}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{page.activeUsers} users</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ 
                            width: `${(page.activeUsers / Math.max(1, liveMetrics.topPages[0]?.activeUsers || 1)) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeTracker;