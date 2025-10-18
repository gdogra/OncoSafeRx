import dotenv from 'dotenv'
dotenv.config()

let Sentry = null
let sentryEnabled = false

export async function initSentry(app) {
  try {
    const dsn = process.env.SENTRY_DSN
    if (!dsn) return { enabled: false }

    // Lazy ESM import so dev/test without deps does not fail
    const mod = await import('@sentry/node')
    Sentry = mod.default || mod

    Sentry.init({
      dsn,
      environment: process.env.SENTRY_ENV || process.env.NODE_ENV || 'development',
      release: process.env.SENTRY_RELEASE,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
    })

    sentryEnabled = true
    if (app && Sentry?.Handlers) {
      app.use(Sentry.Handlers.requestHandler())
      app.use(Sentry.Handlers.tracingHandler())
    }
    return { enabled: true }
  } catch (e) {
    console.warn('Sentry init skipped:', e?.message || e)
    return { enabled: false, error: e }
  }
}

export function sentryErrorHandler() {
  if (sentryEnabled && Sentry?.Handlers) {
    return Sentry.Handlers.errorHandler()
  }
  return (_err, _req, _res, next) => next()
}
