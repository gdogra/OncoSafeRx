import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';
import AutoComplete, { AutoCompleteOption } from '../components/UI/AutoComplete';
import { useSelection } from '../context/SelectionContext';
import { inferBiomarkerForDrug } from '../utils/biomarkers';
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
  const apiBase = useMemo(() => process.env.REACT_APP_API_URL || 'http://localhost:3000/api', []);
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
  const [nearestCount, setNearestCount] = useState<string>('');
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

  const search = async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (condition) params.set('condition', condition);
      if (biomarker) params.set('biomarker', biomarker);
      if (line) params.set('line', line);
      if (status) params.set('status', status);
      if (lat && lon && radius) { params.set('lat', lat); params.set('lon', lon); params.set('radius_km', radius); }
      const resp = await fetch(`${apiBase}/trials/search?${params.toString()}`);
      if (!resp.ok) throw new Error(`API ${resp.status}`);
      const data = await resp.json();
      setResults(data.trials || []);
      // Persist filters to URL for share/reload
      const qs = buildParams();
      const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    } catch (e: any) {
      setError(e?.message || 'Search failed');
    } finally { setLoading(false); }
  };

  // Parse filters from URL on mount and optionally auto-search
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const cond = p.get('condition') || '';
      const bio = p.get('biomarker') || '';
      const drug = p.get('drug') || '';
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
      
      if (cond || finalBiomarker || ln || st || la || lo || rad || drug) {
        setCondition(cond); 
        setBiomarker(finalBiomarker); 
        setLine(ln); 
        setStatus(st);
        setLat(la); 
        setLon(lo); 
        setRadius(rad);
        // defer search after state updates
        setTimeout(() => { search(); }, 0);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If a drug was selected elsewhere, prefill biomarker if empty
  useEffect(() => {
    if (!biomarker && selection.lastSelected?.name) {
      const m = inferBiomarkerForDrug(selection.lastSelected.name);
      if (m) setBiomarker(m);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load conditions/biomarkers from trial data to power auto-complete
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`${apiBase}/trials/search`);
        if (!resp.ok) return;
        const data = await resp.json();
        const trials: any[] = data.trials || [];
        const conditions = Array.from(new Set(trials.map(t => t.condition).filter(Boolean)));
        const biomarkers = Array.from(new Set(trials.flatMap(t => t.biomarkers || []).filter(Boolean)));
        setDynamicConditionOptions(conditions.map((c: string) => ({ value: c, label: c })));
        setDynamicBiomarkerOptions(biomarkers.map((m: string) => ({ value: m, label: m })));
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Clinical Trials (MVP)</h1>
      <Card>
        <div className="grid md:grid-cols-6 gap-3">
          <AutoComplete
            options={conditionOptions}
            value={condition}
            placeholder="Condition"
            onSelect={(opt) => setCondition(opt.label)}
            onChange={(v) => setCondition(v)}
            allowCustom
            className=""
          />
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
