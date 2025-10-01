# Feedback & Task Creation

OncoSafeRx includes an in‑app feedback widget and API to capture user feedback and turn it into actionable tasks (e.g., GitHub issues) with automatic classification and sprint planning metadata.

## What’s Included

- In‑app feedback widget (`FeedbackButton`) that opens a rich `FeedbackModal`
- Backend endpoint `/api/feedback/submit` that classifies and stores feedback
- Admin endpoints for listing feedback, analytics, status updates, and issue creation
- Optional server‑side GitHub integration to create issues automatically

## Quick Start (Frontend)

The global feedback widget is already mounted in the main layout. Users can click the button to submit feedback with optional reproduction steps and contact info.

## API Endpoints

- `POST /api/feedback/submit` — Submit feedback
- `GET /api/feedback/admin/all` — List feedback (admin)
- `GET /api/feedback/admin/analytics` — Analytics & sprint planning (admin)
- `PATCH /api/feedback/admin/:id/status` — Update status (admin)
- `POST /api/feedback/admin/:id/create-issue` — Create GitHub issue (admin)

Admin endpoints require an email match to `ADMIN_EMAIL` in `src/routes/feedbackRoutes.js` (defaults to `gdogra@gmail.com`). You can swap this for your auth system.

## Server‑Side GitHub Issues (Recommended)

Enable secure, server‑side GitHub issue creation via environment configuration. Set the following env vars for the API server:

- `GITHUB_OWNER` — GitHub username or org (e.g., `your-org`)
- `GITHUB_REPO` — Repository name or `owner/repo` (e.g., `oncosaferx-feedback` or `your-org/oncosaferx-feedback`)
- `GITHUB_TOKEN` — Personal Access Token with `repo` scope (use fine‑grained tokens if possible)
- `GITHUB_API_URL` — Optional; defaults to `https://api.github.com` (use for GitHub Enterprise)
- `FEEDBACK_AUTO_CREATE_ISSUES` — Optional; set `true` to auto‑create issues on submit

When configured, admin can also create issues on demand:

```
POST /api/feedback/admin/:id/create-issue?admin_email=admin@example.com
```

Security note: Creating issues server‑side avoids exposing tokens in the browser. Do not put GitHub tokens in client‑side code in production.

## Data Storage

For the MVP, feedback was stored in memory; now the API will persist to Supabase when configured. If Supabase is not configured, it falls back to in‑memory storage and local browser backups for analytics.

Supabase schema is provided in `supabase-add-feedback.sql`. Run it in your Supabase SQL editor, then set:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)

The API auto-detects credentials and enables persistence.

## Classification & Labels

Submissions are auto‑classified into type, category, priority, effort estimate, and labels based on content and page context. These labels are included when creating GitHub issues to streamline triage and sprint planning.

## Admin UI

- Visit `/admin/feedback` (protected route) to:
  - View feedback list with filters and pagination
  - Update ticket status inline (syncs to server if available)
  - Create GitHub issues per feedback
  - Open analytics dashboard and configure GitHub integration
  - See Supabase/migration status and trigger migration manually

## Admin Permissions & Seeding

- Admin API routes require either:
  - `admin.feedback` permission via RBAC, or
  - `role === 'admin'` on the JWT (fallback)

- Seed RBAC in development using env vars (server):
  - `RBAC_SEED_TENANT_ID=default`
  - `RBAC_SEED_TENANT_ADMIN_USER_IDS="uuid1,uuid2"` (optional)
  - `RBAC_SEED_TENANT_ADMIN_EMAILS="alice@example.com,bob@example.com"` (optional; looks up user IDs via Supabase)

This grants TENANT_ADMIN (which includes `admin.feedback`) to the specified users in the tenant.

Seed diagnostics (server):

- Get seed status preview: `GET /api/admin/rbac/seed-status` (requires admin role)
  - Returns which user IDs were assigned, which emails resolved/unresolved.
