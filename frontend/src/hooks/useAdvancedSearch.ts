import { useState, useEffect, useMemo } from 'react';
import { Drug } from '../types';

export interface SearchFilter {
  category: string;
  subcategory?: string;
  mechanism?: string;
  indication?: string;
  routeOfAdministration?: string;
  isOncology?: boolean;
  hasGenomicData?: boolean;
  isOrphan?: boolean;
  fdaApproved?: boolean;
  clinicalTrialPhase?: string;
}

export interface SearchHistory {
  id: string;
  query: string;
  filters: SearchFilter;
  timestamp: Date;
  resultCount: number;
}

export interface FavoriteItem {
  id: string;
  type: 'drug' | 'interaction' | 'protocol' | 'regimen';
  itemId: string;
  name: string;
  timestamp: Date;
  notes?: string;
  tags: string[];
}

export interface AdvancedSearchState {
  query: string;
  filters: SearchFilter;
  results: Drug[];
  isLoading: boolean;
  history: SearchHistory[];
  favorites: FavoriteItem[];
  suggestions: string[];
  recentSearches: string[];
}

const STORAGE_KEYS = {
  SEARCH_HISTORY: 'oncosaferx_search_history',
  FAVORITES: 'oncosaferx_favorites',
  RECENT_SEARCHES: 'oncosaferx_recent_searches'
};

export const useAdvancedSearch = () => {
  const [state, setState] = useState<AdvancedSearchState>({
    query: '',
    filters: {
      category: '',
      subcategory: '',
      mechanism: '',
      indication: '',
      routeOfAdministration: '',
      isOncology: undefined,
      hasGenomicData: undefined,
      isOrphan: undefined,
      fdaApproved: undefined,
      clinicalTrialPhase: ''
    },
    results: [],
    isLoading: false,
    history: [],
    favorites: [],
    suggestions: [],
    recentSearches: []
  });

  // Load persisted data on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      const savedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      const savedRecent = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);

      setState(prev => ({
        ...prev,
        history: savedHistory ? JSON.parse(savedHistory) : [],
        favorites: savedFavorites ? JSON.parse(savedFavorites) : [],
        recentSearches: savedRecent ? JSON.parse(savedRecent) : []
      }));
    } catch (error) {
      console.error('Error loading search data from localStorage:', error);
    }
  }, []);

  // Persist data when state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(state.history));
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(state.favorites));
      localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(state.recentSearches));
    } catch (error) {
      console.error('Error saving search data to localStorage:', error);
    }
  }, [state.history, state.favorites, state.recentSearches]);

  const setQuery = (query: string) => {
    setState(prev => ({ ...prev, query }));
    generateSuggestions(query);
  };

  const setFilters = (filters: Partial<SearchFilter>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters }
    }));
  };

  const clearFilters = () => {
    setState(prev => ({
      ...prev,
      filters: {
        category: '',
        subcategory: '',
        mechanism: '',
        indication: '',
        routeOfAdministration: '',
        isOncology: undefined,
        hasGenomicData: undefined,
        isOrphan: undefined,
        fdaApproved: undefined,
        clinicalTrialPhase: ''
      }
    }));
  };

  const generateSuggestions = (query: string) => {
    if (query.length < 2) {
      setState(prev => ({ ...prev, suggestions: [] }));
      return;
    }

    // Generate suggestions based on common drug names, mechanisms, and indications
    const commonSuggestions = [
      'carboplatin', 'cisplatin', 'paclitaxel', 'docetaxel', 'doxorubicin',
      'cyclophosphamide', 'bevacizumab', 'trastuzumab', 'pembrolizumab',
      'nivolumab', 'rituximab', 'cetuximab', 'imatinib', 'erlotinib',
      'gefitinib', 'sorafenib', 'sunitinib', 'regorafenib', 'lenvatinib',
      'breast cancer', 'lung cancer', 'colorectal cancer', 'melanoma',
      'lymphoma', 'leukemia', 'ovarian cancer', 'prostate cancer',
      'EGFR inhibitor', 'PD-1 inhibitor', 'VEGF inhibitor', 'HER2 targeted',
      'tyrosine kinase inhibitor', 'monoclonal antibody', 'checkpoint inhibitor'
    ];

    const suggestions = commonSuggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 8);

    setState(prev => ({ ...prev, suggestions }));
  };

  const performSearch = async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const API_BASE = import.meta.env.VITE_API_URL || '/api';
      let results: Drug[] = [];

      if (state.query.trim()) {
        // Use enhanced drug search API
        const response = await fetch(`${API_BASE}/drugs/enhanced/search?q=${encodeURIComponent(state.query)}`);
        
        if (response.ok) {
          const data = await response.json();
          results = data.results.map((drugData: any) => ({
            id: drugData.drug.rxcui,
            rxcui: drugData.drug.rxcui,
            name: drugData.drug.name,
            genericName: drugData.drug.generic_name || drugData.drug.name,
            brandNames: drugData.drug.brand_names || [],
            category: drugData.drug.category || drugData.therapeuticClass || 'Unknown',
            mechanism: drugData.drug.mechanism || drugData.mechanismOfAction || '',
            indications: drugData.drug.indications || [],
            contraindications: drugData.drug.contraindications || [],
            sideEffects: drugData.drug.sideEffects || drugData.drug.adverse_reactions || [],
            interactions: drugData.interactions || [],
            dosing: drugData.drug.dosing || {},
            monitoring: drugData.drug.monitoring || [],
            fdaApproved: drugData.drug.fdaApproved !== false,
            oncologyDrug: drugData.drug.oncologyDrug === true,
            clinicalData: drugData
          }));
        } else {
          // Fallback to basic drug search if enhanced search fails
          const basicResponse = await fetch(`${API_BASE}/drugs/search?q=${encodeURIComponent(state.query)}`);
          if (basicResponse.ok) {
            const basicData = await basicResponse.json();
            results = basicData.results.map((drug: any) => ({
              id: drug.rxcui,
              rxcui: drug.rxcui,
              name: drug.name,
              genericName: drug.generic_name || drug.name,
              brandNames: drug.brand_names || [],
              category: drug.therapeutic_class || 'Unknown',
              mechanism: '',
              indications: [],
              contraindications: [],
              sideEffects: [],
              interactions: [],
              dosing: {},
              monitoring: [],
              fdaApproved: true,
              oncologyDrug: false
            }));
          }
        }
      }

      // Apply client-side filters to API results
      results = applyFiltersToResults(results, state.filters);
      
      // Add to search history
      const searchHistoryItem: SearchHistory = {
        id: `search_${Date.now()}`,
        query: state.query,
        filters: { ...state.filters },
        timestamp: new Date(),
        resultCount: results.length
      };

      // Add to recent searches if not empty
      if (state.query.trim()) {
        const updatedRecentSearches = [
          state.query,
          ...state.recentSearches.filter(s => s !== state.query)
        ].slice(0, 10); // Keep last 10 searches

        setState(prev => ({
          ...prev,
          results,
          isLoading: false,
          history: [searchHistoryItem, ...prev.history].slice(0, 50), // Keep last 50 searches
          recentSearches: updatedRecentSearches
        }));
      } else {
        setState(prev => ({
          ...prev,
          results,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Search error:', error);
      setState(prev => ({ ...prev, isLoading: false, results: [] }));
    }
  };

  const addToFavorites = (item: Omit<FavoriteItem, 'id' | 'timestamp'>) => {
    const favoriteItem: FavoriteItem = {
      ...item,
      id: `fav_${Date.now()}`,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      favorites: [favoriteItem, ...prev.favorites]
    }));
  };

  const removeFromFavorites = (favoriteId: string) => {
    setState(prev => ({
      ...prev,
      favorites: prev.favorites.filter(fav => fav.id !== favoriteId)
    }));
  };

  const updateFavorite = (favoriteId: string, updates: Partial<FavoriteItem>) => {
    setState(prev => ({
      ...prev,
      favorites: prev.favorites.map(fav =>
        fav.id === favoriteId ? { ...fav, ...updates } : fav
      )
    }));
  };

  const clearHistory = () => {
    setState(prev => ({ ...prev, history: [] }));
  };

  const clearRecentSearches = () => {
    setState(prev => ({ ...prev, recentSearches: [] }));
  };

  const isFavorite = (type: string, itemId: string): boolean => {
    return state.favorites.some(fav => fav.type === type && fav.itemId === itemId);
  };

  // Memoized computed values
  const activeFiltersCount = useMemo(() => {
    const filters = state.filters;
    let count = 0;
    
    if (filters.category) count++;
    if (filters.subcategory) count++;
    if (filters.mechanism) count++;
    if (filters.indication) count++;
    if (filters.routeOfAdministration) count++;
    if (filters.isOncology !== undefined) count++;
    if (filters.hasGenomicData !== undefined) count++;
    if (filters.isOrphan !== undefined) count++;
    if (filters.fdaApproved !== undefined) count++;
    if (filters.clinicalTrialPhase) count++;
    
    return count;
  }, [state.filters]);

  const favoritesByType = useMemo(() => {
    return state.favorites.reduce((acc, fav) => {
      if (!acc[fav.type]) acc[fav.type] = [];
      acc[fav.type].push(fav);
      return acc;
    }, {} as Record<string, FavoriteItem[]>);
  }, [state.favorites]);

  return {
    // State
    query: state.query,
    filters: state.filters,
    results: state.results,
    isLoading: state.isLoading,
    history: state.history,
    favorites: state.favorites,
    suggestions: state.suggestions,
    recentSearches: state.recentSearches,
    
    // Computed values
    activeFiltersCount,
    favoritesByType,
    
    // Actions
    setQuery,
    setFilters,
    clearFilters,
    performSearch,
    addToFavorites,
    removeFromFavorites,
    updateFavorite,
    clearHistory,
    clearRecentSearches,
    isFavorite
  };
};

// Helper function to apply filters to search results
const applyFiltersToResults = (drugs: Drug[], filters: SearchFilter): Drug[] => {
  let filteredDrugs = [...drugs];

  if (filters.category) {
    filteredDrugs = filteredDrugs.filter(drug =>
      drug.category?.toLowerCase().includes(filters.category.toLowerCase())
    );
  }

  if (filters.mechanism) {
    filteredDrugs = filteredDrugs.filter(drug =>
      drug.mechanism?.toLowerCase().includes(filters.mechanism!.toLowerCase())
    );
  }

  if (filters.indication) {
    filteredDrugs = filteredDrugs.filter(drug =>
      drug.indications?.some(indication =>
        indication.toLowerCase().includes(filters.indication!.toLowerCase())
      )
    );
  }

  if (filters.isOncology !== undefined) {
    filteredDrugs = filteredDrugs.filter(drug => drug.oncologyDrug === filters.isOncology);
  }

  if (filters.fdaApproved !== undefined) {
    filteredDrugs = filteredDrugs.filter(drug => drug.fdaApproved === filters.fdaApproved);
  }

  // Additional filter logic for route of administration, orphan drugs, etc.
  if (filters.routeOfAdministration) {
    filteredDrugs = filteredDrugs.filter(drug =>
      drug.dosing?.standard?.toLowerCase().includes(filters.routeOfAdministration!.toLowerCase()) ||
      drug.name?.toLowerCase().includes(filters.routeOfAdministration!.toLowerCase())
    );
  }

  return filteredDrugs;
};

export default useAdvancedSearch;