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