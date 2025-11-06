interface ResearchStudy {
  id: string;
  title: string;
  description: string;
  phase: 'Phase I' | 'Phase II' | 'Phase III' | 'Phase IV' | 'Observational';
  sponsor: string;
  institution: string;
  location: string;
  status: 'Recruiting' | 'Not Recruiting' | 'Completed' | 'Suspended';
  eligibilityCriteria: string[];
  primaryOutcome: string;
  estimatedDuration: string;
  participantCount: number;
  maxParticipants: number;
  startDate: string;
  estimatedCompletion: string;
  matchScore: number;
  category: 'Treatment' | 'Prevention' | 'Supportive Care' | 'Diagnostic' | 'Screening';
  compensation: string;
  requirements: string[];
  contactInfo: {
    name: string;
    phone: string;
    email: string;
  };
  genomicRequirements?: string[];
  exclusionCriteria: string[];
}

interface ParticipationHistory {
  studyId: string;
  studyTitle: string;
  status: 'Active' | 'Completed' | 'Withdrawn' | 'Screening';
  enrollmentDate: string;
  lastUpdate: string;
  nextAppointment?: string;
}

interface ResearchPreferences {
  maxDistance: number;
  phases: string[];
  categories: string[];
  genomicDataSharing: boolean;
  compensationRequired: boolean;
  notifications: {
    newMatches: boolean;
    studyUpdates: boolean;
    appointments: boolean;
  };
}

interface StudySearchFilters {
  searchTerm?: string;
  phases?: string[];
  categories?: string[];
  maxDistance?: number;
  location?: string;
  compensationRequired?: boolean;
  genomicDataSharing?: boolean;
}

class ResearchParticipationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
  }

  async getAvailableStudies(patientId?: string, filters?: StudySearchFilters): Promise<ResearchStudy[]> {
    try {
      const params = new URLSearchParams();
      if (patientId) params.append('patientId', patientId);
      if (filters?.searchTerm) params.append('search', filters.searchTerm);
      if (filters?.phases?.length) params.append('phases', filters.phases.join(','));
      if (filters?.categories?.length) params.append('categories', filters.categories.join(','));
      if (filters?.maxDistance) params.append('maxDistance', filters.maxDistance.toString());
      if (filters?.location) params.append('location', filters.location);
      if (filters?.compensationRequired !== undefined) params.append('compensationRequired', filters.compensationRequired.toString());

      const response = await fetch(`${this.baseUrl}/research/studies?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch research studies');
      }

      const data = await response.json();
      return data.studies || [];
    } catch (error) {
      console.error('Error fetching research studies:', error);
      return [];
    }
  }

  async getPersonalizedMatches(patientId: string): Promise<ResearchStudy[]> {
    try {
      const response = await fetch(`${this.baseUrl}/research/matches/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch personalized matches');
      }

      const data = await response.json();
      return data.matches || [];
    } catch (error) {
      console.error('Error fetching personalized matches:', error);
      return [];
    }
  }

  async getParticipationHistory(patientId: string): Promise<ParticipationHistory[]> {
    try {
      const response = await fetch(`${this.baseUrl}/research/participation-history/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch participation history');
      }

      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error('Error fetching participation history:', error);
      return [];
    }
  }

  async getResearchPreferences(patientId: string): Promise<ResearchPreferences | null> {
    try {
      const response = await fetch(`${this.baseUrl}/research/preferences/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch research preferences');
      }

      const data = await response.json();
      return data.preferences || null;
    } catch (error) {
      console.error('Error fetching research preferences:', error);
      return null;
    }
  }

  async updateResearchPreferences(patientId: string, preferences: ResearchPreferences): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/research/preferences/${patientId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        throw new Error('Failed to update research preferences');
      }

      return true;
    } catch (error) {
      console.error('Error updating research preferences:', error);
      return false;
    }
  }

  async expressInterest(patientId: string, studyId: string, message?: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/research/express-interest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId,
          studyId,
          message
        })
      });

      if (!response.ok) {
        throw new Error('Failed to express interest in study');
      }

      return true;
    } catch (error) {
      console.error('Error expressing interest in study:', error);
      return false;
    }
  }

  async saveStudy(patientId: string, studyId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/research/save-study`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId,
          studyId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save study');
      }

      return true;
    } catch (error) {
      console.error('Error saving study:', error);
      return false;
    }
  }

  async getSavedStudies(patientId: string): Promise<ResearchStudy[]> {
    try {
      const response = await fetch(`${this.baseUrl}/research/saved-studies/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch saved studies');
      }

      const data = await response.json();
      return data.studies || [];
    } catch (error) {
      console.error('Error fetching saved studies:', error);
      return [];
    }
  }

  async getStudyDetails(studyId: string): Promise<ResearchStudy | null> {
    try {
      const response = await fetch(`${this.baseUrl}/research/studies/${studyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch study details');
      }

      const data = await response.json();
      return data.study || null;
    } catch (error) {
      console.error('Error fetching study details:', error);
      return null;
    }
  }

  async searchStudiesByCondition(condition: string, patientId?: string): Promise<ResearchStudy[]> {
    try {
      const params = new URLSearchParams();
      params.append('condition', condition);
      if (patientId) params.append('patientId', patientId);

      const response = await fetch(`${this.baseUrl}/research/studies/by-condition?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search studies by condition');
      }

      const data = await response.json();
      return data.studies || [];
    } catch (error) {
      console.error('Error searching studies by condition:', error);
      return [];
    }
  }

  async getEligibilityAssessment(patientId: string, studyId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/research/eligibility-assessment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId,
          studyId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get eligibility assessment');
      }

      const data = await response.json();
      return data.assessment || null;
    } catch (error) {
      console.error('Error getting eligibility assessment:', error);
      return null;
    }
  }

  async getRecommendedStudies(patientId: string, limit: number = 10): Promise<ResearchStudy[]> {
    try {
      const response = await fetch(`${this.baseUrl}/research/recommendations/${patientId}?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommended studies');
      }

      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Error fetching recommended studies:', error);
      return [];
    }
  }
}

export default new ResearchParticipationService();
export type { ResearchStudy, ParticipationHistory, ResearchPreferences, StudySearchFilters };