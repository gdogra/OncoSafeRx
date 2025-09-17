import React, { useEffect, useState } from 'react';
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
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Regimens;

