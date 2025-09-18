import React, { useState } from 'react';
import { HelpCircle, Info, AlertCircle } from 'lucide-react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type TooltipType = 'info' | 'help' | 'warning' | 'clinical';

interface TooltipProps {
  content: string | React.ReactNode;
  children?: React.ReactNode;
  position?: TooltipPosition;
  type?: TooltipType;
  showIcon?: boolean;
  iconOnly?: boolean;
  delay?: number;
  maxWidth?: string;
  className?: string;
  disabled?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  type = 'info',
  showIcon = false,
  iconOnly = false,
  delay = 200,
  maxWidth = 'max-w-xs',
  className = '',
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (disabled) return;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    const newTimeoutId = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    setTimeoutId(newTimeoutId);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    const baseClasses = 'absolute z-50 px-3 py-2 text-xs font-medium text-white rounded-lg shadow-lg pointer-events-none';
    
    switch (position) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      case 'top-left':
        return `${baseClasses} bottom-full right-0 mb-2`;
      case 'top-right':
        return `${baseClasses} bottom-full left-0 mb-2`;
      case 'bottom-left':
        return `${baseClasses} top-full right-0 mt-2`;
      case 'bottom-right':
        return `${baseClasses} top-full left-0 mt-2`;
      default:
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
    }
  };

  const getArrowClasses = () => {
    const baseArrow = 'absolute w-2 h-2 transform rotate-45';
    
    switch (position) {
      case 'top':
        return `${baseArrow} top-full left-1/2 -translate-x-1/2 -mt-1`;
      case 'bottom':
        return `${baseArrow} bottom-full left-1/2 -translate-x-1/2 -mb-1`;
      case 'left':
        return `${baseArrow} left-full top-1/2 -translate-y-1/2 -ml-1`;
      case 'right':
        return `${baseArrow} right-full top-1/2 -translate-y-1/2 -mr-1`;
      case 'top-left':
        return `${baseArrow} top-full right-2 -mt-1`;
      case 'top-right':
        return `${baseArrow} top-full left-2 -mt-1`;
      case 'bottom-left':
        return `${baseArrow} bottom-full right-2 -mb-1`;
      case 'bottom-right':
        return `${baseArrow} bottom-full left-2 -mb-1`;
      default:
        return `${baseArrow} top-full left-1/2 -translate-x-1/2 -mt-1`;
    }
  };

  const getTypeClasses = () => {
    switch (type) {
      case 'help':
        return 'bg-blue-600 border border-blue-500';
      case 'warning':
        return 'bg-amber-600 border border-amber-500';
      case 'clinical':
        return 'bg-purple-600 border border-purple-500';
      default:
        return 'bg-gray-800 border border-gray-700';
    }
  };

  const getIcon = () => {
    const iconClasses = 'w-4 h-4';
    
    switch (type) {
      case 'help':
        return <HelpCircle className={`${iconClasses} text-blue-600`} />;
      case 'warning':
        return <AlertCircle className={`${iconClasses} text-amber-600`} />;
      case 'clinical':
        return <Info className={`${iconClasses} text-purple-600`} />;
      default:
        return <Info className={`${iconClasses} text-gray-600`} />;
    }
  };

  if (iconOnly) {
    return (
      <div className={`relative inline-block ${className}`}>
        <button
          type="button"
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
          onFocus={showTooltip}
          onBlur={hideTooltip}
          className="inline-flex items-center justify-center p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 transition-colors"
          aria-label="More information"
        >
          {children || getIcon()}
        </button>
        
        {isVisible && (
          <div className={`${getPositionClasses()} ${getTypeClasses()} ${maxWidth} transition-all duration-200 opacity-100 scale-100`}>
            {content}
            <div className={`${getArrowClasses()} ${getTypeClasses()}`}></div>
          </div>
        )}
      </div>
    );
  }

  if (!children) {
    return null;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-flex items-center"
      >
        {children}
        {showIcon && (
          <span className="ml-1 inline-flex">
            {getIcon()}
          </span>
        )}
      </div>
      
      {isVisible && (
        <div className={`${getPositionClasses()} ${getTypeClasses()} ${maxWidth} transition-all duration-200 opacity-100 scale-100`}>
          {content}
          <div className={`${getArrowClasses()} ${getTypeClasses()}`}></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;