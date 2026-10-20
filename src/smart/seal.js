/**
 * Authenticated encryption for cookie payloads (AES-256-GCM). Stateless on purpose: the API runs
 * as serverless functions, so there is no shared memory to hold SMART transactions or sessions.
 * The `label` is bound as additional authenticated data so a transaction cookie can never be
 * replayed as a session cookie.
 */
import crypto from 'node:crypto';

const key = (secret) => crypto.createHash('sha256').update(String(secret)).digest();
const b64u = (buf) => Buffer.from(buf).toString('base64url');

export function seal(payload, { secret, label, ttlSeconds }) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key(secret), iv);
  c.setAAD(Buffer.from(label));
  const body = Buffer.from(JSON.stringify({ d: payload, e: Math.floor(Date.now() / 1000) + ttlSeconds }));
  const enc = Buffer.concat([c.update(body), c.final()]);
  return b64u(Buffer.concat([iv, c.getAuthTag(), enc]));
}

/** Returns the payload, or null if tampered, wrong label, or expired. */
export function unseal(token, { secret, label }) {
  try {
    const raw = Buffer.from(String(token), 'base64url');
    if (raw.length < 29) return null;
    const d = crypto.createDecipheriv('aes-256-gcm', key(secret), raw.subarray(0, 12));
    d.setAAD(Buffer.from(label));
    d.setAuthTag(raw.subarray(12, 28));
    const out = JSON.parse(Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString('utf8'));
    if (!out || typeof out.e !== 'number' || out.e < Math.floor(Date.now() / 1000)) return null;
    return out.d;
  } catch {
    return null;
  }
}

export function parseCookies(header) {
  const out = {};
  for (const part of String(header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function cookie(name, value, { maxAge, path = '/', secure = false } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, 'HttpOnly', 'SameSite=Lax'];
  if (maxAge !== undefined) parts.push(`Max-Age=${maxAge}`);
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export const MAX_COOKIE_BYTES = 3800;
