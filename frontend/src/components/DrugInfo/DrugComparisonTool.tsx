import React, { useState, useEffect } from 'react';
import { Drug } from '../../types';
import { 
  Plus, 
  X, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  Shield,
  Target,
  Zap,
  Users,
  Star
} from 'lucide-react';

interface DrugComparisonToolProps {
  initialDrugs?: Drug[];
  onAddDrug?: (drug: Drug) => void;
  className?: string;
}

interface ComparisonMetric {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  getValue: (drug: Drug) => string | number | React.ReactNode;
  compare?: (a: Drug, b: Drug) => number; // -1: a < b, 0: equal, 1: a > b
  format?: 'text' | 'number' | 'percentage' | 'currency' | 'boolean' | 'severity';
}

interface DrugComparison extends Drug {
  comparisonScore?: number;
  strengths?: string[];
  weaknesses?: string[];
  clinicalNotes?: string[];
}

const DrugComparisonTool: React.FC<DrugComparisonToolProps> = ({
  initialDrugs = [],
  onAddDrug,
  className = ''
}) => {
  const [selectedDrugs, setSelectedDrugs] = useState<DrugComparison[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDrug, setShowAddDrug] = useState(false);
  const [availableDrugs] = useState<Drug[]>([
    // Mock available drugs for comparison
    {
      id: '1',
      rxcui: '1001',
      name: 'Carboplatin',
      genericName: 'carboplatin',
      brandNames: ['Paraplatin'],
      category: 'Alkylating Agent',
      mechanism: 'DNA crosslinking',
      indications: ['Ovarian cancer', 'Lung cancer'],
      contraindications: ['Severe bone marrow depression'],
      sideEffects: ['Myelosuppression', 'Nephrotoxicity'],
      interactions: [],
      dosing: {
        standard: 'AUC 5-6 mg/mL*min IV',
        renal: 'Adjust based on CrCl',
        hepatic: 'No adjustment needed'
      },
      monitoring: ['CBC', 'Renal function'],
      fdaApproved: true,
      oncologyDrug: true
    },
    {
      id: '2',
      rxcui: '1002',
      name: 'Cisplatin',
      genericName: 'cisplatin',
      brandNames: ['Platinol'],
      category: 'Alkylating Agent',
      mechanism: 'DNA crosslinking',
      indications: ['Testicular cancer', 'Ovarian cancer', 'Bladder cancer'],
      contraindications: ['Renal impairment', 'Hearing impairment'],
      sideEffects: ['Nephrotoxicity', 'Ototoxicity', 'Neuropathy'],
      interactions: [],
      dosing: {
        standard: '20 mg/m² IV daily × 5 days',
        renal: 'Contraindicated if CrCl < 60',
        hepatic: 'No adjustment needed'
      },
      monitoring: ['Renal function', 'Hearing tests', 'Neurologic exam'],
      fdaApproved: true,
      oncologyDrug: true
    }
  ]);

  useEffect(() => {
    if (initialDrugs.length > 0) {
      setSelectedDrugs(initialDrugs.map(drug => enhanceDrugForComparison(drug)));
    }
  }, [initialDrugs]);

  const enhanceDrugForComparison = (drug: Drug): DrugComparison => {
    // Add comparison-specific enhancements
    const enhanced: DrugComparison = {
      ...drug,
      comparisonScore: calculateComparisonScore(drug),
      strengths: generateStrengths(drug),
      weaknesses: generateWeaknesses(drug),
      clinicalNotes: generateClinicalNotes(drug)
    };
    
    return enhanced;
  };

  const calculateComparisonScore = (drug: Drug): number => {
    // Mock scoring algorithm based on various factors
    let score = 50; // Base score
    
    if (drug.fdaApproved) score += 20;
    if (drug.oncologyDrug) score += 15;
    if (drug.sideEffects && drug.sideEffects.length < 5) score += 10;
    if (drug.contraindications && drug.contraindications.length < 3) score += 5;
    
    return Math.min(100, Math.max(0, score));
  };

  const generateStrengths = (drug: Drug): string[] => {
    const strengths: string[] = [];
    
    if (drug.fdaApproved) strengths.push('FDA approved with established safety profile');
    if (drug.oncologyDrug) strengths.push('Specifically designed for oncology indications');
    if (drug.sideEffects && drug.sideEffects.length < 5) strengths.push('Favorable side effect profile');
    if (drug.indications && drug.indications.length > 3) strengths.push('Broad spectrum of indications');
    
    return strengths;
  };

  const generateWeaknesses = (drug: Drug): string[] => {
    const weaknesses: string[] = [];
    
    if (drug.contraindications && drug.contraindications.length > 2) {
      weaknesses.push('Multiple contraindications limit patient eligibility');
    }
    if (drug.sideEffects && drug.sideEffects.length > 5) {
      weaknesses.push('Extensive side effect profile requires careful monitoring');
    }
    if (drug.monitoring && drug.monitoring.length > 4) {
      weaknesses.push('Intensive monitoring requirements');
    }
    
    return weaknesses;
  };

  const generateClinicalNotes = (drug: Drug): string[] => {
    const notes: string[] = [];
    
    if (drug.category?.includes('Alkylating')) {
      notes.push('Consider premedication for hypersensitivity reactions');
    }
    if (drug.sideEffects?.includes('Nephrotoxicity')) {
      notes.push('Ensure adequate hydration and monitor renal function closely');
    }
    if (drug.sideEffects?.includes('Myelosuppression')) {
      notes.push('Monitor CBC regularly and adjust dose for hematologic toxicity');
    }
    
    return notes;
  };

  const comparisonMetrics: ComparisonMetric[] = [
    {
      id: 'name',
      label: 'Drug Name',
      icon: Target,
      getValue: (drug) => (
        <div>
          <div className="font-medium">{drug.name}</div>
          <div className="text-sm text-gray-500">{drug.genericName}</div>
        </div>
      )
    },
    {
      id: 'category',
      label: 'Category',
      icon: Zap,
      getValue: (drug) => drug.category || 'Not specified'
    },
    {
      id: 'mechanism',
      label: 'Mechanism',
      icon: Activity,
      getValue: (drug) => drug.mechanism || 'Not specified'
    },
    {
      id: 'indications',
      label: 'Indications',
      icon: Users,
      getValue: (drug) => (
        <div className="space-y-1">
          {drug.indications?.slice(0, 3).map((indication, index) => (
            <div key={index} className="text-sm">• {indication}</div>
          ))}
          {drug.indications && drug.indications.length > 3 && (
            <div className="text-xs text-gray-500">
              +{drug.indications.length - 3} more
            </div>
          )}
        </div>
      )
    },
    {
      id: 'sideEffects',
      label: 'Side Effects',
      icon: AlertTriangle,
      getValue: (drug) => (
        <div>
          <div className="text-sm font-medium mb-1">
            {drug.sideEffects?.length || 0} reported
          </div>
          <div className="space-y-1">
            {drug.sideEffects?.slice(0, 3).map((effect, index) => (
              <div key={index} className="text-xs text-gray-600">• {effect}</div>
            ))}
          </div>
        </div>
      ),
      compare: (a, b) => (a.sideEffects?.length || 0) - (b.sideEffects?.length || 0)
    },
    {
      id: 'contraindications',
      label: 'Contraindications',
      icon: Shield,
      getValue: (drug) => (
        <div>
          <div className="text-sm font-medium mb-1">
            {drug.contraindications?.length || 0} listed
          </div>
          <div className="space-y-1">
            {drug.contraindications?.slice(0, 2).map((contraindication, index) => (
              <div key={index} className="text-xs text-gray-600">• {contraindication}</div>
            ))}
          </div>
        </div>
      ),
      compare: (a, b) => (a.contraindications?.length || 0) - (b.contraindications?.length || 0)
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      icon: Clock,
      getValue: (drug) => (
        <div className="space-y-1">
          {drug.monitoring?.slice(0, 3).map((monitor, index) => (
            <div key={index} className="text-sm">• {monitor}</div>
          ))}
        </div>
      )
    },
    {
      id: 'fdaStatus',
      label: 'FDA Status',
      icon: CheckCircle,
      getValue: (drug) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          drug.fdaApproved 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {drug.fdaApproved ? 'Approved' : 'Investigational'}
        </span>
      )
    },
    {
      id: 'comparisonScore',
      label: 'Overall Score',
      icon: Star,
      getValue: (drug) => {
        const comparison = drug as DrugComparison;
        const score = comparison.comparisonScore || 0;
        return (
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{score}</div>
            <div className="text-xs text-gray-500">/ 100</div>
          </div>
        );
      },
      compare: (a, b) => ((b as DrugComparison).comparisonScore || 0) - ((a as DrugComparison).comparisonScore || 0)
    }
  ];

  const addDrug = (drug: Drug) => {
    if (selectedDrugs.length < 4 && !selectedDrugs.find(d => d.rxcui === drug.rxcui)) {
      const enhanced = enhanceDrugForComparison(drug);
      setSelectedDrugs(prev => [...prev, enhanced]);
      setShowAddDrug(false);
      setSearchQuery('');
      onAddDrug?.(drug);
    }
  };

  const removeDrug = (rxcui: string) => {
    setSelectedDrugs(prev => prev.filter(drug => drug.rxcui !== rxcui));
  };

  const filteredAvailableDrugs = availableDrugs.filter(drug =>
    drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    drug.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    drug.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getComparisonIndicator = (metric: ComparisonMetric, drugIndex: number) => {
    if (!metric.compare || selectedDrugs.length < 2) return null;

    const currentDrug = selectedDrugs[drugIndex];
    const bestDrug = selectedDrugs.reduce((best, drug) => 
      metric.compare!(drug, best) > 0 ? drug : best
    );
    const worstDrug = selectedDrugs.reduce((worst, drug) => 
      metric.compare!(drug, worst) < 0 ? drug : worst
    );

    if (currentDrug.rxcui === bestDrug.rxcui && currentDrug.rxcui !== worstDrug.rxcui) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (currentDrug.rxcui === worstDrug.rxcui && currentDrug.rxcui !== bestDrug.rxcui) {
      return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
    }
    return null;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Drug Comparison</h2>
              <p className="text-sm text-gray-600">
                Compare up to 4 drugs side by side
              </p>
            </div>
          </div>
          
          {selectedDrugs.length < 4 && (
            <button
              onClick={() => setShowAddDrug(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Drug</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Drug Modal */}
      {showAddDrug && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Add Drug to Comparison</h3>
                <button
                  onClick={() => setShowAddDrug(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for drugs..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              
              <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
                {filteredAvailableDrugs
                  .filter(drug => !selectedDrugs.find(d => d.rxcui === drug.rxcui))
                  .map((drug) => (
                    <button
                      key={drug.rxcui}
                      onClick={() => addDrug(drug)}
                      className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium">{drug.name}</div>
                      <div className="text-sm text-gray-600">{drug.category}</div>
                    </button>
                  ))}
                  
                {filteredAvailableDrugs.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No drugs found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {selectedDrugs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 font-medium text-gray-700 w-32">
                  Metric
                </th>
                {selectedDrugs.map((drug) => (
                  <th key={drug.rxcui} className="text-left p-4 min-w-64">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{drug.name}</div>
                        <div className="text-sm text-gray-500">{drug.genericName}</div>
                      </div>
                      <button
                        onClick={() => removeDrug(drug.rxcui)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {comparisonMetrics.map((metric) => {
                const Icon = metric.icon;
                
                return (
                  <tr key={metric.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">{metric.label}</span>
                      </div>
                    </td>
                    
                    {selectedDrugs.map((drug, index) => (
                      <td key={drug.rxcui} className="p-4 align-top">
                        <div className="flex items-start space-x-2">
                          <div className="flex-1">
                            {metric.getValue(drug)}
                          </div>
                          {getComparisonIndicator(metric, index)}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No drugs selected</h3>
          <p className="text-gray-600 mb-4">
            Add drugs to compare their features, efficacy, and safety profiles side by side.
          </p>
          <button
            onClick={() => setShowAddDrug(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Drug
          </button>
        </div>
      )}

      {/* Summary Insights */}
      {selectedDrugs.length > 1 && (
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Comparison Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedDrugs.map((drug) => (
              <div key={drug.rxcui} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{drug.name}</h4>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{drug.comparisonScore}/100</span>
                  </div>
                </div>
                
                {drug.strengths && drug.strengths.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-green-800 mb-1">Strengths:</h5>
                    <ul className="text-sm text-green-700 space-y-1">
                      {drug.strengths.slice(0, 2).map((strength, index) => (
                        <li key={index} className="flex items-start space-x-1">
                          <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {drug.weaknesses && drug.weaknesses.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-orange-800 mb-1">Considerations:</h5>
                    <ul className="text-sm text-orange-700 space-y-1">
                      {drug.weaknesses.slice(0, 2).map((weakness, index) => (
                        <li key={index} className="flex items-start space-x-1">
                          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DrugComparisonTool;
