export interface GenomicVariant {
  id: string;
  gene: string;
  variant: string;
  chromosome: string;
  position: number;
  ref: string;
  alt: string;
  variantType: 'SNV' | 'indel' | 'CNV' | 'fusion' | 'rearrangement';
  
  // Clinical significance
  clinicalSignificance: 'pathogenic' | 'likely_pathogenic' | 'benign' | 'likely_benign' | 'uncertain';
  therapeuticImplications: TherapeuticImplication[];
  
  // Quality metrics
  coverage: number;
  alleleFrequency: number;
  quality: number;
  
  // Annotations
  consequence: string;
  impact: 'high' | 'moderate' | 'low' | 'modifier';
  annotations: VariantAnnotation[];
  
  // AI-powered enhancements
  aiConfidence?: number;
  patientSpecificScore?: number;
  actionabilityScore?: number;
  aiInterpretation?: string;
}

export interface TherapeuticImplication {
  id: string;
  drug: string;
  drugClass: string;
  implication: 'responsive' | 'resistant' | 'increased_toxicity' | 'reduced_efficacy';
  evidenceLevel: 'A' | 'B' | 'C' | 'D' | 'E';
  source: 'OncoKB' | 'CIViC' | 'COSMIC' | 'ClinVar' | 'NCCN' | 'FDA';
  description: string;
  references: string[];
}

export interface VariantAnnotation {
  source: string;
  type: 'functional' | 'clinical' | 'population' | 'prediction';
  value: string;
  description: string;
}

export interface NGSReport {
  id: string;
  patientId: string;
  reportDate: string;
  testType: 'tumor' | 'germline' | 'liquid_biopsy' | 'rna_seq';
  platform: string;
  laboratoryName: string;
  
  // Sample information
  sampleInfo: {
    type: 'tissue' | 'blood' | 'saliva' | 'other';
    site: string;
    collectionDate: string;
    tumorCellularity?: number;
  };
  
  // Results
  variants: GenomicVariant[];
  copyNumberVariants: CopyNumberVariant[];
  structuralVariants: StructuralVariant[];
  
  // Signatures and scores
  microsatelliteStatus: 'MSI-H' | 'MSS' | 'MSI-L' | 'unknown';
  tumorMutationalBurden: number;
  homologousRecombinationDeficiency?: number;
  
  // Quality metrics
  qualityMetrics: {
    averageCoverage: number;
    percentCovered: number;
    contamination: number;
  };
  
  // Interpretations
  clinicalInterpretation: string;
  recommendedActions: RecommendedAction[];
}

export interface CopyNumberVariant {
  id: string;
  gene: string;
  chromosome: string;
  startPosition: number;
  endPosition: number;
  copyNumber: number;
  type: 'amplification' | 'deletion' | 'loss' | 'neutral';
  significance: 'pathogenic' | 'likely_pathogenic' | 'benign' | 'uncertain';
}

export interface StructuralVariant {
  id: string;
  type: 'fusion' | 'translocation' | 'inversion' | 'duplication';
  gene1: string;
  gene2?: string;
  breakpoint1: string;
  breakpoint2?: string;
  significance: 'pathogenic' | 'likely_pathogenic' | 'benign' | 'uncertain';
}

export interface RecommendedAction {
  type: 'treatment' | 'trial' | 'testing' | 'monitoring';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  evidenceLevel: string;
  references: string[];
}

export interface BiomarkerPanel {
  id: string;
  name: string;
  cancerTypes: string[];
  biomarkers: BiomarkerDefinition[];
  methodology: string;
  turnaroundTime: number;
  cost?: number;
}

export interface BiomarkerDefinition {
  name: string;
  gene?: string;
  type: 'mutation' | 'amplification' | 'deletion' | 'fusion' | 'expression' | 'protein';
  methodology: 'NGS' | 'IHC' | 'FISH' | 'PCR' | 'array';
  therapeuticRelevance: TherapeuticRelevance[];
  prognosticValue?: 'favorable' | 'unfavorable' | 'neutral';
}

export interface TherapeuticRelevance {
  drug: string;
  indication: string;
  evidenceLevel: 'FDA_approved' | 'guideline_recommended' | 'clinical_trial' | 'preclinical';
  response: 'responsive' | 'resistant';
  description: string;
}

export interface ClinicalTrial {
  nctId: string;
  title: string;
  phase: 'I' | 'II' | 'III' | 'IV';
  status: 'recruiting' | 'active' | 'completed' | 'suspended' | 'terminated';
  
  // Eligibility
  eligibilityCriteria: {
    cancerTypes: string[];
    biomarkers: string[];
    priorTreatments: string[];
    ecogStatus: number[];
    ageRange: { min: number; max: number };
  };
  
  // Trial details
  primaryEndpoint: string;
  secondaryEndpoints: string[];
  estimatedEnrollment: number;
  locations: TrialLocation[];
  
  // Treatment
  interventions: Intervention[];
  
  // Matching
  matchScore?: number;
  matchReasons?: string[];
}

export interface TrialLocation {
  facility: string;
  city: string;
  state: string;
  country: string;
  status: 'recruiting' | 'not_recruiting';
  contactInfo: string;
}

export interface Intervention {
  type: 'drug' | 'procedure' | 'device' | 'biological';
  name: string;
  description: string;
  armLabel?: string;
}

export interface GenomicAnalysisResult {
  patientId: string;
  analysisDate: string;
  
  // Key findings
  actionableVariants: GenomicVariant[];
  treatmentOptions: TreatmentOption[];
  clinicalTrials: ClinicalTrial[];
  
  // Risk assessments
  hereditaryRisks: HereditaryRisk[];
  pharmacogenomics: PharmacogenomicResult[];
  
  // AI-powered features
  resistancePredictions?: ResistancePrediction[];
  
  // Summary
  executiveSummary: string;
  keyRecommendations: string[];
}

export interface TreatmentOption {
  drug: string;
  drugClass: string;
  mechanism: string;
  fdaApproval: 'approved' | 'investigational' | 'off_label';
  evidenceLevel: 'high' | 'moderate' | 'low';
  supportingVariants: string[];
  contraindications: string[];
  expectedResponse: string;
  references: string[];
  
  // AI-powered personalization
  personalizedScore?: number;
  aiRecommendation?: string;
}

export interface HereditaryRisk {
  syndrome: string;
  gene: string;
  variant: string;
  penetrance: number;
  recommendations: string[];
  familyScreening: boolean;
}

export interface PharmacogenomicResult {
  drug: string;
  gene: string;
  variant: string;
  phenotype: string;
  recommendation: string;
  dosageAdjustment?: string;
  warningLevel: 'high' | 'moderate' | 'low';
  
  // Enhanced features
  interactionRisk?: 'low' | 'moderate' | 'high';
  clinicalGuidelines?: string[];
  aiInsight?: string;
}

export interface ResistancePrediction {
  drug: string;
  resistanceRisk: 'low' | 'moderate' | 'high';
  mechanisms: string[];
  monitoringStrategy: string;
}