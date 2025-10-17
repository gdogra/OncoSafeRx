import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type Patient = {
  id?: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: string;
  dateOfBirth?: string;
};

type SearchResult = {
  count: number;
  patients: Patient[];
};

const FHIRPatients: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [identifier, setIdentifier] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [trialDrug, setTrialDrug] = useState<string>('');
  const [medOptions, setMedOptions] = useState<string[]>([]);
  const [recentDrugs, setRecentDrugs] = useState<string[]>([]);

  const RECENTS_KEY = 'osrx_recent_trial_drugs';
  const loadRecents = () => {
    try {
      const raw = localStorage.getItem(RECENTS_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.filter((s: any) => typeof s === 'string') : [];
    } catch {
      return [];
    }
  };
  const saveRecentDrug = (name: string) => {
    const drug = String(name || '').trim();
    if (!drug) return;
    try {
      const current = loadRecents();
      const deduped = [drug, ...current.filter((d: string) => d.toLowerCase() !== drug.toLowerCase())];
      const limited = deduped.slice(0, 7);
      localStorage.setItem(RECENTS_KEY, JSON.stringify(limited));
      setRecentDrugs(limited);
    } catch {}
  };
  const [health, setHealth] = useState<any>(null);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/fhir/health');
        const body = await res.json();
        if (!cancelled) setHealth(body);
      } catch (_) {}
    };
    load();
    // Load recent drugs
    try { setRecentDrugs(loadRecents()); } catch {}
    // Auto-select patient if `?select=<id>` present
    try {
      const sel = searchParams.get('select');
      if (sel) {
        loadPatient(sel);
      }
    } catch {}
    return () => { cancelled = true; };
  }, [searchParams]);

  const canSearch = useMemo(() => {
    return (query && query.length >= 1) || identifier || gender;
  }, [query, identifier, gender]);

  const onSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSearch) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setSelected(null);
    setSelectedId(null);
    try {
      const params = new URLSearchParams();
      if (query) params.append('name', query);
      if (identifier) params.append('identifier', identifier);
      if (gender) params.append('gender', gender);
      const res = await fetch(`/api/fhir/patients?${params.toString()}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'search_failed');
      setResults(body);
    } catch (e: any) {
      setError(e?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const loadPatient = async (id: string) => {
    setSelectedId(id);
    setSelected(null);
    try {
      const res = await fetch(`/api/fhir/patients/${encodeURIComponent(id)}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || 'load_failed');
      setSelected(body.patient);
      try {
        const meds = Array.isArray(body?.patient?.medications) ? body.patient.medications : [];
        const names = meds
          .map((m: any) => (typeof m?.name === 'string' ? m.name : null))
          .filter((n: any): n is string => !!n);
        const unique = Array.from(new Set(names));
        setMedOptions(unique as string[]);
        if (unique.length && !trialDrug) setTrialDrug(unique[0] as string);
      } catch {}
    } catch (e: any) {
      setError(e?.message || 'Failed to load patient');
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">FHIR Patients (Debug)</h1>
        <p className="text-sm text-gray-600">Search via server proxy with mock fallback when FHIR is unreachable.</p>
        {health && (
          <div className="mt-2 text-xs text-gray-500">
            Status: <span className={health.status === 'connected' ? 'text-green-600' : 'text-yellow-700'}>{health.status}</span>
            {health.fhirVersion ? ` • FHIR ${health.fhirVersion}` : ''}
            {health.implementation ? ` • ${health.implementation}` : ''}
          </div>
        )}
      </div>

      <form onSubmit={onSearch} className="bg-white border rounded-lg p-4 shadow-sm mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Name</label>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="emma" className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Identifier</label>
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="MRN001234" className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border rounded px-2 py-1">
              <option value="">Any</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={!canSearch || loading} className={`px-4 py-2 rounded text-white ${canSearch ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2">Provide at least one: name, identifier, or gender.</div>
      </form>

      {error && (
        <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>
      )}

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="p-3 border-b font-medium text-gray-800">Results ({results.count})</div>
            <div className="divide-y">
              {results.patients.map((p, idx) => (
                <button key={p.id || idx}
                        onClick={() => p.id && loadPatient(p.id)}
                        className={`w-full text-left p-3 hover:bg-gray-50 ${selectedId === p.id ? 'bg-blue-50' : ''}`}>
                  <div className="font-medium text-gray-900">{[p.firstName, p.lastName].filter(Boolean).join(' ') || p.id}</div>
                  <div className="text-xs text-gray-600">{p.gender || '—'} {p.age ? `• ${p.age}y` : ''} {p.dateOfBirth ? `• DOB ${p.dateOfBirth}` : ''}</div>
                </button>
              ))}
              {results.patients.length === 0 && (
                <div className="p-3 text-sm text-gray-600">No matches.</div>
              )}
            </div>
          </div>
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="p-3 border-b font-medium text-gray-800">Details</div>
            <div className="p-3 text-sm">
              {selected ? (
                <>
                  {/* Quick trial search action */}
                  <div className="mb-3 p-3 border rounded bg-blue-50">
                    <div className="text-sm font-medium text-blue-900">Search Trials by Drug (uses patient context)</div>
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <input
                          className="border rounded px-2 py-1 w-56"
                          placeholder="Type a drug (e.g., imatinib)"
                          value={trialDrug}
                          onChange={(e) => setTrialDrug(e.target.value)}
                        />
                        <select
                          className="border rounded px-2 py-1 w-56"
                          value={trialDrug}
                          onChange={(e) => setTrialDrug(e.target.value)}
                        >
                          <option value="">Select from patient meds…</option>
                          {medOptions.map((name) => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        disabled={!trialDrug || !selected?.id}
                        onClick={() => {
                          if (!trialDrug || !selected?.id) return;
                          saveRecentDrug(trialDrug);
                          const url = `/trials?drug=${encodeURIComponent(trialDrug)}&patientId=${encodeURIComponent(selected.id)}`;
                          window.location.assign(url);
                        }}
                        className={`px-3 py-1.5 rounded text-white ${trialDrug && selected?.id ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                      >
                        Use For Trial Search
                      </button>
                    </div>
                    {recentDrugs.length > 0 && (
                      <div className="mt-2 text-xs text-blue-900">
                        Recent: {recentDrugs.map((d) => (
                          <button
                            key={d}
                            onClick={() => setTrialDrug(d)}
                            className="inline-block bg-white border border-blue-200 text-blue-700 rounded-full px-2 py-0.5 mr-1 mb-1 hover:bg-blue-50"
                            title="Use this drug"
                          >
                            {d}
                          </button>
                        ))}
                        <button
                          onClick={() => { localStorage.removeItem(RECENTS_KEY); setRecentDrugs([]); }}
                          className="ml-2 text-[11px] text-blue-700 underline"
                        >
                          clear
                        </button>
                      </div>
                    )}
                    <div className="text-xs text-blue-900 mt-1">Navigates to Trials and searches via server: /api/clinical-trials/search-by-drug with this patient.</div>
                  </div>
                  <pre className="text-xs overflow-auto max-h-[50vh] bg-gray-50 p-2 rounded border">{JSON.stringify(selected, null, 2)}</pre>
                </>
              ) : (
                <div className="text-gray-500">Select a patient from the list.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FHIRPatients;
