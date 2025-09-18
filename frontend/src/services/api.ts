import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

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
    const response = await api.get(`/drugs/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getDrugDetails: async (rxcui: string) => {
    const response = await api.get(`/drugs/${rxcui}`);
    return response.data;
  },

  getDrugInteractions: async (rxcui: string) => {
    const response = await api.get(`/drugs/${rxcui}/interactions`);
    return response.data;
  },

  searchLabels: async (query: string) => {
    const response = await api.get(`/drugs/labels/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getLabelDetails: async (setId: string) => {
    const response = await api.get(`/drugs/labels/${setId}`);
    return response.data;
  }
};

// Interaction services
export const interactionService = {
  getKnownInteractions: async (params: Record<string, string | number | boolean> = {}) => {
    const search = new URLSearchParams();
    for (const [k,v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') search.append(k, String(v));
    }
    const response = await api.get(`/interactions/known?${search.toString()}`);
    return response.data;
  },

  checkInteractions: async (drugs: { rxcui: string; name: string }[]) => {
    const response = await api.post('/interactions/check', { drugs });
    return response.data;
  },

  getDrugInteractions: async (rxcui: string) => {
    const response = await api.get(`/interactions/drug/${rxcui}`);
    return response.data;
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
    const params = new URLSearchParams();
    if (gene) params.append('gene', gene);
    if (drug) params.append('drug', drug);
    
    const response = await api.get(`/genomics/cpic/guidelines?${params.toString()}`);
    return response.data;
  },

  getDrugGenomics: async (rxcui: string) => {
    const response = await api.get(`/genomics/drug/${rxcui}/genomics`);
    return response.data;
  },

  checkGenomicProfile: async (genes: string[], drugs: string[]) => {
    const response = await api.post('/genomics/profile/check', { genes, drugs });
    return response.data;
  }
};

export default api;
