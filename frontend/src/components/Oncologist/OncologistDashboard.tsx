import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Calendar, 
  FileText, 
  AlertTriangle,
  Stethoscope,
  BarChart3,
  Clock,
  Target,
  Brain,
  FlaskConical
} from 'lucide-react';

interface PatientCaseload {
  total_patients: number;
  by_status: Record<string, number>;
  by_risk: Record<string, number>;
  high_priority_count: number;
}

interface TreatmentAnalytics {
  total_assessments: number;
  response_rates: Record<string, number>;
  avg_quality_of_life: number;
  toxicity_distribution: Record<string, number>;
}

interface QualityMetric {
  id: string;
  metric_name: string;
  metric_category: string;
  actual_value: number;
  target_value: number;
  percentile_rank: number;
  improvement_trend: string;
}

interface DashboardData {
  caseload_summary: PatientCaseload;
  upcoming_appointments: Array<{
    patient_id: string;
    next_appointment: string;
    primary_diagnosis: string;
    treatment_status: string;
  }>;
  recent_responses: Array<{
    id: string;
    patient_id: string;
    overall_response: string;
    assessment_date: string;
    quality_of_life_score: number;
  }>;
  quality_metrics: QualityMetric[];
  tumor_board_cases: Array<{
    id: string;
    patient_id: string;
    meeting_date: string;
    case_summary: string;
    status: string;
  }>;
  pending_consults: Array<{
    id: string;
    patient_id: string;
    specialty_requested: string;
    urgency: string;
    requested_date: string;
  }>;
  alerts: Array<{
    type: string;
    severity: string;
    message: string;
    count?: number;
  }>;
  performance_summary: {
    total_patients: number;
    response_rate: number;
    satisfaction_score: number;
    efficiency_score: number;
  } | null;
}

export function OncologistDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/oncologist-features/dashboard', {
        headers: {
          'Authorization': `Bearer ${user?.access_token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      setDashboardData(data.dashboard);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getResponseRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'semi_urgent':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="max-w-md mx-auto mt-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinical Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive patient management and clinical decision support
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button size="sm">
            <Brain className="h-4 w-4 mr-2" />
            AI Insights
          </Button>
        </div>
      </div>

      {/* Alerts Section */}
      {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {dashboardData.alerts.map((alert, index) => (
            <Alert key={index} className={`${alert.severity === 'high' ? 'border-red-500' : 'border-yellow-500'}`}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {alert.message}
                {alert.count && ` (${alert.count})`}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="collaboration">MDT</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.caseload_summary?.total_patients || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData?.caseload_summary?.high_priority_count || 0} high priority
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getResponseRateColor(dashboardData?.performance_summary?.response_rate || 0)}`}>
                  {Math.round(dashboardData?.performance_summary?.response_rate || 0)}%
                </div>
                <p className="text-xs text-muted-foreground">treatment response</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Patient Satisfaction</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(dashboardData?.performance_summary?.satisfaction_score || 0).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">out of 5.0</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.performance_summary?.efficiency_score || 0}</div>
                <Progress value={dashboardData?.performance_summary?.efficiency_score || 0} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.upcoming_appointments?.length ? (
                  <div className="space-y-3">
                    {dashboardData.upcoming_appointments.slice(0, 5).map((appointment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{appointment.primary_diagnosis}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(appointment.next_appointment).toLocaleDateString()} at{' '}
                            {new Date(appointment.next_appointment).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {appointment.treatment_status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No upcoming appointments</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Recent Treatment Responses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.recent_responses?.length ? (
                  <div className="space-y-3">
                    {dashboardData.recent_responses.slice(0, 5).map((response) => (
                      <div key={response.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Patient {response.patient_id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(response.assessment_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={response.overall_response === 'CR' ? 'default' : 
                                        response.overall_response === 'PR' ? 'secondary' : 'outline'}>
                            {response.overall_response}
                          </Badge>
                          {response.quality_of_life_score && (
                            <p className="text-sm text-muted-foreground mt-1">
                              QoL: {response.quality_of_life_score}/10
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recent assessments</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Distribution by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.caseload_summary?.by_status && (
                  <div className="space-y-2">
                    {Object.entries(dashboardData.caseload_summary.by_status).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center">
                        <span className="capitalize">{status.replace('_', ' ')}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.caseload_summary?.by_risk && (
                  <div className="space-y-2">
                    {Object.entries(dashboardData.caseload_summary.by_risk).map(([risk, count]) => (
                      <div key={risk} className="flex justify-between items-center">
                        <span className="capitalize">{risk}</span>
                        <Badge variant={risk === 'high' || risk === 'critical' ? 'destructive' : 'outline'}>
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Consultations</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.pending_consults?.length ? (
                  <div className="space-y-2">
                    {dashboardData.pending_consults.slice(0, 5).map((consult) => (
                      <div key={consult.id} className="flex justify-between items-center">
                        <span className="text-sm">{consult.specialty_requested}</span>
                        <Badge className={getUrgencyColor(consult.urgency)}>
                          {consult.urgency}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No pending consultations</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics</CardTitle>
              <CardDescription>Performance indicators and compliance tracking</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.quality_metrics?.length ? (
                <div className="space-y-4">
                  {dashboardData.quality_metrics.map((metric) => (
                    <div key={metric.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{metric.metric_name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {metric.metric_category.replace('_', ' ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(metric.improvement_trend)}
                          <Badge variant="outline">{metric.percentile_rank}th percentile</Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Current: {metric.actual_value}</span>
                          <span>Target: {metric.target_value}</span>
                        </div>
                        <Progress 
                          value={(metric.actual_value / metric.target_value) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No quality metrics available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tumor Board Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.tumor_board_cases?.length ? (
                <div className="space-y-3">
                  {dashboardData.tumor_board_cases.map((case_item) => (
                    <div key={case_item.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">Patient {case_item.patient_id.slice(0, 8)}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {case_item.case_summary.substring(0, 100)}...
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{case_item.status}</Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(case_item.meeting_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No upcoming tumor board cases</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="research" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  Clinical Trial Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">Immunotherapy Trial - Advanced NSCLC</h4>
                    <p className="text-sm text-muted-foreground">5 eligible patients identified</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Review Eligibility
                    </Button>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">CAR-T Cell Therapy - Relapsed NHL</h4>
                    <p className="text-sm text-muted-foreground">2 eligible patients identified</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Review Eligibility
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evidence Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">NCCN Guidelines Update</h4>
                    <p className="text-sm text-muted-foreground">
                      New recommendations for HER2+ breast cancer
                    </p>
                    <Badge className="mt-2" variant="secondary">Level I Evidence</Badge>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">ASCO Abstract</h4>
                    <p className="text-sm text-muted-foreground">
                      Novel biomarker in colorectal cancer
                    </p>
                    <Badge className="mt-2" variant="outline">Level II Evidence</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default OncologistDashboard;