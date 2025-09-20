import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserPersona } from '../../types/user';
import { 
  User, 
  Settings, 
  ChevronDown, 
  ChevronUp,
  CheckCircle,
  Clock,
  Star,
  BookOpen,
  Users,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import Card from '../UI/Card';
import Tooltip from '../UI/Tooltip';

const PersonaSelector: React.FC = () => {
  const { state, actions } = useAuth();
  const { user } = state;
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<UserPersona | null>(user?.persona || null);

  if (!user) {
    return null;
  }

  // Predefined personas for each role
  const getPersonasForRole = (role: string): UserPersona[] => {
    const basePersonas: Record<string, UserPersona[]> = {
      oncologist: [
        {
          id: 'oncologist-novice',
          name: 'New Attending Oncologist',
          description: 'Recently completed fellowship, cautious approach to complex cases',
          role: 'oncologist',
          experienceLevel: 'novice',
          specialties: ['general oncology'],
          preferences: {
            riskTolerance: 'conservative',
            alertSensitivity: 'high',
            workflowStyle: 'thorough',
            decisionSupport: 'guided',
          },
          customSettings: {
            requiredApprovals: true,
            detailedExplanations: true,
            stepByStepGuidance: true
          }
        },
        {
          id: 'oncologist-experienced',
          name: 'Experienced Medical Oncologist',
          description: 'Senior physician with 8+ years, balanced approach to patient care',
          role: 'oncologist',
          experienceLevel: 'intermediate',
          specialties: ['breast cancer', 'lung cancer', 'precision medicine'],
          preferences: {
            riskTolerance: 'moderate',
            alertSensitivity: 'medium',
            workflowStyle: 'efficient',
            decisionSupport: 'consultative',
          },
          customSettings: {
            quickActions: true,
            summaryView: true,
            advancedFeatures: true
          }
        },
        {
          id: 'oncologist-expert',
          name: 'Department Chief',
          description: 'Leading expert with 15+ years, comfortable with complex decisions',
          role: 'oncologist',
          experienceLevel: 'expert',
          specialties: ['precision medicine', 'clinical trials', 'rare cancers'],
          preferences: {
            riskTolerance: 'aggressive',
            alertSensitivity: 'low',
            workflowStyle: 'collaborative',
            decisionSupport: 'autonomous',
          },
          customSettings: {
            expertMode: true,
            minimalAlerts: true,
            researchFeatures: true
          }
        }
      ],
      pharmacist: [
        {
          id: 'pharmacist-clinical',
          name: 'Clinical Pharmacist',
          description: 'Hospital-based pharmacist focused on medication safety',
          role: 'pharmacist',
          experienceLevel: 'intermediate',
          specialties: ['oncology pharmacy', 'drug interactions'],
          preferences: {
            riskTolerance: 'conservative',
            alertSensitivity: 'high',
            workflowStyle: 'thorough',
            decisionSupport: 'guided',
          },
          customSettings: {
            detailedDrugInfo: true,
            interactionAlerts: true,
            dosingCalculators: true
          }
        },
        {
          id: 'pharmacist-expert',
          name: 'Pharmacy Director',
          description: 'Senior pharmacist with advanced clinical experience',
          role: 'pharmacist',
          experienceLevel: 'expert',
          specialties: ['oncology pharmacy', 'drug safety', 'formulary management'],
          preferences: {
            riskTolerance: 'moderate',
            alertSensitivity: 'medium',
            workflowStyle: 'efficient',
            decisionSupport: 'consultative',
          },
          customSettings: {
            advancedAnalytics: true,
            protocolReview: true,
            costAnalysis: true
          }
        }
      ],
      nurse: [
        {
          id: 'nurse-new',
          name: 'New Graduate Nurse',
          description: 'Recently graduated, learning oncology protocols',
          role: 'nurse',
          experienceLevel: 'novice',
          specialties: ['patient care', 'medication administration'],
          preferences: {
            riskTolerance: 'conservative',
            alertSensitivity: 'high',
            workflowStyle: 'thorough',
            decisionSupport: 'guided',
          },
          customSettings: {
            stepByStepProtocols: true,
            safetyChecks: true,
            supervisorAlerts: true
          }
        },
        {
          id: 'nurse-experienced',
          name: 'Senior Oncology Nurse',
          description: 'Experienced nurse with strong clinical skills',
          role: 'nurse',
          experienceLevel: 'intermediate',
          specialties: ['chemotherapy administration', 'patient education'],
          preferences: {
            riskTolerance: 'moderate',
            alertSensitivity: 'medium',
            workflowStyle: 'efficient',
            decisionSupport: 'consultative',
          },
          customSettings: {
            patientEducation: true,
            rapidResponse: true,
            teamCoordination: true
          }
        }
      ],
      researcher: [
        {
          id: 'researcher-data',
          name: 'Data Scientist',
          description: 'Focuses on data analysis and research insights',
          role: 'researcher',
          experienceLevel: 'expert',
          specialties: ['data analysis', 'genomics research'],
          preferences: {
            riskTolerance: 'moderate',
            alertSensitivity: 'low',
            workflowStyle: 'collaborative',
            decisionSupport: 'autonomous',
          },
          customSettings: {
            advancedAnalytics: true,
            dataExport: true,
            researchTools: true
          }
        },
        {
          id: 'researcher-clinical',
          name: 'Principal Investigator',
          description: 'Leading clinical trials and research studies',
          role: 'researcher',
          experienceLevel: 'expert',
          specialties: ['clinical trials', 'protocol development'],
          preferences: {
            riskTolerance: 'aggressive',
            alertSensitivity: 'low',
            workflowStyle: 'collaborative',
            decisionSupport: 'autonomous',
          },
          customSettings: {
            trialManagement: true,
            protocolDesign: true,
            regulatoryTools: true
          }
        }
      ],
      student: [
        {
          id: 'student-medical',
          name: 'Medical Student',
          description: 'Learning clinical oncology fundamentals',
          role: 'student',
          experienceLevel: 'novice',
          specialties: ['general medicine'],
          preferences: {
            riskTolerance: 'conservative',
            alertSensitivity: 'high',
            workflowStyle: 'thorough',
            decisionSupport: 'guided',
          },
          customSettings: {
            educationalContent: true,
            explanations: true,
            practiceMode: true
          }
        },
        {
          id: 'student-pharmacy',
          name: 'Pharmacy Student',
          description: 'Learning medication therapy management',
          role: 'student',
          experienceLevel: 'novice',
          specialties: ['pharmacology'],
          preferences: {
            riskTolerance: 'conservative',
            alertSensitivity: 'high',
            workflowStyle: 'thorough',
            decisionSupport: 'guided',
          },
          customSettings: {
            drugInformation: true,
            calculators: true,
            learningMode: true
          }
        }
      ]
    };

    return basePersonas[role] || [];
  };

  const availablePersonas = getPersonasForRole(user.role);
  const currentPersona = user.persona;

  const handlePersonaSwitch = (persona: UserPersona) => {
    actions.switchPersona(persona);
    setSelectedPersona(persona);
    setIsExpanded(false);
  };

  const getExperienceIcon = (level: string) => {
    switch (level) {
      case 'novice': return <BookOpen className="w-4 h-4" />;
      case 'intermediate': return <User className="w-4 h-4" />;
      case 'expert': return <Star className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getExperienceColor = (level: string) => {
    switch (level) {
      case 'novice': return 'text-blue-600 bg-blue-50';
      case 'intermediate': return 'text-green-600 bg-green-50';
      case 'expert': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskToleranceColor = (risk: string) => {
    switch (risk) {
      case 'conservative': return 'text-green-700 bg-green-100';
      case 'moderate': return 'text-yellow-700 bg-yellow-100';
      case 'aggressive': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <Card className="mb-6">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Testing Persona</h3>
            <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              <RefreshCw className="w-3 h-3" />
              <span>Test Mode</span>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <span>Switch Persona</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Current Persona Display */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Tooltip
                  content={`Experience Level: ${currentPersona.experienceLevel} - affects UI complexity and available features`}
                  type="clinical"
                >
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getExperienceColor(currentPersona.experienceLevel)} cursor-help`}>
                    {getExperienceIcon(currentPersona.experienceLevel)}
                    <span className="capitalize">{currentPersona.experienceLevel}</span>
                  </div>
                </Tooltip>
                <Tooltip
                  content={`Risk Tolerance: ${currentPersona.preferences.riskTolerance} - influences alert sensitivity and decision support`}
                  type="warning"
                >
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskToleranceColor(currentPersona.preferences.riskTolerance)} cursor-help`}>
                    {currentPersona.preferences.riskTolerance} risk
                  </div>
                </Tooltip>
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-1">{currentPersona.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{currentPersona.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {currentPersona.specialties.map((specialty, index) => (
                  <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-md">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="ml-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Persona Selection */}
        {isExpanded && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <AlertTriangle className="w-4 h-4" />
              <span>Switching personas will change how the system behaves and what features are available</span>
            </div>
            
            {availablePersonas.map((persona) => (
              <div
                key={persona.id}
                onClick={() => handlePersonaSwitch(persona)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  persona.id === currentPersona.id
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getExperienceColor(persona.experienceLevel)}`}>
                        {getExperienceIcon(persona.experienceLevel)}
                        <span className="capitalize">{persona.experienceLevel}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskToleranceColor(persona.preferences.riskTolerance)}`}>
                        {persona.preferences.riskTolerance} risk
                      </div>
                      <div className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {persona.preferences.workflowStyle} workflow
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-1">{persona.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{persona.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {persona.specialties.map((specialty, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {persona.id === currentPersona.id ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Testing Info */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Testing Mode Active</p>
              <p>Different personas provide different UI experiences, alert sensitivities, and available features. Switch between personas to test various user workflows and system behaviors.</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonaSelector;