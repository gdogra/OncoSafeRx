import React, { useEffect, useState } from 'react';
import { X, Keyboard, Navigation, Search, Zap, Eye } from 'lucide-react';
import { useGlobalKeyboardShortcuts, getShortcutsByCategory, formatShortcutKey, KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  const { shortcuts } = useGlobalKeyboardShortcuts();
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus the modal for screen readers
      const modal = document.getElementById('shortcuts-modal');
      if (modal) {
        modal.focus();
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredShortcuts = shortcuts.filter(shortcut =>
    shortcut.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
    shortcut.key.toLowerCase().includes(searchFilter.toLowerCase()) ||
    shortcut.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const shortcutsByCategory = getShortcutsByCategory(filteredShortcuts);

  const categoryIcons = {
    navigation: Navigation,
    search: Search,
    actions: Zap,
    accessibility: Eye,
  };

  const categoryTitles = {
    navigation: 'Navigation',
    search: 'Search',
    actions: 'Actions',
    accessibility: 'Accessibility',
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        id="shortcuts-modal"
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Keyboard className="w-6 h-6 text-primary-600" />
            <h2 id="shortcuts-title" className="text-2xl font-bold text-gray-900">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close shortcuts help"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search shortcuts..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              aria-label="Search keyboard shortcuts"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {Object.entries(shortcutsByCategory).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No shortcuts found matching "{searchFilter}"
            </div>
          ) : (
            <div className="grid gap-6">
              {Object.entries(shortcutsByCategory).map(([category, categoryShortcuts]) => {
                const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
                const title = categoryTitles[category as keyof typeof categoryTitles];

                return (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-5 h-5 text-primary-600" />
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {title}
                      </h3>
                    </div>
                    <div className="grid gap-2">
                      {categoryShortcuts.map((shortcut, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-gray-700">{shortcut.description}</span>
                          <div className="flex items-center space-x-1">
                            {formatShortcutKey(shortcut).split(' + ').map((key, keyIndex, array) => (
                              <React.Fragment key={keyIndex}>
                                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono text-gray-800 shadow-sm">
                                  {key}
                                </kbd>
                                {keyIndex < array.length - 1 && (
                                  <span className="text-gray-400 text-sm">+</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Press <kbd className="px-1 py-0.5 bg-white border rounded text-xs">F1</kbd> to open this help</span>
              <span>Press <kbd className="px-1 py-0.5 bg-white border rounded text-xs">Esc</kbd> to close</span>
            </div>
            <div className="text-right">
              <p>OncoSafeRx v1.0.0</p>
              <p className="text-xs text-gray-500">Accessible by design</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;