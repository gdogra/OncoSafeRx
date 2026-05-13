import { authedFetch } from '../utils/authedFetch';
import { CPIC_GUIDELINES_EXPANDED } from '../data/cpicGuidelinesExpanded';
import type { Drug } from '../types';

/**
 * Patient pharmacogenomic profile — stored phenotypes for a patient.
 * Persisted to backend when available; otherwise cached in localStorage so the
 * panel remains useful in dev / preview environments.
 */
export interface PharmacogenomicProfile {
  patientId: string;
  /** Map of gene symbol → phenotype label (e.g. CYP2D6 → "Poor Metabolizer"). */
  phenotypes: Record<string, string>;
  lastUpdated: string;
  source: 'clinical_input' | 'lab_report' | 'imported' | 'unknown';
}

/** A single gene → drug recommendation surfaced to the panel. */
export interface GeneDrugRecommendation {
  drug: string;
  gene: string;
  phenotype: string;
  /** Clinical risk / implication (what could go wrong) — used as the body text. */
  risk: string;
  /** Action / recommendation (what to do about it). */
  action: string;
  /** Original guideline recommendation text — kept for completeness. */
  recommendation: string;
  evidenceLevel?: string;
  sources?: string[];
  pmids?: string[];
  severity: 'critical' | 'high' | 'moderate' | 'informational';
}

/**
 * Aggregated PGx analysis for a selected drug list against a patient's
 * phenotype profile. Each list is empty (not null) when no matching CPIC
 * guideline is found — the panel renders an "informational" state in that
 * case so users do NOT mistake "no match" for "no concern".
 */
export interface PharmacogenomicAnalysis {
  /** High-severity actionable alerts (avoid / contraindicated). */
  riskAlerts: GeneDrugRecommendation[];
  /** Recommended dose adjustments based on phenotype. */
  dosingAdjustments: Array<{
    drug: string;
    recommendedDose: string;
    rationale: string;
    evidenceLevel?: string;
    sources?: string[];
  }>;
  /** Alternative therapies suggested by guidelines, grouped per original drug. */
  alternativeTherapies: Array<{
    originalDrug: string;
    alternatives: Array<{
      drug: string;
      evidenceLevel?: string;
      rationale: string;
    }>;
  }>;
  /**
   * Drugs from the input list that had at least one phenotype check performed
   * but no actionable CPIC match. Surfaces "explicitly considered, no alert"
   * vs. "we never looked" to the user.
   */
  unmatchedDrugs: string[];
  /** Provenance — which guideline corpus was consulted. */
  source: 'CPIC' | 'CPIC+DPWG+FDA';
  generatedAt: string;
}

const PHENOTYPE_OPTIONS_BY_GENE: Record<string, string[]> = {
  CYP2D6: ['Poor Metabolizer', 'Intermediate Metabolizer', 'Normal Metabolizer', 'Rapid Metabolizer', 'Ultrarapid Metabolizer'],
  CYP2C19: ['Poor Metabolizer', 'Intermediate Metabolizer', 'Normal Metabolizer', 'Rapid Metabolizer', 'Ultrarapid Metabolizer'],
  CYP2C9: ['Poor Metabolizer', 'Intermediate Metabolizer', 'Normal Metabolizer'],
  CYP3A4: ['Poor Metabolizer', 'Intermediate Metabolizer', 'Normal Metabolizer', 'Rapid Metabolizer'],
  CYP3A5: ['Poor Expressor', 'Intermediate Expressor', 'Normal Expressor'],
  CYP1A2: ['Slow Metabolizer', 'Normal Metabolizer', 'Rapid Metabolizer'],
  CYP2B6: ['Poor Metabolizer', 'Intermediate Metabolizer', 'Normal Metabolizer', 'Rapid Metabolizer'],
  UGT1A1: ['Poor Metabolizer (*28/*28)', 'Intermediate Metabolizer (*1/*28)', 'Normal Metabolizer (*1/*1)'],
  DPYD: ['Poor Metabolizer', 'Intermediate Metabolizer', 'Normal Metabolizer'],
  TPMT: ['Poor Metabolizer', 'Intermediate Metabolizer', 'Normal Metabolizer'],
  NUDT15: ['Poor Metabolizer', 'Intermediate Metabolizer', 'Normal Metabolizer'],
  SLCO1B1: ['Poor Function', 'Decreased Function', 'Normal Function', 'Increased Function'],
  VKORC1: ['Sensitive (-1639 AA)', 'Moderately Sensitive (-1639 GA)', 'Normal (-1639 GG)'],
  HLA_B: ['*57:01 positive', '*15:02 positive', '*58:01 positive', 'Negative'],
  // Fallback for any other gene
  default: ['Poor Metabolizer', 'Intermediate Metabolizer', 'Normal Metabolizer', 'Rapid Metabolizer', 'Ultrarapid Metabolizer'],
};

const PROFILE_STORAGE_KEY = (patientId: string) => `osrx_pgx_profile:${patientId}`;

function normalizeDrugName(name: string | undefined | null): string {
  return String(name || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, '') // drop parens like "(5-FU)"
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function drugMatches(selectedDrug: Drug, guidelineDrug: { name?: string; generic_name?: string }): boolean {
  const candidates = [selectedDrug.name, (selectedDrug as any).generic_name]
    .filter(Boolean)
    .map((n) => normalizeDrugName(n as string));
  const guidelineNames = [guidelineDrug.name, guidelineDrug.generic_name]
    .filter(Boolean)
    .map((n) => normalizeDrugName(n as string));
  for (const a of candidates) {
    for (const b of guidelineNames) {
      if (!a || !b) continue;
      if (a === b) return true;
      // Token-level overlap (e.g. "5-FU" vs "fluorouracil 5 fu")
      const aTokens = new Set(a.split(' ').filter(Boolean));
      const bTokens = new Set(b.split(' ').filter(Boolean));
      for (const t of aTokens) if (bTokens.has(t)) return true;
    }
  }
  return false;
}

function phenotypeMatches(patientPhenotype: string, guidelinePhenotype: string): boolean {
  // Conservative match: substring + normalized comparison so "Poor Metabolizer" matches
  // "Poor Metabolizer (*28/*28)" or "Poor/Intermediate Metabolizer".
  const a = normalizeDrugName(patientPhenotype);
  const b = normalizeDrugName(guidelinePhenotype);
  if (!a || !b) return false;
  return b.includes(a) || a.includes(b);
}

function severityFor(evidence?: string, recommendation?: string): GeneDrugRecommendation['severity'] {
  const rec = String(recommendation || '').toLowerCase();
  if (/\bavoid\b|\bcontraindicat/i.test(rec)) return 'critical';
  if (/reduce|alternative|10% of/i.test(rec)) return 'high';
  if (/consider|monitor|titrate/i.test(rec)) return 'moderate';
  if (evidence === 'A' || evidence === 'A/B') return 'high';
  return 'informational';
}

export interface GeneticVariant {
  gene: string;
  variant: string;
  genotype: string;
  phenotype: 'Poor Metabolizer' | 'Intermediate Metabolizer' | 'Normal Metabolizer' | 'Rapid Metabolizer' | 'Ultrarapid Metabolizer';
  clinicalSignificance: 'High' | 'Moderate' | 'Low' | 'Unknown';
  lastUpdated: string;
}

export interface DrugMetabolismProfile {
  drugName: string;
  affectedGenes: string[];
  metabolismRate: 'Very Slow' | 'Slow' | 'Normal' | 'Fast' | 'Very Fast';
  recommendedAction: 'Avoid' | 'Use Alternative' | 'Reduce Dose' | 'Standard Dose' | 'Increase Dose' | 'Monitor Closely';
  specificRecommendations: {
    startingDose: string;
    maxDose: string;
    titrationInterval: string;
    monitoringParameters: string[];
    alternativeDrugs: string[];
  };
  evidenceLevel: '1A' | '1B' | '2A' | '2B' | '3' | '4';
  guidelines: string[];
  warnings: string[];
}

export interface DosingRecommendation {
  drugName: string;
  indication: string;
  patientFactors: {
    age: number;
    weight: number;
    height: number;
    bsa: number;
    creatinine: number;
    bilirubin: number;
    genetics: GeneticVariant[];
  };
  recommendedDose: {
    amount: string;
    frequency: string;
    route: string;
    duration: string;
  };
  adjustmentFactors: {
    geneticAdjustment: number; // multiplier
    renalAdjustment: number;
    hepaticAdjustment: number;
    ageAdjustment: number;
    combinedAdjustment: number;
  };
  monitoring: {
    parameters: string[];
    frequency: string;
    targets: { parameter: string; target: string; units: string }[];
  };
  interactions: {
    drug: string;
    effect: string;
    recommendation: string;
  }[];
  efficacyPrediction: {
    likelihood: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High';
    responseRate: number;
    timeToResponse: string;
  };
  toxicityPrediction: {
    overallRisk: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High';
    specificRisks: { toxicity: string; risk: string; prevention: string }[];
  };
}

class PharmacogenomicsService {
  private baseUrl = '/api/pharmacogenomics';

  /**
   * Get list of common pharmacogenes for testing and display
   */
  getCommonPharmacogenes(): string[] {
    return [
      'CYP2D6', 'CYP2C19', 'CYP3A4', 'CYP3A5', 'CYP2C9',
      'CYP1A2', 'CYP2B6', 'UGT1A1', 'DPYD', 'TPMT', 'NUDT15',
      'COMT', 'SLCO1B1', 'ABCB1', 'ABCG2', 'VKORC1'
    ];
  }

  /**
   * Return the list of phenotype labels conventionally associated with a
   * given gene. Used by the panel's phenotype picker.
   */
  getPhenotypeOptions(gene: string): string[] {
    return PHENOTYPE_OPTIONS_BY_GENE[gene] || PHENOTYPE_OPTIONS_BY_GENE.default;
  }

  /**
   * Load a saved PGx profile for a patient. Tries the backend first; falls
   * back to localStorage so the panel works in dev/preview without API.
   * Returns null when no profile has been stored.
   */
  async loadPatientProfile(patientId: string): Promise<PharmacogenomicProfile | null> {
    try {
      const response = await authedFetch(`${this.baseUrl}/profile/${encodeURIComponent(patientId)}`);
      if (response.ok) {
        return (await response.json()) as PharmacogenomicProfile;
      }
    } catch {
      /* fall through to localStorage */
    }
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY(patientId));
      return raw ? (JSON.parse(raw) as PharmacogenomicProfile) : null;
    } catch {
      return null;
    }
  }

  /**
   * Save a PGx profile. Tries the backend; mirrors to localStorage for offline
   * resilience. Errors are swallowed so a transient API failure never crashes
   * the analysis flow.
   */
  async savePatientProfile(profile: PharmacogenomicProfile): Promise<void> {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY(profile.patientId), JSON.stringify(profile));
    } catch {
      /* localStorage can fail in private mode — non-fatal */
    }
    try {
      await authedFetch(`${this.baseUrl}/profile`, {
        method: 'POST',
        body: JSON.stringify(profile),
      });
    } catch {
      /* offline / no backend — already cached locally */
    }
  }

  /**
   * Analyze a list of selected drugs against a patient's phenotype map using
   * the CPIC/DPWG/FDA guideline corpus. Conservative behavior:
   *   - Only matches when BOTH the drug and the phenotype intersect a guideline.
   *   - Returns empty lists rather than fabricated recommendations on no-match.
   *   - Reports `unmatchedDrugs` so the UI can say "no guideline found" rather
   *     than implying "no concern".
   */
  async analyzePharmacogenomicProfile(
    selectedDrugs: Drug[],
    phenotypes: Record<string, string>
  ): Promise<PharmacogenomicAnalysis> {
    const riskAlerts: GeneDrugRecommendation[] = [];
    const dosingAdjustments: PharmacogenomicAnalysis['dosingAdjustments'] = [];
    const alternativeTherapies: PharmacogenomicAnalysis['alternativeTherapies'] = [];
    const unmatchedDrugs: string[] = [];

    for (const drug of selectedDrugs) {
      let matchedAny = false;
      for (const guideline of CPIC_GUIDELINES_EXPANDED as any[]) {
        const gene = guideline.gene_symbol;
        const patientPhenotype = phenotypes[gene];
        if (!patientPhenotype) continue;
        if (!drugMatches(drug, guideline.drug)) continue;
        if (!phenotypeMatches(patientPhenotype, guideline.phenotype)) continue;
        matchedAny = true;

        const recommendation = guideline.recommendation as string;
        const severity = severityFor(guideline.evidence_level, recommendation);

        if (severity === 'critical' || severity === 'high') {
          riskAlerts.push({
            drug: drug.name,
            gene,
            phenotype: patientPhenotype,
            risk: guideline.implications || recommendation,
            action: recommendation,
            recommendation,
            evidenceLevel: guideline.evidence_level,
            sources: guideline.sources,
            pmids: guideline.pmids,
            severity,
          });
        }

        if (guideline.dosage_adjustment && !/^standard/i.test(guideline.dosage_adjustment)) {
          dosingAdjustments.push({
            drug: drug.name,
            recommendedDose: guideline.dosage_adjustment,
            rationale: `${gene} ${patientPhenotype}: ${guideline.implications || recommendation}`,
            evidenceLevel: guideline.evidence_level,
            sources: guideline.sources,
          });
        }

        if (/\balternative\b|\bswitch\b|\bavoid\b/i.test(recommendation)) {
          // Group alternatives per original drug so the panel can render
          // "Alternative to {drug}" with the list of options underneath.
          let group = alternativeTherapies.find((a) => a.originalDrug === drug.name);
          if (!group) {
            group = { originalDrug: drug.name, alternatives: [] };
            alternativeTherapies.push(group);
          }
          group.alternatives.push({
            drug: 'Refer to CPIC guideline for specific alternative drug recommendation',
            evidenceLevel: guideline.evidence_level,
            rationale: recommendation,
          });
        }
      }
      if (!matchedAny) unmatchedDrugs.push(drug.name);
    }

    return {
      riskAlerts,
      dosingAdjustments,
      alternativeTherapies,
      unmatchedDrugs,
      source: 'CPIC+DPWG+FDA',
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate personalized dosing recommendations
   */
  async generateDosingRecommendation(
    patientId: string,
    drugName: string,
    indication: string,
    patientFactors: any
  ): Promise<DosingRecommendation> {
    try {
      const response = await authedFetch(`${this.baseUrl}/dosing`, {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          drugName,
          indication,
          patientFactors
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate dosing recommendation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating dosing recommendation:', error);
      return this.getMockDosingRecommendation(drugName);
    }
  }

  // Mock data for demo purposes
  private getMockDosingRecommendation(drugName: string): DosingRecommendation {
    return {
      drugName,
      indication: 'Breast Cancer',
      patientFactors: {
        age: 65,
        weight: 70,
        height: 165,
        bsa: 1.75,
        creatinine: 0.9,
        bilirubin: 0.8,
        genetics: []
      },
      recommendedDose: {
        amount: '20 mg',
        frequency: 'Daily',
        route: 'Oral',
        duration: '5 years or until progression'
      },
      adjustmentFactors: {
        geneticAdjustment: 0.8,
        renalAdjustment: 1.0,
        hepaticAdjustment: 1.0,
        ageAdjustment: 0.9,
        combinedAdjustment: 0.72
      },
      monitoring: {
        parameters: ['Endoxifen levels', 'Bone density', 'Lipid profile'],
        frequency: 'Every 3 months for first year, then every 6 months',
        targets: [
          { parameter: 'Endoxifen', target: '>5.9 ng/mL', units: 'ng/mL' },
          { parameter: 'Bone density', target: 'T-score >-2.5', units: 'T-score' }
        ]
      },
      interactions: [
        {
          drug: 'Paroxetine',
          effect: 'Strong CYP2D6 inhibition',
          recommendation: 'Avoid concomitant use or consider alternative antidepressant'
        }
      ],
      efficacyPrediction: {
        likelihood: 'Moderate',
        responseRate: 0.65,
        timeToResponse: '3-6 months'
      },
      toxicityPrediction: {
        overallRisk: 'Low',
        specificRisks: [
          {
            toxicity: 'Hot flashes',
            risk: 'High (>70%)',
            prevention: 'Lifestyle modifications, consider non-hormonal alternatives'
          },
          {
            toxicity: 'Venous thromboembolism',
            risk: 'Low (<1%)',
            prevention: 'Monitor for signs/symptoms, avoid prolonged immobility'
          }
        ]
      }
    };
  }
}

export const pharmacogenomicsService = new PharmacogenomicsService();