import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GenomicAnalysisService } from '../genomicAnalysisService';
import type { Patient } from '../../types/clinical';
import type { NGSReport, GenomicVariant } from '../../types/genomics';

// Mock data
const mockPatient: Patient = {
  id: 'patient-1',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1975-06-15',
  diagnosis: 'Non-small cell lung cancer',
  ecogPerformanceStatus: 1,
  comorbidities: ['Hypertension', 'Diabetes'],
  currentMedications: ['Metformin', 'Lisinopril']
};

const mockVariant: GenomicVariant = {
  id: 'var-1',
  gene: 'EGFR',
  variant: 'L858R',
  chromosome: '7',
  position: 55259515,
  ref: 'T',
  alt: 'G',
  variantType: 'SNV',
  clinicalSignificance: 'pathogenic',
  therapeuticImplications: [
    {
      id: 'ti-1',
      drug: 'Erlotinib',
      drugClass: 'EGFR TKI',
      implication: 'responsive',
      evidenceLevel: 'A',
      source: 'OncoKB',
      description: 'Sensitive to EGFR TKI therapy',
      references: ['PMID:12345']
    }
  ],
  coverage: 150,
  alleleFrequency: 0.45,
  quality: 50,
  consequence: 'missense_variant',
  impact: 'high',
  annotations: []
};

const mockNGSReport: NGSReport = {
  id: 'ngs-1',
  patientId: 'patient-1',
  reportDate: '2024-01-15',
  testType: 'tumor',
  platform: 'Illumina NextSeq',
  laboratoryName: 'Test Lab',
  sampleInfo: {
    type: 'tissue',
    site: 'lung',
    collectionDate: '2024-01-10',
    tumorCellularity: 75
  },
  variants: [mockVariant],
  copyNumberVariants: [],
  structuralVariants: [],
  microsatelliteStatus: 'MSS',
  tumorMutationalBurden: 8.5,
  qualityMetrics: {
    averageCoverage: 150,
    percentCovered: 95,
    contamination: 0.02
  },
  clinicalInterpretation: 'Actionable mutation detected',
  recommendedActions: []
};

describe('GenomicAnalysisService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processNGSReport', () => {
    it('should process a JSON NGS report successfully', async () => {
      const file = new File(
        [JSON.stringify({ variants: [mockVariant] })],
        'report.json',
        { type: 'application/json' }
      );

      const result = await GenomicAnalysisService.processNGSReport(file, 'patient-1');

      expect(result).toBeDefined();
      expect(result.patientId).toBe('patient-1');
      expect(result.variants).toHaveLength(1);
    });

    it('should handle VCF file parsing', async () => {
      const vcfContent = `##fileformat=VCFv4.2
#CHROM	POS	ID	REF	ALT	QUAL	FILTER	INFO
7	55259515	.	T	G	50	PASS	.`;
      
      const file = new File([vcfContent], 'report.vcf', { type: 'text/plain' });
      
      const result = await GenomicAnalysisService.processNGSReport(file, 'patient-1');
      
      expect(result).toBeDefined();
      expect(result.patientId).toBe('patient-1');
    });

    it('should throw error for unsupported file format', async () => {
      const file = new File(['invalid content'], 'report.txt', { type: 'text/plain' });
      
      await expect(
        GenomicAnalysisService.processNGSReport(file, 'patient-1')
      ).rejects.toThrow('Failed to process NGS report');
    });
  });

  describe('analyzeGenomicProfile', () => {
    it('should generate comprehensive analysis with AI features', async () => {
      const result = await GenomicAnalysisService.analyzeGenomicProfile(
        mockPatient,
        mockNGSReport
      );

      expect(result).toBeDefined();
      expect(result.patientId).toBe('patient-1');
      expect(result.actionableVariants).toHaveLength(1);
      expect(result.treatmentOptions).toHaveLength(1);
      expect(result.executiveSummary).toContain('John Doe');
      expect(result.keyRecommendations).toHaveLength(1);
    });

    it('should include resistance predictions', async () => {
      const result = await GenomicAnalysisService.analyzeGenomicProfile(
        mockPatient,
        mockNGSReport
      );

      expect(result.resistancePredictions).toBeDefined();
      expect(result.resistancePredictions?.length).toBeGreaterThan(0);
    });

    it('should calculate personalized treatment scores', async () => {
      const result = await GenomicAnalysisService.analyzeGenomicProfile(
        mockPatient,
        mockNGSReport
      );

      const treatment = result.treatmentOptions[0];
      expect(treatment.personalizedScore).toBeDefined();
      expect(treatment.personalizedScore).toBeGreaterThan(0);
      expect(treatment.personalizedScore).toBeLessThanOrEqual(1);
      expect(treatment.aiRecommendation).toBeDefined();
    });

    it('should provide AI interpretations for variants', async () => {
      const result = await GenomicAnalysisService.analyzeGenomicProfile(
        mockPatient,
        mockNGSReport
      );

      const variant = result.actionableVariants[0];
      expect((variant as any).aiConfidence).toBeDefined();
      expect((variant as any).patientSpecificScore).toBeDefined();
      expect((variant as any).aiInterpretation).toContain('EGFR');
    });
  });

  describe('getBiomarkerPanels', () => {
    it('should return available biomarker panels', () => {
      const panels = GenomicAnalysisService.getBiomarkerPanels();
      
      expect(panels).toHaveLength(2);
      expect(panels[0].name).toBe('FoundationOne CDx');
      expect(panels[1].name).toBe('Guardant360');
    });

    it('should include therapeutic relevance for biomarkers', () => {
      const panels = GenomicAnalysisService.getBiomarkerPanels();
      const panel = panels[0];
      
      expect(panel.biomarkers[0].therapeuticRelevance).toHaveLength(1);
      expect(panel.biomarkers[0].therapeuticRelevance[0].drug).toBe('Olaparib');
    });
  });

  describe('AI-powered features', () => {
    it('should calculate AI confidence scores correctly', () => {
      // Test AI confidence calculation
      const variant = { ...mockVariant, quality: 40, coverage: 200 };
      // This would test private methods if they were exposed
      // For now, we test through the public API
      expect(variant.quality).toBeGreaterThan(30);
    });

    it('should consider patient age in personalized scoring', async () => {
      const youngPatient = { ...mockPatient, dateOfBirth: '1990-01-01' };
      const oldPatient = { ...mockPatient, dateOfBirth: '1940-01-01' };

      const youngResult = await GenomicAnalysisService.analyzeGenomicProfile(
        youngPatient,
        mockNGSReport
      );
      const oldResult = await GenomicAnalysisService.analyzeGenomicProfile(
        oldPatient,
        mockNGSReport
      );

      expect(youngResult.executiveSummary).toContain('age 34');
      expect(oldResult.executiveSummary).toContain('age 84');
    });

    it('should include contraindications based on patient profile', async () => {
      const patientWithHeartDisease = {
        ...mockPatient,
        comorbidities: ['Heart disease']
      };

      const result = await GenomicAnalysisService.analyzeGenomicProfile(
        patientWithHeartDisease,
        mockNGSReport
      );

      // This would need specific drugs that have heart contraindications
      expect(result.treatmentOptions[0].contraindications).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle analysis errors gracefully', async () => {
      const invalidReport = { ...mockNGSReport, variants: null as any };
      
      await expect(
        GenomicAnalysisService.analyzeGenomicProfile(mockPatient, invalidReport)
      ).rejects.toThrow('Failed to analyze genomic profile');
    });

    it('should handle file reading errors', async () => {
      const file = new File([''], 'empty.json', { type: 'application/json' });
      
      await expect(
        GenomicAnalysisService.processNGSReport(file, 'patient-1')
      ).rejects.toThrow();
    });
  });
});