import axios from 'axios';

// API URL: use env var if set, otherwise localhost for dev.
// In production without a backend, API calls will fail gracefully —
// the app falls back to client-side data (curated interactions, RxNorm direct).
const getApiUrl = () => {
  const vite = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
  if (vite?.trim()) return vite;
  if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    return 'http://localhost:3000/api';
  }
  return ''; // Empty = no backend available, use client-side fallbacks
};

const API_BASE_URL = getApiUrl();

/**
 * True when no backend API is configured (frontend-only deployment on Netlify).
 * When true, all services skip API calls and go straight to client-side fallbacks.
 */
export const IS_FRONTEND_ONLY = !API_BASE_URL || API_BASE_URL === '/api' && typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location?.hostname);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased to 60 seconds for slow networks
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
    // Skip backend in frontend-only mode
    if (!IS_FRONTEND_ONLY) {
      try {
        const response = await api.get(`/drugs/search?q=${encodeURIComponent(query)}`);
        return response.data;
      } catch { /* fall through to RxNorm */ }
    }
    {
      // Backend unavailable — call RxNorm directly (free, CORS-enabled)
      try {
        const rxRes = await fetch(
          `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(query)}`
        );
        if (rxRes.ok) {
          const rxData = await rxRes.json();
          const concepts = rxData?.drugGroup?.conceptGroup || [];
          const results: any[] = [];
          for (const group of concepts) {
            for (const prop of (group.conceptProperties || [])) {
              results.push({
                name: prop.name,
                rxcui: prop.rxcui,
                tty: prop.tty,
                synonym: prop.synonym || '',
              });
            }
          }
          return { results: results.slice(0, 20), count: results.length, query, source: 'RxNorm' };
        }
      } catch {}
      // Final fallback: approximate search
      try {
        const approxRes = await fetch(
          `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(query)}&maxEntries=10`
        );
        if (approxRes.ok) {
          const approxData = await approxRes.json();
          const candidates = approxData?.approximateGroup?.candidate || [];
          return {
            results: candidates.map((c: any) => ({ name: c.name || query, rxcui: c.rxcui, tty: 'IN', score: c.score })),
            count: candidates.length,
            query,
            source: 'RxNorm approximate',
          };
        }
      } catch {}
      return { results: [], count: 0, query, message: 'Drug search unavailable' };
    }
  },

  getDrugDetails: async (rxcui: string) => {
    if (!IS_FRONTEND_ONLY) {
      try {
        const response = await api.get(`/drugs/${rxcui}`);
        return response.data;
      } catch { /* fall through */ }
    }
    // Fallback: get basic info from RxNorm directly
    try {
      const res = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`);
      if (res.ok) {
        const data = await res.json();
        const props = data?.properties;
        return { rxcui, name: props?.name || rxcui, tty: props?.tty, synonym: props?.synonym, fallback: true };
      }
    } catch { /* ignore */ }
    return { rxcui, error: 'Drug details unavailable', fallback: true };
  },

  getDrugInteractions: async (rxcui: string) => {
    if (!IS_FRONTEND_ONLY) {
      try {
        const response = await api.get(`/interactions/known?drug=${encodeURIComponent(rxcui)}`);
        return response.data;
      } catch { /* fall through */ }
    }
    // Client-side: search curated data by drug name
    try {
      const { FALLBACK_INTERACTIONS } = await import('../data/fallbackInteractions');
      const matches = FALLBACK_INTERACTIONS.filter(k =>
        k.drugs.some(d => d.toLowerCase().includes(rxcui.toLowerCase()))
      );
      return { interactions: matches, total: matches.length, fallback: true };
    } catch {
      return { interactions: [], message: 'Interaction data unavailable', fallback: true };
    }
  },

  searchLabels: async (_query: string) => {
    if (!IS_FRONTEND_ONLY) {
      try { return (await api.get(`/drugs/labels/search?q=${encodeURIComponent(_query)}`)).data; } catch { /* fall through */ }
    }
    return { results: [], message: 'Drug labels available via FDA DailyMed', fallback: true };
  },

  searchBrandAliases: async (_query: string) => {
    if (!IS_FRONTEND_ONLY) {
      try { return (await api.get(`/drugs/brand-aliases/search?q=${encodeURIComponent(_query)}`)).data; } catch { /* fall through */ }
    }
    return { results: [], message: 'Brand alias search unavailable in offline mode', fallback: true };
  },

  getLabelDetails: async (_setId: string) => {
    if (!IS_FRONTEND_ONLY) {
      try { return (await api.get(`/drugs/labels/${_setId}`)).data; } catch { /* fall through */ }
    }
    return { error: 'Drug label details available via FDA DailyMed', fallback: true };
  }
};

// Interaction services
export const interactionService = {
  getKnownInteractions: async (params: Record<string, string | number | boolean> = {}) => {
    // ── Client-side fallback function ──
    const useFallbackData = async () => {
      const { FALLBACK_INTERACTIONS } = await import('../data/fallbackInteractions');
      let results = [...FALLBACK_INTERACTIONS];
      const { drug, drugA, drugB, severity } = params;

      if (drug && typeof drug === 'string') {
        const term = drug.toLowerCase();
        results = results.filter(k => k.drugs.some(d => d.toLowerCase().includes(term)));
      }
      if (drugA && drugB && typeof drugA === 'string' && typeof drugB === 'string') {
        const a = drugA.toLowerCase();
        const b = drugB.toLowerCase();
        results = results.filter(k => {
          const names = k.drugs.map(d => d.toLowerCase());
          return (names.some(n => n.includes(a)) && names.some(n => n.includes(b)));
        });
      }
      if (severity && typeof severity === 'string') {
        const sev = severity.toLowerCase();
        results = results.filter(k => (k.severity || '').toLowerCase() === sev);
      }

      const enriched = results.map(k => ({
        ...k,
        drug_rxnorm: k.drugs.map(name => ({ name, rxcui: null }))
      }));

      return {
        count: enriched.length,
        total: enriched.length,
        interactions: enriched,
        message: 'Using curated interaction database (client-side)',
        fallback: true
      };
    };

    // ── Skip API calls entirely in frontend-only mode ──
    if (IS_FRONTEND_ONLY) {
      return useFallbackData();
    }

    const maxRetries = 2;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const search = new URLSearchParams();
        for (const [k,v] of Object.entries(params)) {
          if (v !== undefined && v !== null && v !== '') search.append(k, String(v));
        }

        const response = await api.get(`/interactions/known?${search.toString()}`);
        return response.data;

      } catch (error: any) {
        lastError = error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    }

    // All API attempts failed — use fallback
    console.warn('API unavailable, using client-side interaction data');
    try {
      return await useFallbackData();
    } catch (fallbackError) {
      console.error('Fallback data import failed:', fallbackError);
    }
    
    // Return empty result for other errors
    return {
      count: 0,
      total: 0,
      interactions: [],
      message: 'Unable to load interaction data. Please try again later.',
      error: true
    };
  },

  checkInteractions: async (drugs: { rxcui: string; name: string }[]) => {
    try {
      // Backend expects an array of RXCUI strings
      const rxcuis = (drugs || []).map(d => String(d.rxcui)).filter(Boolean);
      
      // Fast-path: skip API calls in frontend-only mode or if we know no endpoints work
      if (IS_FRONTEND_ONLY || interactionsRouteState === 'none') {
        interactionsRouteState = 'none';
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
        const backend = ((import.meta as any)?.env?.VITE_BACKEND_URL as string | undefined) || ''  // Backend is same-origin via Netlify Function;
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
    } catch {
      // Fallback: use curated client-side data + RxNorm API
      try {
        const { FALLBACK_INTERACTIONS } = await import('../data/fallbackInteractions');
        const drugNames = drugs.map(d => d.name?.toLowerCase()).filter(Boolean);
        const collected: any[] = [];

        // Check all pairs against curated data
        for (let i = 0; i < drugNames.length; i++) {
          for (let j = i + 1; j < drugNames.length; j++) {
            const a = drugNames[i], b = drugNames[j];
            const matches = FALLBACK_INTERACTIONS.filter(k => {
              const names = k.drugs.map(d => d.toLowerCase());
              return (names.some(n => n.includes(a)) && names.some(n => n.includes(b)))
                || (names.some(n => n.includes(b)) && names.some(n => n.includes(a)));
            });
            collected.push(...matches);
          }
        }

        // Also try RxNorm interaction API for additional coverage
        try {
          const rxcuis = drugs.map(d => d.rxcui).filter(Boolean);
          if (rxcuis.length >= 2) {
            const { checkRxNormInteractions } = await import('./rxnormInteractions');
            const rxnormResults = await checkRxNormInteractions(rxcuis);
            // Add RxNorm results that aren't already in curated data
            for (const rx of rxnormResults) {
              const isDuplicate = collected.some(c =>
                c.drugs.some((d: string) => rx.drugs.some(rd => rd.toLowerCase().includes(d.toLowerCase())))
              );
              if (!isDuplicate) collected.push(rx);
            }
          }
        } catch { /* RxNorm enrichment is optional */ }

        return {
          interactions: { stored: collected, external: [] },
          sources: { stored: collected.length, external: 0 },
          summary: {
            totalInteractions: collected.length,
            majorCount: collected.filter(i => (i.severity || '').toLowerCase() === 'major').length,
            moderateCount: collected.filter(i => (i.severity || '').toLowerCase() === 'moderate').length,
            minorCount: collected.filter(i => (i.severity || '').toLowerCase() === 'minor').length,
          },
          fallback: true,
        };
      } catch (e) {
        console.warn('Curated fallback failed:', (e as any)?.message || e);
      }
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
    if (IS_FRONTEND_ONLY) {
      // Store overrides in localStorage when no backend
      const overrides = JSON.parse(localStorage.getItem('oncosaferx_overrides') || '[]');
      overrides.push({ ...payload, timestamp: new Date().toISOString() });
      localStorage.setItem('oncosaferx_overrides', JSON.stringify(overrides.slice(-100)));
      return { success: true, stored: 'local' };
    }
    const response = await api.post('/overrides', payload);
    return response.data;
  }
};

// Genomics services — use client-side CPIC data when no backend
export const genomicsService = {
  getCpicGuidelines: async (gene?: string, drug?: string) => {
    if (!IS_FRONTEND_ONLY) {
      try { return (await api.get(`/genomics/cpic/guidelines?${new URLSearchParams({ ...(gene ? {gene} : {}), ...(drug ? {drug} : {}) })}`)).data; } catch { /* fall through */ }
    }
    // Client-side CPIC data
    try {
      const { CPIC_GUIDELINES_EXPANDED } = await import('../data/cpicGuidelinesExpanded') as any;
      let guidelines = CPIC_GUIDELINES_EXPANDED || [];
      if (gene) guidelines = guidelines.filter((g: any) => g.gene_symbol?.toLowerCase() === gene.toLowerCase());
      if (drug) guidelines = guidelines.filter((g: any) => g.drug?.generic_name?.toLowerCase().includes(drug.toLowerCase()));
      return { guidelines, total: guidelines.length, fallback: true };
    } catch {
      return { guidelines: [], message: 'CPIC data unavailable', fallback: true };
    }
  },

  getDrugGenomics: async (rxcui: string) => {
    if (!IS_FRONTEND_ONLY) {
      try { return (await api.get(`/genomics/drug/${rxcui}/genomics`)).data; } catch { /* fall through */ }
    }
    return { genomics: [], message: 'Use the PGx Dosing Calculator for genomic recommendations', fallback: true };
  },

  checkGenomicProfile: async (genes: string[], drugs: string[]) => {
    if (!IS_FRONTEND_ONLY) {
      try { return (await api.post('/genomics/profile/check', { genes, drugs })).data; } catch { /* fall through */ }
    }
    return { profile: [], message: 'Use the PGx Dosing Calculator for profile-based recommendations', fallback: true };
  }
};

// Cache for interaction route state to avoid repeated failed attempts
let interactionsRouteState: 'primary' | 'enhanced' | 'absolute' | 'none' | null = null;

export default api;
