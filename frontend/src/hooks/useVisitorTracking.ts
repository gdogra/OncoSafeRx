import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import visitorTracking from '../services/visitorTracking';
import { useAuth } from '../context/AuthContext';

export const useVisitorTracking = () => {
  const location = useLocation();
  
  // Safely get auth state with fallback
  let authState, user;
  try {
    const authHook = useAuth();
    authState = authHook.state;
    user = authState?.user;
  } catch (error) {
    console.warn('useAuth not available in useVisitorTracking, using fallback');
    authState = { user: null, isAuthenticated: false };
    user = null;
  }
  const previousPath = useRef<string>('');

  // Track page views on route changes
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    
    // Avoid tracking the same page twice
    if (currentPath !== previousPath.current) {
      visitorTracking.trackPageView();
      previousPath.current = currentPath;
    }
  }, [location]);

  // Update user info when authentication state changes
  useEffect(() => {
    if (user) {
      visitorTracking.setUser(user.id, user.role);
    }
  }, [user]);

  // Return tracking functions for manual use
  return {
    trackEvent: (eventName: string, data?: any) => {
      visitorTracking.trackCustomEvent(eventName, data);
    },
    trackSearch: (query: string, resultsCount: number) => {
      visitorTracking.trackSearch(query, resultsCount);
    },
    trackDownload: (fileName: string, fileType: string) => {
      visitorTracking.trackDownload(fileName, fileType);
    },
    trackInteraction: (type: 'click' | 'scroll' | 'search' | 'form_submit' | 'download' | 'error', element?: Element, value?: string) => {
      visitorTracking.trackInteraction(type, element || null, value);
    },
    optOut: () => {
      visitorTracking.optOut();
    },
    optIn: () => {
      visitorTracking.optIn();
    },
    isOptedOut: () => {
      return visitorTracking.isOptedOut();
    },
    getCurrentSession: () => {
      return visitorTracking.getCurrentSession();
    }
  };
};
