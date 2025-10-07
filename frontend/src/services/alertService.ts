import { PatientProfile, ClinicalAlert, Drug } from '../types';

export interface DoseCalculationAlert {
  id: string;
  type: 'dosing' | 'allergy' | 'interaction' | 'contraindication' | 'monitoring' | 'lab';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  message: string;
  details: string;
  recommendedAction: string;
  affectedMedication?: string;
  category: 'renal' | 'hepatic' | 'cardiac' | 'hematologic' | 'age' | 'weight' | 'bsa' | 'genetic' | 'general';
  source: string;
  priority: number; // 1-10, 10 being highest priority
}

export interface DoseRecommendation {
  originalDose: number;
  recommendedDose: number;
  unit: string;
  adjustmentReason: string;
  adjustmentFactor: number;
  confidence: 'high' | 'moderate' | 'low';
  references: string[];
}

class AlertService {
  private static instance: AlertService;

  private constructor() {}

  public static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  /**
   * Comprehensive dose calculation with safety alerts
   */
  public calculateDoseWithAlerts(
    patient: PatientProfile,
    drug: Drug,
    standardDose: number,
    unit: string,
    indication?: string
  ): {
    recommendedDose: number;
    alerts: DoseCalculationAlert[];
    adjustments: DoseRecommendation[];
    safetyScore: number; // 0-100, 100 being safest
  } {
    const alerts: DoseCalculationAlert[] = [];
    const adjustments: DoseRecommendation[] = [];
    let finalDose = standardDose;
    let totalAdjustmentFactor = 1.0;

    // Age-based adjustments
    const age = this.calculateAge(patient.demographics.dateOfBirth);
    if (age >= 65) {
      const ageAdjustment = this.getAgeBasedAdjustment(age, drug);
      if (ageAdjustment.factor !== 1.0) {
        finalDose *= ageAdjustment.factor;
        totalAdjustmentFactor *= ageAdjustment.factor;
        
        adjustments.push({
          originalDose: standardDose,
          recommendedDose: finalDose,
          unit,
          adjustmentReason: ageAdjustment.reason,
          adjustmentFactor: ageAdjustment.factor,
          confidence: 'high',
          references: ['Geriatric Dosing Guidelines', 'Beers Criteria']
        });

        alerts.push({
          id: `age-${Date.now()}`,
          type: 'dosing',
          severity: ageAdjustment.factor < 0.7 ? 'high' : 'moderate',
          message: `Age-based dose adjustment recommended`,
          details: `Patient age ${age} years requires dose modification for ${drug.name}`,
          recommendedAction: `Consider ${Math.round((1 - ageAdjustment.factor) * 100)}% dose reduction`,
          affectedMedication: drug.name,
          category: 'age',
          source: 'Geriatric Pharmacology Guidelines',
          priority: 7
        });
      }
    }

    // Renal function adjustments
    const renalAlerts = this.checkRenalFunction(patient, drug, finalDose, unit);
    alerts.push(...renalAlerts.alerts);
    if (renalAlerts.adjustmentFactor !== 1.0) {
      finalDose *= renalAlerts.adjustmentFactor;
      totalAdjustmentFactor *= renalAlerts.adjustmentFactor;
      
      adjustments.push({
        originalDose: standardDose * (totalAdjustmentFactor / renalAlerts.adjustmentFactor),
        recommendedDose: finalDose,
        unit,
        adjustmentReason: 'Renal impairment adjustment',
        adjustmentFactor: renalAlerts.adjustmentFactor,
        confidence: 'high',
        references: ['Kidney Disease: Improving Global Outcomes (KDIGO)', 'FDA Renal Impairment Guidance']
      });
    }

    // Hepatic function adjustments
    const hepaticAlerts = this.checkHepaticFunction(patient, drug, finalDose, unit);
    alerts.push(...hepaticAlerts.alerts);
    if (hepaticAlerts.adjustmentFactor !== 1.0) {
      finalDose *= hepaticAlerts.adjustmentFactor;
      totalAdjustmentFactor *= hepaticAlerts.adjustmentFactor;
      
      adjustments.push({
        originalDose: standardDose * (totalAdjustmentFactor / hepaticAlerts.adjustmentFactor),
        recommendedDose: finalDose,
        unit,
        adjustmentReason: 'Hepatic impairment adjustment',
        adjustmentFactor: hepaticAlerts.adjustmentFactor,
        confidence: 'moderate',
        references: ['Child-Pugh Classification', 'FDA Hepatic Impairment Guidance']
      });
    }

    // Weight/BSA adjustments
    const weightAlerts = this.checkWeightBasedDosing(patient, drug, finalDose, unit);
    alerts.push(...weightAlerts.alerts);

    // Genetic/pharmacogenomic adjustments
    const geneticAlerts = this.checkGeneticFactors(patient, drug, finalDose, unit);
    alerts.push(...geneticAlerts.alerts);
    if (geneticAlerts.adjustmentFactor !== 1.0) {
      finalDose *= geneticAlerts.adjustmentFactor;
      totalAdjustmentFactor *= geneticAlerts.adjustmentFactor;
    }

    // Drug allergy checks
    const allergyAlerts = this.checkDrugAllergies(patient, drug);
    alerts.push(...allergyAlerts);

    // Lab value alerts
    const labAlerts = this.checkLabValues(patient, drug);
    alerts.push(...labAlerts);

    // Drug-specific contraindications
    const contraindicationAlerts = this.checkContraindications(patient, drug);
    alerts.push(...contraindicationAlerts);

    // Calculate safety score
    const safetyScore = this.calculateSafetyScore(alerts);

    return {
      recommendedDose: Math.round(finalDose * 100) / 100, // Round to 2 decimal places
      alerts: alerts.sort((a, b) => b.priority - a.priority), // Sort by priority
      adjustments,
      safetyScore
    };
  }

  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private getAgeBasedAdjustment(age: number, drug: Drug): { factor: number; reason: string } {
    // Age-based adjustment logic for common oncology drugs
    const drugName = drug.name.toLowerCase();
    
    if (age >= 75) {
      if (drugName.includes('doxorubicin') || drugName.includes('adriamycin')) {
        return { factor: 0.75, reason: 'Increased cardiotoxicity risk in elderly patients' };
      }
      if (drugName.includes('carboplatin') || drugName.includes('cisplatin')) {
        return { factor: 0.8, reason: 'Increased nephrotoxicity and ototoxicity risk' };
      }
      if (drugName.includes('fluorouracil') || drugName.includes('5-fu')) {
        return { factor: 0.85, reason: 'Increased risk of severe mucositis and myelosuppression' };
      }
      return { factor: 0.9, reason: 'General elderly dose reduction for safety' };
    } else if (age >= 65) {
      if (drugName.includes('doxorubicin') || drugName.includes('adriamycin')) {
        return { factor: 0.85, reason: 'Moderate cardiotoxicity risk reduction' };
      }
      return { factor: 0.95, reason: 'Mild elderly dose adjustment' };
    }
    
    return { factor: 1.0, reason: 'No age-based adjustment needed' };
  }

  private checkRenalFunction(patient: PatientProfile, drug: Drug, dose: number, unit: string): {
    alerts: DoseCalculationAlert[];
    adjustmentFactor: number;
  } {
    const alerts: DoseCalculationAlert[] = [];
    let adjustmentFactor = 1.0;

    // Look for creatinine clearance in lab values
    const recentCrCl = patient.labValues
      .filter(lab => lab.labType.toLowerCase().includes('creatinine clearance') || lab.labType.toLowerCase() === 'crcl')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    if (recentCrCl) {
      const crcl = recentCrCl.value;
      const drugName = drug.name.toLowerCase();

      if (crcl < 30) {
        // Severe renal impairment
        if (drugName.includes('carboplatin')) {
          adjustmentFactor = 0.5;
          alerts.push({
            id: `renal-severe-${Date.now()}`,
            type: 'dosing',
            severity: 'critical',
            message: 'Severe renal impairment detected',
            details: `CrCl ${crcl} mL/min requires significant dose reduction for ${drug.name}`,
            recommendedAction: '50% dose reduction recommended, consider nephrology consultation',
            affectedMedication: drug.name,
            category: 'renal',
            source: 'Renal Dosing Guidelines',
            priority: 9
          });
        } else if (drugName.includes('cisplatin')) {
          alerts.push({
            id: `renal-contraindication-${Date.now()}`,
            type: 'contraindication',
            severity: 'critical',
            message: 'Cisplatin contraindicated in severe renal impairment',
            details: `CrCl ${crcl} mL/min is below safe threshold for cisplatin administration`,
            recommendedAction: 'Consider alternative platinum agent (carboplatin) or non-platinum regimen',
            affectedMedication: drug.name,
            category: 'renal',
            source: 'FDA Drug Label',
            priority: 10
          });
        }
      } else if (crcl < 50) {
        // Moderate renal impairment
        if (drugName.includes('carboplatin') || drugName.includes('cisplatin')) {
          adjustmentFactor = 0.75;
          alerts.push({
            id: `renal-moderate-${Date.now()}`,
            type: 'dosing',
            severity: 'high',
            message: 'Moderate renal impairment requires dose adjustment',
            details: `CrCl ${crcl} mL/min requires dose modification for ${drug.name}`,
            recommendedAction: '25% dose reduction recommended',
            affectedMedication: drug.name,
            category: 'renal',
            source: 'NCCN Guidelines',
            priority: 8
          });
        }
      } else if (crcl < 80) {
        // Mild renal impairment
        alerts.push({
          id: `renal-mild-${Date.now()}`,
          type: 'monitoring',
          severity: 'moderate',
          message: 'Mild renal impairment detected',
          details: `CrCl ${crcl} mL/min requires close monitoring during ${drug.name} therapy`,
          recommendedAction: 'Monitor renal function before each cycle',
          affectedMedication: drug.name,
          category: 'renal',
          source: 'Clinical Guidelines',
          priority: 5
        });
      }
    } else {
      // No recent creatinine clearance available
      alerts.push({
        id: `renal-missing-${Date.now()}`,
        type: 'lab',
        severity: 'moderate',
        message: 'Recent renal function test required',
        details: `No recent creatinine clearance available for safe ${drug.name} dosing`,
        recommendedAction: 'Obtain creatinine clearance before drug administration',
        affectedMedication: drug.name,
        category: 'renal',
        source: 'Standard of Care',
        priority: 6
      });
    }

    return { alerts, adjustmentFactor };
  }

  private checkHepaticFunction(patient: PatientProfile, drug: Drug, dose: number, unit: string): {
    alerts: DoseCalculationAlert[];
    adjustmentFactor: number;
  } {
    const alerts: DoseCalculationAlert[] = [];
    let adjustmentFactor = 1.0;

    // Check for liver function tests
    const recentAST = patient.labValues
      .filter(lab => lab.labType.toLowerCase().includes('ast') || lab.labType.toLowerCase().includes('sgot'))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    const recentALT = patient.labValues
      .filter(lab => lab.labType.toLowerCase().includes('alt') || lab.labType.toLowerCase().includes('sgpt'))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    const recentBilirubin = patient.labValues
      .filter(lab => lab.labType.toLowerCase().includes('bilirubin'))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    if (recentAST && recentALT && recentBilirubin) {
      const ast = recentAST.value;
      const alt = recentALT.value;
      const bilirubin = recentBilirubin.value;
      const drugName = drug.name.toLowerCase();

      // Assuming normal ranges: AST/ALT < 40 U/L, Bilirubin < 1.2 mg/dL
      if (ast > 120 || alt > 120 || bilirubin > 3.0) {
        // Severe hepatic impairment
        adjustmentFactor = 0.5;
        alerts.push({
          id: `hepatic-severe-${Date.now()}`,
          type: 'dosing',
          severity: 'critical',
          message: 'Severe hepatic impairment detected',
          details: `Elevated liver enzymes (AST: ${ast}, ALT: ${alt}, Bilirubin: ${bilirubin}) require dose reduction`,
          recommendedAction: '50% dose reduction recommended, consider hepatology consultation',
          affectedMedication: drug.name,
          category: 'hepatic',
          source: 'Child-Pugh Classification',
          priority: 9
        });
      } else if (ast > 80 || alt > 80 || bilirubin > 2.0) {
        // Moderate hepatic impairment
        adjustmentFactor = 0.75;
        alerts.push({
          id: `hepatic-moderate-${Date.now()}`,
          type: 'dosing',
          severity: 'high',
          message: 'Moderate hepatic impairment requires dose adjustment',
          details: `Elevated liver enzymes require dose modification for ${drug.name}`,
          recommendedAction: '25% dose reduction recommended',
          affectedMedication: drug.name,
          category: 'hepatic',
          source: 'FDA Hepatic Impairment Guidance',
          priority: 8
        });
      } else if (ast > 40 || alt > 40 || bilirubin > 1.2) {
        // Mild hepatic impairment
        alerts.push({
          id: `hepatic-mild-${Date.now()}`,
          type: 'monitoring',
          severity: 'moderate',
          message: 'Mild hepatic impairment detected',
          details: `Elevated liver enzymes require close monitoring during therapy`,
          recommendedAction: 'Monitor liver function before each cycle',
          affectedMedication: drug.name,
          category: 'hepatic',
          source: 'Clinical Guidelines',
          priority: 5
        });
      }
    }

    return { alerts, adjustmentFactor };
  }

  private checkWeightBasedDosing(patient: PatientProfile, drug: Drug, dose: number, unit: string): {
    alerts: DoseCalculationAlert[];
  } {
    const alerts: DoseCalculationAlert[] = [];
    const { heightCm, weightKg } = patient.demographics;

    if (!weightKg) {
      alerts.push({
        id: `weight-missing-${Date.now()}`,
        type: 'dosing',
        severity: 'high',
        message: 'Patient weight required for accurate dosing',
        details: `Body weight is required for safe ${drug.name} dosing calculations`,
        recommendedAction: 'Obtain current accurate weight before dosing',
        affectedMedication: drug.name,
        category: 'weight',
        source: 'Standard of Care',
        priority: 8
      });
      return { alerts };
    }

    // Calculate BMI if height is available
    if (heightCm) {
      const bmi = weightKg / ((heightCm / 100) ** 2);
      
      if (bmi < 18.5) {
        alerts.push({
          id: `weight-underweight-${Date.now()}`,
          type: 'monitoring',
          severity: 'moderate',
          message: 'Patient underweight - monitor for toxicity',
          details: `BMI ${bmi.toFixed(1)} may increase risk of drug toxicity`,
          recommendedAction: 'Consider dose reduction and enhanced monitoring',
          affectedMedication: drug.name,
          category: 'weight',
          source: 'Clinical Guidelines',
          priority: 6
        });
      } else if (bmi > 30) {
        alerts.push({
          id: `weight-obese-${Date.now()}`,
          type: 'monitoring',
          severity: 'moderate',
          message: 'Obesity may affect drug distribution',
          details: `BMI ${bmi.toFixed(1)} may require dosing adjustment considerations`,
          recommendedAction: 'Consider BSA-based dosing and monitor for efficacy',
          affectedMedication: drug.name,
          category: 'weight',
          source: 'Obesity Pharmacology Guidelines',
          priority: 5
        });
      }
    }

    // Check for weight-based vs BSA-based dosing recommendations
    const drugName = drug.name.toLowerCase();
    if (drugName.includes('carboplatin')) {
      alerts.push({
        id: `dosing-method-${Date.now()}`,
        type: 'dosing',
        severity: 'moderate',
        message: 'Carboplatin dosing recommendation',
        details: 'Carboplatin should be dosed using Calvert formula (AUC-based) rather than BSA',
        recommendedAction: 'Use AUC-based dosing: Dose = AUC × (CrCl + 25)',
        affectedMedication: drug.name,
        category: 'general',
        source: 'Calvert Formula',
        priority: 7
      });
    }

    return { alerts };
  }

  private checkGeneticFactors(patient: PatientProfile, drug: Drug, dose: number, unit: string): {
    alerts: DoseCalculationAlert[];
    adjustmentFactor: number;
  } {
    const alerts: DoseCalculationAlert[] = [];
    let adjustmentFactor = 1.0;
    const drugName = drug.name.toLowerCase();

    // Check for relevant genetic variants
    patient.genetics.forEach(genetic => {
      const gene = genetic.geneSymbol.toUpperCase();
      
      if (gene === 'DPYD' && (drugName.includes('fluorouracil') || drugName.includes('5-fu') || drugName.includes('capecitabine'))) {
        if (genetic.metabolizerStatus === 'poor' || genetic.phenotype.toLowerCase().includes('deficient')) {
          adjustmentFactor = 0.25;
          alerts.push({
            id: `genetic-dpyd-${Date.now()}`,
            type: 'dosing',
            severity: 'critical',
            message: 'DPYD deficiency detected - severe dose reduction required',
            details: `${genetic.phenotype} DPYD status requires 75% dose reduction for fluoropyrimidines`,
            recommendedAction: 'Start with 25% of standard dose and monitor closely',
            affectedMedication: drug.name,
            category: 'genetic',
            source: 'CPIC Guidelines',
            priority: 10
          });
        } else if (genetic.metabolizerStatus === 'intermediate') {
          adjustmentFactor = 0.5;
          alerts.push({
            id: `genetic-dpyd-intermediate-${Date.now()}`,
            type: 'dosing',
            severity: 'high',
            message: 'DPYD intermediate metabolism - dose reduction required',
            details: `Intermediate DPYD activity requires dose reduction for fluoropyrimidines`,
            recommendedAction: 'Start with 50% of standard dose',
            affectedMedication: drug.name,
            category: 'genetic',
            source: 'CPIC Guidelines',
            priority: 9
          });
        }
      }

      if (gene === 'UGT1A1' && drugName.includes('irinotecan')) {
        if (genetic.phenotype.includes('*28/*28') || genetic.metabolizerStatus === 'poor') {
          adjustmentFactor = 0.7;
          alerts.push({
            id: `genetic-ugt1a1-${Date.now()}`,
            type: 'dosing',
            severity: 'high',
            message: 'UGT1A1 polymorphism affects irinotecan metabolism',
            details: `UGT1A1*28/*28 genotype increases risk of severe neutropenia and diarrhea`,
            recommendedAction: '30% dose reduction recommended for initial cycles',
            affectedMedication: drug.name,
            category: 'genetic',
            source: 'FDA Drug Label',
            priority: 8
          });
        }
      }

      if (gene === 'TPMT' && (drugName.includes('mercaptopurine') || drugName.includes('azathioprine'))) {
        if (genetic.metabolizerStatus === 'poor') {
          adjustmentFactor = 0.1;
          alerts.push({
            id: `genetic-tpmt-${Date.now()}`,
            type: 'dosing',
            severity: 'critical',
            message: 'TPMT deficiency - extreme dose reduction required',
            details: `TPMT poor metabolizer status requires 90% dose reduction`,
            recommendedAction: 'Start with 10% of standard dose',
            affectedMedication: drug.name,
            category: 'genetic',
            source: 'CPIC Guidelines',
            priority: 10
          });
        } else if (genetic.metabolizerStatus === 'intermediate') {
          adjustmentFactor = 0.5;
          alerts.push({
            id: `genetic-tpmt-intermediate-${Date.now()}`,
            type: 'dosing',
            severity: 'high',
            message: 'TPMT intermediate metabolism - dose reduction required',
            details: `Intermediate TPMT activity requires dose reduction`,
            recommendedAction: 'Start with 50% of standard dose',
            affectedMedication: drug.name,
            category: 'genetic',
            source: 'CPIC Guidelines',
            priority: 9
          });
        }
      }
    });

    return { alerts, adjustmentFactor };
  }

  private checkDrugAllergies(patient: PatientProfile, drug: Drug): DoseCalculationAlert[] {
    const alerts: DoseCalculationAlert[] = [];

    const drugNameLower = String((drug as any)?.name || '').toLowerCase();
    const allergies = Array.isArray((patient as any)?.allergies) ? (patient as any).allergies : [];

    allergies.forEach((allergy: any) => {
      const allergenLower = String(allergy?.allergen || allergy?.name || '').toLowerCase();
      if (!allergenLower || !drugNameLower) return;

      // Direct drug name match
      if (drugNameLower.includes(allergenLower) || allergenLower.includes(drugNameLower)) {
        alerts.push({
          id: `allergy-direct-${Date.now()}`,
          type: 'allergy',
          severity: allergy.severity === 'life-threatening' ? 'critical' : 
                   allergy.severity === 'severe' ? 'high' : 'moderate',
          message: 'Known drug allergy detected',
          details: `Patient has documented ${allergy.severity} allergy to ${allergy.allergen}`,
          recommendedAction: 'DO NOT ADMINISTER - Consider alternative agent',
          affectedMedication: drug.name,
          category: 'general',
          source: 'Patient Allergy History',
          priority: 10
        });
      }

      // Cross-sensitivity checks
      if (allergenLower.includes('platinum') && (drugNameLower.includes('carboplatin') || drugNameLower.includes('cisplatin') || drugNameLower.includes('oxaliplatin'))) {
        alerts.push({
          id: `allergy-cross-platinum-${Date.now()}`,
          type: 'allergy',
          severity: 'high',
          message: 'Potential platinum cross-sensitivity',
          details: `Patient has allergy to ${allergy.allergen}, cross-sensitivity possible with ${drug.name}`,
          recommendedAction: 'Consider premedication or alternative non-platinum regimen',
          affectedMedication: drug.name,
          category: 'general',
          source: 'Cross-Sensitivity Database',
          priority: 8
        });
      }

      if (allergenLower.includes('sulfa') && drugNameLower.includes('sulfamethoxazole')) {
        alerts.push({
          id: `allergy-cross-sulfa-${Date.now()}`,
          type: 'allergy',
          severity: 'high',
          message: 'Sulfa allergy cross-sensitivity',
          details: `Patient has sulfa allergy, potential cross-reactivity with ${drug.name}`,
          recommendedAction: 'Consider alternative antibiotic',
          affectedMedication: drug.name,
          category: 'general',
          source: 'Cross-Sensitivity Database',
          priority: 8
        });
      }
    });

    return alerts;
  }

  private checkLabValues(patient: PatientProfile, drug: Drug): DoseCalculationAlert[] {
    const alerts: DoseCalculationAlert[] = [];
    const drugName = String((drug as any)?.name || '').toLowerCase();

    // Get most recent lab values
    const labs = Array.isArray((patient as any)?.labValues) ? (patient as any).labValues : [];
    const getRecentLab = (labType: string) => {
      const key = String(labType || '').toLowerCase();
      const filtered = labs
        .filter((lab: any) => String(lab?.labType || '').toLowerCase().includes(key))
        .sort((a: any, b: any) => (new Date(b?.timestamp || 0).getTime()) - (new Date(a?.timestamp || 0).getTime()));
      return filtered[0];
    };

    // Check absolute neutrophil count for chemotherapy
    const anc = getRecentLab('anc') || getRecentLab('neutrophil');
    if (anc && (drugName.includes('doxorubicin') || drugName.includes('carboplatin') || drugName.includes('paclitaxel'))) {
      const ancVal = Number((anc as any)?.value);
      if (Number.isFinite(ancVal) && ancVal < 1000) {
        alerts.push({
          id: `lab-anc-low-${Date.now()}`,
          type: 'lab',
          severity: 'critical',
          message: 'Severe neutropenia - hold chemotherapy',
          details: `ANC ${ancVal} cells/μL is below safe threshold for chemotherapy`,
          recommendedAction: 'Hold treatment until ANC > 1000, consider growth factor support',
          affectedMedication: drug.name,
          category: 'hematologic',
          source: 'NCCN Guidelines',
          priority: 10
        });
      } else if (Number.isFinite(ancVal) && ancVal < 1500) {
        alerts.push({
          id: `lab-anc-borderline-${Date.now()}`,
          type: 'lab',
          severity: 'high',
          message: 'Borderline neutropenia detected',
          details: `ANC ${ancVal} cells/μL requires close monitoring`,
          recommendedAction: 'Consider dose reduction or delay, monitor closely',
          affectedMedication: drug.name,
          category: 'hematologic',
          source: 'Clinical Guidelines',
          priority: 8
        });
      }
    }

    // Check platelet count
    const platelets = getRecentLab('platelet');
    const pltVal = Number((platelets as any)?.value);
    if (platelets && Number.isFinite(pltVal) && pltVal < 100) {
      alerts.push({
        id: `lab-platelets-low-${Date.now()}`,
        type: 'lab',
        severity: pltVal < 50 ? 'critical' : 'high',
        message: `${pltVal < 50 ? 'Severe' : 'Moderate'} thrombocytopenia detected`,
        details: `Platelet count ${pltVal} × 10³/μL may contraindicate therapy`,
        recommendedAction: pltVal < 50 ? 'Hold treatment, consider platelet transfusion' : 'Monitor closely, consider dose reduction',
        affectedMedication: drug.name,
        category: 'hematologic',
        source: 'Hematology Guidelines',
        priority: platelets.value < 50 ? 10 : 8
      });
    }

    // Check LVEF for cardiotoxic drugs
    const lvef = getRecentLab('lvef') || getRecentLab('ejection fraction');
    if (lvef && (drugName.includes('doxorubicin') || drugName.includes('trastuzumab'))) {
      const lvefVal = Number((lvef as any)?.value);
      if (Number.isFinite(lvefVal) && lvefVal < 50) {
        alerts.push({
          id: `lab-lvef-low-${Date.now()}`,
          type: 'lab',
          severity: lvefVal < 40 ? 'critical' : 'high',
          message: 'Reduced cardiac function detected',
          details: `LVEF ${lvefVal}% may contraindicate cardiotoxic therapy`,
          recommendedAction: lvefVal < 40 ? 'Cardiology consultation required before treatment' : 'Close cardiac monitoring recommended',
          affectedMedication: drug.name,
          category: 'cardiac',
          source: 'Cardio-Oncology Guidelines',
          priority: 9
        });
      }
    }

    return alerts;
  }

  private checkContraindications(patient: PatientProfile, drug: Drug): DoseCalculationAlert[] {
    const alerts: DoseCalculationAlert[] = [];
    const drugName = String((drug as any)?.name || '').toLowerCase();

    // Check active conditions for contraindications
    const conditions = Array.isArray((patient as any)?.conditions) ? (patient as any).conditions : [];
    conditions.forEach((condition: any) => {
      const conditionName = String(condition?.condition || condition?.name || '').toLowerCase();
      if (!conditionName) return;

      if (conditionName.includes('heart failure') && drugName.includes('doxorubicin')) {
        alerts.push({
          id: `contraindication-hf-doxorubicin-${Date.now()}`,
          type: 'contraindication',
          severity: 'critical',
          message: 'Doxorubicin contraindicated in heart failure',
          details: `Active heart failure is a contraindication to doxorubicin therapy`,
          recommendedAction: 'Consider alternative anthracycline-free regimen',
          affectedMedication: drug.name,
          category: 'cardiac',
          source: 'FDA Drug Label',
          priority: 10
        });
      }

      if (conditionName.includes('renal failure') && drugName.includes('cisplatin')) {
        alerts.push({
          id: `contraindication-rf-cisplatin-${Date.now()}`,
          type: 'contraindication',
          severity: 'critical',
          message: 'Cisplatin contraindicated in renal failure',
          details: `Renal failure is a contraindication to cisplatin therapy`,
          recommendedAction: 'Consider carboplatin or alternative regimen',
          affectedMedication: drug.name,
          category: 'renal',
          source: 'FDA Drug Label',
          priority: 10
        });
      }

      if (conditionName.includes('hearing loss') && drugName.includes('cisplatin')) {
        alerts.push({
          id: `contraindication-hearing-cisplatin-${Date.now()}`,
          type: 'contraindication',
          severity: 'high',
          message: 'Cisplatin ototoxicity risk in hearing impairment',
          details: `Pre-existing hearing loss increases ototoxicity risk with cisplatin`,
          recommendedAction: 'Consider carboplatin, baseline audiometry recommended',
          affectedMedication: drug.name,
          category: 'general',
          source: 'Clinical Guidelines',
          priority: 8
        });
      }

      if (conditionName.includes('neuropathy') && drugName.includes('paclitaxel')) {
        alerts.push({
          id: `contraindication-neuropathy-paclitaxel-${Date.now()}`,
          type: 'contraindication',
          severity: 'high',
          message: 'Paclitaxel neurotoxicity risk in existing neuropathy',
          details: `Pre-existing neuropathy may be exacerbated by paclitaxel`,
          recommendedAction: 'Consider alternative taxane or non-taxane regimen',
          affectedMedication: drug.name,
          category: 'general',
          source: 'Neurotoxicity Guidelines',
          priority: 8
        });
      }
    });

    return alerts;
  }

  private calculateSafetyScore(alerts: DoseCalculationAlert[]): number {
    let score = 100;

    alerts.forEach(alert => {
      switch (alert.severity) {
        case 'critical':
          score -= 30;
          break;
        case 'high':
          score -= 20;
          break;
        case 'moderate':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });

    return Math.max(0, score); // Ensure score doesn't go below 0
  }

  /**
   * Get clinical monitoring recommendations based on drug and patient factors
   */
  public getMonitoringRecommendations(patient: PatientProfile, drug: Drug): Array<{
    parameter: string;
    frequency: string;
    rationale: string;
    urgency: 'routine' | 'urgent' | 'critical';
  }> {
    const recommendations = [] as Array<{ parameter: string; frequency: string; rationale: string; urgency: 'routine' | 'urgent' | 'critical'; }>;
    const drugName = String((drug as any)?.name || '').toLowerCase();

    // Drug-specific monitoring
    if (drugName.includes('doxorubicin')) {
      recommendations.push({
        parameter: 'LVEF/ECHO',
        frequency: 'Before treatment, after 200-300 mg/m², then every 100 mg/m²',
        rationale: 'Monitor for doxorubicin-induced cardiomyopathy',
        urgency: 'critical' as const
      });
    }

    if (drugName.includes('cisplatin')) {
      recommendations.push(
        {
          parameter: 'Creatinine/BUN',
          frequency: 'Before each cycle',
          rationale: 'Monitor for cisplatin nephrotoxicity',
          urgency: 'critical' as const
        },
        {
          parameter: 'Audiometry',
          frequency: 'Baseline, then as clinically indicated',
          rationale: 'Monitor for cisplatin ototoxicity',
          urgency: 'routine' as const
        },
        {
          parameter: 'Electrolytes (Mg, K)',
          frequency: 'Before each cycle',
          rationale: 'Monitor for cisplatin-induced electrolyte wasting',
          urgency: 'urgent' as const
        }
      );
    }

    if (drugName.includes('paclitaxel')) {
      recommendations.push({
        parameter: 'Neurological exam',
        frequency: 'Before each cycle',
        rationale: 'Monitor for paclitaxel-induced peripheral neuropathy',
        urgency: 'routine' as const
      });
    }

    // General chemotherapy monitoring
    if (drugName.includes('carboplatin') || drugName.includes('cisplatin') || drugName.includes('doxorubicin')) {
      recommendations.push({
        parameter: 'CBC with differential',
        frequency: 'Before each cycle, nadir count (day 10-14)',
        rationale: 'Monitor for myelosuppression',
        urgency: 'critical' as const
      });
    }

    return recommendations;
  }
}

export const alertService = AlertService.getInstance();
