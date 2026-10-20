/**
 * SMART on FHIR client configuration (OncoSafeRx is the SMART *app*; the EHR is the FHIR server
 * and authorization server). Everything comes from the environment so each EHR registration can
 * have its own client id / redirect URI.
 *
 *   SMART_CLIENT_ID        registered client id (required in production)
 *   SMART_CLIENT_SECRET    only for confidential clients; public clients use PKCE alone
 *   SMART_REDIRECT_URI     must exactly match the registered redirect, e.g. https://app.example.com/smart/callback
 *   SMART_SCOPE            default below
 *   SMART_ALLOWED_ISS      comma-separated FHIR base URLs this app may launch from (required in production)
 *   SMART_SESSION_SECRET   >= 32 chars; seals the transaction and session cookies (required in production)
 *   SMART_POST_LOGIN_URL   where to send the browser after a successful launch (default "/safety-check")
 */
export const PUBLIC_SANDBOX_ISS = 'https://launch.smarthealthit.org/v/r4/fhir';

export const DEFAULT_SCOPE = [
  'launch', 'openid', 'fhirUser',
  'patient/Patient.read', 'patient/MedicationRequest.read', 'patient/Observation.read', 'patient/Condition.read',
].join(' ');

const isProd = (env) => env.NODE_ENV === 'production';

export function normalizeIss(iss) {
  return String(iss || '').trim().replace(/\/+$/, '');
}

export function getSmartConfig(env = process.env) {
  const prod = isProd(env);
  const allowed = String(env.SMART_ALLOWED_ISS || '').split(',').map(normalizeIss).filter(Boolean);
  const cfg = {
    clientId: env.SMART_CLIENT_ID || (prod ? '' : 'oncosaferx-dev'),
    clientSecret: env.SMART_CLIENT_SECRET || '',
    redirectUri: env.SMART_REDIRECT_URI || '',
    scope: env.SMART_SCOPE || DEFAULT_SCOPE,
    allowedIss: allowed.length ? allowed : (prod ? [] : [PUBLIC_SANDBOX_ISS]),
    sessionSecret: env.SMART_SESSION_SECRET || (prod ? '' : 'dev-only-smart-session-secret-change-me-0000'),
    postLoginUrl: env.SMART_POST_LOGIN_URL || '/safety-check',
    secureCookies: prod,
    sessionMaxSeconds: Number(env.SMART_SESSION_MAX_SECONDS) || 3600,
  };
  const problems = [];
  if (!cfg.clientId) problems.push('SMART_CLIENT_ID');
  if (!cfg.sessionSecret || cfg.sessionSecret.length < 32) problems.push('SMART_SESSION_SECRET (>= 32 chars)');
  if (prod && !cfg.redirectUri) problems.push('SMART_REDIRECT_URI');
  if (prod && !cfg.allowedIss.length) problems.push('SMART_ALLOWED_ISS');
  cfg.problems = problems;
  return cfg;
}

/** The redirect URI must be pre-registered, so only guess it outside production. */
export function redirectUriFor(cfg, req) {
  if (cfg.redirectUri) return cfg.redirectUri;
  if (cfg.secureCookies) return null;
  return `${req.protocol}://${req.get('host')}/smart/callback`;
}

export function issAllowed(cfg, iss) {
  const n = normalizeIss(iss);
  if (!n || !cfg.allowedIss.includes(n)) return false;
  let u;
  try { u = new URL(n); } catch { return false; }
  const local = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
  return u.protocol === 'https:' || (u.protocol === 'http:' && local && !cfg.secureCookies);
}
