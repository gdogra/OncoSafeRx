import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';
import { FileText, ExternalLink, Search, Calendar, Users, TrendingUp } from 'lucide-react';

const Protocols: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);

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

  // Filter protocols and trials based on selected drug
  const filteredProtocols = selectedDrug 
    ? protocols.filter(protocol => 
        protocol.drugs.some(drug => 
          drug.toLowerCase().includes(selectedDrug.toLowerCase())
        )
      )
    : protocols;

  const filteredTrials = selectedDrug
    ? trials.filter(trial =>
        trial.drugs.some(drug =>
          drug.toLowerCase().includes(selectedDrug.toLowerCase())
        )
      )
    : trials;

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
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Search Protocols</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cancer Type</label>
              <select className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
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
              <select className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option value="">All Stages</option>
                <option value="early">Early Stage</option>
                <option value="advanced">Advanced</option>
                <option value="metastatic">Metastatic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option value="">All Sources</option>
                <option value="nccn">NCCN</option>
                <option value="asco">ASCO</option>
                <option value="esmo">ESMO</option>
              </select>
            </div>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700">
            <Search className="w-4 h-4" />
            <span>Search Protocols</span>
          </button>
        </div>
      </Card>

      {/* Treatment Protocols */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Oncology Treatment Protocols</h2>
        
        <div className="grid gap-6">
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
                  <button className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium">
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
                  <button className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium">
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
    </div>
  );
};

export default Protocols;