/**
 * CDS Hooks service configuration.
 *
 *   CDS_TRUSTED_ISSUERS   JSON map of EHR issuer -> { "jwksUri": "https://.../jwks" }, e.g.
 *                         {"https://ehr.example.com":{"jwksUri":"https://ehr.example.com/.well-known/jwks.json"}}
 *   CDS_PUBLIC_BASE_URL   public origin of this API (no trailing slash); the JWT `aud` must be
 *                         <base>/cds-services/<id>[/feedback]
 *
 * In production every service request must carry a valid EHR-signed JWT. Unsigned requests are
 * accepted only when NODE_ENV is development or test (for the public CDS Hooks sandbox).
 */
import { isDefaultUserAllowed } from '../utils/defaultUser.js';

export function getCdsConfig(env = process.env) {
  let trustedIssuers = {};
  const problems = [];
  if (env.CDS_TRUSTED_ISSUERS) {
    try {
      const parsed = JSON.parse(env.CDS_TRUSTED_ISSUERS);
      for (const [iss, v] of Object.entries(parsed || {})) {
        if (v && typeof v.jwksUri === 'string' && v.jwksUri.startsWith('https://')) trustedIssuers[iss.replace(/\/+$/, '')] = { jwksUri: v.jwksUri };
      }
    } catch { problems.push('CDS_TRUSTED_ISSUERS (invalid JSON)'); }
  }
  const allowUnsigned = isDefaultUserAllowed(env);
  const publicBaseUrl = String(env.CDS_PUBLIC_BASE_URL || '').replace(/\/+$/, '');
  if (!allowUnsigned) {
    if (!Object.keys(trustedIssuers).length) problems.push('CDS_TRUSTED_ISSUERS');
    if (!publicBaseUrl) problems.push('CDS_PUBLIC_BASE_URL');
  }
  return { trustedIssuers, publicBaseUrl, allowUnsigned, problems, jwksTtlMs: 10 * 60 * 1000 };
}
