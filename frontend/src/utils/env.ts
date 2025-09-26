let cachedApiUrl: string | null = null;

export function apiBaseUrl(): string {
  if (cachedApiUrl) {
    return cachedApiUrl;
  }

  const vite = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
  // @ts-ignore
  const cra = typeof process !== 'undefined' ? (process as any)?.env?.REACT_APP_API_URL as string | undefined : undefined;
  
  
  if (vite?.trim()) {
    cachedApiUrl = vite;
    return vite;
  }
  if (cra?.trim()) {
    cachedApiUrl = cra;
    return cra;
  }
  
  // For development, always use localhost:3000 API
  if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    const devUrl = 'http://localhost:3000/api';
    cachedApiUrl = devUrl;
    return devUrl;
  }
  
  // CRITICAL FIX: Use Render API server for production instead of same-origin
  if (typeof window !== 'undefined' && window.location?.hostname !== 'localhost') {
    const productionUrl = 'https://oncosaferx.onrender.com/api';
    cachedApiUrl = productionUrl;
    return productionUrl;
  }
  
  const fallback = 'http://localhost:3000/api';
  cachedApiUrl = fallback;
  return fallback;
}

export function appVersion(): string {
  const vite = (import.meta as any)?.env?.VITE_APP_VERSION;
  // @ts-ignore
  const cra = typeof process !== 'undefined' ? (process as any)?.env?.REACT_APP_VERSION : undefined;
  return vite || cra || 'dev';
}
