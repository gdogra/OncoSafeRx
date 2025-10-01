import { FeedbackItem, FeedbackFormData } from '../types/feedback';
import { FeedbackClassifier, SprintPlanner } from '../utils/feedbackClassifier';
import { githubService } from './githubService';

class FeedbackService {
  private readonly STORAGE_KEY = 'oncosaferx_feedback';
  private readonly STORAGE_KEY_TICKETS = 'oncosaferx_tickets';

  // Generate unique ID
  private generateId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get browser info for context
  private getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = 'Unknown';
    let os = 'Unknown';

    // Browser detection
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    // OS detection
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    return { browser, version, os };
  }

  // Submit feedback
  public async submitFeedback(formData: FeedbackFormData): Promise<string> {
    try {
      const sessionId = sessionStorage.getItem('oncosaferx_session_id') || this.generateId();
      const page = window.location.pathname;
      const url = window.location.href;
      
      const feedbackData = {
        ...formData,
        page,
        userAgent: navigator.userAgent,
        url,
        sessionId,
        metadata: {
          component: formData.component,
          reproductionSteps: formData.reproductionSteps ? [formData.reproductionSteps] : undefined,
          expectedBehavior: formData.expectedBehavior,
          actualBehavior: formData.actualBehavior,
          browserInfo: this.getBrowserInfo(),
          feature: this.inferFeatureFromPage(page)
        }
      };

      // Submit to backend API
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'user-email': this.getCurrentUserEmail() // For admin access control
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback to server');
      }

      const result = await response.json();
      console.log('✅ Feedback submitted successfully:', result.ticketNumber);

      // Store locally as backup
      const feedbackItem: FeedbackItem = {
        id: result.id,
        sessionId,
        timestamp: new Date().toISOString(),
        type: result.classification.type,
        category: result.classification.category,
        priority: result.classification.priority,
        title: formData.title,
        description: formData.description,
        page,
        userAgent: navigator.userAgent,
        url,
        metadata: feedbackData.metadata,
        status: 'new',
        estimatedEffort: result.classification.estimatedEffort,
        labels: result.classification.labels,
        votes: 0
      };

      this.storeFeedbackLocally(feedbackItem);

      // Send to analytics if available
      try {
        const analytics = await import('../utils/analytics');
        analytics.analytics.logEvent('feedback_submitted', {
          type: result.classification.type,
          category: result.classification.category,
          priority: result.classification.priority,
          page,
          ticketNumber: result.ticketNumber
        });
      } catch (e) {
        console.warn('Analytics not available:', e);
      }

      return result.id;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      
      // Fallback to local storage if API fails
      console.log('🔄 Falling back to local storage...');
      return this.submitFeedbackLocally(formData);
    }
  }

  // Fallback method for local submission
  private async submitFeedbackLocally(formData: FeedbackFormData): Promise<string> {
    const sessionId = sessionStorage.getItem('oncosaferx_session_id') || this.generateId();
    const page = window.location.pathname;
    const url = window.location.href;
    
    // Classify the feedback
    const classification = FeedbackClassifier.classify(formData, page);

    const feedbackItem: FeedbackItem = {
      id: this.generateId(),
      sessionId,
      timestamp: new Date().toISOString(),
      type: classification.type,
      category: classification.category,
      priority: classification.priority,
      title: formData.title,
      description: formData.description,
      page,
      userAgent: navigator.userAgent,
      url,
      metadata: {
        component: formData.component,
        reproductionSteps: formData.reproductionSteps ? [formData.reproductionSteps] : undefined,
        expectedBehavior: formData.expectedBehavior,
        actualBehavior: formData.actualBehavior,
        browserInfo: this.getBrowserInfo(),
        feature: this.inferFeatureFromPage(page),
        fallbackMode: true
      },
      status: 'new',
      estimatedEffort: classification.estimatedEffort,
      labels: classification.labels,
      votes: 0
    };

    this.storeFeedbackLocally(feedbackItem);
    this.storeTicketForSprint(feedbackItem);
    
    return feedbackItem.id;
  }

  // Get current user email for admin access
  private getCurrentUserEmail(): string {
    try {
      // Try to get from auth context
      const authData = localStorage.getItem('osrx_dev_auth');
      if (authData) {
        const user = JSON.parse(authData);
        return user.email || '';
      }
      return '';
    } catch {
      return '';
    }
  }

  // Store feedback locally for offline support
  private storeFeedbackLocally(feedback: FeedbackItem): void {
    try {
      const existing = this.getStoredFeedback();
      existing.push(feedback);
      
      // Keep only last 100 feedback items to prevent storage bloat
      const recent = existing.slice(-100);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recent));
    } catch (error) {
      console.warn('Failed to store feedback locally:', error);
    }
  }

  // Store as ticket for sprint planning
  private storeTicketForSprint(feedback: FeedbackItem): void {
    try {
      const existing = this.getStoredTickets();
      existing.push({
        id: feedback.id,
        type: feedback.type,
        category: feedback.category,
        priority: feedback.priority,
        effort: feedback.estimatedEffort!,
        title: feedback.title,
        description: feedback.description,
        labels: feedback.labels,
        timestamp: feedback.timestamp,
        status: feedback.status
      });

      localStorage.setItem(this.STORAGE_KEY_TICKETS, JSON.stringify(existing));
    } catch (error) {
      console.warn('Failed to store ticket:', error);
    }
  }

  // Get stored feedback
  public getStoredFeedback(): FeedbackItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to retrieve stored feedback:', error);
      return [];
    }
  }

  // Get stored tickets
  public getStoredTickets() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_TICKETS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to retrieve stored tickets:', error);
      return [];
    }
  }

  // Get sprint planning data
  public getSprintPlan() {
    const tickets = this.getStoredTickets();
    const openTickets = tickets.filter((t: any) => !['done', 'closed', 'wont_fix'].includes(t.status));
    
    return SprintPlanner.calculateSprintFit(openTickets);
  }

  // Get analytics for feedback
  public async getFeedbackAnalytics() {
    try {
      // Try backend analytics if authenticated
      const token = this.getAccessToken();
      if (token) {
        const response = await fetch('/api/feedback/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const analytics = await response.json();
          console.log('📊 Loaded analytics from backend:', analytics);
          return analytics;
        }
      }
    } catch (error) {
      console.log('⚠️ Backend analytics unavailable, using local data');
    }

    // Fallback to local data
    const feedback = this.getStoredFeedback();
    const tickets = this.getStoredTickets();

    const typeCount = feedback.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryCount = feedback.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityCount = feedback.reduce((acc, item) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalFeedback: feedback.length,
      totalTickets: tickets.length,
      byType: typeCount,
      byCategory: categoryCount,
      byPriority: priorityCount,
      recentFeedback: feedback.slice(-10).reverse(),
      sprintPlan: this.getSprintPlan()
    };
  }

  // Admin: Get all feedback from backend
  public async getAllFeedback(page = 1, limit = 50, filters: any = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const token = this.getAccessToken();
      const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`/api/feedback/admin/all?${params}`, { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch feedback from server');
      }

      const result = await response.json();
      console.log('📋 Loaded feedback from backend:', result);
      return result;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      // Fallback to local data
      return {
        feedback: this.getStoredFeedback(),
        total: this.getStoredFeedback().length,
        page: 1,
        limit: 50,
        totalPages: 1
      };
    }
  }

  // Admin: Update feedback status
  public async updateFeedbackStatus(id: string, status: string, assignee?: string, sprintTarget?: string) {
    try {
      const token = this.getAccessToken();
      const response = await fetch(`/api/feedback/admin/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status, assignee, sprintTarget })
      });

      if (!response.ok) {
        throw new Error('Failed to update feedback status');
      }

      const result = await response.json();
      console.log('✅ Feedback status updated:', result);
      return result;
    } catch (error) {
      console.error('Error updating feedback status:', error);
      throw error;
    }
  }

  // Admin: Create GitHub issue from feedback
  public async createGitHubIssue(id: string) {
    try {
      const token = this.getAccessToken();
      const response = await fetch(`/api/feedback/admin/${id}/create-issue`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error('Failed to create GitHub issue');
      }

      const result = await response.json();
      console.log('✅ GitHub issue created:', result.issueUrl);
      return result;
    } catch (error) {
      console.error('Error creating GitHub issue:', error);
      throw error;
    }
  }

  // Helper: get access token from storage
  private getAccessToken(): string | null {
    try {
      const raw = localStorage.getItem('osrx_auth_tokens');
      if (!raw) return null;
      const tokens = JSON.parse(raw);
      return tokens?.access_token || null;
    } catch {
      return null;
    }
  }

  // Infer feature from page path
  private inferFeatureFromPage(page: string): string {
    const featureMap: Record<string, string> = {
      '/': 'dashboard',
      '/drug-search': 'drug_search',
      '/interactions': 'drug_interactions',
      '/protocols': 'clinical_protocols',
      '/genomics': 'pharmacogenomics',
      '/trials': 'clinical_trials',
      '/regimens': 'treatment_regimens'
    };

    return featureMap[page] || 'unknown';
  }

  // Export feedback data for backup/analysis
  public exportFeedbackData(): string {
    const data = {
      feedback: this.getStoredFeedback(),
      tickets: this.getStoredTickets(),
      analytics: this.getFeedbackAnalytics(),
      exportDate: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  // Clear all feedback data
  public clearFeedbackData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STORAGE_KEY_TICKETS);
  }

  // Create GitHub issue if integration is enabled
  private async createGitHubIssue(feedback: FeedbackItem): Promise<void> {
    try {
      if (githubService.isEnabled()) {
        const issue = await githubService.createIssueFromFeedback(feedback);
        
        // Store GitHub issue reference in feedback metadata
        feedback.metadata = {
          ...feedback.metadata,
          githubIssue: {
            number: issue.number,
            url: issue.html_url,
            created_at: issue.created_at
          }
        };

        // Update stored feedback with GitHub issue info
        this.updateStoredFeedback(feedback);
        
        console.log(`Created GitHub issue #${issue.number} for feedback ${feedback.id}`);
      }
    } catch (error) {
      console.warn('Failed to create GitHub issue:', error);
      // Don't throw error - feedback submission should succeed even if GitHub fails
    }
  }

  // Update stored feedback item
  private updateStoredFeedback(updatedFeedback: FeedbackItem): void {
    try {
      const existing = this.getStoredFeedback();
      const index = existing.findIndex(f => f.id === updatedFeedback.id);
      
      if (index !== -1) {
        existing[index] = updatedFeedback;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing));
      }
    } catch (error) {
      console.warn('Failed to update stored feedback:', error);
    }
  }

  // In a real application, you'd implement this to send to your backend
  private async sendToBackend(feedback: FeedbackItem): Promise<void> {
    // Example implementation:
    // const response = await fetch('/api/feedback', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(feedback)
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Failed to submit feedback to server');
    // }
  }
}

export const feedbackService = new FeedbackService();
