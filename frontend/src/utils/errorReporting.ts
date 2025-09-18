import { config } from './config';

export interface ErrorReport {
  error: Error;
  context: {
    component?: string;
    action?: string;
    userId?: string;
    sessionId: string;
    timestamp: string;
    url: string;
    userAgent: string;
    buildVersion: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
}

class ErrorReporter {
  private sessionId: string;
  private userId?: string;
  private errorQueue: ErrorReport[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
    this.setupNetworkListeners();
    
    // Flush queue periodically
    setInterval(() => this.flushErrorQueue(), 30000); // 30 seconds
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError(event.error || new Error(event.message), {
        component: 'Global',
        action: 'Uncaught Error',
        severity: 'high',
        tags: ['uncaught', 'javascript']
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          component: 'Global',
          action: 'Unhandled Promise Rejection',
          severity: 'high',
          tags: ['uncaught', 'promise']
        }
      );
    });

    // Handle React error boundaries (if using custom error boundary)
    window.addEventListener('react-error', ((event: CustomEvent) => {
      this.reportError(event.detail.error, {
        component: event.detail.component,
        action: 'React Error Boundary',
        severity: 'medium',
        tags: ['react', 'boundary']
      });
    }) as EventListener);
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public reportError(
    error: Error,
    options: {
      component?: string;
      action?: string;
      severity?: ErrorReport['severity'];
      tags?: string[];
    } = {}
  ): void {
    const errorReport: ErrorReport = {
      error,
      context: {
        component: options.component,
        action: options.action,
        userId: this.userId,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        buildVersion: config.version
      },
      severity: options.severity || 'medium',
      tags: options.tags
    };

    // Log to console in development
    if (config.environment === 'development') {
      console.error('Error Report:', errorReport);
    }

    // Add to queue
    this.errorQueue.push(errorReport);

    // Try to send immediately if online and critical
    if (this.isOnline && errorReport.severity === 'critical') {
      this.flushErrorQueue();
    }

    // Limit queue size
    if (this.errorQueue.length > 50) {
      this.errorQueue = this.errorQueue.slice(-25); // Keep last 25
    }
  }

  private async flushErrorQueue(): Promise<void> {
    if (!this.isOnline || this.errorQueue.length === 0) {
      return;
    }

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await this.sendErrors(errors);
    } catch (sendError) {
      // Re-queue errors if send failed
      this.errorQueue.unshift(...errors);
      console.warn('Failed to send error reports:', sendError);
    }
  }

  private async sendErrors(errors: ErrorReport[]): Promise<void> {
    if (config.environment === 'development') {
      console.log('Would send errors in production:', errors);
      return;
    }

    // In production, send to your error reporting service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    const response = await fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        errors: errors.map(err => ({
          ...err,
          error: {
            name: err.error.name,
            message: err.error.message,
            stack: err.error.stack
          }
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  public async reportPerformanceMetrics(metrics: {
    pageLoadTime?: number;
    apiResponseTime?: number;
    renderTime?: number;
    memoryUsage?: number;
    route?: string;
  }): Promise<void> {
    if (config.environment === 'development') {
      console.log('Performance metrics:', metrics);
      return;
    }

    try {
      await fetch('/api/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...metrics,
          sessionId: this.sessionId,
          userId: this.userId,
          timestamp: new Date().toISOString(),
          buildVersion: config.version
        })
      });
    } catch (error) {
      console.warn('Failed to send performance metrics:', error);
    }
  }
}

// Global error reporter instance
export const errorReporter = new ErrorReporter();

// Error Boundary is now exported from components/ErrorBoundary.tsx

export default errorReporter;