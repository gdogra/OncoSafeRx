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
      // Simulate API call - replace with actual drug database search
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock search results based on query and filters
      const mockResults: Drug[] = generateMockSearchResults(state.query, state.filters);
      
      // Add to search history
      const searchHistoryItem: SearchHistory = {
        id: `search_${Date.now()}`,
        query: state.query,
        filters: { ...state.filters },
        timestamp: new Date(),
        resultCount: mockResults.length
      };

      // Add to recent searches if not empty
      if (state.query.trim()) {
        const updatedRecentSearches = [
          state.query,
          ...state.recentSearches.filter(s => s !== state.query)
        ].slice(0, 10); // Keep last 10 searches

        setState(prev => ({
          ...prev,
          results: mockResults,
          isLoading: false,
          history: [searchHistoryItem, ...prev.history].slice(0, 50), // Keep last 50 searches
          recentSearches: updatedRecentSearches
        }));
      } else {
        setState(prev => ({
          ...prev,
          results: mockResults,
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

// Helper function to generate mock search results
const generateMockSearchResults = (query: string, filters: SearchFilter): Drug[] => {
  // This would be replaced with actual API calls to drug databases
  const mockDrugs: Drug[] = [
    {
      id: '1',
      name: 'Carboplatin',
      genericName: 'carboplatin',
      brandNames: ['Paraplatin'],
      category: 'Alkylating Agent',
      mechanism: 'DNA crosslinking agent',
      indications: ['Ovarian cancer', 'Lung cancer', 'Bladder cancer'],
      contraindications: ['Severe bone marrow depression', 'Significant bleeding'],
      sideEffects: ['Myelosuppression', 'Nephrotoxicity', 'Neurotoxicity'],
      interactions: [],
      dosing: {
        standard: 'AUC 5-6 mg/mL*min IV every 3-4 weeks',
        renal: 'Adjust based on creatinine clearance',
        hepatic: 'No adjustment needed for mild-moderate impairment'
      },
      monitoring: ['CBC', 'Renal function', 'Hearing tests'],
      fdaApproved: true,
      oncologyDrug: true
    },
    {
      id: '2',
      name: 'Pembrolizumab',
      genericName: 'pembrolizumab',
      brandNames: ['Keytruda'],
      category: 'Immunotherapy',
      mechanism: 'PD-1 checkpoint inhibitor',
      indications: ['Melanoma', 'NSCLC', 'Head and neck cancer', 'Hodgkin lymphoma'],
      contraindications: ['Active autoimmune disease'],
      sideEffects: ['Immune-related adverse events', 'Fatigue', 'Rash'],
      interactions: [],
      dosing: {
        standard: '200 mg IV every 3 weeks or 400 mg IV every 6 weeks',
        renal: 'No adjustment needed',
        hepatic: 'No adjustment needed for mild impairment'
      },
      monitoring: ['Liver function', 'Thyroid function', 'Pulmonary function'],
      fdaApproved: true,
      oncologyDrug: true
    }
  ];

  // Filter based on query and filters
  let filteredDrugs = mockDrugs;

  if (query) {
    const searchTerm = query.toLowerCase();
    filteredDrugs = filteredDrugs.filter(drug =>
      drug.name.toLowerCase().includes(searchTerm) ||
      drug.genericName.toLowerCase().includes(searchTerm) ||
      drug.brandNames.some(brand => brand.toLowerCase().includes(searchTerm)) ||
      drug.category.toLowerCase().includes(searchTerm) ||
      drug.mechanism.toLowerCase().includes(searchTerm) ||
      drug.indications.some(indication => indication.toLowerCase().includes(searchTerm))
    );
  }

  if (filters.category) {
    filteredDrugs = filteredDrugs.filter(drug =>
      drug.category.toLowerCase().includes(filters.category.toLowerCase())
    );
  }

  if (filters.mechanism) {
    filteredDrugs = filteredDrugs.filter(drug =>
      drug.mechanism.toLowerCase().includes(filters.mechanism.toLowerCase())
    );
  }

  if (filters.indication) {
    filteredDrugs = filteredDrugs.filter(drug =>
      drug.indications.some(indication =>
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

  return filteredDrugs;
};

export default useAdvancedSearch;