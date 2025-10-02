# OncoSafeRx Deployment Guide

## Backend Deployment on Render

### Required Environment Variables

The following environment variables must be configured in the Render dashboard for the backend service to start properly:

#### Required
```bash
# Basic Configuration
NODE_ENV=production
PORT=3000
SERVE_FRONTEND=true

# CORS Configuration
CORS_ORIGIN=https://oncosaferx.netlify.app

# Database (already configured)
SUPABASE_URL=https://emfrwckxctyarphjvfeu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZnJ3Y2t4Y3R5YXJwaGp2ZmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjM2NjcsImV4cCI6MjA3MzYzOTY2N30.yYrhigcrMY82OkA4KPqSANtN5YgeA6xGH9fnrTe5k8c
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZnJ3Y2t4Y3R5YXJwaGp2ZmV1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA2MzY2NywiZXhwIjoyMDczNjM5NjY3fQ.friwElbgi1p0xKV3S7LjDrEuzSFTJZkWp5ot4Xt0Qx0

# Security (GENERATE SECURE VALUES)
JWT_SECRET=YOUR_SECURE_JWT_SECRET_HERE
METRICS_TOKEN=YOUR_SECURE_METRICS_TOKEN_HERE

# Authentication Proxy
AUTH_PROXY_ENABLED=true
PROXY_ALLOWED_ORIGINS=https://oncosaferx.netlify.app
```

#### Optional
```bash
# Security Headers
ENABLE_CSP=true
ENABLE_HSTS=true
CSP_REPORT_ONLY=false

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cache
CACHE_TTL_SECONDS=3600

# Email Confirmation
SUPABASE_AUTH_EMAIL_CONFIRM=true

# Partner Services
PARTNER_PGX_ENABLED=false
```

### Critical Setup Steps for Render

1. **Generate Secure Secrets**
   ```bash
   # For JWT_SECRET (use 32+ character random string)
   openssl rand -base64 32
   
   # For METRICS_TOKEN (use 16+ character random string)
   openssl rand -base64 16
   ```

2. **Service Configuration**
   - Build Command: `npm ci --production`
   - Start Command: `node src/index.js`
   - Environment: `Node`
   - Node Version: `20.19.1`

3. **Health Check**
   - Health Check Path: `/health`
   - Expected Response: `{"status":"healthy","timestamp":"...","version":"1.0.0"}`

### GitHub Action: Deploy API to Render

- Workflow: `Deploy API to Render` (runs on push to main affecting API files, or manually)
- Required secret:
  - `RENDER_DEPLOY_HOOK`: From Render service → Deploy hooks
- Optional secrets (enable status polling + notifications):
  - `RENDER_API_KEY`: Render API token (User → API Keys)
  - `RENDER_SERVICE_ID`: Service ID (visible in Render dashboard or inferred from hook URL)
  - `SLACK_WEBHOOK_URL`: Incoming webhook URL
  - `TEAMS_WEBHOOK`: Incoming webhook URL
  - `RENDER_SERVICE_URL`: Public base URL of your Render service (e.g., https://oncosaferx-backend.onrender.com) for post-deploy health probing
  - `RENDER_ROLLBACK_ON_FAILURE`: Set to `true` to attempt automatic rollback to the most recent successful deploy when a deploy/health check fails
- Behavior:
  - Triggers Render deploy via hook.
  - Polls last deploy status if API key and service id provided.
  - Probes `/health` and `/api/health` on the deployed service when `RENDER_SERVICE_URL` is set.
  - Health probe is enforced: if the service never becomes healthy within ~5 minutes, the workflow fails.
- On failure, optionally attempts rollback to the most recent successful deploy (API support required). Posts Slack/Teams message with rollback result.
  - After rollback, polls rollback deploy status and runs a health probe; sends a final Slack/Teams message with the results.

## Frontend Deployment on Netlify

### Required Environment Variables

```bash
# API Configuration (already configured)
VITE_API_URL=https://oncosaferx-backend.onrender.com/api

# Supabase Configuration (already configured)
VITE_SUPABASE_URL=https://emfrwckxctyarphjvfeu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZnJ3Y2t4Y3R5YXJwaGp2ZmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjM2NjcsImV4cCI6MjA3MzYzOTY2N30.yYrhigcrMY82OkA4KPqSANtN5YgeA6xGH9fnrTe5k8c
```

### Build Configuration (already configured)
- Build Command: `rm -rf node_modules/.cache && npm ci --legacy-peer-deps && npm run build`
- Publish Directory: `dist`
- Base Directory: `frontend`

## Troubleshooting

### Backend Not Starting
- Check environment variables are set correctly in Render dashboard
- Verify JWT_SECRET and METRICS_TOKEN are actual secure values (not placeholder text)
- Check Render logs for specific error messages

### Frontend API Errors
- Verify backend is running and responding to health checks
- Check Netlify proxy configuration in `netlify.toml`
- Verify CORS_ORIGIN matches Netlify deployment URL

### Authentication Issues
- Verify Supabase environment variables are correctly set
- Check CORS configuration allows requests from frontend domain
- Verify AUTH_PROXY_ENABLED and PROXY_ALLOWED_ORIGINS settings

## Current Status

- ✅ Frontend: Deployed and accessible at https://oncosaferx.netlify.app/
- ⚠️ Backend: Requires environment variable configuration in Render dashboard
- ✅ Database: Supabase configured and accessible
- ✅ Authentication: Working with timeout handling and fallbacks

## Next Steps

1. Configure the required environment variables in Render dashboard
2. Redeploy the backend service
3. Test backend health endpoint: `curl https://oncosaferx-backend.onrender.com/health`
4. Verify frontend can connect to backend APIs

## CI/Predeploy Smoke Checks

- Run frontend asset integrity in CI automatically:
  - Step: builds `frontend` and runs `npm run ci:smoke-frontend` to ensure hashed assets exist and Supabase URL is embedded in the bundle.

- Validate built Docker image serves assets correctly (CI):
  - CI starts the image, hits `/health`, fetches `/`, extracts `/assets/*.js`, and verifies 200 responses.

- Manual predeploy smoke against a URL:
  - Workflow: `Predeploy Smoke` (workflow_dispatch)
  - Input: `base_url` (e.g., `https://oncosaferx.netlify.app` or your ingress URL)
  - Checks: `/health`, `/api/health`, and that `/assets/*.js` referenced by `/` is reachable.

## Netlify Deploy via GitHub Actions

- Workflow: `Deploy Frontend to Netlify` (workflow_dispatch)
- Required secret:
  - `NETLIFY_BUILD_HOOK`: Netlify Site settings → Build & deploy → Build hooks → Copy URL
- Optional secrets (enable status polling + notifications):
  - `NETLIFY_API_TOKEN`: Personal Access Token (Netlify User settings → Applications → New Access Token)
  - `NETLIFY_SITE_ID`: Site ID (Netlify Site settings → Site information)
  - `SLACK_WEBHOOK`: Incoming webhook URL
  - `TEAMS_WEBHOOK`: Incoming webhook URL
- Behavior:
  - Triggers Netlify build via build hook.
  - If API token and site id are present, polls latest build until `ready` or `error`.
  - Sends Slack/Teams notification with final state and IDs when finished.
