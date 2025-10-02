import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import NoAuthApp from './NoAuthApp';
import ErrorBoundary from './components/System/ErrorBoundary';
import reportWebVitals from './reportWebVitals';
// Optional Sentry init (dynamic, safe if dependency absent)
try {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined
  if (dsn) {
    // dynamic import so devs not using Sentry aren't forced to install
    import('@sentry/react').then(Sentry => {
      Sentry.init({
        dsn,
        environment: (import.meta.env.VITE_SENTRY_ENV as string) || import.meta.env.MODE,
        release: (import.meta.env.VITE_SENTRY_RELEASE as string) || undefined,
        tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || 0.1)
      })
      // mark init path for diagnostics
      try { localStorage.setItem('osrx_sentry', JSON.stringify({ enabled: true, at: Date.now() })) } catch {}
    }).catch(() => {})
  }
} catch {}

async function bootstrap() {
  try {
    const hasEnv = !!(import.meta as any)?.env?.VITE_SUPABASE_URL && !!(import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY
    if (!hasEnv) {
      const resp = await fetch('/api/frontend/config')
      if (resp.ok) {
        const cfg = await resp.json()
        if (cfg?.supabaseUrl && cfg?.supabaseAnonKey) {
          ;(window as any).__OSRX_SUPABASE_URL__ = String(cfg.supabaseUrl)
          ;(window as any).__OSRX_SUPABASE_KEY__ = String(cfg.supabaseAnonKey)
        }
      }
    }
  } catch {}

  const App = (await import('./App')).default
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  )
}

bootstrap()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
