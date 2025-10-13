import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Drug, DrugSearchResult } from '../../types';
import DrugCard from './DrugCard';
import Alert from '../UI/Alert';
import Tooltip from '../UI/Tooltip';
import { Database, Globe, Star, Pill, Filter, TrendingUp, Clock, Info } from 'lucide-react';
import { getPins, togglePin } from '../../utils/pins';

interface DrugSearchResultsProps {
  results: DrugSearchResult | null;
  loading: boolean;
  error: string | null;
  onDrugSelect?: (drug: Drug) => void;
  filters?: { onlyOncology?: boolean; tty?: Set<string> };
}

// Calculate relevance score based on query match
function calculateRelevanceScore(drug: Drug, query: string): number {
  const lowerQuery = (query || '').toLowerCase();
  const lowerName = (drug.name || '').toLowerCase();
  if (!lowerQuery) return 0;
  if (lowerName === lowerQuery) return 100;
  if (lowerName.startsWith(lowerQuery)) return 80;
  if (lowerName.includes(lowerQuery)) return 60;
  const similarity = calculateSimilarity(lowerName, lowerQuery);
  return Math.floor(similarity * 40);
}

// Simple similarity calculation
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  if (longer.length === 0) return 1.0;
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

// Levenshtein distance for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        (matrix[j][i - 1] as number) + 1,
        (matrix[j - 1][i] as number) + 1,
        (matrix[j - 1][i - 1] as number) + cost
      );
    }
  }
  return matrix[str2.length][str1.length] as number;
}

const DrugSearchResults: React.FC<DrugSearchResultsProps> = ({
  results,
  loading,
  error,
  onDrugSelect,
  filters,
}) => {
  // Popularity map from localStorage (incremented on selection elsewhere)
  let popularity: Record<string, number> = {};
  try { popularity = JSON.parse(localStorage.getItem('oncosaferx_popularity') || '{}'); } catch {}
  // Categorize and rank results
  const categorizedResults = useMemo(() => {
    if (!results || !results.results.length) return null;

    const categories: Record<string, Drug[]> = {
      'Brand Names': [],
      'Generic Names': [],
      'Ingredients': [],
      'Combinations': [],
      'Other': [],
    };

    // Popular drug indicators
    const popularDrugs = ['aspirin', 'ibuprofen', 'acetaminophen', 'warfarin', 'metformin', 'atorvastatin'];
    const oncologyDrugs = ['pembrolizumab', 'nivolumab', 'fluorouracil', 'cisplatin', 'doxorubicin', 'paclitaxel'];

    // Apply filters first (if any)
    const baseList = results.results.filter(drug => {
      const ttyOk = !filters?.tty || filters.tty.size === 0 || (drug.tty ? filters.tty.has(drug.tty) : false);
      // oncology flag approximated by name matches; refined later by backend
      const oncoNames = ['pembrolizumab','nivolumab','fluorouracil','cisplatin','doxorubicin','paclitaxel','tamoxifen','imatinib'];
      const isOncologyApprox = oncoNames.some(n => (drug.name || '').toLowerCase().includes(n));
      const oncoOk = !filters?.onlyOncology || isOncologyApprox;
      return ttyOk && oncoOk;
    });

    baseList.forEach(drug => {
      // Add popularity indicators
      const isPopular = popularDrugs.some(popular => 
        drug.name.toLowerCase().includes(popular.toLowerCase())
      );
      const isOncology = oncologyDrugs.some(onco => 
        drug.name.toLowerCase().includes(onco.toLowerCase())
      );

      // Enhanced drug object with metadata
      const enhancedDrug = {
        ...drug,
        isPopular,
        isOncology,
        relevanceScore: calculateRelevanceScore(drug, results.query || ''),
        popularityScore: Number(popularity[drug.rxcui] || 0),
      };

      // Categorize by term type
      switch (drug.tty) {
        case 'BN':
          categories['Brand Names'].push(enhancedDrug);
          break;
        case 'IN':
        case 'PIN':
          categories['Ingredients'].push(enhancedDrug);
          break;
        case 'MIN':
          categories['Combinations'].push(enhancedDrug);
          break;
        case 'SCD':
        case 'SBD':
          categories['Generic Names'].push(enhancedDrug);
          break;
        default:
          categories['Other'].push(enhancedDrug);
          break;
      }
    });

    // Sort each category by relevance score
    Object.keys(categories).forEach(key => {
      categories[key].sort((a, b) => {
        // Prioritize popular and oncology drugs
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        if (a.isOncology && !b.isOncology) return -1;
        if (!a.isOncology && b.isOncology) return 1;
        // Then by dynamic popularity
        if ((a as any).popularityScore !== (b as any).popularityScore) return (b as any).popularityScore - (a as any).popularityScore;
        // Then by relevance score
        return b.relevanceScore - a.relevanceScore;
      });
    });

    return categories;
  }, [results]);
  const [pinTick, setPinTick] = useState(0);
  const pins = useMemo(() => getPins(), [results, pinTick]);

  // Flattened list for keyboard navigation
  const flatList = useMemo(() => {
    if (!results || !results.results.length) return [] as Drug[];
    if (!categorizedResults) return results.results as Drug[];
    return Object.values(categorizedResults).flat();
  }, [results, categorizedResults]);

  const [highlighted, setHighlighted] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setHighlighted(-1);
  }, [results, filters]);

  const move = (delta: number) => {
    if (flatList.length === 0) return;
    setHighlighted((prev) => {
      const next = prev < 0 ? (delta > 0 ? 0 : flatList.length - 1) : (prev + delta + flatList.length) % flatList.length;
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key.toLowerCase() === 'j') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'k') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Enter' && highlighted >= 0 && flatList[highlighted]) {
      e.preventDefault();
      const d = flatList[highlighted];
      onDrugSelect?.(d);
      try { const { rxcui, name } = d; (async () => (await import('../../utils/analytics')).analytics.logSelection(rxcui, name, 'search_results'))(); } catch {}
    } else if (e.key.toLowerCase() === 'p' && highlighted >= 0 && flatList[highlighted]) {
      // Toggle pin on highlighted item
      e.preventDefault();
      const d = flatList[highlighted];
      try { togglePin(d.rxcui, d.name); setPinTick(t => t + 1); } catch {}
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" title="Search Error">
        {error}
      </Alert>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Search for drugs</p>
          <p className="text-sm">Enter a drug name to search our database and external sources</p>
        </div>
      </div>
    );
  }

  if (results.count === 0) {
    return (
      <Alert type="info" title="No Results Found">
        No drugs found matching your search query "{results.query}". Please try a different search term.
      </Alert>
    );
  }

  return (
    <div
      className="space-y-6 outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      ref={containerRef}
      role="listbox"
      aria-label="Drug search results"
      aria-activedescendant={highlighted >= 0 && flatList[highlighted] ? `drug-option-${flatList[highlighted].rxcui}` : undefined}
    >
      {/* Enhanced Search Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Search Results for "{results.query}"</span>
            </h3>
            <p className="text-sm text-gray-600">
              Found {results.count} drug{results.count !== 1 ? 's' : ''} • Ranked by relevance and popularity
            </p>
          </div>
          
          {results.sources && (
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <Tooltip content="Results from local OncoSafeRx database">
                <div className="flex items-center space-x-1 cursor-help">
                  <Database className="w-4 h-4" />
                  <span>Local: {results.sources.local}</span>
                </div>
              </Tooltip>
              <Tooltip content="Results from RxNorm (National Library of Medicine) database">
                <div className="flex items-center space-x-1 cursor-help">
                  <Globe className="w-4 h-4" />
                  <span>RxNorm: {results.sources.rxnorm}</span>
                </div>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Category Summary */}
        {categorizedResults && (
          <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
            {Object.entries(categorizedResults).map(([category, drugs]) => {
              if (drugs.length === 0) return null;
              
              const getCategoryIcon = (cat: string) => {
                switch (cat) {
                  case 'Brand Names': return <Star className="w-3 h-3" />;
                  case 'Generic Names': return <Pill className="w-3 h-3" />;
                  case 'Ingredients': return <Filter className="w-3 h-3" />;
                  case 'Combinations': return <Database className="w-3 h-3" />;
                  default: return <Globe className="w-3 h-3" />;
                }
              };

              const getCategoryTooltip = (cat: string) => {
                switch (cat) {
                  case 'Brand Names': return 'Proprietary/commercial drug names (e.g., Tylenol, Advil)';
                  case 'Generic Names': return 'Scientific/chemical drug names (e.g., acetaminophen, ibuprofen)';
                  case 'Ingredients': return 'Active pharmaceutical ingredients and components';
                  case 'Combinations': return 'Multi-ingredient formulations and combination products';
                  default: return 'Other drug terminology types';
                }
              };

              return (
                <Tooltip key={category} content={getCategoryTooltip(category)}>
                  <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600 cursor-help">
                    {getCategoryIcon(category)}
                    <span>{category}: {drugs.length}</span>
                  </div>
                </Tooltip>
              );
            })}
          </div>
        )}
      </div>

      {/* Pinned Results */}
      {Object.keys(pins).length > 0 && results && results.results.length > 0 && (
        <div className="space-y-3">
          <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border text-yellow-700 bg-yellow-50 border-yellow-200`}>
            <Star className="w-4 h-4" />
            <h4 className="font-medium">Pinned</h4>
            <span className="text-sm">({Object.keys(pins).filter(r => results.results.find(dr => dr.rxcui === r)).length})</span>
          </div>
          <div className="space-y-3">
            {results.results
              .filter((d) => !!pins[d.rxcui])
              .map((drug) => (
                <div key={`${drug.rxcui}-${drug.tty}`} className="relative">
                  <DrugCard
                    drug={drug}
                    onClick={onDrugSelect}
                    className={'ring-2 ring-yellow-200'}
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Categorized Results */}
      {categorizedResults ? (
        <div className="space-y-6">
          {Object.entries(categorizedResults).map(([category, drugs]) => {
            if (drugs.length === 0) return null;

            const getCategoryColor = (cat: string) => {
              switch (cat) {
                case 'Brand Names': return 'text-purple-600 bg-purple-50 border-purple-200';
                case 'Generic Names': return 'text-blue-600 bg-blue-50 border-blue-200';
                case 'Ingredients': return 'text-green-600 bg-green-50 border-green-200';
                case 'Combinations': return 'text-orange-600 bg-orange-50 border-orange-200';
                default: return 'text-gray-600 bg-gray-50 border-gray-200';
              }
            };

            const getCategoryIcon = (cat: string) => {
              switch (cat) {
                case 'Brand Names': return <Star className="w-4 h-4" />;
                case 'Generic Names': return <Pill className="w-4 h-4" />;
                case 'Ingredients': return <Filter className="w-4 h-4" />;
                case 'Combinations': return <Database className="w-4 h-4" />;
                default: return <Globe className="w-4 h-4" />;
              }
            };

            return (
              <div key={category} className="space-y-3">
                {/* Category Header */}
                <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${getCategoryColor(category)}`}>
                  {getCategoryIcon(category)}
                  <h4 className="font-medium">{category}</h4>
                  <span className="text-sm">({drugs.length})</span>
                </div>

                {/* Category Results */}
                <div className="space-y-3">
                  {drugs.map((drug) => (
                    <div
                      key={`${drug.rxcui}-${drug.tty}`}
                      id={`drug-option-${drug.rxcui}`}
                      className="relative"
                      role="option"
                      aria-selected={highlighted >= 0 && flatList[highlighted]?.rxcui === drug.rxcui}
                    >
                      {/* Pin toggle */}
                      <Tooltip content={pins[drug.rxcui] ? 'Unpin this drug' : 'Pin this drug'}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); togglePin(drug.rxcui, drug.name); setPinTick(t => t + 1); }}
                          className={`absolute top-2 left-2 z-10 inline-flex items-center justify-center w-6 h-6 rounded-full border ${pins[drug.rxcui] ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-white border-gray-200 text-gray-500'} hover:bg-yellow-50`}
                          aria-label={pins[drug.rxcui] ? 'Unpin' : 'Pin'}
                        >
                          <Star className="w-3 h-3" />
                        </button>
                      </Tooltip>
                      <DrugCard
                        drug={drug}
                        onClick={onDrugSelect}
                        className={`${drug.isPopular ? 'ring-2 ring-yellow-200' : ''} ${drug.isOncology ? 'ring-2 ring-purple-200' : ''} ${highlighted >= 0 && flatList[highlighted]?.rxcui === drug.rxcui ? 'ring-2 ring-blue-300' : ''}`}
                      />
                      
                      {/* Relevance and Special Indicators */}
                      <div className="absolute top-2 right-2 flex items-center space-x-1">
                        {drug.isPopular && (
                          <Tooltip content="Commonly prescribed medication with high usage frequency">
                            <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium cursor-help">
                              <TrendingUp className="w-3 h-3" />
                              <span>Popular</span>
                            </div>
                          </Tooltip>
                        )}
                        {drug.isOncology && (
                          <Tooltip content="Oncology/cancer treatment medication - requires specialized handling and monitoring">
                            <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium cursor-help">
                              <Star className="w-3 h-3" />
                              <span>Oncology</span>
                            </div>
                          </Tooltip>
                        )}
                        {drug.relevanceScore >= 80 && (
                          <Tooltip content="High relevance match based on search query similarity">
                            <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium cursor-help">
                              <Clock className="w-3 h-3" />
                              <span>{drug.relevanceScore}% match</span>
                            </div>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Fallback to simple list */
        <div className="space-y-4">
          {results.results.map((drug) => (
            <div key={`${drug.rxcui}-${drug.tty}`} className="relative">
              <Tooltip content={pins[drug.rxcui] ? 'Unpin this drug' : 'Pin this drug'}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); togglePin(drug.rxcui, drug.name); setPinTick(t => t + 1); }}
                  className={`absolute top-2 left-2 z-10 inline-flex items-center justify-center w-6 h-6 rounded-full border ${pins[drug.rxcui] ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-white border-gray-200 text-gray-500'} hover:bg-yellow-50`}
                  aria-label={pins[drug.rxcui] ? 'Unpin' : 'Pin'}
                >
                  <Star className="w-3 h-3" />
                </button>
              </Tooltip>
              <DrugCard
                drug={drug}
                onClick={onDrugSelect}
                className={pins[drug.rxcui] ? 'ring-2 ring-yellow-200' : ''}
              />
            </div>
          ))}
        </div>
      )}

      {/* Load More (if needed) */}
      {results.count > results.results.length && (
        <div className="text-center">
          <button className="px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center space-x-2 mx-auto">
            <Database className="w-4 h-4" />
            <span>Load More Results ({results.count - results.results.length} remaining)</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DrugSearchResults;
