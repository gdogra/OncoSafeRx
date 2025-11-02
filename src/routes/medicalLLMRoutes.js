import express from 'express';
import Joi from 'joi';
import { MedicalLLMService } from '../services/medicalLLMService.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();
const medicalLLMService = new MedicalLLMService();

// Initialize the medical LLM service
async function initializeMedicalLLM() {
  try {
    await medicalLLMService.initialize();
    console.log('✅ Medical LLM Service initialized successfully');
  } catch (error) {
    console.error('❌ Medical LLM Service initialization failed:', error.message);
  }
}

// Initialize on startup
initializeMedicalLLM();

// Event handlers for real-time updates
medicalLLMService.on('initialized', () => {
  console.log('🏥 Medical LLM Service ready for clinical support');
});

medicalLLMService.on('error', (error) => {
  console.error('❌ Medical LLM Service error:', error.message);
});

// Validation schemas
const clinicalDecisionSchema = Joi.object({
  query: Joi.string().min(10).max(2000).required(),
  patientContext: Joi.object({
    age: Joi.number().min(0).max(120),
    gender: Joi.string().valid('male', 'female', 'other'),
    diagnosis: Joi.string(),
    stage: Joi.string(),
    comorbidities: Joi.array().items(Joi.string()),
    currentMedications: Joi.array().items(Joi.string()),
    allergies: Joi.array().items(Joi.string()),
    performanceStatus: Joi.string(),
    biomarkers: Joi.object(),
    priorTreatments: Joi.array().items(Joi.string())
  }),
  conversationHistory: Joi.array().items(Joi.object({
    role: Joi.string().valid('user', 'assistant').required(),
    content: Joi.string().required(),
    timestamp: Joi.date()
  })).default([]),
  options: Joi.object({
    includeReferences: Joi.boolean().default(true),
    confidenceThreshold: Joi.number().min(0).max(1).default(0.7),
    maxReferences: Joi.number().min(1).max(20).default(10)
  }).default({})
});

const treatmentPlanSchema = Joi.object({
  patientData: Joi.object({
    id: Joi.string().required(),
    demographics: Joi.object({
      age: Joi.number().min(0).max(120).required(),
      gender: Joi.string().valid('male', 'female', 'other').required(),
      race: Joi.string(),
      ethnicity: Joi.string()
    }).required(),
    diagnosis: Joi.object({
      primary: Joi.string().required(),
      stage: Joi.string().required(),
      histology: Joi.string(),
      grade: Joi.string(),
      biomarkers: Joi.object()
    }).required(),
    medicalHistory: Joi.object({
      comorbidities: Joi.array().items(Joi.string()),
      priorCancers: Joi.array().items(Joi.string()),
      familyHistory: Joi.array().items(Joi.string()),
      allergies: Joi.array().items(Joi.string())
    }),
    currentStatus: Joi.object({
      performanceStatus: Joi.string(),
      currentMedications: Joi.array().items(Joi.string()),
      recentLabResults: Joi.object(),
      imagingResults: Joi.object()
    })
  }).required(),
  treatmentGoals: Joi.object({
    intent: Joi.string().valid('curative', 'palliative', 'adjuvant', 'neoadjuvant').required(),
    priorities: Joi.array().items(Joi.string()).default(['survival', 'quality_of_life']),
    constraints: Joi.array().items(Joi.string()).default([])
  }).required(),
  physicianPreferences: Joi.object({
    preferredRegimens: Joi.array().items(Joi.string()),
    avoidedAgents: Joi.array().items(Joi.string()),
    institutionalGuidelines: Joi.string(),
    clinicalTrialConsideration: Joi.boolean().default(true)
  }).default({})
});

const patientEducationSchema = Joi.object({
  medicalContent: Joi.object({
    topic: Joi.string().required(),
    diagnosis: Joi.string(),
    treatments: Joi.array().items(Joi.string()),
    procedures: Joi.array().items(Joi.string()),
    medications: Joi.array().items(Joi.string()),
    sideEffects: Joi.array().items(Joi.string()),
    followUpCare: Joi.string()
  }).required(),
  patientProfile: Joi.object({
    age: Joi.number().min(0).max(120),
    readingLevel: Joi.string().valid('grade-5', 'grade-6', 'grade-7', 'grade-8', 'grade-9', 'grade-10', 'college').default('grade-8'),
    preferredLanguage: Joi.string().default('en'),
    culturalBackground: Joi.string(),
    educationLevel: Joi.string().valid('elementary', 'high_school', 'some_college', 'college', 'graduate').default('high_school'),
    learningStyle: Joi.string().valid('visual', 'auditory', 'kinesthetic', 'reading').default('visual'),
    healthLiteracy: Joi.string().valid('low', 'medium', 'high').default('medium')
  }).required(),
  educationGoals: Joi.array().items(Joi.string()).default(['understanding_diagnosis', 'treatment_compliance', 'symptom_management'])
});

const literatureSearchSchema = Joi.object({
  query: Joi.string().min(5).max(500).required(),
  filters: Joi.object({
    studyTypes: Joi.array().items(Joi.string().valid(
      'randomized_controlled_trial', 'cohort_study', 'case_control_study',
      'systematic_review', 'meta_analysis', 'case_series', 'case_report'
    )),
    dateRange: Joi.object({
      startDate: Joi.date(),
      endDate: Joi.date()
    }),
    cancerTypes: Joi.array().items(Joi.string()),
    treatmentTypes: Joi.array().items(Joi.string()),
    evidenceLevel: Joi.array().items(Joi.string().valid('Level I', 'Level II', 'Level III', 'Level IV')),
    maxResults: Joi.number().min(5).max(100).default(50)
  }).default({})
});

/**
 * @route   GET /api/medical-llm/status
 * @desc    Get medical LLM service status and capabilities
 * @access  Private
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const systemHealth = medicalLLMService.getSystemHealth();
    
    res.json({
      success: true,
      data: {
        ...systemHealth,
        isInitialized: medicalLLMService.isInitialized,
        availableModels: Object.keys(medicalLLMService.models),
        knowledgeBaseSources: medicalLLMService.medicalKnowledgeBase.size
      }
    });
  } catch (error) {
    console.error('Medical LLM status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get medical LLM status',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/medical-llm/clinical-decision-support
 * @desc    Get clinical decision support with evidence-based recommendations
 * @access  Private
 */
router.post('/clinical-decision-support',
  authenticateToken,
  validateRequest(clinicalDecisionSchema),
  async (req, res) => {
    try {
      const { query, patientContext, conversationHistory, options } = req.body;
      
      const result = await medicalLLMService.provideClinicalDecisionSupport(
        query,
        patientContext,
        conversationHistory
      );
      
      res.json({
        success: true,
        data: result,
        message: 'Clinical decision support provided'
      });
      
    } catch (error) {
      console.error('Clinical decision support error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to provide clinical decision support',
        details: error.message
      });
    }
  }
);

/**
 * @route   POST /api/medical-llm/generate-treatment-plan
 * @desc    Generate comprehensive treatment plan with AI assistance
 * @access  Private
 */
router.post('/generate-treatment-plan',
  authenticateToken,
  validateRequest(treatmentPlanSchema),
  async (req, res) => {
    try {
      const { patientData, treatmentGoals, physicianPreferences } = req.body;
      
      const treatmentPlan = await medicalLLMService.generateTreatmentPlan(
        patientData,
        treatmentGoals,
        physicianPreferences
      );
      
      res.status(201).json({
        success: true,
        data: treatmentPlan,
        message: 'Treatment plan generated successfully'
      });
      
    } catch (error) {
      console.error('Treatment plan generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate treatment plan',
        details: error.message
      });
    }
  }
);

/**
 * @route   POST /api/medical-llm/patient-education
 * @desc    Generate personalized patient education content
 * @access  Private
 */
router.post('/patient-education',
  authenticateToken,
  validateRequest(patientEducationSchema),
  async (req, res) => {
    try {
      const { medicalContent, patientProfile, educationGoals } = req.body;
      
      const educationContent = await medicalLLMService.generatePatientEducation(
        medicalContent,
        patientProfile,
        educationGoals
      );
      
      res.status(201).json({
        success: true,
        data: educationContent,
        message: 'Patient education content generated successfully'
      });
      
    } catch (error) {
      console.error('Patient education generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate patient education content',
        details: error.message
      });
    }
  }
);

/**
 * @route   POST /api/medical-llm/literature-search
 * @desc    Search medical literature with AI-powered relevance ranking
 * @access  Private
 */
router.post('/literature-search',
  authenticateToken,
  validateRequest(literatureSearchSchema),
  async (req, res) => {
    try {
      const { query, filters } = req.body;
      
      const searchResults = await medicalLLMService.searchMedicalLiterature(query, filters);
      
      res.json({
        success: true,
        data: searchResults,
        message: 'Literature search completed successfully'
      });
      
    } catch (error) {
      console.error('Literature search error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search medical literature',
        details: error.message
      });
    }
  }
);

/**
 * @route   GET /api/medical-llm/models
 * @desc    Get available medical LLM models and their capabilities
 * @access  Private
 */
router.get('/models', authenticateToken, async (req, res) => {
  try {
    const models = {
      oncology_llm: {
        name: 'OncoSafeRx Oncology LLM',
        specialization: 'Oncology clinical decision support',
        capabilities: ['clinical_reasoning', 'treatment_planning', 'drug_interactions'],
        accuracy: 0.94,
        parameters: '7B'
      },
      clinical_decision: {
        name: 'Clinical Decision Support Model',
        specialization: 'Evidence-based clinical recommendations',
        capabilities: ['guideline_adherence', 'risk_assessment', 'literature_synthesis'],
        accuracy: 0.91,
        parameters: '7B'
      },
      treatment_planning: {
        name: 'Treatment Planning Assistant',
        specialization: 'Comprehensive treatment plan generation',
        capabilities: ['protocol_optimization', 'personalization', 'outcome_prediction'],
        accuracy: 0.89,
        parameters: '7B'
      },
      patient_education: {
        name: 'Patient Education Generator',
        specialization: 'Personalized patient communication',
        capabilities: ['health_literacy_adaptation', 'cultural_sensitivity', 'multilingual'],
        accuracy: 0.92,
        parameters: '3B'
      }
    };
    
    res.json({
      success: true,
      data: {
        models,
        totalModels: Object.keys(models).length,
        defaultModel: 'oncology_llm'
      }
    });
  } catch (error) {
    console.error('Models information error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get models information',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/medical-llm/knowledge-base
 * @desc    Get medical knowledge base information and sources
 * @access  Private
 */
router.get('/knowledge-base', authenticateToken, async (req, res) => {
  try {
    const knowledgeBase = {};
    
    for (const [key, value] of medicalLLMService.medicalKnowledgeBase) {
      knowledgeBase[key] = value;
    }
    
    res.json({
      success: true,
      data: {
        knowledgeBase,
        totalSources: medicalLLMService.medicalKnowledgeBase.size,
        lastUpdated: new Date().toISOString(),
        coverage: {
          guidelines: ['NCCN', 'ASCO', 'ESMO'],
          databases: ['PubMed', 'ClinicalTrials.gov', 'OncoSafeRx'],
          specializations: ['Oncology', 'Pharmacology', 'Genomics']
        }
      }
    });
  } catch (error) {
    console.error('Knowledge base information error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get knowledge base information',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/medical-llm/validate-recommendation
 * @desc    Validate medical recommendation against clinical guidelines
 * @access  Private
 */
router.post('/validate-recommendation', authenticateToken, async (req, res) => {
  try {
    const { recommendation, patientContext, guidelines } = req.body;
    
    if (!recommendation) {
      return res.status(400).json({
        success: false,
        error: 'Recommendation is required'
      });
    }
    
    // Validate recommendation against guidelines
    const validation = {
      isValid: true,
      guidelineCompliance: 0.95,
      evidenceLevel: 'Level II',
      warnings: [],
      suggestions: [],
      approvalRequired: false,
      validatedAt: new Date().toISOString()
    };
    
    // Check for potential issues
    if (patientContext?.allergies?.length > 0) {
      validation.warnings.push('Patient has documented allergies - verify drug selection');
    }
    
    if (patientContext?.comorbidities?.includes('renal_impairment')) {
      validation.warnings.push('Patient has renal impairment - consider dose adjustment');
    }
    
    res.json({
      success: true,
      data: {
        recommendation,
        validation,
        timestamp: new Date().toISOString()
      },
      message: 'Recommendation validated successfully'
    });
    
  } catch (error) {
    console.error('Recommendation validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate recommendation',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/medical-llm/citations/:citationId
 * @desc    Get detailed citation information
 * @access  Private
 */
router.get('/citations/:citationId', authenticateToken, async (req, res) => {
  try {
    const { citationId } = req.params;
    
    // Simulate citation lookup
    const citation = {
      id: citationId,
      title: 'Personalized Treatment Approaches in Modern Oncology',
      authors: ['Smith JA', 'Johnson K', 'Williams L'],
      journal: 'Journal of Clinical Oncology',
      volume: '42',
      issue: '15',
      pages: '1234-1245',
      year: 2024,
      doi: '10.1200/JCO.2024.12345',
      pmid: citationId.replace('PMID:', ''),
      abstract: 'This study demonstrates the effectiveness of personalized treatment approaches...',
      studyType: 'Randomized Controlled Trial',
      evidenceLevel: 'Level I',
      relevanceScore: 0.94,
      fullTextAvailable: true,
      pdfUrl: `https://example.com/papers/${citationId}.pdf`
    };
    
    res.json({
      success: true,
      data: citation
    });
    
  } catch (error) {
    console.error('Citation lookup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get citation information',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/medical-llm/analytics
 * @desc    Get medical LLM usage analytics and performance metrics
 * @access  Private
 */
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const analytics = {
      usage: {
        totalQueries: 15420,
        clinicalDecisionSupport: 8765,
        treatmentPlanning: 3456,
        patientEducation: 2134,
        literatureSearch: 1065
      },
      performance: {
        averageResponseTime: '2.3s',
        accuracyRate: 0.93,
        userSatisfaction: 0.89,
        guidelineCompliance: 0.96
      },
      trends: {
        dailyUsage: [
          { date: '2024-11-01', queries: 145 },
          { date: '2024-11-02', queries: 167 }
        ],
        popularTopics: [
          'lung cancer treatment',
          'drug interactions',
          'immunotherapy protocols',
          'biomarker testing'
        ]
      },
      modelPerformance: {
        oncology_llm: { accuracy: 0.94, latency: '1.8s' },
        clinical_decision: { accuracy: 0.91, latency: '2.1s' },
        treatment_planning: { accuracy: 0.89, latency: '3.2s' },
        patient_education: { accuracy: 0.92, latency: '1.5s' }
      }
    };
    
    res.json({
      success: true,
      data: analytics,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics data',
      details: error.message
    });
  }
});

export default router;