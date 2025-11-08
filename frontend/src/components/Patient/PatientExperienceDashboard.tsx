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
import { Calendar, Clock, Heart, Activity, Users, Pill, TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardData {
  medications: {
    active_schedules: number;
    recent_schedules: Array<{
      id: string;
      medication_name: string;
      next_dose: string;
      adherence_rate: number;
    }>;
  };
  symptoms: {
    recent_count: number;
    recent_symptoms: Array<{
      id: string;
      symptom_name: string;
      severity: number;
      logged_at: string;
    }>;
  };
  treatment: {
    upcoming_milestones: Array<{
      id: string;
      milestone_name: string;
      scheduled_date: string;
      type: string;
    }>;
  };
  care_team: {
    team_size: number;
    primary_provider: {
      name: string;
      role: string;
    } | null;
  };
  appointments: {
    upcoming_count: number;
    next_appointments: Array<{
      id: string;
      appointment_type: string;
      scheduled_date: string;
      provider_name: string;
    }>;
  };
  insights: {
    health_score: number;
    key_insights: string[];
    recommendations: string[];
  };
}

interface HealthScore {
  overall: number;
  breakdown: {
    adherence: number;
    wellness: number;
    symptoms: number;
  };
  trends: {
    improving: boolean;
    stable: boolean;
    concerning: boolean;
  };
}

export function PatientExperienceDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
    fetchHealthScore();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/patient-features/dashboard', {
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
    }
  };

  const fetchHealthScore = async () => {
    try {
      const response = await fetch('/api/patient-features/health-score', {
        headers: {
          'Authorization': `Bearer ${user?.access_token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch health score');
      }
      
      const data = await response.json();
      setHealthScore(data.healthScore);
    } catch (err) {
      console.error('Health score error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreStatus = (trends: HealthScore['trends']) => {
    if (trends.improving) return { text: 'Improving', color: 'bg-green-100 text-green-800' };
    if (trends.concerning) return { text: 'Concerning', color: 'bg-red-100 text-red-800' };
    return { text: 'Stable', color: 'bg-yellow-100 text-yellow-800' };
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
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Health Dashboard</h1>
          <p className="text-muted-foreground">
            Track your treatment progress and manage your health journey
          </p>
        </div>
        {healthScore && (
          <Card className="w-64">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`text-2xl font-bold ${getHealthScoreColor(healthScore.overall)}`}>
                  {healthScore.overall}
                </div>
                <Badge className={getHealthScoreStatus(healthScore.trends).color}>
                  {getHealthScoreStatus(healthScore.trends).text}
                </Badge>
              </div>
              <Progress value={healthScore.overall} className="mt-2" />
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
          <TabsTrigger value="treatment">Treatment</TabsTrigger>
          <TabsTrigger value="team">Care Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
                <Pill className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.medications.active_schedules || 0}</div>
                <p className="text-xs text-muted-foreground">medication schedules</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Symptoms</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.symptoms.recent_count || 0}</div>
                <p className="text-xs text-muted-foreground">last 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Care Team</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.care_team.team_size || 0}</div>
                <p className="text-xs text-muted-foreground">team members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.appointments.upcoming_count || 0}</div>
                <p className="text-xs text-muted-foreground">scheduled</p>
              </CardContent>
            </Card>
          </div>

          {dashboardData?.insights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {dashboardData.insights.key_insights.map((insight, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {insight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {dashboardData.insights.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {recommendation}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medication Schedule</CardTitle>
              <CardDescription>Manage your daily medications and track adherence</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.medications.recent_schedules?.length ? (
                <div className="space-y-4">
                  {dashboardData.medications.recent_schedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{schedule.medication_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Next dose: {new Date(schedule.next_dose).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {Math.round(schedule.adherence_rate * 100)}% adherence
                        </div>
                        <Progress value={schedule.adherence_rate * 100} className="w-24 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No medication schedules found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symptoms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Symptoms</CardTitle>
              <CardDescription>Track and monitor your symptoms over time</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.symptoms.recent_symptoms?.length ? (
                <div className="space-y-3">
                  {dashboardData.symptoms.recent_symptoms.map((symptom) => (
                    <div key={symptom.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{symptom.symptom_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(symptom.logged_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={symptom.severity >= 7 ? 'destructive' : symptom.severity >= 4 ? 'default' : 'secondary'}>
                        Severity: {symptom.severity}/10
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No recent symptoms logged.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Timeline</CardTitle>
              <CardDescription>Your upcoming treatment milestones and appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.treatment.upcoming_milestones?.length ? (
                <div className="space-y-3">
                  {dashboardData.treatment.upcoming_milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{milestone.milestone_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(milestone.scheduled_date).toLocaleDateString()} • {milestone.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No upcoming treatment milestones.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Care Team</CardTitle>
              <CardDescription>Healthcare providers supporting your treatment journey</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.care_team.primary_provider ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-primary" />
                      <div>
                        <h4 className="font-medium">{dashboardData.care_team.primary_provider.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {dashboardData.care_team.primary_provider.role} • Primary Provider
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total team members: {dashboardData.care_team.team_size}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No care team members added yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PatientExperienceDashboard;