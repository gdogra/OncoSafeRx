import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Area, AreaChart } from 'recharts';
import { DollarSign, TrendingUp, Users, Clock, Target, Award, AlertTriangle, CheckCircle, Brain, Zap } from 'lucide-react';
import Card from '../UI/Card';
import LoadingSpinner from '../UI/LoadingSpinner';
import FeatureErrorBoundary from '../ErrorBoundary/FeatureErrorBoundary';

interface ROIMetrics {
  totalPatients: number;
  precisionMedicinePatients: number;
  genomicTestingRate: number;
  averageCostPerPatient: number;
  averageOutcome: number;
  costSavings: number;
  revenueIncrease: number;
  efficiencyGains: number;
  qualityImprovement: number;
}

interface CostAnalysis {
  traditional: {
    diagnostics: number;
    treatment: number;
    monitoring: number;
    adverse_events: number;
    hospitalizations: number;
  };
  precision: {
    genomic_testing: number;
    targeted_therapy: number;
    monitoring: number;
    adverse_events: number;
    hospitalizations: number;
  };
  savings: {
    total: number;
    per_patient: number;
    percentage: number;
  };
}

interface OutcomeMetrics {
  responseRates: {
    traditional: number;
    precision: number;
    improvement: number;
  };
  survivalBenefit: {
    traditional: number;
    precision: number;
    months_gained: number;
  };
  qualityOfLife: {
    traditional: number;
    precision: number;
    improvement: number;
  };
  timeToTreatment: {
    traditional: number;
    precision: number;
    reduction: number;
  };
}

interface ImplementationMetrics {
  timeline: Array<{
    month: string;
    patients_enrolled: number;
    genomic_tests_ordered: number;
    precision_treatments: number;
    cost_savings: number;
    roi_percentage: number;
  }>;
  milestones: Array<{
    date: string;
    milestone: string;
    impact: number;
    status: 'completed' | 'in_progress' | 'planned';
  }>;
}

interface BenchmarkData {
  practice_size: string;
  national_average: {
    genomic_testing_rate: number;
    precision_medicine_adoption: number;
    average_roi: number;
    cost_per_patient: number;
  };
  top_quartile: {
    genomic_testing_rate: number;
    precision_medicine_adoption: number;
    average_roi: number;
    cost_per_patient: number;
  };
  current_practice: {
    genomic_testing_rate: number;
    precision_medicine_adoption: number;
    average_roi: number;
    cost_per_patient: number;
  };
}

const PracticeROIDashboard: React.FC = () => {
  const [roiMetrics, setRoiMetrics] = useState<ROIMetrics | null>(null);
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis | null>(null);
  const [outcomeMetrics, setOutcomeMetrics] = useState<OutcomeMetrics | null>(null);
  const [implementationData, setImplementationData] = useState<ImplementationMetrics | null>(null);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
  const [timeframe, setTimeframe] = useState<'3M' | '6M' | '12M' | '24M'>('12M');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'roi' | 'cost' | 'outcomes' | 'implementation'>('roi');

  useEffect(() => {
    loadROIData();
  }, [timeframe]);

  const loadROIData = async () => {
    setIsLoading(true);
    
    try {
      // Simulate loading comprehensive ROI data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockROIMetrics: ROIMetrics = {
        totalPatients: 450,
        precisionMedicinePatients: 285,
        genomicTestingRate: 78,
        averageCostPerPatient: 18500,
        averageOutcome: 85,
        costSavings: 1250000,
        revenueIncrease: 850000,
        efficiencyGains: 35,
        qualityImprovement: 42
      };

      const mockCostAnalysis: CostAnalysis = {
        traditional: {
          diagnostics: 2500,
          treatment: 45000,
          monitoring: 8500,
          adverse_events: 12000,
          hospitalizations: 25000
        },
        precision: {
          genomic_testing: 3500,
          targeted_therapy: 38000,
          monitoring: 6500,
          adverse_events: 4500,
          hospitalizations: 8000
        },
        savings: {
          total: 30000,
          per_patient: 18500,
          percentage: 32
        }
      };

      const mockOutcomeMetrics: OutcomeMetrics = {
        responseRates: {
          traditional: 42,
          precision: 78,
          improvement: 86
        },
        survivalBenefit: {
          traditional: 14.2,
          precision: 22.8,
          months_gained: 8.6
        },
        qualityOfLife: {
          traditional: 6.2,
          precision: 7.8,
          improvement: 26
        },
        timeToTreatment: {
          traditional: 21,
          precision: 12,
          reduction: 43
        }
      };

      const mockImplementationData: ImplementationMetrics = {
        timeline: [
          { month: 'Jan', patients_enrolled: 15, genomic_tests_ordered: 12, precision_treatments: 8, cost_savings: 45000, roi_percentage: 12 },
          { month: 'Feb', patients_enrolled: 28, genomic_tests_ordered: 22, precision_treatments: 18, cost_savings: 89000, roi_percentage: 24 },
          { month: 'Mar', patients_enrolled: 42, genomic_tests_ordered: 35, precision_treatments: 28, cost_savings: 145000, roi_percentage: 38 },
          { month: 'Apr', patients_enrolled: 55, genomic_tests_ordered: 48, precision_treatments: 38, cost_savings: 198000, roi_percentage: 48 },
          { month: 'May', patients_enrolled: 68, genomic_tests_ordered: 58, precision_treatments: 48, cost_savings: 268000, roi_percentage: 58 },
          { month: 'Jun', patients_enrolled: 82, genomic_tests_ordered: 72, precision_treatments: 58, cost_savings: 325000, roi_percentage: 68 },
          { month: 'Jul', patients_enrolled: 95, genomic_tests_ordered: 85, precision_treatments: 68, cost_savings: 385000, roi_percentage: 75 },
          { month: 'Aug', patients_enrolled: 108, genomic_tests_ordered: 98, precision_treatments: 78, cost_savings: 445000, roi_percentage: 82 },
          { month: 'Sep', patients_enrolled: 125, genomic_tests_ordered: 112, precision_treatments: 88, cost_savings: 525000, roi_percentage: 88 },
          { month: 'Oct', patients_enrolled: 142, genomic_tests_ordered: 128, precision_treatments: 98, cost_savings: 598000, roi_percentage: 92 },
          { month: 'Nov', patients_enrolled: 155, genomic_tests_ordered: 142, precision_treatments: 108, cost_savings: 668000, roi_percentage: 95 },
          { month: 'Dec', patients_enrolled: 168, genomic_tests_ordered: 155, precision_treatments: 118, cost_savings: 735000, roi_percentage: 98 }
        ],
        milestones: [
          { date: '2024-02-15', milestone: 'OncoSafeRx Platform Launch', impact: 25, status: 'completed' },
          { date: '2024-04-01', milestone: 'Genomic Testing Integration', impact: 45, status: 'completed' },
          { date: '2024-06-15', milestone: 'AI Treatment Recommendations', impact: 35, status: 'completed' },
          { date: '2024-08-01', milestone: 'Clinical Trial Matching', impact: 28, status: 'completed' },
          { date: '2024-10-15', milestone: 'Real-world Evidence Integration', impact: 22, status: 'in_progress' },
          { date: '2024-12-01', milestone: 'Full Practice Integration', impact: 40, status: 'planned' }
        ]
      };

      const mockBenchmarkData: BenchmarkData = {
        practice_size: 'Medium (200-500 patients)',
        national_average: {
          genomic_testing_rate: 35,
          precision_medicine_adoption: 28,
          average_roi: 15,
          cost_per_patient: 28500
        },
        top_quartile: {
          genomic_testing_rate: 65,
          precision_medicine_adoption: 58,
          average_roi: 45,
          cost_per_patient: 19500
        },
        current_practice: {
          genomic_testing_rate: 78,
          precision_medicine_adoption: 63,
          average_roi: 68,
          cost_per_patient: 18500
        }
      };

      setRoiMetrics(mockROIMetrics);
      setCostAnalysis(mockCostAnalysis);
      setOutcomeMetrics(mockOutcomeMetrics);
      setImplementationData(mockImplementationData);
      setBenchmarkData(mockBenchmarkData);
      
    } catch (error) {
      console.error('Error loading ROI data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMetricColor = (value: number, benchmark: number) => {
    if (value >= benchmark * 1.2) return 'text-green-600';
    if (value >= benchmark) return 'text-blue-600';
    if (value >= benchmark * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-lg">Loading practice analytics and ROI data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <DollarSign className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Practice Analytics & ROI</h1>
            <p className="text-gray-600">Precision medicine implementation impact and financial analysis</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as '3M' | '6M' | '12M' | '24M')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="3M">3 Months</option>
            <option value="6M">6 Months</option>
            <option value="12M">12 Months</option>
            <option value="24M">24 Months</option>
          </select>
          <button
            onClick={loadROIData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Update Analytics</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      {roiMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Cost Savings</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(roiMetrics.costSavings)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {formatCurrency(roiMetrics.costSavings / roiMetrics.totalPatients)} per patient
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Revenue Increase</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(roiMetrics.revenueIncrease)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                +{Math.round((roiMetrics.revenueIncrease / (roiMetrics.revenueIncrease - roiMetrics.costSavings)) * 100)}% improvement
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Precision Medicine Rate</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((roiMetrics.precisionMedicinePatients / roiMetrics.totalPatients) * 100)}%
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {roiMetrics.precisionMedicinePatients} of {roiMetrics.totalPatients} patients
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Overall ROI</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(((roiMetrics.costSavings + roiMetrics.revenueIncrease) / roiMetrics.costSavings) * 100)}%
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Return on investment
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Metric Selection */}
      <Card>
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-900">Analysis View:</span>
            {(['roi', 'cost', 'outcomes', 'implementation'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedMetric === metric
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {metric === 'roi' && <DollarSign className="w-4 h-4" />}
                {metric === 'cost' && <TrendingUp className="w-4 h-4" />}
                {metric === 'outcomes' && <Target className="w-4 h-4" />}
                {metric === 'implementation' && <Clock className="w-4 h-4" />}
                <span className="capitalize">{metric === 'roi' ? 'ROI Analysis' : metric}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ROI Analysis */}
      {selectedMetric === 'roi' && implementationData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="text-xl font-semibold">ROI Timeline</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={implementationData.timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'cost_savings') return [formatCurrency(value), 'Cost Savings'];
                      if (name === 'roi_percentage') return [`${value}%`, 'ROI'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="cost_savings" fill="#10b981" name="Cost Savings" />
                  <Line yAxisId="right" type="monotone" dataKey="roi_percentage" stroke="#f59e0b" strokeWidth={3} name="ROI %" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-semibold">Patient Adoption</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={implementationData.timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="patients_enrolled" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Total Patients" />
                  <Area type="monotone" dataKey="precision_treatments" stackId="2" stroke="#10b981" fill="#10b981" name="Precision Treatments" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Cost Analysis */}
      {selectedMetric === 'cost' && costAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <DollarSign className="w-5 h-5 text-red-600" />
                <h3 className="text-xl font-semibold">Cost Comparison</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Traditional Approach</h4>
                  <div className="space-y-2">
                    {Object.entries(costAnalysis.traditional).map(([category, cost]) => (
                      <div key={category} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{category.replace('_', ' ')}</span>
                        <span className="font-medium">{formatCurrency(cost)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(Object.values(costAnalysis.traditional).reduce((a, b) => a + b, 0))}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Precision Medicine</h4>
                  <div className="space-y-2">
                    {Object.entries(costAnalysis.precision).map(([category, cost]) => (
                      <div key={category} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{category.replace('_', ' ')}</span>
                        <span className="font-medium">{formatCurrency(cost)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(Object.values(costAnalysis.precision).reduce((a, b) => a + b, 0))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-xl font-semibold">Cost Savings Breakdown</h3>
              </div>

              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(costAnalysis.savings.total)}
                </div>
                <p className="text-gray-600">Total savings per patient</p>
                <div className="text-lg font-semibold text-green-600 mt-2">
                  -{costAnalysis.savings.percentage}%
                </div>
                <p className="text-sm text-gray-600">Cost reduction</p>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Reduced Adverse Events', value: 30, fill: '#10b981' },
                      { name: 'Fewer Hospitalizations', value: 45, fill: '#3b82f6' },
                      { name: 'Targeted Therapy Efficiency', value: 15, fill: '#f59e0b' },
                      { name: 'Reduced Monitoring', value: 10, fill: '#8b5cf6' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Outcomes Analysis */}
      {selectedMetric === 'outcomes' && outcomeMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Target className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-semibold">Clinical Outcomes</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Response Rates</span>
                    <span className="text-green-600 font-semibold">+{outcomeMetrics.responseRates.improvement}%</span>
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">Traditional</div>
                      <div className="text-lg font-semibold">{outcomeMetrics.responseRates.traditional}%</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">Precision</div>
                      <div className="text-lg font-semibold text-green-600">{outcomeMetrics.responseRates.precision}%</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Survival Benefit</span>
                    <span className="text-green-600 font-semibold">+{outcomeMetrics.survivalBenefit.months_gained} months</span>
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">Traditional</div>
                      <div className="text-lg font-semibold">{outcomeMetrics.survivalBenefit.traditional} months</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">Precision</div>
                      <div className="text-lg font-semibold text-green-600">{outcomeMetrics.survivalBenefit.precision} months</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Quality of Life</span>
                    <span className="text-green-600 font-semibold">+{outcomeMetrics.qualityOfLife.improvement}%</span>
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">Traditional</div>
                      <div className="text-lg font-semibold">{outcomeMetrics.qualityOfLife.traditional}/10</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">Precision</div>
                      <div className="text-lg font-semibold text-green-600">{outcomeMetrics.qualityOfLife.precision}/10</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Time to Treatment</span>
                    <span className="text-green-600 font-semibold">-{outcomeMetrics.timeToTreatment.reduction}%</span>
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">Traditional</div>
                      <div className="text-lg font-semibold">{outcomeMetrics.timeToTreatment.traditional} days</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">Precision</div>
                      <div className="text-lg font-semibold text-green-600">{outcomeMetrics.timeToTreatment.precision} days</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Award className="w-5 h-5 text-purple-600" />
                <h3 className="text-xl font-semibold">Outcome Improvements</h3>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { metric: 'Response Rate', traditional: outcomeMetrics.responseRates.traditional, precision: outcomeMetrics.responseRates.precision },
                  { metric: 'QoL Score', traditional: outcomeMetrics.qualityOfLife.traditional * 10, precision: outcomeMetrics.qualityOfLife.precision * 10 },
                  { metric: 'Survival (months)', traditional: outcomeMetrics.survivalBenefit.traditional, precision: outcomeMetrics.survivalBenefit.precision }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="traditional" fill="#94a3b8" name="Traditional" />
                  <Bar dataKey="precision" fill="#10b981" name="Precision Medicine" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Implementation Timeline */}
      {selectedMetric === 'implementation' && implementationData && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-semibold">Implementation Timeline & Milestones</h3>
            </div>

            <div className="space-y-6">
              {implementationData.milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {milestone.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : milestone.status === 'in_progress' ? (
                      <Clock className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{milestone.milestone}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-blue-600 font-medium">+{milestone.impact}% impact</span>
                        <span className="text-sm text-gray-500">{new Date(milestone.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            milestone.status === 'completed' ? 'bg-green-500' :
                            milestone.status === 'in_progress' ? 'bg-blue-500' :
                            'bg-gray-400'
                          }`}
                          style={{ 
                            width: milestone.status === 'completed' ? '100%' : 
                                   milestone.status === 'in_progress' ? '60%' : '0%' 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Benchmark Comparison */}
      {benchmarkData && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Brain className="w-5 h-5 text-purple-600" />
              <h3 className="text-xl font-semibold">Practice Benchmarking</h3>
              <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                {benchmarkData.practice_size}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Genomic Testing Rate</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">National Average</span>
                    <span>{benchmarkData.national_average.genomic_testing_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Top Quartile</span>
                    <span>{benchmarkData.top_quartile.genomic_testing_rate}%</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span className="text-sm">Your Practice</span>
                    <span className={getMetricColor(
                      benchmarkData.current_practice.genomic_testing_rate,
                      benchmarkData.national_average.genomic_testing_rate
                    )}>
                      {benchmarkData.current_practice.genomic_testing_rate}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Precision Medicine Adoption</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">National Average</span>
                    <span>{benchmarkData.national_average.precision_medicine_adoption}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Top Quartile</span>
                    <span>{benchmarkData.top_quartile.precision_medicine_adoption}%</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span className="text-sm">Your Practice</span>
                    <span className={getMetricColor(
                      benchmarkData.current_practice.precision_medicine_adoption,
                      benchmarkData.national_average.precision_medicine_adoption
                    )}>
                      {benchmarkData.current_practice.precision_medicine_adoption}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Average ROI</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">National Average</span>
                    <span>{benchmarkData.national_average.average_roi}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Top Quartile</span>
                    <span>{benchmarkData.top_quartile.average_roi}%</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span className="text-sm">Your Practice</span>
                    <span className={getMetricColor(
                      benchmarkData.current_practice.average_roi,
                      benchmarkData.national_average.average_roi
                    )}>
                      {benchmarkData.current_practice.average_roi}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Cost Per Patient</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">National Average</span>
                    <span>{formatCurrency(benchmarkData.national_average.cost_per_patient)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Top Quartile</span>
                    <span>{formatCurrency(benchmarkData.top_quartile.cost_per_patient)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span className="text-sm">Your Practice</span>
                    <span className={getMetricColor(
                      benchmarkData.national_average.cost_per_patient - benchmarkData.current_practice.cost_per_patient,
                      0
                    )}>
                      {formatCurrency(benchmarkData.current_practice.cost_per_patient)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Action Items */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h3 className="text-xl font-semibold">Recommended Actions</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-900">Continue Success</span>
              </div>
              <p className="text-sm text-green-700">
                Your genomic testing rate exceeds top quartile benchmarks. Maintain current protocols.
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Optimization Opportunity</span>
              </div>
              <p className="text-sm text-blue-700">
                Increase precision medicine adoption to reach 75% for additional 15% ROI improvement.
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-900">Focus Area</span>
              </div>
              <p className="text-sm text-yellow-700">
                Reduce time to treatment initiation by implementing automated clinical decision support.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const PracticeROIDashboardWithBoundary: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Practice ROI Dashboard"
      fallbackMessage="The practice analytics dashboard is temporarily unavailable. This feature requires comprehensive data processing and financial analysis."
    >
      <PracticeROIDashboard />
    </FeatureErrorBoundary>
  );
};

export default PracticeROIDashboardWithBoundary;