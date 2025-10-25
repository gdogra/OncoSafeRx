import React, { useState, useCallback } from 'react';
import Card from '../UI/Card';
import { Loader2, Search, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { dataIntegrationService } from '../services/dataIntegrationService';

interface DrugData {
  dailyMed: any;
  fdaLabels: any;
  fdaEvents: any;
  rxnorm: any;
  pubmed: any;
  clinicalTrials: any;
}

interface InteractionData {
  rxnorm: any;
  fdaEvents: any;
  pubmed: any;
  clinicalTrials: any;
}

const DrugIntelligenceIntegrator: React.FC = () => {
  const [drugName, setDrugName] = useState('');
  const [drug1, setDrug1] = useState('');
  const [drug2, setDrug2] = useState('');
  const [drugData, setDrugData] = useState<DrugData | null>(null);
  const [interactionData, setInteractionData] = useState<InteractionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'drug-info' | 'interactions'>('drug-info');

  const searchDrugInfo = useCallback(async () => {
    if (!drugName.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const data = await dataIntegrationService.getComprehensiveDrugInfo(drugName);
      setDrugData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch drug information');
    } finally {
      setLoading(false);
    }
  }, [drugName]);

  const searchInteractions = useCallback(async () => {
    if (!drug1.trim() || !drug2.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const data = await dataIntegrationService.searchDrugInteractions(drug1, drug2);
      setInteractionData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch interaction data');
    } finally {
      setLoading(false);
    }
  }, [drug1, drug2]);

  const renderDataSource = (title: string, data: any, color: string) => {
    if (!data) {
      return (
        <Card className="opacity-50">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 text-xs font-medium rounded border border-${color}-200 text-${color}-700`}>
                {title}
              </span>
              <span className="text-gray-500 text-sm">No data</span>
            </div>
          </div>
        </Card>
      );
    }

    const resultCount = Array.isArray(data.data?.results) ? data.data.results.length :
                       Array.isArray(data.data?.data) ? data.data.data.length :
                       Array.isArray(data.data?.studies) ? data.data.studies.length :
                       typeof data.data?.count === 'number' ? data.data.count :
                       'Available';

    return (
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded bg-${color}-100 text-${color}-800 border-${color}-200`}>
                {title}
              </span>
              <span className="text-gray-600 text-sm">{resultCount} results</span>
            </div>
            <button className="p-1 hover:bg-gray-100 rounded">
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
          <div className="text-xs text-gray-500 mb-2">
            Source: {data.source} • {new Date(data.timestamp).toLocaleTimeString()}
          </div>
          {data.query && (
            <div className="text-xs bg-gray-50 p-2 rounded mb-2">
              Query: {data.query}
            </div>
          )}
          <div className="text-sm text-gray-700">
            {JSON.stringify(data.data, null, 2).slice(0, 200)}...
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Drug Intelligence Integrator</h2>
        <p className="text-gray-600 mt-1">
          Real-time access to DailyMed, OpenFDA, ClinicalTrials.gov, PubMed, and RxNorm APIs
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('drug-info')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'drug-info'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Comprehensive Drug Info
            </button>
            <button
              onClick={() => setActiveTab('interactions')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'interactions'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Drug Interactions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'drug-info' && (
            <div className="space-y-4">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">Drug Information Search</h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Enter drug name (e.g., aspirin, ibuprofen)"
                      value={drugName}
                      onChange={(e) => setDrugName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchDrugInfo()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={searchDrugInfo}
                      disabled={loading || !drugName.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      Search
                    </button>
                  </div>

                  {drugData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                      {renderDataSource('RxNorm', drugData.rxnorm, 'blue')}
                      {renderDataSource('DailyMed', drugData.dailyMed, 'green')}
                      {renderDataSource('FDA Labels', drugData.fdaLabels, 'purple')}
                      {renderDataSource('FDA Events', drugData.fdaEvents, 'red')}
                      {renderDataSource('PubMed', drugData.pubmed, 'yellow')}
                      {renderDataSource('Clinical Trials', drugData.clinicalTrials, 'indigo')}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'interactions' && (
            <div className="space-y-4">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">Drug Interaction Search</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="First drug"
                      value={drug1}
                      onChange={(e) => setDrug1(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Second drug"
                      value={drug2}
                      onChange={(e) => setDrug2(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button 
                      onClick={searchInteractions} 
                      disabled={loading || !drug1.trim() || !drug2.trim()}
                      className="flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      Find Interactions
                    </button>
                  </div>

                  {interactionData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {renderDataSource('RxNorm Interactions', interactionData.rxnorm, 'blue')}
                      {renderDataSource('FDA Adverse Events', interactionData.fdaEvents, 'red')}
                      {renderDataSource('PubMed Literature', interactionData.pubmed, 'yellow')}
                      {renderDataSource('Clinical Trials', interactionData.clinicalTrials, 'indigo')}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-600" />
          <div className="text-blue-800">
            <strong>Data Sources:</strong> This integrator provides real-time access to official biomedical APIs.
            All data is fetched through secure server-side proxies with rate limiting and error handling.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugIntelligenceIntegrator;