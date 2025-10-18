import axios from 'axios';

class AIRecommendationService {
  constructor() {
    this.openAIApiKey = process.env.OPENAI_API_KEY;
    this.openAIBaseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    this.huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;
    this.cache = new Map();
    this.cacheTimeout = 1000 * 60 * 30; // 30 minutes

    // Clinical AI models and endpoints
    this.models = {
      clinical_decision: 'gpt-4-turbo-preview',
      drug_interaction: 'gpt-3.5-turbo',
      treatment_planning: 'gpt-4-turbo-preview',
      risk_assessment: 'gpt-3.5-turbo'
    };

    // Initialize clinical knowledge base
    this.clinicalKnowledge = {
      drugInteractions: new Map(),
      treatmentGuidelines: new Map(),
      riskFactors: new Map()
    };

    this.loadClinicalKnowledge();
  }

  /**
   * Generate clinical decision support recommendations
   */
  async generateClinicalRecommendations(patientData, clinicalContext = {}) {
    try {
      const cacheKey = `clinical_${JSON.stringify({ patientData, clinicalContext })}`;
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      const recommendations = await this.generateRecommendationsWithAI(patientData, clinicalContext);
      
      this.cache.set(cacheKey, {
        data: recommendations,
        timestamp: Date.now()
      });

      return recommendations;

    } catch (error) {
      console.error('Error generating clinical recommendations:', error);
      return this.getFallbackRecommendations(patientData, clinicalContext);
    }
  }

  /**
   * Generate recommendations using AI models
   */
  async generateRecommendationsWithAI(patientData, clinicalContext) {
    const prompt = this.buildClinicalPrompt(patientData, clinicalContext);
    
    try {
      // Use OpenAI GPT-4 for clinical reasoning
      const response = await this.callOpenAI(prompt, this.models.clinical_decision);
      
      const recommendations = this.parseAIResponse(response);
      
      // Enhance with rule-based clinical logic
      const enhancedRecommendations = await this.enhanceWithClinicalRules(recommendations, patientData);
      
      // Add confidence scoring
      const scoredRecommendations = this.addConfidenceScoring(enhancedRecommendations, patientData);
      
      return {
        recommendations: scoredRecommendations,
        metadata: {
          model: this.models.clinical_decision,
          timestamp: new Date().toISOString(),
          patientFactors: this.extractPatientFactors(patientData),
          clinicalContext,
          aiGenerated: true
        }
      };

    } catch (aiError) {
      console.warn('AI service unavailable, using clinical algorithms:', aiError.message);
      return this.generateAlgorithmicRecommendations(patientData, clinicalContext);
    }
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(prompt, model) {
    if (!this.openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await axios.post(`${this.openAIBaseUrl}/chat/completions`, {
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a clinical decision support AI specializing in oncology and pharmacology. Provide evidence-based recommendations with safety considerations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for clinical consistency
      max_tokens: 1500,
      top_p: 0.9
    }, {
      headers: {
        'Authorization': `Bearer ${this.openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    return response.data.choices[0].message.content;
  }

  /**
   * Build clinical reasoning prompt
   */
  buildClinicalPrompt(patientData, clinicalContext) {
    return `
Clinical Decision Support Request:

PATIENT PROFILE:
- Age: ${patientData.age} years
- Gender: ${patientData.gender}
- Primary Diagnosis: ${patientData.conditions?.[0] || 'Not specified'}
- Secondary Conditions: ${patientData.conditions?.slice(1).join(', ') || 'None'}
- Current Medications: ${patientData.medications?.map(m => m.name).join(', ') || 'None'}
- Known Allergies: ${patientData.allergies?.join(', ') || 'None'}
- Performance Status: ECOG ${patientData.ecogPerformanceStatus || 'Not specified'}
- Renal Function: ${patientData.renalFunction || 'Normal'}
- Hepatic Function: ${patientData.hepaticFunction || 'Normal'}

CLINICAL CONTEXT:
- Treatment Goal: ${clinicalContext.treatmentGoal || 'Optimize therapy'}
- Current Treatment Line: ${clinicalContext.treatmentLine || 'First-line'}
- Biomarkers: ${clinicalContext.biomarkers?.join(', ') || 'Not available'}
- Previous Treatments: ${clinicalContext.previousTreatments?.join(', ') || 'None'}

SPECIFIC REQUEST:
${clinicalContext.specificRequest || 'Provide comprehensive treatment recommendations'}

Please provide:
1. Treatment recommendations with evidence level
2. Drug interaction warnings
3. Dosing considerations
4. Monitoring requirements
5. Alternative options if contraindications exist
6. Risk-benefit assessment

Format your response as structured JSON with the following fields:
- primaryRecommendations
- drugInteractionAlerts
- dosingGuidance
- monitoringPlan
- alternativeOptions
- riskAssessment
- evidenceLevel
- clinicalRationale
`;
  }

  /**
   * Parse AI response into structured format
   */
  parseAIResponse(aiResponse) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       aiResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      
      // Fallback: parse structured text response
      return this.parseTextResponse(aiResponse);
      
    } catch (error) {
      console.warn('Failed to parse AI response, using text analysis:', error);
      return this.parseTextResponse(aiResponse);
    }
  }

  /**
   * Parse unstructured text response
   */
  parseTextResponse(textResponse) {
    const sections = {
      primaryRecommendations: [],
      drugInteractionAlerts: [],
      dosingGuidance: [],
      monitoringPlan: [],
      alternativeOptions: [],
      riskAssessment: 'Standard risk profile',
      evidenceLevel: 'Moderate',
      clinicalRationale: textResponse.substring(0, 500)
    };

    // Extract key recommendations using pattern matching
    const lines = textResponse.split('\n');
    let currentSection = 'primaryRecommendations';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Identify section headers
      if (trimmedLine.toLowerCase().includes('interaction')) {
        currentSection = 'drugInteractionAlerts';
      } else if (trimmedLine.toLowerCase().includes('dosing') || trimmedLine.toLowerCase().includes('dose')) {
        currentSection = 'dosingGuidance';
      } else if (trimmedLine.toLowerCase().includes('monitor')) {
        currentSection = 'monitoringPlan';
      } else if (trimmedLine.toLowerCase().includes('alternative')) {
        currentSection = 'alternativeOptions';
      } else if (trimmedLine.toLowerCase().includes('risk')) {
        currentSection = 'riskAssessment';
        sections.riskAssessment = trimmedLine;
        continue;
      }
      
      // Extract bullet points or numbered items
      if (trimmedLine.match(/^[-•*]\s/) || trimmedLine.match(/^\d+\.\s/)) {
        const cleanedLine = trimmedLine.replace(/^[-•*\d+\.\s]+/, '');
        if (Array.isArray(sections[currentSection])) {
          sections[currentSection].push(cleanedLine);
        }
      }
    }

    return sections;
  }

  /**
   * Enhance with rule-based clinical logic
   */
  async enhanceWithClinicalRules(recommendations, patientData) {
    const enhanced = { ...recommendations };
    
    // Add age-specific considerations
    if (patientData.age >= 65) {
      enhanced.ageSpecificAlerts = [
        'Consider dose reduction in elderly patients',
        'Monitor for increased risk of adverse effects',
        'Assess for polypharmacy interactions'
      ];
    }
    
    // Add renal function considerations
    if (patientData.renalFunction === 'impaired') {
      enhanced.renalConsiderations = [
        'Dose adjustment required for renal impairment',
        'Monitor creatinine and electrolytes',
        'Consider nephrotoxic drug alternatives'
      ];
    }
    
    // Add drug-specific guidance
    if (patientData.medications) {
      enhanced.medicationSpecificGuidance = await this.generateMedicationGuidance(patientData.medications);
    }
    
    // Add allergy considerations
    if (patientData.allergies?.length > 0) {
      enhanced.allergyAlerts = this.generateAllergyAlerts(patientData.allergies);
    }
    
    return enhanced;
  }

  /**
   * Add confidence scoring
   */
  addConfidenceScoring(recommendations, patientData) {
    const scored = { ...recommendations };
    
    // Calculate confidence based on data completeness
    let confidence = 0.5; // Base confidence
    
    if (patientData.age) confidence += 0.1;
    if (patientData.conditions?.length > 0) confidence += 0.15;
    if (patientData.medications?.length > 0) confidence += 0.15;
    if (patientData.allergies?.length > 0) confidence += 0.1;
    
    scored.confidenceScore = Math.min(confidence, 1.0);
    scored.confidenceLevel = confidence >= 0.8 ? 'High' : confidence >= 0.6 ? 'Moderate' : 'Low';
    
    return scored;
  }

  /**
   * Generate algorithmic recommendations (fallback)
   */
  async generateAlgorithmicRecommendations(patientData, clinicalContext) {
    const recommendations = {
      primaryRecommendations: [],
      drugInteractionAlerts: [],
      dosingGuidance: [],
      monitoringPlan: [],
      alternativeOptions: [],
      riskAssessment: 'Standard risk profile',
      evidenceLevel: 'Guideline-based',
      clinicalRationale: 'Generated using clinical algorithms'
    };

    // Primary condition-based recommendations
    if (patientData.conditions) {
      for (const condition of patientData.conditions) {
        const conditionRecs = this.getConditionRecommendations(condition);
        recommendations.primaryRecommendations.push(...conditionRecs);
      }
    }

    // Drug interaction checks
    if (patientData.medications?.length >= 2) {
      const interactions = await this.checkDrugInteractions(patientData.medications);
      recommendations.drugInteractionAlerts.push(...interactions);
    }

    // Age-based considerations
    if (patientData.age >= 65) {
      recommendations.dosingGuidance.push('Consider dose reduction in elderly patients');
      recommendations.monitoringPlan.push('Enhanced monitoring for adverse effects');
    }

    return {
      recommendations,
      metadata: {
        model: 'clinical_algorithms',
        timestamp: new Date().toISOString(),
        patientFactors: this.extractPatientFactors(patientData),
        clinicalContext,
        aiGenerated: false
      }
    };
  }

  /**
   * Get condition-specific recommendations
   */
  getConditionRecommendations(condition) {
    const conditionMap = {
      'breast cancer': [
        'Consider hormone receptor status for therapy selection',
        'Evaluate HER2 status for targeted therapy options',
        'Monitor for cardiac toxicity with anthracyclines'
      ],
      'lung cancer': [
        'Perform molecular profiling for targeted therapies',
        'Consider immunotherapy options',
        'Monitor pulmonary function'
      ],
      'hypertension': [
        'Target blood pressure <140/90 mmHg',
        'Consider ACE inhibitor or ARB as first-line',
        'Monitor electrolytes and renal function'
      ],
      'diabetes': [
        'Target HbA1c <7% for most patients',
        'Consider metformin as first-line therapy',
        'Monitor blood glucose and kidney function'
      ]
    };

    const normalizedCondition = condition.toLowerCase();
    for (const [key, recommendations] of Object.entries(conditionMap)) {
      if (normalizedCondition.includes(key)) {
        return recommendations;
      }
    }

    return [`Standard care for ${condition}`];
  }

  /**
   * Check drug interactions
   */
  async checkDrugInteractions(medications) {
    const interactions = [];
    
    // This would use the drug alternatives service in production
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const drug1 = medications[i].name.toLowerCase();
        const drug2 = medications[j].name.toLowerCase();
        
        const interaction = this.getKnownInteraction(drug1, drug2);
        if (interaction) {
          interactions.push(interaction);
        }
      }
    }
    
    return interactions;
  }

  /**
   * Get known drug interaction
   */
  getKnownInteraction(drug1, drug2) {
    const interactionMap = {
      'warfarin_aspirin': 'Major: Increased bleeding risk',
      'warfarin_ibuprofen': 'Moderate: Enhanced anticoagulation',
      'metformin_contrast': 'Major: Risk of lactic acidosis',
      'simvastatin_clarithromycin': 'Major: Risk of rhabdomyolysis'
    };

    const key1 = `${drug1}_${drug2}`;
    const key2 = `${drug2}_${drug1}`;
    
    return interactionMap[key1] || interactionMap[key2] || null;
  }

  /**
   * Generate medication-specific guidance
   */
  async generateMedicationGuidance(medications) {
    const guidance = [];
    
    for (const medication of medications) {
      const drugName = medication.name.toLowerCase();
      
      if (drugName.includes('warfarin')) {
        guidance.push('Monitor INR regularly for warfarin therapy');
      }
      
      if (drugName.includes('metformin')) {
        guidance.push('Monitor renal function for metformin safety');
      }
      
      if (drugName.includes('statin')) {
        guidance.push('Monitor liver enzymes and muscle symptoms');
      }
    }
    
    return guidance;
  }

  /**
   * Generate allergy alerts
   */
  generateAllergyAlerts(allergies) {
    const alerts = [];
    
    for (const allergy of allergies) {
      if (allergy.toLowerCase().includes('penicillin')) {
        alerts.push('Avoid penicillin-based antibiotics');
      }
      
      if (allergy.toLowerCase().includes('sulfa')) {
        alerts.push('Avoid sulfonamide medications');
      }
    }
    
    return alerts;
  }

  /**
   * Extract patient factors for metadata
   */
  extractPatientFactors(patientData) {
    return {
      age: patientData.age,
      comorbidities: patientData.conditions?.length || 0,
      medications: patientData.medications?.length || 0,
      allergies: patientData.allergies?.length || 0,
      complexity: this.calculateComplexity(patientData)
    };
  }

  /**
   * Calculate patient complexity score
   */
  calculateComplexity(patientData) {
    let score = 0;
    
    if (patientData.age >= 65) score += 1;
    if (patientData.conditions?.length >= 3) score += 2;
    if (patientData.medications?.length >= 5) score += 2;
    if (patientData.allergies?.length >= 2) score += 1;
    
    if (score >= 4) return 'high';
    if (score >= 2) return 'moderate';
    return 'low';
  }

  /**
   * Get fallback recommendations
   */
  getFallbackRecommendations(patientData, clinicalContext) {
    return {
      recommendations: {
        primaryRecommendations: ['Clinical decision support temporarily unavailable'],
        drugInteractionAlerts: ['Please review medications manually'],
        dosingGuidance: ['Follow standard dosing guidelines'],
        monitoringPlan: ['Standard monitoring recommended'],
        alternativeOptions: ['Consult clinical guidelines'],
        riskAssessment: 'Unable to assess - manual review required',
        evidenceLevel: 'Not available',
        clinicalRationale: 'AI service unavailable, manual clinical review recommended'
      },
      metadata: {
        model: 'fallback',
        timestamp: new Date().toISOString(),
        patientFactors: this.extractPatientFactors(patientData),
        clinicalContext,
        aiGenerated: false,
        serviceAvailable: false
      }
    };
  }

  /**
   * Load clinical knowledge base
   */
  loadClinicalKnowledge() {
    // In production, this would load from medical databases
    console.log('Clinical knowledge base initialized');
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

export default new AIRecommendationService();