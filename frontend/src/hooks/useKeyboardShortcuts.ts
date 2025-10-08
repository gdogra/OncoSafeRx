import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Define keyboard shortcuts
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
  category: 'navigation' | 'search' | 'actions' | 'accessibility';
  global?: boolean; // If true, works globally, otherwise only when component is focused
}

// Hook for managing keyboard shortcuts
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const navigate = useNavigate();
  const shortcutsRef = useRef(shortcuts);

  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when user is typing in form fields
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable
    ) {
      // Allow some global shortcuts even in form fields
      const allowedInForms = ['Escape', 'F1'];
      if (!allowedInForms.includes(event.key)) {
        return;
      }
    }

    const activeShortcuts = shortcutsRef.current;

    for (const shortcut of activeShortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrl === event.ctrlKey;
      const altMatches = !!shortcut.alt === event.altKey;
      const shiftMatches = !!shortcut.shift === event.shiftKey;
      const metaMatches = !!shortcut.meta === event.metaKey;

      if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.action();
        break;
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return { shortcuts: shortcutsRef.current };
};

// Global keyboard shortcuts hook
export const useGlobalKeyboardShortcuts = () => {
  const navigate = useNavigate();

  const globalShortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: 'h',
      alt: true,
      description: 'Go to Dashboard (Home)',
      action: () => setTimeout(() => navigate('/'), 100),
      category: 'navigation',
      global: true,
    },
    {
      key: 'd',
      alt: true,
      description: 'Go to Drug Search',
      action: () => setTimeout(() => navigate('/drugs'), 100),
      category: 'navigation',
      global: true,
    },
    {
      key: 'i',
      alt: true,
      description: 'Go to Interactions',
      action: () => setTimeout(() => navigate('/interactions'), 100),
      category: 'navigation',
      global: true,
    },
    {
      key: 'g',
      alt: true,
      description: 'Go to Genomics',
      action: () => setTimeout(() => navigate('/genomics'), 100),
      category: 'navigation',
      global: true,
    },
    {
      key: 'p',
      alt: true,
      description: 'Go to Patients',
      action: () => setTimeout(() => navigate('/patients/all'), 100),
      category: 'navigation',
      global: true,
    },
    {
      key: 'a',
      alt: true,
      description: 'Go to Analytics',
      action: () => setTimeout(() => navigate('/analytics'), 100),
      category: 'navigation',
      global: true,
    },

    // Search shortcuts
    {
      key: 's',
      ctrl: true,
      description: 'Focus search bar',
      action: () => {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
      category: 'search',
      global: true,
    },

    // Accessibility shortcuts
    {
      key: 'F1',
      description: 'Show keyboard shortcuts help',
      action: () => {
        // This will be implemented to show a modal with all shortcuts
        console.log('Keyboard shortcuts help');
      },
      category: 'accessibility',
      global: true,
    },
    {
      key: 'Escape',
      description: 'Close modals/overlays',
      action: () => {
        // Close any open modals or overlays
        const closeButtons = document.querySelectorAll('[data-close-modal], [aria-label="Close"]');
        if (closeButtons.length > 0) {
          (closeButtons[0] as HTMLElement).click();
        }
      },
      category: 'accessibility',
      global: true,
    },

    // Actions
    {
      key: 'n',
      ctrl: true,
      shift: true,
      description: 'New analysis/search',
      action: () => {
        // Clear current search/analysis and start fresh
        const clearButton = document.querySelector('[data-clear], button[aria-label*="clear" i]') as HTMLElement;
        if (clearButton) {
          clearButton.click();
        }
      },
      category: 'actions',
      global: true,
    },
  ];

  useKeyboardShortcuts(globalShortcuts);

  return { shortcuts: globalShortcuts };
};

// Hook for accessibility features
export const useAccessibility = () => {
  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  const skipToContent = useCallback(() => {
    const mainContent = document.querySelector('main, [role="main"], #main-content');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      (mainContent as HTMLElement).scrollIntoView();
    }
  }, []);

  const focusFirstInteractiveElement = useCallback((container?: HTMLElement) => {
    const root = container || document;
    const focusableElements = root.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }, []);

  return {
    announceToScreenReader,
    skipToContent,
    focusFirstInteractiveElement,
  };
};

// Context for keyboard shortcuts help
export const getShortcutsByCategory = (shortcuts: KeyboardShortcut[]) => {
  return shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);
};

// Format shortcut key combination for display
export const formatShortcutKey = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];
  
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.meta) parts.push('Cmd');
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join(' + ');
};
