// Admin API utility with authentication
export const adminFetch = async (url: string, options: RequestInit = {}) => {
  // Get auth token from localStorage
  const getAuthToken = (): string | null => {
    try {
      const tokens = localStorage.getItem('osrx_auth_tokens');
      if (tokens) {
        const parsed = JSON.parse(tokens);
        return parsed.access_token || null;
      }
    } catch {
      console.warn('Failed to parse auth tokens');
    }
    return null;
  };

  const token = getAuthToken();
  
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
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('No auth token available for admin API call');
  }

  // Make the authenticated request
  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`Admin API call failed: ${response.status} ${response.statusText}`);
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