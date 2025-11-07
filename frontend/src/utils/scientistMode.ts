/**
 * Scientist Mode Configuration
 * Transforms OncoSafeRx into a pure scientific instrument
 */

import React from 'react';

// Environment variables access
const getEnvVar = (key: string): string => {
  return (import.meta as any)?.env?.[key] || '';
};

// Core scientist mode configuration
export const scientistMode = {
  // Main toggle - controls if scientist mode is active
  enabled: getEnvVar('VITE_SCIENTIST_MODE')?.toLowerCase() === 'true',
  
  // Feature flags
  enableMarketing: getEnvVar('VITE_ENABLE_MARKETING')?.toLowerCase() === 'true',
  enableSocialFeatures: getEnvVar('VITE_ENABLE_SOCIAL_FEATURES')?.toLowerCase() === 'true',
  enableAnalyticsTracking: getEnvVar('VITE_ANALYTICS_ENABLED')?.toLowerCase() === 'true',
  
  // App configuration
  appName: getEnvVar('VITE_APP_NAME') || 'OncoSafeRx Evidence Explorer',
  dataUpdateFrequency: getEnvVar('VITE_DATA_UPDATE_FREQUENCY') || 'weekly',
  primaryDataSource: getEnvVar('VITE_PRIMARY_DATA_SOURCE') || 'ClinicalTrials.gov, FDA Labels, PubMed',
  
  // Scientific content configuration
  scientific: {
    title: 'OncoSafeRx Evidence Explorer',
    subtitle: 'Interactive viewer for oncology drug–drug interaction data derived from regulatory labels and clinical trials.',
    dataSourceNote: 'Data source: ClinicalTrials.gov, FDA Labels, PubMed | Updated weekly',
    navigationItems: [
      { label: 'Evidence', path: '/interactions' },
      { label: 'Trials', path: '/trials' },
      { label: 'Labels', path: '/database' },
      { label: 'API Docs', path: '/help' }
    ]
  }
};

// Helper functions
export const isScientistMode = (): boolean => scientistMode.enabled;

export const shouldShowComponent = (componentType: 'marketing' | 'social' | 'analytics'): boolean => {
  // Allow override via localStorage to unblock features in production quickly
  try {
    const override = localStorage.getItem('osrx_enable_' + componentType);
    if (override === 'true') return true;
    if (override === 'false') return false;
  } catch {}

  if (!scientistMode.enabled) return true;
  
  switch (componentType) {
    case 'marketing':
      return scientistMode.enableMarketing;
    case 'social':
      return scientistMode.enableSocialFeatures;
    case 'analytics':
      return scientistMode.enableAnalyticsTracking;
    default:
      return false;
  }
};

// Component wrapper for scientist mode
export const ScientistModeWrapper: React.FC<{
  children: React.ReactNode;
  componentType?: 'marketing' | 'social' | 'analytics';
  fallback?: React.ReactNode;
}> = ({ children, componentType, fallback = null }) => {
  if (componentType && !shouldShowComponent(componentType)) {
    return fallback as React.ReactElement;
  }
  
  return children as React.ReactElement;
};

// Text transformation utilities
export const transformText = {
  // Remove marketing adjectives and replace with scientific language
  scientificLanguage: (text: string): string => {
    const marketingWords = {
      'revolutionary': 'evidence-based',
      'innovative': 'novel',
      'cutting-edge': 'advanced',
      'breakthrough': 'significant',
      'empowering': 'enabling',
      'game-changing': 'impactful',
      'transformative': 'systematic',
      'best-in-class': 'validated',
      'world-class': 'peer-reviewed',
      'next-generation': 'current-generation'
    };
    
    let result = text;
    Object.entries(marketingWords).forEach(([marketing, scientific]) => {
      const regex = new RegExp(marketing, 'gi');
      result = result.replace(regex, scientific);
    });
    
    return result;
  },
  
  // Add scientific metadata to descriptions
  addMetadata: (description: string): string => {
    if (!scientistMode.enabled) return description;
    return `${description} | ${scientistMode.scientific.dataSourceNote}`;
  }
};

export default scientistMode;
