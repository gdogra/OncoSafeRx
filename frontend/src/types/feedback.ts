export interface FeedbackItem {
  id: string;
  userId?: string;
  sessionId: string;
  timestamp: string;
  type: FeedbackType;
  category: FeedbackCategory;
  priority: Priority;
  title: string;
  description: string;
  page: string;
  userAgent: string;
  url: string;
  metadata?: {
    component?: string;
    action?: string;
    errorDetails?: string;
    reproductionSteps?: string[];
    expectedBehavior?: string;
    actualBehavior?: string;
    browserInfo?: {
      browser: string;
      version: string;
      os: string;
    };
    userRole?: string;
    feature?: string;
    githubIssue?: {
      number: number;
      url: string;
      created_at: string;
    };
  };
  attachments?: string[];
  status: TicketStatus;
  assignee?: string;
  sprintTarget?: string;
  estimatedEffort?: EffortEstimate;
  labels: string[];
  votes: number;
  similarTickets?: string[];
}

export type FeedbackType = 
  | 'bug'
  | 'feature_request'
  | 'improvement'
  | 'question'
  | 'complaint'
  | 'compliment'
  | 'security_concern'
  | 'performance_issue'
  | 'usability_issue'
  | 'data_issue'
  | 'integration_issue';

export type FeedbackCategory = 
  | 'clinical_decision_support'
  | 'drug_interactions'
  | 'protocols'
  | 'genomics'
  | 'trials'
  | 'ui_ux'
  | 'performance'
  | 'security'
  | 'data_quality'
  | 'integration'
  | 'general';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type TicketStatus = 
  | 'new'
  | 'triaged'
  | 'in_backlog'
  | 'in_sprint'
  | 'in_progress'
  | 'in_review'
  | 'done'
  | 'closed'
  | 'duplicate'
  | 'wont_fix';

export type EffortEstimate = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';

export interface FeedbackFormData {
  type: FeedbackType;
  title: string;
  description: string;
  reproductionSteps?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  component?: string;
  email?: string;
  allowContact: boolean;
}

export interface TicketClassificationResult {
  type: FeedbackType;
  category: FeedbackCategory;
  priority: Priority;
  estimatedEffort: EffortEstimate;
  labels: string[];
  confidence: number;
  reasoning: string;
}