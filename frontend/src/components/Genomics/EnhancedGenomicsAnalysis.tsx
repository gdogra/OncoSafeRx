import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  Download, 
  FileText, 
  Dna, 
  Target, 
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Activity
} from 'lucide-react';
import { 
  NGSReport, 
  GenomicAnalysisResult, 
  GenomicVariant, 
  TreatmentOption, 
  ClinicalTrial,
  BiomarkerPanel 
} from '../../types/genomics';
import { Patient } from '../../types/clinical';
import { GenomicAnalysisService } from '../../services/genomicAnalysisService';
import { patientService } from '../../services/patientService';
import { useAuth } from '../../context/AuthContext';

interface TabInfo {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}

const EnhancedGenomicsAnalysis: React.FC = () => {
  const { state: auth } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [ngsReports, setNgsReports] = useState<NGSReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<NGSReport | null>(null);
  const [analysisResults, setAnalysisResults] = useState<GenomicAnalysisResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [biomarkerPanels] = useState<BiomarkerPanel[]>(
    GenomicAnalysisService.getBiomarkerPanels()
  );

  // Panel/Versions drawer state
  const [showMetaDrawer, setShowMetaDrawer] = useState(false);
  const [panelInfo, setPanelInfo] = useState<any | null>(null);
  const [versionsInfo, setVersionsInfo] = useState<any | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(false);

  const openMetaDrawer = async () => {
    setShowMetaDrawer(true);
    if (panelInfo && versionsInfo) return;
    setLoadingMeta(true);
    try {
      const [p, v] = await Promise.all([
        fetch('/api/genomics/panel').then(r => r.json()),
        fetch('/api/genomics/versions').then(r => r.json())
      ]);
      setPanelInfo(p);
      setVersionsInfo(v);
    } catch (e) {
      console.error('Failed to load panel/versions', e);
    } finally {
      setLoadingMeta(false);
    }
  };

  const gotoPgxReport = async (rxcui: string) => {
    setReportRxcui(rxcui);
    setActiveTab('pgx-report');
    // allow state to update before fetching
    setTimeout(() => fetchPgxReport(), 0);
  };

  const downloadPanelCsv = async () => {
    try {
      const res = await fetch('/api/genomics/panel.csv');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pgx_panel.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download panel CSV', e);
    }
  };

  const downloadVersionsCsv = async () => {
    try {
      const res = await fetch('/api/genomics/versions.csv');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pgx_versions.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download versions CSV', e);
    }
  };

  const downloadBundleJson = async () => {
    try {
      const res = await fetch('/api/genomics/panel.bundle');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pgx_panel_bundle.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download bundle JSON', e);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
    } catch (e) {
      console.error('Failed to copy text', e);
    }
  };

  const copyCurlPanelCsv = () => {
    const origin = window.location.origin;
    copyToClipboard(`curl -sSL ${origin}/api/genomics/panel.csv -o pgx_panel.csv`);
  };

  const copyCurlVersionsCsv = () => {
    const origin = window.location.origin;
    copyToClipboard(`curl -sSL ${origin}/api/genomics/versions.csv -o pgx_versions.csv`);
  };

  const copyCurlBundleJson = () => {
    const origin = window.location.origin;
    copyToClipboard(`curl -sSL ${origin}/api/genomics/panel.bundle -o pgx_panel_bundle.json`);
  };

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const loadedPatients = await patientService.getPatients();
        setPatients(loadedPatients);
        // If the current user is a patient, auto-select their record and skip manual selection
        if (auth.user?.role === 'patient' && loadedPatients.length > 0) {
          setSelectedPatient(loadedPatients[0]);
        }
      } catch (error) {
        console.error('Failed to load patients:', error);
        setPatients([]);
      }
    };
    
    loadPatients();
    // Re-evaluate if auth role changes
  }, [auth.user?.role]);

  const tabs: TabInfo[] = [
    {
      id: 'upload',
      label: 'NGS Upload',
      icon: Upload,
      description: 'Upload and process NGS reports'
    },
    {
      id: 'analysis',
      label: 'Genomic Analysis',
      icon: Dna,
      description: 'Comprehensive genomic interpretation'
    },
    {
      id: 'treatments',
      label: 'Targeted Therapy',
      icon: Target,
      description: 'Treatment recommendations'
    },
    {
      id: 'trials',
      label: 'Clinical Trials',
      icon: Users,
      description: 'Matching clinical trials'
    },
    {
      id: 'biomarkers',
      label: 'Biomarker Panels',
      icon: Activity,
      description: 'Available testing panels'
    },
    {
      id: 'hereditary',
      label: 'Hereditary Risk',
      icon: AlertTriangle,
      description: 'Germline risk assessment'
    },
    {
      id: 'pgx-report',
      label: 'PGx Report',
      icon: FileText,
      description: 'Dynamic gene–drug report'
    },
    {
      id: 'pgx-roi',
      label: 'PGx ROI',
      icon: TrendingUp,
      description: 'Program ROI calculator'
    }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedPatient) return;

    setUploading(true);
    try {
      const report = await GenomicAnalysisService.processNGSReport(file, selectedPatient.id);
      setNgsReports(prev => [...prev, report]);
      setSelectedReport(report);
      setActiveTab('analysis');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedPatient || !selectedReport) return;

    setAnalyzing(true);
    try {
      const results = await GenomicAnalysisService.analyzeGenomicProfile(
        selectedPatient,
        selectedReport
      );
      setAnalysisResults(results);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  // PGx Dynamic Report state
  const [reportRxcui, setReportRxcui] = useState<string>('11289');
  const [pgxReport, setPgxReport] = useState<any | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const fetchPgxReport = async () => {
    if (!reportRxcui) return;
    setLoadingReport(true);
    try {
      const res = await fetch(`/api/genomics/report/${encodeURIComponent(reportRxcui)}`);
      const data = await res.json();
      setPgxReport(data);
    } catch (e) {
      console.error('Failed to load PGx report', e);
    } finally {
      setLoadingReport(false);
    }
  };

  const copyCurlPgxReport = () => {
    if (!reportRxcui) return;
    const origin = window.location.origin;
    const cmd = `curl -sSL ${origin}/api/genomics/report/${encodeURIComponent(reportRxcui)}`;
    copyToClipboard(cmd);
  };

  // PGx ROI state
  const [roiInputs, setRoiInputs] = useState({
    annualADECost: 10000000,
    testCost: 300,
    targetPopulation: 5000,
    expectedTestingRate: 0.4,
    expectedADEreductionPct: 0.25,
  });
  const [roiResult, setRoiResult] = useState<any | null>(null);
  const [loadingRoi, setLoadingRoi] = useState(false);

  const calculateRoi = async () => {
    setLoadingRoi(true);
    try {
      const res = await fetch('/api/roi/pgx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roiInputs)
      });
      const data = await res.json();
      setRoiResult(data);
    } catch (e) {
      console.error('Failed to calculate ROI', e);
    } finally {
      setLoadingRoi(false);
    }
  };

  const renderUploadTab = () => (
    <div className="space-y-6">
      {/* Patient Selection (hidden for patient users) */}
      {auth.user?.role !== 'patient' ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Patient</h3>
          <select
            value={selectedPatient?.id || ''}
            onChange={(e) => {
              const patient = patients.find(p => p.id === e.target.value);
              setSelectedPatient(patient || null);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a patient...</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.firstName} {patient.lastName} - {patient.mrn}
              </option>
            ))}
          </select>
        </div>
      ) : selectedPatient ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Profile</h3>
          <p className="text-gray-700">
            {selectedPatient.firstName} {selectedPatient.lastName}
            {selectedPatient.mrn ? ` • MRN ${selectedPatient.mrn}` : ''}
          </p>
        </div>
      ) : (
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">We couldn’t find your record yet</h3>
          <p className="text-yellow-800 mb-4">
            To analyze your genomics, please create your health profile first.
          </p>
          <Link
            to="/my-profile"
            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Create My Profile
          </Link>
        </div>
      )}

      {/* File Upload */}
      {selectedPatient && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload NGS Report</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop your NGS report here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports VCF, JSON, and proprietary formats
            </p>
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".vcf,.json,.txt,.csv"
              className="hidden"
              id="ngs-upload"
              disabled={uploading}
            />
            <label
              htmlFor="ngs-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </>
              )}
            </label>
          </div>
        </div>
      )}

      {/* Recent Reports */}
      {ngsReports.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
          <div className="space-y-3">
            {ngsReports.map(report => (
              <div
                key={report.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedReport(report);
                  setActiveTab('analysis');
                }}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {report.testType} - {report.platform}
                    </p>
                    <p className="text-sm text-gray-500">
                      {report.reportDate} • {report.laboratoryName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {report.variants.length} variants
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalysisTab = () => {
    if (!selectedReport) {
      return (
        <div className="text-center py-12">
          <Dna className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Report Selected</h3>
          <p className="text-gray-500">Upload an NGS report to begin analysis</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Report Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Report Summary</h3>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Dna className="w-4 h-4 mr-2" />
                  Run Analysis
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Dna className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">Variants</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {selectedReport.variants.length}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-900">TMB</span>
              </div>
              <p className="text-2xl font-bold text-green-900 mt-2">
                {selectedReport.tumorMutationalBurden}
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-900">MSI Status</span>
              </div>
              <p className="text-lg font-bold text-purple-900 mt-2">
                {selectedReport.microsatelliteStatus}
              </p>
            </div>
          </div>
        </div>

        {/* Variants Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detected Variants</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gene
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Significance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    VAF
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedReport.variants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {variant.gene}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {variant.variant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {variant.variantType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        variant.clinicalSignificance === 'pathogenic' 
                          ? 'bg-red-100 text-red-800'
                          : variant.clinicalSignificance === 'likely_pathogenic'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {variant.clinicalSignificance}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(variant.alleleFrequency * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analysis Results */}
        {analysisResults && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h3>
            
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Executive Summary</h4>
              <p className="text-gray-700">{analysisResults.executiveSummary}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Key Recommendations</h4>
              <ul className="space-y-2">
                {analysisResults.keyRecommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTreatmentsTab = () => {
    if (!analysisResults?.treatmentOptions.length) {
      return (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Treatment Options</h3>
          <p className="text-gray-500">Complete genomic analysis to see treatment recommendations</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {analysisResults.treatmentOptions.map((treatment, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{treatment.drug}</h3>
                <p className="text-sm text-gray-600">{treatment.drugClass}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  treatment.fdaApproval === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : treatment.fdaApproval === 'investigational'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {treatment.fdaApproval.replace('_', ' ')}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  treatment.evidenceLevel === 'high'
                    ? 'bg-green-100 text-green-800'
                    : treatment.evidenceLevel === 'moderate'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {treatment.evidenceLevel} evidence
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Mechanism of Action</h4>
                <p className="text-gray-700">{treatment.mechanism}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Supporting Variants</h4>
                <div className="flex flex-wrap gap-2">
                  {treatment.supportingVariants.map((variant, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                      {variant}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Expected Response</h4>
                <p className="text-gray-700">{treatment.expectedResponse}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTrialsTab = () => {
    if (!analysisResults?.clinicalTrials.length) {
      return (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Matching Trials</h3>
          <p className="text-gray-500">Complete genomic analysis to find matching clinical trials</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {analysisResults.clinicalTrials.map((trial, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{trial.title}</h3>
                <p className="text-sm text-gray-600">NCT ID: {trial.nctId}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  Phase {trial.phase}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  trial.status === 'recruiting'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {trial.status}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Primary Endpoint</h4>
                <p className="text-gray-700">{trial.primaryEndpoint}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Match Score</h4>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${trial.matchScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {trial.matchScore}%
                  </span>
                </div>
              </div>

              {trial.matchReasons && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Match Reasons</h4>
                  <ul className="space-y-1">
                    {trial.matchReasons.map((reason, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Locations</h4>
                <div className="space-y-2">
                  {trial.locations.slice(0, 3).map((location, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">
                        {location.facility}, {location.city}, {location.state}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        location.status === 'recruiting'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {location.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBiomarkersTab = () => (
    <div className="space-y-6">
      {biomarkerPanels.map((panel, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{panel.name}</h3>
              <p className="text-sm text-gray-600">{panel.methodology}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Turnaround</p>
              <p className="font-semibold text-gray-900">{panel.turnaroundTime} days</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Cancer Types</h4>
              <div className="flex flex-wrap gap-2">
                {panel.cancerTypes.map((type, i) => (
                  <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Key Biomarkers</h4>
              <div className="space-y-2">
                {panel.biomarkers.slice(0, 5).map((biomarker, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{biomarker.name}</span>
                    <span className="text-gray-500">{biomarker.methodology}</span>
                  </div>
                ))}
              </div>
            </div>

            {panel.cost && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="font-medium text-gray-900">Estimated Cost</span>
                <span className="text-lg font-semibold text-gray-900">${panel.cost}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderHereditaryTab = () => {
    if (!analysisResults?.hereditaryRisks.length) {
      return (
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Hereditary Risks</h3>
          <p className="text-gray-500">Complete genomic analysis to assess hereditary cancer risks</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {analysisResults.hereditaryRisks.map((risk, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{risk.syndrome}</h3>
                <p className="text-sm text-gray-600">{risk.gene} - {risk.variant}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Penetrance</p>
                <p className="text-lg font-semibold text-gray-900">
                  {(risk.penetrance * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                <ul className="space-y-2">
                  {risk.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {risk.familyScreening && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Family Screening Recommended</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Consider genetic counseling and testing for family members
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPgxReportTab = () => (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Drug RXCUI</label>
          <input
            value={reportRxcui}
            onChange={(e) => setReportRxcui(e.target.value)}
            placeholder="e.g., 11289 (warfarin)"
            className="border border-gray-300 rounded px-3 py-2 w-64"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchPgxReport}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loadingReport}
          >
            {loadingReport ? 'Loading…' : 'Load Report'}
          </button>
          <button
            onClick={copyCurlPgxReport}
            className="px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
            title="Copy cURL"
          >
            Copy cURL
          </button>
        </div>
      </div>

      {pgxReport && (
        <div className="bg-white border border-gray-200 rounded p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">PGx Report</h3>
              <p className="text-sm text-gray-600">Version {pgxReport.version} • {pgxReport.count} recommendations</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              Last updated: {pgxReport.lastUpdated}
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {(pgxReport.recommendations || []).map((rec: any, idx: number) => (
              <div key={idx} className="py-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900">{rec.gene}</div>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">Level {rec.evidenceLevel}</span>
                </div>
                <div className="text-sm text-gray-700">Phenotype: {rec.phenotype}</div>
                <div className="text-sm text-gray-700">Recommendation: {rec.recommendation}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPgxRoiTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(
          [
            { key: 'annualADECost', label: 'Annual ADE Cost ($)' },
            { key: 'testCost', label: 'Test Cost ($)' },
            { key: 'targetPopulation', label: 'Target Population' },
            { key: 'expectedTestingRate', label: 'Testing Rate (0-1)' },
            { key: 'expectedADEreductionPct', label: 'ADE Reduction Among Tested (0-1)' }
          ] as const
        ).map((f) => (
          <div key={f.key}>
            <label className="block text-sm text-gray-600 mb-1">{f.label}</label>
            <input
              type="number"
              step="any"
              value={(roiInputs as any)[f.key]}
              onChange={(e) => setRoiInputs((s) => ({ ...s, [f.key]: Number(e.target.value) }))}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
        ))}
      </div>
      <button
        onClick={calculateRoi}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={loadingRoi}
      >
        {loadingRoi ? 'Calculating…' : 'Calculate ROI'}
      </button>

      {roiResult && (
        <div className="bg-white border border-gray-200 rounded p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">ROI Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Tests</div>
              <div className="text-gray-900 font-medium">{roiResult.outputs.tests}</div>
            </div>
            <div>
              <div className="text-gray-500">Program Cost</div>
              <div className="text-gray-900 font-medium">${roiResult.outputs.programCost.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-500">Savings</div>
              <div className="text-gray-900 font-medium">${roiResult.outputs.savings.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-500">Net</div>
              <div className={`font-medium ${roiResult.outputs.net >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                ${roiResult.outputs.net.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-500">ROI</div>
              <div className="text-gray-900 font-medium">{roiResult.outputs.roi !== null ? (roiResult.outputs.roi * 100).toFixed(1) + '%' : '—'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Genomics Analysis</h1>
          <p className="text-gray-600">
            Comprehensive NGS report processing and genomic analysis platform
          </p>
        </div>
        <div className="pt-1">
          <button
            onClick={openMetaDrawer}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded"
          >
            Panel & Versions
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-5 h-5 mr-2 ${
                activeTab === id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              <div className="text-left">
                <div>{label}</div>
                <div className="text-xs text-gray-400">{description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'upload' && renderUploadTab()}
        {activeTab === 'analysis' && renderAnalysisTab()}
        {activeTab === 'treatments' && renderTreatmentsTab()}
        {activeTab === 'trials' && renderTrialsTab()}
        {activeTab === 'biomarkers' && renderBiomarkersTab()}
        {activeTab === 'hereditary' && renderHereditaryTab()}
        {activeTab === 'pgx-report' && renderPgxReportTab()}
        {activeTab === 'pgx-roi' && renderPgxRoiTab()}
      </div>

      {/* Panel/Versions Drawer */}
      {showMetaDrawer && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowMetaDrawer(false)}
          />
          <aside className="fixed top-0 right-0 h-full w-full sm:w-[28rem] bg-white shadow-xl z-50 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">PGx Panel & Versions</h2>
                <p className="text-xs text-gray-500">Evidence-driven, multi-specialty panel overview</p>
              </div>
              <button
                onClick={() => setShowMetaDrawer(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              {loadingMeta && (
                <div className="text-sm text-gray-500">Loading…</div>
              )}

              {!loadingMeta && panelInfo && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Panel</h3>
                  <div className="text-xs text-gray-500 mb-2">Version {panelInfo.version}</div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-1">Genes</div>
                      <div className="flex flex-wrap gap-2">
                        {(panelInfo.genes || []).map((g: any, i: number) => (
                          <span key={i} className={`px-2 py-1 rounded text-xs border ${g.implemented ? 'bg-green-50 text-green-800 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                            {g.symbol}{g.implemented ? '' : ' (planned)'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-1">HLA Alleles</div>
                      <div className="flex flex-wrap gap-2">
                        {(panelInfo.hla || []).map((h: any, i: number) => (
                          <span key={i} className={`px-2 py-1 rounded text-xs border ${h.implemented ? 'bg-green-50 text-green-800 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                            {h.symbol}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!loadingMeta && versionsInfo && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Version Log</h3>
                  <div className="text-xs text-gray-500 mb-2">Current {versionsInfo.currentVersion}</div>
                  <div className="space-y-3">
                    {(versionsInfo.changes || []).map((chg: any, i: number) => (
                      <div key={i} className="border border-gray-200 rounded p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">{chg.version}</div>
                          <div className="text-xs text-gray-500">{chg.date}</div>
                        </div>
                        <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
                          {(chg.notes || []).map((n: string, j: number) => (
                            <li key={j}>{n}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Actions</h3>
                <div className="flex flex-wrap items-end gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Open PGx Report by RXCUI</label>
                    <div className="flex gap-2">
                      <input
                        className="border border-gray-300 rounded px-2 py-1 w-40"
                        placeholder="e.g., 11289"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const v = (e.target as HTMLInputElement).value.trim();
                            if (v) gotoPgxReport(v);
                          }
                        }}
                      />
                      <button
                        onClick={() => gotoPgxReport('11289')}
                        className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                        title="Warfarin"
                      >11289</button>
                      <button
                        onClick={() => gotoPgxReport('42463')}
                        className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                        title="Clopidogrel"
                      >42463</button>
                      <button
                        onClick={() => gotoPgxReport('39998')}
                        className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                        title="Irinotecan"
                      >39998</button>
                    </div>
                  </div>

                  <div className="ml-auto flex flex-wrap gap-2 items-center">
                    <div className="flex gap-1">
                      <button
                        onClick={downloadPanelCsv}
                        className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Export Panel CSV
                      </button>
                      <button
                        onClick={copyCurlPanelCsv}
                        className="px-2 py-2 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                        title="Copy cURL"
                      >
                        Copy cURL
                      </button>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={downloadVersionsCsv}
                        className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Export Versions CSV
                      </button>
                      <button
                        onClick={copyCurlVersionsCsv}
                        className="px-2 py-2 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                        title="Copy cURL"
                      >
                        Copy cURL
                      </button>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={downloadBundleJson}
                        className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Export Bundle JSON
                      </button>
                      <button
                        onClick={copyCurlBundleJson}
                        className="px-2 py-2 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                        title="Copy cURL"
                      >
                        Copy cURL
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

export default EnhancedGenomicsAnalysis;
