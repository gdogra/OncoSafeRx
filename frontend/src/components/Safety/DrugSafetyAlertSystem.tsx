import React, { useState, useEffect, useRef } from 'react';
import { usePatient } from '../../context/PatientContext';
import Card from '../UI/Card';
import Alert from '../UI/Alert';
import Tooltip from '../UI/Tooltip';
import { 
  Shield, 
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Zap,
  Heart,
  TrendingUp,
  Activity,
  Database,
  Wifi,
  Settings,
  Filter,
  RefreshCw,
  Volume2,
  VolumeX,
  Eye,
  EyeOff
} from 'lucide-react';

interface SafetyAlert {
  id: string;
  type: 'critical' | 'major' | 'moderate' | 'minor';
  category: 'interaction' | 'contraindication' | 'dosing' | 'monitoring' | 'allergy' | 'genomic' | 'lab_value';
  title: string;
  message: string;
  details: string;
  source: string;
  timestamp: string;
  patient_id: string;
  drugs_involved?: string[];
  lab_values?: string[];
  recommended_action: string;
  override_reason?: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  auto_generated: boolean;
  real_time: boolean;
  persistent: boolean;
}

interface MonitoringParameter {
  parameter: string;
  current_value: number;
  normal_range: string;
  alert_threshold: number;
  status: 'normal' | 'warning' | 'critical';
  trend: 'stable' | 'improving' | 'worsening';
  last_checked: string;
}

interface SystemStatus {
  connection_status: 'connected' | 'disconnected' | 'connecting';
  last_sync: string;
  alerts_processed: number;
  database_version: string;
  monitoring_active: boolean;
}

const DrugSafetyAlertSystem: React.FC = () => {
  const { state, actions } = usePatient();
  const { currentPatient } = state;
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [monitoringParams, setMonitoringParams] = useState<MonitoringParameter[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    connection_status: 'connected',
    last_sync: new Date().toISOString(),
    alerts_processed: 0,
    database_version: 'v2024.3',
    monitoring_active: true
  });
  const [filter, setFilter] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const alertAudioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time monitoring simulation
  useEffect(() => {
    if (autoRefresh && currentPatient) {
      intervalRef.current = setInterval(() => {
        generateRealTimeAlerts();
        updateMonitoringParameters();
        updateSystemStatus();
      }, 5000); // Check every 5 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, currentPatient]);

  const generateRealTimeAlerts = () => {
    if (!currentPatient) return;

    // Simulate real-time safety alerts based on patient data
    const newAlerts: SafetyAlert[] = [];
    const timestamp = new Date().toISOString();

    // Drug-Drug Interaction Alert
    if (currentPatient.medications?.length > 1) {
      const criticalInteraction = Math.random() < 0.15; // 15% chance
      if (criticalInteraction) {
        newAlerts.push({
          id: `alert-${Date.now()}-1`,
          type: 'critical',
          category: 'interaction',
          title: 'CRITICAL: QTc Prolongation Risk',
          message: 'High-risk drug combination detected in real-time monitoring',
          details: 'Combination of ondansetron + azithromycin may cause dangerous heart rhythm abnormalities (Torsades de Pointes). Immediate intervention required.',
          source: 'FDA AERS Database + Real-time Monitoring',
          timestamp,
          patient_id: currentPatient.id,
          drugs_involved: ['Ondansetron', 'Azithromycin'],
          recommended_action: 'STOP azithromycin immediately. Consider alternative antibiotic. Order stat ECG.',
          acknowledged: false,
          auto_generated: true,
          real_time: true,
          persistent: true
        });
      }
    }

    // Lab Value Alert
    const labAlert = Math.random() < 0.1; // 10% chance
    if (labAlert) {
      newAlerts.push({
        id: `alert-${Date.now()}-2`,
        type: 'major',
        category: 'lab_value',
        title: 'Abnormal Lab Value Detected',
        message: 'Creatinine elevation detected in latest lab results',
        details: 'Serum creatinine increased to 2.3 mg/dL (was 1.1 mg/dL last week). May indicate drug-induced nephrotoxicity.',
        source: 'Lab Interface + Clinical Decision Support',
        timestamp,
        patient_id: currentPatient.id,
        lab_values: ['Creatinine: 2.3 mg/dL'],
        recommended_action: 'Hold nephrotoxic medications. Increase hydration. Recheck labs in 24-48 hours.',
        acknowledged: false,
        auto_generated: true,
        real_time: true,
        persistent: false
      });
    }

    // Genomic Alert
    if (currentPatient.genetics?.some(g => g.metabolizerStatus === 'poor')) {
      const genomicAlert = Math.random() < 0.05; // 5% chance
      if (genomicAlert) {
        newAlerts.push({
          id: `alert-${Date.now()}-3`,
          type: 'moderate',
          category: 'genomic',
          title: 'Pharmacogenomic Interaction',
          message: 'CYP2D6 poor metabolizer status affects current medication',
          details: 'Patient is CYP2D6 poor metabolizer. Current tamoxifen dose may be insufficient for therapeutic effect.',
          source: 'Pharmacogenomic Database',
          timestamp,
          patient_id: currentPatient.id,
          drugs_involved: ['Tamoxifen'],
          recommended_action: 'Consider increasing dose by 50% or switching to aromatase inhibitor.',
          acknowledged: false,
          auto_generated: true,
          real_time: false,
          persistent: true
        });
      }
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev]);
      setSystemStatus(prev => ({
        ...prev,
        alerts_processed: prev.alerts_processed + newAlerts.length
      }));

      // Play alert sound for critical alerts
      if (soundEnabled && newAlerts.some(a => a.type === 'critical')) {
        playAlertSound();
      }
    }
  };

  const updateMonitoringParameters = () => {
    const params: MonitoringParameter[] = [
      {
        parameter: 'Heart Rate',
        current_value: 72 + Math.floor(Math.random() * 20) - 10,
        normal_range: '60-100 bpm',
        alert_threshold: 120,
        status: 'normal',
        trend: 'stable',
        last_checked: new Date().toISOString()
      },
      {
        parameter: 'QTc Interval',
        current_value: 420 + Math.floor(Math.random() * 40) - 20,
        normal_range: '350-450 ms',
        alert_threshold: 500,
        status: 'normal',
        trend: 'stable',
        last_checked: new Date().toISOString()
      },
      {
        parameter: 'Creatinine',
        current_value: 1.0 + Math.random() * 0.4,
        normal_range: '0.7-1.3 mg/dL',
        alert_threshold: 2.0,
        status: 'normal',
        trend: 'stable',
        last_checked: new Date().toISOString()
      }
    ];

    // Determine status and trends
    params.forEach(param => {
      if (param.current_value > param.alert_threshold) {
        param.status = 'critical';
      } else if (param.current_value > param.alert_threshold * 0.8) {
        param.status = 'warning';
      }
      
      // Random trend assignment for demo
      const trendRandom = Math.random();
      if (trendRandom < 0.1) param.trend = 'worsening';
      else if (trendRandom < 0.2) param.trend = 'improving';
    });

    setMonitoringParams(params);
  };

  const updateSystemStatus = () => {
    setSystemStatus(prev => ({
      ...prev,
      last_sync: new Date().toISOString(),
      connection_status: Math.random() < 0.95 ? 'connected' : 'connecting'
    }));
  };

  const playAlertSound = () => {
    if (alertAudioRef.current) {
      alertAudioRef.current.play().catch(console.error);
    }
  };

  const acknowledgeAlert = (alertId: string, reason?: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? {
            ...alert,
            acknowledged: true,
            acknowledged_by: 'current-user', // TODO: Get from auth
            acknowledged_at: new Date().toISOString(),
            override_reason: reason
          }
        : alert
    ));
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'major': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'moderate': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'minor': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'major': return <Shield className="w-5 h-5 text-orange-600" />;
      case 'moderate': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'minor': return <Activity className="w-5 h-5 text-blue-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'interaction': return <Zap className="w-4 h-4" />;
      case 'contraindication': return <Shield className="w-4 h-4" />;
      case 'dosing': return <Activity className="w-4 h-4" />;
      case 'monitoring': return <Heart className="w-4 h-4" />;
      case 'allergy': return <AlertTriangle className="w-4 h-4" />;
      case 'genomic': return <Database className="w-4 h-4" />;
      case 'lab_value': return <TrendingUp className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'normal': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'worsening': return <TrendingUp className="w-4 h-4 text-red-600 transform rotate-180" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (!showResolved && alert.acknowledged) return false;
    if (filter === 'all') return true;
    return alert.category === filter;
  });

  const criticalAlerts = alerts.filter(a => a.type === 'critical' && !a.acknowledged);

  if (!currentPatient) {
    return (
      <Card>
        <div className="text-center py-12">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">Drug Safety Alert System</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Select a patient to activate real-time drug safety monitoring and alerts
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with System Status */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Drug Safety Alert System</h1>
              <p className="text-gray-600">
                Real-time monitoring for {currentPatient.demographics.firstName} {currentPatient.demographics.lastName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                systemStatus.connection_status === 'connected' ? 'bg-green-500' :
                systemStatus.connection_status === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium text-gray-600">
                {systemStatus.connection_status === 'connected' ? 'Connected' :
                 systemStatus.connection_status === 'connecting' ? 'Connecting...' :
                 'Disconnected'}
              </span>
            </div>
            {criticalAlerts.length > 0 && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 border border-red-300 rounded-lg animate-pulse">
                <Bell className="w-4 h-4 text-red-600" />
                <span className="text-sm font-bold text-red-800">{criticalAlerts.length} Critical</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <Alert type="error" title={`${criticalAlerts.length} Critical Alert${criticalAlerts.length > 1 ? 's' : ''} Require Immediate Attention`}>
          <div className="space-y-2">
            {criticalAlerts.slice(0, 2).map(alert => (
              <div key={alert.id} className="flex items-center justify-between">
                <span className="font-medium">{alert.title}</span>
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="px-3 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 text-sm"
                >
                  Acknowledge
                </button>
              </div>
            ))}
          </div>
        </Alert>
      )}

      {/* System Controls */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Auto-refresh:</span>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  autoRefresh ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                  autoRefresh ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-gray-400" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
              <span className="text-sm text-gray-600">Sound alerts:</span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  soundEnabled ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              {showResolved ? <Eye className="w-4 h-4 text-gray-400" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
              <span className="text-sm text-gray-600">Show resolved:</span>
              <button
                onClick={() => setShowResolved(!showResolved)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  showResolved ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                  showResolved ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Last sync: {new Date(systemStatus.last_sync).toLocaleTimeString()}
          </div>
        </div>
      </Card>

      {/* Real-time Monitoring Parameters */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Real-time Monitoring</h3>
          <Tooltip content="Continuous monitoring of key safety parameters">
            <Wifi className="w-4 h-4 text-gray-400" />
          </Tooltip>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {monitoringParams.map((param, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{param.parameter}</span>
                {getTrendIcon(param.trend)}
              </div>
              <div className={`text-2xl font-bold ${getStatusColor(param.status)}`}>
                {typeof param.current_value === 'number' 
                  ? param.current_value.toFixed(param.parameter === 'Creatinine' ? 1 : 0)
                  : param.current_value}
                {param.parameter === 'Heart Rate' && ' bpm'}
                {param.parameter === 'QTc Interval' && ' ms'}
                {param.parameter === 'Creatinine' && ' mg/dL'}
              </div>
              <div className="text-sm text-gray-600">
                Normal: {param.normal_range}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Updated: {new Date(param.last_checked).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Alert Filters */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Categories</option>
              <option value="interaction">Drug Interactions</option>
              <option value="contraindication">Contraindications</option>
              <option value="dosing">Dosing Alerts</option>
              <option value="monitoring">Monitoring</option>
              <option value="allergy">Allergies</option>
              <option value="genomic">Genomic</option>
              <option value="lab_value">Lab Values</option>
            </select>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{filteredAlerts.length} alerts</span>
            <span>•</span>
            <span>{systemStatus.alerts_processed} processed today</span>
          </div>
        </div>
      </Card>

      {/* Safety Alerts */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No Active Safety Alerts</h3>
              <p className="text-gray-400">
                {filter === 'all' 
                  ? 'All safety parameters are within normal limits'
                  : `No ${filter.replace('_', ' ')} alerts at this time`
                }
              </p>
            </div>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${
              alert.acknowledged ? 'opacity-60' :
              alert.type === 'critical' ? 'border-red-500 bg-red-50' :
              alert.type === 'major' ? 'border-orange-500 bg-orange-50' :
              alert.type === 'moderate' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(alert.category)}
                      <span className="text-sm font-medium text-gray-600 capitalize">
                        {alert.category.replace('_', ' ')}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getAlertColor(alert.type)}`}>
                      {alert.type}
                    </span>
                    {alert.real_time && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Real-time
                      </span>
                    )}
                    {alert.acknowledged && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        ✓ Acknowledged
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{alert.title}</h3>
                  <p className="text-gray-700 mb-3">{alert.message}</p>
                  
                  <div className="bg-white bg-opacity-50 p-3 rounded-lg mb-3">
                    <div className="text-sm font-medium text-gray-800 mb-1">Details:</div>
                    <p className="text-sm text-gray-700">{alert.details}</p>
                  </div>

                  {alert.drugs_involved && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Drugs Involved:</div>
                      <div className="flex flex-wrap gap-1">
                        {alert.drugs_involved.map((drug, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {drug}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                    <div className="text-sm font-medium text-yellow-800 mb-1">Recommended Action:</div>
                    <p className="text-sm text-yellow-700">{alert.recommended_action}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Source: {alert.source}</span>
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>

                  {alert.acknowledged && alert.acknowledged_by && (
                    <div className="mt-2 text-xs text-gray-500">
                      Acknowledged by {alert.acknowledged_by} at {new Date(alert.acknowledged_at!).toLocaleString()}
                      {alert.override_reason && ` - Reason: ${alert.override_reason}`}
                    </div>
                  )}
                </div>

                {!alert.acknowledged && (
                  <div className="ml-4 flex flex-col space-y-2">
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                      Acknowledge
                    </button>
                    {alert.type === 'critical' && (
                      <button
                        onClick={() => {
                          const reason = prompt('Override reason (required for critical alerts):');
                          if (reason) acknowledgeAlert(alert.id, reason);
                        }}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                      >
                        Override
                      </button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* System Stats */}
      <Card className="bg-gray-50">
        <div className="flex items-center space-x-2 mb-4">
          <Database className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-red-600">{alerts.filter(a => a.type === 'critical').length}</div>
            <div className="text-sm text-gray-600">Critical Alerts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{alerts.filter(a => a.type === 'major').length}</div>
            <div className="text-sm text-gray-600">Major Alerts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{alerts.filter(a => a.acknowledged).length}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{systemStatus.database_version}</div>
            <div className="text-sm text-gray-600">Database Version</div>
          </div>
        </div>
      </Card>

      {/* Hidden audio element for alert sounds */}
      <audio ref={alertAudioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzyW4PLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzyW4PLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzyW4PLNeSsFJXfH8N2QQAoUXrTp66hVFApGn+DyvmMcBzyW4PLNeSsF" type="audio/wav" />
      </audio>
    </div>
  );
};

export default DrugSafetyAlertSystem;