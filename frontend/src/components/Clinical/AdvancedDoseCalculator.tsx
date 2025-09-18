import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  User, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Beaker,
  Target,
  TrendingUp,
  Info,
  Save,
  Copy,
  Printer
} from 'lucide-react';
import Card from '../UI/Card';
import Alert from '../UI/Alert';
import { Patient, DoseCalculation, BSACalculation, CreatinineClearanceCalculation } from '../../types/clinical';
import { DoseCalculationService } from '../../services/doseCalculationService';

interface AdvancedDoseCalculatorProps {
  patient?: Patient;
  onPatientChange?: (patient: Patient) => void;
}

const AdvancedDoseCalculator: React.FC<AdvancedDoseCalculatorProps> = ({ 
  patient: initialPatient, 
  onPatientChange 
}) => {
  const [patient, setPatient] = useState<Patient>(initialPatient || {
    id: 'temp',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    height: 170,
    weight: 70,
    diagnosis: '',
    renalFunction: {
      creatinine: 1.0
    },
    hepaticFunction: {
      bilirubin: 1.0,
      alt: 25,
      ast: 25,
      albumin: 4.0
    },
    labValues: [],
    allergies: [],
    contraindications: [],
    currentMedications: [],
    treatmentHistory: [],
    biomarkers: []
  });

  const [selectedDrug, setSelectedDrug] = useState('');
  const [baselineDose, setBaselineDose] = useState<number>(0);
  const [doseUnit, setDoseUnit] = useState('mg/m²');
  const [calculation, setCalculation] = useState<DoseCalculation | null>(null);
  const [bsaCalculation, setBsaCalculation] = useState<BSACalculation | null>(null);
  const [creatinineCalculation, setCreatinineCalculation] = useState<CreatinineClearanceCalculation | null>(null);

  // Common oncology drugs with standard doses
  const commonDrugs = [
    { name: 'Carboplatin', dose: 'AUC 5-6', unit: 'mg (AUC)' },
    { name: 'Cisplatin', dose: 75, unit: 'mg/m²' },
    { name: 'Doxorubicin', dose: 60, unit: 'mg/m²' },
    { name: 'Paclitaxel', dose: 175, unit: 'mg/m²' },
    { name: 'Docetaxel', dose: 75, unit: 'mg/m²' },
    { name: 'Gemcitabine', dose: 1000, unit: 'mg/m²' },
    { name: 'Fluorouracil', dose: 400, unit: 'mg/m²' },
    { name: 'Oxaliplatin', dose: 85, unit: 'mg/m²' },
    { name: 'Irinotecan', dose: 180, unit: 'mg/m²' },
    { name: 'Cyclophosphamide', dose: 600, unit: 'mg/m²' },
    { name: 'Etoposide', dose: 100, unit: 'mg/m²' },
    { name: 'Vincristine', dose: 1.4, unit: 'mg/m²' }
  ];

  useEffect(() => {
    if (patient.height && patient.weight) {
      const bsa = DoseCalculationService.calculateBSA(patient.height, patient.weight);
      setBsaCalculation(bsa);
    }
  }, [patient.height, patient.weight]);

  useEffect(() => {
    if (patient.dateOfBirth && patient.weight && patient.renalFunction.creatinine) {
      const age = calculateAge(patient.dateOfBirth);
      const crCl = DoseCalculationService.calculateCreatinineClearance(
        age, 
        patient.weight, 
        patient.renalFunction.creatinine, 
        patient.gender
      );
      setCreatinineCalculation(crCl);
    }
  }, [patient.dateOfBirth, patient.weight, patient.renalFunction.creatinine, patient.gender]);

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleCalculate = () => {
    if (!selectedDrug || !baselineDose || !patient.height || !patient.weight) {
      return;
    }

    const doseCalc = DoseCalculationService.calculateDose(patient, selectedDrug, baselineDose, doseUnit);
    setCalculation(doseCalc);
  };

  const handleDrugSelect = (drug: any) => {
    setSelectedDrug(drug.name);
    if (typeof drug.dose === 'number') {
      setBaselineDose(drug.dose);
    }
    setDoseUnit(drug.unit);
  };

  const handlePatientUpdate = (updates: Partial<Patient>) => {
    const updatedPatient = { ...patient, ...updates };
    setPatient(updatedPatient);
    onPatientChange?.(updatedPatient);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'major': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'minor': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced Dose Calculator</h1>
            <p className="text-gray-600">Precision dosing with clinical decision support</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200">
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200">
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patient Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Patient Information</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={patient.firstName}
                    onChange={(e) => handlePatientUpdate({ firstName: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={patient.lastName}
                    onChange={(e) => handlePatientUpdate({ lastName: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={patient.dateOfBirth}
                    onChange={(e) => handlePatientUpdate({ dateOfBirth: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={patient.gender}
                    onChange={(e) => handlePatientUpdate({ gender: e.target.value as 'male' | 'female' | 'other' })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={patient.height}
                    onChange={(e) => handlePatientUpdate({ height: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={patient.weight}
                    onChange={(e) => handlePatientUpdate({ weight: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                <input
                  type="text"
                  value={patient.diagnosis}
                  onChange={(e) => handlePatientUpdate({ diagnosis: e.target.value })}
                  placeholder="e.g., Non-small cell lung cancer"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Creatinine (mg/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={patient.renalFunction.creatinine}
                  onChange={(e) => handlePatientUpdate({ 
                    renalFunction: { 
                      ...patient.renalFunction, 
                      creatinine: parseFloat(e.target.value) || 0 
                    }
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          </Card>

          {/* Calculated Values */}
          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Calculated Values</h2>
            </div>
            
            <div className="space-y-4">
              {bsaCalculation && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">BSA (Mosteller)</span>
                    <span className="text-lg font-semibold text-blue-900">{bsaCalculation.bsa} m²</span>
                  </div>
                </div>
              )}

              {creatinineCalculation && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-900">CrCl (Cockcroft-Gault)</span>
                    <span className="text-lg font-semibold text-green-900">{creatinineCalculation.clearance} mL/min</span>
                  </div>
                </div>
              )}

              {patient.dateOfBirth && (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-900">Age</span>
                    <span className="text-lg font-semibold text-purple-900">{calculateAge(patient.dateOfBirth)} years</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Drug Selection and Calculation */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <Beaker className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Drug Selection & Dosing</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Drug</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {commonDrugs.map((drug) => (
                    <button
                      key={drug.name}
                      onClick={() => handleDrugSelect(drug)}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        selectedDrug === drug.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{drug.name}</div>
                      <div className="text-xs text-gray-500">
                        {typeof drug.dose === 'number' ? `${drug.dose} ${drug.unit}` : drug.dose}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Drug Name</label>
                  <input
                    type="text"
                    value={selectedDrug}
                    onChange={(e) => setSelectedDrug(e.target.value)}
                    placeholder="Enter drug name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Baseline Dose</label>
                  <input
                    type="number"
                    value={baselineDose}
                    onChange={(e) => setBaselineDose(parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={doseUnit}
                    onChange={(e) => setDoseUnit(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="mg/m²">mg/m²</option>
                    <option value="mg/kg">mg/kg</option>
                    <option value="mg">mg (flat dose)</option>
                    <option value="units/m²">units/m²</option>
                    <option value="mg (AUC)">mg (AUC-based)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleCalculate}
                disabled={!selectedDrug || !baselineDose}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Target className="w-5 h-5" />
                <span>Calculate Dose</span>
              </button>
            </div>
          </Card>

          {/* Calculation Results */}
          {calculation && (
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Dose Calculation Results</h2>
                <button className="ml-auto p-1 text-gray-400 hover:text-gray-600">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Main Calculation */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-900">
                      {calculation.calculatedDose} {calculation.unit.replace('/m²', '').replace('/kg', '')}
                    </div>
                    <div className="text-sm text-green-700">Calculated Dose</div>
                    <div className="text-xs text-green-600 mt-1">
                      {calculation.drug} - {calculation.baselinedose} {calculation.unit}
                    </div>
                  </div>
                </div>

                {/* Dose Adjustments */}
                {calculation.adjustments.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Dose Adjustments Applied</h3>
                    <div className="space-y-2">
                      {calculation.adjustments.map((adj, index) => (
                        <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-blue-900">{adj.reason}</span>
                            <span className="text-blue-900">×{adj.factor}</span>
                          </div>
                          <div className="text-sm text-blue-700 mt-1">{adj.description}</div>
                          <div className="text-xs text-blue-600 mt-1">Source: {adj.evidence}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clinical Alerts */}
                {calculation.warnings.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Clinical Alerts</h3>
                    <div className="space-y-2">
                      {calculation.warnings.map((warning, index) => (
                        <div key={index} className={`p-3 border rounded-lg ${getSeverityColor(warning.severity)}`}>
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium">{warning.title}</div>
                              <div className="text-sm mt-1">{warning.description}</div>
                              <div className="text-sm font-medium mt-2">
                                Recommendation: {warning.recommendation}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contraindications */}
                {calculation.contraindications.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Contraindications</h3>
                    <div className="space-y-2">
                      {calculation.contraindications.map((contraindication, index) => (
                        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="font-medium text-red-900">{contraindication}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Monitoring */}
                {calculation.monitoring.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Monitoring Recommendations</h3>
                    <div className="space-y-2">
                      {calculation.monitoring.map((monitor, index) => (
                        <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                            <div className="flex-1">
                              <div className="font-medium text-yellow-900">{monitor.parameter}</div>
                              <div className="text-sm text-yellow-700">
                                Frequency: {monitor.frequency}
                              </div>
                              <div className="text-sm text-yellow-700 mt-1">{monitor.description}</div>
                              {monitor.normalRange && (
                                <div className="text-xs text-yellow-600 mt-1">
                                  Normal: {monitor.normalRange}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedDoseCalculator;