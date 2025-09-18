import React, { useState } from 'react';
import { CpicGuidelinesResult, CpicGuideline } from '../../types';
import Card from '../UI/Card';
import Alert from '../UI/Alert';
import Tooltip from '../UI/Tooltip';
import { Search, BookOpen, ExternalLink, Info } from 'lucide-react';

interface CpicGuidelinesProps {
  guidelines: CpicGuidelinesResult | null;
  onSearch: (gene?: string, drug?: string) => void;
}

const CpicGuidelines: React.FC<CpicGuidelinesProps> = ({ guidelines, onSearch }) => {
  const [geneQuery, setGeneQuery] = useState('');
  const [drugQuery, setDrugQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(
      geneQuery.trim() || undefined,
      drugQuery.trim() || undefined
    );
  };

  const handleLoadAll = () => {
    setGeneQuery('');
    setDrugQuery('');
    onSearch();
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

  const getEvidenceDescription = (level?: string) => {
    if (!level) return 'Unknown evidence level';
    
    switch (level.toUpperCase()) {
      case 'A':
        return 'Strong evidence for prescribing recommendation';
      case 'B':
        return 'Moderate evidence for prescribing recommendation';
      case 'C':
        return 'Optional prescribing recommendation';
      case 'D':
        return 'Insufficient evidence';
      default:
        return 'Unknown evidence level';
    }
  };

  const renderGuidelineCard = (guideline: CpicGuideline, index: number) => (
    <Card key={index} className="hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {guideline.gene} - {guideline.drug}
            </h3>
            {guideline.geneName && (
              <p className="text-sm text-gray-600 mt-1">{guideline.geneName}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {guideline.evidenceLevel && (
              <Tooltip content={getEvidenceDescription(guideline.evidenceLevel)}>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-help ${getEvidenceColor(guideline.evidenceLevel)}`}>
                  Level {guideline.evidenceLevel}
                </span>
              </Tooltip>
            )}
            <Tooltip content="RxNorm Concept Unique Identifier - A unique identifier for this medication in the RxNorm database maintained by the National Library of Medicine">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 cursor-help">
                RXCUI: {guideline.drugRxcui}
              </span>
            </Tooltip>
          </div>
        </div>

        {/* Phenotype */}
        {guideline.phenotype && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-gray-900 mb-1">Phenotype</h4>
            <p className="text-sm text-gray-700">{guideline.phenotype}</p>
          </div>
        )}

        {/* Recommendation */}
        <div className="bg-blue-50 rounded-lg p-3">
          <h4 className="font-medium text-gray-900 mb-1">Recommendation</h4>
          <p className="text-sm text-gray-700">{guideline.recommendation}</p>
        </div>

        {/* Clinical Implications */}
        {guideline.implications && (
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Clinical Implications</h4>
            <p className="text-sm text-gray-700">{guideline.implications}</p>
          </div>
        )}

        {/* Dosage Adjustment */}
        {guideline.dosageAdjustment && (
          <div className="bg-yellow-50 rounded-lg p-3">
            <h4 className="font-medium text-gray-900 mb-1">Dosage Adjustment</h4>
            <p className="text-sm text-gray-700">{guideline.dosageAdjustment}</p>
          </div>
        )}

        {/* Sources */}
        {guideline.sources && guideline.sources.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Sources</h4>
            <div className="flex flex-wrap gap-2">
              {guideline.sources.map((source, idx) => (
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

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <label htmlFor="gene" className="block text-sm font-medium text-gray-700">
                  Gene Symbol
                </label>
                <Tooltip content="Search by pharmacogene symbols like CYP2D6, CYP2C19, TPMT, DPYD, UGT1A1, or SLCO1B1. These genes encode enzymes that metabolize medications">
                  <Info className="w-3 h-3 text-gray-400" />
                </Tooltip>
              </div>
              <input
                type="text"
                id="gene"
                value={geneQuery}
                onChange={(e) => setGeneQuery(e.target.value)}
                placeholder="e.g., CYP2D6, TPMT, DPYD"
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <label htmlFor="drug" className="block text-sm font-medium text-gray-700">
                  Drug Name
                </label>
                <Tooltip content="Search by drug name (generic or brand) like clopidogrel, warfarin, fluorouracil, or irinotecan. Use standard drug nomenclature or common names">
                  <Info className="w-3 h-3 text-gray-400" />
                </Tooltip>
              </div>
              <input
                type="text"
                id="drug"
                value={drugQuery}
                onChange={(e) => setDrugQuery(e.target.value)}
                placeholder="e.g., clopidogrel, fluorouracil"
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Search className="w-4 h-4" />
              <span>Search Guidelines</span>
            </button>
            
            <button
              type="button"
              onClick={handleLoadAll}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <BookOpen className="w-4 h-4" />
              <span>Load All Guidelines</span>
            </button>
          </div>
        </form>
      </Card>

      {/* Results */}
      {guidelines === null ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">CPIC Guidelines</p>
          <p className="text-sm text-gray-400">Search for pharmacogenomic guidelines or load all available guidelines</p>
        </div>
      ) : guidelines.count === 0 ? (
        <Alert type="info" title="No Guidelines Found">
          No CPIC guidelines found matching your search criteria. Try different gene or drug names, or load all guidelines to browse available recommendations.
        </Alert>
      ) : (
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                CPIC Guidelines ({guidelines.count})
              </h3>
              <Tooltip content="Clinical Pharmacogenetics Implementation Consortium guidelines provide evidence-based recommendations for gene-drug interactions. Each guideline includes phenotype definitions, therapeutic recommendations, and dosing adjustments">
                <Info className="w-4 h-4 text-gray-400" />
              </Tooltip>
            </div>
            <p className="text-sm text-gray-600">
              {geneQuery || drugQuery 
                ? `Results for ${geneQuery ? `gene: ${geneQuery}` : ''}${geneQuery && drugQuery ? ', ' : ''}${drugQuery ? `drug: ${drugQuery}` : ''}`
                : 'All available CPIC guidelines'
              }
            </p>
          </div>

          {/* Guidelines Grid */}
          <div className="space-y-4">
            {guidelines.guidelines.map((guideline, index) => 
              renderGuidelineCard(guideline, index)
            )}
          </div>

          {/* CPIC Link */}
          <Card className="bg-primary-50 border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-primary-900">Learn More About CPIC</h3>
                <p className="text-sm text-primary-700 mt-1">
                  Visit the Clinical Pharmacogenetics Implementation Consortium website for complete guidelines and implementation resources.
                </p>
              </div>
              <a
                href="https://cpicpgx.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
              >
                <span>Visit CPIC</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CpicGuidelines;