import { supabase } from '../lib/supabase'
import { UserProfile, SignupData, LoginData, UserPersona } from '../types/user'

export class SupabaseAuthService {
  /**
   * Sign up a new user with email and password
   */
  static async signup(data: SignupData): Promise<UserProfile> {
    const { email, password, firstName, lastName, role, specialty, institution, licenseNumber, yearsExperience } = data

    // Create auth user
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
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Failed to create user account')
    }

    // Create user profile in users table
    const userProfile: Omit<UserProfile, 'id'> = {
      email,
      firstName,
      lastName,
      role,
      specialty,
      institution,
      licenseNumber,
      yearsExperience,
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

    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert([{ 
        id: authData.user.id,
        ...userProfile
      }])
      .select()
      .single()

    if (profileError) {
      // If profile creation fails, clean up auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(`Failed to create user profile: ${profileError.message}`)
    }

    return { id: authData.user.id, ...userProfile }
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
      .update({ lastLogin: new Date().toISOString() })
      .eq('id', authData.user.id)

    return profileData
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

    return profileData
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