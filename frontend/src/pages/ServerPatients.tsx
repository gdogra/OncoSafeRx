import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/UI/Card';
import { usePatient } from '../context/PatientContext';
import { supabase } from '../lib/supabase';
import { Search, ChevronLeft, ChevronRight, RefreshCw, Edit, X, Plus } from 'lucide-react';
import { useToast } from '../components/UI/Toast';
import ComprehensivePatientForm from '../components/Patient/ComprehensivePatientForm';
// Always allow creating patients on this page (production UX request)
import Coachmark from '../components/UI/Coachmark';

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
  const [usingDefaultUser, setUsingDefaultUser] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCoachBanner, setShowCoachBanner] = useState<boolean>(() => {
    try {
      if ((import.meta as any)?.env?.MODE !== 'production') return false;
      return localStorage.getItem('osrx_tip_create_patient_seen') !== 'true';
    } catch { return false; }
  });
  const [showCoach, setShowCoach] = useState(false);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);
  const { showToast } = useToast();
  const canCreatePatients = true;

  // Keyboard shortcut: press "c" to open Create Patient (when not typing)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = (target?.tagName || '').toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || target?.isContentEditable;
      if (isTyping) return;
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setShowCreateForm(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const fetchPatients = async (opts?: { resetPage?: boolean }) => {
    console.log('🎯 fetchPatients called with opts:', opts);
    setLoading(true);
    console.log('⚡ setLoading(true) completed');
    try {
      console.log('💫 Getting authentication token...');
      
      // Try multiple ways to get the token since getSession() times out
      let token = null;
      
      // Method 1: Try stored JWT tokens (from localStorage)
      try {
        const storedTokens = localStorage.getItem('osrx_auth_tokens');
        console.log('💫 Stored tokens raw:', storedTokens ? 'Found' : 'Not found');
        if (storedTokens) {
          const parsed = JSON.parse(storedTokens);
          console.log('💫 Parsed token info:', { hasAccessToken: !!parsed.access_token, expiresAt: parsed.expires_at, now: Date.now() });
          if (parsed.access_token && parsed.expires_at > Date.now()) {
            token = parsed.access_token;
            console.log('💫 Using stored JWT token');
          } else {
            console.log('💫 Stored token expired or invalid');
          }
        }
      } catch (e) {
        console.warn('💫 Failed to get stored token:', e);
      }
      
      // Method 2: Try getSession with short timeout (only if no stored token)
      if (!token) {
        try {
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session timeout')), 1000)
          );
          
          const { data } = await Promise.race([sessionPromise, timeoutPromise]);
          token = data?.session?.access_token;
          console.log('💫 Got token from getSession()');
        } catch (error) {
          console.warn('💫 getSession() failed:', error.message);
        }
      }
      
      console.log('💫 Final token status:', { hasToken: !!token });
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
      
      let resp: Response | null = null;
      try {
        resp = await fetch(`/api/patients?${params.toString()}`, { 
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: AbortSignal.timeout(5000)
        });
      } catch (e: any) {
        const isTimeout = e?.name === 'TimeoutError' || /timeout/i.test(String(e?.message || ''));
        console.warn('⏱️ Primary patients fetch failed, timeout?', isTimeout, e?.message);
        if (isTimeout) {
          try {
            // Force offline path on the API to avoid DB waits in dev
            const offlineUrl = `/api/patients?${params.toString()}&offline=1`;
            resp = await fetch(offlineUrl, { signal: AbortSignal.timeout(2000) });
            console.log('🔁 Offline fallback response status:', resp.status);
          } catch (fallbackErr) {
            console.warn('⚠️ Offline fallback failed:', (fallbackErr as any)?.message);
            throw e; // rethrow original timeout
          }
        } else {
          throw e;
        }
      }
      
      console.log('📡 Patients API response:', {
        status: resp.status,
        ok: resp.ok,
        statusText: resp.statusText,
        hasToken: !!token
      });
      
      // If auth failed, this is expected behavior now - no retries
      if (!resp.ok && resp.status === 401) {
        console.log('🔄 Authentication required - this is expected in production');
      }
      
      if (resp && resp.ok) {
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
        setUsingDefaultUser(!!body.defaultUser);
        if (opts?.resetPage) setPage(1);
      } else {
        // API call failed
        console.error('❌ Patients API failed:', resp ? {
          status: resp.status,
          statusText: resp.statusText,
          headers: Object.fromEntries(resp.headers.entries()),
          url: resp.url
        } : { error: 'no response' });
        
        const body = resp ? await resp.text() : 'no response';
        console.error('❌ Error response body:', body);
        
        // Clear patients list and show appropriate error
        setPatients([]);
        setTotal(0);
        setUsingDemoData(false);
        
        if (resp.status === 401) {
          console.error('❌ Authentication failed - user may need to log in again');
        } else if (resp.status === 503) {
          console.error('❌ Database service unavailable');
        }
        
        if (opts?.resetPage) setPage(1);
      }
    } catch (error) {
      console.error('❌ Error fetching patients:', error);
      console.error('❌ Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      
      // Clear data on error
      setPatients([]);
      setTotal(0);
      setUsingDemoData(false);
    } finally {
      setLoading(false);
    }
  };

  const createNewPatient = async (patientData: any) => {
    console.log('🏥 === PATIENT CREATION DEBUG START ===');
    console.log('🏥 Input patientData:', patientData);
    
    try {
      // Build minimal patient profile compatible with backend schema
      const demographics = {
        firstName: patientData.firstName || 'Unknown',
        lastName: patientData.lastName || 'Patient',
        dateOfBirth: patientData.dateOfBirth || '1980-01-01',
        sex: patientData.sex || 'unknown',
        mrn: patientData.mrn || `MRN${Date.now()}`,
        heightCm: patientData.heightCm || 170,
        weightKg: patientData.weightKg || 70,
      };
      console.log('🏥 Built demographics:', demographics);

      let createdBy = 'guest';
      try {
        const { data: sess } = await supabase.auth.getSession();
        createdBy = sess?.session?.user?.id || createdBy;
        console.log('🏥 CreatedBy from session:', createdBy);
      } catch (sessionError) {
        console.log('🏥 Session error:', sessionError);
      }

      const newPatient = {
        id: `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        demographics,
        allergies: patientData.allergies || [],
        medications: [],
        conditions: patientData.medicalConditions || [],
        labValues: patientData.labValues ? [patientData.labValues] : [],
        genetics: [],
        vitals: patientData.vitals ? [patientData.vitals] : [],
        treatmentHistory: [],
        notes: [],
        preferences: {},
        lastUpdated: new Date().toISOString(),
        createdBy,
        isActive: true,
      };
      console.log('🏥 Prepared newPatient object:', newPatient);

      // Optimistically set as current
      console.log('🏥 Setting patient optimistically...');
      actions.setCurrentPatient(newPatient);
      console.log('🏥 ✅ Patient set in context');

      // Prepare headers with optional auth - try multiple token sources
      let token: string | null = null;
      
      // Try Supabase session first
      try {
        const { data: sess } = await supabase.auth.getSession();
        token = sess?.session?.access_token || null;
        console.log('🏥 Supabase session token:', token ? 'Present' : 'Missing');
      } catch (tokenError) {
        console.log('🏥 Supabase session error:', tokenError);
      }
      
      // Fallback to localStorage tokens (for JWT-direct auth path)
      if (!token) {
        try {
          const storedTokens = localStorage.getItem('osrx_auth_tokens');
          if (storedTokens) {
            const parsed = JSON.parse(storedTokens);
            token = parsed.access_token || null;
            console.log('🏥 LocalStorage token:', token ? 'Present' : 'Missing');
          }
        } catch (storageError) {
          console.log('🏥 LocalStorage token error:', storageError);
        }
      }
      
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log('🏥 Added Authorization header with token');
      } else {
        console.log('🏥 ⚠️ No token available - proceeding without auth');
      }
      console.log('🏥 Request headers:', Object.keys(headers));

      // Persist to server
      console.log('🏥 Making API call to /api/patients...');
      try {
        const requestBody = JSON.stringify({ patient: newPatient });
        console.log('🏥 Request body:', requestBody);
        
        const resp = await fetch('/api/patients', {
          method: 'POST',
          headers,
          body: requestBody
        });
        
        console.log('🏥 API Response status:', resp.status);
        console.log('🏥 API Response ok:', resp.ok);
        console.log('🏥 API Response headers:', Object.fromEntries(resp.headers.entries()));
        
        if (resp.ok) {
          const result = await resp.json().catch((jsonError) => {
            console.log('🏥 JSON parse error:', jsonError);
            return {};
          });
          console.log('🏥 API Response body:', result);
          
          const serverPatient = result?.patient ? (result.patient.data || result.patient) : null;
          console.log('🏥 Extracted serverPatient:', serverPatient);
          
          if (serverPatient) {
            console.log('🏥 Updating context with server patient...');
            actions.setCurrentPatient(serverPatient);
          }
          
          console.log('🏥 ✅ Showing success toast...');
          showToast('success', 'Patient created successfully');
          
          console.log('🏥 Refreshing patient list...');
          await fetchPatients({ resetPage: true });
          console.log('🏥 ✅ Patient list refreshed');
        } else {
          const errorText = await resp.text().catch(() => 'Unknown error');
          console.log('🏥 ❌ API Error response:', errorText);
          showToast('error', `Create failed: ${resp.status} ${errorText}`);
          try { 
            console.log('🏥 Attempting sync from server...');
            await actions.syncFromServer(); 
          } catch (syncError) {
            console.log('🏥 Sync error:', syncError);
          }
        }
      } catch (networkError) {
        console.log('🏥 ❌ Network error:', networkError);
        showToast('warning', 'Saved locally (network error)');
      }
      
      console.log('🏥 Closing create form...');
      setShowCreateForm(false);
      console.log('🏥 === PATIENT CREATION DEBUG END ===');
      
    } catch (globalError) {
      console.log('🏥 ❌ Global error in createNewPatient:', globalError);
      showToast('error', 'Failed to create patient');
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
      if (!token) { 
        console.log('⚠️ No Supabase token, proceeding without authentication (backend will use default user)');
      }
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
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const resp = await fetch('/api/patients', {
        method: 'POST',
        headers,
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
      {/* One-time coach banner (production) */}
      {showCoachBanner && (
        <div className="p-3 rounded-md border bg-green-50 border-green-200 flex items-center justify-between">
          <div className="text-sm text-green-900">
            Tip: Use the "Create Patient" button to add your first record.
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setShowCoach(true); }} className="px-2 py-1 text-xs bg-white border border-green-300 text-green-700 rounded">Guide me</button>
            <button onClick={() => { setShowCoachBanner(false); try { localStorage.setItem('osrx_tip_create_patient_seen','true'); } catch {} }} className="px-2 py-1 text-xs bg-green-600 text-white rounded">Got it</button>
          </div>
        </div>
      )}
      {/* Page header with always-visible Create button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <h1 className="text-xl font-semibold text-gray-900">All Patients</h1>
        </div>
        {canCreatePatients && (
          <button
            id="create-patient-btn-all"
            onClick={() => setShowCreateForm(true)}
            className="px-3 py-2 bg-green-600 text-white rounded text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Create Patient
          </button>
        )}
      </div>
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <Search className="w-5 h-5 text-gray-400" />
          <h1 className="text-xl font-semibold text-gray-900">All Patients</h1>
        </div>
        
        {(patients.length === 0 && !loading) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>No Patients Found:</strong> You haven't created any patients yet.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button onClick={() => setShowCreateForm(true)} className="px-3 py-1.5 bg-green-600 text-white rounded text-xs flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Create Patient
              </button>
              <span className="text-xs text-blue-700">Tip: press <kbd className="px-1 py-0.5 border rounded bg-white">C</kbd> to create</span>
            </div>
          </div>
        )}
        {(usingDefaultUser || usingDemoData) && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-900">
              {usingDefaultUser ? (
                <>
                  Viewing patients for the default user (unauthenticated). Sign in to see your own patients.
                </>
              ) : (
                <>
                  Using demo/offline data. Connect to the server to sync your patients.
                </>
              )}
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
          {canCreatePatients && (
            <button onClick={() => setShowCreateForm(true)} className="px-3 py-2 bg-green-600 text-white rounded text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> Create Patient
            </button>
          )}
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

      {showCreateForm && (
        <ComprehensivePatientForm
          onSubmit={createNewPatient}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Mobile FAB for quick create */}
      {canCreatePatients && !showCreateForm && (
        <button
          onClick={() => setShowCreateForm(true)}
          className="fixed bottom-4 right-4 md:hidden inline-flex items-center justify-center rounded-full shadow-lg bg-green-600 text-white w-12 h-12"
          aria-label="Create Patient"
          title="Create Patient"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {showCoach && (
        <Coachmark
          anchorId="create-patient-btn-all"
          title="Create a Patient"
          description="Click here to add your first patient. You can use the C key as a shortcut."
          ctaLabel="Got it"
          onCta={() => { setShowCoach(false); setShowCoachBanner(false); try { localStorage.setItem('osrx_tip_create_patient_seen','true'); } catch {} }}
          onClose={() => setShowCoach(false)}
          tone="green"
        />
      )}
    </div>
  );
};

export default ServerPatients;
