import { createClient } from '@supabase/supabase-js'

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || ''
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || ''
const supabaseUrl = rawUrl.trim()
const supabaseAnonKey = rawKey.trim()

console.log('Environment variables loaded:', {
  supabaseUrl: supabaseUrl ? '✓ Loaded' : '✗ Missing',
  supabaseKey: supabaseAnonKey ? '✓ Loaded' : '✗ Missing',
  allEnvVars: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'))
})

if (!supabaseUrl || !supabaseAnonKey) {
  const msg = 'Supabase env missing: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY'
  if (import.meta.env.MODE === 'production') {
    throw new Error(msg)
  } else {
    console.warn(msg)
  }
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
