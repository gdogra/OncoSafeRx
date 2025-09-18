import { 
  FeedbackType, 
  FeedbackCategory, 
  Priority, 
  EffortEstimate, 
  TicketClassificationResult,
  FeedbackFormData
} from '../types/feedback';

interface ClassificationRules {
  keywords: {
    [key in FeedbackType]: string[];
  };
  categoryKeywords: {
    [key in FeedbackCategory]: string[];
  };
  priorityKeywords: {
    critical: string[];
    high: string[];
    medium: string[];
    low: string[];
  };
  effortIndicators: {
    xs: string[];
    s: string[];
    m: string[];
    l: string[];
    xl: string[];
    xxl: string[];
  };
}

const CLASSIFICATION_RULES: ClassificationRules = {
  keywords: {
    bug: ['bug', 'error', 'broken', 'not working', 'crash', 'freeze', 'exception', 'fail', 'incorrect', 'wrong'],
    feature_request: ['feature', 'add', 'new', 'want', 'need', 'request', 'enhancement', 'could you', 'would like'],
    improvement: ['improve', 'better', 'optimize', 'enhance', 'upgrade', 'polish', 'refine', 'streamline'],
    question: ['how', 'what', 'why', 'when', 'where', 'question', 'help', 'understand', 'explain'],
    complaint: ['slow', 'difficult', 'confusing', 'frustrated', 'annoying', 'terrible', 'awful', 'hate'],
    compliment: ['great', 'awesome', 'love', 'excellent', 'fantastic', 'amazing', 'perfect', 'thank you'],
    security_concern: ['security', 'privacy', 'leak', 'unauthorized', 'breach', 'vulnerability', 'exposed'],
    performance_issue: ['slow', 'timeout', 'lag', 'performance', 'loading', 'speed', 'responsive'],
    usability_issue: ['confusing', 'difficult', 'hard to use', 'unintuitive', 'user experience', 'ux'],
    data_issue: ['data', 'information', 'results', 'missing', 'incomplete', 'inaccurate', 'outdated'],
    integration_issue: ['integration', 'api', 'connection', 'sync', 'import', 'export', 'external']
  },
  categoryKeywords: {
    clinical_decision_support: ['clinical', 'decision', 'recommendation', 'guideline', 'protocol', 'treatment'],
    drug_interactions: ['interaction', 'drug', 'medication', 'contraindication', 'conflict', 'warning'],
    protocols: ['protocol', 'regimen', 'treatment plan', 'dosing', 'schedule', 'oncology'],
    genomics: ['genomic', 'genetic', 'biomarker', 'mutation', 'variant', 'pgx', 'pharmacogenomic'],
    trials: ['trial', 'clinical trial', 'study', 'research', 'enrollment', 'eligibility'],
    ui_ux: ['interface', 'ui', 'ux', 'design', 'layout', 'navigation', 'button', 'menu'],
    performance: ['speed', 'loading', 'slow', 'timeout', 'performance', 'lag', 'response time'],
    security: ['security', 'privacy', 'authentication', 'authorization', 'access', 'login'],
    data_quality: ['data', 'accuracy', 'completeness', 'quality', 'missing', 'incorrect'],
    integration: ['api', 'integration', 'external', 'import', 'export', 'sync'],
    general: ['general', 'overall', 'application', 'system', 'platform']
  },
  priorityKeywords: {
    critical: ['critical', 'urgent', 'emergency', 'crash', 'down', 'broken', 'security', 'data loss'],
    high: ['important', 'high', 'soon', 'blocking', 'major', 'significant impact'],
    medium: ['medium', 'normal', 'improvement', 'enhancement', 'nice to have'],
    low: ['low', 'minor', 'cosmetic', 'suggestion', 'future', 'eventually']
  },
  effortIndicators: {
    xs: ['typo', 'text change', 'color', 'spacing', 'alignment'],
    s: ['button', 'link', 'label', 'tooltip', 'small fix'],
    m: ['component', 'form', 'validation', 'filter', 'search'],
    l: ['page', 'feature', 'integration', 'api', 'database'],
    xl: ['system', 'architecture', 'major feature', 'redesign'],
    xxl: ['complete overhaul', 'new platform', 'migration', 'rewrite']
  }
};

export class FeedbackClassifier {
  private static scoreText(text: string, keywords: string[]): number {
    const lowerText = text.toLowerCase();
    return keywords.reduce((score, keyword) => {
      return score + (lowerText.includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0);
  }

  private static classifyType(feedback: FeedbackFormData): { type: FeedbackType; confidence: number } {
    const text = `${feedback.title} ${feedback.description}`.toLowerCase();
    
    // Check for specific patterns first
    if (text.includes('error') || text.includes('bug') || text.includes('not working')) {
      return { type: 'bug', confidence: 0.9 };
    }
    
    if (text.includes('feature') || text.includes('add') || text.includes('new')) {
      return { type: 'feature_request', confidence: 0.8 };
    }

    // Score all types
    const scores: Array<{ type: FeedbackType; score: number }> = [];
    
    Object.entries(CLASSIFICATION_RULES.keywords).forEach(([type, keywords]) => {
      const score = this.scoreText(text, keywords);
      scores.push({ type: type as FeedbackType, score });
    });

    scores.sort((a, b) => b.score - a.score);
    
    const topScore = scores[0];
    const confidence = topScore.score > 0 ? Math.min(topScore.score / 3, 1) : 0.3;
    
    return { 
      type: topScore.score > 0 ? topScore.type : 'question', 
      confidence 
    };
  }

  private static classifyCategory(feedback: FeedbackFormData, page: string): FeedbackCategory {
    const text = `${feedback.title} ${feedback.description}`.toLowerCase();
    
    // Page-based classification first
    const pageCategories: { [key: string]: FeedbackCategory } = {
      '/interactions': 'drug_interactions',
      '/protocols': 'protocols',
      '/genomics': 'genomics',
      '/trials': 'trials',
      '/drug-search': 'clinical_decision_support'
    };

    if (pageCategories[page]) {
      return pageCategories[page];
    }

    // Content-based classification
    const scores: Array<{ category: FeedbackCategory; score: number }> = [];
    
    Object.entries(CLASSIFICATION_RULES.categoryKeywords).forEach(([category, keywords]) => {
      const score = this.scoreText(text, keywords);
      scores.push({ category: category as FeedbackCategory, score });
    });

    scores.sort((a, b) => b.score - a.score);
    
    return scores[0].score > 0 ? scores[0].category : 'general';
  }

  private static classifyPriority(feedback: FeedbackFormData, type: FeedbackType): Priority {
    const text = `${feedback.title} ${feedback.description}`.toLowerCase();
    
    // Type-based priority rules
    if (type === 'security_concern') return 'critical';
    if (type === 'bug' && (text.includes('crash') || text.includes('data'))) return 'high';
    if (type === 'compliment') return 'low';
    
    // Keyword-based scoring
    const scores = {
      critical: this.scoreText(text, CLASSIFICATION_RULES.priorityKeywords.critical),
      high: this.scoreText(text, CLASSIFICATION_RULES.priorityKeywords.high),
      medium: this.scoreText(text, CLASSIFICATION_RULES.priorityKeywords.medium),
      low: this.scoreText(text, CLASSIFICATION_RULES.priorityKeywords.low)
    };

    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'medium'; // default

    return Object.entries(scores).find(([_, score]) => score === maxScore)![0] as Priority;
  }

  private static estimateEffort(feedback: FeedbackFormData, type: FeedbackType): EffortEstimate {
    const text = `${feedback.title} ${feedback.description}`.toLowerCase();
    
    // Type-based effort estimates
    const typeEffortMap: { [key in FeedbackType]: EffortEstimate } = {
      bug: 'm',
      feature_request: 'l',
      improvement: 's',
      question: 'xs',
      complaint: 's',
      compliment: 'xs',
      security_concern: 'l',
      performance_issue: 'm',
      usability_issue: 's',
      data_issue: 'm',
      integration_issue: 'l'
    };

    // Keyword-based scoring
    const scores: Array<{ effort: EffortEstimate; score: number }> = [];
    
    Object.entries(CLASSIFICATION_RULES.effortIndicators).forEach(([effort, keywords]) => {
      const score = this.scoreText(text, keywords);
      scores.push({ effort: effort as EffortEstimate, score });
    });

    scores.sort((a, b) => b.score - a.score);
    
    return scores[0].score > 0 ? scores[0].effort : typeEffortMap[type];
  }

  private static generateLabels(
    feedback: FeedbackFormData, 
    type: FeedbackType, 
    category: FeedbackCategory,
    priority: Priority
  ): string[] {
    const labels = [type, category, priority];
    
    const text = `${feedback.title} ${feedback.description}`.toLowerCase();
    
    // Add specific labels based on content
    if (text.includes('mobile') || text.includes('phone')) labels.push('mobile');
    if (text.includes('accessibility')) labels.push('accessibility');
    if (text.includes('performance')) labels.push('performance');
    if (text.includes('api')) labels.push('api');
    if (feedback.component) labels.push(`component:${feedback.component}`);
    
    return [...new Set(labels)]; // Remove duplicates
  }

  public static classify(
    feedback: FeedbackFormData, 
    page: string = window.location.pathname
  ): TicketClassificationResult {
    const { type, confidence } = this.classifyType(feedback);
    const category = this.classifyCategory(feedback, page);
    const priority = this.classifyPriority(feedback, type);
    const estimatedEffort = this.estimateEffort(feedback, type);
    const labels = this.generateLabels(feedback, type, category, priority);

    const reasoning = `
      Classification based on:
      - Type: ${type} (confidence: ${(confidence * 100).toFixed(1)}%)
      - Content analysis of "${feedback.title}"
      - Page context: ${page}
      - Keywords detected in description
      - Priority indicators found
    `.trim();

    return {
      type,
      category,
      priority,
      estimatedEffort,
      labels,
      confidence,
      reasoning
    };
  }
}

// Sprint planning utilities
export class SprintPlanner {
  private static readonly SPRINT_CAPACITY = {
    xs: 1,
    s: 2,
    m: 5,
    l: 8,
    xl: 13,
    xxl: 21
  };

  public static calculateSprintFit(tickets: Array<{ effort: EffortEstimate; priority: Priority }>): {
    currentSprint: Array<{ effort: EffortEstimate; priority: Priority }>;
    nextSprint: Array<{ effort: EffortEstimate; priority: Priority }>;
    backlog: Array<{ effort: EffortEstimate; priority: Priority }>;
    totalEffort: number;
  } {
    // Sort by priority (critical > high > medium > low)
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const sortedTickets = [...tickets].sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    const currentSprint = [];
    const nextSprint = [];
    const backlog = [];
    
    let currentSprintPoints = 0;
    let nextSprintPoints = 0;
    const maxSprintPoints = 40; // Typical 2-week sprint capacity

    for (const ticket of sortedTickets) {
      const points = this.SPRINT_CAPACITY[ticket.effort];
      
      if (currentSprintPoints + points <= maxSprintPoints) {
        currentSprint.push(ticket);
        currentSprintPoints += points;
      } else if (nextSprintPoints + points <= maxSprintPoints) {
        nextSprint.push(ticket);
        nextSprintPoints += points;
      } else {
        backlog.push(ticket);
      }
    }

    return {
      currentSprint,
      nextSprint,
      backlog,
      totalEffort: currentSprintPoints + nextSprintPoints
    };
  }
}