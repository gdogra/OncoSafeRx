import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  Tag, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';
import Modal from '../UI/Modal';
import Card from '../UI/Card';
import { feedbackService } from '../../services/feedbackService';

interface FeedbackDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackDashboard: React.FC<FeedbackDashboardProps> = ({ isOpen, onClose }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
    }
  }, [isOpen]);

  const loadAnalytics = () => {
    setLoading(true);
    try {
      const data = feedbackService.getFeedbackAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading feedback analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    try {
      const data = feedbackService.exportFeedbackData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `oncosaferx-feedback-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      bug: '🐛',
      feature_request: '💡',
      improvement: '⚡',
      question: '❓',
      complaint: '😠',
      compliment: '👍',
      security_concern: '🔒',
      performance_issue: '🚀',
      usability_issue: '🎯',
      data_issue: '📊',
      integration_issue: '🔗'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Feedback Dashboard" size="xl">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </Modal>
    );
  }

  if (!analytics) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Feedback Dashboard" size="xl">
        <div className="text-center py-8">
          <p className="text-gray-600">No feedback data available.</p>
        </div>
      </Modal>
    );
  }

  const { totalFeedback, totalTickets, byType, byCategory, byPriority, recentFeedback, sprintPlan } = analytics;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Feedback Dashboard" size="full">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={loadAnalytics}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200"
            >
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <div className="text-2xl font-bold text-primary-600">{totalFeedback}</div>
            <div className="text-sm text-gray-600">Total Feedback</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalTickets}</div>
            <div className="text-sm text-gray-600">Active Tickets</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">{sprintPlan.currentSprint.length}</div>
            <div className="text-sm text-gray-600">Current Sprint</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600">{sprintPlan.nextSprint.length}</div>
            <div className="text-sm text-gray-600">Next Sprint</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Feedback by Type */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Feedback by Type
            </h3>
            <div className="space-y-3">
              {Object.entries(byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTypeIcon(type)}</span>
                    <span className="text-sm font-medium">{type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${(count as number / totalFeedback) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Feedback by Priority */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Priority Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(byPriority).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                    {priority}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${(count as number / totalFeedback) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sprint Planning */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Sprint Planning
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Current Sprint */}
            <div>
              <h4 className="font-medium text-green-900 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Current Sprint ({sprintPlan.currentSprint.length} items)
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {sprintPlan.currentSprint.map((item: any, index: number) => (
                  <div key={index} className="p-2 bg-green-50 rounded border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                      <span className="text-xs text-gray-500">{item.effort}</span>
                    </div>
                    <div className="text-xs font-medium mt-1">{getTypeIcon(item.type)} {item.type}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Sprint */}
            <div>
              <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Next Sprint ({sprintPlan.nextSprint.length} items)
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {sprintPlan.nextSprint.map((item: any, index: number) => (
                  <div key={index} className="p-2 bg-blue-50 rounded border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                      <span className="text-xs text-gray-500">{item.effort}</span>
                    </div>
                    <div className="text-xs font-medium mt-1">{getTypeIcon(item.type)} {item.type}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Backlog */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                Backlog ({sprintPlan.backlog.length} items)
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {sprintPlan.backlog.slice(0, 10).map((item: any, index: number) => (
                  <div key={index} className="p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                      <span className="text-xs text-gray-500">{item.effort}</span>
                    </div>
                    <div className="text-xs font-medium mt-1">{getTypeIcon(item.type)} {item.type}</div>
                  </div>
                ))}
                {sprintPlan.backlog.length > 10 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{sprintPlan.backlog.length - 10} more items...
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Feedback */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Recent Feedback
          </h3>
          <div className="space-y-4">
            {recentFeedback.slice(0, 5).map((feedback: any, index: number) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getTypeIcon(feedback.type)}</span>
                      <span className="font-medium text-gray-900">{feedback.title}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(feedback.priority)}`}>
                        {feedback.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{feedback.description.substring(0, 150)}...</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>📍 {feedback.page}</span>
                      <span>🕒 {new Date(feedback.timestamp).toLocaleDateString()}</span>
                      <span>🏷️ {feedback.category}</span>
                      {feedback.metadata?.githubIssue && (
                        <a
                          href={feedback.metadata.githubIssue.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                        >
                          <span>🔗 GitHub #{feedback.metadata.githubIssue.number}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Modal>
  );
};

export default FeedbackDashboard;