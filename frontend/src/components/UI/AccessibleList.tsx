import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface AccessibleListProps<T> {
  items: T[];
  renderItem: (item: T, index: number, isSelected: boolean, isFocused: boolean) => React.ReactNode;
  onSelect?: (item: T, index: number) => void;
  onFocus?: (item: T, index: number) => void;
  selectedIndex?: number;
  autoFocus?: boolean;
  role?: 'listbox' | 'menu' | 'tree' | 'grid';
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  multiSelectable?: boolean;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  itemClassName?: string;
  announcements?: {
    selectionChanged?: (item: T, index: number, total: number) => string;
    listChanged?: (total: number) => string;
  };
}

/**
 * Accessible list component with full keyboard navigation and ARIA support
 * Follows WAI-ARIA best practices for listbox/menu patterns
 */
function AccessibleList<T>({
  items,
  renderItem,
  onSelect,
  onFocus,
  selectedIndex = -1,
  autoFocus = false,
  role = 'listbox',
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  multiSelectable = false,
  orientation = 'vertical',
  className = '',
  itemClassName = '',
  announcements = {}
}: AccessibleListProps<T>) {
  const [focusedIndex, setFocusedIndex] = useState(selectedIndex);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [liveRegion, setLiveRegion] = useState('');

  // Announce changes to screen readers
  const announce = (message: string) => {
    setLiveRegion(message);
    // Clear after announcement
    setTimeout(() => setLiveRegion(''), 1000);
  };

  // Focus management
  useEffect(() => {
    if (autoFocus && items.length > 0 && focusedIndex >= 0) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [autoFocus, items.length, focusedIndex]);

  // Update focused index when selected index changes
  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < items.length) {
      setFocusedIndex(selectedIndex);
    }
  }, [selectedIndex, items.length]);

  // Announce list changes
  useEffect(() => {
    if (announcements.listChanged && items.length > 0) {
      announce(announcements.listChanged(items.length));
    }
  }, [items.length, announcements.listChanged]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const { key, ctrlKey, metaKey } = event;
    
    let newIndex = focusedIndex;
    let handled = false;

    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        if (orientation === 'vertical' && key === 'ArrowRight') break;
        if (orientation === 'horizontal' && key === 'ArrowDown') break;
        
        newIndex = Math.min(focusedIndex + 1, items.length - 1);
        handled = true;
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        if (orientation === 'vertical' && key === 'ArrowLeft') break;
        if (orientation === 'horizontal' && key === 'ArrowUp') break;
        
        newIndex = Math.max(focusedIndex - 1, 0);
        handled = true;
        break;

      case 'Home':
        newIndex = 0;
        handled = true;
        break;

      case 'End':
        newIndex = items.length - 1;
        handled = true;
        break;

      case 'PageDown':
        newIndex = Math.min(focusedIndex + 10, items.length - 1);
        handled = true;
        break;

      case 'PageUp':
        newIndex = Math.max(focusedIndex - 10, 0);
        handled = true;
        break;

      case 'Enter':
      case ' ':
        if (focusedIndex >= 0 && focusedIndex < items.length) {
          onSelect?.(items[focusedIndex], focusedIndex);
          
          if (announcements.selectionChanged) {
            announce(announcements.selectionChanged(items[focusedIndex], focusedIndex, items.length));
          }
        }
        handled = true;
        break;

      case 'a':
        if ((ctrlKey || metaKey) && multiSelectable) {
          // Select all functionality would go here
          handled = true;
        }
        break;
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
      
      if (newIndex !== focusedIndex && newIndex >= 0 && newIndex < items.length) {
        setFocusedIndex(newIndex);
        onFocus?.(items[newIndex], newIndex);
        
        // Focus the new item
        itemRefs.current[newIndex]?.focus();
      }
    }
  };

  const handleItemClick = (item: T, index: number) => {
    setFocusedIndex(index);
    onFocus?.(item, index);
    onSelect?.(item, index);
    
    if (announcements.selectionChanged) {
      announce(announcements.selectionChanged(item, index, items.length));
    }
  };

  const handleItemFocus = (item: T, index: number) => {
    setFocusedIndex(index);
    onFocus?.(item, index);
  };

  if (items.length === 0) {
    return (
      <div className={`text-gray-500 text-center py-4 ${className}`}>
        <div aria-live="polite">No items available</div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={listRef}
        role={role}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-multiselectable={multiSelectable}
        aria-orientation={orientation}
        aria-activedescendant={focusedIndex >= 0 ? `list-item-${focusedIndex}` : undefined}
        tabIndex={0}
        className={`focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${className}`}
        onKeyDown={handleKeyDown}
      >
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;
          const isFocused = index === focusedIndex;
          
          return (
            <div
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              id={`list-item-${index}`}
              role="option"
              aria-selected={isSelected}
              aria-posinset={index + 1}
              aria-setsize={items.length}
              tabIndex={-1}
              className={`
                cursor-pointer transition-colors
                ${isFocused ? 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset' : ''}
                ${itemClassName}
              `}
              onClick={() => handleItemClick(item, index)}
              onFocus={() => handleItemFocus(item, index)}
            >
              {renderItem(item, index, isSelected, isFocused)}
            </div>
          );
        })}
      </div>
      
      {/* Live region for announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveRegion}
      </div>
    </>
  );
}

export default AccessibleList;