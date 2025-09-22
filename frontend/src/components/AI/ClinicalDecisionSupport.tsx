import React, { useState, useEffect, useMemo } from 'react';
import { Brain, Target, TrendingUp, AlertTriangle, CheckCircle, Clock, Users, FileText, Lightbulb, Activity, Shield } from 'lucide-react';
import Card from '../UI/Card';

interface ClinicalRecommendation {
  id: string;
  type: 'drug_selection' | 'dosing' | 'monitoring' | 'alternative' | 'contraindication' | 'genetic_testing';
  priority: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  title: string;
  description: string;
  rationale: string;
  evidence: string[];
  actions: string[];
  alternatives?: string[];
  monitoring?: string[];
  timeline?: string;
  cost?: 'low' | 'medium' | 'high';
  efficacy?: number;
  safety?: number;
}

interface PatientProfile {
  demographics: {
    age: number;
    gender: 'male' | 'female' | 'other';
    weight: number;
    height: number;
    ethnicity?: string;
  };
  diagnosis: {
    primary: string;
    stage?: string;
    histology?: string;
    biomarkers?: Record<string, string>;
    prognosis?: 'excellent' | 'good' | 'fair' | 'poor';
  };
  medicalHistory: {
    comorbidities: string[];
    previousTreatments: string[];
    allergies: string[];
    familyHistory: string[];
  };
  labValues: {
    creatinine?: number;
    bilirubin?: number;
    ast?: number;
    alt?: number;
    plateletCount?: number;
    neutrophilCount?: number;
    hemoglobin?: number;
  };
  genetics: {
    tested: boolean;
    variants?: Record<string, string>;
    phenotypes?: Record<string, string>;
  };
  preferences: {
    qualityOfLife?: number;
    treatmentGoals?: string[];
    contraindications?: string[];
  };
}

interface ClinicalDecisionSupportProps {
  patientProfile: PatientProfile;
  currentMedications: string[];
  proposedTreatment?: string;
  onRecommendationAccept: (recommendation: ClinicalRecommendation) => void;
}

const ClinicalDecisionSupport: React.FC<ClinicalDecisionSupportProps> = ({
  patientProfile,
  currentMedications,
  proposedTreatment,
  onRecommendationAccept
}) => {
  const [recommendations, setRecommendations] = useState<ClinicalRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // AI-powered recommendation generation
  const generateRecommendations = async () => {
    setLoading(true);

    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    const recs: ClinicalRecommendation[] = [];

    // Age-based recommendations
    if (patientProfile.demographics.age > 65) {
      recs.push({
        id: '1',
        type: 'dosing',
        priority: 'high',
        confidence: 90,
        title: 'Geriatric Dosing Adjustment',
        description: 'Consider reduced initial dosing due to advanced age',
        rationale: 'Elderly patients have reduced clearance and increased sensitivity to chemotherapy',
        evidence: ['Geriatric Oncology Guidelines', 'Age-adjusted dosing studies'],
        actions: ['Reduce initial dose by 20-25%', 'Monitor closely for toxicity'],
        monitoring: ['CBC weekly', 'Comprehensive metabolic panel', 'Performance status'],
        timeline: 'Before treatment initiation',
        cost: 'low',
        efficacy: 85,
        safety: 95
      });
    }

    // Genetic testing recommendations
    if (!patientProfile.genetics.tested && patientProfile.diagnosis.primary.includes('breast')) {
      recs.push({
        id: '2',
        type: 'genetic_testing',
        priority: 'high',
        confidence: 95,
        title: 'BRCA Testing Recommended',
        description: 'Genetic testing for BRCA1/2 mutations indicated',
        rationale: 'Results will guide treatment selection and family counseling',
        evidence: ['NCCN Guidelines', 'ASCO/SGO Guidelines'],
        actions: ['Order BRCA1/2 testing', 'Consider genetic counseling'],
        alternatives: ['Germline vs somatic testing', 'Multigene panel'],
        timeline: 'Before treatment decision',
        cost: 'medium',
        efficacy: 90,
        safety: 100
      });
    }

    // Renal function considerations
    if (patientProfile.labValues.creatinine && patientProfile.labValues.creatinine > 1.5) {
      recs.push({
        id: '3',
        type: 'dosing',
        priority: 'critical',
        confidence: 95,
        title: 'Renal Dose Adjustment Required',
        description: 'Significant renal impairment detected - dose adjustment needed',
        rationale: 'Elevated creatinine indicates reduced drug clearance',
        evidence: ['Kidney Disease Guidelines', 'Pharmacokinetic studies'],
        actions: ['Calculate CrCl using Cockcroft-Gault', 'Adjust dose per renal function'],
        monitoring: ['Creatinine before each cycle', 'Electrolytes', 'Urine output'],
        timeline: 'Immediate',
        cost: 'low',
        efficacy: 80,
        safety: 98
      });
    }

    // Biomarker-based treatment selection
    if (patientProfile.diagnosis.biomarkers?.HER2 === 'positive') {
      recs.push({
        id: '4',
        type: 'drug_selection',
        priority: 'high',
        confidence: 98,
        title: 'HER2-Targeted Therapy Indicated',
        description: 'HER2-positive status indicates benefit from targeted therapy',
        rationale: 'HER2-targeted agents significantly improve outcomes in HER2+ cancers',
        evidence: ['Multiple RCTs', 'FDA approval studies', 'Real-world evidence'],
        actions: ['Add trastuzumab to regimen', 'Consider pertuzumab combination'],
        alternatives: ['Trastuzumab emtansine (T-DM1)', 'Trastuzumab deruxtecan'],
        monitoring: ['ECHO/MUGA before treatment', 'Cardiac function q3months'],
        timeline: 'Treatment planning',
        cost: 'high',
        efficacy: 95,
        safety: 88
      });
    }

    // Drug interaction check
    if (currentMedications.includes('warfarin') && proposedTreatment?.includes('fluorouracil')) {
      recs.push({
        id: '5',
        type: 'contraindication',
        priority: 'critical',
        confidence: 92,
        title: 'Major Drug Interaction Detected',
        description: 'Warfarin and 5-FU interaction increases bleeding risk',
        rationale: '5-FU inhibits warfarin metabolism leading to increased anticoagulation',
        evidence: ['Drug interaction studies', 'Case reports'],
        actions: ['Consider alternative anticoagulant', 'If unavoidable, reduce warfarin dose'],
        alternatives: ['Apixaban', 'Rivaroxaban', 'Enoxaparin'],
        monitoring: ['INR weekly', 'Signs of bleeding', 'CBC'],
        timeline: 'Before treatment start',
        cost: 'medium',
        efficacy: 90,
        safety: 70
      });
    }

    // Performance status considerations
    if (patientProfile.preferences.qualityOfLife && patientProfile.preferences.qualityOfLife < 70) {
      recs.push({
        id: '6',
        type: 'alternative',
        priority: 'medium',
        confidence: 85,
        title: 'Consider Less Intensive Regimen',
        description: 'Poor performance status suggests need for modified approach',
        rationale: 'Quality of life preservation is priority given current functional status',
        evidence: ['QOL studies', 'Palliative care guidelines'],
        actions: ['Discuss goals of care', 'Consider single-agent therapy'],
        alternatives: ['Palliative care consultation', 'Best supportive care'],
        timeline: 'Treatment planning',
        cost: 'low',
        efficacy: 60,
        safety: 85
      });
    }

    // Hepatic function check
    if (patientProfile.labValues.bilirubin && patientProfile.labValues.bilirubin > 2.0) {
      recs.push({
        id: '7',
        type: 'dosing',
        priority: 'high',
        confidence: 90,
        title: 'Hepatic Dose Adjustment Required',
        description: 'Elevated bilirubin requires dose modification',
        rationale: 'Hepatic impairment reduces drug metabolism',
        evidence: ['Hepatic impairment studies', 'FDA guidelines'],
        actions: ['Reduce dose by 50% for moderate impairment', 'Consider alternative'],
        monitoring: ['LFTs before each cycle', 'Bilirubin trend'],
        timeline: 'Before treatment',
        cost: 'low',
        efficacy: 75,
        safety: 92
      });
    }

    setRecommendations(recs);
    setLoading(false);
  };

  useEffect(() => {
    if (patientProfile) {
      generateRecommendations();
    }
  }, [patientProfile, currentMedications, proposedTreatment]);

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      if (selectedCategory !== 'all' && rec.type !== selectedCategory) return false;
      if (selectedPriority !== 'all' && rec.priority !== selectedPriority) return false;
      return true;
    });
  }, [recommendations, selectedCategory, selectedPriority]);

  const priorityStats = useMemo(() => {
    const stats = { critical: 0, high: 0, medium: 0, low: 0 };
    recommendations.forEach(rec => stats[rec.priority]++);
    return stats;
  }, [recommendations]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'drug_selection': return <Target className="w-5 h-5" />;
      case 'dosing': return <Activity className="w-5 h-5" />;
      case 'monitoring': return <Clock className="w-5 h-5" />;
      case 'alternative': return <Lightbulb className="w-5 h-5" />;
      case 'contraindication': return <AlertTriangle className="w-5 h-5" />;
      case 'genetic_testing': return <FileText className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const formatType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">AI Clinical Decision Support</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Target className="w-4 h-4" />
              <span>Precision Medicine</span>
            </div>
          </div>
          {loading && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-500">Analyzing patient data...</span>
            </div>
          )}
        </div>

        {/* Stats Dashboard */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{priorityStats.critical}</div>
            <div className="text-sm text-gray-500">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{priorityStats.high}</div>
            <div className="text-sm text-gray-500">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{priorityStats.medium}</div>
            <div className="text-sm text-gray-500">Medium Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{recommendations.length}</div>
            <div className="text-sm text-gray-500">Total Recommendations</div>
          </div>
        </div>
      </Card>

      {/* Patient Summary */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Patient Profile Summary</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Demographics</h4>
            <div className="space-y-1 text-sm">
              <div>{patientProfile.demographics.age}y {patientProfile.demographics.gender}</div>
              <div>{patientProfile.demographics.weight}kg, {patientProfile.demographics.height}cm</div>
              {patientProfile.demographics.ethnicity && (
                <div>{patientProfile.demographics.ethnicity}</div>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Diagnosis</h4>
            <div className="space-y-1 text-sm">
              <div>{patientProfile.diagnosis.primary}</div>
              {patientProfile.diagnosis.stage && <div>Stage {patientProfile.diagnosis.stage}</div>}
              {patientProfile.diagnosis.biomarkers && (
                <div className="mt-2">
                  {Object.entries(patientProfile.diagnosis.biomarkers).map(([marker, status]) => (
                    <span key={marker} className="inline-block mr-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {marker}: {status}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Key Labs</h4>
            <div className="space-y-1 text-sm">
              {patientProfile.labValues.creatinine && (
                <div>Creatinine: {patientProfile.labValues.creatinine} mg/dL</div>
              )}
              {patientProfile.labValues.bilirubin && (
                <div>Bilirubin: {patientProfile.labValues.bilirubin} mg/dL</div>
              )}
              {patientProfile.labValues.hemoglobin && (
                <div>Hemoglobin: {patientProfile.labValues.hemoglobin} g/dL</div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recommendations ({filteredRecommendations.length})</h3>
          <div className="flex space-x-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-sm border-gray-300 rounded-md"
            >
              <option value="all">All Categories</option>
              <option value="drug_selection">Drug Selection</option>
              <option value="dosing">Dosing</option>
              <option value="monitoring">Monitoring</option>
              <option value="alternative">Alternatives</option>
              <option value="contraindication">Contraindications</option>
              <option value="genetic_testing">Genetic Testing</option>
            </select>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-sm border-gray-300 rounded-md"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.map(recommendation => (
          <Card key={recommendation.id}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getPriorityColor(recommendation.priority)}`}>
                  {getTypeIcon(recommendation.type)}
                  <span className="text-sm font-medium">{formatType(recommendation.type)}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                  {recommendation.priority.toUpperCase()}
                </div>
                <div className="text-sm text-gray-500">
                  Confidence: {recommendation.confidence}%
                </div>
              </div>
              <button
                onClick={() => onRecommendationAccept(recommendation)}
                className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
              >
                Accept
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{recommendation.title}</h4>
                <p className="text-gray-700">{recommendation.description}</p>
                <p className="text-sm text-gray-600 mt-2">{recommendation.rationale}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Recommended Actions</h5>
                  <ul className="space-y-1">
                    {recommendation.actions.map((action, index) => (
                      <li key={index} className="text-sm flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {recommendation.alternatives && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Alternatives</h5>
                      <div className="space-x-2">
                        {recommendation.alternatives.map(alt => (
                          <span key={alt} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {alt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {recommendation.monitoring && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Monitoring</h5>
                      <ul className="space-y-1">
                        {recommendation.monitoring.map((monitor, index) => (
                          <li key={index} className="text-sm flex items-start space-x-2">
                            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span>{monitor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Efficacy and Safety Metrics */}
              {(recommendation.efficacy || recommendation.safety) && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  {recommendation.efficacy && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Expected Efficacy</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${recommendation.efficacy}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{recommendation.efficacy}%</div>
                    </div>
                  )}
                  {recommendation.safety && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Safety Profile</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${recommendation.safety}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{recommendation.safety}%</div>
                    </div>
                  )}
                </div>
              )}

              {/* Evidence */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4" />
                  <span>Evidence:</span>
                  <span>{recommendation.evidence.join(', ')}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredRecommendations.length === 0 && !loading && (
        <Card>
          <div className="text-center py-12">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations</h3>
            <p className="text-gray-500">
              {recommendations.length === 0 
                ? 'No clinical recommendations generated for this patient profile'
                : 'No recommendations match the selected filters'
              }
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ClinicalDecisionSupport;