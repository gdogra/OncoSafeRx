import { 
  Patient, 
  DoseCalculation, 
  BSACalculation, 
  CreatinineClearanceCalculation,
  CarboplatingDosing,
  DoseAdjustment,
  ClinicalAlert,
  MonitoringRecommendation 
} from '../types/clinical';

export class DoseCalculationService {
  
  // BSA Calculations
  static calculateBSA(height: number, weight: number, method: 'dubois' | 'mosteller' | 'haycock' | 'gehan' = 'mosteller'): BSACalculation {
    let bsa: number;
    
    switch (method) {
      case 'dubois':
        bsa = 0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725);
        break;
      case 'mosteller':
        bsa = Math.sqrt((height * weight) / 3600);
        break;
      case 'haycock':
        bsa = 0.024265 * Math.pow(weight, 0.5378) * Math.pow(height, 0.3964);
        break;
      case 'gehan':
        bsa = 0.0235 * Math.pow(weight, 0.51456) * Math.pow(height, 0.42246);
        break;
      default:
        bsa = Math.sqrt((height * weight) / 3600);
    }
    
    return {
      height,
      weight,
      method,
      bsa: Math.round(bsa * 100) / 100
    };
  }
  
  // Creatinine Clearance Calculations
  static calculateCreatinineClearance(
    age: number, 
    weight: number, 
    creatinine: number, 
    gender: 'male' | 'female',
    method: 'cockcroft_gault' | 'mdrd' | 'ckd_epi' = 'cockcroft_gault'
  ): CreatinineClearanceCalculation {
    let clearance: number;
    
    switch (method) {
      case 'cockcroft_gault':
        clearance = ((140 - age) * weight) / (72 * creatinine);
        if (gender === 'female') clearance *= 0.85;
        break;
      case 'mdrd':
        const genderFactor = gender === 'female' ? 0.742 : 1;
        clearance = 175 * Math.pow(creatinine, -1.154) * Math.pow(age, -0.203) * genderFactor;
        break;
      case 'ckd_epi':
        const kappa = gender === 'female' ? 0.7 : 0.9;
        const alpha = gender === 'female' ? -0.329 : -0.411;
        const genderMultiplier = gender === 'female' ? 1.018 : 1;
        clearance = 141 * Math.pow(Math.min(creatinine / kappa, 1), alpha) * 
                   Math.pow(Math.max(creatinine / kappa, 1), -1.209) * 
                   Math.pow(0.993, age) * genderMultiplier;
        break;
      default:
        clearance = ((140 - age) * weight) / (72 * creatinine);
        if (gender === 'female') clearance *= 0.85;
    }
    
    return {
      age,
      weight,
      creatinine,
      gender,
      method,
      clearance: Math.round(clearance * 10) / 10
    };
  }
  
  // Carboplatin Dosing (Calvert Formula)
  static calculateCarboplatinDose(targetAuc: number, creatinineClearance: number): CarboplatingDosing {
    const dose = targetAuc * (creatinineClearance + 25);
    const notes: string[] = [];
    
    if (creatinineClearance < 60) {
      notes.push('Reduced creatinine clearance - consider dose reduction');
    }
    if (targetAuc > 6) {
      notes.push('High AUC target - monitor for increased toxicity');
    }
    if (dose > 800) {
      notes.push('High absolute dose - consider capping at 800mg');
    }
    
    return {
      targetAuc,
      creatinineClearance,
      dose: Math.round(dose),
      notes
    };
  }
  
  // Main dose calculation engine
  static calculateDose(patient: Patient, drugName: string, baselineDose: number, unit: string): DoseCalculation {
    const bsa = this.calculateBSA(patient.height, patient.weight);
    const crCl = this.calculateCreatinineClearance(
      this.calculateAge(patient.dateOfBirth),
      patient.weight,
      patient.renalFunction.creatinine,
      patient.gender
    );
    
    let calculatedDose = baselineDose;
    const adjustments: DoseAdjustment[] = [];
    const warnings: ClinicalAlert[] = [];
    const contraindications: string[] = [];
    const monitoring: MonitoringRecommendation[] = [];
    
    // BSA-based dosing for most chemotherapy
    if (unit.includes('m²') || unit.includes('/m2')) {
      calculatedDose = baselineDose * bsa.bsa;
      adjustments.push({
        reason: 'BSA adjustment',
        type: 'bsa',
        factor: bsa.bsa,
        description: `Dose adjusted for BSA: ${bsa.bsa} m²`,
        evidence: 'Standard oncology dosing practice'
      });
    }
    
    // Renal adjustments
    const renalAdjustment = this.getRenalAdjustment(drugName, crCl.clearance);
    if (renalAdjustment) {
      calculatedDose *= renalAdjustment.factor;
      adjustments.push(renalAdjustment);
    }
    
    // Hepatic adjustments
    const hepaticAdjustment = this.getHepaticAdjustment(drugName, patient.hepaticFunction);
    if (hepaticAdjustment) {
      calculatedDose *= hepaticAdjustment.factor;
      adjustments.push(hepaticAdjustment);
    }
    
    // Age adjustments
    const age = this.calculateAge(patient.dateOfBirth);
    const ageAdjustment = this.getAgeAdjustment(drugName, age);
    if (ageAdjustment) {
      calculatedDose *= ageAdjustment.factor;
      adjustments.push(ageAdjustment);
    }
    
    // Performance status considerations
    if (patient.ecogPerformanceStatus && patient.ecogPerformanceStatus >= 2) {
      warnings.push({
        id: 'ps_warning',
        severity: 'major',
        type: 'monitoring',
        title: 'Poor Performance Status',
        description: `ECOG PS ${patient.ecogPerformanceStatus} - consider dose reduction or alternative therapy`,
        recommendation: 'Evaluate patient for dose reduction or supportive care',
        source: 'NCCN Guidelines'
      });
    }
    
    // Organ function warnings
    if (crCl.clearance < 60) {
      warnings.push({
        id: 'renal_warning',
        severity: 'major',
        type: 'monitoring',
        title: 'Renal Impairment',
        description: `Creatinine clearance ${crCl.clearance} mL/min`,
        recommendation: 'Monitor renal function closely and adjust doses as needed',
        source: 'FDA Prescribing Information'
      });
    }
    
    if (patient.hepaticFunction.bilirubin > 1.5) {
      warnings.push({
        id: 'hepatic_warning',
        severity: 'major',
        type: 'monitoring',
        title: 'Hepatic Impairment',
        description: `Elevated bilirubin: ${patient.hepaticFunction.bilirubin} mg/dL`,
        recommendation: 'Consider dose reduction for hepatically metabolized drugs',
        source: 'FDA Prescribing Information'
      });
    }
    
    // Drug-specific contraindications
    const drugContraindications = this.getDrugContraindications(drugName, patient);
    contraindications.push(...drugContraindications);
    
    // Monitoring recommendations
    const drugMonitoring = this.getDrugMonitoring(drugName);
    monitoring.push(...drugMonitoring);
    
    return {
      drug: drugName,
      baselinedose: baselineDose,
      unit,
      calculatedDose: Math.round(calculatedDose * 100) / 100,
      actualDose: Math.round(calculatedDose * 100) / 100, // Can be modified by clinician
      adjustments,
      contraindications,
      warnings,
      monitoring
    };
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
  
  private static getRenalAdjustment(drugName: string, creatinineClearance: number): DoseAdjustment | null {
    const renalDrugs: Record<string, Array<{min: number, max: number, factor: number, description: string}>> = {
      'carboplatin': [
        { min: 0, max: 15, factor: 0, description: 'Contraindicated in severe renal impairment' },
        { min: 16, max: 40, factor: 0.5, description: '50% dose reduction for moderate renal impairment' },
        { min: 41, max: 60, factor: 0.75, description: '25% dose reduction for mild renal impairment' }
      ],
      'cisplatin': [
        { min: 0, max: 30, factor: 0, description: 'Contraindicated in severe renal impairment' },
        { min: 31, max: 60, factor: 0.75, description: '25% dose reduction for renal impairment' }
      ],
      'irinotecan': [
        { min: 0, max: 30, factor: 0.5, description: '50% dose reduction for severe renal impairment' }
      ]
    };
    
    const drugLower = drugName.toLowerCase();
    const adjustments = renalDrugs[drugLower];
    
    if (!adjustments) return null;
    
    for (const adj of adjustments) {
      if (creatinineClearance >= adj.min && creatinineClearance <= adj.max) {
        return {
          reason: 'Renal impairment',
          type: 'renal',
          factor: adj.factor,
          description: adj.description,
          evidence: 'FDA Prescribing Information'
        };
      }
    }
    
    return null;
  }
  
  private static getHepaticAdjustment(drugName: string, hepaticFunction: Patient['hepaticFunction']): DoseAdjustment | null {
    const hepaticDrugs: Record<string, Array<{bilirubinMin: number, bilirubinMax: number, factor: number, description: string}>> = {
      'doxorubicin': [
        { bilirubinMin: 1.2, bilirubinMax: 3.0, factor: 0.5, description: '50% dose reduction for moderate hepatic impairment' },
        { bilirubinMin: 3.1, bilirubinMax: 99, factor: 0.25, description: '75% dose reduction for severe hepatic impairment' }
      ],
      'paclitaxel': [
        { bilirubinMin: 1.26, bilirubinMax: 2.0, factor: 0.75, description: '25% dose reduction for mild hepatic impairment' },
        { bilirubinMin: 2.01, bilirubinMax: 7.5, factor: 0.5, description: '50% dose reduction for moderate hepatic impairment' },
        { bilirubinMin: 7.51, bilirubinMax: 99, factor: 0, description: 'Contraindicated in severe hepatic impairment' }
      ]
    };
    
    const drugLower = drugName.toLowerCase();
    const adjustments = hepaticDrugs[drugLower];
    
    if (!adjustments) return null;
    
    for (const adj of adjustments) {
      if (hepaticFunction.bilirubin >= adj.bilirubinMin && hepaticFunction.bilirubin <= adj.bilirubinMax) {
        return {
          reason: 'Hepatic impairment',
          type: 'hepatic',
          factor: adj.factor,
          description: adj.description,
          evidence: 'FDA Prescribing Information'
        };
      }
    }
    
    return null;
  }
  
  private static getAgeAdjustment(drugName: string, age: number): DoseAdjustment | null {
    // Elderly dosing considerations
    if (age >= 65) {
      const elderlyDrugs = ['carboplatin', 'cisplatin', 'doxorubicin'];
      if (elderlyDrugs.includes(drugName.toLowerCase())) {
        return {
          reason: 'Elderly patient',
          type: 'age',
          factor: 0.8,
          description: '20% dose reduction recommended for elderly patients',
          evidence: 'Geriatric oncology guidelines'
        };
      }
    }
    
    return null;
  }
  
  private static getDrugContraindications(drugName: string, patient: Patient): string[] {
    const contraindications: string[] = [];
    
    // Check allergies
    const drugLower = drugName.toLowerCase();
    if (patient.allergies.some(allergy => allergy.toLowerCase().includes(drugLower))) {
      contraindications.push(`Known allergy to ${drugName}`);
    }
    
    // Drug-specific contraindications
    const drugContraindications: Record<string, (patient: Patient) => string[]> = {
      'doxorubicin': (p) => {
        const contraindications: string[] = [];
        // Check for prior anthracycline exposure
        const priorAnthracycline = p.treatmentHistory.some(course => 
          ['doxorubicin', 'epirubicin', 'daunorubicin'].some(drug => 
            course.regimenName.toLowerCase().includes(drug)
          )
        );
        if (priorAnthracycline) {
          contraindications.push('Prior anthracycline exposure - assess cumulative dose');
        }
        return contraindications;
      },
      'cisplatin': (p) => {
        const contraindications: string[] = [];
        if (p.renalFunction.creatinine > 2.0) {
          contraindications.push('Severe renal impairment');
        }
        return contraindications;
      }
    };
    
    const checkFunction = drugContraindications[drugLower];
    if (checkFunction) {
      contraindications.push(...checkFunction(patient));
    }
    
    return contraindications;
  }
  
  private static getDrugMonitoring(drugName: string): MonitoringRecommendation[] {
    const monitoringProtocols: Record<string, MonitoringRecommendation[]> = {
      'doxorubicin': [
        {
          parameter: 'ECHO or MUGA',
          frequency: 'Baseline, then every 3 months',
          baseline: true,
          description: 'Monitor for cardiotoxicity',
          actionThreshold: 'LVEF drop >10% from baseline or <50%'
        },
        {
          parameter: 'CBC with differential',
          frequency: 'Before each cycle',
          baseline: true,
          description: 'Monitor for myelosuppression',
          normalRange: 'ANC >1500, Platelets >100,000'
        }
      ],
      'cisplatin': [
        {
          parameter: 'Serum creatinine',
          frequency: 'Before each cycle',
          baseline: true,
          description: 'Monitor for nephrotoxicity',
          actionThreshold: 'Creatinine increase >0.5 mg/dL from baseline'
        },
        {
          parameter: 'Audiometry',
          frequency: 'Baseline, then as clinically indicated',
          baseline: true,
          description: 'Monitor for ototoxicity'
        },
        {
          parameter: 'Neurologic exam',
          frequency: 'Before each cycle',
          baseline: false,
          description: 'Monitor for peripheral neuropathy'
        }
      ],
      'carboplatin': [
        {
          parameter: 'CBC with differential',
          frequency: 'Before each cycle',
          baseline: true,
          description: 'Monitor for myelosuppression',
          normalRange: 'ANC >1500, Platelets >100,000'
        },
        {
          parameter: 'Serum creatinine',
          frequency: 'Before each cycle',
          baseline: true,
          description: 'Monitor renal function'
        }
      ]
    };
    
    return monitoringProtocols[drugName.toLowerCase()] || [];
  }
}

export const doseCalculationService = new DoseCalculationService();