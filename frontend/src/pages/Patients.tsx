import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/PatientContext';
import PatientSelector from '../components/Patient/PatientSelector';
import PatientDashboard from '../components/Patient/PatientDashboard';
import Card from '../components/UI/Card';
import { Users, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import Tooltip from '../components/UI/Tooltip';

const Patients: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = usePatient();
  const { currentPatient } = state;

  const dismissOfflineBanner = () => {
    try {
      const key = 'oncosaferx:offline_banner_dismissed';
      sessionStorage.setItem(key, '1');
    } catch {}
    dispatch({ type: 'DISMISS_OFFLINE_BANNER' } as any);
  };

  const handleCheckInteractions = () => {
    if (currentPatient) {
      // Use setTimeout to ensure state updates complete before navigation
      setTimeout(() => navigate('/interactions?patient=' + currentPatient.id), 100);
    }
  };

  const handleGenomicAnalysis = () => {
    if (currentPatient) {
      // Use setTimeout to ensure state updates complete before navigation
      setTimeout(() => navigate('/genomics?patient=' + currentPatient.id), 100);
    }
  };

  const handlePlanRegimen = () => {
    if (currentPatient) {
      // Use setTimeout to ensure state updates complete before navigation
      setTimeout(() => navigate('/regimens?patient=' + currentPatient.id), 100);
    }
  };

  return (
    <div className="space-y-6">
      {/* Offline persistence banner */}
      {state.lastSaveOffline && state.showOfflineBanner && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-medium">Saved locally — not persisted</div>
              <div>{state.offlineNote || 'The server is not configured for persistence. Data was saved locally only.'}</div>
            </div>
            <div className="text-xs flex items-center gap-3">
              <Link to="/auth-diagnostics" className="text-blue-700 hover:underline">Auth Diagnostics</Link>
              <button onClick={dismissOfflineBanner} className="px-2 py-1 border rounded bg-white text-yellow-800 hover:bg-yellow-100">Dismiss</button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Users className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
          <Tooltip content="Comprehensive patient profile management with clinical data, medication history, and safety alerts">
            <Info className="w-5 h-5 text-gray-400" />
          </Tooltip>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Search for existing patients or create new patient profiles to access comprehensive clinical information and decision support tools.
        </p>
        <div className="mt-3">
          <Link to="/patients/all" className="text-sm text-blue-600 hover:underline">View all patients</Link>
        </div>
      </div>

      {/* Patient Selection */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PatientSelector />
        </div>
        
        <div className="lg:col-span-2">
          {currentPatient ? (
            <PatientDashboard />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">No Patient Selected</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Search for an existing patient or create a new patient profile to begin accessing 
                  clinical information and decision support tools.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {currentPatient && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Common clinical workflows for this patient</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={handleCheckInteractions}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Check Interactions
              </button>
              <button 
                onClick={handleGenomicAnalysis}
                className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700"
              >
                Genomic Analysis
              </button>
              <button 
                onClick={handlePlanRegimen}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
              >
                Plan Regimen
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Educational Content */}
      <Card>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Patient Safety Features</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Allergy Checking</h3>
              <p className="text-gray-600 text-sm">
                Automatic cross-referencing of patient allergies with drug selections to prevent 
                adverse reactions and ensure safe prescribing practices.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Clinical Alerts</h3>
              <p className="text-gray-600 text-sm">
                Real-time alerts for drug interactions, contraindications, dosing concerns, 
                and monitoring requirements based on patient-specific factors.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Genomic Integration</h3>
              <p className="text-gray-600 text-sm">
                Integration of pharmacogenomic data to personalize drug selection and dosing 
                based on individual genetic variants and metabolizer status.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Patients;
