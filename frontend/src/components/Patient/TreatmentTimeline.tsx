import React, { useState, useMemo } from 'react';
import { usePatient } from '../../context/PatientContext';
import { TreatmentHistory } from '../../types';
import Card from '../UI/Card';
import Tooltip from '../UI/Tooltip';
import Alert from '../UI/Alert';
import { 
  History, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Info,
  Filter,
  Search,
  Zap,
  Target,
  Scissors
} from 'lucide-react';

interface TreatmentTimelineProps {
  patientId?: string;
}

const TreatmentTimeline: React.FC<TreatmentTimelineProps> = ({ patientId }) => {
  const { state, actions } = usePatient();
  const { currentPatient } = state;
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<TreatmentHistory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [newTreatment, setNewTreatment] = useState<Partial<TreatmentHistory>>({
    treatmentType: 'chemotherapy',
    regimen: '',
    drugs: [],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    cycles: 1,
    response: 'stable',
    toxicities: [],
    notes: ''
  });

  const [newToxicity, setNewToxicity] = useState({ grade: 1, description: '', action: '' });

  if (!currentPatient) {
    return (
      <Card>
        <div className="text-center py-8">
          <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">No Patient Selected</h3>
          <p className="text-gray-400">Select a patient to view their treatment history</p>
        </div>
      </Card>
    );
  }

  const getTreatments = () => {
    let treatments = currentPatient.treatmentHistory || [];
    
    // Filter by status
    if (filter === 'active') {
      treatments = treatments.filter(t => !t.endDate);
    } else if (filter === 'completed') {
      treatments = treatments.filter(t => t.endDate);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      treatments = treatments.filter(t => t.treatmentType === typeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      treatments = treatments.filter(t => 
        t.regimen?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.drugs?.some(drug => drug.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by start date (most recent first)
    return treatments.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  };

  const treatmentTimeline = useMemo(() => {
    const treatments = currentPatient.treatmentHistory || [];
    return treatments
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .map((treatment, index) => ({
        ...treatment,
        order: index + 1
      }));
  }, [currentPatient.treatmentHistory]);

  const handleAddTreatment = () => {
    if (!newTreatment.treatmentType || !newTreatment.startDate) {
      alert('Please fill in treatment type and start date');
      return;
    }

    const treatment: TreatmentHistory = {
      id: `treatment-${Date.now()}`,
      treatmentType: newTreatment.treatmentType as any,
      regimen: newTreatment.regimen || '',
      drugs: newTreatment.drugs || [],
      startDate: newTreatment.startDate!,
      endDate: newTreatment.endDate,
      cycles: newTreatment.cycles,
      response: newTreatment.response,
      toxicities: newTreatment.toxicities || [],
      notes: newTreatment.notes
    };

    const updatedTreatments = [...(currentPatient.treatmentHistory || []), treatment];
    actions.updatePatientData({ treatmentHistory: updatedTreatments });

    // Reset form
    setNewTreatment({
      treatmentType: 'chemotherapy',
      regimen: '',
      drugs: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      cycles: 1,
      response: 'stable',
      toxicities: [],
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleEditTreatment = (treatment: TreatmentHistory) => {
    setEditingTreatment(treatment);
    setNewTreatment(treatment);
    setShowAddForm(true);
  };

  const handleUpdateTreatment = () => {
    if (!editingTreatment || !newTreatment.treatmentType || !newTreatment.startDate) {
      alert('Please fill in treatment type and start date');
      return;
    }

    const updatedTreatments = currentPatient.treatmentHistory.map(t => 
      t.id === editingTreatment.id 
        ? { ...newTreatment, id: editingTreatment.id } as TreatmentHistory
        : t
    );
    
    actions.updatePatientData({ treatmentHistory: updatedTreatments });

    // Reset form
    setNewTreatment({
      treatmentType: 'chemotherapy',
      regimen: '',
      drugs: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      cycles: 1,
      response: 'stable',
      toxicities: [],
      notes: ''
    });
    setEditingTreatment(null);
    setShowAddForm(false);
  };

  const handleRemoveTreatment = (treatmentId: string) => {
    if (confirm('Are you sure you want to remove this treatment?')) {
      const updatedTreatments = currentPatient.treatmentHistory.filter(t => t.id !== treatmentId);
      actions.updatePatientData({ treatmentHistory: updatedTreatments });
    }
  };

  const getResponseColor = (response?: string) => {
    switch (response) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'stable': return 'bg-yellow-100 text-yellow-800';
      case 'progression': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResponseIcon = (response?: string) => {
    switch (response) {
      case 'complete': return <CheckCircle className="w-4 h-4" />;
      case 'partial': return <TrendingUp className="w-4 h-4" />;
      case 'stable': return <Minus className="w-4 h-4" />;
      case 'progression': return <TrendingDown className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTreatmentIcon = (type: string) => {
    switch (type) {
      case 'chemotherapy': return <Zap className="w-5 h-5" />;
      case 'radiation': return <Target className="w-5 h-5" />;
      case 'surgery': return <Scissors className="w-5 h-5" />;
      case 'immunotherapy': return <Activity className="w-5 h-5" />;
      case 'targeted': return <Target className="w-5 h-5" />;
      default: return <History className="w-5 h-5" />;
    }
  };

  const getToxicityColor = (grade: number) => {
    switch (grade) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-orange-100 text-orange-800';
      case 4: return 'bg-red-100 text-red-800';
      case 5: return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addToxicity = () => {
    if (newToxicity.description && newToxicity.action) {
      setNewTreatment({
        ...newTreatment,
        toxicities: [...(newTreatment.toxicities || []), { ...newToxicity, grade: newToxicity.grade as any }]
      });
      setNewToxicity({ grade: 1, description: '', action: '' });
    }
  };

  const treatments = getTreatments();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <History className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Treatment History</h2>
              <p className="text-sm text-gray-600">
                {currentPatient.demographics.firstName} {currentPatient.demographics.lastName} - Complete treatment timeline and outcomes
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Treatment</span>
          </button>
        </div>
      </Card>

      {/* Treatment Summary */}
      {treatmentTimeline.length > 0 && (
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Treatment Summary</h3>
            <Tooltip content="Overview of all treatments and their outcomes">
              <Info className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm text-blue-600 font-medium">Total Treatments</div>
              <div className="text-2xl font-bold text-blue-900">{treatmentTimeline.length}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm text-green-600 font-medium">Complete/Partial Response</div>
              <div className="text-2xl font-bold text-green-900">
                {treatmentTimeline.filter(t => t.response === 'complete' || t.response === 'partial').length}
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-sm text-yellow-600 font-medium">Active Treatments</div>
              <div className="text-2xl font-bold text-yellow-900">
                {treatmentTimeline.filter(t => !t.endDate).length}
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-sm text-red-600 font-medium">Grade 3+ Toxicities</div>
              <div className="text-2xl font-bold text-red-900">
                {treatmentTimeline.reduce((sum, t) => sum + (t.toxicities?.filter(tox => tox.grade >= 3).length || 0), 0)}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Treatments</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Types</option>
                <option value="chemotherapy">Chemotherapy</option>
                <option value="radiation">Radiation</option>
                <option value="surgery">Surgery</option>
                <option value="immunotherapy">Immunotherapy</option>
                <option value="targeted">Targeted</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search treatments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {treatments.length} treatment{treatments.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </Card>

      {/* Treatment Timeline */}
      <div className="space-y-4">
        {treatments.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No Treatments Found</h3>
              <p className="text-gray-400">
                {searchQuery || filter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add the first treatment to start building the treatment history'
                }
              </p>
            </div>
          </Card>
        ) : (
          treatments.map((treatment, index) => (
            <Card key={treatment.id} className="relative">
              {/* Timeline line for visual chronology */}
              {index < treatments.length - 1 && (
                <div className="absolute left-8 top-16 w-0.5 h-full bg-gray-200 -z-10"></div>
              )}
              
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  treatment.endDate ? 'bg-gray-100 text-gray-600' : 'bg-primary-100 text-primary-600'
                }`}>
                  {getTreatmentIcon(treatment.treatmentType)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">
                          {treatment.treatmentType} {treatment.regimen && `- ${treatment.regimen}`}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {!treatment.endDate && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Active
                            </span>
                          )}
                          {treatment.response && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getResponseColor(treatment.response)}`}>
                              {getResponseIcon(treatment.response)}
                              <span className="ml-1 capitalize">{treatment.response} response</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <span className="font-medium text-gray-700">Start Date:</span>
                          <p className="text-gray-900">{new Date(treatment.startDate).toLocaleDateString()}</p>
                        </div>
                        {treatment.endDate && (
                          <div>
                            <span className="font-medium text-gray-700">End Date:</span>
                            <p className="text-gray-900">{new Date(treatment.endDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        {treatment.cycles && (
                          <div>
                            <span className="font-medium text-gray-700">Cycles:</span>
                            <p className="text-gray-900">{treatment.cycles}</p>
                          </div>
                        )}
                      </div>

                      {treatment.drugs && treatment.drugs.length > 0 && (
                        <div className="mb-3">
                          <span className="font-medium text-gray-700 text-sm">Drugs:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {treatment.drugs.map((drug, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-800">
                                {drug}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {treatment.toxicities && treatment.toxicities.length > 0 && (
                        <div className="mb-3">
                          <span className="font-medium text-gray-700 text-sm">Toxicities:</span>
                          <div className="space-y-1 mt-1">
                            {treatment.toxicities.map((toxicity, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getToxicityColor(toxicity.grade)}`}>
                                  Grade {toxicity.grade}
                                </span>
                                <span className="text-sm text-gray-900">{toxicity.description}</span>
                                <span className="text-xs text-gray-600">({toxicity.action})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {treatment.notes && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Notes:</span>
                          <p className="text-gray-900 mt-1">{treatment.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Tooltip content="Edit treatment">
                        <button
                          onClick={() => handleEditTreatment(treatment)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Remove treatment">
                        <button
                          onClick={() => handleRemoveTreatment(treatment.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Treatment Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTreatment ? 'Edit Treatment' : 'Add Treatment'}
              </h3>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Treatment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newTreatment.treatmentType || 'chemotherapy'}
                    onChange={(e) => setNewTreatment({ ...newTreatment, treatmentType: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="chemotherapy">Chemotherapy</option>
                    <option value="radiation">Radiation</option>
                    <option value="surgery">Surgery</option>
                    <option value="immunotherapy">Immunotherapy</option>
                    <option value="targeted">Targeted Therapy</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Regimen/Protocol</label>
                  <input
                    type="text"
                    value={newTreatment.regimen || ''}
                    onChange={(e) => setNewTreatment({ ...newTreatment, regimen: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., FOLFOX, AC-T"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drugs (comma-separated)</label>
                <input
                  type="text"
                  value={newTreatment.drugs?.join(', ') || ''}
                  onChange={(e) => setNewTreatment({ ...newTreatment, drugs: e.target.value.split(',').map(d => d.trim()).filter(d => d) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Doxorubicin, Cyclophosphamide"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newTreatment.startDate || ''}
                    onChange={(e) => setNewTreatment({ ...newTreatment, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newTreatment.endDate || ''}
                    onChange={(e) => setNewTreatment({ ...newTreatment, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cycles</label>
                  <input
                    type="number"
                    value={newTreatment.cycles || ''}
                    onChange={(e) => setNewTreatment({ ...newTreatment, cycles: e.target.value ? parseInt(e.target.value) : undefined })}
                    min="1"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Response</label>
                <select
                  value={newTreatment.response || 'stable'}
                  onChange={(e) => setNewTreatment({ ...newTreatment, response: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="complete">Complete Response</option>
                  <option value="partial">Partial Response</option>
                  <option value="stable">Stable Disease</option>
                  <option value="progression">Disease Progression</option>
                </select>
              </div>

              {/* Toxicities Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Toxicities</label>
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-2">
                      <select
                        value={newToxicity.grade}
                        onChange={(e) => setNewToxicity({ ...newToxicity, grade: parseInt(e.target.value) })}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value={1}>Grade 1</option>
                        <option value={2}>Grade 2</option>
                        <option value={3}>Grade 3</option>
                        <option value={4}>Grade 4</option>
                        <option value={5}>Grade 5</option>
                      </select>
                    </div>
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Toxicity description"
                        value={newToxicity.description}
                        onChange={(e) => setNewToxicity({ ...newToxicity, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        placeholder="Action taken"
                        value={newToxicity.action}
                        onChange={(e) => setNewToxicity({ ...newToxicity, action: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div className="col-span-1">
                      <button
                        type="button"
                        onClick={addToxicity}
                        className="w-full h-8 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {newTreatment.toxicities && newTreatment.toxicities.length > 0 && (
                    <div className="space-y-1">
                      {newTreatment.toxicities.map((toxicity, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getToxicityColor(toxicity.grade)}`}>
                              Grade {toxicity.grade}
                            </span>
                            <span className="text-sm">{toxicity.description}</span>
                            <span className="text-xs text-gray-600">({toxicity.action})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewTreatment({
                              ...newTreatment,
                              toxicities: newTreatment.toxicities?.filter((_, i) => i !== index)
                            })}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newTreatment.notes || ''}
                  onChange={(e) => setNewTreatment({ ...newTreatment, notes: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Additional treatment notes..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingTreatment(null);
                  setNewTreatment({
                    treatmentType: 'chemotherapy',
                    regimen: '',
                    drugs: [],
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: '',
                    cycles: 1,
                    response: 'stable',
                    toxicities: [],
                    notes: ''
                  });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={editingTreatment ? handleUpdateTreatment : handleAddTreatment}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {editingTreatment ? 'Update Treatment' : 'Add Treatment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentTimeline;