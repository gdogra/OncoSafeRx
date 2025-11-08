import express from 'express';
import { requireAdmin, authenticateToken } from '../middleware/auth.js';
import { getEffectiveConfig, updateScientistModeConfig } from '../middleware/scientistMode.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Get current scientist mode configuration
router.get('/config', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const config = getEffectiveConfig();
  
  res.json({
    current: config,
    environment: {
      SCIENTIST_MODE: process.env.SCIENTIST_MODE,
      ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS,
      ENABLE_FEEDBACK: process.env.ENABLE_FEEDBACK,
      ENABLE_SOCIAL_FEATURES: process.env.ENABLE_SOCIAL_FEATURES
    },
    description: {
      enabled: 'Master toggle for scientist mode (transforms app into scientific instrument)',
      enableAnalytics: 'Allow visitor analytics and tracking features',
      enableFeedback: 'Allow user feedback and rating features', 
      enableSocial: 'Allow social features like sharing and collaboration'
    }
  });
}));

// Update scientist mode configuration
router.post('/config', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const { enabled, enableAnalytics, enableFeedback, enableSocial } = req.body;
  
  const updates = {};
  if (typeof enabled === 'boolean') updates.enabled = enabled;
  if (typeof enableAnalytics === 'boolean') updates.enableAnalytics = enableAnalytics;
  if (typeof enableFeedback === 'boolean') updates.enableFeedback = enableFeedback;
  if (typeof enableSocial === 'boolean') updates.enableSocial = enableSocial;
  
  const newConfig = updateScientistModeConfig(updates);
  
  console.log('🔬 Scientist mode configuration updated by admin:', {
    userId: req.user?.id,
    updates,
    newConfig
  });
  
  res.json({
    success: true,
    message: 'Scientist mode configuration updated successfully',
    config: newConfig,
    note: 'Changes are applied immediately but will reset on server restart. For persistent changes, update environment variables.'
  });
}));

// Reset to environment defaults
router.post('/reset', authenticateToken, requireAdmin, asyncHandler(async (req, res) => {
  const resetConfig = updateScientistModeConfig({
    enabled: null,
    enableAnalytics: null, 
    enableFeedback: null,
    enableSocial: null
  });
  
  console.log('🔬 Scientist mode configuration reset to environment defaults by admin:', {
    userId: req.user?.id,
    config: resetConfig
  });
  
  res.json({
    success: true,
    message: 'Scientist mode configuration reset to environment defaults',
    config: resetConfig
  });
}));

// Get feature status for quick checks
router.get('/status', asyncHandler(async (req, res) => {
  const config = getEffectiveConfig();
  
  res.json({
    scientistMode: config.enabled,
    features: {
      analytics: config.enableAnalytics,
      feedback: config.enableFeedback,  
      social: config.enableSocial
    },
    endpoints: {
      analytics: config.enabled ? (config.enableAnalytics ? 'enabled' : 'disabled') : 'enabled',
      feedback: config.enabled ? (config.enableFeedback ? 'enabled' : 'disabled') : 'enabled',
      social: config.enabled ? (config.enableSocial ? 'enabled' : 'disabled') : 'enabled'
    }
  });
}));

export default router;