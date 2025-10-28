import React, { useState, useEffect } from 'react';
import { X, ArrowRight, SkipForward, Home } from 'lucide-react';

interface TourOverlayProps {
  targetSelector: string;
  title: string;
  description: string;
  onNext: () => void;
  onSkip: () => void;
  onBackToMenu: () => void;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  waitMs?: number;
}

const TourOverlay: React.FC<TourOverlayProps> = ({
  targetSelector,
  title,
  description,
  onNext,
  onSkip,
  onBackToMenu,
  placement = 'right',
  waitMs = 5000
}) => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const findTarget = () => {
      const element = document.querySelector(targetSelector) as HTMLElement;
      if (element) {
        setTargetElement(element);
        calculatePosition(element);
        setVisible(true);
      } else {
        // Wait for element to appear
        const timer = setTimeout(findTarget, 100);
        return () => clearTimeout(timer);
      }
    };

    // Initial delay before showing overlay
    const initialTimer = setTimeout(findTarget, Math.min(waitMs, 2000));

    return () => {
      clearTimeout(initialTimer);
    };
  }, [targetSelector, waitMs]);

  const calculatePosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    let top = 0;
    let left = 0;

    switch (placement) {
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.right + 16;
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.left - tooltipWidth - 16;
        break;
      case 'top':
        top = rect.top - tooltipHeight - 16;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        top = rect.bottom + 16;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
    }

    // Ensure tooltip stays within viewport
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

    setOverlayPosition({ top, left });
  };

  useEffect(() => {
    if (targetElement) {
      const handleResize = () => calculatePosition(targetElement);
      const handleScroll = () => calculatePosition(targetElement);

      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [targetElement, placement]);

  if (!visible || !targetElement) {
    return null;
  }

  const targetRect = targetElement.getBoundingClientRect();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-[1001] pointer-events-none" />
      
      {/* Highlight */}
      <div
        className="fixed z-[1002] pointer-events-none"
        style={{
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
          border: '3px solid #3B82F6',
          borderRadius: '8px',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)',
          animation: 'pulse 2s infinite'
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-[1003] bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm"
        style={{
          top: overlayPosition.top,
          left: overlayPosition.left,
          width: '320px'
        }}
      >
        {/* Arrow */}
        <div
          className={`absolute w-3 h-3 bg-white border transform rotate-45 ${
            placement === 'right' ? '-left-1.5 top-1/2 -translate-y-1/2 border-r-0 border-b-0' :
            placement === 'left' ? '-right-1.5 top-1/2 -translate-y-1/2 border-l-0 border-t-0' :
            placement === 'top' ? '-bottom-1.5 left-1/2 -translate-x-1/2 border-r-0 border-b-0' :
            '-top-1.5 left-1/2 -translate-x-1/2 border-l-0 border-t-0'
          }`}
        />

        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm pr-2">{title}</h3>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            aria-label="Close tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-gray-700 text-sm mb-4 leading-relaxed">
          {description}
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={onBackToMenu}
            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center"
          >
            <Home className="w-3 h-3 mr-1" />
            Menu
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onSkip}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center"
            >
              <SkipForward className="w-3 h-3 mr-1" />
              Skip
            </button>
            <button
              onClick={onNext}
              className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center"
            >
              Next
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            border-color: #3B82F6;
            opacity: 1;
          }
          50% {
            border-color: #60A5FA;
            opacity: 0.8;
          }
        }
      `}</style>
    </>
  );
};

export default TourOverlay;