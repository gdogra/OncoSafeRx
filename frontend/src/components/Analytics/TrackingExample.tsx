import React, { useState } from 'react';
import { useTracking, trackClinicalWorkflow, trackFeatureUsage, trackErrors } from '../../utils/trackingHelpers';
import { Search, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { drugService } from '../../services/api';

// Example component showing how to implement tracking
const TrackingExample: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Use the tracking hook for this feature
  const { trackAction, trackTiming, startTimer } = useTracking('drug_search_example');

  const handleSearch = async () => {
    const timer = startTimer();
    
    try {
      // Track the search action
      trackAction('search_initiated', {
        queryLength: searchQuery.length,
        hasFilters: false
      });

      // Real drug search via API
      const resp = await drugService.searchDrugs(searchQuery.trim());
      const results = Array.isArray(resp?.results) ? resp.results : [];
      const mapped = results.slice(0, 10).map((d: any, i: number) => ({ id: d.rxcui || i, name: d.name || d.synonym || 'Unknown', category: d.tty || 'Drug' }));
      setSearchResults(mapped);
      
      // Track successful search with timing
      trackTiming('search_completed', timer, {
        resultCount: mapped.length,
        query: searchQuery.substring(0, 20) // Limit for privacy
      });

      // Use the specific feature tracking helper
      trackFeatureUsage.searchPerformed(
        'drug_search',
        searchQuery,
        mapped.length,
        Date.now() - timer
      );

    } catch (error) {
      // Track errors
      trackErrors.applicationError(
        'search_error',
        error instanceof Error ? error.message : 'Unknown search error',
        undefined,
        'medium'
      );
    }
  };

  const handleDrugInteractionCheck = () => {
    // Track clinical workflow
    trackClinicalWorkflow.drugInteractionCheck(
      2, // drugCount
      1, // interactionsFound
      ['moderate'] // severityLevels
    );

    trackAction('interaction_check', {
      drugCount: 2,
      interactionsFound: 1
    });
  };

  const handleReportGeneration = () => {
    const timer = startTimer();
    trackFeatureUsage.reportGenerated(
      'interaction_report',
      searchResults.length,
      Date.now() - timer,
      'pdf'
    );

    trackAction('report_generated', {
      reportType: 'interaction_summary',
      dataPoints: searchResults.length
    });
  };

  const handleProtocolAccess = () => {
    trackClinicalWorkflow.protocolAccessed(
      'NCCN_breast_cancer',
      'NCCN',
      'treatment_recommendations'
    );

    trackAction('protocol_accessed', {
      protocol: 'NCCN_breast_cancer',
      section: 'treatment_recommendations'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Visitor Tracking Implementation Example</h2>
        
        <div className="space-y-6">
          {/* Search Example */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Drug Search with Tracking</h3>
            <div className="flex space-x-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for medications..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Search Results ({searchResults.length}):</p>
                <div className="space-y-2">
                  {searchResults.map(result => (
                    <div key={result.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">{result.name}</span>
                      <span className="text-sm text-gray-600">{result.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clinical Workflow Tracking Examples */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Clinical Workflow Tracking</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleDrugInteractionCheck}
                className="flex flex-col items-center space-y-2 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Check Drug Interactions</span>
                <span className="text-xs text-orange-700">Tracks interaction analysis</span>
              </button>

              <button
                onClick={handleReportGeneration}
                className="flex flex-col items-center space-y-2 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Download className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-green-900">Generate Report</span>
                <span className="text-xs text-green-700">Tracks report creation</span>
              </button>

              <button
                onClick={handleProtocolAccess}
                className="flex flex-col items-center space-y-2 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <CheckCircle className="w-6 h-6 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Access Protocol</span>
                <span className="text-xs text-purple-700">Tracks protocol usage</span>
              </button>
            </div>
          </div>

          {/* Implementation Code Example */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Implementation Example</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-800 overflow-x-auto">
{`// Import tracking utilities
import { useTracking, trackClinicalWorkflow } from '../utils/trackingHelpers';

// Use in your component
const { trackAction, trackTiming, startTimer } = useTracking('your_feature_name');

// Track user actions
trackAction('button_clicked', { buttonType: 'search' });

// Track clinical workflows
trackClinicalWorkflow.drugInteractionCheck(drugCount, interactionsFound, severityLevels);

// Track performance with timing
const timer = startTimer();
// ... perform action ...
trackTiming('action_completed', timer, { additionalData: 'value' });`}
              </pre>
            </div>
          </div>

          {/* Current Tracking Status */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Tracking Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900">Page Views</p>
                <p className="text-xs text-blue-700">Automatically tracked on route changes</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-sm font-medium text-green-900">User Interactions</p>
                <p className="text-xs text-green-700">Clicks, scrolls, and form submissions</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-sm font-medium text-purple-900">Session Data</p>
                <p className="text-xs text-purple-700">Device info, duration, and engagement</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-sm font-medium text-orange-900">Privacy Protected</p>
                <p className="text-xs text-orange-700">HIPAA compliant, no PHI collected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingExample;
