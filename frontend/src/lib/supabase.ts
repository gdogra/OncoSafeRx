import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

console.log('Environment variables loaded:', {
  supabaseUrl: supabaseUrl ? '✓ Set' : '✗ Missing',
  supabaseKey: supabaseAnonKey ? '✓ Set' : '✗ Missing',
  allEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key not found in environment variables')
  console.warn('Available environment variables:', import.meta.env)
  
  // Fallback to hardcoded values for now (not recommended for production)
  const fallbackUrl = supabaseUrl || 'https://emfrwckxctyarphjvfeu.supabase.co'
  const fallbackKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZnJ3Y2t4Y3R5YXJwaGp2ZmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjM2NjcsImV4cCI6MjA3MzYzOTY2N30.yYrhigcrMY82OkA4KPqSANtN5YgeA6xGH9fnrTe5k8c'
  
  console.warn('Using fallback Supabase configuration')
  
  export const supabase = createClient(fallbackUrl, fallbackKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
} else {
  export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}

export type { User } from '@supabase/supabase-js'