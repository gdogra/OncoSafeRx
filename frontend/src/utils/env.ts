export function apiBaseUrl(): string {
  const vite = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
  // @ts-ignore
  const cra = typeof process !== 'undefined' ? (process as any)?.env?.REACT_APP_API_URL as string | undefined : undefined;
  
  console.log('Environment debug:', {
    vite,
    cra,
    importMeta: (import.meta as any)?.env,
    windowOrigin: typeof window !== 'undefined' ? window.location?.origin : 'undefined'
  });
  
  if (vite?.trim()) {
    console.log('Using VITE_API_URL:', vite);
    return vite;
  }
  if (cra?.trim()) {
    console.log('Using REACT_APP_API_URL:', cra);
    return cra;
  }
  
  // For development, always use localhost:3000 API
  if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
    const devUrl = 'http://localhost:3000/api';
    console.log('Using development API URL:', devUrl);
    return devUrl;
  }
  
  // Prefer same-origin '/api' in production to avoid CSP issues
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const fallbackUrl = `${window.location.origin}/api`;
    console.log('Using window origin fallback:', fallbackUrl);
    return fallbackUrl;
  }
  
  console.log('Using hardcoded fallback: http://localhost:3000/api');
  return 'http://localhost:3000/api';
}

export function appVersion(): string {
  const vite = (import.meta as any)?.env?.VITE_APP_VERSION;
  // @ts-ignore
  const cra = typeof process !== 'undefined' ? (process as any)?.env?.REACT_APP_VERSION : undefined;
  return vite || cra || 'dev';
}
