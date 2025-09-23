import React, { useState, useMemo } from 'react';
import { usePatient } from '../../context/PatientContext';
import Card from '../UI/Card';
import Tooltip from '../UI/Tooltip';
import Alert from '../UI/Alert';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Calendar,
  Activity,
  Heart,
  Target,
  Clock,
  Plus,
  Edit,
  Trash2,
  Info,
  CheckCircle,
  AlertTriangle,
  Minus
} from 'lucide-react';

interface OutcomeData {
  id: string;
  type: 'survival' | 'response' | 'quality_of_life' | 'biomarker' | 'functional_status';
  measurement: string;
  value: number | string;
  unit?: string;
  date: string;
  notes?: string;
  treatmentRelated?: string; // Related treatment ID
}

interface OutcomeTrackerProps {
  patientId?: string;
}

const OutcomeTracker: React.FC<OutcomeTrackerProps> = ({ patientId }) => {
  const { state, actions } = usePatient();
  const { currentPatient } = state;
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOutcome, setEditingOutcome] = useState<OutcomeData | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');

  // Store outcomes in patient notes for now (in a real app, this would be a separate field)
  const getOutcomes = (): OutcomeData[] => {
    if (!currentPatient) return [];
    
    // Look for outcome data in notes
    const outcomeNotes = currentPatient.notes?.filter(note => note.type === 'clinical' && note.content.startsWith('OUTCOME_DATA:'));
    if (!outcomeNotes) return [];

    return outcomeNotes.map(note => {
      try {
        const data = JSON.parse(note.content.replace('OUTCOME_DATA:', ''));
        return { ...data, id: note.id };
      } catch {
        return null;
      }
    }).filter(Boolean) as OutcomeData[];
  };

  const [newOutcome, setNewOutcome] = useState<Partial<OutcomeData>>({
    type: 'response',
    measurement: '',
    value: '',
    unit: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    treatmentRelated: ''
  });

  if (!currentPatient) {
    return (
      <Card>
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">No Patient Selected</h3>
          <p className="text-gray-400">Select a patient to track their outcomes</p>
        </div>
      </Card>
    );
  }

  const outcomes = getOutcomes();
  const filteredOutcomes = selectedType === 'all' 
    ? outcomes 
    : outcomes.filter(o => o.type === selectedType);

  const handleAddOutcome = () => {
    if (!newOutcome.measurement || !newOutcome.value || !newOutcome.date) {
      alert('Please fill in measurement, value, and date');
      return;
    }

    const outcome: OutcomeData = {
      id: `outcome-${Date.now()}`,
      type: newOutcome.type as any,
      measurement: newOutcome.measurement!,
      value: newOutcome.value!,
      unit: newOutcome.unit,
      date: newOutcome.date!,
      notes: newOutcome.notes,
      treatmentRelated: newOutcome.treatmentRelated
    };

    // Store as a clinical note with special prefix
    const noteContent = `OUTCOME_DATA:${JSON.stringify(outcome)}`;
    const updatedNotes = [
      ...(currentPatient.notes || []),
      {
        id: outcome.id,
        timestamp: new Date().toISOString(),
        author: 'current-user', // TODO: Get from auth context
        type: 'clinical' as const,
        content: noteContent
      }
    ];

    actions.updatePatientData({ notes: updatedNotes });

    // Reset form
    setNewOutcome({
      type: 'response',
      measurement: '',
      value: '',
      unit: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      treatmentRelated: ''
    });
    setShowAddForm(false);
  };

  const handleEditOutcome = (outcome: OutcomeData) => {
    setEditingOutcome(outcome);
    setNewOutcome(outcome);
    setShowAddForm(true);
  };

  const handleUpdateOutcome = () => {
    if (!editingOutcome || !newOutcome.measurement || !newOutcome.value || !newOutcome.date) {
      alert('Please fill in measurement, value, and date');
      return;
    }

    const updatedOutcome = { ...newOutcome, id: editingOutcome.id } as OutcomeData;
    const noteContent = `OUTCOME_DATA:${JSON.stringify(updatedOutcome)}`;
    
    const updatedNotes = currentPatient.notes?.map(note => 
      note.id === editingOutcome.id 
        ? { ...note, content: noteContent }
        : note
    ) || [];
    
    actions.updatePatientData({ notes: updatedNotes });

    // Reset form
    setNewOutcome({
      type: 'response',
      measurement: '',
      value: '',
      unit: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      treatmentRelated: ''
    });
    setEditingOutcome(null);
    setShowAddForm(false);
  };

  const handleRemoveOutcome = (outcomeId: string) => {
    if (confirm('Are you sure you want to remove this outcome data?')) {
      const updatedNotes = currentPatient.notes?.filter(note => note.id !== outcomeId) || [];
      actions.updatePatientData({ notes: updatedNotes });
    }
  };

  const getOutcomeTypeIcon = (type: string) => {
    switch (type) {
      case 'survival': return <Heart className="w-4 h-4" />;
      case 'response': return <Target className="w-4 h-4" />;
      case 'quality_of_life': return <Activity className="w-4 h-4" />;
      case 'biomarker': return <BarChart3 className="w-4 h-4" />;
      case 'functional_status': return <TrendingUp className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getOutcomeTypeColor = (type: string) => {
    switch (type) {
      case 'survival': return 'bg-red-100 text-red-800';
      case 'response': return 'bg-green-100 text-green-800';
      case 'quality_of_life': return 'bg-blue-100 text-blue-800';
      case 'biomarker': return 'bg-purple-100 text-purple-800';
      case 'functional_status': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResponseTrend = (value: number | string, measurement: string) => {
    // Simple trend analysis based on common measurements
    const numValue = typeof value === 'number' ? value : parseFloat(value.toString());
    if (isNaN(numValue)) return null;

    const lowerMeasurement = measurement.toLowerCase();
    
    // For tumor measurements, lower is better
    if (lowerMeasurement.includes('tumor') || lowerMeasurement.includes('lesion') || lowerMeasurement.includes('mass')) {
      if (numValue < 20) return 'improving';
      if (numValue > 50) return 'worsening';
      return 'stable';
    }
    
    // For quality of life scores, higher is usually better
    if (lowerMeasurement.includes('quality') || lowerMeasurement.includes('karnofsky') || lowerMeasurement.includes('ecog')) {
      if (numValue > 80) return 'improving';
      if (numValue < 40) return 'worsening';
      return 'stable';
    }
    
    return null;
  };

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'worsening': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable': return <Minus className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  // Summary statistics
  const summaryStats = useMemo(() => {
    const responseOutcomes = outcomes.filter(o => o.type === 'response');
    const latestResponse = responseOutcomes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    const survivalOutcomes = outcomes.filter(o => o.type === 'survival');
    const qolOutcomes = outcomes.filter(o => o.type === 'quality_of_life');
    const biomarkerOutcomes = outcomes.filter(o => o.type === 'biomarker');
    
    return {
      totalOutcomes: outcomes.length,
      latestResponse: latestResponse?.value || 'Not assessed',
      survivalData: survivalOutcomes.length > 0,
      qolTracked: qolOutcomes.length > 0,
      biomarkersTracked: biomarkerOutcomes.length > 0
    };
  }, [outcomes]);

  const measurementSuggestions = {
    survival: ['Overall Survival (months)', 'Disease-Free Survival (months)', 'Progression-Free Survival (months)'],
    response: ['RECIST Response', 'Tumor Size (cm)', 'Target Lesion Sum (cm)', 'Response Rate (%)'],
    quality_of_life: ['EORTC QLQ-C30 Score', 'Karnofsky Performance Score', 'ECOG Performance Status', 'Pain Score (0-10)'],
    biomarker: ['PSA (ng/mL)', 'CA 19-9 (U/mL)', 'CEA (ng/mL)', 'CA-125 (U/mL)', 'AFP (ng/mL)'],
    functional_status: ['Activities of Daily Living', 'Mobility Score', 'Cognitive Function', 'Social Function']
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Outcome Tracking</h2>
              <p className="text-sm text-gray-600">
                {currentPatient.demographics.firstName} {currentPatient.demographics.lastName} - Treatment outcomes and response monitoring
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Outcome</span>
          </button>
        </div>
      </Card>

      {/* Summary Dashboard */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Outcome Summary</h3>
          <Tooltip content="Overview of tracked outcomes and current status">
            <Info className="w-4 h-4 text-gray-400" />
          </Tooltip>
        </div>
        <div className="grid md:grid-cols-5 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-sm text-blue-600 font-medium">Total Outcomes</div>
            <div className="text-2xl font-bold text-blue-900">{summaryStats.totalOutcomes}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-sm text-green-600 font-medium">Latest Response</div>
            <div className="text-lg font-bold text-green-900 truncate">{summaryStats.latestResponse}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-sm text-red-600 font-medium">Survival Data</div>
            <div className="text-2xl font-bold text-red-900">{summaryStats.survivalData ? '✓' : '○'}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-sm text-purple-600 font-medium">QoL Tracked</div>
            <div className="text-2xl font-bold text-purple-900">{summaryStats.qolTracked ? '✓' : '○'}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="text-sm text-orange-600 font-medium">Biomarkers</div>
            <div className="text-2xl font-bold text-orange-900">{summaryStats.biomarkersTracked ? '✓' : '○'}</div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Outcome Types</option>
              <option value="survival">Survival Outcomes</option>
              <option value="response">Response Assessment</option>
              <option value="quality_of_life">Quality of Life</option>
              <option value="biomarker">Biomarkers</option>
              <option value="functional_status">Functional Status</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            {filteredOutcomes.length} outcome{filteredOutcomes.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </Card>

      {/* Outcomes List */}
      <div className="space-y-4">
        {filteredOutcomes.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No Outcomes Found</h3>
              <p className="text-gray-400">
                {selectedType !== 'all' 
                  ? `No ${selectedType.replace('_', ' ')} outcomes recorded yet`
                  : 'Start tracking treatment outcomes and patient responses'
                }
              </p>
            </div>
          </Card>
        ) : (
          filteredOutcomes
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((outcome) => {
              const trend = getResponseTrend(outcome.value, outcome.measurement);
              return (
                <Card key={outcome.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOutcomeTypeColor(outcome.type)}`}>
                          {getOutcomeTypeIcon(outcome.type)}
                          <span className="ml-1 capitalize">{outcome.type.replace('_', ' ')}</span>
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">{outcome.measurement}</h3>
                        {getTrendIcon(trend)}
                      </div>

                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Value:</span>
                          <p className="text-gray-900 font-semibold">
                            {outcome.value} {outcome.unit && outcome.unit}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Date:</span>
                          <p className="text-gray-900">{new Date(outcome.date).toLocaleDateString()}</p>
                        </div>
                        {outcome.treatmentRelated && (
                          <div>
                            <span className="font-medium text-gray-700">Related Treatment:</span>
                            <p className="text-gray-900">{outcome.treatmentRelated}</p>
                          </div>
                        )}
                        {trend && (
                          <div>
                            <span className="font-medium text-gray-700">Trend:</span>
                            <p className={`font-medium capitalize ${
                              trend === 'improving' ? 'text-green-600' :
                              trend === 'worsening' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {trend}
                            </p>
                          </div>
                        )}
                      </div>

                      {outcome.notes && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium text-gray-700">Notes:</span>
                          <p className="text-gray-900">{outcome.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Tooltip content="Edit outcome">
                        <button
                          onClick={() => handleEditOutcome(outcome)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Remove outcome">
                        <button
                          onClick={() => handleRemoveOutcome(outcome.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </Card>
              );
            })
        )}
      </div>

      {/* Add/Edit Outcome Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingOutcome ? 'Edit Outcome' : 'Add Outcome'}
              </h3>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outcome Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={newOutcome.type || 'response'}
                  onChange={(e) => setNewOutcome({ ...newOutcome, type: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="response">Response Assessment</option>
                  <option value="survival">Survival Outcome</option>
                  <option value="quality_of_life">Quality of Life</option>
                  <option value="biomarker">Biomarker</option>
                  <option value="functional_status">Functional Status</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Measurement <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newOutcome.measurement || ''}
                  onChange={(e) => setNewOutcome({ ...newOutcome, measurement: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Tumor Size, ECOG Score"
                  list="measurement-suggestions"
                />
                <datalist id="measurement-suggestions">
                  {newOutcome.type && measurementSuggestions[newOutcome.type as keyof typeof measurementSuggestions]?.map((suggestion, idx) => (
                    <option key={idx} value={suggestion} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newOutcome.value || ''}
                    onChange={(e) => setNewOutcome({ ...newOutcome, value: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., 5.2, Complete Response"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newOutcome.unit || ''}
                    onChange={(e) => setNewOutcome({ ...newOutcome, unit: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., cm, %, ng/mL"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newOutcome.date || ''}
                  onChange={(e) => setNewOutcome({ ...newOutcome, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related Treatment</label>
                <select
                  value={newOutcome.treatmentRelated || ''}
                  onChange={(e) => setNewOutcome({ ...newOutcome, treatmentRelated: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select treatment (optional)</option>
                  {currentPatient.treatmentHistory?.map((treatment) => (
                    <option key={treatment.id} value={treatment.regimen || treatment.treatmentType}>
                      {treatment.regimen || treatment.treatmentType} ({new Date(treatment.startDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newOutcome.notes || ''}
                  onChange={(e) => setNewOutcome({ ...newOutcome, notes: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Additional notes about this outcome..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingOutcome(null);
                  setNewOutcome({
                    type: 'response',
                    measurement: '',
                    value: '',
                    unit: '',
                    date: new Date().toISOString().split('T')[0],
                    notes: '',
                    treatmentRelated: ''
                  });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={editingOutcome ? handleUpdateOutcome : handleAddOutcome}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {editingOutcome ? 'Update Outcome' : 'Add Outcome'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutcomeTracker;