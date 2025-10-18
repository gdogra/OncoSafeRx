import React, { useState, useEffect } from 'react';
import { 
  Dna, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  Target,
  Users,
  BookOpen,
  Share2,
  Download,
  Star,
  Microscope
} from 'lucide-react';
import Card from '../UI/Card';

interface GenomicMarker {
  id: string;
  gene: string;
  variant: string;
  significance: 'pathogenic' | 'likely_pathogenic' | 'uncertain' | 'likely_benign' | 'benign';
  discoveryDate: Date;
  impact: string;
  clinicalRelevance: string;
  drugResponse?: string;
  actionability: 'high' | 'medium' | 'low';
}

interface TreatmentDecision {
  id: string;
  decision: string;
  date: Date;
  genomicBasis: string[];
  efficacyPrediction: number;
  alternativesConsidered: string[];
  outcome?: 'excellent' | 'good' | 'moderate' | 'poor';
  notes?: string;
}

interface FamilyRiskProfile {
  relatives: {
    relationship: string;
    riskLevel: 'high' | 'moderate' | 'low';
    recommendedScreening: string[];
    sharedVariants: string[];
  }[];
  overallFamilyRisk: number;
}

interface ResearchConnection {
  studyTitle: string;
  institution: string;
  relevantGenes: string[];
  participationStatus: 'eligible' | 'enrolled' | 'completed' | 'not_eligible';
  potentialImpact: string;
  contactInfo?: string;
}

interface ScenarioAnalysis {
  scenarioName: string;
  hypotheticalVariants: string[];
  treatmentChanges: string[];
  outcomeProjections: {
    efficacy: number;
    sideEffects: string[];
    duration: string;
  };
}

const GenomicJourneyTracker: React.FC = () => {
  const [activeView, setActiveView] = useState<'timeline' | 'family' | 'scenarios' | 'research'>('timeline');
  const [genomicMarkers, setGenomicMarkers] = useState<GenomicMarker[]>([]);
  const [treatmentDecisions, setTreatmentDecisions] = useState<TreatmentDecision[]>([]);
  const [familyRisk, setFamilyRisk] = useState<FamilyRiskProfile | null>(null);
  const [researchOpportunities, setResearchOpportunities] = useState<ResearchConnection[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioAnalysis[]>([]);

  useEffect(() => {
    // Mock genomic data
    setGenomicMarkers([
      {
        id: '1',
        gene: 'BRCA1',
        variant: 'c.5266dupC',
        significance: 'pathogenic',
        discoveryDate: new Date('2024-01-15'),
        impact: 'Hereditary breast and ovarian cancer syndrome',
        clinicalRelevance: 'High risk for breast and ovarian cancer',
        drugResponse: 'Excellent response to PARP inhibitors',
        actionability: 'high'
      },
      {
        id: '2',
        gene: 'CYP2D6',
        variant: '*1/*4',
        significance: 'likely_pathogenic',
        discoveryDate: new Date('2024-02-01'),
        impact: 'Intermediate drug metabolizer',
        clinicalRelevance: 'Affects tamoxifen metabolism',
        drugResponse: 'Requires dose adjustment for tamoxifen',
        actionability: 'high'
      },
      {
        id: '3',
        gene: 'TP53',
        variant: 'R273H',
        significance: 'pathogenic',
        discoveryDate: new Date('2024-02-15'),
        impact: 'Li-Fraumeni syndrome',
        clinicalRelevance: 'Increased cancer susceptibility',
        actionability: 'medium'
      }
    ]);

    // Mock treatment decisions
    setTreatmentDecisions([
      {
        id: '1',
        decision: 'Olaparib maintenance therapy',
        date: new Date('2024-03-01'),
        genomicBasis: ['BRCA1 c.5266dupC'],
        efficacyPrediction: 85,
        alternativesConsidered: ['Standard chemotherapy', 'Clinical trial PARP inhibitor'],
        outcome: 'excellent',
        notes: 'Complete response maintained for 8 months'
      },
      {
        id: '2',
        decision: 'Tamoxifen dose reduction',
        date: new Date('2024-04-15'),
        genomicBasis: ['CYP2D6 *1/*4'],
        efficacyPrediction: 75,
        alternativesConsidered: ['Standard dose tamoxifen', 'Aromatase inhibitor'],
        outcome: 'good'
      }
    ]);

    // Mock family risk data
    setFamilyRisk({
      relatives: [
        {
          relationship: 'Mother',
          riskLevel: 'high',
          recommendedScreening: ['Annual MRI', 'Mammography', 'BRCA testing'],
          sharedVariants: ['BRCA1 c.5266dupC']
        },
        {
          relationship: 'Sister',
          riskLevel: 'high',
          recommendedScreening: ['BRCA testing', 'Annual mammography from age 25'],
          sharedVariants: ['BRCA1 c.5266dupC (potential)']
        },
        {
          relationship: 'Daughter',
          riskLevel: 'moderate',
          recommendedScreening: ['Genetic counseling at age 18', 'Early screening protocols'],
          sharedVariants: ['50% chance of BRCA1 inheritance']
        }
      ],
      overallFamilyRisk: 75
    });

    // Mock research opportunities
    setResearchOpportunities([
      {
        studyTitle: 'BRCA1 Precision Medicine Trial',
        institution: 'Johns Hopkins University',
        relevantGenes: ['BRCA1'],
        participationStatus: 'eligible',
        potentialImpact: 'Novel PARP inhibitor combination therapy',
        contactInfo: 'research@hopkins.edu'
      },
      {
        studyTitle: 'CYP2D6 Pharmacogenomics Study',
        institution: 'Mayo Clinic',
        relevantGenes: ['CYP2D6'],
        participationStatus: 'enrolled',
        potentialImpact: 'Personalized tamoxifen dosing algorithm'
      }
    ]);

    // Mock scenario analyses
    setScenarios([
      {
        scenarioName: 'If I had BRCA2 instead of BRCA1',
        hypotheticalVariants: ['BRCA2 c.5946delT'],
        treatmentChanges: ['Different PARP inhibitor selection', 'Modified surveillance protocol'],
        outcomeProjections: {
          efficacy: 80,
          sideEffects: ['Similar profile', 'Potentially less neuropathy'],
          duration: '12-18 months maintenance'
        }
      },
      {
        scenarioName: 'If I were a CYP2D6 ultra-rapid metabolizer',
        hypotheticalVariants: ['CYP2D6 *1/*1'],
        treatmentChanges: ['Standard tamoxifen dosing', 'No dose adjustments needed'],
        outcomeProjections: {
          efficacy: 95,
          sideEffects: ['Standard profile'],
          duration: '5 years as planned'
        }
      }
    ]);
  }, []);

  const handleShareWithProvider = () => {
    const reportData = {
      patientId: 'patient-123', // This would come from context
      genomicMarkers,
      treatmentDecisions,
      familyRisk,
      researchOpportunities,
      generatedAt: new Date().toISOString(),
      reportType: 'genomic-journey'
    };

    // Create shareable link or email
    const shareUrl = `${window.location.origin}/shared-report/${btoa(JSON.stringify(reportData))}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Genomic Journey Report',
        text: 'My personalized genomic analysis and treatment journey',
        url: shareUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Share link copied to clipboard!');
      });
    }
  };

  const handleExportReport = () => {
    const reportData = {
      title: 'Your Genomic Journey Report',
      patientName: 'Patient Name', // This would come from context
      generatedAt: new Date().toISOString(),
      genomicMarkers,
      treatmentDecisions,
      familyRisk,
      researchOpportunities,
      scenarios
    };

    // Create PDF-style report content
    const reportContent = `
# Your Genomic Journey Report
Generated: ${new Date().toLocaleDateString()}

## Genetic Variants
${genomicMarkers.map(marker => `
### ${marker.gene} - ${marker.variant}
- **Significance:** ${marker.significance}
- **Impact:** ${marker.impact}
- **Clinical Relevance:** ${marker.clinicalRelevance}
- **Drug Response:** ${marker.drugResponse || 'N/A'}
- **Discovered:** ${marker.discoveryDate.toLocaleDateString()}
`).join('')}

## Treatment Decisions
${treatmentDecisions.map(decision => `
### ${decision.decision}
- **Date:** ${decision.date.toLocaleDateString()}
- **Genomic Basis:** ${decision.genomicBasis.join(', ')}
- **Efficacy Prediction:** ${decision.efficacyPrediction}%
- **Outcome:** ${decision.outcome || 'Ongoing'}
- **Notes:** ${decision.notes || 'N/A'}
`).join('')}

## Family Risk Profile
Overall Family Risk: ${familyRisk?.overallFamilyRisk}%
${familyRisk?.relatives.map(rel => `
### ${rel.relationship}
- **Risk Level:** ${rel.riskLevel}
- **Recommended Screening:** ${rel.recommendedScreening.join(', ')}
- **Shared Variants:** ${rel.sharedVariants.join(', ')}
`).join('') || ''}

## Research Opportunities
${researchOpportunities.map(study => `
### ${study.studyTitle}
- **Institution:** ${study.institution}
- **Status:** ${study.participationStatus}
- **Relevant Genes:** ${study.relevantGenes.join(', ')}
- **Impact:** ${study.potentialImpact}
`).join('')}
    `.trim();

    // Create and download file
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genomic-journey-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'pathogenic': return 'text-red-600 bg-red-50';
      case 'likely_pathogenic': return 'text-orange-600 bg-orange-50';
      case 'uncertain': return 'text-yellow-600 bg-yellow-50';
      case 'likely_benign': return 'text-blue-600 bg-blue-50';
      case 'benign': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getActionabilityIcon = (actionability: string) => {
    switch (actionability) {
      case 'high': return <Zap className="w-4 h-4 text-red-600" />;
      case 'medium': return <Target className="w-4 h-4 text-yellow-600" />;
      case 'low': return <Clock className="w-4 h-4 text-gray-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Dna className="w-8 h-8 mr-3 text-blue-600" />
            Your Genomic Journey
          </h1>
          <p className="text-gray-600 mt-1">
            Track how your genetics influence your personalized treatment plan
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => handleShareWithProvider()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Share2 className="w-4 h-4" />
            <span>Share with Provider</span>
          </button>
          <button 
            onClick={() => handleExportReport()}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'timeline', label: 'Genomic Timeline', icon: Calendar },
            { id: 'family', label: 'Family Risk Profile', icon: Users },
            { id: 'scenarios', label: 'What-If Scenarios', icon: Target },
            { id: 'research', label: 'Research Connections', icon: Microscope }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Timeline View */}
      {activeView === 'timeline' && (
        <div className="space-y-6">
          {/* Genomic Markers */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Genetic Variants</h2>
            <div className="space-y-4">
              {genomicMarkers.map((marker) => (
                <div key={marker.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{marker.gene}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignificanceColor(marker.significance)}`}>
                          {marker.significance.replace('_', ' ')}
                        </span>
                        {getActionabilityIcon(marker.actionability)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{marker.variant}</p>
                      <p className="text-sm text-gray-800 mb-2">{marker.impact}</p>
                      <p className="text-sm text-gray-700 mb-3">{marker.clinicalRelevance}</p>
                      {marker.drugResponse && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">Treatment Implications:</p>
                          <p className="text-sm text-blue-800">{marker.drugResponse}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      Discovered: {marker.discoveryDate.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Treatment Decisions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Genomics-Based Treatment Decisions</h2>
            <div className="space-y-4">
              {treatmentDecisions.map((decision) => (
                <div key={decision.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{decision.decision}</h3>
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Genomic Basis: </span>
                        <span className="text-sm text-gray-600">{decision.genomicBasis.join(', ')}</span>
                      </div>
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Efficacy Prediction: </span>
                        <span className="text-sm font-semibold text-green-600">{decision.efficacyPrediction}%</span>
                      </div>
                      {decision.outcome && (
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">
                            Outcome: {decision.outcome}
                          </span>
                        </div>
                      )}
                      {decision.notes && (
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{decision.notes}</p>
                      )}
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      {decision.date.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Family Risk View */}
      {activeView === 'family' && familyRisk && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Family Risk Assessment</h2>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Family Risk Score</span>
                <span className="text-2xl font-bold text-orange-600">{familyRisk.overallFamilyRisk}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-orange-500 h-3 rounded-full" 
                  style={{ width: `${familyRisk.overallFamilyRisk}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {familyRisk.relatives.map((relative, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{relative.relationship}</h3>
                  <div className="mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      relative.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                      relative.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {relative.riskLevel} risk
                    </span>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Recommended Screening:</p>
                    <ul className="text-xs text-gray-600">
                      {relative.recommendedScreening.map((screening, idx) => (
                        <li key={idx}>• {screening}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Shared Variants:</p>
                    <p className="text-xs text-gray-600">{relative.sharedVariants.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Scenarios View */}
      {activeView === 'scenarios' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              What-If Genetic Scenarios
            </h2>
            <p className="text-gray-600 mb-6">
              Explore how different genetic variants would affect your treatment options
            </p>
            <div className="space-y-6">
              {scenarios.map((scenario, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">{scenario.scenarioName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Hypothetical Variants</h4>
                      <ul className="text-sm text-gray-600">
                        {scenario.hypotheticalVariants.map((variant, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <Dna className="w-3 h-3" />
                            <span>{variant}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Treatment Changes</h4>
                      <ul className="text-sm text-gray-600">
                        {scenario.treatmentChanges.map((change, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <Target className="w-3 h-3" />
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Projected Outcomes</h4>
                      <div className="text-sm text-gray-600">
                        <p>Efficacy: <span className="font-medium">{scenario.outcomeProjections.efficacy}%</span></p>
                        <p>Duration: <span className="font-medium">{scenario.outcomeProjections.duration}</span></p>
                        <p className="text-xs mt-1">Side effects: {scenario.outcomeProjections.sideEffects.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Research View */}
      {activeView === 'research' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Research Opportunities
            </h2>
            <p className="text-gray-600 mb-6">
              Clinical trials and research studies matching your genetic profile
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {researchOpportunities.map((study, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{study.studyTitle}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      study.participationStatus === 'eligible' ? 'bg-green-100 text-green-800' :
                      study.participationStatus === 'enrolled' ? 'bg-blue-100 text-blue-800' :
                      study.participationStatus === 'completed' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {study.participationStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{study.institution}</p>
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Relevant Genes: </span>
                    <span className="text-sm text-gray-600">{study.relevantGenes.join(', ')}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{study.potentialImpact}</p>
                  {study.contactInfo && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Contact Information:</p>
                      <p className="text-sm text-blue-800">{study.contactInfo}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GenomicJourneyTracker;