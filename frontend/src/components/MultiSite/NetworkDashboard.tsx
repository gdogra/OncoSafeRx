/**
 * Multi-Site Network Dashboard
 * Provides overview and management for multi-site clinical network
 */

import React, { useEffect, useState } from 'react';
import { NetworkSite, MultiSitePatientProfile } from '../../types/multiSite';
import { useMultiSitePatient } from '../../context/MultiSitePatientContext';
import { multiSiteAccessService } from '../../services/multiSiteAccessService';
import Card from '../UI/Card';
import Badge from '../UI/Badge';
import { 
  Globe, 
  Users, 
  Activity, 
  Shield, 
  ArrowRightLeft, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Network,
  Database,
  Eye,
  UserPlus,
  FileText
} from 'lucide-react';

interface NetworkStats {
  totalSites: number;
  connectedSites: number;
  totalPatients: number;
  crossSiteReferrals: number;
  activeConsultations: number;
  emergencyAccess: number;
}

interface RecentActivity {
  id: string;
  type: 'referral' | 'consultation' | 'transfer' | 'emergency_access';
  description: string;
  timestamp: string;
  sites: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

export const NetworkDashboard: React.FC = () => {
  const { state } = useMultiSitePatient();
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    totalSites: 0,
    connectedSites: 0,
    totalPatients: 0,
    crossSiteReferrals: 0,
    activeConsultations: 0,
    emergencyAccess: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [selectedSite, setSelectedSite] = useState<NetworkSite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNetworkData();
  }, []);

  const loadNetworkData = async () => {
    try {
      setLoading(true);
      
      // Load network statistics
      const stats = await fetchNetworkStats();
      setNetworkStats(stats);
      
      // Load recent cross-site activity
      const activity = await fetchRecentActivity();
      setRecentActivity(activity);
      
    } catch (error) {
      console.error('Error loading network data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNetworkStats = async (): Promise<NetworkStats> => {
    // Mock data - in real implementation, this would fetch from API
    return {
      totalSites: state.accessibleSites.length,
      connectedSites: state.accessibleSites.filter(site => state.networkConnected).length,
      totalPatients: state.recentPatients.length,
      crossSiteReferrals: state.crossSiteActivity.referrals.length,
      activeConsultations: state.crossSiteActivity.consultations.filter(c => c.status === 'in_progress').length,
      emergencyAccess: 0
    };
  };

  const fetchRecentActivity = async (): Promise<RecentActivity[]> => {
    // Mock data - in real implementation, this would fetch from API
    return [
      {
        id: '1',
        type: 'referral',
        description: 'Oncology referral from Community Hospital to Cancer Center',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        sites: ['site1', 'site2'],
        status: 'pending'
      },
      {
        id: '2',
        type: 'consultation',
        description: 'Virtual tumor board consultation requested',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        sites: ['site2', 'site3'],
        status: 'in_progress'
      },
      {
        id: '3',
        type: 'emergency_access',
        description: 'Emergency break-glass access granted',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        sites: ['site1'],
        status: 'completed'
      }
    ];
  };

  const getSiteByType = (type: string) => {
    return state.accessibleSites.filter(site => site.siteType === type);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'referral': return <ArrowRightLeft className="h-4 w-4" />;
      case 'consultation': return <Users className="h-4 w-4" />;
      case 'transfer': return <ArrowRightLeft className="h-4 w-4" />;
      case 'emergency_access': return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Overview Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Globe className="h-8 w-8 mr-3" />
              OncoSafeRx Global Network
            </h1>
            <p className="text-blue-100 mt-1">
              Multi-site healthcare collaboration platform
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Current Site</div>
            <div className="text-lg font-semibold">
              {state.accessibleSites.find(s => s.siteId === state.currentSiteContext)?.siteName || 'Unknown'}
            </div>
          </div>
        </div>
      </div>

      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Network className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Network Sites</p>
              <p className="text-2xl font-bold text-gray-900">
                {networkStats.connectedSites}/{networkStats.totalSites}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Accessible Patients</p>
              <p className="text-2xl font-bold text-gray-900">{networkStats.totalPatients}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ArrowRightLeft className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Cross-Site Referrals</p>
              <p className="text-2xl font-bold text-gray-900">{networkStats.crossSiteReferrals}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Consultations</p>
              <p className="text-2xl font-bold text-gray-900">{networkStats.activeConsultations}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Sites */}
        <Card>
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-500" />
              Network Sites
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {state.accessibleSites.slice(0, 5).map((site) => (
                <div 
                  key={site.siteId} 
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedSite?.siteId === site.siteId ? 'border-blue-300 bg-blue-50' : 'hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedSite(selectedSite?.siteId === site.siteId ? null : site)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{site.siteName}</h4>
                      <p className="text-sm text-gray-500">
                        {site.location.city}, {site.location.country}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {site.siteType.replace(/_/g, ' ')}
                      </Badge>
                      {state.networkConnected ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  {selectedSite?.siteId === site.siteId && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Data Sharing:</span>
                          <span className="ml-2 font-medium">{site.dataSharing.level}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Specialties:</span>
                          <span className="ml-2 font-medium">{site.clinical?.specialties.length || 0}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                          View Details
                        </button>
                        <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                          Switch Context
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {state.accessibleSites.length > 5 && (
              <div className="mt-4 text-center">
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  View all {state.accessibleSites.length} sites
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Recent Cross-Site Activity
            </h3>
          </div>
          <div className="p-6">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent cross-site activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <div className="p-1 rounded-full bg-white">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className={`text-xs ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Site Distribution by Type */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Network Composition</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {getSiteByType('academic_medical_center').length}
              </div>
              <div className="text-sm text-gray-600">Academic Centers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {getSiteByType('cancer_center').length}
              </div>
              <div className="text-sm text-gray-600">Cancer Centers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {getSiteByType('community_hospital').length}
              </div>
              <div className="text-sm text-gray-600">Community Hospitals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {getSiteByType('research_institute').length}
              </div>
              <div className="text-sm text-gray-600">Research Institutes</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 text-center border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <UserPlus className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-sm font-medium">Create Referral</div>
            </button>
            <button className="p-4 text-center border rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
              <Users className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-sm font-medium">Request Consultation</div>
            </button>
            <button className="p-4 text-center border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <Eye className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-sm font-medium">View Access Logs</div>
            </button>
            <button className="p-4 text-center border rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors">
              <FileText className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-sm font-medium">Generate Report</div>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};