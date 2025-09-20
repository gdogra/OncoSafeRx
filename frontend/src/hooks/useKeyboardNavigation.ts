import { useEffect, useRef, useCallback } from 'react';

interface KeyboardNavigationOptions {
  enabled?: boolean;
  trapFocus?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  onEscape?: () => void;
  onEnter?: () => void;
  onTab?: (direction: 'forward' | 'backward') => boolean;
}

/**
 * Hook for managing keyboard navigation and focus trapping
 * Provides comprehensive keyboard accessibility features
 */
export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    enabled = true,
    trapFocus = false,
    autoFocus = false,
    restoreFocus = false,
    onEscape,
    onEnter,
    onTab
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Get all focusable elements within container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      'audio[controls]',
      'video[controls]',
      'iframe',
      'embed',
      'object',
      'area[href]',
      'summary'
    ].join(', ');

    return Array.from(
      containerRef.current.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
  }, []);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const { key, shiftKey, ctrlKey, metaKey, altKey } = event;

    // Handle escape key
    if (key === 'Escape' && onEscape) {
      event.preventDefault();
      onEscape();
      return;
    }

    // Handle enter key
    if (key === 'Enter' && onEnter && !ctrlKey && !metaKey && !altKey) {
      onEnter();
      return;
    }

    // Handle tab navigation with focus trapping
    if (key === 'Tab' && trapFocus) {
      const focusableElements = getFocusableElements();
      
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      // Check if custom tab handler wants to handle this
      if (onTab) {
        const handled = onTab(shiftKey ? 'backward' : 'forward');
        if (handled) {
          event.preventDefault();
          return;
        }
      }

      // Trap focus within container
      if (shiftKey) {
        // Shift + Tab (backward)
        if (activeElement === firstElement || !containerRef.current?.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab (forward)
        if (activeElement === lastElement || !containerRef.current?.contains(activeElement)) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [enabled, trapFocus, onEscape, onEnter, onTab, getFocusableElements]);

  // Auto focus first focusable element
  useEffect(() => {
    if (autoFocus && enabled) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        // Store previous focus for restoration
        if (restoreFocus) {
          previousFocusRef.current = document.activeElement as HTMLElement;
        }
        
        // Focus first element
        focusableElements[0].focus();
      }
    }
  }, [autoFocus, enabled, restoreFocus, getFocusableElements]);

  // Set up event listeners
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  // Restore focus on cleanup
  useEffect(() => {
    return () => {
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [restoreFocus]);

  // Focus management utilities
  const focusFirst = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [getFocusableElements]);

  const focusLast = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }, [getFocusableElements]);

  const focusNext = useCallback(() => {
    const focusableElements = getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    if (currentIndex >= 0 && currentIndex < focusableElements.length - 1) {
      focusableElements[currentIndex + 1].focus();
    } else {
      focusableElements[0]?.focus();
    }
  }, [getFocusableElements]);

  const focusPrevious = useCallback(() => {
    const focusableElements = getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    if (currentIndex > 0) {
      focusableElements[currentIndex - 1].focus();
    } else {
      focusableElements[focusableElements.length - 1]?.focus();
    }
  }, [getFocusableElements]);

  return {
    containerRef,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    getFocusableElements
  };
}

/**
 * Hook for managing roving tabindex navigation pattern
 * Common for toolbars, menus, and grids
 */
export function useRovingTabindex<T extends HTMLElement>(
  items: T[],
  orientation: 'horizontal' | 'vertical' = 'horizontal',
  loop: boolean = true
) {
  const currentIndexRef = useRef(0);

  const updateTabindex = useCallback((activeIndex: number) => {
    items.forEach((item, index) => {
      if (item) {
        item.tabIndex = index === activeIndex ? 0 : -1;
        if (index === activeIndex) {
          item.focus();
        }
      }
    });
    currentIndexRef.current = activeIndex;
  }, [items]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key } = event;
    let handled = false;
    let newIndex = currentIndexRef.current;

    switch (key) {
      case 'ArrowRight':
        if (orientation === 'horizontal') {
          newIndex = loop 
            ? (currentIndexRef.current + 1) % items.length
            : Math.min(currentIndexRef.current + 1, items.length - 1);
          handled = true;
        }
        break;

      case 'ArrowLeft':
        if (orientation === 'horizontal') {
          newIndex = loop
            ? (currentIndexRef.current - 1 + items.length) % items.length
            : Math.max(currentIndexRef.current - 1, 0);
          handled = true;
        }
        break;

      case 'ArrowDown':
        if (orientation === 'vertical') {
          newIndex = loop
            ? (currentIndexRef.current + 1) % items.length
            : Math.min(currentIndexRef.current + 1, items.length - 1);
          handled = true;
        }
        break;

      case 'ArrowUp':
        if (orientation === 'vertical') {
          newIndex = loop
            ? (currentIndexRef.current - 1 + items.length) % items.length
            : Math.max(currentIndexRef.current - 1, 0);
          handled = true;
        }
        break;

      case 'Home':
        newIndex = 0;
        handled = true;
        break;

      case 'End':
        newIndex = items.length - 1;
        handled = true;
        break;
    }

    if (handled) {
      event.preventDefault();
      updateTabindex(newIndex);
    }
  }, [items, orientation, loop, updateTabindex]);

  // Initialize tabindex
  useEffect(() => {
    if (items.length > 0) {
      updateTabindex(0);
    }
  }, [items, updateTabindex]);

  return {
    handleKeyDown,
    setActiveIndex: updateTabindex
  };
}

/**
 * Hook for managing modal keyboard behavior
 */
export function useModalKeyboard(isOpen: boolean, onClose?: () => void) {
  const {
    containerRef,
    focusFirst,
    focusLast,
    getFocusableElements
  } = useKeyboardNavigation({
    enabled: isOpen,
    trapFocus: true,
    autoFocus: true,
    restoreFocus: true,
    onEscape: onClose
  });

  // Handle outside clicks
  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
      onClose?.();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [isOpen, handleOutsideClick]);

  return {
    containerRef,
    focusFirst,
    focusLast,
    getFocusableElements
  };
}

/**
 * Hook for managing dropdown keyboard behavior
 */
export function useDropdownKeyboard(
  isOpen: boolean,
  onClose?: () => void,
  onSelect?: (index: number) => void
) {
  const {
    containerRef,
    focusFirst,
    focusNext,
    focusPrevious
  } = useKeyboardNavigation({
    enabled: isOpen,
    onEscape: onClose
  });

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    const { key } = event;

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        focusNext();
        break;

      case 'ArrowUp':
        event.preventDefault();
        focusPrevious();
        break;

      case 'Home':
        event.preventDefault();
        focusFirst();
        break;

      case 'Enter':
      case ' ':
        if (onSelect) {
          const focusableElements = containerRef.current?.querySelectorAll('[role="option"]') || [];
          const activeIndex = Array.from(focusableElements).indexOf(document.activeElement as Element);
          if (activeIndex >= 0) {
            event.preventDefault();
            onSelect(activeIndex);
          }
        }
        break;
    }
  }, [isOpen, focusFirst, focusNext, focusPrevious, onSelect]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  return { containerRef };
}