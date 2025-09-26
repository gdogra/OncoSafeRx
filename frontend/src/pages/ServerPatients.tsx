import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/UI/Card';
import { usePatient } from '../context/PatientContext';
import { supabase } from '../lib/supabase';
import { Search, ChevronLeft, ChevronRight, RefreshCw, Edit, X } from 'lucide-react';
import { useToast } from '../components/UI/Toast';

const PAGE_SIZE = 10;

const ServerPatients: React.FC = () => {
  const { actions } = usePatient();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);
  const { showToast } = useToast();

  const fetchPatients = async (opts?: { resetPage?: boolean }) => {
    setLoading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token;
      const p = opts?.resetPage ? 1 : page;
      const params = new URLSearchParams({ q: query, page: String(p), pageSize: String(PAGE_SIZE) });
      const resp = await fetch(`/api/patients?${params.toString()}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const body = await resp.json();
      if (resp.ok) {
        setPatients(body.patients || []);
        setTotal(body.total || 0);
        if (opts?.resetPage) setPage(1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); /* eslint-disable-next-line */ }, [page]);

  const selectAndClose = (p: any) => {
    const data = p.data || p;
    actions.setCurrentPatient({ ...data, id: p.id || data.id });
  };

  const openEdit = (p: any) => {
    const d = p.data?.demographics || p.demographics || {};
    setEditing({
      id: p.id,
      firstName: d.firstName || '',
      lastName: d.lastName || '',
      mrn: d.mrn || '',
      dateOfBirth: d.dateOfBirth || '',
      sex: d.sex || 'unknown',
      original: p,
    });
    setSaveError(null);
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!editing.firstName?.trim() || !editing.lastName?.trim()) {
      setSaveError('First and last name are required');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token;
      if (!token) { setSaveError('Not authenticated'); setSaving(false); return; }
      const base = editing.original?.data || editing.original;
      const updated = {
        ...(base || {}),
        id: editing.id,
        demographics: {
          ...(base?.demographics || {}),
          firstName: editing.firstName,
          lastName: editing.lastName,
          mrn: editing.mrn,
          dateOfBirth: editing.dateOfBirth,
          sex: editing.sex,
        },
        lastUpdated: new Date().toISOString(),
      };
      const resp = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patient: updated })
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body?.error || `Save failed (${resp.status})`);
      }
      setEditing(null);
      await fetchPatients();
      showToast('success', 'Patient updated');
    } catch (e: any) {
      setSaveError(e?.message || 'Save failed');
      showToast('error', e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <Search className="w-5 h-5 text-gray-400" />
          <h1 className="text-xl font-semibold text-gray-900">All Patients</h1>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or MRN"
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <button onClick={() => fetchPatients({ resetPage: true })} className="px-3 py-2 bg-blue-600 text-white rounded text-sm">Search</button>
          <button onClick={() => { setQuery(''); fetchPatients({ resetPage: true }); }} className="px-3 py-2 bg-white border rounded text-sm">Clear</button>
          <button onClick={() => fetchPatients()} className="px-3 py-2 bg-white border rounded text-sm flex items-center gap-1">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRN</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((p) => {
                const d = p.data?.demographics || p.demographics || {};
                const name = `${d.firstName || ''} ${d.lastName || ''}`.trim();
                const mrn = d.mrn || '';
                const dob = d.dateOfBirth ? new Date(d.dateOfBirth).toLocaleDateString() : '';
                const updated = (p.data?.lastUpdated || p.lastUpdated) ? new Date(p.data?.lastUpdated || p.lastUpdated).toLocaleString() : '';
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900 cursor-pointer" onClick={() => selectAndClose(p)}>{name || '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 cursor-pointer" onClick={() => selectAndClose(p)}>{mrn || '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 cursor-pointer" onClick={() => selectAndClose(p)}>{dob || '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 cursor-pointer" onClick={() => selectAndClose(p)}>{updated || '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      <button onClick={() => openEdit(p)} className="inline-flex items-center px-2 py-1 bg-white border rounded text-xs hover:bg-gray-50">
                        <Edit className="w-4 h-4 mr-1"/> Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
              {patients.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">No patients found</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">Loading…</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Page {page} of {totalPages} • {total} total</div>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2 py-1 bg-white border rounded disabled:opacity-50"><ChevronLeft className="w-4 h-4"/></button>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 bg-white border rounded disabled:opacity-50"><ChevronRight className="w-4 h-4"/></button>
          </div>
        </div>
      </Card>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Edit Patient</h2>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600" aria-label="Close"><X className="w-5 h-5"/></button>
            </div>
            {saveError && <div className="mb-3 text-sm text-red-700">{saveError}</div>}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">First Name</label>
                <input value={editing.firstName} onChange={(e) => setEditing({ ...editing, firstName: e.target.value })} className="w-full border rounded px-3 py-2 text-sm"/>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Last Name</label>
                <input value={editing.lastName} onChange={(e) => setEditing({ ...editing, lastName: e.target.value })} className="w-full border rounded px-3 py-2 text-sm"/>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">MRN</label>
                <input value={editing.mrn} onChange={(e) => setEditing({ ...editing, mrn: e.target.value })} className="w-full border rounded px-3 py-2 text-sm"/>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Date of Birth</label>
                <input type="date" value={editing.dateOfBirth} onChange={(e) => setEditing({ ...editing, dateOfBirth: e.target.value })} className="w-full border rounded px-3 py-2 text-sm"/>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Sex</label>
                <select value={editing.sex} onChange={(e) => setEditing({ ...editing, sex: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-sm bg-white border rounded">Cancel</button>
              <button onClick={saveEdit} disabled={saving} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerPatients;
