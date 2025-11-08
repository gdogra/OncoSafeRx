import React from 'react';

interface ScientificTextProps {
  children: string;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
  addMetadata?: boolean;
}

/**
 * ScientificText component - now just passes through text
 * Scientist mode has been removed from the platform
 */
const ScientificText: React.FC<ScientificTextProps> = ({ 
  children, 
  className = '', 
  tag: Tag = 'span',
  addMetadata = false
}) => {
  // Just return the original text now that scientist mode is removed
  return (
    <Tag className={className}>
      {children}
    </Tag>
  );
};

export default ScientificText;