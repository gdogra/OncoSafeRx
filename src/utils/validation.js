import Joi from 'joi';
import { ValidationError } from '../middleware/errorHandler.js';

// Validation schemas
export const schemas = {
  // Drug search validation
  drugSearch: Joi.object({
    q: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Search query must be at least 2 characters',
      'string.max': 'Search query cannot exceed 100 characters',
      'any.required': 'Search query (q) is required'
    })
  }),

  // RXCUI validation
  rxcui: Joi.object({
    rxcui: Joi.string().pattern(/^\d+$/).required().messages({
      'string.pattern.base': 'RXCUI must contain only numbers',
      'any.required': 'RXCUI is required'
    })
  }),

  // Interaction check validation (expects array of RXCUI strings)
  interactionCheck: Joi.object({
    drugs: Joi.array()
      .items(
        Joi.string()
          .pattern(/^\d+$/)
          .messages({ 'string.pattern.base': 'Each drug must be a valid RXCUI (numbers only)' })
      )
      .min(1)
      .max(10)
      .required()
      .messages({
        'array.min': 'At least 1 drug is required for interaction checking',
        'array.max': 'Maximum 10 drugs allowed for interaction checking',
        'any.required': 'Drugs array is required'
      }),
    patient_context: Joi.object().optional(),
    include_recommendations: Joi.boolean().optional()
  }),

  // Genomics profile validation
  genomicsProfile: Joi.object({
    genes: Joi.array()
      .items(Joi.string().pattern(/^[A-Z0-9_]+$/))
      .min(1)
      .max(20)
      .required()
      .messages({
        'array.min': 'At least 1 gene is required',
        'array.max': 'Maximum 20 genes allowed',
        'string.pattern.base': 'Gene names must contain only uppercase letters, numbers, and underscores',
        'any.required': 'Genes array is required'
      }),
    drugs: Joi.array()
      .items(Joi.string().pattern(/^\d+$/))
      .min(1)
      .max(10)
      .required()
      .messages({
        'array.min': 'At least 1 drug is required',
        'array.max': 'Maximum 10 drugs allowed',
        'string.pattern.base': 'Each drug must be a valid RXCUI (numbers only)',
        'any.required': 'Drugs array is required'
      })
  })
  ,
  // Pain management: MME calculation
  mmeCalc: Joi.object({
    medications: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      route: Joi.string().valid('oral', 'transdermal', 'sublingual', 'buccal', 'iv', 'im').optional(),
      doseMgPerDose: Joi.number().min(0).optional(),
      dosesPerDay: Joi.number().min(0).optional(),
      totalDailyDoseMg: Joi.number().min(0).optional(),
      strengthMcgPerHr: Joi.number().min(0).optional(),
      mcgPerHr: Joi.number().min(0).optional()
    })).min(1).required(),
    patient_context: Joi.object().optional()
  }),

  // Pain management: safety check
  painSafetyCheck: Joi.object({
    medications: Joi.array().items(Joi.alternatives(
      Joi.string(),
      Joi.object({ name: Joi.string().required() })
    )).min(1).required(),
    phenotypes: Joi.object().optional(),
    patient_context: Joi.object().optional()
  }),

  // Fallback pass-through in case routes opt-in lazily
  passthrough: Joi.object().unknown(true)
};

// Validation middleware factory
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'body' ? req.body : 
                 source === 'params' ? req.params : 
                 source === 'query' ? req.query : req.body;

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join('; ');
      throw new ValidationError(errorMessage);
    }

    // Replace the original data with validated/sanitized data
    if (source === 'body') req.body = value;
    else if (source === 'params') req.params = value;
    else if (source === 'query') req.query = value;

    next();
  };
};

// Helper functions
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

export const isValidRxcui = (rxcui) => {
  return /^\d+$/.test(rxcui);
};

export const isValidGene = (gene) => {
  return /^[A-Z0-9_]+$/.test(gene);
};
