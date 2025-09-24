import React from 'react';
import visitorTracking from '../services/visitorTracking';

// Clinical workflow tracking helpers
export const trackClinicalWorkflow = {
  // Patient assessment workflows
  startPatientAssessment: (patientType: string) => {
    visitorTracking.trackCustomEvent('patient_assessment_started', {
      patientType,
      timestamp: new Date().toISOString()
    });
  },

  completePatientAssessment: (patientType: string, duration: number, stepsCompleted: number) => {
    visitorTracking.trackCustomEvent('patient_assessment_completed', {
      patientType,
      duration,
      stepsCompleted,
      timestamp: new Date().toISOString()
    });
  },

  // Drug interaction checks
  drugInteractionCheck: (drugCount: number, interactionsFound: number, severityLevels: string[]) => {
    visitorTracking.trackCustomEvent('drug_interaction_check', {
      drugCount,
      interactionsFound,
      severityLevels,
      timestamp: new Date().toISOString()
    });
  },

  // Protocol usage
  protocolAccessed: (protocolType: string, organization: string, section?: string) => {
    visitorTracking.trackCustomEvent('protocol_accessed', {
      protocolType,
      organization,
      section,
      timestamp: new Date().toISOString()
    });
  },

  // Treatment planning
  treatmentPlanCreated: (cancerType: string, treatmentType: string, planningTime: number) => {
    visitorTracking.trackCustomEvent('treatment_plan_created', {
      cancerType,
      treatmentType,
      planningTime,
      timestamp: new Date().toISOString()
    });
  },

  // Laboratory integration
  labResultsReviewed: (testCount: number, criticalResults: number, alertsTriggered: number) => {
    visitorTracking.trackCustomEvent('lab_results_reviewed', {
      testCount,
      criticalResults,
      alertsTriggered,
      timestamp: new Date().toISOString()
    });
  },

  // Clinical decision support
  cdsAlertTriggered: (alertType: string, severity: string, userAction: string) => {
    visitorTracking.trackCustomEvent('cds_alert_triggered', {
      alertType,
      severity,
      userAction,
      timestamp: new Date().toISOString()
    });
  }
};

// Feature usage tracking
export const trackFeatureUsage = {
  searchPerformed: (searchType: string, query: string, resultCount: number, timeToResult: number) => {
    visitorTracking.trackSearch(query, resultCount);
    visitorTracking.trackCustomEvent('feature_search', {
      searchType,
      resultCount,
      timeToResult,
      queryLength: query.length,
      timestamp: new Date().toISOString()
    });
  },

  reportGenerated: (reportType: string, dataPoints: number, generationTime: number, format: string) => {
    visitorTracking.trackCustomEvent('report_generated', {
      reportType,
      dataPoints,
      generationTime,
      format,
      timestamp: new Date().toISOString()
    });
  },

  exportPerformed: (dataType: string, format: string, recordCount: number) => {
    visitorTracking.trackDownload(`export_${dataType}.${format}`, format);
    visitorTracking.trackCustomEvent('data_export', {
      dataType,
      format,
      recordCount,
      timestamp: new Date().toISOString()
    });
  },

  complianceCheckPerformed: (framework: string, requirementsChecked: number, violations: number) => {
    visitorTracking.trackCustomEvent('compliance_check', {
      framework,
      requirementsChecked,
      violations,
      timestamp: new Date().toISOString()
    });
  }
};

// Performance tracking
export const trackPerformance = {
  pageLoadTime: (pageName: string, loadTime: number, resources: number) => {
    visitorTracking.trackCustomEvent('page_performance', {
      pageName,
      loadTime,
      resources,
      timestamp: new Date().toISOString()
    });
  },

  apiResponseTime: (endpoint: string, method: string, responseTime: number, status: number) => {
    visitorTracking.trackCustomEvent('api_performance', {
      endpoint,
      method,
      responseTime,
      status,
      timestamp: new Date().toISOString()
    });
  },

  databaseQueryTime: (queryType: string, executionTime: number, recordsAffected: number) => {
    visitorTracking.trackCustomEvent('database_performance', {
      queryType,
      executionTime,
      recordsAffected,
      timestamp: new Date().toISOString()
    });
  }
};

// Error tracking
export const trackErrors = {
  applicationError: (errorType: string, errorMessage: string, stackTrace?: string, severity: string = 'medium') => {
    visitorTracking.trackCustomEvent('application_error', {
      errorType,
      errorMessage: errorMessage.substring(0, 200), // Limit length for privacy
      stackTrace: stackTrace ? stackTrace.substring(0, 500) : undefined,
      severity,
      timestamp: new Date().toISOString()
    });
  },

  validationError: (formName: string, fieldName: string, errorMessage: string) => {
    visitorTracking.trackCustomEvent('validation_error', {
      formName,
      fieldName,
      errorMessage,
      timestamp: new Date().toISOString()
    });
  },

  networkError: (endpoint: string, errorCode: number, errorMessage: string) => {
    visitorTracking.trackCustomEvent('network_error', {
      endpoint,
      errorCode,
      errorMessage,
      timestamp: new Date().toISOString()
    });
  }
};

// User engagement tracking
export const trackEngagement = {
  timeOnFeature: (featureName: string, timeSpent: number, actionsPerformed: number) => {
    visitorTracking.trackCustomEvent('feature_engagement', {
      featureName,
      timeSpent,
      actionsPerformed,
      timestamp: new Date().toISOString()
    });
  },

  helpDocumentAccessed: (documentName: string, section?: string, timeSpent?: number) => {
    visitorTracking.trackCustomEvent('help_accessed', {
      documentName,
      section,
      timeSpent,
      timestamp: new Date().toISOString()
    });
  },

  userFeedbackSubmitted: (feedbackType: string, rating?: number, category?: string) => {
    visitorTracking.trackCustomEvent('feedback_submitted', {
      feedbackType,
      rating,
      category,
      timestamp: new Date().toISOString()
    });
  }
};

// Higher-order component for automatic feature tracking
export const withTracking = (WrappedComponent: React.ComponentType<any>, featureName: string) => {
  return function TrackedComponent(props: any) {
    const startTime = React.useRef<number>(Date.now());
    const actionCount = React.useRef<number>(0);

    React.useEffect(() => {
      // Track feature access
      visitorTracking.trackCustomEvent('feature_accessed', {
        featureName,
        timestamp: new Date().toISOString()
      });

      return () => {
        // Track time spent when component unmounts
        const timeSpent = Date.now() - startTime.current;
        trackEngagement.timeOnFeature(featureName, timeSpent, actionCount.current);
      };
    }, []);

    // Enhance props with tracking methods
    const enhancedProps = {
      ...props,
      trackAction: (actionName: string, data?: any) => {
        actionCount.current++;
        visitorTracking.trackCustomEvent(`${featureName}_${actionName}`, {
          ...data,
          timestamp: new Date().toISOString()
        });
      }
    };

    return React.createElement(WrappedComponent, enhancedProps);
  };
};

// React hook for tracking
export const useTracking = (featureName: string) => {
  const startTime = React.useRef<number>(Date.now());
  const actionCount = React.useRef<number>(0);

  React.useEffect(() => {
    visitorTracking.trackCustomEvent('feature_accessed', {
      featureName,
      timestamp: new Date().toISOString()
    });

    return () => {
      const timeSpent = Date.now() - startTime.current;
      trackEngagement.timeOnFeature(featureName, timeSpent, actionCount.current);
    };
  }, [featureName]);

  const trackAction = React.useCallback((actionName: string, data?: any) => {
    actionCount.current++;
    visitorTracking.trackCustomEvent(`${featureName}_${actionName}`, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }, [featureName]);

  const trackTiming = React.useCallback((actionName: string, startTime: number, data?: any) => {
    const duration = Date.now() - startTime;
    trackAction(`${actionName}_timing`, {
      ...data,
      duration,
      timestamp: new Date().toISOString()
    });
  }, [trackAction]);

  return {
    trackAction,
    trackTiming,
    startTimer: () => Date.now()
  };
};

// Form tracking utilities
export const trackFormInteractions = {
  formStarted: (formName: string, fieldCount: number) => {
    visitorTracking.trackCustomEvent('form_started', {
      formName,
      fieldCount,
      timestamp: new Date().toISOString()
    });
  },

  formCompleted: (formName: string, completionTime: number, fieldCount: number, errorsEncountered: number) => {
    visitorTracking.trackCustomEvent('form_completed', {
      formName,
      completionTime,
      fieldCount,
      errorsEncountered,
      timestamp: new Date().toISOString()
    });
  },

  formAbandoned: (formName: string, fieldsCompleted: number, totalFields: number, timeSpent: number) => {
    visitorTracking.trackCustomEvent('form_abandoned', {
      formName,
      fieldsCompleted,
      totalFields,
      completionRate: fieldsCompleted / totalFields,
      timeSpent,
      timestamp: new Date().toISOString()
    });
  }
};

// Privacy-safe data collection utilities
export const sanitizeTrackingData = {
  // Remove patient identifiers from data
  sanitizePatientData: (data: any) => {
    const sensitiveFields = ['patientId', 'mrn', 'ssn', 'dateOfBirth', 'fullName', 'address', 'phone', 'email'];
    const sanitized = { ...data };
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        delete sanitized[field];
      }
    });
    
    return sanitized;
  },

  // Hash sensitive identifiers
  hashSensitiveData: (data: string) => {
    // In a real implementation, use a proper hashing library
    return `hashed_${btoa(data).slice(0, 8)}`;
  },

  // Remove PII from error messages
  sanitizeErrorMessage: (message: string) => {
    // Remove common PII patterns
    return message
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]') // SSN
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]') // Phone
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]') // Email
      .replace(/\bpatient\s+\w+\s+\w+/gi, 'patient [NAME]'); // Patient names
  }
};

export default {
  trackClinicalWorkflow,
  trackFeatureUsage,
  trackPerformance,
  trackErrors,
  trackEngagement,
  trackFormInteractions,
  sanitizeTrackingData,
  withTracking,
  useTracking
};