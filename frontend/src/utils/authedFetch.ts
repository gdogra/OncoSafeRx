// Lightweight authenticated fetch wrapper for frontend → backend requests
// - Reads Supabase access token from localStorage ('osrx_auth_tokens') or sb-* if present
// - Falls back to Supabase SDK session if available

export async function getAuthToken(): Promise<string | null> {
  try {
    const raw = localStorage.getItem('osrx_auth_tokens');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.access_token) return parsed.access_token as string;
    }
  } catch {}
  // Try Supabase SDK if present
  try {
    const { supabase } = await import('../lib/supabase');
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token || null;
    if (token) return token;
  } catch {}
  return null;
}

export async function authedFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> || {}),
  };
  const token = await getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['X-Forwarded-Authorization'] = `Bearer ${token}`;
  } else {
    // Signal backend to allow default user fallback when explicitly enabled
    headers['X-OSRX-GUEST'] = '1';
  }
  return fetch(input, { ...init, headers, credentials: 'same-origin' });
}

export default authedFetch;
