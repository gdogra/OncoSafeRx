export function apiBaseUrl(): string {
  const vite = (import.meta as any)?.env?.VITE_API_URL;
  // @ts-ignore
  const cra = typeof process !== 'undefined' ? (process as any)?.env?.REACT_APP_API_URL : undefined;
  return vite || cra || 'http://localhost:3000/api';
}

export function appVersion(): string {
  const vite = (import.meta as any)?.env?.VITE_APP_VERSION;
  // @ts-ignore
  const cra = typeof process !== 'undefined' ? (process as any)?.env?.REACT_APP_VERSION : undefined;
  return vite || cra || 'dev';
}
