import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Check, Search } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
  description?: string;
  count?: number;
  category?: string;
  popular?: boolean;
}

interface FilterAutocompleteProps {
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  maxSelection?: number;
  searchable?: boolean;
  showCounts?: boolean;
  className?: string;
}

// Comprehensive filter options for each category
const THERAPEUTIC_CLASS_OPTIONS: FilterOption[] = [
  { value: 'antineoplastic', label: 'Antineoplastic Agents', description: 'Drugs that inhibit or prevent cancer growth', count: 1247, popular: true },
  { value: 'immunotherapy', label: 'Immunotherapy', description: 'Treatments that use the immune system', count: 324, popular: true },
  { value: 'targeted_therapy', label: 'Targeted Therapy', description: 'Drugs targeting specific cancer mechanisms', count: 456, popular: true },
  { value: 'chemotherapy', label: 'Chemotherapy', description: 'Traditional cytotoxic agents', count: 892, popular: true },
  { value: 'hormone_therapy', label: 'Hormone Therapy', description: 'Treatments that block hormones', count: 156 },
  { value: 'supportive_care', label: 'Supportive Care', description: 'Drugs for managing side effects', count: 234 },
  { value: 'pain_management', label: 'Pain Management', description: 'Analgesics and pain control', count: 187 },
  { value: 'antiemetic', label: 'Antiemetic', description: 'Anti-nausea medications', count: 89 },
  { value: 'growth_factor', label: 'Growth Factor', description: 'Stimulate blood cell production', count: 67 },
  { value: 'bisphosphonate', label: 'Bisphosphonate', description: 'Bone strengthening agents', count: 45 },
  { value: 'radioprotective', label: 'Radioprotective', description: 'Protect from radiation damage', count: 23 },
  { value: 'differentiation_agent', label: 'Differentiation Agent', description: 'Promote cell maturation', count: 34 }
];

const MECHANISM_OPTIONS: FilterOption[] = [
  { value: 'kinase_inhibitor', label: 'Kinase Inhibitor', description: 'Blocks protein kinase enzymes', count: 234, popular: true },
  { value: 'monoclonal_antibody', label: 'Monoclonal Antibody', description: 'Engineered antibodies', count: 187, popular: true },
  { value: 'checkpoint_inhibitor', label: 'Checkpoint Inhibitor', description: 'Immune checkpoint blockade', count: 45, popular: true },
  { value: 'alkylating_agent', label: 'Alkylating Agent', description: 'DNA crosslinking compounds', count: 156 },
  { value: 'antimetabolite', label: 'Antimetabolite', description: 'Interferes with DNA/RNA synthesis', count: 123 },
  { value: 'topoisomerase_inhibitor', label: 'Topoisomerase Inhibitor', description: 'Prevents DNA unwinding', count: 98 },
  { value: 'proteasome_inhibitor', label: 'Proteasome Inhibitor', description: 'Blocks protein degradation', count: 34 },
  { value: 'angiogenesis_inhibitor', label: 'Angiogenesis Inhibitor', description: 'Prevents blood vessel formation', count: 67 },
  { value: 'histone_deacetylase_inhibitor', label: 'HDAC Inhibitor', description: 'Epigenetic modifier', count: 29 },
  { value: 'mtor_inhibitor', label: 'mTOR Inhibitor', description: 'Blocks mTOR pathway', count: 23 },
  { value: 'cyclin_dependent_kinase_inhibitor', label: 'CDK Inhibitor', description: 'Cell cycle inhibitor', count: 18 },
  { value: 'poly_adp_ribose_polymerase_inhibitor', label: 'PARP Inhibitor', description: 'DNA repair inhibitor', count: 12 }
];

const INDICATION_OPTIONS: FilterOption[] = [
  { value: 'breast_cancer', label: 'Breast Cancer', description: 'Malignant breast tumors', count: 456, popular: true },
  { value: 'lung_cancer', label: 'Lung Cancer', description: 'Non-small cell and small cell', count: 423, popular: true },
  { value: 'colorectal_cancer', label: 'Colorectal Cancer', description: 'Colon and rectal cancers', count: 234, popular: true },
  { value: 'melanoma', label: 'Melanoma', description: 'Malignant skin cancer', count: 156, popular: true },
  { value: 'leukemia', label: 'Leukemia', description: 'Blood cancer varieties', count: 189 },
  { value: 'lymphoma', label: 'Lymphoma', description: 'Lymphatic system cancers', count: 167 },
  { value: 'prostate_cancer', label: 'Prostate Cancer', description: 'Male reproductive cancer', count: 145 },
  { value: 'ovarian_cancer', label: 'Ovarian Cancer', description: 'Female reproductive cancer', count: 123 },
  { value: 'pancreatic_cancer', label: 'Pancreatic Cancer', description: 'Digestive system cancer', count: 98 },
  { value: 'renal_cell_carcinoma', label: 'Renal Cell Carcinoma', description: 'Kidney cancer', count: 87 },
  { value: 'hepatocellular_carcinoma', label: 'Hepatocellular Carcinoma', description: 'Liver cancer', count: 76 },
  { value: 'glioblastoma', label: 'Glioblastoma', description: 'Aggressive brain tumor', count: 65 },
  { value: 'sarcoma', label: 'Sarcoma', description: 'Connective tissue cancer', count: 54 },
  { value: 'multiple_myeloma', label: 'Multiple Myeloma', description: 'Plasma cell cancer', count: 43 },
  { value: 'bladder_cancer', label: 'Bladder Cancer', description: 'Urinary system cancer', count: 32 }
];

const BIOMARKER_OPTIONS: FilterOption[] = [
  { value: 'her2_positive', label: 'HER2 Positive', description: 'HER2 protein overexpression', count: 234, popular: true },
  { value: 'er_pr_positive', label: 'ER/PR Positive', description: 'Hormone receptor positive', count: 198, popular: true },
  { value: 'triple_negative', label: 'Triple Negative', description: 'ER-, PR-, HER2- breast cancer', count: 123, popular: true },
  { value: 'egfr_mutation', label: 'EGFR Mutation', description: 'EGFR gene alterations', count: 187, popular: true },
  { value: 'kras_mutation', label: 'KRAS Mutation', description: 'KRAS oncogene mutations', count: 156 },
  { value: 'brca_mutation', label: 'BRCA Mutation', description: 'BRCA1/2 gene mutations', count: 89 },
  { value: 'pd_l1_positive', label: 'PD-L1 Positive', description: 'PD-L1 expression ≥1%', count: 167 },
  { value: 'msi_high', label: 'MSI-High', description: 'Microsatellite instability', count: 78 },
  { value: 'tmb_high', label: 'TMB-High', description: 'High tumor mutation burden', count: 67 },
  { value: 'braf_mutation', label: 'BRAF Mutation', description: 'BRAF V600E mutations', count: 98 },
  { value: 'alk_fusion', label: 'ALK Fusion', description: 'ALK gene rearrangements', count: 45 },
  { value: 'ros1_fusion', label: 'ROS1 Fusion', description: 'ROS1 gene fusions', count: 23 },
  { value: 'ntrk_fusion', label: 'NTRK Fusion', description: 'NTRK gene fusions', count: 18 },
  { value: 'ret_fusion', label: 'RET Fusion', description: 'RET gene rearrangements', count: 34 },
  { value: 'met_amplification', label: 'MET Amplification', description: 'MET gene amplification', count: 29 }
];

const APPROVAL_STATUS_OPTIONS: FilterOption[] = [
  { value: 'fda_approved', label: 'FDA Approved', description: 'Full FDA approval', count: 1456, popular: true },
  { value: 'accelerated_approval', label: 'Accelerated Approval', description: 'FDA accelerated pathway', count: 89 },
  { value: 'breakthrough_therapy', label: 'Breakthrough Therapy', description: 'FDA breakthrough designation', count: 67 },
  { value: 'fast_track', label: 'Fast Track', description: 'FDA fast track status', count: 123 },
  { value: 'orphan_drug', label: 'Orphan Drug', description: 'Rare disease designation', count: 234 },
  { value: 'priority_review', label: 'Priority Review', description: 'Expedited FDA review', count: 156 },
  { value: 'ema_approved', label: 'EMA Approved', description: 'European approval', count: 1234 },
  { value: 'conditional_approval', label: 'Conditional Approval', description: 'Conditional marketing authorization', count: 45 },
  { value: 'investigational', label: 'Investigational', description: 'In clinical trials', count: 567 }
];

const CLINICAL_TRIAL_PHASE_OPTIONS: FilterOption[] = [
  { value: 'approved', label: 'FDA Approved', description: 'Marketed drugs', count: 1456, popular: true },
  { value: 'phase_4', label: 'Phase IV', description: 'Post-marketing surveillance', count: 234 },
  { value: 'phase_3', label: 'Phase III', description: 'Large-scale efficacy trials', count: 345, popular: true },
  { value: 'phase_2', label: 'Phase II', description: 'Dose-finding and efficacy', count: 567 },
  { value: 'phase_1', label: 'Phase I', description: 'First-in-human safety', count: 789 },
  { value: 'phase_1_2', label: 'Phase I/II', description: 'Combined early phases', count: 123 },
  { value: 'phase_2_3', label: 'Phase II/III', description: 'Combined late phases', count: 89 },
  { value: 'investigational', label: 'Investigational', description: 'All trial phases', count: 1234 }
];

const FilterAutocomplete: React.FC<FilterAutocompleteProps> = ({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select options...",
  label,
  maxSelection,
  searchable = true,
  showCounts = true,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchTerm.trim()) {
      // Show popular options first when no search
      const sorted = [...options].sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return (b.count || 0) - (a.count || 0);
      });
      setFilteredOptions(sorted);
    } else {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionToggle = (value: string) => {
    const isSelected = selectedValues.includes(value);
    let newValues: string[];

    if (isSelected) {
      newValues = selectedValues.filter(v => v !== value);
    } else {
      if (maxSelection && selectedValues.length >= maxSelection) {
        return; // Don't add if max selection reached
      }
      newValues = [...selectedValues, value];
    }

    onSelectionChange(newValues);
  };

  const removeValue = (value: string) => {
    onSelectionChange(selectedValues.filter(v => v !== value));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const getSelectedLabels = () => {
    return selectedValues.map(value => {
      const option = options.find(opt => opt.value === value);
      return option?.label || value;
    });
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      {/* Selected Values Display */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedValues.map(value => {
            const option = options.find(opt => opt.value === value);
            return (
              <span
                key={value}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-violet-100 text-violet-800"
              >
                {option?.label || value}
                <button
                  onClick={() => removeValue(value)}
                  className="ml-1 text-violet-600 hover:text-violet-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          {selectedValues.length > 1 && (
            <button
              onClick={clearAll}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
      >
        <span className={`text-sm ${selectedValues.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
          {selectedValues.length === 0 
            ? placeholder 
            : `${selectedValues.length} selected`
          }
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          {searchable && (
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search options..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleOptionToggle(option.value)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50"
                  disabled={maxSelection && selectedValues.length >= maxSelection && !selectedValues.includes(option.value)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        selectedValues.includes(option.value) ? 'text-violet-700' : 'text-gray-900'
                      }`}>
                        {option.label}
                      </span>
                      {option.popular && (
                        <span className="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    {option.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {option.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-2">
                    {showCounts && option.count && (
                      <span className="text-xs text-gray-400">
                        {option.count}
                      </span>
                    )}
                    {selectedValues.includes(option.value) && (
                      <Check className="h-4 w-4 text-violet-600" />
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-gray-500">
                <Search className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No options found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredOptions.length > 0 && (
            <div className="px-3 py-2 bg-gray-50 border-t text-xs text-gray-500 text-center">
              {selectedValues.length > 0 && (
                <span>{selectedValues.length} selected • </span>
              )}
              {filteredOptions.length} option{filteredOptions.length !== 1 ? 's' : ''}
              {maxSelection && (
                <span> • Max {maxSelection}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterAutocomplete;
export {
  THERAPEUTIC_CLASS_OPTIONS,
  MECHANISM_OPTIONS,
  INDICATION_OPTIONS,
  BIOMARKER_OPTIONS,
  APPROVAL_STATUS_OPTIONS,
  CLINICAL_TRIAL_PHASE_OPTIONS
};