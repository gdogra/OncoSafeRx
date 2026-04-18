// Force browser to reload when new version is deployed
export const VERSION_CHECK = {
  current: "2026-04-17.002",
  timestamp: Date.now()
};

export function checkForUpdates() {
  const currentVersion = localStorage.getItem('app_version');
  if (currentVersion !== VERSION_CHECK.current) {
    console.log('🔄 New version detected, forcing reload...');
    localStorage.setItem('app_version', VERSION_CHECK.current);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    return true;
  }
  return false;
}

/**
 * Self-heal for stale SPA cache.
 *
 * When a new Netlify deploy ships, lazy-loaded chunk hashes change.
 * If a user has an old index.html in browser/SW cache, its <script>
 * references for AuthPage-XXXX.js etc. no longer exist. Netlify's
 * SPA fallback returns index.html (HTML) for those requests, and the
 * browser rejects it with "MIME type of text/html" + "Failed to fetch
 * dynamically imported module".
 *
 * This listener catches those specific errors and forces a single
 * hard reload + SW unregister so the user gets the fresh bundle.
 *
 * Safe-guards against reload loops via a one-shot sessionStorage key.
 */
export function setupChunkLoadErrorHealing() {
  if (typeof window === 'undefined') return;

  const ALREADY_RELOADED = 'osrx_chunk_reload';

  const handleChunkError = (message: string) => {
    const looksLikeChunkError =
      /Failed to fetch dynamically imported module/i.test(message) ||
      /Loading chunk \d+ failed/i.test(message) ||
      /Loading CSS chunk/i.test(message) ||
      /MIME type.*text\/html/i.test(message);

    if (!looksLikeChunkError) return;

    // Reload once per session to avoid loops
    if (sessionStorage.getItem(ALREADY_RELOADED)) return;
    sessionStorage.setItem(ALREADY_RELOADED, '1');

    console.warn('🔄 Detected stale chunk — unregistering SW and hard-reloading');

    (async () => {
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(r => r.unregister()));
        }
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }
      } catch {}
      window.location.reload();
    })();
  };

  window.addEventListener('error', (e) => {
    const msg = [e?.message, (e?.error as any)?.message].filter(Boolean).join(' ');
    handleChunkError(msg);
  }, true);

  window.addEventListener('unhandledrejection', (e) => {
    const msg = String((e.reason as any)?.message || e.reason || '');
    handleChunkError(msg);
  });
}