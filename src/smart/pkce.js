import crypto from 'node:crypto';

export const randomToken = (bytes = 24) => crypto.randomBytes(bytes).toString('base64url');

export function createPkce() {
  const verifier = crypto.randomBytes(48).toString('base64url'); // 64 chars, within RFC 7636's 43-128
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge, method: 'S256' };
}

export function safeEqual(a, b) {
  const x = Buffer.from(String(a)); const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
