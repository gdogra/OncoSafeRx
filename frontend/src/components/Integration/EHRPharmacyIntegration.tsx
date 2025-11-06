import React, { useState, useEffect } from 'react';
import {
  Database,
  Stethoscope,
  Pill,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  MapPin,
  RefreshCw,
  Settings,
  Link as LinkIcon,
  User,
  FileText,
  Activity,
  TrendingUp,
  Heart,
  Zap
} from 'lucide-react';
import Card from '../UI/Card';
import LoadingSpinner from '../UI/LoadingSpinner';
import Alert from '../UI/Alert';

interface EHRSystem {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'connecting';
  lastSync?: Date;
  medicationCount?: number;
}

interface PharmacyProvider {
  id: string;
  name: string;
  services: string[];
  available: boolean;
}

interface MedicationPricing {
  pharmacyName: string;
  cashPrice: number;
  insurancePrice?: number;
  availability: boolean;
  storeLocations: any[];
}

interface SyncStatus {
  status: string;
  lastSync?: Date;
  nextSync?: Date;
  conflicts: number;
  errors: number;
}

const EHRPharmacyIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ehr' | 'pharmacy' | 'reconciliation' | 'pricing'>('ehr');
  const [ehrSystems, setEHRSystems] = useState<EHRSystem[]>([]);
  const [pharmacyProviders, setPharmacyProviders] = useState<PharmacyProvider[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pricingResults, setPricingResults] = useState<MedicationPricing[]>([]);

  // Integration status
  const [ehrConnected, setEHRConnected] = useState(false);
  const [pharmacyConnected, setPharmacyConnected] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  useEffect(() => {
    loadIntegrationData();
  }, []);

  const loadIntegrationData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load EHR systems
      const ehrResponse = await fetch('/api/ehr-integration/systems');
      if (ehrResponse.ok) {
        const ehrData = await ehrResponse.json();
        setEHRSystems(ehrData.supportedSystems.map((system: any) => ({
          id: system.id,
          name: system.name,
          status: system.available ? 'disconnected' : 'disconnected',
          medicationCount: 0
        })));
      }

      // Load pharmacy providers
      const pharmacyResponse = await fetch('/api/pharmacy-integration/providers');
      if (pharmacyResponse.ok) {
        const pharmacyData = await pharmacyResponse.json();
        setPharmacyProviders(pharmacyData.supportedProviders);
      }

      // Load sync status
      const patientId = 'current-patient'; // Replace with actual patient ID
      const syncResponse = await fetch(`/api/ehr-integration/sync/status/${patientId}`);
      if (syncResponse.ok) {
        const syncData = await syncResponse.json();
        setSyncStatus(syncData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integration data');
    } finally {
      setLoading(false);
    }
  };

  const connectEHRSystem = async (systemId: string) => {
    try {
      const response = await fetch('/api/ehr-integration/auth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ehrSystem: systemId,
          patientId: 'current-patient',
          redirectUri: window.location.origin + '/ehr-callback'
        })
      });

      if (response.ok) {
        const authData = await response.json();
        // Redirect to EHR authorization
        window.location.href = authData.authUrl;
      }
    } catch (err) {
      setError(`Failed to connect to ${systemId}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const initializeSync = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ehr-integration/sync/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: 'current-patient',
          syncConfig: {
            ehrSystems: ehrSystems.filter(s => s.status === 'connected').map(s => s.id),
            pharmacies: pharmacyProviders.filter(p => p.available).map(p => p.id),
            syncFrequency: 'standard',
            conflictResolution: 'manual',
            autoReconcile: false
          }
        })
      });

      if (response.ok) {
        const syncData = await response.json();
        setSyncStatus({
          status: 'active',
          nextSync: new Date(syncData.nextSync),
          conflicts: 0,
          errors: 0
        });
      }
    } catch (err) {
      setError(`Failed to initialize sync: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const triggerManualSync = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ehr-integration/sync/trigger/current-patient', {
        method: 'POST'
      });

      if (response.ok) {
        await loadIntegrationData(); // Refresh data
      }
    } catch (err) {
      setError(`Manual sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkMedicationPricing = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pharmacy-integration/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rxcui: '1049221', // Example RXCUI for demonstration
          zipCode: '90210',
          insuranceInfo: {
            bin: '003858',
            pcn: 'A4',
            memberId: 'DEMO123'
          }
        })
      });

      if (response.ok) {
        const pricingData = await response.json();
        setPricingResults(pricingData.pricing || []);
      }
    } catch (err) {
      setError(`Pricing check failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-50';
      case 'connecting': return 'text-yellow-600 bg-yellow-50';
      case 'disconnected': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'connecting': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'disconnected': return <AlertTriangle className="w-4 h-4 text-gray-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Database className="w-8 h-8 mr-3 text-blue-600" />
            EHR & Pharmacy Integration
          </h1>
          <p className="text-gray-600 mt-1">
            Connect with EHR systems and pharmacy networks for comprehensive medication management
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full ${ehrConnected ? 'bg-green-500' : 'bg-gray-300'} mb-1`}></div>
            <p className="text-xs text-gray-600">EHR</p>
          </div>
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full ${pharmacyConnected ? 'bg-green-500' : 'bg-gray-300'} mb-1`}></div>
            <p className="text-xs text-gray-600">Pharmacy</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error" title="Integration Error">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-700 hover:text-red-900 underline"
          >
            Dismiss
          </button>
        </Alert>
      )}

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'ehr', label: 'EHR Systems', icon: Stethoscope },
            { id: 'pharmacy', label: 'Pharmacy Networks', icon: Pill },
            { id: 'reconciliation', label: 'Medication Reconciliation', icon: FileText },
            { id: 'pricing', label: 'Price Comparison', icon: DollarSign }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* EHR Systems Tab */}
      {activeTab === 'ehr' && (
        <div className="space-y-6">
          {/* Sync Status */}
          {syncStatus && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Sync Status</h2>
                <button
                  onClick={triggerManualSync}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Manual Sync</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-blue-900 capitalize">{syncStatus.status}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Last Sync</p>
                  <p className="font-semibold text-green-900">
                    {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleTimeString() : 'Never'}
                  </p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Conflicts</p>
                  <p className="font-semibold text-yellow-900">{syncStatus.conflicts}</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <Zap className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Errors</p>
                  <p className="font-semibold text-red-900">{syncStatus.errors}</p>
                </div>
              </div>
            </Card>
          )}

          {/* EHR Systems List */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Available EHR Systems</h2>
              {!syncStatus && (
                <button
                  onClick={initializeSync}
                  disabled={loading || ehrSystems.every(s => s.status !== 'connected')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  Initialize Sync
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {ehrSystems.map((system) => (
                <div key={system.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Stethoscope className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">{system.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusIcon(system.status)}
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(system.status)}`}>
                            {system.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {system.medicationCount !== undefined && (
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Medications</p>
                          <p className="font-semibold text-gray-900">{system.medicationCount}</p>
                        </div>
                      )}
                      
                      {system.status === 'disconnected' ? (
                        <button
                          onClick={() => connectEHRSystem(system.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Connect
                        </button>
                      ) : system.status === 'connected' ? (
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
                          Connected
                        </button>
                      ) : (
                        <button disabled className="px-4 py-2 bg-gray-400 text-white rounded-lg">
                          Connecting...
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {system.lastSync && (
                    <p className="text-sm text-gray-600 mt-2">
                      Last synchronized: {new Date(system.lastSync).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Pharmacy Networks Tab */}
      {activeTab === 'pharmacy' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pharmacy Network Providers</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pharmacyProviders.map((provider) => (
                <div key={provider.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Pill className="w-6 h-6 text-green-600" />
                      <h3 className="font-medium text-gray-900">{provider.name}</h3>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      provider.available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {provider.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Services:</p>
                    <div className="flex flex-wrap gap-2">
                      {provider.services.map((service, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Price Comparison Tab */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Medication Price Comparison</h2>
              <button
                onClick={checkMedicationPricing}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Checking...' : 'Check Prices'}
              </button>
            </div>
            
            {pricingResults.length > 0 ? (
              <div className="space-y-4">
                {pricingResults.map((result, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{result.pharmacyName}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        result.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.availability ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Cash Price</p>
                        <p className="font-semibold">${result.cashPrice.toFixed(2)}</p>
                      </div>
                      {result.insurancePrice && (
                        <div>
                          <p className="text-gray-600">Insurance Price</p>
                          <p className="font-semibold text-green-600">${result.insurancePrice.toFixed(2)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-600">Locations</p>
                        <p className="font-semibold">{result.storeLocations.length} stores</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pricing Data</h3>
                <p className="text-gray-600">
                  Click "Check Prices" to compare medication costs across pharmacy networks.
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Medication Reconciliation Tab */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Medication Reconciliation</h2>
            
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Reconciliation Workflow</h3>
              <p className="text-gray-600 mb-4">
                Comprehensive medication reconciliation across all connected systems will be available once EHR integration is established.
              </p>
              <button
                disabled={!ehrConnected}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
              >
                Start Reconciliation
              </button>
            </div>
          </Card>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <LoadingSpinner />
            <p className="text-center mt-3">Processing integration request...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EHRPharmacyIntegration;