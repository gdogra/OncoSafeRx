import type { Context } from "https://edge.netlify.com/";

export default async (request: Request, context: Context) => {
  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        // Echo back the Origin for credentialed requests
        'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  // Extract the path after /api/
  const url = new URL(request.url);
  const apiPath = url.pathname.replace('/api/', '');
  const search = url.search;
  
  // Forward to Render backend (use env BACKEND_URL if provided)
  const backendBase = (context as any)?.env?.BACKEND_URL
    || (globalThis as any)?.BACKEND_URL
    || 'https://oncosaferx-backend.onrender.com';
  const backendUrl = `${backendBase.replace(/\/$/, '')}/api/${apiPath}${search}`;
  
  try {
    // Get body for non-GET requests
    let body = undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        body = await request.text();
      } catch (e) {
        console.error('Error reading request body:', e);
      }
    }

    // Forward important headers including Origin and Authorization
    const incoming = request.headers;
    const forwardedHeaders: Record<string, string> = {
      'Accept': incoming.get('accept') || 'application/json',
      'Content-Type': incoming.get('content-type') || 'application/json',
      'User-Agent': incoming.get('user-agent') || 'Netlify-Edge-Function/1.0',
      'X-Forwarded-For': incoming.get('x-forwarded-for') || '',
      'X-Forwarded-Host': url.host,
      'X-Forwarded-Proto': url.protocol.replace(':',''),
    };

    // Only include non-empty headers
    ['origin', 'authorization', 'x-forwarded-authorization', 'x-authorization', 'x-client-authorization', 'x-supabase-authorization', 'cookie'].forEach(headerName => {
      const value = incoming.get(headerName);
      if (value) {
        const key = headerName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('-');
        forwardedHeaders[key] = value;
      }
    });

    const response = await fetch(backendUrl, {
      method: request.method,
      headers: forwardedHeaders,
      body: body,
    });

    // Clone response and add CORS headers
    const modifiedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        // Echo back request Origin when available for proper CORS
        'Access-Control-Allow-Origin': incoming.get('origin') || url.origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true'
      }
    });

    return modifiedResponse;
  } catch (error) {
    console.error('Edge function proxy error:', error);
    return new Response(JSON.stringify({ 
      error: 'Proxy error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 502,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': request.headers.get('origin') || url.origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
      }
    });
  }
};

export const config = {
  path: "/api/*"
};
