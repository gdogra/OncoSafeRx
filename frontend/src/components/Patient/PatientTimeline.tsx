import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock, Activity, Heart, Target, Brain, Zap } from 'lucide-react';
import Card from '../UI/Card';
import LoadingSpinner from '../UI/LoadingSpinner';
import FeatureErrorBoundary from '../ErrorBoundary/FeatureErrorBoundary';

interface TimelineEvent {
  id: string;
  date: string;
  type: 'diagnosis' | 'treatment' | 'assessment' | 'outcome' | 'prediction' | 'milestone';
  title: string;
  description: string;
  outcome?: {
    metric: string;
    value: number;
    predicted?: number;
    trend: 'improving' | 'stable' | 'declining';
    confidence: number;
  };
  medications?: Array<{
    name: string;
    dosage: string;
    response: number;
  }>;
  biomarkers?: Record<string, number>;
  qualityOfLife?: {
    score: number;
    factors: Record<string, number>;
  };
  nextActions?: string[];
  aiInsights?: Array<{
    type: 'optimization' | 'warning' | 'recommendation';
    message: string;
    confidence: number;
  }>;
  status: 'completed' | 'current' | 'predicted' | 'planned';
  importance: 'high' | 'medium' | 'low';
}

interface PredictiveMilestone {
  date: string;
  event: string;
  probability: number;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  alternatives?: Array<{
    scenario: string;
    probability: number;
    timeline_shift: number;
  }>;
}

interface PatientOutlook {
  short_term: {
    timeframe: '3 months';
    key_predictions: Array<{
      event: string;
      probability: number;
      date_range: [string, string];
    }>;
    overall_prognosis: number;
  };
  medium_term: {
    timeframe: '12 months';
    key_predictions: Array<{
      event: string;
      probability: number;
      date_range: [string, string];
    }>;
    overall_prognosis: number;
  };
  long_term: {
    timeframe: '24+ months';
    key_predictions: Array<{
      event: string;
      probability: number;
      date_range: [string, string];
    }>;
    overall_prognosis: number;
  };
}

interface TreatmentJourney {
  current_phase: string;
  treatment_line: number;
  response_trajectory: Array<{
    date: string;
    response_score: number;
    biomarker_trend: number;
    quality_of_life: number;
  }>;
  upcoming_decisions: Array<{
    decision_point: string;
    date: string;
    options: Array<{
      option: string;
      predicted_outcome: number;
      recommendation_strength: number;
    }>;
  }>;
}

const PatientTimeline: React.FC = () => {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [predictiveMilestones, setPredictiveMilestones] = useState<PredictiveMilestone[]>([]);
  const [patientOutlook, setPatientOutlook] = useState<PatientOutlook | null>(null);
  const [treatmentJourney, setTreatmentJourney] = useState<TreatmentJourney | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'past' | 'current' | 'predicted'>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPatientTimeline();
  }, []);

  const loadPatientTimeline = async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const mockTimelineEvents: TimelineEvent[] = [
        {
          id: '1',
          date: '2024-01-15',
          type: 'diagnosis',
          title: 'Initial Diagnosis',
          description: 'Stage IV Non-Small Cell Lung Cancer diagnosed via CT and biopsy',
          biomarkers: { 'CEA': 45.2, 'CYFRA21-1': 8.5, 'NSE': 12.3 },
          status: 'completed',
          importance: 'high',
          aiInsights: [
            {
              type: 'recommendation',
              message: 'Comprehensive genomic profiling recommended for treatment optimization',
              confidence: 95
            }
          ]
        },
        {
          id: '2',
          date: '2024-01-28',
          type: 'assessment',
          title: 'Genomic Profiling Results',
          description: 'Comprehensive genomic analysis revealed KRAS G12C mutation and high TMB',
          outcome: {
            metric: 'Genomic Analysis',
            value: 100,
            trend: 'stable',
            confidence: 98
          },
          status: 'completed',
          importance: 'high',
          aiInsights: [
            {
              type: 'optimization',
              message: 'KRAS G12C mutation detected - excellent candidate for targeted therapy',
              confidence: 92
            }
          ]
        },
        {
          id: '3',
          date: '2024-02-10',
          type: 'treatment',
          title: 'First-Line Treatment Initiated',
          description: 'Started Pembrolizumab + Carboplatin/Paclitaxel combination therapy',
          medications: [
            { name: 'Pembrolizumab', dosage: '200mg Q3W', response: 85 },
            { name: 'Carboplatin', dosage: 'AUC 6 Q3W', response: 75 },
            { name: 'Paclitaxel', dosage: '175mg/m² Q3W', response: 78 }
          ],
          status: 'completed',
          importance: 'high',
          nextActions: ['Monitor for immune-related adverse events', 'Track tumor markers weekly']
        },
        {
          id: '4',
          date: '2024-03-25',
          type: 'assessment',
          title: 'First Response Assessment',
          description: 'CT scan shows 35% reduction in target lesions - Partial Response',
          outcome: {
            metric: 'Tumor Response',
            value: 65,
            predicted: 68,
            trend: 'improving',
            confidence: 87
          },
          biomarkers: { 'CEA': 28.7, 'CYFRA21-1': 5.2, 'NSE': 8.1 },
          qualityOfLife: {
            score: 78,
            factors: { 'Physical': 75, 'Emotional': 82, 'Social': 76, 'Functional': 80 }
          },
          status: 'completed',
          importance: 'high'
        },
        {
          id: '5',
          date: '2024-05-15',
          type: 'assessment',
          title: 'Interim Response Assessment',
          description: 'Continued response with 45% reduction in target lesions',
          outcome: {
            metric: 'Tumor Response',
            value: 75,
            predicted: 72,
            trend: 'improving',
            confidence: 89
          },
          biomarkers: { 'CEA': 18.5, 'CYFRA21-1': 3.8, 'NSE': 6.2 },
          qualityOfLife: {
            score: 82,
            factors: { 'Physical': 80, 'Emotional': 85, 'Social': 81, 'Functional': 82 }
          },
          status: 'completed',
          importance: 'medium'
        },
        {
          id: '6',
          date: '2024-07-20',
          type: 'outcome',
          title: 'Confirmed Response',
          description: 'Best response achieved - 52% reduction maintained at 6 months',
          outcome: {
            metric: 'Overall Response',
            value: 82,
            predicted: 78,
            trend: 'stable',
            confidence: 91
          },
          biomarkers: { 'CEA': 12.3, 'CYFRA21-1': 2.9, 'NSE': 5.1 },
          status: 'completed',
          importance: 'high',
          aiInsights: [
            {
              type: 'optimization',
              message: 'Excellent response maintained - consider treatment de-escalation',
              confidence: 85
            }
          ]
        },
        {
          id: '7',
          date: '2024-09-22',
          type: 'assessment',
          title: 'Current Status',
          description: 'Ongoing response assessment and treatment optimization',
          outcome: {
            metric: 'Disease Control',
            value: 85,
            predicted: 82,
            trend: 'stable',
            confidence: 88
          },
          biomarkers: { 'CEA': 15.7, 'CYFRA21-1': 3.2, 'NSE': 5.8 },
          qualityOfLife: {
            score: 84,
            factors: { 'Physical': 82, 'Emotional': 87, 'Social': 83, 'Functional': 84 }
          },
          status: 'current',
          importance: 'high',
          nextActions: [
            'Continue current regimen with monitoring',
            'Consider maintenance therapy transition',
            'Assess for clinical trial eligibility'
          ]
        },
        {
          id: '8',
          date: '2024-11-15',
          type: 'prediction',
          title: 'Next Response Assessment',
          description: 'Predicted continued stable disease with possible minor progression',
          outcome: {
            metric: 'Disease Status',
            value: 78,
            predicted: 78,
            trend: 'stable',
            confidence: 82
          },
          status: 'predicted',
          importance: 'medium',
          aiInsights: [
            {
              type: 'warning',
              message: 'Monitor closely for progression signals - biomarker trending upward',
              confidence: 78
            }
          ]
        },
        {
          id: '9',
          date: '2025-01-10',
          type: 'milestone',
          title: 'One Year Milestone',
          description: 'Anticipated one-year progression-free survival milestone',
          outcome: {
            metric: 'Progression-Free Survival',
            value: 85,
            predicted: 85,
            trend: 'stable',
            confidence: 75
          },
          status: 'predicted',
          importance: 'high',
          aiInsights: [
            {
              type: 'optimization',
              message: '85% probability of reaching one-year PFS milestone',
              confidence: 85
            }
          ]
        },
        {
          id: '10',
          date: '2025-03-20',
          type: 'treatment',
          title: 'Potential Treatment Transition',
          description: 'Possible transition to maintenance therapy or second-line treatment',
          status: 'planned',
          importance: 'high',
          nextActions: [
            'Evaluate maintenance pembrolizumab',
            'Consider clinical trial options',
            'Assess for novel targeted therapies'
          ],
          aiInsights: [
            {
              type: 'recommendation',
              message: 'Multiple promising second-line options available based on genomic profile',
              confidence: 88
            }
          ]
        }
      ];

      const mockPredictiveMilestones: PredictiveMilestone[] = [
        {
          date: '2024-11-30',
          event: 'Disease progression assessment',
          probability: 25,
          impact: 'negative',
          confidence: 78,
          alternatives: [
            { scenario: 'Continued response', probability: 60, timeline_shift: 0 },
            { scenario: 'Stable disease', probability: 15, timeline_shift: 30 },
            { scenario: 'Progression', probability: 25, timeline_shift: -30 }
          ]
        },
        {
          date: '2025-01-10',
          event: 'One-year progression-free survival',
          probability: 85,
          impact: 'positive',
          confidence: 82
        },
        {
          date: '2025-04-15',
          event: 'Potential second-line treatment initiation',
          probability: 35,
          impact: 'neutral',
          confidence: 70
        },
        {
          date: '2025-08-20',
          event: 'Two-year overall survival milestone',
          probability: 78,
          impact: 'positive',
          confidence: 75
        }
      ];

      const mockPatientOutlook: PatientOutlook = {
        short_term: {
          timeframe: '3 months',
          key_predictions: [
            { event: 'Continued disease control', probability: 85, date_range: ['2024-10-01', '2024-12-31'] },
            { event: 'Treatment tolerance', probability: 92, date_range: ['2024-10-01', '2024-12-31'] },
            { event: 'Quality of life maintenance', probability: 88, date_range: ['2024-10-01', '2024-12-31'] }
          ],
          overall_prognosis: 87
        },
        medium_term: {
          timeframe: '12 months',
          key_predictions: [
            { event: 'Progression-free survival', probability: 78, date_range: ['2024-10-01', '2025-09-30'] },
            { event: 'Treatment response maintenance', probability: 65, date_range: ['2024-10-01', '2025-09-30'] },
            { event: 'Clinical trial eligibility', probability: 45, date_range: ['2025-01-01', '2025-06-30'] }
          ],
          overall_prognosis: 74
        },
        long_term: {
          timeframe: '24+ months',
          key_predictions: [
            { event: 'Two-year overall survival', probability: 68, date_range: ['2026-01-01', '2026-12-31'] },
            { event: 'Long-term disease control', probability: 42, date_range: ['2025-10-01', '2027-01-01'] },
            { event: 'Novel therapy candidacy', probability: 75, date_range: ['2025-06-01', '2026-12-31'] }
          ],
          overall_prognosis: 62
        }
      };

      const mockTreatmentJourney: TreatmentJourney = {
        current_phase: 'First-line immunotherapy combination',
        treatment_line: 1,
        response_trajectory: [
          { date: '2024-02-10', response_score: 30, biomarker_trend: 100, quality_of_life: 65 },
          { date: '2024-03-25', response_score: 65, biomarker_trend: 75, quality_of_life: 78 },
          { date: '2024-05-15', response_score: 75, biomarker_trend: 65, quality_of_life: 82 },
          { date: '2024-07-20', response_score: 82, biomarker_trend: 45, quality_of_life: 85 },
          { date: '2024-09-22', response_score: 85, biomarker_trend: 55, quality_of_life: 84 }
        ],
        upcoming_decisions: [
          {
            decision_point: 'Maintenance therapy evaluation',
            date: '2024-12-01',
            options: [
              { option: 'Continue combination therapy', predicted_outcome: 75, recommendation_strength: 60 },
              { option: 'Switch to pembrolizumab maintenance', predicted_outcome: 78, recommendation_strength: 85 },
              { option: 'Treatment holiday', predicted_outcome: 65, recommendation_strength: 25 }
            ]
          },
          {
            decision_point: 'Second-line strategy planning',
            date: '2025-03-15',
            options: [
              { option: 'KRAS G12C inhibitor', predicted_outcome: 82, recommendation_strength: 90 },
              { option: 'Clinical trial enrollment', predicted_outcome: 75, recommendation_strength: 70 },
              { option: 'Chemotherapy', predicted_outcome: 58, recommendation_strength: 30 }
            ]
          }
        ]
      };

      setTimelineEvents(mockTimelineEvents);
      setPredictiveMilestones(mockPredictiveMilestones);
      setPatientOutlook(mockPatientOutlook);
      setTreatmentJourney(mockTreatmentJourney);
      setSelectedEvent(mockTimelineEvents.find(e => e.status === 'current') || mockTimelineEvents[0]);
      
    } catch (error) {
      console.error('Error loading patient timeline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventIcon = (type: string, status: string) => {
    const baseClasses = "w-5 h-5";
    const statusClasses = status === 'completed' ? 'text-green-600' :
                         status === 'current' ? 'text-blue-600' :
                         status === 'predicted' ? 'text-purple-600' :
                         'text-gray-500';

    switch (type) {
      case 'diagnosis': return <AlertTriangle className={`${baseClasses} ${statusClasses}`} />;
      case 'treatment': return <Activity className={`${baseClasses} ${statusClasses}`} />;
      case 'assessment': return <Target className={`${baseClasses} ${statusClasses}`} />;
      case 'outcome': return <CheckCircle className={`${baseClasses} ${statusClasses}`} />;
      case 'prediction': return <Brain className={`${baseClasses} ${statusClasses}`} />;
      case 'milestone': return <Heart className={`${baseClasses} ${statusClasses}`} />;
      default: return <Clock className={`${baseClasses} ${statusClasses}`} />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />;
      case 'stable': return <TrendingUp className="w-4 h-4 text-blue-500 transform rotate-90" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'current': return 'bg-blue-100 text-blue-800';
      case 'predicted': return 'bg-purple-100 text-purple-800';
      case 'planned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEvents = timelineEvents.filter(event => {
    if (timeFilter === 'all') return true;
    return event.status === timeFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-lg">Loading patient timeline and predictions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Timeline & Predictions</h1>
            <p className="text-gray-600">AI-powered treatment journey with outcome forecasting</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as 'all' | 'past' | 'current' | 'predicted')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Events</option>
            <option value="completed">Past Events</option>
            <option value="current">Current</option>
            <option value="predicted">Predictions</option>
          </select>
          <button
            onClick={loadPatientTimeline}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Update Timeline</span>
          </button>
        </div>
      </div>

      {/* Patient Outlook Summary */}
      {patientOutlook && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">Short-term Outlook</h3>
                <span className="text-sm text-gray-600">({patientOutlook.short_term.timeframe})</span>
              </div>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-green-600">
                  {patientOutlook.short_term.overall_prognosis}%
                </div>
                <p className="text-sm text-gray-600">Overall prognosis</p>
              </div>
              <div className="space-y-2">
                {patientOutlook.short_term.key_predictions.map((pred, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">{pred.event}</span>
                    <span className="font-medium">{pred.probability}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Medium-term Outlook</h3>
                <span className="text-sm text-gray-600">({patientOutlook.medium_term.timeframe})</span>
              </div>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600">
                  {patientOutlook.medium_term.overall_prognosis}%
                </div>
                <p className="text-sm text-gray-600">Overall prognosis</p>
              </div>
              <div className="space-y-2">
                {patientOutlook.medium_term.key_predictions.map((pred, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">{pred.event}</span>
                    <span className="font-medium">{pred.probability}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Long-term Outlook</h3>
                <span className="text-sm text-gray-600">({patientOutlook.long_term.timeframe})</span>
              </div>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-purple-600">
                  {patientOutlook.long_term.overall_prognosis}%
                </div>
                <p className="text-sm text-gray-600">Overall prognosis</p>
              </div>
              <div className="space-y-2">
                {patientOutlook.long_term.key_predictions.map((pred, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">{pred.event}</span>
                    <span className="font-medium">{pred.probability}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Timeline Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-semibold">Treatment Timeline</h3>
            </div>

            <div className="space-y-4">
              {filteredEvents.map((event, index) => (
                <div 
                  key={event.id}
                  className={`border-l-4 pl-4 py-3 cursor-pointer transition-all ${getImportanceColor(event.importance)} ${
                    selectedEvent?.id === event.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getEventIcon(event.type, event.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {event.outcome && getTrendIcon(event.outcome.trend)}
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 ml-8">{event.description}</p>
                  {event.outcome && (
                    <div className="mt-2 ml-8">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">{event.outcome.metric}:</span>
                        <span className="font-medium">{event.outcome.value}%</span>
                        {event.outcome.predicted && (
                          <span className="text-blue-600">(predicted: {event.outcome.predicted}%)</span>
                        )}
                        <span className="text-gray-500">confidence: {event.outcome.confidence}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Detailed Event View */}
        {selectedEvent && (
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                {getEventIcon(selectedEvent.type, selectedEvent.status)}
                <h3 className="text-xl font-semibold">Event Details</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedEvent.title}</h4>
                  <p className="text-gray-600 mt-1">{selectedEvent.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(selectedEvent.date).toLocaleDateString()} • {selectedEvent.status}
                  </p>
                </div>

                {selectedEvent.outcome && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Outcome Metrics</h5>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">{selectedEvent.outcome.metric}</span>
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(selectedEvent.outcome.trend)}
                          <span className="font-medium">{selectedEvent.outcome.value}%</span>
                        </div>
                      </div>
                      {selectedEvent.outcome.predicted && (
                        <div className="text-sm text-blue-600">
                          Predicted: {selectedEvent.outcome.predicted}% (confidence: {selectedEvent.outcome.confidence}%)
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedEvent.biomarkers && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Biomarkers</h5>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selectedEvent.biomarkers).map(([marker, value]) => (
                        <div key={marker} className="bg-gray-50 rounded-lg p-2">
                          <div className="text-sm text-gray-600">{marker}</div>
                          <div className="font-medium">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEvent.medications && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Medications</h5>
                    <div className="space-y-2">
                      {selectedEvent.medications.map((med, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{med.name}</div>
                              <div className="text-sm text-gray-600">{med.dosage}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Response</div>
                              <div className="font-medium text-green-600">{med.response}%</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEvent.qualityOfLife && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Quality of Life</h5>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-600">Overall Score</span>
                        <span className="text-lg font-bold text-blue-600">{selectedEvent.qualityOfLife.score}/100</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(selectedEvent.qualityOfLife.factors).map(([factor, score]) => (
                          <div key={factor} className="flex justify-between text-sm">
                            <span className="text-gray-600">{factor}</span>
                            <span className="font-medium">{score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedEvent.aiInsights && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">AI Insights</h5>
                    <div className="space-y-2">
                      {selectedEvent.aiInsights.map((insight, index) => (
                        <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                          <Brain className="w-4 h-4 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-blue-900">{insight.message}</p>
                            <p className="text-xs text-blue-600 mt-1">
                              {insight.type} • {insight.confidence}% confidence
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEvent.nextActions && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Next Actions</h5>
                    <ul className="space-y-1">
                      {selectedEvent.nextActions.map((action, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-gray-700">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Predictive Milestones */}
      {predictiveMilestones.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Brain className="w-5 h-5 text-purple-600" />
              <h3 className="text-xl font-semibold">Predictive Milestones</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {predictiveMilestones.map((milestone, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{milestone.event}</h4>
                    <div className="flex items-center space-x-2">
                      {milestone.impact === 'positive' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : milestone.impact === 'negative' ? (
                        <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="font-semibold text-blue-600">{milestone.probability}%</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Expected: {new Date(milestone.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Confidence: {milestone.confidence}%
                  </div>
                  {milestone.alternatives && (
                    <div className="mt-3 pt-3 border-t">
                      <h6 className="text-sm font-medium text-gray-900 mb-2">Alternative Scenarios</h6>
                      <div className="space-y-1">
                        {milestone.alternatives.map((alt, altIndex) => (
                          <div key={altIndex} className="flex justify-between text-xs">
                            <span className="text-gray-600">{alt.scenario}</span>
                            <span className="font-medium">{alt.probability}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Treatment Journey Overview */}
      {treatmentJourney && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="w-5 h-5 text-green-600" />
              <h3 className="text-xl font-semibold">Treatment Journey Overview</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Current Status</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-900 font-medium">{treatmentJourney.current_phase}</p>
                  <p className="text-blue-700 text-sm">Treatment Line {treatmentJourney.treatment_line}</p>
                </div>

                <h4 className="font-medium text-gray-900 mt-6 mb-3">Upcoming Treatment Decisions</h4>
                <div className="space-y-3">
                  {treatmentJourney.upcoming_decisions.map((decision, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium text-gray-900">{decision.decision_point}</h5>
                        <span className="text-sm text-gray-600">
                          {new Date(decision.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {decision.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{option.option}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-green-600">{option.predicted_outcome}%</span>
                              <span className="text-blue-600 font-medium">
                                Rec: {option.recommendation_strength}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Response Trajectory</h4>
                <div className="space-y-2">
                  {treatmentJourney.response_trajectory.map((point, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">
                        {new Date(point.date).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-4 text-sm">
                        <span className="text-green-600">Response: {point.response_score}%</span>
                        <span className="text-blue-600">QoL: {point.quality_of_life}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const PatientTimelineWithBoundary: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Patient Timeline"
      fallbackMessage="The patient timeline system is temporarily unavailable. This feature requires comprehensive data processing and predictive modeling."
    >
      <PatientTimeline />
    </FeatureErrorBoundary>
  );
};

export default PatientTimelineWithBoundary;