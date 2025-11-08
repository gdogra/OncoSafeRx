import React from 'react';

/**
 * ScientificTheme component - now just passes through children
 * Scientist mode has been removed from the platform
 */
const ScientificTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default ScientificTheme;