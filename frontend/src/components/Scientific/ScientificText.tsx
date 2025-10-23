import React from 'react';
import { isScientistMode, transformText } from '../../utils/scientistMode';

interface ScientificTextProps {
  children: string;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
  addMetadata?: boolean;
}

/**
 * ScientificText component automatically transforms marketing language
 * to scientific language when scientist mode is enabled
 */
const ScientificText: React.FC<ScientificTextProps> = ({ 
  children, 
  className = '', 
  tag: Tag = 'span',
  addMetadata = false
}) => {
  let text = children;
  
  if (isScientistMode()) {
    text = transformText.scientificLanguage(text);
    if (addMetadata) {
      text = transformText.addMetadata(text);
    }
  }
  
  return (
    <Tag className={className}>
      {text}
    </Tag>
  );
};

export default ScientificText;