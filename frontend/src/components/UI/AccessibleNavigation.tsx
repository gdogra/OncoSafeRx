import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  disabled?: boolean;
  children?: NavigationItem[];
}

interface AccessibleNavigationProps {
  items: NavigationItem[];
  orientation?: 'horizontal' | 'vertical';
  ariaLabel?: string;
  className?: string;
  itemClassName?: string;
  activeClassName?: string;
  level?: number;
}

/**
 * Accessible navigation component with full keyboard support and ARIA compliance
 * Supports nested navigation with proper ARIA tree structure
 */
export default function AccessibleNavigation({
  items,
  orientation = 'vertical',
  ariaLabel = 'Navigation',
  className = '',
  itemClassName = '',
  activeClassName = 'bg-primary-50 text-primary-700',
  level = 1
}: AccessibleNavigationProps) {
  const location = useLocation();
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  // Get flattened list of all navigable items
  const getFlattenedItems = () => {
    const flattened: (NavigationItem & { parentIndex?: number; depth: number })[] = [];
    
    const flatten = (items: NavigationItem[], depth = 0, parentIndex?: number) => {
      items.forEach((item, index) => {
        if (!item.disabled) {
          flattened.push({ ...item, parentIndex, depth });
          
          if (item.children && expandedItems.has(item.id)) {
            flatten(item.children, depth + 1, flattened.length - 1);
          }
        }
      });
    };
    
    flatten(items);
    return flattened;
  };

  const flattenedItems = getFlattenedItems();

  // Check if item is currently active
  const isActive = (href: string) => location.pathname === href;

  // Handle keyboard navigation
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const { key, ctrlKey, metaKey } = event;
    let handled = false;
    let newIndex = focusedIndex;

    switch (key) {
      case 'ArrowDown':
        if (orientation === 'vertical') {
          newIndex = Math.min(focusedIndex + 1, flattenedItems.length - 1);
          handled = true;
        }
        break;

      case 'ArrowUp':
        if (orientation === 'vertical') {
          newIndex = Math.max(focusedIndex - 1, 0);
          handled = true;
        }
        break;

      case 'ArrowRight':
        if (orientation === 'horizontal') {
          newIndex = Math.min(focusedIndex + 1, flattenedItems.length - 1);
          handled = true;
        } else {
          // Expand item if it has children
          const currentItem = flattenedItems[focusedIndex];
          if (currentItem?.children && !expandedItems.has(currentItem.id)) {
            setExpandedItems(prev => new Set([...prev, currentItem.id]));
            handled = true;
          }
        }
        break;

      case 'ArrowLeft':
        if (orientation === 'horizontal') {
          newIndex = Math.max(focusedIndex - 1, 0);
          handled = true;
        } else {
          // Collapse item if expanded
          const currentItem = flattenedItems[focusedIndex];
          if (currentItem?.children && expandedItems.has(currentItem.id)) {
            setExpandedItems(prev => {
              const newSet = new Set(prev);
              newSet.delete(currentItem.id);
              return newSet;
            });
            handled = true;
          }
        }
        break;

      case 'Home':
        newIndex = 0;
        handled = true;
        break;

      case 'End':
        newIndex = flattenedItems.length - 1;
        handled = true;
        break;

      case 'Enter':
      case ' ':
        if (focusedIndex >= 0) {
          const currentItem = flattenedItems[focusedIndex];
          if (currentItem?.children) {
            // Toggle expansion
            setExpandedItems(prev => {
              const newSet = new Set(prev);
              if (newSet.has(currentItem.id)) {
                newSet.delete(currentItem.id);
              } else {
                newSet.add(currentItem.id);
              }
              return newSet;
            });
          }
          handled = true;
        }
        break;

      case '*':
        if (orientation === 'vertical') {
          // Expand all items
          const allExpandableIds = items
            .filter(item => item.children)
            .map(item => item.id);
          setExpandedItems(new Set(allExpandableIds));
          handled = true;
        }
        break;
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();

      if (newIndex !== focusedIndex && newIndex >= 0 && newIndex < flattenedItems.length) {
        setFocusedIndex(newIndex);
        itemRefs.current[newIndex]?.focus();
      }
    }
  };

  // Auto-focus management
  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  // Set initial focus on first active item or first item
  useEffect(() => {
    const activeIndex = flattenedItems.findIndex(item => isActive(item.href));
    if (activeIndex >= 0) {
      setFocusedIndex(activeIndex);
    } else if (flattenedItems.length > 0) {
      setFocusedIndex(0);
    }
  }, [flattenedItems.length]);

  const renderNavigationItem = (item: NavigationItem, index: number, depth = 0) => {
    const isFocused = index === focusedIndex;
    const isItemActive = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    const itemElement = (
      <Link
        ref={(el) => (itemRefs.current[index] = el)}
        id={`nav-item-${item.id}`}
        to={item.href}
        className={`
          flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          ${isItemActive ? activeClassName : 'text-gray-700 hover:bg-gray-50'}
          ${isFocused ? 'ring-2 ring-primary-500' : ''}
          ${itemClassName}
        `}
        style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
        role="treeitem"
        aria-selected={isItemActive}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-level={depth + level}
        aria-setsize={flattenedItems.length}
        aria-posinset={index + 1}
        aria-describedby={item.badge ? `nav-badge-${item.id}` : undefined}
        tabIndex={isFocused ? 0 : -1}
        onFocus={() => setFocusedIndex(index)}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            setExpandedItems(prev => {
              const newSet = new Set(prev);
              if (newSet.has(item.id)) {
                newSet.delete(item.id);
              } else {
                newSet.add(item.id);
              }
              return newSet;
            });
          }
        }}
      >
        {item.icon && (
          <item.icon 
            className={`w-5 h-5 flex-shrink-0 ${
              isItemActive ? 'text-primary-600' : 'text-gray-400'
            }`} 
            aria-hidden="true"
          />
        )}
        
        <span className="flex-1 truncate">{item.label}</span>
        
        {item.badge && (
          <span
            id={`nav-badge-${item.id}`}
            className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            aria-label={`${item.badge} items`}
          >
            {item.badge}
          </span>
        )}
        
        {hasChildren && (
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </Link>
    );

    return (
      <li key={item.id}>
        {itemElement}
        
        {hasChildren && isExpanded && (
          <AccessibleNavigation
            items={item.children}
            orientation={orientation}
            ariaLabel={`${item.label} submenu`}
            className="mt-1 ml-4"
            itemClassName={itemClassName}
            activeClassName={activeClassName}
            level={level + 1}
          />
        )}
      </li>
    );
  };

  if (items.length === 0) {
    return (
      <div className="text-gray-500 text-sm p-3" role="status">
        No navigation items
      </div>
    );
  }

  const role = level === 1 ? (orientation === 'horizontal' ? 'menubar' : 'tree') : 'group';

  return (
    <nav
      ref={navRef}
      className={className}
      role={role}
      aria-label={ariaLabel}
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
    >
      <ul role="none" className="space-y-1">
        {items.map((item, index) => {
          if (item.disabled) return null;
          
          const flatIndex = flattenedItems.findIndex(flatItem => flatItem.id === item.id);
          return renderNavigationItem(item, flatIndex, 0);
        })}
      </ul>
      
      {/* Hidden instructions */}
      <div className="sr-only">
        Navigation instructions: Use arrow keys to move between items. 
        {orientation === 'vertical' && 'Press right arrow to expand, left arrow to collapse. '}
        Press Enter or Space to activate. Press * to expand all items.
      </div>
    </nav>
  );
}