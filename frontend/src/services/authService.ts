import { supabase } from '../lib/supabase'
import { UserProfile, LoginData, SignupData, UserPersona } from '../types/user'

/**
 * Clean, simple authentication service
 */
export class SupabaseAuthService {
  
  /**
   * Sign in a user - CLEAN VERSION
   */
  static async login(data: LoginData): Promise<UserProfile> {
    const email = (data.email || '').trim().toLowerCase()
    const password = (data.password || '').trim()

    console.log('🔐 Login attempt for:', email)

    // Do NOT force production by default; honor URL/localStorage flags
    
    // Check for force production mode (add ?prod=true to URL or localStorage)
    const urlParams = new URLSearchParams(window.location.search)
    const prodParam = urlParams.get('prod')
    const localStorageForce = localStorage.getItem('osrx_force_production') === 'true'
    const forceProduction = prodParam === 'true' || prodParam === '1' || localStorageForce
    
    // If URL has prod param, save to localStorage for future use
    if (prodParam === 'true' || prodParam === '1') {
      localStorage.setItem('osrx_force_production', 'true')
    } else if (prodParam === 'false' || prodParam === '0') {
      localStorage.removeItem('osrx_force_production')
    }
    
    console.log('🔧 Enhanced Debug URL check:', {
      url: window.location.href,
      search: window.location.search,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      prodParam: prodParam,
      prodParamType: typeof prodParam,
      localStorageForce: localStorageForce,
      forceProduction: forceProduction,
      allParams: Object.fromEntries(urlParams.entries())
    })

    // For localhost development - instant bypass (unless force production)
    if (window.location.hostname === 'localhost' && !forceProduction) {
      console.log('⚡ LOCALHOST: Using dev mode')
      
      // Simple dev credentials
      if (password === 'dev' || password === 'test' || password === 'admin') {
        console.log('✅ Dev credentials accepted')
        const profile = this.createDevUser(email)
        try { localStorage.setItem('osrx_auth_path', JSON.stringify({ path: 'dev', at: Date.now() })) } catch {}
        return profile
      }
      
      console.log('❌ Invalid dev password. Use: dev, test, or admin')
      throw new Error('For localhost, use password: dev, test, or admin')
    }

    // Production: Real Supabase authentication
    console.log('🌐 Production mode: Real Supabase auth')
    
    // First, test Supabase connectivity
    try {
      console.log('🔍 Testing Supabase connectivity...')
      const { data: { session } } = await supabase.auth.getSession()
      console.log('✅ Supabase connection successful', { hasSession: !!session })
    } catch (connError) {
      console.warn('⚠️ Supabase connectivity issue:', connError)
    }
    
    try {
      // Add shorter timeout for faster feedback
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password
      })
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Authentication timeout after 5 seconds')), 5000)
      })
      
      console.log('🔄 Attempting Supabase authentication...')
      const { data: authData, error } = await Promise.race([authPromise, timeoutPromise]) as any

      console.log('🔍 Auth response:', { authData: !!authData, error: !!error, errorMessage: error?.message })
      
      if (error) {
        console.log('❌ Supabase error:', error.message, error)
        // Optional fallback: try server-side proxy if enabled
        const envProxy = (import.meta as any).env?.VITE_SUPABASE_AUTH_VIA_PROXY === 'true'
        const lsProxy = (() => { try { return localStorage.getItem('osrx_use_auth_proxy') === 'true' } catch { return false } })()
        const useProxy = envProxy || lsProxy
        if (useProxy) {
          try {
            const resp = await fetch('/api/supabase-auth/proxy/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });
            if (resp.ok) {
              const body = await resp.json();
              // Set the Supabase session directly using returned tokens
              const { data: setData, error: setErr } = await supabase.auth.setSession({
                access_token: body.access_token,
                refresh_token: body.refresh_token,
              } as any);
              if (setErr) throw setErr;
              if (!setData?.session?.user) throw new Error('Failed to establish session');
              console.log('✅ Proxy auth successful');
              const userProfile = await this.buildUserProfile(setData.session.user);
              try { localStorage.setItem('osrx_auth_path', JSON.stringify({ path: 'proxy', at: Date.now() })) } catch {}
              return userProfile;
            }
          } catch (proxyErr) {
            console.warn('Auth proxy fallback failed:', proxyErr);
          }
        }
        throw new Error(error.message)
      }

      if (!authData.user || !authData.session) {
        console.log('❌ No user/session returned', { user: !!authData.user, session: !!authData.session })
        throw new Error('Authentication failed')
      }

      console.log('✅ Supabase auth successful', { 
        userId: authData.user.id, 
        email: authData.user.email,
        confirmed: authData.user.email_confirmed_at,
        lastSignIn: authData.user.last_sign_in_at 
      })
      const userProfile = await this.buildUserProfile(authData.user)
      try { localStorage.setItem('osrx_auth_path', JSON.stringify({ path: 'direct', at: Date.now() })) } catch {}
      return userProfile

    } catch (error) {
      console.log('💥 Auth error:', error)
      
      // Always try direct API call as fallback for better reliability
      console.log('🔄 Trying direct Supabase API call as fallback...')
      try {
        const directResponse = await Promise.race([
          fetch(`https://emfrwckxctyarphjvfeu.supabase.co/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZnJ3Y2t4Y3R5YXJwaGp2ZmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjM2NjcsImV4cCI6MjA3MzYzOTY2N30.yYrhigcrMY82OkA4KPqSANtN5YgeA6xGH9fnrTe5k8c',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZnJ3Y2t4Y3R5YXJwaGp2ZmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjM2NjcsImV4cCI6MjA3MzYzOTY2N30.yYrhigcrMY82OkA4KPqSANtN5YgeA6xGH9fnrTe5k8c'
            },
            body: JSON.stringify({
              email,
              password
            })
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Direct API timeout')), 3000)
          )
        ]) as Response;
        
        console.log('🌐 Direct API response status:', directResponse.status)
        if (directResponse.ok) {
          const data = await directResponse.json()
          console.log('✅ Direct API login successful', { hasAccessToken: !!data.access_token })
          
          // Set session manually using Supabase client
          const { data: setData, error: setErr } = await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          })
          
          if (setErr) {
            console.log('❌ Session setup failed:', setErr)
            throw setErr
          }
          
          if (!setData?.session?.user) {
            console.log('❌ No user in session data')
            throw new Error('Failed to establish session')
          }
          
          console.log('✅ Session established via direct API')
          const userProfile = await this.buildUserProfile(setData.session.user)
          try { localStorage.setItem('osrx_auth_path', JSON.stringify({ path: 'direct-api', at: Date.now() })) } catch {}
          return userProfile
        } else {
          const errorText = await directResponse.text()
          console.log('❌ Direct API failed:', directResponse.status, errorText)
        }
      } catch (apiError) {
        console.log('💥 Direct API error:', apiError)
      }
      
      throw error
    }
  }

  /**
   * Sign up a new user
   */
  static async signup(data: SignupData): Promise<UserProfile> {
    console.log('📝 Signup attempt for:', data.email)

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            role: data.role,
            specialty: data.specialty || '',
            institution: data.institution || '',
            license_number: data.licenseNumber || '',
            years_experience: data.yearsExperience || 0
          }
        }
      })

      if (error) {
        console.log('❌ Signup error:', error.message)
        throw new Error(error.message)
      }

      if (!authData.user) {
        throw new Error('Signup failed - no user created')
      }

      console.log('✅ Signup successful, check email for confirmation')
      return this.buildUserProfile(authData.user, data)

    } catch (error) {
      console.log('💥 Signup error:', error)
      throw error
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return null

      return this.buildUserProfile(session.user)
    } catch (error) {
      console.log('Error getting current user:', error)
      return null
    }
  }

  /**
   * Sign out current user
   */
  static async logout(): Promise<void> {
    await supabase.auth.signOut()
    localStorage.removeItem('osrx_dev_auth')
  }

  /**
   * Create development user for localhost
   */
  private static createDevUser(email: string): UserProfile {
    return {
      id: 'dev-' + email.replace('@', '-at-').replace('.', '-dot-'),
      email: email,
      firstName: email.split('@')[0] || 'Dev',
      lastName: 'User',
      role: 'oncologist',
      specialty: 'Medical Oncology',
      institution: 'Development Hospital',
      licenseNumber: 'DEV123456',
      yearsExperience: 5,
      preferences: this.getDefaultPreferences('oncologist'),
      persona: this.createDefaultPersona('oncologist'),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
      roles: ['oncologist'],
      permissions: ['read', 'write', 'analyze']
    }
  }

  /**
   * Build user profile from Supabase user
   */
  private static async buildUserProfile(user: any, fallbackData?: SignupData): Promise<UserProfile> {
    const role = user.user_metadata?.role || fallbackData?.role || 'oncologist'
    
    return {
      id: user.id,
      email: user.email || fallbackData?.email || '',
      firstName: user.user_metadata?.first_name || fallbackData?.firstName || '',
      lastName: user.user_metadata?.last_name || fallbackData?.lastName || '',
      role,
      specialty: user.user_metadata?.specialty || fallbackData?.specialty || '',
      institution: user.user_metadata?.institution || fallbackData?.institution || '',
      licenseNumber: user.user_metadata?.license_number || fallbackData?.licenseNumber || '',
      yearsExperience: user.user_metadata?.years_experience || fallbackData?.yearsExperience || 0,
      preferences: this.getDefaultPreferences(role),
      persona: this.createDefaultPersona(role),
      createdAt: user.created_at || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
      roles: [role],
      permissions: this.getRolePermissions(role)
    }
  }

  /**
   * Get default preferences for role
   */
  private static getDefaultPreferences(role: string) {
    return {
      theme: 'light',
      notifications: true,
      autoSave: true,
      language: 'en'
    }
  }

  /**
   * Create default persona for role
   */
  private static createDefaultPersona(role: string): UserPersona {
    return {
      id: 'default-' + role,
      name: role.charAt(0).toUpperCase() + role.slice(1),
      role: role as any,
      preferences: {
        aiAssistanceLevel: 'moderate',
        clinicalFocus: role === 'oncologist' ? 'treatment' : 'general',
        riskTolerance: 'moderate'
      },
      isActive: true,
      createdAt: new Date().toISOString()
    }
  }

  /**
   * Get permissions for role
   */
  private static getRolePermissions(role: string): string[] {
    const permissions = {
      oncologist: ['read', 'write', 'prescribe', 'analyze'],
      pharmacist: ['read', 'write', 'dispense', 'analyze'],
      nurse: ['read', 'write', 'administer'],
      researcher: ['read', 'analyze', 'export'],
      student: ['read']
    }
    return permissions[role] || ['read']
  }

  /**
   * Subscribe to auth state changes
   */
  static onAuthStateChange(callback: (user: UserProfile | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const profile = await this.getCurrentUser()
          callback(profile)
        } catch (error) {
          console.error('Error in auth state change:', error)
          callback(null)
        }
      } else {
        callback(null)
      }
    })
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string, redirectTo?: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${window.location.origin}/reset-password`
    })
    if (error) throw new Error(error.message)
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('No authenticated user')
    
    return this.buildUserProfile(user.user)
  }

  /**
   * Request magic link
   */
  static async requestMagicLink(email: string, redirectTo?: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo || `${window.location.origin}/`
      }
    })
    if (error) throw new Error(error.message)
  }
}
