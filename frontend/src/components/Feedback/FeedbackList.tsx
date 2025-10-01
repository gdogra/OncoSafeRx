import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, GitBranch, RefreshCw, Search, Settings } from 'lucide-react';
import Card from '../UI/Card';
import { feedbackService } from '../../services/feedbackService';

type Filters = {
  status?: string;
  priority?: string;
  type?: string;
};

const statuses = ['new','triaged','in_backlog','in_sprint','in_progress','in_review','done','closed','duplicate','wont_fix'];
const priorities = ['critical','high','medium','low'];
const types = ['bug','feature_request','improvement','question','complaint','compliment','security_concern','performance_issue','usability_issue','data_issue','integration_issue'];

const priorityColor = (p?: string) => (
  p === 'critical' ? 'bg-red-100 text-red-800' :
  p === 'high' ? 'bg-orange-100 text-orange-800' :
  p === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
);

const FeedbackList: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [query, setQuery] = useState('');
  const [creatingIssue, setCreatingIssue] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await feedbackService.getAllFeedback(page, limit, filters);
      setItems(data.feedback || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error('Failed to load feedback list:', e);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, limit, filters]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(i => `${i.title} ${i.description}`.toLowerCase().includes(q));
  }, [items, query]);

  const updateStatus = async (id: string, status: string) => {
    try {
      setUpdatingStatus(id);
      await feedbackService.updateFeedbackStatus(id, status);
      await load();
    } catch (e) {
      console.error('Update status failed:', e);
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const createIssue = async (id: string) => {
    try {
      setCreatingIssue(id);
      const res = await feedbackService.createGitHubIssue(id);
      if (res?.issueUrl) {
        window.open(res.issueUrl, '_blank');
      }
      await load();
    } catch (e) {
      console.error('Create issue failed:', e);
      alert('Failed to create GitHub issue');
    } finally {
      setCreatingIssue(null);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Feedback List & Triage
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={load}
            className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-4 gap-3 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title/description"
            className="w-full pl-7 pr-2 py-2 border border-gray-300 rounded text-sm"
          />
        </div>
        <select
          value={filters.status || ''}
          onChange={(e) => { setPage(1); setFilters(f => ({ ...f, status: e.target.value || undefined })); }}
          className="border border-gray-300 rounded px-2 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filters.priority || ''}
          onChange={(e) => { setPage(1); setFilters(f => ({ ...f, priority: e.target.value || undefined })); }}
          className="border border-gray-300 rounded px-2 py-2 text-sm"
        >
          <option value="">All Priorities</option>
          {priorities.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={filters.type || ''}
          onChange={(e) => { setPage(1); setFilters(f => ({ ...f, type: e.target.value || undefined })); }}
          className="border border-gray-300 rounded px-2 py-2 text-sm"
        >
          <option value="">All Types</option>
          {types.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left bg-gray-50">
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Priority</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                  <RefreshCw className="w-5 h-5 inline mr-2 animate-spin" /> Loading...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                  <AlertTriangle className="w-5 h-5 inline mr-2" /> No feedback found
                </td>
              </tr>
            )}
            {!loading && filtered.map((fb) => (
              <tr key={fb.id} className="border-t">
                <td className="px-3 py-2 align-top">
                  <div className="font-medium text-gray-900">{fb.title}</div>
                  <div className="text-gray-600 line-clamp-2">{fb.description}</div>
                  <div className="text-xs text-gray-500 mt-1">{fb.page || 'unknown'} • {fb.category}</div>
                </td>
                <td className="px-3 py-2 align-top">{fb.type}</td>
                <td className="px-3 py-2 align-top">
                  <span className={`px-2 py-0.5 rounded-full ${priorityColor(fb.priority)}`}>{fb.priority}</span>
                </td>
                <td className="px-3 py-2 align-top">
                  <select
                    value={fb.status}
                    onChange={(e) => updateStatus(fb.id, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs"
                    disabled={updatingStatus === fb.id}
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2 align-top text-xs text-gray-500">{new Date(fb.timestamp).toLocaleString()}</td>
                <td className="px-3 py-2 align-top">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => createIssue(fb.id)}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      disabled={creatingIssue === fb.id}
                      title="Create GitHub Issue"
                    >
                      <GitBranch className="w-3 h-3 inline mr-1" /> {creatingIssue === fb.id ? 'Creating...' : 'Issue'}
                    </button>
                    {fb.metadata?.githubIssue?.url && (
                      <a
                        href={fb.metadata.githubIssue.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <Check className="w-3 h-3 inline mr-1 text-green-600" /> View
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <div className="text-gray-600">Total: {total}</div>
        <div className="flex items-center space-x-2">
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">Prev</button>
          <span>Page {page}</span>
          <button disabled={(page * limit) >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">Next</button>
          <select value={limit} onChange={(e) => { setPage(1); setLimit(parseInt(e.target.value)); }} className="border border-gray-300 rounded px-2 py-1">
            {[10,25,50,100].map(n => <option key={n} value={n}>{n}/page</option>)}
          </select>
        </div>
      </div>
    </Card>
  );
};

export default FeedbackList;

