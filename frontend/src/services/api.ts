import axios from 'axios';

// Static API URL calculation to prevent repeated calls
const getApiUrl = () => {
  const vite = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
  // @ts-ignore
  const cra = typeof process !== 'undefined' ? (process as any)?.env?.REACT_APP_API_URL as string | undefined : undefined;
  
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
  
  // Prefer same-origin '/api' in production to avoid CSP issues
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return `${window.location.origin}/api`;
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
      if (error.response?.status === 404) {
        console.warn('Known interactions API not available');
        return { interactions: [], message: 'Interactions service is currently unavailable' };
      }
      throw error;
    }
  },

  checkInteractions: async (drugs: { rxcui: string; name: string }[]) => {
    try {
      const response = await api.post('/interactions/check', { drugs });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn('Interaction check API not available');
        return { interactions: [], message: 'Interaction checking service is currently unavailable' };
      }
      throw error;
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
