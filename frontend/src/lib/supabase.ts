import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://emfrwckxctyarphjvfeu.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZnJ3Y2t4Y3R5YXJwaGp2ZmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjM2NjcsImV4cCI6MjA3MzYzOTY2N30.yYrhigcrMY82OkA4KPqSANtN5YgeA6xGH9fnrTe5k8c'

console.log('Environment variables loaded:', {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing (using fallback)',
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing (using fallback)',
  allEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
})

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Using fallback Supabase configuration - environment variables not found')
  console.warn('Available environment variables:', import.meta.env)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type { User } from '@supabase/supabase-js'