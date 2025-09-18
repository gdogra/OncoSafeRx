import React, { useState } from 'react';
import Alert from '../UI/Alert';

interface PgxUploaderProps {
  onPhenotypes?: (map: Record<string, string>) => void;
}

const PgxUploader: React.FC<PgxUploaderProps> = ({ onPhenotypes }) => {
  const [json, setJson] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phenos, setPhenos] = useState<{gene: string; phenotype: string}[] | null>(null);

  const analyze = async () => {
    setLoading(true); setError(null); setPhenos(null);
    try {
      let observations: any[] = [];
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) observations = parsed;
      else if (parsed.resourceType === 'Bundle') {
        observations = (parsed.entry || []).map((e: any) => e.resource).filter((r: any) => r && r.resourceType === 'Observation');
      } else if (parsed.resourceType === 'Observation') {
        observations = [parsed];
      } else if (parsed.observations) {
        observations = parsed.observations;
      }
      const base = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
      const resp = await fetch(`${base}/genomics/fhir/phenotype`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observations })
      });
      if (!resp.ok) throw new Error(`API ${resp.status}`);
      const data = await resp.json();
      const ph = (data.phenotypes || []) as any[];
      setPhenos(ph as any);
      if (onPhenotypes) {
        const map: Record<string, string> = {};
        ph.forEach((p: any) => { if (p?.gene && p?.phenotype) map[p.gene] = p.phenotype; });
        onPhenotypes(map);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to analyze PGx data');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">Paste FHIR Observations (or a Bundle containing Observations). We will map common PGx genotypes to phenotypes.</p>
      <div>
        <input
          type="file"
          accept="application/json,.json"
          onChange={async (e) => {
            try {
              const file = e.target.files?.[0];
              if (!file) return;
              const text = await file.text();
              setJson(text);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to read file');
            }
          }}
          className="text-sm"
        />
      </div>
      <textarea
        className="w-full border rounded-md p-2 font-mono text-sm h-40"
        placeholder='[{"resourceType":"Observation","code":{"text":"CYP2D6"},"valueString":"CYP2D6 *1/*1xN"}]'
        value={json}
        onChange={e => setJson(e.target.value)}
      />
      <div>
        <button onClick={analyze} className="px-3 py-2 bg-primary-600 text-white rounded-md" disabled={loading}>
          {loading ? 'Analyzing…' : 'Analyze PGx'}
        </button>
      </div>
      {error && <Alert type="error" title="Error">{error}</Alert>}
      {phenos && (
        <div className="text-sm text-gray-700">
          {phenos.length === 0 && <div>No phenotypes detected.</div>}
          {phenos.map((p, idx) => (
            <div key={idx}>• {p.gene}: {p.phenotype}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PgxUploader;
