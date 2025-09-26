Production Readiness Guide

1) Environment and Secrets
- Set `NODE_ENV=production`.
- Set a strong `JWT_SECRET` (32+ random bytes). Do not use defaults.
- Set `CORS_ORIGIN` to your exact origins (comma-separated), not `*`.
- Supabase:
  - Backend: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (optional but required for server-side user creation).
  - Frontend build: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
  - Optional: `SUPABASE_AUTH_EMAIL_CONFIRM=true|false` to auto-confirm users created via the server register route.
- Security headers:
  - `ENABLE_CSP=true` to enable Content-Security-Policy.
  - `ENABLE_HSTS=true` when serving strictly over HTTPS.
- Optional: `AUTH_PROXY_ENABLED=true` and `PROXY_ALLOWED_ORIGINS=https://app.example.com` to enable server-side Supabase auth proxy.
- Optional: Protect metrics with `METRICS_TOKEN`.

2) Build and Run (Docker)
- Build:
  docker build \
    --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    -t oncosaferx:latest .

- Run:
  docker run -d --name oncosaferx \
    -e NODE_ENV=production \
    -e PORT=3000 \
    -e CORS_ORIGIN="https://app.example.com,https://admin.example.com" \
    -e JWT_SECRET=replace_me \
    -e SUPABASE_URL=$SUPABASE_URL \
    -e SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
    -e SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
    -e ENABLE_CSP=true \
    -e ENABLE_HSTS=true \
    -p 3000:3000 oncosaferx:latest

3) Reverse Proxy (Nginx)
- Use `docs/nginx.production.conf` as a baseline.
- Terminate TLS at the proxy and forward to the container.
- Set the proper `X-Forwarded-*` headers and keep-alive.

4) Supabase Setup
- Configure Auth email settings (SMTP) if requiring email confirmations.
- Apply the schema from `frontend/supabase-schema.sql` to create `public.users` and the `auth.users` trigger.
- Rotate any previously exposed anon keys.

5) Security Hardening
- Validate env at boot: the app now fails fast on weak/missing secrets in production.
- Enable CSP/HSTS and verify allowed origins in CORS and CSP `connectSrc` (Supabase domains).
- Keep rate limiting configured (`RATE_LIMIT_*`). For high availability, consider a shared store (e.g., Redis) instead of in-memory.
- Run as non-root in Docker (already configured).

6) Observability
- Metrics available at `/metrics` (Prometheus format). Protect with `METRICS_TOKEN` in production.
- Structured JSON logs are emitted via morgan; pipe them to your log collector.

7) CI/CD
- Optionally use `ecosystem.config.js` with PM2 on a VM.
- For GitHub Actions or your platform’s pipelines, ensure frontend build args and secrets are injected.

8) Feature Flags / Dev Paths
- Localhost dev login is only enabled on `localhost` and off when `?prod=true` or localStorage `osrx_force_production` is set.
- The server-side Supabase auth proxy is off by default; enable only if your environment blocks direct Supabase auth requests.

Checklist
- [ ] Domain and TLS configured
- [ ] CORS and CSP allowlists set to exact domains
- [ ] JWT_SECRET set (strong), Supabase envs set
- [ ] Email settings configured in Supabase (if required)
- [ ] DB schema and triggers applied
- [ ] Docker image built from a clean state, non-root user
- [ ] Metrics endpoint protected
- [ ] Logs shipped to centralized logging

