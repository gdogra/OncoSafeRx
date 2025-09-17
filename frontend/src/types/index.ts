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