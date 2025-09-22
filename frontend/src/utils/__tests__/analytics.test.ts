import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  trackEvent, 
  trackPageView, 
  trackUserAction,
  trackError,
  trackPerformance,
  setUserProperties,
  Analytics
} from '../analytics';

// Mock console methods
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

Object.assign(console, mockConsole);

describe('Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset analytics instance
    Analytics['events'] = [];
    Analytics['isEnabled'] = true;
  });

  describe('trackEvent', () => {
    it('tracks events with correct structure', () => {
      const eventData = {
        category: 'Drug Search',
        action: 'search_performed',
        label: 'erlotinib',
        value: 1
      };

      trackEvent(eventData);

      const events = Analytics.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        type: 'event',
        ...eventData,
        timestamp: expect.any(String),
        sessionId: expect.any(String),
      });
    });

    it('includes user context when available', () => {
      setUserProperties({
        userId: 'user-123',
        role: 'oncologist',
        institution: 'Test Hospital'
      });

      trackEvent({
        category: 'Genomics',
        action: 'analysis_started'
      });

      const events = Analytics.getEvents();
      expect(events[0].userContext).toMatchObject({
        userId: 'user-123',
        role: 'oncologist',
        institution: 'Test Hospital'
      });
    });
  });

  describe('trackPageView', () => {
    it('tracks page views correctly', () => {
      trackPageView('/drug-search', 'Drug Search');

      const events = Analytics.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        type: 'pageview',
        path: '/drug-search',
        title: 'Drug Search',
        timestamp: expect.any(String),
      });
    });

    it('includes referrer when provided', () => {
      trackPageView('/genomics', 'Genomics Analysis', '/dashboard');

      const events = Analytics.getEvents();
      expect(events[0]).toMatchObject({
        path: '/genomics',
        referrer: '/dashboard'
      });
    });
  });

  describe('trackUserAction', () => {
    it('tracks user actions with interaction details', () => {
      trackUserAction('button_click', 'Add Drug', {
        drugName: 'Tamoxifen',
        source: 'search_results'
      });

      const events = Analytics.getEvents();
      expect(events[0]).toMatchObject({
        type: 'user_action',
        action: 'button_click',
        target: 'Add Drug',
        metadata: {
          drugName: 'Tamoxifen',
          source: 'search_results'
        }
      });
    });

    it('captures timing information for interactions', () => {
      const startTime = Date.now();
      
      trackUserAction('form_submit', 'Patient Form', {
        fieldCount: 5,
        timeTaken: 1500
      });

      const events = Analytics.getEvents();
      expect(events[0].timestamp).toBeDefined();
      expect(events[0].metadata?.timeTaken).toBe(1500);
    });
  });

  describe('trackError', () => {
    it('tracks errors with stack traces', () => {
      const error = new Error('Test error message');
      
      trackError(error, {
        component: 'DrugSearch',
        action: 'api_call',
        userId: 'user-123'
      });

      const events = Analytics.getEvents();
      expect(events[0]).toMatchObject({
        type: 'error',
        message: 'Test error message',
        stack: expect.stringContaining('Error: Test error message'),
        context: {
          component: 'DrugSearch',
          action: 'api_call',
          userId: 'user-123'
        }
      });
    });

    it('tracks string errors', () => {
      trackError('Network connection failed', {
        component: 'API',
        endpoint: '/api/drugs'
      });

      const events = Analytics.getEvents();
      expect(events[0]).toMatchObject({
        type: 'error',
        message: 'Network connection failed',
        context: {
          component: 'API',
          endpoint: '/api/drugs'
        }
      });
    });
  });

  describe('trackPerformance', () => {
    it('tracks performance metrics', () => {
      trackPerformance('search_response_time', 245, {
        query: 'tamoxifen',
        resultsCount: 12
      });

      const events = Analytics.getEvents();
      expect(events[0]).toMatchObject({
        type: 'performance',
        metric: 'search_response_time',
        value: 245,
        unit: 'ms',
        metadata: {
          query: 'tamoxifen',
          resultsCount: 12
        }
      });
    });

    it('includes different units for performance metrics', () => {
      trackPerformance('bundle_size', 2.5, { page: 'genomics' }, 'MB');

      const events = Analytics.getEvents();
      expect(events[0].unit).toBe('MB');
      expect(events[0].value).toBe(2.5);
    });
  });

  describe('setUserProperties', () => {
    it('updates user context for subsequent events', () => {
      setUserProperties({
        userId: 'user-456',
        role: 'pharmacist',
        experienceLevel: 'expert'
      });

      trackEvent({
        category: 'Interactions',
        action: 'check_performed'
      });

      const events = Analytics.getEvents();
      expect(events[0].userContext).toMatchObject({
        userId: 'user-456',
        role: 'pharmacist',
        experienceLevel: 'expert'
      });
    });

    it('merges new properties with existing ones', () => {
      setUserProperties({ userId: 'user-789' });
      setUserProperties({ role: 'researcher' });

      trackEvent({ category: 'Test', action: 'test' });

      const events = Analytics.getEvents();
      expect(events[0].userContext).toMatchObject({
        userId: 'user-789',
        role: 'researcher'
      });
    });
  });

  describe('Privacy and compliance', () => {
    it('respects do not track setting', () => {
      // Mock DNT header
      Object.defineProperty(navigator, 'doNotTrack', {
        value: '1',
        configurable: true
      });

      Analytics.checkPrivacySettings();
      expect(Analytics.isEnabled()).toBe(false);

      trackEvent({ category: 'Test', action: 'test' });
      expect(Analytics.getEvents()).toHaveLength(0);
    });

    it('can be disabled programmatically', () => {
      Analytics.disable();
      expect(Analytics.isEnabled()).toBe(false);

      trackEvent({ category: 'Test', action: 'test' });
      expect(Analytics.getEvents()).toHaveLength(0);
    });

    it('can be re-enabled', () => {
      Analytics.disable();
      Analytics.enable();
      expect(Analytics.isEnabled()).toBe(true);

      trackEvent({ category: 'Test', action: 'test' });
      expect(Analytics.getEvents()).toHaveLength(1);
    });
  });

  describe('Data export and cleanup', () => {
    it('exports events in correct format', () => {
      trackEvent({ category: 'Test1', action: 'action1' });
      trackEvent({ category: 'Test2', action: 'action2' });

      const exported = Analytics.exportEvents();
      expect(exported).toHaveLength(2);
      expect(exported[0]).toHaveProperty('timestamp');
      expect(exported[1]).toHaveProperty('sessionId');
    });

    it('clears events after export', () => {
      trackEvent({ category: 'Test', action: 'test' });
      expect(Analytics.getEvents()).toHaveLength(1);

      Analytics.clearEvents();
      expect(Analytics.getEvents()).toHaveLength(0);
    });

    it('respects event retention limits', () => {
      // Track more events than the limit
      for (let i = 0; i < 1500; i++) {
        trackEvent({ category: 'Test', action: `action${i}` });
      }

      const events = Analytics.getEvents();
      expect(events.length).toBeLessThanOrEqual(1000); // Assuming 1000 is the limit
    });
  });

  describe('Session management', () => {
    it('generates consistent session ID within session', () => {
      trackEvent({ category: 'Test1', action: 'action1' });
      trackEvent({ category: 'Test2', action: 'action2' });

      const events = Analytics.getEvents();
      expect(events[0].sessionId).toBe(events[1].sessionId);
    });

    it('includes session duration in events', () => {
      trackEvent({ category: 'Test', action: 'test' });

      const events = Analytics.getEvents();
      expect(events[0]).toHaveProperty('sessionDuration');
      expect(typeof events[0].sessionDuration).toBe('number');
    });
  });

  describe('Error handling', () => {
    it('handles invalid event data gracefully', () => {
      expect(() => {
        trackEvent(null as any);
      }).not.toThrow();

      expect(() => {
        trackEvent({ category: '', action: '' });
      }).not.toThrow();
    });

    it('logs warnings for invalid data', () => {
      trackEvent({ category: '', action: 'test' });
      expect(mockConsole.warn).toHaveBeenCalled();
    });
  });
});