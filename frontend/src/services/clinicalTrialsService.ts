import { api } from './api';

export interface ClinicalTrialSearchParams {
  condition?: string;
  intervention?: string;
  age?: number;
  gender?: string;
  recruitmentStatus?: string;
  phase?: string;
  location?: string;
  pageSize?: number;
  pageToken?: string;
}

export interface ClinicalTrialLocation {
  facility: string;
  city: string;
  state: string;
  country: string;
  zip?: string;
  lat?: number;
  lon?: number;
  status: string;
  contact?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

export interface ClinicalTrial {
  nctId: string;
  title: string;
  phase: string;
  status: string;
  condition: string;
  intervention: string;
  sponsor: string;
  locations: ClinicalTrialLocation[];
  eligibilityScore: number;
  matchScore: number;
  estimatedEnrollment: number;
  ageRange: string;
  gender: string;
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  description: string;
  detailedDescription?: string;
  lastUpdated: string;
  url: string;
  isEligible: boolean;
  confidenceLevel: 'high' | 'medium' | 'low';
  primaryOutcome?: string;
  secondaryOutcome?: string;
  biomarkers?: string[];
  lineOfTherapy?: string;
  enrollmentTarget?: number;
  enrollmentCurrent?: number;
}

export interface ClinicalTrialSearchResult {
  studies: ClinicalTrial[];
  totalCount: number;
  nextPageToken: string | null;
  searchCriteria?: any;
  lastUpdated: string;
}

class ClinicalTrialsService {
  /**
   * Search clinical trials with patient criteria
   */
  async searchTrials(params: ClinicalTrialSearchParams): Promise<ClinicalTrialSearchResult> {
    try {
      const response = await api.get('/clinical-trials/search', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error searching clinical trials:', error);
      throw new Error('Failed to search clinical trials');
    }
  }

  /**
   * Get detailed trial information
   */
  async getTrialDetails(nctId: string): Promise<any> {
    try {
      const response = await api.get(`/clinical-trials/trial/${nctId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching trial details for ${nctId}:`, error);
      throw new Error(`Failed to fetch trial details for ${nctId}`);
    }
  }

  /**
   * Search trials by drug/medication
   */
  async searchTrialsByDrug(drug: string, patientProfile?: any): Promise<ClinicalTrialSearchResult> {
    try {
      const params = {
        drug,
        ...patientProfile
      };
      const response = await api.get('/clinical-trials/search-by-drug', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error searching trials by drug:', error);
      throw new Error('Failed to search trials by drug');
    }
  }

  /**
   * Search trials by genomic profile
   */
  async searchTrialsByGenomics(genomicData: any, patientProfile?: any): Promise<ClinicalTrialSearchResult> {
    try {
      const response = await api.post('/clinical-trials/search-by-genomics', {
        genomicData,
        patientProfile
      });
      return response.data.data;
    } catch (error) {
      console.error('Error searching trials by genomics:', error);
      throw new Error('Failed to search trials by genomic profile');
    }
  }

  /**
   * Get trial recommendations for a patient
   */
  async getTrialRecommendations(patient: any, preferences?: any): Promise<any> {
    try {
      const response = await api.post('/clinical-trials/recommendations', {
        patient,
        preferences
      });
      return response.data.data;
    } catch (error) {
      console.error('Error getting trial recommendations:', error);
      throw new Error('Failed to get trial recommendations');
    }
  }

  /**
   * Transform API trial data to component format
   */
  transformTrialData(apiTrial: ClinicalTrial): any {
    return {
      nct_id: apiTrial.nctId,
      title: apiTrial.title,
      condition: apiTrial.condition,
      phase: apiTrial.phase,
      status: apiTrial.status,
      sponsor: apiTrial.sponsor,
      brief_summary: apiTrial.description,
      detailed_description: apiTrial.detailedDescription || apiTrial.description,
      eligibility_criteria: apiTrial.inclusionCriteria.join('; '),
      primary_outcome: apiTrial.primaryOutcome || 'Clinical response',
      secondary_outcome: apiTrial.secondaryOutcome || 'Safety and tolerability',
      biomarkers: apiTrial.biomarkers || [],
      line_of_therapy: apiTrial.lineOfTherapy || 'Various',
      enrollment_target: apiTrial.enrollmentTarget || apiTrial.estimatedEnrollment,
      enrollment_current: apiTrial.enrollmentCurrent || Math.floor((apiTrial.estimatedEnrollment || 100) * 0.6),
      eligibility_score: apiTrial.eligibilityScore,
      match_score: apiTrial.matchScore,
      confidence_level: apiTrial.confidenceLevel,
      is_eligible: apiTrial.isEligible,
      age_range: apiTrial.ageRange,
      gender: apiTrial.gender,
      last_updated: apiTrial.lastUpdated,
      url: apiTrial.url,
      locations: apiTrial.locations.map(loc => ({
        name: loc.facility,
        address: '',
        city: loc.city,
        state: loc.state,
        zip: loc.zip || '',
        country: loc.country,
        lat: loc.lat,
        lon: loc.lon,
        status: loc.status,
        contact: loc.contact
      }))
    };
  }

  /**
   * Search trials with comprehensive patient profile
   */
  async searchTrialsForPatient(patient: any): Promise<any[]> {
    try {
      // Multiple search strategies
      const searches = await Promise.allSettled([
        // Search by primary condition
        patient.conditions?.length > 0 ? 
          this.searchTrials({
            condition: patient.conditions[0],
            age: patient.age,
            gender: patient.gender,
            pageSize: 15
          }) : null,
        
        // Search by current medications
        patient.medications?.length > 0 ?
          this.searchTrialsByDrug(
            patient.medications[0].name, 
            { condition: patient.conditions?.[0], age: patient.age, gender: patient.gender }
          ) : null,
        
        // Search by genomic data if available
        patient.genomicData ?
          this.searchTrialsByGenomics(
            patient.genomicData,
            { condition: patient.conditions?.[0], age: patient.age, gender: patient.gender }
          ) : null
      ].filter(Boolean));

      // Combine and deduplicate results
      const allTrials = new Map();
      searches.forEach(result => {
        if (result.status === 'fulfilled' && result.value?.studies) {
          result.value.studies.forEach((trial: ClinicalTrial) => {
            if (!allTrials.has(trial.nctId)) {
              allTrials.set(trial.nctId, this.transformTrialData(trial));
            }
          });
        }
      });

      return Array.from(allTrials.values())
        .sort((a, b) => (b.eligibility_score || 0) - (a.eligibility_score || 0));

    } catch (error) {
      console.error('Error searching trials for patient:', error);
      return [];
    }
  }
}

export const clinicalTrialsService = new ClinicalTrialsService();