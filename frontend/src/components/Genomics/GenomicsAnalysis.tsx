import React, { useState } from 'react';
import { CpicGuidelinesResult, GenomicAnalysis } from '../../types';
import { genomicsService } from '../../services/api';
import Card from '../UI/Card';
import Alert from '../UI/Alert';
import LoadingSpinner from '../UI/LoadingSpinner';
import CpicGuidelines from './CpicGuidelines';
import DrugGenomicsAnalysis from './DrugGenomicsAnalysis';
import { Dna, Search, BookOpen, Upload } from 'lucide-react';
import PgxUploader from './PgxUploader';

const GenomicsAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'guidelines' | 'drug-analysis' | 'pgx-upload'>('guidelines');
  const [cpicGuidelines, setCpicGuidelines] = useState<CpicGuidelinesResult | null>(null);
  const [drugAnalysis, setDrugAnalysis] = useState<GenomicAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    {
      id: 'guidelines' as const,
      label: 'CPIC Guidelines',
      icon: BookOpen,
      description: 'Browse pharmacogenomic guidelines from CPIC'
    },
    {
      id: 'drug-analysis' as const,
      label: 'Drug Analysis',
      icon: Search,
      description: 'Analyze genomic factors for specific drugs'
    },
    {
      id: 'pgx-upload' as const,
      label: 'PGx Upload',
      icon: Upload,
      description: 'Paste FHIR Observations to derive phenotypes'
    }
  ];

  const handleLoadCpicGuidelines = async (gene?: string, drug?: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await genomicsService.getCpicGuidelines(gene, drug);
      setCpicGuidelines(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load CPIC guidelines');
    } finally {
      setLoading(false);
    }
  };

  const handleDrugAnalysis = async (rxcui: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await genomicsService.getDrugGenomics(rxcui);
      setDrugAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze drug genomics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Dna className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Pharmacogenomics Analysis</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Explore how genetic variations affect drug metabolism and response. Access CPIC guidelines and analyze drug-gene interactions for personalized medicine.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab Descriptions */}
          <div className="mb-6">
            <p className="text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <Alert type="error" title="Error" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {/* Tab Content */}
          {!loading && (
            <>
              {activeTab === 'guidelines' && (
                <CpicGuidelines
                  guidelines={cpicGuidelines}
                  onSearch={handleLoadCpicGuidelines}
                />
              )}

              {activeTab === 'drug-analysis' && (
                <DrugGenomicsAnalysis
                  analysis={drugAnalysis}
                  onAnalyze={handleDrugAnalysis}
                />
              )}

              {activeTab === 'pgx-upload' && (
                <PgxUploader />
              )}
            </>
          )}
        </div>
      </div>

      {/* Educational Content */}
      <Card>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">About Pharmacogenomics</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">What is Pharmacogenomics?</h3>
              <p className="text-gray-600 text-sm">
                Pharmacogenomics studies how genetic variations affect individual responses to medications. 
                This field helps optimize drug therapy by considering a patient's genetic makeup.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">CPIC Guidelines</h3>
              <p className="text-gray-600 text-sm">
                The Clinical Pharmacogenetics Implementation Consortium (CPIC) provides evidence-based 
                guidelines for using genetic information to optimize drug therapy.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Key Genes</h3>
              <p className="text-gray-600 text-sm">
                Important pharmacogenes include CYP2D6, CYP2C19, TPMT, DPYD, and UGT1A1, which affect 
                the metabolism of many commonly prescribed medications.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Clinical Applications</h3>
              <p className="text-gray-600 text-sm">
                Genomic information can guide dosing decisions, drug selection, and help prevent adverse 
                drug reactions, particularly in oncology and psychiatry.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Disclaimer */}
      <Alert type="warning" title="Important Disclaimer">
        Pharmacogenomic information is for educational and research purposes only. Genetic testing and 
        interpretation should only be performed by qualified healthcare professionals. Always consult 
        with a healthcare provider before making any treatment decisions based on genetic information.
      </Alert>
    </div>
  );
};

export default GenomicsAnalysis;
