import React, { useState, useEffect } from 'react';
import { 
  Dna, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  TrendingUp,
  Zap,
  Shield,
  Activity,
  FileText,
  Plus,
  X
} from 'lucide-react';
import { Drug } from '../../types';
import { 
  pharmacogenomicsService, 
  PharmacogenomicProfile, 
  GeneDrugRecommendation,
  PharmacogenomicAnalysis 
} from '../../services/pharmacogenomicsService';
import Alert from '../UI/Alert';
import LoadingSpinner from '../UI/LoadingSpinner';
import Tooltip from '../UI/Tooltip';

interface PharmacogenomicsPanelProps {
  selectedDrugs: Drug[];
  onRecommendationApply?: (recommendation: any) => void;
  patientId?: string;
  className?: string;
}

const PharmacogenomicsPanel: React.FC<PharmacogenomicsPanelProps> = ({
  selectedDrugs,
  onRecommendationApply,
  patientId = 'current',
  className = ''
}) => {
  const [phenotypes, setPhenotypes] = useState<Record<string, string>>({});
  const [analysis, setAnalysis] = useState<PharmacogenomicAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPhenotypeInput, setShowPhenotypeInput] = useState(false);
  const [availableGenes] = useState(pharmacogenomicsService.getCommonPharmacogenes());
  const [selectedGene, setSelectedGene] = useState<string>('');
  const [selectedPhenotype, setSelectedPhenotype] = useState<string>('');

  // Load saved phenotypes on mount
  useEffect(() => {
    loadSavedPhenotypes();
  }, [patientId]);

  // Re-analyze when drugs or phenotypes change
  useEffect(() => {
    if (selectedDrugs.length > 0 && Object.keys(phenotypes).length > 0) {
      analyzePharmacogenomics();
    }
  }, [selectedDrugs, phenotypes]);

  const loadSavedPhenotypes = async () => {
    try {
      const profile = await pharmacogenomicsService.loadPatientProfile(patientId);
      if (profile) {
        setPhenotypes(profile.phenotypes);
      }
    } catch (error) {
      console.warn('Failed to load saved phenotypes:', error);
    }
  };

  const analyzePharmacogenomics = async () => {
    if (selectedDrugs.length === 0 || Object.keys(phenotypes).length === 0) return;

    setLoading(true);
    setError(null);
    
    try {
      const analysisResult = await pharmacogenomicsService.analyzePharmacogenomicProfile(
        selectedDrugs,
        phenotypes
      );
      setAnalysis(analysisResult);
      
      // Save updated profile
      await pharmacogenomicsService.savePatientProfile({
        patientId,
        phenotypes,
        lastUpdated: new Date().toISOString(),
        source: 'clinical_input'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze pharmacogenomics');
    } finally {
      setLoading(false);
    }
  };

  const addPhenotype = () => {
    if (selectedGene && selectedPhenotype) {
      setPhenotypes(prev => ({
        ...prev,
        [selectedGene]: selectedPhenotype
      }));
      setSelectedGene('');
      setSelectedPhenotype('');
      setShowPhenotypeInput(false);
    }
  };

  const removePhenotype = (gene: string) => {
    setPhenotypes(prev => {
      const updated = { ...prev };
      delete updated[gene];
      return updated;
    });
  };

  const getPhenotypeOptions = (gene: string): string[] => {
    return pharmacogenomicsService.getPhenotypeOptions(gene);
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'moderate': return <Info className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  if (selectedDrugs.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 border border-dashed border-gray-300 ${className}`}>
        <div className="flex items-center space-x-2 text-gray-600">
          <Dna className="w-5 h-5" />
          <span className="text-sm">Add drugs to see pharmacogenomic recommendations</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Dna className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pharmacogenomics Analysis</h3>
              <p className="text-sm text-gray-600">
                Personalized dosing based on genetic variants
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {Object.keys(phenotypes).length > 0 && (
              <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                {Object.keys(phenotypes).length} gene{Object.keys(phenotypes).length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Phenotype Input Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900">Genetic Profile</h4>
            <button
              onClick={() => setShowPhenotypeInput(!showPhenotypeInput)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Gene</span>
            </button>
          </div>

          {/* Current Phenotypes */}
          {Object.entries(phenotypes).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {Object.entries(phenotypes).map(([gene, phenotype]) => (
                <div key={gene} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-gray-900">{gene}</div>
                      <div className="text-xs text-gray-600">{phenotype}</div>
                    </div>
                    <button
                      onClick={() => removePhenotype(gene)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Phenotype */}
          {showPhenotypeInput && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gene
                  </label>
                  <select
                    value={selectedGene}
                    onChange={(e) => {
                      setSelectedGene(e.target.value);
                      setSelectedPhenotype('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select gene...</option>
                    {availableGenes
                      .filter(gene => !phenotypes[gene])
                      .map(gene => (
                        <option key={gene} value={gene}>{gene}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phenotype
                  </label>
                  <select
                    value={selectedPhenotype}
                    onChange={(e) => setSelectedPhenotype(e.target.value)}
                    disabled={!selectedGene}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select phenotype...</option>
                    {selectedGene && getPhenotypeOptions(selectedGene).map(phenotype => (
                      <option key={phenotype} value={phenotype}>{phenotype}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={addPhenotype}
                    disabled={!selectedGene || !selectedPhenotype}
                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
            <span className="ml-2 text-gray-600">Analyzing genetic variants...</span>
          </div>
        )}

        {error && (
          <Alert type="error" title="Analysis Failed">
            {error}
          </Alert>
        )}

        {analysis && !loading && (
          <div className="space-y-6">
            {/* Risk Alerts */}
            {analysis.riskAlerts.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-red-600" />
                  Risk Alerts
                </h4>
                <div className="space-y-3">
                  {analysis.riskAlerts.map((alert, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                      <div className="flex items-start space-x-3">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {alert.gene} - {alert.drug}
                          </div>
                          <div className="text-sm mt-1">{alert.risk}</div>
                          <div className="text-sm mt-2 font-medium">
                            Action: {alert.action}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dosing Adjustments */}
            {analysis.dosingAdjustments.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-blue-600" />
                  Dosing Recommendations
                </h4>
                <div className="space-y-3">
                  {analysis.dosingAdjustments.map((adjustment, index) => (
                    <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm text-blue-900">
                          {adjustment.drug}
                        </div>
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-sm text-blue-800">
                        Recommended: {adjustment.recommendedDose}
                      </div>
                      <div className="text-xs text-blue-700 mt-2">
                        {adjustment.rationale}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alternative Therapies */}
            {analysis.alternativeTherapies.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-green-600" />
                  Alternative Therapies
                </h4>
                <div className="space-y-3">
                  {analysis.alternativeTherapies.map((therapy, index) => (
                    <div key={index} className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="font-medium text-sm text-green-900 mb-2">
                        Alternative to {therapy.originalDrug}
                      </div>
                      <div className="space-y-2">
                        {therapy.alternatives.map((alt, altIndex) => (
                          <div key={altIndex} className="text-sm">
                            <span className="font-medium text-green-800">{alt.drug}</span>
                            <span className="text-green-700 ml-2">({alt.evidenceLevel})</span>
                            <div className="text-xs text-green-600 mt-1">
                              {alt.rationale}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Significant Findings */}
            {analysis.riskAlerts.length === 0 && 
             analysis.dosingAdjustments.length === 0 && 
             analysis.alternativeTherapies.length === 0 && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-sm text-green-900">
                      No significant pharmacogenomic interactions detected
                    </div>
                    <div className="text-sm text-green-700 mt-1">
                      Current genetic profile shows standard response expected for selected medications.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacogenomicsPanel;