import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '../utils/env';
import { interactionService } from '../services/api';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useSelection } from '../context/SelectionContext';
import EnhancedDrugSearchBar from '../components/DrugSearch/EnhancedDrugSearchBar';

type KnownInteraction = {
  drugs: string[];
  severity: string;
  mechanism?: string;
  effect?: string;
  management?: string;
  evidence_level?: string;
  sources?: string[];
  drug_rxnorm?: { name: string; rxcui: string | null }[];
};

const CuratedInteractions: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [drug, setDrug] = useState('');
  const [drugA, setDrugA] = useState('');
  const [drugB, setDrugB] = useState('');
  const [severity, setSeverity] = useState('');
  const [resolveRx, setResolveRx] = useState(true);
  const [results, setResults] = useState<{ count: number; total: number; interactions: KnownInteraction[] } | null>(null);
  const [sortBy, setSortBy] = useState<'drugA'|'drugB'|'severity'>('severity');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selection = useSelection();
  // Editor visibility without requiring AuthProvider; opt-in via localStorage
  const canEdit = typeof window !== 'undefined' && (localStorage.getItem('allow_curated_editor') === '1');
  const [showEditor, setShowEditor] = useState(false);
  const [form, setForm] = useState({ a: '', b: '', severity: 'moderate', mechanism: '', effect: '', management: '', evidence_level: '', sources: '' });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await interactionService.getKnownInteractions({ drug, drugA, drugB, severity, resolveRx: resolveRx ? 'true' : 'false' });
      setResults({ count: data.count, total: data.total, interactions: data.interactions || [] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load curated interactions');
    } finally {
      setLoading(false);
    }
  };

  // Parse query params and update state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qDrug = params.get('drug') || '';
    const qA = params.get('drugA') || '';
    const qB = params.get('drugB') || '';
    const qSev = params.get('severity') || '';
    const qResolve = params.get('resolveRx');

    setDrug(qDrug);
    setDrugA(qA);
    setDrugB(qB);
    setSeverity(qSev);
    setResolveRx(qResolve ? qResolve === 'true' : true);
  }, [location.search]);

  // Prefill from global selection if available and no query params
  useEffect(() => {
    if (!drug && selection.selectedDrugs.length > 0) {
      const names = selection.selectedDrugs.map(d => d.name);
      setDrug(names[0] || '');
      setDrugA(names[0] || '');
      setDrugB(names[1] || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load whenever filters change
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drug, drugA, drugB, severity, resolveRx]);

  const exportFile = (format: 'csv' | 'tsv') => {
    const params = new URLSearchParams();
    if (drug) params.set('drug', drug);
    if (drugA) params.set('drugA', drugA);
    if (drugB) params.set('drugB', drugB);
    if (severity) params.set('severity', severity);
    if (resolveRx) params.set('resolveRx', 'true');
    params.set('view', format);
    const url = `${apiBaseUrl()}/interactions/known?${params.toString()}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Curated Drug Interactions</h1>
        <div className="flex items-center space-x-2">
          <button onClick={() => exportFile('csv')} className="px-3 py-2 bg-primary-600 text-white rounded-md">Export CSV</button>
          <button onClick={() => exportFile('tsv')} className="px-3 py-2 bg-gray-700 text-white rounded-md">Export TSV</button>
          {canEdit && (
            <button onClick={() => setShowEditor(true)} className="px-3 py-2 bg-emerald-600 text-white rounded-md">Add Curated</button>
          )}
        </div>
      </div>

      <Card>
        <div className="grid md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Drug</label>
            <EnhancedDrugSearchBar
              onDrugSelect={(d) => setDrug(d.name)}
              placeholder="Search or select a drug (e.g., aspirin)"
              showTooltips={false}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Drug A</label>
            <EnhancedDrugSearchBar
              onDrugSelect={(d) => setDrugA(d.name)}
              placeholder="Search or select Drug A"
              showTooltips={false}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Drug B</label>
            <EnhancedDrugSearchBar
              onDrugSelect={(d) => setDrugB(d.name)}
              placeholder="Search or select Drug B"
              showTooltips={false}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Severity</label>
            <select value={severity} onChange={e => setSeverity(e.target.value)} className="w-full border rounded-md px-3 py-2">
              <option value="">Any</option>
              <option value="major">Major</option>
              <option value="moderate">Moderate</option>
              <option value="minor">Minor</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center space-x-2">
              <input type="checkbox" checked={resolveRx} onChange={e => setResolveRx(e.target.checked)} />
              <span className="text-sm text-gray-700">Resolve RXCUIs</span>
            </label>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-2">
          <button onClick={load} className="px-4 py-2 bg-primary-600 text-white rounded-md">Search</button>
          <button
            onClick={() => {
              const params = new URLSearchParams();
              if (drug) params.set('drug', drug);
              if (drugA) params.set('drugA', drugA);
              if (drugB) params.set('drugB', drugB);
              if (severity) params.set('severity', severity);
              if (resolveRx) params.set('resolveRx', 'true');
              navigate({ pathname: '/curated', search: params.toString() ? `?${params.toString()}` : '' });
            }}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md"
          >
            Shareable Link
          </button>
        </div>
      </Card>

      {error && <Alert type="error" title="Error">{error}</Alert>}
      {loading && <div className="py-8 flex justify-center"><LoadingSpinner /></div>}

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Add Curated Interaction</h3>
              <button onClick={() => setShowEditor(false)} className="text-gray-600">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Drug A</label>
                <input value={form.a} onChange={e => setForm({ ...form, a: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" placeholder="e.g., warfarin" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Drug B</label>
                <input value={form.b} onChange={e => setForm({ ...form, b: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" placeholder="e.g., aspirin" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Severity</label>
                <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className="w-full border rounded px-2 py-1 text-sm">
                  <option value="major">major</option>
                  <option value="moderate">moderate</option>
                  <option value="minor">minor</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Evidence level</label>
                <input value={form.evidence_level} onChange={e => setForm({ ...form, evidence_level: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" placeholder="e.g., A/B/C" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Mechanism</label>
                <textarea value={form.mechanism} onChange={e => setForm({ ...form, mechanism: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" rows={2} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Effect</label>
                <textarea value={form.effect} onChange={e => setForm({ ...form, effect: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" rows={2} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Management</label>
                <textarea value={form.management} onChange={e => setForm({ ...form, management: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" rows={2} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Sources (comma-separated or URLs)</label>
                <input value={form.sources} onChange={e => setForm({ ...form, sources: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button onClick={() => setShowEditor(false)} className="px-3 py-1.5 text-sm bg-gray-100 rounded">Cancel</button>
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('curated_admin_token') || String((import.meta as any)?.env?.VITE_CURATED_EDITOR_TOKEN || '');
                    if (!token) { alert('Missing admin token. Set localStorage.curated_admin_token or VITE_CURATED_EDITOR_TOKEN.'); return; }
                    const payload = {
                      drugs: [form.a, form.b],
                      severity: form.severity,
                      mechanism: form.mechanism,
                      effect: form.effect,
                      management: form.management,
                      evidence_level: form.evidence_level,
                      sources: form.sources.split(',').map(s => s.trim()).filter(Boolean)
                    };
                    const resp = await fetch(`/api/interactions/known`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, body: JSON.stringify(payload) });
                    if (!resp.ok) {
                      const msg = await resp.text();
                      throw new Error(`Failed: ${resp.status} ${msg}`);
                    }
                    setShowEditor(false);
                    load();
                  } catch (e) {
                    alert('Failed to add curated interaction');
                  }
                }}
                className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded"
              >Save</button>
            </div>
          </div>
        </div>
      )}

      {!loading && results && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Results ({results.count}/{results.total})</h2>
            <div className="text-xs text-gray-600 inline-flex items-center gap-2">
              <span>Sort:</span>
              <select className="border rounded px-1 py-0.5" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
                <option value="severity">Severity</option>
                <option value="drugA">Drug A</option>
                <option value="drugB">Drug B</option>
              </select>
              <button className="underline" onClick={() => setSortDir(d => d==='asc'?'desc':'asc')}>{sortDir === 'asc' ? 'Asc' : 'Desc'}</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4 cursor-pointer" onClick={() => setSortBy('drugA')}>Drug A</th>
                  <th className="py-2 pr-4 cursor-pointer" onClick={() => setSortBy('drugB')}>Drug B</th>
                  <th className="py-2 pr-4 cursor-pointer" onClick={() => setSortBy('severity')}>Severity</th>
                  <th className="py-2 pr-4">Effect</th>
                  <th className="py-2 pr-4">Management</th>
                  <th className="py-2 pr-4">Sources</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.interactions
                  .slice()
                  .sort((a, b) => {
                    const aA = (a.drug_rxnorm?.[0]?.name || a.drugs?.[0] || '').toLowerCase();
                    const aB = (a.drug_rxnorm?.[1]?.name || a.drugs?.[1] || '').toLowerCase();
                    const bA = (b.drug_rxnorm?.[0]?.name || b.drugs?.[0] || '').toLowerCase();
                    const bB = (b.drug_rxnorm?.[1]?.name || b.drugs?.[1] || '').toLowerCase();
                    if (sortBy === 'drugA') return (sortDir==='asc' ? 1 : -1) * (aA > bA ? 1 : aA < bA ? -1 : 0);
                    if (sortBy === 'drugB') return (sortDir==='asc' ? 1 : -1) * (aB > bB ? 1 : aB < bB ? -1 : 0);
                    // severity order major > moderate > minor > unknown
                    const rank = (s?: string) => ({ major: 3, high:3, moderate:2, minor:1, low:1 }[(s||'').toLowerCase()] || 0);
                    const r = rank(a.severity) - rank(b.severity);
                    return (sortDir==='asc' ? 1 : -1) * (r === 0 ? 0 : r);
                  })
                  .map((it, idx) => {
                    const a = it.drug_rxnorm?.[0];
                    const b = it.drug_rxnorm?.[1];
                    const sev = (it.severity || '').toLowerCase();
                    const sevClass = sev==='major'||sev==='high' ? 'bg-red-100 text-red-800' : sev==='moderate' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700';
                    return (
                    <>
                      <tr key={idx} className="border-b align-top">
                        <td className="py-2 pr-4">
                          {a ? `${a.name} ${a.rxcui ? `(RXCUI ${a.rxcui})` : ''}` : it.drugs[0]}
                        </td>
                        <td className="py-2 pr-4">
                          {b ? `${b.name} ${b.rxcui ? `(RXCUI ${b.rxcui})` : ''}` : it.drugs[1]}
                        </td>
                        <td className="py-2 pr-4 capitalize">
                          <span className={`px-2 py-0.5 rounded text-xs ${sevClass}`}>{it.severity || 'unknown'}</span>
                          {it.evidence_level && (
                            <span className="ml-2 text-[11px] text-gray-500">Evidence {it.evidence_level}</span>
                          )}
                        </td>
                        <td className="py-2 pr-4">{it.effect || '-'}</td>
                        <td className="py-2 pr-4">{it.management || '-'}</td>
                        <td className="py-2 pr-4">
                          {Array.isArray(it.sources) && it.sources.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {it.sources.map((s, si) => {
                                const isUrl = /^https?:\/\//i.test(String(s));
                                return isUrl ? (
                                  <a key={si} href={String(s)} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline text-xs">Source</a>
                                ) : (
                                  <span key={si} className="text-xs text-gray-700 bg-gray-100 rounded px-2 py-0.5">{s}</span>
                                );
                              })}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            <button
                              className="text-xs text-primary-700 underline"
                              onClick={() => {
                                if (a?.name) selection.addDrug({ name: a.name, rxcui: a.rxcui || '' } as any);
                                if (b?.name) selection.addDrug({ name: b.name, rxcui: b.rxcui || '' } as any);
                              }}
                            >Add both</button>
                            <button
                              className="text-xs text-blue-700 underline"
                              onClick={() => {
                                if (a?.name) selection.addDrug({ name: a.name, rxcui: a.rxcui || '' } as any);
                                if (b?.name) selection.addDrug({ name: b.name, rxcui: b.rxcui || '' } as any);
                                window.location.href = '/interactions';
                              }}
                            >Open checker</button>
                            <button
                              className="text-xs text-gray-700 underline"
                              onClick={() => setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }))}
                            >{expanded[idx] ? 'Hide' : 'Details'}</button>
                          </div>
                        </td>
                      </tr>
                      {expanded[idx] && (
                        <tr className="border-b bg-gray-50">
                          <td colSpan={7} className="p-3">
                            <div className="grid md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <div className="text-gray-500 text-xs">Mechanism</div>
                                <div className="text-gray-800">{it.mechanism || '-'}</div>
                              </div>
                              <div>
                                <div className="text-gray-500 text-xs">Effect</div>
                                <div className="text-gray-800">{it.effect || '-'}</div>
                              </div>
                              <div>
                                <div className="text-gray-500 text-xs">Management</div>
                                <div className="text-gray-800">{it.management || '-'}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );})}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CuratedInteractions;
