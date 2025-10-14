import { UserProfile } from '../types/user';

export interface RolePermissions {
  canPrescribe: boolean;
  canViewFullPatientData: boolean;
  canModifyMedications: boolean;
  canAccessGenomics: boolean;
  canOverrideAlerts: boolean;
  canCreatePatients: boolean;
  canViewAnalytics: boolean;
  canAccessResearch: boolean;
  requiresSupervisorApproval: boolean;
}

export interface RoleUIConfig {
  permissions: RolePermissions;
  primaryColor: string;
  accentColor: string;
  dashboardLayout: 'clinical' | 'research' | 'educational' | 'pharmaceutical';
  navigationItems: string[];
  quickActions: string[];
  alertLevels: ('low' | 'medium' | 'high' | 'critical')[];
  workflowSteps: string[];
  terminology: Record<string, string>;
}

export const roleConfigurations: Record<UserProfile['role'], RoleUIConfig> = {
  oncologist: {
    permissions: {
      canPrescribe: true,
      canViewFullPatientData: true,
      canModifyMedications: true,
      canAccessGenomics: true,
      canOverrideAlerts: true,
      canCreatePatients: true,
      canViewAnalytics: true,
      canAccessResearch: true,
      requiresSupervisorApproval: false,
    },
    primaryColor: 'blue',
    accentColor: 'indigo',
    dashboardLayout: 'clinical',
    navigationItems: ['patients', 'interactions', 'genomics', 'regimens', 'analytics', 'research', 'testing'],
    quickActions: ['new-patient', 'check-interactions', 'genomic-analysis', 'plan-regimen'],
    alertLevels: ['low', 'medium', 'high', 'critical'],
    workflowSteps: ['assessment', 'diagnosis', 'treatment-planning', 'prescribing', 'monitoring'],
    terminology: {
      patient: 'Patient',
      medication: 'Therapy',
      dose: 'Dosage',
      interaction: 'Drug Interaction',
      alert: 'Clinical Alert',
    },
  },
  pharmacist: {
    permissions: {
      canPrescribe: false,
      canViewFullPatientData: true,
      canModifyMedications: true,
      canAccessGenomics: true,
      canOverrideAlerts: true,
      canCreatePatients: false,
      canViewAnalytics: true,
      canAccessResearch: true,
      requiresSupervisorApproval: false,
    },
    primaryColor: 'green',
    accentColor: 'emerald',
    dashboardLayout: 'pharmaceutical',
    navigationItems: ['patients', 'interactions', 'genomics', 'dispensing', 'counseling', 'analytics', 'testing'],
    quickActions: ['verify-prescription', 'check-interactions', 'dosing-guidance', 'patient-counseling'],
    alertLevels: ['medium', 'high', 'critical'],
    workflowSteps: ['verification', 'interaction-check', 'dosing-review', 'dispensing', 'counseling'],
    terminology: {
      patient: 'Patient',
      medication: 'Medication',
      dose: 'Dose',
      interaction: 'Drug Interaction',
      alert: 'Safety Alert',
    },
  },
  nurse: {
    permissions: {
      canPrescribe: false,
      canViewFullPatientData: true,
      canModifyMedications: false,
      canAccessGenomics: false,
      canOverrideAlerts: false,
      canCreatePatients: false,
      canViewAnalytics: false,
      canAccessResearch: false,
      requiresSupervisorApproval: true,
    },
    primaryColor: 'pink',
    accentColor: 'rose',
    dashboardLayout: 'clinical',
    navigationItems: ['patients', 'medications', 'administration', 'monitoring', 'testing'],
    quickActions: ['medication-administration', 'vital-signs', 'patient-assessment', 'alert-review'],
    alertLevels: ['high', 'critical'],
    workflowSteps: ['assessment', 'administration', 'monitoring', 'documentation'],
    terminology: {
      patient: 'Patient',
      medication: 'Medication',
      dose: 'Dose',
      interaction: 'Drug Reaction',
      alert: 'Safety Warning',
    },
  },
  researcher: {
    permissions: {
      canPrescribe: false,
      canViewFullPatientData: false,
      canModifyMedications: false,
      canAccessGenomics: true,
      canOverrideAlerts: false,
      canCreatePatients: false,
      canViewAnalytics: true,
      canAccessResearch: true,
      requiresSupervisorApproval: false,
    },
    primaryColor: 'purple',
    accentColor: 'violet',
    dashboardLayout: 'research',
    navigationItems: ['data-analysis', 'genomics', 'populations', 'studies', 'publications', 'testing'],
    quickActions: ['analyze-cohort', 'genomic-patterns', 'adverse-events', 'export-data'],
    alertLevels: ['low', 'medium', 'high'],
    workflowSteps: ['hypothesis', 'data-collection', 'analysis', 'interpretation', 'publication'],
    terminology: {
      patient: 'Subject',
      medication: 'Intervention',
      dose: 'Dosage',
      interaction: 'Adverse Event',
      alert: 'Research Finding',
    },
  },
  student: {
    permissions: {
      canPrescribe: false,
      canViewFullPatientData: false,
      canModifyMedications: false,
      canAccessGenomics: true,
      canOverrideAlerts: false,
      canCreatePatients: false,
      canViewAnalytics: false,
      canAccessResearch: false,
      requiresSupervisorApproval: true,
    },
    primaryColor: 'orange',
    accentColor: 'amber',
    dashboardLayout: 'educational',
    navigationItems: ['learning', 'cases', 'interactions', 'genomics', 'assessments', 'testing'],
    quickActions: ['study-case', 'practice-quiz', 'reference-lookup', 'ask-mentor'],
    alertLevels: ['low', 'medium', 'high', 'critical'],
    workflowSteps: ['learn', 'practice', 'assess', 'review', 'apply'],
    terminology: {
      patient: 'Case Study',
      medication: 'Drug',
      dose: 'Dosage',
      interaction: 'Drug Interaction',
      alert: 'Learning Point',
    },
  },
  patient: {
    permissions: {
      canPrescribe: false,
      canViewFullPatientData: false,
      canModifyMedications: false,
      canAccessGenomics: false,
      canOverrideAlerts: false,
      canCreatePatients: false,
      canViewAnalytics: false,
      canAccessResearch: false,
      requiresSupervisorApproval: false,
    },
    primaryColor: 'blue',
    accentColor: 'sky',
    dashboardLayout: 'educational',
    navigationItems: ['my-care', 'medications', 'interactions', 'education', 'support'],
    quickActions: ['view-medications', 'track-symptoms', 'educational-resources', 'contact-team'],
    alertLevels: ['medium', 'high', 'critical'],
    workflowSteps: ['understand', 'track', 'communicate', 'follow-up'],
    terminology: {
      patient: 'My Care',
      medication: 'My Medications',
      dose: 'Dosage',
      interaction: 'Drug Interaction',
      alert: 'Important Notice',
    },
  },
  caregiver: {
    permissions: {
      canPrescribe: false,
      canViewFullPatientData: false,
      canModifyMedications: false,
      canAccessGenomics: false,
      canOverrideAlerts: false,
      canCreatePatients: false,
      canViewAnalytics: false,
      canAccessResearch: false,
      requiresSupervisorApproval: false,
    },
    primaryColor: 'green',
    accentColor: 'teal',
    dashboardLayout: 'educational',
    navigationItems: ['care-management', 'interactions', 'support-resources', 'education', 'communication'],
    quickActions: ['patient-status', 'medication-reminders', 'care-coordination', 'resources'],
    alertLevels: ['medium', 'high', 'critical'],
    workflowSteps: ['monitor', 'support', 'coordinate', 'advocate'],
    terminology: {
      patient: 'Patient',
      medication: 'Medications',
      dose: 'Dosage',
      interaction: 'Drug Interaction',
      alert: 'Care Alert',
    },
  },
  admin: {
    permissions: {
      canPrescribe: false,
      canViewFullPatientData: true,
      canModifyMedications: false,
      canAccessGenomics: true,
      canOverrideAlerts: true,
      canCreatePatients: false,
      canViewAnalytics: true,
      canAccessResearch: true,
      requiresSupervisorApproval: false,
    },
    primaryColor: 'purple',
    accentColor: 'indigo',
    dashboardLayout: 'clinical',
    navigationItems: ['admin', 'users', 'analytics', 'system'],
    quickActions: ['user-management', 'system-health', 'audit-logs', 'settings'],
    alertLevels: ['low', 'medium', 'high', 'critical'],
    workflowSteps: ['review', 'manage', 'monitor', 'report'],
    terminology: {
      patient: 'User',
      medication: 'System Data',
      dose: 'Configuration',
      interaction: 'System Event',
      alert: 'System Alert',
    },
  },
  super_admin: {
    permissions: {
      canPrescribe: false,
      canViewFullPatientData: true,
      canModifyMedications: false,
      canAccessGenomics: true,
      canOverrideAlerts: true,
      canCreatePatients: true,
      canViewAnalytics: true,
      canAccessResearch: true,
      requiresSupervisorApproval: false,
    },
    primaryColor: 'red',
    accentColor: 'orange',
    dashboardLayout: 'clinical',
    navigationItems: ['admin', 'users', 'analytics', 'system', 'advanced'],
    quickActions: ['user-management', 'system-health', 'audit-logs', 'advanced-settings'],
    alertLevels: ['low', 'medium', 'high', 'critical'],
    workflowSteps: ['review', 'manage', 'monitor', 'control'],
    terminology: {
      patient: 'User',
      medication: 'System Data',
      dose: 'Configuration',
      interaction: 'System Event',
      alert: 'System Alert',
    },
  },
};

export function getRoleConfig(role: UserProfile['role']): RoleUIConfig {
  return roleConfigurations[role];
}

export function hasPermission(role: UserProfile['role'], permission: keyof RolePermissions): boolean {
  return roleConfigurations[role].permissions[permission];
}

export function getRolePrimaryColor(role: UserProfile['role']): string {
  return roleConfigurations[role].primaryColor;
}

export function getRoleTerminology(role: UserProfile['role'], term: string): string {
  return roleConfigurations[role].terminology[term] || term;
}
