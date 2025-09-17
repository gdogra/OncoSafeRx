import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';

type Regimen = {
  id: string;
  name: string;
  indication: string;
  cycleLengthDays?: number;
  components?: { name: string; dose: string }[];
  pretreatment?: string[];
  monitoring?: string[];
  notes?: string[];
};

const Regimens: React.FC = () => {
  const [list, setList] = useState<Regimen[]>([]);
  const [selected, setSelected] = useState<Regimen | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [labs, setLabs] = useState<{ ANC?: number; platelets?: number; CrCl?: number; LVEF?: number }>({});
  const [phenotypes, setPhenotypes] = useState<{ [gene: string]: string }>({});
  const [dosingRecs, setDosingRecs] = useState<string[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
        const resp = await fetch(`${base}/regimens`);
        const data = await resp.json();
        setList(data.regimens || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load regimens');
      }
    })();
  }, []);

  const loadDetails = async (id: string) => {
    try {
      const base = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
      const resp = await fetch(`${base}/regimens/${id}`);
      const data = await resp.json();
      setSelected(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load regimen');
    }
  };

  const apiBase = useMemo(() => process.env.REACT_APP_API_URL || 'http://localhost:3000/api', []);

  const downloadPdf = (id: string) => {
    const url = `${apiBase}/export/regimen/${encodeURIComponent(id)}/pdf`;
    window.open(url, '_blank');
  };

  const adjustDosing = async () => {
    if (!selected) return;
    try {
      const resp = await fetch(`${apiBase}/dosing/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regimenId: selected.id, labs, phenotypes })
      });
      const data = await resp.json();
      setDosingRecs(data.recommendations || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to adjust dosing');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Regimen Templates (MVP)</h1>
      {error && <Alert type="error" title="Error">{error}</Alert>}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-3">Regimens</h2>
          <ul className="divide-y">
            {list.map((r) => (
              <li key={r.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-sm text-gray-500">{r.indication}</div>
                </div>
                <button className="text-primary-600" onClick={() => loadDetails(r.id)}>View</button>
              </li>
            ))}
          </ul>
        </Card>
        <div className="md:col-span-2">
          <Card>
            {!selected ? (
              <div className="text-gray-500">Select a regimen to view details.</div>
            ) : (
              <div className="space-y-3">
                <div className="text-xl font-semibold">{selected.name}</div>
                <div className="text-gray-600">Indication: {selected.indication}</div>
                {selected.cycleLengthDays && (
                  <div className="text-gray-600">Cycle length: {selected.cycleLengthDays} days</div>
                )}
                <div>
                  <button onClick={() => downloadPdf(selected.id)} className="px-3 py-2 bg-gray-800 text-white rounded-md">Download PDF</button>
                </div>
                {selected.components && (
                  <div>
                    <div className="font-medium">Components</div>
                    <ul className="list-disc ml-6 text-sm text-gray-700">
                      {selected.components.map((c, idx) => (
                        <li key={idx}>{c.name}: {c.dose}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selected.pretreatment && (
                  <div>
                    <div className="font-medium">Pre-treatment</div>
                    <ul className="list-disc ml-6 text-sm text-gray-700">
                      {selected.pretreatment.map((p, idx) => <li key={idx}>{p}</li>)}
                    </ul>
                  </div>
                )}
                {selected.monitoring && (
                  <div>
                    <div className="font-medium">Monitoring</div>
                    <ul className="list-disc ml-6 text-sm text-gray-700">
                      {selected.monitoring.map((m, idx) => <li key={idx}>{m}</li>)}
                    </ul>
                  </div>
                )}
                {selected.notes && (
                  <div>
                    <div className="font-medium">Notes</div>
                    <ul className="list-disc ml-6 text-sm text-gray-700">
                      {selected.notes.map((n, idx) => <li key={idx}>{n}</li>)}
                    </ul>
                  </div>
                )}

                {/* Dosing calculator */}
                <div className="mt-4">
                  <div className="font-medium mb-2">Dosing Adjustments (MVP)</div>
                  <div className="grid md:grid-cols-4 gap-3 text-sm">
                    <label className="block">ANC (/µL)
                      <input type="number" className="w-full border rounded px-2 py-1" value={labs.ANC ?? ''} onChange={e => setLabs({ ...labs, ANC: e.target.value ? Number(e.target.value) : undefined })} />
                    </label>
                    <label className="block">Platelets (/µL)
                      <input type="number" className="w-full border rounded px-2 py-1" value={labs.platelets ?? ''} onChange={e => setLabs({ ...labs, platelets: e.target.value ? Number(e.target.value) : undefined })} />
                    </label>
                    <label className="block">CrCl (mL/min)
                      <input type="number" className="w-full border rounded px-2 py-1" value={labs.CrCl ?? ''} onChange={e => setLabs({ ...labs, CrCl: e.target.value ? Number(e.target.value) : undefined })} />
                    </label>
                    <label className="block">LVEF (%)
                      <input type="number" className="w-full border rounded px-2 py-1" value={labs.LVEF ?? ''} onChange={e => setLabs({ ...labs, LVEF: e.target.value ? Number(e.target.value) : undefined })} />
                    </label>
                  </div>
                  <div className="grid md:grid-cols-4 gap-3 text-sm mt-3">
                    <label className="block">DPYD phenotype
                      <select className="w-full border rounded px-2 py-1" value={phenotypes.DPYD || ''} onChange={e => setPhenotypes({ ...phenotypes, DPYD: e.target.value })}>
                        <option value="">Unknown</option>
                        <option>Normal metabolizer</option>
                        <option>Intermediate metabolizer</option>
                        <option>Poor metabolizer</option>
                      </select>
                    </label>
                    <label className="block">CYP2D6 phenotype
                      <select className="w-full border rounded px-2 py-1" value={phenotypes.CYP2D6 || ''} onChange={e => setPhenotypes({ ...phenotypes, CYP2D6: e.target.value })}>
                        <option value="">Unknown</option>
                        <option>Normal metabolizer</option>
                        <option>Intermediate metabolizer</option>
                        <option>Poor metabolizer</option>
                        <option>Ultra-rapid metabolizer</option>
                      </select>
                    </label>
                  </div>
                  <div className="mt-3">
                    <button onClick={adjustDosing} className="px-3 py-2 bg-primary-600 text-white rounded-md">Apply Adjustments</button>
                  </div>
                  {dosingRecs && (
                    <div className="mt-3 space-y-1 text-sm text-gray-700">
                      {dosingRecs.length === 0 && <div>No adjustments recommended.</div>}
                      {dosingRecs.map((r, idx) => <div key={idx}>• {r}</div>)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Regimens;
