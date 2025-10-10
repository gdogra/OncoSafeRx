/**
 * Development mode utilities to reduce console noise when backend is not running
 */

export const isDevelopmentMode = () => {
  return window.location.hostname === 'localhost';
};

export const skipApiInDev = () => {
  return isDevelopmentMode();
};

/**
 * Wrapper for fetch that gracefully handles development mode
 */
export const devFetch = async (url: string, options?: RequestInit): Promise<Response | null> => {
  if (skipApiInDev()) {
    // Dev mode: Skipping API call
    // Return a mock 404 response for development
    return new Response(JSON.stringify({ error: 'Development mode - API disabled' }), {
      status: 404,
      statusText: 'Not Found',
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return fetch(url, options);
};