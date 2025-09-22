# Security and Secrets Guide

This document outlines how to manage secrets and secure authentication.

## Supabase Keys

- Keys in use:
  - Anon key (client): used by the frontend SDK.
  - Service role key (server): used only on the API server.

### Rotate Keys

1. In Supabase dashboard → Settings → API:
   - Click “Generate new” for the Anon key.
   - Click “Generate new” for the Service Role key.
2. Update deployment environments:
   - API server env: `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL`.
   - Frontend env: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Redeploy both API and Frontend.
4. Confirm auth flows and database access. Existing sessions remain valid; users may need to re-login depending on expiration.

## Auth Proxy

- Enable guarded endpoints on the API by setting:
  - `AUTH_PROXY_ENABLED=true`
  - `PROXY_ALLOWED_ORIGINS=https://app.example.com,http://localhost:5173`
- Endpoints:
  - `POST /api/supabase-auth/proxy/login`
  - `POST /api/supabase-auth/proxy/signup`
  - `POST /api/supabase-auth/proxy/reset`
- Each endpoint is origin-checked, rate-limited per IP+email, and input-validated.
- Set `VITE_SUPABASE_AUTH_VIA_PROXY=true` on the frontend to prefer the proxy.

## CORS and CSP

- API: Set `CORS_ORIGIN` to explicit origins (comma-separated), not `*`.
- Frontend (Netlify): `connect-src` restricted to Supabase and API domains in `netlify.toml`.

## Logging and PII

- Proxy login/signup failures log masked emails only.
- Avoid logging tokens or raw request bodies.

## Demo Login

- Disabled by default. To allow only in dev/test, set `VITE_ALLOW_DEMO_LOGIN=true`.

## Incident response

1. Rotate keys in Supabase.
2. Update deployment envs and redeploy.
3. Invalidate sessions if needed via Supabase admin.
4. Review logs (without PII) and metrics: `auth_proxy_requests_total`.

