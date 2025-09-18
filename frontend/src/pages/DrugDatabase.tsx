import React, { useState, useEffect } from 'react';
import { Drug } from '../types';
import SearchWithFavorites from '../components/Search/SearchWithFavorites';
import EnhancedDrugInfo from '../components/DrugInfo/EnhancedDrugInfo';
import DrugComparisonTool from '../components/DrugInfo/DrugComparisonTool';
import { 
  Database, 
  Filter, 
  Grid, 
  List, 
  Search, 
  Star, 
  BarChart3,
  Plus,
  Eye,
  GitCompare,
  Bookmark,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { SearchFilter } from '../hooks/useAdvancedSearch';

interface DrugCategoryStats {
  category: string;
  count: number;
  trending: boolean;
  newAdditions: number;
}

const DrugDatabase: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'comparison'>('grid');
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [searchResults, setSearchResults] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryStats, setCategoryStats] = useState<DrugCategoryStats[]>([]);
  const [comparisonDrugs, setComparisonDrugs] = useState<Drug[]>([]);

  // Mock drug database
  const [drugDatabase] = useState<Drug[]>([
    {
      id: '1',
      rxcui: '1001',
      name: 'Carboplatin',
      genericName: 'carboplatin',
      brandNames: ['Paraplatin'],
      category: 'Alkylating Agent',
      mechanism: 'DNA crosslinking agent that forms intrastrand and interstrand DNA crosslinks',
      indications: ['Ovarian cancer', 'Lung cancer', 'Bladder cancer', 'Head and neck cancer'],
      contraindications: ['Severe bone marrow depression', 'Significant bleeding', 'Severe renal impairment'],
      sideEffects: ['Myelosuppression', 'Nephrotoxicity', 'Neurotoxicity', 'Ototoxicity', 'Nausea', 'Vomiting'],
      interactions: [],
      dosing: {
        standard: 'AUC 5-6 mg/mL*min IV every 3-4 weeks',
        renal: 'Adjust based on creatinine clearance using Calvert formula',
        hepatic: 'No adjustment needed for mild-moderate impairment'
      },
      monitoring: ['CBC with differential', 'Comprehensive metabolic panel', 'Renal function', 'Hearing tests'],
      fdaApproved: true,
      oncologyDrug: true
    },
    {
      id: '2',
      rxcui: '1002',
      name: 'Pembrolizumab',
      genericName: 'pembrolizumab',
      brandNames: ['Keytruda'],
      category: 'Immunotherapy',
      mechanism: 'Monoclonal antibody that blocks PD-1 receptor on T-cells, enhancing immune response',
      indications: ['Melanoma', 'NSCLC', 'Head and neck cancer', 'Hodgkin lymphoma', 'Urothelial carcinoma'],
      contraindications: ['Active autoimmune disease requiring systemic therapy'],
      sideEffects: ['Immune-related adverse events', 'Fatigue', 'Rash', 'Pruritus', 'Diarrhea', 'Decreased appetite'],
      interactions: [],
      dosing: {
        standard: '200 mg IV every 3 weeks or 400 mg IV every 6 weeks',
        renal: 'No adjustment needed',
        hepatic: 'No adjustment needed for mild impairment'
      },
      monitoring: ['Liver function tests', 'Thyroid function', 'Pulmonary function', 'Skin examination'],
      fdaApproved: true,
      oncologyDrug: true
    },
    {
      id: '3',
      rxcui: '1003',
      name: 'Imatinib',
      genericName: 'imatinib',
      brandNames: ['Gleevec', 'Glivec'],
      category: 'Targeted Therapy',
      mechanism: 'Tyrosine kinase inhibitor targeting BCR-ABL, KIT, and PDGFR',
      indications: ['Chronic myeloid leukemia', 'Acute lymphoblastic leukemia', 'GIST'],
      contraindications: ['Hypersensitivity to imatinib or excipients'],
      sideEffects: ['Edema', 'Nausea', 'Muscle cramps', 'Rash', 'Diarrhea', 'Fatigue'],
      interactions: [],
      dosing: {
        standard: '400-800 mg daily orally with food',
        renal: 'Reduce dose for severe impairment',
        hepatic: 'Reduce dose for moderate to severe impairment'
      },
      monitoring: ['CBC', 'Liver function', 'Weight monitoring', 'Echocardiogram'],
      fdaApproved: true,
      oncologyDrug: true
    },
    {
      id: '4',
      rxcui: '1004',
      name: 'Doxorubicin',
      genericName: 'doxorubicin',
      brandNames: ['Adriamycin'],
      category: 'Anthracycline',
      mechanism: 'DNA intercalation and topoisomerase II inhibition causing DNA strand breaks',
      indications: ['Breast cancer', 'Lymphoma', 'Sarcoma', 'Acute leukemia'],
      contraindications: ['Severe cardiac dysfunction', 'Recent myocardial infarction', 'Severe hepatic impairment'],
      sideEffects: ['Cardiotoxicity', 'Myelosuppression', 'Mucositis', 'Alopecia', 'Nausea', 'Vomiting'],
      interactions: [],
      dosing: {
        standard: '60-75 mg/m² IV every 3 weeks',
        renal: 'No adjustment needed',
        hepatic: 'Reduce dose based on bilirubin level'
      },
      monitoring: ['Echocardiogram', 'CBC', 'Liver function', 'Mucositis assessment'],
      fdaApproved: true,
      oncologyDrug: true
    }
  ]);

  useEffect(() => {
    loadCategoryStats();
  }, []);

  const loadCategoryStats = () => {
    const stats: DrugCategoryStats[] = [
      { category: 'Immunotherapy', count: 45, trending: true, newAdditions: 8 },
      { category: 'Targeted Therapy', count: 123, trending: true, newAdditions: 15 },
      { category: 'Alkylating Agent', count: 34, trending: false, newAdditions: 2 },
      { category: 'Antimetabolite', count: 28, trending: false, newAdditions: 1 },
      { category: 'Anthracycline', count: 12, trending: false, newAdditions: 0 },
      { category: 'Hormone Therapy', count: 56, trending: false, newAdditions: 3 }
    ];
    setCategoryStats(stats);
  };

  const handleSearch = (query: string, filters?: SearchFilter) => {
    setLoading(true);
    
    // Simulate search delay
    setTimeout(() => {
      let results = drugDatabase;
      
      if (query) {
        const searchTerm = query.toLowerCase();
        results = results.filter(drug =>
          drug.name.toLowerCase().includes(searchTerm) ||
          drug.genericName.toLowerCase().includes(searchTerm) ||
          drug.category.toLowerCase().includes(searchTerm) ||
          drug.mechanism.toLowerCase().includes(searchTerm) ||
          drug.indications?.some(indication => indication.toLowerCase().includes(searchTerm))
        );
      }
      
      if (filters) {
        if (filters.category) {
          results = results.filter(drug => 
            drug.category.toLowerCase().includes(filters.category!.toLowerCase())
          );
        }
        if (filters.isOncology) {
          results = results.filter(drug => drug.oncologyDrug === true);
        }
        if (filters.fdaApproved) {
          results = results.filter(drug => drug.fdaApproved === true);
        }
      }
      
      setSearchResults(results);
      setLoading(false);
    }, 500);
  };

  const handleDrugSelect = (drug: Drug) => {
    setSelectedDrug(drug);
    setViewMode('grid');
  };

  const addToComparison = (drug: Drug) => {
    if (comparisonDrugs.length < 4 && !comparisonDrugs.find(d => d.rxcui === drug.rxcui)) {
      setComparisonDrugs(prev => [...prev, drug]);
    }
  };

  const removeFromComparison = (rxcui: string) => {
    setComparisonDrugs(prev => prev.filter(drug => drug.rxcui !== rxcui));
  };

  const ViewModeButtons = () => (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setViewMode('grid')}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          viewMode === 'grid'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Grid className="w-4 h-4" />
      </button>
      <button
        onClick={() => setViewMode('list')}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          viewMode === 'list'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => setViewMode('comparison')}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
          viewMode === 'comparison'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <BarChart3 className="w-4 h-4" />
        {comparisonDrugs.length > 0 && (
          <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {comparisonDrugs.length}
          </span>
        )}
      </button>
    </div>
  );

  const DrugCard = ({ drug }: { drug: Drug }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-gray-900">{drug.name}</h3>
          <p className="text-sm text-gray-600">{drug.genericName}</p>
          <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
            {drug.category}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {drug.fdaApproved && (
            <CheckCircle className="w-4 h-4 text-green-500" title="FDA Approved" />
          )}
          <button
            onClick={() => addToComparison(drug)}
            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
            disabled={comparisonDrugs.length >= 4}
            title="Add to comparison"
          >
            <GitCompare className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{drug.mechanism}</p>
      
      <div className="space-y-2">
        <div>
          <span className="text-xs font-medium text-gray-700">Indications:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {drug.indications?.slice(0, 3).map((indication, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {indication}
              </span>
            ))}
            {drug.indications && drug.indications.length > 3 && (
              <span className="text-xs text-gray-500">+{drug.indications.length - 3} more</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {drug.sideEffects?.length || 0} side effects
          </div>
          <button
            onClick={() => handleDrugSelect(drug)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
          >
            <Eye className="w-3 h-3" />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </div>
  );

  const DrugListItem = ({ drug }: { drug: Drug }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900 truncate">{drug.name}</h3>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  {drug.category}
                </span>
                {drug.fdaApproved && (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">{drug.mechanism}</p>
              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                <span>{drug.indications?.length || 0} indications</span>
                <span>{drug.sideEffects?.length || 0} side effects</span>
                <span>{drug.contraindications?.length || 0} contraindications</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => addToComparison(drug)}
            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
            disabled={comparisonDrugs.length >= 4}
            title="Add to comparison"
          >
            <GitCompare className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDrugSelect(drug)}
            className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Database className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Drug Information Database</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Comprehensive drug information with advanced search, detailed profiles, and comparison tools.
        </p>
      </div>

      {/* Category Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categoryStats.map((stat) => (
          <div key={stat.category} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-gray-900">{stat.count}</span>
              {stat.trending && <TrendingUp className="w-4 h-4 text-green-500" />}
            </div>
            <div className="text-sm text-gray-600 mb-1">{stat.category}</div>
            {stat.newAdditions > 0 && (
              <div className="text-xs text-blue-600">+{stat.newAdditions} new</div>
            )}
          </div>
        ))}
      </div>

      {/* Search Interface */}
      <SearchWithFavorites
        onSearch={handleSearch}
        placeholder="Search drugs by name, category, indication, or mechanism..."
        showFilters={true}
        className="w-full"
      />

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {searchResults.length > 0 ? `Search Results (${searchResults.length})` : 'Featured Drugs'}
          </h2>
          {comparisonDrugs.length > 0 && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <GitCompare className="w-4 h-4" />
              <span>{comparisonDrugs.length} drugs selected for comparison</span>
            </div>
          )}
        </div>
        
        <ViewModeButtons />
      </div>

      {/* Content Area */}
      {viewMode === 'comparison' ? (
        <DrugComparisonTool
          initialDrugs={comparisonDrugs}
          onAddDrug={addToComparison}
        />
      ) : selectedDrug ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedDrug(null)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <span>←</span>
            <span>Back to Search Results</span>
          </button>
          
          <EnhancedDrugInfo drug={selectedDrug} />
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
            }`}>
              {(searchResults.length > 0 ? searchResults : drugDatabase).map((drug) => 
                viewMode === 'grid' ? (
                  <DrugCard key={drug.rxcui} drug={drug} />
                ) : (
                  <DrugListItem key={drug.rxcui} drug={drug} />
                )
              )}
            </div>
          )}
          
          {!loading && searchResults.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DrugDatabase;
