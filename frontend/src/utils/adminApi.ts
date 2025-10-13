// Admin API utility with authentication
export const adminFetch = async (url: string, options: RequestInit = {}) => {
  // Prefer backend JWT; fallback to exchange Supabase -> backend
  const readBackendJwt = (): string | null => {
    try {
      const raw = localStorage.getItem('osrx_backend_jwt');
      if (!raw) return null;
      const { token, exp } = JSON.parse(raw);
      if (token && (!exp || Date.now() < exp - 60_000)) return token; // 1 min skew
    } catch {
      // ignore
    }
    return null;
  };

  const readSupabaseJwt = (): string | null => {
    try {
      const tokens = localStorage.getItem('osrx_auth_tokens');
      if (!tokens) return null;
      const parsed = JSON.parse(tokens);
      return parsed.access_token || null;
    } catch {
      return null;
    }
  };

  const ensureBackendJwt = async (): Promise<string | null> => {
    const existing = readBackendJwt();
    if (existing) return existing;
    const supa = readSupabaseJwt();
    if (!supa) return null;
    try {
      const resp = await fetch('/api/supabase-auth/exchange/backend-jwt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${supa}` }
      });
      if (!resp.ok) return null;
      const body = await resp.json();
      const backend = body?.token;
      if (backend) {
        // Decode exp if present
        let exp: number | null = null;
        try { const payload = JSON.parse(atob(backend.split('.')[1])); exp = payload?.exp ? payload.exp * 1000 : null; } catch {}
        try { localStorage.setItem('osrx_backend_jwt', JSON.stringify({ token: backend, exp })); } catch {}
        return backend;
      }
    } catch {}
    return null;
  };

  // Prefer Supabase JWT first to avoid 404 spam on older backends
  let token = readSupabaseJwt();
  if (!token) token = readBackendJwt();
  if (!token) token = await ensureBackendJwt();
  
  // Debug: Check token content
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('🔍 JWT Token Debug:', {
        email: payload.email,
        role: payload.role,
        expires: new Date(payload.exp * 1000).toLocaleString()
      });
    } catch (e) {
      console.log('🔍 Token decode failed:', e.message);
    }
  }
  
  // Prepare headers with authentication
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('No auth token available for admin API call');
  }

  // Make the authenticated request
  const doRequest = async (): Promise<Response> => fetch(url, {
    ...options,
    headers
  });
  let response = await doRequest();
  if (response.status === 401 || response.status === 403) {
    try { (window as any)?.showToast?.('info', 'Refreshing access…'); } catch {}
    // Retry once after clearing backend JWT and re-exchanging
    try { localStorage.removeItem('osrx_backend_jwt'); } catch {}
    // Try exchanging now (older servers may not support this; handle 404 below)
    const refreshed = await ensureBackendJwt();
    if (refreshed) headers['Authorization'] = `Bearer ${refreshed}`;
    response = await doRequest();
    // If still unauthorized and we used backend JWT, try Supabase JWT one last time
    if ((response.status === 401 || response.status === 403)) {
      const supa = readSupabaseJwt();
      if (supa) {
        headers['Authorization'] = `Bearer ${supa}`;
        response = await doRequest();
      }
    }
  }
  if (!response.ok) {
    const err: any = new Error(`Admin API call failed: ${response.status} ${response.statusText}`);
    err.status = response.status;
    try { err.body = await response.clone().json(); } catch {}
    throw err;
  }
  return response;
};

// Convenience methods for common admin API patterns
export const adminApi = {
  get: (url: string) => adminFetch(url),
  post: (url: string, data: any) => adminFetch(url, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  put: (url: string, data: any) => adminFetch(url, {
    method: 'PUT', 
    body: JSON.stringify(data)
  }),
  delete: (url: string) => adminFetch(url, { method: 'DELETE' })
};
