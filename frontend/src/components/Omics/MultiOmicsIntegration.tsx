import React, { useState, useEffect, useCallback } from 'react';
import { Dna, Activity, Zap, Microscope, Target, TrendingUp, Database, Brain, Network, FileText, Download, Upload, Settings, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Treemap, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, HeatmapChart, AreaChart, Area, LineChart, Line, BarChart, Bar } from 'recharts';

interface GenomicVariant {
  id: string;
  gene: string;
  chromosome: string;
  position: number;
  variant: string;
  type: 'SNV' | 'Insertion' | 'Deletion' | 'CNV' | 'Fusion' | 'SV';
  alleleFrequency: number;
  clinicalSignificance: 'Pathogenic' | 'Likely Pathogenic' | 'VUS' | 'Likely Benign' | 'Benign';
  actionability: 'FDA Approved' | 'Guideline' | 'Clinical Trial' | 'Preclinical' | 'Unknown';
  therapeuticImplications: Array<{
    drug: string;
    level: 'A' | 'B' | 'C' | 'D';
    response: 'Responsive' | 'Resistant' | 'Reduced Response';
    evidence: string;
  }>;
  expression: number;
  methylation: number;
}

interface ProteomicData {
  id: string;
  protein: string;
  uniprotId: string;
  expression: number;
  phosphorylation: Array<{
    site: string;
    level: number;
    kinase: string;
  }>;
  pathway: string;
  subcellularLocalization: string;
  druggability: number;
  targetClass: 'Kinase' | 'Receptor' | 'Enzyme' | 'Transporter' | 'Ion Channel' | 'Other';
  clinicalRelevance: number;
}

interface MetabolomicProfile {
  id: string;
  metabolite: string;
  pathway: string;
  concentration: number;
  fold_change: number;
  p_value: number;
  kegg_id: string;
  class: 'Amino Acid' | 'Lipid' | 'Carbohydrate' | 'Nucleotide' | 'Organic Acid' | 'Other';
  drugTargets: Array<{
    target: string;
    interaction: 'Inhibitor' | 'Activator' | 'Substrate' | 'Product';
    confidence: number;
  }>;
}

interface EpigenomicData {
  id: string;
  gene: string;
  region: string;
  chromosome: string;
  start: number;
  end: number;
  methylation: number;
  histone_marks: Array<{
    mark: string;
    signal: number;
    state: 'Active' | 'Repressive' | 'Neutral';
  }>;
  chromatin_accessibility: number;
  transcription_factors: Array<{
    tf: string;
    binding_score: number;
    effect: 'Activating' | 'Repressing';
  }>;
}

interface SingleCellData {
  cellType: string;
  cluster: number;
  expression: { [gene: string]: number };
  trajectory: number;
  pseudotime: number;
  cellState: 'Proliferative' | 'Senescent' | 'Apoptotic' | 'Differentiated' | 'Stem-like';
  drugSensitivity: { [drug: string]: number };
}

interface PathwayAnalysis {
  pathway: string;
  enrichmentScore: number;
  pValue: number;
  genes: string[];
  drugTargets: number;
  regulatoryElements: number;
  metabolites: number;
  clinicalRelevance: 'High' | 'Medium' | 'Low';
}

interface IntegratedInsight {
  id: string;
  title: string;
  category: 'Drug Target' | 'Biomarker' | 'Resistance' | 'Pathway' | 'Combination';
  confidence: number;
  evidence: Array<{
    type: 'Genomic' | 'Proteomic' | 'Metabolomic' | 'Epigenomic' | 'Single-cell';
    description: string;
    support: number;
  }>;
  therapeuticRecommendation: {
    drug: string;
    rationale: string;
    expectedResponse: number;
    biomarkers: string[];
  };
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
}

const MultiOmicsIntegration: React.FC = () => {
  const [genomicData, setGenomicData] = useState<GenomicVariant[]>([]);
  const [proteomicData, setProteomicData] = useState<ProteomicData[]>([]);
  const [metabolomicData, setMetabolomicData] = useState<MetabolomicProfile[]>([]);
  const [epigenomicData, setEpigenomicData] = useState<EpigenomicData[]>([]);
  const [singleCellData, setSingleCellData] = useState<SingleCellData[]>([]);
  const [pathwayAnalysis, setPathwayAnalysis] = useState<PathwayAnalysis[]>([]);
  const [integratedInsights, setIntegratedInsights] = useState<IntegratedInsight[]>([]);
  
  const [selectedOmicsLayers, setSelectedOmicsLayers] = useState<string[]>(['genomics', 'proteomics', 'metabolomics']);
  const [analysisMode, setAnalysisMode] = useState<'comprehensive' | 'targeted' | 'pathway'>('comprehensive');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSample, setCurrentSample] = useState('Patient-001');

  const generateMultiOmicsData = useCallback(() => {
    // Generate genomic variants
    const variants: GenomicVariant[] = [
      {
        id: 'var-1',
        gene: 'EGFR',
        chromosome: 'chr7',
        position: 55249071,
        variant: 'L858R',
        type: 'SNV',
        alleleFrequency: 0.42,
        clinicalSignificance: 'Pathogenic',
        actionability: 'FDA Approved',
        therapeuticImplications: [
          { drug: 'Erlotinib', level: 'A', response: 'Responsive', evidence: 'FDA approved for EGFR L858R' },
          { drug: 'Gefitinib', level: 'A', response: 'Responsive', evidence: 'NCCN guidelines level 1' },
          { drug: 'Osimertinib', level: 'A', response: 'Responsive', evidence: 'Superior PFS vs first-gen TKIs' }
        ],
        expression: 8.2,
        methylation: 0.15
      },
      {
        id: 'var-2',
        gene: 'TP53',
        chromosome: 'chr17',
        position: 7577120,
        variant: 'R273H',
        type: 'SNV',
        alleleFrequency: 0.67,
        clinicalSignificance: 'Pathogenic',
        actionability: 'Clinical Trial',
        therapeuticImplications: [
          { drug: 'APR-246', level: 'C', response: 'Responsive', evidence: 'Phase II trials ongoing' },
          { drug: 'PARP inhibitors', level: 'B', response: 'Responsive', evidence: 'Synthetic lethality' }
        ],
        expression: 3.1,
        methylation: 0.78
      },
      {
        id: 'var-3',
        gene: 'PIK3CA',
        chromosome: 'chr3',
        position: 178952085,
        variant: 'H1047R',
        type: 'SNV',
        alleleFrequency: 0.38,
        clinicalSignificance: 'Pathogenic',
        actionability: 'FDA Approved',
        therapeuticImplications: [
          { drug: 'Alpelisib', level: 'A', response: 'Responsive', evidence: 'FDA approved for PIK3CA mutant breast cancer' }
        ],
        expression: 6.7,
        methylation: 0.23
      }
    ];

    // Generate proteomic data
    const proteins: ProteomicData[] = [
      {
        id: 'prot-1',
        protein: 'EGFR',
        uniprotId: 'P00533',
        expression: 142.5,
        phosphorylation: [
          { site: 'Y1068', level: 8.7, kinase: 'EGFR' },
          { site: 'Y1173', level: 6.2, kinase: 'EGFR' }
        ],
        pathway: 'EGFR signaling',
        subcellularLocalization: 'Cell membrane',
        druggability: 0.95,
        targetClass: 'Kinase',
        clinicalRelevance: 0.89
      },
      {
        id: 'prot-2',
        protein: 'AKT1',
        uniprotId: 'P31749',
        expression: 87.3,
        phosphorylation: [
          { site: 'S473', level: 12.1, kinase: 'mTORC2' },
          { site: 'T308', level: 9.8, kinase: 'PDK1' }
        ],
        pathway: 'PI3K/AKT/mTOR',
        subcellularLocalization: 'Cytoplasm',
        druggability: 0.78,
        targetClass: 'Kinase',
        clinicalRelevance: 0.92
      },
      {
        id: 'prot-3',
        protein: 'MYC',
        uniprotId: 'P01106',
        expression: 156.2,
        phosphorylation: [
          { site: 'S62', level: 7.4, kinase: 'ERK1/2' }
        ],
        pathway: 'MYC signaling',
        subcellularLocalization: 'Nucleus',
        druggability: 0.45,
        targetClass: 'Enzyme',
        clinicalRelevance: 0.84
      }
    ];

    // Generate metabolomic data
    const metabolites: MetabolomicProfile[] = [
      {
        id: 'met-1',
        metabolite: 'Glutamine',
        pathway: 'Glutamine metabolism',
        concentration: 245.6,
        fold_change: 2.1,
        p_value: 0.002,
        kegg_id: 'C00064',
        class: 'Amino Acid',
        drugTargets: [
          { target: 'GLS1', interaction: 'Substrate', confidence: 0.94 },
          { target: 'GLUL', interaction: 'Product', confidence: 0.87 }
        ]
      },
      {
        id: 'met-2',
        metabolite: 'Lactate',
        pathway: 'Glycolysis',
        concentration: 1890.3,
        fold_change: 3.7,
        p_value: 0.0001,
        kegg_id: 'C00186',
        class: 'Organic Acid',
        drugTargets: [
          { target: 'LDHA', interaction: 'Product', confidence: 0.96 },
          { target: 'MCT1', interaction: 'Substrate', confidence: 0.91 }
        ]
      },
      {
        id: 'met-3',
        metabolite: 'Palmitate',
        pathway: 'Fatty acid synthesis',
        concentration: 67.8,
        fold_change: 1.8,
        p_value: 0.015,
        kegg_id: 'C00249',
        class: 'Lipid',
        drugTargets: [
          { target: 'FASN', interaction: 'Product', confidence: 0.88 }
        ]
      }
    ];

    // Generate epigenomic data
    const epigenomes: EpigenomicData[] = [
      {
        id: 'epi-1',
        gene: 'CDKN2A',
        region: 'Promoter',
        chromosome: 'chr9',
        start: 21967751,
        end: 21968751,
        methylation: 0.87,
        histone_marks: [
          { mark: 'H3K27me3', signal: 12.4, state: 'Repressive' },
          { mark: 'H3K4me3', signal: 1.2, state: 'Active' }
        ],
        chromatin_accessibility: 0.12,
        transcription_factors: [
          { tf: 'EZH2', binding_score: 8.7, effect: 'Repressing' }
        ]
      },
      {
        id: 'epi-2',
        gene: 'EGFR',
        region: 'Enhancer',
        chromosome: 'chr7',
        start: 55086725,
        end: 55087725,
        methylation: 0.23,
        histone_marks: [
          { mark: 'H3K27ac', signal: 15.8, state: 'Active' },
          { mark: 'H3K4me1', signal: 11.2, state: 'Active' }
        ],
        chromatin_accessibility: 0.78,
        transcription_factors: [
          { tf: 'AP1', binding_score: 9.2, effect: 'Activating' },
          { tf: 'NF-kB', binding_score: 7.1, effect: 'Activating' }
        ]
      }
    ];

    // Generate single cell data
    const singleCells: SingleCellData[] = [
      {
        cellType: 'Cancer stem cells',
        cluster: 1,
        expression: { 'CD44': 8.9, 'CD24': 2.1, 'ALDH1A1': 7.2, 'SOX2': 6.8 },
        trajectory: 0.15,
        pseudotime: 12.4,
        cellState: 'Stem-like',
        drugSensitivity: { 'Salinomycin': 8.7, 'Metformin': 6.2 }
      },
      {
        cellType: 'Proliferative cells',
        cluster: 2,
        expression: { 'MKI67': 9.1, 'PCNA': 8.4, 'CCNE1': 7.8 },
        trajectory: 0.45,
        pseudotime: 8.7,
        cellState: 'Proliferative',
        drugSensitivity: { 'Paclitaxel': 7.9, 'Doxorubicin': 8.1 }
      },
      {
        cellType: 'Senescent cells',
        cluster: 3,
        expression: { 'CDKN1A': 8.2, 'CDKN2A': 7.9, 'IL6': 6.8 },
        trajectory: 0.85,
        pseudotime: 25.1,
        cellState: 'Senescent',
        drugSensitivity: { 'Senolytics': 9.2, 'Rapamycin': 5.4 }
      }
    ];

    // Generate pathway analysis
    const pathways: PathwayAnalysis[] = [
      {
        pathway: 'PI3K/AKT/mTOR signaling',
        enrichmentScore: 8.7,
        pValue: 0.0001,
        genes: ['PIK3CA', 'AKT1', 'mTOR', 'PTEN', 'TSC1', 'TSC2'],
        drugTargets: 12,
        regulatoryElements: 8,
        metabolites: 15,
        clinicalRelevance: 'High'
      },
      {
        pathway: 'EGFR signaling',
        enrichmentScore: 7.9,
        pValue: 0.0003,
        genes: ['EGFR', 'KRAS', 'RAF1', 'MEK1', 'ERK1/2'],
        drugTargets: 8,
        regulatoryElements: 6,
        metabolites: 9,
        clinicalRelevance: 'High'
      },
      {
        pathway: 'Cell cycle checkpoints',
        enrichmentScore: 6.8,
        pValue: 0.001,
        genes: ['TP53', 'RB1', 'CDKN2A', 'CCND1', 'CDK4'],
        drugTargets: 6,
        regulatoryElements: 11,
        metabolites: 7,
        clinicalRelevance: 'Medium'
      }
    ];

    // Generate integrated insights
    const insights: IntegratedInsight[] = [
      {
        id: 'insight-1',
        title: 'EGFR-targeted therapy with metabolic modulation',
        category: 'Combination',
        confidence: 94,
        evidence: [
          { type: 'Genomic', description: 'EGFR L858R mutation with high expression', support: 95 },
          { type: 'Proteomic', description: 'Hyperphosphorylated EGFR at Y1068', support: 89 },
          { type: 'Metabolomic', description: 'Elevated glutamine dependence', support: 87 },
          { type: 'Epigenomic', description: 'Active EGFR enhancer elements', support: 78 }
        ],
        therapeuticRecommendation: {
          drug: 'Osimertinib + Glutaminase inhibitor',
          rationale: 'Target driver mutation while disrupting metabolic dependence',
          expectedResponse: 87,
          biomarkers: ['EGFR L858R', 'Glutamine levels', 'GLS1 expression']
        },
        priority: 'Critical'
      },
      {
        id: 'insight-2',
        title: 'PI3K pathway hyperactivation with epigenetic silencing',
        category: 'Drug Target',
        confidence: 91,
        evidence: [
          { type: 'Genomic', description: 'PIK3CA H1047R activating mutation', support: 98 },
          { type: 'Proteomic', description: 'Hyperphosphorylated AKT at S473/T308', support: 92 },
          { type: 'Epigenomic', description: 'PTEN promoter hypermethylation', support: 85 }
        ],
        therapeuticRecommendation: {
          drug: 'Alpelisib + 5-Azacytidine',
          rationale: 'PI3K inhibition with demethylating agent to restore PTEN',
          expectedResponse: 73,
          biomarkers: ['PIK3CA mutation', 'pAKT levels', 'PTEN methylation']
        },
        priority: 'High'
      },
      {
        id: 'insight-3',
        title: 'Cancer stem cell population targetable',
        category: 'Biomarker',
        confidence: 86,
        evidence: [
          { type: 'Single-cell', description: 'Distinct stem-like cell cluster (15% of tumor)', support: 93 },
          { type: 'Genomic', description: 'CD44+/CD24- signature genes upregulated', support: 88 },
          { type: 'Metabolomic', description: 'ALDH1 activity elevated in stem cells', support: 81 }
        ],
        therapeuticRecommendation: {
          drug: 'Salinomycin + Standard therapy',
          rationale: 'Eliminate cancer stem cell reservoir while treating bulk tumor',
          expectedResponse: 69,
          biomarkers: ['CD44+/CD24-', 'ALDH1 activity', 'SOX2 expression']
        },
        priority: 'Medium'
      }
    ];

    setGenomicData(variants);
    setProteomicData(proteins);
    setMetabolomicData(metabolites);
    setEpigenomicData(epigenomes);
    setSingleCellData(singleCells);
    setPathwayAnalysis(pathways);
    setIntegratedInsights(insights);
  }, []);

  const runIntegratedAnalysis = useCallback(async () => {
    setIsProcessing(true);
    
    // Simulate comprehensive multi-omics analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    generateMultiOmicsData();
    setIsProcessing(false);
  }, [generateMultiOmicsData]);

  useEffect(() => {
    generateMultiOmicsData();
  }, [generateMultiOmicsData]);

  const getOmicsColor = (type: string) => {
    switch (type) {
      case 'Genomic': return '#3B82F6';
      case 'Proteomic': return '#10B981';
      case 'Metabolomic': return '#F59E0B';
      case 'Epigenomic': return '#8B5CF6';
      case 'Single-cell': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Prepare data for visualizations
  const omicsIntegrationData = genomicData.map(variant => ({
    gene: variant.gene,
    genomic: variant.alleleFrequency * 100,
    proteomic: proteomicData.find(p => p.protein === variant.gene)?.expression || 0,
    epigenomic: (1 - variant.methylation) * 100,
    actionability: variant.actionability === 'FDA Approved' ? 100 : 
                   variant.actionability === 'Guideline' ? 75 :
                   variant.actionability === 'Clinical Trial' ? 50 : 25
  }));

  const pathwayEnrichmentData = pathwayAnalysis.map(pathway => ({
    name: pathway.pathway.replace(' signaling', ''),
    enrichment: pathway.enrichmentScore,
    significance: -Math.log10(pathway.pValue),
    drugTargets: pathway.drugTargets,
    clinicalRelevance: pathway.clinicalRelevance === 'High' ? 3 : 
                       pathway.clinicalRelevance === 'Medium' ? 2 : 1
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Multi-Omics Integration Platform</h1>
            <p className="text-purple-100">
              Comprehensive molecular profiling with AI-powered integration of genomics, proteomics, metabolomics, and epigenomics
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{integratedInsights.length}</div>
            <div className="text-sm text-purple-100">Actionable Insights</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sample:</label>
            <select
              value={currentSample}
              onChange={(e) => setCurrentSample(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="Patient-001">Patient-001 (Primary tumor)</option>
              <option value="Patient-001-Met">Patient-001 (Metastasis)</option>
              <option value="Patient-001-Relapse">Patient-001 (Relapse)</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Analysis Mode:</label>
            <select
              value={analysisMode}
              onChange={(e) => setAnalysisMode(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="comprehensive">Comprehensive</option>
              <option value="targeted">Targeted Analysis</option>
              <option value="pathway">Pathway-focused</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Omics Layers:</label>
            <div className="flex gap-2">
              {['genomics', 'proteomics', 'metabolomics', 'epigenomics', 'single-cell'].map(layer => (
                <label key={layer} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedOmicsLayers.includes(layer)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOmicsLayers([...selectedOmicsLayers, layer]);
                      } else {
                        setSelectedOmicsLayers(selectedOmicsLayers.filter(l => l !== layer));
                      }
                    }}
                    className="rounded"
                  />
                  {layer.charAt(0).toUpperCase() + layer.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={runIntegratedAnalysis}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Brain className="h-4 w-4" />
            )}
            {isProcessing ? 'Analyzing...' : 'Run Integration'}
          </button>
        </div>
      </div>

      {/* Integrated Insights */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Integrated Therapeutic Insights</h3>
        <div className="space-y-4">
          {integratedInsights.map((insight) => (
            <div key={insight.id} className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(insight.priority)}`}>
                      {insight.priority} Priority
                    </span>
                    <span className="text-sm text-gray-600 capitalize">{insight.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">{insight.confidence}%</div>
                  <div className="text-sm text-gray-600">Confidence</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Multi-Omics Evidence:</h5>
                  <div className="space-y-2">
                    {insight.evidence.map((evidence, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getOmicsColor(evidence.type) }}
                        ></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{evidence.type}</div>
                          <div className="text-xs text-gray-600">{evidence.description}</div>
                        </div>
                        <div className="text-sm font-medium">{evidence.support}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Therapeutic Recommendation:</h5>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-blue-600 mb-1">{insight.therapeuticRecommendation.drug}</div>
                    <div className="text-sm text-gray-700 mb-2">{insight.therapeuticRecommendation.rationale}</div>
                    <div className="flex justify-between text-sm">
                      <span>Expected Response:</span>
                      <span className="font-medium">{insight.therapeuticRecommendation.expectedResponse}%</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs text-gray-600">Key Biomarkers:</div>
                      <div className="text-sm">{insight.therapeuticRecommendation.biomarkers.join(', ')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Omics Data Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Integrated Gene View */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Multi-Omics Gene Profile</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={omicsIntegrationData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="gene" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar name="Genomic" dataKey="genomic" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              <Radar name="Proteomic" dataKey="proteomic" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              <Radar name="Epigenomic" dataKey="epigenomic" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
              <Radar name="Actionability" dataKey="actionability" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Pathway Enrichment */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pathway Enrichment Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={pathwayEnrichmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="enrichment" name="Enrichment Score" />
              <YAxis dataKey="significance" name="-log10(p-value)" />
              <Tooltip formatter={(value, name) => [value, name]} />
              <Scatter dataKey="drugTargets" fill="#8B5CF6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Omics Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genomic Variants */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Genomic Variants</h3>
          <div className="space-y-3">
            {genomicData.map((variant) => (
              <div key={variant.id} className="bg-gray-50 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{variant.gene} {variant.variant}</div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    variant.actionability === 'FDA Approved' ? 'bg-green-100 text-green-800' :
                    variant.actionability === 'Guideline' ? 'bg-blue-100 text-blue-800' :
                    variant.actionability === 'Clinical Trial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {variant.actionability}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  VAF: {(variant.alleleFrequency * 100).toFixed(1)}% | 
                  Expression: {variant.expression.toFixed(1)} | 
                  Methylation: {(variant.methylation * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {variant.therapeuticImplications[0]?.drug} - {variant.therapeuticImplications[0]?.response}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proteomic Data */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Protein Expression & Phosphorylation</h3>
          <div className="space-y-3">
            {proteomicData.map((protein) => (
              <div key={protein.id} className="bg-gray-50 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{protein.protein}</div>
                  <div className="text-sm">
                    <span className="text-gray-600">Expression: </span>
                    <span className="font-medium">{protein.expression.toFixed(1)}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {protein.targetClass} | Druggability: {(protein.druggability * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Phosphorylation: {protein.phosphorylation.map(p => `${p.site} (${p.level.toFixed(1)})`).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metabolomic and Single Cell */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metabolomic Profile */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Metabolomic Profile</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={metabolomicData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metabolite" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}x`, 'Fold Change']} />
              <Bar dataKey="fold_change" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Single Cell Analysis */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Single Cell Populations</h3>
          <div className="space-y-3">
            {singleCellData.map((cell, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{cell.cellType}</div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    cell.cellState === 'Stem-like' ? 'bg-red-100 text-red-800' :
                    cell.cellState === 'Proliferative' ? 'bg-yellow-100 text-yellow-800' :
                    cell.cellState === 'Senescent' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {cell.cellState}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Cluster {cell.cluster} | Trajectory: {(cell.trajectory * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Key markers: {Object.entries(cell.expression).slice(0, 2).map(([gene, exp]) => `${gene} (${exp.toFixed(1)})`).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiOmicsIntegration;