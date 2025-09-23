import React, { useState, useEffect } from 'react';
import { usePatient } from '../../context/PatientContext';
import Card from '../UI/Card';
import Alert from '../UI/Alert';
import Tooltip from '../UI/Tooltip';
import LoadingSpinner from '../UI/LoadingSpinner';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Pill,
  Activity,
  Heart,
  Brain,
  Shield,
  Info,
  Calculator,
  FileText,
  TrendingUp,
  Users,
  Clock,
  Target,
  Dna,
  ChevronDown,
  ChevronRight,
  Download,
  Print
} from 'lucide-react';

interface PharmacogenomicResult {
  drug: string;
  brandName?: string;
  status: 'normal' | 'impaired' | 'elevated_risk';
  geneticIssues?: string[];
  recommendations?: string[];
  metabolizerStatus?: 'normal' | 'poor' | 'intermediate' | 'rapid' | 'ultra-rapid';
  cyp2d6?: string;
  cyp3a4?: string;
  isProdrug?: boolean;
}

interface RiskFactor {
  factor: string;
  present: boolean;
  weight: number;
  description: string;
}

interface OpioidRiskAssessment {
  overallRisk: 'low' | 'moderate' | 'high' | 'very_high';
  riskScore: number;
  maxScore: number;
  riskFactors: RiskFactor[];
  recommendations: string[];
}

interface MMECalculation {
  medication: string;
  dose: number;
  frequency: string;
  conversionFactor: number;
  dailyMME: number;
}

const OpioidRiskReport: React.FC = () => {
  const { state } = usePatient();
  const { currentPatient } = state;
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    genetic: true,
    risk: true,
    mme: false,
    recommendations: true
  });
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);

  // Sample pharmacogenomic results based on the provided report structure
  const pharmacogenomicResults: PharmacogenomicResult[] = [
    {
      drug: 'alfentanil',
      brandName: 'Alfenta',
      status: 'normal',
      metabolizerStatus: 'normal',
      cyp3a4: 'normal function',
      recommendations: ['Standard dosing appropriate', 'Monitor for respiratory depression']
    },
    {
      drug: 'carisoprodol',
      brandName: 'Soma',
      status: 'normal',
      metabolizerStatus: 'normal',
      cyp2d6: 'normal function',
      recommendations: ['Standard dosing appropriate', 'Monitor for sedation and abuse potential']
    },
    {
      drug: 'codeine',
      status: 'impaired',
      metabolizerStatus: 'poor',
      cyp2d6: 'poor metabolizer',
      isProdrug: true,
      geneticIssues: ['CYP2D6 poor metabolizer - reduced conversion to morphine'],
      recommendations: [
        'May not be effective due to poor conversion to active metabolite',
        'Consider alternative opioid (morphine, oxycodone)',
        'Avoid codeine for pain management'
      ]
    },
    {
      drug: 'fentanyl',
      brandName: 'Actiq, Duragesic, Sublimaze',
      status: 'elevated_risk',
      metabolizerStatus: 'intermediate',
      cyp3a4: 'reduced function',
      geneticIssues: ['CYP3A4 reduced function - increased exposure risk'],
      recommendations: [
        'Start with reduced dose (25-50% reduction)',
        'Extended monitoring for respiratory depression',
        'Consider dose titration more slowly'
      ]
    },
    {
      drug: 'hydrocodone',
      status: 'impaired',
      metabolizerStatus: 'poor',
      cyp2d6: 'poor metabolizer',
      isProdrug: true,
      geneticIssues: ['CYP2D6 poor metabolizer - reduced analgesic efficacy'],
      recommendations: [
        'Reduced efficacy expected',
        'Consider oxycodone or morphine instead',
        'Higher doses may be needed but with increased side effects'
      ]
    },
    {
      drug: 'oxycodone',
      brandName: 'OxyContin',
      status: 'normal',
      metabolizerStatus: 'normal',
      cyp3a4: 'normal function',
      recommendations: [
        'Standard dosing appropriate',
        'Monitor for respiratory depression and sedation',
        'Good alternative for CYP2D6 poor metabolizers'
      ]
    },
    {
      drug: 'tramadol',
      brandName: 'Ultram',
      status: 'impaired',
      metabolizerStatus: 'poor',
      cyp2d6: 'poor metabolizer',
      isProdrug: true,
      geneticIssues: ['CYP2D6 poor metabolizer - reduced conversion to active O-desmethyltramadol'],
      recommendations: [
        'Significantly reduced analgesic efficacy',
        'Consider non-tramadol alternatives',
        'Increased risk of seizures without analgesic benefit'
      ]
    }
  ];

  // Risk assessment calculation
  const calculateRiskAssessment = (): OpioidRiskAssessment => {
    const riskFactors: RiskFactor[] = [
      {
        factor: 'Age > 65 years',
        present: currentPatient ? new Date().getFullYear() - new Date(currentPatient.demographics.dateOfBirth).getFullYear() > 65 : false,
        weight: 2,
        description: 'Increased sensitivity to opioids and slower metabolism'
      },
      {
        factor: 'History of substance abuse',
        present: currentPatient?.medicalHistory?.some(h => h.condition.toLowerCase().includes('substance') || h.condition.toLowerCase().includes('addiction')) || false,
        weight: 4,
        description: 'Significantly increases risk of opioid misuse and addiction'
      },
      {
        factor: 'Depression/Anxiety',
        present: currentPatient?.medicalHistory?.some(h => 
          h.condition.toLowerCase().includes('depression') || 
          h.condition.toLowerCase().includes('anxiety') ||
          h.condition.toLowerCase().includes('psychiatric')
        ) || false,
        weight: 2,
        description: 'Mental health conditions increase addiction vulnerability'
      },
      {
        factor: 'Chronic pain condition',
        present: currentPatient?.medicalHistory?.some(h => 
          h.condition.toLowerCase().includes('pain') ||
          h.condition.toLowerCase().includes('arthritis') ||
          h.condition.toLowerCase().includes('fibromyalgia')
        ) || false,
        weight: 1,
        description: 'Long-term opioid use increases dependency risk'
      },
      {
        factor: 'CYP2D6 Poor Metabolizer',
        present: true, // Based on genetic results
        weight: 2,
        description: 'Reduced efficacy of prodrug opioids may lead to dose escalation'
      },
      {
        factor: 'Multiple prescribers',
        present: false, // Would need to check prescription history
        weight: 2,
        description: 'Lack of coordination increases risk of overprescribing'
      },
      {
        factor: 'Concurrent benzodiazepines',
        present: currentPatient?.medications.some(med => 
          med.name.toLowerCase().includes('alprazolam') ||
          med.name.toLowerCase().includes('lorazepam') ||
          med.name.toLowerCase().includes('clonazepam') ||
          med.name.toLowerCase().includes('diazepam')
        ) || false,
        weight: 3,
        description: 'Dangerous combination increasing overdose risk'
      }
    ];

    const presentFactors = riskFactors.filter(f => f.present);
    const riskScore = presentFactors.reduce((sum, factor) => sum + factor.weight, 0);
    const maxScore = riskFactors.reduce((sum, factor) => sum + factor.weight, 0);

    let overallRisk: 'low' | 'moderate' | 'high' | 'very_high';
    if (riskScore <= 2) overallRisk = 'low';
    else if (riskScore <= 5) overallRisk = 'moderate';
    else if (riskScore <= 8) overallRisk = 'high';
    else overallRisk = 'very_high';

    const recommendations: string[] = [];
    
    if (overallRisk === 'low') {
      recommendations.push('Standard opioid prescribing guidelines apply');
      recommendations.push('Monitor for signs of misuse at routine intervals');
    } else if (overallRisk === 'moderate') {
      recommendations.push('Enhanced monitoring and shorter prescription intervals');
      recommendations.push('Consider non-opioid alternatives first');
      recommendations.push('Use prescription drug monitoring program (PDMP)');
    } else if (overallRisk === 'high') {
      recommendations.push('Opioids only after non-opioid options exhausted');
      recommendations.push('Mandatory PDMP checks and frequent monitoring');
      recommendations.push('Consider addiction medicine consultation');
      recommendations.push('Naloxone prescription recommended');
    } else {
      recommendations.push('Avoid opioids except in severe circumstances');
      recommendations.push('Immediate addiction medicine consultation');
      recommendations.push('Comprehensive substance abuse evaluation');
      recommendations.push('Naloxone prescription mandatory');
    }

    return {
      overallRisk,
      riskScore,
      maxScore,
      riskFactors,
      recommendations
    };
  };

  // MME calculations
  const calculateMME = (): MMECalculation[] => {
    if (!currentPatient) return [];

    const opioidMedications = currentPatient.medications.filter(med =>
      ['codeine', 'morphine', 'oxycodone', 'hydrocodone', 'fentanyl', 'tramadol', 'tapentadol']
        .some(opioid => med.name.toLowerCase().includes(opioid))
    );

    const mmeFactors: Record<string, number> = {
      codeine: 0.15,
      morphine: 1,
      oxycodone: 1.5,
      hydrocodone: 1,
      fentanyl: 2.4, // for transdermal patch
      tramadol: 0.1,
      tapentadol: 0.4
    };

    return opioidMedications.map(med => {
      const opioidName = Object.keys(mmeFactors).find(opioid => 
        med.name.toLowerCase().includes(opioid)
      ) || 'morphine';
      
      const conversionFactor = mmeFactors[opioidName];
      const dose = parseFloat(med.dosage.replace(/[^0-9.]/g, '')) || 0;
      const frequency = med.frequency;
      
      let dailyDoses = 1;
      if (frequency.includes('twice') || frequency.includes('BID')) dailyDoses = 2;
      else if (frequency.includes('three') || frequency.includes('TID')) dailyDoses = 3;
      else if (frequency.includes('four') || frequency.includes('QID')) dailyDoses = 4;
      else if (frequency.includes('every 4')) dailyDoses = 6;
      else if (frequency.includes('every 6')) dailyDoses = 4;
      else if (frequency.includes('every 8')) dailyDoses = 3;
      else if (frequency.includes('every 12')) dailyDoses = 2;

      const dailyMME = dose * conversionFactor * dailyDoses;

      return {
        medication: med.name,
        dose,
        frequency,
        conversionFactor,
        dailyMME
      };
    });
  };

  const riskAssessment = calculateRiskAssessment();
  const mmeCalculations = calculateMME();
  const totalMME = mmeCalculations.reduce((sum, calc) => sum + calc.dailyMME, 0);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusIcon = (status: 'normal' | 'impaired' | 'elevated_risk') => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'impaired':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'elevated_risk':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: 'normal' | 'impaired' | 'elevated_risk') => {
    switch (status) {
      case 'normal':
        return 'bg-green-50 border-green-200';
      case 'impaired':
        return 'bg-yellow-50 border-yellow-200';
      case 'elevated_risk':
        return 'bg-red-50 border-red-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'very_high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentPatient) {
    return (
      <Card>
        <div className="text-center py-12">
          <Pill className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">Opioid Risk & Pain Management Report</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Select a patient to view their personalized opioid addiction risk assessment and pain management recommendations
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Opioid Risk & Pain Management Report</h1>
              <p className="text-gray-600">
                Comprehensive addiction risk assessment for {currentPatient.demographics.firstName} {currentPatient.demographics.lastName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Print className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Risk Score Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Overall Risk</span>
          </div>
          <div className={`text-2xl font-bold px-3 py-1 rounded-full inline-block ${getRiskColor(riskAssessment.overallRisk)}`}>
            {riskAssessment.overallRisk.replace('_', ' ').toUpperCase()}
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Calculator className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Risk Score</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {riskAssessment.riskScore}/{riskAssessment.maxScore}
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Activity className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Total MME</span>
          </div>
          <div className={`text-2xl font-bold ${totalMME > 90 ? 'text-red-600' : totalMME > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
            {totalMME.toFixed(1)}
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Dna className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">CYP2D6 Status</span>
          </div>
          <div className="text-lg font-semibold text-orange-600">
            Poor Metabolizer
          </div>
        </Card>
      </div>

      {/* Pharmacogenomic Results */}
      <Card>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('genetic')}
        >
          <div className="flex items-center space-x-2">
            <Dna className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-gray-900">Pharmacogenomic Results</h2>
          </div>
          {expandedSections.genetic ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>

        {expandedSections.genetic && (
          <div className="mt-6">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Genetic Status Legend</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span><strong>Normal:</strong> Standard dosing appropriate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span><strong>Impaired:</strong> Extra caution required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span><strong>Elevated Risk:</strong> Extreme caution or avoidance</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {pharmacogenomicResults.map((result, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(result.status)}
                        <div>
                          <h4 className="font-semibold text-gray-900 capitalize">
                            {result.drug} {result.brandName && `(${result.brandName})`}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Metabolizer: {result.metabolizerStatus}</span>
                            {result.isProdrug && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-xs">
                                Pro-drug
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {result.geneticIssues && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Genetic Issues:</p>
                          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                            {result.geneticIssues.map((issue, idx) => (
                              <li key={idx}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.recommendations && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Clinical Recommendations:</p>
                          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                            {result.recommendations.map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Risk Assessment */}
      <Card>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('risk')}
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Addiction Risk Assessment</h2>
          </div>
          {expandedSections.risk ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>

        {expandedSections.risk && (
          <div className="mt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Risk Factors Present</h3>
                <div className="space-y-3">
                  {riskAssessment.riskFactors.filter(f => f.present).map((factor, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">{factor.factor}</p>
                        <p className="text-sm text-gray-600">{factor.description}</p>
                        <span className="inline-block mt-1 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                          Weight: {factor.weight}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Clinical Recommendations</h3>
                <div className="space-y-3">
                  {riskAssessment.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <p className="text-sm text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* MME Calculator */}
      <Card>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('mme')}
        >
          <div className="flex items-center space-x-2">
            <Calculator className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">Morphine Milligram Equivalent (MME) Calculator</h2>
          </div>
          {expandedSections.mme ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>

        {expandedSections.mme && (
          <div className="mt-6">
            {totalMME > 90 && (
              <Alert type="error" title="High MME Alert">
                Total daily MME of {totalMME.toFixed(1)} exceeds CDC guideline of 90 MME/day. 
                Consider dose reduction, tapering plan, or specialist consultation.
              </Alert>
            )}
            {totalMME > 50 && totalMME <= 90 && (
              <Alert type="warning" title="Moderate MME Alert">
                Total daily MME of {totalMME.toFixed(1)} exceeds 50 MME/day. 
                Enhanced monitoring and justification for continued therapy recommended.
              </Alert>
            )}

            {mmeCalculations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medication
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dose
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Frequency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Conversion Factor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Daily MME
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mmeCalculations.map((calc, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {calc.medication}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {calc.dose} mg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {calc.frequency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {calc.conversionFactor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {calc.dailyMME.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        Total Daily MME:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900">
                        {totalMME.toFixed(1)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No opioid medications found in current medication list</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Clinical Recommendations Summary */}
      <Card>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('recommendations')}
        >
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">Clinical Summary & Recommendations</h2>
          </div>
          {expandedSections.recommendations ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>

        {expandedSections.recommendations && (
          <div className="mt-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4">Key Clinical Findings</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Genetic Status:</strong> CYP2D6 Poor Metabolizer - Significantly impacts prodrug opioid efficacy</p>
                <p><strong>Risk Level:</strong> {riskAssessment.overallRisk.replace('_', ' ')} addiction risk</p>
                <p><strong>Current MME:</strong> {totalMME.toFixed(1)} mg/day</p>
                <p><strong>Monitoring Level:</strong> {
                  riskAssessment.overallRisk === 'low' ? 'Standard' :
                  riskAssessment.overallRisk === 'moderate' ? 'Enhanced' :
                  riskAssessment.overallRisk === 'high' ? 'Intensive' : 'Maximum'
                }</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Preferred Opioids</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Oxycodone (not CYP2D6 dependent)</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Morphine (direct acting)</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Tapentadol (if available)</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Avoid/Use Caution</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm">Codeine (poor efficacy)</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm">Hydrocodone (reduced efficacy)</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm">Tramadol (poor efficacy + seizure risk)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-900 mb-4">Monitoring Requirements</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Clinical Monitoring:</h4>
                  <ul className="space-y-1 list-disc list-inside text-gray-700">
                    <li>Pain and function assessments</li>
                    <li>Signs of misuse or diversion</li>
                    <li>Mental health status</li>
                    <li>Sleep apnea screening</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Laboratory/Tools:</h4>
                  <ul className="space-y-1 list-disc list-inside text-gray-700">
                    <li>PDMP checks before prescribing</li>
                    <li>Urine drug testing as indicated</li>
                    <li>Risk assessment tools (ORT, SOAPP)</li>
                    <li>Naloxone education and prescription</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default OpioidRiskReport;