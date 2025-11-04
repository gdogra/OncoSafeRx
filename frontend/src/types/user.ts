export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  avatarThumbUrl?: string;
  role: 'oncologist' | 'pharmacist' | 'nurse' | 'researcher' | 'student' | 'patient' | 'caregiver' | 'admin' | 'super_admin';
  specialty?: string;
  institution?: string;
  licenseNumber?: string;
  yearsExperience?: number;
  preferences: UserPreferences;
  persona?: UserPersona;
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
  // RBAC fields
  roles: string[];
  permissions: string[];
  organizationId?: string;
}

export interface UserPersona {
  id: string;
  name: string;
  description: string;
  role: 'oncologist' | 'pharmacist' | 'nurse' | 'researcher' | 'student' | 'patient' | 'caregiver' | 'admin' | 'super_admin';
  experienceLevel: 'novice' | 'intermediate' | 'expert';
  specialties: string[];
  preferences: {
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    alertSensitivity: 'high' | 'medium' | 'low';
    workflowStyle: 'thorough' | 'efficient' | 'collaborative';
    decisionSupport: 'guided' | 'autonomous' | 'consultative';
  };
  customSettings: Record<string, any>;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    criticalAlerts: boolean;
    weeklyReports: boolean;
  };
  dashboard?: {
    defaultView: 'overview' | 'patients' | 'interactions' | 'genomics';
    refreshInterval: number;
    compactMode: boolean;
  };
  clinical?: {
    showGenomicsByDefault: boolean;
    autoCalculateDosing: boolean;
    requireInteractionAck: boolean;
    showPatientPhotos: boolean;
  };
  [key: string]: any;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string; // Required for OTP verification
  avatarUrl?: string;
  role: UserProfile['role'];
  specialty?: string;
  institution?: string;
  licenseNumber?: string;
  yearsExperience?: number;
}

export interface LoginData {
  email: string;
  password: string;
}
