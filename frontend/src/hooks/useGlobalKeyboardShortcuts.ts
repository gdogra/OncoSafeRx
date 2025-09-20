import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface KeyboardShortcut {
  key: string;
  modifiers?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
  };
  action: () => void;
  description: string;
  disabled?: boolean;
}

/**
 * Hook for managing global keyboard shortcuts across the application
 * Provides quick access to common features and navigation
 */
export function useGlobalKeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();

  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: 'h',
      modifiers: { alt: true },
      action: () => navigate('/'),
      description: 'Go to home/dashboard'
    },
    {
      key: 's',
      modifiers: { alt: true },
      action: () => navigate('/search'),
      description: 'Go to drug search'
    },
    {
      key: 'p',
      modifiers: { alt: true },
      action: () => navigate('/patients'),
      description: 'Go to patients'
    },
    {
      key: 'c',
      modifiers: { alt: true },
      action: () => navigate('/clinical'),
      description: 'Go to clinical decision support'
    },
    {
      key: 'd',
      modifiers: { alt: true },
      action: () => navigate('/drug-database'),
      description: 'Go to drug database'
    },

    // Search shortcuts
    {
      key: '/',
      action: () => {
        const searchInput = document.querySelector('#main-drug-search, #search input, [role="combobox"]') as HTMLElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Focus search input'
    },
    {
      key: 'f',
      modifiers: { ctrl: true },
      action: () => {
        const searchInput = document.querySelector('#main-drug-search, #search input, [role="combobox"]') as HTMLElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Focus search input'
    },

    // Navigation shortcuts within page
    {
      key: 'g',
      modifiers: { alt: true },
      action: () => {
        const mainContent = document.querySelector('#main-content') as HTMLElement;
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },
      description: 'Go to main content'
    },
    {
      key: 'n',
      modifiers: { alt: true },
      action: () => {
        const navigation = document.querySelector('#navigation') as HTMLElement;
        if (navigation) {
          navigation.focus();
          navigation.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },
      description: 'Go to navigation'
    },

    // Modal and overlay shortcuts
    {
      key: 'Escape',
      action: () => {
        // Close any open modals, dropdowns, or overlays
        const closeButtons = document.querySelectorAll('[aria-label*="Close"], [aria-label*="close"], .modal-close, [data-close-modal]');
        const lastButton = closeButtons[closeButtons.length - 1] as HTMLElement;
        if (lastButton) {
          lastButton.click();
        }
      },
      description: 'Close modal or overlay'
    },

    // Accessibility shortcuts
    {
      key: 'Tab',
      modifiers: { shift: true },
      action: () => {
        // Enhanced backward tab navigation - handled by browser but we can track it
      },
      description: 'Navigate backward through focusable elements',
      disabled: true // Let browser handle this
    },
    {
      key: 'Tab',
      action: () => {
        // Enhanced forward tab navigation - handled by browser but we can track it
      },
      description: 'Navigate forward through focusable elements',
      disabled: true // Let browser handle this
    },

    // Application-specific shortcuts
    {
      key: 'k',
      modifiers: { ctrl: true },
      action: () => {
        // Open command palette or quick actions
        console.log('Command palette shortcut - implement when needed');
      },
      description: 'Open command palette'
    },
    {
      key: '?',
      modifiers: { shift: true },
      action: () => {
        // Show keyboard shortcuts help
        showKeyboardShortcutsHelp();
      },
      description: 'Show keyboard shortcuts help'
    },

    // Print and export
    {
      key: 'p',
      modifiers: { ctrl: true },
      action: () => {
        window.print();
      },
      description: 'Print current page'
    }
  ];

  const showKeyboardShortcutsHelp = () => {
    const helpContent = shortcuts
      .filter(s => !s.disabled)
      .map(s => {
        const modifierKeys = [];
        if (s.modifiers?.ctrl) modifierKeys.push('Ctrl');
        if (s.modifiers?.alt) modifierKeys.push('Alt');
        if (s.modifiers?.shift) modifierKeys.push('Shift');
        if (s.modifiers?.meta) modifierKeys.push('Cmd');
        
        const keyCombo = [...modifierKeys, s.key.toUpperCase()].join(' + ');
        return `${keyCombo}: ${s.description}`;
      })
      .join('\n');

    alert(`Keyboard Shortcuts:\n\n${helpContent}`);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    // Skip if user is typing in an input field
    const activeElement = document.activeElement;
    const isInputField = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.getAttribute('contenteditable') === 'true'
    );

    // Allow certain shortcuts even in input fields
    const allowInInputFields = ['Escape', 'Tab'];
    if (isInputField && !allowInInputFields.includes(event.key)) {
      return;
    }

    // Find matching shortcut
    const shortcut = shortcuts.find(s => {
      if (s.disabled) return false;
      
      const keyMatches = s.key?.toLowerCase() === event.key?.toLowerCase();
      const ctrlMatches = !s.modifiers?.ctrl || event.ctrlKey;
      const altMatches = !s.modifiers?.alt || event.altKey;
      const shiftMatches = !s.modifiers?.shift || event.shiftKey;
      const metaMatches = !s.modifiers?.meta || event.metaKey;

      // Ensure no extra modifiers
      const hasExtraCtrl = event.ctrlKey && !s.modifiers?.ctrl;
      const hasExtraAlt = event.altKey && !s.modifiers?.alt;
      const hasExtraShift = event.shiftKey && !s.modifiers?.shift;
      const hasExtraMeta = event.metaKey && !s.modifiers?.meta;

      return keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches &&
             !hasExtraCtrl && !hasExtraAlt && !hasExtraShift && !hasExtraMeta;
    });

    if (shortcut) {
      // Prevent default for navigation shortcuts that might interfere
      if (shortcut.modifiers?.alt || shortcut.key === '/' || shortcut.key === 'Escape') {
        event.preventDefault();
      }
      
      try {
        shortcut.action();
      } catch (error) {
        console.warn('Error executing keyboard shortcut:', error);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Announce available shortcuts to screen readers on route change
  useEffect(() => {
    const announceShortcuts = () => {
      const announcement = 'Keyboard shortcuts available. Press Shift + ? for help.';
      const liveRegion = document.querySelector('[aria-live="polite"]');
      if (liveRegion) {
        liveRegion.textContent = announcement;
        setTimeout(() => {
          liveRegion.textContent = '';
        }, 2000);
      }
    };

    // Announce after a brief delay to avoid conflicts with route announcements
    const timer = setTimeout(announceShortcuts, 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return {
    shortcuts: shortcuts.filter(s => !s.disabled),
    showKeyboardShortcutsHelp
  };
}

/**
 * Hook for registering component-specific keyboard shortcuts
 */
export function useComponentKeyboardShortcuts(
  componentShortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!enabled) return;

    const shortcut = componentShortcuts.find(s => {
      const keyMatches = s.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatches = !s.modifiers?.ctrl || event.ctrlKey;
      const altMatches = !s.modifiers?.alt || event.altKey;
      const shiftMatches = !s.modifiers?.shift || event.shiftKey;
      const metaMatches = !s.modifiers?.meta || event.metaKey;

      return keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches;
    });

    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      shortcut.action();
    }
  };

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, componentShortcuts]);

  return { shortcuts: componentShortcuts };
}