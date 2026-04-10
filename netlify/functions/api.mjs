/**
 * Netlify Function wrapping the Express app.
 *
 * Uses lazy initialization to avoid top-level await issues with esbuild's
 * CJS output format. The Express app is imported and wrapped on first
 * invocation, then cached for subsequent requests.
 */

let cachedHandler = null;

export async function handler(event, context) {
  if (!cachedHandler) {
    const serverless = (await import('serverless-http')).default;
    const { default: app } = await import('../../src/index.js');
    cachedHandler = serverless(app);
  }
  return cachedHandler(event, context);
}
