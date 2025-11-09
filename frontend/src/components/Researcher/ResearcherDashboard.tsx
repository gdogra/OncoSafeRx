import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Separator } from '../ui/Separator';
import { 
  Microscope, 
  Users, 
  FileText, 
  TrendingUp, 
  Activity,
  Award,
  Calendar,
  Target,
  BarChart3,
  BookOpen,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe
} from 'lucide-react';

interface ResearcherProfile {
  id: string;
  user_id: string;
  researcher_id: string;
  institution: string;
  position: string;
  specialization: string;
  research_interests: string[];
  orcid_id?: string;
  h_index?: number;
  total_citations?: number;
  years_experience: number;
  created_at: string;
}

interface ClinicalTrial {
  id: string;
  trial_identifier: string;
  trial_title: string;
  study_phase: string;
  cancer_type: string;
  target_enrollment: number;
  current_enrollment: number;
  study_status: string;
  start_date: string;
  estimated_completion: string;
}

interface BiomarkerStudy {
  id: string;
  study_name: string;
  biomarker_type: string;
  study_status: string;
  sample_size: number;
  discovery_progress: number;
}

interface Publication {
  id: string;
  title: string;
  journal: string;
  publication_date: string;
  impact_factor?: number;
  citation_count?: number;
  status: string;
}

interface Grant {
  id: string;
  grant_title: string;
  funding_agency: string;
  amount: number;
  start_date: string;
  end_date: string;
  status: string;
  milestones_completed: number;
  total_milestones: number;
}

interface Analytics {
  trials_active: number;
  trials_completed: number;
  total_enrollment: number;
  biomarker_studies: number;
  publications_this_year: number;
  total_funding: number;
  collaboration_score: number;
  research_impact_score: number;
}

interface DashboardData {
  profile: ResearcherProfile;
  analytics: Analytics;
  recent_trials: ClinicalTrial[];
  biomarker_studies: BiomarkerStudy[];
  recent_publications: Publication[];
  active_grants: Grant[];
  compliance_alerts: Array<{
    id: string;
    type: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    due_date?: string;
  }>;
  insights: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    action_items: string[];
  }>;
}

const ResearcherDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/researcher-features/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setDashboardData(data.dashboard);
      } else {
        throw new Error(data.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'recruiting':
      case 'published':
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'planning':
      case 'under_review':
      case 'draft':
        return 'text-blue-600 bg-blue-50';
      case 'suspended':
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
            <div className="mt-2 text-sm text-red-700">
              {error || 'Failed to load researcher dashboard data.'}
            </div>
            <div className="mt-4">
              <Button onClick={fetchDashboardData} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { profile, analytics, recent_trials, biomarker_studies, recent_publications, active_grants, compliance_alerts, insights } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Research Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {profile.position} at {profile.institution}
              </p>
            </div>
            <div className="flex space-x-3">
              <Badge variant="outline" className="flex items-center">
                <Microscope className="w-4 h-4 mr-1" />
                {profile.specialization}
              </Badge>
              <Badge variant="outline" className="flex items-center">
                <Award className="w-4 h-4 mr-1" />
                H-Index: {profile.h_index || 'N/A'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Trials</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.trials_active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Enrolled</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.total_enrollment}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Publications</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.publications_this_year}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Funding</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(analytics.total_funding / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trials">Clinical Trials</TabsTrigger>
            <TabsTrigger value="biomarkers">Biomarkers</TabsTrigger>
            <TabsTrigger value="publications">Publications</TabsTrigger>
            <TabsTrigger value="grants">Grants</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Research Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Impact Score</span>
                        <span>{analytics.research_impact_score}/100</span>
                      </div>
                      <Progress value={analytics.research_impact_score} className="mt-1" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Collaboration Score</span>
                        <span>{analytics.collaboration_score}/100</span>
                      </div>
                      <Progress value={analytics.collaboration_score} className="mt-1" />
                    </div>
                    <div className="pt-2">
                      <p className="text-sm text-gray-600">
                        Based on publications, citations, and research network
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Compliance Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {compliance_alerts.length === 0 ? (
                      <div className="text-center py-4">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">All compliance requirements up to date</p>
                      </div>
                    ) : (
                      compliance_alerts.slice(0, 3).map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-lg border ${getPriorityColor(alert.priority)}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium">{alert.type}</p>
                              <p className="text-xs mt-1">{alert.message}</p>
                            </div>
                            {alert.due_date && (
                              <Badge variant="outline" size="sm">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(alert.due_date).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Trials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recent_trials.slice(0, 3).map((trial) => (
                      <div key={trial.id} className="border-b pb-3 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{trial.trial_identifier}</p>
                            <p className="text-xs text-gray-600 mt-1">{trial.cancer_type}</p>
                          </div>
                          <Badge className={getStatusColor(trial.study_status)}>
                            {trial.study_status}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Enrollment</span>
                            <span>{trial.current_enrollment}/{trial.target_enrollment}</span>
                          </div>
                          <Progress 
                            value={(trial.current_enrollment / trial.target_enrollment) * 100} 
                            className="mt-1 h-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Biomarker Studies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {biomarker_studies.slice(0, 3).map((study) => (
                      <div key={study.id} className="border-b pb-3 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{study.study_name}</p>
                            <p className="text-xs text-gray-600 mt-1">{study.biomarker_type}</p>
                          </div>
                          <Badge className={getStatusColor(study.study_status)}>
                            {study.study_status}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Discovery Progress</span>
                            <span>{study.discovery_progress}%</span>
                          </div>
                          <Progress value={study.discovery_progress} className="mt-1 h-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Grants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {active_grants.slice(0, 3).map((grant) => (
                      <div key={grant.id} className="border-b pb-3 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{grant.grant_title.substring(0, 40)}...</p>
                            <p className="text-xs text-gray-600 mt-1">{grant.funding_agency}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium">
                              ${(grant.amount / 1000).toFixed(0)}K
                            </p>
                            <Badge className={getStatusColor(grant.status)}>
                              {grant.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Milestones</span>
                            <span>{grant.milestones_completed}/{grant.total_milestones}</span>
                          </div>
                          <Progress 
                            value={(grant.milestones_completed / grant.total_milestones) * 100} 
                            className="mt-1 h-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Trials Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recent_trials.map((trial) => (
                    <div key={trial.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{trial.trial_identifier}</h3>
                          <p className="text-gray-600 mt-1">{trial.trial_title}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getStatusColor(trial.study_status)}>
                            {trial.study_status}
                          </Badge>
                          <Badge variant="outline">{trial.study_phase}</Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Cancer Type</p>
                          <p className="font-medium">{trial.cancer_type}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Enrollment</p>
                          <p className="font-medium">{trial.current_enrollment}/{trial.target_enrollment}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Start Date</p>
                          <p className="font-medium">{new Date(trial.start_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Est. Completion</p>
                          <p className="font-medium">{new Date(trial.estimated_completion).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Enrollment Progress</span>
                          <span>{Math.round((trial.current_enrollment / trial.target_enrollment) * 100)}%</span>
                        </div>
                        <Progress value={(trial.current_enrollment / trial.target_enrollment) * 100} />
                      </div>
                      
                      <div className="flex justify-end mt-4 space-x-2">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="outline" size="sm">Analytics</Button>
                        <Button size="sm">Manage</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="biomarkers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Biomarker Discovery Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {biomarker_studies.map((study) => (
                    <div key={study.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{study.study_name}</h3>
                          <p className="text-gray-600 mt-1">Biomarker Type: {study.biomarker_type}</p>
                        </div>
                        <Badge className={getStatusColor(study.study_status)}>
                          {study.study_status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-500">Sample Size</p>
                          <p className="font-medium">{study.sample_size}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Discovery Progress</p>
                          <p className="font-medium">{study.discovery_progress}%</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Discovery Progress</span>
                          <span>{study.discovery_progress}%</span>
                        </div>
                        <Progress value={study.discovery_progress} />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">View Data</Button>
                        <Button variant="outline" size="sm">Run Analysis</Button>
                        <Button size="sm">Export Results</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="publications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Research Publications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recent_publications.map((publication) => (
                    <div key={publication.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{publication.title}</h3>
                          <p className="text-gray-600 mt-1">{publication.journal}</p>
                        </div>
                        <Badge className={getStatusColor(publication.status)}>
                          {publication.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Publication Date</p>
                          <p className="font-medium">{new Date(publication.publication_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Impact Factor</p>
                          <p className="font-medium">{publication.impact_factor || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Citations</p>
                          <p className="font-medium">{publication.citation_count || 0}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-4 space-x-2">
                        <Button variant="outline" size="sm">
                          <Globe className="w-4 h-4 mr-1" />
                          View Online
                        </Button>
                        <Button variant="outline" size="sm">Citations</Button>
                        <Button size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grant Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {active_grants.map((grant) => (
                    <div key={grant.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{grant.grant_title}</h3>
                          <p className="text-gray-600 mt-1">{grant.funding_agency}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">
                            ${(grant.amount / 1000000).toFixed(1)}M
                          </p>
                          <Badge className={getStatusColor(grant.status)}>
                            {grant.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-500">Start Date</p>
                          <p className="font-medium">{new Date(grant.start_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">End Date</p>
                          <p className="font-medium">{new Date(grant.end_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Milestones Completed</span>
                          <span>{grant.milestones_completed}/{grant.total_milestones}</span>
                        </div>
                        <Progress value={(grant.milestones_completed / grant.total_milestones) * 100} />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">View Timeline</Button>
                        <Button variant="outline" size="sm">Financial Report</Button>
                        <Button size="sm">Update Milestones</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Research Insights & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {insights.map((insight) => (
                    <div key={insight.id} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{insight.title}</h3>
                          <p className="text-gray-600 mt-1">{insight.description}</p>
                          
                          {insight.action_items.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">Recommended Actions:</p>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                {insight.action_items.map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <Badge variant="outline">{insight.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ResearcherDashboard;