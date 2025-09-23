import React, { useState } from 'react';
import { Settings, Eye, EyeOff, Type, MousePointer, Keyboard, X } from 'lucide-react';
import { useAccessibilityContext } from './AccessibilityProvider';

const AccessibilityToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    isHighContrast, 
    toggleHighContrast, 
    isReducedMotion, 
    toggleReducedMotion, 
    fontSize, 
    setFontSize, 
    showShortcuts,
    announceToScreenReader 
  } = useAccessibilityContext();

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      announceToScreenReader('Accessibility toolbar opened');
    } else {
      announceToScreenReader('Accessibility toolbar closed');
    }
  };

  const fontSizeOptions = [
    { value: 'small', label: 'Small', icon: 'A-' },
    { value: 'normal', label: 'Normal', icon: 'A' },
    { value: 'large', label: 'Large', icon: 'A+' },
    { value: 'extra-large', label: 'Extra Large', icon: 'A++' },
  ] as const;

  return (
    <>
      {/* Accessibility Button */}
      <button
        onClick={handleToggle}
        className={`fixed right-4 top-4 z-50 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors focus:ring-4 focus:ring-primary-300 ${
          isOpen ? 'bg-primary-700' : ''
        }`}
        aria-label={`${isOpen ? 'Close' : 'Open'} accessibility options`}
        aria-expanded={isOpen}
        title="Accessibility Options (F1 for shortcuts)"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div 
          className="fixed right-4 top-16 z-40 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80"
          role="dialog"
          aria-label="Accessibility settings"
        >
          <div className="space-y-4">
            <div className="border-b pb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Accessibility Settings</span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Customize your experience
              </p>
            </div>

            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isHighContrast ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <div>
                  <label htmlFor="high-contrast" className="text-sm font-medium text-gray-700">
                    High Contrast
                  </label>
                  <p className="text-xs text-gray-500">Increase color contrast</p>
                </div>
              </div>
              <button
                id="high-contrast"
                onClick={toggleHighContrast}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  isHighContrast ? 'bg-primary-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={isHighContrast}
                aria-label="Toggle high contrast"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isHighContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MousePointer className="w-4 h-4" />
                <div>
                  <label htmlFor="reduced-motion" className="text-sm font-medium text-gray-700">
                    Reduce Motion
                  </label>
                  <p className="text-xs text-gray-500">Minimize animations</p>
                </div>
              </div>
              <button
                id="reduced-motion"
                onClick={toggleReducedMotion}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  isReducedMotion ? 'bg-primary-600' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={isReducedMotion}
                aria-label="Toggle reduced motion"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isReducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Font Size */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Type className="w-4 h-4" />
                <label className="text-sm font-medium text-gray-700">
                  Text Size
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {fontSizeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFontSize(option.value);
                      announceToScreenReader(`Text size changed to ${option.label}`);
                    }}
                    className={`p-2 text-sm rounded-md border transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                      fontSize === option.value
                        ? 'bg-primary-100 border-primary-500 text-primary-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                    aria-pressed={fontSize === option.value}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span className="font-mono">{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="border-t pt-3">
              <button
                onClick={() => {
                  showShortcuts();
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
              >
                <Keyboard className="w-4 h-4" />
                <span>View Keyboard Shortcuts</span>
                <span className="ml-auto text-xs text-gray-500">F1</span>
              </button>
            </div>

            {/* Reset */}
            <div className="border-t pt-3">
              <button
                onClick={() => {
                  setFontSize('normal');
                  if (isHighContrast) toggleHighContrast();
                  if (isReducedMotion) toggleReducedMotion();
                  announceToScreenReader('Accessibility settings reset to defaults');
                }}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-1"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close panel when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default AccessibilityToolbar;