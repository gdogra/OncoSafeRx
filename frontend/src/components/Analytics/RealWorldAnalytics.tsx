import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Users, Activity, AlertTriangle, Brain, Database, Filter, Download, RefreshCw, Shield } from 'lucide-react';
import Card from '../UI/Card';

interface AnalyticsData {
  drugUsage: Array<{
    drug: string;
    prescriptions: number;
    efficacy: number;
    safety: number;
    cost: number;
  }>;
  patientOutcomes: Array<{
    month: string;
    responseRate: number;
    survivalRate: number;
    qualityOfLife: number;
  }>;
  interactionTrends: Array<{
    severity: string;
    count: number;
    trend: number;
  }>;
  demographicInsights: Array<{
    ageGroup: string;
    totalPatients: number;
    averageResponse: number;
    commonSideEffects: string[];
  }>;
  genomicCorrelations: Array<{
    biomarker: string;
    responseRate: number;
    patientCount: number;
    significance: number;
  }>;
  realWorldEvidence: Array<{
    study: string;
    population: number;
    primaryEndpoint: string;
    result: number;
    confidence: number;
  }>;
}

interface RealWorldAnalyticsProps {
  timeRange?: '1M' | '3M' | '6M' | '1Y' | 'ALL';
  cancerType?: string;
  patientCohort?: string;
}

const RealWorldAnalytics: React.FC<RealWorldAnalyticsProps> = ({
  timeRange = '6M',
  cancerType = 'all',
  patientCohort = 'all'
}) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string>('outcomes');
  const [filters, setFilters] = useState({
    timeRange,
    cancerType,
    patientCohort,
    drugClass: 'all',
    biomarker: 'all'
  });

  // Mock data generation
  const generateMockData = (): AnalyticsData => {
    return {
      drugUsage: [
        { drug: 'Pembrolizumab', prescriptions: 1245, efficacy: 87, safety: 92, cost: 15000 },
        { drug: 'Nivolumab', prescriptions: 1089, efficacy: 84, safety: 89, cost: 14500 },
        { drug: 'Atezolizumab', prescriptions: 892, efficacy: 81, safety: 91, cost: 13800 },
        { drug: 'Ipilimumab', prescriptions: 675, efficacy: 78, safety: 85, cost: 16200 },
        { drug: 'Durvalumab', prescriptions: 543, efficacy: 83, safety: 88, cost: 13200 },
        { drug: 'Trastuzumab', prescriptions: 2145, efficacy: 89, safety: 94, cost: 8500 },
        { drug: 'Bevacizumab', prescriptions: 1876, efficacy: 76, safety: 87, cost: 7800 },
        { drug: 'Rituximab', prescriptions: 1654, efficacy: 85, safety: 92, cost: 6200 }
      ],
      patientOutcomes: [
        { month: 'Jan', responseRate: 68, survivalRate: 92, qualityOfLife: 74 },
        { month: 'Feb', responseRate: 71, survivalRate: 91, qualityOfLife: 76 },
        { month: 'Mar', responseRate: 73, survivalRate: 93, qualityOfLife: 78 },
        { month: 'Apr', responseRate: 75, survivalRate: 94, qualityOfLife: 79 },
        { month: 'May', responseRate: 77, survivalRate: 95, qualityOfLife: 81 },
        { month: 'Jun', responseRate: 79, survivalRate: 96, qualityOfLife: 83 }
      ],
      interactionTrends: [
        { severity: 'Major', count: 145, trend: -12 },
        { severity: 'Moderate', count: 342, trend: -8 },
        { severity: 'Minor', count: 567, trend: 5 },
        { severity: 'Contraindicated', count: 23, trend: -15 }
      ],
      demographicInsights: [
        { 
          ageGroup: '18-40', 
          totalPatients: 1245, 
          averageResponse: 78, 
          commonSideEffects: ['Fatigue', 'Nausea', 'Skin rash'] 
        },
        { 
          ageGroup: '41-60', 
          totalPatients: 2876, 
          averageResponse: 82, 
          commonSideEffects: ['Fatigue', 'Diarrhea', 'Hypertension'] 
        },
        { 
          ageGroup: '61-80', 
          totalPatients: 3421, 
          averageResponse: 75, 
          commonSideEffects: ['Fatigue', 'Neutropenia', 'Cardiotoxicity'] 
        },
        { 
          ageGroup: '80+', 
          totalPatients: 892, 
          averageResponse: 68, 
          commonSideEffects: ['Fatigue', 'Confusion', 'Falls'] 
        }
      ],
      genomicCorrelations: [
        { biomarker: 'PD-L1 High', responseRate: 89, patientCount: 1234, significance: 0.001 },
        { biomarker: 'HER2+', responseRate: 91, patientCount: 2145, significance: 0.0001 },
        { biomarker: 'BRCA1/2', responseRate: 87, patientCount: 567, significance: 0.002 },
        { biomarker: 'KRAS G12C', responseRate: 73, patientCount: 342, significance: 0.01 },
        { biomarker: 'EGFR T790M', responseRate: 68, patientCount: 789, significance: 0.005 },
        { biomarker: 'MSI-High', responseRate: 94, patientCount: 234, significance: 0.0001 }
      ],
      realWorldEvidence: [
        { 
          study: 'Real-world Pembrolizumab Outcomes', 
          population: 5432, 
          primaryEndpoint: 'Overall Response Rate', 
          result: 31.2, 
          confidence: 95 
        },
        { 
          study: 'Trastuzumab Effectiveness Study', 
          population: 8765, 
          primaryEndpoint: 'Progression-free Survival', 
          result: 18.7, 
          confidence: 98 
        },
        { 
          study: 'Checkpoint Inhibitor Safety Analysis', 
          population: 12543, 
          primaryEndpoint: 'Grade 3+ Adverse Events', 
          result: 24.8, 
          confidence: 99 
        }
      ]
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setData(generateMockData());
      setLoading(false);
    };
    loadData();
  }, [filters]);

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  const keyMetrics = useMemo(() => {
    if (!data) return null;
    
    return {
      totalPrescriptions: data.drugUsage.reduce((sum, drug) => sum + drug.prescriptions, 0),
      averageEfficacy: Math.round(data.drugUsage.reduce((sum, drug) => sum + drug.efficacy, 0) / data.drugUsage.length),
      totalPatients: data.demographicInsights.reduce((sum, group) => sum + group.totalPatients, 0),
      averageResponseRate: Math.round(data.patientOutcomes.reduce((sum, month) => sum + month.responseRate, 0) / data.patientOutcomes.length)
    };
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-xl font-semibold text-gray-900">Loading Real-World Analytics...</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Real-World Analytics Dashboard</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Brain className="w-4 h-4" />
              <span>AI-Enhanced Insights</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setData(generateMockData())}
              className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <select
            value={filters.timeRange}
            onChange={(e) => setFilters({...filters, timeRange: e.target.value as any})}
            className="text-sm border-gray-300 rounded-md"
          >
            <option value="1M">Last Month</option>
            <option value="3M">Last 3 Months</option>
            <option value="6M">Last 6 Months</option>
            <option value="1Y">Last Year</option>
            <option value="ALL">All Time</option>
          </select>
          <select
            value={filters.cancerType}
            onChange={(e) => setFilters({...filters, cancerType: e.target.value})}
            className="text-sm border-gray-300 rounded-md"
          >
            <option value="all">All Cancer Types</option>
            <option value="breast">Breast Cancer</option>
            <option value="lung">Lung Cancer</option>
            <option value="colorectal">Colorectal Cancer</option>
            <option value="melanoma">Melanoma</option>
          </select>
          <select
            value={filters.drugClass}
            onChange={(e) => setFilters({...filters, drugClass: e.target.value})}
            className="text-sm border-gray-300 rounded-md"
          >
            <option value="all">All Drug Classes</option>
            <option value="immunotherapy">Immunotherapy</option>
            <option value="targeted">Targeted Therapy</option>
            <option value="chemotherapy">Chemotherapy</option>
            <option value="hormone">Hormone Therapy</option>
          </select>
          <select
            value={filters.biomarker}
            onChange={(e) => setFilters({...filters, biomarker: e.target.value})}
            className="text-sm border-gray-300 rounded-md"
          >
            <option value="all">All Biomarkers</option>
            <option value="pdl1">PD-L1</option>
            <option value="her2">HER2</option>
            <option value="brca">BRCA1/2</option>
            <option value="kras">KRAS</option>
          </select>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="text-sm border-gray-300 rounded-md"
          >
            <option value="outcomes">Patient Outcomes</option>
            <option value="usage">Drug Usage</option>
            <option value="genomics">Genomic Insights</option>
            <option value="safety">Safety Profile</option>
          </select>
        </div>

        {/* Key Metrics */}
        {keyMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{keyMetrics.totalPrescriptions.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Prescriptions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{keyMetrics.averageEfficacy}%</div>
              <div className="text-sm text-gray-500">Average Efficacy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{keyMetrics.totalPatients.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Patients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{keyMetrics.averageResponseRate}%</div>
              <div className="text-sm text-gray-500">Response Rate</div>
            </div>
          </div>
        )}
      </Card>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Outcomes Trend */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Outcomes Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.patientOutcomes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="responseRate" stroke="#3B82F6" strokeWidth={2} name="Response Rate %" />
              <Line type="monotone" dataKey="survivalRate" stroke="#10B981" strokeWidth={2} name="Survival Rate %" />
              <Line type="monotone" dataKey="qualityOfLife" stroke="#8B5CF6" strokeWidth={2} name="Quality of Life %" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Drug Usage Analysis */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Drug Utilization & Efficacy</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.drugUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="drug" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="prescriptions" fill="#3B82F6" name="Prescriptions" />
              <Bar dataKey="efficacy" fill="#10B981" name="Efficacy %" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Genomic Correlations */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Biomarker Response Correlations</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.genomicCorrelations} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="biomarker" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="responseRate" fill="#8B5CF6" name="Response Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Demographics Breakdown */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Demographics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.demographicInsights}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ageGroup, totalPatients}) => `${ageGroup}: ${totalPatients}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="totalPatients"
              >
                {data.demographicInsights.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Interaction Trends */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Drug Interaction Safety Trends</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.interactionTrends.map((trend, index) => (
            <div key={trend.severity} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{trend.count}</div>
              <div className="text-sm text-gray-500">{trend.severity} Interactions</div>
              <div className={`text-xs mt-2 flex items-center justify-center space-x-1 ${
                trend.trend < 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`w-3 h-3 ${trend.trend < 0 ? 'rotate-180' : ''}`} />
                <span>{Math.abs(trend.trend)}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Real-World Evidence Studies */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-World Evidence Studies</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Study</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Population</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Endpoint</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.realWorldEvidence.map((study, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{study.study}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{study.population.toLocaleString()} patients</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{study.primaryEndpoint}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{study.result}%</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {study.confidence}% CI
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Insights */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI-Generated Insights</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Key Findings</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span>PD-L1 high patients show 89% response rate, significantly above average</span>
              </li>
              <li className="flex items-start space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Major drug interactions decreased by 12% due to improved screening</span>
              </li>
              <li className="flex items-start space-x-2">
                <Users className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>Elderly patients (80+) require enhanced monitoring protocols</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <Activity className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <span>Consider genetic testing for BRCA1/2 in appropriate patient populations</span>
              </li>
              <li className="flex items-start space-x-2">
                <Database className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                <span>Implement predictive models for treatment response optimization</span>
              </li>
              <li className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Enhanced pharmacovigilance needed for combination therapies</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RealWorldAnalytics;
