import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Shield, TrendingUp, TrendingDown, Brain, Activity, Zap, Target, Heart, Thermometer, Droplets, Clock, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter } from 'recharts';

interface RiskFactor {
  id: string;
  name: string;
  category: 'patient' | 'drug' | 'interaction' | 'environmental' | 'genomic' | 'temporal';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  probability: number;
  impact: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  timeHorizon: '24h' | '7d' | '30d' | '90d' | '1y';
  mitigation: Array<{
    strategy: string;
    effectiveness: number;
    timeToImplement: string;
    cost: 'low' | 'medium' | 'high';
  }>;
  evidence: {
    level: 'A' | 'B' | 'C' | 'D';
    sources: number;
    lastUpdate: string;
  };
  monitoring: {
    frequency: string;
    parameters: string[];
    thresholds: Array<{ parameter: string; warning: number; critical: number }>;
  };
}

interface RiskScore {
  overall: number;
  categories: {
    cardiovascular: number;
    hepatic: number;
    renal: number;
    neurological: number;
    hematological: number;
    metabolic: number;
    immunological: number;
    gastrointestinal: number;
  };
  temporal: Array<{
    timepoint: string;
    score: number;
    confidence: number;
    factors: string[];
  }>;
}

interface AlertSystem {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'critical' | 'emergency';
  category: string;
  message: string;
  recommendation: string;
  autoActions: Array<{
    action: string;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    eta: string;
  }>;
  escalation: {
    required: boolean;
    contacts: string[];
    timeline: string;
  };
}

interface PredictiveModel {
  id: string;
  name: string;
  type: 'safety' | 'efficacy' | 'compliance' | 'outcome';
  accuracy: number;
  sensitivity: number;
  specificity: number;
  prediction: {
    outcome: string;
    probability: number;
    confidence: number;
    timeframe: string;
  };
  features: Array<{
    name: string;
    importance: number;
    currentValue: number;
    normalRange: [number, number];
  }>;
}

interface RiskProfile {
  patientId: string;
  riskScore: RiskScore;
  factors: RiskFactor[];
  alerts: AlertSystem[];
  models: PredictiveModel[];
  interventions: Array<{
    id: string;
    name: string;
    type: 'preventive' | 'therapeutic' | 'monitoring';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'recommended' | 'active' | 'completed' | 'discontinued';
    effectiveness: number;
    implementation: {
      timeline: string;
      resources: string[];
      contraindications: string[];
    };
  }>;
}

const DynamicRiskAssessment: React.FC = () => {
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
  const [selectedTimeHorizon, setSelectedTimeHorizon] = useState<'24h' | '7d' | '30d' | '90d' | '1y'>('30d');
  const [activeAlert, setActiveAlert] = useState<AlertSystem | null>(null);
  const [isRealTimeMode, setIsRealTimeMode] = useState(true);
  const [riskThreshold, setRiskThreshold] = useState(75);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [assessmentMode, setAssessmentMode] = useState<'comprehensive' | 'rapid' | 'continuous'>('comprehensive');

  const generateRiskProfile = useCallback(() => {
    const factors: RiskFactor[] = [
      {
        id: 'cardiotoxicity-risk',
        name: 'Immune-related Cardiotoxicity',
        category: 'drug',
        severity: 'high',
        probability: 23,
        impact: 89,
        trend: 'increasing',
        timeHorizon: '30d',
        mitigation: [
          { strategy: 'Baseline echocardiogram + troponin monitoring', effectiveness: 85, timeToImplement: '24h', cost: 'medium' },
          { strategy: 'Corticosteroid prophylaxis if indicated', effectiveness: 72, timeToImplement: '1h', cost: 'low' },
          { strategy: 'Cardio-oncology consultation', effectiveness: 94, timeToImplement: '48h', cost: 'high' }
        ],
        evidence: { level: 'A', sources: 47, lastUpdate: '2 hours ago' },
        monitoring: {
          frequency: 'Weekly for 8 weeks, then monthly',
          parameters: ['ECG', 'Troponin I', 'BNP', 'Echocardiogram'],
          thresholds: [
            { parameter: 'Troponin I', warning: 0.04, critical: 0.1 },
            { parameter: 'BNP', warning: 100, critical: 400 },
            { parameter: 'LVEF', warning: 50, critical: 40 }
          ]
        }
      },
      {
        id: 'hepatotoxicity-risk',
        name: 'Drug-induced Liver Injury',
        category: 'drug',
        severity: 'moderate',
        probability: 31,
        impact: 76,
        trend: 'stable',
        timeHorizon: '7d',
        mitigation: [
          { strategy: 'Enhanced LFT monitoring protocol', effectiveness: 91, timeToImplement: '2h', cost: 'low' },
          { strategy: 'N-acetylcysteine prophylaxis', effectiveness: 67, timeToImplement: '30min', cost: 'low' },
          { strategy: 'Hepatology consultation if ALT >3x ULN', effectiveness: 88, timeToImplement: '24h', cost: 'medium' }
        ],
        evidence: { level: 'A', sources: 123, lastUpdate: '1 hour ago' },
        monitoring: {
          frequency: 'Every 48 hours for 2 weeks',
          parameters: ['ALT', 'AST', 'Bilirubin', 'Alkaline phosphatase'],
          thresholds: [
            { parameter: 'ALT', warning: 120, critical: 200 },
            { parameter: 'AST', warning: 100, critical: 180 },
            { parameter: 'Bilirubin', warning: 2.0, critical: 3.0 }
          ]
        }
      },
      {
        id: 'genomic-metabolism',
        name: 'CYP2D6 Poor Metabolizer',
        category: 'genomic',
        severity: 'high',
        probability: 89,
        impact: 94,
        trend: 'stable',
        timeHorizon: '1y',
        mitigation: [
          { strategy: 'Reduce starting dose by 50%', effectiveness: 92, timeToImplement: 'Immediate', cost: 'low' },
          { strategy: 'Enhanced pharmacokinetic monitoring', effectiveness: 87, timeToImplement: '24h', cost: 'medium' },
          { strategy: 'Alternative drug selection', effectiveness: 95, timeToImplement: '48h', cost: 'medium' }
        ],
        evidence: { level: 'A', sources: 89, lastUpdate: '30 minutes ago' },
        monitoring: {
          frequency: 'Weekly for 4 weeks, then bi-weekly',
          parameters: ['Drug levels', 'Metabolite ratio', 'Clinical response'],
          thresholds: [
            { parameter: 'Trough level', warning: 80, critical: 120 },
            { parameter: 'Metabolite ratio', warning: 0.1, critical: 0.05 }
          ]
        }
      },
      {
        id: 'interaction-warfarin',
        name: 'Major Drug-Drug Interaction',
        category: 'interaction',
        severity: 'critical',
        probability: 97,
        impact: 96,
        trend: 'stable',
        timeHorizon: '24h',
        mitigation: [
          { strategy: 'Immediate INR monitoring', effectiveness: 98, timeToImplement: '1h', cost: 'low' },
          { strategy: 'Warfarin dose adjustment', effectiveness: 94, timeToImplement: '2h', cost: 'low' },
          { strategy: 'Consider DOAC alternative', effectiveness: 89, timeToImplement: '24h', cost: 'high' }
        ],
        evidence: { level: 'A', sources: 156, lastUpdate: '15 minutes ago' },
        monitoring: {
          frequency: 'Every 6 hours for 48 hours',
          parameters: ['INR', 'PT', 'Bleeding signs'],
          thresholds: [
            { parameter: 'INR', warning: 3.5, critical: 5.0 },
            { parameter: 'PT', warning: 20, critical: 30 }
          ]
        }
      },
      {
        id: 'renal-toxicity',
        name: 'Nephrotoxicity Risk',
        category: 'drug',
        severity: 'moderate',
        probability: 28,
        impact: 71,
        trend: 'decreasing',
        timeHorizon: '90d',
        mitigation: [
          { strategy: 'Aggressive hydration protocol', effectiveness: 83, timeToImplement: '2h', cost: 'low' },
          { strategy: 'Nephrology consultation', effectiveness: 91, timeToImplement: '24h', cost: 'medium' },
          { strategy: 'Renal function optimization', effectiveness: 78, timeToImplement: '48h', cost: 'medium' }
        ],
        evidence: { level: 'B', sources: 67, lastUpdate: '45 minutes ago' },
        monitoring: {
          frequency: 'Daily for 1 week, then weekly',
          parameters: ['Creatinine', 'BUN', 'Urine output', 'Proteinuria'],
          thresholds: [
            { parameter: 'Creatinine', warning: 1.5, critical: 2.0 },
            { parameter: 'BUN', warning: 40, critical: 60 }
          ]
        }
      }
    ];

    const alerts: AlertSystem[] = [
      {
        id: 'alert-1',
        timestamp: '2 minutes ago',
        level: 'critical',
        category: 'Drug Interaction',
        message: 'Critical drug-drug interaction detected: Warfarin + Pembrolizumab',
        recommendation: 'Immediate INR monitoring and warfarin dose adjustment required',
        autoActions: [
          { action: 'Alert prescriber', status: 'completed', eta: 'Immediate' },
          { action: 'Order stat INR', status: 'executing', eta: '15 minutes' },
          { action: 'Pharmacy consultation', status: 'pending', eta: '30 minutes' }
        ],
        escalation: {
          required: true,
          contacts: ['Dr. Smith (Oncology)', 'Dr. Johnson (Cardiology)'],
          timeline: '15 minutes if not acknowledged'
        }
      },
      {
        id: 'alert-2',
        timestamp: '8 minutes ago',
        level: 'warning',
        category: 'Genomic Risk',
        message: 'CYP2D6 poor metabolizer detected - dose adjustment recommended',
        recommendation: 'Reduce initial dose by 50% and implement enhanced monitoring',
        autoActions: [
          { action: 'Update medication profile', status: 'completed', eta: 'Immediate' },
          { action: 'Generate dosing recommendation', status: 'completed', eta: 'Immediate' },
          { action: 'Schedule pharmacokinetic monitoring', status: 'pending', eta: '24 hours' }
        ],
        escalation: {
          required: false,
          contacts: [],
          timeline: ''
        }
      },
      {
        id: 'alert-3',
        timestamp: '12 minutes ago',
        level: 'info',
        category: 'Monitoring',
        message: 'Scheduled cardiac function assessment due within 24 hours',
        recommendation: 'Order echocardiogram and troponin levels as per protocol',
        autoActions: [
          { action: 'Add to task list', status: 'completed', eta: 'Immediate' },
          { action: 'Schedule appointment', status: 'pending', eta: '2 hours' }
        ],
        escalation: {
          required: false,
          contacts: [],
          timeline: ''
        }
      }
    ];

    const models: PredictiveModel[] = [
      {
        id: 'safety-model-v2',
        name: 'Comprehensive Safety Predictor',
        type: 'safety',
        accuracy: 91.7,
        sensitivity: 88.4,
        specificity: 94.2,
        prediction: {
          outcome: 'Grade 3+ Adverse Event',
          probability: 23.7,
          confidence: 87.3,
          timeframe: '30 days'
        },
        features: [
          { name: 'Age', importance: 18.4, currentValue: 67, normalRange: [18, 100] },
          { name: 'Baseline ECOG', importance: 15.8, currentValue: 1, normalRange: [0, 4] },
          { name: 'Creatinine', importance: 12.3, currentValue: 1.2, normalRange: [0.6, 1.3] },
          { name: 'Albumin', importance: 11.7, currentValue: 3.8, normalRange: [3.5, 5.0] },
          { name: 'Prior therapies', importance: 10.2, currentValue: 3, normalRange: [0, 10] }
        ]
      },
      {
        id: 'efficacy-model-v3',
        name: 'Treatment Response Predictor',
        type: 'efficacy',
        accuracy: 86.9,
        sensitivity: 82.1,
        specificity: 91.3,
        prediction: {
          outcome: 'Complete/Partial Response',
          probability: 71.2,
          confidence: 89.6,
          timeframe: '12 weeks'
        },
        features: [
          { name: 'PD-L1 TPS', importance: 24.1, currentValue: 65, normalRange: [0, 100] },
          { name: 'TMB', importance: 19.8, currentValue: 14.2, normalRange: [0, 50] },
          { name: 'MSI status', importance: 16.4, currentValue: 1, normalRange: [0, 1] },
          { name: 'Tumor size', importance: 12.7, currentValue: 4.2, normalRange: [0, 20] },
          { name: 'Metastatic sites', importance: 11.3, currentValue: 2, normalRange: [0, 10] }
        ]
      }
    ];

    const riskScore: RiskScore = {
      overall: 68,
      categories: {
        cardiovascular: 72,
        hepatic: 45,
        renal: 38,
        neurological: 23,
        hematological: 41,
        metabolic: 29,
        immunological: 67,
        gastrointestinal: 34
      },
      temporal: [
        { timepoint: '24h', score: 78, confidence: 94, factors: ['Drug interaction', 'Metabolizer status'] },
        { timepoint: '7d', score: 71, confidence: 89, factors: ['Hepatotoxicity', 'Cardiotoxicity'] },
        { timepoint: '30d', score: 68, confidence: 87, factors: ['Cardiotoxicity', 'Immune reactions'] },
        { timepoint: '90d', score: 62, confidence: 82, factors: ['Long-term toxicity', 'Resistance'] },
        { timepoint: '1y', score: 58, confidence: 76, factors: ['Cumulative effects', 'Secondary malignancy'] }
      ]
    };

    const profile: RiskProfile = {
      patientId: 'PT-2024-001',
      riskScore,
      factors,
      alerts,
      models,
      interventions: [
        {
          id: 'int-1',
          name: 'Enhanced Cardiac Monitoring',
          type: 'monitoring',
          priority: 'high',
          status: 'active',
          effectiveness: 89,
          implementation: {
            timeline: 'Ongoing - 12 weeks',
            resources: ['Cardiology team', 'Echo tech', 'Lab monitoring'],
            contraindications: []
          }
        },
        {
          id: 'int-2',
          name: 'Genomic-guided Dosing',
          type: 'therapeutic',
          priority: 'urgent',
          status: 'recommended',
          effectiveness: 94,
          implementation: {
            timeline: 'Immediate implementation',
            resources: ['Pharmacist', 'Genomic counselor'],
            contraindications: ['Severe hepatic impairment']
          }
        },
        {
          id: 'int-3',
          name: 'Drug Interaction Management',
          type: 'preventive',
          priority: 'urgent',
          status: 'active',
          effectiveness: 96,
          implementation: {
            timeline: 'Immediate - ongoing',
            resources: ['Clinical pharmacist', 'INR monitoring'],
            contraindications: []
          }
        }
      ]
    };

    setRiskProfile(profile);
  }, []);

  useEffect(() => {
    generateRiskProfile();
  }, [generateRiskProfile]);

  useEffect(() => {
    if (isRealTimeMode) {
      const interval = setInterval(() => {
        generateRiskProfile();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isRealTimeMode, generateRiskProfile]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-300';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'moderate': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-green-700 bg-green-100 border-green-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'emergency': return 'text-red-800 bg-red-100 border-l-red-500';
      case 'critical': return 'text-red-700 bg-red-50 border-l-red-400';
      case 'warning': return 'text-yellow-700 bg-yellow-50 border-l-yellow-400';
      case 'info': return 'text-blue-700 bg-blue-50 border-l-blue-400';
      default: return 'text-gray-700 bg-gray-50 border-l-gray-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'executing': return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!riskProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const radarData = Object.entries(riskProfile.riskScore.categories).map(([category, score]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    score,
    fullMark: 100
  }));

  const filteredFactors = selectedCategory === 'all' 
    ? riskProfile.factors 
    : riskProfile.factors.filter(factor => factor.category === selectedCategory);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dynamic Risk Assessment System</h1>
            <p className="text-red-100">
              AI-powered real-time safety monitoring with predictive risk modeling and automated intervention recommendations
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{riskProfile.riskScore.overall}</div>
            <div className="text-sm text-red-100">Overall Risk Score</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Assessment Mode:</label>
            <select
              value={assessmentMode}
              onChange={(e) => setAssessmentMode(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="comprehensive">Comprehensive</option>
              <option value="rapid">Rapid Assessment</option>
              <option value="continuous">Continuous Monitoring</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Time Horizon:</label>
            <select
              value={selectedTimeHorizon}
              onChange={(e) => setSelectedTimeHorizon(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
              <option value="1y">1 Year</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Categories</option>
              <option value="patient">Patient Factors</option>
              <option value="drug">Drug-related</option>
              <option value="interaction">Interactions</option>
              <option value="genomic">Genomic</option>
              <option value="environmental">Environmental</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isRealTimeMode}
                onChange={(e) => setIsRealTimeMode(e.target.checked)}
                className="rounded"
              />
              Real-time Mode
            </label>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Alert Threshold:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={riskThreshold}
              onChange={(e) => setRiskThreshold(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm font-medium">{riskThreshold}%</span>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {riskProfile.alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
          {riskProfile.alerts.map((alert) => (
            <div key={alert.id} className={`p-4 border-l-4 rounded-lg ${getAlertColor(alert.level)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-semibold">{alert.category}</span>
                    <span className="text-sm opacity-75">{alert.timestamp}</span>
                  </div>
                  <p className="font-medium mb-2">{alert.message}</p>
                  <p className="text-sm mb-3">{alert.recommendation}</p>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Auto Actions:</h4>
                    {alert.autoActions.map((action, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {getStatusIcon(action.status)}
                        <span>{action.action}</span>
                        <span className="text-gray-500">- ETA: {action.eta}</span>
                      </div>
                    ))}
                  </div>

                  {alert.escalation.required && (
                    <div className="mt-3 p-3 bg-white bg-opacity-50 rounded">
                      <h4 className="text-sm font-medium text-red-700">Escalation Required</h4>
                      <p className="text-sm">Contacts: {alert.escalation.contacts.join(', ')}</p>
                      <p className="text-sm">Timeline: {alert.escalation.timeline}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setActiveAlert(alert)}
                  className="px-3 py-1 bg-white bg-opacity-50 rounded text-sm hover:bg-opacity-75"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Risk Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Score Radar */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Profile by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Risk Score" dataKey="score" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Temporal Risk Progression */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Progression Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={riskProfile.riskScore.temporal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timepoint" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value, name) => [`${value}%`, name === 'score' ? 'Risk Score' : 'Confidence']} />
              <Area type="monotone" dataKey="score" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
              <Area type="monotone" dataKey="confidence" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFactors.map((factor) => (
            <div key={factor.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{factor.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(factor.severity)}`}>
                      {factor.severity}
                    </span>
                    <span className="text-sm text-gray-600 capitalize">{factor.category}</span>
                    {getTrendIcon(factor.trend)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">{factor.probability}%</div>
                  <div className="text-sm text-gray-600">Probability</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Impact:</span>
                  <span className="font-medium">{factor.impact}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Time Horizon:</span>
                  <span className="font-medium">{factor.timeHorizon}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Evidence Level:</span>
                  <span className="font-medium">Level {factor.evidence.level}</span>
                </div>
              </div>

              <div className="mt-3">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Top Mitigation Strategy:</h5>
                {factor.mitigation.length > 0 && (
                  <div className="p-2 bg-white rounded border">
                    <div className="text-sm font-medium">{factor.mitigation[0].strategy}</div>
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>Effectiveness: {factor.mitigation[0].effectiveness}%</span>
                      <span>Time: {factor.mitigation[0].timeToImplement}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Predictive Models */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Predictive Models</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {riskProfile.models.map((model) => (
            <div key={model.id} className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{model.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{model.type} prediction</p>
                </div>
                <Brain className="h-6 w-6 text-blue-600" />
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{model.accuracy}%</div>
                  <div className="text-xs text-gray-600">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{model.sensitivity}%</div>
                  <div className="text-xs text-gray-600">Sensitivity</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{model.specificity}%</div>
                  <div className="text-xs text-gray-600">Specificity</div>
                </div>
              </div>

              <div className="bg-white p-3 rounded border">
                <h5 className="font-medium text-gray-900 mb-2">Current Prediction:</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{model.prediction.outcome}</span>
                    <span className="text-sm font-bold text-blue-600">{model.prediction.probability}%</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Confidence: {model.prediction.confidence}%</span>
                    <span>Timeframe: {model.prediction.timeframe}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h5>
                <div className="space-y-1">
                  {model.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{feature.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{feature.currentValue}</span>
                        <div className="w-12 bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-blue-600 h-1 rounded-full" 
                            style={{ width: `${feature.importance}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interventions */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Interventions</h3>
        <div className="space-y-3">
          {riskProfile.interventions.map((intervention) => (
            <div key={intervention.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{intervention.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      intervention.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      intervention.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      intervention.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {intervention.priority} priority
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      intervention.status === 'active' ? 'bg-green-100 text-green-800' :
                      intervention.status === 'recommended' ? 'bg-blue-100 text-blue-800' :
                      intervention.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {intervention.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2 font-medium capitalize">{intervention.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Effectiveness:</span>
                      <span className="ml-2 font-medium">{intervention.effectiveness}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Timeline:</span>
                      <span className="ml-2 font-medium">{intervention.implementation.timeline}</span>
                    </div>
                  </div>
                  {intervention.implementation.resources.length > 0 && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">Resources needed:</span>
                      <span className="ml-2">{intervention.implementation.resources.join(', ')}</span>
                    </div>
                  )}
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  {intervention.status === 'recommended' ? 'Implement' : 'View Details'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DynamicRiskAssessment;