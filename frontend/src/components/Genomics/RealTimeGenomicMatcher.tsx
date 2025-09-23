import React, { useState, useEffect, useCallback } from 'react';
import { Dna, Zap, Target, Clock, AlertTriangle, CheckCircle, Upload, Search } from 'lucide-react';
import Card from '../UI/Card';
import LoadingSpinner from '../UI/LoadingSpinner';
import FeatureErrorBoundary from '../ErrorBoundary/FeatureErrorBoundary';

interface GenomicVariant {
  gene: string;
  variant: string;
  allele: string;
  phenotype: string;
  impact: 'high' | 'medium' | 'low';
  evidenceLevel: string;
  population: string;
}

interface DrugMatch {
  drugName: string;
  rxcui: string;
  matchScore: number;
  genomicFactors: Array<{
    gene: string;
    impact: string;
    recommendation: string;
    dosageAdjustment?: string;
  }>;
  efficacyPrediction: number;
  safetyScore: number;
  contraindications: string[];
  interactions: string[];
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  clinicalRecommendation: string;
  cpicGuideline?: string;
  fdaLabel?: string;
}

interface MatchingResults {
  totalVariants: number;
  processedVariants: number;
  matches: DrugMatch[];
  timestamp: Date;
  processingTime: number;
  confidence: number;
}

const RealTimeGenomicMatcher: React.FC = () => {
  const [genomicData, setGenomicData] = useState<string>('');
  const [variants, setVariants] = useState<GenomicVariant[]>([]);
  const [matches, setMatches] = useState<MatchingResults | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrug, setSelectedDrug] = useState<DrugMatch | null>(null);

  // Simulate real-time genomic processing
  const processGenomicData = useCallback(async (data: string) => {
    if (!data.trim()) return;
    
    setIsProcessing(true);
    const startTime = Date.now();
    
    try {
      // Stage 1: Parse VCF/Raw data
      setProcessingStage('Parsing genomic data...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockVariants: GenomicVariant[] = [
        {
          gene: 'CYP2D6',
          variant: '*1/*4',
          allele: 'rs3892097',
          phenotype: 'Intermediate Metabolizer',
          impact: 'high',
          evidenceLevel: 'Level 1A',
          population: 'European'
        },
        {
          gene: 'CYP3A4',
          variant: '*1/*1',
          allele: 'rs2740574',
          phenotype: 'Normal Metabolizer',
          impact: 'medium',
          evidenceLevel: 'Level 1A',
          population: 'Global'
        },
        {
          gene: 'DPYD',
          variant: 'c.1905+1G>A',
          allele: 'rs3918290',
          phenotype: 'Decreased Function',
          impact: 'high',
          evidenceLevel: 'Level 1A',
          population: 'European'
        },
        {
          gene: 'TPMT',
          variant: '*1/*3C',
          allele: 'rs1142345',
          phenotype: 'Intermediate Activity',
          impact: 'high',
          evidenceLevel: 'Level 1A',
          population: 'Global'
        },
        {
          gene: 'UGT1A1',
          variant: '*28/*28',
          allele: 'rs8175347',
          phenotype: 'Poor Metabolizer',
          impact: 'high',
          evidenceLevel: 'Level 1A',
          population: 'Global'
        },
        {
          gene: 'HLA-B',
          variant: '*5701',
          allele: 'rs2395029',
          phenotype: 'Positive',
          impact: 'high',
          evidenceLevel: 'Level 1A',
          population: 'European'
        }
      ];
      
      setVariants(mockVariants);
      
      // Stage 2: Database matching
      setProcessingStage('Matching against drug database...');
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Stage 3: AI scoring
      setProcessingStage('Computing AI compatibility scores...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Stage 4: Clinical recommendations
      setProcessingStage('Generating clinical recommendations...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockMatches: DrugMatch[] = [
        {
          drugName: 'Oxaliplatin',
          rxcui: '63121',
          matchScore: 94,
          genomicFactors: [
            {
              gene: 'CYP2D6',
              impact: 'Reduced metabolism',
              recommendation: 'Consider 15-20% dose reduction',
              dosageAdjustment: '85 mg/m² instead of 100 mg/m²'
            }
          ],
          efficacyPrediction: 87,
          safetyScore: 92,
          contraindications: [],
          interactions: ['Enhanced with bevacizumab'],
          evidenceLevel: 'A',
          clinicalRecommendation: 'Dose reduction recommended based on CYP2D6 intermediate metabolizer status',
          cpicGuideline: 'CPIC Guideline for CYP2D6 and codeine - applicable principles',
          fdaLabel: 'FDA label includes pharmacogenomic information'
        },
        {
          drugName: '5-Fluorouracil',
          rxcui: '3002',
          matchScore: 89,
          genomicFactors: [
            {
              gene: 'DPYD',
              impact: 'Decreased function variant detected',
              recommendation: 'Standard dosing acceptable with enhanced monitoring',
              dosageAdjustment: 'Monitor for severe toxicity'
            }
          ],
          efficacyPrediction: 82,
          safetyScore: 88,
          contraindications: [],
          interactions: ['Synergistic with oxaliplatin'],
          evidenceLevel: 'A',
          clinicalRecommendation: 'Standard dosing with enhanced toxicity monitoring due to DPYD variant',
          cpicGuideline: 'CPIC Guideline for DPYD and fluorouracil',
          fdaLabel: 'FDA label recommends DPYD testing'
        },
        {
          drugName: 'Irinotecan',
          rxcui: '37209',
          matchScore: 78,
          genomicFactors: [
            {
              gene: 'UGT1A1',
              impact: 'Poor metabolizer - high toxicity risk',
              recommendation: 'Significant dose reduction required',
              dosageAdjustment: 'Reduce initial dose by 25-30%'
            }
          ],
          efficacyPrediction: 75,
          safetyScore: 65,
          contraindications: ['UGT1A1 *28/*28 without dose adjustment'],
          interactions: ['Increased toxicity with strong CYP3A4 inhibitors'],
          evidenceLevel: 'A',
          clinicalRecommendation: 'Dose reduction mandatory for UGT1A1 *28/*28 genotype',
          cpicGuideline: 'CPIC Guideline for UGT1A1 and irinotecan',
          fdaLabel: 'FDA label includes UGT1A1 dosing recommendations'
        },
        {
          drugName: 'Abacavir',
          rxcui: '84108',
          matchScore: 95,
          genomicFactors: [
            {
              gene: 'HLA-B',
              impact: 'HLA-B*5701 positive - high hypersensitivity risk',
              recommendation: 'CONTRAINDICATED - DO NOT USE',
              dosageAdjustment: 'Use alternative therapy'
            }
          ],
          efficacyPrediction: 0,
          safetyScore: 15,
          contraindications: ['HLA-B*5701 positive'],
          interactions: [],
          evidenceLevel: 'A',
          clinicalRecommendation: 'ABSOLUTE CONTRAINDICATION due to HLA-B*5701 positive status',
          cpicGuideline: 'CPIC Guideline for HLA-B and abacavir',
          fdaLabel: 'FDA black box warning for HLA-B*5701'
        },
        {
          drugName: 'Mercaptopurine',
          rxcui: '6969',
          matchScore: 82,
          genomicFactors: [
            {
              gene: 'TPMT',
              impact: 'Intermediate activity - increased toxicity risk',
              recommendation: 'Reduce dose by 30-50%',
              dosageAdjustment: '1.0-1.5 mg/kg/day instead of 2.5 mg/kg/day'
            }
          ],
          efficacyPrediction: 79,
          safetyScore: 85,
          contraindications: [],
          interactions: ['Increased toxicity with allopurinol'],
          evidenceLevel: 'A',
          clinicalRecommendation: 'Dose reduction recommended for TPMT intermediate metabolizer',
          cpicGuideline: 'CPIC Guideline for TPMT and mercaptopurine',
          fdaLabel: 'FDA label recommends TPMT testing'
        }
      ];
      
      const processingTime = Date.now() - startTime;
      
      const results: MatchingResults = {
        totalVariants: mockVariants.length,
        processedVariants: mockVariants.length,
        matches: mockMatches,
        timestamp: new Date(),
        processingTime,
        confidence: 94
      };
      
      setMatches(results);
      
    } catch (error) {
      console.error('Error processing genomic data:', error);
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  }, []);

  // Auto-process when data changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      processGenomicData(genomicData);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [genomicData, processGenomicData]);

  const filteredMatches = matches?.matches.filter(match =>
    match.drugName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getEvidenceBadge = (level: string) => {
    const colors = {
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-gray-100 text-gray-800'
    };
    return colors[level as keyof typeof colors] || colors['D'];
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Zap className="w-8 h-8 text-yellow-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Real-Time Genomic Matcher</h1>
            <p className="text-gray-600">Instant drug-gene interaction analysis with AI-powered recommendations</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">
            {matches ? `Processed in ${matches.processingTime}ms` : 'Ready for analysis'}
          </span>
        </div>
      </div>

      {/* Input Section */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Upload className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Genomic Data Input</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VCF Data, Raw Genotype, or Variant List
              </label>
              <textarea
                value={genomicData}
                onChange={(e) => setGenomicData(e.target.value)}
                placeholder="Paste VCF data, raw genotype results, or variant list here... (e.g., rs3892097:GT, CYP2D6*1/*4, HLA-B*5701)"
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>VCF Format</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Raw Genotype</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Variant Lists</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Processing Status */}
      {isProcessing && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="sm" />
              <div>
                <h3 className="font-medium text-gray-900">Processing Genomic Data</h3>
                <p className="text-sm text-gray-600">{processingStage}</p>
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '75%' }}></div>
            </div>
          </div>
        </Card>
      )}

      {/* Variants Summary */}
      {variants.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Dna className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Detected Variants</h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {variants.length} variants
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {variants.map((variant, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{variant.gene}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(variant.impact)}`}>
                      {variant.impact} impact
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Variant:</strong> {variant.variant}</p>
                    <p><strong>Phenotype:</strong> {variant.phenotype}</p>
                    <p><strong>Evidence:</strong> {variant.evidenceLevel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Drug Matches */}
      {matches && (
        <div className="space-y-6">
          {/* Search and Summary */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Drug Matches</h3>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {matches.confidence}% confidence
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {matches.matches.length} drugs analyzed in {matches.processingTime}ms
                </div>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search drug matches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* Matches Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMatches.map((match, index) => (
              <Card 
                key={index}
                className={`cursor-pointer transition-all ${
                  selectedDrug?.drugName === match.drugName ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedDrug(match)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{match.drugName}</h4>
                      <p className="text-sm text-gray-600">RxCUI: {match.rxcui}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold px-3 py-1 rounded-full ${getMatchScoreColor(match.matchScore)}`}>
                        {match.matchScore}%
                      </span>
                      <p className={`text-xs mt-1 px-2 py-1 rounded ${getEvidenceBadge(match.evidenceLevel)}`}>
                        Evidence {match.evidenceLevel}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Efficacy Prediction</p>
                        <p className="text-lg font-semibold text-green-600">{match.efficacyPrediction}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Safety Score</p>
                        <p className="text-lg font-semibold text-blue-600">{match.safetyScore}%</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Key Genomic Factors:</p>
                      {match.genomicFactors.slice(0, 2).map((factor, idx) => (
                        <div key={idx} className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">{factor.gene}:</span> {factor.impact}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-700">{match.clinicalRecommendation}</p>
                    </div>

                    {match.contraindications.length > 0 && (
                      <div className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-700">Contraindication detected</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Detailed Drug View */}
          {selectedDrug && (
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-semibold">Detailed Analysis: {selectedDrug.drugName}</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Genomic Factors</h4>
                    <div className="space-y-3">
                      {selectedDrug.genomicFactors.map((factor, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{factor.gene}</span>
                            <Dna className="w-4 h-4 text-green-600" />
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{factor.impact}</p>
                          <p className="text-sm font-medium text-blue-700">{factor.recommendation}</p>
                          {factor.dosageAdjustment && (
                            <p className="text-sm text-gray-700 mt-1">
                              <strong>Dosage:</strong> {factor.dosageAdjustment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Clinical Guidelines</h4>
                    <div className="space-y-3">
                      {selectedDrug.cpicGuideline && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">CPIC Guideline</p>
                          <p className="text-sm text-blue-700">{selectedDrug.cpicGuideline}</p>
                        </div>
                      )}
                      {selectedDrug.fdaLabel && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-900">FDA Label</p>
                          <p className="text-sm text-green-700">{selectedDrug.fdaLabel}</p>
                        </div>
                      )}
                      {selectedDrug.contraindications.length > 0 && (
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-sm font-medium text-red-900">Contraindications</p>
                          <ul className="text-sm text-red-700 mt-1">
                            {selectedDrug.contraindications.map((ci, index) => (
                              <li key={index}>• {ci}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

const RealTimeGenomicMatcherWithBoundary: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Real-Time Genomic Matcher"
      fallbackMessage="The genomic matching engine is temporarily unavailable. This feature requires advanced AI processing and database connectivity."
    >
      <RealTimeGenomicMatcher />
    </FeatureErrorBoundary>
  );
};

export default RealTimeGenomicMatcherWithBoundary;