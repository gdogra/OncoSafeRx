import type { Context } from "https://edge.netlify.com/";

export default async (request: Request, context: Context) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  const url = new URL(request.url);
  const apiPath = url.pathname.replace('/api/', '');
  const search = url.search;

  const backendBase = (context as any)?.env?.BACKEND_URL
    || (globalThis as any)?.BACKEND_URL
    || 'https://oncosaferx-backend.onrender.com';
  const backendUrl = `${backendBase.replace(/\/$/, '')}/api/${apiPath}${search}`;

  try {
    let body: string | undefined = undefined;
    if (!['GET','HEAD'].includes(request.method)) {
      try { body = await request.text(); } catch {}
    }

    const incoming = request.headers;
    const forwardedHeaders: Record<string, string> = {
      'Accept': incoming.get('accept') || 'application/json',
      'Content-Type': incoming.get('content-type') || 'application/json',
      'User-Agent': incoming.get('user-agent') || 'Netlify-Edge-Function/1.0',
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

    const resp = await fetch(backendUrl, {
      method: request.method,
      headers: forwardedHeaders,
      body,
    });

    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: {
        ...Object.fromEntries(resp.headers.entries()),
        'Access-Control-Allow-Origin': incoming.get('origin') || url.origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
      }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Proxy error', message: error?.message || 'Unknown' }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': url.origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      }
    });
  }
};

export const config = { path: "/api/*" };

