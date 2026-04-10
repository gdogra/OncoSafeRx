// Netlify Function — ESM wrapper with lazy initialization.
// No top-level await. The Express app is loaded on first request.

let cachedHandler = null;

async function initHandler() {
  const serverlessModule = await import('serverless-http');
  const appModule = await import('../../src/index.js');
  const serverless = serverlessModule.default || serverlessModule;
  const app = appModule.default || appModule;
  return serverless(app);
}

export async function handler(event, context) {
  if (!cachedHandler) {
    cachedHandler = await initHandler();
  }
  return cachedHandler(event, context);
}
