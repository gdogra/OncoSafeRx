// Core clinical decision support types
export interface Patient {
  id: string;
  mrn?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  bsa?: number; // m²
  
  // Clinical characteristics
  diagnosis: string;
  stage?: string;
  ecogPerformanceStatus?: 0 | 1 | 2 | 3 | 4;
  karnofskyScore?: number;
  
  // Organ function
  renalFunction: {
    creatinine: number; // mg/dL
    creatinineClearance?: number; // mL/min
    egfr?: number; // mL/min/1.73m²
  };
  
  hepaticFunction: {
    bilirubin: number; // mg/dL
    alt: number; // U/L
    ast: number; // U/L
    albumin: number; // g/dL
  };
  
  // Laboratory values
  labValues: {
    date: string;
    hemoglobin: number; // g/dL
    platelets: number; // x10³/μL
    anc: number; // x10³/μL (Absolute Neutrophil Count)
    wbc: number; // x10³/μL
  }[];
  
  // Allergies and contraindications
  allergies: string[];
  contraindications: string[];
  
  // Current medications
  currentMedications: {
    name: string;
    rxcui?: string;
    dose: string;
    frequency: string;
    startDate: string;
  }[];
  
  // Treatment history
  treatmentHistory: TreatmentCourse[];
  
  // Biomarkers and genomics
  biomarkers: {
    name: string;
    value: string;
    unit?: string;
    date: string;
    method?: string;
  }[];
  
  genomicProfile?: GenomicProfile;
}

export interface TreatmentCourse {
  id: string;
  regimenName: string;
  startDate: string;
  endDate?: string;
  cycles: number;
  response?: 'CR' | 'PR' | 'SD' | 'PD'; // Complete/Partial Response, Stable/Progressive Disease
  toxicities: Toxicity[];
  doseModifications: DoseModification[];
}

export interface Toxicity {
  name: string;
  grade: 1 | 2 | 3 | 4 | 5;
  onset: string;
  resolution?: string;
  attribution: 'definite' | 'probable' | 'possible' | 'unlikely' | 'unrelated';
}

export interface DoseModification {
  date: string;
  drug: string;
  originalDose: number;
  newDose: number;
  reason: string;
  modification: 'reduction' | 'delay' | 'hold' | 'discontinue';
}

export interface GenomicProfile {
  testDate: string;
  testType: string; // e.g., "FoundationOne CDx", "MSK-IMPACT"
  mutations: {
    gene: string;
    variant: string;
    variantType: 'mutation' | 'amplification' | 'deletion' | 'rearrangement';
    alleleFrequency?: number;
    clinicalSignificance: 'pathogenic' | 'likely_pathogenic' | 'uncertain' | 'likely_benign' | 'benign';
  }[];
  microsatelliteInstability: 'MSI-H' | 'MSI-L' | 'MSS';
  tumorMutationalBurden?: number;
  homologousRecombinationDeficiency?: boolean;
  
  // Enhanced genomic data
  ngsReports?: string[]; // References to NGS report IDs
  biomarkerTests?: BiomarkerTest[];
  pharmacogenomics?: PharmacogenomicProfile[];
}

export interface BiomarkerTest {
  id: string;
  testName: string;
  biomarker: string;
  value: string;
  units?: string;
  methodology: 'IHC' | 'FISH' | 'NGS' | 'PCR' | 'array';
  result: 'positive' | 'negative' | 'indeterminate';
  date: string;
  laboratory: string;
}

export interface PharmacogenomicProfile {
  gene: string;
  variants: string[];
  phenotype: string;
  metabolizerStatus: 'poor' | 'intermediate' | 'normal' | 'rapid' | 'ultrarapid';
  clinicalImplications: string[];
  drugRecommendations: DrugRecommendation[];
}

export interface DrugRecommendation {
  drug: string;
  recommendation: string;
  evidenceLevel: string;
  dosageAdjustment?: string;
}

export interface DoseCalculation {
  drug: string;
  rxcui?: string;
  baselinedose: number;
  unit: string;
  calculatedDose: number;
  actualDose: number;
  adjustments: DoseAdjustment[];
  contraindications: string[];
  warnings: ClinicalAlert[];
  monitoring: MonitoringRecommendation[];
}

export interface DoseAdjustment {
  reason: string;
  type: 'renal' | 'hepatic' | 'toxicity' | 'interaction' | 'age' | 'bsa' | 'weight';
  factor: number; // multiplication factor
  description: string;
  evidence: string; // reference or guideline
}

export interface ClinicalAlert {
  id: string;
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  type: 'contraindication' | 'interaction' | 'monitoring' | 'dosing' | 'allergy';
  title: string;
  description: string;
  recommendation: string;
  source: string;
  references?: string[];
}

export interface MonitoringRecommendation {
  parameter: string;
  frequency: string;
  baseline: boolean;
  description: string;
  normalRange?: string;
  actionThreshold?: string;
}

export interface TreatmentRecommendation {
  id: string;
  regimenName: string;
  drugs: {
    name: string;
    dose: string;
    schedule: string;
    route: string;
  }[];
  indication: string;
  lineOfTherapy: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  nccnCategory: '1' | '2A' | '2B' | '3';
  responseRate: number;
  medianPFS?: number;
  medianOS?: number;
  majorToxicities: string[];
  contraindications: string[];
  requiredBiomarkers?: string[];
  clinicalTrials: string[];
  source: string;
  lastUpdated: string;
}

export interface DrugInteractionCheck {
  drug1: string;
  drug2: string;
  severity: 'contraindicated' | 'major' | 'moderate' | 'minor';
  mechanism: string;
  clinicalEffect: string;
  management: string;
  alternativeOptions?: string[];
  evidence: string;
  references: string[];
}

export interface ContraindicationCheck {
  drug: string;
  contraindication: string;
  type: 'absolute' | 'relative';
  reason: string;
  alternatives?: string[];
  overrideJustification?: string;
}

// Calculation utilities
export interface BSACalculation {
  height: number; // cm
  weight: number; // kg
  method: 'dubois' | 'mosteller' | 'haycock' | 'gehan';
  bsa: number; // m²
}

export interface CreatinineClearanceCalculation {
  age: number;
  weight: number; // kg
  creatinine: number; // mg/dL
  gender: 'male' | 'female';
  method: 'cockcroft_gault' | 'mdrd' | 'ckd_epi';
  clearance: number; // mL/min
}

export interface CarboplatingDosing {
  targetAuc: number;
  creatinineClearance: number;
  dose: number; // mg
  notes: string[];
}

// Clinical Guidelines
export interface GuidelineRecommendation {
  id: string;
  organization: 'NCCN' | 'ASCO' | 'ESMO' | 'FDA' | 'EMA';
  condition: string;
  biomarker?: string;
  lineOfTherapy: string;
  recommendation: string;
  evidenceLevel: string;
  category: string;
  lastUpdated: string;
  references: string[];
}

// Real-world evidence
export interface OutcomeData {
  regimenName: string;
  indication: string;
  patientPopulation: string;
  sampleSize: number;
  responseRate: number;
  medianPFS: number;
  medianOS: number;
  grade3_4Toxicity: number;
  source: string;
  studyType: 'rct' | 'retrospective' | 'prospective' | 'real_world';
}