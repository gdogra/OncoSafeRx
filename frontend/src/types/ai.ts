export interface AIRecommendation {
  id: string;
  patientId: string;
  type: 'treatment' | 'diagnostic' | 'monitoring' | 'genomic' | 'clinical_trial' | 'supportive_care';
  title: string;
  description: string;
  rationale: string;
  
  // Confidence and evidence
  confidenceScore: number; // 0-100
  evidenceLevel: 'high' | 'moderate' | 'low';
  evidenceSources: EvidenceSource[];
  
  // Clinical context
  indication: string;
  contraindications: string[];
  prerequisites: string[];
  
  // AI model information
  modelVersion: string;
  modelType: 'rule_based' | 'machine_learning' | 'deep_learning' | 'ensemble';
  trainingData: TrainingDataInfo;
  
  // Recommendation details
  priority: 'high' | 'medium' | 'low';
  urgency: 'immediate' | 'urgent' | 'routine';
  timeFrame: string;
  
  // Clinical validation
  validationStatus: 'pending' | 'reviewed' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewDate?: string;
  reviewNotes?: string;
  
  // Outcome tracking
  implementation: Implementation;
  outcome?: OutcomeResult;
  
  // Metadata
  generatedDate: string;
  expirationDate?: string;
  tags: string[];
}

export interface EvidenceSource {
  type: 'clinical_trial' | 'meta_analysis' | 'guideline' | 'real_world_data' | 'literature' | 'expert_consensus';
  title: string;
  authors?: string[];
  journal?: string;
  publicationDate?: string;
  doi?: string;
  pmid?: string;
  evidenceGrade: 'A' | 'B' | 'C' | 'D';
  relevanceScore: number; // 0-100
  summary: string;
  keyFindings: string[];
}

export interface TrainingDataInfo {
  datasetSize: number;
  patientPopulation: string;
  dateRange: {
    start: string;
    end: string;
  };
  institutions: string[];
  validationMethod: 'cross_validation' | 'external_validation' | 'temporal_validation';
  performanceMetrics: PerformanceMetric[];
}

export interface PerformanceMetric {
  metric: 'accuracy' | 'sensitivity' | 'specificity' | 'ppv' | 'npv' | 'auc' | 'f1_score';
  value: number;
  confidenceInterval?: {
    lower: number;
    upper: number;
  };
}

export interface Implementation {
  status: 'not_implemented' | 'partially_implemented' | 'fully_implemented' | 'discontinued';
  implementedDate?: string;
  implementedBy?: string;
  modifications?: string[];
  adherenceScore?: number; // 0-100
  barriers?: string[];
}

export interface OutcomeResult {
  assessmentDate: string;
  assessedBy: string;
  outcome: 'improved' | 'stable' | 'worsened' | 'indeterminate';
  metrics: OutcomeMetric[];
  patientFeedback?: string;
  clinicianFeedback?: string;
  lessons_learned?: string[];
}

export interface OutcomeMetric {
  name: string;
  value: number;
  unit: string;
  baseline?: number;
  target?: number;
  improvementPercentage?: number;
}

export interface PredictiveModel {
  id: string;
  name: string;
  version: string;
  type: 'prognostic' | 'predictive' | 'diagnostic' | 'risk_stratification';
  indication: string;
  
  // Model details
  algorithm: 'logistic_regression' | 'random_forest' | 'svm' | 'neural_network' | 'gradient_boosting' | 'ensemble';
  inputFeatures: ModelFeature[];
  outputType: 'binary' | 'multiclass' | 'continuous' | 'survival';
  
  // Performance
  validationResults: ValidationResult[];
  clinicalUtility: ClinicalUtility;
  
  // Deployment
  deploymentStatus: 'development' | 'testing' | 'staging' | 'production' | 'deprecated';
  lastUpdated: string;
  updateFrequency: 'real_time' | 'daily' | 'weekly' | 'monthly' | 'as_needed';
  
  // Governance
  approvalStatus: 'pending' | 'approved' | 'conditional' | 'rejected';
  regulatoryStatus?: 'fda_cleared' | 'ce_marked' | 'investigational' | 'research_only';
  ethicsReview: EthicsReview;
  
  // Usage
  usageStats: UsageStatistics;
  feedbackLoop: FeedbackLoop;
}

export interface ModelFeature {
  name: string;
  type: 'categorical' | 'numerical' | 'binary' | 'text' | 'image';
  description: string;
  importance: number; // 0-100
  dataSource: string;
  preprocessing: string[];
  missingValueHandling: string;
}

export interface ValidationResult {
  validationType: 'internal' | 'external' | 'temporal' | 'geographic';
  dataset: string;
  sampleSize: number;
  timeFrame: string;
  performanceMetrics: PerformanceMetric[];
  calibration: CalibrationResult;
  fairness: FairnessMetric[];
}

export interface CalibrationResult {
  calibrationSlope: number;
  calibrationIntercept: number;
  hosmerlemeshow: {
    statistic: number;
    pValue: number;
  };
  calibrationPlot: DataPoint[];
}

export interface DataPoint {
  x: number;
  y: number;
}

export interface FairnessMetric {
  subgroup: string;
  metric: string;
  value: number;
  reference: number;
  ratio: number;
  acceptable: boolean;
}

export interface ClinicalUtility {
  decisionCurveAnalysis: DecisionCurvePoint[];
  netBenefit: number;
  numberNeededToTreat?: number;
  numberNeededToHarm?: number;
  costEffectiveness?: CostEffectiveness;
}

export interface DecisionCurvePoint {
  threshold: number;
  netBenefit: number;
}

export interface CostEffectiveness {
  cost: number;
  effectiveness: number;
  icer: number; // Incremental cost-effectiveness ratio
  currency: string;
  timeHorizon: string;
}

export interface EthicsReview {
  reviewDate: string;
  reviewBoard: string;
  approvalStatus: 'approved' | 'conditional' | 'rejected';
  considerations: string[];
  mitigationStrategies: string[];
  monitoringRequirements: string[];
}

export interface UsageStatistics {
  totalPredictions: number;
  predictionsLastMonth: number;
  averageResponseTime: number; // milliseconds
  uptimePercentage: number;
  errorRate: number;
  userSatisfaction: number; // 0-100
}

export interface FeedbackLoop {
  feedbackType: 'outcome_labels' | 'clinical_feedback' | 'model_drift' | 'data_quality';
  feedbackFrequency: string;
  retrainingTrigger: RetrainingTrigger;
  lastRetrained?: string;
  nextScheduledRetrain?: string;
}

export interface RetrainingTrigger {
  performanceDrop: number; // percentage
  dataVolumeThreshold: number;
  timeThreshold: string;
  manualTrigger: boolean;
}

export interface RealWorldEvidence {
  id: string;
  title: string;
  studyType: 'retrospective' | 'prospective' | 'cross_sectional' | 'longitudinal';
  dataSource: string;
  
  // Study details
  objective: string;
  methodology: string;
  inclusion_criteria: string[];
  exclusion_criteria: string[];
  
  // Population
  totalPatients: number;
  demographics: Demographics;
  followUpDuration: string;
  
  // Intervention/Exposure
  intervention: Intervention;
  comparator?: Intervention;
  
  // Outcomes
  primaryEndpoints: Endpoint[];
  secondaryEndpoints: Endpoint[];
  safetyEndpoints: SafetyEndpoint[];
  
  // Results
  keyFindings: Finding[];
  limitations: string[];
  conclusions: string[];
  
  // Quality assessment
  qualityScore: QualityAssessment;
  biasAssessment: BiasAssessment;
  
  // Metadata
  studyPeriod: {
    start: string;
    end: string;
  };
  lastUpdated: string;
  dataQuality: DataQuality;
  regulatoryAlignment: RegulatoryAlignment;
}

export interface Demographics {
  age: {
    mean: number;
    standardDeviation: number;
    range: { min: number; max: number };
  };
  gender: {
    male: number;
    female: number;
    other?: number;
  };
  ethnicity: { [key: string]: number };
  comorbidities: Comorbidity[];
  priorTreatments: PriorTreatment[];
}

export interface Comorbidity {
  name: string;
  prevalence: number; // percentage
  severity?: 'mild' | 'moderate' | 'severe';
}

export interface PriorTreatment {
  treatment: string;
  percentage: number;
  medianDuration?: number;
  responseRate?: number;
}

export interface Intervention {
  name: string;
  type: 'drug' | 'device' | 'procedure' | 'combination';
  details: InterventionDetails;
  adherence?: AdherenceData;
}

export interface InterventionDetails {
  dose?: string;
  frequency?: string;
  duration?: string;
  route?: string;
  formulation?: string;
  manufacturer?: string;
}

export interface AdherenceData {
  measurement: 'mpr' | 'pdc' | 'self_report' | 'pill_count';
  averageAdherence: number; // percentage
  adherentPatients: number; // percentage with >80% adherence
}

export interface Endpoint {
  name: string;
  type: 'efficacy' | 'safety' | 'quality_of_life' | 'economic';
  measurement: string;
  timePoint: string;
  result: EndpointResult;
}

export interface EndpointResult {
  value: number;
  unit: string;
  confidenceInterval?: {
    lower: number;
    upper: number;
  };
  pValue?: number;
  statisticalTest?: string;
  clinicalSignificance: boolean;
}

export interface SafetyEndpoint {
  adverseEvent: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening' | 'fatal';
  incidence: number; // percentage
  causality: 'definite' | 'probable' | 'possible' | 'unlikely' | 'unrelated';
  management: string;
  outcome: 'resolved' | 'ongoing' | 'fatal' | 'unknown';
}

export interface Finding {
  category: 'efficacy' | 'safety' | 'quality_of_life' | 'economic' | 'subgroup';
  description: string;
  statisticalSignificance: boolean;
  clinicalSignificance: boolean;
  effect_size: number;
  confidenceInterval?: {
    lower: number;
    upper: number;
  };
  subgroupAnalysis?: SubgroupAnalysis[];
}

export interface SubgroupAnalysis {
  subgroup: string;
  criteria: string;
  sampleSize: number;
  result: EndpointResult;
  heterogeneity: boolean;
}

export interface QualityAssessment {
  overallScore: number; // 0-100
  criteria: QualityCriterion[];
  assessmentTool: string;
  assessedBy: string;
  assessmentDate: string;
}

export interface QualityCriterion {
  criterion: string;
  score: number;
  maxScore: number;
  rationale: string;
}

export interface BiasAssessment {
  overallRisk: 'low' | 'moderate' | 'high';
  biasTypes: BiasType[];
  mitigationStrategies: string[];
}

export interface BiasType {
  type: 'selection' | 'information' | 'confounding' | 'attrition' | 'reporting';
  risk: 'low' | 'moderate' | 'high';
  description: string;
  impact: string;
}

export interface DataQuality {
  completeness: number; // percentage
  accuracy: number; // percentage
  consistency: number; // percentage
  timeliness: number; // percentage
  dataGovernance: DataGovernance;
}

export interface DataGovernance {
  dataStandards: string[];
  qualityControls: string[];
  auditTrail: boolean;
  privacyCompliance: string[];
  securityMeasures: string[];
}

export interface RegulatoryAlignment {
  guidelines: string[];
  standards: string[];
  reportingFramework: string;
  regulatorySubmission?: RegulatorySubmission;
}

export interface RegulatorySubmission {
  agency: string;
  submissionType: string;
  submissionDate: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  reviewComments?: string[];
}

export interface ClinicalDecisionSupportRule {
  id: string;
  name: string;
  version: string;
  category: 'diagnostic' | 'therapeutic' | 'monitoring' | 'preventive';
  
  // Rule definition
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  
  // Evidence base
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  guideline: string;
  references: string[];
  
  // Implementation
  implementationStatus: 'active' | 'inactive' | 'testing' | 'deprecated';
  activationTriggers: string[];
  suppressionRules: SuppressionRule[];
  
  // Performance
  usageMetrics: RuleUsageMetrics;
  clinicalImpact: ClinicalImpact;
  
  // Governance
  approvedBy: string;
  approvalDate: string;
  lastReviewed: string;
  nextReview: string;
}

export interface RuleCondition {
  parameter: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in_range';
  value: any;
  weight: number;
  required: boolean;
}

export interface RuleAction {
  type: 'alert' | 'recommendation' | 'order_set' | 'contraindication' | 'dose_adjustment';
  description: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  order_details?: OrderDetails;
}

export interface OrderDetails {
  orderType: 'medication' | 'lab' | 'imaging' | 'procedure' | 'referral';
  details: string;
  urgency: 'routine' | 'urgent' | 'stat';
  instructions: string;
}

export interface SuppressionRule {
  condition: string;
  duration: string; // e.g., "24 hours", "1 week"
  reason: string;
}

export interface RuleUsageMetrics {
  totalFires: number;
  firesLastMonth: number;
  acceptanceRate: number; // percentage
  overrideRate: number; // percentage
  averageResponseTime: number;
  userSatisfactionScore: number;
}

export interface ClinicalImpact {
  preventedErrors: number;
  timesSaved: number; // minutes
  costSavings: number;
  qualityImprovements: QualityImprovement[];
  patientOutcomes: PatientOutcomeImprovement[];
}

export interface QualityImprovement {
  metric: string;
  baseline: number;
  current: number;
  improvement: number;
  measurementPeriod: string;
}

export interface PatientOutcomeImprovement {
  outcome: string;
  before: number;
  after: number;
  pValue: number;
  clinicalSignificance: boolean;
}