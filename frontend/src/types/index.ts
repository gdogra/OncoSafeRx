// Drug types
export interface Drug {
  id?: string;
  rxcui: string;
  name: string;
  generic_name?: string;
  synonym?: string;
  tty?: string;
  brand_names?: string[];
  active_ingredients?: string[];
  dosage_forms?: string[];
  strengths?: string[];
  therapeutic_class?: string;
  indication?: string;
  contraindications?: string[];
  warnings?: string[];
  adverse_reactions?: string[];
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
  drug: Drug;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  indication: string;
  prescriber?: string;
  isActive: boolean;
  adherence?: 'excellent' | 'good' | 'fair' | 'poor';
  sideEffects?: string[];
}

export interface PatientCondition {
  id: string;
  condition: string;
  icd10Code?: string;
  status: 'active' | 'resolved' | 'inactive';
  dateOfOnset: string;
  dateResolved?: string;
  severity?: 'mild' | 'moderate' | 'severe';
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
}

export interface PatientVitals {
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
  notes: Array<{
    id: string;
    timestamp: string;
    author: string;
    type: 'clinical' | 'pharmacy' | 'nursing' | 'other';
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