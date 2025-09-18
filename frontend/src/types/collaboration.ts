export interface Team {
  id: string;
  name: string;
  description: string;
  specialty: 'oncology' | 'hematology' | 'radiation' | 'surgery' | 'pathology' | 'radiology' | 'pharmacy' | 'multidisciplinary';
  members: TeamMember[];
  patients: string[]; // patient IDs
  createdDate: string;
  lastActivity: string;
  isActive: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'physician' | 'nurse' | 'pharmacist' | 'pathologist' | 'radiologist' | 'surgeon' | 'researcher' | 'coordinator';
  title: string;
  email: string;
  phone?: string;
  specialty?: string;
  credentials: string[];
  permissions: Permission[];
  availability: AvailabilityStatus;
  joinedDate: string;
  lastActive: string;
}

export interface Permission {
  resource: 'patients' | 'treatments' | 'reports' | 'genomics' | 'trials' | 'protocols';
  actions: ('view' | 'create' | 'edit' | 'delete' | 'approve')[];
}

export interface AvailabilityStatus {
  status: 'available' | 'busy' | 'away' | 'offline';
  message?: string;
  nextAvailable?: string;
}

export interface TumorBoard {
  id: string;
  name: string;
  type: 'weekly' | 'urgent' | 'molecular' | 'radiation' | 'surgical';
  scheduledDate: string;
  duration: number; // minutes
  location: string;
  virtualMeetingUrl?: string;
  
  // Participants
  chair: string; // team member ID
  presenters: string[]; // team member IDs
  attendees: string[]; // team member IDs
  
  // Cases
  cases: TumorBoardCase[];
  agenda: AgendaItem[];
  
  // Documentation
  notes: string;
  decisions: TumorBoardDecision[];
  actionItems: ActionItem[];
  
  // Workflow
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface TumorBoardCase {
  id: string;
  patientId: string;
  presenterId: string;
  title: string;
  description: string;
  clinicalQuestion: string;
  
  // Case details
  diagnosis: string;
  stage: string;
  priorTreatments: string[];
  currentStatus: string;
  
  // Supporting documents
  imagingStudies: ImagingStudy[];
  pathologyReports: PathologyReport[];
  genomicReports: string[]; // NGS report IDs
  labResults: LabResult[];
  
  // Presentation
  presentationSlides?: string; // URL or file path
  presentationNotes: string;
  allocatedTime: number; // minutes
  
  // Discussion
  discussionPoints: string[];
  consensusReached: boolean;
  recommendation: string;
  alternativeOptions: string[];
  
  // Follow-up
  followUpRequired: boolean;
  followUpDate?: string;
  assignedTo?: string;
}

export interface ImagingStudy {
  id: string;
  studyType: 'CT' | 'MRI' | 'PET' | 'X-ray' | 'ultrasound' | 'mammography';
  studyDate: string;
  bodyPart: string;
  findings: string;
  impression: string;
  radiologist: string;
  reportDate: string;
  imageUrls: string[];
}

export interface PathologyReport {
  id: string;
  specimenType: string;
  collectionDate: string;
  reportDate: string;
  pathologist: string;
  diagnosis: string;
  grade?: string;
  margins?: string;
  immunohistochemistry: BiomarkerResult[];
  specialStains: SpecialStain[];
  molecularMarkers: MolecularMarker[];
  comments: string;
}

export interface BiomarkerResult {
  marker: string;
  result: string;
  percentage?: number;
  intensity: 'negative' | 'weak' | 'moderate' | 'strong';
  interpretation: string;
}

export interface SpecialStain {
  stain: string;
  result: string;
  interpretation: string;
}

export interface MolecularMarker {
  marker: string;
  method: string;
  result: string;
  interpretation: string;
}

export interface LabResult {
  id: string;
  testName: string;
  value: string;
  units: string;
  referenceRange: string;
  abnormalFlag?: 'high' | 'low' | 'critical';
  collectionDate: string;
  resultDate: string;
}

export interface AgendaItem {
  id: string;
  order: number;
  type: 'case_presentation' | 'research_update' | 'protocol_discussion' | 'administrative' | 'education';
  title: string;
  presenter: string;
  allocatedTime: number;
  description?: string;
  materials?: string[];
}

export interface TumorBoardDecision {
  caseId: string;
  decision: string;
  rationale: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  consensusLevel: 'unanimous' | 'majority' | 'split';
  dissenting?: string;
  implementationDate?: string;
  responsiblePhysician: string;
}

export interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  relatedCaseId?: string;
  createdBy: string;
  createdDate: string;
  completedDate?: string;
  notes?: string;
}

export interface ClinicalPathway {
  id: string;
  name: string;
  version: string;
  condition: string;
  stage?: string;
  lineOfTherapy?: string;
  
  // Pathway structure
  steps: PathwayStep[];
  decisionPoints: DecisionPoint[];
  
  // Metadata
  evidenceBasis: string;
  lastReviewed: string;
  reviewBy: string;
  approvedBy: string;
  effectiveDate: string;
  expirationDate?: string;
  
  // Usage tracking
  patientsEnrolled: number;
  completionRate: number;
  outcomeMetrics: OutcomeMetric[];
  
  // Compliance
  varianceReporting: boolean;
  qualityIndicators: QualityIndicator[];
}

export interface PathwayStep {
  id: string;
  order: number;
  title: string;
  description: string;
  type: 'assessment' | 'treatment' | 'monitoring' | 'decision' | 'referral';
  
  // Execution details
  estimatedDuration: number; // days
  requiredResources: string[];
  prerequisites: string[];
  
  // Clinical content
  orders: ClinicalOrder[];
  assessments: Assessment[];
  educationMaterials: string[];
  
  // Workflow
  assignedRole: string;
  automationRules: AutomationRule[];
  alertTriggers: AlertTrigger[];
  
  // Quality
  qualityMeasures: QualityMeasure[];
  complianceRequirements: string[];
}

export interface DecisionPoint {
  id: string;
  stepId: string;
  title: string;
  criteria: DecisionCriteria[];
  outcomes: DecisionOutcome[];
  defaultPath: string;
  requiresApproval: boolean;
  approvalRole?: string;
}

export interface DecisionCriteria {
  parameter: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'range';
  value: string | number;
  weight: number;
}

export interface DecisionOutcome {
  condition: string;
  nextStepId: string;
  overrideAllowed: boolean;
  justificationRequired: boolean;
}

export interface ClinicalOrder {
  type: 'medication' | 'procedure' | 'lab' | 'imaging' | 'referral';
  description: string;
  details: string;
  urgency: 'routine' | 'urgent' | 'stat';
  instructions: string;
  frequency?: string;
  duration?: string;
}

export interface Assessment {
  name: string;
  type: 'physical_exam' | 'questionnaire' | 'scale' | 'measurement';
  description: string;
  requiredFields: string[];
  normalRanges?: Record<string, string>;
}

export interface AutomationRule {
  trigger: string;
  condition: string;
  action: string;
  parameters: Record<string, any>;
}

export interface AlertTrigger {
  condition: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  recipients: string[];
  escalationRules: EscalationRule[];
}

export interface EscalationRule {
  delay: number; // minutes
  condition: string;
  escalateTo: string;
  message: string;
}

export interface QualityMeasure {
  name: string;
  description: string;
  target: number;
  unit: string;
  reportingFrequency: 'real_time' | 'daily' | 'weekly' | 'monthly';
}

export interface OutcomeMetric {
  name: string;
  value: number;
  unit: string;
  target?: number;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: string;
}

export interface QualityIndicator {
  name: string;
  description: string;
  type: 'process' | 'outcome' | 'structure';
  target: number;
  current: number;
  status: 'met' | 'not_met' | 'improving';
}

export interface CommunicationThread {
  id: string;
  type: 'case_discussion' | 'consultation' | 'urgent_alert' | 'general' | 'education';
  subject: string;
  participants: string[]; // team member IDs
  
  // Content
  messages: Message[];
  attachments: Attachment[];
  
  // Context
  relatedPatientId?: string;
  relatedCaseId?: string;
  relatedPathwayId?: string;
  
  // Workflow
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'resolved' | 'archived';
  requiresResponse: boolean;
  responseDeadline?: string;
  
  // Metadata
  createdBy: string;
  createdDate: string;
  lastActivity: string;
  tags: string[];
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  messageType: 'text' | 'voice' | 'image' | 'document';
  
  // Message properties
  isUrgent: boolean;
  requiresAcknowledgment: boolean;
  acknowledgments: Acknowledgment[];
  
  // Editing and reactions
  editHistory: EditHistory[];
  reactions: Reaction[];
  
  // Threading
  replyToId?: string;
  threadId?: string;
}

export interface Acknowledgment {
  userId: string;
  timestamp: string;
  status: 'read' | 'acknowledged' | 'action_taken';
}

export interface EditHistory {
  timestamp: string;
  previousContent: string;
  reason: string;
}

export interface Reaction {
  userId: string;
  type: 'like' | 'agree' | 'disagree' | 'urgent' | 'question';
  timestamp: string;
}

export interface Attachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedDate: string;
  description?: string;
  isConfidential: boolean;
}

export interface ConsultationRequest {
  id: string;
  requesterId: string;
  specialtyRequested: string;
  urgency: 'routine' | 'urgent' | 'emergent';
  
  // Patient context
  patientId: string;
  clinicalQuestion: string;
  relevantHistory: string;
  currentMedications: string[];
  allergies: string[];
  
  // Request details
  preferredConsultant?: string;
  requestedDate?: string;
  requestType: 'opinion' | 'procedure' | 'comanagement' | 'transfer';
  
  // Supporting information
  attachedStudies: string[];
  labResults: string[];
  notes: string;
  
  // Workflow
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  responseDeadline: string;
  
  // Response
  consultantResponse?: ConsultationResponse;
  followUpRequired: boolean;
  followUpDate?: string;
  
  // Documentation
  createdDate: string;
  completedDate?: string;
  billingCode?: string;
}

export interface ConsultationResponse {
  responderId: string;
  responseDate: string;
  impression: string;
  recommendations: string[];
  additionalWorkup?: string[];
  followUpInstructions: string;
  availability: string;
  notes: string;
  timeSpent: number; // minutes
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'diagnosis' | 'treatment' | 'monitoring' | 'research' | 'administrative';
  
  // Template structure
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  
  // Configuration
  isActive: boolean;
  version: string;
  createdBy: string;
  createdDate: string;
  lastModified: string;
  
  // Usage
  timesUsed: number;
  averageCompletionTime: number; // hours
  successRate: number; // percentage
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'automated' | 'decision' | 'parallel' | 'wait';
  
  // Execution
  assignedRole: string;
  estimatedDuration: number; // minutes
  prerequisites: string[];
  
  // Actions
  actions: WorkflowAction[];
  notifications: NotificationRule[];
  
  // Flow control
  onSuccess: string; // next step ID
  onFailure: string; // step ID for error handling
  onTimeout: string; // step ID for timeout handling
  
  // Conditions
  skipConditions: string[];
  requiredApprovals: ApprovalRequirement[];
}

export interface WorkflowTrigger {
  event: string;
  conditions: string[];
  parameters: Record<string, any>;
}

export interface WorkflowAction {
  type: 'notification' | 'assignment' | 'approval_request' | 'data_update' | 'integration';
  parameters: Record<string, any>;
  retryPolicy?: RetryPolicy;
}

export interface NotificationRule {
  recipients: string[];
  template: string;
  channels: ('email' | 'sms' | 'app' | 'dashboard')[];
  timing: 'immediate' | 'scheduled' | 'batched';
}

export interface ApprovalRequirement {
  approverRole: string;
  approverCount: number;
  timeoutHours: number;
  escalationRules: EscalationRule[];
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
  retryDelays: number[]; // seconds
}