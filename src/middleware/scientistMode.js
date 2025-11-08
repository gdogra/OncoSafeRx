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
    const config = getEffectiveConfig();
    
    if (!config.enabled) {
      return next();
    }
    
    // Check if feature is disabled in scientist mode
    let isEnabled = false;
    switch (featureType) {
      case 'analytics':
        isEnabled = config.enableAnalytics;
        break;
      case 'feedback':
        isEnabled = config.enableFeedback;
        break;
      case 'social':
        isEnabled = config.enableSocial;
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
  const config = getEffectiveConfig();
  if (config.enabled) {
    res.setHeader('X-Scientist-Mode', 'true');
    res.setHeader('X-Evidence-Based', 'true');
    res.setHeader('X-Data-Sources', 'ClinicalTrials.gov, FDA Labels, PubMed');
  }
  next();
};

/**
 * Runtime configuration updates (stored in memory)
 * In production, these could be stored in database/config service
 */
const runtimeConfig = {
  scientistModeOverride: null, // null = use env var, true/false = override
  analyticsOverride: null,
  feedbackOverride: null,
  socialOverride: null
};

/**
 * Get effective scientist mode config (runtime overrides + env vars)
 */
export const getEffectiveConfig = () => {
  return {
    enabled: runtimeConfig.scientistModeOverride ?? scientistModeConfig.enabled,
    enableAnalytics: runtimeConfig.analyticsOverride ?? scientistModeConfig.enableAnalytics,
    enableFeedback: runtimeConfig.feedbackOverride ?? scientistModeConfig.enableFeedback,
    enableSocial: runtimeConfig.socialOverride ?? scientistModeConfig.enableSocial
  };
};

/**
 * Update runtime configuration
 */
export const updateScientistModeConfig = (updates) => {
  if (updates.hasOwnProperty('enabled')) {
    runtimeConfig.scientistModeOverride = updates.enabled;
  }
  if (updates.hasOwnProperty('enableAnalytics')) {
    runtimeConfig.analyticsOverride = updates.enableAnalytics;
  }
  if (updates.hasOwnProperty('enableFeedback')) {
    runtimeConfig.feedbackOverride = updates.enableFeedback;
  }
  if (updates.hasOwnProperty('enableSocial')) {
    runtimeConfig.socialOverride = updates.enableSocial;
  }
  
  return getEffectiveConfig();
};

export default scientistModeConfig;