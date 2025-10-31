import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiBaseUrl } from '../utils/env';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import TipCard from '../components/UI/TipCard';
import AutoComplete, { AutoCompleteOption } from '../components/UI/AutoComplete';
import { useSelection } from '../context/SelectionContext';
import { inferBiomarkerForDrug } from '../utils/biomarkers';
import { useToast } from '../components/UI/Toast';
// Fix default marker icons in CRA
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type Trial = {
  nct_id: string;
  title: string;
  condition: string;
  biomarkers?: string[];
  phase?: string;
  status?: string;
  line_of_therapy?: string;
  locations?: { name: string; lat: number; lon: number }[];
};

const Trials: React.FC = () => {
  const [searchParams] = useSearchParams();
  const apiBase = useMemo(() => apiBaseUrl(), []);
  const [condition, setCondition] = useState('');
  const [biomarker, setBiomarker] = useState('');
  const [line, setLine] = useState('');
  const [status, setStatus] = useState('');
  const [lat, setLat] = useState<string>('');
  const [lon, setLon] = useState<string>('');
  const [radius, setRadius] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Trial[] | null>(null);
  const [usedFallback, setUsedFallback] = useState<boolean>(false);
  const [nearestCount, setNearestCount] = useState<string>('');
  const [liveTotal, setLiveTotal] = useState<number | null>(null);
  const [liveUpdatedAt, setLiveUpdatedAt] = useState<string | null>(null);
  const [liveRefreshTick, setLiveRefreshTick] = useState<number>(0);
  const [showAllAvailable, setShowAllAvailable] = useState<boolean>(false);
  const [includeObservational, setIncludeObservational] = useState<boolean>(false);
  const [expandedStatuses, setExpandedStatuses] = useState<boolean>(true);
  const [autoExpandRadius, setAutoExpandRadius] = useState<boolean>(true);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [recentDrugs, setRecentDrugs] = useState<string[]>([]);
  const RECENTS_KEY = 'osrx_recent_trial_drugs';
  const loadRecents = () => {
    try {
      const raw = localStorage.getItem(RECENTS_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.filter((s: any) => typeof s === 'string') : [];
    } catch { return []; }
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
  const selection = useSelection();
  const staticConditionOptions = useMemo<AutoCompleteOption[]>(() => (
    [
      'Breast cancer','Lung cancer','Colorectal cancer','Prostate cancer','Pancreatic cancer',
      'Leukemia','Lymphoma','Melanoma','Ovarian cancer','Gastric cancer','Glioblastoma',
    ].map(label => ({ value: label, label }))
  ), []);
  const staticBiomarkerOptions = useMemo<AutoCompleteOption[]>(() => (
    [
      'EGFR','ALK','ROS1','BRAF','KRAS','NRAS','PIK3CA','HER2','BRCA1','BRCA2','PD-L1',
    ].map(label => ({ value: label, label }))
  ), []);
  const [dynamicConditionOptions, setDynamicConditionOptions] = useState<AutoCompleteOption[]>([]);
  const [dynamicBiomarkerOptions, setDynamicBiomarkerOptions] = useState<AutoCompleteOption[]>([]);
  const conditionOptions = useMemo<AutoCompleteOption[]>(() => {
    const map = new Map<string, AutoCompleteOption>();
    [...dynamicConditionOptions, ...staticConditionOptions].forEach(o => map.set(o.label.toLowerCase(), o));
    return Array.from(map.values());
  }, [dynamicConditionOptions, staticConditionOptions]);
  const biomarkerOptions = useMemo<AutoCompleteOption[]>(() => {
    const map = new Map<string, AutoCompleteOption>();
    [...dynamicBiomarkerOptions, ...staticBiomarkerOptions].forEach(o => map.set(o.label.toLowerCase(), o));
    return Array.from(map.values());
  }, [dynamicBiomarkerOptions, staticBiomarkerOptions]);
  const lineOptions = useMemo<AutoCompleteOption[]>(() => (
    ['1st','2nd','3rd','Adjuvant','Neoadjuvant','Maintenance'].map(label => ({ value: label, label }))
  ), []);
  const statusOptions = useMemo<AutoCompleteOption[]>(() => (
    ['Recruiting','Not yet recruiting','Active, not recruiting','Completed','Terminated','Withdrawn','Enrolling by invitation']
      .map(label => ({ value: label, label }))
  ), []);
  const buildParams = () => {
    const p = new URLSearchParams();
    if (condition) p.set('condition', condition);
    if (biomarker) p.set('biomarker', biomarker);
    if (line) p.set('line', line);
    if (status) p.set('status', status);
    if (lat && lon) { p.set('lat', lat); p.set('lon', lon); }
    if (radius) p.set('radius_km', radius);
    return p.toString();
  };
  const resetFilters = () => {
    setCondition(''); setBiomarker(''); setLine(''); setStatus('');
    setLat(''); setLon(''); setRadius(''); setNearestCount('');
    setResults(null); setError(null);
  };
  const share = async () => {
    const qs = buildParams();
    const url = `${window.location.origin}/trials${qs ? `?${qs}` : ''}`;
    try {
      await navigator.clipboard.writeText(url);
      alert('Search link copied to clipboard');
    } catch {
      alert(url);
    }
  };

  const bounds = useMemo(() => {
    const pts: [number, number][] = [];
    if (lat && lon) {
      const lt = parseFloat(lat); const ln = parseFloat(lon);
      if (!Number.isNaN(lt) && !Number.isNaN(ln)) pts.push([lt, ln]);
    }
    (results || []).forEach(t => (t.locations || []).forEach(loc => pts.push([loc.lat, loc.lon])));
    return pts.length ? L.latLngBounds(pts) : null;
  }, [lat, lon, results]);

  const FitBounds: React.FC = () => {
    const map = useMap();
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
    return null;
  };

  const [activePos, setActivePos] = useState<[number, number] | null>(null);
  const PanTo: React.FC = () => {
    const map = useMap();
    if (activePos) {
      map.panTo(activePos);
    }
    return null;
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(String(pos.coords.latitude.toFixed(5)));
      setLon(String(pos.coords.longitude.toFixed(5)));
    });
  };

  const searchProgressive = async (initialRadius?: string) => {
    setLoading(true); setError(null);
    try {
      const hasLocalFilters = !!(condition || biomarker || line || status || (lat && lon));
      if (hasLocalFilters) {
        // Use live ClinicalTrials.gov for filtered searches
        const params = new URLSearchParams();
        if (condition) params.set('condition', condition);
        // Map biomarker to intervention to broaden search on ct.gov
        if (biomarker) params.set('intervention', biomarker);
        const recruitmentStatuses = expandedStatuses 
          ? 'RECRUITING,NOT_YET_RECRUITING,ACTIVE_NOT_RECRUITING,ENROLLING_BY_INVITATION'
          : 'RECRUITING';
        params.set('recruitmentStatus', recruitmentStatuses);
        params.set('pageSize', '100');
        params.set('studyType', includeObservational ? 'INTERVENTIONAL,OBSERVATIONAL' : 'INTERVENTIONAL');
        params.set('includeExpanded', expandedStatuses.toString());

        const resp = await fetch(`${apiBase}/clinical-trials/search?${params.toString()}`);
        if (!resp.ok) throw new Error(`API ${resp.status}`);
        const data = await resp.json();
        const studies = data?.data?.studies || [];
        const mapped = studies.map((s: any) => ({
          nct_id: s.nctId,
          title: s.title,
          condition: s.condition || '',
          phase: s.phase || '',
          status: s.status || '',
          line_of_therapy: undefined,
          biomarkers: undefined,
          locations: []
        }));
        if (mapped.length === 0 && data?.data?.fallback) {
          // Try local dataset as last resort
          try {
            const fallbackResp = await fetch(`${apiBase}/trials/search?condition=${encodeURIComponent(condition || '')}`);
            if (fallbackResp.ok) {
              const fb = await fallbackResp.json();
              setResults(fb.trials || []);
              setUsedFallback(true);
            } else {
              setResults(mapped);
              setUsedFallback(false);
            }
          } catch {
            setResults(mapped);
            setUsedFallback(false);
          }
        } else if (mapped.length === 0) {
          // Try alternate proxy endpoint to ClinicalTrials.gov (external integrator)
          try {
            const extParams = new URLSearchParams();
            if (condition) extParams.set('condition', condition);
            extParams.set('status', expandedStatuses ? 'RECRUITING' : 'RECRUITING');
            extParams.set('pageSize', '100');
            const extResp = await fetch(`${apiBase}/external/clinicaltrials/studies?${extParams.toString()}`);
            if (extResp.ok) {
              const extData = await extResp.json();
              const extStudies = extData?.data?.studies || [];
              const extMapped = extStudies.map((s: any) => ({
                nct_id: s.protocolSection?.identificationModule?.nctId,
                title: s.protocolSection?.identificationModule?.briefTitle,
                condition: s.protocolSection?.conditionsModule?.conditions?.[0] || '',
                phase: s.protocolSection?.designModule?.phases?.[0] || '',
                status: s.protocolSection?.statusModule?.overallStatus || '',
                line_of_therapy: undefined,
                biomarkers: undefined,
                locations: []
              })).filter((t: any) => !!t.nct_id && !!t.title);
              if (extMapped.length > 0) {
                setResults(extMapped);
                setUsedFallback(false);
                showToast('info', 'Using alternate trials source (direct proxy)');
                return;
              }
            }
          } catch {}
          // Try direct client-side fetch to ClinicalTrials.gov (CORS-enabled)
          try {
            const directParams = new URLSearchParams();
            if (condition) directParams.set('query.cond', condition);
            directParams.set('filter.overallStatus', 'RECRUITING');
            directParams.set('pageSize', '100');
            directParams.set('format', 'json');
            const directResp = await fetch(`https://clinicaltrials.gov/api/v2/studies?${directParams.toString()}`);
            if (directResp.ok) {
              const directData = await directResp.json();
              const dStudies = directData?.studies || [];
              const dMapped = dStudies.map((s: any) => ({
                nct_id: s.protocolSection?.identificationModule?.nctId,
                title: s.protocolSection?.identificationModule?.briefTitle,
                condition: s.protocolSection?.conditionsModule?.conditions?.[0] || '',
                phase: s.protocolSection?.designModule?.phases?.[0] || '',
                status: s.protocolSection?.statusModule?.overallStatus || '',
                line_of_therapy: undefined,
                biomarkers: undefined,
                locations: []
              })).filter((t: any) => !!t.nct_id && !!t.title);
              if (dMapped.length > 0) {
                setResults(dMapped);
                setUsedFallback(false);
                showToast('info', 'Using ClinicalTrials.gov directly');
                return;
              }
            }
          } catch {}
          // No matches from live API for these filters; broaden search automatically
          try {
            const broadParams = new URLSearchParams();
            broadParams.set('recruitmentStatus', recruitmentStatuses);
            broadParams.set('pageSize', '100');
            broadParams.set('studyType', includeObservational ? 'INTERVENTIONAL,OBSERVATIONAL' : 'INTERVENTIONAL');
            broadParams.set('includeExpanded', expandedStatuses.toString());
            const broadResp = await fetch(`${apiBase}/clinical-trials/search?${broadParams.toString()}`);
            if (broadResp.ok) {
              const broadData = await broadResp.json();
              const broadStudies = broadData?.data?.studies || [];
              const broadMapped = broadStudies.map((s: any) => ({
                nct_id: s.nctId,
                title: s.title,
                condition: s.condition || '',
                phase: s.phase || '',
                status: s.status || '',
                line_of_therapy: undefined,
                biomarkers: undefined,
                locations: []
              }));
              if (broadMapped.length > 0) {
                setResults(broadMapped);
                setUsedFallback(false);
                showToast('info', 'No exact matches; showing general recruiting trials');
              } else {
                // Try alternate proxy broad search
                try {
                  const extResp2 = await fetch(`${apiBase}/external/clinicaltrials/studies?status=RECRUITING&pageSize=100`);
                  if (extResp2.ok) {
                    const extData2 = await extResp2.json();
                    const extStudies2 = extData2?.data?.studies || [];
                    const extMapped2 = extStudies2.map((s: any) => ({
                      nct_id: s.protocolSection?.identificationModule?.nctId,
                      title: s.protocolSection?.identificationModule?.briefTitle,
                      condition: s.protocolSection?.conditionsModule?.conditions?.[0] || '',
                      phase: s.protocolSection?.designModule?.phases?.[0] || '',
                      status: s.protocolSection?.statusModule?.overallStatus || '',
                      line_of_therapy: undefined,
                      biomarkers: undefined,
                      locations: []
                    })).filter((t: any) => !!t.nct_id && !!t.title);
                    if (extMapped2.length > 0) {
                      setResults(extMapped2);
                      setUsedFallback(false);
                      showToast('info', 'Using alternate trials source (direct proxy)');
                      return;
                    }
                  }
                } catch {}
                // Try direct broad client-side fetch
                try {
                  const dParams2 = new URLSearchParams();
                  dParams2.set('filter.overallStatus', 'RECRUITING');
                  dParams2.set('pageSize', '100');
                  dParams2.set('format', 'json');
                  const dResp2 = await fetch(`https://clinicaltrials.gov/api/v2/studies?${dParams2.toString()}`);
                  if (dResp2.ok) {
                    const dData2 = await dResp2.json();
                    const dStudies2 = dData2?.studies || [];
                    const dMapped2 = dStudies2.map((s: any) => ({
                      nct_id: s.protocolSection?.identificationModule?.nctId,
                      title: s.protocolSection?.identificationModule?.briefTitle,
                      condition: s.protocolSection?.conditionsModule?.conditions?.[0] || '',
                      phase: s.protocolSection?.designModule?.phases?.[0] || '',
                      status: s.protocolSection?.statusModule?.overallStatus || '',
                      line_of_therapy: undefined,
                      biomarkers: undefined,
                      locations: []
                    })).filter((t: any) => !!t.nct_id && !!t.title);
                    if (dMapped2.length > 0) {
                      setResults(dMapped2);
                      setUsedFallback(false);
                      showToast('info', 'Using ClinicalTrials.gov directly');
                      return;
                    }
                  }
                } catch {}
                // As a last resort, show local sample unfiltered
                const sampleResp = await fetch(`${apiBase}/trials/search`);
                if (sampleResp.ok) {
                  const sample = await sampleResp.json();
                  setResults(sample.trials || []);
                  setUsedFallback(true);
                } else {
                  setResults([]);
                }
              }
            } else {
              setResults(mapped);
            }
          } catch {
            setResults(mapped);
          }
        } else {
          setResults(mapped);
          setUsedFallback(false);
        }
      } else {
        // Broad default search from ClinicalTrials.gov (comprehensive options)
        const params = new URLSearchParams();
        const recruitmentStatuses = expandedStatuses 
          ? 'RECRUITING,NOT_YET_RECRUITING,ACTIVE_NOT_RECRUITING,ENROLLING_BY_INVITATION'
          : 'RECRUITING';
        params.set('recruitmentStatus', recruitmentStatuses);
        params.set('pageSize', '100'); // Use reasonable page size since API makes multiple calls
        params.set('studyType', includeObservational ? 'INTERVENTIONAL,OBSERVATIONAL' : 'INTERVENTIONAL');
        params.set('includeExpanded', expandedStatuses.toString());
        console.log('🔍 Default search params:', params.toString());
        const resp = await fetch(`${apiBase}/clinical-trials/search?${params.toString()}`);
        console.log('🔍 Default search response:', resp.status, resp.ok);
        if (!resp.ok) {
          const errorText = await resp.text();
          console.error('🔍 Default search failed:', resp.status, errorText);
          throw new Error(`API ${resp.status}: ${errorText}`);
        }
        const data = await resp.json();
        const studies = data?.data?.studies || [];
        const mapped = studies.map((s: any) => ({
          nct_id: s.nctId,
          title: s.title,
          condition: s.condition || '',
          phase: s.phase || '',
          status: s.status || '',
          line_of_therapy: undefined,
          biomarkers: undefined,
          locations: []
        }));

        // If live API returned nothing or signaled fallback, use local sample as a safety net
        const shouldFallback = (Array.isArray(mapped) && mapped.length === 0) || data?.data?.fallback;
        if (shouldFallback) {
          try {
            const fallbackResp = await fetch(`${apiBase}/trials/search`);
            if (fallbackResp.ok) {
              const fb = await fallbackResp.json();
              const trials = fb.trials || [];
              setResults(trials);
              showToast('warning', 'Showing sample trials (live data unavailable)');
              setUsedFallback(true);
            } else {
              setResults(mapped);
              setUsedFallback(false);
            }
          } catch {
            setResults(mapped);
            setUsedFallback(false);
          }
        } else {
          setResults(mapped);
          setUsedFallback(false);
        }
      }
      // Persist filters to URL for share/reload
      const qs = buildParams();
      const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    } catch (e: any) {
      setError(e?.message || 'Search failed');
    } finally { setLoading(false); }
  };

  // Alias for backward compatibility
  const search = () => searchProgressive();

  // Drug-based search using patient context (server clinical-trials API)
  const searchByDrugWithPatient = async (drug: string, patientId: string) => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ drug, patientId });
      const resp = await fetch(`${apiBase}/clinical-trials/search-by-drug?${params.toString()}`);
      if (!resp.ok) throw new Error(`API ${resp.status}`);
      const body = await resp.json();
      const studies = body?.data?.studies || [];
      // Map to local Trial shape
      const mapped: Trial[] = studies.map((s: any) => ({
        nct_id: s.nctId,
        title: s.title,
        condition: s.condition || '',
        phase: s.phase || '',
        status: s.status || '',
        line_of_therapy: undefined,
        biomarkers: undefined,
        // no geo info available in this endpoint; omit locations
        locations: []
      }));
      setResults(mapped);
      // Keep drug and patientId in URL for share
      const p = new URLSearchParams(window.location.search);
      p.set('drug', drug);
      p.set('patientId', patientId);
      const newUrl = `${window.location.pathname}?${p.toString()}`;
      window.history.replaceState({}, '', newUrl);
      saveRecentDrug(drug);
      // Notify context and provide quick navigation to patient view
      showToast(
        'info',
        `Showing trials for ${drug} using patient context`,
        6000,
        {
          label: 'View patient',
          onClick: () => navigate(`/fhir-patients?select=${encodeURIComponent(patientId)}`)
        }
      );
    } catch (e: any) {
      setError(e?.message || 'Drug-based search failed');
    } finally {
      setLoading(false);
    }
  };

  // Parse filters from URL on mount and optionally auto-search
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const cond = p.get('condition') || '';
      const bio = p.get('biomarker') || '';
      const drug = p.get('drug') || '';
      const patientId = p.get('patientId') || '';
      const ln = p.get('line') || '';
      const st = p.get('status') || '';
      const la = p.get('lat') || '';
      const lo = p.get('lon') || '';
      const rad = p.get('radius_km') || '';
      
      // If drug parameter is provided, infer biomarker from drug
      let finalBiomarker = bio;
      if (drug && !bio) {
        const inferredBiomarker = inferBiomarkerForDrug(drug);
        if (inferredBiomarker) {
          finalBiomarker = inferredBiomarker;
        }
      }
      
      if (drug && patientId) {
        // Perform server-side drug search with patient context
        setCondition(cond);
        setBiomarker(finalBiomarker);
        setLine(ln);
        setStatus(st);
        setLat(la);
        setLon(lo);
        setRadius(rad);
        setTimeout(() => { searchByDrugWithPatient(drug, patientId); }, 0);
      } else if (cond || finalBiomarker || ln || st || la || lo || rad || drug) {
        setCondition(cond); 
        setBiomarker(finalBiomarker); 
        setLine(ln); 
        setStatus(st);
        setLat(la); 
        setLon(lo); 
        setRadius(rad);
        // defer search after state updates
        setTimeout(() => { search(); }, 0);
      } else {
        // No params provided — auto-run default search to show results immediately
        setTimeout(() => { search(); }, 0);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load recent drugs on mount
  useEffect(() => {
    try { setRecentDrugs(loadRecents()); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const useRecentDrug = async (drug: string) => {
    const d = String(drug || '').trim();
    if (!d) return;
    // If current URL has patientId, prefer patient-aware search
    const p = new URLSearchParams(window.location.search);
    const pid = p.get('patientId') || '';
    if (pid) {
      await searchByDrugWithPatient(d, pid);
      return;
    }
    // Otherwise infer biomarker and run regular search
    const inferred = inferBiomarkerForDrug(d);
    setBiomarker(inferred || '');
    // Update URL with ?drug=...
    const q = new URLSearchParams(window.location.search);
    q.set('drug', d);
    const newUrl = `${window.location.pathname}?${q.toString()}`;
    window.history.replaceState({}, '', newUrl);
    saveRecentDrug(d);
    await search();
  };

  // If a drug was selected elsewhere, prefill biomarker if empty
  useEffect(() => {
    if (!biomarker && selection.lastSelected?.name) {
      const m = inferBiomarkerForDrug(selection.lastSelected.name);
      if (m) setBiomarker(m);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load conditions/biomarkers (prefer live ClinicalTrials.gov summary; fallback to local sample)
  useEffect(() => {
    (async () => {
      try {
        // Prefer live summary
        const resp = await fetch(`${apiBase}/clinical-trials/filters/options?recruitmentStatus=RECRUITING,NOT_YET_RECRUITING,ACTIVE_NOT_RECRUITING&studyType=INTERVENTIONAL,OBSERVATIONAL&pageSize=500`);
        if (resp.ok) {
          const data = await resp.json();
          const conditions = (data?.data?.conditions || []) as string[];
          const biomarkers = (data?.data?.biomarkers || []) as string[];
          if (conditions.length || biomarkers.length) {
            setDynamicConditionOptions(conditions.map((c: string) => ({ value: c, label: c })));
            setDynamicBiomarkerOptions(biomarkers.map((m: string) => ({ value: m, label: m })));
            if (typeof data?.data?.totalStudies === 'number') {
              setLiveTotal(data.data.totalStudies);
            }
            if (typeof data?.data?.updatedAt === 'string') {
              setLiveUpdatedAt(data.data.updatedAt);
            }
            return;
          }
        }
      } catch {}
      // Fallback to local trials dataset
      try {
        const resp2 = await fetch(`${apiBase}/trials/search`);
        if (!resp2.ok) return;
        const data2 = await resp2.json();
        const trials: any[] = data2.trials || [];
        const conditions2 = Array.from(new Set(trials.map(t => t.condition).filter(Boolean)));
        const biomarkers2 = Array.from(new Set(trials.flatMap(t => t.biomarkers || []).filter(Boolean)));
        setDynamicConditionOptions(conditions2.map((c: string) => ({ value: c, label: c })));
        setDynamicBiomarkerOptions(biomarkers2.map((m: string) => ({ value: m, label: m })));
      } catch {}
    })();
    // Re-run when apiBase or refresh tick changes
  }, [apiBase, liveRefreshTick]);

  return (
    <div className="space-y-6">
      <TipCard id="tip-trials">
        Enter a condition and optional biomarker, set line/status and location, then Search. Use the map to view nearby sites and open Google Maps for directions.
      </TipCard>
      {usedFallback && (
        <Alert type="warning" title="ClinicalTrials.gov data temporarily unavailable">
          <div className="flex items-center justify-between gap-4">
            <span>Showing sample trials from local dataset. Try again shortly or refine your filters.</span>
            <button
              onClick={() => search()}
              className="px-2 py-1 rounded border bg-white hover:bg-gray-50 text-gray-700"
            >
              Retry live data
            </button>
          </div>
        </Alert>
      )}
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Clinical Trials' }]} />
      <h1 className="text-2xl font-bold text-gray-900">Clinical Trials (MVP)</h1>
      {liveTotal !== null && (
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <div>
            Live recruiting interventional studies available now: {liveTotal.toLocaleString()}
            {liveUpdatedAt && (
              <span> • Last updated {new Date(liveUpdatedAt).toLocaleString()}</span>
            )}
          </div>
          <button
            onClick={async () => { setLiveRefreshTick(t => t + 1); await search(); }}
            className="px-2 py-1 rounded border bg-white hover:bg-gray-50 text-gray-700"
            title="Refresh live data"
          >
            Refresh
          </button>
        </div>
      )}
      <Card>
        <div className="grid md:grid-cols-6 gap-3">
          {/* Anchor for onboarding/tour to highlight trials search */}
          <div data-tour="trials-search-input">
          <AutoComplete
            options={conditionOptions}
            value={condition}
            placeholder="Condition"
            onSelect={(opt) => setCondition(opt.label)}
            onChange={(v) => setCondition(v)}
            allowCustom
            className=""
          />
          </div>
          <AutoComplete
            options={biomarkerOptions}
            value={biomarker}
            placeholder="Biomarker (e.g., EGFR, BRCA1)"
            onSelect={(opt) => setBiomarker(opt.label)}
            onChange={(v) => setBiomarker(v)}
            allowCustom
          />
          <AutoComplete
            options={lineOptions}
            value={line}
            placeholder="Line (e.g., 1st)"
            onSelect={(opt) => setLine(opt.label)}
            onChange={(v) => setLine(v)}
            allowCustom
          />
          <AutoComplete
            options={statusOptions}
            value={status}
            placeholder="Status (e.g., Recruiting)"
            onSelect={(opt) => setStatus(opt.label)}
            onChange={(v) => setStatus(v)}
            allowCustom
          />
          <div className="flex space-x-2">
            <input className="border rounded px-2 py-1 w-full" placeholder="Lat" value={lat} onChange={e => setLat(e.target.value)} />
            <input className="border rounded px-2 py-1 w-full" placeholder="Lon" value={lon} onChange={e => setLon(e.target.value)} />
            <input className="border rounded px-2 py-1 w-full" placeholder="Radius km" value={radius} onChange={e => setRadius(e.target.value)} />
          </div>
          <div className="flex space-x-2">
            <button onClick={search} className="px-3 py-2 bg-primary-600 text-white rounded">{loading ? 'Searching…' : 'Search'}</button>
            <button onClick={useMyLocation} className="px-3 py-2 bg-gray-100 rounded">Use My Location</button>
            <button onClick={share} className="px-3 py-2 bg-gray-100 rounded">Share</button>
            <input
              className="border rounded px-2 py-1 w-28"
              placeholder="# Nearest"
              value={nearestCount}
              onChange={e => setNearestCount(e.target.value)}
            />
          </div>
        </div>
        {recentDrugs.length > 0 && (
          <div className="mt-3 text-xs text-gray-700">
            Recent Drugs: {recentDrugs.map((d) => (
              <button
                key={d}
                onClick={() => useRecentDrug(d)}
                className="inline-block bg-white border border-gray-300 rounded-full px-2 py-0.5 mr-1 mb-1 hover:bg-gray-50"
                title="Search with this drug"
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => { localStorage.removeItem(RECENTS_KEY); setRecentDrugs([]); }}
              className="ml-2 text-[11px] underline"
            >
              clear
            </button>
          </div>
        )}
        
        {/* Comprehensive Search Options */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">Search Options</div>
          <div className="grid md:grid-cols-4 gap-3 text-sm">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showAllAvailable}
                onChange={(e) => setShowAllAvailable(e.target.checked)}
                className="rounded"
              />
              <span>Show All Available (up to 1000)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeObservational}
                onChange={(e) => setIncludeObservational(e.target.checked)}
                className="rounded"
              />
              <span>Include Observational Studies</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={expandedStatuses}
                onChange={(e) => setExpandedStatuses(e.target.checked)}
                className="rounded"
              />
              <span>Expanded Status (Not Yet Recruiting, etc.)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoExpandRadius}
                onChange={(e) => setAutoExpandRadius(e.target.checked)}
                className="rounded"
              />
              <span>Auto-expand Search Radius</span>
            </label>
          </div>
        </div>
      </Card>
      {error && <Alert type="error" title="Error">{error}</Alert>}
      {Array.isArray(results) && (
        <Card>
          <div className="text-sm text-gray-700">{results.length} trial(s) found</div>
          {/* Map view when location present */}
          {(lat && lon) && (
            <div className="h-64 w-full mb-4 rounded overflow-hidden">
              <MapContainer
                center={[parseFloat(lat) || 0, parseFloat(lon) || 0]}
                zoom={9}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                {bounds && <FitBounds />}
                {activePos && <PanTo />}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* User location marker */}
                {!Number.isNaN(parseFloat(lat)) && !Number.isNaN(parseFloat(lon)) && (
                  <Marker position={[parseFloat(lat), parseFloat(lon)]}>
                    <Popup>
                      <div className="text-sm">Your location</div>
                    </Popup>
                  </Marker>
                )}
                {results.flatMap((t) => (t.locations || []).map((loc, i) => (
                  <Marker key={`${t.nct_id}-${i}`} position={[loc.lat, loc.lon]}>
                    <Popup>
                      <div className="text-sm">
                        <div className="font-medium">{t.title}</div>
                        <div>{loc.name}</div>
                      </div>
                    </Popup>
                  </Marker>
                )))}
                {activePos && (
                  <CircleMarker center={activePos} radius={10} pathOptions={{ color: 'red' }} />
                )}
              </MapContainer>
              <div className="text-xs text-gray-600 mt-1">Legend: ◉ You • ⬤ Trial Site</div>
            </div>
          )}
          <div className="divide-y mt-3">
            {(Array.isArray(results) ? ((): Trial[] => {
              const lim = parseInt(nearestCount, 10);
              if (!lat || !lon || Number.isNaN(lim) || lim <= 0) return results as Trial[];
              // take top N when distance present
              return (results as any[]).slice(0, lim);
            })() : []).map((t: any, i: number) => (
              <div key={t.nct_id} className="py-3" onMouseEnter={() => {
                if (t.locations && t.locations[0]) setActivePos([t.locations[0].lat, t.locations[0].lon]);
              }}>
                <div className="font-medium">{t.title}</div>
                <div className="text-sm text-gray-600 flex items-center space-x-2">
                  <span>{t.nct_id} • {t.phase} • {t.status}</span>
                  {('distance_km' in (t as any) && (t as any).distance_km !== null) && (
                    <span>• {(t as any).distance_km!.toFixed(1)} km</span>
                  )}
                  {i === 0 && ('distance_km' in (t as any) && (t as any).distance_km !== null) && (
                    <span className="inline-block bg-green-100 text-green-700 px-2 py-0.5 text-xs rounded">Nearest</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">{t.condition} {t.biomarkers && t.biomarkers.length ? `• Biomarkers: ${t.biomarkers.join(', ')}` : ''}</div>
                {t.locations && t.locations.length > 0 && (
                  <div className="text-xs text-gray-500">Sites: {t.locations.map((l: { name: string; lat: number; lon: number }, i: number) => (
                    <span key={i} className="mr-2">
                      {l.name} {lat && lon ? (
                        <a
                          className="text-blue-600 hover:underline ml-1"
                          href={`https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lon}`}
                          target="_blank" rel="noreferrer"
                        >
                          (map)
                        </a>
                      ) : null}
                    </span>
                  ))}</div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Trials;
