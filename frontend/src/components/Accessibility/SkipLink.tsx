import React from 'react';
import { useAccessibilityContext } from './AccessibilityProvider';

const SkipLink: React.FC = () => {
  const { skipToContent } = useAccessibilityContext();

  return (
    <a
      href="#main-content"
      onClick={(e) => {
        e.preventDefault();
        skipToContent();
      }}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50 focus:z-50"
      tabIndex={0}
    >
      Skip to main content
    </a>
  );
};

export default SkipLink;