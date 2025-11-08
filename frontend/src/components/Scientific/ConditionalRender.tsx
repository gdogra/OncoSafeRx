import React from 'react';

interface ConditionalRenderProps {
  children: React.ReactNode;
  type: 'marketing' | 'social' | 'analytics';
  fallback?: React.ReactNode;
}

/**
 * ConditionalRender component - now always shows content
 * Scientist mode has been removed from the platform
 */
const ConditionalRender: React.FC<ConditionalRenderProps> = ({ 
  children, 
  type, 
  fallback = null 
}) => {
  // Always show content now that scientist mode is removed
  return children as React.ReactElement;
};

export default ConditionalRender;