/**
 * SMART App Launch (EHR launch + standalone launch), authorization-code flow with PKCE.
 * OncoSafeRx is the SMART *client*; the EHR is the authorization and FHIR server.
 *
 *   GET  /smart/launch?iss=<fhir base>&launch=<opaque>   registered as the app's launch URL
 *   GET  /smart/callback                                 registered as the redirect URI
 *   GET  /api/smart/context                              who/what the session is bound to (no token)
 *   GET  /api/smart/patient                              FHIR data mapped to /api/dosing/adjust inputs
 *   POST /api/smart/logout
 *
 * State lives in AES-GCM sealed cookies (src/smart/seal.js): the API is serverless, so nothing is
 * kept in memory. `iss` is attacker-controlled input and is checked against SMART_ALLOWED_ISS
 * before any request is made to it.
 */
import express from 'express';
import { getSmartConfig, issAllowed, normalizeIss, redirectUriFor } from '../smart/config.js';
import { seal, unseal, parseCookies, cookie, MAX_COOKIE_BYTES } from '../smart/seal.js';
import { createPkce, randomToken, safeEqual } from '../smart/pkce.js';
import { discover, fetchJson } from '../smart/discovery.js';
import { verifyIdToken } from '../smart/idToken.js';
import { buildDosingInputs } from '../smart/fhirInputs.js';

const TX_COOKIE = 'osrx_smart_tx';
const SESSION_COOKIE = 'osrx_smart_session';
const TX_LABEL = 'smart-transaction';
const SESSION_LABEL = 'smart-session';

export function createSmartRouter({ getConfig = () => getSmartConfig(), fetchImpl = fetch } = {}) {
  const router = express.Router();
  const fail = (res, status, message) => res.status(status).json({ error: message });

  function configOr503(res) {
    const cfg = getConfig();
    if (cfg.problems.length) {
      console.error(`SMART launch is not configured: missing ${cfg.problems.join(', ')}`);
      fail(res, 503, 'SMART launch is not configured on this server');
      return null;
    }
    return cfg;
  }

  router.get('/smart/launch', async (req, res) => {
    const cfg = configOr503(res); if (!cfg) return;
    const iss = normalizeIss(req.query.iss);
    const launch = typeof req.query.launch === 'string' ? req.query.launch : '';
    if (!issAllowed(cfg, iss)) return fail(res, 400, 'This EHR is not authorized to launch OncoSafeRx');
    const redirectUri = redirectUriFor(cfg, req);
    if (!redirectUri) return fail(res, 503, 'SMART launch is not configured on this server');

    let conf;
    try {
      conf = await discover(iss, { fetchImpl, allowLocalHttp: !cfg.secureCookies });
    } catch (e) {
      console.error('SMART discovery failed:', e.message);
      return fail(res, 502, 'Could not read the EHR\'s SMART configuration');
    }

    const pkce = createPkce();
    const state = randomToken(); const nonce = randomToken();
    const scopes = new Set(cfg.scope.split(/\s+/).filter(Boolean));
    scopes.delete('launch'); scopes.delete('launch/patient');
    scopes.add(launch ? 'launch' : 'launch/patient'); // EHR launch vs standalone patient picker

    const url = new URL(conf.authorization_endpoint);
    const q = {
      response_type: 'code', client_id: cfg.clientId, redirect_uri: redirectUri, scope: [...scopes].join(' '),
      state, aud: iss, code_challenge: pkce.challenge, code_challenge_method: pkce.method, nonce,
      ...(launch ? { launch } : {}),
    };
    for (const [k, v] of Object.entries(q)) url.searchParams.set(k, v);

    const tx = seal({ state, nonce, verifier: pkce.verifier, iss, redirectUri, token_endpoint: conf.token_endpoint, jwks_uri: conf.jwks_uri, issuer: conf.issuer || iss },
      { secret: cfg.sessionSecret, label: TX_LABEL, ttlSeconds: 600 });
    res.setHeader('Set-Cookie', cookie(TX_COOKIE, tx, { maxAge: 600, path: '/smart', secure: cfg.secureCookies }));
    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, url.toString());
  });

  router.get('/smart/callback', async (req, res) => {
    const cfg = configOr503(res); if (!cfg) return;
    const clear = cookie(TX_COOKIE, '', { maxAge: 0, path: '/smart', secure: cfg.secureCookies });
    res.setHeader('Cache-Control', 'no-store');

    if (req.query.error) {
      res.setHeader('Set-Cookie', clear);
      return res.status(400).json({ error: 'The EHR declined the launch', code: String(req.query.error).slice(0, 80) });
    }
    const tx = unseal(parseCookies(req.headers.cookie)[TX_COOKIE], { secret: cfg.sessionSecret, label: TX_LABEL });
    if (!tx) { res.setHeader('Set-Cookie', clear); return fail(res, 400, 'Launch expired or was not started here. Start again from the EHR.'); }
    if (!req.query.code || !req.query.state || !safeEqual(req.query.state, tx.state)) {
      res.setHeader('Set-Cookie', clear);
      return fail(res, 400, 'Invalid launch state');
    }

    const body = new URLSearchParams({ grant_type: 'authorization_code', code: String(req.query.code), redirect_uri: tx.redirectUri, code_verifier: tx.verifier, client_id: cfg.clientId });
    const headers = { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' };
    if (cfg.clientSecret) headers.authorization = 'Basic ' + Buffer.from(`${encodeURIComponent(cfg.clientId)}:${encodeURIComponent(cfg.clientSecret)}`).toString('base64');

    let tok;
    try {
      const r = await fetchImpl(tx.token_endpoint, { method: 'POST', headers, body, redirect: 'error', signal: AbortSignal.timeout(10000) });
      if (!r.ok) throw new Error(`token endpoint HTTP ${r.status}`);
      tok = await r.json();
    } catch (e) {
      console.error('SMART token exchange failed:', e.message);
      res.setHeader('Set-Cookie', clear);
      return fail(res, 502, 'Could not complete sign-in with the EHR');
    }
    if (!tok.access_token || String(tok.token_type).toLowerCase() !== 'bearer') {
      res.setHeader('Set-Cookie', clear);
      return fail(res, 502, 'The EHR returned an unusable token response');
    }

    let claims = null;
    if (tok.id_token) {
      try {
        claims = await verifyIdToken(tok.id_token, { jwksUri: tx.jwks_uri, issuer: tx.issuer, clientId: cfg.clientId, nonce: tx.nonce, fetchImpl });
      } catch (e) {
        console.error('SMART id_token rejected:', e.message);
        res.setHeader('Set-Cookie', clear);
        return fail(res, 401, 'Could not verify the EHR\'s identity token');
      }
    }

    const lifetime = Math.min(Number(tok.expires_in) || cfg.sessionMaxSeconds, cfg.sessionMaxSeconds);
    const sealed = seal({
      iss: tx.iss, patient: tok.patient || null, encounter: tok.encounter || null,
      fhirUser: claims?.fhirUser || claims?.profile || null, scope: tok.scope || '', access_token: tok.access_token,
    }, { secret: cfg.sessionSecret, label: SESSION_LABEL, ttlSeconds: lifetime });
    if (Buffer.byteLength(sealed) > MAX_COOKIE_BYTES) {
      console.error('SMART session too large for a cookie:', Buffer.byteLength(sealed));
      res.setHeader('Set-Cookie', clear);
      return fail(res, 502, 'The EHR\'s token is too large to hold in a session');
    }
    res.setHeader('Set-Cookie', [clear, cookie(SESSION_COOKIE, sealed, { maxAge: lifetime, path: '/', secure: cfg.secureCookies })]);
    const dest = new URL(cfg.postLoginUrl, 'http://placeholder'); dest.searchParams.set('smart', '1');
    return res.redirect(302, dest.pathname + dest.search);
  });

  const sessionOf = (req, cfg) => unseal(parseCookies(req.headers.cookie)[SESSION_COOKIE], { secret: cfg.sessionSecret, label: SESSION_LABEL });

  router.get('/api/smart/context', (req, res) => {
    const cfg = configOr503(res); if (!cfg) return;
    res.setHeader('Cache-Control', 'no-store');
    const s = sessionOf(req, cfg);
    if (!s) return res.json({ authenticated: false });
    return res.json({ authenticated: true, iss: s.iss, patient: s.patient, encounter: s.encounter, fhirUser: s.fhirUser, scope: s.scope });
  });

  router.get('/api/smart/patient', async (req, res) => {
    const cfg = configOr503(res); if (!cfg) return;
    res.setHeader('Cache-Control', 'no-store');
    const s = sessionOf(req, cfg);
    if (!s) return fail(res, 401, 'No active SMART session');
    if (!s.patient) return fail(res, 409, 'This launch has no patient in context');
    const headers = { authorization: `Bearer ${s.access_token}`, accept: 'application/fhir+json' };
    const get = (p) => fetchJson(`${s.iss}/${p}`, { fetchImpl, headers, timeoutMs: 10000 });
    const pid = encodeURIComponent(s.patient);
    try {
      const [patient, obs, meds] = await Promise.all([
        get(`Patient/${pid}`),
        get(`Observation?patient=${pid}&category=laboratory&_sort=-date&_count=200`).catch(() => ({ entry: [] })),
        get(`MedicationRequest?patient=${pid}&status=active&_count=100`).catch(() => ({ entry: [] })),
      ]);
      // Vital signs (weight/height) are a separate category in FHIR
      const vitals = await get(`Observation?patient=${pid}&category=vital-signs&_sort=-date&_count=50`).catch(() => ({ entry: [] }));
      const res_ = (b) => (b.entry || []).map((e) => e.resource).filter(Boolean);
      const out = buildDosingInputs({ patient, observations: [...res_(obs), ...res_(vitals)], medicationRequests: res_(meds) });
      return res.json({ patientId: s.patient, ...out });
    } catch (e) {
      console.error('SMART FHIR read failed:', e.message);
      return fail(res, 502, 'Could not read patient data from the EHR');
    }
  });

  router.post('/api/smart/logout', (req, res) => {
    const cfg = getConfig();
    res.setHeader('Set-Cookie', cookie(SESSION_COOKIE, '', { maxAge: 0, path: '/', secure: cfg.secureCookies }));
    res.json({ ok: true });
  });

  return router;
}

export default createSmartRouter();
