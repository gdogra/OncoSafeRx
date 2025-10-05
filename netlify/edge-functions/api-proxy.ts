import type { Context } from "https://edge.netlify.com/";

export default async (request: Request, context: Context) => {
  // Extract the path after /api/
  const url = new URL(request.url);
  const apiPath = url.pathname.replace('/api/', '');
  const search = url.search;
  
  // Forward to Render backend
  const backendUrl = `https://oncosaferx-backend.onrender.com/api/${apiPath}${search}`;
  
  try {
    const response = await fetch(backendUrl, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        // Ensure proper origin for CORS
        'Origin': 'https://oncosaferx.com'
      },
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.arrayBuffer() : undefined,
    });

    // Clone response and add CORS headers
    const modifiedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'Access-Control-Allow-Origin': url.origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
        'Access-Control-Allow-Origin': url.origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
};

export const config = {
  path: "/api/*"
};