import React, { useState } from 'react';
import { usePatient } from '../../context/PatientContext';
import { PatientGenetics } from '../../types';
import Card from '../UI/Card';
import Tooltip from '../UI/Tooltip';
import Alert from '../UI/Alert';
import { 
  Dna, 
  Plus, 
  Edit, 
  Trash2, 
  TestTube,
  AlertTriangle,
  CheckCircle,
  Clock,
  Info,
  FileText,
  Search,
  Filter
} from 'lucide-react';

interface GenomicsManagerProps {
  patientId?: string;
}

const GenomicsManager: React.FC<GenomicsManagerProps> = ({ patientId }) => {
  const { state, actions } = usePatient();
  const { currentPatient } = state;
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGenetic, setEditingGenetic] = useState<PatientGenetics | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pharmacogenomic' | 'oncologic'>('all');

  const [newGenetic, setNewGenetic] = useState<Partial<PatientGenetics>>({
    geneSymbol: '',
    alleles: ['', ''],
    phenotype: '',
    metabolizerStatus: 'normal',
    testDate: new Date().toISOString().split('T')[0],
    testMethod: '',
    clinicalSignificance: '',
    notes: ''
  });

  if (!currentPatient) {
    return (
      <Card>
        <div className="text-center py-8">
          <Dna className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">No Patient Selected</h3>
          <p className="text-gray-400">Select a patient to manage their genomic data</p>
        </div>
      </Card>
    );
  };

  const getGeneticData = () => {
    let genetics = currentPatient.genetics || [];
    
    // Filter by type (this is a simple categorization based on common pharmacogenes)
    const pharmacogenes = ['CYP2D6', 'CYP2C19', 'CYP2C9', 'CYP3A4', 'TPMT', 'UGT1A1', 'DPYD', 'NUDT15'];
    
    if (filter === 'pharmacogenomic') {
      genetics = genetics.filter(g => pharmacogenes.includes(g.geneSymbol.toUpperCase()));
    } else if (filter === 'oncologic') {
      genetics = genetics.filter(g => !pharmacogenes.includes(g.geneSymbol.toUpperCase()));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      genetics = genetics.filter(g => 
        g.geneSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.phenotype.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.clinicalSignificance?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return genetics;
  };

  const handleAddGenetic = () => {
    if (!newGenetic.geneSymbol || !newGenetic.phenotype) {
      alert('Please fill in gene symbol and phenotype');
      return;
    }

    const genetic: PatientGenetics = {
      geneSymbol: newGenetic.geneSymbol!,
      alleles: newGenetic.alleles!.filter(a => a.trim() !== ''),
      phenotype: newGenetic.phenotype!,
      metabolizerStatus: newGenetic.metabolizerStatus,
      testDate: newGenetic.testDate || new Date().toISOString().split('T')[0],
      testMethod: newGenetic.testMethod,
      clinicalSignificance: newGenetic.clinicalSignificance,
      notes: newGenetic.notes
    };

    const updatedGenetics = [...(currentPatient.genetics || []), genetic];
    actions.updatePatientData({ genetics: updatedGenetics });

    // Reset form
    setNewGenetic({
      geneSymbol: '',
      alleles: ['', ''],
      phenotype: '',
      metabolizerStatus: 'normal',
      testDate: new Date().toISOString().split('T')[0],
      testMethod: '',
      clinicalSignificance: '',
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleEditGenetic = (genetic: PatientGenetics) => {
    setEditingGenetic(genetic);
    setNewGenetic({
      ...genetic,
      alleles: genetic.alleles.length < 2 ? [...genetic.alleles, '', ''] : genetic.alleles
    });
    setShowAddForm(true);
  };

  const handleUpdateGenetic = () => {
    if (!editingGenetic || !newGenetic.geneSymbol || !newGenetic.phenotype) {
      alert('Please fill in gene symbol and phenotype');
      return;
    }

    const updatedGenetics = currentPatient.genetics.map(g => 
      g.geneSymbol === editingGenetic.geneSymbol && g.testDate === editingGenetic.testDate
        ? { 
            ...newGenetic,
            geneSymbol: newGenetic.geneSymbol!,
            alleles: newGenetic.alleles!.filter(a => a.trim() !== ''),
            phenotype: newGenetic.phenotype!
          } as PatientGenetics
        : g
    );
    
    actions.updatePatientData({ genetics: updatedGenetics });

    // Reset form
    setNewGenetic({
      geneSymbol: '',
      alleles: ['', ''],
      phenotype: '',
      metabolizerStatus: 'normal',
      testDate: new Date().toISOString().split('T')[0],
      testMethod: '',
      clinicalSignificance: '',
      notes: ''
    });
    setEditingGenetic(null);
    setShowAddForm(false);
  };

  const handleRemoveGenetic = (genetic: PatientGenetics) => {
    if (confirm('Are you sure you want to remove this genetic data?')) {
      const updatedGenetics = currentPatient.genetics.filter(g => 
        !(g.geneSymbol === genetic.geneSymbol && g.testDate === genetic.testDate)
      );
      actions.updatePatientData({ genetics: updatedGenetics });
    }
  };

  const getMetabolizerColor = (status?: string) => {
    switch (status) {
      case 'poor': return 'bg-red-100 text-red-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'normal': return 'bg-green-100 text-green-800';
      case 'rapid': return 'bg-blue-100 text-blue-800';
      case 'ultra-rapid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSignificanceColor = (significance?: string) => {
    if (!significance) return 'bg-gray-100 text-gray-800';
    const lower = significance.toLowerCase();
    if (lower.includes('high') || lower.includes('pathogenic')) return 'bg-red-100 text-red-800';
    if (lower.includes('moderate') || lower.includes('likely')) return 'bg-yellow-100 text-yellow-800';
    if (lower.includes('low') || lower.includes('benign')) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getCommonPharmacoGenes = () => [
    { gene: 'CYP2D6', description: 'Metabolizes many antidepressants, antipsychotics, and opioids' },
    { gene: 'CYP2C19', description: 'Metabolizes proton pump inhibitors, clopidogrel, and some antidepressants' },
    { gene: 'CYP2C9', description: 'Metabolizes warfarin, phenytoin, and NSAIDs' },
    { gene: 'CYP3A4', description: 'Metabolizes many medications including some chemotherapy drugs' },
    { gene: 'TPMT', description: 'Metabolizes thiopurine drugs (azathioprine, mercaptopurine)' },
    { gene: 'UGT1A1', description: 'Metabolizes irinotecan and affects bilirubin levels' },
    { gene: 'DPYD', description: 'Metabolizes fluoropyrimidines (5-FU, capecitabine)' },
    { gene: 'NUDT15', description: 'Affects thiopurine metabolism, important in Asian populations' }
  ];

  const genetics = getGeneticData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Dna className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Genomic Profile</h2>
              <p className="text-sm text-gray-600">
                {currentPatient.demographics.firstName} {currentPatient.demographics.lastName} - Genetic testing results and pharmacogenomics
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Genetic Data</span>
          </button>
        </div>
      </Card>

      {/* Pharmacogenomic Alerts */}
      {genetics.some(g => g.metabolizerStatus === 'poor' || g.metabolizerStatus === 'ultra-rapid') && (
        <Alert type="warning" title="Pharmacogenomic Considerations">
          <p className="text-sm">
            This patient has genetic variants that may affect drug metabolism. 
            Review medication dosing and selection based on pharmacogenomic guidance.
          </p>
        </Alert>
      )}

      {/* Filters and Search */}
      <Card>
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'pharmacogenomic' | 'oncologic')}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Genetic Data</option>
                <option value="pharmacogenomic">Pharmacogenomic</option>
                <option value="oncologic">Oncologic</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search genes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {genetics.length} result{genetics.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </Card>

      {/* Common Pharmacogenes Reference */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <Info className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Common Pharmacogenes</h3>
          <Tooltip content="These genes are commonly tested for drug metabolism and dosing guidance">
            <Info className="w-4 h-4 text-gray-400" />
          </Tooltip>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {getCommonPharmacoGenes().map(({ gene, description }) => {
            const hasData = genetics.some(g => g.geneSymbol.toUpperCase() === gene);
            return (
              <div key={gene} className={`p-3 rounded-lg border ${hasData ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{gene}</span>
                  {hasData && <CheckCircle className="w-4 h-4 text-green-600" />}
                </div>
                <p className="text-xs text-gray-600">{description}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Genetic Data List */}
      <div className="space-y-4">
        {genetics.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Dna className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No Genetic Data Found</h3>
              <p className="text-gray-400">
                {searchQuery || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add genetic testing results to enable pharmacogenomic guidance'
                }
              </p>
            </div>
          </Card>
        ) : (
          genetics.map((genetic, index) => (
            <Card key={`${genetic.geneSymbol}-${genetic.testDate}-${index}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{genetic.geneSymbol}</h3>
                    <div className="flex items-center space-x-2">
                      {genetic.metabolizerStatus && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMetabolizerColor(genetic.metabolizerStatus)}`}>
                          {genetic.metabolizerStatus} metabolizer
                        </span>
                      )}
                      {genetic.clinicalSignificance && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSignificanceColor(genetic.clinicalSignificance)}`}>
                          {genetic.clinicalSignificance}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Alleles:</span>
                      <p className="text-gray-900">{genetic.alleles.join(' / ') || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Phenotype:</span>
                      <p className="text-gray-900">{genetic.phenotype}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Test Date:</span>
                      <p className="text-gray-900">{new Date(genetic.testDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {genetic.testMethod && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium text-gray-700">Test Method:</span>
                      <p className="text-gray-900">{genetic.testMethod}</p>
                    </div>
                  )}

                  {genetic.geneFunction && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium text-gray-700">Gene Function:</span>
                      <p className="text-gray-900">{genetic.geneFunction}</p>
                    </div>
                  )}

                  {genetic.notes && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium text-gray-700">Notes:</span>
                      <p className="text-gray-900">{genetic.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Tooltip content="Edit genetic data">
                    <button
                      onClick={() => handleEditGenetic(genetic)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Remove genetic data">
                    <button
                      onClick={() => handleRemoveGenetic(genetic)}
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

      {/* Add/Edit Genetic Data Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingGenetic ? 'Edit Genetic Data' : 'Add Genetic Data'}
              </h3>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gene Symbol <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newGenetic.geneSymbol || ''}
                    onChange={(e) => setNewGenetic({ ...newGenetic, geneSymbol: e.target.value.toUpperCase() })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., CYP2D6"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phenotype <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newGenetic.phenotype || ''}
                    onChange={(e) => setNewGenetic({ ...newGenetic, phenotype: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Intermediate Metabolizer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allele 1
                  </label>
                  <input
                    type="text"
                    value={(newGenetic.alleles && newGenetic.alleles[0]) || ''}
                    onChange={(e) => {
                      const newAlleles = [...(newGenetic.alleles || ['', ''])];
                      newAlleles[0] = e.target.value;
                      setNewGenetic({ ...newGenetic, alleles: newAlleles });
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., *1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allele 2
                  </label>
                  <input
                    type="text"
                    value={(newGenetic.alleles && newGenetic.alleles[1]) || ''}
                    onChange={(e) => {
                      const newAlleles = [...(newGenetic.alleles || ['', ''])];
                      newAlleles[1] = e.target.value;
                      setNewGenetic({ ...newGenetic, alleles: newAlleles });
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., *4"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Metabolizer Status
                  </label>
                  <select
                    value={newGenetic.metabolizerStatus || 'normal'}
                    onChange={(e) => setNewGenetic({ ...newGenetic, metabolizerStatus: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="poor">Poor Metabolizer</option>
                    <option value="intermediate">Intermediate Metabolizer</option>
                    <option value="normal">Normal Metabolizer</option>
                    <option value="rapid">Rapid Metabolizer</option>
                    <option value="ultra-rapid">Ultra-Rapid Metabolizer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Date
                  </label>
                  <input
                    type="date"
                    value={newGenetic.testDate || ''}
                    onChange={(e) => setNewGenetic({ ...newGenetic, testDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Method
                </label>
                <input
                  type="text"
                  value={newGenetic.testMethod || ''}
                  onChange={(e) => setNewGenetic({ ...newGenetic, testMethod: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., PCR-RFLP, Sequencing, Array"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clinical Significance
                </label>
                <input
                  type="text"
                  value={newGenetic.clinicalSignificance || ''}
                  onChange={(e) => setNewGenetic({ ...newGenetic, clinicalSignificance: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Reduced enzyme activity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newGenetic.notes || ''}
                  onChange={(e) => setNewGenetic({ ...newGenetic, notes: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Additional clinical notes..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingGenetic(null);
                  setNewGenetic({
                    geneSymbol: '',
                    alleles: ['', ''],
                    phenotype: '',
                    metabolizerStatus: 'normal',
                    testDate: new Date().toISOString().split('T')[0],
                    testMethod: '',
                    clinicalSignificance: '',
                    notes: ''
                  });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={editingGenetic ? handleUpdateGenetic : handleAddGenetic}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {editingGenetic ? 'Update Genetic Data' : 'Add Genetic Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenomicsManager;