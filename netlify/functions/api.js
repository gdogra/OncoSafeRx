// Netlify Function — CommonJS wrapper that lazy-loads the ESM Express app.
// This file is deliberately CJS (.js not .mjs) with zero await/import
// statements so esbuild can bundle it without top-level-await errors.
// The actual ESM app is loaded at runtime via dynamic import().

let handler;

module.exports.handler = async function (event, context) {
  if (!handler) {
    const serverlessHttp = await import('serverless-http');
    const app = await import('../../src/index.js');
    handler = serverlessHttp.default(app.default);
  }
  return handler(event, context);
};
