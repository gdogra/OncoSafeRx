# OncoSafeRx Visitor Tracking System

## Overview

The OncoSafeRx visitor tracking system provides comprehensive, HIPAA-compliant analytics for tracking user behavior, application usage, and performance metrics. The system is designed with healthcare privacy in mind and does not collect any patient health information (PHI) or personally identifiable information (PII).

## Features

### 🔍 **Comprehensive Tracking**
- **Page Views**: Track all page visits with timestamps and duration
- **User Interactions**: Click tracking, form submissions, downloads, searches
- **Session Management**: Complete user session tracking with device information
- **Real-time Analytics**: Live visitor monitoring and metrics
- **Geographic Data**: Country/region tracking (anonymized)

### 🔒 **HIPAA Compliance**
- **No PHI Collection**: Zero patient health information is tracked
- **IP Address Anonymization**: IP addresses are hashed for privacy
- **Opt-out Functionality**: Users can disable tracking completely
- **Data Minimization**: Only essential metrics are collected
- **Secure Transmission**: All data encrypted in transit

### 📊 **Analytics Dashboard**
- **Visitor Metrics**: Total visitors, unique users, page views
- **Behavior Analysis**: Session duration, bounce rate, user flows
- **Device Analytics**: Desktop, mobile, tablet usage patterns
- **Role-based Insights**: Usage by healthcare professional type
- **Performance Monitoring**: Application performance and error tracking

## Implementation

### 1. **Automatic Tracking**

The visitor tracking is automatically initialized when your app starts:

```typescript
// In App.tsx - already implemented
import { useVisitorTracking } from './hooks/useVisitorTracking';

function AppWithRouter() {
  useGlobalKeyboardShortcuts();
  useVisitorTracking(); // Automatically tracks page views and user sessions
  
  return (
    // Your app components
  );
}
```

### 2. **Manual Event Tracking**

Track custom events in your components:

```typescript
import { useVisitorTracking } from '../hooks/useVisitorTracking';

function MyComponent() {
  const { trackEvent, trackSearch, trackDownload } = useVisitorTracking();

  const handleSearch = (query: string, results: number) => {
    trackSearch(query, results);
  };

  const handleFileDownload = (fileName: string, fileType: string) => {
    trackDownload(fileName, fileType);
  };

  const handleCustomEvent = () => {
    trackEvent('medication_interaction_checked', {
      drugCount: 3,
      interactionsFound: 2
    });
  };

  return (
    // Your component JSX
  );
}
```

### 3. **Analytics Dashboard Access**

Visit the analytics dashboard at `/visitor-analytics` (requires appropriate permissions):

- **Role Requirements**: Oncologist or Pharmacist
- **Permission**: `canViewAnalytics`
- **Navigation**: Collaboration & Analytics → Visitor Analytics

## Data Collection Details

### Session Data
```typescript
interface VisitorSession {
  sessionId: string;        // UUID for session identification
  userId?: string;          // User ID (if authenticated)
  userRole?: string;        // Healthcare professional role
  deviceType: string;       // desktop | tablet | mobile
  browser: string;          // Browser type
  os: string;              // Operating system
  screenResolution: string; // Screen dimensions
  timezone: string;        // User timezone
  language: string;        // Browser language
  startTime: string;       // Session start timestamp
  endTime?: string;        // Session end timestamp
  duration?: number;       // Session duration in milliseconds
  pageViews: PageView[];   // All page views in session
  interactions: UserInteraction[]; // User interactions
  isReturningVisitor: boolean; // First-time vs returning
}
```

### Page Views
```typescript
interface PageView {
  pageId: string;          // Unique page view ID
  url: string;            // Page URL (sanitized)
  title: string;          // Page title (sanitized)
  timestamp: string;      // View timestamp
  timeOnPage?: number;    // Time spent on page
  scrollDepth: number;    // Maximum scroll percentage
  exitPage: boolean;      // Whether user exited from this page
}
```

### User Interactions
```typescript
interface UserInteraction {
  id: string;             // Unique interaction ID
  type: 'click' | 'scroll' | 'search' | 'form_submit' | 'download' | 'error';
  element?: string;       // CSS selector of interacted element
  value?: string;         // Interaction value (sanitized)
  timestamp: string;      // Interaction timestamp
  pageUrl: string;        // URL where interaction occurred
}
```

## Privacy & Compliance

### HIPAA Compliance Features

1. **No PHI Collection**
   - Patient names, medical record numbers, dates of birth are never tracked
   - Medical data, diagnoses, treatments are not collected
   - Only application usage patterns are monitored

2. **Data Anonymization**
   - IP addresses are cryptographically hashed
   - User agents are sanitized to remove identifying information
   - Page titles are scrubbed of patient information

3. **Opt-out Capabilities**
   ```typescript
   // Users can opt out at any time
   const { optOut, optIn, isOptedOut } = useVisitorTracking();
   
   if (userWantsToOptOut) {
     optOut(); // Immediately stops all tracking
   }
   ```

4. **Data Retention**
   - Session data is automatically purged after configurable period
   - Only aggregated metrics are retained long-term
   - No personal data is stored permanently

### Security Measures

- **Encrypted Transmission**: All analytics data sent via HTTPS
- **Rate Limiting**: API endpoints protected against abuse
- **Input Validation**: All incoming data validated and sanitized
- **Access Control**: Analytics dashboard requires authentication and authorization

## Server Implementation

### Backend API Example

```javascript
// Analytics endpoint for receiving tracking data
app.post('/api/analytics', [
  body('eventType').isIn(['pageview', 'interaction', 'session_end']),
  body('sessionId').isUUID(),
  body('timestamp').isISO8601()
], (req, res) => {
  const { eventType, data, sessionId } = req.body;
  
  // Store anonymized data
  switch (eventType) {
    case 'pageview':
      storePageView(sanitizePageView(data));
      break;
    case 'interaction':
      storeInteraction(sanitizeInteraction(data));
      break;
    case 'session_end':
      storeSession(sanitizeSession(data));
      break;
  }
  
  res.json({ success: true });
});
```

### Data Sanitization

```javascript
function sanitizePageView(pageView) {
  return {
    ...pageView,
    url: removePatientIdsFromUrl(pageView.url),
    title: removePatientNamesFromTitle(pageView.title)
  };
}

function sanitizeSession(session) {
  return {
    ...session,
    ipAddress: hashIP(session.ipAddress), // Never store actual IP
    userAgent: sanitizeUserAgent(session.userAgent)
  };
}
```

## Configuration Options

### Environment Variables

```bash
# Analytics configuration
ANALYTICS_ENABLED=true
ANALYTICS_ENDPOINT=/api/analytics
ANALYTICS_SALT=your-random-salt-for-hashing
ANALYTICS_RETENTION_DAYS=90

# Privacy settings
ANALYTICS_ANONYMIZE_IPS=true
ANALYTICS_SCRUB_PATIENT_DATA=true
ANALYTICS_ALLOW_GEOLOCATION=false
```

### Analytics Settings

```typescript
// In your environment configuration
export const analyticsConfig = {
  enabled: process.env.ANALYTICS_ENABLED === 'true',
  endpoint: process.env.ANALYTICS_ENDPOINT || '/api/analytics',
  batchSize: 10, // Number of events to batch before sending
  flushInterval: 30000, // Send batched events every 30 seconds
  sessionTimeout: 1800000, // 30 minutes
  privacyMode: 'strict' // 'strict' | 'balanced' | 'minimal'
};
```

## Metrics Available

### Key Performance Indicators (KPIs)

1. **User Engagement**
   - Daily/Monthly Active Users
   - Session Duration
   - Pages per Session
   - Return Visitor Rate

2. **Feature Usage**
   - Most Used Features
   - Search Query Analysis
   - Download Patterns
   - Interaction Heatmaps

3. **Technical Performance**
   - Page Load Times
   - Error Rates
   - Browser/Device Compatibility
   - Mobile vs Desktop Usage

4. **Clinical Workflow Analysis**
   - Patient Care Workflows
   - Drug Interaction Checks
   - Protocol Usage
   - Time-to-Information Metrics

### Custom Events for Healthcare

```typescript
// Track clinical workflow completions
trackEvent('workflow_completed', {
  workflowType: 'patient_assessment',
  duration: 1200000, // 20 minutes
  stepsCompleted: 8
});

// Track drug interaction checks
trackEvent('interaction_check', {
  drugCount: 3,
  interactionsFound: 2,
  severityLevel: 'moderate'
});

// Track protocol usage
trackEvent('protocol_accessed', {
  protocolType: 'NCCN_breast_cancer',
  section: 'treatment_recommendations'
});
```

## Real-time Analytics

### Live Dashboard Features

- **Active Users**: Current users online
- **Live Page Views**: Real-time page view stream
- **Geographic Activity**: Live visitor map
- **Feature Usage**: Real-time feature interaction monitoring

### WebSocket Implementation

```typescript
// Real-time analytics connection
const ws = new WebSocket('/api/analytics/realtime');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateLiveDashboard(data);
};
```

## Troubleshooting

### Common Issues

1. **Analytics Not Loading**
   - Check if user has opted out: `visitorTracking.isOptedOut()`
   - Verify network connectivity to analytics endpoint
   - Check browser console for JavaScript errors

2. **Missing Data**
   - Ensure proper initialization in App component
   - Verify backend API is receiving requests
   - Check for adblockers blocking analytics requests

3. **Performance Impact**
   - Analytics should have minimal performance impact (<1ms per event)
   - Use batching for high-frequency events
   - Monitor browser developer tools for performance

### Debug Mode

```typescript
// Enable debug logging
localStorage.setItem('analytics_debug', 'true');

// View current session data
console.log(visitorTracking.getCurrentSession());
```

## Best Practices

### For Developers

1. **Minimize Data Collection**: Only track what's necessary for insights
2. **Respect User Privacy**: Always provide opt-out mechanisms
3. **Secure Implementation**: Use HTTPS, validate inputs, sanitize data
4. **Performance Optimization**: Batch events, use web workers if needed
5. **Error Handling**: Gracefully handle analytics failures

### For Healthcare Organizations

1. **Compliance Review**: Have legal team review implementation
2. **Staff Training**: Educate staff on analytics and privacy
3. **Regular Audits**: Periodically review collected data
4. **Data Governance**: Establish clear data retention policies
5. **Incident Response**: Have plan for potential data breaches

## Conclusion

The OncoSafeRx visitor tracking system provides powerful insights into application usage while maintaining strict healthcare privacy standards. The system helps organizations understand how clinicians use the platform, identify areas for improvement, and ensure optimal user experience - all while maintaining HIPAA compliance and protecting patient privacy.

For questions or support, contact the development team or refer to the technical documentation in the codebase.