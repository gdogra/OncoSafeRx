import Joi from 'joi';

/**
 * Generic request validation middleware
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const validation = {};

    // Validate body
    if (schema.body) {
      const { error, value } = schema.body.validate(req.body, { 
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          }))
        });
      }

      req.body = value;
    }

    // Validate query parameters
    if (schema.query) {
      const { error, value } = schema.query.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Query validation error',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          }))
        });
      }

      req.query = value;
    }

    // Validate path parameters
    if (schema.params) {
      const { error, value } = schema.params.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Parameter validation error',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          }))
        });
      }

      req.params = value;
    }

    next();
  };
};

/**
 * Specific validation schemas for clinical data
 */

// Drug/medication validation
export const medicationSchema = Joi.object({
  rxcui: Joi.string().pattern(/^\d+$/).optional(),
  name: Joi.string().min(1).max(200).required(),
  generic_name: Joi.string().min(1).max(200).optional(),
  brand_names: Joi.array().items(Joi.string().max(100)).optional(),
  dose: Joi.string().max(50).optional(),
  frequency: Joi.string().max(50).optional(),
  route: Joi.string().valid('oral', 'IV', 'IM', 'SC', 'topical', 'inhalation', 'rectal', 'other').optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
  indication: Joi.string().max(200).optional()
});

// Patient context validation
export const patientContextSchema = Joi.object({
  patientId: Joi.string().optional(),
  age: Joi.number().integer().min(0).max(120).optional(),
  weight: Joi.number().positive().max(1000).optional(), // kg
  height: Joi.number().positive().max(300).optional(), // cm
  sex: Joi.string().valid('male', 'female', 'other', 'unknown').optional(),
  ethnicity: Joi.string().max(100).optional(),
  
  // Medical history
  comorbidities: Joi.array().items(
    Joi.string().valid(
      'diabetes', 'hypertension', 'heart_disease', 'kidney_disease', 
      'liver_disease', 'lung_disease', 'autoimmune_disease', 'depression',
      'anxiety', 'other'
    )
  ).optional(),
  
  allergies: Joi.array().items(Joi.object({
    allergen: Joi.string().required(),
    reaction: Joi.string().optional(),
    severity: Joi.string().valid('mild', 'moderate', 'severe').optional()
  })).optional(),

  // Organ function
  kidneyFunction: Joi.number().min(0).max(200).optional(), // eGFR
  liverFunction: Joi.object({
    alt: Joi.number().min(0).optional(),
    ast: Joi.number().min(0).optional(),
    bilirubin: Joi.number().min(0).optional(),
    albumin: Joi.number().min(0).optional()
  }).optional(),

  // Cancer-specific
  cancerType: Joi.string().valid(
    'breast', 'lung', 'colorectal', 'prostate', 'lymphoma', 'leukemia',
    'melanoma', 'ovarian', 'pancreatic', 'gastric', 'head_neck', 'sarcoma',
    'brain', 'kidney', 'bladder', 'thyroid', 'liver', 'other'
  ).optional(),
  
  cancerStage: Joi.string().valid(
    'I', 'II', 'III', 'IV', 'stage_0', 'stage_1', 'stage_2', 'stage_3', 'stage_4'
  ).optional(),
  
  performanceStatus: Joi.number().integer().min(0).max(4).optional(), // ECOG
  
  priorTherapies: Joi.array().items(Joi.object({
    therapy: Joi.string().required(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    response: Joi.string().valid('CR', 'PR', 'SD', 'PD', 'unknown').optional()
  })).optional(),

  // Biomarkers
  biomarkers: Joi.object({
    her2: Joi.string().valid('positive', 'negative', 'unknown').optional(),
    er: Joi.string().valid('positive', 'negative', 'unknown').optional(),
    pr: Joi.string().valid('positive', 'negative', 'unknown').optional(),
    pdl1: Joi.number().min(0).max(100).optional(),
    msi: Joi.string().valid('stable', 'high', 'unknown').optional(),
    brca1: Joi.string().valid('mutation', 'wild_type', 'unknown').optional(),
    brca2: Joi.string().valid('mutation', 'wild_type', 'unknown').optional(),
    kras: Joi.string().valid('mutation', 'wild_type', 'unknown').optional(),
    egfr: Joi.string().valid('mutation', 'wild_type', 'unknown').optional()
  }).optional(),

  // Pharmacogenetics
  genetics: Joi.object().pattern(
    Joi.string().valid(
      'CYP2D6', 'CYP2C19', 'CYP2C9', 'CYP3A4', 'CYP3A5',
      'DPYD', 'UGT1A1', 'TPMT', 'SLCO1B1', 'VKORC1', 'ABCB1'
    ),
    Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string()),
      Joi.object()
    )
  ).optional(),

  // Current medications
  currentMedications: Joi.array().items(medicationSchema).optional(),

  // Laboratory values
  laboratoryValues: Joi.object({
    hemoglobin: Joi.number().min(0).max(25).optional(),
    hematocrit: Joi.number().min(0).max(100).optional(),
    wbc: Joi.number().min(0).optional(),
    neutrophils: Joi.number().min(0).optional(),
    platelets: Joi.number().min(0).optional(),
    creatinine: Joi.number().min(0).max(20).optional(),
    bun: Joi.number().min(0).max(200).optional(),
    glucose: Joi.number().min(0).max(1000).optional()
  }).optional()
});

// Prescription validation
export const prescriptionSchema = Joi.object({
  prescriptionId: Joi.string().optional(),
  medications: Joi.array().items(medicationSchema).min(1).required(),
  patientContext: patientContextSchema.optional(),
  prescriber: Joi.object({
    id: Joi.string().optional(),
    name: Joi.string().optional(),
    npi: Joi.string().pattern(/^\d{10}$/).optional(),
    specialty: Joi.string().optional()
  }).optional(),
  timestamp: Joi.date().iso().optional()
});

// Patient profile (rich, all-optional to allow skip)
// Genetic data validation (moved up so it can be referenced by patientProfileSchema)
export const geneticDataSchema = Joi.object().pattern(
  Joi.string(), // gene name
  Joi.object({
    variants: Joi.array().items(Joi.string()).optional(),
    phenotype: Joi.string().optional(),
    diplotype: Joi.string().optional(),
    activityScore: Joi.number().optional(),
    confidence: Joi.string().valid('high', 'moderate', 'low').optional(),
    testDate: Joi.date().iso().optional(),
    laboratory: Joi.string().optional()
  })
);

export const patientProfileSchema = Joi.object({
  demographics: Joi.object({
    firstName: Joi.string().max(100).optional(),
    lastName: Joi.string().max(100).optional(),
    middleName: Joi.string().max(100).optional(),
    dateOfBirth: Joi.date().iso().optional(),
    sex: Joi.string().valid('male', 'female', 'other', 'unknown').optional(),
    ethnicity: Joi.string().max(100).optional(),
    race: Joi.string().max(100).optional(),
    phone: Joi.string().max(50).optional(),
    email: Joi.string().email().optional(),
    address: Joi.object({
      line1: Joi.string().max(200).optional(),
      line2: Joi.string().max(200).optional(),
      city: Joi.string().max(100).optional(),
      state: Joi.string().max(100).optional(),
      postalCode: Joi.string().max(20).optional(),
      country: Joi.string().max(100).optional()
    }).optional()
  }).optional(),
  cancer: Joi.object({
    cancerType: Joi.string().optional(),
    cancerStage: Joi.string().optional(),
    histology: Joi.string().optional(),
    diagnosisDate: Joi.date().iso().optional(),
    treatingCenter: Joi.string().optional(),
    treatingPhysician: Joi.string().optional()
  }).optional(),
  medicalHistory: Joi.object({
    conditions: Joi.array().items(Joi.string()).optional(),
    surgeries: Joi.array().items(Joi.string()).optional(),
    allergies: Joi.array().items(Joi.object({
      allergen: Joi.string().required(),
      reaction: Joi.string().optional(),
      severity: Joi.string().valid('mild', 'moderate', 'severe').optional()
    })).optional(),
    familyHistory: Joi.array().items(Joi.string()).optional()
  }).optional(),
  medications: Joi.array().items(medicationSchema).optional(),
  biomarkers: Joi.object({
    her2: Joi.string().valid('positive', 'negative', 'unknown').optional(),
    er: Joi.string().valid('positive', 'negative', 'unknown').optional(),
    pr: Joi.string().valid('positive', 'negative', 'unknown').optional(),
    pdl1: Joi.number().min(0).max(100).optional(),
    msi: Joi.string().valid('high', 'stable', 'unknown').optional()
  }).optional(),
  genomics: geneticDataSchema.optional(),
  insurance: Joi.object({
    provider: Joi.string().optional(),
    memberId: Joi.string().optional(),
    groupNumber: Joi.string().optional()
  }).optional(),
  emergencyContact: Joi.object({
    name: Joi.string().optional(),
    relationship: Joi.string().optional(),
    phone: Joi.string().optional()
  }).optional(),
  consents: Joi.object({
    shareDeidentifiedData: Joi.boolean().optional(),
    researchContactOk: Joi.boolean().optional()
  }).optional()
});

// Analysis request validation
export const analysisRequestSchema = Joi.object({
  sessionId: Joi.string().optional(),
  analysisType: Joi.string().valid(
    'drug_interactions', 'clinical_decision_support', 'pharmacogenomics',
    'comprehensive_analysis', 'alternatives'
  ).required(),
  priority: Joi.string().valid('routine', 'urgent', 'stat').default('routine'),
  includeRecommendations: Joi.boolean().default(true),
  includeMonitoring: Joi.boolean().default(true),
  includeAlternatives: Joi.boolean().default(false)
});

// (moved geneticDataSchema above)

/**
 * Clinical-specific validation functions
 */

// Validate drug dosing
export const validateDosing = (dose, route, frequency) => {
  const schema = Joi.object({
    dose: Joi.string().pattern(/^\d+(\.\d+)?\s*(mg|g|mcg|units?|mL|IU)$/).required(),
    route: Joi.string().valid('oral', 'IV', 'IM', 'SC').required(),
    frequency: Joi.string().pattern(/^(daily|BID|TID|QID|Q\d+H|PRN|once)$/i).required()
  });

  return schema.validate({ dose, route, frequency });
};

// Validate interaction severity
export const validateInteractionSeverity = (severity) => {
  const validSeverities = ['critical', 'major', 'moderate', 'minor', 'unknown'];
  return validSeverities.includes(severity?.toLowerCase());
};

// Validate clinical recommendation
export const validateRecommendation = (recommendation) => {
  const schema = Joi.object({
    type: Joi.string().valid('dose_adjustment', 'monitoring', 'alternative', 'contraindication').required(),
    priority: Joi.string().valid('critical', 'high', 'moderate', 'low').required(),
    description: Joi.string().min(10).max(500).required(),
    evidence: Joi.string().valid('A', 'B', 'C', 'D').optional(),
    source: Joi.string().optional()
  });

  return schema.validate(recommendation);
};

/**
 * Sanitization functions
 */

// Sanitize patient data (remove PII for logging)
export const sanitizePatientData = (patientData) => {
  const sanitized = { ...patientData };
  
  // Remove identifying information
  delete sanitized.patientId;
  delete sanitized.name;
  delete sanitized.ssn;
  delete sanitized.mrn;
  delete sanitized.dateOfBirth;
  
  // Keep only clinical data
  return {
    age: sanitized.age,
    sex: sanitized.sex,
    weight: sanitized.weight,
    comorbidities: sanitized.comorbidities,
    cancerType: sanitized.cancerType,
    cancerStage: sanitized.cancerStage,
    genetics: sanitized.genetics
  };
};

// Validate and normalize drug names
export const normalizeDrugName = (drugName) => {
  if (!drugName || typeof drugName !== 'string') {
    throw new Error('Invalid drug name');
  }
  
  // Basic normalization
  return drugName.trim().toLowerCase();
};

export default {
  validateRequest,
  medicationSchema,
  patientContextSchema,
  prescriptionSchema,
  analysisRequestSchema,
  geneticDataSchema,
  validateDosing,
  validateInteractionSeverity,
  validateRecommendation,
  sanitizePatientData,
  normalizeDrugName
};
