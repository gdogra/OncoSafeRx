import { supabase } from '../lib/supabase'
import { UserProfile, SignupData, LoginData, UserPersona } from '../types/user'

export class SupabaseAuthService {
  /**
   * Sign up a new user with email and password
   */
  static async signup(data: SignupData): Promise<UserProfile> {
    const { email, password, firstName, lastName, role, specialty, institution, licenseNumber, yearsExperience } = data

    // Create auth user - the database trigger will handle creating the profile
    const { data: authData, error: authError } = await supabase.auth.signUp({
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

    if (authError) {
      console.error('Signup error:', authError)
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Failed to create user account')
    }

    console.log('Signup successful:', {
      userId: authData.user.id,
      email: authData.user.email,
      emailConfirmed: authData.user.email_confirmed_at,
      needsConfirmation: !authData.session
    })

    // If email confirmation is required, throw a specific error
    if (!authData.session) {
      throw new Error('Please check your email and click the confirmation link to complete your registration.')
    }

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Try to fetch the created profile from users table
    let profileData = null
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()
      
      if (!error) {
        profileData = data
      } else {
        console.warn('Users table not accessible, using auth metadata:', error.message)
      }
    } catch (error) {
      console.warn('Users table not available, using auth metadata:', error)
    }

    if (!profileData) {
      console.log('Creating profile from auth metadata')
      // Return a basic profile using auth user metadata
      return {
        id: authData.user.id,
        email,
        firstName,
        lastName,
        role,
        specialty: specialty || '',
        institution: institution || '',
        licenseNumber: licenseNumber || '',
        yearsExperience: yearsExperience || 0,
        preferences: {
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
        },
        persona: this.createDefaultPersona(role),
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
      }
    }

    // Convert database fields to frontend format
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
      preferences: profileData.preferences || {
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
      },
      persona: profileData.persona || this.createDefaultPersona(role),
      createdAt: profileData.created_at,
      lastLogin: profileData.last_login,
      isActive: profileData.is_active,
    }
  }

  /**
   * Sign in an existing user
   */
  static async login(data: LoginData): Promise<UserProfile> {
    const { email, password } = data

    console.log('Starting login process for:', email)
    
    // Test Supabase connectivity first with timeout
    let supabaseReachable = false
    try {
      console.log('Testing Supabase connectivity...')
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
      
      const healthCheck = await fetch('https://emfrwckxctyarphjvfeu.supabase.co/rest/v1/', {
        method: 'HEAD',
        headers: { 'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZnJ3Y2t4Y3R5YXJwaGp2ZmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjM2NjcsImV4cCI6MjA3MzYzOTY2N30.yYrhigcrMY82OkA4KPqSANtN5YgeA6xGH9fnrTe5k8c' },
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      console.log('Supabase connectivity test result:', healthCheck.status)
      supabaseReachable = true
    } catch (error) {
      console.error('Supabase connectivity test failed:', error)
      
      // Fallback to demo mode when Supabase is unreachable
      console.log('Using demo mode authentication')
      if (email === 'demo@oncosaferx.com' && password === 'demo123') {
        return {
          id: 'demo-user-id',
          email: 'demo@oncosaferx.com',
          firstName: 'Demo',
          lastName: 'User',
          role: 'oncologist' as const,
          specialty: 'Medical Oncology',
          institution: 'Demo Hospital',
          licenseNumber: 'DEMO-12345',
          yearsExperience: 5,
          preferences: {
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
              showGenomicsByDefault: true,
              autoCalculateDosing: true,
              requireInteractionAck: true,
              showPatientPhotos: false,
            },
          },
          persona: this.createDefaultPersona('oncologist'),
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true,
        }
      }
      
      throw new Error('Cannot reach Supabase servers - try demo login: demo@oncosaferx.com / demo123')
    }

    // Check for demo credentials even if Supabase is reachable
    if (email === 'demo@oncosaferx.com' && password === 'demo123') {
      console.log('Demo credentials detected - using demo mode')
      return {
        id: 'demo-user-id',
        email: 'demo@oncosaferx.com',
        firstName: 'Demo',
        lastName: 'User',
        role: 'oncologist' as const,
        specialty: 'Medical Oncology',
        institution: 'Demo Hospital',
        licenseNumber: 'DEMO-12345',
        yearsExperience: 5,
        preferences: {
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
            showGenomicsByDefault: true,
            autoCalculateDosing: true,
            requireInteractionAck: true,
            showPatientPhotos: false,
          },
        },
        persona: this.createDefaultPersona('oncologist'),
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
      }
    }
    
    // Add shorter timeout for Supabase auth call
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Supabase auth timeout - check network connection')), 10000)
    )
    
    console.log('Calling Supabase signInWithPassword...')
    const loginPromise = supabase.auth.signInWithPassword({
      email,
      password
    })
    
    const { data: authData, error: authError } = await Promise.race([loginPromise, timeoutPromise])

    console.log('Supabase auth response:', { authData, authError })

    if (authError) {
      console.error('Login error:', authError)
      if (authError.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and click the confirmation link before signing in.')
      }
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Failed to authenticate user')
    }

    console.log('Attempting to fetch user profile...')
    
    // Try to get user profile from users table
    let profileData = null
    try {
      console.log('Querying users table for user ID:', authData.user.id)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()
      
      if (!error) {
        profileData = data
        console.log('Users table query successful, updating last login')
        // Update last login if users table is available
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', authData.user.id)
      } else {
        console.warn('Users table not accessible, using auth metadata:', error.message)
      }
    } catch (error) {
      console.warn('Users table not available, using auth metadata:', error)
    }

    if (!profileData) {
      console.log('Creating profile from auth user metadata')
      // Create profile from auth user metadata
      return {
        id: authData.user.id,
        email: authData.user.email || email,
        firstName: authData.user.user_metadata?.first_name || '',
        lastName: authData.user.user_metadata?.last_name || '',
        role: authData.user.user_metadata?.role || 'user',
        specialty: authData.user.user_metadata?.specialty || '',
        institution: authData.user.user_metadata?.institution || '',
        licenseNumber: authData.user.user_metadata?.license_number || '',
        yearsExperience: authData.user.user_metadata?.years_experience || 0,
        preferences: {
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
            showGenomicsByDefault: authData.user.user_metadata?.role === 'oncologist' || authData.user.user_metadata?.role === 'pharmacist',
            autoCalculateDosing: authData.user.user_metadata?.role === 'oncologist' || authData.user.user_metadata?.role === 'pharmacist',
            requireInteractionAck: true,
            showPatientPhotos: false,
          },
        },
        persona: this.createDefaultPersona(authData.user.user_metadata?.role || 'user'),
        createdAt: authData.user.created_at,
        lastLogin: new Date().toISOString(),
        isActive: true,
      }
    }

    // Convert database fields to frontend format
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
      preferences: profileData.preferences || {
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
          showGenomicsByDefault: profileData.role === 'oncologist' || profileData.role === 'pharmacist',
          autoCalculateDosing: profileData.role === 'oncologist' || profileData.role === 'pharmacist',
          requireInteractionAck: true,
          showPatientPhotos: false,
        },
      },
      persona: profileData.persona || this.createDefaultPersona(profileData.role),
      createdAt: profileData.created_at,
      lastLogin: profileData.last_login,
      isActive: profileData.is_active,
    }
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

    // Try to get user profile from users table
    let profileData = null
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (!error) {
        profileData = data
      } else {
        console.warn('Users table not accessible, using auth metadata:', error.message)
      }
    } catch (error) {
      console.warn('Users table not available, using auth metadata:', error)
    }

    if (!profileData) {
      // Create profile from auth user metadata
      return {
        id: session.user.id,
        email: session.user.email || '',
        firstName: session.user.user_metadata?.first_name || '',
        lastName: session.user.user_metadata?.last_name || '',
        role: session.user.user_metadata?.role || 'user',
        specialty: session.user.user_metadata?.specialty || '',
        institution: session.user.user_metadata?.institution || '',
        licenseNumber: session.user.user_metadata?.license_number || '',
        yearsExperience: session.user.user_metadata?.years_experience || 0,
        preferences: {
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
            showGenomicsByDefault: session.user.user_metadata?.role === 'oncologist' || session.user.user_metadata?.role === 'pharmacist',
            autoCalculateDosing: session.user.user_metadata?.role === 'oncologist' || session.user.user_metadata?.role === 'pharmacist',
            requireInteractionAck: true,
            showPatientPhotos: false,
          },
        },
        persona: this.createDefaultPersona(session.user.user_metadata?.role || 'user'),
        createdAt: session.user.created_at,
        lastLogin: new Date().toISOString(),
        isActive: true,
      }
    }

    // Convert database fields to frontend format
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
      preferences: profileData.preferences || {
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
          showGenomicsByDefault: profileData.role === 'oncologist' || profileData.role === 'pharmacist',
          autoCalculateDosing: profileData.role === 'oncologist' || profileData.role === 'pharmacist',
          requireInteractionAck: true,
          showPatientPhotos: false,
        },
      },
      persona: profileData.persona || this.createDefaultPersona(profileData.role),
      createdAt: profileData.created_at,
      lastLogin: profileData.last_login,
      isActive: profileData.is_active,
    }
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
   * Get backend API URL
   */
  private static getApiUrl(): string {
    const url = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    console.log('API URL from environment:', url)
    return url
  }

  /**
   * Get current session token for API calls
   */
  static async getSessionToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  /**
   * Verify authentication with backend using Supabase token
   */
  static async verifyWithBackend(): Promise<UserProfile | null> {
    try {
      const apiUrl = this.getApiUrl()
      
      // Skip backend verification if no API URL, localhost, or api.oncosaferx.com
      if (!apiUrl || apiUrl.includes('localhost') || apiUrl.includes('api.oncosaferx.com')) {
        console.log('Skipping backend verification - no backend API available or invalid URL')
        return null
      }

      const token = await this.getSessionToken()
      if (!token) return null

      const response = await fetch(`${apiUrl}/supabase-auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Backend verification failed:', response.status)
        return null
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      console.log('Backend verification skipped due to error:', error.message)
      return null
    }
  }

  /**
   * Subscribe to auth state changes
   */
  static onAuthStateChange(callback: (user: UserProfile | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          // First try to get profile from Supabase
          const profile = await this.getCurrentUser()
          
          // Also verify with backend (for hybrid auth)
          const backendProfile = await this.verifyWithBackend()
          
          // Use backend profile if available, otherwise use Supabase profile
          callback(backendProfile || profile)
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