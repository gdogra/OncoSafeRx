import { v4 as uuidv4 } from 'uuid';

export interface VisitorSession {
  sessionId: string;
  userId?: string;
  userRole?: string;
  ipAddress: string;
  userAgent: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  browser: string;
  os: string;
  screenResolution: string;
  timezone: string;
  language: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  pageViews: PageView[];
  interactions: UserInteraction[];
  location?: GeolocationData;
  referrer?: string;
  isReturningVisitor: boolean;
}

export interface PageView {
  pageId: string;
  url: string;
  title: string;
  timestamp: string;
  timeOnPage?: number;
  scrollDepth: number;
  exitPage: boolean;
}

export interface UserInteraction {
  id: string;
  type: 'click' | 'scroll' | 'search' | 'form_submit' | 'download' | 'error';
  element?: string;
  value?: string;
  timestamp: string;
  pageUrl: string;
}

export interface GeolocationData {
  country: string;
  region: string;
  city: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface AnalyticsMetrics {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: { url: string; views: number }[];
  userRoles: { role: string; count: number }[];
  deviceTypes: { type: string; count: number }[];
  geographicDistribution: { location: string; count: number }[];
}

class VisitorTrackingService {
  private currentSession: VisitorSession | null = null;
  private sessionStartTime: number = 0;
  private currentPageStart: number = 0;
  private currentPageView: PageView | null = null;
  private isTrackingEnabled: boolean = false; // Disable all tracking by default
  private apiEndpoint: string = '/api/analytics';
  private enableServerAnalytics: boolean = false; // Completely disable analytics to eliminate 404 errors

  constructor() {
    this.initializeTracking();
  }

  private initializeTracking(): void {
    // Analytics completely disabled - never initialize
    console.debug('🚫 Analytics tracking completely disabled');
    this.isTrackingEnabled = false;
    return;
    
    // Legacy code (unreachable) - kept for reference
    const hasOptedOut = localStorage.getItem('analytics_opt_out') === 'true';
    if (hasOptedOut || !this.enableServerAnalytics) {
      this.isTrackingEnabled = false;
      console.debug('🚫 Analytics tracking disabled (user opt-out or server analytics disabled)');
      return;
    }

    this.startSession();
    this.setupEventListeners();
  }

  private startSession(): void {
    const sessionId = this.generateSessionId();
    const deviceInfo = this.getDeviceInfo();
    
    this.currentSession = {
      sessionId,
      ipAddress: 'hidden', // Server-side tracking for privacy
      userAgent: navigator.userAgent,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      startTime: new Date().toISOString(),
      pageViews: [],
      interactions: [],
      referrer: document.referrer || undefined,
      isReturningVisitor: this.checkReturningVisitor()
    };

    this.sessionStartTime = Date.now();
    this.trackPageView();
    
    // Get location (if permitted)
    this.getLocation();
    
    // Save session to localStorage for persistence
    localStorage.setItem('current_session', JSON.stringify(this.currentSession));
  }

  private generateSessionId(): string {
    // Check for existing session
    const existingSession = localStorage.getItem('current_session');
    if (existingSession) {
      const session = JSON.parse(existingSession);
      const sessionAge = Date.now() - new Date(session.startTime).getTime();
      
      // If session is less than 30 minutes old, continue it
      if (sessionAge < 30 * 60 * 1000) {
        return session.sessionId;
      }
    }
    
    return uuidv4();
  }

  private getDeviceInfo(): { deviceType: 'desktop' | 'tablet' | 'mobile'; browser: string; os: string } {
    const userAgent = navigator.userAgent;
    
    // Device type detection
    let deviceType: 'desktop' | 'tablet' | 'mobile' = 'desktop';
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      deviceType = 'tablet';
    } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      deviceType = 'mobile';
    }

    // Browser detection
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';

    // OS detection
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    return { deviceType, browser, os };
  }

  private checkReturningVisitor(): boolean {
    const visitHistory = localStorage.getItem('visitor_history');
    return visitHistory !== null;
  }

  private getLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (this.currentSession) {
            this.currentSession.location = {
              country: 'Unknown', // Would be resolved server-side
              region: 'Unknown',
              city: 'Unknown',
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            };
          }
        },
        () => {
          // Location access denied - that's fine
        }
      );
    }
  }

  private setupEventListeners(): void {
    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.endCurrentPageView();
      } else {
        this.trackPageView();
      }
    });

    // Before unload
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    // Click tracking
    document.addEventListener('click', (event) => {
      this.trackInteraction('click', event.target as Element);
    });

    // Scroll tracking
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackScrollDepth();
      }, 250);
    });

    // Form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackInteraction('form_submit', form);
    });

    // Error tracking
    window.addEventListener('error', (event) => {
      this.trackInteraction('error', null, event.message);
    });
  }

  public setUser(userId: string, userRole: string): void {
    if (!this.isTrackingEnabled || !this.currentSession) return;

    this.currentSession.userId = userId;
    this.currentSession.userRole = userRole;
    
    // Update localStorage
    localStorage.setItem('current_session', JSON.stringify(this.currentSession));
  }

  public trackPageView(customTitle?: string): void {
    if (!this.isTrackingEnabled || !this.currentSession) return;

    // End previous page view
    this.endCurrentPageView();

    const pageView: PageView = {
      pageId: uuidv4(),
      url: window.location.pathname + window.location.search,
      title: customTitle || document.title,
      timestamp: new Date().toISOString(),
      scrollDepth: 0,
      exitPage: false
    };

    this.currentSession.pageViews.push(pageView);
    this.currentPageView = pageView;
    this.currentPageStart = Date.now();

    // Send to server if enabled
    this.sendToServer('pageview', pageView);
  }

  private endCurrentPageView(): void {
    if (this.currentPageView && this.currentPageStart) {
      this.currentPageView.timeOnPage = Date.now() - this.currentPageStart;
      this.currentPageView.exitPage = true;
      
      // Update in session
      if (this.currentSession) {
        const index = this.currentSession.pageViews.findIndex(pv => pv.pageId === this.currentPageView!.pageId);
        if (index !== -1) {
          this.currentSession.pageViews[index] = this.currentPageView;
        }
      }
    }
  }

  public trackInteraction(type: UserInteraction['type'], element: Element | null, value?: string): void {
    if (!this.isTrackingEnabled || !this.currentSession) return;

    const interaction: UserInteraction = {
      id: uuidv4(),
      type,
      element: element ? this.getElementSelector(element) : undefined,
      value,
      timestamp: new Date().toISOString(),
      pageUrl: window.location.pathname
    };

    this.currentSession.interactions.push(interaction);
    
    // Send to server for real-time tracking
    this.sendToServer('interaction', interaction);
  }

  private getElementSelector(element: Element): string {
    // Create a simple selector for the element
    let selector = element.tagName.toLowerCase();
    
    if (element.id) {
      selector += `#${element.id}`;
    } else if (element.className) {
      // Handle both string and DOMTokenList className
      const className = typeof element.className === 'string' 
        ? element.className 
        : element.className.toString();
      const firstClass = className.split(' ')[0];
      if (firstClass) {
        selector += `.${firstClass}`;
      }
    }
    
    return selector;
  }

  private trackScrollDepth(): void {
    if (!this.currentPageView) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    const scrollDepth = Math.round((scrollTop + windowHeight) / documentHeight * 100);
    
    if (scrollDepth > this.currentPageView.scrollDepth) {
      this.currentPageView.scrollDepth = scrollDepth;
    }
  }

  public trackCustomEvent(eventName: string, eventData?: any): void {
    if (!this.isTrackingEnabled) return;

    this.trackInteraction('click', null, JSON.stringify({ event: eventName, data: eventData }));
  }

  public trackSearch(query: string, resultsCount: number): void {
    this.trackInteraction('search', null, JSON.stringify({ query, resultsCount }));
  }

  public trackDownload(fileName: string, fileType: string): void {
    this.trackInteraction('download', null, JSON.stringify({ fileName, fileType }));
  }

  private endSession(): void {
    if (!this.currentSession) return;

    this.endCurrentPageView();
    
    this.currentSession.endTime = new Date().toISOString();
    this.currentSession.duration = Date.now() - this.sessionStartTime;

    // Mark visitor history
    localStorage.setItem('visitor_history', 'true');
    
    // Send final session data
    this.sendToServer('session_end', this.currentSession);
    
    // Clear current session
    localStorage.removeItem('current_session');
  }

  private async sendToServer(eventType: string, data: any): Promise<void> {
    // ALWAYS return early - server analytics completely disabled
    if (!this.enableServerAnalytics) return;
    if (!this.isTrackingEnabled) return;

    try {
      const payload = {
        eventType,
        data,
        timestamp: new Date().toISOString(),
        sessionId: this.currentSession?.sessionId
      };

      // Store locally for admin viewing (always do this)
      this.storeAnalyticsLocally(payload);

      // Skip server calls in development to avoid 404 errors
      const isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.port === '5174';
      
      if (isDevelopment || !this.enableServerAnalytics) {
        console.debug('Analytics stored locally (dev mode or server analytics disabled):', eventType);
        return;
      }

      // Only send to server in production if server analytics enabled
      const payloadJson = JSON.stringify(payload);
      
      if (navigator.sendBeacon) {
        navigator.sendBeacon(this.apiEndpoint, payloadJson);
      } else {
        fetch(this.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payloadJson,
          keepalive: true
        }).catch(() => {
          // Silently fail - analytics shouldn't break the app
        });
      }
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.debug('Analytics tracking error:', error);
    }
  }

  private storeAnalyticsLocally(payload: any): void {
    try {
      const key = 'osrx_analytics_data';
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      stored.push({ ...payload, localTimestamp: Date.now() });
      
      // Keep only last 200 entries to avoid storage bloat
      if (stored.length > 200) {
        stored.splice(0, stored.length - 200);
      }
      
      localStorage.setItem(key, JSON.stringify(stored));
    } catch (error) {
      console.debug('Local analytics storage failed:', error);
    }
  }

  public optOut(): void {
    localStorage.setItem('analytics_opt_out', 'true');
    this.isTrackingEnabled = false;
    this.endSession();
  }

  public optIn(): void {
    localStorage.removeItem('analytics_opt_out');
    this.isTrackingEnabled = true;
    this.initializeTracking();
  }

  public isOptedOut(): boolean {
    return !this.isTrackingEnabled;
  }

  public getCurrentSession(): VisitorSession | null {
    return this.currentSession;
  }

  public async getAnalytics(dateRange: string = '7d'): Promise<AnalyticsMetrics> {
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.port === '5174';
    
    if (isDevelopment) {
      // Return analytics from local storage in development
      return this.getLocalAnalytics(dateRange);
    }
    
    try {
      const response = await fetch(`${this.apiEndpoint}/metrics?range=${dateRange}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('Server analytics unavailable, falling back to local data');
      return this.getLocalAnalytics(dateRange);
    }
  }

  private getLocalAnalytics(dateRange: string = '7d'): AnalyticsMetrics {
    try {
      const stored = JSON.parse(localStorage.getItem('osrx_analytics_data') || '[]');
      console.log('📊 Visitor Analytics Debug - Local storage data:', stored.length, 'items');
      console.log('📊 Sample data:', stored.slice(0, 3));
      
      // Calculate date range
      const now = Date.now();
      const days = parseInt(dateRange.replace('d', '')) || 7;
      const cutoff = now - (days * 24 * 60 * 60 * 1000);
      
      const recentData = stored.filter((item: any) => 
        (item.localTimestamp || item.timestamp) > cutoff
      );
      
      // Process data into analytics metrics
      const pageviews = recentData.filter((item: any) => item.eventType === 'pageview').length;
      const sessions = new Set(recentData.map((item: any) => item.sessionId)).size;
      const interactions = recentData.filter((item: any) => item.eventType === 'interaction').length;
      
      const uniquePages = new Set(
        recentData
          .filter((item: any) => item.eventType === 'pageview')
          .map((item: any) => item.data?.path || '/')
      );
      
      return {
        totalVisitors: sessions,
        totalPageviews: pageviews,
        totalSessions: sessions,
        totalInteractions: interactions,
        avgSessionDuration: 0, // Would need more complex calculation
        topPages: Array.from(uniquePages).slice(0, 10).map(page => ({
          path: page as string,
          views: recentData.filter(item => 
            item.eventType === 'pageview' && item.data?.path === page
          ).length,
          uniqueVisitors: 0 // Simplified for now
        })),
        userRoles: [{ role: 'oncologist', count: sessions }], // Simplified for development
        deviceTypes: [{ type: 'Unknown', count: sessions }],
        trafficSources: [{ source: 'Direct', count: sessions }],
        realTimeVisitors: Math.min(sessions, 5), // Simplified
        todayPageviews: pageviews,
        conversionRate: 0 // Not tracked locally
      };
    } catch (error) {
      console.error('Failed to get local analytics:', error);
      return {
        totalVisitors: 0,
        totalPageviews: 0, 
        totalSessions: 0,
        totalInteractions: 0,
        avgSessionDuration: 0,
        topPages: [],
        userRoles: [],
        deviceTypes: [],
        trafficSources: [],
        realTimeVisitors: 0,
        todayPageviews: 0,
        conversionRate: 0
      };
    }
  }
}

// Create singleton instance
export const visitorTracking = new VisitorTrackingService();

// Export for use in components
export default visitorTracking;
