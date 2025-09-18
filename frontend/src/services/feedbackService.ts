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
          feature: this.inferFeatureFromPage(page)
        },
        status: 'new',
        estimatedEffort: classification.estimatedEffort,
        labels: classification.labels,
        votes: 0
      };

      // Store feedback locally
      this.storeFeedbackLocally(feedbackItem);

      // Store as ticket for sprint planning
      this.storeTicketForSprint(feedbackItem);

      // Create GitHub issue if integration is enabled
      await this.createGitHubIssue(feedbackItem);

      // Send to analytics if available
      try {
        const analytics = await import('../utils/analytics');
        analytics.analytics.logEvent('feedback_submitted', {
          type: classification.type,
          category: classification.category,
          priority: classification.priority,
          page
        });
      } catch (e) {
        console.warn('Analytics not available:', e);
      }

      // In a real app, you'd send this to your backend API
      // await this.sendToBackend(feedbackItem);

      return feedbackItem.id;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw new Error('Failed to submit feedback. Please try again.');
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
  public getFeedbackAnalytics() {
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