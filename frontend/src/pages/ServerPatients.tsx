import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/UI/Card';
import { usePatient } from '../context/PatientContext';
import { supabase } from '../lib/supabase';
import { Search, ChevronLeft, ChevronRight, RefreshCw, Edit, X } from 'lucide-react';
import { useToast } from '../components/UI/Toast';

const PAGE_SIZE = 10;

const ServerPatients: React.FC = () => {
  console.log('🚀 ServerPatients component loaded');
  const { actions } = usePatient();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);
  const { showToast } = useToast();

  const fetchPatients = async (opts?: { resetPage?: boolean }) => {
    console.log('🎯 fetchPatients called with opts:', opts);
    setLoading(true);
    console.log('⚡ setLoading(true) completed');
    try {
      console.log('💫 About to call supabase.auth.getSession()');
      const { data: sess } = await supabase.auth.getSession();
      console.log('💫 supabase.auth.getSession() completed:', { hasSession: !!sess?.session });
      const token = sess?.session?.access_token;
      console.log('💫 token extracted:', { hasToken: !!token });
      const p = opts?.resetPage ? 1 : page;
      const params = new URLSearchParams({ q: query, page: String(p), pageSize: String(PAGE_SIZE) });
      
      console.log('🔍 Fetching patients:', {
        url: `/api/patients?${params.toString()}`,
        hasToken: !!token,
        page: p,
        query,
        environment: process.env.NODE_ENV,
        baseURL: window.location.origin
      });
      
      // Test if API proxy is working at all
      try {
        const testResp = await fetch('/api/health', { signal: AbortSignal.timeout(3000) });
        console.log('🏥 API health check:', {
          status: testResp.status,
          ok: testResp.ok,
          url: testResp.url
        });
      } catch (healthError) {
        console.warn('⚠️ API health check failed:', healthError?.message);
      }
      
      let resp = await fetch(`/api/patients?${params.toString()}`, { 
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      console.log('📡 Patients API response:', {
        status: resp.status,
        ok: resp.ok,
        statusText: resp.statusText,
        hasToken: !!token
      });
      
      // If auth failed, try without token (for backend that might not require auth)
      if (!resp.ok && resp.status === 401 && token) {
        console.log('🔄 Auth failed, retrying without token...');
        resp = await fetch(`/api/patients?${params.toString()}`, { 
          signal: AbortSignal.timeout(5000)
        });
        console.log('📡 Retry response:', {
          status: resp.status,
          ok: resp.ok,
          statusText: resp.statusText
        });
      }
      
      if (resp.ok) {
        const body = await resp.json();
        console.log('✅ Patients API success:', {
          patientsCount: body.patients?.length || 0,
          total: body.total || 0,
          offline: body.offline,
          samplePatient: body.patients?.[0]
        });
        setPatients(body.patients || []);
        setTotal(body.total || 0);
        setUsingDemoData(body.offline || false);
        if (opts?.resetPage) setPage(1);
      } else {
        // Backend API unavailable, use fallback demo data
        console.warn('⚠️ Patients API unavailable, using demo data. Status:', resp.status);
        console.warn('⚠️ Response details:', {
          status: resp.status,
          statusText: resp.statusText,
          headers: Object.fromEntries(resp.headers.entries()),
          url: resp.url
        });
        setUsingDemoData(true);
        const demoPatients = [
          {
            id: 'demo-1',
            data: {
              demographics: {
                firstName: 'Sarah',
                lastName: 'Johnson',
                mrn: 'MRN001234',
                dateOfBirth: '1961-03-15',
                sex: 'female',
                age: 62
              },
              diagnosis: {
                primary: 'Invasive ductal carcinoma, breast',
                stage: 'IIIA'
              }
            },
            name: 'Sarah Johnson',
            mrn: 'MRN001234'
          },
          {
            id: 'demo-2',
            data: {
              demographics: {
                firstName: 'Michael',
                lastName: 'Chen',
                mrn: 'MRN001235',
                dateOfBirth: '1955-07-22',
                sex: 'male',
                age: 68
              },
              diagnosis: {
                primary: 'Non-small cell lung cancer',
                stage: 'II'
              }
            },
            name: 'Michael Chen',
            mrn: 'MRN001235'
          },
          {
            id: 'demo-3',
            data: {
              demographics: {
                firstName: 'Maria',
                lastName: 'Rodriguez',
                mrn: 'MRN001236',
                dateOfBirth: '1970-11-08',
                sex: 'female',
                age: 53
              },
              diagnosis: {
                primary: 'Colorectal adenocarcinoma',
                stage: 'III'
              }
            },
            name: 'Maria Rodriguez',
            mrn: 'MRN001236'
          }
        ];
        
        // Filter demo patients based on search query
        let filtered = demoPatients;
        if (query.trim()) {
          const q = query.toLowerCase();
          filtered = demoPatients.filter(p => 
            p.name.toLowerCase().includes(q) || 
            p.mrn.toLowerCase().includes(q) ||
            p.data.diagnosis.primary.toLowerCase().includes(q)
          );
        }
        
        setPatients(filtered);
        setTotal(filtered.length);
        if (opts?.resetPage) setPage(1);
      }
    } catch (error) {
      console.error('❌ Error fetching patients:', error);
      console.error('❌ Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      console.log('🔄 Falling back to demo data due to error');
      // Use demo data as fallback when API call fails
      setUsingDemoData(true);
      const demoPatients = [
        {
          id: 'demo-1',
          data: {
            demographics: {
              firstName: 'Sarah',
              lastName: 'Johnson',
              mrn: 'MRN001234',
              dateOfBirth: '1961-03-15',
              sex: 'female',
              age: 62
            }
          },
          name: 'Sarah Johnson',
          mrn: 'MRN001234'
        },
        {
          id: 'demo-2', 
          data: {
            demographics: {
              firstName: 'Michael',
              lastName: 'Chen',
              mrn: 'MRN001235',
              dateOfBirth: '1955-07-22',
              sex: 'male',
              age: 68
            }
          },
          name: 'Michael Chen',
          mrn: 'MRN001235'
        }
      ];
      setPatients(demoPatients);
      setTotal(demoPatients.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    console.log('📅 useEffect triggered (page:', page, '), calling fetchPatients');
    fetchPatients(); 
    /* eslint-disable-next-line */ 
  }, [page]);

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
        
        {usingDemoData && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> Backend API unavailable. Showing sample patient data for demonstration.
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Patient selection and basic operations are functional, but data will not persist.
            </p>
          </div>
        )}
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
