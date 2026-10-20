/** Verify the OpenID Connect id_token returned by the EHR (signature, issuer, audience, nonce). */
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { fetchJson } from './discovery.js';

export async function verifyIdToken(idToken, { jwksUri, issuer, clientId, nonce, fetchImpl }) {
  if (!jwksUri) throw new Error('no jwks_uri to verify id_token');
  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded?.header) throw new Error('malformed id_token');
  const jwks = await fetchJson(jwksUri, { fetchImpl });
  const jwk = (jwks.keys || []).find((k) => k.kid === decoded.header.kid) || ((jwks.keys || []).length === 1 ? jwks.keys[0] : null);
  if (!jwk) throw new Error('signing key not found');
  const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
  const claims = jwt.verify(idToken, publicKey, {
    algorithms: ['RS256', 'RS384', 'RS512', 'ES256', 'ES384'],
    issuer,
    audience: clientId,
  });
  if (nonce && claims.nonce !== nonce) throw new Error('nonce mismatch');
  return claims;
}
