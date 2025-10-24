import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { dataIntegrationService } from '@/services/dataIntegrationService';

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
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Badge variant="outline" className={`border-${color}-200 text-${color}-700`}>
                {title}
              </Badge>
              <span className="text-gray-500">No data</span>
            </CardTitle>
          </CardHeader>
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
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`bg-${color}-100 text-${color}-800 border-${color}-200`}>
                {title}
              </Badge>
              <span className="text-gray-600">{resultCount} results</span>
            </div>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
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
        </CardContent>
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
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="drug-info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="drug-info">Comprehensive Drug Info</TabsTrigger>
          <TabsTrigger value="interactions">Drug Interactions</TabsTrigger>
        </TabsList>

        <TabsContent value="drug-info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Drug Information Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter drug name (e.g., aspirin, ibuprofen)"
                  value={drugName}
                  onChange={(e) => setDrugName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchDrugInfo()}
                />
                <Button onClick={searchDrugInfo} disabled={loading || !drugName.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Search
                </Button>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Drug Interaction Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  placeholder="First drug"
                  value={drug1}
                  onChange={(e) => setDrug1(e.target.value)}
                />
                <Input
                  placeholder="Second drug"
                  value={drug2}
                  onChange={(e) => setDrug2(e.target.value)}
                />
                <Button 
                  onClick={searchInteractions} 
                  disabled={loading || !drug1.trim() || !drug2.trim()}
                  className="w-full"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Find Interactions
                </Button>
              </div>

              {interactionData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {renderDataSource('RxNorm Interactions', interactionData.rxnorm, 'blue')}
                  {renderDataSource('FDA Adverse Events', interactionData.fdaEvents, 'red')}
                  {renderDataSource('PubMed Literature', interactionData.pubmed, 'yellow')}
                  {renderDataSource('Clinical Trials', interactionData.clinicalTrials, 'indigo')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Data Sources:</strong> This integrator provides real-time access to official biomedical APIs.
          All data is fetched through secure server-side proxies with rate limiting and error handling.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DrugIntelligenceIntegrator;