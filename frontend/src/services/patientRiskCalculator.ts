/**
 * Patient-Specific Risk Calculator
 * Adjusts interaction severity based on patient demographics, labs, and comorbidities.
 */

export interface RiskFactor {
  factor: string
  multiplier: number
  reason: string
}

export interface PatientAdjustedRisk {
  baseScore: number
  adjustedScore: number       // clamped 1-10
  multiplier: number          // total multiplier
  factors: RiskFactor[]
  warnings: string[]
}

interface PatientProfile {
  dateOfBirth?: string
  age?: number
  weightKg?: number
  heightCm?: number
  labValues?: { labType: string; value: number; unit?: string; date?: string }[]
  conditions?: string[]
  allergies?: string[]
  genetics?: Record<string, string>
}

// Drugs cleared renally (need eGFR adjustment)
const RENAL_DRUGS = new Set([
  'cisplatin', 'carboplatin', 'methotrexate', 'pemetrexed', 'capecitabine',
  'bleomycin', 'etoposide', 'topotecan', 'ifosfamide', 'lenalidomide',
  'vancomycin', 'gentamicin', 'enoxaparin', 'gabapentin', 'pregabalin',
])

// Drugs cleared hepatically (need LFT adjustment)
const HEPATIC_DRUGS = new Set([
  'irinotecan', 'doxorubicin', 'paclitaxel', 'docetaxel', 'vincristine',
  'imatinib', 'erlotinib', 'sorafenib', 'tamoxifen', 'methotrexate',
  'cyclophosphamide', 'etoposide', 'voriconazole', 'fluconazole',
])

/**
 * Calculate eGFR using CKD-EPI formula
 */
export function calculateEGFR(creatinine: number, age: number, isFemale: boolean = false): number {
  if (creatinine <= 0 || age <= 0) return -1
  const kappa = isFemale ? 0.7 : 0.9
  const alpha = isFemale ? -0.241 : -0.302
  const sexMultiplier = isFemale ? 1.012 : 1.0

  const cr = creatinine / kappa
  const egfr = 142 * Math.pow(Math.min(cr, 1), alpha) * Math.pow(Math.max(cr, 1), -1.200)
    * Math.pow(0.9938, age) * sexMultiplier
  return Math.round(egfr)
}

/**
 * Estimate patient age from date of birth
 */
function getAge(dob?: string, age?: number): number {
  if (age && age > 0) return age
  if (!dob) return -1
  const birth = new Date(dob)
  const now = new Date()
  let a = now.getFullYear() - birth.getFullYear()
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) a--
  return a
}

/**
 * Get lab value by type from patient profile
 */
function getLabValue(labs: { labType: string; value: number }[] | undefined, type: string): number {
  if (!labs) return -1
  const match = labs.find(l => l.labType.toLowerCase().includes(type.toLowerCase()))
  return match?.value ?? -1
}

/**
 * Calculate patient-specific risk adjustment
 */
export function calculatePatientRisk(
  interaction: { drugs?: string[]; severity?: string; mechanism?: string },
  baseScore: number,
  patient: PatientProfile | null
): PatientAdjustedRisk {
  if (!patient) {
    return { baseScore, adjustedScore: baseScore, multiplier: 1, factors: [], warnings: ['No patient data — using base score'] }
  }

  const factors: RiskFactor[] = []
  const warnings: string[] = []
  let multiplier = 1

  const age = getAge(patient.dateOfBirth, patient.age)
  const drugs = interaction.drugs?.map(d => d.toLowerCase()) || []

  // Age adjustment
  if (age >= 80) {
    multiplier *= 1.5; factors.push({ factor: `Age ${age}`, multiplier: 1.5, reason: 'Elderly patients have altered drug metabolism and increased sensitivity' })
  } else if (age >= 70) {
    multiplier *= 1.3; factors.push({ factor: `Age ${age}`, multiplier: 1.3, reason: 'Geriatric dosing considerations apply' })
  } else if (age >= 0 && age < 18) {
    multiplier *= 1.2; factors.push({ factor: `Age ${age}`, multiplier: 1.2, reason: 'Pediatric dosing — adjust for weight/BSA' })
  }

  // Renal function
  const creatinine = getLabValue(patient.labValues, 'creatinine')
  if (creatinine > 0 && age > 0) {
    const egfr = calculateEGFR(creatinine, age)
    const hasRenalDrug = drugs.some(d => RENAL_DRUGS.has(d))
    if (egfr < 30 && hasRenalDrug) {
      multiplier *= 1.5; factors.push({ factor: `eGFR ${egfr}`, multiplier: 1.5, reason: 'Severe renal impairment — renally-cleared drugs need major dose adjustment' })
      warnings.push(`eGFR ${egfr} mL/min: Consider dose reduction or alternative for ${drugs.filter(d => RENAL_DRUGS.has(d)).join(', ')}`)
    } else if (egfr < 60 && hasRenalDrug) {
      multiplier *= 1.2; factors.push({ factor: `eGFR ${egfr}`, multiplier: 1.2, reason: 'Moderate renal impairment — monitor renal drug levels' })
    }
  }

  // Hepatic function
  const alt = getLabValue(patient.labValues, 'alt')
  const ast = getLabValue(patient.labValues, 'ast')
  const bilirubin = getLabValue(patient.labValues, 'bilirubin')
  const hasHepaticDrug = drugs.some(d => HEPATIC_DRUGS.has(d))

  if (hasHepaticDrug) {
    if ((alt > 0 && alt > 200) || (bilirubin > 0 && bilirubin > 3)) {
      multiplier *= 1.5; factors.push({ factor: 'Hepatic impairment (severe)', multiplier: 1.5, reason: 'ALT/bilirubin elevated — hepatically-cleared drugs need dose reduction' })
      warnings.push('Severe hepatic impairment detected — review hepatic drug dosing')
    } else if ((alt > 0 && alt > 100) || (bilirubin > 0 && bilirubin > 1.5)) {
      multiplier *= 1.3; factors.push({ factor: 'Hepatic impairment (moderate)', multiplier: 1.3, reason: 'Moderate LFT elevation — monitor hepatic drug clearance' })
    }
  }

  // BMI extremes
  if (patient.weightKg && patient.heightCm) {
    const bmi = patient.weightKg / Math.pow(patient.heightCm / 100, 2)
    if (bmi > 40) {
      multiplier *= 1.1; factors.push({ factor: `BMI ${Math.round(bmi)}`, multiplier: 1.1, reason: 'Morbid obesity — may affect drug distribution' })
    } else if (bmi < 18.5) {
      multiplier *= 1.1; factors.push({ factor: `BMI ${Math.round(bmi)}`, multiplier: 1.1, reason: 'Underweight — reduced drug volume of distribution' })
    }
  }

  // PGx considerations
  if (patient.genetics) {
    for (const [gene, phenotype] of Object.entries(patient.genetics)) {
      const pheno = phenotype.toLowerCase()
      if (pheno.includes('poor metabolizer') || pheno.includes('deficient')) {
        multiplier *= 1.3
        factors.push({ factor: `${gene}: ${phenotype}`, multiplier: 1.3, reason: 'PGx variant — drug metabolism significantly altered' })
      } else if (pheno.includes('ultrarapid')) {
        multiplier *= 1.2
        factors.push({ factor: `${gene}: ${phenotype}`, multiplier: 1.2, reason: 'PGx variant — drug may be cleared too rapidly or converted to toxic metabolite' })
      }
    }
  }

  const adjustedScore = Math.round(Math.min(10, Math.max(1, baseScore * multiplier)))

  return { baseScore, adjustedScore, multiplier: Math.round(multiplier * 100) / 100, factors, warnings }
}
