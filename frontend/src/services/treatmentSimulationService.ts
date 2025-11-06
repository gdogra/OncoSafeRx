interface DrugPathway {
  drugName: string;
  mechanism: string;
  targetProteins: string[];
  metabolismPathway: string[];
  expectedEfficacy: number;
  sideEffectProfile: SideEffect[];
  genomicFactors: string[];
  timeToEffect: number;
  duration: number;
}

interface SideEffect {
  name: string;
  probability: number;
  severity: 'mild' | 'moderate' | 'severe';
  timeframe: string;
  mitigation?: string;
}

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  geneticProfile: {
    mutations: string[];
    metabolizerStatus: string[];
    biomarkers: string[];
  };
  treatments: DrugPathway[];
  outcomeMetrics: {
    overallSurvival: number;
    progressionFreeSurvival: number;
    responseRate: number;
    qualityOfLife: number;
    sideEffectBurden: number;
  };
  confidence: number;
}

interface BodySystem {
  name: string;
  organs: string[];
  affectedByTreatment: boolean;
  impactLevel: 'low' | 'medium' | 'high';
  expectedChanges: string[];
  timeToEffect: number;
}

interface PredictiveModel {
  scenario: string;
  timePoints: number[];
  tumorSize: number[];
  biomarkerLevels: { [key: string]: number[] };
  sideEffectSeverity: number[];
  qualityOfLife: number[];
  confidence: number[];
}

class TreatmentSimulationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
  }

  async getSimulationScenarios(patientId?: string): Promise<SimulationScenario[]> {
    try {
      const url = patientId 
        ? `${this.baseUrl}/treatment/simulation/scenarios?patientId=${patientId}`
        : `${this.baseUrl}/treatment/simulation/scenarios`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch simulation scenarios');
      }

      const data = await response.json();
      return data.scenarios || [];
    } catch (error) {
      console.error('Error fetching simulation scenarios:', error);
      return [];
    }
  }

  async getBodySystemsAnalysis(patientId: string, treatmentId?: string): Promise<BodySystem[]> {
    try {
      const url = treatmentId
        ? `${this.baseUrl}/treatment/simulation/body-systems?patientId=${patientId}&treatmentId=${treatmentId}`
        : `${this.baseUrl}/treatment/simulation/body-systems?patientId=${patientId}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch body systems analysis');
      }

      const data = await response.json();
      return data.bodySystems || [];
    } catch (error) {
      console.error('Error fetching body systems analysis:', error);
      return [];
    }
  }

  async getPredictiveModels(patientId: string, scenarioId?: string): Promise<PredictiveModel[]> {
    try {
      const url = scenarioId
        ? `${this.baseUrl}/treatment/simulation/predictions?patientId=${patientId}&scenarioId=${scenarioId}`
        : `${this.baseUrl}/treatment/simulation/predictions?patientId=${patientId}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch predictive models');
      }

      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Error fetching predictive models:', error);
      return [];
    }
  }

  async runSimulation(scenarioId: string, patientId: string, parameters?: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/treatment/simulation/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scenarioId,
          patientId,
          parameters
        })
      });

      if (!response.ok) {
        throw new Error('Failed to run simulation');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error running simulation:', error);
      throw error;
    }
  }

  async getSimulationResults(simulationId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/treatment/simulation/results/${simulationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch simulation results');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching simulation results:', error);
      throw error;
    }
  }

  async getDrugPathwayDetails(drugName: string): Promise<DrugPathway | null> {
    try {
      const response = await fetch(`${this.baseUrl}/treatment/drugs/pathway?drug=${encodeURIComponent(drugName)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch drug pathway details');
      }

      const data = await response.json();
      return data.pathway || null;
    } catch (error) {
      console.error('Error fetching drug pathway details:', error);
      return null;
    }
  }

  async getPatientGeneticProfile(patientId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/patients/${patientId}/genetic-profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch patient genetic profile');
      }

      const data = await response.json();
      return data.geneticProfile || null;
    } catch (error) {
      console.error('Error fetching patient genetic profile:', error);
      return null;
    }
  }

  async generatePersonalizedScenarios(patientId: string, currentTreatments?: string[]): Promise<SimulationScenario[]> {
    try {
      const response = await fetch(`${this.baseUrl}/treatment/simulation/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId,
          currentTreatments
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate personalized scenarios');
      }

      const data = await response.json();
      return data.scenarios || [];
    } catch (error) {
      console.error('Error generating personalized scenarios:', error);
      return [];
    }
  }
}

export default new TreatmentSimulationService();
export type { SimulationScenario, BodySystem, PredictiveModel, DrugPathway, SideEffect };