import React, { useState } from 'react';
import { usePatient } from '../../context/PatientContext';
import Card from '../UI/Card';
import Tooltip from '../UI/Tooltip';
import Alert from '../UI/Alert';
import { 
  Download, 
  Share2, 
  FileText, 
  Mail, 
  Printer,
  Copy,
  CheckCircle,
  Calendar,
  User,
  Shield,
  Info,
  Settings
} from 'lucide-react';

interface DataExporterProps {
  patientId?: string;
}

const DataExporter: React.FC<DataExporterProps> = ({ patientId }) => {
  const { state } = usePatient();
  const { currentPatient } = state;
  const [selectedSections, setSelectedSections] = useState({
    demographics: true,
    medications: true,
    allergies: true,
    conditions: true,
    vitals: true,
    labValues: true,
    genetics: false,
    treatmentHistory: true,
    notes: false
  });
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf' | 'summary'>('summary');
  const [shareMethod, setShareMethod] = useState<'download' | 'email' | 'print' | 'copy'>('download');
  const [emailAddress, setEmailAddress] = useState('');
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!currentPatient) {
    return (
      <Card>
        <div className="text-center py-8">
          <Download className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">No Patient Selected</h3>
          <p className="text-gray-400">Select a patient to export their data</p>
        </div>
      </Card>
    );
  }

  const generateExportData = () => {
    const exportData: any = {
      patientInfo: {
        id: currentPatient.id,
        name: `${currentPatient.demographics.firstName} ${currentPatient.demographics.lastName}`,
        mrn: currentPatient.demographics.mrn,
        exportDate: new Date().toISOString(),
        exportedBy: 'current-user' // TODO: Get from auth context
      }
    };

    if (selectedSections.demographics) {
      exportData.demographics = currentPatient.demographics;
    }

    if (selectedSections.medications) {
      exportData.medications = currentPatient.medications;
    }

    if (selectedSections.allergies) {
      exportData.allergies = currentPatient.allergies;
    }

    if (selectedSections.conditions) {
      exportData.conditions = currentPatient.conditions;
    }

    if (selectedSections.vitals) {
      exportData.vitals = currentPatient.vitals;
    }

    if (selectedSections.labValues) {
      exportData.labValues = currentPatient.labValues;
    }

    if (selectedSections.genetics) {
      exportData.genetics = currentPatient.genetics;
    }

    if (selectedSections.treatmentHistory) {
      exportData.treatmentHistory = currentPatient.treatmentHistory;
    }

    if (selectedSections.notes) {
      exportData.notes = currentPatient.notes;
    }

    return exportData;
  };

  const generateSummaryReport = () => {
    const data = generateExportData();
    const timestamp = includeTimestamp ? new Date().toLocaleString() : '';

    return `
PATIENT SUMMARY REPORT
${timestamp ? `Generated: ${timestamp}` : ''}
${'-'.repeat(50)}

PATIENT INFORMATION
Name: ${data.patientInfo.name}
MRN: ${data.patientInfo.mrn || 'Not specified'}
Date of Birth: ${data.demographics?.dateOfBirth || 'Not specified'}
Sex: ${data.demographics?.sex || 'Not specified'}
${data.demographics?.heightCm ? `Height: ${data.demographics.heightCm} cm` : ''}
${data.demographics?.weightKg ? `Weight: ${data.demographics.weightKg} kg` : ''}

${data.allergies?.length > 0 ? `
ALLERGIES
${data.allergies.map((allergy: any) => 
  `• ${allergy.allergen} (${allergy.severity}) - ${allergy.reaction}`
).join('\n')}
` : ''}

${data.conditions?.length > 0 ? `
MEDICAL CONDITIONS
${data.conditions.map((condition: any) => 
  `• ${condition.name} (${condition.status}) - Diagnosed: ${new Date(condition.dateOfDiagnosis).toLocaleDateString()}`
).join('\n')}
` : ''}

${data.medications?.length > 0 ? `
CURRENT MEDICATIONS
${data.medications.filter((med: any) => med.isActive).map((med: any) => 
  `• ${med.drugName} ${med.dosage} ${med.frequency} (${med.route})`
).join('\n')}
` : ''}

${data.treatmentHistory?.length > 0 ? `
TREATMENT HISTORY
${data.treatmentHistory.map((treatment: any) => 
  `• ${treatment.treatmentType}${treatment.regimen ? ` - ${treatment.regimen}` : ''} (${new Date(treatment.startDate).toLocaleDateString()}${treatment.endDate ? ` to ${new Date(treatment.endDate).toLocaleDateString()}` : ' - ongoing'})`
).join('\n')}
` : ''}

${data.vitals?.length > 0 ? `
RECENT VITALS (${new Date(data.vitals[data.vitals.length - 1].timestamp).toLocaleDateString()})
${data.vitals[data.vitals.length - 1].bloodPressureSystolic ? `Blood Pressure: ${data.vitals[data.vitals.length - 1].bloodPressureSystolic}/${data.vitals[data.vitals.length - 1].bloodPressureDiastolic} mmHg` : ''}
${data.vitals[data.vitals.length - 1].heartRate ? `Heart Rate: ${data.vitals[data.vitals.length - 1].heartRate} bpm` : ''}
${data.vitals[data.vitals.length - 1].temperature ? `Temperature: ${data.vitals[data.vitals.length - 1].temperature}°C` : ''}
${data.vitals[data.vitals.length - 1].performanceStatus !== undefined ? `ECOG Performance Status: ${data.vitals[data.vitals.length - 1].performanceStatus}` : ''}
` : ''}

${data.labValues?.length > 0 ? `
RECENT LAB VALUES
${data.labValues.slice(-5).map((lab: any) => 
  `• ${lab.labType}: ${lab.value} ${lab.unit} (${new Date(lab.timestamp).toLocaleDateString()})${lab.isAbnormal ? ' [ABNORMAL]' : ''}`
).join('\n')}
` : ''}

${data.genetics?.length > 0 ? `
GENETIC INFORMATION
${data.genetics.map((genetic: any) => 
  `• ${genetic.geneSymbol}: ${genetic.phenotype}${genetic.metabolizerStatus ? ` (${genetic.metabolizerStatus} metabolizer)` : ''}`
).join('\n')}
` : ''}

${'-'.repeat(50)}
This report was generated by OncoSafeRx
CONFIDENTIAL MEDICAL INFORMATION
    `.trim();
  };

  const convertToCSV = (data: any) => {
    // Simple CSV conversion for medications (most commonly exported)
    if (data.medications) {
      const headers = ['Drug Name', 'Dosage', 'Frequency', 'Route', 'Start Date', 'Status'];
      const rows = data.medications.map((med: any) => [
        med.drugName || '',
        med.dosage || '',
        med.frequency || '',
        med.route || '',
        med.startDate || '',
        med.isActive ? 'Active' : 'Inactive'
      ]);
      
      return [headers, ...rows].map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');
    }
    
    return 'No data selected for CSV export';
  };

  const handleExport = async () => {
    const data = generateExportData();
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (exportFormat) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        filename = `patient-${currentPatient.demographics.firstName}-${currentPatient.demographics.lastName}-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        content = convertToCSV(data);
        filename = `patient-medications-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
      case 'summary':
        content = generateSummaryReport();
        filename = `patient-summary-${Date.now()}.txt`;
        mimeType = 'text/plain';
        break;
      default:
        return;
    }

    switch (shareMethod) {
      case 'download':
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        break;

      case 'copy':
        try {
          await navigator.clipboard.writeText(content);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          alert('Failed to copy to clipboard');
        }
        break;

      case 'print':
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Patient Report - ${currentPatient.demographics.firstName} ${currentPatient.demographics.lastName}</title>
                <style>
                  body { font-family: monospace; white-space: pre-wrap; padding: 20px; }
                  @media print { body { margin: 0; } }
                </style>
              </head>
              <body>${content}</body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
        break;

      case 'email':
        if (!emailAddress) {
          alert('Please enter an email address');
          return;
        }
        // In a real app, this would send via backend API
        const subject = encodeURIComponent(`Patient Report - ${currentPatient.demographics.firstName} ${currentPatient.demographics.lastName}`);
        const body = encodeURIComponent(content);
        window.open(`mailto:${emailAddress}?subject=${subject}&body=${body}`);
        break;
    }
  };

  const toggleSection = (section: keyof typeof selectedSections) => {
    setSelectedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const selectAll = () => {
    const allSelected = Object.values(selectedSections).every(Boolean);
    const newState = Object.keys(selectedSections).reduce((acc, key) => ({
      ...acc,
      [key]: !allSelected
    }), {});
    setSelectedSections(newState as typeof selectedSections);
  };

  const getDataSize = () => {
    const data = generateExportData();
    const jsonString = JSON.stringify(data);
    const sizeInBytes = new Blob([jsonString]).size;
    
    if (sizeInBytes < 1024) return `${sizeInBytes} bytes`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getSectionCount = (section: keyof typeof selectedSections) => {
    if (!currentPatient) return 0;
    
    switch (section) {
      case 'medications': return currentPatient.medications?.length || 0;
      case 'allergies': return currentPatient.allergies?.length || 0;
      case 'conditions': return currentPatient.conditions?.length || 0;
      case 'vitals': return currentPatient.vitals?.length || 0;
      case 'labValues': return currentPatient.labValues?.length || 0;
      case 'genetics': return currentPatient.genetics?.length || 0;
      case 'treatmentHistory': return currentPatient.treatmentHistory?.length || 0;
      case 'notes': return currentPatient.notes?.length || 0;
      case 'demographics': return 1;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Download className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Data Export & Sharing</h2>
              <p className="text-sm text-gray-600">
                Export {currentPatient.demographics.firstName} {currentPatient.demographics.lastName}'s data for reporting, backup, or sharing
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Export size: {getDataSize()}
          </div>
        </div>
      </Card>

      {/* Privacy Notice */}
      <Alert type="warning" title="Privacy & Security Notice">
        <div className="text-sm">
          <p className="mb-2">
            Patient data contains sensitive health information. Please ensure compliance with HIPAA and institutional policies when sharing or exporting data.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Only share data with authorized healthcare providers</li>
            <li>Use secure channels for transmission</li>
            <li>Remove or de-identify data when possible</li>
            <li>Delete exported files after use</li>
          </ul>
        </div>
      </Alert>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Data Selection */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Select Data to Export</h3>
            </div>
            <button
              onClick={selectAll}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {Object.values(selectedSections).every(Boolean) ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(selectedSections).map(([section, selected]) => (
              <label key={section} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleSection(section as keyof typeof selectedSections)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900 capitalize">
                      {section.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="text-sm text-gray-600">
                      {getSectionCount(section as keyof typeof selectedSections)} item{getSectionCount(section as keyof typeof selectedSections) !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                {section === 'genetics' && (
                  <Tooltip content="Genetic data requires special handling and may have additional privacy considerations">
                    <Shield className="w-4 h-4 text-yellow-500" />
                  </Tooltip>
                )}
              </label>
            ))}
          </div>
        </Card>

        {/* Export Options */}
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <Share2 className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Export Options</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'summary', label: 'Summary Report', icon: FileText },
                  { value: 'json', label: 'JSON Data', icon: Download },
                  { value: 'csv', label: 'CSV (Medications)', icon: Download },
                  { value: 'pdf', label: 'PDF Report', icon: FileText, disabled: true }
                ].map(({ value, label, icon: Icon, disabled }) => (
                  <button
                    key={value}
                    onClick={() => !disabled && setExportFormat(value as any)}
                    disabled={disabled}
                    className={`flex items-center space-x-2 p-3 border rounded-lg text-left transition-colors ${
                      exportFormat === value && !disabled
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : disabled
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{label}</span>
                    {disabled && <span className="text-xs">(Coming Soon)</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sharing Method</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'download', label: 'Download File', icon: Download },
                  { value: 'copy', label: 'Copy to Clipboard', icon: Copy },
                  { value: 'print', label: 'Print Report', icon: Printer },
                  { value: 'email', label: 'Email Report', icon: Mail }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setShareMethod(value as any)}
                    className={`flex items-center space-x-2 p-3 border rounded-lg text-left transition-colors ${
                      shareMethod === value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {shareMethod === 'email' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="recipient@hospital.org"
                />
              </div>
            )}

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeTimestamp}
                  onChange={(e) => setIncludeTimestamp(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Include timestamp in export</span>
              </label>
            </div>
          </div>
        </Card>
      </div>

      {/* Export Action */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ready to Export</h3>
            <p className="text-sm text-gray-600">
              {Object.values(selectedSections).filter(Boolean).length} section{Object.values(selectedSections).filter(Boolean).length !== 1 ? 's' : ''} selected • {exportFormat.toUpperCase()} format • {shareMethod} method
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={!Object.values(selectedSections).some(Boolean)}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : shareMethod === 'copy' ? 'Copy Data' : shareMethod === 'email' ? 'Send Email' : shareMethod === 'print' ? 'Print Report' : 'Download'}</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default DataExporter;