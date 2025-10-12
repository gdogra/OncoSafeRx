import React, { useEffect, useMemo, useState } from 'react';
import { apiBaseUrl } from '../utils/env';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Tooltip from '../components/UI/Tooltip';
import EnhancedDoseCalculator from '../components/Dosing/EnhancedDoseCalculator';
import { Search, Download, FileText, Calculator, Copy, Check, AlertTriangle, Info, Filter, Shield } from 'lucide-react';
import Breadcrumbs from '../components/UI/Breadcrumbs';

type Regimen = {
  id: string;
  name: string;
  indication: string;
  cycleLengthDays?: number;
  components?: { name: string; dose: string }[];
  pretreatment?: string[];
  monitoring?: string[];
  notes?: string[];
};

const Regimens: React.FC = () => {
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

  // Auto-hide success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const base = apiBaseUrl();
        const resp = await fetch(`${base}/regimens`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
        const data = await resp.json();
        setList(data.regimens || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load regimens');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pgxPhenotypes');
      if (saved) setPhenotypes(JSON.parse(saved));
    } catch {}
  }, []);

  const loadDetails = async (id: string) => {
    setDetailsLoading(true);
    setError(null);
    try {
      const base = apiBaseUrl();
      const resp = await fetch(`${base}/regimens/${id}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      const data = await resp.json();
      setSelected(data);
      // Clear previous dosing calculations when selecting new regimen
      setDosingRecs(null);
      setWarnings(null);
      setCalcDoses(null);
      setCalculators(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load regimen details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const apiBase = useMemo(() => apiBaseUrl(), []);

  const downloadPdf = (id: string) => {
    try {
      const url = `${apiBase}/export/regimen/${encodeURIComponent(id)}/pdf`;
      window.open(url, '_blank');
      setSuccessMessage('PDF download initiated');
    } catch (e) {
      setError('Failed to initiate PDF download');
    }
  };

  const copyDoses = async () => {
    if (!Array.isArray(calcDoses) || !selected) return;
    const lines = [
      `Regimen: ${selected.name}`,
      calculators?.BSA ? `BSA: ${calculators.BSA.toFixed(2)} m²` : '',
      ...calcDoses.map(cd => {
        const calc = cd.calculatedMg !== undefined ? `${cd.calculatedMg} mg` : '-';
        const round = (cd as any).roundedMg !== undefined ? `${(cd as any).roundedMg} mg` : '-';
        return `${cd.component}: ${cd.dose} | Calculated: ${calc} | Rounded: ${round}`;
      })
    ].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(lines);
      setSuccessMessage('Dose calculations copied to clipboard');
    } catch (e) {
      setError('Failed to copy to clipboard');
    }
  };

  const validateInputs = () => {
    const errors: Record<string, string> = {};
    
    // Validate patient data for BSA calculation
    if (patient.heightCm && (patient.heightCm < 100 || patient.heightCm > 250)) {
      errors.height = 'Height must be between 100-250 cm';
    }
    if (patient.weightKg && (patient.weightKg < 20 || patient.weightKg > 300)) {
      errors.weight = 'Weight must be between 20-300 kg';
    }
    if (patient.ageYears && (patient.ageYears < 0 || patient.ageYears > 120)) {
      errors.age = 'Age must be between 0-120 years';
    }
    if (patient.serumCreatinineMgDl && (patient.serumCreatinineMgDl < 0.1 || patient.serumCreatinineMgDl > 20)) {
      errors.creatinine = 'Serum creatinine must be between 0.1-20 mg/dL';
    }

    // Validate lab values
    if (labs.ANC && (labs.ANC < 0 || labs.ANC > 50000)) {
      errors.anc = 'ANC must be between 0-50,000 /µL';
    }
    if (labs.platelets && (labs.platelets < 0 || labs.platelets > 2000000)) {
      errors.platelets = 'Platelets must be between 0-2,000,000 /µL';
    }
    if (labs.CrCl && (labs.CrCl < 0 || labs.CrCl > 300)) {
      errors.creatinine_clearance = 'CrCl must be between 0-300 mL/min';
    }
    if (labs.LVEF && (labs.LVEF < 0 || labs.LVEF > 100)) {
      errors.lvef = 'LVEF must be between 0-100%';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const adjustDosing = async () => {
    if (!selected) return;
    
    if (!validateInputs()) {
      setError('Please correct the validation errors before proceeding');
      return;
    }

    setDosingLoading(true);
    setError(null);
    
    try {
      const resp = await fetch(`${apiBase}/dosing/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          regimenId: selected.id, 
          labs, 
          phenotypes, 
          patient, 
          rounding: parseInt(rounding, 10) 
        })
      });
      
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      }
      
      const data = await resp.json();
      setDosingRecs(data.recommendations || []);
      setWarnings(data.warnings || []);
      setCalcDoses(data.calculatedDoses || null);
      setCalculators(data.calculators || null);
      setSuccessMessage('Dosing calculations completed successfully');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to adjust dosing');
    } finally {
      setDosingLoading(false);
    }
  };

  // Filter regimens based on search and indication
  const filteredRegimens = useMemo(() => {
    return list.filter(regimen => {
      const matchesSearch = regimen.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           regimen.indication.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndication = !filterIndication || regimen.indication.toLowerCase().includes(filterIndication.toLowerCase());
      return matchesSearch && matchesIndication;
    });
  }, [list, searchQuery, filterIndication]);

  // Get unique indications for filter dropdown
  const uniqueIndications = useMemo(() => {
    const indications = Array.from(new Set(list.map(r => r.indication)));
    return indications.sort();
  }, [list]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Regimens' }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Regimen Templates</h1>
        <div className="flex items-center space-x-2">
          <Calculator className="w-6 h-6 text-blue-600" />
          <span className="text-sm text-gray-600">Production Ready</span>
        </div>
      </div>
      
      {error && <Alert type="error" title="Error">{error}</Alert>}
      {successMessage && <Alert type="success" title="Success">{successMessage}</Alert>}
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Regimens ({filteredRegimens.length})</h2>
            <Tooltip content="Browse and select oncology treatment regimens for dose calculations">
              <Info className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          
          {/* Search and Filter */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search regimens..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filterIndication}
                onChange={(e) => setFilterIndication(e.target.value)}
              >
                <option value="">All indications</option>
                {uniqueIndications.map(indication => (
                  <option key={indication} value={indication}>{indication}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
              <span className="ml-2 text-gray-600">Loading regimens...</span>
            </div>
          ) : (
            <ul className="divide-y max-h-96 overflow-y-auto">
              {filteredRegimens.map((r) => (
                <li key={r.id} className="py-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{r.name}</div>
                    <div className="text-sm text-gray-500 truncate">{r.indication}</div>
                    {r.cycleLengthDays && (
                      <div className="text-xs text-gray-400">{r.cycleLengthDays} day cycle</div>
                    )}
                  </div>
                  <button 
                    className="ml-2 px-3 py-1 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors disabled:opacity-50"
                    onClick={() => loadDetails(r.id)}
                    disabled={detailsLoading}
                  >
                    {detailsLoading ? <LoadingSpinner size="sm" /> : 'View'}
                  </button>
                </li>
              ))}
              {filteredRegimens.length === 0 && !loading && (
                <li className="py-8 text-center text-gray-500">
                  {searchQuery || filterIndication ? 'No regimens match your search criteria' : 'No regimens available'}
                </li>
              )}
            </ul>
          )}
        </Card>
        <div className="md:col-span-2">
          <Card>
            {detailsLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">Loading regimen details...</span>
              </div>
            ) : !selected ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <div className="text-gray-500">Select a regimen from the list to view details and perform dose calculations.</div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selected.name}</h3>
                      <p className="text-gray-600 mt-1">Indication: {selected.indication}</p>
                      {selected.cycleLengthDays && (
                        <p className="text-sm text-gray-500 mt-1">Cycle length: {selected.cycleLengthDays} days</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-3">
                      <Tooltip content="Download basic regimen protocol as PDF">
                        <button 
                          onClick={() => downloadPdf(selected.id)} 
                          className="inline-flex items-center px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </button>
                      </Tooltip>
                      
                      <Tooltip content="Generate comprehensive electronic Prior Authorization package with patient data, dose calculations, clinical justification, and safety monitoring">
                        <button
                          onClick={() => {
                            // Check if we have sufficient data for ePA
                            const hasPatientData = patient.heightCm && patient.weightKg && patient.ageYears;
                            const hasLabData = labs.ANC || labs.platelets || labs.CrCl || labs.LVEF;
                            
                            if (!hasPatientData && !hasLabData) {
                              setError('ePA package requires patient parameters (height, weight, age) and/or lab values. Please enter data and run dose calculations first.');
                              return;
                            }

                            // Create comprehensive ePA package data
                            const epaData = {
                              regimenId: selected.id,
                              regimenName: selected.name,
                              indication: selected.indication,
                              timestamp: new Date().toISOString(),
                              patient: {
                                heightCm: patient.heightCm,
                                weightKg: patient.weightKg,
                                ageYears: patient.ageYears,
                                sex: patient.sex,
                                serumCreatinineMgDl: patient.serumCreatinineMgDl
                              },
                              labs: {
                                ANC: labs.ANC,
                                platelets: labs.platelets,
                                CrCl: labs.CrCl,
                                LVEF: labs.LVEF
                              },
                              pharmacogenomics: phenotypes,
                              calculations: calculators,
                              dosingRecommendations: dosingRecs,
                              clinicalWarnings: warnings,
                              calculatedDoses: calcDoses,
                              roundingPrecision: rounding
                            };

                            // Generate comprehensive ePA package URL
                            const params = new URLSearchParams();
                            params.set('data', JSON.stringify(epaData));
                            params.set('format', 'comprehensive');
                            params.set('include', 'justification,calculations,safety');
                            
                            const url = `${apiBase}/export/epa-package?${params.toString()}`;
                            window.open(url, "_blank");
                            setSuccessMessage('Comprehensive ePA package with clinical justification generated');
                          }}
                          disabled={!selected}
                          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Generate ePA Pack
                        </button>
                      </Tooltip>
                    </div>
                    
                    {/* ePA Data Status Indicator */}
                    {(() => {
                      const hasPatientData = patient.heightCm && patient.weightKg && patient.ageYears;
                      const hasLabData = labs.ANC || labs.platelets || labs.CrCl || labs.LVEF;
                      const hasCalculations = calculators && calcDoses;
                      
                      if (hasPatientData || hasLabData || hasCalculations) {
                        return (
                          <div className="flex items-center space-x-2 text-xs">
                            <div className="flex items-center space-x-1 text-green-700">
                              <Check className="w-3 h-3" />
                              <span>ePA data available:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {hasPatientData && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Patient data</span>
                              )}
                              {hasLabData && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Lab values</span>
                              )}
                              {hasCalculations && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">Dose calculations</span>
                              )}
                              {Object.keys(phenotypes || {}).length > 0 && (
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">PGx data</span>
                              )}
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="flex items-center space-x-2 text-xs text-amber-700">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Add patient data and lab values to generate comprehensive ePA package</span>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
                {Object.keys(phenotypes || {}).length > 0 && (
                  <div className="text-xs text-green-700 bg-green-50 inline-block px-2 py-1 rounded">Using saved PGx phenotypes</div>
                )}
                {selected.components && (
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Components</span>
                      <Tooltip content="Active medications and their standard doses in this regimen. Actual doses may be adjusted based on patient parameters and lab values.">
                        <Info className="w-3 h-3 text-gray-400" />
                      </Tooltip>
                    </div>
                    <ul className="list-disc ml-6 text-sm text-gray-700">
                      {selected.components.map((c, idx) => (
                        <li key={idx}>{c.name}: {c.dose}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selected.pretreatment && (
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Pre-treatment</span>
                      <Tooltip content="Medications that must be given before chemotherapy to prevent adverse reactions (e.g., antihistamines, steroids, antiemetics).">
                        <Info className="w-3 h-3 text-gray-400" />
                      </Tooltip>
                    </div>
                    <ul className="list-disc ml-6 text-sm text-gray-700">
                      {selected.pretreatment.map((p, idx) => <li key={idx}>{p}</li>)}
                    </ul>
                  </div>
                )}
                {selected.monitoring && (
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Monitoring</span>
                      <Tooltip content="Essential lab tests and clinical assessments required during treatment to monitor for toxicity and efficacy.">
                        <Info className="w-3 h-3 text-gray-400" />
                      </Tooltip>
                    </div>
                    <ul className="list-disc ml-6 text-sm text-gray-700">
                      {selected.monitoring.map((m, idx) => <li key={idx}>{m}</li>)}
                    </ul>
                  </div>
                )}
                {selected.notes && (
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Clinical Notes</span>
                      <Tooltip content="Important clinical considerations, contraindications, special populations guidance, and institutional modifications.">
                        <Info className="w-3 h-3 text-gray-400" />
                      </Tooltip>
                    </div>
                    <ul className="list-disc ml-6 text-sm text-gray-700">
                      {selected.notes.map((n, idx) => <li key={idx}>{n}</li>)}
                    </ul>
                  </div>
                )}

                {/* Dosing calculator */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Calculator className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium text-blue-900">Dosing Calculator</h4>
                    </div>
                    <Tooltip content="Enter patient parameters and lab values for personalized dose calculations">
                      <Info className="w-4 h-4 text-blue-600" />
                    </Tooltip>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Laboratory Values</h5>
                      <div className="grid md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <label className="block text-gray-700 mb-1">
                            ANC (/µL)
                            <Tooltip content="Absolute Neutrophil Count - used for myelotoxicity monitoring">
                              <Info className="inline w-3 h-3 ml-1 text-gray-400" />
                            </Tooltip>
                          </label>
                          <input 
                            type="number" 
                            className={`w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.anc ? 'border-red-500' : 'border-gray-300'}`}
                            value={labs.ANC ?? ''} 
                            onChange={e => setLabs({ ...labs, ANC: e.target.value ? Number(e.target.value) : undefined })} 
                            placeholder="e.g., 1500"
                          />
                          {validationErrors.anc && <p className="text-xs text-red-600 mt-1">{validationErrors.anc}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1">
                            Platelets (/µL)
                            <Tooltip content="Platelet count - important for bleeding risk assessment">
                              <Info className="inline w-3 h-3 ml-1 text-gray-400" />
                            </Tooltip>
                          </label>
                          <input 
                            type="number" 
                            className={`w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.platelets ? 'border-red-500' : 'border-gray-300'}`}
                            value={labs.platelets ?? ''} 
                            onChange={e => setLabs({ ...labs, platelets: e.target.value ? Number(e.target.value) : undefined })} 
                            placeholder="e.g., 150000"
                          />
                          {validationErrors.platelets && <p className="text-xs text-red-600 mt-1">{validationErrors.platelets}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1">
                            CrCl (mL/min)
                            <Tooltip content="Creatinine clearance - for renal dose adjustments">
                              <Info className="inline w-3 h-3 ml-1 text-gray-400" />
                            </Tooltip>
                          </label>
                          <input 
                            type="number" 
                            className={`w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.creatinine_clearance ? 'border-red-500' : 'border-gray-300'}`}
                            value={labs.CrCl ?? ''} 
                            onChange={e => setLabs({ ...labs, CrCl: e.target.value ? Number(e.target.value) : undefined })} 
                            placeholder="e.g., 90"
                          />
                          {validationErrors.creatinine_clearance && <p className="text-xs text-red-600 mt-1">{validationErrors.creatinine_clearance}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1">
                            LVEF (%)
                            <Tooltip content="Left Ventricular Ejection Fraction - for cardiotoxicity monitoring">
                              <Info className="inline w-3 h-3 ml-1 text-gray-400" />
                            </Tooltip>
                          </label>
                          <input 
                            type="number" 
                            className={`w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.lvef ? 'border-red-500' : 'border-gray-300'}`}
                            value={labs.LVEF ?? ''} 
                            onChange={e => setLabs({ ...labs, LVEF: e.target.value ? Number(e.target.value) : undefined })} 
                            placeholder="e.g., 65"
                          />
                          {validationErrors.lvef && <p className="text-xs text-red-600 mt-1">{validationErrors.lvef}</p>}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Patient Parameters</h5>
                      <div className="grid md:grid-cols-5 gap-3 text-sm">
                        <div>
                          <label className="block text-gray-700 mb-1">Height (cm)</label>
                          <input 
                            type="number" 
                            className={`w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.height ? 'border-red-500' : 'border-gray-300'}`}
                            value={patient.heightCm ?? ''} 
                            onChange={e => setPatient({ ...patient, heightCm: e.target.value ? Number(e.target.value) : undefined })} 
                            placeholder="e.g., 170"
                          />
                          {validationErrors.height && <p className="text-xs text-red-600 mt-1">{validationErrors.height}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1">Weight (kg)</label>
                          <input 
                            type="number" 
                            className={`w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.weight ? 'border-red-500' : 'border-gray-300'}`}
                            value={patient.weightKg ?? ''} 
                            onChange={e => setPatient({ ...patient, weightKg: e.target.value ? Number(e.target.value) : undefined })} 
                            placeholder="e.g., 70"
                          />
                          {validationErrors.weight && <p className="text-xs text-red-600 mt-1">{validationErrors.weight}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1">Age (years)</label>
                          <input 
                            type="number" 
                            className={`w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.age ? 'border-red-500' : 'border-gray-300'}`}
                            value={patient.ageYears ?? ''} 
                            onChange={e => setPatient({ ...patient, ageYears: e.target.value ? Number(e.target.value) : undefined })} 
                            placeholder="e.g., 65"
                          />
                          {validationErrors.age && <p className="text-xs text-red-600 mt-1">{validationErrors.age}</p>}
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1">Sex</label>
                          <select 
                            className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            value={patient.sex || ''} 
                            onChange={e => setPatient({ ...patient, sex: e.target.value })}
                          >
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1">Serum Creatinine (mg/dL)</label>
                          <input 
                            type="number" 
                            step="0.01"
                            className={`w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.creatinine ? 'border-red-500' : 'border-gray-300'}`}
                            value={patient.serumCreatinineMgDl ?? ''} 
                            onChange={e => setPatient({ ...patient, serumCreatinineMgDl: e.target.value ? Number(e.target.value) : undefined })} 
                            placeholder="e.g., 1.0"
                          />
                          {validationErrors.creatinine && <p className="text-xs text-red-600 mt-1">{validationErrors.creatinine}</p>}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Pharmacogenomics</h5>
                      <div className="grid md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <label className="block text-gray-700 mb-1">
                            DPYD phenotype
                            <Tooltip content="DPYD metabolizer status affects 5-FU/capecitabine dosing">
                              <Info className="inline w-3 h-3 ml-1 text-gray-400" />
                            </Tooltip>
                          </label>
                          <select 
                            className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            value={phenotypes.DPYD || ''} 
                            onChange={e => setPhenotypes({ ...phenotypes, DPYD: e.target.value })}
                          >
                            <option value="">Unknown</option>
                            <option value="Normal metabolizer">Normal metabolizer</option>
                            <option value="Intermediate metabolizer">Intermediate metabolizer</option>
                            <option value="Poor metabolizer">Poor metabolizer</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1">
                            CYP2D6 phenotype
                            <Tooltip content="CYP2D6 metabolizer status affects various drug metabolisms">
                              <Info className="inline w-3 h-3 ml-1 text-gray-400" />
                            </Tooltip>
                          </label>
                          <select 
                            className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            value={phenotypes.CYP2D6 || ''} 
                            onChange={e => setPhenotypes({ ...phenotypes, CYP2D6: e.target.value })}
                          >
                            <option value="">Unknown</option>
                            <option value="Normal metabolizer">Normal metabolizer</option>
                            <option value="Intermediate metabolizer">Intermediate metabolizer</option>
                            <option value="Poor metabolizer">Poor metabolizer</option>
                            <option value="Ultra-rapid metabolizer">Ultra-rapid metabolizer</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1">Rounding Precision</label>
                          <select 
                            className="w-full border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            value={rounding} 
                            onChange={e => setRounding(e.target.value)}
                          >
                            <option value="5">5 mg</option>
                            <option value="10">10 mg</option>
                            <option value="25">25 mg</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-blue-200">
                      <button 
                        onClick={adjustDosing} 
                        disabled={dosingLoading}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {dosingLoading ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span className="ml-2">Calculating...</span>
                          </>
                        ) : (
                          <>
                            <Calculator className="w-4 h-4 mr-2" />
                            Apply Adjustments
                          </>
                        )}
                      </button>
                      
                      {Object.keys(phenotypes || {}).length > 0 && (
                        <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded flex items-center">
                          <Check className="w-3 h-3 mr-1" />
                          Using saved PGx phenotypes
                        </div>
                      )}
                    </div>
                  </div>
                  {calculators && (
                    <div className="flex items-center space-x-2 mt-2 text-xs text-gray-600">
                      <span>Calculated:</span>
                      {calculators.BSA && (
                        <Tooltip content="Body Surface Area calculated using Dubois formula: BSA = 0.007184 × Weight^0.425 × Height^0.725">
                          <span className="underline cursor-help">BSA {calculators.BSA.toFixed(2)} m²</span>
                        </Tooltip>
                      )}
                      {calculators.CrCl && (
                        <Tooltip content="Creatinine Clearance calculated using Cockcroft-Gault equation for renal function assessment">
                          <span className="underline cursor-help">• CrCl {Math.round(calculators.CrCl)} mL/min</span>
                        </Tooltip>
                      )}
                    </div>
                  )}
                  {dosingRecs && (
                    <div className="mt-3 space-y-1 text-sm text-gray-700">
                      {dosingRecs.length === 0 && <div>No adjustments recommended.</div>}
                      {dosingRecs.map((r, idx) => <div key={idx}>• {r}</div>)}
                    </div>
                  )}
                  {warnings && warnings.length > 0 && (
                    <div className="mt-3">
                      <Alert type="warning" title="Clinical Warnings">
                        <ul className="list-disc ml-6 space-y-1">
                          {warnings.map((w, i) => (<li key={i}>{w}</li>))}
                        </ul>
                      </Alert>
                    </div>
                  )}
                  {/* Calculated doses (from backend) */}
                  {calculators && Array.isArray(calcDoses) && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Calculator className="w-4 h-4 text-blue-600" />
                          <h5 className="font-medium text-gray-900">Calculated Doses</h5>
                          {calculators.BSA && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              BSA: {calculators.BSA.toFixed(2)} m²
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={copyDoses} 
                          className="inline-flex items-center px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy Doses
                        </button>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead>
                            <tr className="text-left text-gray-600 bg-gray-50">
                              <th className="px-3 py-2 font-medium">Component</th>
                              <th className="px-3 py-2 font-medium">Regimen Dose</th>
                              <th className="px-3 py-2 font-medium">Calculated (mg)</th>
                              <th className="px-3 py-2 font-medium">Rounded (mg)</th>
                              <th className="px-3 py-2 font-medium">Note</th>
                              <th className="px-3 py-2 font-medium">Vial Guidance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {calcDoses.map((cd: any, idx) => {
                              const vialMap: Record<string, number> = {
                                oxaliplatin: 50,
                                irinotecan: 100,
                                doxorubicin: 10,
                                leucovorin: 50,
                                paclitaxel: 100,
                                rituximab: 100
                              };
                              const key = (cd.component || '').toLowerCase();
                              const vial = vialMap[key];
                              let vialText = '-';
                              if (vial && cd.roundedMg) {
                                const vials = Math.ceil(cd.roundedMg / vial);
                                vialText = `~${vials} × ${vial} mg`;
                              }
                              return (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 font-medium text-gray-900">{cd.component}</td>
                                  <td className="px-3 py-2 text-gray-700">{cd.dose}</td>
                                  <td className="px-3 py-2 text-gray-700">{cd.calculatedMg !== undefined ? `${cd.calculatedMg} mg` : '-'}</td>
                                  <td className="px-3 py-2 font-medium text-blue-700">{cd.roundedMg !== undefined ? `${cd.roundedMg} mg` : '-'}</td>
                                  <td className="px-3 py-2 text-gray-600">{cd.note || '-'}</td>
                                  <td className="px-3 py-2 text-purple-700 font-medium">{vialText}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <strong>Important:</strong> These are calculated suggestions only. Always verify doses, confirm vial sizes, 
                            and follow institutional protocols before finalizing orders. Rounded to nearest {rounding} mg.
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Calculator Section */}
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-blue-600" />
                            <div>
                              <h6 className="text-sm font-medium text-blue-900">Enhanced Safety Calculator</h6>
                              <p className="text-xs text-blue-700">AI-powered dose calculation with comprehensive safety alerts</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowEnhancedCalculator(!showEnhancedCalculator)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                          >
                            {showEnhancedCalculator ? 'Hide Calculator' : 'Open Calculator'}
                          </button>
                        </div>
                        
                        {showEnhancedCalculator && (
                          <div className="mt-4">
                            <div className="mb-3">
                              <label className="block text-xs font-medium text-blue-900 mb-1">
                                Select Drug for Enhanced Analysis:
                              </label>
                              <select
                                value={selectedDrugForCalculator ? `${selectedDrugForCalculator.name}|${selectedDrugForCalculator.dose}` : ''}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const [name, dose] = e.target.value.split('|');
                                    setSelectedDrugForCalculator({ name, dose });
                                  } else {
                                    setSelectedDrugForCalculator(null);
                                  }
                                }}
                                className="block w-full border border-blue-300 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select a drug...</option>
                                {selected?.components?.map((comp, idx) => (
                                  <option key={idx} value={`${comp.name}|${comp.dose}`}>
                                    {comp.name} ({comp.dose})
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            {selectedDrugForCalculator && (
                              <div className="border border-blue-200 rounded p-3 bg-white">
                                <EnhancedDoseCalculator
                                  drug={{
                                    rxcui: 'mock-rxcui', // In real implementation, would need drug lookup
                                    name: selectedDrugForCalculator.name,
                                    generic_name: selectedDrugForCalculator.name
                                  }}
                                  standardDose={parseFloat(selectedDrugForCalculator.dose.match(/\d+(\.\d+)?/)?.[0] || '0')}
                                  unit={selectedDrugForCalculator.dose.includes('mg/m²') ? 'mg/m²' : 
                                        selectedDrugForCalculator.dose.includes('mg/kg') ? 'mg/kg' : 'mg'}
                                  indication={selected?.indication}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Regimens;
