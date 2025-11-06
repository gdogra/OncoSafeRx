import { Drug } from '../types';

export interface PharmacogenomicProfile {
  patientId: string;
  phenotypes: Record<string, string>;
  genotypes?: Record<string, string>;
  lastUpdated: string;
  source: 'lab_report' | 'clinical_input' | 'inferred';
}

export interface GeneDrugRecommendation {
  gene: string;
  drug: string;
  drugRxcui?: string;
  phenotype: string;
  recommendation: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  implications: string;
  dosageAdjustment?: string;
  alternativeDrugs?: string[];
  severity: 'low' | 'moderate' | 'high' | 'critical';
  sources: string[];
}

export interface PharmacogenomicAnalysis {
  patientProfile: PharmacogenomicProfile;
  drugRecommendations: GeneDrugRecommendation[];
  riskAlerts: {
    gene: string;
    drug: string;
    risk: string;
    severity: 'low' | 'moderate' | 'high' | 'critical';
    action: string;
  }[];
  dosingAdjustments: {
    drug: string;
    currentDose?: string;
    recommendedDose: string;
    rationale: string;
  }[];
  alternativeTherapies: {
    originalDrug: string;
    alternatives: {
      drug: string;
      rationale: string;
      evidenceLevel: string;
    }[];
  }[];
}

class PharmacogenomicsService {
  private readonly baseUrl = '/api/genomics';

  // Get CPIC guidelines for specific genes and drugs
  async getCPICGuidelines(params?: { gene?: string; drug?: string }): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.gene) queryParams.append('gene', params.gene);
      if (params?.drug) queryParams.append('drug', params.drug);
      
      const response = await fetch(`${this.baseUrl}/cpic/guidelines?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch CPIC guidelines');
      
      const data = await response.json();
      return data.guidelines || [];
    } catch (error) {
      console.error('Error fetching CPIC guidelines:', error);
      return [];
    }
  }

  // Analyze pharmacogenomic profile for given drugs
  async analyzePharmacogenomicProfile(
    drugs: Drug[],
    phenotypes: Record<string, string>
  ): Promise<PharmacogenomicAnalysis> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drugs: drugs.map(d => d.rxcui).filter(Boolean),
          genes: Object.keys(phenotypes),
          phenotypes
        })
      });

      if (!response.ok) throw new Error('Failed to analyze pharmacogenomic profile');
      
      const data = await response.json();
      return this.transformAnalysisResponse(data, drugs, phenotypes);
    } catch (error) {
      console.error('Error analyzing pharmacogenomic profile:', error);
      // Return fallback analysis
      return this.getFallbackAnalysis(drugs, phenotypes);
    }
  }

  // Get recommendations for specific gene-drug pairs
  async getGeneDrugRecommendations(
    gene: string,
    drugs: Drug[]
  ): Promise<GeneDrugRecommendation[]> {
    try {
      const recommendations: GeneDrugRecommendation[] = [];
      
      for (const drug of drugs) {
        const guidelines = await this.getCPICGuidelines({ gene, drug: drug.name });
        
        for (const guideline of guidelines) {
          recommendations.push({
            gene: guideline.gene,
            drug: guideline.drug,
            drugRxcui: guideline.drugRxcui,
            phenotype: guideline.phenotype,
            recommendation: guideline.recommendation,
            evidenceLevel: guideline.evidenceLevel || 'C',
            implications: guideline.implications || '',
            dosageAdjustment: guideline.dosageAdjustment,
            severity: this.categorizeRiskSeverity(guideline.implications),
            sources: guideline.sources || ['CPIC']
          });
        }
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error getting gene-drug recommendations:', error);
      return [];
    }
  }

  // Generate personalized dosing recommendations
  async generateDosingRecommendations(
    drugs: Drug[],
    phenotypes: Record<string, string>,
    patientFactors?: {
      age?: number;
      weight?: number;
      renalFunction?: 'normal' | 'mild' | 'moderate' | 'severe';
      hepaticFunction?: 'normal' | 'mild' | 'moderate' | 'severe';
    }
  ): Promise<any[]> {
    try {
      const response = await fetch('/api/dosing/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drugs: drugs.map(d => ({ rxcui: d.rxcui, name: d.name })),
          phenotypes,
          patientFactors
        })
      });

      if (!response.ok) throw new Error('Failed to generate dosing recommendations');
      
      const data = await response.json();
      return data.recommendations || [];
    } catch (error) {
      console.error('Error generating dosing recommendations:', error);
      return [];
    }
  }

  // Get alternative therapies based on genetic profile
  async getAlternativeTherapies(
    originalDrugs: Drug[],
    phenotypes: Record<string, string>
  ): Promise<any[]> {
    try {
      const response = await fetch('/api/alternatives/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drugs: originalDrugs.map(d => d.rxcui),
          phenotypes,
          includeGenomicGuidance: true
        })
      });

      if (!response.ok) throw new Error('Failed to get alternative therapies');
      
      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Error getting alternative therapies:', error);
      return [];
    }
  }

  // Save patient pharmacogenomic profile
  async savePatientProfile(profile: PharmacogenomicProfile): Promise<boolean> {
    try {
      // For now, save to localStorage with Supabase integration planned
      localStorage.setItem(`pgx_profile_${profile.patientId}`, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error('Error saving patient profile:', error);
      return false;
    }
  }

  // Load patient pharmacogenomic profile
  async loadPatientProfile(patientId: string): Promise<PharmacogenomicProfile | null> {
    try {
      const saved = localStorage.getItem(`pgx_profile_${patientId}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading patient profile:', error);
      return null;
    }
  }

  private transformAnalysisResponse(
    data: any,
    drugs: Drug[],
    phenotypes: Record<string, string>
  ): PharmacogenomicAnalysis {
    // Transform API response to our analysis format
    return {
      patientProfile: {
        patientId: data.patientId || 'current',
        phenotypes,
        lastUpdated: new Date().toISOString(),
        source: 'clinical_input'
      },
      drugRecommendations: data.recommendations || [],
      riskAlerts: data.alerts || [],
      dosingAdjustments: data.dosing || [],
      alternativeTherapies: data.alternatives || []
    };
  }

  private getFallbackAnalysis(
    drugs: Drug[],
    phenotypes: Record<string, string>
  ): PharmacogenomicAnalysis {
    // Provide basic analysis when API is unavailable
    return {
      patientProfile: {
        patientId: 'current',
        phenotypes,
        lastUpdated: new Date().toISOString(),
        source: 'clinical_input'
      },
      drugRecommendations: [],
      riskAlerts: [],
      dosingAdjustments: [],
      alternativeTherapies: []
    };
  }

  private categorizeRiskSeverity(implications: string): 'low' | 'moderate' | 'high' | 'critical' {
    const lowerImplications = implications.toLowerCase();
    
    if (lowerImplications.includes('severe') || lowerImplications.includes('life-threatening')) {
      return 'critical';
    } else if (lowerImplications.includes('increased risk') || lowerImplications.includes('toxicity')) {
      return 'high';
    } else if (lowerImplications.includes('reduced') || lowerImplications.includes('efficacy')) {
      return 'moderate';
    }
    
    return 'low';
  }

  // Static data for common pharmacogenes
  getCommonPharmacogenes(): string[] {
    return [
      'CYP2D6', 'CYP2C9', 'CYP2C19', 'CYP3A4', 'CYP3A5',
      'DPYD', 'UGT1A1', 'TPMT', 'VKORC1', 'CFTR',
      'HLA-A', 'HLA-B', 'HLA-DQA1', 'SLCO1B1', 'ABCB1',
      'COMT', 'OPRM1', 'HTR2A'
    ];
  }

  // Get phenotype options for a specific gene
  getPhenotypeOptions(gene: string): string[] {
    const phenotypeMap: Record<string, string[]> = {
      'CYP2D6': ['Ultrarapid metabolizer', 'Extensive metabolizer', 'Intermediate metabolizer', 'Poor metabolizer'],
      'CYP2C9': ['*1/*1', '*1/*2', '*1/*3', '*2/*2', '*2/*3', '*3/*3'],
      'CYP2C19': ['Ultrarapid metabolizer', 'Rapid metabolizer', 'Extensive metabolizer', 'Intermediate metabolizer', 'Poor metabolizer'],
      'DPYD': ['Normal', 'DPYD deficiency', 'Intermediate activity', 'Poor metabolizer'],
      'UGT1A1': ['*1/*1', '*1/*28', '*28/*28'],
      'TPMT': ['Normal', 'Intermediate', 'Low', 'Deficient'],
      'VKORC1': ['GG', 'GA', 'AA'],
      'HLA-B': ['*5701 positive', '*5701 negative', '*1502 positive', '*1502 negative']
    };

    return phenotypeMap[gene] || ['Normal', 'Variant'];
  }
}

export const pharmacogenomicsService = new PharmacogenomicsService();
export default pharmacogenomicsService;