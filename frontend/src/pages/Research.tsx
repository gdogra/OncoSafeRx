import React, { useState } from 'react';
import Card from '../components/UI/Card';
import Tooltip from '../components/UI/Tooltip';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import { 
  BarChart3, 
  Users, 
  Database, 
  TrendingUp, 
  FileText, 
  Download, 
  Search, 
  Filter,
  Calendar,
  MapPin,
  Target,
  Activity,
  PieChart,
  LineChart,
  BookOpen,
  Microscope,
  X,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Building
} from 'lucide-react';

const Research: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'studies' | 'data' | 'analytics'>('overview');
  const [selectedStudy, setSelectedStudy] = useState<any>(null);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<Record<string, 'idle' | 'downloading' | 'completed'>>({});

  // Button handlers
  const handleViewStudy = (study: any) => {
    setSelectedStudy(study);
    setShowStudyModal(true);
  };

  const handleDownloadStudyReport = async (studyId: string) => {
    setDownloadStatus(prev => ({ ...prev, [studyId]: 'downloading' }));
    
    // Simulate download process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock PDF download
      const pdfContent = `Study Report: ${studyId}\n\nGenerated on: ${new Date().toLocaleString()}\n\nThis is a mock study report containing:\n- Study protocol\n- Enrollment statistics\n- Safety data\n- Interim analysis\n- Regulatory documents`;
      
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `study-report-${studyId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setDownloadStatus(prev => ({ ...prev, [studyId]: 'completed' }));
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setDownloadStatus(prev => ({ ...prev, [studyId]: 'idle' }));
      }, 3000);
      
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStatus(prev => ({ ...prev, [studyId]: 'idle' }));
    }
  };

  const researchMetrics = [
    {
      label: 'Active Studies',
      value: '12',
      change: '+2',
      changeType: 'positive' as const,
      icon: FileText,
    },
    {
      label: 'Total Subjects',
      value: '1,247',
      change: '+156',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      label: 'Completed Studies',
      value: '8',
      change: '+1',
      changeType: 'positive' as const,
      icon: Target,
    },
    {
      label: 'Publications',
      value: '23',
      change: '+3',
      changeType: 'positive' as const,
      icon: BookOpen,
    },
  ];

  const activeStudies = [
    {
      id: 'ONCO-2024-001',
      title: 'Efficacy of Pembrolizumab in Advanced NSCLC',
      phase: 'Phase III',
      status: 'Recruiting',
      subjects: 245,
      targetSubjects: 400,
      startDate: '2024-01-15',
      primaryEndpoint: 'Overall Survival',
      sponsor: 'Memorial Cancer Center',
    },
    {
      id: 'ONCO-2024-002',
      title: 'CAR-T Therapy in Relapsed B-cell Lymphoma',
      phase: 'Phase II',
      status: 'Active',
      subjects: 67,
      targetSubjects: 80,
      startDate: '2023-11-20',
      primaryEndpoint: 'Complete Response Rate',
      sponsor: 'National Cancer Institute',
    },
    {
      id: 'ONCO-2024-003',
      title: 'Biomarker-Guided Precision Therapy',
      phase: 'Phase I/II',
      status: 'Recruiting',
      subjects: 23,
      targetSubjects: 120,
      startDate: '2024-03-01',
      primaryEndpoint: 'Safety and Tolerability',
      sponsor: 'Precision Oncology Consortium',
    },
  ];

  const dataAnalytics = [
    {
      title: 'Adverse Event Analysis',
      description: 'Real-time monitoring of safety signals across all active studies',
      status: 'Updated 2 hours ago',
      icon: Activity,
    },
    {
      title: 'Enrollment Trends',
      description: 'Study recruitment patterns and demographic analysis',
      status: 'Updated daily',
      icon: TrendingUp,
    },
    {
      title: 'Biomarker Correlations',
      description: 'Genomic and proteomic associations with treatment response',
      status: 'Updated weekly',
      icon: Microscope,
    },
    {
      title: 'Outcome Predictions',
      description: 'Machine learning models for efficacy and safety predictions',
      status: 'Updated monthly',
      icon: PieChart,
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'studies', label: 'Clinical Studies', icon: FileText },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
  ] as const;

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {researchMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} padding="sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                  <div className="flex items-baseline">
                    <p className="text-lg font-semibold text-gray-900">{metric.value}</p>
                    <p className={`ml-2 text-sm font-medium ${
                      metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Research Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New subject enrolled in ONCO-2024-001</p>
              <p className="text-xs text-gray-600">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Safety report generated for Phase II study</p>
              <p className="text-xs text-gray-600">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Protocol amendment approved for ONCO-2024-003</p>
              <p className="text-xs text-gray-600">1 day ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderStudies = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Active Clinical Studies</h3>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search studies..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <button className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {activeStudies.map((study) => (
          <Card key={study.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{study.title}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    study.status === 'Recruiting' ? 'bg-green-100 text-green-800' :
                    study.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {study.status}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                    {study.phase}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">Study ID: {study.id}</p>
                
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Enrollment:</span>
                    <div className="font-medium">{study.subjects}/{study.targetSubjects} subjects</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(study.subjects / study.targetSubjects) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Start Date:</span>
                    <div className="font-medium">{new Date(study.startDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Primary Endpoint:</span>
                    <div className="font-medium">{study.primaryEndpoint}</div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-3">Sponsor: {study.sponsor}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleViewStudy(study)}
                  className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                  title="View study details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDownloadStudyReport(study.id)}
                  disabled={downloadStatus[study.id] === 'downloading'}
                  className={`p-2 rounded-lg transition-colors ${
                    downloadStatus[study.id] === 'downloading' 
                      ? 'text-gray-300 cursor-not-allowed'
                      : downloadStatus[study.id] === 'completed'
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                  title={downloadStatus[study.id] === 'downloading' ? 'Downloading...' : 'Download study report'}
                >
                  {downloadStatus[study.id] === 'downloading' ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  ) : downloadStatus[study.id] === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderDataManagement = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export & Reports</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <Database className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Subject Demographics</div>
                <div className="text-sm text-gray-600">Export demographic data across all studies</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-gray-400" />
          </button>
          
          <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Safety Data</div>
                <div className="text-sm text-gray-600">Adverse events and safety signals</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-gray-400" />
          </button>
          
          <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Efficacy Outcomes</div>
                <div className="text-sm text-gray-600">Treatment response and survival data</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-gray-400" />
          </button>
          
          <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <Microscope className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Biomarker Data</div>
                <div className="text-sm text-gray-600">Genomic and molecular profiling results</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {dataAnalytics.map((analytic, index) => {
          const Icon = analytic.icon;
          return (
            <Card key={index}>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{analytic.title}</h4>
                  <p className="text-gray-600 text-sm mb-3">{analytic.description}</p>
                  <p className="text-xs text-gray-500">{analytic.status}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // Study Details Modal Component
  const StudyDetailsModal = () => {
    if (!selectedStudy || !showStudyModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedStudy.title}</h2>
                <p className="text-gray-600 mt-1">Study ID: {selectedStudy.id}</p>
              </div>
              <button
                onClick={() => setShowStudyModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Study Status */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card padding="sm">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedStudy.status === 'Recruiting' ? 'bg-green-500' :
                    selectedStudy.status === 'Active' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}></div>
                  <div>
                    <div className="text-sm text-gray-600">Status</div>
                    <div className="font-semibold">{selectedStudy.status}</div>
                  </div>
                </div>
              </Card>
              
              <Card padding="sm">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-600">Enrollment</div>
                    <div className="font-semibold">{selectedStudy.subjects}/{selectedStudy.targetSubjects}</div>
                  </div>
                </div>
              </Card>
              
              <Card padding="sm">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-600">Start Date</div>
                    <div className="font-semibold">{new Date(selectedStudy.startDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Study Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Phase:</span>
                    <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      {selectedStudy.phase}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Primary Endpoint:</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedStudy.primaryEndpoint}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Sponsor:</span>
                    <p className="text-sm text-gray-900 mt-1">{selectedStudy.sponsor}</p>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Current Enrollment</span>
                      <span>{Math.round((selectedStudy.subjects / selectedStudy.targetSubjects) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-purple-600 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${(selectedStudy.subjects / selectedStudy.targetSubjects) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    {selectedStudy.targetSubjects - selectedStudy.subjects} subjects remaining to reach target enrollment
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Study Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">New subject enrolled</p>
                    <p className="text-xs text-gray-600">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Safety report submitted</p>
                    <p className="text-xs text-gray-600">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Protocol deviation reported</p>
                    <p className="text-xs text-gray-600">3 days ago</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleDownloadStudyReport(selectedStudy.id)}
                disabled={downloadStatus[selectedStudy.id] === 'downloading'}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  downloadStatus[selectedStudy.id] === 'downloading'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {downloadStatus[selectedStudy.id] === 'downloading' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Report</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowStudyModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Research' }]} />
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <BarChart3 className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Research Platform</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Comprehensive research data management, analytics, and clinical study oversight
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'studies' && renderStudies()}
          {activeTab === 'data' && renderDataManagement()}
          {activeTab === 'analytics' && renderAnalytics()}
        </div>
      </div>

      {/* Study Details Modal */}
      <StudyDetailsModal />
    </div>
  );
};

export default Research;
