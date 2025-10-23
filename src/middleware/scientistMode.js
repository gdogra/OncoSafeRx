import { getEnv } from '../utils/env.js';

// Scientist mode configuration
export const scientistModeConfig = {
  enabled: getEnv('SCIENTIST_MODE')?.toLowerCase() === 'true',
  enableAnalytics: getEnv('ENABLE_ANALYTICS')?.toLowerCase() === 'true',
  enableFeedback: getEnv('ENABLE_FEEDBACK')?.toLowerCase() === 'true',
  enableSocial: getEnv('ENABLE_SOCIAL_FEATURES')?.toLowerCase() === 'true'
};

/**
 * Middleware to disable marketing/promotional endpoints in scientist mode
 */
export const scientistModeFilter = (featureType) => {
  return (req, res, next) => {
    if (!scientistModeConfig.enabled) {
      return next();
    }
    
    // Check if feature is disabled in scientist mode
    let isEnabled = false;
    switch (featureType) {
      case 'analytics':
        isEnabled = scientistModeConfig.enableAnalytics;
        break;
      case 'feedback':
        isEnabled = scientistModeConfig.enableFeedback;
        break;
      case 'social':
        isEnabled = scientistModeConfig.enableSocial;
        break;
      default:
        isEnabled = true;
    }
    
    if (!isEnabled) {
      return res.status(404).json({
        error: 'Feature disabled in scientist mode',
        message: 'This endpoint is not available when scientist mode is enabled',
        scientistMode: true
      });
    }
    
    next();
  };
};

/**
 * Add scientist mode headers to API responses
 */
export const addScientistModeHeaders = (req, res, next) => {
  if (scientistModeConfig.enabled) {
    res.setHeader('X-Scientist-Mode', 'true');
    res.setHeader('X-Evidence-Based', 'true');
    res.setHeader('X-Data-Sources', 'ClinicalTrials.gov, FDA Labels, PubMed');
  }
  next();
};

export default scientistModeConfig;