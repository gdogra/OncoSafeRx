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
  private isTrackingEnabled: boolean = false; // Will be enabled based on environment
  private apiEndpoint: string = '/api/analytics';
  private enableServerAnalytics: boolean = false; // Server analytics disabled - no backend available
  private serverAvailable: boolean | null = null; // Track if analytics server is available

  constructor() {
    this.initializeTracking();
  }

  private initializeTracking(): void {
    // ALWAYS log initialization attempt
    console.log('🔍 ANALYTICS INIT DEBUG:', {
      hostname: window.location.hostname,
      href: window.location.href,
      envVars: (import.meta as any)?.env,
      localStorage: {
        optOut: localStorage.getItem('analytics_opt_out'),
        session: !!localStorage.getItem('current_session')
      }
    });

    // Check if user has opted out
    const hasOptedOut = localStorage.getItem('analytics_opt_out') === 'true';
    if (hasOptedOut) {
      this.isTrackingEnabled = false;
      console.log('🚫 Analytics tracking disabled (user opt-out)');
      return;
    }

    // Check environment configuration
    const envTrackingEnabled = (import.meta as any)?.env?.VITE_ANALYTICS_ENABLED === 'true';
    const isProduction = window.location.hostname === 'oncosaferx.com' || 
                        window.location.hostname === 'www.oncosaferx.com' ||
                        window.location.hostname.includes('netlify.app');
    
    console.log('🔍 ANALYTICS ENV CHECK:', {
      envTrackingEnabled,
      isProduction,
      hostname: window.location.hostname,
      envViteAnalyticsEnabled: (import.meta as any)?.env?.VITE_ANALYTICS_ENABLED
    });
    
    // Enable tracking if explicitly enabled via env var OR in production
    const shouldEnableTracking = envTrackingEnabled || isProduction;
    
    if (shouldEnableTracking) {
      this.isTrackingEnabled = true;
      console.log('✅ Analytics tracking ENABLED', { 
        reason: envTrackingEnabled ? 'environment variable' : 'production domain',
        hostname: window.location.hostname,
        envTrackingEnabled,
        isProduction
      });
      this.startSession();
      this.setupEventListeners();
      
      // Test tracking with a startup event
      setTimeout(() => {
        this.trackCustomEvent('tracking_test', { 
          timestamp: new Date().toISOString(),
          message: 'Tracking system initialized successfully'
        });
        console.log('📊 Test tracking event sent');
      }, 1000);
    } else {
      this.isTrackingEnabled = false;
      console.log('🚫 Analytics tracking DISABLED', { 
        hostname: window.location.hostname,
        envEnabled: envTrackingEnabled,
        isProduction,
        reason: 'Not production domain and env var not set'
      });
    }
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
    console.log('👤 Setting user for analytics:', { userId, userRole, trackingEnabled: this.isTrackingEnabled });
    
    if (!this.isTrackingEnabled || !this.currentSession) {
      console.log('⚠️ Cannot set user - tracking disabled or no session');
      return;
    }

    this.currentSession.userId = userId;
    this.currentSession.userRole = userRole;
    
    // Update localStorage
    localStorage.setItem('current_session', JSON.stringify(this.currentSession));
    
    // Track user login event
    this.trackCustomEvent('user_login', {
      userId,
      userRole,
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ User set for analytics tracking:', { userId, userRole });
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
        data: {
          ...data,
          userId: this.currentSession?.userId,
          userRole: this.currentSession?.userRole,
          url: window.location.pathname + window.location.search,
          path: window.location.pathname
        },
        timestamp: new Date().toISOString(),
        sessionId: this.currentSession?.sessionId,
        userId: this.currentSession?.userId,
        userRole: this.currentSession?.userRole
      };

      // Store locally for admin viewing (always do this)
      this.storeAnalyticsLocally(payload);

      // Skip server calls in development to avoid 404 errors
      const isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.port === '5174' ||
                           window.location.port === '5176' ||
                           window.location.port === '3000';
      
      if (isDevelopment || !this.enableServerAnalytics) {
        console.debug('Analytics stored locally (dev mode or server analytics disabled):', eventType);
        return;
      }

      // Check if we've already determined server is unavailable
      if (this.serverAvailable === false) {
        console.debug('Analytics server unavailable, skipping server request');
        return;
      }

      // Only send to server in production if server analytics enabled
      const payloadJson = JSON.stringify(payload);
      
      if (navigator.sendBeacon) {
        const success = navigator.sendBeacon(this.apiEndpoint, payloadJson);
        if (!success) {
          this.sendAnalyticsWithFetch(payloadJson);
        }
      } else {
        this.sendAnalyticsWithFetch(payloadJson);
      }
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.debug('Analytics tracking error:', error);
    }
  }

  private sendAnalyticsWithFetch(payloadJson: string): void {
    fetch(this.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payloadJson,
      keepalive: true,
      signal: AbortSignal.timeout(5000) // 5 second timeout
    }).catch(error => {
      // After first failure, mark server as unavailable to prevent future attempts
      if (error.name === 'TimeoutError' || error.message.includes('404')) {
        console.debug('Analytics server not responding, disabling further attempts');
        this.serverAvailable = false;
      }
      console.debug('Analytics request failed:', error.message);
    });
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

  // Debug methods for testing
  public forceTrackingEnabled(): void {
    console.log('🔧 Force enabling tracking for testing...');
    this.isTrackingEnabled = true;
    if (!this.currentSession) {
      this.startSession();
      this.setupEventListeners();
    }
    
    // Immediately test with a manual event
    this.trackCustomEvent('force_enabled_test', {
      timestamp: new Date().toISOString(),
      forced: true
    });
    
    console.log('✅ Tracking force-enabled and test event sent');
    console.log('📊 Current session:', this.currentSession);
  }

  public getStoredAnalyticsData(): any[] {
    try {
      return JSON.parse(localStorage.getItem('osrx_analytics_data') || '[]');
    } catch {
      return [];
    }
  }

  public clearAnalyticsData(): void {
    localStorage.removeItem('osrx_analytics_data');
    localStorage.removeItem('current_session');
    console.log('🗑️ Analytics data cleared');
  }

  public testAnalyticsManually(): void {
    console.log('🧪 Manual analytics test starting...');
    
    // Force store some test data
    const testEvent = {
      eventType: 'test_manual',
      data: {
        userId: 'test-user-' + Date.now(),
        userRole: 'oncologist',
        url: window.location.pathname,
        path: window.location.pathname,
        test: true
      },
      timestamp: new Date().toISOString(),
      sessionId: 'test-session-' + Date.now(),
      userId: 'test-user-' + Date.now(),
      userRole: 'oncologist',
      localTimestamp: Date.now()
    };
    
    try {
      const key = 'osrx_analytics_data';
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      stored.push(testEvent);
      localStorage.setItem(key, JSON.stringify(stored));
      
      console.log('✅ Test event stored manually:', testEvent);
      console.log('📊 Total events now:', stored.length);
      
      // Test analytics calculation
      this.getAnalytics('7d').then(metrics => {
        console.log('📈 Calculated metrics:', metrics);
      });
      
    } catch (error) {
      console.error('❌ Manual test failed:', error);
    }
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
      console.log('📊 Fetching analytics from server:', `${this.apiEndpoint}/metrics?range=${dateRange}`);
      const response = await fetch(`${this.apiEndpoint}/metrics?range=${dateRange}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const serverMetrics = await response.json();
      console.log('📊 ✅ Retrieved analytics from server:', serverMetrics);
      return serverMetrics;
    } catch (error) {
      console.warn('📊 Server analytics unavailable, falling back to local data:', error);
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
      
      // Calculate unique visitors by userId (for authenticated users) or sessionId (for anonymous)
      // Prioritize userId over sessionId to avoid counting the same user multiple times
      const uniqueUsers = new Set();
      const authenticatedUsers = new Set();
      
      // First pass: collect all authenticated user IDs
      recentData.forEach((item: any) => {
        if (item.data?.userId || item.userId) {
          authenticatedUsers.add(item.data?.userId || item.userId);
        }
      });
      
      // Second pass: add authenticated users, then anonymous sessions
      recentData.forEach((item: any) => {
        const userId = item.data?.userId || item.userId;
        if (userId) {
          uniqueUsers.add(`user:${userId}`);
        } else {
          // Only count anonymous sessions if no authenticated user data exists
          uniqueUsers.add(`session:${item.sessionId}`);
        }
      });
      
      const uniquePages = new Set(
        recentData
          .filter((item: any) => item.eventType === 'pageview')
          .map((item: any) => item.data?.url || item.data?.path || '/')
      );
      
      console.log('📊 Analytics Debug:', {
        totalEvents: recentData.length,
        pageviews,
        sessions,
        uniqueUsers: uniqueUsers.size,
        sampleEvents: recentData.slice(0, 3)
      });
      
      return {
        totalVisitors: sessions, // Total sessions/visits
        uniqueVisitors: uniqueUsers.size, // Deduplicated unique users
        pageViews: pageviews, // Fixed: interface expects pageViews not totalPageviews
        averageSessionDuration: 0,
        bounceRate: 0,
        topPages: Array.from(uniquePages).slice(0, 10).map(page => ({
          url: page as string, // Fixed: interface expects url not path
          views: recentData.filter(item => 
            item.eventType === 'pageview' && (item.data?.url || item.data?.path) === page
          ).length
        })),
        userRoles: [{ role: 'oncologist', count: sessions }],
        deviceTypes: [{ type: 'Unknown', count: sessions }],
        geographicDistribution: [{ location: 'Unknown', count: sessions }] // Fixed: added missing field
      };
    } catch (error) {
      console.error('Failed to get local analytics:', error);
      return {
        totalVisitors: 0,
        uniqueVisitors: 0,
        pageViews: 0,
        averageSessionDuration: 0,
        bounceRate: 0,
        topPages: [],
        userRoles: [],
        deviceTypes: [],
        geographicDistribution: []
      };
    }
  }
}

// Create singleton instance
export const visitorTracking = new VisitorTrackingService();

// Make available globally for debugging in production
if (typeof window !== 'undefined') {
  (window as any).visitorTracking = visitorTracking;
}

// Export for use in components
export default visitorTracking;
