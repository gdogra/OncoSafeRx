export async function initSentry(dsn: string) {
  try {
    const Sentry = await import('@sentry/react');
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      integrations: [],
      environment: (import.meta as any)?.env?.MODE || 'production',
      release: (import.meta as any)?.env?.VITE_APP_VERSION || undefined,
    });
  } catch (e) {
    // ignore if Sentry SDK is not available
  }
}

