import React, { useState } from 'react';
import { GenomicAnalysis } from '../../types';
import { drugService } from '../../services/api';
import Card from '../UI/Card';
import Alert from '../UI/Alert';
import Tooltip from '../UI/Tooltip';
import EnhancedDrugSearchBar from '../DrugSearch/EnhancedDrugSearchBar';
import { Search, Dna, AlertTriangle, Info } from 'lucide-react';

interface DrugGenomicsAnalysisProps {
  analysis: GenomicAnalysis | null;
  onAnalyze: (rxcui: string) => void;
}

const DrugGenomicsAnalysis: React.FC<DrugGenomicsAnalysisProps> = ({ analysis, onAnalyze }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleDrugSearch = async (query: string) => {
    setSearchLoading(true);
    setSearchError(null);

    try {
      const results = await drugService.searchDrugs(query);
      
      if (results.count > 0) {
        // Use the first result for analysis
        const firstDrug = results.results[0];
        onAnalyze(firstDrug.rxcui);
      } else {
        setSearchError(`No drugs found matching "${query}"`);
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Failed to search drugs');
    } finally {
      setSearchLoading(false);
    }
  };

  const getEvidenceColor = (level?: string) => {
    if (!level) return 'bg-gray-100 text-gray-700';
    
    switch (level.toUpperCase()) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRecommendationSeverity = (recommendation: string) => {
    const lowerRec = recommendation.toLowerCase();
    
    if (lowerRec.includes('avoid') || lowerRec.includes('contraindicated')) {
      return 'error';
    } else if (lowerRec.includes('reduce') || lowerRec.includes('decrease') || lowerRec.includes('alternative')) {
      return 'warning';
    } else if (lowerRec.includes('monitor') || lowerRec.includes('consider')) {
      return 'info';
    } else {
      return 'success';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-green-600" />;
    }
  };

  const getSeverityBorder = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'info':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-green-500 bg-green-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <div className="space-y-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Search Drug for Genomic Analysis
              </label>
              <Tooltip content="Search for medications to view their pharmacogenomic profile including gene-drug interactions, dosing recommendations, and clinical guidelines">
                <Info className="w-3 h-3 text-gray-400" />
              </Tooltip>
            </div>
            <EnhancedDrugSearchBar
              onDrugSelect={(drug) => onAnalyze(drug.rxcui)}
              placeholder="Search for a drug to analyze (e.g., clopidogrel, fluorouracil)..."
              showTooltips={false}
              className="w-full"
            />
          </div>
          
          {searchError && (
            <Alert type="error">
              {searchError}
            </Alert>
          )}
        </div>
      </Card>

      {/* Analysis Results */}
      {analysis === null ? (
        <div className="text-center py-12">
          <Dna className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">Drug Genomics Analysis</p>
          <p className="text-sm text-gray-400">Search for a drug to view its pharmacogenomic profile</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Drug Summary */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{analysis.drugName}</h3>
                <p className="text-sm text-gray-600">RXCUI: {analysis.rxcui}</p>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  <p>{analysis.geneCount} genes involved</p>
                  <p>{analysis.interactionCount} genomic interactions</p>
                </div>
              </div>
            </div>

            {/* Genes Overview */}
            {analysis.genes.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-medium text-gray-900">Associated Genes</h4>
                  <Tooltip content="Pharmacogenes that influence this drug's metabolism, efficacy, or safety. Genetic variants in these genes may affect patient response">
                    <Info className="w-3 h-3 text-gray-400" />
                  </Tooltip>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.genes.map((gene, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                    >
                      {gene}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Genomic Recommendations */}
          {analysis.recommendations.length === 0 ? (
            <Alert type="info" title="No Genomic Interactions Found">
              No specific pharmacogenomic guidelines were found for this drug in our database. 
              This doesn't necessarily mean the drug has no genetic associations - consult current literature and clinical guidelines.
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900">Genomic Recommendations</h3>
                <Tooltip content="Evidence-based clinical guidelines for gene-drug interactions from CPIC, FDA, and other authoritative sources. Includes dosing adjustments and therapeutic alternatives">
                  <Info className="w-4 h-4 text-gray-400" />
                </Tooltip>
              </div>
              
              {analysis.recommendations.map((rec, index) => {
                const severity = getRecommendationSeverity(rec.recommendation);
                
                return (
                  <Card 
                    key={index} 
                    className={`border-l-4 ${getSeverityBorder(severity)}`}
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {getSeverityIcon(severity)}
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{rec.gene}</h4>
                            {rec.geneName && (
                              <p className="text-sm text-gray-600">{rec.geneName}</p>
                            )}
                          </div>
                        </div>
                        
                        {rec.evidenceLevel && (
                          <Tooltip content={`CPIC Evidence Level ${rec.evidenceLevel}: ${rec.evidenceLevel === 'A' ? 'Strong evidence from high-quality studies' : rec.evidenceLevel === 'B' ? 'Moderate evidence from good studies' : rec.evidenceLevel === 'C' ? 'Weak evidence or expert opinion' : 'Insufficient evidence'}`}>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-help ${getEvidenceColor(rec.evidenceLevel)}`}>
                              Evidence Level {rec.evidenceLevel}
                            </span>
                          </Tooltip>
                        )}
                      </div>

                      {/* Gene Function */}
                      {rec.geneFunction && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h5 className="font-medium text-gray-900 mb-1">Gene Function</h5>
                          <p className="text-sm text-gray-700">{rec.geneFunction}</p>
                        </div>
                      )}

                      {/* Phenotype */}
                      {rec.phenotype && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">Phenotype</h5>
                          <p className="text-sm text-gray-700">{rec.phenotype}</p>
                        </div>
                      )}

                      {/* Recommendation */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h5 className="font-medium text-gray-900 mb-1">Clinical Recommendation</h5>
                        <p className="text-sm text-gray-700">{rec.recommendation}</p>
                      </div>

                      {/* Clinical Implications */}
                      {rec.implications && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">Clinical Implications</h5>
                          <p className="text-sm text-gray-700">{rec.implications}</p>
                        </div>
                      )}

                      {/* Dosage Adjustment */}
                      {rec.dosageAdjustment && (
                        <div className="bg-yellow-50 rounded-lg p-3">
                          <h5 className="font-medium text-gray-900 mb-1">Dosage Adjustment</h5>
                          <p className="text-sm text-gray-700">{rec.dosageAdjustment}</p>
                        </div>
                      )}

                      {/* Sources */}
                      {rec.sources && rec.sources.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Sources</h5>
                          <div className="flex flex-wrap gap-2">
                            {rec.sources.map((source, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                              >
                                {source}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Clinical Note */}
          <Alert type="warning" title="Clinical Consideration">
            These genomic recommendations are based on current evidence and guidelines. Genetic testing may be required to determine patient-specific phenotypes. Always consult with a healthcare provider and consider individual patient factors when making therapeutic decisions.
          </Alert>
        </div>
      )}
    </div>
  );
};

export default DrugGenomicsAnalysis;
