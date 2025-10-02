import { createClient } from '@supabase/supabase-js'

// Multi-source configuration with safe runtime overrides
const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || ''
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || ''

function getLs(key: string): string {
  try { return localStorage.getItem(key) || '' } catch { return '' }
}

const win = (globalThis as any) || {}
const winUrl = (win.__OSRX_SUPABASE_URL__ as string | undefined) || ''
const winKey = (win.__OSRX_SUPABASE_KEY__ as string | undefined) || ''

const runtimeUrl = (getLs('osrx_supabase_url') || winUrl || '').trim()
const runtimeKey = (getLs('osrx_supabase_key') || winKey || '').trim()

const rawUrl = (envUrl || runtimeUrl || '').trim()
const rawKey = (envKey || runtimeKey || '').trim()

const supabaseUrl = (rawUrl || 'https://placeholder.supabase.co')
const supabaseAnonKey = (rawKey || 'placeholder-key')

console.log('Environment variables loaded:', {
  supabaseUrl: supabaseUrl ? '✓ Loaded' : '✗ Missing',
  supabaseKey: supabaseAnonKey ? '✓ Loaded' : '✗ Missing',
  sources: {
    env: { url: !!envUrl, key: !!envKey },
    runtime: { url: !!runtimeUrl, key: !!runtimeKey },
    window: { url: !!winUrl, key: !!winKey }
  },
  allEnvVars: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'))
})

if (!supabaseUrl || !supabaseAnonKey) {
  const msg = 'Supabase env missing: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY'
  // Do not throw — allow authService to fall back to server proxy or direct REST
  console.warn(msg)
  console.warn('Falling back to placeholders; direct Supabase calls may fail. Ensure build-time env or .env.production is set. If proxy mode is enabled, auth will use /api/supabase-auth/proxy/* endpoints.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    debug: import.meta.env.MODE !== 'production',
    flowType: 'pkce',
    storageKey: 'oncosaferx-auth'
  },
  global: {
    headers: { 
      'X-Client-Info': 'supabase-js-web',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    fetch: (url, options = {}) => {
      // Add timeout and better error handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId))
    }
  },
  realtime: {
    params: { eventsPerSecond: 10 }
  }
})

export type { User } from '@supabase/supabase-js'
