interface MedicationApiResponse {
  medications: any[];
  reminders: any[];
  adjustments: any[];
  responses: any[];
  stats: {
    overall: number;
    thisWeek: number;
    onTime: number;
    missed: number;
  };
}

interface PillRecognitionResponse {
  confidence: number;
  identifiedMedication: any | null;
  alternativeMatches: any[];
  safetyWarnings: string[];
}

class MedicationService {
  private baseUrl = '/api';

  async getMedications(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/patients/medications`);
      if (!response.ok) throw new Error('Failed to fetch medications');
      const data = await response.json();
      return data.medications || [];
    } catch (error) {
      console.error('Error fetching medications:', error);
      return [];
    }
  }

  async getReminders(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/patients/medication-reminders`);
      if (!response.ok) throw new Error('Failed to fetch reminders');
      const data = await response.json();
      return data.reminders || [];
    } catch (error) {
      console.error('Error fetching reminders:', error);
      return [];
    }
  }

  async getDoseAdjustments(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/patients/dose-adjustments`);
      if (!response.ok) throw new Error('Failed to fetch dose adjustments');
      const data = await response.json();
      return data.adjustments || [];
    } catch (error) {
      console.error('Error fetching dose adjustments:', error);
      return [];
    }
  }

  async getMedicationResponses(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/patients/medication-responses`);
      if (!response.ok) throw new Error('Failed to fetch medication responses');
      const data = await response.json();
      return data.responses || [];
    } catch (error) {
      console.error('Error fetching medication responses:', error);
      return [];
    }
  }

  async getAdherenceStats(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/patients/adherence-stats`);
      if (!response.ok) throw new Error('Failed to fetch adherence stats');
      const data = await response.json();
      return data.stats || { overall: 0, thisWeek: 0, onTime: 0, missed: 0 };
    } catch (error) {
      console.error('Error fetching adherence stats:', error);
      return { overall: 0, thisWeek: 0, onTime: 0, missed: 0 };
    }
  }

  async markMedicationTaken(reminderId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/patients/medication-reminders/${reminderId}/taken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          actualTime: new Date().toISOString()
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      return false;
    }
  }

  async recognizePill(imageFile: File): Promise<PillRecognitionResponse> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await fetch(`${this.baseUrl}/medication/pill-recognition`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        return {
          confidence: 0,
          identifiedMedication: null,
          alternativeMatches: [],
          safetyWarnings: ['Unable to identify pill. Please consult your pharmacist or healthcare provider.']
        };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error during pill recognition:', error);
      return {
        confidence: 0,
        identifiedMedication: null,
        alternativeMatches: [],
        safetyWarnings: ['Service temporarily unavailable. Please try again later or consult your pharmacist.']
      };
    }
  }

  async addMedication(medication: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/patients/medications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(medication)
      });
      return response.ok;
    } catch (error) {
      console.error('Error adding medication:', error);
      return false;
    }
  }

  async updateMedication(medicationId: string, updates: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/patients/medications/${medicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating medication:', error);
      return false;
    }
  }

  async deleteMedication(medicationId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/patients/medications/${medicationId}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting medication:', error);
      return false;
    }
  }
}

export const medicationService = new MedicationService();
export default medicationService;