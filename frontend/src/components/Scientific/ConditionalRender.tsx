import React from 'react';
import { shouldShowComponent } from '../../utils/scientistMode';

interface ConditionalRenderProps {
  children: React.ReactNode;
  type: 'marketing' | 'social' | 'analytics';
  fallback?: React.ReactNode;
}

/**
 * ConditionalRender component hides marketing/promotional content 
 * when scientist mode is enabled
 */
const ConditionalRender: React.FC<ConditionalRenderProps> = ({ 
  children, 
  type, 
  fallback = null 
}) => {
  if (!shouldShowComponent(type)) {
    return fallback as React.ReactElement || null;
  }
  
  return children as React.ReactElement;
};

export default ConditionalRender;