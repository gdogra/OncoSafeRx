import React, { useEffect, useMemo, useRef, useState } from 'react';
import Card from '../components/UI/Card';
import { usePatient } from '../context/PatientContext';
import { supabase } from '../lib/supabase';
import { Search, ChevronLeft, ChevronRight, RefreshCw, Edit, X, Plus, Filter, Trash2 } from 'lucide-react';
import { useToast } from '../components/UI/Toast';
import ComprehensivePatientForm from '../components/Patient/ComprehensivePatientForm';
// Always allow creating patients on this page (production UX request)
import Coachmark from '../components/UI/Coachmark';
import Modal from '../components/UI/Modal';

const PAGE_SIZE = 10;

const ServerPatients: React.FC = () => {
  const { actions, state: patientState } = usePatient();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editTab, setEditTab] = useState<'demo'|'meds'|'cond'|'allergies'|'labs'>('demo');
  const [drugSuggestions, setDrugSuggestions] = useState<string[]>([]);
  const [showDrugSuggestions, setShowDrugSuggestions] = useState<{[key: string]: boolean}>({});
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [usingDefaultUser, setUsingDefaultUser] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [detailPatient, setDetailPatient] = useState<any | null>(null);
  const [detailsTab, setDetailsTab] = useState<'demo'|'meds'|'cond'|'labs'>('demo');
  const [showCoachBanner, setShowCoachBanner] = useState<boolean>(() => {
    try {
      if ((import.meta as any)?.env?.MODE !== 'production') return false;
      return localStorage.getItem('osrx_tip_create_patient_seen') !== 'true';
    } catch { return false; }
  });
  const [showCoach, setShowCoach] = useState(false);
  
  // Filter states
  const [ageFilter, setAgeFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [cancerTypeFilter, setCancerTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);
  const { showToast } = useToast();
  
  // State for individual patient deletion
  const [deletingPatient, setDeletingPatient] = useState<string | null>(null);

  const handleDeletePatient = async (patient: any) => {
    if (!patient?.id) return;
    
    // Set loading state for this specific patient
    setDeletingPatient(patient.id);
    
    try {
      // In development mode without backend, just simulate deletion
      if (window.location.hostname === 'localhost') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Remove patient from local state
        setPatients(prev => prev.filter(p => p.id !== patient.id));
        setTotal(prev => Math.max(0, prev - 1));
        
        // Clear current patient if it was the deleted one
        const currentPatient = patientState?.currentPatient;
        if (currentPatient?.id === patient.id) {
          actions.setCurrentPatient(null as any);
          try { 
            localStorage.removeItem('osrx_last_patient_id'); 
            localStorage.removeItem('osrx_last_patient'); 
          } catch {}
        }
        
        showToast('success', 'Patient deleted (development mode)');
        setDeletingPatient(null);
        return;
      }
      // Get current user/session info for creator verification
      let currentUserId = 'guest';
      try {
        const { data: sess } = await supabase.auth.getSession();
        currentUserId = sess?.session?.user?.id || 'guest';
      } catch (sessionError) {
        console.log('Session error for deletion:', sessionError);
      }
      
      // Get auth token
      let token: string | null = null;
      try {
        const { data: sess } = await supabase.auth.getSession();
        token = sess?.session?.access_token || null;
      } catch (tokenError) {
        console.log('Token error for deletion:', tokenError);
      }
      
      // Fallback to localStorage tokens
      if (!token) {
        try {
          const storedTokens = localStorage.getItem('osrx_auth_tokens');
          if (storedTokens) {
            const parsed = JSON.parse(storedTokens);
            token = parsed.access_token || null;
          }
        } catch (storageError) {
          console.log('LocalStorage token error for deletion:', storageError);
        }
      }
      
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      // Make DELETE request to API
      const resp = await fetch(`/api/patients/${patient.id}`, {
        method: 'DELETE',
        headers,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (resp.ok) {
        showToast('success', 'Patient deleted successfully');
        
        // Refresh the patient list
        await fetchPatients({ bustCache: true });
        
        // Clear current patient if it was the deleted one
        const currentPatient = patientState?.currentPatient;
        if (currentPatient?.id === patient.id) {
          actions.setCurrentPatient(null as any);
          try { 
            localStorage.removeItem('osrx_last_patient_id'); 
            localStorage.removeItem('osrx_last_patient'); 
          } catch {}
        }
      } else {
        const errorBody = await resp.text().catch(() => 'Unknown error');
        
        if (resp.status === 403) {
          showToast('error', 'You can only delete patients you created');
        } else if (resp.status === 404) {
          showToast('error', 'Patient not found');
        } else if (resp.status === 401) {
          showToast('error', 'Authentication required to delete patients');
        } else {
          showToast('error', `Delete failed: ${resp.status} ${errorBody}`);
        }
      }
    } catch (error: any) {
      console.error('Error deleting patient:', error);
      if (error?.name === 'TimeoutError' || /timeout/i.test(String(error?.message || ''))) {
        showToast('error', 'Delete request timed out');
      } else {
        showToast('error', 'Failed to delete patient');
      }
    } finally {
      setDeletingPatient(null);
    }
  };

  // Comprehensive oncology drug database with common dosages
  const drugDatabase = {
    // Chemotherapy agents
    'Carboplatin': ['AUC 5', 'AUC 6', '300mg/m²', '400mg/m²'],
    'Cisplatin': ['75mg/m²', '100mg/m²', '50mg/m²', '20mg/m²'],
    'Paclitaxel': ['175mg/m²', '80mg/m²', '100mg/m²', '135mg/m²'],
    'Docetaxel': ['75mg/m²', '100mg/m²', '60mg/m²'],
    'Doxorubicin': ['60mg/m²', '75mg/m²', '50mg/m²'],
    'Cyclophosphamide': ['600mg/m²', '500mg/m²', '750mg/m²'],
    'Gemcitabine': ['1000mg/m²', '1200mg/m²', '800mg/m²'],
    'Fluorouracil': ['400mg/m²', '600mg/m²', '2400mg/m²'],
    'Oxaliplatin': ['85mg/m²', '130mg/m²', '100mg/m²'],
    'Etoposide': ['100mg/m²', '120mg/m²', '50mg'],
    'Bleomycin': ['10 units/m²', '15 units/m²', '30 units'],
    'Vincristine': ['1.4mg/m²', '2mg', '1mg'],
    'Vinblastine': ['6mg/m²', '10mg/m²'],
    'Methotrexate': ['500mg/m²', '1000mg/m²', '3000mg/m²', '15mg'],
    
    // Targeted therapy
    'Trastuzumab': ['6mg/kg', '8mg/kg', '4mg/kg'],
    'Bevacizumab': ['5mg/kg', '7.5mg/kg', '10mg/kg', '15mg/kg'],
    'Cetuximab': ['400mg/m²', '250mg/m²'],
    'Rituximab': ['375mg/m²', '500mg/m²'],
    'Imatinib': ['400mg', '600mg', '800mg'],
    'Erlotinib': ['150mg', '100mg', '50mg'],
    'Gefitinib': ['250mg'],
    'Sorafenib': ['400mg', '800mg'],
    'Sunitinib': ['50mg', '37.5mg', '25mg'],
    'Lapatinib': ['1250mg', '1000mg'],
    
    // Immunotherapy
    'Pembrolizumab': ['200mg', '2mg/kg'],
    'Nivolumab': ['3mg/kg', '240mg', '480mg'],
    'Ipilimumab': ['3mg/kg', '10mg/kg'],
    'Atezolizumab': ['1200mg', '15mg/kg'],
    'Durvalumab': ['10mg/kg', '1500mg'],
    
    // Hormone therapy
    'Tamoxifen': ['20mg', '40mg'],
    'Anastrozole': ['1mg'],
    'Letrozole': ['2.5mg'],
    'Exemestane': ['25mg'],
    'Fulvestrant': ['500mg', '250mg'],
    'Leuprolide': ['7.5mg', '22.5mg', '30mg'],
    'Goserelin': ['3.6mg', '10.8mg'],
    
    // Supportive care
    'Ondansetron': ['8mg', '4mg', '24mg'],
    'Granisetron': ['1mg', '2mg'],
    'Palonosetron': ['0.25mg'],
    'Dexamethasone': ['8mg', '12mg', '4mg', '20mg'],
    'Prednisone': ['5mg', '10mg', '20mg', '40mg'],
    'Filgrastim': ['5mcg/kg', '300mcg', '480mcg'],
    'Pegfilgrastim': ['6mg'],
    'Allopurinol': ['300mg', '100mg'],
    'Proton Pump Inhibitor': ['20mg', '40mg'],
    'Lorazepam': ['0.5mg', '1mg', '2mg'],
    
    // Pain management
    'Morphine': ['5mg', '10mg', '15mg', '30mg', '60mg'],
    'Oxycodone': ['5mg', '10mg', '15mg', '20mg', '30mg'],
    'Fentanyl': ['12mcg/hr', '25mcg/hr', '50mcg/hr', '75mcg/hr', '100mcg/hr'],
    'Tramadol': ['50mg', '100mg'],
    'Hydromorphone': ['2mg', '4mg', '8mg'],
    
    // Newer agents
    'Osimertinib': ['80mg', '40mg'],
    'Alectinib': ['600mg', '300mg'],
    'Crizotinib': ['250mg', '200mg'],
    'Dabrafenib': ['150mg', '75mg'],
    'Trametinib': ['2mg', '1.5mg'],
    'Vemurafenib': ['960mg', '720mg'],
    'Ibrutinib': ['420mg', '280mg', '140mg'],
    'Venetoclax': ['400mg', '200mg', '100mg', '50mg', '20mg', '10mg']
  };

  const getDrugSuggestions = (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) return [];
    const term = searchTerm.toLowerCase();
    return Object.keys(drugDatabase)
      .filter(drug => drug.toLowerCase().includes(term))
      .sort((a, b) => {
        // Prioritize drugs that start with the search term
        const aStarts = a.toLowerCase().startsWith(term);
        const bStarts = b.toLowerCase().startsWith(term);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 10); // Limit to 10 suggestions
  };

  const getDosageOptions = (drugName: string) => {
    return drugDatabase[drugName] || ['Custom dosage'];
  };
  const canCreatePatients = true;
  
  const restoredPatientRef = useRef(false);

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

  const fetchPatients = async (opts?: { resetPage?: boolean; bustCache?: boolean }) => {
    setLoading(true);
    
    // In development without backend, use mock data
    if (window.location.hostname === 'localhost') {
      // Development mode: Using mock data
      const mockPatients = [
        {
          id: 'mock-patient-1',
          data: {
            demographics: {
              firstName: 'John',
              lastName: 'Doe',
              dateOfBirth: '1980-05-15',
              sex: 'male',
              mrn: 'MOCK-001',
              heightCm: 175,
              weightKg: 70
            },
            lastUpdated: new Date().toISOString()
          },
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'mock-patient-2',
          data: {
            demographics: {
              firstName: 'Jane',
              lastName: 'Smith',
              dateOfBirth: '1975-08-22',
              sex: 'female',
              mrn: 'MOCK-002',
              heightCm: 165,
              weightKg: 65
            },
            lastUpdated: new Date().toISOString()
          },
          lastUpdated: new Date().toISOString()
        }
      ];
      
      setPatients(mockPatients);
      setTotal(mockPatients.length);
      setLoading(false);
      setUsingDemoData(true);
      return;
    }
    
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
      const p = opts?.forcePage ?? (opts?.resetPage ? 1 : page);
      const q = opts?.forceQuery ?? query;
      const params = new URLSearchParams({ q, page: String(p), pageSize: String(PAGE_SIZE) });
      
      // Add filter parameters if set
      if (ageFilter) params.append('ageFilter', ageFilter);
      if (genderFilter) params.append('genderFilter', genderFilter);
      if (cancerTypeFilter) params.append('cancerTypeFilter', cancerTypeFilter);
      
      // Add cache-busting parameter if requested (e.g., after patient creation)
      if (opts?.bustCache) {
        params.append('_t', Date.now().toString());
        console.log('🔄 Added cache-busting parameter to force fresh data');
      }
      
      console.log('🔍 Fetching patients:', {
        url: `/api/patients?${params.toString()}`,
        hasToken: !!token,
        page: p,
        query: q,
        forced: { page: opts?.forcePage, query: opts?.forceQuery },
        environment: process.env.NODE_ENV,
        baseURL: window.location.origin
      });
      
      // Skip health check in development when backend is not running
      if (window.location.hostname !== 'localhost') {
        try {
          const testResp = await fetch('/api/health', { signal: AbortSignal.timeout(8000) });
          console.log('🏥 API health check:', {
            status: testResp.status,
            ok: testResp.ok,
            url: testResp.url
          });
        } catch (healthError) {
          console.warn('⚠️ API health check failed:', healthError?.message);
          // If health check fails, continue anyway - might be a temporary issue
        }
      }
      
      let resp: Response | null = null;
      try {
        resp = await fetch(`/api/patients?${params.toString()}`, { 
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: AbortSignal.timeout(15000) // Increased timeout to 15 seconds for production
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
          samplePatient: body.patients?.[0],
          bustCache: opts?.bustCache,
          forcedParams: { page: opts?.forcePage, query: opts?.forceQuery }
        });
        
        const newPatients = body.patients || [];
        const newTotal = body.total || 0;
        
        console.log('🔄 About to update state:', {
          currentPatientsCount: patients.length,
          currentTotal: total,
          newPatientsCount: newPatients.length,
          newTotal: newTotal,
          firstNewPatient: newPatients[0]?.demographics
        });
        
        setPatients(newPatients);
        setTotal(newTotal);
        
        console.log('✅ State update completed');
        setUsingDemoData(body.offline || false);
        setUsingDefaultUser(!!body.defaultUser);
        // Attempt to restore last-selected patient once per load
        try {
          if (!restoredPatientRef.current && Array.isArray(body.patients) && body.patients.length) {
            const lastId = localStorage.getItem('osrx_last_patient_id');
            if (lastId) {
              const hit = body.patients.find((x: any) => String(x.id) === String(lastId));
              if (hit) {
                actions.setCurrentPatient(hit.data || hit);
                restoredPatientRef.current = true;
                console.log('🔁 Restored last-selected patient from storage:', lastId);
              }
            }
          }
        } catch {}
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
    
    try {
      // Build minimal patient profile compatible with backend schema
      const demographics = {
        firstName: patientData.firstName || 'Unknown',
        lastName: patientData.lastName || 'Patient',
        dateOfBirth: patientData.dateOfBirth || '1980-01-01',
        sex: patientData.sex || 'unknown',
        mrn: patientData.mrn || `MRN${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.floor(Math.random() * 10000)}`,
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
      let success = false;
      try {
        const requestBody = JSON.stringify({ patient: newPatient });
        console.log('🏥 Request body:', requestBody);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const resp = await fetch('/api/patients', {
          method: 'POST',
          headers,
          body: requestBody,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
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
            try { localStorage.setItem('osrx_last_patient_id', String(serverPatient.id || '')); } catch {}
          }
          
          console.log('🏥 ✅ Showing success toast...');
          showToast('success', 'Patient created successfully');
          
          console.log('🏥 Refreshing patient list after delay...');
          // Brief delay to ensure database write completion
          await new Promise(resolve => setTimeout(resolve, 500));
          
          console.log('🏥 About to refresh patient list - looking for patient:', {
            createdPatientId: serverPatient?.id,
            updatedAt: serverPatient?.updated_at || 'unknown'
          });
          
          // Clear search and reset page state, then fetch with explicit parameters
          setQuery('');
          setPage(1);
          
          // Force refresh with clean state - fetch page 1 with no query
          const refreshResult = await fetchPatients({ 
            resetPage: true, 
            bustCache: true,
            forceQuery: '', // Force empty query
            forcePage: 1    // Force page 1
          });
          
          console.log('🏥 ✅ Patient list refreshed - verifying patient appears in response...');
          
          // Wait a moment for state to update, then verify
          await new Promise(resolve => setTimeout(resolve, 100));
          console.log('🏥 Post-refresh state verification:', {
            totalPatients: total,
            patientsInList: patients.length,
            createdPatientInList: patients.some(p => p.id === serverPatient?.id),
            firstPatientInList: patients[0]?.demographics
          });
          
          // Check if the newly created patient appears in the refreshed data
          // Note: We can't reliably check the 'patients' state immediately due to React's async state updates
          console.log('🏥 Refresh completed. Patient creation process finished.', {
            createdPatientId: serverPatient?.id,
            refreshTriggered: true,
            note: 'State updates are async - patient should appear in UI momentarily'
          });
          success = true;
        } else {
          const errorText = await resp.text().catch(() => 'Unknown error');
          console.log('🏥 ❌ API Error response:', errorText);
          
          // Handle specific error types
          if (resp.status === 409) {
            console.log('🏥 MRN conflict detected, retrying with new MRN...');
            // Generate a new MRN and retry once
            const newMrn = `MRN${Date.now()}-${Math.random().toString(36).substr(2, 12)}-${Math.floor(Math.random() * 100000)}`;
            console.log('🏥 Retrying with new MRN:', newMrn);
            
            const retryPatient = { ...newPatient };
            retryPatient.demographics.mrn = newMrn;
            
            try {
              const retryBody = JSON.stringify({ patient: retryPatient });
              const retryResp = await fetch('/api/patients', {
                method: 'POST',
                headers,
                body: retryBody,
                signal: controller.signal
              });
              
              if (retryResp.ok) {
                const retryResult = await retryResp.json().catch(() => ({}));
                console.log('🏥 ✅ Retry successful:', retryResult);
                
                const serverPatient = retryResult?.patient ? (retryResult.patient.data || retryResult.patient) : null;
                if (serverPatient) {
                  actions.setCurrentPatient(serverPatient);
                  try { localStorage.setItem('osrx_last_patient_id', String(serverPatient.id || '')); } catch {}
                }
                
                showToast('success', 'Patient created successfully (retry)');
                // Brief delay to ensure database write completion
                await new Promise(resolve => setTimeout(resolve, 500));
                
                console.log('🏥 About to refresh patient list after retry - looking for patient:', {
                  createdPatientId: serverPatient?.id,
                  updatedAt: serverPatient?.updated_at || 'unknown'
                });
                
                // Clear search and reset page state, then fetch with explicit parameters
                setQuery('');
                setPage(1);
                
                // Force refresh with clean state - fetch page 1 with no query
                const refreshResult = await fetchPatients({ 
                  resetPage: true, 
                  bustCache: true,
                  forceQuery: '', // Force empty query
                  forcePage: 1    // Force page 1
                });
                
                console.log('🏥 ✅ Patient list refreshed after retry - process completed...');
                
                // Note: We can't reliably check the 'patients' state immediately due to React's async state updates
                console.log('🏥 Retry refresh completed. Patient creation process finished.', {
                  createdPatientId: serverPatient?.id,
                  refreshTriggered: true,
                  note: 'State updates are async - patient should appear in UI momentarily'
                });
                success = true;
              } else {
                showToast('error', `Create failed after retry: ${retryResp.status}`);
              }
            } catch (retryError) {
              console.log('🏥 Retry failed:', retryError);
              showToast('error', 'MRN conflict - please try again');
            }
          } else {
            showToast('error', `Create failed: ${resp.status} ${errorText}`);
          }
          
          if (!success) {
            try { 
              console.log('🏥 Attempting sync from server...');
              await actions.syncFromServer(); 
            } catch (syncError) {
              console.log('🏥 Sync error:', syncError);
            }
          }
        }
      } catch (networkError) {
        console.log('🏥 ❌ Network error:', networkError);
        showToast('warning', 'Saved locally (network error)');
      }
      
      if (success) {
        console.log('🏥 Closing create form (success)...');
        setShowCreateForm(false);
      } else {
        console.log('🏥 Keeping create form open due to error');
      }
      
    } catch (globalError) {
      console.log('🏥 ❌ Global error in createNewPatient:', globalError);
      showToast('error', 'Failed to create patient');
    }
  };

  useEffect(() => { 
    fetchPatients(); 
    /* eslint-disable-next-line */ 
  }, [page]);

  const selectAndClose = (p: any) => {
    const data = p.data || p;
    actions.setCurrentPatient({ ...data, id: p.id || data.id });
    try { localStorage.setItem('osrx_last_patient_id', String(p.id || data.id)); } catch {}
  };

  const openEdit = (p: any) => {
    const d = p.data?.demographics || p.demographics || {};
    const fullData = p.data || p;
    setEditing({
      id: p.id,
      firstName: d.firstName || '',
      lastName: d.lastName || '',
      mrn: d.mrn || '',
      dateOfBirth: d.dateOfBirth || '',
      sex: d.sex || 'unknown',
      medications: fullData.medications || [],
      conditions: fullData.conditions || [],
      allergies: fullData.allergies || [],
      labValues: fullData.labValues || [],
      original: p,
    });
    setEditTab('demo');
    setSaveError(null);
  };

  // Duplicate renderDetailsModal removed (kept single definition below)

  // Simple patient details modal renderer with tabs
  const renderDetailsModal = () => {
    if (!detailPatient) return null;
    const d = detailPatient.data?.demographics || detailPatient.demographics || {};
    const name = `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Unnamed Patient';
    const mrn = d.mrn || '—';
    const dob = d.dateOfBirth ? new Date(d.dateOfBirth).toLocaleDateString() : '—';
    const meds = (detailPatient.data?.medications || detailPatient.medications || []) as any[];
    const conds = (detailPatient.data?.conditions || detailPatient.conditions || []) as any[];
    const labs = (detailPatient.data?.labValues || detailPatient.labValues || []) as any[];
    return (
      <Modal isOpen={!!detailPatient} onClose={() => setDetailPatient(null)} title="Patient Details" size="xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-gray-900">{name}</div>
              <div className="text-sm text-gray-600">MRN: {mrn} • DOB: {dob}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { selectAndClose(detailPatient); setDetailPatient(null); }} className="px-3 py-2 text-sm bg-blue-600 text-white rounded">Select</button>
              <button onClick={() => { openEdit(detailPatient); setDetailPatient(null); }} className="px-3 py-2 text-sm bg-white border rounded">Edit</button>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
              {[
                { id: 'demo', label: 'Demographics' },
                { id: 'meds', label: 'Medications' },
                { id: 'cond', label: 'Conditions' },
                { id: 'labs', label: 'Labs' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setDetailsTab(t.id as any)}
                  className={`whitespace-nowrap py-2 px-3 border-b-2 text-sm font-medium ${detailsTab === (t.id as any) ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>

          <Card>
            <div className="text-sm text-gray-800">
              {detailsTab === 'demo' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-500 text-xs">First Name</div>
                    <div className="font-medium">{d.firstName || '—'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Last Name</div>
                    <div className="font-medium">{d.lastName || '—'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Sex</div>
                    <div className="font-medium capitalize">{d.sex || '—'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Height (cm)</div>
                    <div className="font-medium">{d.heightCm ?? '—'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Weight (kg)</div>
                    <div className="font-medium">{d.weightKg ?? '—'}</div>
                  </div>
                </div>
              )}
              {detailsTab === 'meds' && (
                <div className="space-y-2">
                  {meds.length === 0 && <div className="text-gray-500 text-sm">No medications</div>}
                  {meds.map((m: any, i: number) => {
                    const dn = m?.drug?.name || m?.drugName || m?.name || 'Unknown';
                    return (
                      <div key={i} className="flex items-center justify-between border rounded px-3 py-2">
                        <div>
                          <div className="font-medium">{dn}</div>
                          <div className="text-xs text-gray-500">{m?.dosage || m?.dose || '—'} • {m?.frequency || '—'} • {m?.route || '—'}</div>
                        </div>
                        <div className={`text-xs px-2 py-0.5 rounded ${m?.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{m?.isActive ? 'Active' : 'Inactive'}</div>
                      </div>
                    );
                  })}
                </div>
              )}
              {detailsTab === 'cond' && (
                <div className="space-y-2">
                  {conds.length === 0 && <div className="text-gray-500 text-sm">No conditions</div>}
                  {conds.map((c: any, i: number) => (
                    <div key={i} className="border rounded px-3 py-2">
                      <div className="font-medium">{c?.name || c?.condition || 'Unknown condition'}</div>
                      <div className="text-xs text-gray-500">Status: {c?.status || '—'} {c?.icd10Code ? `• ICD-10: ${c.icd10Code}` : ''} {c?.stage ? `• Stage: ${c.stage}` : ''}</div>
                    </div>
                  ))}
                </div>
              )}
              {detailsTab === 'labs' && (
                <div className="space-y-2">
                  {labs.length === 0 && <div className="text-gray-500 text-sm">No lab values</div>}
                  {labs.map((l: any, i: number) => (
                    <div key={i} className="border rounded px-3 py-2 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{l?.labType || 'Lab'}</div>
                        <div className="text-xs text-gray-500">{l?.timestamp ? new Date(l.timestamp).toLocaleString() : '—'}</div>
                      </div>
                      <div className="text-sm">{l?.value ?? '—'} {l?.unit || ''}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </Modal>
    );
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
        medications: editing.medications || [],
        conditions: editing.conditions || [],
        allergies: editing.allergies || [],
        labValues: editing.labValues || [],
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
        {/* Always show create button in production */}
        <button
          id="create-patient-btn-all"
          onClick={() => setShowCreateForm(true)}
          className="px-3 py-2 bg-green-600 text-white rounded text-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Create Patient
        </button>
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
        <div className="space-y-4 mb-4">
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or MRN"
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <button onClick={() => fetchPatients({ resetPage: true })} className="px-3 py-2 bg-blue-600 text-white rounded text-sm">Search</button>
            <button onClick={() => { setQuery(''); fetchPatients({ resetPage: true }); }} className="px-3 py-2 bg-white border rounded text-sm">Clear</button>
            <button onClick={() => setShowFilters(!showFilters)} className={`px-3 py-2 border rounded text-sm flex items-center gap-1 ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300'}`}>
              <Filter className="w-4 h-4" /> Filters
            </button>
            <button onClick={() => fetchPatients()} className="px-3 py-2 bg-white border rounded text-sm flex items-center gap-1">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button onClick={() => setShowCreateForm(true)} className="px-3 py-2 bg-green-600 text-white rounded text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> Create Patient
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Filter Patients</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Age Range</label>
                  <select
                    value={ageFilter}
                    onChange={(e) => setAgeFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="">All Ages</option>
                    <option value="0-18">0-18 years</option>
                    <option value="19-39">19-39 years</option>
                    <option value="40-59">40-59 years</option>
                    <option value="60-79">60-79 years</option>
                    <option value="80+">80+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Unknown">Unknown/Not Specified</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cancer Type</label>
                  <select
                    value={cancerTypeFilter}
                    onChange={(e) => setCancerTypeFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="">All Cancer Types</option>
                    <option value="Breast">Breast Cancer</option>
                    <option value="Lung">Lung Cancer</option>
                    <option value="Colon">Colorectal Cancer</option>
                    <option value="Prostate">Prostate Cancer</option>
                    <option value="Lymphoma">Lymphoma</option>
                    <option value="Leukemia">Leukemia</option>
                    <option value="Pancreatic">Pancreatic Cancer</option>
                    <option value="Ovarian">Ovarian Cancer</option>
                    <option value="Brain">Brain Tumor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-gray-600">
                  {(ageFilter || genderFilter || cancerTypeFilter) && (
                    <span>Active filters: {[ageFilter && 'Age', genderFilter && 'Gender', cancerTypeFilter && 'Cancer Type'].filter(Boolean).join(', ')}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAgeFilter('');
                      setGenderFilter('');
                      setCancerTypeFilter('');
                      fetchPatients({ resetPage: true });
                    }}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => fetchPatients({ resetPage: true })}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current selection summary */}
        <div className="mb-3 text-sm text-gray-700 flex items-center gap-3">
          <span className="font-medium">Current selection:</span>
          <span className="px-2 py-1 rounded bg-gray-100">
            { patientState?.currentPatient
              ? `${patientState.currentPatient.demographics?.firstName || ''} ${patientState.currentPatient.demographics?.lastName || ''}`.trim() || 'Selected'
              : 'None' }
          </span>
          {patientState?.currentPatient && (
            <button
              onClick={() => { actions.setCurrentPatient(null as any); try { localStorage.removeItem('osrx_last_patient_id'); localStorage.removeItem('osrx_last_patient'); } catch {} }}
              className="px-2 py-1 border rounded text-xs bg-white"
            >
              Clear
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
                    <td className="px-4 py-2 text-sm text-gray-900 cursor-pointer" onClick={() => setDetailPatient(p)}>{name || '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 cursor-pointer" onClick={() => setDetailPatient(p)}>{mrn || '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 cursor-pointer" onClick={() => setDetailPatient(p)}>{dob || '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600 cursor-pointer" onClick={() => setDetailPatient(p)}>{updated || '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      <button onClick={() => selectAndClose(p)} className="inline-flex items-center px-2 py-1 mr-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                        Select
                      </button>
                      <button onClick={() => openEdit(p)} className="inline-flex items-center px-2 py-1 mr-2 bg-white border rounded text-xs hover:bg-gray-50">
                        <Edit className="w-4 h-4 mr-1"/> Edit
                      </button>
                      <button 
                        onClick={() => handleDeletePatient(p)} 
                        disabled={deletingPatient === p.id}
                        className="inline-flex items-center px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:bg-red-400"
                        title="Delete this patient (only if you created it)"
                      >
                        {deletingPatient === p.id ? (
                          <span className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full"></span>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
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
        <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Patient" size="xl">
          <div className="space-y-4">
            {saveError && <div className="mb-3 text-sm text-red-700">{saveError}</div>}
            
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                {[
                  { id: 'demo', label: 'Demographics' },
                  { id: 'meds', label: 'Medications' },
                  { id: 'cond', label: 'Conditions' },
                  { id: 'allergies', label: 'Allergies' },
                  { id: 'labs', label: 'Labs' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setEditTab(t.id as any)}
                    className={`whitespace-nowrap py-2 px-3 border-b-2 text-sm font-medium ${editTab === (t.id as any) ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </nav>
            </div>

            <Card>
              <div className="space-y-4">
                {editTab === 'demo' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                )}
                
                {editTab === 'meds' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">Medications</h3>
                      <button 
                        onClick={() => {
                          const newMed = { drugName: '', dosage: '', frequency: '', route: '', isActive: true };
                          setEditing({ ...editing, medications: [...(editing.medications || []), newMed] });
                        }}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Add Medication
                      </button>
                    </div>
                    {(editing.medications || []).map((med: any, i: number) => (
                      <div key={i} className="border rounded p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Medication {i + 1}</h4>
                          <button 
                            onClick={() => {
                              const newMeds = [...(editing.medications || [])];
                              newMeds.splice(i, 1);
                              setEditing({ ...editing, medications: newMeds });
                            }}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <label className="block text-xs text-gray-600 mb-1">Drug Name</label>
                            <input 
                              value={med.drugName || med.drug?.name || med.name || ''} 
                              onChange={(e) => {
                                const value = e.target.value;
                                const newMeds = [...(editing.medications || [])];
                                newMeds[i] = { ...newMeds[i], drugName: value };
                                setEditing({ ...editing, medications: newMeds });
                                
                                // Update suggestions and show/hide dropdown
                                const suggestions = getDrugSuggestions(value);
                                setDrugSuggestions(suggestions);
                                setShowDrugSuggestions({ 
                                  ...showDrugSuggestions, 
                                  [`med-${i}`]: suggestions.length > 0 && value.length >= 2 
                                });
                              }}
                              onFocus={(e) => {
                                const value = e.target.value;
                                const suggestions = getDrugSuggestions(value);
                                setDrugSuggestions(suggestions);
                                setShowDrugSuggestions({ 
                                  ...showDrugSuggestions, 
                                  [`med-${i}`]: suggestions.length > 0 && value.length >= 2 
                                });
                              }}
                              onBlur={() => {
                                // Delay hiding to allow clicking on suggestions
                                setTimeout(() => {
                                  setShowDrugSuggestions({ 
                                    ...showDrugSuggestions, 
                                    [`med-${i}`]: false 
                                  });
                                }, 150);
                              }}
                              className="w-full border rounded px-2 py-1 text-xs"
                              placeholder="Enter drug name"
                            />
                            {showDrugSuggestions[`med-${i}`] && drugSuggestions.length > 0 && (
                              <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                                {drugSuggestions.map((drug, suggestionIndex) => (
                                  <div
                                    key={suggestionIndex}
                                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-xs border-b border-gray-100 last:border-b-0"
                                    onMouseDown={(e) => {
                                      e.preventDefault(); // Prevent blur from firing
                                      const newMeds = [...(editing.medications || [])];
                                      newMeds[i] = { ...newMeds[i], drugName: drug, dosage: '' }; // Clear dosage when drug changes
                                      setEditing({ ...editing, medications: newMeds });
                                      setShowDrugSuggestions({ 
                                        ...showDrugSuggestions, 
                                        [`med-${i}`]: false 
                                      });
                                    }}
                                  >
                                    {drug}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Dosage</label>
                            {(() => {
                              const drugName = med.drugName || med.drug?.name || med.name || '';
                              const dosageOptions = getDosageOptions(drugName);
                              const currentDosage = med.dosage || med.dose || '';
                              const hasCustomDosage = currentDosage && !dosageOptions.includes(currentDosage);
                              
                              return (
                                <select 
                                  value={hasCustomDosage ? 'custom' : currentDosage} 
                                  onChange={(e) => {
                                    const newMeds = [...(editing.medications || [])];
                                    if (e.target.value === 'custom') {
                                      // Keep current value if switching to custom
                                      newMeds[i] = { ...newMeds[i], dosage: currentDosage || '', isCustomDosage: true };
                                    } else {
                                      newMeds[i] = { ...newMeds[i], dosage: e.target.value, isCustomDosage: false };
                                    }
                                    setEditing({ ...editing, medications: newMeds });
                                  }}
                                  className="w-full border rounded px-2 py-1 text-xs"
                                >
                                  <option value="">Select dosage</option>
                                  {dosageOptions.map((dosage, dosageIndex) => (
                                    <option key={dosageIndex} value={dosage}>
                                      {dosage}
                                    </option>
                                  ))}
                                  {hasCustomDosage && (
                                    <option value="custom">Custom: {currentDosage}</option>
                                  )}
                                  <option value="custom">Custom dosage...</option>
                                </select>
                              );
                            })()}
                            {(() => {
                              const currentDosage = med.dosage || med.dose || '';
                              const drugName = med.drugName || med.drug?.name || med.name || '';
                              const dosageOptions = getDosageOptions(drugName);
                              const isCustomSelected = med.isCustomDosage || (currentDosage && !dosageOptions.includes(currentDosage));
                              
                              return isCustomSelected && (
                                <input 
                                  value={currentDosage} 
                                  onChange={(e) => {
                                    const newMeds = [...(editing.medications || [])];
                                    newMeds[i] = { ...newMeds[i], dosage: e.target.value, isCustomDosage: true };
                                    setEditing({ ...editing, medications: newMeds });
                                  }}
                                  className="w-full border rounded px-2 py-1 text-xs mt-1"
                                  placeholder="Enter custom dosage (e.g., 10mg, 5mg/kg)"
                                />
                              );
                            })()}
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Frequency</label>
                            <input 
                              value={med.frequency || ''} 
                              onChange={(e) => {
                                const newMeds = [...(editing.medications || [])];
                                newMeds[i] = { ...newMeds[i], frequency: e.target.value };
                                setEditing({ ...editing, medications: newMeds });
                              }}
                              className="w-full border rounded px-2 py-1 text-xs"
                              placeholder="e.g., twice daily"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Route</label>
                            <select 
                              value={med.route || ''} 
                              onChange={(e) => {
                                const newMeds = [...(editing.medications || [])];
                                newMeds[i] = { ...newMeds[i], route: e.target.value };
                                setEditing({ ...editing, medications: newMeds });
                              }}
                              className="w-full border rounded px-2 py-1 text-xs"
                            >
                              <option value="">Select route</option>
                              <option value="oral">Oral</option>
                              <option value="IV">IV</option>
                              <option value="IM">IM</option>
                              <option value="topical">Topical</option>
                              <option value="inhalation">Inhalation</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            checked={med.isActive !== false} 
                            onChange={(e) => {
                              const newMeds = [...(editing.medications || [])];
                              newMeds[i] = { ...newMeds[i], isActive: e.target.checked };
                              setEditing({ ...editing, medications: newMeds });
                            }}
                            className="mr-2"
                          />
                          <label className="text-xs text-gray-600">Active medication</label>
                        </div>
                      </div>
                    ))}
                    {(editing.medications || []).length === 0 && (
                      <div className="text-sm text-gray-500 text-center py-4">No medications added</div>
                    )}
                  </div>
                )}
                
                {editTab === 'cond' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">Medical Conditions</h3>
                      <button 
                        onClick={() => {
                          const newCond = { name: '', status: '', icd10Code: '', stage: '' };
                          setEditing({ ...editing, conditions: [...(editing.conditions || []), newCond] });
                        }}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Add Condition
                      </button>
                    </div>
                    {(editing.conditions || []).map((cond: any, i: number) => (
                      <div key={i} className="border rounded p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Condition {i + 1}</h4>
                          <button 
                            onClick={() => {
                              const newConds = [...(editing.conditions || [])];
                              newConds.splice(i, 1);
                              setEditing({ ...editing, conditions: newConds });
                            }}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Condition Name</label>
                            <input 
                              value={cond.name || cond.condition || ''} 
                              onChange={(e) => {
                                const newConds = [...(editing.conditions || [])];
                                newConds[i] = { ...newConds[i], name: e.target.value };
                                setEditing({ ...editing, conditions: newConds });
                              }}
                              className="w-full border rounded px-2 py-1 text-xs"
                              placeholder="Enter condition"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Status</label>
                            <select 
                              value={cond.status || ''} 
                              onChange={(e) => {
                                const newConds = [...(editing.conditions || [])];
                                newConds[i] = { ...newConds[i], status: e.target.value };
                                setEditing({ ...editing, conditions: newConds });
                              }}
                              className="w-full border rounded px-2 py-1 text-xs"
                            >
                              <option value="">Select status</option>
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="resolved">Resolved</option>
                              <option value="chronic">Chronic</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">ICD-10 Code</label>
                            <input 
                              value={cond.icd10Code || ''} 
                              onChange={(e) => {
                                const newConds = [...(editing.conditions || [])];
                                newConds[i] = { ...newConds[i], icd10Code: e.target.value };
                                setEditing({ ...editing, conditions: newConds });
                              }}
                              className="w-full border rounded px-2 py-1 text-xs"
                              placeholder="e.g., Z51.11"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Stage</label>
                            <input 
                              value={cond.stage || ''} 
                              onChange={(e) => {
                                const newConds = [...(editing.conditions || [])];
                                newConds[i] = { ...newConds[i], stage: e.target.value };
                                setEditing({ ...editing, conditions: newConds });
                              }}
                              className="w-full border rounded px-2 py-1 text-xs"
                              placeholder="e.g., Stage II"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {(editing.conditions || []).length === 0 && (
                      <div className="text-sm text-gray-500 text-center py-4">No conditions added</div>
                    )}
                  </div>
                )}
                
                {editTab === 'allergies' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">Allergies</h3>
                      <button 
                        onClick={() => {
                          const newAllergy = { allergen: '', reaction: '', severity: '' };
                          setEditing({ ...editing, allergies: [...(editing.allergies || []), newAllergy] });
                        }}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Add Allergy
                      </button>
                    </div>
                    {(editing.allergies || []).map((allergy: any, i: number) => (
                      <div key={i} className="border rounded p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Allergy {i + 1}</h4>
                          <button 
                            onClick={() => {
                              const newAllergies = [...(editing.allergies || [])];
                              newAllergies.splice(i, 1);
                              setEditing({ ...editing, allergies: newAllergies });
                            }}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Allergen</label>
                            <input 
                              value={allergy.allergen || allergy.name || ''} 
                              onChange={(e) => {
                                const newAllergies = [...(editing.allergies || [])];
                                newAllergies[i] = { ...newAllergies[i], allergen: e.target.value };
                                setEditing({ ...editing, allergies: newAllergies });
                              }}
                              className="w-full border rounded px-2 py-1 text-xs"
                              placeholder="Enter allergen"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Reaction</label>
                              <input 
                                value={allergy.reaction || ''} 
                                onChange={(e) => {
                                  const newAllergies = [...(editing.allergies || [])];
                                  newAllergies[i] = { ...newAllergies[i], reaction: e.target.value };
                                  setEditing({ ...editing, allergies: newAllergies });
                                }}
                                className="w-full border rounded px-2 py-1 text-xs"
                                placeholder="e.g., rash, swelling"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Severity</label>
                              <select 
                                value={allergy.severity || ''} 
                                onChange={(e) => {
                                  const newAllergies = [...(editing.allergies || [])];
                                  newAllergies[i] = { ...newAllergies[i], severity: e.target.value };
                                  setEditing({ ...editing, allergies: newAllergies });
                                }}
                                className="w-full border rounded px-2 py-1 text-xs"
                              >
                                <option value="">Select severity</option>
                                <option value="mild">Mild</option>
                                <option value="moderate">Moderate</option>
                                <option value="severe">Severe</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(editing.allergies || []).length === 0 && (
                      <div className="text-sm text-gray-500 text-center py-4">No allergies added</div>
                    )}
                  </div>
                )}
                
                {editTab === 'labs' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">Lab Values</h3>
                      <button 
                        onClick={() => {
                          const newLab = { labType: '', value: '', unit: '', timestamp: new Date().toISOString().split('T')[0] };
                          setEditing({ ...editing, labValues: [...(editing.labValues || []), newLab] });
                        }}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Add Lab Value
                      </button>
                    </div>
                    {(editing.labValues || []).map((lab: any, i: number) => (
                      <div key={i} className="border rounded p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Lab Value {i + 1}</h4>
                          <button 
                            onClick={() => {
                              const newLabs = [...(editing.labValues || [])];
                              newLabs.splice(i, 1);
                              setEditing({ ...editing, labValues: newLabs });
                            }}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Lab Type</label>
                            <input 
                              value={lab.labType || ''} 
                              onChange={(e) => {
                                const newLabs = [...(editing.labValues || [])];
                                newLabs[i] = { ...newLabs[i], labType: e.target.value };
                                setEditing({ ...editing, labValues: newLabs });
                              }}
                              className="w-full border rounded px-2 py-1 text-xs"
                              placeholder="e.g., CBC, Glucose"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Date</label>
                            <input 
                              type="date"
                              value={lab.timestamp ? lab.timestamp.split('T')[0] : ''} 
                              onChange={(e) => {
                                const newLabs = [...(editing.labValues || [])];
                                newLabs[i] = { ...newLabs[i], timestamp: e.target.value + 'T00:00:00Z' };
                                setEditing({ ...editing, labValues: newLabs });
                              }}
                              className="w-full border rounded px-2 py-1 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Value</label>
                            <input 
                              value={lab.value || ''} 
                              onChange={(e) => {
                                const newLabs = [...(editing.labValues || [])];
                                newLabs[i] = { ...newLabs[i], value: e.target.value };
                                setEditing({ ...editing, labValues: newLabs });
                              }}
                              className="w-full border rounded px-2 py-1 text-xs"
                              placeholder="Enter value"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Unit</label>
                            <input 
                              value={lab.unit || ''} 
                              onChange={(e) => {
                                const newLabs = [...(editing.labValues || [])];
                                newLabs[i] = { ...newLabs[i], unit: e.target.value };
                                setEditing({ ...editing, labValues: newLabs });
                              }}
                              className="w-full border rounded px-2 py-1 text-xs"
                              placeholder="e.g., mg/dL, %"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {(editing.labValues || []).length === 0 && (
                      <div className="text-sm text-gray-500 text-center py-4">No lab values added</div>
                    )}
                  </div>
                )}
              </div>
            </Card>
            
            <div className="flex items-center justify-end gap-2 pt-4">
              <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-sm bg-white border rounded">Cancel</button>
              <button onClick={saveEdit} disabled={saving} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </Modal>
      )}

      {showCreateForm && (
        <Modal isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} title="Create Patient" size="xl">
          <ComprehensivePatientForm
            onSubmit={createNewPatient}
            onCancel={() => setShowCreateForm(false)}
          />
        </Modal>
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
      {renderDetailsModal()}
    </div>
  );
};

export default ServerPatients;
