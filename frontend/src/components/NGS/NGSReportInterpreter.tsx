import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Brain, Target, AlertTriangle, CheckCircle, Upload, Download, Eye, Filter, Search, Star, TrendingUp, Dna, Award, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, ScatterChart, Scatter } from 'recharts';

interface GenomicVariant {
  id: string;
  gene: string;
  transcript: string;
  chromosome: string;
  position: number;
  reference: string;
  alternate: string;
  variant_type: 'SNV' | 'Insertion' | 'Deletion' | 'CNV' | 'Fusion' | 'SV';
  amino_acid_change: string;
  exon: string;
  variant_allele_frequency: number;
  read_depth: number;
  quality_score: number;
  gnomad_frequency: number;
  cosmic_count: number;
  variant_caller: string;
  filter_status: 'PASS' | 'FAIL' | 'LowQuality';
}

interface ClinicalAnnotation {
  variant_id: string;
  clinical_significance: 'Pathogenic' | 'Likely Pathogenic' | 'VUS' | 'Likely Benign' | 'Benign';
  evidence_level: 'A' | 'B' | 'C' | 'D' | 'R';
  therapeutic_implications: Array<{
    drug: string;
    indication: string;
    response_type: 'Responsive' | 'Resistant' | 'Reduced Response' | 'Increased Toxicity';
    level_of_evidence: string;
    approval_status: 'FDA Approved' | 'Guideline' | 'Clinical Trial' | 'Preclinical' | 'Case Study';
    references: string[];
  }>;
  diagnostic_implications: Array<{
    significance: string;
    description: string;
    guidelines: string[];
  }>;
  prognostic_implications: Array<{
    outcome: string;
    direction: 'Favorable' | 'Unfavorable' | 'Variable';
    evidence: string;
  }>;
  resistance_implications: Array<{
    mechanism: string;
    drugs_affected: string[];
    alternative_treatments: string[];
  }>;
}

interface ActionabilityScore {
  variant_id: string;
  overall_score: number;
  therapeutic_actionability: number;
  diagnostic_actionability: number;
  prognostic_actionability: number;
  resistance_actionability: number;
  tier: 'Tier I' | 'Tier II' | 'Tier III' | 'Tier IV';
  priority: 'High' | 'Medium' | 'Low';
  confidence: number;
  evidence_count: number;
  fda_approved_options: number;
  clinical_trial_options: number;
  guideline_recommendations: number;
}

interface QualityMetrics {
  sample_id: string;
  sequencing_platform: string;
  coverage_metrics: {
    mean_coverage: number;
    median_coverage: number;
    percentage_20x: number;
    percentage_100x: number;
    uniformity: number;
  };
  quality_metrics: {
    q30_bases: number;
    gc_content: number;
    duplication_rate: number;
    contamination_rate: number;
  };
  technical_metrics: {
    total_reads: number;
    mapped_reads: number;
    properly_paired: number;
    insert_size_mean: number;
    insert_size_std: number;
  };
  variant_calling: {
    total_variants: number;
    filtered_variants: number;
    snvs: number;
    indels: number;
    cnvs: number;
    fusions: number;
  };
  overall_quality: 'Excellent' | 'Good' | 'Acceptable' | 'Poor';
  quality_score: number;
  recommendations: string[];
}

interface NGSReport {
  id: string;
  patient_id: string;
  sample_id: string;
  test_type: 'Targeted Panel' | 'Exome' | 'Genome' | 'RNA-seq' | 'Liquid Biopsy';
  laboratory: string;
  report_date: string;
  variants: GenomicVariant[];
  annotations: ClinicalAnnotation[];
  actionability_scores: ActionabilityScore[];
  quality_metrics: QualityMetrics;
  tumor_mutational_burden: {
    value: number;
    unit: 'mutations/Mb';
    interpretation: 'High' | 'Intermediate' | 'Low';
    percentile: number;
  };
  microsatellite_instability: {
    status: 'MSI-H' | 'MSI-L' | 'MSS';
    score: number;
    interpretation: string;
  };
  homologous_recombination_deficiency: {
    score: number;
    status: 'HRD+' | 'HRD-';
    interpretation: string;
  };
  signatures: Array<{
    name: string;
    contribution: number;
    etiology: string;
    clinical_relevance: string;
  }>;
  copy_number_alterations: Array<{
    gene: string;
    alteration: 'Amplification' | 'Deletion';
    fold_change: number;
    significance: string;
  }>;
  structural_variants: Array<{
    type: 'Fusion' | 'Translocation' | 'Inversion' | 'Duplication';
    genes: string[];
    breakpoints: string[];
    significance: string;
  }>;
}

interface InterpretationEngine {
  id: string;
  name: string;
  version: string;
  databases: Array<{
    name: string;
    version: string;
    last_update: string;
  }>;
  algorithms: Array<{
    name: string;
    type: 'machine_learning' | 'rule_based' | 'hybrid';
    accuracy: number;
  }>;
  confidence_metrics: {
    annotation_accuracy: number;
    actionability_accuracy: number;
    clinical_concordance: number;
  };
}

const NGSReportInterpreter: React.FC = () => {
  const [reports, setReports] = useState<NGSReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [interpretationEngine, setInterpretationEngine] = useState<InterpretationEngine | null>(null);
  const [filterCriteria, setFilterCriteria] = useState({
    tier: 'all',
    significance: 'all',
    actionability: 0,
    evidence_level: 'all'
  });
  const [sortBy, setSortBy] = useState<'actionability' | 'significance' | 'vaf' | 'quality'>('actionability');
  const [viewMode, setViewMode] = useState<'variants' | 'actionability' | 'quality' | 'summary'>('summary');
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  const generateSampleReports = useCallback(() => {
    const sampleVariants: GenomicVariant[] = [
      {
        id: 'var-1',
        gene: 'EGFR',
        transcript: 'NM_005228.5',
        chromosome: 'chr7',
        position: 55249071,
        reference: 'T',
        alternate: 'G',
        variant_type: 'SNV',
        amino_acid_change: 'p.L858R',
        exon: 'exon21',
        variant_allele_frequency: 0.42,
        read_depth: 1247,
        quality_score: 598.2,
        gnomad_frequency: 0.000001,
        cosmic_count: 8947,
        variant_caller: 'GATK',
        filter_status: 'PASS'
      },
      {
        id: 'var-2',
        gene: 'TP53',
        transcript: 'NM_000546.6',
        chromosome: 'chr17',
        position: 7577120,
        reference: 'G',
        alternate: 'A',
        variant_type: 'SNV',
        amino_acid_change: 'p.R273H',
        exon: 'exon8',
        variant_allele_frequency: 0.67,
        read_depth: 892,
        quality_score: 423.7,
        gnomad_frequency: 0.000002,
        cosmic_count: 1247,
        variant_caller: 'GATK',
        filter_status: 'PASS'
      },
      {
        id: 'var-3',
        gene: 'PIK3CA',
        transcript: 'NM_006218.4',
        chromosome: 'chr3',
        position: 178952085,
        reference: 'A',
        alternate: 'G',
        variant_type: 'SNV',
        amino_acid_change: 'p.H1047R',
        exon: 'exon20',
        variant_allele_frequency: 0.38,
        read_depth: 756,
        quality_score: 387.9,
        gnomad_frequency: 0.000003,
        cosmic_count: 2847,
        variant_caller: 'GATK',
        filter_status: 'PASS'
      },
      {
        id: 'var-4',
        gene: 'BRCA1',
        transcript: 'NM_007294.4',
        chromosome: 'chr17',
        position: 43057063,
        reference: 'G',
        alternate: 'T',
        variant_type: 'SNV',
        amino_acid_change: 'p.S1655F',
        exon: 'exon16',
        variant_allele_frequency: 0.51,
        read_depth: 1124,
        quality_score: 512.8,
        gnomad_frequency: 0.0000001,
        cosmic_count: 23,
        variant_caller: 'GATK',
        filter_status: 'PASS'
      }
    ];

    const sampleAnnotations: ClinicalAnnotation[] = [
      {
        variant_id: 'var-1',
        clinical_significance: 'Pathogenic',
        evidence_level: 'A',
        therapeutic_implications: [
          {
            drug: 'Osimertinib',
            indication: 'NSCLC',
            response_type: 'Responsive',
            level_of_evidence: 'Level 1',
            approval_status: 'FDA Approved',
            references: ['PMID:29151359', 'PMID:27718847']
          },
          {
            drug: 'Erlotinib',
            indication: 'NSCLC',
            response_type: 'Responsive',
            level_of_evidence: 'Level 1',
            approval_status: 'FDA Approved',
            references: ['PMID:15118073', 'PMID:16014882']
          }
        ],
        diagnostic_implications: [
          {
            significance: 'Activating mutation in EGFR tyrosine kinase domain',
            description: 'Oncogenic driver mutation in non-small cell lung cancer',
            guidelines: ['NCCN NSCLC Guidelines', 'ESMO Guidelines']
          }
        ],
        prognostic_implications: [
          {
            outcome: 'Overall Survival',
            direction: 'Favorable',
            evidence: 'Improved OS with targeted therapy vs chemotherapy'
          }
        ],
        resistance_implications: [
          {
            mechanism: 'T790M gatekeeper mutation',
            drugs_affected: ['Erlotinib', 'Gefitinib', 'Afatinib'],
            alternative_treatments: ['Osimertinib', 'Combination therapy']
          }
        ]
      },
      {
        variant_id: 'var-2',
        clinical_significance: 'Pathogenic',
        evidence_level: 'B',
        therapeutic_implications: [
          {
            drug: 'APR-246',
            indication: 'Solid tumors',
            response_type: 'Responsive',
            level_of_evidence: 'Level 3A',
            approval_status: 'Clinical Trial',
            references: ['PMID:32139907']
          }
        ],
        diagnostic_implications: [
          {
            significance: 'Loss of tumor suppressor function',
            description: 'DNA-binding domain mutation affecting p53 function',
            guidelines: ['NCCN Genetic Testing Guidelines']
          }
        ],
        prognostic_implications: [
          {
            outcome: 'Treatment Response',
            direction: 'Unfavorable',
            evidence: 'Associated with chemotherapy resistance'
          }
        ],
        resistance_implications: [
          {
            mechanism: 'Loss of DNA damage response',
            drugs_affected: ['Platinum compounds', 'DNA damaging agents'],
            alternative_treatments: ['Immunotherapy', 'p53 reactivators']
          }
        ]
      },
      {
        variant_id: 'var-3',
        clinical_significance: 'Pathogenic',
        evidence_level: 'A',
        therapeutic_implications: [
          {
            drug: 'Alpelisib',
            indication: 'Breast Cancer',
            response_type: 'Responsive',
            level_of_evidence: 'Level 1',
            approval_status: 'FDA Approved',
            references: ['PMID:31091374']
          }
        ],
        diagnostic_implications: [
          {
            significance: 'PI3K pathway activation',
            description: 'Oncogenic hotspot mutation in PIK3CA',
            guidelines: ['NCCN Breast Cancer Guidelines']
          }
        ],
        prognostic_implications: [
          {
            outcome: 'Treatment Response',
            direction: 'Variable',
            evidence: 'Context-dependent response to PI3K inhibitors'
          }
        ],
        resistance_implications: [
          {
            mechanism: 'PI3K pathway hyperactivation',
            drugs_affected: ['Endocrine therapy', 'Chemotherapy'],
            alternative_treatments: ['PI3K inhibitors', 'mTOR inhibitors']
          }
        ]
      }
    ];

    const sampleActionability: ActionabilityScore[] = [
      {
        variant_id: 'var-1',
        overall_score: 94.2,
        therapeutic_actionability: 96.8,
        diagnostic_actionability: 92.1,
        prognostic_actionability: 89.5,
        resistance_actionability: 91.3,
        tier: 'Tier I',
        priority: 'High',
        confidence: 97.2,
        evidence_count: 247,
        fda_approved_options: 3,
        clinical_trial_options: 15,
        guideline_recommendations: 8
      },
      {
        variant_id: 'var-2',
        overall_score: 67.8,
        therapeutic_actionability: 58.4,
        diagnostic_actionability: 84.2,
        prognostic_actionability: 76.9,
        resistance_actionability: 51.7,
        tier: 'Tier II',
        priority: 'Medium',
        confidence: 82.1,
        evidence_count: 89,
        fda_approved_options: 0,
        clinical_trial_options: 8,
        guideline_recommendations: 3
      },
      {
        variant_id: 'var-3',
        overall_score: 81.5,
        therapeutic_actionability: 87.2,
        diagnostic_actionability: 78.9,
        prognostic_actionability: 72.1,
        resistance_actionability: 88.4,
        tier: 'Tier I',
        priority: 'High',
        confidence: 89.7,
        evidence_count: 156,
        fda_approved_options: 1,
        clinical_trial_options: 12,
        guideline_recommendations: 5
      }
    ];

    const sampleQuality: QualityMetrics = {
      sample_id: 'NGS-2024-001',
      sequencing_platform: 'Illumina NovaSeq 6000',
      coverage_metrics: {
        mean_coverage: 847.2,
        median_coverage: 792.1,
        percentage_20x: 99.8,
        percentage_100x: 98.2,
        uniformity: 94.7
      },
      quality_metrics: {
        q30_bases: 96.8,
        gc_content: 42.1,
        duplication_rate: 8.3,
        contamination_rate: 0.12
      },
      technical_metrics: {
        total_reads: 28473920,
        mapped_reads: 27891047,
        properly_paired: 96.2,
        insert_size_mean: 387.4,
        insert_size_std: 45.8
      },
      variant_calling: {
        total_variants: 1847,
        filtered_variants: 247,
        snvs: 1523,
        indels: 189,
        cnvs: 67,
        fusions: 14
      },
      overall_quality: 'Excellent',
      quality_score: 96.8,
      recommendations: [
        'High quality sequencing data suitable for clinical interpretation',
        'Excellent coverage uniformity across target regions',
        'Low contamination and duplication rates'
      ]
    };

    const sampleReport: NGSReport = {
      id: 'RPT-2024-001',
      patient_id: 'PT-2024-001',
      sample_id: 'NGS-2024-001',
      test_type: 'Targeted Panel',
      laboratory: 'Molecular Diagnostics Lab',
      report_date: '2024-01-15',
      variants: sampleVariants,
      annotations: sampleAnnotations,
      actionability_scores: sampleActionability,
      quality_metrics: sampleQuality,
      tumor_mutational_burden: {
        value: 14.2,
        unit: 'mutations/Mb',
        interpretation: 'High',
        percentile: 87.4
      },
      microsatellite_instability: {
        status: 'MSS',
        score: 2.1,
        interpretation: 'Microsatellite stable'
      },
      homologous_recombination_deficiency: {
        score: 35.8,
        status: 'HRD+',
        interpretation: 'Homologous recombination deficient'
      },
      signatures: [
        {
          name: 'SBS1',
          contribution: 0.45,
          etiology: 'Spontaneous deamination of 5-methylcytosine',
          clinical_relevance: 'Age-related signature'
        },
        {
          name: 'SBS4',
          contribution: 0.23,
          etiology: 'Tobacco smoking',
          clinical_relevance: 'Associated with smoking history'
        },
        {
          name: 'SBS6',
          contribution: 0.18,
          etiology: 'Defective DNA mismatch repair',
          clinical_relevance: 'MMR deficiency signature'
        }
      ],
      copy_number_alterations: [
        {
          gene: 'MYC',
          alteration: 'Amplification',
          fold_change: 4.2,
          significance: 'Oncogenic amplification'
        },
        {
          gene: 'CDKN2A',
          alteration: 'Deletion',
          fold_change: -2.8,
          significance: 'Tumor suppressor loss'
        }
      ],
      structural_variants: [
        {
          type: 'Fusion',
          genes: ['EML4', 'ALK'],
          breakpoints: ['chr2:42522656', 'chr2:29447681'],
          significance: 'Oncogenic fusion'
        }
      ]
    };

    const engine: InterpretationEngine = {
      id: 'ngs-engine-v3',
      name: 'NGS Interpretation Engine v3.2',
      version: '3.2.1',
      databases: [
        { name: 'ClinVar', version: '2024.01', last_update: '2024-01-15' },
        { name: 'OncoKB', version: '3.16', last_update: '2024-01-10' },
        { name: 'COSMIC', version: 'v97', last_update: '2024-01-05' },
        { name: 'gnomAD', version: 'v4.0', last_update: '2023-12-20' },
        { name: 'CIViC', version: '2024.01', last_update: '2024-01-12' }
      ],
      algorithms: [
        { name: 'Variant Classification ML', type: 'machine_learning', accuracy: 94.2 },
        { name: 'Actionability Scorer', type: 'hybrid', accuracy: 91.8 },
        { name: 'Clinical Annotator', type: 'rule_based', accuracy: 96.7 }
      ],
      confidence_metrics: {
        annotation_accuracy: 94.8,
        actionability_accuracy: 91.2,
        clinical_concordance: 93.6
      }
    };

    setReports([sampleReport]);
    setSelectedReport(sampleReport.id);
    setInterpretationEngine(engine);
  }, []);

  useEffect(() => {
    generateSampleReports();
  }, [generateSampleReports]);

  const currentReport = reports.find(r => r.id === selectedReport);

  const filteredVariants = currentReport?.variants.filter(variant => {
    const annotation = currentReport.annotations.find(a => a.variant_id === variant.id);
    const actionability = currentReport.actionability_scores.find(a => a.variant_id === variant.id);
    
    if (filterCriteria.tier !== 'all' && actionability?.tier !== filterCriteria.tier) return false;
    if (filterCriteria.significance !== 'all' && annotation?.clinical_significance !== filterCriteria.significance) return false;
    if (actionability && actionability.overall_score < filterCriteria.actionability) return false;
    if (filterCriteria.evidence_level !== 'all' && annotation?.evidence_level !== filterCriteria.evidence_level) return false;
    
    return true;
  }) || [];

  const sortedVariants = [...filteredVariants].sort((a, b) => {
    const aActionability = currentReport?.actionability_scores.find(s => s.variant_id === a.id);
    const bActionability = currentReport?.actionability_scores.find(s => s.variant_id === b.id);
    const aAnnotation = currentReport?.annotations.find(s => s.variant_id === a.id);
    const bAnnotation = currentReport?.annotations.find(s => s.variant_id === b.id);

    switch (sortBy) {
      case 'actionability':
        return (bActionability?.overall_score || 0) - (aActionability?.overall_score || 0);
      case 'vaf':
        return b.variant_allele_frequency - a.variant_allele_frequency;
      case 'quality':
        return b.quality_score - a.quality_score;
      default:
        return 0;
    }
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Tier I': return 'bg-green-100 text-green-800 border-green-300';
      case 'Tier II': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Tier III': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Tier IV': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'Pathogenic': return 'bg-red-100 text-red-800';
      case 'Likely Pathogenic': return 'bg-orange-100 text-orange-800';
      case 'VUS': return 'bg-yellow-100 text-yellow-800';
      case 'Likely Benign': return 'bg-blue-100 text-blue-800';
      case 'Benign': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const actionabilityChartData = currentReport?.actionability_scores.map(score => ({
    variant: currentReport.variants.find(v => v.id === score.variant_id)?.gene || '',
    therapeutic: score.therapeutic_actionability,
    diagnostic: score.diagnostic_actionability,
    prognostic: score.prognostic_actionability,
    resistance: score.resistance_actionability,
    overall: score.overall_score
  })) || [];

  const qualityData = currentReport ? [
    { name: 'Coverage', value: currentReport.quality_metrics.coverage_metrics.percentage_100x },
    { name: 'Quality', value: currentReport.quality_metrics.quality_metrics.q30_bases },
    { name: 'Uniformity', value: currentReport.quality_metrics.coverage_metrics.uniformity },
    { name: 'Mapping', value: currentReport.quality_metrics.technical_metrics.properly_paired }
  ] : [];

  const pieData = currentReport?.actionability_scores.map(score => ({
    name: currentReport.variants.find(v => v.id === score.variant_id)?.gene || '',
    value: score.overall_score,
    tier: score.tier
  })) || [];

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">NGS Report Interpretation</h1>
            <p className="text-blue-100">
              AI-powered genomic variant analysis with clinical actionability scoring and treatment recommendations
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{currentReport?.variants.length || 0}</div>
            <div className="text-sm text-blue-100">Variants Detected</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Report:</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {reports.map(report => (
                <option key={report.id} value={report.id}>
                  {report.patient_id} - {report.test_type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">View:</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="summary">Executive Summary</option>
              <option value="variants">Variant Details</option>
              <option value="actionability">Actionability Analysis</option>
              <option value="quality">Quality Metrics</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="actionability">Actionability Score</option>
              <option value="significance">Clinical Significance</option>
              <option value="vaf">Variant Allele Frequency</option>
              <option value="quality">Quality Score</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showAdvancedMetrics}
              onChange={(e) => setShowAdvancedMetrics(e.target.checked)}
              className="rounded"
            />
            Advanced Metrics
          </label>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
            <select
              value={filterCriteria.tier}
              onChange={(e) => setFilterCriteria(prev => ({ ...prev, tier: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Tiers</option>
              <option value="Tier I">Tier I</option>
              <option value="Tier II">Tier II</option>
              <option value="Tier III">Tier III</option>
              <option value="Tier IV">Tier IV</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Significance</label>
            <select
              value={filterCriteria.significance}
              onChange={(e) => setFilterCriteria(prev => ({ ...prev, significance: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="Pathogenic">Pathogenic</option>
              <option value="Likely Pathogenic">Likely Pathogenic</option>
              <option value="VUS">VUS</option>
              <option value="Likely Benign">Likely Benign</option>
              <option value="Benign">Benign</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Actionability</label>
            <input
              type="range"
              min="0"
              max="100"
              value={filterCriteria.actionability}
              onChange={(e) => setFilterCriteria(prev => ({ ...prev, actionability: Number(e.target.value) }))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{filterCriteria.actionability}%</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Level</label>
            <select
              value={filterCriteria.evidence_level}
              onChange={(e) => setFilterCriteria(prev => ({ ...prev, evidence_level: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="A">Level A</option>
              <option value="B">Level B</option>
              <option value="C">Level C</option>
              <option value="D">Level D</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {currentReport && (
        <>
          {viewMode === 'summary' && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Executive Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Report Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Patient ID:</span>
                        <span className="font-medium">{currentReport.patient_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Test Type:</span>
                        <span className="font-medium">{currentReport.test_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Laboratory:</span>
                        <span className="font-medium">{currentReport.laboratory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Report Date:</span>
                        <span className="font-medium">{currentReport.report_date}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Key Findings</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Variants:</span>
                        <span className="font-medium">{currentReport.variants.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tier I Variants:</span>
                        <span className="font-medium text-green-600">
                          {currentReport.actionability_scores.filter(s => s.tier === 'Tier I').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">TMB:</span>
                        <span className="font-medium">{currentReport.tumor_mutational_burden.value} {currentReport.tumor_mutational_burden.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">MSI Status:</span>
                        <span className="font-medium">{currentReport.microsatellite_instability.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">HRD Status:</span>
                        <span className="font-medium">{currentReport.homologous_recombination_deficiency.status}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Quality Assessment</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Overall Quality:</span>
                        <span className={`font-medium ${
                          currentReport.quality_metrics.overall_quality === 'Excellent' ? 'text-green-600' :
                          currentReport.quality_metrics.overall_quality === 'Good' ? 'text-blue-600' :
                          currentReport.quality_metrics.overall_quality === 'Acceptable' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {currentReport.quality_metrics.overall_quality}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mean Coverage:</span>
                        <span className="font-medium">{currentReport.quality_metrics.coverage_metrics.mean_coverage.toFixed(0)}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Q30 Bases:</span>
                        <span className="font-medium">{currentReport.quality_metrics.quality_metrics.q30_bases}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coverage {'>'}100x:</span>
                        <span className="font-medium">{currentReport.quality_metrics.coverage_metrics.percentage_100x}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionability Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actionability Scores</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={actionabilityChartData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="variant" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar name="Therapeutic" dataKey="therapeutic" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                      <Radar name="Diagnostic" dataKey="diagnostic" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      <Radar name="Prognostic" dataKey="prognostic" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Variant Distribution by Tier</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, tier }) => `${name} (${tier})`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Actionable Variants */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Actionable Variants</h3>
                <div className="space-y-3">
                  {sortedVariants.slice(0, 3).map((variant) => {
                    const annotation = currentReport.annotations.find(a => a.variant_id === variant.id);
                    const actionability = currentReport.actionability_scores.find(a => a.variant_id === variant.id);
                    
                    return (
                      <div key={variant.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">
                                {variant.gene} {variant.amino_acid_change}
                              </h4>
                              {actionability && (
                                <span className={`px-2 py-1 text-xs font-medium rounded border ${getTierColor(actionability.tier)}`}>
                                  {actionability.tier}
                                </span>
                              )}
                              {annotation && (
                                <span className={`px-2 py-1 text-xs font-medium rounded ${getSignificanceColor(annotation.clinical_significance)}`}>
                                  {annotation.clinical_significance}
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">VAF:</span>
                                <span className="ml-2 font-medium">{(variant.variant_allele_frequency * 100).toFixed(1)}%</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Coverage:</span>
                                <span className="ml-2 font-medium">{variant.read_depth}x</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Quality:</span>
                                <span className="ml-2 font-medium">{variant.quality_score.toFixed(0)}</span>
                              </div>
                              {actionability && (
                                <div>
                                  <span className="text-gray-600">FDA Options:</span>
                                  <span className="ml-2 font-medium text-green-600">{actionability.fda_approved_options}</span>
                                </div>
                              )}
                            </div>

                            {annotation && annotation.therapeutic_implications.length > 0 && (
                              <div className="mt-3">
                                <div className="text-sm font-medium text-gray-900 mb-1">Therapeutic Options:</div>
                                <div className="flex flex-wrap gap-1">
                                  {annotation.therapeutic_implications.slice(0, 3).map((therapy, index) => (
                                    <span 
                                      key={index}
                                      className={`px-2 py-1 text-xs rounded ${
                                        therapy.approval_status === 'FDA Approved' ? 'bg-green-100 text-green-800' :
                                        therapy.approval_status === 'Guideline' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                      }`}
                                    >
                                      {therapy.drug} ({therapy.approval_status})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {actionability && (
                            <div className="ml-4 text-right">
                              <div className="text-2xl font-bold text-blue-600">{actionability.overall_score.toFixed(0)}</div>
                              <div className="text-sm text-gray-600">Actionability</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'variants' && (
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Variant Details</h3>
              <div className="space-y-4">
                {sortedVariants.map((variant) => {
                  const annotation = currentReport.annotations.find(a => a.variant_id === variant.id);
                  const actionability = currentReport.actionability_scores.find(a => a.variant_id === variant.id);
                  
                  return (
                    <div key={variant.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            {variant.gene} {variant.amino_acid_change}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-600">
                              {variant.chromosome}:{variant.position} {variant.reference}{'>'}{variant.alternate}
                            </span>
                            {actionability && (
                              <span className={`px-2 py-1 text-xs font-medium rounded border ${getTierColor(actionability.tier)}`}>
                                {actionability.tier}
                              </span>
                            )}
                            {annotation && (
                              <span className={`px-2 py-1 text-xs font-medium rounded ${getSignificanceColor(annotation.clinical_significance)}`}>
                                {annotation.clinical_significance}
                              </span>
                            )}
                          </div>
                        </div>
                        {actionability && (
                          <div className="text-right">
                            <div className="text-xl font-bold text-blue-600">{actionability.overall_score.toFixed(1)}</div>
                            <div className="text-sm text-gray-600">Actionability Score</div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="text-sm text-gray-600">Variant Details</div>
                          <div className="text-xs space-y-1 mt-1">
                            <div>VAF: {(variant.variant_allele_frequency * 100).toFixed(1)}%</div>
                            <div>Depth: {variant.read_depth}x</div>
                            <div>Quality: {variant.quality_score.toFixed(0)}</div>
                            <div>COSMIC: {variant.cosmic_count}</div>
                          </div>
                        </div>

                        {actionability && (
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="text-sm text-gray-600">Actionability Breakdown</div>
                            <div className="text-xs space-y-1 mt-1">
                              <div>Therapeutic: {actionability.therapeutic_actionability.toFixed(0)}%</div>
                              <div>Diagnostic: {actionability.diagnostic_actionability.toFixed(0)}%</div>
                              <div>Prognostic: {actionability.prognostic_actionability.toFixed(0)}%</div>
                              <div>Resistance: {actionability.resistance_actionability.toFixed(0)}%</div>
                            </div>
                          </div>
                        )}

                        {annotation && (
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="text-sm text-gray-600">Evidence</div>
                            <div className="text-xs space-y-1 mt-1">
                              <div>Level: {annotation.evidence_level}</div>
                              <div>Therapeutic: {annotation.therapeutic_implications.length}</div>
                              <div>Diagnostic: {annotation.diagnostic_implications.length}</div>
                              <div>Prognostic: {annotation.prognostic_implications.length}</div>
                            </div>
                          </div>
                        )}

                        {actionability && (
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="text-sm text-gray-600">Treatment Options</div>
                            <div className="text-xs space-y-1 mt-1">
                              <div>FDA Approved: {actionability.fda_approved_options}</div>
                              <div>Clinical Trials: {actionability.clinical_trial_options}</div>
                              <div>Guidelines: {actionability.guideline_recommendations}</div>
                              <div>Confidence: {actionability.confidence.toFixed(0)}%</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {annotation && annotation.therapeutic_implications.length > 0 && (
                        <div className="border-t pt-3">
                          <h5 className="font-medium text-gray-900 mb-2">Therapeutic Implications</h5>
                          <div className="space-y-2">
                            {annotation.therapeutic_implications.map((therapy, index) => (
                              <div key={index} className="bg-blue-50 p-3 rounded">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-blue-900">{therapy.drug}</span>
                                  <span className={`px-2 py-1 text-xs rounded ${
                                    therapy.approval_status === 'FDA Approved' ? 'bg-green-100 text-green-800' :
                                    therapy.approval_status === 'Guideline' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {therapy.approval_status}
                                  </span>
                                </div>
                                <div className="text-sm text-blue-800">
                                  {therapy.indication} - {therapy.response_type} ({therapy.level_of_evidence})
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'actionability' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actionability Analysis</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={actionabilityChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="variant" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="therapeutic" fill="#10B981" name="Therapeutic" />
                    <Bar dataKey="diagnostic" fill="#3B82F6" name="Diagnostic" />
                    <Bar dataKey="prognostic" fill="#F59E0B" name="Prognostic" />
                    <Bar dataKey="resistance" fill="#EF4444" name="Resistance" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentReport.actionability_scores.map((score) => {
                  const variant = currentReport.variants.find(v => v.id === score.variant_id);
                  return (
                    <div key={score.variant_id} className="bg-white p-6 rounded-lg border">
                      <h4 className="font-medium text-gray-900 mb-3">{variant?.gene} Actionability Profile</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Overall Score:</span>
                          <span className="text-lg font-bold text-blue-600">{score.overall_score.toFixed(1)}</span>
                        </div>
                        <div className="space-y-2">
                          {[
                            { label: 'Therapeutic', value: score.therapeutic_actionability, color: 'bg-green-500' },
                            { label: 'Diagnostic', value: score.diagnostic_actionability, color: 'bg-blue-500' },
                            { label: 'Prognostic', value: score.prognostic_actionability, color: 'bg-yellow-500' },
                            { label: 'Resistance', value: score.resistance_actionability, color: 'bg-red-500' }
                          ].map((metric) => (
                            <div key={metric.label} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{metric.label}:</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`${metric.color} h-2 rounded-full`}
                                    style={{ width: `${metric.value}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium w-8">{metric.value.toFixed(0)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'quality' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sequencing Quality Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={qualityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, 'Quality Score']} />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Overall Assessment</h4>
                      <div className={`p-3 rounded-lg text-center ${
                        currentReport.quality_metrics.overall_quality === 'Excellent' ? 'bg-green-100 text-green-800' :
                        currentReport.quality_metrics.overall_quality === 'Good' ? 'bg-blue-100 text-blue-800' :
                        currentReport.quality_metrics.overall_quality === 'Acceptable' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        <div className="text-2xl font-bold">{currentReport.quality_metrics.overall_quality}</div>
                        <div className="text-sm">Quality Score: {currentReport.quality_metrics.quality_score}%</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                      <ul className="text-sm space-y-1">
                        {currentReport.quality_metrics.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-3">Coverage Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Mean Coverage:</span>
                      <span className="font-medium">{currentReport.quality_metrics.coverage_metrics.mean_coverage.toFixed(0)}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Median Coverage:</span>
                      <span className="font-medium">{currentReport.quality_metrics.coverage_metrics.median_coverage.toFixed(0)}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Targets {'>'}20x:</span>
                      <span className="font-medium">{currentReport.quality_metrics.coverage_metrics.percentage_20x}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Targets {'>'}100x:</span>
                      <span className="font-medium">{currentReport.quality_metrics.coverage_metrics.percentage_100x}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uniformity:</span>
                      <span className="font-medium">{currentReport.quality_metrics.coverage_metrics.uniformity}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-3">Quality Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Q30 Bases:</span>
                      <span className="font-medium">{currentReport.quality_metrics.quality_metrics.q30_bases}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GC Content:</span>
                      <span className="font-medium">{currentReport.quality_metrics.quality_metrics.gc_content}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duplication Rate:</span>
                      <span className="font-medium">{currentReport.quality_metrics.quality_metrics.duplication_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contamination:</span>
                      <span className="font-medium">{currentReport.quality_metrics.quality_metrics.contamination_rate}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-3">Variant Calling</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Variants:</span>
                      <span className="font-medium">{currentReport.quality_metrics.variant_calling.total_variants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Filtered Variants:</span>
                      <span className="font-medium">{currentReport.quality_metrics.variant_calling.filtered_variants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SNVs:</span>
                      <span className="font-medium">{currentReport.quality_metrics.variant_calling.snvs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Indels:</span>
                      <span className="font-medium">{currentReport.quality_metrics.variant_calling.indels}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CNVs:</span>
                      <span className="font-medium">{currentReport.quality_metrics.variant_calling.cnvs}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Interpretation Engine Info */}
      {interpretationEngine && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Interpretation Engine</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Engine Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{interpretationEngine.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">{interpretationEngine.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annotation Accuracy:</span>
                  <span className="font-medium">{interpretationEngine.confidence_metrics.annotation_accuracy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Clinical Concordance:</span>
                  <span className="font-medium">{interpretationEngine.confidence_metrics.clinical_concordance}%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Databases</h4>
              <div className="space-y-2 text-sm">
                {interpretationEngine.databases.map((db, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600">{db.name}:</span>
                    <span className="font-medium">{db.version}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Algorithms</h4>
              <div className="space-y-2 text-sm">
                {interpretationEngine.algorithms.map((algo, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{algo.name}:</span>
                      <span className="font-medium">{algo.accuracy}%</span>
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{algo.type.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NGSReportInterpreter;
