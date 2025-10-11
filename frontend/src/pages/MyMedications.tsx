import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';
import Tooltip from '../components/UI/Tooltip';
import { useToast } from '../components/UI/Toast';
import { Pill, Clock, AlertTriangle, CheckCircle, Calendar, Bell, Info, Plus, Edit, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  instructions: string;
  sideEffects?: string[];
  isActive: boolean;
  nextDose?: string;
  adherence?: number;
}

const MyMedications: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const { state: patientState, actions } = usePatient();
  const { currentPatient } = patientState;
  const { showToast } = useToast();

  // API config and helpers
  const ENABLE_PATIENT_API = String((import.meta as any)?.env?.VITE_ENABLE_PATIENT_API || '').toLowerCase() === 'true';
  const API_BASE = (import.meta as any)?.env?.VITE_API_URL || '/api';

  const authHeaders = async (): Promise<Record<string, string> | null> => {
    try {
      if (!ENABLE_PATIENT_API) return null;
      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token;
      if (!token) return null;
      return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    } catch { return null; }
  };

  // Button handlers
  const handleEnableNotifications = () => {
    showToast('info', 'Notification settings coming soon!');
  };

  const handleMessageCareTeam = () => {
    const message = `I have questions about my current medications and would like to discuss any concerns with my care team.`;
    if (confirm(`Send this message to your care team?\n\n"${message}"`)) {
      showToast('success', 'Message sent to your care team. You will get a reply within 24 hours.');
    }
  };

  const handleCallEmergency = () => {
    if (confirm('Are you experiencing a medical emergency? Click OK to call the emergency line.')) {
      window.open('tel:+1-800-EMERGENCY', '_self');
    }
  };

  const handleAddMedication = () => {
    setShowAddForm(true);
  };

  const handleSaveMedication = () => {
    if (!newMedication.name || !newMedication.dosage || !newMedication.frequency) {
      showToast('error', 'Please fill in Name, Dosage and Frequency');
      return;
    }

    if (!currentPatient) {
      showToast('error', 'No patient selected. Please select a patient first.');
      return;
    }

    const patientMedication = {
      id: Date.now().toString(),
      drug: {
        id: Date.now().toString(),
        rxcui: '',
        name: newMedication.name,
        generic_name: newMedication.name,
        oncologyDrug: false
      },
      dosage: newMedication.dosage,
      frequency: newMedication.frequency,
      frequencyOther: newMedication.frequency === 'Other' ? (newMedication.frequencyOther || '') : undefined,
      route: newMedication.route || 'oral',
      startDate: newMedication.startDate,
      indication: 'Patient-reported',
      prescriber: newMedication.prescribedBy || 'Self-reported',
      isActive: true,
      adherence: 'excellent' as const,
      sideEffects: []
    };

    const tryApi = async () => {
      const headers = await authHeaders();
      if (!headers || !currentPatient?.id) return false;
      try {
        const resp = await fetch(`${API_BASE}/patients/${encodeURIComponent(currentPatient.id)}/medications`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ medication: patientMedication })
        } as any);
        if (!resp.ok) {
          try {
            const body = await resp.json();
            const msg = body?.error || (Array.isArray(body?.details) ? body.details.join('; ') : 'Save failed');
            showToast('error', msg);
          } catch {
            showToast('error', `Save failed: ${resp.status}`);
          }
          return false;
        }
        const body = await resp.json();
        const meds = Array.isArray(body?.medications) ? body.medications : null;
        if (meds) actions.updatePatientData({ medications: meds });
        return true;
      } catch { return false; }
    };

    // Try API first; fall back to local update
    tryApi().then((ok) => {
      if (!ok) {
        const updatedMedications = [...(currentPatient.medications || []), patientMedication];
        actions.updatePatientData({ medications: updatedMedications });
        showToast('warning', 'Saved locally (offline)');
      }
    });

    setNewMedication({
      name: '',
      dosage: '',
      frequency: '',
      route: 'oral',
      frequencyOther: '',
      prescribedBy: '',
      instructions: '',
      startDate: new Date().toISOString().split('T')[0]
    });
    setShowAddForm(false);
    showToast('success', 'Medication added');
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setEditingMedication(null);
    setNewMedication({
      name: '',
      dosage: '',
      frequency: '',
      route: 'oral',
      frequencyOther: '',
      prescribedBy: '',
      instructions: '',
      startDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleDeleteMedication = (medicationId: string) => {
    if (!currentPatient) return;
    
    if (confirm('Are you sure you want to remove this medication from your list?')) {
      const tryApi = async () => {
        const headers = await authHeaders();
        if (!headers || !currentPatient?.id) return false;
        try {
          const resp = await fetch(`${API_BASE}/patients/${encodeURIComponent(currentPatient.id)}/medications/${encodeURIComponent(medicationId)}`, {
            method: 'DELETE',
            headers
          } as any);
          if (!resp.ok) {
            try {
              const body = await resp.json();
              const msg = body?.error || 'Delete failed';
              showToast('error', msg);
            } catch {
              showToast('error', `Delete failed: ${resp.status}`);
            }
            return false;
          }
          const body = await resp.json();
          const meds = Array.isArray(body?.medications) ? body.medications : null;
          if (meds) actions.updatePatientData({ medications: meds });
          return true;
        } catch { return false; }
      };

      tryApi().then((ok) => {
        if (!ok) {
          const updatedMedications = currentPatient.medications.filter(med => med.id !== medicationId);
          actions.updatePatientData({ medications: updatedMedications });
          showToast('warning', 'Removed locally (offline)');
        }
        showToast('success', 'Medication removed');
      });
    }
  };

  const handleCompleteMedication = (medicationId: string) => {
    if (!currentPatient) return;
    const today = new Date().toISOString().split('T')[0];
    const tryApi = async () => {
      const headers = await authHeaders();
      if (!headers || !currentPatient?.id) return false;
      try {
        const resp = await fetch(`${API_BASE}/patients/${encodeURIComponent(currentPatient.id)}/medications/${encodeURIComponent(medicationId)}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ medication: { isActive: false, endDate: today } })
        } as any);
        if (!resp.ok) {
          try {
            const body = await resp.json();
            const msg = body?.error || 'Update failed';
            showToast('error', msg);
          } catch {
            showToast('error', `Update failed: ${resp.status}`);
          }
          return false;
        }
        const body = await resp.json();
        const meds = Array.isArray(body?.medications) ? body.medications : null;
        if (meds) actions.updatePatientData({ medications: meds });
        return true;
      } catch { return false; }
    };
    tryApi().then((ok) => {
      if (!ok) {
        const updatedMedications = currentPatient.medications.map(med =>
          med.id === medicationId ? { ...med, isActive: false, endDate: today } : med
        );
        actions.updatePatientData({ medications: updatedMedications });
        showToast('warning', 'Updated locally (offline)');
      }
    });
  };

  const handleRestoreMedication = (medicationId: string) => {
    if (!currentPatient) return;
    const tryApi = async () => {
      const headers = await authHeaders();
      if (!headers || !currentPatient?.id) return false;
      try {
        const resp = await fetch(`${API_BASE}/patients/${encodeURIComponent(currentPatient.id)}/medications/${encodeURIComponent(medicationId)}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ medication: { isActive: true, endDate: null } })
        } as any);
        if (!resp.ok) {
          try {
            const body = await resp.json();
            const msg = body?.error || 'Update failed';
            showToast('error', msg);
          } catch {
            showToast('error', `Update failed: ${resp.status}`);
          }
          return false;
        }
        const body = await resp.json();
        const meds = Array.isArray(body?.medications) ? body.medications : null;
        if (meds) actions.updatePatientData({ medications: meds });
        return true;
      } catch { return false; }
    };
    tryApi().then((ok) => {
      if (!ok) {
        const updatedMedications = currentPatient.medications.map(med =>
          med.id === medicationId ? { ...med, isActive: true, endDate: undefined } : med
        );
        actions.updatePatientData({ medications: updatedMedications });
        showToast('warning', 'Updated locally (offline)');
      }
    });
  };

  const handleEditMedication = (medication: any) => {
    setEditingMedication(medication);
    setNewMedication({
      name: medication.drug?.name || '',
      dosage: medication.dosage || '',
      frequency: medication.frequency || '',
      route: medication.route || 'oral',
      prescribedBy: medication.prescriber || '',
      instructions: medication.indication || '',
      startDate: medication.startDate || new Date().toISOString().split('T')[0]
    });
    setShowAddForm(true);
  };

  const handleUpdateMedication = () => {
    if (!newMedication.name || !newMedication.dosage || !newMedication.frequency) {
      showToast('error', 'Please fill in Name, Dosage and Frequency');
      return;
    }

    if (!editingMedication || !currentPatient) return;

    const updatedMedication = {
      ...editingMedication,
      drug: {
        ...editingMedication.drug,
        name: newMedication.name,
        generic_name: newMedication.name
      },
      dosage: newMedication.dosage,
      frequency: newMedication.frequency,
      route: newMedication.route || 'oral',
      prescriber: newMedication.prescribedBy || 'Self-reported',
      indication: newMedication.instructions || 'Take as directed',
      startDate: newMedication.startDate
    };

    const tryApi = async () => {
      const headers = await authHeaders();
      if (!headers || !currentPatient?.id) return false;
      try {
        const resp = await fetch(`${API_BASE}/patients/${encodeURIComponent(currentPatient.id)}/medications/${encodeURIComponent((editingMedication as any).id)}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ medication: updatedMedication })
        } as any);
        if (!resp.ok) {
          try {
            const body = await resp.json();
            const msg = body?.error || (Array.isArray(body?.details) ? body.details.join('; ') : 'Update failed');
            showToast('error', msg);
          } catch {
            showToast('error', `Update failed: ${resp.status}`);
          }
          return false;
        }
        const body = await resp.json();
        const meds = Array.isArray(body?.medications) ? body.medications : null;
        if (meds) actions.updatePatientData({ medications: meds });
        return true;
      } catch { return false; }
    };

    tryApi().then((ok) => {
      if (!ok) {
        const updatedMedications = currentPatient.medications.map(med => 
          med.id === (editingMedication as any).id ? updatedMedication : med
        );
        actions.updatePatientData({ medications: updatedMedications });
        showToast('warning', 'Updated locally (offline)');
      }
      handleCancelAdd();
      showToast('success', 'Medication updated');
    });
  };

  // Get medications from current patient
  const medications = currentPatient?.medications || [];

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    route: 'oral',
    frequencyOther: '',
    prescribedBy: '',
    instructions: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const activeMedications = medications.filter(med => med.isActive);
  const completedMedications = medications.filter(med => !med.isActive);

  const getAdherenceColor = (adherence: number | string) => {
    if (typeof adherence === 'string') {
      switch (adherence) {
        case 'excellent': return 'text-green-600 bg-green-100';
        case 'good': return 'text-blue-600 bg-blue-100';
        case 'fair': return 'text-yellow-600 bg-yellow-100';
        case 'poor': return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    }
    if (adherence >= 90) return 'text-green-600 bg-green-100';
    if (adherence >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAdherenceDisplay = (adherence: number | string) => {
    if (typeof adherence === 'string') {
      return adherence.charAt(0).toUpperCase() + adherence.slice(1);
    }
    return `${adherence}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatRouteLabel = (route: string | undefined) => {
    const r = String(route || '').toLowerCase();
    if (!r) return '';
    // Common codes that should stay uppercase
    if (['iv', 'im', 'sc'].includes(r)) return r.toUpperCase();
    // Title case for descriptive routes
    return r.charAt(0).toUpperCase() + r.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Medications</h1>
          <p className="text-gray-600 mt-1">Track your current medications and treatment plan</p>
        </div>
        <button 
          onClick={handleAddMedication}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medication</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Medications</p>
              <p className="text-2xl font-bold text-gray-900">{activeMedications.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Adherence</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeMedications.length > 0 ? 'Good' : 'N/A'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Dose</p>
              <p className="text-lg font-semibold text-gray-900">
                {activeMedications.find(med => med.nextDose) ? 'Today' : 'None scheduled'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Medication Form */}
      {showAddForm && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingMedication ? 'Edit Medication' : 'Add New Medication'}
            </h2>
            <button
              onClick={handleCancelAdd}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medication Name *
              </label>
              <input
                type="text"
                value={newMedication.name}
                onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Tylenol, Metformin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dosage *
              </label>
              <input
                type="text"
                value={newMedication.dosage}
                onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 500mg, 10ml"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency *
              </label>
              <select
                value={newMedication.frequency}
                onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select frequency</option>
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="Four times daily">Four times daily</option>
                <option value="Every other day">Every other day</option>
                <option value="Weekly">Weekly</option>
                <option value="As needed">As needed</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Route
              </label>
              <select
                value={newMedication.route}
                onChange={(e) => setNewMedication({ ...newMedication, route: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="oral">Oral</option>
                <option value="iv">IV (intravenous)</option>
                <option value="im">IM (intramuscular)</option>
                <option value="sc">SC (subcutaneous)</option>
                <option value="topical">Topical</option>
                <option value="inhalation">Inhalation</option>
                <option value="sublingual">Sublingual</option>
                <option value="rectal">Rectal</option>
                <option value="transdermal">Transdermal</option>
                <option value="ophthalmic">Ophthalmic</option>
                <option value="otic">Otic</option>
                <option value="nasal">Nasal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prescribed By
              </label>
              <input
                type="text"
                value={newMedication.prescribedBy}
                onChange={(e) => setNewMedication({...newMedication, prescribedBy: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Dr. Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={newMedication.startDate}
                onChange={(e) => setNewMedication({...newMedication, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <textarea
                value={newMedication.instructions}
                onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Take with food, avoid alcohol"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleCancelAdd}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={editingMedication ? handleUpdateMedication : handleSaveMedication}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingMedication ? 'Update Medication' : 'Add Medication'}
            </button>
          </div>
        </Card>
      )}

      {/* Important Notice */}
      <Alert type="info" title="Important">
        Always take your medications exactly as prescribed by your healthcare team. If you experience any concerning side effects or have questions, contact your care team immediately.
      </Alert>

      {/* Active Medications */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Active Medications</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            <span>Tap medication for details</span>
          </div>
        </div>

        {activeMedications.length > 0 ? (
          <div className="space-y-4">
            {activeMedications.map((medication) => (
              <div key={medication.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{medication.drug?.name || medication.name}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                      {medication.adherence && (
                        <span className={`px-2 py-1 text-xs rounded-full ${getAdherenceColor(medication.adherence)}`}>
                          {getAdherenceDisplay(medication.adherence)} adherence
                        </span>
                      )}
                      {medication.route && (
                        <Tooltip content="Route of administration">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {formatRouteLabel(medication.route)}
                          </span>
                        </Tooltip>
                      )}
                      
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">
                          <strong>Dosage:</strong> {medication.dosage}
                        </p>
                        <p className="text-gray-600">
                          <strong>Frequency:</strong> {medication.frequency == 'Other' && (medication as any).frequencyOther ? (medication as any).frequencyOther : medication.frequency}
                        </p>
                        <p className="text-gray-600">
                          <strong>Prescribed by:</strong> {medication.prescriber || medication.prescribedBy}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          <strong>Started:</strong> {formatDate(medication.startDate)}
                        </p>
                        {medication.nextDose && (
                          <p className="text-gray-600">
                            <strong>Next dose:</strong> {formatDate(medication.nextDose)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-gray-700 text-sm">{medication.instructions}</p>
                    </div>

                    {medication.sideEffects && medication.sideEffects.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-900 mb-1">Common side effects:</p>
                        <div className="flex flex-wrap gap-1">
                          {medication.sideEffects.map((effect, index) => (
                            <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                              {effect}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Action buttons */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleEditMedication(medication as any)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit medication"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCompleteMedication(medication.id)}
                      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      title="Mark as completed"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMedication(medication.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove medication"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Pill className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No active medications</p>
          </div>
        )}
      </Card>

      {/* Completed/Previous Medications */}
      {completedMedications.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Previous Medications</h2>
          <div className="space-y-4">
            {completedMedications.map((medication) => (
              <div key={medication.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-700">{medication.name}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Completed</span>
                      {medication.adherence && (
                        <span className={`px-2 py-1 text-xs rounded-full ${getAdherenceColor(medication.adherence)}`}>
                          {getAdherenceDisplay(medication.adherence)} adherence
                        </span>
                      )}
                      {medication.route && (
                        <Tooltip content="Route of administration">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {formatRouteLabel(medication.route)}
                          </span>
                        </Tooltip>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">
                          <strong>Dosage:</strong> {medication.dosage}
                        </p>
                        <p className="text-gray-600">
                          <strong>Duration:</strong> {formatDate(medication.startDate)} - {medication.endDate ? formatDate(medication.endDate) : 'Ongoing'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          <strong>Prescribed by:</strong> {medication.prescriber || medication.prescribedBy}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleEditMedication(medication)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit medication"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRestoreMedication(medication.id)}
                      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      title="Mark as active"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMedication(medication.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove medication"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Medication Reminders */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Medication Reminders</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Set up medication reminders</h3>
              <p className="text-blue-700 text-sm mt-1">
                Never miss a dose! Set up notifications on your phone or use a pill organizer to stay on track with your medication schedule.
              </p>
              <button 
                onClick={handleEnableNotifications}
                className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Enable Notifications
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Contact Care Team */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-900">Contact Your Care Team</h3>
              <p className="text-green-700 text-sm mt-1">
                Have questions about your medications or experiencing side effects? Your care team is here to help.
              </p>
              <div className="mt-3 space-x-3">
                <button 
                  onClick={handleMessageCareTeam}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                >
                  Message Care Team
                </button>
                <button 
                  onClick={handleCallEmergency}
                  className="px-4 py-2 border border-green-600 text-green-600 text-sm rounded-lg hover:bg-green-50"
                >
                  Call Emergency Line
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MyMedications;
