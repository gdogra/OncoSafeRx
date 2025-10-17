import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Users, Brain, Heart, AlertTriangle, TrendingUp, 
  Shield, Target, Zap, Clock, BarChart3, Settings, 
  CheckCircle, XCircle, User, Calendar, Bell, Battery,
  Thermometer, Eye, Headphones, Coffee, Moon, Sun
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: 'oncologist' | 'nurse' | 'therapist' | 'technician' | 'administrator';
  department: string;
  yearsExperience: number;
  currentShift: 'day' | 'night' | 'evening';
  burnoutRisk: number;
  resilienceScore: number;
  workloadIndex: number;
  emotionalState: 'energized' | 'stable' | 'strained' | 'exhausted' | 'critical';
  lastBreak: string;
  hoursWorked: number;
  patientInteractions: number;
  stressIndicators: {
    physiological: number;
    behavioral: number;
    cognitive: number;
    emotional: number;
  };
  interventionHistory: InterventionRecord[];
}

interface InterventionRecord {
  id: string;
  timestamp: string;
  type: 'micro_break' | 'meditation' | 'peer_support' | 'workload_adjustment' | 'counseling' | 'rotation';
  trigger: string;
  effectiveness: number;
  staffResponse: 'accepted' | 'declined' | 'modified';
  outcome: string;
}

interface PredictiveModel {
  id: string;
  name: string;
  accuracy: number;
  lastTrained: string;
  inputFactors: string[];
  predictions: {
    timeframe: '1_hour' | '4_hours' | '8_hours' | '24_hours' | '1_week';
    burnoutProbability: number;
    confidenceInterval: number;
    riskFactors: string[];
    protectiveFactors: string[];
  }[];
}

interface TeamDynamics {
  teamId: string;
  teamName: string;
  cohesionScore: number;
  communicationQuality: number;
  supportNetwork: number;
  conflictLevel: number;
  leadershipEffectiveness: number;
  workloadDistribution: number;
  memberBurnoutCorrelation: number;
}

interface WellnessIntervention {
  id: string;
  name: string;
  type: 'individual' | 'team' | 'environmental' | 'organizational';
  duration: number;
  effectiveness: number;
  cost: number;
  implementation: 'immediate' | 'scheduled' | 'planned';
  requirements: string[];
  contraindications: string[];
}

const PredictiveBurnoutPrevention: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'prediction' | 'intervention' | 'analytics' | 'team' | 'wellness'>('dashboard');
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [predictiveModels, setPredictiveModels] = useState<PredictiveModel[]>([]);
  const [teamDynamics, setTeamDynamics] = useState<TeamDynamics[]>([]);
  const [interventions, setInterventions] = useState<WellnessIntervention[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRealTimeMode, setIsRealTimeMode] = useState(true);

  useEffect(() => {
    generateMockData();
    if (isRealTimeMode) {
      const interval = setInterval(updateRealTimeData, 30000);
      return () => clearInterval(interval);
    }
  }, [isRealTimeMode]);

  useEffect(() => {
    if (activeTab === 'analytics' && canvasRef.current) {
      drawBurnoutAnalytics();
    }
  }, [activeTab, staffMembers]);

  const generateMockData = () => {
    const mockStaff: StaffMember[] = [
      {
        id: 'staff_001',
        name: 'Dr. Sarah Chen',
        role: 'oncologist',
        department: 'Medical Oncology',
        yearsExperience: 12,
        currentShift: 'day',
        burnoutRisk: 0.75,
        resilienceScore: 0.68,
        workloadIndex: 0.85,
        emotionalState: 'strained',
        lastBreak: '2024-01-15T14:30:00Z',
        hoursWorked: 11.5,
        patientInteractions: 18,
        stressIndicators: {
          physiological: 0.72,
          behavioral: 0.68,
          cognitive: 0.79,
          emotional: 0.74
        },
        interventionHistory: []
      },
      {
        id: 'staff_002',
        name: 'Nurse Manager Lisa Rodriguez',
        role: 'nurse',
        department: 'Oncology Ward',
        yearsExperience: 8,
        currentShift: 'evening',
        burnoutRisk: 0.45,
        resilienceScore: 0.82,
        workloadIndex: 0.67,
        emotionalState: 'stable',
        lastBreak: '2024-01-15T16:00:00Z',
        hoursWorked: 9.0,
        patientInteractions: 24,
        stressIndicators: {
          physiological: 0.41,
          behavioral: 0.38,
          cognitive: 0.52,
          emotional: 0.46
        },
        interventionHistory: []
      },
      {
        id: 'staff_003',
        name: 'Dr. Michael Thompson',
        role: 'oncologist',
        department: 'Radiation Oncology',
        yearsExperience: 15,
        currentShift: 'day',
        burnoutRisk: 0.89,
        resilienceScore: 0.52,
        workloadIndex: 0.94,
        emotionalState: 'critical',
        lastBreak: '2024-01-15T11:15:00Z',
        hoursWorked: 14.0,
        patientInteractions: 22,
        stressIndicators: {
          physiological: 0.91,
          behavioral: 0.85,
          cognitive: 0.87,
          emotional: 0.92
        },
        interventionHistory: []
      }
    ];

    const mockModels: PredictiveModel[] = [
      {
        id: 'model_neural_ensemble',
        name: 'Neural Ensemble Predictor',
        accuracy: 0.94,
        lastTrained: '2024-01-15T08:00:00Z',
        inputFactors: ['workload', 'sleep_quality', 'patient_interactions', 'team_dynamics', 'personal_factors'],
        predictions: [
          {
            timeframe: '1_hour',
            burnoutProbability: 0.23,
            confidenceInterval: 0.91,
            riskFactors: ['excessive_workload', 'sleep_deprivation'],
            protectiveFactors: ['peer_support', 'recent_break']
          },
          {
            timeframe: '8_hours',
            burnoutProbability: 0.67,
            confidenceInterval: 0.88,
            riskFactors: ['cumulative_stress', 'difficult_cases'],
            protectiveFactors: ['scheduled_rest', 'team_cohesion']
          }
        ]
      }
    ];

    const mockTeams: TeamDynamics[] = [
      {
        teamId: 'team_onc_001',
        teamName: 'Medical Oncology Team A',
        cohesionScore: 0.78,
        communicationQuality: 0.72,
        supportNetwork: 0.81,
        conflictLevel: 0.25,
        leadershipEffectiveness: 0.85,
        workloadDistribution: 0.64,
        memberBurnoutCorrelation: 0.73
      }
    ];

    const mockInterventions: WellnessIntervention[] = [
      {
        id: 'intervention_001',
        name: 'AI-Guided Micro-Meditation',
        type: 'individual',
        duration: 5,
        effectiveness: 0.82,
        cost: 0,
        implementation: 'immediate',
        requirements: ['quiet_space', 'mobile_device'],
        contraindications: ['active_emergency']
      },
      {
        id: 'intervention_002',
        name: 'Dynamic Workload Rebalancing',
        type: 'organizational',
        duration: 60,
        effectiveness: 0.91,
        cost: 50,
        implementation: 'scheduled',
        requirements: ['management_approval', 'staff_availability'],
        contraindications: ['critical_understaffing']
      }
    ];

    setStaffMembers(mockStaff);
    setPredictiveModels(mockModels);
    setTeamDynamics(mockTeams);
    setInterventions(mockInterventions);
  };

  const updateRealTimeData = () => {
    setStaffMembers(prev => prev.map(staff => ({
      ...staff,
      burnoutRisk: Math.max(0, Math.min(1, staff.burnoutRisk + (Math.random() - 0.5) * 0.1)),
      workloadIndex: Math.max(0, Math.min(1, staff.workloadIndex + (Math.random() - 0.5) * 0.05)),
      hoursWorked: staff.hoursWorked + 0.5,
      stressIndicators: {
        physiological: Math.max(0, Math.min(1, staff.stressIndicators.physiological + (Math.random() - 0.5) * 0.05)),
        behavioral: Math.max(0, Math.min(1, staff.stressIndicators.behavioral + (Math.random() - 0.5) * 0.05)),
        cognitive: Math.max(0, Math.min(1, staff.stressIndicators.cognitive + (Math.random() - 0.5) * 0.05)),
        emotional: Math.max(0, Math.min(1, staff.stressIndicators.emotional + (Math.random() - 0.5) * 0.05))
      }
    })));
  };

  const drawBurnoutAnalytics = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 400;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const y = (canvas.height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(canvas.width - 20, y);
      ctx.stroke();
    }

    for (let i = 0; i <= 24; i++) {
      const x = 50 + ((canvas.width - 70) / 24) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    const timePoints = Array.from({ length: 25 }, (_, i) => i);
    
    staffMembers.forEach((staff, index) => {
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
      const color = colors[index % colors.length];
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      timePoints.forEach((time, timeIndex) => {
        const x = 50 + ((canvas.width - 70) / 24) * time;
        const burnoutAtTime = staff.burnoutRisk + Math.sin(time * 0.5) * 0.1 + Math.random() * 0.05;
        const y = canvas.height - (burnoutAtTime * canvas.height);
        
        if (timeIndex === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      
      ctx.fillStyle = color;
      ctx.font = '12px Arial';
      ctx.fillText(staff.name, 10, 20 + index * 20);
    });

    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.fillText('Burnout Risk Over 24 Hours', canvas.width / 2 - 80, 20);
    ctx.fillText('Time (hours)', canvas.width / 2 - 30, canvas.height - 5);
    
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Burnout Risk', -40, 0);
    ctx.restore();
  };

  const getBurnoutRiskColor = (risk: number) => {
    if (risk < 0.3) return 'text-green-400';
    if (risk < 0.6) return 'text-yellow-400';
    if (risk < 0.8) return 'text-orange-400';
    return 'text-red-400';
  };

  const getEmotionalStateIcon = (state: string) => {
    switch (state) {
      case 'energized': return <Battery className="w-4 h-4 text-green-400" />;
      case 'stable': return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'strained': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'exhausted': return <XCircle className="w-4 h-4 text-orange-400" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-300">At Risk Staff</h3>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400 mt-2">
            {staffMembers.filter(s => s.burnoutRisk > 0.7).length}
          </p>
          <p className="text-xs text-gray-500 mt-1">High burnout risk</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-300">Team Resilience</h3>
            <Shield className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400 mt-2">
            {Math.round(staffMembers.reduce((avg, s) => avg + s.resilienceScore, 0) / staffMembers.length * 100)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Average resilience</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-300">Active Interventions</h3>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400 mt-2">7</p>
          <p className="text-xs text-gray-500 mt-1">Currently running</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-300">Prediction Accuracy</h3>
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400 mt-2">94%</p>
          <p className="text-xs text-gray-500 mt-1">ML model accuracy</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Staff Burnout Risk Dashboard
        </h3>
        <div className="space-y-4">
          {staffMembers.map((staff) => (
            <div key={staff.id} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <User className="w-8 h-8 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-white">{staff.name}</h4>
                    <p className="text-sm text-gray-400">{staff.role} • {staff.department}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getEmotionalStateIcon(staff.emotionalState)}
                  <span className={`text-sm font-medium ${getBurnoutRiskColor(staff.burnoutRisk)}`}>
                    {Math.round(staff.burnoutRisk * 100)}% Risk
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Hours Worked</p>
                  <p className="text-white font-medium">{staff.hoursWorked}h</p>
                </div>
                <div>
                  <p className="text-gray-400">Workload Index</p>
                  <p className="text-white font-medium">{Math.round(staff.workloadIndex * 100)}%</p>
                </div>
                <div>
                  <p className="text-gray-400">Resilience</p>
                  <p className="text-white font-medium">{Math.round(staff.resilienceScore * 100)}%</p>
                </div>
                <div>
                  <p className="text-gray-400">Interactions</p>
                  <p className="text-white font-medium">{staff.patientInteractions}</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Stress Indicators</span>
                  <span>{Math.round((staff.stressIndicators.physiological + staff.stressIndicators.behavioral + staff.stressIndicators.cognitive + staff.stressIndicators.emotional) / 4 * 100)}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 h-2 rounded-full"
                    style={{ width: `${(staff.stressIndicators.physiological + staff.stressIndicators.behavioral + staff.stressIndicators.cognitive + staff.stressIndicators.emotional) / 4 * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrediction = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2" />
          Predictive Models
        </h3>
        {predictiveModels.map((model) => (
          <div key={model.id} className="bg-gray-700 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-white">{model.name}</h4>
              <span className="text-green-400 text-sm font-medium">{Math.round(model.accuracy * 100)}% Accurate</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-sm font-medium text-gray-300 mb-2">Input Factors</h5>
                <div className="flex flex-wrap gap-2">
                  {model.inputFactors.map((factor, index) => (
                    <span key={index} className="bg-gray-600 px-2 py-1 rounded text-xs text-gray-300">
                      {factor.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-gray-300 mb-2">Predictions</h5>
                <div className="space-y-2">
                  {model.predictions.map((pred, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{pred.timeframe.replace('_', ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${getBurnoutRiskColor(pred.burnoutProbability)}`}>
                          {Math.round(pred.burnoutProbability * 100)}%
                        </span>
                        <span className="text-gray-500">±{Math.round(pred.confidenceInterval * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Risk Factor Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-red-400 mb-3">Current Risk Factors</h4>
            <div className="space-y-2">
              {['Excessive overtime hours', 'High patient mortality rate', 'Understaffing in ICU', 'Equipment malfunctions', 'Difficult family communications'].map((factor, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-gray-300 text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-green-400 mb-3">Protective Factors</h4>
            <div className="space-y-2">
              {['Strong peer support network', 'Regular team meetings', 'Wellness program participation', 'Flexible scheduling', 'Professional development opportunities'].map((factor, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntervention = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Available Interventions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interventions.map((intervention) => (
            <div key={intervention.id} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{intervention.name}</h4>
                <span className="text-green-400 text-sm">{Math.round(intervention.effectiveness * 100)}% effective</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-gray-300">{intervention.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-gray-300">{intervention.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Implementation:</span>
                  <span className="text-gray-300">{intervention.implementation}</span>
                </div>
              </div>
              
              <button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm">
                Deploy Intervention
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Active Alerts & Recommendations
        </h3>
        <div className="space-y-3">
          {[
            { severity: 'critical', message: 'Dr. Thompson showing critical burnout indicators - immediate intervention recommended', time: '2 minutes ago' },
            { severity: 'warning', message: 'Medical Oncology team workload 34% above optimal - consider rebalancing', time: '15 minutes ago' },
            { severity: 'info', message: 'Meditation break recommended for night shift nurses in 30 minutes', time: '1 hour ago' }
          ].map((alert, index) => (
            <div key={index} className={`p-3 rounded-lg border-l-4 ${
              alert.severity === 'critical' ? 'bg-red-900/20 border-red-400' :
              alert.severity === 'warning' ? 'bg-yellow-900/20 border-yellow-400' :
              'bg-blue-900/20 border-blue-400'
            }`}>
              <div className="flex items-start justify-between">
                <p className="text-gray-300 text-sm">{alert.message}</p>
                <span className="text-gray-500 text-xs">{alert.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Burnout Analytics Visualization
        </h3>
        <canvas ref={canvasRef} className="w-full border border-gray-600 rounded"></canvas>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Department Comparison</h3>
          <div className="space-y-3">
            {['Medical Oncology', 'Radiation Oncology', 'Surgical Oncology', 'Oncology Ward'].map((dept, index) => {
              const risk = [0.65, 0.78, 0.52, 0.41][index];
              return (
                <div key={dept} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">{dept}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getBurnoutRiskColor(risk).includes('green') ? 'bg-green-400' : getBurnoutRiskColor(risk).includes('yellow') ? 'bg-yellow-400' : getBurnoutRiskColor(risk).includes('orange') ? 'bg-orange-400' : 'bg-red-400'}`}
                        style={{ width: `${risk * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${getBurnoutRiskColor(risk)}`}>
                      {Math.round(risk * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Intervention Effectiveness</h3>
          <div className="space-y-3">
            {interventions.map((intervention) => (
              <div key={intervention.id} className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">{intervention.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full"
                      style={{ width: `${intervention.effectiveness * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-green-400 text-sm font-medium">
                    {Math.round(intervention.effectiveness * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Team Dynamics Analysis
        </h3>
        {teamDynamics.map((team) => (
          <div key={team.teamId} className="bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-white mb-4">{team.teamName}</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{Math.round(team.cohesionScore * 100)}%</p>
                <p className="text-xs text-gray-400">Team Cohesion</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{Math.round(team.communicationQuality * 100)}%</p>
                <p className="text-xs text-gray-400">Communication</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">{Math.round(team.supportNetwork * 100)}%</p>
                <p className="text-xs text-gray-400">Support Network</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-400">{Math.round(team.leadershipEffectiveness * 100)}%</p>
                <p className="text-xs text-gray-400">Leadership</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Conflict Level</p>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-red-400 h-2 rounded-full"
                    style={{ width: `${team.conflictLevel * 100}%` }}
                  ></div>
                </div>
                <p className="text-red-400 text-xs mt-1">{Math.round(team.conflictLevel * 100)}%</p>
              </div>
              
              <div>
                <p className="text-gray-400 mb-1">Workload Distribution</p>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${team.workloadDistribution * 100}%` }}
                  ></div>
                </div>
                <p className="text-yellow-400 text-xs mt-1">{Math.round(team.workloadDistribution * 100)}%</p>
              </div>
              
              <div>
                <p className="text-gray-400 mb-1">Burnout Correlation</p>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-orange-400 h-2 rounded-full"
                    style={{ width: `${team.memberBurnoutCorrelation * 100}%` }}
                  ></div>
                </div>
                <p className="text-orange-400 text-xs mt-1">{Math.round(team.memberBurnoutCorrelation * 100)}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Team Wellness Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Schedule Team Building Session', priority: 'high', impact: 'High team cohesion improvement expected' },
            { title: 'Implement Peer Support Buddy System', priority: 'medium', impact: 'Moderate stress reduction for individuals' },
            { title: 'Optimize Shift Rotation Schedule', priority: 'high', impact: 'Better workload distribution' },
            { title: 'Organize Leadership Training', priority: 'low', impact: 'Long-term leadership effectiveness' }
          ].map((rec, index) => (
            <div key={index} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{rec.title}</h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  rec.priority === 'high' ? 'bg-red-600 text-white' :
                  rec.priority === 'medium' ? 'bg-yellow-600 text-white' :
                  'bg-gray-600 text-gray-300'
                }`}>
                  {rec.priority}
                </span>
              </div>
              <p className="text-gray-400 text-sm">{rec.impact}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderWellness = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Heart className="w-5 h-5 mr-2" />
          Wellness Program Management
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <Coffee className="w-8 h-8 text-brown-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">247</p>
            <p className="text-sm text-gray-400">Micro-breaks taken today</p>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <Moon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">89%</p>
            <p className="text-sm text-gray-400">Sleep quality average</p>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <Headphones className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-lg font-bold text-white">34</p>
            <p className="text-sm text-gray-400">Meditation sessions completed</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-white">Personalized Wellness Plans</h4>
          {staffMembers.slice(0, 3).map((staff) => (
            <div key={staff.id} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-white">{staff.name}</span>
                <span className="text-sm text-gray-400">{staff.role}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Sun className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">Morning energizer: 7:30 AM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Coffee className="w-4 h-4 text-brown-400" />
                  <span className="text-gray-300">Micro-break: Every 2h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Headphones className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Meditation: 12:00 PM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Moon className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">Wind down: 9:00 PM</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Wellness Activities</h3>
          <div className="space-y-3">
            {[
              { activity: 'Guided Breathing Exercise', participants: 12, scheduled: '2:00 PM' },
              { activity: 'Team Yoga Session', participants: 8, scheduled: '6:00 PM' },
              { activity: 'Mindfulness Workshop', participants: 15, scheduled: 'Tomorrow 10:00 AM' },
              { activity: 'Stress Management Seminar', participants: 22, scheduled: 'Friday 3:00 PM' }
            ].map((activity, index) => (
              <div key={index} className="bg-gray-700 p-3 rounded flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{activity.activity}</p>
                  <p className="text-gray-400 text-sm">{activity.participants} participants • {activity.scheduled}</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                  Join
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Wellness Metrics</h3>
          <div className="space-y-4">
            {[
              { metric: 'Overall Wellness Score', value: 78, color: 'green' },
              { metric: 'Stress Level Reduction', value: 23, color: 'blue' },
              { metric: 'Sleep Quality Improvement', value: 15, color: 'purple' },
              { metric: 'Program Participation', value: 67, color: 'yellow' }
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{item.metric}</span>
                  <span className="text-white font-medium">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-${item.color}-400`}
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Predictive Burnout Prevention</h1>
              <p className="text-gray-400">AI-powered healthcare team wellness optimization and burnout prevention system</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isRealTimeMode ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-400">
                  {isRealTimeMode ? 'Real-time monitoring' : 'Static mode'}
                </span>
              </div>
              <button
                onClick={() => setIsRealTimeMode(!isRealTimeMode)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'prediction', label: 'Prediction', icon: Brain },
              { id: 'intervention', label: 'Intervention', icon: Target },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'team', label: 'Team Dynamics', icon: Users },
              { id: 'wellness', label: 'Wellness', icon: Heart }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'prediction' && renderPrediction()}
          {activeTab === 'intervention' && renderIntervention()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'team' && renderTeam()}
          {activeTab === 'wellness' && renderWellness()}
        </div>
      </div>
    </div>
  );
};

export default PredictiveBurnoutPrevention;