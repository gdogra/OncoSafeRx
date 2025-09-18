import { FeedbackItem, FeedbackType, Priority } from '../types/feedback';

export interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
  enabled: boolean;
  apiUrl?: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  labels: string[];
  assignees: string[];
  milestone?: number;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIssueRequest {
  title: string;
  body: string;
  labels?: string[];
  assignees?: string[];
  milestone?: number;
}

class GitHubService {
  private config: GitHubConfig | null = null;
  private readonly STORAGE_KEY = 'oncosaferx_github_config';

  constructor() {
    this.loadConfig();
  }

  // Load GitHub configuration from localStorage
  private loadConfig(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.config = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load GitHub config:', error);
    }
  }

  // Save GitHub configuration
  public saveConfig(config: GitHubConfig): void {
    this.config = { ...config };
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save GitHub config:', error);
      throw new Error('Failed to save GitHub configuration');
    }
  }

  // Get current configuration
  public getConfig(): GitHubConfig | null {
    return this.config;
  }

  // Test GitHub connection
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config || !this.config.enabled) {
      return { success: false, message: 'GitHub integration not configured' };
    }

    try {
      const response = await this.makeRequest(`/repos/${this.config.owner}/${this.config.repo}`, 'GET');
      
      if (response.ok) {
        return { success: true, message: 'Successfully connected to GitHub repository' };
      } else {
        const error = await response.json();
        return { success: false, message: error.message || 'Failed to connect to repository' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  }

  // Create GitHub issue from feedback
  public async createIssueFromFeedback(feedback: FeedbackItem): Promise<GitHubIssue> {
    if (!this.config || !this.config.enabled) {
      throw new Error('GitHub integration not enabled');
    }

    const issueRequest = this.formatFeedbackAsIssue(feedback);
    return this.createIssue(issueRequest);
  }

  // Create GitHub issue
  public async createIssue(request: CreateIssueRequest): Promise<GitHubIssue> {
    if (!this.config || !this.config.enabled) {
      throw new Error('GitHub integration not enabled');
    }

    try {
      const response = await this.makeRequest(
        `/repos/${this.config.owner}/${this.config.repo}/issues`,
        'POST',
        request
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`GitHub API error: ${error.message || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create GitHub issue:', error);
      throw error;
    }
  }

  // Get repository issues
  public async getIssues(params?: {
    state?: 'open' | 'closed' | 'all';
    labels?: string;
    sort?: 'created' | 'updated' | 'comments';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }): Promise<GitHubIssue[]> {
    if (!this.config || !this.config.enabled) {
      throw new Error('GitHub integration not enabled');
    }

    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
      }

      const url = `/repos/${this.config.owner}/${this.config.repo}/issues${
        searchParams.toString() ? `?${searchParams.toString()}` : ''
      }`;

      const response = await this.makeRequest(url, 'GET');

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`GitHub API error: ${error.message || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get GitHub issues:', error);
      throw error;
    }
  }

  // Update issue
  public async updateIssue(issueNumber: number, updates: Partial<CreateIssueRequest>): Promise<GitHubIssue> {
    if (!this.config || !this.config.enabled) {
      throw new Error('GitHub integration not enabled');
    }

    try {
      const response = await this.makeRequest(
        `/repos/${this.config.owner}/${this.config.repo}/issues/${issueNumber}`,
        'PATCH',
        updates
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`GitHub API error: ${error.message || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update GitHub issue:', error);
      throw error;
    }
  }

  // Format feedback as GitHub issue
  private formatFeedbackAsIssue(feedback: FeedbackItem): CreateIssueRequest {
    const labels = this.generateLabels(feedback);
    const title = this.generateTitle(feedback);
    const body = this.generateBody(feedback);

    return {
      title,
      body,
      labels
    };
  }

  // Generate issue title
  private generateTitle(feedback: FeedbackItem): string {
    const typeEmoji = this.getTypeEmoji(feedback.type);
    const priorityPrefix = feedback.priority === 'critical' ? '[URGENT] ' : 
                          feedback.priority === 'high' ? '[HIGH] ' : '';
    
    return `${typeEmoji} ${priorityPrefix}${feedback.title}`;
  }

  // Generate issue body
  private generateBody(feedback: FeedbackItem): string {
    let body = `## ${this.getTypeDisplayName(feedback.type)}\n\n`;
    
    body += `**Description:**\n${feedback.description}\n\n`;
    
    // Add metadata section
    body += `## Feedback Details\n\n`;
    body += `- **Type:** ${feedback.type}\n`;
    body += `- **Category:** ${feedback.category}\n`;
    body += `- **Priority:** ${feedback.priority}\n`;
    body += `- **Estimated Effort:** ${feedback.estimatedEffort}\n`;
    body += `- **Page:** ${feedback.page}\n`;
    body += `- **URL:** ${feedback.url}\n`;
    body += `- **Submitted:** ${new Date(feedback.timestamp).toLocaleString()}\n\n`;

    // Add component info if available
    if (feedback.metadata?.component) {
      body += `- **Component:** ${feedback.metadata.component}\n`;
    }

    // Add reproduction steps for bugs
    if (feedback.metadata?.reproductionSteps && feedback.metadata.reproductionSteps.length > 0) {
      body += `## Reproduction Steps\n\n`;
      feedback.metadata.reproductionSteps.forEach((step, index) => {
        body += `${index + 1}. ${step}\n`;
      });
      body += `\n`;
    }

    // Add expected vs actual behavior for bugs
    if (feedback.metadata?.expectedBehavior || feedback.metadata?.actualBehavior) {
      body += `## Expected vs Actual Behavior\n\n`;
      if (feedback.metadata.expectedBehavior) {
        body += `**Expected:** ${feedback.metadata.expectedBehavior}\n\n`;
      }
      if (feedback.metadata.actualBehavior) {
        body += `**Actual:** ${feedback.metadata.actualBehavior}\n\n`;
      }
    }

    // Add browser info
    if (feedback.metadata?.browserInfo) {
      body += `## Environment\n\n`;
      body += `- **Browser:** ${feedback.metadata.browserInfo.browser}\n`;
      body += `- **OS:** ${feedback.metadata.browserInfo.os}\n`;
      body += `- **User Agent:** ${feedback.userAgent}\n\n`;
    }

    // Add auto-generated footer
    body += `---\n`;
    body += `*This issue was automatically created from user feedback in OncoSafeRx.*\n`;
    body += `*Feedback ID: ${feedback.id}*`;

    return body;
  }

  // Generate GitHub labels
  private generateLabels(feedback: FeedbackItem): string[] {
    const labels: string[] = [];

    // Type labels
    const typeLabels: Record<FeedbackType, string> = {
      bug: 'bug',
      feature_request: 'enhancement',
      improvement: 'enhancement',
      question: 'question',
      complaint: 'feedback',
      compliment: 'feedback',
      security_concern: 'security',
      performance_issue: 'performance',
      usability_issue: 'UX',
      data_issue: 'data',
      integration_issue: 'integration'
    };

    if (typeLabels[feedback.type]) {
      labels.push(typeLabels[feedback.type]);
    }

    // Priority labels
    const priorityLabels: Record<Priority, string> = {
      critical: 'priority:critical',
      high: 'priority:high',
      medium: 'priority:medium',
      low: 'priority:low'
    };

    labels.push(priorityLabels[feedback.priority]);

    // Category labels
    labels.push(`area:${feedback.category}`);

    // Effort labels
    if (feedback.estimatedEffort) {
      labels.push(`effort:${feedback.estimatedEffort}`);
    }

    // Auto-generated label
    labels.push('auto-generated');

    return labels;
  }

  // Get type emoji
  private getTypeEmoji(type: FeedbackType): string {
    const emojis: Record<FeedbackType, string> = {
      bug: '🐛',
      feature_request: '💡',
      improvement: '⚡',
      question: '❓',
      complaint: '😠',
      compliment: '👍',
      security_concern: '🔒',
      performance_issue: '🚀',
      usability_issue: '🎯',
      data_issue: '📊',
      integration_issue: '🔗'
    };

    return emojis[type] || '📝';
  }

  // Get type display name
  private getTypeDisplayName(type: FeedbackType): string {
    const names: Record<FeedbackType, string> = {
      bug: 'Bug Report',
      feature_request: 'Feature Request',
      improvement: 'Improvement',
      question: 'Question',
      complaint: 'Complaint',
      compliment: 'Compliment',
      security_concern: 'Security Concern',
      performance_issue: 'Performance Issue',
      usability_issue: 'Usability Issue',
      data_issue: 'Data Issue',
      integration_issue: 'Integration Issue'
    };

    return names[type] || 'Feedback';
  }

  // Make HTTP request to GitHub API
  private async makeRequest(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE', 
    body?: any
  ): Promise<Response> {
    if (!this.config) {
      throw new Error('GitHub not configured');
    }

    const url = `${this.config.apiUrl || 'https://api.github.com'}${endpoint}`;

    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${this.config.token}`,
      'User-Agent': 'OncoSafeRx-FeedbackSystem'
    };

    if (method !== 'GET' && body) {
      headers['Content-Type'] = 'application/json';
    }

    return fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  }

  // Validate configuration
  public validateConfig(config: Partial<GitHubConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.owner || config.owner.trim() === '') {
      errors.push('Repository owner is required');
    }

    if (!config.repo || config.repo.trim() === '') {
      errors.push('Repository name is required');
    }

    if (!config.token || config.token.trim() === '') {
      errors.push('GitHub token is required');
    } else if (config.token.length < 40) {
      errors.push('GitHub token appears to be invalid (too short)');
    }

    if (config.apiUrl && !config.apiUrl.startsWith('https://')) {
      errors.push('API URL must use HTTPS');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Clear configuration
  public clearConfig(): void {
    this.config = null;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Check if GitHub integration is enabled
  public isEnabled(): boolean {
    return !!(this.config && this.config.enabled);
  }
}

export const githubService = new GitHubService();