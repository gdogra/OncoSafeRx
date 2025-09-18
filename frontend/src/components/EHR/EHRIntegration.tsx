import React, { useState, useEffect } from 'react';
import { usePatient } from '../../context/PatientContext';
import { fhirService, FHIRBundle, FHIRPatient } from '../../services/fhirService';
import Card from '../UI/Card';
import Alert from '../UI/Alert';
import Tooltip from '../UI/Tooltip';
import LoadingSpinner from '../UI/LoadingSpinner';
import {
  Database,
  Search,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Users,
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  FileText,
  Clock,
  Link as LinkIcon
} from 'lucide-react';

const EHRIntegration: React.FC = () => {
  const { state, actions } = usePatient();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<{ version?: string; error?: string }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FHIRPatient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'import' | 'export' | 'settings'>('search');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const result = await fhirService.validateConnection();
      setIsConnected(result.connected);
      setConnectionInfo(result);
    } catch (error) {
      setIsConnected(false);
      setConnectionInfo({ error: 'Failed to check connection' });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    
    try {
      const bundle = await fhirService.searchPatients({
        name: searchQuery,
        limit: 10
      });

      const patients = bundle.entry?.map(entry => entry.resource as FHIRPatient) || [];
      setSearchResults(patients);
      
      if (patients.length === 0) {
        setSearchError(`No patients found matching "${searchQuery}"`);
      }
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async (fhirPatient: FHIRPatient) => {
    if (!fhirPatient.id) {
      setImportStatus({ success: false, message: 'Invalid patient ID' });
      return;
    }

    setIsImporting(true);
    setImportStatus(null);

    try {
      const patientData = await fhirService.getPatientWithResources(fhirPatient.id);
      
      const patientProfile = fhirService.convertFHIRPatientToProfile(
        patientData.patient,
        patientData.observations,
        patientData.medications,
        patientData.allergies,
        patientData.conditions
      );

      actions.setCurrentPatient(patientProfile);
      setImportStatus({
        success: true,
        message: `Successfully imported patient: ${patientProfile.demographics.firstName} ${patientProfile.demographics.lastName}`
      });

      // Auto-hide success message
      setTimeout(() => setImportStatus(null), 5000);
    } catch (error) {
      setImportStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Import failed'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    if (!state.currentPatient) {
      setImportStatus({ success: false, message: 'No patient selected for export' });
      return;
    }

    setIsImporting(true);
    setImportStatus(null);

    try {
      const fhirPatient = await fhirService.createPatient(state.currentPatient);
      setImportStatus({
        success: true,
        message: `Patient exported to EHR system with ID: ${fhirPatient.id}`
      });
    } catch (error) {
      setImportStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Export failed'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const formatPatientName = (patient: FHIRPatient): string => {
    const name = patient.name?.[0];
    if (name) {
      return `${name.given?.join(' ') || ''} ${name.family || ''}`.trim();
    }
    return 'Unknown Name';
  };

  const getPatientIdentifier = (patient: FHIRPatient): string => {
    const mrn = patient.identifier?.find(id => id.type?.coding?.[0]?.code === 'MR');
    return mrn?.value || patient.id || 'No ID';
  };

  const tabs = [
    { id: 'search', label: 'Search Patients', icon: Search },
    { id: 'import', label: 'Import Data', icon: Download },
    { id: 'export', label: 'Export Data', icon: Upload },
    { id: 'settings', label: 'Connection', icon: Database },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Database className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">EHR Integration</h1>
          <Tooltip content="Connect to Electronic Health Record systems using FHIR R4 standard for seamless patient data exchange">
            <Info className="w-5 h-5 text-gray-400" />
          </Tooltip>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Import patient data from Electronic Health Record systems, export OncoSafeRx data, and maintain seamless clinical workflows.
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isConnected === null ? (
              <Activity className="w-6 h-6 text-gray-400 animate-pulse" />
            ) : isConnected ? (
              <Wifi className="w-6 h-6 text-green-600" />
            ) : (
              <WifiOff className="w-6 h-6 text-red-600" />
            )}
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                FHIR Server Connection
              </h3>
              <p className="text-sm text-gray-600">
                {isConnected === null ? 'Checking connection...' :
                 isConnected ? `Connected • FHIR ${connectionInfo.version || 'R4'}` :
                 `Disconnected • ${connectionInfo.error}`}
              </p>
            </div>
          </div>
          
          <button
            onClick={checkConnection}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </Card>

      {/* Status Messages */}
      {importStatus && (
        <Alert 
          type={importStatus.success ? 'success' : 'error'} 
          title={importStatus.success ? 'Success' : 'Error'}
        >
          {importStatus.message}
        </Alert>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm ${
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

        <div className="p-6">
          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Search className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900">Search EHR Patients</h3>
                  <Tooltip content="Search for patients in the connected EHR system by name or identifier">
                    <Info className="w-4 h-4 text-gray-400" />
                  </Tooltip>
                </div>
                
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Enter patient name..."
                    disabled={!isConnected}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={!isConnected || isSearching || !searchQuery.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSearching ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Search</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Search Error */}
              {searchError && (
                <Alert type="error" title="Search Error">
                  {searchError}
                </Alert>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">
                    Search Results ({searchResults.length})
                  </h4>
                  <div className="space-y-3">
                    {searchResults.map((patient, index) => (
                      <div
                        key={patient.id || index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {formatPatientName(patient)}
                            </div>
                            <div className="text-sm text-gray-600">
                              ID: {getPatientIdentifier(patient)} • 
                              DOB: {patient.birthDate || 'Unknown'} • 
                              Gender: {patient.gender || 'Unknown'}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleImport(patient)}
                          disabled={isImporting}
                          className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          {isImporting ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          <span>Import</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Download className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">Import Patient Data</h3>
                <Tooltip content="Import comprehensive patient data including demographics, medications, allergies, conditions, and lab results">
                  <Info className="w-4 h-4 text-gray-400" />
                </Tooltip>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <div className="text-center py-6">
                    <Users className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                    <h4 className="font-medium text-gray-900 mb-2">Demographics</h4>
                    <p className="text-sm text-gray-600">Basic patient information, contact details, and identifiers</p>
                  </div>
                </Card>

                <Card>
                  <div className="text-center py-6">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <h4 className="font-medium text-gray-900 mb-2">Clinical Data</h4>
                    <p className="text-sm text-gray-600">Medications, allergies, conditions, and treatment history</p>
                  </div>
                </Card>

                <Card>
                  <div className="text-center py-6">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                    <h4 className="font-medium text-gray-900 mb-2">Lab Results</h4>
                    <p className="text-sm text-gray-600">Laboratory values, vital signs, and diagnostic results</p>
                  </div>
                </Card>
              </div>

              <Alert type="info" title="Data Import Process">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Search for patients using the Search tab</li>
                  <li>Select a patient to import their complete clinical record</li>
                  <li>Data is automatically converted to OncoSafeRx format</li>
                  <li>Safety alerts are generated based on imported data</li>
                </ul>
              </Alert>
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Upload className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">Export Patient Data</h3>
                <Tooltip content="Export OncoSafeRx patient data to EHR systems in FHIR format">
                  <Info className="w-4 h-4 text-gray-400" />
                </Tooltip>
              </div>

              {state.currentPatient ? (
                <div className="space-y-4">
                  <Card>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Users className="w-6 h-6 text-primary-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {state.currentPatient.demographics.firstName} {state.currentPatient.demographics.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            MRN: {state.currentPatient.demographics.mrn || 'Not assigned'} • 
                            Last updated: {new Date(state.currentPatient.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleExport}
                        disabled={!isConnected || isImporting}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isImporting ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>Export to EHR</span>
                      </button>
                    </div>
                  </Card>

                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-medium text-gray-900">{state.currentPatient.allergies.length}</div>
                      <div className="text-gray-600">Allergies</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-medium text-gray-900">{state.currentPatient.medications.filter(m => m.isActive).length}</div>
                      <div className="text-gray-600">Active Medications</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-medium text-gray-900">{state.currentPatient.conditions.length}</div>
                      <div className="text-gray-600">Conditions</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-medium text-gray-900">{state.currentPatient.labValues.length}</div>
                      <div className="text-gray-600">Lab Values</div>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert type="info" title="No Patient Selected">
                  Select a patient from the Patients tab to export their data to the EHR system.
                </Alert>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Database className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">Connection Settings</h3>
                <Tooltip content="Configure FHIR server connection and authentication settings">
                  <Info className="w-4 h-4 text-gray-400" />
                </Tooltip>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <h4 className="font-medium text-gray-900 mb-3">Server Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Endpoint:</span>
                      <span className="font-mono">{process.env.REACT_APP_FHIR_BASE_URL || 'https://hapi.fhir.org/baseR4'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version:</span>
                      <span>{connectionInfo.version || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`inline-flex items-center space-x-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                        {isConnected ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                      </span>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h4 className="font-medium text-gray-900 mb-3">Security</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <LinkIcon className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600">HTTPS Encryption: Enabled</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600">FHIR R4 Compliance: Yes</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-gray-600">Token Auth: {process.env.REACT_APP_FHIR_AUTH_TOKEN ? 'Configured' : 'Not configured'}</span>
                    </div>
                  </div>
                </Card>
              </div>

              <Alert type="warning" title="Configuration Note">
                EHR integration requires proper FHIR server configuration and authentication. Contact your system administrator to configure connection settings via environment variables.
              </Alert>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EHRIntegration;