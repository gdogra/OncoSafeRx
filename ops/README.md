# Ops Guide

## Reverse Proxy (Nginx)

Run Nginx in front of the API and frontend:

```bash
docker compose --profile proxy up -d nginx oncosaferx-api
```

- HTTP: exposed on port 80 (enable TLS in config when certs are provisioned)
- Config: `ops/nginx/nginx.conf` (gzip, caching, forwarded headers)

## Monitoring (Prometheus + Grafana)

Bring up the stack:

```bash
docker compose --profile monitoring up -d prometheus grafana oncosaferx-api
```

- Prometheus: http://localhost:9090 (scrapes `/metrics` from API)
- Grafana: http://localhost:3001 (admin/admin)
  - Add Prometheus as a data source at `http://prometheus:9090`
  - Import a dashboard or create panels for `http_request_duration_seconds` and `nodejs_*` metrics

## CI/CD

GitHub Actions workflow at `.github/workflows/ci.yml`:

- Installs deps, lints, tests backend; builds frontend
- Builds Docker image (push disabled by default)
- Run `npm audit` (high severity) step

GHCR publish is wired in `.github/workflows/ci.yml`:

- On tag push `v*`, builds and publishes `ghcr.io/<owner>/<repo>:<tag>` and `:latest`.
- Requires default `GITHUB_TOKEN` (already provided) with `packages: write`.

Local push via Makefile:

```bash
make docker-login-ghcr GHCR_USER=<your-gh-username> GHCR_TOKEN=<a_pat_with_write:packages>
make docker-push-ghcr GHCR_IMAGE=ghcr.io/<owner>/<repo> TAG=v1.0.0
```

## Environment & Secrets

- Use environment variables in deployment (Kubernetes/Compose). Avoid committing secrets.
- For production secrets, use a secrets manager and inject at runtime.

## Production Tips

- TLS/HTTPS (Nginx)

Provide your certs under `ops/nginx/certs` (e.g., `fullchain.pem`, `privkey.pem`) and switch to `nginx-ssl.conf`:

```bash
docker compose --profile proxy down
docker compose --profile proxy up -d \
  -f docker-compose.yml \
  -f ops/nginx/nginx-ssl.conf
```

Alternatively, use an ACME client like certbot in your infra and mount certs into the container. The provided Nginx config now serves the ACME HTTP-01 challenge path from `/var/www/certbot`.

### Let's Encrypt with certbot (HTTP-01)

This repo includes a `certbot` service that renews certificates and shares them with Nginx.

Initial issuance (one-off command):

```bash
# Replace with your domain and email
DOMAIN=yourdomain.com EMAIL=you@example.com \
docker run --rm \
  -v "$PWD/ops/nginx/certs:/etc/letsencrypt" \
  -v "$PWD/ops/nginx/www:/var/www/certbot" \
  certbot/certbot certonly --webroot -w /var/www/certbot \
  -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive

# Restart nginx to pick up certs, then launch renewer
docker compose --profile proxy up -d nginx certbot
```

Ensure DNS points to your server and ports 80/443 are open. Renewal runs every 12h.

## Kubernetes (optional)

Manifests under `k8s/`:

- `deployment-api.yaml`: API Deployment with probes and resource limits.
- `service-api.yaml`: ClusterIP Service on port 80 → container 3000.
- `ingress.yaml`: Ingress for `yourdomain.com` with cert-manager annotations.
- `servicemonitor.yaml`: Prometheus Operator scrape config for `/metrics`.

If you prefer annotations instead of ServiceMonitor, annotate the Service to enable Prometheus scraping.

Usage:

```bash
kubectl apply -f k8s/deployment-api.yaml
kubectl apply -f k8s/service-api.yaml
kubectl apply -f k8s/ingress.yaml
# If using Prometheus Operator
kubectl apply -f k8s/servicemonitor.yaml
```

Replace `yourdomain.com` and image reference in manifests. Ensure NGINX Ingress and cert-manager are installed; set `letsencrypt-prod` ClusterIssuer.

- Terminate TLS at Nginx/Ingress; set `trust proxy` and correct CORS origins.
- Scale API replicas behind Nginx/Ingress; `/metrics` endpoint supports Prometheus scraping.
- Tune rate limits via env; consider IP allowlists at proxy/WAF if needed.
