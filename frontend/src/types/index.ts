// Drug types
export interface Drug {
  id?: string;
  rxcui: string;
  name: string;
  generic_name?: string;
  genericName?: string;
  generic?: string;
  synonym?: string;
  tty?: string;
  brand_names?: string[];
  brandNames?: string[];
  brand?: string;
  active_ingredients?: string[];
  dosage_forms?: string[];
  strengths?: string[];
  therapeutic_class?: string;
  indication?: string;
  category?: string;
  mechanism?: string;
  indications?: string[];
  contraindications?: string[];
  warnings?: string[];
  adverse_reactions?: string[];
  sideEffects?: string[];
  interactions?: any[];
  hasInteractions?: boolean;
  isPopular?: boolean;
  isOncology?: boolean;
  relevanceScore?: number;
  dosing?: {
    standard?: string;
    renal?: string;
    hepatic?: string;
  };
  monitoring?: string[];
  fdaApproved?: boolean;
  oncologyDrug?: boolean;
  clinicalData?: any; // Store full enhanced clinical data from API
  // Extended clinical insights used in some views
  clinicalInsights?: any;
  realWorldEvidence?: any;
  riskProfile?: any;
  monitoringRequirements?: any;
  clinicalDecisionSupport?: any;
  costEffectiveness?: any;
}

export interface DrugSearchResult {
  query: string;
  count: number;
  sources?: {
    local: number;
    rxnorm: number;
  };
  results: Drug[];
}

// Interaction types
export interface DrugInteraction {
  id?: string;
  drug1_rxcui: string;
  drug2_rxcui: string;
  severity: 'major' | 'moderate' | 'minor' | 'unknown';
  mechanism?: string;
  effect: string;
  management?: string;
  evidence_level?: 'A' | 'B' | 'C' | 'D';
  sources?: string[];
  drug1?: {
    name: string;
    generic_name: string;
  };
  drug2?: {
    name: string;
    generic_name: string;
  };
  riskLevel?: 'HIGH' | 'MODERATE' | 'LOW' | 'UNKNOWN';
}

export interface InteractionCheckResult {
  inputDrugs: string[];
  foundDrugs: Array<{ rxcui: string; name: string }>;
  interactionCount: number;
  sources?: {
    stored: number;
    external: number;
  };
  interactions: {
    stored: DrugInteraction[];
    external: DrugInteraction[];
  };
}

// Gene types
export interface Gene {
  id?: string;
  symbol: string;
  name: string;
  chromosome?: string;
  function?: string;
  clinical_significance?: string;
}

export interface GeneDrugInteraction {
  id?: string;
  gene_symbol: string;
  drug_rxcui: string;
  phenotype?: string;
  recommendation: string;
  evidence_level?: 'A' | 'B' | 'C' | 'D';
  implications?: string;
  dosage_adjustment?: string;
  sources?: string[];
  gene?: Gene;
  drug?: Drug;
}

export interface CpicGuideline {
  gene: string;
  geneName?: string;
  drug: string;
  drugRxcui: string;
  phenotype?: string;
  recommendation: string;
  evidenceLevel?: string;
  implications?: string;
  dosageAdjustment?: string;
  sources?: string[];
}

export interface CpicGuidelinesResult {
  count: number;
  guidelines: CpicGuideline[];
}

export interface GenomicAnalysis {
  rxcui: string;
  drugName: string;
  geneCount: number;
  genes: string[];
  interactionCount: number;
  recommendations: Array<{
    gene: string;
    geneName?: string;
    geneFunction?: string;
    phenotype?: string;
    recommendation: string;
    evidenceLevel?: string;
    implications?: string;
    dosageAdjustment?: string;
    sources?: string[];
  }>;
}

// Clinical trial types
export interface ClinicalTrial {
  id?: string;
  nct_id: string;
  title: string;
  status?: string;
  phase?: string;
  condition?: string;
  intervention?: string;
  drugs?: string[];
  eligibility_criteria?: string;
  locations?: any;
  contact_info?: any;
  url?: string;
}

// Oncology protocol types
export interface OncologyProtocol {
  id?: string;
  protocol_name: string;
  cancer_type: string;
  stage?: string;
  guideline_source?: string;
  drugs?: string[];
  sequence_order?: number;
  duration_weeks?: number;
  efficacy_data?: any;
  toxicity_profile?: any;
  contraindications?: string[];
}

// API response types
export interface ApiError {
  error: string;
  message?: string;
  timestamp?: string;
  path?: string;
  method?: string;
}

export interface HealthCheck {
  status: string;
  timestamp: string;
  version: string;
}

// Patient profile types
export interface PatientDemographics {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: 'male' | 'female' | 'other';
  // Back-compat fields used in some components
  age?: number;
  gender?: string;
  race?: string;
  ethnicity?: string;
  heightCm?: number;
  weightKg?: number;
  bsa?: number; // Body surface area
  mrn?: string; // Medical record number
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
  };
}

export interface PatientLabValues {
  id?: string;
  timestamp: string;
  labType: string;
  value: number;
  unit: string;
  referenceRange?: string;
  isAbnormal?: boolean;
  criticalFlag?: boolean;
}

export interface PatientAllergy {
  id: string;
  // Back-compat display field occasionally referenced
  name?: string;
  allergen: string;
  allergenType: 'drug' | 'food' | 'environmental' | 'other';
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  dateReported: string;
  verified: boolean;
  notes?: string;
}

export interface PatientMedication {
  id: string;
  drug?: Drug;
  // Back-compat convenience fields
  name?: string;
  drugName?: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  indication: string;
  prescriber?: string;
  prescribedBy?: string;
  isActive: boolean;
  adherence?: 'excellent' | 'good' | 'fair' | 'poor' | number;
  sideEffects?: string[];
  instructions?: string;
  nextDose?: string;
}

export interface PatientCondition {
  id: string;
  condition: string;
  name?: string;
  icd10Code?: string;
  icd10?: string;
  status: 'active' | 'resolved' | 'inactive';
  dateOfOnset: string;
  dateOfDiagnosis?: string;
  dateResolved?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  stage?: string;
  notes?: string;
}

export interface PatientGenetics {
  geneSymbol: string;
  alleles: string[];
  phenotype: string;
  metabolizerStatus?: 'poor' | 'intermediate' | 'normal' | 'rapid' | 'ultra-rapid';
  testDate: string;
  testMethod?: string;
  clinicalSignificance?: string;
  notes?: string;
  // Back-compat property referenced in some components
  geneFunction?: string;
}

export interface PatientVitals {
  id?: string;
  timestamp: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  painScore?: number; // 0-10 scale
  performanceStatus?: number; // ECOG 0-4
}

export interface TreatmentHistory {
  id: string;
  treatmentType: 'chemotherapy' | 'radiation' | 'surgery' | 'immunotherapy' | 'targeted' | 'other';
  regimen?: string;
  drugs?: string[];
  startDate: string;
  endDate?: string;
  cycles?: number;
  response?: 'complete' | 'partial' | 'stable' | 'progression';
  toxicities?: Array<{
    grade: 1 | 2 | 3 | 4 | 5;
    description: string;
    action: string;
  }>;
  notes?: string;
}

export interface PatientAppointment {
  id: string;
  title: string;
  type: 'consultation' | 'treatment' | 'lab' | 'imaging' | 'follow-up';
  provider: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'requested';
  notes?: string;
  preparationInstructions?: string[];
  isVirtual: boolean;
  reminder: boolean;
  createdBy: string;
  createdAt: string;
  requestData?: {
    reason: string;
    urgency: 'routine' | 'urgent' | 'emergency';
    preferredDates: string[];
    preferredTimes: string[];
    additionalNotes?: string;
  };
}

export interface PatientSideEffectReport {
  id: string;
  sideEffect: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  description: string;
  medication?: string;
  reportedAt: string;
  reportedBy: string;
  status: 'reported' | 'reviewed' | 'resolved';
  careTeamNotes?: string;
}

export interface PatientProfile {
  id: string;
  demographics: PatientDemographics;
  allergies: PatientAllergy[];
  medications: PatientMedication[];
  conditions: PatientCondition[];
  labValues: PatientLabValues[];
  genetics: PatientGenetics[];
  vitals: PatientVitals[];
  treatmentHistory: TreatmentHistory[];
  medicalHistory?: any[];
  primaryDiagnosis?: string;
  appointments?: PatientAppointment[];
  sideEffectReports?: PatientSideEffectReport[];
  // Back-compat field occasionally referenced
  genomicProfile?: any;
  // Additional back-compat fields referenced in some pages
  age?: number;
  gender?: string;
  genomicData?: any;
  notes: Array<{
    id: string;
    timestamp: string;
    author: string;
    type: 'clinical' | 'pharmacy' | 'nursing' | 'ai-chat' | 'other';
    content: string;
  }>;
  preferences: {
    primaryLanguage?: string;
    communicationPreferences?: string[];
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  lastUpdated: string;
  createdBy: string;
  isActive: boolean;
}

// Clinical alerts and safety
export interface ClinicalAlert {
  id: string;
  patientId: string;
  type: 'allergy' | 'interaction' | 'dosing' | 'lab' | 'contraindication' | 'monitoring';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  message: string;
  details?: string;
  recommendedAction?: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
  expiresAt?: string;
}

// Session and workflow types
export interface ClinicalSession {
  id: string;
  patientId: string;
  sessionType: 'consultation' | 'dosing' | 'interaction-check' | 'regimen-planning';
  startTime: string;
  endTime?: string;
  participants: string[];
  decisions: Array<{
    timestamp: string;
    decision: string;
    rationale: string;
    decidedBy: string;
  }>;
  notes?: string;
}
