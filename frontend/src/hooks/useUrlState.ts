import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type SerializableValue = string | number | boolean | null | undefined;
type StateValue = SerializableValue | SerializableValue[] | Record<string, SerializableValue>;

interface UseUrlStateOptions {
  defaultValue?: StateValue;
  serialize?: (value: StateValue) => string;
  deserialize?: (value: string) => StateValue;
  replace?: boolean; // Use replace instead of push for navigation
}

/**
 * Hook for managing state in URL search parameters
 * Automatically syncs state with URL and provides type-safe updates
 */
export function useUrlState<T extends StateValue>(
  key: string,
  options: UseUrlStateOptions = {}
): [T, (value: T | ((prev: T) => T)) => void] {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    defaultValue,
    serialize = defaultSerialize,
    deserialize = defaultDeserialize,
    replace = false
  } = options;

  // Get initial value from URL or use default
  const getInitialValue = useCallback((): T => {
    const searchParams = new URLSearchParams(location.search);
    const urlValue = searchParams.get(key);
    
    if (urlValue !== null) {
      try {
        return deserialize(urlValue) as T;
      } catch (error) {
        console.warn(`Failed to deserialize URL parameter "${key}":`, error);
      }
    }
    
    return (defaultValue ?? null) as T;
  }, [key, location.search, defaultValue, deserialize]);

  const [state, setState] = useState<T>(getInitialValue);

  // Update URL when state changes
  const updateUrl = useCallback((newValue: T) => {
    const searchParams = new URLSearchParams(location.search);
    
    if (newValue === null || newValue === undefined || newValue === '') {
      searchParams.delete(key);
    } else {
      try {
        const serialized = serialize(newValue);
        searchParams.set(key, serialized);
      } catch (error) {
        console.warn(`Failed to serialize value for URL parameter "${key}":`, error);
        return;
      }
    }
    
    const newSearch = searchParams.toString();
    const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
    
    if (replace) {
      navigate(newUrl, { replace: true });
    } else {
      navigate(newUrl);
    }
  }, [key, location.pathname, location.search, navigate, replace, serialize]);

  // Sync state with URL when location changes
  useEffect(() => {
    const newValue = getInitialValue();
    setState(newValue);
  }, [getInitialValue]);

  // Update function that also updates URL
  const updateState = useCallback((value: T | ((prev: T) => T)) => {
    setState(prevState => {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prevState) : value;
      updateUrl(newValue);
      return newValue;
    });
  }, [updateUrl]);

  return [state, updateState];
}

// Default serializers
function defaultSerialize(value: StateValue): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  if (Array.isArray(value) || typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return String(value);
}

function defaultDeserialize(value: string): StateValue {
  if (!value) {
    return null;
  }
  
  // Try to parse as JSON first
  try {
    return JSON.parse(value);
  } catch {
    // If JSON parsing fails, try other formats
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(Number(value)) && value !== '') return Number(value);
    return value;
  }
}

/**
 * Hook for managing filter state with URL persistence
 */
export function useUrlFilters<T extends Record<string, StateValue>>(
  defaultFilters: T,
  options: { replace?: boolean } = {}
): [T, (filters: Partial<T> | ((prev: T) => Partial<T>)) => void, () => void] {
  const navigate = useNavigate();
  const location = useLocation();
  const { replace = true } = options;

  const getFiltersFromUrl = useCallback((): T => {
    const searchParams = new URLSearchParams(location.search);
    const filters = { ...defaultFilters };
    
    Object.keys(defaultFilters).forEach(key => {
      const urlValue = searchParams.get(key);
      if (urlValue !== null) {
        try {
          filters[key as keyof T] = defaultDeserialize(urlValue) as T[keyof T];
        } catch (error) {
          console.warn(`Failed to parse filter "${key}" from URL:`, error);
        }
      }
    });
    
    return filters;
  }, [location.search]);

  const [filters, setFilters] = useState<T>(getFiltersFromUrl);

  // Update URL when filters change
  const updateUrl = useCallback((newFilters: T) => {
    const searchParams = new URLSearchParams(location.search);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || 
          (Array.isArray(value) && value.length === 0) ||
          value === defaultFilters[key as keyof T]) {
        searchParams.delete(key);
      } else {
        try {
          searchParams.set(key, defaultSerialize(value));
        } catch (error) {
          console.warn(`Failed to serialize filter "${key}":`, error);
        }
      }
    });
    
    const newSearch = searchParams.toString();
    const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
    
    if (replace) {
      navigate(newUrl, { replace: true });
    } else {
      navigate(newUrl);
    }
  }, [location.pathname, location.search, navigate, replace]);

  // Sync filters with URL changes
  useEffect(() => {
    const newFilters = getFiltersFromUrl();
    setFilters(newFilters);
  }, [getFiltersFromUrl]);

  // Update filters function
  const updateFilters = useCallback((newFilters: Partial<T> | ((prev: T) => Partial<T>)) => {
    setFilters(prevFilters => {
      const updates = typeof newFilters === 'function' ? newFilters(prevFilters) : newFilters;
      const updatedFilters = { ...prevFilters, ...updates };
      updateUrl(updatedFilters);
      return updatedFilters;
    });
  }, [updateUrl]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    updateUrl(defaultFilters);
  }, [updateUrl]);

  return [filters, updateFilters, clearFilters];
}

/**
 * Hook for managing pagination state with URL persistence
 */
export function useUrlPagination(defaultPage: number = 1, defaultPageSize: number = 20) {
  const [page, setPage] = useUrlState<number>('page', { 
    defaultValue: defaultPage,
    replace: true 
  });
  const [pageSize, setPageSize] = useUrlState<number>('pageSize', { 
    defaultValue: defaultPageSize,
    replace: true 
  });

  const resetPagination = useCallback(() => {
    setPage(defaultPage);
  }, [setPage, defaultPage]);

  return {
    page: page || defaultPage,
    pageSize: pageSize || defaultPageSize,
    setPage,
    setPageSize,
    resetPagination
  };
}

/**
 * Hook for managing sort state with URL persistence
 */
export function useUrlSort<T extends string>(defaultSort?: T, defaultDirection: 'asc' | 'desc' = 'asc') {
  const [sortBy, setSortBy] = useUrlState<T | null>('sortBy', { 
    defaultValue: defaultSort || null,
    replace: true 
  });
  const [sortDirection, setSortDirection] = useUrlState<'asc' | 'desc'>('sortDirection', { 
    defaultValue: defaultDirection,
    replace: true 
  });

  const updateSort = useCallback((field: T | null, direction?: 'asc' | 'desc') => {
    setSortBy(field);
    if (direction) {
      setSortDirection(direction);
    } else if (field === sortBy) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to asc for new field
      setSortDirection('asc');
    }
  }, [sortBy, sortDirection, setSortBy, setSortDirection]);

  return {
    sortBy,
    sortDirection: sortDirection || defaultDirection,
    updateSort,
    setSortBy,
    setSortDirection
  };
}