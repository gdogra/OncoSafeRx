import React, { useEffect } from 'react';
import { isScientistMode } from '../../utils/scientistMode';

/**
 * ScientificTheme component applies minimalist scientific styling
 * when scientist mode is enabled
 */
const ScientificTheme: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    if (isScientistMode()) {
      // Apply scientific theme styles to document
      const root = document.documentElement;
      
      // Inject scientific theme CSS variables
      const scientificStyles = `
        :root {
          /* Scientific color palette - neutral and minimal */
          --color-scientific-bg: #fafafa;
          --color-scientific-surface: #ffffff;
          --color-scientific-border: #e5e7eb;
          --color-scientific-text-primary: #111827;
          --color-scientific-text-secondary: #6b7280;
          --color-scientific-text-muted: #9ca3af;
          --color-scientific-accent: #3b82f6;
          --color-scientific-accent-muted: #e0e7ff;
          
          /* Scientific typography */
          --font-scientific-mono: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          --font-scientific-sans: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
          
          /* Scientific spacing - grid-based */
          --spacing-scientific-xs: 0.25rem;
          --spacing-scientific-sm: 0.5rem;
          --spacing-scientific-md: 1rem;
          --spacing-scientific-lg: 1.5rem;
          --spacing-scientific-xl: 2rem;
        }
        
        .scientist-mode {
          /* Override flashy gradients with solid colors */
          background: var(--color-scientific-bg) !important;
          
          /* Neutralize all gradient backgrounds */
          .bg-gradient-to-r, .bg-gradient-to-l, .bg-gradient-to-t, .bg-gradient-to-b {
            background: var(--color-scientific-surface) !important;
            border: 1px solid var(--color-scientific-border) !important;
          }
          
          /* Remove colorful badges */
          .badge-flashy {
            background: var(--color-scientific-accent-muted) !important;
            color: var(--color-scientific-text-primary) !important;
          }
          
          /* Simplify cards */
          .card-enhanced {
            border: 1px solid var(--color-scientific-border) !important;
            box-shadow: none !important;
            background: var(--color-scientific-surface) !important;
          }
          
          /* Typography adjustments */
          h1, h2, h3, h4, h5, h6 {
            font-family: var(--font-scientific-sans) !important;
            font-weight: 600 !important;
          }
          
          .font-mono, .scientific-mono {
            font-family: var(--font-scientific-mono) !important;
          }
        }
      `;
      
      // Inject styles
      let styleSheet = document.getElementById('scientist-mode-styles');
      if (!styleSheet) {
        styleSheet = document.createElement('style');
        styleSheet.id = 'scientist-mode-styles';
        document.head.appendChild(styleSheet);
      }
      styleSheet.textContent = scientificStyles;
      
      // Add scientist mode class to body
      document.body.classList.add('scientist-mode');
      
      return () => {
        // Cleanup
        document.body.classList.remove('scientist-mode');
        const styles = document.getElementById('scientist-mode-styles');
        if (styles) {
          styles.remove();
        }
      };
    }
  }, []);
  
  return <>{children}</>;
};

export default ScientificTheme;