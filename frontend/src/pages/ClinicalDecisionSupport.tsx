import React, { useState } from 'react';
import { 
  Stethoscope, 
  Calculator, 
  Brain, 
  Target, 
  AlertTriangle,
  TrendingUp,
  Users,
  FileText,
  Activity
} from 'lucide-react';
import Card from '../components/UI/Card';
import AdvancedDoseCalculator from '../components/Clinical/AdvancedDoseCalculator';
import { Patient } from '../types/clinical';

const ClinicalDecisionSupport: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dose-calculator');
  const [currentPatient, setCurrentPatient] = useState<Patient | undefined>();

  const tabs = [
    {
      id: 'dose-calculator',
      label: 'Dose Calculator',
      icon: Calculator,
      description: 'Advanced dosing with organ function adjustments'
    },
    {
      id: 'clinical-alerts',
      label: 'Clinical Alerts',
      icon: AlertTriangle,
      description: 'Real-time contraindication and safety alerts'
    },
    {
      id: 'guidelines',
      label: 'Treatment Guidelines',
      icon: FileText,
      description: 'Evidence-based treatment recommendations'
    },
    {
      id: 'risk-assessment',
      label: 'Risk Assessment',
      icon: Target,
      description: 'Patient-specific risk stratification'
    },
    {
      id: 'ai-recommendations',
      label: 'AI Recommendations',
      icon: Brain,
      description: 'ML-powered treatment suggestions'
    }
  ];

  const quickStats = [
    {
      label: 'Dose Calculations Today',
      value: '47',
      change: '+12%',
      icon: Calculator,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      label: 'Critical Alerts',
      value: '3',
      change: '-25%',
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-100'
    },
    {
      label: 'Patients Reviewed',
      value: '23',
      change: '+8%',
      icon: Users,
      color: 'text-green-600 bg-green-100'
    },
    {
      label: 'Guidelines Accessed',
      value: '15',
      change: '+15%',
      icon: FileText,
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dose-calculator':
        return (
          <AdvancedDoseCalculator 
            patient={currentPatient}
            onPatientChange={setCurrentPatient}
          />
        );
      
      case 'clinical-alerts':
        return (
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Clinical Alerts</h2>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-red-900">Contraindication Alert</h3>
                      <p className="text-sm text-red-700 mt-1">
                        Patient has documented allergy to carboplatin. Consider alternative platinum agent.
                      </p>
                      <div className="mt-2">
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          Patient: John Doe (MRN: 12345)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-900">Dose Adjustment Required</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Patient has creatinine clearance of 45 mL/min. Cisplatin dose reduction recommended.
                      </p>
                      <div className="mt-2">
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Patient: Jane Smith (MRN: 67890)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900">Monitoring Reminder</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        ECHO due for patient on doxorubicin. Schedule cardiac function assessment.
                      </p>
                      <div className="mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Patient: Bob Johnson (MRN: 11111)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'guidelines':
        return (
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Treatment Guidelines</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer">
                  <h3 className="font-medium text-gray-900">NCCN Non-Small Cell Lung Cancer</h3>
                  <p className="text-sm text-gray-600 mt-1">v4.2024 - Stage IV Treatment Options</p>
                  <div className="mt-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Updated</span>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer">
                  <h3 className="font-medium text-gray-900">ASCO Breast Cancer Guidelines</h3>
                  <p className="text-sm text-gray-600 mt-1">HER2+ Metastatic Treatment Recommendations</p>
                  <div className="mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Category 1</span>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer">
                  <h3 className="font-medium text-gray-900">ESMO Colorectal Guidelines</h3>
                  <p className="text-sm text-gray-600 mt-1">MSI-H Treatment Algorithms</p>
                  <div className="mt-2">
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Level I</span>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer">
                  <h3 className="font-medium text-gray-900">FDA Approved Indications</h3>
                  <p className="text-sm text-gray-600 mt-1">Recently Approved Oncology Drugs</p>
                  <div className="mt-2">
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Recent</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'risk-assessment':
        return (
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Risk Assessment</h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-medium text-green-900">Low Risk</h3>
                    <div className="text-2xl font-bold text-green-900 mt-2">67%</div>
                    <p className="text-sm text-green-700 mt-1">Standard dosing appropriate</p>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-medium text-yellow-900">Moderate Risk</h3>
                    <div className="text-2xl font-bold text-yellow-900 mt-2">28%</div>
                    <p className="text-sm text-yellow-700 mt-1">Enhanced monitoring required</p>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-medium text-red-900">High Risk</h3>
                    <div className="text-2xl font-bold text-red-900 mt-2">5%</div>
                    <p className="text-sm text-red-700 mt-1">Consider dose reduction</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Risk Factors Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Age ≥65 years</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Moderate</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">ECOG Performance Status ≥2</span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">High</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Creatinine Clearance &lt;60 mL/min</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Moderate</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Prior Radiation Therapy</span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Moderate</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'ai-recommendations':
        return (
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Recommendations</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Brain className="w-6 h-6 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Optimal Treatment Sequence</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Based on patient biomarkers and treatment history, the AI recommends:
                      </p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">1</span>
                          <span className="text-sm">Pembrolizumab + Chemotherapy (Expected Response: 65%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 bg-gray-400 text-white text-xs rounded-full flex items-center justify-center">2</span>
                          <span className="text-sm">Docetaxel + Ramucirumab (Expected Response: 40%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 bg-gray-400 text-white text-xs rounded-full flex items-center justify-center">3</span>
                          <span className="text-sm">Nivolumab Monotherapy (Expected Response: 25%)</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Confidence: 87% | Based on 1,247 similar cases
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-6 h-6 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Outcome Prediction</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Predicted outcomes for recommended therapy:
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-lg font-semibold text-green-900">12.4 months</div>
                          <div className="text-xs text-green-700">Predicted PFS</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-green-900">24.7 months</div>
                          <div className="text-xs text-green-700">Predicted OS</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Model accuracy: 82% | Training set: 15,000+ patients
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Target className="w-6 h-6 text-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Biomarker Insights</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Key biomarkers influencing treatment recommendations:
                      </p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">PD-L1 Expression (85%)</span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Strong Predictor</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">TMB (12 mut/Mb)</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Moderate Predictor</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">KRAS G12C Mutation</span>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Actionable Target</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Stethoscope className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Clinical Decision Support</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Advanced clinical decision support tools for precision oncology care
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} padding="sm">
              <div className="flex items-center">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-xs font-medium text-green-600">{stat.change}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
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
      </Card>

      {/* Tab Content */}
      {renderActiveTabContent()}
    </div>
  );
};

export default ClinicalDecisionSupport;