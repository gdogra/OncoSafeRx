// Production configuration management
export interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  features: {
    analytics: boolean;
    ai: boolean;
    ehr: boolean;
    offline: boolean;
    debugging: boolean;
  };
  limits: {
    maxSearchResults: number;
    maxComparisonDrugs: number;
    maxFavorites: number;
    sessionTimeout: number; // minutes
  };
  security: {
    encryptLocalStorage: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    enableCSP: boolean;
  };
  performance: {
    enableServiceWorker: boolean;
    enableLazyLoading: boolean;
    cacheStrategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  };
}

const getEnvironment = (): AppConfig['environment'] => {
  if (typeof window === 'undefined') return 'development';
  
  const hostname = window.location.hostname;
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return 'development';
  }
  if (hostname.includes('staging') || hostname.includes('dev')) {
    return 'staging';
  }
  return 'production';
};

const environment = getEnvironment();

export const config: AppConfig = {
  apiUrl: process.env.REACT_APP_API_URL || 
    (environment === 'production' 
      ? 'https://api.oncosaferx.com/v1'
      : environment === 'staging'
      ? 'https://api-staging.oncosaferx.com/v1'
      : 'http://localhost:3001/api/v1'),
  
  environment,
  version: process.env.REACT_APP_VERSION || '1.0.0',
  
  features: {
    analytics: environment !== 'development',
    ai: true,
    ehr: environment === 'production',
    offline: environment !== 'development',
    debugging: environment === 'development'
  },
  
  limits: {
    maxSearchResults: environment === 'production' ? 100 : 50,
    maxComparisonDrugs: 4,
    maxFavorites: environment === 'production' ? 500 : 100,
    sessionTimeout: environment === 'production' ? 60 : 1440 // 1 hour vs 24 hours
  },
  
  security: {
    encryptLocalStorage: environment === 'production',
    logLevel: environment === 'production' ? 'error' : 'debug',
    enableCSP: environment === 'production'
  },
  
  performance: {
    enableServiceWorker: environment !== 'development',
    enableLazyLoading: true,
    cacheStrategy: environment === 'production' ? 'stale-while-revalidate' : 'network-first'
  }
};

// Feature flag helpers
export const isFeatureEnabled = (feature: keyof AppConfig['features']): boolean => {
  return config.features[feature];
};

export const isDevelopment = () => config.environment === 'development';
export const isProduction = () => config.environment === 'production';
export const isStaging = () => config.environment === 'staging';

// API endpoint builder
export const buildApiUrl = (endpoint: string): string => {
  return `${config.apiUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
};

export default config;