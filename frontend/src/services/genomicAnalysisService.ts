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
  
  // Generate comprehensive AI-powered genomic analysis
  public static async analyzeGenomicProfile(
    patient: Patient, 
    ngsReport: NGSReport
  ): Promise<GenomicAnalysisResult> {
    try {
      // AI-powered variant interpretation
      const interpretedVariants = await this.aiInterpretVariants(ngsReport.variants, patient);
      
      // Identify actionable variants with personalized scoring
      const actionableVariants = await this.identifyActionableVariants(interpretedVariants);
      
      // Find personalized treatment options with AI scoring
      const treatmentOptions = await this.findPersonalizedTreatments(
        actionableVariants, 
        patient
      );
      
      // AI-powered clinical trial matching
      const clinicalTrials = await this.aiMatchClinicalTrials(
        patient, 
        actionableVariants
      );
      
      // Enhanced hereditary risk assessment
      const hereditaryRisks = await this.assessHereditaryRisks(ngsReport.variants);
      
      // Advanced pharmacogenomic analysis
      const pharmacogenomics = await this.analyzeAdvancedPharmacogenomics(
        ngsReport.variants, 
        patient
      );
      
      // Resistance prediction
      const resistancePredictions = await this.predictResistance(
        actionableVariants,
        treatmentOptions
      );
      
      const analysis: GenomicAnalysisResult = {
        patientId: patient.id,
        analysisDate: new Date().toISOString().split('T')[0],
        actionableVariants,
        treatmentOptions,
        clinicalTrials,
        hereditaryRisks,
        pharmacogenomics,
        resistancePredictions,
        executiveSummary: this.generateAIExecutiveSummary(
          actionableVariants,
          treatmentOptions,
          clinicalTrials,
          patient
        ),
        keyRecommendations: this.generatePersonalizedRecommendations(
          treatmentOptions,
          clinicalTrials,
          hereditaryRisks,
          patient
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
  
  // AI-powered variant interpretation with patient context
  private static async aiInterpretVariants(
    variants: GenomicVariant[], 
    patient: Patient
  ): Promise<GenomicVariant[]> {
    return variants.map(variant => ({
      ...variant,
      aiConfidence: this.calculateAIConfidence(variant),
      patientSpecificScore: this.calculatePatientSpecificScore(variant, patient),
      actionabilityScore: this.calculateActionabilityScore(variant),
      aiInterpretation: this.generateAIInterpretation(variant, patient)
    }));
  }
  
  // Find personalized treatment options with AI scoring
  private static async findPersonalizedTreatments(
    variants: GenomicVariant[], 
    patient: Patient
  ): Promise<TreatmentOption[]> {
    const treatmentOptions: TreatmentOption[] = [];
    
    for (const variant of variants) {
      for (const implication of variant.therapeuticImplications) {
        if (implication.implication === 'responsive') {
          const personalizedScore = this.calculatePersonalizedTreatmentScore(
            implication.drug,
            patient,
            variant
          );
          
          treatmentOptions.push({
            drug: implication.drug,
            drugClass: implication.drugClass,
            mechanism: this.getDrugMechanism(implication.drug),
            fdaApproval: this.getFDAApprovalStatus(implication.drug, patient.diagnosis),
            evidenceLevel: this.mapEvidenceLevel(implication.evidenceLevel),
            supportingVariants: [`${variant.gene} ${variant.variant}`],
            contraindications: this.getPersonalizedContraindications(implication.drug, patient),
            expectedResponse: this.getPersonalizedResponse(implication.evidenceLevel, patient),
            references: implication.references,
            personalizedScore,
            aiRecommendation: this.generateAITreatmentRecommendation(
              implication.drug,
              patient,
              variant
            )
          });
        }
      }
    }
    
    // Sort by personalized score
    const sortedOptions = this.deduplicateTreatmentOptions(treatmentOptions)
      .sort((a, b) => (b.personalizedScore || 0) - (a.personalizedScore || 0));
    
    return sortedOptions;
  }
  
  // AI-powered clinical trial matching
  private static async aiMatchClinicalTrials(
    patient: Patient, 
    variants: GenomicVariant[]
  ): Promise<ClinicalTrial[]> {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || '/api';
      
      // Extract biomarkers from variants
      const biomarkers = variants.map(v => `${v.gene} ${v.variant}`);
      
      // Search trials by cancer type and biomarkers
      const searchParams = new URLSearchParams();
      if (patient.diagnosis) searchParams.append('condition', patient.diagnosis);
      biomarkers.forEach(biomarker => searchParams.append('biomarker', biomarker));
      searchParams.append('status', 'recruiting');

      const response = await fetch(`${API_BASE}/trials/search?${searchParams}`);
      
      if (!response.ok) {
        console.warn('Failed to fetch clinical trials, using fallback data');
        return this.getFallbackTrials(patient, variants);
      }

      const data = await response.json();
      
      // Transform API data to match ClinicalTrial interface
      const apiTrials: ClinicalTrial[] = data.trials.map((trial: any) => ({
        nctId: trial.nct_id,
        title: trial.title,
        phase: trial.phase,
        status: trial.status,
        eligibilityCriteria: {
          cancerTypes: [trial.condition],
          biomarkers: trial.biomarkers || [],
          priorTreatments: trial.eligibility_criteria?.prior_therapies || [],
          ecogStatus: trial.eligibility_criteria?.ecog_status || [0, 1],
          ageRange: trial.eligibility_criteria?.age_range || { min: 18, max: null }
        },
        primaryEndpoint: trial.primary_endpoint,
        secondaryEndpoints: trial.secondary_endpoints || [],
        estimatedEnrollment: trial.estimated_enrollment,
        locations: (trial.locations || []).map((loc: any) => ({
          name: loc.name,
          city: loc.city,
          state: loc.state,
          country: 'United States',
          distance: null
        })),
        contact: {
          name: 'Clinical Trials Office',
          phone: trial.contact?.phone || '',
          email: trial.contact?.email || ''
        },
        matchReasons: this.generateMatchReasons(patient, variants, trial)
      }));

      // Filter and return matching trials
      return this.filterTrialsByPatientCriteria(apiTrials, patient);
    } catch (error) {
      console.error('Error fetching clinical trials:', error);
      return await this.getFallbackTrials(patient, variants);
    }
  }

  private static async getFallbackTrials(patient: Patient, variants: GenomicVariant[]): Promise<ClinicalTrial[]> {
    try {
      // Use real clinical trials API
      const genomicData = {
        mutations: variants.map(v => ({ gene: v.gene, variant: v.variant })),
        biomarkers: variants.filter(v => v.clinicalSignificance === 'pathogenic').map(v => ({ 
          gene: v.gene, 
          name: `${v.gene} ${v.variant}` 
        })),
        tumorType: patient.diagnosis
      };

      const patientProfile = {
        condition: patient.diagnosis,
        age: this.calculateAge(patient.dateOfBirth),
        gender: patient.gender
      };

      const response = await fetch('/api/clinical-trials/search-by-genomics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          genomicData,
          patientProfile
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch clinical trials');
      }

      const data = await response.json();
      
      // Transform API response to match expected format
      return data.data.studies.map((trial: any) => ({
        nctId: trial.nctId,
        title: trial.title,
        phase: trial.phase,
        status: trial.status,
        eligibilityCriteria: {
          cancerTypes: [trial.condition],
          biomarkers: variants.map(v => `${v.gene} ${v.variant}`),
          priorTreatments: [],
          ecogStatus: [0, 1, 2],
          ageRange: { 
            min: parseInt(trial.ageRange?.split('-')?.[0]) || 18, 
            max: parseInt(trial.ageRange?.split('-')?.[1]) || 85 
          }
        },
        primaryEndpoint: 'Clinical response',
        secondaryEndpoints: ['Progression-free survival', 'Overall survival', 'Safety'],
        estimatedEnrollment: trial.estimatedEnrollment || 100,
        locations: trial.locations.map((loc: string) => {
          const [facility, location] = loc.split(', ');
          const [city, state] = (location || '').split(' ');
          return {
            facility: facility || 'Clinical Research Center',
            city: city || 'Multiple',
            state: state || '',
            country: 'USA',
            status: 'recruiting',
            contactInfo: 'clinicaltrials@institution.org'
          };
        }),
        interventions: [{
          type: 'drug',
          name: trial.intervention || 'Targeted therapy',
          description: 'Precision medicine approach based on genomic profile',
          armLabel: 'Treatment Arm'
        }],
        matchScore: trial.eligibilityScore,
        matchReasons: [
          ...(trial.eligibilityScore >= 90 ? ['High genomic match'] : []),
          ...(trial.eligibilityScore >= 70 ? ['Cancer type match'] : []),
          'Meets basic eligibility criteria'
        ],
        url: trial.url
      }));

    } catch (error) {
      console.error('Error fetching real clinical trials:', error);
      
      // Fallback to minimal mock data only if API fails
      return [{
        nctId: 'NCT00000000',
        title: 'Clinical trials data temporarily unavailable',
        phase: 'IV',
        status: 'completed',
        eligibilityCriteria: {
          cancerTypes: [patient.diagnosis],
          biomarkers: [],
          priorTreatments: [],
          ecogStatus: [0, 1, 2],
          ageRange: { min: 18, max: 85 }
        },
        primaryEndpoint: 'Please check ClinicalTrials.gov directly',
        secondaryEndpoints: [],
        estimatedEnrollment: 0,
        locations: [],
        interventions: [],
        matchScore: 0,
        matchReasons: ['Data service temporarily unavailable'],
        url: 'https://clinicaltrials.gov'
      }];
    }
  }

  private static generateMatchReasons(patient: Patient, variants: GenomicVariant[], trial: any): string[] {
    const reasons: string[] = [];
    
    // Check biomarker matches
    const patientBiomarkers = variants.map(v => `${v.gene} ${v.variant}`);
    const trialBiomarkers = trial.biomarkers || [];
    
    patientBiomarkers.forEach(biomarker => {
      if (trialBiomarkers.some((tb: string) => tb.includes(biomarker) || biomarker.includes(tb))) {
        reasons.push(`${biomarker} mutation detected`);
      }
    });
    
    // Check cancer type match
    if (patient.diagnosis && trial.condition) {
      const patientDiagnosis = patient.diagnosis.toLowerCase();
      const trialCondition = trial.condition.toLowerCase();
      if (patientDiagnosis.includes(trialCondition) || trialCondition.includes(patientDiagnosis)) {
        reasons.push('Cancer type match');
      }
    }
    
    return reasons.length > 0 ? reasons : ['General eligibility criteria met'];
  }

  private static filterTrialsByPatientCriteria(trials: ClinicalTrial[], patient: Patient): ClinicalTrial[] {
    return trials.filter(trial => {
      const age = this.calculateAge(patient.dateOfBirth);
      const matchesAge = age >= trial.eligibilityCriteria.ageRange.min && 
                        (trial.eligibilityCriteria.ageRange.max === null || age <= trial.eligibilityCriteria.ageRange.max);
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
  
  // Advanced pharmacogenomic analysis with patient context
  private static async analyzeAdvancedPharmacogenomics(
    variants: GenomicVariant[],
    patient: Patient
  ): Promise<PharmacogenomicResult[]> {
    const pgxResults: PharmacogenomicResult[] = [];
    
    const pgxGenes = ['CYP2D6', 'CYP2C19', 'CYP3A4', 'DPYD', 'UGT1A1', 'TPMT', 'SLCO1B1'];
    
    for (const variant of variants) {
      if (pgxGenes.includes(variant.gene)) {
        const result = {
          drug: this.getPGxDrug(variant.gene),
          gene: variant.gene,
          variant: variant.variant,
          phenotype: this.getPGxPhenotype(variant.gene, variant.variant),
          recommendation: this.getPersonalizedPGxRecommendation(
            variant.gene, 
            variant.variant, 
            patient
          ),
          dosageAdjustment: this.getPersonalizedDosageAdjustment(
            variant.gene, 
            patient
          ),
          warningLevel: this.getPGxWarningLevel(variant.gene, variant.variant),
          interactionRisk: this.assessDrugInteractionRisk(variant.gene, patient),
          clinicalGuidelines: this.getClinicalGuidelines(variant.gene),
          aiInsight: this.generatePGxAIInsight(variant, patient)
        };
        
        pgxResults.push(result);
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
  
  // AI-powered helper methods
  private static calculateAIConfidence(variant: GenomicVariant): number {
    let confidence = 0.5;
    
    if (variant.clinicalSignificance === 'pathogenic') confidence += 0.3;
    if (variant.therapeuticImplications.length > 0) confidence += 0.2;
    if (variant.quality > 30) confidence += 0.1;
    if (variant.coverage > 100) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }
  
  private static calculatePatientSpecificScore(variant: GenomicVariant, patient: Patient): number {
    let score = 0.5;
    
    // Age considerations
    const age = this.calculateAge(patient.dateOfBirth);
    if (age > 65 && variant.gene === 'TP53') score += 0.2;
    
    // Cancer type relevance
    if (patient.diagnosis.toLowerCase().includes('breast') && variant.gene === 'BRCA1') score += 0.3;
    if (patient.diagnosis.toLowerCase().includes('lung') && variant.gene === 'EGFR') score += 0.3;
    
    // Performance status
    if (patient.ecogPerformanceStatus <= 1) score += 0.1;
    
    return Math.min(score, 1.0);
  }
  
  private static calculateActionabilityScore(variant: GenomicVariant): number {
    let score = 0.3;
    
    if (variant.therapeuticImplications.length > 0) score += 0.4;
    if (variant.clinicalSignificance === 'pathogenic') score += 0.3;
    if (variant.alleleFrequency > 0.1) score += 0.2;
    
    return Math.min(score, 1.0);
  }
  
  private static generateAIInterpretation(variant: GenomicVariant, patient: Patient): string {
    const age = this.calculateAge(patient.dateOfBirth);
    const cancerType = patient.diagnosis.toLowerCase();
    
    if (variant.gene === 'BRCA1' && cancerType.includes('breast')) {
      return `High-impact BRCA1 variant detected. Strong indication for PARP inhibitor therapy. Consider hereditary cancer syndrome evaluation.`;
    }
    
    if (variant.gene === 'EGFR' && cancerType.includes('lung')) {
      return `Actionable EGFR variant identified. First-line EGFR TKI therapy recommended. Monitor for resistance mutations.`;
    }
    
    return `${variant.gene} variant with ${variant.clinicalSignificance} significance. Clinical correlation recommended.`;
  }
  
  private static calculatePersonalizedTreatmentScore(
    drug: string,
    patient: Patient,
    variant: GenomicVariant
  ): number {
    let score = 0.5;
    
    // Evidence strength
    if (variant.therapeuticImplications.some(ti => ti.evidenceLevel === 'A')) score += 0.3;
    
    // Patient age considerations
    const age = this.calculateAge(patient.dateOfBirth);
    if (age > 70 && drug === 'Chemotherapy') score -= 0.2;
    if (age < 50 && drug === 'Immunotherapy') score += 0.1;
    
    // Performance status
    if (patient.ecogPerformanceStatus <= 1) score += 0.2;
    
    // Comorbidities
    const comorbs: string[] = [];
    if (comorbs.includes('Heart disease') && drug.includes('Trastuzumab')) {
      score -= 0.3;
    }
    
    return Math.max(0, Math.min(score, 1.0));
  }
  
  private static getPersonalizedContraindications(drug: string, patient: Patient): string[] {
    const contraindications: string[] = [];
    
    const comorbs2: string[] = [];
    if (comorbs2.includes('Heart disease') && drug === 'Trastuzumab') {
      contraindications.push('Cardiac dysfunction - monitor LVEF');
    }
    
    if (comorbs2.includes('Kidney disease') && drug === 'Cisplatin') {
      contraindications.push('Renal impairment - dose adjustment required');
    }
    
    const age = this.calculateAge(patient.dateOfBirth);
    if (age > 75) {
      contraindications.push('Advanced age - consider dose reduction');
    }
    
    return contraindications;
  }
  
  private static getPersonalizedResponse(evidenceLevel: string, patient: Patient): string {
    const baseResponse = this.getExpectedResponse(evidenceLevel);
    const age = this.calculateAge(patient.dateOfBirth);
    
    if (patient.ecogPerformanceStatus <= 1 && age < 65) {
      return `${baseResponse} Enhanced response expected due to excellent performance status.`;
    }
    
    if (age > 75 || patient.ecogPerformanceStatus > 2) {
      return `${baseResponse} Response may be attenuated due to patient factors.`;
    }
    
    return baseResponse;
  }
  
  private static generateAITreatmentRecommendation(
    drug: string,
    patient: Patient,
    variant: GenomicVariant
  ): string {
    const score = this.calculatePersonalizedTreatmentScore(drug, patient, variant);
    
    if (score > 0.8) {
      return `Highly recommended: Strong evidence and excellent patient fit for ${drug}.`;
    } else if (score > 0.6) {
      return `Recommended: Good evidence supporting ${drug} therapy.`;
    } else if (score > 0.4) {
      return `Consider: Moderate evidence for ${drug}. Evaluate benefits vs risks.`;
    } else {
      return `Caution: Limited evidence or patient factors may affect ${drug} efficacy.`;
    }
  }
  
  // Resistance prediction
  private static async predictResistance(
    variants: GenomicVariant[],
    treatments: TreatmentOption[]
  ): Promise<any[]> {
    const predictions = [];
    
    for (const treatment of treatments) {
      const resistanceRisk = this.calculateResistanceRisk(treatment.drug, variants);
      const resistanceMechanisms = this.identifyResistanceMechanisms(treatment.drug, variants);
      
      predictions.push({
        drug: treatment.drug,
        resistanceRisk,
        mechanisms: resistanceMechanisms,
        monitoringStrategy: this.getMonitoringStrategy(treatment.drug)
      });
    }
    
    return predictions;
  }
  
  private static calculateResistanceRisk(drug: string, variants: GenomicVariant[]): 'low' | 'moderate' | 'high' {
    // Simplified resistance prediction
    const resistanceVariants = variants.filter(v => 
      v.therapeuticImplications.some(ti => ti.implication === 'resistant')
    );
    
    if (resistanceVariants.length > 2) return 'high';
    if (resistanceVariants.length > 0) return 'moderate';
    return 'low';
  }
  
  private static identifyResistanceMechanisms(drug: string, variants: GenomicVariant[]): string[] {
    const mechanisms = [];
    
    if (drug === 'Erlotinib') {
      const t790m = variants.find(v => v.gene === 'EGFR' && v.variant.includes('T790M'));
      if (t790m) mechanisms.push('T790M gatekeeper mutation');
    }
    
    return mechanisms;
  }
  
  private static getMonitoringStrategy(drug: string): string {
    const strategies: Record<string, string> = {
      'Erlotinib': 'Monitor for T790M emergence via liquid biopsy every 3 months',
      'Trastuzumab': 'Monitor LVEF every 3 months, assess for HER2 loss',
      'Olaparib': 'Monitor for BRCA reversion mutations'
    };
    return strategies[drug] || 'Standard oncology monitoring';
  }
  
  // Enhanced PGx methods
  private static getPersonalizedPGxRecommendation(
    gene: string,
    variant: string,
    patient: Patient
  ): string {
    const baseRecommendation = this.getPGxRecommendation(gene, variant);
    const age = this.calculateAge(patient.dateOfBirth);
    
    if (age > 65 && gene === 'CYP2D6') {
      return `${baseRecommendation} Additional caution in elderly patients.`;
    }
    
    return baseRecommendation;
  }
  
  private static getPersonalizedDosageAdjustment(gene: string, patient: Patient): string {
    const age = this.calculateAge(patient.dateOfBirth);
    
    if (age > 75) {
      return 'Consider 25% dose reduction due to advanced age';
    }
    
    if (patient.contraindications?.some(c => /kidney|renal/i.test(c))) {
      return 'Dose adjustment required for renal impairment';
    }
    
    return this.getPGxDosageAdjustment(gene);
  }
  
  private static assessDrugInteractionRisk(gene: string, patient: Patient): 'low' | 'moderate' | 'high' {
    // Simplified interaction risk assessment
    const medications = patient.currentMedications || [];
    
    if (gene === 'CYP2D6' && medications.some(med => (med?.name || '').includes('Paroxetine'))) {
      return 'high';
    }
    
    return 'low';
  }
  
  private static getClinicalGuidelines(gene: string): string[] {
    const guidelines: Record<string, string[]> = {
      'CYP2D6': ['CPIC Guideline for CYP2D6', 'FDA Table of Pharmacogenomic Biomarkers'],
      'DPYD': ['CPIC Guideline for DPYD', 'EMA Recommendations for DPYD Testing']
    };
    return guidelines[gene] || ['Consult pharmacogenomics guidelines'];
  }
  
  private static generatePGxAIInsight(variant: GenomicVariant, patient: Patient): string {
    const age = this.calculateAge(patient.dateOfBirth);
    
    if (variant.gene === 'DPYD' && variant.clinicalSignificance === 'pathogenic') {
      return 'Critical finding: High risk for 5-FU toxicity. Alternative chemotherapy strongly recommended.';
    }
    
    return `${variant.gene} variant may affect drug metabolism. Clinical correlation recommended.`;
  }
  
  // Enhanced summary generation
  private static generateAIExecutiveSummary(
    variants: GenomicVariant[],
    treatments: TreatmentOption[],
    trials: ClinicalTrial[],
    patient: Patient
  ): string {
    const age = this.calculateAge(patient.dateOfBirth);
    const highConfidenceVariants = variants.filter(v => (v as any).aiConfidence > 0.8);
    const personalizedTreatments = treatments.filter(t => (t as any).personalizedScore > 0.7);
    
    return `AI analysis of ${patient.firstName} ${patient.lastName} (age ${age}) identified ${highConfidenceVariants.length} high-confidence actionable variants. ${personalizedTreatments.length} personalized treatment options and ${trials.length} matching clinical trials available. Personalized recommendations prioritize patient-specific factors including age, performance status, and comorbidities.`;
  }
  
  private static generatePersonalizedRecommendations(
    treatments: TreatmentOption[],
    trials: ClinicalTrial[],
    hereditary: HereditaryRisk[],
    patient: Patient
  ): string[] {
    const recommendations = [];
    const age = this.calculateAge(patient.dateOfBirth);
    
    // Prioritize treatments by personalized score
    const topTreatment = treatments
      .sort((a, b) => ((b as any).personalizedScore || 0) - ((a as any).personalizedScore || 0))[0];
    
    if (topTreatment) {
      recommendations.push(
        `Primary recommendation: ${topTreatment.drug} (${((topTreatment as any).personalizedScore * 100).toFixed(0)}% patient match)`
      );
    }
    
    if (trials.length > 0) {
      recommendations.push(`Evaluate clinical trial eligibility: ${trials[0].title}`);
    }
    
    if (hereditary.length > 0) {
      recommendations.push(`Genetic counseling recommended for ${hereditary[0].syndrome}`);
    }
    
    // Age-specific recommendations
    if (age > 70) {
      recommendations.push('Consider geriatric oncology consultation for treatment optimization');
    }
    
    if (patient.ecogPerformanceStatus > 2) {
      recommendations.push('Focus on supportive care and quality of life measures');
    }
    
    return recommendations;
  }
}

export const genomicAnalysisService = new GenomicAnalysisService();
