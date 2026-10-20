/** Fetch and validate the EHR's SMART configuration. Only called for allow-listed `iss` values. */
export async function fetchJson(url, { fetchImpl = fetch, timeoutMs = 8000, headers = {} } = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, { headers: { accept: 'application/json', ...headers }, signal: ctl.signal, redirect: 'error' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (text.length > 1_000_000) throw new Error('response too large');
    return JSON.parse(text);
  } finally {
    clearTimeout(t);
  }
}

const isHttps = (u, allowLocalHttp) => {
  try {
    const x = new URL(u);
    return x.protocol === 'https:' || (allowLocalHttp && x.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(x.hostname));
  } catch { return false; }
};

export async function discover(iss, { fetchImpl, allowLocalHttp = false } = {}) {
  const conf = await fetchJson(`${iss}/.well-known/smart-configuration`, { fetchImpl });
  if (!isHttps(conf.authorization_endpoint, allowLocalHttp) || !isHttps(conf.token_endpoint, allowLocalHttp)) {
    throw new Error('SMART configuration is missing secure authorization/token endpoints');
  }
  const methods = conf.code_challenge_methods_supported;
  if (Array.isArray(methods) && !methods.includes('S256')) {
    throw new Error('EHR does not support PKCE S256');
  }
  return {
    authorization_endpoint: conf.authorization_endpoint,
    token_endpoint: conf.token_endpoint,
    jwks_uri: conf.jwks_uri && isHttps(conf.jwks_uri, allowLocalHttp) ? conf.jwks_uri : null,
    issuer: conf.issuer || null,
  };
}
