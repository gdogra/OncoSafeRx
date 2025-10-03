import React, { useEffect, useState } from 'react';

type Item = {
  id: string;
  patient: any;
  profile: any | null;
};

const PatientProfilesDiagnostics: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch('/api/patients/with-profiles');
        if (!resp.ok) throw new Error(await resp.text());
        const body = await resp.json();
        if (!cancelled) setItems(Array.isArray(body?.items) ? body.items : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true };
  }, []);

  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [rebuilding, setRebuilding] = useState<Record<string, boolean>>({});

  const refreshOne = async (id: string) => {
    setSyncing((s) => ({ ...s, [id]: true }));
    try {
      const resp = await fetch(`/api/patients/${encodeURIComponent(id)}/with-profile`);
      if (!resp.ok) throw new Error(await resp.text());
      const body = await resp.json();
      setItems((prev) => prev.map((it) => (it.id === id ? { id, patient: body.patient, profile: body.profile } : it)));
    } catch (e) {
      // best-effort; show inline error briefly
      setError((e as any)?.message || 'Failed to refresh patient profile');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSyncing((s) => ({ ...s, [id]: false }));
    }
  };

  const rebuildOne = async (id: string) => {
    setRebuilding((s) => ({ ...s, [id]: true }));
    try {
      const resp = await fetch(`/api/patients/${encodeURIComponent(id)}/sync-profile`, { method: 'POST' });
      if (!resp.ok) throw new Error(await resp.text());
      const body = await resp.json();
      setItems((prev) => prev.map((it) => (it.id === id ? { id, patient: it.patient, profile: body.profile } : it)));
    } catch (e) {
      setError((e as any)?.message || 'Failed to rebuild patient profile');
      setTimeout(() => setError(null), 3000);
    } finally {
      setRebuilding((s) => ({ ...s, [id]: false }));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Patient Profiles Diagnostics</h1>
      <p className="text-sm text-gray-600 mb-6">Joined view of patients and patient_profiles to verify synchronization.</p>
      {loading && (
        <div className="text-sm text-gray-600">Loading…</div>
      )}
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Patient ID</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Name</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">MRN</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Meds</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Allergies</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Comorbidities</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Genetics</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Updated</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(({ id, patient, profile }) => {
                const d = patient?.demographics || {};
                const name = `${d.firstName || ''} ${d.lastName || ''}`.trim();
                const mrn = d.mrn || '';
                const meds = profile?.current_medications?.length || 0;
                const allergies = profile?.allergies?.length || 0;
                const comorbid = profile?.comorbidities?.length || 0;
                const genetics = Array.isArray(profile?.genetic_profile) ? profile.genetic_profile.length : 0;
                const updated = profile?.updated_at || patient?.updated_at || '';
                return (
                  <tr key={id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-900 font-mono text-xs">{id}</td>
                    <td className="px-3 py-2 text-gray-900">{name || '—'}</td>
                    <td className="px-3 py-2 text-gray-700">{mrn || '—'}</td>
                    <td className="px-3 py-2">{meds}</td>
                    <td className="px-3 py-2">{allergies}</td>
                    <td className="px-3 py-2">{comorbid}</td>
                    <td className="px-3 py-2">{genetics}</td>
                    <td className="px-3 py-2 text-gray-600">{updated ? new Date(updated).toLocaleString() : '—'}</td>
                    <td className="px-3 py-2 space-x-2">
                      <button
                        onClick={() => refreshOne(id)}
                        disabled={!!syncing[id]}
                        className={`px-3 py-1.5 rounded-md text-white text-xs ${syncing[id] ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'}`}
                        title="Refresh this row"
                      >
                        {syncing[id] ? 'Syncing…' : 'Sync Now'}
                      </button>
                      <button
                        onClick={() => rebuildOne(id)}
                        disabled={!!rebuilding[id]}
                        className={`px-3 py-1.5 rounded-md text-white text-xs ${rebuilding[id] ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        title="Rebuild profile from patient data"
                      >
                        {rebuilding[id] ? 'Rebuilding…' : 'Rebuild Now'}
                      </button>
                    </td>
                  </tr>
                )
              })}
              {items.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-gray-500" colSpan={8}>No patients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PatientProfilesDiagnostics;
