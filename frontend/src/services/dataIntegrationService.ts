/**
 * Service for accessing external biomedical APIs through server-side proxies
 * Provides access to DailyMed, OpenFDA, ClinicalTrials.gov, PubMed, and RxNorm
 */

const API_BASE = '/api/external';

interface ApiResponse<T = any> {
  source: string;
  timestamp: string;
  data: T;
  query?: string;
  error?: string;
}

interface DailyMedSearchResult {
  setid: string;
  title: string;
  generic_medicine: string[];
  brand_name: string[];
  application_number: string[];
  product_ndc: string[];
}

interface OpenFDAEvent {
  receivedate: string;
  patient?: {
    drug?: Array<{
      medicinalproduct?: string;
      drugcharacterization?: string;
    }>;
  };
  reaction?: Array<{
    reactionmeddrapt?: string;
  }>;
}

interface ClinicalTrialStudy {
  protocolSection: {
    identificationModule: {
      nctId: string;
      briefTitle: string;
      officialTitle?: string;
    };
    statusModule: {
      overallStatus: string;
      startDateStruct?: {
        date: string;
      };
    };
    conditionsModule?: {
      conditions: string[];
    };
    armsInterventionsModule?: {
      interventions: Array<{
        type: string;
        name: string;
        description?: string;
      }>;
    };
  };
}

interface PubMedArticle {
  uid: string;
  title: string;
  authors: Array<{ name: string }>;
  pubdate: string;
  epubdate: string;
  source: string;
  pmid: string;
}

interface RxNormDrug {
  rxcui: string;
  name: string;
  synonym?: string;
  tty?: string;
  language?: string;
}

class DataIntegrationService {
  private async makeRequest<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE}${endpoint}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed: ${response.status}`);
    }
    
    return response.json();
  }

  // DailyMed API Methods
  async searchDailyMed(drugName: string, limit: number = 10): Promise<ApiResponse<{ data: DailyMedSearchResult[] }>> {
    const params = new URLSearchParams({
      drug_name: drugName,
      limit: limit.toString()
    });
    return this.makeRequest(`/dailymed/search?${params}`);
  }

  async getDailyMedLabel(setId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/dailymed/spl/${setId}`);
  }

  // OpenFDA API Methods
  async searchFDAAdverseEvents(searchTerm: string, limit: number = 10): Promise<ApiResponse<{ results: OpenFDAEvent[] }>> {
    const params = new URLSearchParams({
      search: searchTerm,
      limit: limit.toString()
    });
    return this.makeRequest(`/openfda/drug/event?${params}`);
  }

  async searchFDALabels(searchTerm: string, limit: number = 10): Promise<ApiResponse<{ results: any[] }>> {
    const params = new URLSearchParams({
      search: searchTerm,
      limit: limit.toString()
    });
    return this.makeRequest(`/openfda/drug/label?${params}`);
  }

  // ClinicalTrials.gov API Methods
  async searchClinicalTrials(options: {
    query?: string;
    condition?: string;
    intervention?: string;
    status?: string;
    pageSize?: number;
  }): Promise<ApiResponse<{ studies: ClinicalTrialStudy[] }>> {
    const params = new URLSearchParams();
    
    if (options.query) params.append('query', options.query);
    if (options.condition) params.append('condition', options.condition);
    if (options.intervention) params.append('intervention', options.intervention);
    if (options.status) params.append('status', options.status);
    if (options.pageSize) params.append('pageSize', options.pageSize.toString());
    
    return this.makeRequest(`/clinicaltrials/studies?${params}`);
  }

  async getClinicalTrialById(nctId: string): Promise<ApiResponse<{ protocolSection: any }>> {
    return this.makeRequest(`/clinicaltrials/study/${nctId}`);
  }

  // PubMed API Methods
  async searchPubMed(term: string, options: {
    retmax?: number;
    retstart?: number;
    sort?: 'relevance' | 'pub_date' | 'author';
  } = {}): Promise<ApiResponse<{ articles: Record<string, PubMedArticle>; count: number }>> {
    const params = new URLSearchParams({
      term,
      retmax: (options.retmax || 10).toString(),
      retstart: (options.retstart || 0).toString(),
      sort: options.sort || 'relevance'
    });
    return this.makeRequest(`/pubmed/search?${params}`);
  }

  async getPubMedArticle(pmid: string): Promise<ApiResponse<string>> {
    return this.makeRequest(`/pubmed/article/${pmid}`);
  }

  // RxNorm API Methods
  async searchRxNormDrugs(name: string): Promise<ApiResponse<{ drugGroup: { conceptGroup: Array<{ conceptProperties: RxNormDrug[] }> } }>> {
    const params = new URLSearchParams({ name });
    return this.makeRequest(`/rxnorm/drugs?${params}`);
  }

  async getRxNormProperties(rxcui: string): Promise<ApiResponse<{ properties: any }>> {
    return this.makeRequest(`/rxnorm/rxcui/${rxcui}/properties`);
  }

  async getRxNormInteractions(rxcui: string): Promise<ApiResponse<{ interactionTypeGroup: any[] }>> {
    return this.makeRequest(`/rxnorm/rxcui/${rxcui}/interactions`);
  }

  // Health check
  async checkHealth(): Promise<{ status: string; services: string[]; timestamp: string }> {
    const response = await fetch(`${API_BASE}/health`);
    return response.json();
  }

  // Convenience methods for Drug Intelligence Integrator

  /**
   * Get comprehensive drug information from multiple sources
   */
  async getComprehensiveDrugInfo(drugName: string): Promise<{
    dailyMed: ApiResponse<any> | null;
    fdaLabels: ApiResponse<any> | null;
    fdaEvents: ApiResponse<any> | null;
    rxnorm: ApiResponse<any> | null;
    pubmed: ApiResponse<any> | null;
    clinicalTrials: ApiResponse<any> | null;
  }> {
    const results = await Promise.allSettled([
      this.searchDailyMed(drugName, 5),
      this.searchFDALabels(`generic_name:"${drugName}" OR brand_name:"${drugName}"`, 5),
      this.searchFDAAdverseEvents(`patient.drug.medicinalproduct:"${drugName}"`, 10),
      this.searchRxNormDrugs(drugName),
      this.searchPubMed(`"${drugName}" AND (interaction OR contraindication OR adverse)`, { retmax: 10 }),
      this.searchClinicalTrials({ intervention: drugName, pageSize: 5 })
    ]);

    return {
      dailyMed: results[0].status === 'fulfilled' ? results[0].value : null,
      fdaLabels: results[1].status === 'fulfilled' ? results[1].value : null,
      fdaEvents: results[2].status === 'fulfilled' ? results[2].value : null,
      rxnorm: results[3].status === 'fulfilled' ? results[3].value : null,
      pubmed: results[4].status === 'fulfilled' ? results[4].value : null,
      clinicalTrials: results[5].status === 'fulfilled' ? results[5].value : null,
    };
  }

  /**
   * Search for drug interactions across multiple sources
   */
  async searchDrugInteractions(drug1: string, drug2: string): Promise<{
    rxnorm: ApiResponse<any> | null;
    fdaEvents: ApiResponse<any> | null;
    pubmed: ApiResponse<any> | null;
    clinicalTrials: ApiResponse<any> | null;
  }> {
    // First get RXCUIs for the drugs
    const [drug1Info, drug2Info] = await Promise.allSettled([
      this.searchRxNormDrugs(drug1),
      this.searchRxNormDrugs(drug2)
    ]);

    let rxcui1 = null;
    let rxcui2 = null;

    if (drug1Info.status === 'fulfilled' && drug1Info.value.data?.drugGroup?.conceptGroup) {
      const concepts = drug1Info.value.data.drugGroup.conceptGroup
        .find((group: any) => group.conceptProperties)?.conceptProperties;
      if (concepts && concepts.length > 0) {
        rxcui1 = concepts[0].rxcui;
      }
    }

    if (drug2Info.status === 'fulfilled' && drug2Info.value.data?.drugGroup?.conceptGroup) {
      const concepts = drug2Info.value.data.drugGroup.conceptGroup
        .find((group: any) => group.conceptProperties)?.conceptProperties;
      if (concepts && concepts.length > 0) {
        rxcui2 = concepts[0].rxcui;
      }
    }

    const searchPromises = [
      rxcui1 ? this.getRxNormInteractions(rxcui1) : Promise.reject('No RXCUI found'),
      this.searchFDAAdverseEvents(`patient.drug.medicinalproduct:"${drug1}" AND patient.drug.medicinalproduct:"${drug2}"`, 10),
      this.searchPubMed(`"${drug1}" AND "${drug2}" AND (interaction OR contraindication)`, { retmax: 10 }),
      this.searchClinicalTrials({ query: `${drug1} AND ${drug2}`, pageSize: 5 })
    ];

    const results = await Promise.allSettled(searchPromises);

    return {
      rxnorm: results[0].status === 'fulfilled' ? results[0].value : null,
      fdaEvents: results[1].status === 'fulfilled' ? results[1].value : null,
      pubmed: results[2].status === 'fulfilled' ? results[2].value : null,
      clinicalTrials: results[3].status === 'fulfilled' ? results[3].value : null,
    };
  }
}

export const dataIntegrationService = new DataIntegrationService();
export default dataIntegrationService;