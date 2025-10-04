import React, { useEffect, useMemo, useState } from 'react'

type ApiHealth = {
  status?: string
  supabase?: { enabled?: boolean }
}

const STORAGE_KEY = 'osrx_hide_env_banner'

function safeLocalStorageGet(key: string) {
  try { return localStorage.getItem(key) } catch { return null }
}
function safeLocalStorageSet(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch {}
}

export default function EnvDiagnosticsBanner() {
  const [hidden, setHidden] = useState<boolean>(() => safeLocalStorageGet(STORAGE_KEY) === 'true')
  const [api, setApi] = useState<ApiHealth | null>(null)

  const su = ((import.meta as any)?.env?.VITE_SUPABASE_URL as string || '').trim()
  const sk = ((import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string || '').trim()
  const proxy = (((import.meta as any)?.env?.VITE_SUPABASE_AUTH_VIA_PROXY as string) || '').toLowerCase() === 'true'
  const apiBase = ((import.meta as any)?.env?.VITE_API_URL as string || '/api').replace(/\/$/, '')


  const reason = useMemo(() => {
    const issues: string[] = []
    if (!su) issues.push('Supabase URL missing')
    if (!sk) issues.push('Supabase anon key missing')
    if (su.includes('placeholder') || sk.includes('placeholder')) issues.push('Placeholder Supabase values detected')
    return issues.join('; ')
  }, [su, sk])

  const shouldShow = useMemo(() => {
    if (hidden) return false
    if (proxy) return false
    if (!reason) return false
    return true
  }, [hidden, reason, proxy])

  useEffect(() => {
    let cancelled = false
    // Query backend health to surface server-side Supabase status
    fetch(`${apiBase}/health`, { credentials: 'omit' })
      .then(r => r.ok ? r.json() : null)
      .then((j: ApiHealth | null) => { if (!cancelled) setApi(j) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [apiBase])

  if (!shouldShow) return null

  const hide = () => { setHidden(true); safeLocalStorageSet(STORAGE_KEY, 'true') }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10000,
      background: '#FDE68A', color: '#1F2937', borderBottom: '1px solid #F59E0B'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 600 }}>Environment notice</span>
        <span style={{ fontSize: 13 }}>
          {reason}. Configure VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY at build time.
          {api?.supabase?.enabled === false && (
            <>
              {' '}Server Supabase: disabled (check backend env).
            </>
          )}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <a href="/auth-diagnostics" style={{ fontSize: 12, color: '#1D4ED8', textDecoration: 'underline' }}>Auth diagnostics</a>
          <button onClick={hide} style={{ fontSize: 12, padding: '4px 8px', background: '#F59E0B', color: 'white', border: 0, borderRadius: 4, cursor: 'pointer' }}>Dismiss</button>
        </div>
      </div>
    </div>
  )
}
