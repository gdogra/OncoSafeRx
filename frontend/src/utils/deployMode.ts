/**
 * Deploy-mode detection.
 *
 * The app supports two deploy shapes:
 *   1. Frontend-only — Vite SPA on Netlify with no Express backend.
 *      All /api/* calls fail. Features that need server-side compute
 *      (admin user CRUD, genomics deep-analysis, EHR/pharmacy sync)
 *      gate themselves off via isFrontendOnly().
 *   2. Full stack — VITE_API_URL points to an Express backend that
 *      proxies Polygon-style work and admin operations.
 *
 * Usage:
 *   if (isFrontendOnly()) return <FeatureUnavailable feature="..." />
 */

export function isFrontendOnly(): boolean {
  try {
    const apiUrl = (import.meta as any)?.env?.VITE_API_URL as string | undefined
    return !apiUrl?.trim()
  } catch {
    return true
  }
}
