import { 
  NGSReport, 
  GenomicVariant, 
  GenomicAnalysisResult, 
  TreatmentOption, 
  ClinicalTrial, 
  TherapeuticImplication,
  BiomarkerPanel,
  HereditaryRisk,
  PharmacogenomicResult
} from '../types/genomics';
import { Patient } from '../types/clinical';

export class GenomicAnalysisService {
  private static readonly ONCOKB_API_BASE = 'https://www.oncokb.org/api/v1';
  private static readonly CIVIC_API_BASE = 'https://civicdb.org/api';
  
  // Process uploaded NGS report
  public static async processNGSReport(file: File, patientId: string): Promise<NGSReport> {
    try {
      const fileContent = await this.readFileContent(file);
      const parsedData = await this.parseNGSFile(fileContent, file.name);
      
      const report: NGSReport = {
        id: `ngs_${Date.now()}`,
        patientId,
        reportDate: new Date().toISOString().split('T')[0],
        testType: this.detectTestType(parsedData),
        platform: parsedData.platform || 'Unknown',
        laboratoryName: parsedData.laboratory || 'Unknown',
        sampleInfo: {
          type: parsedData.sampleType || 'tissue',
          site: parsedData.sampleSite || 'Unknown',
          collectionDate: parsedData.collectionDate || new Date().toISOString().split('T')[0],
          tumorCellularity: parsedData.tumorCellularity
        },
        variants: await this.annotateVariants(parsedData.variants || []),
        copyNumberVariants: parsedData.copyNumberVariants || [],
        structuralVariants: parsedData.structuralVariants || [],
        microsatelliteStatus: parsedData.microsatelliteStatus || 'unknown',
        tumorMutationalBurden: parsedData.tumorMutationalBurden || 0,
        homologousRecombinationDeficiency: parsedData.hrdScore,
        qualityMetrics: {
          averageCoverage: parsedData.averageCoverage || 0,
          percentCovered: parsedData.percentCovered || 0,
          contamination: parsedData.contamination || 0
        },
        clinicalInterpretation: await this.generateClinicalInterpretation(parsedData),
        recommendedActions: await this.generateRecommendedActions(parsedData)
      };
      
      return report;
    } catch (error) {
      console.error('Error processing NGS report:', error);
      throw new Error('Failed to process NGS report');
    }
  }
  
  // Generate comprehensive genomic analysis
  public static async analyzeGenomicProfile(
    patient: Patient, 
    ngsReport: NGSReport
  ): Promise<GenomicAnalysisResult> {
    try {
      // Identify actionable variants
      const actionableVariants = await this.identifyActionableVariants(ngsReport.variants);
      
      // Find treatment options
      const treatmentOptions = await this.findTreatmentOptions(
        actionableVariants, 
        patient.diagnosis
      );
      
      // Match clinical trials
      const clinicalTrials = await this.matchClinicalTrials(
        patient, 
        actionableVariants
      );
      
      // Assess hereditary risks
      const hereditaryRisks = await this.assessHereditaryRisks(ngsReport.variants);
      
      // Pharmacogenomic analysis
      const pharmacogenomics = await this.analyzePharmacogenomics(ngsReport.variants);
      
      const analysis: GenomicAnalysisResult = {
        patientId: patient.id,
        analysisDate: new Date().toISOString().split('T')[0],
        actionableVariants,
        treatmentOptions,
        clinicalTrials,
        hereditaryRisks,
        pharmacogenomics,
        executiveSummary: this.generateExecutiveSummary(
          actionableVariants,
          treatmentOptions,
          clinicalTrials
        ),
        keyRecommendations: this.generateKeyRecommendations(
          treatmentOptions,
          clinicalTrials,
          hereditaryRisks
        )
      };
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing genomic profile:', error);
      throw new Error('Failed to analyze genomic profile');
    }
  }
  
  // Get available biomarker panels
  public static getBiomarkerPanels(): BiomarkerPanel[] {
    return [
      {
        id: 'foundation_one_cdx',
        name: 'FoundationOne CDx',
        cancerTypes: ['Solid tumors'],
        biomarkers: [
          {
            name: 'BRCA1/2 mutations',
            gene: 'BRCA1',
            type: 'mutation',
            methodology: 'NGS',
            therapeuticRelevance: [
              {
                drug: 'Olaparib',
                indication: 'Ovarian cancer',
                evidenceLevel: 'FDA_approved',
                response: 'responsive',
                description: 'PARP inhibitor for BRCA-mutated cancers'
              }
            ]
          },
          {
            name: 'EGFR mutations',
            gene: 'EGFR',
            type: 'mutation',
            methodology: 'NGS',
            therapeuticRelevance: [
              {
                drug: 'Erlotinib',
                indication: 'NSCLC',
                evidenceLevel: 'FDA_approved',
                response: 'responsive',
                description: 'EGFR TKI for sensitizing mutations'
              }
            ]
          }
        ],
        methodology: 'Next-generation sequencing',
        turnaroundTime: 14,
        cost: 5800
      },
      {
        id: 'guardant360',
        name: 'Guardant360',
        cancerTypes: ['Solid tumors'],
        biomarkers: [
          {
            name: 'Circulating tumor DNA',
            type: 'mutation',
            methodology: 'NGS',
            therapeuticRelevance: [
              {
                drug: 'Various targeted therapies',
                indication: 'Multiple cancers',
                evidenceLevel: 'FDA_approved',
                response: 'responsive',
                description: 'Liquid biopsy for actionable mutations'
              }
            ]
          }
        ],
        methodology: 'Liquid biopsy NGS',
        turnaroundTime: 7,
        cost: 4200
      }
    ];
  }
  
  // Find treatment options based on genomic variants
  private static async findTreatmentOptions(
    variants: GenomicVariant[], 
    diagnosis: string
  ): Promise<TreatmentOption[]> {
    const treatmentOptions: TreatmentOption[] = [];
    
    for (const variant of variants) {
      for (const implication of variant.therapeuticImplications) {
        if (implication.implication === 'responsive') {
          treatmentOptions.push({
            drug: implication.drug,
            drugClass: implication.drugClass,
            mechanism: this.getDrugMechanism(implication.drug),
            fdaApproval: this.getFDAApprovalStatus(implication.drug, diagnosis),
            evidenceLevel: this.mapEvidenceLevel(implication.evidenceLevel),
            supportingVariants: [`${variant.gene} ${variant.variant}`],
            contraindications: [],
            expectedResponse: this.getExpectedResponse(implication.evidenceLevel),
            references: implication.references
          });
        }
      }
    }
    
    return this.deduplicateTreatmentOptions(treatmentOptions);
  }
  
  // Match clinical trials based on patient and genomic profile
  private static async matchClinicalTrials(
    patient: Patient, 
    variants: GenomicVariant[]
  ): Promise<ClinicalTrial[]> {
    // Simulate clinical trial matching
    const mockTrials: ClinicalTrial[] = [
      {
        nctId: 'NCT04526899',
        title: 'Study of Targeted Therapy in Advanced Solid Tumors',
        phase: 'II',
        status: 'recruiting',
        eligibilityCriteria: {
          cancerTypes: ['Non-small cell lung cancer', 'Colorectal cancer'],
          biomarkers: ['KRAS G12C', 'EGFR exon 19 deletion'],
          priorTreatments: ['Platinum-based chemotherapy'],
          ecogStatus: [0, 1],
          ageRange: { min: 18, max: 75 }
        },
        primaryEndpoint: 'Objective response rate',
        secondaryEndpoints: ['Progression-free survival', 'Overall survival'],
        estimatedEnrollment: 120,
        locations: [
          {
            facility: 'Memorial Sloan Kettering Cancer Center',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            status: 'recruiting',
            contactInfo: 'clinicaltrials@mskcc.org'
          }
        ],
        interventions: [
          {
            type: 'drug',
            name: 'AMG 510',
            description: 'KRAS G12C inhibitor',
            armLabel: 'Treatment Arm A'
          }
        ],
        matchScore: 85,
        matchReasons: ['KRAS G12C mutation detected', 'Cancer type match']
      }
    ];
    
    // Filter trials based on patient criteria
    return mockTrials.filter(trial => {
      const age = this.calculateAge(patient.dateOfBirth);
      const matchesAge = age >= trial.eligibilityCriteria.ageRange.min && 
                        age <= trial.eligibilityCriteria.ageRange.max;
      const matchesCancer = trial.eligibilityCriteria.cancerTypes.some(type =>
        patient.diagnosis.toLowerCase().includes(type.toLowerCase())
      );
      const matchesECOG = trial.eligibilityCriteria.ecogStatus.includes(
        patient.ecogPerformanceStatus || 1
      );
      
      return matchesAge && matchesCancer && matchesECOG;
    });
  }
  
  // Assess hereditary cancer risks
  private static async assessHereditaryRisks(variants: GenomicVariant[]): Promise<HereditaryRisk[]> {
    const hereditaryRisks: HereditaryRisk[] = [];
    
    const hereditaryGenes = ['BRCA1', 'BRCA2', 'TP53', 'MLH1', 'MSH2', 'MSH6', 'PMS2', 'APC'];
    
    for (const variant of variants) {
      if (hereditaryGenes.includes(variant.gene) && 
          variant.clinicalSignificance === 'pathogenic') {
        hereditaryRisks.push({
          syndrome: this.getAssociatedSyndrome(variant.gene),
          gene: variant.gene,
          variant: variant.variant,
          penetrance: this.getGenePenetrance(variant.gene),
          recommendations: this.getHereditaryRecommendations(variant.gene),
          familyScreening: true
        });
      }
    }
    
    return hereditaryRisks;
  }
  
  // Analyze pharmacogenomics
  private static async analyzePharmacogenomics(variants: GenomicVariant[]): Promise<PharmacogenomicResult[]> {
    const pgxResults: PharmacogenomicResult[] = [];
    
    const pgxGenes = ['CYP2D6', 'CYP2C19', 'CYP3A4', 'DPYD', 'UGT1A1', 'TPMT'];
    
    for (const variant of variants) {
      if (pgxGenes.includes(variant.gene)) {
        pgxResults.push({
          drug: this.getPGxDrug(variant.gene),
          gene: variant.gene,
          variant: variant.variant,
          phenotype: this.getPGxPhenotype(variant.gene, variant.variant),
          recommendation: this.getPGxRecommendation(variant.gene, variant.variant),
          dosageAdjustment: this.getPGxDosageAdjustment(variant.gene),
          warningLevel: this.getPGxWarningLevel(variant.gene, variant.variant)
        });
      }
    }
    
    return pgxResults;
  }
  
  // Helper methods
  private static async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }
  
  private static async parseNGSFile(content: string, filename: string): Promise<any> {
    // Simplified parser - in reality would handle VCF, JSON, etc.
    try {
      if (filename.endsWith('.json')) {
        return JSON.parse(content);
      } else if (filename.endsWith('.vcf')) {
        return this.parseVCF(content);
      } else {
        throw new Error('Unsupported file format');
      }
    } catch (error) {
      throw new Error('Failed to parse NGS file');
    }
  }
  
  private static parseVCF(content: string): any {
    // Simplified VCF parser
    const lines = content.split('\n');
    const variants = [];
    
    for (const line of lines) {
      if (line.startsWith('#')) continue;
      const fields = line.split('\t');
      if (fields.length >= 8) {
        variants.push({
          chromosome: fields[0],
          position: parseInt(fields[1]),
          ref: fields[3],
          alt: fields[4],
          quality: parseFloat(fields[5]) || 0
        });
      }
    }
    
    return { variants };
  }
  
  private static detectTestType(data: any): 'tumor' | 'germline' | 'liquid_biopsy' | 'rna_seq' {
    if (data.testType) return data.testType;
    if (data.sampleType === 'blood') return 'liquid_biopsy';
    if (data.methodology?.includes('RNA')) return 'rna_seq';
    return 'tumor';
  }
  
  private static async annotateVariants(variants: any[]): Promise<GenomicVariant[]> {
    // Simplified annotation - would integrate with real annotation services
    return variants.map((v, index) => ({
      id: `var_${index}`,
      gene: v.gene || 'Unknown',
      variant: v.variant || `${v.ref}>${v.alt}`,
      chromosome: v.chromosome || '',
      position: v.position || 0,
      ref: v.ref || '',
      alt: v.alt || '',
      variantType: v.variantType || 'SNV',
      clinicalSignificance: v.clinicalSignificance || 'uncertain',
      therapeuticImplications: v.therapeuticImplications || [],
      coverage: v.coverage || 0,
      alleleFrequency: v.alleleFrequency || 0,
      quality: v.quality || 0,
      consequence: v.consequence || '',
      impact: v.impact || 'modifier',
      annotations: v.annotations || []
    }));
  }
  
  private static async identifyActionableVariants(variants: GenomicVariant[]): Promise<GenomicVariant[]> {
    return variants.filter(variant => 
      variant.therapeuticImplications.length > 0 &&
      variant.clinicalSignificance !== 'benign'
    );
  }
  
  private static getDrugMechanism(drug: string): string {
    const mechanisms: Record<string, string> = {
      'Olaparib': 'PARP inhibitor',
      'Erlotinib': 'EGFR tyrosine kinase inhibitor',
      'Trastuzumab': 'HER2-targeted monoclonal antibody',
      'Pembrolizumab': 'PD-1 checkpoint inhibitor'
    };
    return mechanisms[drug] || 'Unknown mechanism';
  }
  
  private static getFDAApprovalStatus(drug: string, diagnosis: string): 'approved' | 'investigational' | 'off_label' {
    // Simplified approval status
    const approvedCombos = [
      'Olaparib-Ovarian cancer',
      'Erlotinib-NSCLC',
      'Trastuzumab-Breast cancer'
    ];
    
    const combo = `${drug}-${diagnosis}`;
    return approvedCombos.some(approved => combo.includes(approved.split('-')[0])) 
      ? 'approved' : 'off_label';
  }
  
  private static mapEvidenceLevel(level: string): 'high' | 'moderate' | 'low' {
    if (level === 'A' || level === 'B') return 'high';
    if (level === 'C') return 'moderate';
    return 'low';
  }
  
  private static getExpectedResponse(evidenceLevel: string): string {
    if (evidenceLevel === 'A') return 'High likelihood of response (>70%)';
    if (evidenceLevel === 'B') return 'Moderate likelihood of response (40-70%)';
    return 'Lower likelihood of response (<40%)';
  }
  
  private static deduplicateTreatmentOptions(options: TreatmentOption[]): TreatmentOption[] {
    const seen = new Set();
    return options.filter(option => {
      const key = `${option.drug}-${option.drugClass}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  
  private static calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
  
  private static getAssociatedSyndrome(gene: string): string {
    const syndromes: Record<string, string> = {
      'BRCA1': 'Hereditary Breast and Ovarian Cancer Syndrome',
      'BRCA2': 'Hereditary Breast and Ovarian Cancer Syndrome',
      'TP53': 'Li-Fraumeni Syndrome',
      'MLH1': 'Lynch Syndrome',
      'MSH2': 'Lynch Syndrome',
      'MSH6': 'Lynch Syndrome',
      'PMS2': 'Lynch Syndrome',
      'APC': 'Familial Adenomatous Polyposis'
    };
    return syndromes[gene] || 'Unknown syndrome';
  }
  
  private static getGenePenetrance(gene: string): number {
    const penetrance: Record<string, number> = {
      'BRCA1': 0.72,
      'BRCA2': 0.69,
      'TP53': 0.90,
      'MLH1': 0.80,
      'MSH2': 0.80,
      'MSH6': 0.44,
      'PMS2': 0.20
    };
    return penetrance[gene] || 0.5;
  }
  
  private static getHereditaryRecommendations(gene: string): string[] {
    const recommendations: Record<string, string[]> = {
      'BRCA1': [
        'Annual breast MRI starting at age 25',
        'Consider risk-reducing mastectomy',
        'Consider risk-reducing salpingo-oophorectomy'
      ],
      'BRCA2': [
        'Annual breast MRI starting at age 25',
        'Consider risk-reducing mastectomy',
        'Consider risk-reducing salpingo-oophorectomy'
      ],
      'TP53': [
        'Comprehensive cancer screening protocol',
        'Avoid radiation exposure when possible',
        'Annual whole-body MRI'
      ]
    };
    return recommendations[gene] || ['Genetic counseling recommended'];
  }
  
  private static getPGxDrug(gene: string): string {
    const drugs: Record<string, string> = {
      'CYP2D6': 'Tamoxifen, Codeine',
      'CYP2C19': 'Clopidogrel, Omeprazole',
      'DPYD': '5-Fluorouracil, Capecitabine',
      'UGT1A1': 'Irinotecan',
      'TPMT': '6-Mercaptopurine, Azathioprine'
    };
    return drugs[gene] || 'Unknown';
  }
  
  private static getPGxPhenotype(gene: string, variant: string): string {
    // Simplified phenotype mapping
    if (variant.includes('*1/*1')) return 'Normal metabolizer';
    if (variant.includes('*2') || variant.includes('*3')) return 'Poor metabolizer';
    return 'Intermediate metabolizer';
  }
  
  private static getPGxRecommendation(gene: string, variant: string): string {
    const phenotype = this.getPGxPhenotype(gene, variant);
    if (phenotype === 'Poor metabolizer') {
      return 'Consider alternative therapy or dose reduction';
    }
    return 'Standard dosing recommended';
  }
  
  private static getPGxDosageAdjustment(gene: string): string {
    return 'Consult pharmacogenomics guidelines';
  }
  
  private static getPGxWarningLevel(gene: string, variant: string): 'high' | 'moderate' | 'low' {
    const phenotype = this.getPGxPhenotype(gene, variant);
    if (phenotype === 'Poor metabolizer') return 'high';
    if (phenotype === 'Intermediate metabolizer') return 'moderate';
    return 'low';
  }
  
  private static async generateClinicalInterpretation(data: any): Promise<string> {
    return 'Clinical interpretation based on genomic findings and current evidence.';
  }
  
  private static async generateRecommendedActions(data: any): Promise<any[]> {
    return [];
  }
  
  private static generateExecutiveSummary(
    variants: GenomicVariant[],
    treatments: TreatmentOption[],
    trials: ClinicalTrial[]
  ): string {
    return `Analysis identified ${variants.length} actionable variants with ${treatments.length} treatment options and ${trials.length} matching clinical trials.`;
  }
  
  private static generateKeyRecommendations(
    treatments: TreatmentOption[],
    trials: ClinicalTrial[],
    hereditary: HereditaryRisk[]
  ): string[] {
    const recommendations = [];
    
    if (treatments.length > 0) {
      recommendations.push(`Consider targeted therapy: ${treatments[0].drug}`);
    }
    
    if (trials.length > 0) {
      recommendations.push(`Evaluate clinical trial eligibility: ${trials[0].title}`);
    }
    
    if (hereditary.length > 0) {
      recommendations.push(`Genetic counseling recommended for ${hereditary[0].syndrome}`);
    }
    
    return recommendations;
  }
}

export const genomicAnalysisService = new GenomicAnalysisService();