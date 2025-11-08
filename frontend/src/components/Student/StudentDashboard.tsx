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
  BookOpen, 
  Award, 
  TrendingUp, 
  Calendar, 
  Users, 
  Brain,
  Target,
  Flame,
  Trophy,
  Clock,
  Stethoscope,
  GraduationCap,
  Zap,
  Star,
  BarChart3
} from 'lucide-react';

interface StudentProfile {
  student_id: string;
  program_type: string;
  year_level: number;
  school_name: string;
  specialization: string;
  gpa: number;
  current_rotation: string;
}

interface Analytics {
  cases_completed: number;
  average_case_score: number;
  assessments_taken: number;
  average_assessment_score: number;
  total_points_earned: number;
  engagement_score: number;
  learning_velocity_score: number;
  total_study_time_minutes: number;
}

interface Achievement {
  id: string;
  achievement_name: string;
  description: string;
  points_awarded: number;
  category: string;
  rarity: string;
  earned_date: string;
}

interface LearningStreak {
  streak_type: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

interface Recommendation {
  recommendation_type: string;
  recommendation_text: string;
  reasoning: string;
  priority_level: number;
  estimated_time_minutes: number;
}

interface DashboardData {
  profile: StudentProfile;
  analytics: Analytics;
  recent_cases: Array<{
    id: string;
    case: {
      case_title: string;
      specialty: string;
      difficulty_level: number;
    };
    score: number;
    completion_time: string;
    status: string;
  }>;
  upcoming_assessments: Array<{
    id: string;
    assessment_name: string;
    assessment_type: string;
    total_questions: number;
    time_limit_minutes: number;
  }>;
  recent_achievements: Achievement[];
  points_summary: {
    total_points: number;
    points_by_category: Record<string, number>;
    recent_activities: Array<{
      point_category: string;
      points_earned: number;
      activity_description: string;
      earned_date: string;
    }>;
  };
  learning_streaks: LearningStreak[];
  recommendations: Recommendation[];
}

export function StudentDashboard() {
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
      const response = await fetch('/api/student-features/dashboard', {
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'epic':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'rare':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'uncommon':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'border-red-500 bg-red-50';
    if (priority >= 3) return 'border-yellow-500 bg-yellow-50';
    return 'border-blue-500 bg-blue-50';
  };

  const getStreakIcon = (streakType: string) => {
    switch (streakType) {
      case 'daily_login':
        return <Calendar className="h-4 w-4" />;
      case 'case_completion':
        return <Brain className="h-4 w-4" />;
      case 'assessment_taking':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Flame className="h-4 w-4" />;
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
        <Target className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning Dashboard</h1>
          <p className="text-muted-foreground">
            Track your medical education progress and achievements
          </p>
          {dashboardData?.profile && (
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>{dashboardData.profile.program_type}</span>
              <span>Year {dashboardData.profile.year_level}</span>
              <span>{dashboardData.profile.school_name}</span>
              {dashboardData.profile.specialization && (
                <Badge variant="outline">{dashboardData.profile.specialization}</Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button size="sm">
            <Target className="h-4 w-4 mr-2" />
            Set Goals
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="rotations">Rotations</TabsTrigger>
          <TabsTrigger value="career">Career</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cases Completed</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.analytics?.cases_completed || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Avg Score: {Math.round(dashboardData?.analytics?.average_case_score || 0)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.points_summary?.total_points || 0}</div>
                <p className="text-xs text-muted-foreground">learning points earned</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.analytics?.engagement_score || 0}</div>
                <Progress value={dashboardData?.analytics?.engagement_score || 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Study Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((dashboardData?.analytics?.total_study_time_minutes || 0) / 60)}h
                </div>
                <p className="text-xs text-muted-foreground">this month</p>
              </CardContent>
            </Card>
          </div>

          {/* Learning Streaks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Learning Streaks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.learning_streaks?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {dashboardData.learning_streaks.map((streak) => (
                    <div key={streak.streak_type} className="flex items-center gap-3 p-3 border rounded-lg">
                      {getStreakIcon(streak.streak_type)}
                      <div>
                        <p className="font-medium capitalize">{streak.streak_type.replace('_', ' ')}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Current: {streak.current_streak}</span>
                          <span>Best: {streak.longest_streak}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Start learning to build your streaks!</p>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Personalized Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.recommendations?.length ? (
                <div className="space-y-3">
                  {dashboardData.recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className={`p-4 border rounded-lg ${getPriorityColor(rec.priority_level)}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{rec.recommendation_text}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{rec.reasoning}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{rec.estimated_time_minutes} min</Badge>
                          <Badge variant={rec.priority_level >= 4 ? 'destructive' : 'default'}>
                            Priority {rec.priority_level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Complete more activities to get personalized recommendations</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Recent Case Studies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.recent_cases?.length ? (
                  <div className="space-y-3">
                    {dashboardData.recent_cases.map((caseAttempt) => (
                      <div key={caseAttempt.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{caseAttempt.case.case_title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {caseAttempt.case.specialty} • Level {caseAttempt.case.difficulty_level}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-semibold ${getScoreColor(caseAttempt.score)}`}>
                            {Math.round(caseAttempt.score)}%
                          </div>
                          <Badge variant="outline">{caseAttempt.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No case studies completed yet. Start learning!</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Points Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.points_summary?.points_by_category && 
                 Object.keys(dashboardData.points_summary.points_by_category).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(dashboardData.points_summary.points_by_category).map(([category, points]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="capitalize">{category.replace('_', ' ')}</span>
                        <Badge variant="outline">{points} pts</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Complete activities to start earning points!</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Performance</CardTitle>
              <CardDescription>Track your progress on exams and quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{dashboardData?.analytics?.assessments_taken || 0}</div>
                  <p className="text-sm text-muted-foreground">Assessments Taken</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className={`text-2xl font-bold ${getScoreColor(dashboardData?.analytics?.average_assessment_score || 0)}`}>
                    {Math.round(dashboardData?.analytics?.average_assessment_score || 0)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardData?.analytics?.average_assessment_score >= 70 ? '✓' : '⚠'}
                  </div>
                  <p className="text-sm text-muted-foreground">Passing Rate</p>
                </div>
              </div>
              
              {dashboardData?.upcoming_assessments?.length ? (
                <div>
                  <h4 className="font-medium mb-3">Upcoming Assessments</h4>
                  <div className="space-y-2">
                    {dashboardData.upcoming_assessments.slice(0, 3).map((assessment) => (
                      <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h5 className="font-medium">{assessment.assessment_name}</h5>
                          <p className="text-sm text-muted-foreground">
                            {assessment.total_questions} questions • {assessment.time_limit_minutes} min
                          </p>
                        </div>
                        <Button size="sm">
                          Take Assessment
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert>
                  <BookOpen className="h-4 w-4" />
                  <AlertDescription>No upcoming assessments at this time.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.recent_achievements?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardData.recent_achievements.map((achievement) => (
                    <div key={achievement.id} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${getRarityColor(achievement.rarity)}`}>
                          <Star className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{achievement.achievement_name}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">+{achievement.points_awarded} pts</Badge>
                            <Badge className={getRarityColor(achievement.rarity)}>
                              {achievement.rarity}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(achievement.earned_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Achievements Yet</h3>
                  <p className="text-muted-foreground">
                    Complete case studies and assessments to start earning achievements!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rotations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Clinical Rotations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.profile?.current_rotation ? (
                <div className="space-y-4">
                  <Alert>
                    <Stethoscope className="h-4 w-4" />
                    <AlertDescription>
                      Currently on: <strong>{dashboardData.profile.current_rotation}</strong>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Rotation Progress</h4>
                      <Progress value={65} className="mb-2" />
                      <p className="text-sm text-muted-foreground">8 of 12 required encounters completed</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Upcoming Requirements</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Pediatric consultation</li>
                        <li>• Geriatric assessment</li>
                        <li>• Emergency case presentation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Active Rotation</h3>
                  <p className="text-muted-foreground mb-4">
                    Enroll in virtual clinical rotations to gain hands-on experience
                  </p>
                  <Button>
                    Browse Available Rotations
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="career" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Career Development
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Academic Progress</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Current GPA:</span>
                      <span className="font-medium">{dashboardData?.profile?.gpa || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Year Level:</span>
                      <span className="font-medium">Year {dashboardData?.profile?.year_level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Specialization:</span>
                      <span className="font-medium">{dashboardData?.profile?.specialization || 'Undeclared'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Next Milestones</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Complete OSCE preparation</li>
                    <li>• Submit research proposal</li>
                    <li>• Apply for residency programs</li>
                    <li>• Schedule board exam</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default StudentDashboard;