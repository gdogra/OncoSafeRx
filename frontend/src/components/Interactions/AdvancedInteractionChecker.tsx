import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, Shield, Brain, Activity, Clock, Users, FileText, ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Card from '../UI/Card';
import { Drug } from '../../types';
import { interactionService } from '../../services/api';

interface DrugInteraction {
  id: string;
  drug1: string;
  drug2: string;
  severity: 'major' | 'moderate' | 'minor';
  mechanism: string;
  clinicalEffect: string;
  recommendation: string;
  evidence: 'established' | 'probable' | 'possible' | 'theoretical';
  references: string[];
  alternatives?: string[];
  monitoring?: string[];
  doseAdjustment?: string;
  contraindicated?: boolean;
  onsetTime?: string;
  duration?: string;
  prevalence?: number;
}

interface ClinicalRecommendation {
  type: 'avoid' | 'monitor' | 'adjust_dose' | 'adjust_timing' | 'consider_alternative';
  priority: 'high' | 'medium' | 'low';
  description: string;
  action: string;
  rationale: string;
}

interface AdvancedInteractionCheckerProps {
  selectedDrugs: Drug[];
  onDrugRemove: (drugId: string) => void;
  patientProfile?: {
    age?: number;
    weight?: number;
    renalFunction?: 'normal' | 'mild' | 'moderate' | 'severe';
    hepaticFunction?: 'normal' | 'mild' | 'moderate' | 'severe';
    comorbidities?: string[];
    allergies?: string[];
  };
}

const AdvancedInteractionChecker: React.FC<AdvancedInteractionCheckerProps> = ({
  selectedDrugs,
  onDrugRemove,
  patientProfile
}) => {
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [recommendations, setRecommendations] = useState<ClinicalRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedEvidence, setSelectedEvidence] = useState<string>('all');

  useEffect(() => {
    const run = async () => {
      if (selectedDrugs.length < 2) {
        setInteractions([]);
        setRecommendations([]);
        return;
      }
      setLoading(true);
      try {
        const payload = selectedDrugs.map(d => ({ rxcui: d.rxcui, name: d.name }));
        const result = await interactionService.checkInteractions(payload);
        const all = [
          ...(result?.interactions?.stored || []),
          ...(result?.interactions?.external || [])
        ];
        const mapped: DrugInteraction[] = all.map((i: any, idx: number) => ({
          id: i.id || `${i.drug1_rxcui || ''}-${i.drug2_rxcui || ''}-${idx}`,
          drug1: i.drug1?.name || `Drug ${i.drug1_rxcui}`,
          drug2: i.drug2?.name || `Drug ${i.drug2_rxcui}`,
          severity: (String(i.severity || 'unknown').toLowerCase() === 'high') ? 'major'
                   : (String(i.severity || 'unknown').toLowerCase() === 'low') ? 'minor'
                   : (String(i.severity || 'unknown').toLowerCase() as any),
          mechanism: i.mechanism || i.description || '—',
          clinicalEffect: i.effect || i.description || '—',
          recommendation: i.management || '—',
          evidence: ((i.evidence_level || '').toLowerCase() === 'a' ? 'established'
                   : (i.evidence_level || '').toLowerCase() === 'b' ? 'probable'
                   : (i.evidence_level || '').toLowerCase() === 'c' ? 'possible'
                   : 'theoretical') as any,
          references: Array.isArray(i.sources) ? i.sources : (i.sources ? [i.sources] : []),
          contraindicated: false,
        }));
        setInteractions(mapped);
        generateRecommendations(mapped);
      } catch (e) {
        console.warn('AdvancedInteractionChecker fetch failed:', (e as any)?.message || e);
        setInteractions([]);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [selectedDrugs]);

  const generateRecommendations = (interactions: DrugInteraction[]) => {
    const recs: ClinicalRecommendation[] = [];

    interactions.forEach(interaction => {
      if (interaction.contraindicated) {
        recs.push({
          type: 'avoid',
          priority: 'high',
          description: `Contraindicated combination: ${interaction.drug1} + ${interaction.drug2}`,
          action: 'Consider alternative medications',
          rationale: interaction.clinicalEffect
        });
      } else if (interaction.severity === 'major') {
        if (interaction.alternatives) {
          recs.push({
            type: 'consider_alternative',
            priority: 'high',
            description: `High-risk interaction: ${interaction.drug1} + ${interaction.drug2}`,
            action: `Consider alternatives: ${interaction.alternatives.join(', ')}`,
            rationale: interaction.clinicalEffect
          });
        }
        if (interaction.monitoring) {
          recs.push({
            type: 'monitor',
            priority: 'high',
            description: `Intensive monitoring required`,
            action: interaction.monitoring.join(', '),
            rationale: 'Major interaction with significant clinical consequences'
          });
        }
      } else if (interaction.severity === 'moderate') {
        recs.push({
          type: 'monitor',
          priority: 'medium',
          description: `Moderate interaction: ${interaction.drug1} + ${interaction.drug2}`,
          action: interaction.recommendation,
          rationale: interaction.clinicalEffect
        });
      }

      if (interaction.doseAdjustment) {
        recs.push({
          type: 'adjust_dose',
          priority: interaction.severity === 'major' ? 'high' : 'medium',
          description: `Dose adjustment recommended`,
          action: interaction.doseAdjustment,
          rationale: interaction.mechanism
        });
      }
    });

    // Patient-specific recommendations
    if (patientProfile?.renalFunction && patientProfile.renalFunction !== 'normal') {
      recs.push({
        type: 'adjust_dose',
        priority: 'medium',
        description: 'Renal impairment detected',
        action: 'Consider dose adjustments for renally eliminated drugs',
        rationale: `Patient has ${patientProfile.renalFunction} renal function`
      });
    }

    if (patientProfile?.hepaticFunction && patientProfile.hepaticFunction !== 'normal') {
      recs.push({
        type: 'adjust_dose',
        priority: 'medium',
        description: 'Hepatic impairment detected',
        action: 'Consider dose adjustments for hepatically metabolized drugs',
        rationale: `Patient has ${patientProfile.hepaticFunction} hepatic function`
      });
    }

    setRecommendations(recs);
  };

  const filteredInteractions = useMemo(() => {
    return interactions.filter(interaction => {
      if (selectedSeverity !== 'all' && interaction.severity !== selectedSeverity) {
        return false;
      }
      if (selectedEvidence !== 'all' && interaction.evidence !== selectedEvidence) {
        return false;
      }
      return true;
    });
  }, [interactions, selectedSeverity, selectedEvidence]);

  const severityStats = useMemo(() => {
    const stats = { major: 0, moderate: 0, minor: 0 };
    interactions.forEach(interaction => {
      stats[interaction.severity]++;
    });
    return stats;
  }, [interactions]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'major': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'minor': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'major': return <XCircle className="w-4 h-4" />;
      case 'moderate': return <AlertCircle className="w-4 h-4" />;
      case 'minor': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getEvidenceColor = (evidence: string) => {
    switch (evidence) {
      case 'established': return 'text-blue-600 bg-blue-50';
      case 'probable': return 'text-indigo-600 bg-indigo-50';
      case 'possible': return 'text-purple-600 bg-purple-50';
      case 'theoretical': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Advanced Interaction Analysis</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Brain className="w-4 h-4" />
              <span>AI-Enhanced</span>
            </div>
          </div>
          {loading && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-500">Analyzing interactions...</span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {interactions.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{severityStats.major}</div>
              <div className="text-sm text-gray-500">Major</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{severityStats.moderate}</div>
              <div className="text-sm text-gray-500">Moderate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{severityStats.minor}</div>
              <div className="text-sm text-gray-500">Minor</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{recommendations.length}</div>
              <div className="text-sm text-gray-500">Recommendations</div>
            </div>
          </div>
        )}
      </Card>

      {/* Selected Drugs */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Medications ({selectedDrugs.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {selectedDrugs.map(drug => (
            <div key={drug.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{drug.name}</div>
                <div className="text-sm text-gray-500">{drug.genericName}</div>
              </div>
              <button
                onClick={() => onDrugRemove(drug.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Clinical Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Clinical Recommendations</h3>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {rec.type === 'avoid' && <XCircle className="w-5 h-5" />}
                    {rec.type === 'monitor' && <Activity className="w-5 h-5" />}
                    {rec.type === 'adjust_dose' && <AlertCircle className="w-5 h-5" />}
                    {rec.type === 'consider_alternative' && <Shield className="w-5 h-5" />}
                    {rec.type === 'adjust_timing' && <Clock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{rec.description}</div>
                    <div className="text-sm mt-1">{rec.action}</div>
                    <div className="text-xs mt-2 opacity-75">{rec.rationale}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-50">
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Interactions List */}
      {interactions.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Drug Interactions ({filteredInteractions.length})</h3>
            <div className="flex space-x-3">
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="text-sm border-gray-300 rounded-md"
              >
                <option value="all">All Severities</option>
                <option value="major">Major</option>
                <option value="moderate">Moderate</option>
                <option value="minor">Minor</option>
              </select>
              <select
                value={selectedEvidence}
                onChange={(e) => setSelectedEvidence(e.target.value)}
                className="text-sm border-gray-300 rounded-md"
              >
                <option value="all">All Evidence Levels</option>
                <option value="established">Established</option>
                <option value="probable">Probable</option>
                <option value="possible">Possible</option>
                <option value="theoretical">Theoretical</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredInteractions.map(interaction => (
              <div key={interaction.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border ${getSeverityColor(interaction.severity)}`}>
                      {getSeverityIcon(interaction.severity)}
                      <span className="text-sm font-medium capitalize">{interaction.severity}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getEvidenceColor(interaction.evidence)}`}>
                      {interaction.evidence.charAt(0).toUpperCase() + interaction.evidence.slice(1)} Evidence
                    </div>
                    {interaction.contraindicated && (
                      <div className="px-3 py-1 rounded-full text-xs font-medium text-red-600 bg-red-100">
                        CONTRAINDICATED
                      </div>
                    )}
                  </div>
                  {interaction.prevalence && (
                    <div className="text-sm text-gray-500">
                      Prevalence: {interaction.prevalence}%
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Interaction Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Drugs:</strong> {interaction.drug1} + {interaction.drug2}</div>
                      <div><strong>Mechanism:</strong> {interaction.mechanism}</div>
                      <div><strong>Clinical Effect:</strong> {interaction.clinicalEffect}</div>
                      <div><strong>Recommendation:</strong> {interaction.recommendation}</div>
                      {interaction.onsetTime && (
                        <div><strong>Onset:</strong> {interaction.onsetTime}</div>
                      )}
                      {interaction.duration && (
                        <div><strong>Duration:</strong> {interaction.duration}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Clinical Management</h4>
                    <div className="space-y-3 text-sm">
                      {interaction.alternatives && (
                        <div>
                          <strong>Alternatives:</strong>
                          <div className="mt-1 space-x-2">
                            {interaction.alternatives.map(alt => (
                              <span key={alt} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {alt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {interaction.monitoring && (
                        <div>
                          <strong>Monitoring:</strong>
                          <ul className="mt-1 space-y-1">
                            {interaction.monitoring.map(monitor => (
                              <li key={monitor} className="text-xs">• {monitor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {interaction.doseAdjustment && (
                        <div>
                          <strong>Dose Adjustment:</strong> {interaction.doseAdjustment}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {interaction.references && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <FileText className="w-4 h-4" />
                      <span>References:</span>
                      {interaction.references.map(ref => (
                        <a key={ref} href={`https://pubmed.ncbi.nlm.nih.gov/${ref.replace('PMID: ', '')}`} 
                           target="_blank" rel="noopener noreferrer"
                           className="text-primary-600 hover:text-primary-700 flex items-center space-x-1">
                          <span>{ref}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Patient Profile Considerations */}
      {patientProfile && (
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Patient-Specific Considerations</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Demographics</h4>
              <div className="space-y-1 text-sm">
                {patientProfile.age ? (
                  <div>Age: {patientProfile.age} years</div>
                ) : (
                  <div className="text-gray-500 italic">Age not provided</div>
                )}
                {patientProfile.weight ? (
                  <div>Weight: {patientProfile.weight} kg</div>
                ) : (
                  <div className="text-gray-500 italic">Weight not provided</div>
                )}
                {!patientProfile.age && !patientProfile.weight && (
                  <div className="text-gray-500 italic">
                    <a href="/profile" className="text-primary-600 hover:text-primary-700 underline">
                      Add demographics in your profile
                    </a> for more accurate interaction analysis
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Organ Function</h4>
              <div className="space-y-1 text-sm">
                <div>Renal: {patientProfile.renalFunction || 'Normal'}</div>
                <div>Hepatic: {patientProfile.hepaticFunction || 'Normal'}</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Comorbidities</h4>
            {patientProfile.comorbidities && patientProfile.comorbidities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patientProfile.comorbidities.map(condition => (
                  <span key={condition} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                    {condition}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic text-sm">No comorbidities recorded</div>
            )}
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Allergies</h4>
            {patientProfile.allergies && patientProfile.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patientProfile.allergies.map(allergy => (
                  <span key={allergy} className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">
                    {allergy}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic text-sm">No allergies recorded</div>
            )}
          </div>
        </Card>
      )}

      {selectedDrugs.length < 2 && (
        <Card>
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select Multiple Medications</h3>
            <p className="text-gray-500">
              Add at least 2 medications to check for potential drug interactions
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdvancedInteractionChecker;
