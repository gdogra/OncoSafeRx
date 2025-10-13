import React, { useEffect, useRef, ReactNode } from 'react';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';

interface FocusTrapProps {
  children: ReactNode;
  enabled?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  onEscape?: () => void;
  className?: string;
}

/**
 * Focus trap component that constrains keyboard navigation within its boundaries
 * Essential for modals, dropdowns, and other overlay components
 */
const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  enabled = true,
  autoFocus = true,
  restoreFocus = true,
  onEscape,
  className = ''
}) => {
  const { containerRef } = useKeyboardNavigation({
    enabled,
    trapFocus: true,
    autoFocus,
    restoreFocus,
    onEscape
  });

  return (
    <div
      ref={(el) => { (containerRef as unknown as React.MutableRefObject<HTMLElement | null>).current = el as unknown as HTMLElement | null; }}
      className={className}
      tabIndex={-1}
    >
      {children}
    </div>
  );
};

export default FocusTrap;
