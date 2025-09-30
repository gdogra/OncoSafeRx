import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Tooltip from '../components/UI/Tooltip';
import ProtocolDetailModal from '../components/Protocols/ProtocolDetailModal';
import EnhancedDoseCalculator from '../components/Dosing/EnhancedDoseCalculator';
import { 
  FileText, 
  ExternalLink, 
  Search, 
  Calendar, 
  Users, 
  TrendingUp,
  Download,
  Calculator,
  Copy,
  Check,
  AlertTriangle,
  Info,
  Filter,
  Shield,
  Pill,
  BookOpen,
  Target,
  Activity
} from 'lucide-react';

type Protocol = {
  id?: string;
  name: string;
  cancerType: string;
  stage: string;
  drugs: string[];
  duration: string;
  responseRate: string;
  source: string;
  indication: string;
  efficacyData?: {
    overallSurvival?: string;
    progressionFreeSurvival?: string;
    responseRate?: string;
    diseaseControlRate?: string;
    diseaseFreeeSurvival?: string;
    pathologicalCompleteResponse?: string;
    recurrenceReduction?: string;
    completeResponse?: string;
    overallResponse?: string;
  };
  toxicityProfile?: {
    grade3_4?: string;
    commonAEs?: string[];
    seriousAEs?: string[];
  };
  contraindications?: string[];
  monitoring?: string[];
};

type Regimen = {
  id: string;
  name: string;
  indication: string;
  cycleLengthDays?: number;
  components?: { name: string; dose: string }[];
  pretreatment?: string[];
  monitoring?: string[];
  notes?: string[];
  adjustments?: { criterion: string; action: string }[];
};

const ProtocolsAndRegimens: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'protocols' | 'regimens'>('protocols');
  
  // Protocols state
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
  const [cancerTypeFilter, setCancerTypeFilter] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Regimens state
  const [list, setList] = useState<Regimen[]>([]);
  const [selected, setSelected] = useState<Regimen | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [dosingLoading, setDosingLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIndication, setFilterIndication] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [labs, setLabs] = useState<{ ANC?: number; platelets?: number; CrCl?: number; LVEF?: number }>({});
  const [patient, setPatient] = useState<{ heightCm?: number; weightKg?: number; ageYears?: number; sex?: string; serumCreatinineMgDl?: number }>({});
  const [calculators, setCalculators] = useState<{ BSA?: number | null; CrCl?: number | null } | null>(null);
  const [phenotypes, setPhenotypes] = useState<{ [gene: string]: string }>({});
  const [dosingRecs, setDosingRecs] = useState<string[] | null>(null);
  const [warnings, setWarnings] = useState<string[] | null>(null);
  const [calcDoses, setCalcDoses] = useState<{ component: string; dose: string; calculatedMg?: number }[] | null>(null);
  const [rounding, setRounding] = useState<string>('5');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showEnhancedCalculator, setShowEnhancedCalculator] = useState(false);
  const [selectedDrugForCalculator, setSelectedDrugForCalculator] = useState<{ name: string; dose: string } | null>(null);

  // Handle URL parameters
  useEffect(() => {
    const drugParam = searchParams.get('drug');
    const tabParam = searchParams.get('tab');
    
    if (drugParam) {
      setSelectedDrug(drugParam);
    }
    
    if (tabParam === 'regimens') {
      setActiveTab('regimens');
    }
  }, [searchParams]);

  // Auto-hide success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Protocols state
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [protocolsLoading, setProtocolsLoading] = useState(true);
  const [protocolsError, setProtocolsError] = useState<string | null>(null);

  // Load protocols from API
  useEffect(() => {
    const loadProtocols = async () => {
      try {
        setProtocolsLoading(true);
        setProtocolsError(null);
        
        const API_BASE = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${API_BASE}/protocols`);
        
        if (!response.ok) {
          throw new Error(`Failed to load protocols: ${response.status}`);
        }
        
        const data = await response.json();
        setProtocols(data.protocols || []);
      } catch (err) {
        console.error('Failed to load protocols:', err);
        setProtocolsError('Failed to load protocols. Please try again.');
        setProtocols([]);
      } finally {
        setProtocolsLoading(false);
      }
    };
    
    loadProtocols();
  }, []);

  // Load regimens from API
  useEffect(() => {
    const loadRegimens = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const API_BASE = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${API_BASE}/regimens`);
        
        if (!response.ok) {
          throw new Error(`Failed to load regimens: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Load detailed data for each regimen
        const detailedRegimens = await Promise.all(
          data.regimens.map(async (regimen: { id: string }) => {
            try {
              const detailResponse = await fetch(`${API_BASE}/regimens/${regimen.id}`);
              if (detailResponse.ok) {
                return await detailResponse.json();
              }
              return regimen; // Fallback to basic data if detail fetch fails
            } catch (err) {
              console.warn(`Failed to load details for regimen ${regimen.id}:`, err);
              return regimen;
            }
          })
        );
        
        setList(detailedRegimens);
      } catch (err) {
        console.error('Failed to load regimens:', err);
        setError('Failed to load regimens. Please try again.');
        
        // Fallback to empty list
        setList([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadRegimens();
  }, []);

  const handleProtocolClick = (protocol: Protocol) => {
    setSelectedProtocol(protocol);
    setIsModalOpen(true);
  };

  const filteredProtocols = protocols.filter(protocol => {
    const matchesDrug = !selectedDrug || protocol.drugs.some(drug => 
      drug.toLowerCase().includes(selectedDrug.toLowerCase())
    );
    const matchesCancerType = !cancerTypeFilter || protocol.cancerType.includes(cancerTypeFilter);
    const matchesStage = !stageFilter || protocol.stage.includes(stageFilter);
    const matchesSource = !sourceFilter || protocol.source === sourceFilter;
    
    return matchesDrug && matchesCancerType && matchesStage && matchesSource;
  });

  const filteredRegimens = list.filter(regimen => {
    const matchesSearch = !searchQuery || 
      regimen.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      regimen.indication.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndication = !filterIndication || regimen.indication.includes(filterIndication);
    
    return matchesSearch && matchesIndication;
  });

  const TabButton: React.FC<{ 
    tab: 'protocols' | 'regimens'; 
    label: string; 
    icon: React.ElementType;
    description: string;
  }> = ({ tab, label, icon: Icon, description }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-lg font-medium transition-all duration-200 ${
        activeTab === tab
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <Icon className="h-5 w-5" />
      <div className="text-left">
        <div className="font-semibold">{label}</div>
        <div className={`text-xs ${activeTab === tab ? 'text-blue-100' : 'text-gray-500'}`}>
          {description}
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Treatment Protocols & Regimens
        </h1>
        <p className="text-gray-600 text-lg max-w-4xl mx-auto">
          Access evidence-based treatment protocols and calculate precise dosing regimens for oncology care.
        </p>
      </div>

      {/* Tab Navigation */}
      <Card className="border-blue-200">
        <div className="p-6">
          <div className="flex space-x-4">
            <TabButton
              tab="protocols"
              label="Treatment Protocols"
              icon={FileText}
              description="Evidence-based guidelines & protocols"
            />
            <TabButton
              tab="regimens"
              label="Dosing Regimens"
              icon={Calculator}
              description="Dose calculations & administration"
            />
          </div>
        </div>
      </Card>

      {/* Protocols Tab Content */}
      {activeTab === 'protocols' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium">Filter Protocols</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cancer Type</label>
                  <select
                    value={cancerTypeFilter}
                    onChange={(e) => setCancerTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Cancer Types</option>
                    <option value="Breast Cancer">Breast Cancer</option>
                    <option value="Colorectal Cancer">Colorectal Cancer</option>
                    <option value="Lymphoma">Lymphoma</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                  <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Stages</option>
                    <option value="Early Stage">Early Stage</option>
                    <option value="Advanced">Advanced</option>
                    <option value="HER2+">HER2+</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Sources</option>
                    <option value="NCCN">NCCN</option>
                    <option value="ASCO">ASCO</option>
                    <option value="FDA">FDA</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setCancerTypeFilter('');
                      setStageFilter('');
                      setSourceFilter('');
                      setSelectedDrug(null);
                    }}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Protocols Content */}
          {protocolsLoading ? (
            <Card>
              <div className="p-8 text-center">
                <LoadingSpinner />
                <p className="text-gray-600 mt-4">Loading protocols...</p>
              </div>
            </Card>
          ) : protocolsError ? (
            <Card>
              <div className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Protocols</h3>
                <p className="text-gray-600 mb-4">{protocolsError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </Card>
          ) : (
            <>
              {/* Protocols Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProtocols.map((protocol, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="p-6" onClick={() => handleProtocolClick(protocol)}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{protocol.name}</h3>
                      <p className="text-sm text-blue-600">{protocol.cancerType}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      {protocol.stage}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Components:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {protocol.drugs.map((drug, drugIndex) => (
                          <span key={drugIndex} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            {drug}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Duration</p>
                        <p className="text-gray-600">{protocol.duration}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Response Rate</p>
                        <p className="text-green-600 font-medium">{protocol.responseRate}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">{protocol.indication}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Source: {protocol.source}</span>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </Card>
                ))}
              </div>

              {filteredProtocols.length === 0 && (
                <Card>
                  <div className="p-8 text-center">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Protocols Found</h3>
                    <p className="text-gray-600">
                      Try adjusting your filters to find relevant treatment protocols.
                    </p>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* Regimens Tab Content */}
      {activeTab === 'regimens' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium">Search Regimens</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search regimens..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Indication</label>
                  <select
                    value={filterIndication}
                    onChange={(e) => setFilterIndication(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Indications</option>
                    <option value="Breast Cancer">Breast Cancer</option>
                    <option value="Colorectal Cancer">Colorectal Cancer</option>
                    <option value="Lung Cancer">Lung Cancer</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {loading ? (
            <Card>
              <div className="p-8 text-center">
                <LoadingSpinner />
                <p className="text-gray-600 mt-4">Loading regimens...</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Regimens List */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">Available Regimens</h3>
                  
                  <div className="space-y-3">
                    {filteredRegimens.map((regimen) => (
                      <div
                        key={regimen.id}
                        onClick={() => setSelected(regimen)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selected?.id === regimen.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{regimen.name}</h4>
                            <p className="text-sm text-gray-600">{regimen.indication}</p>
                            {regimen.cycleLengthDays && (
                              <p className="text-xs text-gray-500 mt-1">
                                Cycle: {regimen.cycleLengthDays} days
                              </p>
                            )}
                          </div>
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredRegimens.length === 0 && (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Regimens Found</h4>
                      <p className="text-gray-600">
                        Try adjusting your search criteria.
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Regimen Details */}
              <Card>
                <div className="p-6">
                  {selected ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{selected.name}</h3>
                        <p className="text-gray-600">{selected.indication}</p>
                        {selected.cycleLengthDays && (
                          <p className="text-sm text-gray-500 mt-1">
                            Cycle Length: {selected.cycleLengthDays} days
                          </p>
                        )}
                      </div>

                      {selected.components && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Components</h4>
                          <div className="space-y-2">
                            {selected.components.map((component, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-medium text-gray-900">{component.name}</p>
                                  <p className="text-sm text-gray-600">{component.dose}</p>
                                </div>
                                <button
                                  onClick={() => setSelectedDrugForCalculator(component)}
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                                  title="Calculate dose"
                                >
                                  <Calculator className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selected.pretreatment && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Pre-treatment Requirements</h4>
                          <ul className="space-y-1">
                            {selected.pretreatment.map((item, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start">
                                <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selected.monitoring && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Monitoring</h4>
                          <ul className="space-y-1">
                            {selected.monitoring.map((item, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start">
                                <Activity className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selected.notes && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Important Notes</h4>
                          <ul className="space-y-1">
                            {selected.notes.map((note, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start">
                                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                                {note}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selected.adjustments && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Dose Adjustments</h4>
                          <div className="space-y-2">
                            {selected.adjustments.map((adjustment, index) => (
                              <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                  {adjustment.criterion}
                                </p>
                                <p className="text-sm text-gray-700">
                                  <strong>Action:</strong> {adjustment.action}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Select a Regimen</h4>
                      <p className="text-gray-600">
                        Choose a regimen from the list to view detailed information and dosing calculations.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <Alert type="success" className="fixed top-4 right-4 z-50">
          {successMessage}
        </Alert>
      )}

      {/* Protocol Detail Modal */}
      {selectedProtocol && (
        <ProtocolDetailModal
          protocol={selectedProtocol}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProtocol(null);
          }}
        />
      )}

      {/* Enhanced Dose Calculator Modal */}
      {showEnhancedCalculator && selectedDrugForCalculator && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Dose Calculator - {selectedDrugForCalculator.name}
                  </h3>
                  <button
                    onClick={() => {
                      setShowEnhancedCalculator(false);
                      setSelectedDrugForCalculator(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <EnhancedDoseCalculator
                  drugName={selectedDrugForCalculator.name}
                  standardDose={selectedDrugForCalculator.dose}
                  onClose={() => {
                    setShowEnhancedCalculator(false);
                    setSelectedDrugForCalculator(null);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtocolsAndRegimens;