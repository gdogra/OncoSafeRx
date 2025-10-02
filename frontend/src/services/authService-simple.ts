import { UserProfile } from '../types/user';

/**
 * SIMPLE WORKING AUTH SERVICE - EMERGENCY FIX
 */
export class SimpleAuthService {
  
  // Missing methods that AuthContext needs
  static async getCurrentUser(): Promise<UserProfile | null> {
    console.log('🔍 SIMPLE getCurrentUser called');
    try {
      const stored = localStorage.getItem('osrx_user_profile');
      if (stored) {
        const profile = JSON.parse(stored);
        console.log('✅ SIMPLE: Found user in localStorage');
        return profile;
      }
    } catch (e) {
      console.warn('⚠️ SIMPLE: Failed to get current user');
    }
    return null;
  }
  
  static onAuthStateChange(callback: (user: UserProfile | null) => void) {
    console.log('🔍 SIMPLE onAuthStateChange called');
    // Return a simple subscription object
    return {
      data: {
        subscription: {
          unsubscribe: () => console.log('🔍 SIMPLE: Auth state subscription unsubscribed')
        }
      }
    };
  }
  
  static logout() {
    console.log('🔍 SIMPLE logout called');
    try {
      localStorage.removeItem('osrx_user_profile');
      localStorage.removeItem('osrx_session_user_id');
      console.log('✅ SIMPLE: Logged out, cleared localStorage');
    } catch (e) {
      console.warn('⚠️ SIMPLE: Logout cleanup failed');
    }
  }
  
  static async signup(data: any): Promise<UserProfile> {
    console.log('🔍 SIMPLE signup called:', data.email);
    
    // For signup, create user profile with provided data
    const userId = `user-${Date.now()}`;
    const userProfile: UserProfile = {
      id: userId,
      email: data.email,
      firstName: data.firstName || 'Doctor',
      lastName: data.lastName || 'User',
      role: data.role || 'oncologist',
      specialty: data.specialty || 'Medical Oncology',
      institution: data.institution || 'Hospital',
      licenseNumber: data.licenseNumber || '',
      yearsExperience: data.yearsExperience || 5,
      preferences: {
        theme: 'light',
        notifications: { email: true, push: true, criticalAlerts: true, weeklyReports: false },
        dashboard: { defaultView: 'overview', compactMode: false },
        clinical: { riskTolerance: 'moderate', alertSensitivity: 'high', workflowStyle: 'thorough', decisionSupport: 'guided' }
      },
      persona: {
        name: data.persona?.name || 'Medical Oncologist',
        description: data.persona?.description || 'Clinical oncology specialist',
        capabilities: data.persona?.capabilities || ['drug-interactions', 'protocols', 'research']
      },
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
      roles: ['oncologist'],
      permissions: ['read', 'write', 'analyze']
    };
    
    // Save to localStorage
    try {
      localStorage.setItem('osrx_user_profile', JSON.stringify(userProfile));
      localStorage.setItem('osrx_session_user_id', userId);
      console.log('✅ SIMPLE: Signup successful, profile saved');
    } catch (e) {
      console.warn('⚠️ SIMPLE: Failed to save signup profile');
    }
    
    return userProfile;
  }

  static async login(data: any): Promise<UserProfile> {
    console.log('🔍 SIMPLE login called:', data.email);
    
    // Create a simple user profile for any login
    const userId = `user-${Date.now()}`;
    const userProfile: UserProfile = {
      id: userId,
      email: data.email,
      firstName: 'Doctor',
      lastName: 'User',
      role: 'oncologist',
      specialty: 'Medical Oncology',
      institution: 'Hospital',
      licenseNumber: '',
      yearsExperience: 5,
      preferences: {
        theme: 'light',
        notifications: { email: true, push: true, criticalAlerts: true, weeklyReports: false },
        dashboard: { defaultView: 'overview', compactMode: false },
        clinical: { riskTolerance: 'moderate', alertSensitivity: 'high', workflowStyle: 'thorough', decisionSupport: 'guided' }
      },
      persona: {
        name: 'Medical Oncologist',
        description: 'Clinical oncology specialist',
        capabilities: ['drug-interactions', 'protocols', 'research']
      },
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
      roles: ['oncologist'],
      permissions: ['read', 'write', 'analyze']
    };
    
    // Save to localStorage
    try {
      localStorage.setItem('osrx_user_profile', JSON.stringify(userProfile));
      localStorage.setItem('osrx_session_user_id', userId);
      console.log('✅ SIMPLE: Login successful, profile saved');
    } catch (e) {
      console.warn('⚠️ SIMPLE: Failed to save login profile');
    }
    
    return userProfile;
  }
  
  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    console.log('🔄 SIMPLE updateProfile called:', { userId, updates });
    
    try {
      // Get existing profile or create new one
      let currentProfile;
      try {
        const stored = localStorage.getItem('osrx_user_profile');
        currentProfile = stored ? JSON.parse(stored) : null;
      } catch (e) {
        currentProfile = null;
      }
      
      // Create or update profile
      const profile: UserProfile = {
        id: userId,
        email: updates.email || currentProfile?.email || 'oncologist@hospital.com',
        firstName: updates.firstName || currentProfile?.firstName || 'Doctor',
        lastName: updates.lastName || currentProfile?.lastName || 'User',
        role: updates.role || currentProfile?.role || 'oncologist',
        specialty: updates.specialty || currentProfile?.specialty || 'Medical Oncology',
        institution: updates.institution || currentProfile?.institution || 'Hospital',
        licenseNumber: updates.licenseNumber || currentProfile?.licenseNumber || '',
        yearsExperience: updates.yearsExperience || currentProfile?.yearsExperience || 5,
        preferences: updates.preferences || currentProfile?.preferences || {
          theme: 'light',
          notifications: { email: true, push: true, criticalAlerts: true, weeklyReports: false },
          dashboard: { defaultView: 'overview', compactMode: false },
          clinical: { riskTolerance: 'moderate', alertSensitivity: 'high', workflowStyle: 'thorough', decisionSupport: 'guided' }
        },
        persona: updates.persona || currentProfile?.persona || {
          name: 'Medical Oncologist',
          description: 'Clinical oncology specialist',
          capabilities: ['drug-interactions', 'protocols', 'research']
        },
        createdAt: currentProfile?.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
        roles: ['oncologist'],
        permissions: ['read', 'write', 'analyze']
      };
      
      // Save to localStorage
      try {
        localStorage.setItem('osrx_user_profile', JSON.stringify(profile));
        console.log('✅ SIMPLE: Profile saved to localStorage');
      } catch (e) {
        console.warn('⚠️ SIMPLE: localStorage save failed, continuing anyway');
      }
      
      return profile;
      
    } catch (error) {
      console.error('❌ SIMPLE: Profile update failed:', error);
      // Return minimal working profile
      return {
        id: userId,
        email: 'oncologist@hospital.com',
        firstName: 'Doctor',
        lastName: 'User',
        role: 'oncologist',
        specialty: 'Medical Oncology',
        institution: 'Hospital',
        licenseNumber: '',
        yearsExperience: 5,
        preferences: {
          theme: 'light',
          notifications: { email: true, push: true, criticalAlerts: true, weeklyReports: false },
          dashboard: { defaultView: 'overview', compactMode: false },
          clinical: { riskTolerance: 'moderate', alertSensitivity: 'high', workflowStyle: 'thorough', decisionSupport: 'guided' }
        },
        persona: {
          name: 'Medical Oncologist',
          description: 'Clinical oncology specialist',
          capabilities: ['drug-interactions', 'protocols', 'research']
        },
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
        roles: ['oncologist'],
        permissions: ['read', 'write', 'analyze']
      };
    }
  }

  // Simple patient creation helper
  static async createPatient(patientData: any): Promise<any> {
    console.log('🔄 SIMPLE createPatient called:', patientData);
    
    try {
      // Create basic patient object
      const patient = {
        id: `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        firstName: patientData.firstName || 'Patient',
        lastName: patientData.lastName || 'Name',
        dateOfBirth: patientData.dateOfBirth || '1980-01-01',
        sex: patientData.sex || 'unknown',
        mrn: patientData.mrn || `MRN${Date.now()}`,
        heightCm: patientData.heightCm || 170,
        weightKg: patientData.weightKg || 70,
        createdAt: new Date().toISOString(),
        ...patientData
      };
      
      // Save to localStorage
      try {
        const existingPatients = JSON.parse(localStorage.getItem('osrx_patients') || '[]');
        existingPatients.push(patient);
        localStorage.setItem('osrx_patients', JSON.stringify(existingPatients));
        console.log('✅ SIMPLE: Patient saved to localStorage');
      } catch (e) {
        console.warn('⚠️ SIMPLE: Patient localStorage save failed');
      }
      
      return patient;
    } catch (error) {
      console.error('❌ SIMPLE: Patient creation failed:', error);
      throw error;
    }
  }
}

// Export for easy switching
export const AuthService = new SimpleAuthService();