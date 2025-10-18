import dotenv from 'dotenv'
dotenv.config()

export function validateEnv() {
  const env = process.env
  const isProd = (env.NODE_ENV || 'development') === 'production'

  const problems = []

  if (isProd) {
    if (!env.JWT_SECRET || env.JWT_SECRET === 'your-secret-key-change-in-production' || env.JWT_SECRET.includes('change')) {
      problems.push('JWT_SECRET must be a strong, non-default value')
    }
    if (!env.CORS_ORIGIN || env.CORS_ORIGIN.trim() === '*') {
      console.warn('CORS_ORIGIN is wildcard in production; restrict to your domains')
    }
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      console.warn('Missing SUPABASE_URL or SUPABASE_ANON_KEY; frontend auth may fail')
    }
  }

  if (problems.length) {
    const message = `Invalid production configuration:\n - ${problems.join('\n - ')}`
    console.error(message)
    throw new Error(message)
  }
}

export function getBoolean(name, def = false) {
  const v = (process.env[name] || '').toLowerCase()
  if (v === 'true' || v === '1' || v === 'yes') return true
  if (v === 'false' || v === '0' || v === 'no') return false
  return def
}

