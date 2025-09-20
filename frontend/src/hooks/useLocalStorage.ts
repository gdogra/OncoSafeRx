import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((val: T) => T);

/**
 * Hook for managing state with localStorage persistence
 * Automatically syncs with localStorage and handles JSON serialization
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
    syncAcrossTabs?: boolean;
  } = {}
): [T, (value: SetValue<T>) => void, () => void] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncAcrossTabs = true
  } = options;

  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        return deserialize(item);
      }
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = useCallback((value: SetValue<T>) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, serialize(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serialize, storedValue]);

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to localStorage from other tabs
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserialize(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize, initialValue, syncAcrossTabs]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for managing user preferences with localStorage
 */
export function useUserPreferences<T extends Record<string, any>>(
  defaultPreferences: T,
  storageKey: string = 'user_preferences'
) {
  const [preferences, setPreferences, clearPreferences] = useLocalStorage(
    storageKey,
    defaultPreferences
  );

  const updatePreference = useCallback(<K extends keyof T>(
    key: K,
    value: T[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, [setPreferences]);

  const updatePreferences = useCallback((updates: Partial<T>) => {
    setPreferences(prev => ({
      ...prev,
      ...updates
    }));
  }, [setPreferences]);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
  }, [setPreferences, defaultPreferences]);

  return {
    preferences,
    updatePreference,
    updatePreferences,
    resetPreferences,
    clearPreferences
  };
}

/**
 * Hook for managing recent searches with localStorage
 */
export function useRecentSearches(
  maxItems: number = 10,
  storageKey: string = 'recent_searches'
) {
  const [searches, setSearches] = useLocalStorage<string[]>(storageKey, []);

  const addSearch = useCallback((search: string) => {
    const trimmedSearch = search.trim();
    if (!trimmedSearch) return;

    setSearches(prev => {
      const filtered = prev.filter(s => s !== trimmedSearch);
      return [trimmedSearch, ...filtered].slice(0, maxItems);
    });
  }, [setSearches, maxItems]);

  const removeSearch = useCallback((search: string) => {
    setSearches(prev => prev.filter(s => s !== search));
  }, [setSearches]);

  const clearSearches = useCallback(() => {
    setSearches([]);
  }, [setSearches]);

  return {
    searches,
    addSearch,
    removeSearch,
    clearSearches
  };
}

/**
 * Hook for managing view state (collapsed panels, table columns, etc.)
 */
export function useViewState<T extends Record<string, any>>(
  defaultState: T,
  storageKey: string
) {
  const [viewState, setViewState] = useLocalStorage(storageKey, defaultState);

  const updateViewState = useCallback(<K extends keyof T>(
    key: K,
    value: T[K]
  ) => {
    setViewState(prev => ({
      ...prev,
      [key]: value
    }));
  }, [setViewState]);

  const toggleViewState = useCallback(<K extends keyof T>(key: K) => {
    setViewState(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, [setViewState]);

  const resetViewState = useCallback(() => {
    setViewState(defaultState);
  }, [setViewState, defaultState]);

  return {
    viewState,
    updateViewState,
    toggleViewState,
    resetViewState
  };
}

/**
 * Hook for managing form state with localStorage backup
 */
export function useFormState<T extends Record<string, any>>(
  formId: string,
  defaultValues: T,
  options: {
    autosave?: boolean;
    debounceMs?: number;
  } = {}
) {
  const { autosave = true, debounceMs = 1000 } = options;
  const storageKey = `form_state_${formId}`;
  
  const [values, setValues] = useLocalStorage(storageKey, defaultValues);
  const [isDirty, setIsDirty] = useState(false);

  // Update form value
  const setValue = useCallback(<K extends keyof T>(
    key: K,
    value: T[K]
  ) => {
    setValues(prev => ({
      ...prev,
      [key]: value
    }));
    setIsDirty(true);
  }, [setValues]);

  // Update multiple values
  const setValues_ = useCallback((updates: Partial<T>) => {
    setValues(prev => ({
      ...prev,
      ...updates
    }));
    setIsDirty(true);
  }, [setValues]);

  // Reset form to default values
  const resetForm = useCallback(() => {
    setValues(defaultValues);
    setIsDirty(false);
  }, [setValues, defaultValues]);

  // Clear saved form state
  const clearSavedState = useCallback(() => {
    window.localStorage.removeItem(storageKey);
    setValues(defaultValues);
    setIsDirty(false);
  }, [storageKey, setValues, defaultValues]);

  // Mark form as saved
  const markSaved = useCallback(() => {
    setIsDirty(false);
  }, []);

  return {
    values,
    setValue,
    setValues: setValues_,
    resetForm,
    clearSavedState,
    markSaved,
    isDirty
  };
}