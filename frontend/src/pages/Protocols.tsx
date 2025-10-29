import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';
import ProtocolDetailModal from '../components/Protocols/ProtocolDetailModal';
import { FileText, ExternalLink, Search, Calendar, Users, TrendingUp } from 'lucide-react';
import Breadcrumbs from '../components/UI/Breadcrumbs';

const Protocols: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
  const [cancerTypeFilter, setCancerTypeFilter] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle URL drug parameter
  useEffect(() => {
    const drugParam = searchParams.get('drug');
    if (drugParam) {
      setSelectedDrug(drugParam);
    }
  }, [searchParams]);

  const protocols = [
    {
      name: 'FOLFOX',
      cancerType: 'Colorectal Cancer',
      stage: 'Advanced',
      drugs: ['Fluorouracil', 'Oxaliplatin', 'Leucovorin'],
      duration: '12 weeks',
      responseRate: '45%',
      source: 'NCCN',
      indication: 'First-line treatment for metastatic colorectal cancer'
    },
    {
      name: 'FOLFIRI',
      cancerType: 'Colorectal Cancer', 
      stage: 'Advanced',
      drugs: ['Fluorouracil', 'Irinotecan', 'Leucovorin'],
      duration: '12 weeks',
      responseRate: '35%',
      source: 'NCCN',
      indication: 'Second-line treatment for metastatic colorectal cancer'
    },
    {
      name: 'AC-T',
      cancerType: 'Breast Cancer',
      stage: 'Early Stage',
      drugs: ['Doxorubicin', 'Cyclophosphamide', 'Paclitaxel'],
      duration: '16 weeks',
      responseRate: '70%',
      source: 'NCCN',
      indication: 'Adjuvant therapy for early-stage breast cancer'
    }
  ];

  const trials = [
    {
      id: 'NCT04567811',
      title: 'Pembrolizumab Plus Chemotherapy in Advanced Gastric Cancer',
      phase: 'Phase 3',
      status: 'Recruiting',
      condition: 'Gastric Cancer',
      drugs: ['Pembrolizumab', 'FOLFOX'],
      participants: '1,200 patients'
    },
    {
      id: 'NCT04789668',
      title: 'Olaparib Maintenance in BRCA-mutated Pancreatic Cancer',
      phase: 'Phase 2',
      status: 'Active',
      condition: 'Pancreatic Cancer',
      drugs: ['Olaparib'],
      participants: '150 patients'
    },
    {
      id: 'NCT05123456',
      title: 'Personalized Dosing Based on Pharmacogenomics',
      phase: 'Phase 2',
      status: 'Recruiting',
      condition: 'Various Solid Tumors',
      drugs: ['Fluorouracil', 'Irinotecan'],
      participants: '300 patients'
    }
  ];

  // Filter protocols based on selected drug and filter criteria
  const filteredProtocols = protocols.filter(protocol => {
    // Drug filter
    if (selectedDrug && !protocol.drugs.some(drug => 
      drug.toLowerCase().includes(selectedDrug.toLowerCase())
    )) {
      return false;
    }
    
    // Cancer type filter
    if (cancerTypeFilter && !protocol.cancerType.toLowerCase().includes(cancerTypeFilter.toLowerCase())) {
      return false;
    }
    
    // Stage filter
    if (stageFilter && !protocol.stage.toLowerCase().includes(stageFilter.toLowerCase())) {
      return false;
    }
    
    // Source filter
    if (sourceFilter && !protocol.source.toLowerCase().includes(sourceFilter.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const filteredTrials = selectedDrug
    ? trials.filter(trial =>
        trial.drugs.some(drug =>
          drug.toLowerCase().includes(selectedDrug.toLowerCase())
        )
      )
    : trials;

  // Search protocols function
  const handleSearchProtocols = async () => {
    setSearchLoading(true);
    // Use current filters to update view immediately (no mock delay)
    setSearchLoading(false);
  };

  // View protocol details
  const handleViewProtocol = (protocol: any) => {
    setSelectedProtocol(protocol);
    setIsModalOpen(true);
  };

  // View trial on ClinicalTrials.gov
  const handleViewTrial = (trial: any) => {
    const url = `https://clinicaltrials.gov/ct2/show/${trial.id}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Reset all filters
  const handleResetFilters = () => {
    setCancerTypeFilter('');
    setStageFilter('');
    setSourceFilter('');
    setSelectedDrug(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <FileText className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Clinical Protocols & Trials</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Access evidence-based oncology treatment protocols and discover relevant clinical trials for precision medicine.
        </p>
      </div>

      {/* Selected Drug Alert */}
      {selectedDrug && (
        <Alert type="info" title={`Showing protocols and trials for: ${selectedDrug}`}>
          Protocols and trials have been filtered to show those containing or related to "{selectedDrug}".
        </Alert>
      )}

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4" data-tour="protocols-filters">
          <h2 className="text-xl font-semibold text-gray-900">Search Protocols</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cancer Type</label>
              <select 
                value={cancerTypeFilter}
                onChange={(e) => setCancerTypeFilter(e.target.value)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Cancer Types</option>
                <option value="breast">Breast Cancer</option>
                <option value="colorectal">Colorectal Cancer</option>
                <option value="lung">Lung Cancer</option>
                <option value="pancreatic">Pancreatic Cancer</option>
                <option value="gastric">Gastric Cancer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
              <select 
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Stages</option>
                <option value="early">Early Stage</option>
                <option value="advanced">Advanced</option>
                <option value="metastatic">Metastatic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select 
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Sources</option>
                <option value="nccn">NCCN</option>
                <option value="asco">ASCO</option>
                <option value="esmo">ESMO</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleSearchProtocols}
              disabled={searchLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-4 h-4" />
              <span>{searchLoading ? 'Searching...' : 'Search Protocols'}</span>
            </button>
            <button 
              onClick={handleResetFilters}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200"
            >
              <span>Reset Filters</span>
            </button>
            <div className="text-sm text-gray-600">
              Found <span className="font-semibold">{filteredProtocols.length}</span> protocols
            </div>
          </div>
        </div>
      </Card>

      {/* Treatment Protocols */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Oncology Treatment Protocols</h2>
        
        <div className="grid gap-6" data-tour="protocols-list">
          {filteredProtocols.map((protocol, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{protocol.name}</h3>
                    <p className="text-gray-600">{protocol.indication}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {protocol.source}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {protocol.stage}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Cancer Type</h4>
                    <p className="text-sm text-gray-600">{protocol.cancerType}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Duration</h4>
                    <p className="text-sm text-gray-600">{protocol.duration}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Response Rate</h4>
                    <p className="text-sm text-gray-600">{protocol.responseRate}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Drugs</h4>
                    <p className="text-sm text-gray-600">{protocol.drugs.length} medications</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Protocol Drugs</h4>
                  <div className="flex flex-wrap gap-2">
                    {protocol.drugs.map((drug, drugIndex) => (
                      <span
                        key={drugIndex}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {drug}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Last updated: 2 weeks ago</span>
                    <span>Evidence level: A</span>
                  </div>
                  <button 
                    onClick={() => handleViewProtocol(protocol)}
                    className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <span>View Full Protocol</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Clinical Trials */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Relevant Clinical Trials</h2>
        
        <div className="grid gap-6">
          {filteredTrials.map((trial, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{trial.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">ClinicalTrials.gov ID: {trial.id}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      trial.status === 'Recruiting' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {trial.status}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {trial.phase}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{trial.participants}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{trial.condition}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{trial.drugs.join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Updated: 1 week ago</span>
                    <span>Locations: Multiple sites</span>
                  </div>
                  <button 
                    onClick={() => handleViewTrial(trial)}
                    className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <span>View on ClinicalTrials.gov</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <Alert type="warning" title="Clinical Decision Support">
        These protocols and trials are provided for educational purposes. Always consult current guidelines, 
        institutional protocols, and discuss treatment options with qualified oncology specialists before making clinical decisions.
      </Alert>

      {/* Protocol Detail Modal */}
      <ProtocolDetailModal
        protocol={selectedProtocol}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProtocol(null);
        }}
      />
    </div>
  );
};

export default Protocols;
