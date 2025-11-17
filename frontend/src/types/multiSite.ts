/**
 * Multi-Site Network Types for OncoSafeRx
 * Supports global healthcare network with sophisticated access controls
 */

// Network Site Definition
export interface NetworkSite {
  siteId: string;
  siteName: string;
  shortName: string;
  siteType: 'academic_medical_center' | 'community_hospital' | 'cancer_center' | 'research_institute' | 'clinic_network' | 'private_practice';
  
  location: {
    country: string;
    state?: string;
    province?: string;
    city: string;
    timezone: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  organization: {
    parentNetwork?: string;
    affiliatedSites: string[];
    partnerSites: string[];
    subsidiaries?: string[];
  };

  dataSharing: {
    level: 'full_network' | 'partner_only' | 'research_only' | 'consultation_only' | 'restricted';
    approvedPartners: string[];
    restrictedDataTypes?: ('genetics' | 'psychology' | 'substance_abuse' | 'hiv' | 'custom')[];
    consentRequired: boolean;
  };

  regulatory: {
    hipaaEntity: boolean;
    gdprCompliant: boolean;
    internationalCompliance: string[]; // ['FDA', 'EMA', 'Health Canada', etc.]
    irbApprovals: string[];
    dataProcessingAgreements: string[];
  };

  clinical: {
    specialties: ClinicalSpecialty[];
    services: ClinicalService[];
    tumorBoardParticipation: boolean;
    researchActive: boolean;
    teachingHospital: boolean;
  };

  technical: {
    ehrSystem?: string;
    fhirEndpoint?: string;
    apiVersion: string;
    dataFormat: 'fhir_r4' | 'hl7_v2' | 'custom';
    lastSync?: string;
  };
}

// User Access Permissions for Multi-Site Network
export interface MultiSiteUserPermissions {
  userId: string;
  role: ClinicalRole;
  homeSite: string;
  authorizedSites: SiteAccess[];
  
  crossSiteAccess: {
    level: 'none' | 'consultation' | 'collaboration' | 'research' | 'emergency' | 'administrative';
    restrictions: AccessRestriction[];
    temporaryAccess?: TemporaryAccess[];
    expiresAt?: string;
  };

  specialPermissions: SpecialAccess[];
  dataSharingConsents: DataSharingConsent[];
  
  // Audit and Compliance
  lastAccessReview: string;
  complianceTraining: ComplianceRecord[];
  accessHistory: AccessAuditLog[];
}

export interface SiteAccess {
  siteId: string;
  accessLevel: 'full' | 'department_only' | 'consultation' | 'research' | 'emergency_only';
  authorizedBy: string;
  authorizedAt: string;
  restrictions?: AccessRestriction[];
  departments?: string[];
}

export interface AccessRestriction {
  type: 'data_type' | 'patient_population' | 'time_window' | 'action_type';
  restriction: string;
  reason: string;
  expiresAt?: string;
}

export interface TemporaryAccess {
  siteId: string;
  reason: 'emergency' | 'coverage' | 'consultation' | 'transfer';
  grantedBy: string;
  grantedAt: string;
  expiresAt: string;
  accessLevel: 'read_only' | 'read_write' | 'full';
  patientIds?: string[];
  autoRevoke: boolean;
}

export interface SpecialAccess {
  type: 'break_glass' | 'research_coordinator' | 'quality_assurance' | 'legal_hold' | 'public_health';
  scope: string;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  conditions: string[];
}

export interface DataSharingConsent {
  patientId: string;
  consentType: 'treatment' | 'research' | 'quality_improvement' | 'population_health';
  authorizedSites: string[];
  restrictions: string[];
  consentedAt: string;
  expiresAt?: string;
  withdrawnAt?: string;
}

// Enhanced Patient Profile for Multi-Site
export interface MultiSitePatientProfile {
  // Core patient data (existing structure maintained)
  id: string;
  demographics: PatientDemographics;
  allergies: PatientAllergy[];
  medications: PatientMedication[];
  conditions: PatientCondition[];
  labValues: PatientLabValues[];
  genetics: PatientGenetics[];
  vitals: PatientVitals[];
  treatmentHistory: TreatmentHistory[];

  // Multi-site specific fields
  siteMetadata: {
    originSite: string; // Site where patient was first registered
    primarySite: string; // Current primary care site
    authorizedSites: string[]; // Sites with access to this patient
    
    // Cross-site care coordination
    careTeam: MultiSiteCareTeam;
    referrals: CrossSiteReferral[];
    consultations: CrossSiteConsultation[];
    transfers: SiteTransfer[];
    
    // Data sharing and consent
    dataSharingConsents: DataSharingConsent[];
    dataSharedWith: string[]; // Sites that have accessed this patient's data
    
    // Compliance and audit
    lastAccessReview: string;
    dataClassification: 'standard' | 'sensitive' | 'restricted' | 'highly_restricted';
  };

  // Research participation across sites
  researchParticipation: MultiSiteResearchParticipation[];
  
  // Quality metrics
  qualityMetrics: {
    dataCompletenessScore: number;
    interoperabilityScore: number;
    lastQualityReview: string;
  };
}

export interface MultiSiteCareTeam {
  primary: {
    siteId: string;
    providerId: string;
    role: string;
  };
  consulting: Array<{
    siteId: string;
    providerId: string;
    role: string;
    specialty: string;
    accessLevel: 'full' | 'limited' | 'view_only';
  }>;
  coordinating: Array<{
    siteId: string;
    providerId: string;
    role: 'care_coordinator' | 'nurse_navigator' | 'social_worker';
  }>;
}

export interface CrossSiteReferral {
  id: string;
  fromSite: string;
  toSite: string;
  fromProvider: string;
  toProvider?: string;
  specialty: string;
  urgency: 'routine' | 'urgent' | 'emergent';
  reason: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: string;
  dataShared: string[]; // What data was shared
  followUpRequired: boolean;
}

export interface CrossSiteConsultation {
  id: string;
  requestingSite: string;
  consultingSite: string;
  requestingProvider: string;
  consultingProvider: string;
  consultationType: 'virtual_tumor_board' | 'second_opinion' | 'expert_consultation' | 'emergency_consult';
  status: 'requested' | 'scheduled' | 'in_progress' | 'completed';
  scheduledFor?: string;
  dataShared: string[];
  findings?: string;
  recommendations?: string[];
}

export interface SiteTransfer {
  id: string;
  fromSite: string;
  toSite: string;
  transferType: 'permanent' | 'temporary' | 'emergency';
  reason: string;
  transferredAt: string;
  dataTransferred: string[];
  continuityOfCare: {
    medicationsTransferred: boolean;
    allergyListTransferred: boolean;
    careplanTransferred: boolean;
    followUpScheduled: boolean;
  };
}

export interface MultiSiteResearchParticipation {
  studyId: string;
  studyTitle: string;
  coordinatingSite: string;
  participatingSites: string[];
  enrollmentSite: string;
  enrollmentDate: string;
  status: 'screening' | 'enrolled' | 'active' | 'completed' | 'withdrawn';
  dataSharedForResearch: string[];
  consentVersion: string;
}

// Compliance and Audit Types
export interface ComplianceRecord {
  trainingType: 'hipaa' | 'gdpr' | 'gcp' | 'site_specific';
  completedAt: string;
  expiresAt: string;
  certificateId?: string;
}

export interface AccessAuditLog {
  timestamp: string;
  action: 'view' | 'edit' | 'create' | 'delete' | 'export' | 'print';
  resourceType: 'patient' | 'medication' | 'lab_result' | 'genetic_data' | 'note';
  resourceId: string;
  siteAccessed: string;
  ipAddress: string;
  userAgent: string;
  justification?: string;
}

// Network Configuration
export interface NetworkConfiguration {
  networkId: string;
  networkName: string;
  sites: NetworkSite[];
  
  globalSettings: {
    dataRetentionPolicy: number; // days
    auditRetentionPolicy: number; // days
    defaultDataSharingLevel: 'opt_in' | 'opt_out' | 'explicit_consent';
    emergencyAccessEnabled: boolean;
    breakGlassAuditRequired: boolean;
    crossSiteNotificationEnabled: boolean;
  };

  interoperability: {
    standardProtocols: string[];
    dataExchangeFormat: 'fhir_r4' | 'hl7_v2' | 'proprietary';
    encryptionRequired: boolean;
    authenticationMethod: 'saml' | 'oauth2' | 'certificate' | 'multi_factor';
  };

  governance: {
    dataGovernanceCommittee: string[];
    privacyOfficers: string[];
    dataProtectionOfficers: string[];
    ethicsCommittee?: string[];
  };
}

// Clinical specialties and services
export type ClinicalSpecialty = 
  | 'medical_oncology' 
  | 'radiation_oncology' 
  | 'surgical_oncology'
  | 'hematology'
  | 'pathology'
  | 'radiology'
  | 'nuclear_medicine'
  | 'palliative_care'
  | 'genetic_counseling'
  | 'pharmacy'
  | 'nursing'
  | 'social_work'
  | 'nutrition'
  | 'psychology';

export type ClinicalService =
  | 'infusion_center'
  | 'radiation_therapy'
  | 'surgical_services'
  | 'laboratory'
  | 'imaging'
  | 'pathology_lab'
  | 'genetic_testing'
  | 'clinical_trials'
  | 'tumor_board'
  | 'survivorship'
  | 'palliative_care'
  | 'pain_management';

export type ClinicalRole = 
  | 'attending_physician'
  | 'fellow'
  | 'resident'
  | 'nurse_practitioner'
  | 'physician_assistant'
  | 'pharmacist'
  | 'nurse'
  | 'care_coordinator'
  | 'social_worker'
  | 'genetic_counselor'
  | 'researcher'
  | 'data_manager'
  | 'quality_coordinator'
  | 'administrator';

export default {
  NetworkSite,
  MultiSiteUserPermissions,
  MultiSitePatientProfile,
  NetworkConfiguration
};