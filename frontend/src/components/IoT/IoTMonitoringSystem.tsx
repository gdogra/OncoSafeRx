import React, { useState, useEffect, useRef } from 'react';
import { usePatient } from '../../context/PatientContext';
import Card from '../UI/Card';
import Alert from '../UI/Alert';
import Tooltip from '../UI/Tooltip';
import LoadingSpinner from '../UI/LoadingSpinner';
import { 
  Smartphone, 
  Watch,
  Heart,
  Activity,
  Thermometer,
  Droplets,
  Zap,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  MapPin,
  Settings,
  Bluetooth,
  Radio,
  Monitor,
  Stethoscope,
  Eye,
  Pill,
  Scale,
  Moon,
  Sun,
  Navigation
} from 'lucide-react';

interface IoTDevice {
  id: string;
  name: string;
  type: 'wearable' | 'sensor' | 'pump' | 'monitor' | 'implant' | 'mobile_app';
  brand: string;
  model: string;
  status: 'connected' | 'disconnected' | 'low_battery' | 'error' | 'syncing';
  battery_level?: number;
  last_sync: string;
  connection_type: 'bluetooth' | 'wifi' | 'cellular' | 'nfc';
  patient_id: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  firmware_version: string;
  data_types: string[];
}

interface IoTReading {
  id: string;
  device_id: string;
  metric: string;
  value: number;
  unit: string;
  timestamp: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  alert_triggered: boolean;
  context?: {
    activity: string;
    medication_time?: string;
    sleep_stage?: string;
    stress_level?: number;
  };
}

interface DeviceAlert {
  id: string;
  device_id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  action_taken?: string;
}

interface HealthTrend {
  metric: string;
  current_value: number;
  trend_7d: number;
  trend_30d: number;
  percentile_rank: number;
  target_range: [number, number];
  status: 'optimal' | 'good' | 'concerning' | 'critical';
}

const IoTMonitoringSystem: React.FC = () => {
  const { state } = usePatient();
  const { currentPatient } = state;
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [readings, setReadings] = useState<IoTReading[]>([]);
  const [alerts, setAlerts] = useState<DeviceAlert[]>([]);
  const [healthTrends, setHealthTrends] = useState<HealthTrend[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentPatient) {
      initializeDevices();
      startRealTimeMonitoring();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentPatient, realTimeEnabled]);

  const initializeDevices = () => {
    if (!currentPatient) return;

    const demoDevices: IoTDevice[] = [
      {
        id: 'device-1',
        name: 'Apple Watch Series 9',
        type: 'wearable',
        brand: 'Apple',
        model: 'A2986',
        status: 'connected',
        battery_level: 78,
        last_sync: new Date().toISOString(),
        connection_type: 'bluetooth',
        patient_id: currentPatient.id,
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          address: 'San Francisco, CA'
        },
        firmware_version: '10.1.1',
        data_types: ['heart_rate', 'ecg', 'blood_oxygen', 'activity', 'sleep', 'fall_detection']
      },
      {
        id: 'device-2',
        name: 'Dexcom G7 CGM',
        type: 'sensor',
        brand: 'Dexcom',
        model: 'G7',
        status: 'connected',
        battery_level: 92,
        last_sync: new Date(Date.now() - 300000).toISOString(),
        connection_type: 'bluetooth',
        patient_id: currentPatient.id,
        firmware_version: '1.2.4',
        data_types: ['glucose_level', 'glucose_trend']
      },
      {
        id: 'device-3',
        name: 'Fitbit Sense 2',
        type: 'wearable',
        brand: 'Fitbit',
        model: 'FB521',
        status: 'low_battery',
        battery_level: 15,
        last_sync: new Date(Date.now() - 1800000).toISOString(),
        connection_type: 'wifi',
        patient_id: currentPatient.id,
        firmware_version: '3.14.159',
        data_types: ['stress_level', 'skin_temperature', 'heart_rate_variability']
      },
      {
        id: 'device-4',
        name: 'Withings Body+ Scale',
        type: 'sensor',
        brand: 'Withings',
        model: 'WBS05',
        status: 'connected',
        last_sync: new Date(Date.now() - 7200000).toISOString(),
        connection_type: 'wifi',
        patient_id: currentPatient.id,
        firmware_version: '2.8.1',
        data_types: ['weight', 'body_fat', 'muscle_mass', 'bone_mass', 'water_percentage']
      },
      {
        id: 'device-5',
        name: 'OncoSafeRx Mobile App',
        type: 'mobile_app',
        brand: 'OncoSafeRx',
        model: 'v3.2.1',
        status: 'connected',
        battery_level: 85,
        last_sync: new Date(Date.now() - 60000).toISOString(),
        connection_type: 'cellular',
        patient_id: currentPatient.id,
        firmware_version: '3.2.1',
        data_types: ['medication_adherence', 'symptoms', 'mood', 'pain_level', 'side_effects']
      },
      {
        id: 'device-6',
        name: 'Philips HealthSuite',
        type: 'monitor',
        brand: 'Philips',
        model: 'HSP-100',
        status: 'connected',
        last_sync: new Date(Date.now() - 180000).toISOString(),
        connection_type: 'wifi',
        patient_id: currentPatient.id,
        firmware_version: '1.5.2',
        data_types: ['blood_pressure', 'pulse', 'temperature', 'respiratory_rate']
      }
    ];

    setDevices(demoDevices);
    setSelectedDevice(demoDevices[0].id);
    generateInitialReadings(demoDevices);
    generateHealthTrends();
  };

  const generateInitialReadings = (deviceList: IoTDevice[]) => {
    const readings: IoTReading[] = [];
    const now = Date.now();

    deviceList.forEach(device => {
      device.data_types.forEach(dataType => {
        // Generate last 24 hours of data
        for (let i = 0; i < 288; i++) { // Every 5 minutes
          const timestamp = new Date(now - (i * 5 * 60 * 1000));
          readings.push(generateReading(device.id, dataType, timestamp.toISOString()));
        }
      });
    });

    setReadings(readings);
  };

  const generateReading = (deviceId: string, metric: string, timestamp: string): IoTReading => {
    const baseValues: { [key: string]: { base: number; variance: number; unit: string } } = {
      heart_rate: { base: 72, variance: 15, unit: 'bpm' },
      blood_oxygen: { base: 98, variance: 2, unit: '%' },
      blood_pressure_systolic: { base: 120, variance: 15, unit: 'mmHg' },
      blood_pressure_diastolic: { base: 80, variance: 10, unit: 'mmHg' },
      glucose_level: { base: 110, variance: 30, unit: 'mg/dL' },
      temperature: { base: 36.5, variance: 0.8, unit: '°C' },
      weight: { base: 70, variance: 1, unit: 'kg' },
      stress_level: { base: 3, variance: 2, unit: '/10' },
      pain_level: { base: 2, variance: 2, unit: '/10' },
      medication_adherence: { base: 95, variance: 10, unit: '%' },
      activity: { base: 5000, variance: 2000, unit: 'steps' }
    };

    const config = baseValues[metric] || { base: 50, variance: 10, unit: '' };
    const value = config.base + (Math.random() - 0.5) * config.variance;
    
    return {
      id: `reading-${deviceId}-${metric}-${Date.now()}-${Math.random()}`,
      device_id: deviceId,
      metric,
      value: Math.round(value * 100) / 100,
      unit: config.unit,
      timestamp,
      quality: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)] as any,
      alert_triggered: Math.random() < 0.05, // 5% chance of alert
      context: metric === 'heart_rate' ? {
        activity: ['resting', 'walking', 'exercising'][Math.floor(Math.random() * 3)],
        stress_level: Math.floor(Math.random() * 10)
      } : undefined
    };
  };

  const generateHealthTrends = () => {
    const trends: HealthTrend[] = [
      {
        metric: 'Heart Rate',
        current_value: 72,
        trend_7d: -2.3,
        trend_30d: 1.8,
        percentile_rank: 65,
        target_range: [60, 100],
        status: 'good'
      },
      {
        metric: 'Blood Oxygen',
        current_value: 98,
        trend_7d: 0.5,
        trend_30d: -0.2,
        percentile_rank: 85,
        target_range: [95, 100],
        status: 'optimal'
      },
      {
        metric: 'Stress Level',
        current_value: 4.2,
        trend_7d: 1.1,
        trend_30d: -0.8,
        percentile_rank: 45,
        target_range: [0, 3],
        status: 'concerning'
      },
      {
        metric: 'Medication Adherence',
        current_value: 94,
        trend_7d: -3.2,
        trend_30d: 2.1,
        percentile_rank: 78,
        target_range: [90, 100],
        status: 'good'
      }
    ];

    setHealthTrends(trends);
  };

  const startRealTimeMonitoring = () => {
    if (!realTimeEnabled) return;

    intervalRef.current = setInterval(() => {
      // Generate new readings for all connected devices
      const connectedDevices = devices.filter(d => d.status === 'connected');
      
      connectedDevices.forEach(device => {
        device.data_types.forEach(dataType => {
          if (Math.random() < 0.3) { // 30% chance of new reading per interval
            const newReading = generateReading(device.id, dataType, new Date().toISOString());
            setReadings(prev => [newReading, ...prev.slice(0, 999)]); // Keep last 1000 readings
            
            // Check for alerts
            if (newReading.alert_triggered) {
              generateDeviceAlert(device, newReading);
            }
          }
        });
      });

      // Simulate device status changes
      if (Math.random() < 0.1) { // 10% chance
        setDevices(prev => prev.map(device => ({
          ...device,
          battery_level: device.battery_level ? Math.max(0, device.battery_level - Math.random() * 2) : undefined,
          last_sync: Math.random() < 0.8 ? new Date().toISOString() : device.last_sync
        })));
      }
    }, 5000); // Update every 5 seconds
  };

  const generateDeviceAlert = (device: IoTDevice, reading: IoTReading) => {
    const alertTypes = [
      {
        type: 'critical' as const,
        title: 'Critical Reading Detected',
        message: `${reading.metric} reading of ${reading.value} ${reading.unit} is outside critical range`
      },
      {
        type: 'warning' as const,
        title: 'Unusual Pattern Detected',
        message: `${reading.metric} shows abnormal pattern requiring attention`
      },
      {
        type: 'info' as const,
        title: 'Device Sync Complete',
        message: `${device.name} has successfully synced new data`
      }
    ];

    const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    
    const newAlert: DeviceAlert = {
      id: `alert-${Date.now()}`,
      device_id: device.id,
      type: alert.type,
      title: alert.title,
      message: alert.message,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    setAlerts(prev => [newAlert, ...prev]);
  };

  const scanForDevices = async () => {
    setIsScanning(true);
    
    // Simulate device discovery
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Add a new device (for demo)
    const newDevice: IoTDevice = {
      id: `device-${Date.now()}`,
      name: 'AliveCor KardiaMobile',
      type: 'sensor',
      brand: 'AliveCor',
      model: 'AC-009',
      status: 'connected',
      battery_level: 67,
      last_sync: new Date().toISOString(),
      connection_type: 'bluetooth',
      patient_id: currentPatient!.id,
      firmware_version: '2.1.0',
      data_types: ['ecg', 'heart_rhythm']
    };

    setDevices(prev => [...prev, newDevice]);
    setIsScanning(false);
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'wearable': return <Watch className="w-5 h-5" />;
      case 'sensor': return <Activity className="w-5 h-5" />;
      case 'pump': return <Droplets className="w-5 h-5" />;
      case 'monitor': return <Monitor className="w-5 h-5" />;
      case 'implant': return <Heart className="w-5 h-5" />;
      case 'mobile_app': return <Smartphone className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-red-600';
      case 'low_battery': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'syncing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'disconnected': return <WifiOff className="w-4 h-4 text-red-600" />;
      case 'low_battery': return <BatteryLow className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'syncing': return <LoadingSpinner size="sm" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'bluetooth': return <Bluetooth className="w-3 h-3" />;
      case 'wifi': return <Wifi className="w-3 h-3" />;
      case 'cellular': return <Radio className="w-3 h-3" />;
      case 'nfc': return <Zap className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 1) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend < -1) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'concerning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const selectedDeviceData = selectedDevice ? devices.find(d => d.id === selectedDevice) : null;
  const deviceReadings = selectedDeviceData 
    ? readings.filter(r => r.device_id === selectedDevice).slice(0, 20)
    : [];

  if (!currentPatient) {
    return (
      <Card>
        <div className="text-center py-12">
          <Smartphone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">IoT Health Monitoring</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Select a patient to monitor their connected health devices and IoT sensors
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">IoT Health Monitoring</h1>
              <p className="text-gray-600">
                Connected devices for {currentPatient.demographics.firstName} {currentPatient.demographics.lastName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${realTimeEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium text-gray-600">
                Real-time: {realTimeEnabled ? 'Active' : 'Paused'}
              </span>
            </div>
            <button
              onClick={() => setRealTimeEnabled(!realTimeEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                realTimeEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                realTimeEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </Card>

      {/* Active Alerts */}
      {alerts.filter(a => !a.resolved).length > 0 && (
        <div className="space-y-2">
          {alerts.filter(a => !a.resolved).slice(0, 3).map(alert => (
            <Alert
              key={alert.id}
              type={alert.type === 'critical' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'}
              title={alert.title}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Device: {devices.find(d => d.id === alert.device_id)?.name} • {new Date(alert.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => setAlerts(prev => prev.map(a => a.id === alert.id ? {...a, resolved: true} : a))}
                  className="ml-4 px-3 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 text-sm"
                >
                  Resolve
                </button>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Device Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device) => (
          <Card 
            key={device.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedDevice === device.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setSelectedDevice(device.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  {getDeviceIcon(device.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{device.name}</h3>
                  <p className="text-sm text-gray-600">{device.brand} {device.model}</p>
                </div>
              </div>
              {getStatusIcon(device.status)}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium capitalize ${getStatusColor(device.status)}`}>
                  {device.status.replace('_', ' ')}
                </span>
              </div>

              {device.battery_level && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Battery:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          device.battery_level > 50 ? 'bg-green-500' :
                          device.battery_level > 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${device.battery_level}%` }}
                      />
                    </div>
                    <span className="font-medium">{device.battery_level}%</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Connection:</span>
                <div className="flex items-center space-x-1">
                  {getConnectionIcon(device.connection_type)}
                  <span className="font-medium capitalize">{device.connection_type}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last sync:</span>
                <span className="font-medium">
                  {new Date(device.last_sync).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-600 mb-1">Data types:</div>
              <div className="flex flex-wrap gap-1">
                {device.data_types.slice(0, 3).map((type, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                    {type.replace('_', ' ')}
                  </span>
                ))}
                {device.data_types.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    +{device.data_types.length - 3}
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}

        {/* Add Device Card */}
        <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Add New Device</h3>
            <p className="text-sm text-gray-600 mb-3">Connect wearables, sensors, or monitors</p>
            <button
              onClick={scanForDevices}
              disabled={isScanning}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isScanning ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4" />}
              <span>{isScanning ? 'Scanning...' : 'Scan for Devices'}</span>
            </button>
          </div>
        </Card>
      </div>

      {/* Health Trends Overview */}
      <Card>
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-semibold text-gray-900">Health Trends</h2>
          <Tooltip content="AI-powered analysis of health metrics trends from connected devices">
            <Eye className="w-4 h-4 text-gray-400" />
          </Tooltip>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {healthTrends.map((trend, index) => (
            <div key={index} className={`p-4 rounded-lg border ${getHealthStatusColor(trend.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{trend.metric}</h3>
                {getTrendIcon(trend.trend_7d)}
              </div>
              
              <div className="text-2xl font-bold mb-2">{trend.current_value}</div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">7-day trend:</span>
                  <span className={`font-medium ${trend.trend_7d > 0 ? 'text-green-600' : trend.trend_7d < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {trend.trend_7d > 0 ? '+' : ''}{trend.trend_7d}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Percentile:</span>
                  <span className="font-medium">{trend.percentile_rank}th</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target:</span>
                  <span className="font-medium">{trend.target_range[0]}-{trend.target_range[1]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Selected Device Details */}
      {selectedDeviceData && (
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            {getDeviceIcon(selectedDeviceData.type)}
            <h2 className="text-xl font-semibold text-gray-900">{selectedDeviceData.name}</h2>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(selectedDeviceData.status)}`}>
              {selectedDeviceData.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Device Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Brand:</span>
                  <span className="font-medium">{selectedDeviceData.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Model:</span>
                  <span className="font-medium">{selectedDeviceData.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Firmware:</span>
                  <span className="font-medium">{selectedDeviceData.firmware_version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Connection:</span>
                  <span className="font-medium capitalize">{selectedDeviceData.connection_type}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Sync Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Last sync:</span>
                  <span className="font-medium">{new Date(selectedDeviceData.last_sync).toLocaleString()}</span>
                </div>
                {selectedDeviceData.battery_level && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Battery:</span>
                    <span className="font-medium">{selectedDeviceData.battery_level}%</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Data points:</span>
                  <span className="font-medium">{deviceReadings.length}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Location</h3>
              {selectedDeviceData.location ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">{selectedDeviceData.location.address}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedDeviceData.location.latitude.toFixed(4)}, {selectedDeviceData.location.longitude.toFixed(4)}
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-500">Location not available</span>
              )}
            </div>
          </div>

          {/* Recent Readings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Recent Readings</h3>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>
            </div>

            {deviceReadings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quality</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {deviceReadings.slice(0, 10).map((reading) => (
                      <tr key={reading.id} className={reading.alert_triggered ? 'bg-red-50' : ''}>
                        <td className="px-3 py-2 text-sm font-medium text-gray-900 capitalize">
                          {reading.metric.replace('_', ' ')}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {reading.value} {reading.unit}
                          {reading.alert_triggered && <AlertTriangle className="w-3 h-3 text-red-500 inline ml-1" />}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            reading.quality === 'excellent' ? 'bg-green-100 text-green-600' :
                            reading.quality === 'good' ? 'bg-blue-100 text-blue-600' :
                            reading.quality === 'fair' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {reading.quality}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600">
                          {new Date(reading.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-600">
                          {reading.context?.activity && (
                            <span className="capitalize">{reading.context.activity}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500">No recent readings available</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* System Summary */}
      <Card className="bg-gray-50">
        <div className="flex items-center space-x-2 mb-4">
          <Monitor className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">System Overview</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{devices.filter(d => d.status === 'connected').length}</div>
            <div className="text-sm text-gray-600">Connected</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{devices.filter(d => d.status === 'disconnected').length}</div>
            <div className="text-sm text-gray-600">Offline</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{devices.filter(d => d.status === 'low_battery').length}</div>
            <div className="text-sm text-gray-600">Low Battery</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{readings.length}</div>
            <div className="text-sm text-gray-600">Total Readings</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{alerts.filter(a => !a.resolved).length}</div>
            <div className="text-sm text-gray-600">Active Alerts</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IoTMonitoringSystem;