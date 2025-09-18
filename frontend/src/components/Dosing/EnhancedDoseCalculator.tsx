import React, { useState, useEffect } from 'react';
import { usePatient } from '../../context/PatientContext';
import { Drug } from '../../types';
import { alertService, DoseCalculationAlert, DoseRecommendation } from '../../services/alertService';
import Card from '../UI/Card';
import Alert from '../UI/Alert';
import Tooltip from '../UI/Tooltip';
import LoadingSpinner from '../UI/LoadingSpinner';
import {
  Calculator,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Activity,
  Heart,
  Droplet,
  Eye,
  Brain,
  TestTube,
  Dna,
  Scale,
  Clock,
  Shield,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';

interface EnhancedDoseCalculatorProps {
  drug: Drug;
  standardDose?: number;
  unit?: string;
  indication?: string;
  onDoseCalculated?: (result: any) => void;
}

const EnhancedDoseCalculator: React.FC<EnhancedDoseCalculatorProps> = ({
  drug,
  standardDose = 0,
  unit = 'mg/m²',
  indication,
  onDoseCalculated
}) => {
  const { state } = usePatient();
  const { currentPatient } = state;
  
  const [inputDose, setInputDose] = useState(standardDose);
  const [inputUnit, setInputUnit] = useState(unit);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (currentPatient && inputDose > 0) {
      calculateDose();
    }
  }, [currentPatient, inputDose, inputUnit, drug]);

  const calculateDose = async () => {
    if (!currentPatient || inputDose <= 0) return;

    setIsCalculating(true);
    try {
      // Simulate async calculation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = alertService.calculateDoseWithAlerts(
        currentPatient,
        drug,
        inputDose,
        inputUnit,
        indication
      );

      const monitoringRecommendations = alertService.getMonitoringRecommendations(currentPatient, drug);

      setCalculationResult({
        ...result,
        monitoringRecommendations
      });

      if (onDoseCalculated) {
        onDoseCalculated(result);
      }
    } catch (error) {
      console.error('Dose calculation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'moderate':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cardiac':
        return <Heart className="w-4 h-4" />;
      case 'renal':
        return <Droplet className="w-4 h-4" />;
      case 'hepatic':
        return <Activity className="w-4 h-4" />;
      case 'hematologic':
        return <TestTube className="w-4 h-4" />;
      case 'genetic':
        return <Dna className="w-4 h-4" />;
      case 'weight':
      case 'bsa':
        return <Scale className="w-4 h-4" />;
      case 'age':
        return <Clock className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getSafetyScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    if (score >= 40) return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  if (!currentPatient) {
    return (
      <Card>
        <div className="text-center py-8">
          <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">No Patient Selected</p>
          <p className="text-sm text-gray-400">Select a patient to perform dose calculations</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Enhanced Dose Calculator</h3>
              <p className="text-sm text-gray-600">
                AI-powered dosing with safety alerts for {drug.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Tooltip content="Advanced clinical decision support with real-time safety monitoring">
              <Shield className="w-5 h-5 text-primary-600" />
            </Tooltip>
          </div>
        </div>

        {/* Dose Input */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Standard Dose
            </label>
            <input
              type="number"
              value={inputDose}
              onChange={(e) => setInputDose(Number(e.target.value))}
              step="0.1"
              min="0"
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              value={inputUnit}
              onChange={(e) => setInputUnit(e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="mg/m²">mg/m²</option>
              <option value="mg/kg">mg/kg</option>
              <option value="mg">mg (flat dose)</option>
              <option value="units/m²">units/m²</option>
              <option value="AUC">AUC (Carboplatin)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={calculateDose}
              disabled={isCalculating || inputDose <= 0}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCalculating ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  <span>Calculate Dose</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Card>

      {/* Calculation Results */}
      {calculationResult && (
        <div className="space-y-6">
          {/* Safety Score and Recommended Dose */}
          <Card>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Calculator className="w-5 h-5 text-gray-400" />
                  <h4 className="text-lg font-semibold text-gray-900">Recommended Dose</h4>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-bold text-primary-600">
                    {calculationResult.recommendedDose}
                  </div>
                  <div className="text-lg text-gray-600">{inputUnit}</div>
                  
                  {calculationResult.recommendedDose !== inputDose && (
                    <div className="flex items-center space-x-1">
                      {calculationResult.recommendedDose < inputDose ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-sm text-gray-600">
                        {Math.round(((calculationResult.recommendedDose - inputDose) / inputDose) * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {calculationResult.adjustments.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">Adjustments applied:</span>
                    <ul className="mt-1 space-y-1">
                      {calculationResult.adjustments.map((adj: DoseRecommendation, index: number) => (
                        <li key={index}>• {adj.adjustmentReason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <h4 className="text-lg font-semibold text-gray-900">Safety Score</h4>
                  <Tooltip content="Overall safety assessment based on patient factors, drug interactions, and clinical alerts">
                    <Info className="w-4 h-4 text-gray-400" />
                  </Tooltip>
                </div>
                
                <div className="flex items-center space-x-4">
                  {getSafetyScoreIcon(calculationResult.safetyScore)}
                  <div className={`text-3xl font-bold ${getSafetyScoreColor(calculationResult.safetyScore).split(' ')[0]}`}>
                    {calculationResult.safetyScore}
                  </div>
                  <div className="text-lg text-gray-600">/100</div>
                </div>

                <div className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSafetyScoreColor(calculationResult.safetyScore)}`}>
                  {calculationResult.safetyScore >= 80 ? 'Safe to administer' :
                   calculationResult.safetyScore >= 60 ? 'Caution recommended' :
                   calculationResult.safetyScore >= 40 ? 'High risk - close monitoring' :
                   'Critical risk - consider alternatives'}
                </div>
              </div>
            </div>
          </Card>

          {/* Clinical Alerts */}
          {calculationResult.alerts.length > 0 && (
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h4 className="text-lg font-semibold text-gray-900">
                  Clinical Alerts ({calculationResult.alerts.length})
                </h4>
              </div>

              <div className="space-y-3">
                {calculationResult.alerts.map((alert: DoseCalculationAlert) => (
                  <div
                    key={alert.id}
                    className={`border-l-4 p-4 rounded-lg ${
                      alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                      alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                      alert.severity === 'moderate' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(alert.severity)}
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="font-medium text-gray-900">{alert.message}</h5>
                          {getCategoryIcon(alert.category)}
                          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">
                            {alert.category}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">{alert.details}</p>
                        
                        <div className="bg-white bg-opacity-70 rounded p-2">
                          <span className="text-xs font-medium text-gray-600">Recommended Action:</span>
                          <p className="text-sm text-gray-800 mt-1">{alert.recommendedAction}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">Source: {alert.source}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            alert.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            Priority: {alert.priority}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Monitoring Recommendations */}
          {calculationResult.monitoringRecommendations.length > 0 && (
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <Eye className="w-5 h-5 text-blue-500" />
                <h4 className="text-lg font-semibold text-gray-900">Monitoring Recommendations</h4>
                <Tooltip content="Required monitoring parameters based on drug toxicity profile and patient risk factors">
                  <Info className="w-4 h-4 text-gray-400" />
                </Tooltip>
              </div>

              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parameter</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rationale</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Urgency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {calculationResult.monitoringRecommendations.map((rec: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{rec.parameter}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{rec.frequency}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{rec.rationale}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            rec.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                            rec.urgency === 'urgent' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {rec.urgency}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Advanced Details */}
          <Card>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-gray-400" />
                <h4 className="text-lg font-semibold text-gray-900">Advanced Calculations</h4>
              </div>
              <div className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4">
                {calculationResult.adjustments.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Dose Adjustments Applied:</h5>
                    <div className="space-y-2">
                      {calculationResult.adjustments.map((adj: DoseRecommendation, index: number) => (
                        <div key={index} className="bg-gray-50 rounded p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900">{adj.adjustmentReason}</span>
                            <span className={`text-sm px-2 py-1 rounded ${
                              adj.confidence === 'high' ? 'bg-green-100 text-green-800' :
                              adj.confidence === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {adj.confidence} confidence
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {adj.originalDose} → {adj.recommendedDose} {adj.unit} 
                            (×{adj.adjustmentFactor.toFixed(2)})
                          </div>
                          {adj.references.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              References: {adj.references.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Patient Factors Considered:</h5>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Age:</span>
                      <span className="ml-2 font-medium">
                        {Math.floor((new Date().getTime() - new Date(currentPatient.demographics.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
                      </span>
                    </div>
                    {currentPatient.demographics.weightKg && (
                      <div>
                        <span className="text-gray-600">Weight:</span>
                        <span className="ml-2 font-medium">{currentPatient.demographics.weightKg} kg</span>
                      </div>
                    )}
                    {currentPatient.demographics.heightCm && (
                      <div>
                        <span className="text-gray-600">Height:</span>
                        <span className="ml-2 font-medium">{currentPatient.demographics.heightCm} cm</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Allergies:</span>
                      <span className="ml-2 font-medium">{currentPatient.allergies.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Active Medications:</span>
                      <span className="ml-2 font-medium">{currentPatient.medications.filter(m => m.isActive).length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Genetic Variants:</span>
                      <span className="ml-2 font-medium">{currentPatient.genetics.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* No calculation performed yet */}
      {!calculationResult && !isCalculating && (
        <Card>
          <div className="text-center py-12">
            <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">Enter dose and calculate</p>
            <p className="text-sm text-gray-400">
              Advanced dose calculation with safety alerts will appear here
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EnhancedDoseCalculator;
