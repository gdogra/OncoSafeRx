import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Activity, 
  Clock, 
  Target, 
  Brain,
  Heart,
  Shield,
  Zap,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AnalyticsData {
  patientMetrics: {
    totalPatients: number;
    activePatients: number;
    newPatients: number;
    riskDistribution: { level: string; count: number; percentage: number }[];
  };
  drugUsage: {
    topDrugs: { name: string; usage: number; trend: number }[];
    categoryDistribution: { category: string; count: number; percentage: number }[];
    safetyAlerts: number;
  };
  interactions: {
    totalChecks: number;
    alertsGenerated: number;
    severityBreakdown: { severity: string; count: number; color: string }[];
    trends: { date: string; checks: number; alerts: number }[];
  };
  dosing: {
    calculationsPerformed: number;
    adjustmentsRecommended: number;
    averageSafetyScore: number;
    doseModifications: { reason: string; count: number }[];
  };
  system: {
    uptime: string;
    responseTime: number;
    apiCalls: number;
    errorRate: number;
  };
}

interface TimeRange {
  label: string;
  value: string;
  days: number;
}

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>({
    label: 'Last 30 Days',
    value: '30d',
    days: 30
  });
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['overview', 'patients', 'drugs'])
  );

  const timeRanges: TimeRange[] = [
    { label: 'Last 7 Days', value: '7d', days: 7 },
    { label: 'Last 30 Days', value: '30d', days: 30 },
    { label: 'Last 90 Days', value: '90d', days: 90 },
    { label: 'Last Year', value: '1y', days: 365 }
  ];

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call with realistic healthcare data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: AnalyticsData = {
        patientMetrics: {
          totalPatients: 2847,
          activePatients: 1923,
          newPatients: 156,
          riskDistribution: [
            { level: 'Low Risk', count: 1421, percentage: 73.9 },
            { level: 'Moderate Risk', count: 387, percentage: 20.1 },
            { level: 'High Risk', count: 115, percentage: 6.0 }
          ]
        },
        drugUsage: {
          topDrugs: [
            { name: 'Carboplatin', usage: 234, trend: 12 },
            { name: 'Pembrolizumab', usage: 189, trend: 28 },
            { name: 'Doxorubicin', usage: 167, trend: -5 },
            { name: 'Cisplatin', usage: 145, trend: -8 },
            { name: 'Imatinib', usage: 123, trend: 15 }
          ],
          categoryDistribution: [
            { category: 'Immunotherapy', count: 456, percentage: 28.7 },
            { category: 'Targeted Therapy', count: 389, percentage: 24.5 },
            { category: 'Alkylating Agents', count: 312, percentage: 19.6 },
            { category: 'Antimetabolites', count: 234, percentage: 14.7 },
            { category: 'Anthracyclines', count: 198, percentage: 12.5 }
          ],
          safetyAlerts: 67
        },
        interactions: {
          totalChecks: 5432,
          alertsGenerated: 892,
          severityBreakdown: [
            { severity: 'Critical', count: 23, color: 'red' },
            { severity: 'Major', count: 156, color: 'orange' },
            { severity: 'Moderate', count: 398, color: 'yellow' },
            { severity: 'Minor', count: 315, color: 'blue' }
          ],
          trends: generateTrendData(selectedTimeRange.days)
        },
        dosing: {
          calculationsPerformed: 3241,
          adjustmentsRecommended: 1567,
          averageSafetyScore: 87.3,
          doseModifications: [
            { reason: 'Renal Impairment', count: 234 },
            { reason: 'Hepatic Impairment', count: 156 },
            { reason: 'Age Adjustment', count: 189 },
            { reason: 'Drug Interactions', count: 123 },
            { reason: 'Patient Weight', count: 98 }
          ]
        },
        system: {
          uptime: '99.97%',
          responseTime: 245,
          apiCalls: 18654,
          errorRate: 0.12
        }
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTrendData = (days: number) => {
    const trends = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        checks: Math.floor(Math.random() * 200) + 50,
        alerts: Math.floor(Math.random() * 40) + 5
      });
    }
    
    return trends;
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'blue',
    subtitle 
  }: {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ComponentType<any>;
    color?: string;
    subtitle?: string;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      red: 'bg-red-100 text-red-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600'
    };

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        
        {change !== undefined && (
          <div className="mt-4 flex items-center">
            <TrendingUp className={`w-4 h-4 mr-1 ${
              change >= 0 ? 'text-green-500' : 'text-red-500 rotate-180'
            }`} />
            <span className={`text-sm font-medium ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        )}
      </div>
    );
  };

  const SectionHeader = ({ 
    title, 
    sectionId, 
    icon: Icon,
    actionButton 
  }: {
    title: string;
    sectionId: string;
    icon: React.ComponentType<any>;
    actionButton?: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between">
      <button
        onClick={() => toggleSection(sectionId)}
        className="flex items-center space-x-3 text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors"
      >
        <Icon className="w-5 h-5 text-blue-600" />
        <span>{title}</span>
        {expandedSections.has(sectionId) ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {actionButton}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load analytics data</h3>
        <button
          onClick={loadAnalyticsData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Comprehensive insights into platform usage, patient safety, and clinical outcomes
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeRange.value}
            onChange={(e) => {
              const range = timeRanges.find(r => r.value === e.target.value);
              if (range) setSelectedTimeRange(range);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={loadAnalyticsData}
            className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="space-y-4">
        <SectionHeader
          title="Overview Metrics"
          sectionId="overview"
          icon={Activity}
        />
        
        {expandedSections.has('overview') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Patients"
              value={data.patientMetrics.totalPatients.toLocaleString()}
              change={8.2}
              icon={Users}
              color="blue"
            />
            <MetricCard
              title="Drug Interactions Checked"
              value={data.interactions.totalChecks.toLocaleString()}
              change={12.5}
              icon={Shield}
              color="green"
            />
            <MetricCard
              title="Safety Alerts Generated"
              value={data.interactions.alertsGenerated}
              change={-3.2}
              icon={AlertTriangle}
              color="yellow"
            />
            <MetricCard
              title="Average Safety Score"
              value={`${data.dosing.averageSafetyScore}%`}
              change={2.1}
              icon={Target}
              color="purple"
            />
          </div>
        )}
      </div>

      {/* Patient Analytics */}
      <div className="space-y-4">
        <SectionHeader
          title="Patient Analytics"
          sectionId="patients"
          icon={Users}
          actionButton={
            <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </button>
          }
        />
        
        {expandedSections.has('patients') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Patients</span>
                  <span className="font-medium">{data.patientMetrics.activePatients.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New Patients (this period)</span>
                  <span className="font-medium text-green-600">+{data.patientMetrics.newPatients}</span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-sm text-gray-600 mb-2">Patient Activity Rate</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(data.patientMetrics.activePatients / data.patientMetrics.totalPatients) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round((data.patientMetrics.activePatients / data.patientMetrics.totalPatients) * 100)}% of total patients
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Distribution</h3>
              <div className="space-y-3">
                {data.patientMetrics.riskDistribution.map((risk, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        risk.level === 'Low Risk' ? 'bg-green-500' :
                        risk.level === 'Moderate Risk' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm text-gray-700">{risk.level}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{risk.count.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{risk.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drug Usage Analytics */}
      <div className="space-y-4">
        <SectionHeader
          title="Drug Usage Analytics"
          sectionId="drugs"
          icon={Zap}
        />
        
        {expandedSections.has('drugs') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Prescribed Drugs</h3>
              <div className="space-y-3">
                {data.drugUsage.topDrugs.map((drug, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{drug.name}</div>
                      <div className="text-sm text-gray-500">Rank #{index + 1}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{drug.usage} prescriptions</div>
                      <div className={`text-sm flex items-center ${
                        drug.trend >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className={`w-3 h-3 mr-1 ${drug.trend < 0 ? 'rotate-180' : ''}`} />
                        {drug.trend >= 0 ? '+' : ''}{drug.trend}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Drug Category Distribution</h3>
              <div className="space-y-3">
                {data.drugUsage.categoryDistribution.map((category, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{category.category}</span>
                      <span className="text-sm font-medium">{category.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interaction Alerts */}
      <div className="space-y-4">
        <SectionHeader
          title="Drug Interaction Analysis"
          sectionId="interactions"
          icon={Shield}
        />
        
        {expandedSections.has('interactions') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Severity Breakdown</h3>
              <div className="space-y-3">
                {data.interactions.severityBreakdown.map((severity, index) => {
                  const colorClasses = {
                    red: 'bg-red-500',
                    orange: 'bg-orange-500',
                    yellow: 'bg-yellow-500',
                    blue: 'bg-blue-500'
                  };
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${colorClasses[severity.color as keyof typeof colorClasses]}`}></div>
                        <span className="text-sm text-gray-700">{severity.severity}</span>
                      </div>
                      <span className="font-medium">{severity.count}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Alert Rate</span>
                  <span className="font-medium">
                    {Math.round((data.interactions.alertsGenerated / data.interactions.totalChecks) * 100)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Interaction Trends</h3>
              <div className="h-64 flex items-end space-x-1">
                {data.interactions.trends.slice(-14).map((day, index) => {
                  const maxValue = Math.max(...data.interactions.trends.map(d => d.checks));
                  const height = (day.checks / maxValue) * 100;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-blue-200 rounded-t" style={{ height: `${height}%` }}>
                        <div 
                          className="w-full bg-red-400 rounded-t" 
                          style={{ height: `${(day.alerts / day.checks) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-200 rounded"></div>
                  <span className="text-gray-600">Total Checks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded"></div>
                  <span className="text-gray-600">Alerts Generated</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* System Performance */}
      <div className="space-y-4">
        <SectionHeader
          title="System Performance"
          sectionId="system"
          icon={Activity}
        />
        
        {expandedSections.has('system') && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="System Uptime"
              value={data.system.uptime}
              icon={Clock}
              color="green"
              subtitle="Last 30 days"
            />
            <MetricCard
              title="Response Time"
              value={`${data.system.responseTime}ms`}
              icon={Zap}
              color="blue"
              subtitle="Average API response"
            />
            <MetricCard
              title="API Calls"
              value={data.system.apiCalls.toLocaleString()}
              icon={Activity}
              color="purple"
              subtitle="This period"
            />
            <MetricCard
              title="Error Rate"
              value={`${data.system.errorRate}%`}
              icon={AlertTriangle}
              color="yellow"
              subtitle="Last 24 hours"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;