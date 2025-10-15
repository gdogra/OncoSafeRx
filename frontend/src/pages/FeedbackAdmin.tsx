import React, { useState } from 'react';
import { Settings, MessageSquare, BarChart3, Calendar, Download, Database, CheckCircle2, AlertTriangle } from 'lucide-react';
import Card from '../components/UI/Card';
import FeedbackDashboard from '../components/Feedback/FeedbackDashboard';
import GitHubIntegration from '../components/Feedback/GitHubIntegration';
import FeedbackList from '../components/Feedback/FeedbackList';
import HealthBanner from '../components/System/HealthBanner';
import DeployStatusPanel from '../components/Admin/DeployStatusPanel';
import { useToast } from '../components/UI/Toast';
import { feedbackService } from '../services/feedbackService';
import Breadcrumbs from '../components/UI/Breadcrumbs';

const FeedbackAdmin: React.FC = () => {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const clearData = () => {
    if (confirm('Are you sure you want to clear all feedback data? This action cannot be undone.')) {
      feedbackService.clearFeedbackData();
      loadAnalytics();
      alert('Feedback data cleared successfully.');
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await feedbackService.getFeedbackAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Fallback to empty data
      setAnalytics({
        totalFeedback: 0,
        totalTickets: 0,
        recentFeedback: [],
        sprintPlan: { currentSprint: [], nextSprint: [], backlog: [] }
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadAnalytics();
    refreshMigrationStatus();
    refreshSeedStatus();
  }, []);

  const { showToast } = useToast();

  const refreshMigrationStatus = async () => {
    try {
      const token = getAccessToken();
      const resp = await fetch('/api/feedback/admin/migration-status', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (resp.ok) {
        const json = await resp.json();
        setMigration(json);
      }
    } catch (e) {
      // ignore
    }
  };

  const refreshSeedStatus = async () => {
    try {
      const { adminApi } = await import('../utils/adminApi');
      const resp = await adminApi.get('/api/admin/rbac/seed-status');
      if (resp.ok) {
        const json = await resp.json();
        setSeedStatus(json);
      }
    } catch (e) {
      // ignore
    }
  };

  const runMigration = async () => {
    try {
      const token = getAccessToken();
      const resp = await fetch('/api/feedback/admin/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ force: true })
      });
      if (resp.ok) {
        const json = await resp.json();
        await refreshMigrationStatus();
        showToast('success', `Migration complete: inserted ${json.inserted || 0} item(s).`, 4000);
      } else {
        showToast('error', 'Migration failed.', 4000);
      }
    } catch (e) {
      showToast('error', 'Migration error.', 4000);
    }
  };

  const [migration, setMigration] = useState<{ ran: boolean; inserted: number; supabaseEnabled: boolean } | null>(null);
  const [seedStatus, setSeedStatus] = useState<{
    tenantId: string | null;
    idsAssigned: string[];
    emailsResolved: string[];
    emailsUnresolved: string[];
    totalAssigned: number;
    totalResolved: number;
    totalUnresolved: number;
  } | null>(null);
  const getAccessToken = (): string | null => {
    try { const raw = localStorage.getItem('osrx_auth_tokens'); return raw ? JSON.parse(raw).access_token : null; } catch { return null; }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Feedback Admin' }]} />
      {/* System health banner */}
      <HealthBanner />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="w-6 h-6 mr-2" />
            Feedback Administration
          </h1>
          <p className="text-gray-600 mt-1">
            Manage user feedback, view analytics, and plan sprints based on automated ticket categorization.
          </p>
        </div>
        <div className="flex space-x-3 items-center">
          {/* Migration/Supabase status badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full border text-xs"
               title="Feedback storage status">
            <Database className="w-3.5 h-3.5" />
            {migration?.supabaseEnabled ? (
              <span className="text-green-700">Supabase on</span>
            ) : (
              <span className="text-gray-700">Supabase off</span>
            )}
            {migration?.ran && (
              <span className="ml-2 inline-flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mr-1" />
                migrated {migration.inserted}
              </span>
            )}
            {!migration?.ran && migration?.supabaseEnabled && (
              <span className="ml-2 inline-flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 mr-1" />
                migration pending
              </span>
            )}
          </div>
          {migration?.supabaseEnabled && (
            <button
              onClick={runMigration}
              className="hidden sm:inline-flex items-center space-x-1 px-3 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
              title="Run in-memory → Supabase migration"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Migrate</span>
            </button>
          )}
          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
          <button
            onClick={() => setIsDashboardOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Dashboard</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary-600">
            {loading ? '...' : (analytics?.totalFeedback || 0)}
          </div>
          <div className="text-sm text-gray-600">Total Feedback</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {loading ? '...' : (analytics?.totalTickets || 0)}
          </div>
          <div className="text-sm text-gray-600">Active Tickets</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {loading ? '...' : (analytics?.sprintPlan?.currentSprint?.length || 0)}
          </div>
          <div className="text-sm text-gray-600">Current Sprint</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {loading ? '...' : (analytics?.sprintPlan?.nextSprint?.length || 0)}
          </div>
          <div className="text-sm text-gray-600">Next Sprint</div>
        </Card>
      </div>

      {/* System Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Feedback Classification */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Automated Classification System</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Classification Features</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Automatic type detection (bug, feature, improvement, etc.)</li>
                <li>• Priority assignment based on keywords and context</li>
                <li>• Effort estimation for sprint planning</li>
                <li>• Category mapping to product areas</li>
                <li>• Label generation for better organization</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Sprint Integration</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Automatic sprint capacity calculation</li>
                <li>• Priority-based ticket sorting</li>
                <li>• Effort point distribution (XS: 1pt → XXL: 21pts)</li>
                <li>• Backlog management with overflow handling</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Feedback Activity</h2>
          <div className="space-y-3">
            {!loading && analytics?.recentFeedback?.slice(0, 5).map((feedback: any, index: number) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{feedback.title}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    feedback.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    feedback.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    feedback.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {feedback.priority}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {feedback.type} • {feedback.category} • {new Date(feedback.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-center text-gray-500 py-8">
                <div className="animate-pulse">Loading recent feedback...</div>
              </div>
            )}
            {!loading && (!analytics?.recentFeedback || analytics.recentFeedback.length === 0) && (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No feedback submitted yet</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Feedback List & Triage */}
      <FeedbackList />

      {/* GitHub Integration */}
      <GitHubIntegration onConfigChange={loadAnalytics} />

      {/* Deploy Status */}
      <DeployStatusPanel />

      {/* RBAC Seed Status */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">RBAC Seeding Status</h2>
          <button
            onClick={refreshSeedStatus}
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-800 mb-1">Tenant</div>
            <div className="text-gray-600">{seedStatus?.tenantId || 'unknown'}</div>
          </div>
          <div>
            <div className="font-medium text-gray-800 mb-1">IDs Assigned</div>
            <div className="text-gray-600">{seedStatus?.totalAssigned ?? 0}</div>
          </div>
          <div>
            <div className="font-medium text-gray-800 mb-1">Emails Resolved/Unresolved</div>
            <div className="text-gray-600">{seedStatus ? `${seedStatus.totalResolved}/${seedStatus.totalUnresolved}` : '0/0'}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-4">
          <div>
            <div className="font-medium text-gray-800 mb-2">Assigned User IDs</div>
            <ul className="text-xs text-gray-600 space-y-1 max-h-36 overflow-auto border rounded p-2">
              {(seedStatus?.idsAssigned || []).map((id, i) => (
                <li key={i} className="font-mono">{id}</li>
              ))}
              {(!seedStatus?.idsAssigned || seedStatus.idsAssigned.length === 0) && (
                <li className="text-gray-400">None</li>
              )}
            </ul>
          </div>
          <div>
            <div className="font-medium text-gray-800 mb-2">Resolved Emails</div>
            <ul className="text-xs text-gray-600 space-y-1 max-h-36 overflow-auto border rounded p-2">
              {(seedStatus?.emailsResolved || []).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
              {(!seedStatus?.emailsResolved || seedStatus.emailsResolved.length === 0) && (
                <li className="text-gray-400">None</li>
              )}
            </ul>
          </div>
          <div>
            <div className="font-medium text-gray-800 mb-2">Unresolved Emails</div>
            <ul className="text-xs text-gray-600 space-y-1 max-h-36 overflow-auto border rounded p-2">
              {(seedStatus?.emailsUnresolved || []).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
              {(!seedStatus?.emailsUnresolved || seedStatus.emailsUnresolved.length === 0) && (
                <li className="text-gray-400">None</li>
              )}
            </ul>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h2>
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-900 mb-2">⚠️ Important Notes</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Feedback data is currently stored locally in browser localStorage</li>
              <li>• In production, this should be connected to a backend API</li>
              <li>• Data may be lost if browser storage is cleared</li>
              <li>• Export data regularly for backup purposes</li>
            </ul>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={exportData}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              Export All Data
            </button>
            <button
              onClick={loadAnalytics}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh Analytics'}
            </button>
            <button
              onClick={clearData}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </Card>

      {/* Sprint Planning Workflow */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Sprint Planning Workflow
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="font-medium text-green-900">1. Collection</h3>
            <div className="text-sm text-gray-600">
              <p>Users submit feedback through the floating feedback button throughout the application.</p>
              <div className="mt-2 p-2 bg-green-50 rounded">
                <strong>Automated:</strong> Type detection, priority assignment, effort estimation
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-blue-900">2. Classification</h3>
            <div className="text-sm text-gray-600">
              <p>ML-style classification assigns tickets to appropriate categories and estimates work required.</p>
              <div className="mt-2 p-2 bg-blue-50 rounded">
                <strong>Output:</strong> Categorized tickets with priority, effort, and labels
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium text-purple-900">3. Sprint Planning</h3>
            <div className="text-sm text-gray-600">
              <p>Automated sprint capacity calculation distributes tickets across current and future sprints.</p>
              <div className="mt-2 p-2 bg-purple-50 rounded">
                <strong>Result:</strong> Ready-to-implement sprint backlog
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Feedback Dashboard Modal */}
      <FeedbackDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
      />
    </div>
  );
};

export default FeedbackAdmin;
