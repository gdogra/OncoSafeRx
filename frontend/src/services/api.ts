import axios from 'axios';

// Static API URL calculation to prevent repeated calls
const getApiUrl = () => {
  const vite = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
  // @ts-ignore
  const cra = typeof process !== 'undefined' ? (process as any)?.env?.REACT_APP_API_URL as string | undefined : undefined;
  
  // CRITICAL OVERRIDE: Force correct API URL for production (environment variable is wrong!)
  if (typeof window !== 'undefined' && window.location?.hostname !== 'localhost') {
    console.log('🚨 API Service: FORCING correct Render API URL for production');
    return 'https://oncosaferx.onrender.com/api';
  }
  
  if (vite?.trim()) {
    return vite;
  }
  if (cra?.trim()) {
    return cra;
  }
  
  // For development, always use localhost:3000 API
  if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    return 'http://localhost:3000/api';
  }
  
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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
      if (error.response?.status === 404) {
        console.warn(`Drug details API not available for rxcui: ${rxcui}`);
        return { error: 'Drug details service is currently unavailable' };
      }
      throw error;
    }
  },

  getDrugInteractions: async (rxcui: string) => {
    try {
      const response = await api.get(`/drugs/${rxcui}/interactions`);
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
      const response = await api.post('/interactions/check', { drugs });
      return response.data;
    } catch (error: any) {
      console.log('API Error:', error.response?.status, error.message);
      if (error.response?.status === 404 || error.response?.status === 400) {
        console.log('Using mock interactions for development');
        // Return mock interactions for development
        const mockInteractions = [];
        
        // Generate some mock interactions if we have multiple drugs
        if (drugs.length >= 2) {
          for (let i = 0; i < drugs.length - 1; i++) {
            for (let j = i + 1; j < drugs.length; j++) {
              const severities = ['major', 'moderate', 'minor'];
              const severity = severities[Math.floor(Math.random() * severities.length)];
              
              mockInteractions.push({
                id: `${drugs[i].rxcui}-${drugs[j].rxcui}`,
                drug1_rxcui: drugs[i].rxcui,
                drug2_rxcui: drugs[j].rxcui,
                drug1: { rxcui: drugs[i].rxcui, name: drugs[i].name },
                drug2: { rxcui: drugs[j].rxcui, name: drugs[j].name },
                severity,
                effect: `Potential ${severity} interaction between ${drugs[i].name} and ${drugs[j].name}`,
                mechanism: 'Drug metabolism pathway interaction',
                management: `Consider dose adjustment or alternative therapy if clinically indicated`,
                evidence_level: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
                sources: ['DrugBank', 'Clinical Studies'],
                riskLevel: severity.toUpperCase(),
                documentation: 'Theoretical',
                onset: 'Delayed'
              });
            }
          }
        }
        
        return {
          interactions: {
            stored: mockInteractions,
            external: []
          },
          summary: {
            totalInteractions: mockInteractions.length,
            majorCount: mockInteractions.filter(i => i.severity === 'major').length,
            moderateCount: mockInteractions.filter(i => i.severity === 'moderate').length,
            minorCount: mockInteractions.filter(i => i.severity === 'minor').length
          },
          drugs: drugs,
          timestamp: new Date().toISOString()
        };
      }
      
      console.warn('Interaction check API not available');
      return { 
        interactions: { stored: [], external: [] }, 
        summary: { totalInteractions: 0, majorCount: 0, moderateCount: 0, minorCount: 0 },
        message: 'Interaction checking service is currently unavailable' 
      };
    }
  },

  getDrugInteractions: async (rxcui: string) => {
    try {
      const response = await api.get(`/interactions/drug/${rxcui}`);
      return response.data;
    } catch (error: any) {
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
