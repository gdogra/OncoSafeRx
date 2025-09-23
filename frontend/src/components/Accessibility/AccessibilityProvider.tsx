import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGlobalKeyboardShortcuts, useAccessibility } from '../../hooks/useKeyboardShortcuts';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';

interface AccessibilityContextType {
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  isReducedMotion: boolean;
  toggleReducedMotion: () => void;
  fontSize: 'small' | 'normal' | 'large' | 'extra-large';
  setFontSize: (size: 'small' | 'normal' | 'large' | 'extra-large') => void;
  showShortcuts: () => void;
  announceToScreenReader: (message: string) => void;
  skipToContent: () => void;
  focusFirstInteractiveElement: (container?: HTMLElement) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'normal' | 'large' | 'extra-large'>('normal');
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const { announceToScreenReader, skipToContent, focusFirstInteractiveElement } = useAccessibility();

  // Initialize accessibility preferences from localStorage
  useEffect(() => {
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast') === 'true';
    const savedReducedMotion = localStorage.getItem('accessibility-reduced-motion') === 'true';
    const savedFontSize = localStorage.getItem('accessibility-font-size') as any || 'normal';

    setIsHighContrast(savedHighContrast);
    setIsReducedMotion(savedReducedMotion);
    setFontSize(savedFontSize);

    // Also check system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

    if (prefersReducedMotion && !localStorage.getItem('accessibility-reduced-motion')) {
      setIsReducedMotion(true);
    }

    if (prefersHighContrast && !localStorage.getItem('accessibility-high-contrast')) {
      setIsHighContrast(true);
    }
  }, []);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;

    // High contrast
    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (isReducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Font size
    root.classList.remove('font-small', 'font-normal', 'font-large', 'font-extra-large');
    root.classList.add(`font-${fontSize}`);

    // Save to localStorage
    localStorage.setItem('accessibility-high-contrast', isHighContrast.toString());
    localStorage.setItem('accessibility-reduced-motion', isReducedMotion.toString());
    localStorage.setItem('accessibility-font-size', fontSize);
  }, [isHighContrast, isReducedMotion, fontSize]);

  const toggleHighContrast = () => {
    setIsHighContrast(!isHighContrast);
    announceToScreenReader(`High contrast ${!isHighContrast ? 'enabled' : 'disabled'}`);
  };

  const toggleReducedMotion = () => {
    setIsReducedMotion(!isReducedMotion);
    announceToScreenReader(`Reduced motion ${!isReducedMotion ? 'enabled' : 'disabled'}`);
  };

  const showShortcuts = () => {
    setShowShortcutsModal(true);
  };

  // Set up global keyboard shortcuts
  useGlobalKeyboardShortcuts();

  // Override F1 to show shortcuts modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F1') {
        event.preventDefault();
        showShortcuts();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value: AccessibilityContextType = {
    isHighContrast,
    toggleHighContrast,
    isReducedMotion,
    toggleReducedMotion,
    fontSize,
    setFontSize,
    showShortcuts,
    announceToScreenReader,
    skipToContent,
    focusFirstInteractiveElement,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      <KeyboardShortcutsModal 
        isOpen={showShortcutsModal} 
        onClose={() => setShowShortcutsModal(false)} 
      />
    </AccessibilityContext.Provider>
  );
};

export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
};

export default AccessibilityProvider;