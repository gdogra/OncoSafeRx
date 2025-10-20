import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/UI/Card';
import { useAuth } from '../context/AuthContext';
import { Filter, Trash2, Download, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

type OnboardingEvent = {
  time: number;
  event: string;
  role?: string;
  step?: string;
  index?: number;
  to?: string;
};

const AdminOnboardingAnalytics: React.FC = () => {
  const { state } = useAuth();
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [serverMetrics, setServerMetrics] = useState<any | null>(null);
  const [serverEnabled, setServerEnabled] = useState<boolean>(false);
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d');

  const events: OnboardingEvent[] = useMemo(() => {
    const out: OnboardingEvent[] = [];
    try {
      const sessionRaw = localStorage.getItem('current_session');
      if (sessionRaw) {
        const sess = JSON.parse(sessionRaw);
        const interactions = Array.isArray(sess.interactions) ? sess.interactions : [];
        interactions.forEach((i: any) => {
          try {
            const payload = typeof i.value === 'string' ? JSON.parse(i.value) : null;
            if (payload && typeof payload.event === 'string' && payload.event.startsWith('onboarding_')) {
              out.push({
                time: Date.parse(i.timestamp || new Date().toISOString()),
                event: payload.event,
                role: sess.userRole || state.user?.role,
                step: payload.data?.step,
                index: payload.data?.index,
                to: payload.data?.to
              });
            }
          } catch {}
        });
      }
    } catch {}
    // Also scan archived analytics if present
    try {
      const archive = JSON.parse(localStorage.getItem('osrx_analytics_data') || '[]');
      archive.forEach((row: any) => {
        try {
          const d = row?.data;
          const interactions = Array.isArray(d?.interactions) ? d.interactions : [];
          interactions.forEach((i: any) => {
            const payload = typeof i.value === 'string' ? JSON.parse(i.value) : null;
            if (payload && typeof payload.event === 'string' && payload.event.startsWith('onboarding_')) {
              out.push({
                time: Date.parse(i.timestamp || row.localTimestamp || new Date().toISOString()),
                event: payload.event,
                role: d?.userRole || state.user?.role,
                step: payload.data?.step,
                index: payload.data?.index,
                to: payload.data?.to
              });
            }
          });
        } catch {}
      });
    } catch {}
    return out.sort((a, b) => b.time - a.time);
  }, [state.user?.role]);

  const filtered = events.filter(e => !roleFilter || (e.role || '').toLowerCase() === roleFilter.toLowerCase());

  useEffect(() => {
    try {
      const features = (window as any).__OSRX_FEATURES__ || {};
      const override = localStorage.getItem('analytics_server_enabled');
      const enabled = override ? override === 'true' : Boolean(features.analyticsServerEnabled);
      setServerEnabled(enabled);
      if (!enabled) return;
      fetch(`/api/analytics/metrics?range=${range}`, { credentials: 'include' })
        .then(r => (r.ok ? r.json() : null))
        .then(d => setServerMetrics(d))
        .catch(() => setServerMetrics(null));
    } catch {}
  }, [range]);

  const exportCsv = () => {
    const rows = [
      ['time','event','role','step','index','to'],
      ...filtered.map(e => [new Date(e.time).toISOString(), e.event, e.role || '', e.step || '', String(e.index ?? ''), e.to || ''])
    ];
    const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onboarding-events-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportServerTimeseriesCsv = () => {
    if (!serverMetrics?.onboarding?.timeseries) return;
    const rows = [
      ['date', 'completed'],
      ...Object.entries(serverMetrics.onboarding.timeseries).map(([date, count]: any) => [date, String(count)])
    ];
    const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onboarding-timeseries-${range}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportServerTimeseriesByRoleCsv = () => {
    if (!serverMetrics?.onboarding?.timeseriesByRole) return;
    const roles: string[] = Object.keys(serverMetrics.onboarding.timeseriesByRole);
    const datesSet = new Set<string>();
    roles.forEach(r => Object.keys(serverMetrics.onboarding.timeseriesByRole[r]).forEach(d => datesSet.add(d)));
    const dates = Array.from(datesSet).sort();
    const header = ['date', ...roles];
    const rows = [header, ...dates.map(date => {
      const row: any[] = [date];
      roles.forEach(r => row.push(String(serverMetrics.onboarding.timeseriesByRole[r][date] || 0)));
      return row;
    })];
    const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onboarding-timeseries-by-role-${range}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportServerFunnelCsv = () => {
    if (!serverMetrics?.onboarding?.funnelByRole) return;
    const rows = [
      ['role','next','cta','skip','close','completed'] as any[],
      ...Object.entries(serverMetrics.onboarding.funnelByRole).map(([role, v]: any) => [role, v.next, v.cta, v.skip, v.close, v.completed])
    ];
    const csv = rows.map(r => r.map((v: any) => '"' + String(v).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onboarding-funnel-by-role-${range}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportServerStartsCsv = () => {
    if (!serverMetrics?.onboarding?.startsByRole) return;
    const rows = [
      ['role','starts'] as any[],
      ...Object.entries(serverMetrics.onboarding.startsByRole).map(([role, count]: any) => [role, count])
    ];
    const csv = rows.map(r => r.map((v: any) => '"' + String(v).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onboarding-starts-by-role-${range}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Onboarding Analytics</h1>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <input
              placeholder="Filter by role (e.g., oncologist, patient)"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
            <button onClick={exportCsv} className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={() => {
                if (confirm('Clear local analytics archive? This affects only your browser.')) {
                  localStorage.removeItem('osrx_analytics_data');
                  window.location.reload();
                }
              }}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear archive
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">Showing locally stored onboarding events from the current browser session and archive. Server analytics are disabled by default.</p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-600" /> Server Metrics (7d)
            </h2>
            <p className="text-sm text-gray-600">Aggregates from /api/analytics/metrics (enable via FRONTEND_SERVER_ANALYTICS=true)</p>
          </div>
          <div className={`text-xs px-2 py-0.5 rounded ${serverEnabled ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
            {serverEnabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="text-gray-600">Range:</span>
          <select value={range} onChange={(e) => setRange(e.target.value as any)} className="border border-gray-300 rounded px-2 py-1 text-sm">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          {serverEnabled && (
            <>
              <button onClick={exportServerTimeseriesCsv} className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50">
                <Download className="w-3.5 h-3.5" /> Export Timeseries CSV
              </button>
              <button onClick={exportServerTimeseriesByRoleCsv} className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50">
                <Download className="w-3.5 h-3.5" /> Export Timeseries by Role CSV
              </button>
            </>
          )}
        </div>
        {!serverEnabled && (
          <div className="mt-3 text-xs text-gray-600">
            Set <code>FRONTEND_SERVER_ANALYTICS=true</code> on the server to post events; optionally override per-browser by setting <code>analytics_server_enabled</code> in localStorage.
          </div>
        )}
        {serverEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
            <div className="border rounded p-3">
              <div className="text-sm text-gray-600">Unique Visitors</div>
              <div className="text-xl font-semibold">{serverMetrics?.uniqueVisitors ?? '—'}</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-sm text-gray-600">Page Views</div>
              <div className="text-xl font-semibold">{serverMetrics?.pageViews ?? '—'}</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-sm text-gray-600">Avg Session (s)</div>
              <div className="text-xl font-semibold">{serverMetrics?.averageSessionDuration ?? '—'}</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-sm text-gray-600">Bounce Rate (%)</div>
              <div className="text-xl font-semibold">{serverMetrics?.bounceRate ?? '—'}</div>
            </div>
          </div>
        )}
        {serverEnabled && serverMetrics?.onboarding && (
          <div className="mt-4">
            <h3 className="text-md font-medium text-gray-900 mb-2">Onboarding Funnel (7d)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded p-3">
                <div className="text-sm text-gray-600 mb-2">By Role</div>
                {Object.keys(serverMetrics.onboarding.funnelByRole).length === 0 ? (
                  <div className="py-6 text-center text-gray-500 text-sm">No onboarding events</div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(serverMetrics.onboarding.funnelByRole).map(([role, v]: any) => ({ role, ...v }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="role" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="next" stackId="a" fill="#60a5fa" name="Next" />
                        <Bar dataKey="cta" stackId="a" fill="#34d399" name="CTA" />
                        <Bar dataKey="skip" stackId="a" fill="#f59e0b" name="Skip" />
                        <Bar dataKey="close" stackId="a" fill="#a78bfa" name="Close" />
                        <Bar dataKey="completed" stackId="a" fill="#ef4444" name="Completed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              <div className="border rounded p-3">
                <div className="text-sm text-gray-600 mb-2">Steps (Index → Count)</div>
                {Object.entries(serverMetrics.onboarding.steps).length === 0 ? (
                  <div className="py-6 text-center text-gray-500 text-sm">No step data</div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(serverMetrics.onboarding.steps).map(([k, v]: any) => ({ step: Number(k), count: v }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="step" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#60a5fa" name="Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 border rounded p-3">
              <div className="text-sm text-gray-600 mb-2">Completions Over Time</div>
              {Object.entries(serverMetrics.onboarding.timeseries || {}).length === 0 ? (
                <div className="py-6 text-center text-gray-500 text-sm">No completion data</div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={Object.entries(serverMetrics.onboarding.timeseries).map(([date, count]: any) => ({ date, count }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line dataKey="count" stroke="#ef4444" name="Completed" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-0 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-gray-600">
              <th className="py-2 px-3">Time</th>
              <th className="py-2 px-3">Event</th>
              <th className="py-2 px-3">Role</th>
              <th className="py-2 px-3">Step</th>
              <th className="py-2 px-3">Index</th>
              <th className="py-2 px-3">CTA Dest</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">No onboarding events</td>
              </tr>
            )}
            {filtered.map((e, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-2 px-3">{new Date(e.time).toLocaleString()}</td>
                <td className="py-2 px-3">{e.event}</td>
                <td className="py-2 px-3">{e.role || '-'}</td>
                <td className="py-2 px-3">{e.step || '-'}</td>
                <td className="py-2 px-3">{typeof e.index === 'number' ? e.index : '-'}</td>
                <td className="py-2 px-3">{e.to || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default AdminOnboardingAnalytics;
