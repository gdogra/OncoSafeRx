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

    // Fetch the created profile
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.error('Failed to fetch user profile after signup:', profileError)
      // Return a basic profile if the trigger didn't work
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

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

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

    // Get user profile from users table
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      throw new Error(`Failed to fetch user profile: ${profileError.message}`)
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', authData.user.id)

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

    const { data: profileData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('Failed to fetch user profile:', error)
      return null
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
    return import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
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
      const token = await this.getSessionToken()
      if (!token) return null

      const response = await fetch(`${this.getApiUrl()}/supabase-auth/profile`, {
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
      console.error('Backend verification error:', error)
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