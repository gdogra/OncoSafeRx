import axios from 'axios';

// Static API URL calculation to prevent repeated calls
const getApiUrl = () => {
  // Runtime-provided base from backend config (if index.tsx fetched it)
  try {
    const runtime = (window as any).__OSRX_API_BASE__;
    if (runtime && typeof runtime === 'string' && runtime.trim()) return runtime;
  } catch {}
  // For development, always use localhost:3000 API
  if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    return 'http://localhost:3000/api';
  }
  
  // In production, ALWAYS use relative /api path to leverage Netlify proxy
  // This overrides any environment variables to ensure proxy usage
  if (typeof window !== 'undefined' && 
      (window.location?.hostname === 'oncosaferx.com' || 
       window.location?.hostname === 'www.oncosaferx.com' ||
       window.location?.hostname.includes('netlify.app'))) {
    return '/api';
  }
  
  // FORCE relative /api for any non-localhost to prevent CORS issues
  if (typeof window !== 'undefined' && window.location?.hostname !== 'localhost') {
    return '/api';
  }
  
  // Fallback to environment variables ONLY for localhost development
  const vite = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
  // @ts-ignore
  const cra = typeof process !== 'undefined' ? (process as any)?.env?.REACT_APP_API_URL as string | undefined : undefined;
  
  if (vite?.trim()) {
    return vite;
  }
  if (cra?.trim()) {
    return cra;
  }
  
  // Final fallback
  return '/api';
};

const API_BASE_URL = getApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000, // Increased to 20 seconds for production stability
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Drug services
export const drugService = {
  searchDrugs: async (query: string) => {
    try {
      const response = await api.get(`/drugs/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error: any) {
      // Handle 502 Bad Gateway errors from Netlify proxy
      if (error.response?.status === 502) {
        console.warn(`502 Bad Gateway for search query: ${query}, API temporarily unavailable`);
        return { results: [], message: 'Drug search service is temporarily experiencing connectivity issues' };
      }
      if (error.response?.status === 404) {
        console.warn(`Drug search API not available for query: ${query}`);
        return { results: [], message: 'Drug search service is currently unavailable' };
      }
      throw error;
    }
  },

  getDrugDetails: async (rxcui: string) => {
    try {
      const response = await api.get(`/drugs/${rxcui}`);
      return response.data;
    } catch (error: any) {
      // Handle 502 Bad Gateway errors from Netlify proxy
      if (error.response?.status === 502) {
        console.warn(`502 Bad Gateway for drug details: ${rxcui}, API temporarily unavailable`);
        return { error: 'Drug details service is temporarily experiencing connectivity issues' };
      }
      if (error.response?.status === 404) {
        console.warn(`Drug details API not available for rxcui: ${rxcui}`);
        return { error: 'Drug details service is currently unavailable' };
      }
      throw error;
    }
  },

  getDrugInteractions: async (rxcui: string) => {
    try {
      // Use the known interactions endpoint to get interactions for this specific drug
      const response = await api.get(`/interactions/known?drug=${encodeURIComponent(rxcui)}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(`Drug interactions API not available for rxcui: ${rxcui}`);
        return { interactions: [], message: 'Drug interactions service is currently unavailable' };
      }
      throw error;
    }
  },

  searchLabels: async (query: string) => {
    try {
      const response = await api.get(`/drugs/labels/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(`Drug labels search API not available for query: ${query}`);
        return { results: [], message: 'Drug labels service is currently unavailable' };
      }
      throw error;
    }
  },

  getLabelDetails: async (setId: string) => {
    try {
      const response = await api.get(`/drugs/labels/${setId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(`Drug label details API not available for setId: ${setId}`);
        return { error: 'Drug label details service is currently unavailable' };
      }
      throw error;
    }
  }
};

// Interaction services
export const interactionService = {
  getKnownInteractions: async (params: Record<string, string | number | boolean> = {}) => {
    try {
      const search = new URLSearchParams();
      for (const [k,v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') search.append(k, String(v));
      }
      const response = await api.get(`/interactions/known?${search.toString()}`);
      return response.data;
    } catch (error: any) {
      console.warn('Known interactions API not available, using fallback data');
      
      // Import fallback data dynamically to avoid build issues
      const { FALLBACK_INTERACTIONS } = await import('../data/fallbackInteractions');
      
      // Apply filtering logic similar to backend
      let results = FALLBACK_INTERACTIONS;
      const { drug, drugA, drugB, severity } = params;
      
      // Filter by single drug name (matches either in the pair, case-insensitive, substring)
      if (drug && typeof drug === 'string') {
        const term = drug.toLowerCase();
        results = results.filter(k => k.drugs.some(d => d.toLowerCase().includes(term)));
      }
      
      // Filter by two drug names (order-insensitive, both must match)
      if (drugA && drugB && typeof drugA === 'string' && typeof drugB === 'string') {
        const a = drugA.toLowerCase();
        const b = drugB.toLowerCase();
        results = results.filter(k => {
          const names = k.drugs.map(d => d.toLowerCase());
          return (names.some(n => n.includes(a)) && names.some(n => n.includes(b)));
        });
      }
      
      // Filter by severity (exact match, case-insensitive)
      if (severity && typeof severity === 'string') {
        const sev = severity.toLowerCase();
        results = results.filter(k => (k.severity || '').toLowerCase() === sev);
      }
      
      // Add drug_rxnorm mapping for compatibility
      const enriched = results.map(k => ({
        ...k,
        drug_rxnorm: k.drugs.map(name => ({ name, rxcui: null }))
      }));
      
      return {
        count: enriched.length,
        total: enriched.length,
        interactions: enriched,
        message: 'Using cached interaction data (API unavailable)'
      };
    }
  },

  checkInteractions: async (drugs: { rxcui: string; name: string }[]) => {
    try {
      // Backend expects an array of RXCUI strings
      const rxcuis = (drugs || []).map(d => String(d.rxcui)).filter(Boolean);
      
      // Fast-path: if we know no endpoints work in this environment, return curated fallback immediately
      if (interactionsRouteState === 'none') {
        return await interactionService.getKnownInteractions({});
      }

      const tryPost = async (fullUrl: string, viaFetch = false) => {
        try {
          if (viaFetch) {
            const resp = await fetch(fullUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ drugs: rxcuis }) });
            if (!resp.ok) return null;
            const data = await resp.json();
            return { data } as any;
          }
          const res = await api.post(fullUrl, { drugs: rxcuis });
          return res as any;
        } catch {
          return null;
        }
      };

      // Try proxy primary
      let response: any = await tryPost('/interactions/check');
      if (response) interactionsRouteState = 'primary';
      // Try proxy enhanced
      if (!response) {
        response = await tryPost('/interactions/enhanced/check');
        if (response) interactionsRouteState = 'enhanced';
      }
      // Try absolute backend
      if (!response) {
        const backend = ((import.meta as any)?.env?.VITE_BACKEND_URL as string | undefined) || 'https://oncosaferx-backend.onrender.com';
        const absUrl = `${backend.replace(/\/$/, '')}/api/interactions/check`;
        response = await tryPost(absUrl, true);
        if (response) interactionsRouteState = 'absolute';
      }
      // If still no response, cache 'none' and return curated fallback
      if (!response) {
        interactionsRouteState = 'none';
        return await interactionService.getKnownInteractions({});
      }
      // Normalize severities for consistent UI grouping
      const data = response.data || { interactions: { stored: [], external: [] } };
      const normalize = (s?: string) => {
        const v = String(s || '').toLowerCase();
        if (v === 'high') return 'major';
        if (v === 'low') return 'minor';
        return v || 'unknown';
      };
      if (data?.interactions) {
        data.interactions.stored = (data.interactions.stored || []).map((i: any) => ({ ...i, severity: normalize(i.severity) }));
        data.interactions.external = (data.interactions.external || []).map((i: any) => ({ ...i, severity: normalize(i.severity) }));
      }
      return data;
    } catch (error: any) {
      // Quietly fallback on 404/400/502
      if (error.response?.status === 404 || error.response?.status === 400 || error.response?.status === 502) {
        // Fallback to curated known interactions by drug name pairs
        try {
          const pairs: Array<{ a: string; b: string }> = [];
          for (let i = 0; i < drugs.length; i++) {
            for (let j = i + 1; j < drugs.length; j++) {
              const a = drugs[i].name;
              const b = drugs[j].name;
              if (a && b) pairs.push({ a, b });
            }
          }
          const collected: any[] = [];
          for (const p of pairs) {
            const sp = new URLSearchParams();
            sp.append('drugA', p.a);
            sp.append('drugB', p.b);
            sp.append('resolveRx', 'true');
            const knownResp = await api.get(`/interactions/known?${sp.toString()}`);
            const known = knownResp.data;
            if (Array.isArray(known?.interactions) && known.interactions.length > 0) {
              collected.push(
                ...known.interactions.map((it: any) => ({
                  ...it,
                  severity: (it.severity || '').toLowerCase() === 'high' ? 'major' : (it.severity || '').toLowerCase() === 'low' ? 'minor' : (it.severity || 'unknown'),
                }))
              );
            }
          }
          return {
            interactions: { stored: collected, external: [] },
            sources: { stored: collected.length, external: 0 },
            summary: {
              totalInteractions: collected.length,
              majorCount: collected.filter(i => i.severity === 'major').length,
              moderateCount: collected.filter(i => i.severity === 'moderate').length,
              minorCount: collected.filter(i => i.severity === 'minor').length,
            },
          };
        } catch (e) {
          console.warn('Curated fallback failed:', (e as any)?.message || e);
        }
      }
      // Final fallback: empty results with message
      return {
        interactions: { stored: [], external: [] },
        summary: { totalInteractions: 0, majorCount: 0, moderateCount: 0, minorCount: 0 },
        message: 'Interaction checking service is currently unavailable'
      };
    }
  },

  getDrugInteractions: async (rxcui: string) => {
    try {
      // Use the known interactions endpoint to get interactions for this specific drug
      const response = await api.get(`/interactions/known?drug=${encodeURIComponent(rxcui)}`);
      return response.data;
    } catch (error: any) {
      // Handle 502 Bad Gateway errors from Netlify proxy
      if (error.response?.status === 502) {
        console.warn(`502 Bad Gateway for drug interactions: ${rxcui}, API temporarily unavailable`);
        return { interactions: [], message: 'Drug interactions service is temporarily experiencing connectivity issues' };
      }
      if (error.response?.status === 404) {
        console.warn(`Drug interactions API not available for rxcui: ${rxcui}`);
        return { interactions: [], message: 'Drug interactions service is currently unavailable' };
      }
      throw error;
    }
  }
};

// Override / Audit services
export const overrideService = {
  record: async (payload: {
    userId?: string;
    patientId?: string;
    context?: any;
    reason: string;
    action: 'override' | 'accept';
  }) => {
    const response = await api.post('/overrides', payload);
    return response.data;
  }
};

// Genomics services
export const genomicsService = {
  getCpicGuidelines: async (gene?: string, drug?: string) => {
    try {
      const params = new URLSearchParams();
      if (gene) params.append('gene', gene);
      if (drug) params.append('drug', drug);
      
      const response = await api.get(`/genomics/cpic/guidelines?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn('CPIC guidelines API not available');
        return { guidelines: [], message: 'Genomics service is currently unavailable' };
      }
      throw error;
    }
  },

  getDrugGenomics: async (rxcui: string) => {
    try {
      const response = await api.get(`/genomics/drug/${rxcui}/genomics`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(`Drug genomics API not available for rxcui: ${rxcui}`);
        return { genomics: [], message: 'Drug genomics service is currently unavailable' };
      }
      throw error;
    }
  },

  checkGenomicProfile: async (genes: string[], drugs: string[]) => {
    try {
      const response = await api.post('/genomics/profile/check', { genes, drugs });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn('Genomic profile check API not available');
        return { profile: [], message: 'Genomic profile service is currently unavailable' };
      }
      throw error;
    }
  }
};

export default api;
