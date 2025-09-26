import { createClient } from '@supabase/supabase-js'

// Environment variables with fallback for production debugging
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string || 'https://emfrwckxctyarphjvfeu.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZnJ3Y2t4Y3R5YXJwaGp2ZmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjM2NjcsImV4cCI6MjA3MzYzOTY2N30.yYrhigcrMY82OkA4KPqSANtN5YgeA6xGH9fnrTe5k8c'

console.log('Environment variables loaded:', {
  supabaseUrl: supabaseUrl ? '✓ Loaded' : '✗ Missing (using fallback)',
  supabaseKey: supabaseAnonKey ? '✓ Loaded' : '✗ Missing (using fallback)',
  allEnvVars: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'))
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Using fallback Supabase configuration - environment variables not found')
  console.log('Available environment variables:', import.meta.env)
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
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
