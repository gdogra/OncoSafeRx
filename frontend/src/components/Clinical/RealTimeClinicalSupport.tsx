import React, { useState, useEffect, useCallback } from 'react';
import { usePatient } from '../../context/PatientContext';
import Card from '../UI/Card';
import Alert from '../UI/Alert';
import Tooltip from '../UI/Tooltip';
import LoadingSpinner from '../UI/LoadingSpinner';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Activity,
  Heart,
  Brain,
  Shield,
  Info,
  Zap,
  Bell,
  Eye,
  TrendingUp,
  Users,
  Target,
  Stethoscope,
  Pill,
  FileText,
  Calendar,
  ArrowRight,
  AlertCircle,
  CheckSquare,
  PlayCircle,
  PauseCircle,
  Filter,
  Settings,
  Lightbulb,
  Star,
  ExternalLink
} from 'lucide-react';

interface ClinicalAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  priority: 'immediate' | 'urgent' | 'routine';
  category: 'drug_interaction' | 'dosing' | 'monitoring' | 'contraindication' | 'genetic' | 'lab_result' | 'clinical_pathway';
  title: string;
  message: string;
  details?: string;
  recommendations: string[];
  evidence_level: 'A' | 'B' | 'C';
  source: string;
  triggered_by: string;
  timestamp: string;
  acknowledged: boolean;
  dismissed: boolean;
  requires_action: boolean;
  auto_resolve: boolean;
  clinical_context: {
    condition?: string;
    medications?: string[];
    lab_values?: string[];
    risk_factors?: string[];
  };
  documentation?: {
    billing_codes?: string[];
    templates?: string[];
    references?: string[];
  };
}

interface ClinicalRecommendation {
  id: string;
  type: 'medication' | 'monitoring' | 'referral' | 'test' | 'documentation';
  title: string;
  description: string;
  rationale: string;
  evidence_grade: 'Strong' | 'Moderate' | 'Weak';
  guideline_source: string;
  alternatives?: string[];
  contraindications?: string[];
  monitoring_required?: string[];
  implementation_steps: string[];
  expected_outcome: string;
  follow_up_timeline: string;
}

interface WorkflowContext {
  current_view: 'prescribing' | 'reviewing' | 'monitoring' | 'documenting';
  patient_acuity: 'stable' | 'moderate' | 'critical';
  time_pressure: 'routine' | 'urgent' | 'stat';
  care_team_role: 'primary' | 'consulting' | 'covering';
}

const RealTimeClinicalSupport: React.FC = () => {
  const { state } = usePatient();
  const { currentPatient } = state;
  const [alerts, setAlerts] = useState<ClinicalAlert[]>([]);
  const [recommendations, setRecommendations] = useState<ClinicalRecommendation[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [workflowContext, setWorkflowContext] = useState<WorkflowContext>({
    current_view: 'reviewing',
    patient_acuity: 'moderate',
    time_pressure: 'routine',
    care_team_role: 'primary'
  });
  const [filters, setFilters] = useState({
    priority: 'all',
    category: 'all',
    acknowledged: false
  });
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  // Real-time clinical decision support engine
  const analyzePatientContext = useCallback(() => {
    if (!currentPatient) return;

    const newAlerts: ClinicalAlert[] = [];
    const newRecommendations: ClinicalRecommendation[] = [];

    // 1. Critical Drug Interaction Analysis
    const opioidMeds = (currentPatient.medications || []).filter((med: any) =>
      med.name && ['oxycodone', 'morphine', 'fentanyl', 'hydrocodone', 'codeine'].some(opioid =>
        med.name.toLowerCase().includes(opioid)
      )
    );
    
    const benzoMeds = (currentPatient.medications || []).filter((med: any) =>
      med.name && ['alprazolam', 'lorazepam', 'clonazepam', 'diazepam'].some(benzo =>
        med.name.toLowerCase().includes(benzo)
      )
    );

    if (opioidMeds.length > 0 && benzoMeds.length > 0) {
      newAlerts.push({
        id: 'opioid-benzo-interaction',
        type: 'critical',
        priority: 'immediate',
        category: 'drug_interaction',
        title: 'CRITICAL: Opioid + Benzodiazepine Combination',
        message: 'High risk of respiratory depression and death',
        details: `Patient is prescribed ${opioidMeds[0].name} and ${benzoMeds[0].name} concurrently`,
        recommendations: [
          'Consider alternative anxiety management',
          'If unavoidable, use lowest effective doses',
          'Prescribe naloxone',
          'Implement enhanced monitoring',
          'Document medical necessity'
        ],
        evidence_level: 'A',
        source: 'FDA Black Box Warning',
        triggered_by: 'Medication combination analysis',
        timestamp: new Date().toISOString(),
        acknowledged: false,
        dismissed: false,
        requires_action: true,
        auto_resolve: false,
        clinical_context: {
          medications: [opioidMeds[0].name, benzoMeds[0].name],
          risk_factors: ['Concurrent CNS depressants']
        },
        documentation: {
          billing_codes: ['Z79.891', 'Z87.891'],
          templates: ['High-risk medication documentation template'],
          references: ['FDA Safety Communication 2016']
        }
      });
    }

    // 2. Dosing Alerts Based on Patient Factors
    const dob = currentPatient?.demographics?.dateOfBirth;
    const age = dob ? (new Date().getFullYear() - new Date(dob).getFullYear()) : undefined;
    if (age && age > 65) {
      (currentPatient.medications || []).forEach((med: any) => {
        if (med.name && med.name.toLowerCase().includes('digoxin')) {
          newAlerts.push({
            id: 'geriatric-digoxin-dosing',
            type: 'warning',
            priority: 'urgent',
            category: 'dosing',
            title: 'Geriatric Dosing Alert: Digoxin',
            message: 'Elderly patients require reduced digoxin dosing',
            recommendations: [
              'Consider 50% dose reduction',
              'Monitor digoxin levels closely',
              'Check renal function',
              'Consider alternative rate control agents'
            ],
            evidence_level: 'A',
            source: 'Beers Criteria 2023',
            triggered_by: 'Age-based analysis',
            timestamp: new Date().toISOString(),
            acknowledged: false,
            dismissed: false,
            requires_action: true,
            auto_resolve: false,
            clinical_context: {
              medications: [med.name],
              risk_factors: [`Age ${age} years`]
            }
          });
        }
      });
    }

    // 3. Genetic-Based Recommendations
    newRecommendations.push({
      id: 'cyp2d6-poor-metabolizer',
      type: 'medication',
      title: 'CYP2D6 Poor Metabolizer: Avoid Prodrug Opioids',
      description: 'Patient has CYP2D6 poor metabolizer status affecting opioid efficacy',
      rationale: 'Codeine, hydrocodone, and tramadol require CYP2D6 for conversion to active metabolites',
      evidence_grade: 'Strong',
      guideline_source: 'CPIC Guidelines 2024',
      alternatives: ['Oxycodone', 'Morphine', 'Tapentadol'],
      contraindications: ['Codeine', 'Hydrocodone', 'Tramadol'],
      monitoring_required: ['Pain scores', 'Functional status', 'Side effects'],
      implementation_steps: [
        'Avoid CYP2D6-dependent opioids',
        'Use alternative opioids at standard doses',
        'Monitor for adequate pain control',
        'Document genetic basis for medication selection'
      ],
      expected_outcome: 'Improved pain control with reduced risk of inadequate analgesia',
      follow_up_timeline: '24-48 hours for pain reassessment'
    });

    // 4. Lab-Based Monitoring Alerts
    if ((currentPatient.labValues || []).length > 0) {
      const recentCreatinine = (currentPatient.labValues || [])
        .filter(lab => lab.labType && lab.labType.toLowerCase().includes('creatinine'))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      if (recentCreatinine && parseFloat(recentCreatinine.value) > 1.5) {
        newAlerts.push({
          id: 'renal-function-alert',
          type: 'warning',
          priority: 'urgent',
          category: 'monitoring',
          title: 'Renal Function Alert',
          message: 'Elevated creatinine may require medication dose adjustments',
          details: `Current creatinine: ${recentCreatinine.value} mg/dL (Normal: 0.6-1.2)`,
          recommendations: [
            'Calculate eGFR for accurate assessment',
            'Review renally-cleared medications',
            'Consider dose adjustments',
            'Monitor fluid balance',
            'Nephrology consultation if worsening'
          ],
          evidence_level: 'A',
          source: 'Clinical Practice Guidelines',
          triggered_by: 'Laboratory result analysis',
          timestamp: new Date().toISOString(),
          acknowledged: false,
          dismissed: false,
          requires_action: true,
          auto_resolve: false,
          clinical_context: {
            lab_values: [`Creatinine ${recentCreatinine.value} mg/dL`]
          }
        });
      }
    }

    // 5. Clinical Pathway Recommendations
    if (currentPatient.primaryDiagnosis && currentPatient.primaryDiagnosis.toLowerCase().includes('cancer')) {
      newRecommendations.push({
        id: 'nccn-pathway-adherence',
        type: 'referral',
        title: 'NCCN Guideline Adherence Check',
        description: 'Ensure treatment plan aligns with current NCCN guidelines',
        rationale: 'Evidence-based pathways improve outcomes and reduce variation',
        evidence_grade: 'Strong',
        guideline_source: 'NCCN Guidelines 2024',
        implementation_steps: [
          'Review current NCCN recommendations',
          'Compare current treatment plan',
          'Identify any deviations',
          'Document rationale for any variations',
          'Consider multidisciplinary review'
        ],
        expected_outcome: 'Optimized treatment plan with evidence-based approach',
        follow_up_timeline: 'Next clinic visit'
      });
    }

    // 6. Quality Metric Alerts
    newRecommendations.push({
      id: 'quality-metric-documentation',
      type: 'documentation',
      title: 'Quality Measure Documentation Opportunity',
      description: 'Capture quality metrics for value-based care programs',
      rationale: 'Proper documentation supports quality scores and reimbursement',
      evidence_grade: 'Moderate',
      guideline_source: 'CMS Quality Measures',
      implementation_steps: [
        'Document pain scores (0-10 scale)',
        'Record functional status assessment',
        'Note medication adherence',
        'Document patient education provided',
        'Code appropriate ICD-10 and CPT codes'
      ],
      expected_outcome: 'Improved quality scores and comprehensive patient care documentation',
      follow_up_timeline: 'End of encounter'
    });

    setAlerts(newAlerts);
    setRecommendations(newRecommendations);
  }, [currentPatient]);

  // Real-time monitoring effect
  useEffect(() => {
    if (!isMonitoring || !currentPatient) return;

    // Initial analysis
    analyzePatientContext();

    // Set up real-time monitoring (simulated)
    const interval = setInterval(() => {
      analyzePatientContext();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [currentPatient, isMonitoring, analyzePatientContext]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info': return <Info className="w-5 h-5 text-blue-600" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      case 'success': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'immediate': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-yellow-100 text-yellow-800';
      case 'routine': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (alert.dismissed) return false;
    if (filters.acknowledged && alert.acknowledged) return false;
    if (filters.priority !== 'all' && alert.priority !== filters.priority) return false;
    if (filters.category !== 'all' && alert.category !== filters.category) return false;
    return true;
  });

  const criticalAlertsCount = filteredAlerts.filter(a => a.type === 'critical').length;
  const warningAlertsCount = filteredAlerts.filter(a => a.type === 'warning').length;

  if (!currentPatient) {
    return (
      <Card>
        <div className="text-center py-12">
          <Stethoscope className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">Real-Time Clinical Support</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Select a patient to activate real-time clinical decision support and monitoring
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Real-Time Status */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Real-Time Clinical Decision Support</h1>
              <p className="text-gray-600">
                Active monitoring for {currentPatient.demographics.firstName} {currentPatient.demographics.lastName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
              </span>
            </div>
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                isMonitoring ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isMonitoring ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
              <span>{isMonitoring ? 'Pause' : 'Resume'}</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Alert Summary Dashboard */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-gray-600">Critical Alerts</span>
          </div>
          <div className="text-3xl font-bold text-red-600">{criticalAlertsCount}</div>
        </Card>
        
        <Card className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">Warnings</span>
          </div>
          <div className="text-3xl font-bold text-yellow-600">{warningAlertsCount}</div>
        </Card>
        
        <Card className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Recommendations</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">{recommendations.length}</div>
        </Card>
        
        <Card className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Last Update</span>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {new Date().toLocaleTimeString()}
          </div>
        </Card>
      </div>

      {/* Critical Alerts Section */}
      {filteredAlerts.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Bell className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900">Active Clinical Alerts</h2>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="immediate">Immediate</option>
                <option value="urgent">Urgent</option>
                <option value="routine">Routine</option>
              </select>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="drug_interaction">Drug Interactions</option>
                <option value="dosing">Dosing</option>
                <option value="monitoring">Monitoring</option>
                <option value="genetic">Genetic</option>
                <option value="contraindication">Contraindications</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className={`border rounded-lg p-4 ${getAlertColor(alert.type)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getAlertIcon(alert.type)}
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(alert.priority)}`}>
                          {alert.priority.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          Evidence: {alert.evidence_level}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{alert.message}</p>
                    
                    {alert.details && (
                      <p className="text-sm text-gray-600 mb-3 bg-white p-3 rounded border">
                        {alert.details}
                      </p>
                    )}

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Clinical Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {alert.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Source: {alert.source}</span>
                      <span>Triggered by: {alert.triggered_by}</span>
                      <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <CheckSquare className="w-4 h-4" />
                        <span>Acknowledge</span>
                      </button>
                    )}
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Dismiss</span>
                    </button>
                    {alert.documentation && (
                      <button className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                        <FileText className="w-4 h-4" />
                        <span>Document</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Clinical Recommendations */}
      <Card>
        <div className="flex items-center space-x-2 mb-6">
          <Lightbulb className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Evidence-Based Recommendations</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {recommendations.map((rec) => (
            <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{rec.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      rec.evidence_grade === 'Strong' ? 'bg-green-100 text-green-800' :
                      rec.evidence_grade === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {rec.evidence_grade} Evidence
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {rec.type}
                    </span>
                  </div>
                </div>
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              
              <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
              <p className="text-xs text-gray-600 mb-3 italic">Rationale: {rec.rationale}</p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Implementation Steps:</h4>
                  <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                    {rec.implementation_steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Source: {rec.guideline_source}</span>
                    <span>Follow-up: {rec.follow_up_timeline}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Workflow Context Panel */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-6 h-6 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-900">Workflow Context</h2>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current View</label>
            <select
              value={workflowContext.current_view}
              onChange={(e) => setWorkflowContext(prev => ({ ...prev, current_view: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="prescribing">Prescribing</option>
              <option value="reviewing">Reviewing</option>
              <option value="monitoring">Monitoring</option>
              <option value="documenting">Documenting</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Acuity</label>
            <select
              value={workflowContext.patient_acuity}
              onChange={(e) => setWorkflowContext(prev => ({ ...prev, patient_acuity: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="stable">Stable</option>
              <option value="moderate">Moderate</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Pressure</label>
            <select
              value={workflowContext.time_pressure}
              onChange={(e) => setWorkflowContext(prev => ({ ...prev, time_pressure: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="stat">STAT</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Care Team Role</label>
            <select
              value={workflowContext.care_team_role}
              onChange={(e) => setWorkflowContext(prev => ({ ...prev, care_team_role: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="primary">Primary</option>
              <option value="consulting">Consulting</option>
              <option value="covering">Covering</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RealTimeClinicalSupport;
