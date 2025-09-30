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
        try { 
          localStorage.setItem('osrx_auth_path', JSON.stringify({ path: 'dev', at: Date.now() }))
          localStorage.setItem('osrx_dev_user', JSON.stringify(profile))
        } catch {}
        return profile
      }
      
      console.log('❌ Invalid dev password. Use: dev, test, or admin')
      throw new Error('For localhost, use password: dev, test, or admin')
    }

    // Production: Real Supabase authentication
    console.log('🌐 Production mode: Real Supabase auth')
    
    // Skip connectivity test and go straight to authentication with bounded timeout
    const authTimeoutMs = (import.meta as any)?.env?.VITE_AUTH_TIMEOUT_MS ? Number((import.meta as any).env.VITE_AUTH_TIMEOUT_MS) : 12000
    console.log(`🔄 Starting authentication with ${Math.round(authTimeoutMs/1000)}-second timeout...`)
    
    try {
      // Sign-in with bounded timeout
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password
      })
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.log(`⏰ TIMEOUT: Supabase auth exceeded ${Math.round(authTimeoutMs/1000)} seconds`)
          reject(new Error(`Authentication timeout after ${Math.round(authTimeoutMs/1000)} seconds`))
        }, authTimeoutMs)
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
      
      // IMMEDIATE fallback to direct API call (using env-configured Supabase URL/key)
      console.log('🚀 IMMEDIATE fallback to direct Supabase API call...')
      try {
        const su = ((import.meta as any)?.env?.VITE_SUPABASE_URL as string || '').trim()
        const sk = ((import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string || '').trim()
        if (!su || !sk) throw new Error('Supabase env missing for direct fallback')

        const directResponse = await Promise.race([
          fetch(`${su}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': sk,
              'Authorization': `Bearer ${sk}`,
            },
            body: JSON.stringify({ email, password })
          }),
          new Promise((_, reject) => 
            setTimeout(() => {
              console.log('⏰ TIMEOUT: Direct API exceeded 2 seconds')
              reject(new Error('Direct API timeout after 2 seconds'))
            }, 2000)
          )
        ]) as Response;
        
        console.log('🌐 Direct API response status:', directResponse.status)
        if (directResponse.ok) {
          const data = await directResponse.json()
          console.log('✅ Direct API login successful', { hasAccessToken: !!data.access_token })
          
          // Parse JWT token directly instead of using setSession (which hangs)
          console.log('🎯 Bypassing setSession, parsing JWT directly...')
          try {
            const token = data.access_token
            const payload = JSON.parse(atob(token.split('.')[1]))
            console.log('🔍 JWT payload parsed:', { sub: payload.sub, email: payload.email, exp: payload.exp })
            
            // Create user object from JWT payload
            const user = {
              id: payload.sub,
              email: payload.email,
              created_at: new Date(payload.iat * 1000).toISOString(),
              user_metadata: {}
            }
            
            const userProfile = await this.buildUserProfile(user)
            console.log('✅ User profile created from JWT:', { id: userProfile.id, email: userProfile.email })
            
            // Store tokens and user for session persistence
            try { 
              localStorage.setItem('osrx_auth_path', JSON.stringify({ path: 'jwt-direct', at: Date.now() }))
              localStorage.setItem('osrx_auth_tokens', JSON.stringify({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_at: payload.exp * 1000, // Convert to milliseconds
                stored_at: Date.now()
              }))
              localStorage.setItem('osrx_user_profile', JSON.stringify(userProfile))
            } catch {}
            
            return userProfile
          } catch (jwtError) {
            console.log('❌ JWT parsing failed, attempting setSession...', jwtError)
            // Fallback to setSession with timeout
            const setSessionPromise = supabase.auth.setSession({
              access_token: data.access_token,
              refresh_token: data.refresh_token,
            } as any)
            
            const setTimeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('setSession timeout')), 1000)
            )
            
            const { data: setData, error: setErr } = await Promise.race([setSessionPromise, setTimeoutPromise]) as any
            if (setErr) throw setErr
            if (!setData?.session?.user) throw new Error('Failed to establish session from direct login')
            const userProfile = await this.buildUserProfile(setData.session.user)
            try { 
              localStorage.setItem('osrx_auth_path', JSON.stringify({ path: 'direct-api-fallback', at: Date.now() }))
              // For setSession success, also store user profile for session persistence
              localStorage.setItem('osrx_user_profile', JSON.stringify(userProfile))
            } catch {}
            return userProfile
          }
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
      // First try Supabase session
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        console.log('🔄 Restored user from Supabase session')
        return this.buildUserProfile(session.user)
      }

      // Check for stored auth path to determine how user was authenticated
      const authPath = (() => {
        try {
          const stored = localStorage.getItem('osrx_auth_path')
          return stored ? JSON.parse(stored) : null
        } catch {
          return null
        }
      })()

      if (!authPath) {
        console.log('🚫 No authentication path found')
        return null
      }

      console.log('🔍 Found auth path:', authPath)

      // Handle dev users for localhost
      if (authPath.path === 'dev' && window.location.hostname === 'localhost') {
        console.log('🔄 Restoring dev user session')
        // For dev mode, we need to recreate the user from stored email or default
        const storedDevUser = (() => {
          try {
            const stored = localStorage.getItem('osrx_dev_user')
            return stored ? JSON.parse(stored) : null
          } catch {
            return null
          }
        })()
        
        if (storedDevUser) {
          return storedDevUser
        } else {
          // Create default dev user if no stored user found
          const defaultEmail = 'dev@oncosaferx.com'
          return this.createDevUser(defaultEmail)
        }
      }

      // For production JWT-based authentication, check for stored tokens
      if (['jwt-direct', 'direct-api-fallback'].includes(authPath.path)) {
        console.log('🔄 Checking stored JWT tokens for session restoration')
        
        const storedTokens = (() => {
          try {
            const stored = localStorage.getItem('osrx_auth_tokens')
            return stored ? JSON.parse(stored) : null
          } catch {
            return null
          }
        })()
        
        const storedUser = (() => {
          try {
            const stored = localStorage.getItem('osrx_user_profile')
            return stored ? JSON.parse(stored) : null
          } catch {
            return null
          }
        })()
        
        if (storedTokens && storedUser) {
          // Check if token is still valid (with 5 minute buffer)
          const now = Date.now()
          const expiresAt = storedTokens.expires_at
          const isExpired = now >= (expiresAt - 5 * 60 * 1000) // 5 minute buffer
          
          console.log('🔍 Token validation:', {
            hasTokens: !!storedTokens.access_token,
            hasUser: !!storedUser.id,
            expiresAt: new Date(expiresAt).toISOString(),
            isExpired,
            timeLeft: Math.round((expiresAt - now) / 1000 / 60) + ' minutes'
          })
          
          if (!isExpired) {
            console.log('✅ Restored user from stored JWT tokens')
            return storedUser
          } else {
            console.log('⏰ Stored tokens expired, clearing auth data')
            this.clearStoredAuth()
          }
        }
      }
      
      console.log('🚫 No valid session found for auth path:', authPath.path)
      return null

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
    this.clearStoredAuth()
  }

  /**
   * Clear all stored authentication data
   */
  private static clearStoredAuth(): void {
    // Clean up all stored auth data
    localStorage.removeItem('osrx_dev_auth')
    localStorage.removeItem('osrx_dev_user')
    localStorage.removeItem('osrx_auth_path')
    localStorage.removeItem('osrx_auth_tokens')
    localStorage.removeItem('osrx_user_profile')
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
    
    try {
      // Update user metadata in Supabase auth
      const { data, error } = await supabase.auth.updateUser({
        data: {
          first_name: updates.firstName,
          last_name: updates.lastName,
          role: updates.role,
          specialty: updates.specialty,
          institution: updates.institution,
          license_number: updates.licenseNumber,
          years_experience: updates.yearsExperience,
          preferences: updates.preferences,
          persona: updates.persona
        }
      })
      
      if (error) throw new Error(error.message)
      
      console.log('✅ Profile updated successfully')
      return this.buildUserProfile(data.user!)
    } catch (error) {
      console.error('Failed to update user profile:', error)
      throw error
    }
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
