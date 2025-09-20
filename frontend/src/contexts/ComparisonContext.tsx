import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Drug } from '../types';

interface ComparisonItem {
  drug: Drug;
  addedAt: number;
  source?: string; // Where the drug was added from
}

interface ComparisonState {
  items: ComparisonItem[];
  isOpen: boolean;
  maxItems: number;
}

type ComparisonAction =
  | { type: 'ADD_DRUG'; payload: { drug: Drug; source?: string } }
  | { type: 'REMOVE_DRUG'; payload: string } // rxcui
  | { type: 'CLEAR_ALL' }
  | { type: 'TOGGLE_TRAY' }
  | { type: 'OPEN_TRAY' }
  | { type: 'CLOSE_TRAY' }
  | { type: 'REORDER'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'LOAD_STATE'; payload: ComparisonState };

interface ComparisonContextType {
  state: ComparisonState;
  addDrug: (drug: Drug, source?: string) => boolean;
  removeDrug: (rxcui: string) => void;
  clearAll: () => void;
  toggleTray: () => void;
  openTray: () => void;
  closeTray: () => void;
  reorderItems: (fromIndex: number, toIndex: number) => void;
  hasDrug: (rxcui: string) => boolean;
  isAtCapacity: boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

const initialState: ComparisonState = {
  items: [],
  isOpen: false,
  maxItems: 5, // Limit to prevent UI overflow
};

const STORAGE_KEY = 'oncosafe_drug_comparison';

function comparisonReducer(state: ComparisonState, action: ComparisonAction): ComparisonState {
  switch (action.type) {
    case 'ADD_DRUG': {
      const { drug, source } = action.payload;
      
      // Check if already exists
      if (state.items.some(item => item.drug.rxcui === drug.rxcui)) {
        return state;
      }
      
      // Check capacity
      if (state.items.length >= state.maxItems) {
        return state;
      }
      
      const newItem: ComparisonItem = {
        drug,
        addedAt: Date.now(),
        source,
      };
      
      return {
        ...state,
        items: [...state.items, newItem],
        isOpen: true, // Auto-open when adding
      };
    }
    
    case 'REMOVE_DRUG': {
      return {
        ...state,
        items: state.items.filter(item => item.drug.rxcui !== action.payload),
      };
    }
    
    case 'CLEAR_ALL': {
      return {
        ...state,
        items: [],
        isOpen: false,
      };
    }
    
    case 'TOGGLE_TRAY': {
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    }
    
    case 'OPEN_TRAY': {
      return {
        ...state,
        isOpen: true,
      };
    }
    
    case 'CLOSE_TRAY': {
      return {
        ...state,
        isOpen: false,
      };
    }
    
    case 'REORDER': {
      const { fromIndex, toIndex } = action.payload;
      const newItems = [...state.items];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      
      return {
        ...state,
        items: newItems,
      };
    }
    
    case 'LOAD_STATE': {
      return action.payload;
    }
    
    default:
      return state;
  }
}

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(comparisonReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        // Validate structure and merge with defaults
        const validState: ComparisonState = {
          items: Array.isArray(parsedState.items) ? parsedState.items : [],
          isOpen: false, // Always start closed
          maxItems: parsedState.maxItems || initialState.maxItems,
        };
        dispatch({ type: 'LOAD_STATE', payload: validState });
      }
    } catch (error) {
      console.warn('Failed to load comparison state from localStorage:', error);
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    try {
      const stateToSave = {
        ...state,
        isOpen: false, // Don't persist open state
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save comparison state to localStorage:', error);
    }
  }, [state]);

  const addDrug = (drug: Drug, source?: string): boolean => {
    if (state.items.some(item => item.drug.rxcui === drug.rxcui)) {
      return false; // Already exists
    }
    
    if (state.items.length >= state.maxItems) {
      return false; // At capacity
    }
    
    dispatch({ type: 'ADD_DRUG', payload: { drug, source } });
    return true;
  };

  const removeDrug = (rxcui: string) => {
    dispatch({ type: 'REMOVE_DRUG', payload: rxcui });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  const toggleTray = () => {
    dispatch({ type: 'TOGGLE_TRAY' });
  };

  const openTray = () => {
    dispatch({ type: 'OPEN_TRAY' });
  };

  const closeTray = () => {
    dispatch({ type: 'CLOSE_TRAY' });
  };

  const reorderItems = (fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER', payload: { fromIndex, toIndex } });
  };

  const hasDrug = (rxcui: string): boolean => {
    return state.items.some(item => item.drug.rxcui === rxcui);
  };

  const isAtCapacity = state.items.length >= state.maxItems;

  return (
    <ComparisonContext.Provider
      value={{
        state,
        addDrug,
        removeDrug,
        clearAll,
        toggleTray,
        openTray,
        closeTray,
        reorderItems,
        hasDrug,
        isAtCapacity,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};