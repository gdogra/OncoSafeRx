/**
 * Verify the EHR-signed JWT on CDS Hooks requests (CDS Hooks "Security and Safety": the service
 * must authenticate the calling EHR). Checks: algorithm, key from the issuer's JWKS, signature,
 * iss is a trusted issuer, aud is exactly this endpoint, exp/iat, and jti has not been seen.
 */
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { fetchJson } from '../smart/discovery.js';

const ALGS = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384'];
const jwksCache = new Map(); // jwksUri -> { keys, at }
const seenJti = new Map();   // jti -> exp (per instance; best effort on serverless)

export class CdsAuthError extends Error {
  constructor(message, status = 401) { super(message); this.status = status; }
}

async function keysFor(jwksUri, { fetchImpl, ttlMs, force = false }) {
  const hit = jwksCache.get(jwksUri);
  if (hit && !force && Date.now() - hit.at < ttlMs) return hit.keys;
  const doc = await fetchJson(jwksUri, { fetchImpl });
  const keys = Array.isArray(doc.keys) ? doc.keys : [];
  jwksCache.set(jwksUri, { keys, at: Date.now() });
  return keys;
}

export function clearCdsAuthCaches() { jwksCache.clear(); seenJti.clear(); }

export async function verifyCdsRequest(req, { cfg, expectedAud, fetchImpl }) {
  const header = String(req.headers.authorization || '');
  if (!header) {
    if (cfg.allowUnsigned) return { issuer: 'unsigned-dev', signed: false };
    throw new CdsAuthError('Missing Authorization bearer token');
  }
  const m = /^Bearer\s+(.+)$/i.exec(header);
  if (!m) throw new CdsAuthError('Malformed Authorization header');
  const token = m[1];
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded?.header || !decoded.payload || typeof decoded.payload !== 'object') throw new CdsAuthError('Malformed token');
  if (!ALGS.includes(decoded.header.alg)) throw new CdsAuthError('Unsupported token algorithm');

  const iss = String(decoded.payload.iss || '').replace(/\/+$/, '');
  const trusted = cfg.trustedIssuers[iss];
  if (!trusted) throw new CdsAuthError('Untrusted issuer');
  // A `jku` header may only repeat the configured JWKS URL; it can never redirect us elsewhere.
  if (decoded.header.jku && decoded.header.jku !== trusted.jwksUri) throw new CdsAuthError('Unexpected key set URL');

  let keys;
  try { keys = await keysFor(trusted.jwksUri, { fetchImpl, ttlMs: cfg.jwksTtlMs }); }
  catch { throw new CdsAuthError('Could not load issuer keys', 503); }
  const pick = (ks) => ks.find((k) => k.kid === decoded.header.kid) || (ks.length === 1 && !decoded.header.kid ? ks[0] : null);
  let jwk = pick(keys);
  if (!jwk) { // key rotation: refresh once
    try { jwk = pick(await keysFor(trusted.jwksUri, { fetchImpl, ttlMs: cfg.jwksTtlMs, force: true })); } catch { /* handled below */ }
  }
  if (!jwk) throw new CdsAuthError('Signing key not found');

  let claims;
  try {
    claims = jwt.verify(token, crypto.createPublicKey({ key: jwk, format: 'jwk' }), { algorithms: ALGS, issuer: decoded.payload.iss, audience: expectedAud, clockTolerance: 30 });
  } catch (e) {
    throw new CdsAuthError(`Invalid token: ${e.message}`);
  }
  if (!claims.jti) throw new CdsAuthError('Token has no jti');
  const now = Math.floor(Date.now() / 1000);
  for (const [k, exp] of seenJti) if (exp < now) seenJti.delete(k);
  if (seenJti.has(claims.jti)) throw new CdsAuthError('Token replay detected');
  seenJti.set(claims.jti, claims.exp || now + 300);
  return { issuer: iss, signed: true, tenant: claims.tenant || null };
}
