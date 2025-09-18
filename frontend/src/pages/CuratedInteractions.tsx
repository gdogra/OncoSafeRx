import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selection = useSelection();

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
    const url = `${process.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/interactions/known?${params.toString()}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Curated Drug Interactions</h1>
        <div className="flex items-center space-x-2">
          <button onClick={() => exportFile('csv')} className="px-3 py-2 bg-primary-600 text-white rounded-md">Export CSV</button>
          <button onClick={() => exportFile('tsv')} className="px-3 py-2 bg-gray-700 text-white rounded-md">Export TSV</button>
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

      {!loading && results && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Results ({results.count}/{results.total})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Drug A</th>
                  <th className="py-2 pr-4">Drug B</th>
                  <th className="py-2 pr-4">Severity</th>
                  <th className="py-2 pr-4">Effect</th>
                  <th className="py-2 pr-4">Management</th>
                  <th className="py-2 pr-4">Sources</th>
                </tr>
              </thead>
              <tbody>
                {results.interactions.map((it, idx) => (
                  <tr key={idx} className="border-b align-top">
                    <td className="py-2 pr-4">
                      {it.drug_rxnorm ? `${it.drug_rxnorm[0]?.name} ${it.drug_rxnorm[0]?.rxcui ? `(RXCUI ${it.drug_rxnorm[0]?.rxcui})` : ''}` : it.drugs[0]}
                    </td>
                    <td className="py-2 pr-4">
                      {it.drug_rxnorm ? `${it.drug_rxnorm[1]?.name} ${it.drug_rxnorm[1]?.rxcui ? `(RXCUI ${it.drug_rxnorm[1]?.rxcui})` : ''}` : it.drugs[1]}
                    </td>
                    <td className="py-2 pr-4 capitalize">{it.severity || 'unknown'}</td>
                    <td className="py-2 pr-4">{it.effect || '-'}</td>
                    <td className="py-2 pr-4">{it.management || '-'}</td>
                    <td className="py-2 pr-4">{it.sources?.join(', ') || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CuratedInteractions;
