import React, { useEffect, useMemo, useState } from 'react'

type ApiHealth = {
  status?: string
  version?: string
  supabase?: { enabled?: boolean }
  warnings?: string[]
}

type ConfigCheck = {
  supabase?: { enabled?: boolean; urlPresent?: boolean; serviceRolePresent?: boolean; jwtSecretPresent?: boolean }
  frontend?: { serveFrontend?: any; nodeEnv?: string; buildPathExists?: boolean; indexExists?: boolean }
  warnings?: string[]
}

export default function EnvCheck() {
  const [apiHealth, setApiHealth] = useState<ApiHealth | null>(null)
  const [config, setConfig] = useState<ConfigCheck | null>(null)
  const [error, setError] = useState<string | null>(null)

  const env = useMemo(() => {
    const su = ((import.meta as any)?.env?.VITE_SUPABASE_URL as string || '').trim()
    const sk = ((import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string || '').trim()
    const api = ((import.meta as any)?.env?.VITE_API_URL as string || '/api').trim()
    const viaProxy = (((import.meta as any)?.env?.VITE_SUPABASE_AUTH_VIA_PROXY as string) || '').toLowerCase() === 'true'
    return {
      supabaseUrl: su ? 'present' : 'missing',
      supabaseAnonKey: sk ? 'present' : 'missing',
      apiBase: api || '/api',
      supabaseViaProxy: viaProxy,
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const [hRes, cRes] = await Promise.allSettled([
          fetch('/api/health'),
          fetch('/api/config/check')
        ])
        if (hRes.status === 'fulfilled' && hRes.value.ok) {
          const j = await hRes.value.json().catch(() => null)
          if (!cancelled) setApiHealth(j)
        }
        if (cRes.status === 'fulfilled' && cRes.value.ok) {
          const j = await cRes.value.json().catch(() => null)
          if (!cancelled) setConfig(j)
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load diagnostics')
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  const Row = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div style={{ display: 'flex', gap: 12, padding: '6px 0', alignItems: 'center' }}>
      <div style={{ width: 220, color: '#374151' }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  )

  const Badge = ({ ok, text }: { ok: boolean, text: string }) => (
    <span style={{
      padding: '2px 8px', borderRadius: 999,
      background: ok ? '#DEF7EC' : '#FDE8E8',
      color: ok ? '#03543F' : '#9B1C1C',
      fontSize: 12, fontWeight: 600
    }}>{text}</span>
  )

  return (
    <div style={{ maxWidth: 880, margin: '24px auto', padding: 16, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <h1 style={{ margin: 0, marginBottom: 8 }}>Environment Check</h1>
      <p style={{ marginTop: 0, color: '#4B5563' }}>Quick, non-secret diagnostics for build-time and runtime configuration.</p>

      {error && <div style={{ background: '#FDE8E8', color: '#9B1C1C', padding: 8, borderRadius: 6 }}>{error}</div>}

      <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: 12, marginTop: 12 }}>
        <h3 style={{ margin: '4px 0 8px 0' }}>Build-time env (frontend)</h3>
        <Row label="VITE_SUPABASE_URL" value={<Badge ok={env.supabaseUrl === 'present'} text={env.supabaseUrl} />} />
        <Row label="VITE_SUPABASE_ANON_KEY" value={<Badge ok={env.supabaseAnonKey === 'present'} text={env.supabaseAnonKey} />} />
        <Row label="VITE_API_URL" value={<span>{env.apiBase}</span>} />
        <Row label="Auth via proxy" value={<Badge ok={!!env.supabaseViaProxy} text={env.supabaseViaProxy ? 'enabled' : 'disabled'} />} />
      </div>

      <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: 12, marginTop: 12 }}>
        <h3 style={{ margin: '4px 0 8px 0' }}>Runtime health (backend)</h3>
        <Row label="/api/health">
          <Badge ok={apiHealth?.status === 'healthy'} text={apiHealth?.status || 'unknown'} />
        </Row>
        <Row label="Server Supabase">
          <Badge ok={apiHealth?.supabase?.enabled === true} text={apiHealth?.supabase?.enabled ? 'enabled' : 'disabled'} />
        </Row>
      </div>

      <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: 12, marginTop: 12 }}>
        <h3 style={{ margin: '4px 0 8px 0' }}>Server config check</h3>
        <Row label="Supabase configured">
          <Badge ok={config?.supabase?.enabled === true} text={config?.supabase?.enabled ? 'yes' : 'no'} />
        </Row>
        <Row label="SUPABASE_URL present">
          <Badge ok={config?.supabase?.urlPresent === true} text={config?.supabase?.urlPresent ? 'yes' : 'no'} />
        </Row>
        <Row label="Service role present">
          <Badge ok={config?.supabase?.serviceRolePresent === true} text={config?.supabase?.serviceRolePresent ? 'yes' : 'no'} />
        </Row>
        {config?.warnings?.length ? (
          <div style={{ marginTop: 6, color: '#92400E' }}>Warnings: {config.warnings.join(', ')}</div>
        ) : null}
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
        <a href="/auth-diagnostics" style={{ color: '#1D4ED8', textDecoration: 'underline' }}>Go to Auth Diagnostics</a>
        <a href="/" style={{ color: '#374151', textDecoration: 'underline' }}>Back to App</a>
      </div>
    </div>
  )
}

