import { supabase } from '../lib/supabase'
import { UserProfile, SignupData, LoginData, UserPersona } from '../types/user'

export class SupabaseAuthService {
  /**
   * Sign up a new user with email and password
   */
  static async signup(data: SignupData): Promise<UserProfile> {
    const { email, password, firstName, lastName, role, specialty, institution, licenseNumber, yearsExperience } = data

    console.log('Starting signup process for:', email)

    try {
      const viaProxy = (import.meta as any)?.env?.VITE_SUPABASE_AUTH_VIA_PROXY === 'true'
      let authData: any = null
      let authError: any = null

      if (viaProxy) {
        try {
          console.log('Attempting proxy signup...')
          const apiUrl = this.getApiUrl()
          const resp = await fetch(`${apiUrl}/supabase-auth/proxy/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              password,
              metadata: {
                first_name: firstName,
                last_name: lastName,
                role,
                specialty,
                institution,
                license_number: licenseNumber,
                years_experience: yearsExperience
              }
            })
          })
          const body = await resp.json().catch(() => ({}))
          if (!resp.ok) {
            console.warn('Proxy signup failed, falling back to direct:', resp.status, body)
            throw new Error(body?.error || `Proxy signup failed: ${resp.status}`)
          }
          if (body?.access_token && body?.refresh_token) {
            const { data: setData, error: setErr } = await supabase.auth.setSession({
              access_token: body.access_token,
              refresh_token: body.refresh_token
            })
            if (setErr) throw setErr
            authData = setData
          } else {
            // Confirmation email required; no session set yet
            authData = { user: { id: body?.user?.id || 'pending', email }, session: null }
          }
        } catch (e: any) {
          console.warn('Proxy signup failed, falling back to direct Supabase:', e?.message || e)
          authError = null // Reset error to try direct signup
        }
      }
      
      if (!authData) {
        // Create auth user with metadata (direct)
        const res = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              role,
              specialty,
              institution,
              license_number: licenseNumber,
              years_experience: yearsExperience
            }
          }
        })
        authData = res.data
        authError = res.error
      }

      if (authError) {
        console.error('Signup error:', authError)
        
        // Provide user-friendly error messages
        if (authError.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.')
        }
        if (authError.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 6 characters long.')
        }
        if (authError.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.')
        }
        
        throw new Error(authError.message)
      }

      if (!authData?.user) {
        throw new Error('Failed to create user account')
      }

      console.log('Signup successful:', {
        userId: authData.user.id,
        email: authData.user.email,
        emailConfirmed: authData.user.email_confirmed_at,
        hasSession: !!authData.session
      })

      // If email confirmation is required
      if (!authData.session) {
        throw new Error('Account created successfully! Please check your email and click the confirmation link to complete registration.')
      }

      // Return user profile (session exists, so user is confirmed)
      return this.buildUserProfile(authData.user, {
        firstName,
        lastName,
        role,
        specialty,
        institution,
        licenseNumber,
        yearsExperience
      })

    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    }
  }

  /**
   * Sign in an existing user
   */
  static async login(data: LoginData): Promise<UserProfile> {
    const { email, password } = data

    console.log('🔑 Starting login process for:', email)
    
    // Check for demo credentials (guarded by env)
    const allowDemo = ((import.meta as any)?.env?.VITE_ALLOW_DEMO_LOGIN || '').toString() === 'true'
    if (allowDemo && email === 'demo@oncosaferx.com' && password === 'demo123') {
      console.log('🎭 Demo credentials detected - using demo mode')
      return this.createDemoUser()
    }

    try {
      const viaProxy = (import.meta as any)?.env?.VITE_SUPABASE_AUTH_VIA_PROXY === 'true'
      console.log('🔧 Proxy mode:', viaProxy ? 'enabled' : 'disabled')
      
      let authData: any = null
      let authError: any = null

      // Add timeout wrapper for all auth operations
      const timeoutMs = 15000 // 15 second timeout
      console.log('⏱️  Setting timeout:', timeoutMs + 'ms')

      const authPromise = async () => {
        if (viaProxy) {
          // Prefer server proxy to avoid client-side blockers
          try {
            console.log('🌐 Attempting proxy login...')
            const apiUrl = this.getApiUrl()
            console.log('🌐 API URL:', apiUrl)
            
            const resp = await fetch(`${apiUrl}/supabase-auth/proxy/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            })
            const body = await resp.json()
            if (resp.ok && body?.access_token && body?.refresh_token) {
              const { data: setData, error: setErr } = await supabase.auth.setSession({
                access_token: body.access_token,
                refresh_token: body.refresh_token
              })
              if (setErr) throw setErr
              authData = setData
              console.log('✅ Proxy login successful')
            } else {
              throw new Error(body?.error || 'Proxy login failed')
            }
          } catch (e: any) {
            console.warn('❌ Proxy login failed, attempting direct sign-in...', e?.message || e)
            authData = null // Reset to try direct
          }
        }

        if (!authData) {
          console.log('🔗 Calling Supabase signInWithPassword directly...')
          const res = await supabase.auth.signInWithPassword({ email, password })
          authData = res.data
          authError = res.error
          console.log('📡 Direct Supabase response:', { 
            hasUser: !!authData?.user, 
            hasSession: !!authData?.session, 
            error: authError?.message 
          })
        }

        return { authData, authError }
      }

      // Wrap in timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => {
          console.error('⏰ Login timeout after', timeoutMs + 'ms')
          reject(new Error(`Login timeout after ${timeoutMs/1000} seconds`))
        }, timeoutMs)
      )

      const result = await Promise.race([authPromise(), timeoutPromise]) as any
      authData = result.authData
      authError = result.authError

      if (authError) {
        console.error('❌ Login error:', authError)
        await this.handleAuthError(authError, email)
      }

      if (!authData?.user || !authData?.session) {
        console.error('❌ Invalid auth data:', { 
          hasUser: !!authData?.user, 
          hasSession: !!authData?.session 
        })
        throw new Error('Failed to authenticate user')
      }

      console.log('✅ Login successful for user:', authData.user.id)

      // Update last login in users table if it exists
      try {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', authData.user.id)
        console.log('📝 Updated last_login timestamp')
      } catch (error) {
        console.log('⚠️  Could not update last_login in users table:', error)
      }

      // Return user profile
      console.log('👤 Building user profile...')
      const profile = await this.buildUserProfile(authData.user)
      console.log('✅ User profile built successfully')
      return profile

    } catch (error) {
      console.error('💥 Login failed:', error)
      throw error
    }
  }

  /**
   * Get backend API URL
   */
  private static getApiUrl(): string {
    return (import.meta as any)?.env?.VITE_API_URL || `${window.location.origin.replace(':5173',':3000')}/api`
  }

  /**
   * Sign out the current user
   */
  static async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Get the current authenticated user
   */
  static async getCurrentUser(): Promise<UserProfile | null> {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return null
    }

    return this.buildUserProfile(session.user)
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`)
    }

    return data
  }

  /**
   * Build user profile from Supabase auth user
   */
  private static async buildUserProfile(authUser: any, fallbackData?: any): Promise<UserProfile> {
    console.log('🏗️  Building user profile for user ID:', authUser.id)
    
    // Try to get profile from users table first
    let profileData = null
    try {
      console.log('🔍 Querying users table...')
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
      
      if (!error) {
        profileData = data
        console.log('✅ Found user profile in users table:', profileData.email)
      } else {
        console.log('⚠️  Users table not accessible, using auth metadata:', error.message)
      }
    } catch (error) {
      console.log('⚠️  Users table not available, using auth metadata:', error)
    }

    if (profileData) {
      // Return profile from users table
      return {
        id: profileData.id,
        email: profileData.email,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        role: profileData.role,
        specialty: profileData.specialty || '',
        institution: profileData.institution || '',
        licenseNumber: profileData.license_number || '',
        yearsExperience: profileData.years_experience || 0,
        preferences: profileData.preferences || this.getDefaultPreferences(profileData.role),
        persona: profileData.persona || this.createDefaultPersona(profileData.role),
        createdAt: profileData.created_at,
        lastLogin: profileData.last_login,
        isActive: profileData.is_active,
      }
    }

    // Fallback to auth user metadata
    const role = authUser.user_metadata?.role || fallbackData?.role || 'student'
    return {
      id: authUser.id,
      email: authUser.email || fallbackData?.email || '',
      firstName: authUser.user_metadata?.first_name || fallbackData?.firstName || '',
      lastName: authUser.user_metadata?.last_name || fallbackData?.lastName || '',
      role,
      specialty: authUser.user_metadata?.specialty || fallbackData?.specialty || '',
      institution: authUser.user_metadata?.institution || fallbackData?.institution || '',
      licenseNumber: authUser.user_metadata?.license_number || fallbackData?.licenseNumber || '',
      yearsExperience: authUser.user_metadata?.years_experience || fallbackData?.yearsExperience || 0,
      preferences: this.getDefaultPreferences(role),
      persona: this.createDefaultPersona(role),
      createdAt: authUser.created_at || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
    }
  }

  /**
   * Handle authentication errors with user-friendly messages
   */
  private static async handleAuthError(authError: any, email: string): Promise<never> {
    const errorMessage = authError.message || 'Authentication failed'
    
    if (errorMessage.includes('Email not confirmed')) {
      throw new Error('Please check your email and click the confirmation link before signing in.')
    }
    
    if (errorMessage.includes('Invalid login credentials')) {
      // Check if user exists to provide better guidance
      const userExists = await this.checkUserExists(email)
      if (userExists) {
        throw new Error('Invalid password. Please check your password and try again.')
      } else {
        throw new Error('No account found with this email. Please sign up first.')
      }
    }
    
    if (errorMessage.includes('Email link is invalid or has expired')) {
      throw new Error('Email confirmation link has expired. Please request a new confirmation email.')
    }
    
    if (errorMessage.includes('too many requests')) {
      throw new Error('Too many login attempts. Please wait a few minutes before trying again.')
    }
    
    if (errorMessage.includes('Network error') || errorMessage.includes('timeout')) {
      throw new Error('Connection timeout. Please check your internet connection and try again.')
    }
    
    throw new Error(errorMessage)
  }

  /**
   * Create demo user profile
   */
  private static createDemoUser(): UserProfile {
    return {
      id: 'demo-user-id',
      email: 'demo@oncosaferx.com',
      firstName: 'Demo',
      lastName: 'User',
      role: 'oncologist',
      specialty: 'Medical Oncology',
      institution: 'Demo Hospital',
      licenseNumber: 'DEMO-12345',
      yearsExperience: 5,
      preferences: this.getDefaultPreferences('oncologist'),
      persona: this.createDefaultPersona('oncologist'),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
    }
  }

  /**
   * Get default preferences based on role
   */
  private static getDefaultPreferences(role: UserProfile['role']) {
    return {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        criticalAlerts: true,
        weeklyReports: true,
      },
      dashboard: {
        defaultView: 'overview',
        refreshInterval: 5000,
        compactMode: false,
      },
      clinical: {
        showGenomicsByDefault: role === 'oncologist' || role === 'pharmacist',
        autoCalculateDosing: role === 'oncologist' || role === 'pharmacist',
        requireInteractionAck: true,
        showPatientPhotos: false,
      },
    }
  }

  /**
   * Create default persona based on role
   */
  static createDefaultPersona(role: UserProfile['role']): UserPersona {
    const personaConfigs = {
      oncologist: {
        name: 'Medical Oncologist',
        description: 'Comprehensive cancer care specialist',
        experienceLevel: 'expert' as const,
        specialties: ['solid tumors', 'precision medicine'],
        preferences: {
          riskTolerance: 'moderate' as const,
          alertSensitivity: 'medium' as const,
          workflowStyle: 'thorough' as const,
          decisionSupport: 'consultative' as const,
        },
      },
      pharmacist: {
        name: 'Clinical Pharmacist',
        description: 'Medication therapy management specialist',
        experienceLevel: 'expert' as const,
        specialties: ['oncology pharmacy', 'drug interactions'],
        preferences: {
          riskTolerance: 'conservative' as const,
          alertSensitivity: 'high' as const,
          workflowStyle: 'thorough' as const,
          decisionSupport: 'guided' as const,
        },
      },
      nurse: {
        name: 'Oncology Nurse',
        description: 'Direct patient care and medication administration',
        experienceLevel: 'intermediate' as const,
        specialties: ['patient care', 'medication administration'],
        preferences: {
          riskTolerance: 'conservative' as const,
          alertSensitivity: 'high' as const,
          workflowStyle: 'efficient' as const,
          decisionSupport: 'guided' as const,
        },
      },
      researcher: {
        name: 'Clinical Researcher',
        description: 'Cancer research and data analysis specialist',
        experienceLevel: 'expert' as const,
        specialties: ['clinical trials', 'genomics research'],
        preferences: {
          riskTolerance: 'moderate' as const,
          alertSensitivity: 'low' as const,
          workflowStyle: 'collaborative' as const,
          decisionSupport: 'autonomous' as const,
        },
      },
      student: {
        name: 'Healthcare Student',
        description: 'Learning healthcare professional',
        experienceLevel: 'novice' as const,
        specialties: ['general medicine'],
        preferences: {
          riskTolerance: 'conservative' as const,
          alertSensitivity: 'high' as const,
          workflowStyle: 'guided' as const,
          decisionSupport: 'guided' as const,
        },
      },
    }

    const config = personaConfigs[role]
    return {
      id: `persona-${Date.now()}`,
      name: config.name,
      description: config.description,
      role,
      experienceLevel: config.experienceLevel,
      specialties: config.specialties,
      preferences: config.preferences,
      customSettings: {},
    }
  }

  /**
   * Get current session token for API calls
   */
  static async getSessionToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  /**
   * Resend confirmation email
   */
  static async resendConfirmation(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Request password reset email
   */
  static async requestPasswordReset(email: string, redirectTo?: string): Promise<void> {
    const viaProxy = (import.meta as any)?.env?.VITE_SUPABASE_AUTH_VIA_PROXY === 'true'
    if (viaProxy) {
      const apiUrl = this.getApiUrl()
      const resp = await fetch(`${apiUrl}/supabase-auth/proxy/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirectTo })
      })
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}))
        throw new Error(j?.error || 'Failed to send password reset email')
      }
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${window.location.origin}/reset-password`
    })
    if (error) throw new Error(error.message)
  }

  /**
   * Check if user exists in auth.users
   */
  static async checkUserExists(email: string): Promise<boolean> {
    try {
      // Try to trigger password reset to see if user exists
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      // If no error, user exists
      return !error
    } catch (error) {
      return false
    }
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
          console.error('Error fetching user profile:', error)
          callback(null)
        }
      } else {
        callback(null)
      }
    })
  }
}
