import React, { useState } from 'react';
import { usePatient } from '../../context/PatientContext';
import { PatientMedication, Drug } from '../../types';
import Card from '../UI/Card';
import Tooltip from '../UI/Tooltip';
import Alert from '../UI/Alert';
import { 
  Pill, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  Info,
  Filter,
  Search
} from 'lucide-react';

interface MedicationManagerProps {
  patientId?: string;
}

const MedicationManager: React.FC<MedicationManagerProps> = ({ patientId }) => {
  const { state, actions } = usePatient();
  const { currentPatient } = state;
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<PatientMedication | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [newMedication, setNewMedication] = useState<Partial<PatientMedication>>({
    drugName: '',
    dosage: '',
    frequency: '',
    route: 'Oral',
    startDate: new Date().toISOString().split('T')[0],
    indication: '',
    prescribedBy: '',
    isActive: true,
    adherence: 'good'
  });

  if (!currentPatient) {
    return (
      <Card>
        <div className="text-center py-8">
          <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">No Patient Selected</h3>
          <p className="text-gray-400">Select a patient to manage their medications</p>
        </div>
      </Card>
    );
  }

  const getMedications = () => {
    let medications = currentPatient.medications || [];
    
    // Filter by status
    if (filter === 'active') {
      medications = medications.filter(med => med.isActive);
    } else if (filter === 'inactive') {
      medications = medications.filter(med => !med.isActive);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      medications = medications.filter(med => 
        med.drugName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.indication?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.prescribedBy?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return medications;
  };

  const handleAddMedication = () => {
    if (!newMedication.drugName || !newMedication.dosage || !newMedication.frequency) {
      alert('Please fill in all required fields');
      return;
    }

    const medication: any = {
      id: `med-${Date.now()}`,
      drugName: newMedication.drugName,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency,
      route: newMedication.route || 'Oral',
      startDate: newMedication.startDate || new Date().toISOString().split('T')[0],
      endDate: newMedication.endDate,
      indication: newMedication.indication || '',
      prescribedBy: newMedication.prescribedBy || '',
      isActive: newMedication.isActive !== false,
      adherence: newMedication.adherence || 'good',
      sideEffects: newMedication.sideEffects || []
    };

    const updatedMedications = [...(currentPatient.medications || []), medication];
    actions.updatePatientData({ medications: updatedMedications });

    // Reset form
    setNewMedication({
      drugName: '',
      dosage: '',
      frequency: '',
      route: 'Oral',
      startDate: new Date().toISOString().split('T')[0],
      indication: '',
      prescribedBy: '',
      isActive: true,
      adherence: 'good'
    });
    setShowAddForm(false);
  };

  const handleEditMedication = (medication: any) => {
    setEditingMedication(medication);
    setNewMedication(medication);
    setShowAddForm(true);
  };

  const handleUpdateMedication = () => {
    if (!editingMedication || !newMedication.drugName || !newMedication.dosage || !newMedication.frequency) {
      alert('Please fill in all required fields');
      return;
    }

    const updatedMedications = currentPatient.medications.map(med => 
      med.id === editingMedication.id ? { ...newMedication, id: editingMedication.id } : med
    );
    
    actions.updatePatientData({ medications: updatedMedications });

    // Reset form
    setNewMedication({
      drugName: '',
      dosage: '',
      frequency: '',
      route: 'Oral',
      startDate: new Date().toISOString().split('T')[0],
      indication: '',
      prescribedBy: '',
      isActive: true,
      adherence: 'good'
    });
    setEditingMedication(null);
    setShowAddForm(false);
  };

  const handleRemoveMedication = (medicationId: string) => {
    if (confirm('Are you sure you want to remove this medication?')) {
      const updatedMedications = currentPatient.medications.filter(med => med.id !== medicationId);
      actions.updatePatientData({ medications: updatedMedications });
    }
  };

  const toggleMedicationStatus = (medicationId: string) => {
    const updatedMedications = currentPatient.medications.map(med => 
      med.id === medicationId ? { ...med, isActive: !med.isActive, endDate: med.isActive ? new Date().toISOString().split('T')[0] : undefined } : med
    );
    actions.updatePatientData({ medications: updatedMedications });
  };

  const getAdherenceColor = (adherence?: string) => {
    switch (adherence) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const medications = getMedications();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Pill className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Medication Management</h2>
              <p className="text-sm text-gray-600">
                {currentPatient.demographics.firstName} {currentPatient.demographics.lastName} - Current medications and history
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medication</span>
          </button>
        </div>
      </Card>

      {/* Filters and Search */}
      <Card>
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Medications</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search medications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {medications.length} medication{medications.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </Card>

      {/* Medication List */}
      <div className="space-y-4">
        {medications.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No Medications Found</h3>
              <p className="text-gray-400">
                {searchQuery || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add the first medication to get started'
                }
              </p>
            </div>
          </Card>
        ) : (
          medications.map((medication) => (
            <Card key={medication.id} className={`${!medication.isActive ? 'bg-gray-50 border-gray-200' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{medication.drugName}</h3>
                    <div className="flex items-center space-x-2">
                      {medication.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Inactive
                        </span>
                      )}
                      {medication.adherence && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAdherenceColor(medication.adherence)}`}>
                          {medication.adherence} adherence
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Dosage & Frequency:</span>
                      <p className="text-gray-900">{medication.dosage} {medication.frequency}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Route:</span>
                      <p className="text-gray-900">{medication.route}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Start Date:</span>
                      <p className="text-gray-900">{new Date(medication.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {medication.indication && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium text-gray-700">Indication:</span>
                      <p className="text-gray-900">{medication.indication}</p>
                    </div>
                  )}

                  {medication.prescribedBy && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium text-gray-700">Prescribed by:</span>
                      <p className="text-gray-900">{medication.prescribedBy}</p>
                    </div>
                  )}

                  {medication.endDate && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium text-gray-700">End Date:</span>
                      <p className="text-gray-900">{new Date(medication.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Tooltip content={medication.isActive ? 'Mark as inactive' : 'Mark as active'}>
                    <button
                      onClick={() => toggleMedicationStatus(medication.id)}
                      className={`p-2 rounded-lg ${
                        medication.isActive 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {medication.isActive ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </button>
                  </Tooltip>
                  <Tooltip content="Edit medication">
                    <button
                      onClick={() => handleEditMedication(medication)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Remove medication">
                    <button
                      onClick={() => handleRemoveMedication(medication.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Medication Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingMedication ? 'Edit Medication' : 'Add New Medication'}
              </h3>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Drug Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMedication.drugName || ''}
                    onChange={(e) => setNewMedication({ ...newMedication, drugName: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Tamoxifen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosage <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMedication.dosage || ''}
                    onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., 20 mg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newMedication.frequency || ''}
                    onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select frequency</option>
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="Four times daily">Four times daily</option>
                    <option value="Every other day">Every other day</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Every 3 weeks">Every 3 weeks</option>
                    <option value="Monthly">Monthly</option>
                    <option value="As needed">As needed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                  <select
                    value={newMedication.route || 'Oral'}
                    onChange={(e) => setNewMedication({ ...newMedication, route: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Oral">Oral</option>
                    <option value="IV">Intravenous (IV)</option>
                    <option value="IM">Intramuscular (IM)</option>
                    <option value="SC">Subcutaneous (SC)</option>
                    <option value="Topical">Topical</option>
                    <option value="Inhalation">Inhalation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newMedication.startDate || ''}
                    onChange={(e) => setNewMedication({ ...newMedication, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newMedication.endDate || ''}
                    onChange={(e) => setNewMedication({ ...newMedication, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Indication</label>
                <input
                  type="text"
                  value={newMedication.indication || ''}
                  onChange={(e) => setNewMedication({ ...newMedication, indication: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Breast cancer adjuvant therapy"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prescribed By</label>
                  <input
                    type="text"
                    value={newMedication.prescribedBy || ''}
                    onChange={(e) => setNewMedication({ ...newMedication, prescribedBy: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Dr. Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adherence</label>
                  <select
                    value={newMedication.adherence || 'good'}
                    onChange={(e) => setNewMedication({ ...newMedication, adherence: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newMedication.isActive !== false}
                    onChange={(e) => setNewMedication({ ...newMedication, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active medication</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingMedication(null);
                  setNewMedication({
                    drugName: '',
                    dosage: '',
                    frequency: '',
                    route: 'Oral',
                    startDate: new Date().toISOString().split('T')[0],
                    indication: '',
                    prescribedBy: '',
                    isActive: true,
                    adherence: 'good'
                  });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={editingMedication ? handleUpdateMedication : handleAddMedication}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {editingMedication ? 'Update Medication' : 'Add Medication'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationManager;