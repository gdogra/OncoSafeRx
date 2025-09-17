import React, { useMemo, useState } from 'react';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';

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
    } catch (e: any) {
      setError(e?.message || 'Search failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Clinical Trials (MVP)</h1>
      <Card>
        <div className="grid md:grid-cols-6 gap-3">
          <input className="border rounded px-2 py-1" placeholder="Condition" value={condition} onChange={e => setCondition(e.target.value)} />
          <input className="border rounded px-2 py-1" placeholder="Biomarker (e.g., EGFR, BRCA1)" value={biomarker} onChange={e => setBiomarker(e.target.value)} />
          <input className="border rounded px-2 py-1" placeholder="Line (e.g., 1st)" value={line} onChange={e => setLine(e.target.value)} />
          <input className="border rounded px-2 py-1" placeholder="Status (e.g., Recruiting)" value={status} onChange={e => setStatus(e.target.value)} />
          <div className="flex space-x-2">
            <input className="border rounded px-2 py-1 w-full" placeholder="Lat" value={lat} onChange={e => setLat(e.target.value)} />
            <input className="border rounded px-2 py-1 w-full" placeholder="Lon" value={lon} onChange={e => setLon(e.target.value)} />
            <input className="border rounded px-2 py-1 w-full" placeholder="Radius km" value={radius} onChange={e => setRadius(e.target.value)} />
          </div>
          <div className="flex space-x-2">
            <button onClick={search} className="px-3 py-2 bg-primary-600 text-white rounded">{loading ? 'Searching…' : 'Search'}</button>
            <button onClick={useMyLocation} className="px-3 py-2 bg-gray-100 rounded">Use My Location</button>
          </div>
        </div>
      </Card>
      {error && <Alert type="error" title="Error">{error}</Alert>}
      {Array.isArray(results) && (
        <Card>
          <div className="text-sm text-gray-700">{results.length} trial(s) found</div>
          <div className="divide-y mt-3">
            {results.map((t) => (
              <div key={t.nct_id} className="py-3">
                <div className="font-medium">{t.title}</div>
                <div className="text-sm text-gray-600">{t.nct_id} • {t.phase} • {t.status}</div>
                <div className="text-sm text-gray-600">{t.condition} {t.biomarkers && t.biomarkers.length ? `• Biomarkers: ${t.biomarkers.join(', ')}` : ''}</div>
                {t.locations && t.locations.length > 0 && (
                  <div className="text-xs text-gray-500">Sites: {t.locations.map(l => l.name).join('; ')}</div>
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
