import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/UI/Card';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import { useToast } from '../components/UI/Toast';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { Loader, RefreshCw, Rocket, BarChart3, PieChart as PieIcon, Download, Clock, Beaker, Package } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

type TrialAnalyticsRow = {
  drug: string;
  total: number;
  oncologyTotal: number;
  phaseCounts: Record<string, number>;
  ddiSignals: number;
  updatedAt: string;
};

type RunHistoryRow = {
  processed: number;
  duration_ms: number;
  finished_at: string;
};

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

const AdminTrialAnalytics: React.FC = () => {
  const { showToast } = useToast();
  const { state } = useAuth();
  const [rows, setRows] = useState<TrialAnalyticsRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [limit, setLimit] = useState<number>(200);
  const [pageSize, setPageSize] = useState<number>(50);
  const [maxPages, setMaxPages] = useState<number>(2);
  const [lastRunDurationMs, setLastRunDurationMs] = useState<number | null>(() => {
    try { return Number(localStorage.getItem('osrx_trial_analytics_last_duration_ms')) || null } catch { return null }
  });
  const [runs, setRuns] = useState<RunHistoryRow[]>([]);

  // Init Supabase client (frontend)
  const supabaseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || (window as any).__OSRX_SUPABASE_URL__;
  const supabaseKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || (window as any).__OSRX_SUPABASE_KEY__;
  const supabase = useMemo(() => {
    try { return createClient(supabaseUrl, supabaseKey); } catch { return null as any; }
  }, [supabaseUrl, supabaseKey]);

  const loadData = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trial_analytics')
        .select('*')
        .order('updatedAt', { ascending: false })
        .limit(1000);
      if (error) throw error;
      setRows((data || []) as any);
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to load trial analytics');
    } finally {
      setLoading(false);
    }
  };

  const loadLastRunDuration = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('trial_analytics_runs')
        .select('processed, duration_ms, finished_at')
        .order('finished_at', { ascending: false })
        .limit(10);
      if (!error && data) {
        const list = data as RunHistoryRow[];
        setRuns(list);
        if (list[0] && typeof list[0].duration_ms === 'number') {
          setLastRunDurationMs(list[0].duration_ms);
          try { localStorage.setItem('osrx_trial_analytics_last_duration_ms', String(list[0].duration_ms)); } catch {}
        }
      }
    } catch {}
  };

  useEffect(() => { loadData(); loadLastRunDuration(); }, []);

  const aggregatedPhase = useMemo(() => {
    const totals: Record<string, number> = {};
    rows.forEach(r => {
      Object.entries(r.phaseCounts || {}).forEach(([k, v]) => {
        totals[k] = (totals[k] || 0) + (v as number);
      });
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [rows]);

  const ddiBarData = useMemo(() => {
    return rows
      .slice(0, 20)
      .sort((a, b) => b.ddiSignals - a.ddiSignals)
      .map(r => ({ drug: r.drug, signals: r.ddiSignals }));
  }, [rows]);

  const runAgent = async () => {
    try {
      setRunning(true);
      const t0 = Date.now();
      const fnBase = (import.meta as any)?.env?.VITE_SUPABASE_FUNCTIONS_URL || '/functions/v1';
      // Attach user access token if available
      let authHeader: Record<string,string> = {};
      try {
        const { supabase: sb } = await import('../lib/supabase');
        const { data } = await sb.auth.getSession();
        const token = data?.session?.access_token;
        if (token) authHeader = { Authorization: `Bearer ${token}` };
      } catch {}
      const resp = await fetch(`${fnBase}/trial-analytics-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ limit, pageSize, maxPages })
      });
      if (!resp.ok) throw new Error(`Function error: ${resp.status}`);
      const body = await resp.json().catch(() => ({}));
      const t1 = Date.now();
      const dur = Number(body?.durationMs || body?.duration || (t1 - t0));
      setLastRunDurationMs(dur);
      try { localStorage.setItem('osrx_trial_analytics_last_duration_ms', String(dur)); } catch {}
      showToast('success', `Agent processed: ${body?.processed ?? 'OK'} in ${Math.round(dur/1000)}s`);
      await loadData();
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to run analytics agent');
    } finally {
      setRunning(false);
    }
  };

  const lastUpdated = rows.length ? new Date(rows[0].updatedAt).toLocaleString() : '—';

  // Derived summaries
  const totalDrugsProcessed = rows.length;
  const totalOncologyTrials = useMemo(() => rows.reduce((sum, r) => sum + (Number(r.oncologyTotal) || 0), 0), [rows]);

  // Export helpers
  const download = (filename: string, data: string, type = 'text/plain') => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const pretty = JSON.stringify(rows, null, 2);
    download(`trial-analytics-${Date.now()}.json`, pretty, 'application/json');
  };

  const exportCSV = () => {
    if (!rows.length) { showToast('info', 'No data to export'); return; }
    // Collect all phase keys across rows for stable columns
    const phaseKeys = Array.from(new Set(rows.flatMap(r => Object.keys(r.phaseCounts || {})))).sort();
    const header = ['drug','total','oncologyTotal','ddiSignals','updatedAt', ...phaseKeys.map(k => `phase:${k}`)];
    const lines = [header.join(',')];
    for (const r of rows) {
      const base = [r.drug, r.total, r.oncologyTotal, r.ddiSignals, r.updatedAt].map(v => {
        const s = String(v ?? '');
        return s.includes(',') || s.includes('"') ? '"' + s.replace(/"/g,'""') + '"' : s;
      });
      const phases = phaseKeys.map(k => String((r.phaseCounts || {})[k] ?? 0));
      lines.push([...base, ...phases].join(','));
    }
    download(`trial-analytics-${Date.now()}.csv`, lines.join('\n'), 'text/csv');
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Admin', href: '/admin/console' }, { label: 'Trial Analytics' }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Trial Analytics</h1>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="inline-flex items-center gap-1 px-2 py-1 border rounded hover:bg-gray-50 text-sm"><Download size={14}/> CSV</button>
          <button onClick={exportJSON} className="inline-flex items-center gap-1 px-2 py-1 border rounded hover:bg-gray-50 text-sm"><Download size={14}/> JSON</button>
          <div className="flex items-center gap-2 text-sm text-gray-600 ml-2">Last updated: {lastUpdated}
            <button onClick={loadData} className="inline-flex items-center gap-1 px-2 py-1 border rounded hover:bg-gray-50 ml-2"><RefreshCw size={14}/> Refresh</button>
          </div>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Total Drugs Processed</div>
              <div className="text-2xl font-semibold text-gray-900">{totalDrugsProcessed}</div>
            </div>
            <Package className="w-6 h-6 text-blue-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Total Oncology Trials</div>
              <div className="text-2xl font-semibold text-gray-900">{totalOncologyTrials.toLocaleString()}</div>
            </div>
            <Beaker className="w-6 h-6 text-green-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Last Run Duration</div>
              <div className="text-2xl font-semibold text-gray-900">{lastRunDurationMs != null ? `${Math.round(lastRunDurationMs/1000)}s` : '—'}</div>
            </div>
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-3">
          <Rocket className="w-4 h-4 text-purple-600" />
          <div className="font-medium">Run Analytics Agent</div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-gray-600">Limit drugs</label>
            <input type="number" value={limit} onChange={e => setLimit(parseInt(e.target.value || '0'))} className="border rounded px-2 py-1 w-28" />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Page size</label>
            <input type="number" value={pageSize} onChange={e => setPageSize(parseInt(e.target.value || '0'))} className="border rounded px-2 py-1 w-28" />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Max pages</label>
            <input type="number" value={maxPages} onChange={e => setMaxPages(parseInt(e.target.value || '0'))} className="border rounded px-2 py-1 w-28" />
          </div>
          <button onClick={runAgent} disabled={running} className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50">
            {running ? (<span className="inline-flex items-center gap-2"><Loader className="w-4 h-4 animate-spin"/> Running…</span>) : 'Run now'}
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-3"><PieIcon className="w-4 h-4 text-blue-600"/><div className="font-medium">Phase Distribution (all drugs)</div></div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={aggregatedPhase} dataKey="value" nameKey="name" outerRadius={90} label>
                  {aggregatedPhase.map((entry, index) => (
                    <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3"><BarChart3 className="w-4 h-4 text-green-600"/><div className="font-medium">Top DDI Signals</div></div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ddiBarData}>
                <XAxis dataKey="drug" hide/>
                <YAxis />
                <Tooltip />
                <Bar dataKey="signals" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-3"><BarChart3 className="w-4 h-4 text-gray-600"/><div className="font-medium">Run History</div></div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="px-2 py-2">Finished</th>
                <th className="px-2 py-2">Processed</th>
                <th className="px-2 py-2">Duration</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-2 py-2">{new Date(r.finished_at).toLocaleString()}</td>
                  <td className="px-2 py-2">{r.processed}</td>
                  <td className="px-2 py-2">{Math.round((r.duration_ms || 0)/1000)}s</td>
                </tr>
              ))}
              {runs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-2 py-4 text-gray-500">No runs yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="px-2 py-2">Drug</th>
                <th className="px-2 py-2">Total</th>
                <th className="px-2 py-2">Oncology</th>
                <th className="px-2 py-2">DDI Signals</th>
                <th className="px-2 py-2">Phase 1</th>
                <th className="px-2 py-2">Phase 2</th>
                <th className="px-2 py-2">Phase 3</th>
                <th className="px-2 py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.drug} className="border-t">
                  <td className="px-2 py-2 font-medium text-gray-900">{r.drug}</td>
                  <td className="px-2 py-2">{r.total}</td>
                  <td className="px-2 py-2">{r.oncologyTotal}</td>
                  <td className="px-2 py-2">{r.ddiSignals}</td>
                  <td className="px-2 py-2">{r.phaseCounts?.['Phase 1'] || 0}</td>
                  <td className="px-2 py-2">{r.phaseCounts?.['Phase 2'] || 0}</td>
                  <td className="px-2 py-2">{r.phaseCounts?.['Phase 3'] || 0}</td>
                  <td className="px-2 py-2">{new Date(r.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminTrialAnalytics;
