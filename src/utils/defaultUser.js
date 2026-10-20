/**
 * Unauthenticated "default user" fallback.
 *
 * Only ever allowed when NODE_ENV is exactly 'development' or 'test'. It is never
 * allowed anywhere else, production included: neither a request header (`x-osrx-guest`) nor an env flag can
 * turn it on there, because anyone can send a header and the default user maps
 * to a real account.
 */
export const DEFAULT_DEV_USER_ID = 'b8b17782-7ecc-492a-9213-1d5d7fb69c5a';

export function isDefaultUserAllowed(env = process.env) {
  // Allow-list, not deny-list: an unset or unexpected NODE_ENV (staging, empty)
  // must fail closed.
  return env.NODE_ENV === 'development' || env.NODE_ENV === 'test';
}

export function defaultDevUser() {
  return { id: DEFAULT_DEV_USER_ID, email: 'dev@oncosaferx.com', role: 'oncologist', isDefault: true };
}

/** Attach the default user to req when allowed and nobody is signed in. */
export function attachDefaultUserIfAllowed(req, env = process.env) {
  if (!req.user && isDefaultUserAllowed(env)) {
    req.user = defaultDevUser();
    return true;
  }
  return false;
}
