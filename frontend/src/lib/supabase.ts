import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  const msg = 'Supabase environment missing: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY'
  if (import.meta.env.MODE === 'production') {
    throw new Error(msg)
  } else {
    console.warn(msg, { url: supabaseUrl ? 'set' : 'missing', key: supabaseAnonKey ? 'set' : 'missing' })
  }
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    debug: import.meta.env.MODE !== 'production',
    flowType: 'pkce'
  },
  global: {
    headers: { 'X-Client-Info': 'supabase-js-web' }
  },
  realtime: {
    params: { eventsPerSecond: 10 }
  }
})

export type { User } from '@supabase/supabase-js'
