import { EventEmitter } from 'events';
import Joi from 'joi';

class VoiceDocumentationService extends EventEmitter {
  constructor() {
    super();
    this.isInitialized = false;
    this.speechRecognition = null;
    this.voiceSynthesis = null;
    this.documentationModel = null;
    this.clinicalTemplates = new Map();
    this.clinicalVocabulary = new Map();
    this.activeSession = null;
    this.sessionMetrics = new Map();
    
    this.initializeClinicalVocabulary();
    this.setupDocumentationTemplates();
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      await this.initializeSpeechRecognition();
      await this.initializeVoiceSynthesis();
      await this.loadClinicalModel();
      
      this.isInitialized = true;
      this.emit('initialized');
      
      return {
        status: 'success',
        message: 'Voice documentation system initialized',
        capabilities: {
          speechRecognition: true,
          voiceSynthesis: true,
          clinicalNLP: true,
          templates: this.clinicalTemplates.size,
          vocabulary: this.clinicalVocabulary.size
        }
      };
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Voice documentation initialization failed: ${error.message}`);
    }
  }

  async initializeSpeechRecognition() {
    this.speechRecognition = {
      config: {
        sampleRateHertz: 16000,
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
        enableSpeakerDiarization: true,
        diarizationSpeakerCount: 2,
        maxAlternatives: 3,
        profanityFilter: false,
        speechContexts: [{
          phrases: Array.from(this.clinicalVocabulary.keys()),
          boost: 15.0
        }],
        metadata: {
          microphoneDistance: 'NEARFIELD',
          originalMediaType: 'AUDIO',
          recordingDeviceType: 'SMARTPHONE'
        }
      },
      isListening: false,
      audioBuffer: [],
      confidenceThreshold: 0.85
    };
  }

  async initializeVoiceSynthesis() {
    this.voiceSynthesis = {
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Standard-A',
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0,
        volumeGainDb: 0.0,
        effectsProfileId: ['headphone-class-device']
      },
      isEnabled: true
    };
  }

  async loadClinicalModel() {
    this.documentationModel = {
      medicalEntityExtraction: {
        enabled: true,
        confidence: 0.90,
        entities: [
          'CONDITION', 'MEDICATION', 'DOSAGE', 'PROCEDURE', 
          'ANATOMY', 'SYMPTOM', 'LAB_VALUE', 'VITAL_SIGN',
          'ALLERGY', 'FAMILY_HISTORY', 'SOCIAL_HISTORY'
        ]
      },
      clinicalCoding: {
        icd10: { enabled: true, confidence: 0.85 },
        cpt: { enabled: true, confidence: 0.88 },
        rxnorm: { enabled: true, confidence: 0.92 },
        snomed: { enabled: true, confidence: 0.87 }
      },
      noteStructuring: {
        enabled: true,
        sections: [
          'CHIEF_COMPLAINT', 'HISTORY_PRESENT_ILLNESS', 
          'REVIEW_SYSTEMS', 'PAST_MEDICAL_HISTORY',
          'MEDICATIONS', 'ALLERGIES', 'SOCIAL_HISTORY',
          'FAMILY_HISTORY', 'PHYSICAL_EXAM', 'ASSESSMENT',
          'PLAN', 'FOLLOW_UP'
        ]
      },
      qualityChecks: {
        completeness: true,
        accuracy: true,
        compliance: true,
        billing: true
      }
    };
  }

  initializeClinicalVocabulary() {
    const medicalTerms = [
      // Oncology-specific terms
      'adenocarcinoma', 'carcinoma', 'sarcoma', 'lymphoma', 'leukemia',
      'metastasis', 'chemotherapy', 'radiation', 'immunotherapy',
      'carboplatin', 'cisplatin', 'docetaxel', 'paclitaxel', 'doxorubicin',
      'pembrolizumab', 'nivolumab', 'atezolizumab', 'bevacizumab',
      
      // Common medical terms
      'hypertension', 'diabetes', 'hyperlipidemia', 'coronary artery disease',
      'chronic obstructive pulmonary disease', 'congestive heart failure',
      'acute myocardial infarction', 'cerebrovascular accident',
      'pneumonia', 'urinary tract infection', 'sepsis',
      
      // Medications
      'lisinopril', 'metformin', 'atorvastatin', 'amlodipine',
      'metoprolol', 'furosemide', 'warfarin', 'aspirin',
      'prednisone', 'albuterol', 'insulin', 'morphine',
      
      // Anatomical terms
      'cardiovascular', 'respiratory', 'gastrointestinal', 'genitourinary',
      'neurological', 'musculoskeletal', 'integumentary', 'endocrine',
      'hematologic', 'immunologic', 'psychiatric', 'ophthalmologic'
    ];

    medicalTerms.forEach((term, index) => {
      this.clinicalVocabulary.set(term, {
        id: index,
        term: term,
        category: this.categorizeTerm(term),
        synonyms: this.getSynonyms(term),
        confidence: 0.95
      });
    });
  }

  setupDocumentationTemplates() {
    this.clinicalTemplates.set('progress_note', {
      sections: [
        { name: 'SUBJECTIVE', required: true, order: 1 },
        { name: 'OBJECTIVE', required: true, order: 2 },
        { name: 'ASSESSMENT', required: true, order: 3 },
        { name: 'PLAN', required: true, order: 4 }
      ],
      estimatedTime: 300, // seconds
      qualityMetrics: ['completeness', 'accuracy', 'billing_compliance']
    });

    this.clinicalTemplates.set('admission_note', {
      sections: [
        { name: 'CHIEF_COMPLAINT', required: true, order: 1 },
        { name: 'HISTORY_PRESENT_ILLNESS', required: true, order: 2 },
        { name: 'PAST_MEDICAL_HISTORY', required: true, order: 3 },
        { name: 'MEDICATIONS', required: true, order: 4 },
        { name: 'ALLERGIES', required: true, order: 5 },
        { name: 'SOCIAL_HISTORY', required: true, order: 6 },
        { name: 'FAMILY_HISTORY', required: true, order: 7 },
        { name: 'REVIEW_SYSTEMS', required: true, order: 8 },
        { name: 'PHYSICAL_EXAM', required: true, order: 9 },
        { name: 'LABS_IMAGING', required: false, order: 10 },
        { name: 'ASSESSMENT_PLAN', required: true, order: 11 }
      ],
      estimatedTime: 900,
      qualityMetrics: ['completeness', 'accuracy', 'billing_compliance', 'regulatory_compliance']
    });

    this.clinicalTemplates.set('discharge_summary', {
      sections: [
        { name: 'ADMISSION_DIAGNOSIS', required: true, order: 1 },
        { name: 'DISCHARGE_DIAGNOSIS', required: true, order: 2 },
        { name: 'HOSPITAL_COURSE', required: true, order: 3 },
        { name: 'DISCHARGE_MEDICATIONS', required: true, order: 4 },
        { name: 'DISCHARGE_INSTRUCTIONS', required: true, order: 5 },
        { name: 'FOLLOW_UP', required: true, order: 6 }
      ],
      estimatedTime: 600,
      qualityMetrics: ['completeness', 'accuracy', 'continuity_care']
    });
  }

  async startDocumentationSession(sessionConfig) {
    const schema = Joi.object({
      template: Joi.string().valid(...Array.from(this.clinicalTemplates.keys())).required(),
      patientId: Joi.string().required(),
      providerId: Joi.string().required(),
      encounterType: Joi.string().valid('inpatient', 'outpatient', 'emergency', 'consultation').required(),
      priority: Joi.string().valid('routine', 'urgent', 'stat').default('routine'),
      voiceSettings: Joi.object({
        enableRealTimeTranscription: Joi.boolean().default(true),
        enableVoiceCommands: Joi.boolean().default(true),
        enableSuggestions: Joi.boolean().default(true),
        autoSave: Joi.boolean().default(true),
        autoSaveInterval: Joi.number().min(30).max(300).default(60)
      }).default({})
    });

    const { error, value } = schema.validate(sessionConfig);
    if (error) {
      throw new Error(`Invalid session configuration: ${error.details[0].message}`);
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    const sessionId = `voice_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const template = this.clinicalTemplates.get(value.template);

    this.activeSession = {
      sessionId,
      ...value,
      template,
      startTime: new Date(),
      status: 'active',
      currentSection: template.sections[0].name,
      sectionIndex: 0,
      transcription: {
        realTime: '',
        sections: new Map(),
        entities: [],
        suggestions: []
      },
      audio: {
        isRecording: false,
        totalDuration: 0,
        audioChunks: []
      },
      quality: {
        completeness: 0,
        accuracy: 0,
        confidence: 0,
        issues: []
      },
      autoSaveTimer: null
    };

    // Initialize sections
    template.sections.forEach(section => {
      this.activeSession.transcription.sections.set(section.name, {
        content: '',
        entities: [],
        confidence: 0,
        completed: false,
        lastUpdated: null
      });
    });

    // Setup auto-save
    if (value.voiceSettings.autoSave) {
      this.activeSession.autoSaveTimer = setInterval(() => {
        this.autoSaveSession();
      }, value.voiceSettings.autoSaveInterval * 1000);
    }

    this.sessionMetrics.set(sessionId, {
      startTime: new Date(),
      wordsPerMinute: 0,
      totalWords: 0,
      errorsCount: 0,
      commandsUsed: 0,
      sectionsCompleted: 0,
      qualityScore: 0
    });

    this.emit('sessionStarted', {
      sessionId,
      template: value.template,
      estimatedTime: template.estimatedTime,
      sections: template.sections.length
    });

    return {
      sessionId,
      status: 'started',
      template: value.template,
      currentSection: this.activeSession.currentSection,
      totalSections: template.sections.length,
      estimatedTime: template.estimatedTime,
      message: 'Voice documentation session started. Begin speaking to start transcription.'
    };
  }

  async processVoiceInput(audioData, options = {}) {
    if (!this.activeSession) {
      throw new Error('No active documentation session');
    }

    try {
      const transcriptionResult = await this.transcribeAudio(audioData, options);
      const processedResult = await this.processTranscription(transcriptionResult);
      
      await this.updateActiveSession(processedResult);
      
      this.emit('voiceProcessed', {
        sessionId: this.activeSession.sessionId,
        transcription: processedResult.transcription,
        confidence: processedResult.confidence,
        entities: processedResult.entities,
        currentSection: this.activeSession.currentSection
      });

      return processedResult;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Voice processing failed: ${error.message}`);
    }
  }

  async transcribeAudio(audioData, options = {}) {
    const startTime = Date.now();
    
    // Simulate speech recognition with realistic processing
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    const mockTranscriptions = [
      "The patient is a 65-year-old male with a history of stage three lung adenocarcinoma who presents for routine follow-up.",
      "Chief complaint patient reports increasing shortness of breath and fatigue over the past two weeks.",
      "Physical examination reveals clear lung fields bilaterally, regular rate and rhythm, no murmurs, rubs, or gallops.",
      "Assessment and plan continue current chemotherapy regimen with carboplatin and paclitaxel, order chest CT in four weeks.",
      "Patient tolerated treatment well, no acute adverse events, follow-up scheduled in two weeks."
    ];
    
    const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
    const confidence = 0.85 + Math.random() * 0.12;
    
    const processingTime = Date.now() - startTime;
    
    return {
      transcription: randomTranscription,
      confidence: confidence,
      alternatives: [
        { transcription: randomTranscription, confidence: confidence },
        { transcription: randomTranscription.replace(/patient/g, 'patient'), confidence: confidence - 0.05 }
      ],
      audioLength: audioData?.length || 1024,
      processingTime,
      language: 'en-US',
      speakerTags: options.enableSpeakerDiarization ? [{ speaker: 1, text: randomTranscription }] : null
    };
  }

  async processTranscription(transcriptionResult) {
    const { transcription, confidence } = transcriptionResult;
    
    // Extract medical entities
    const entities = await this.extractMedicalEntities(transcription);
    
    // Detect section transitions
    const sectionInfo = this.detectSectionTransition(transcription);
    
    // Generate suggestions
    const suggestions = await this.generateSuggestions(transcription, entities);
    
    // Check for voice commands
    const commands = this.detectVoiceCommands(transcription);
    
    return {
      transcription,
      confidence,
      entities,
      sectionInfo,
      suggestions,
      commands,
      timestamp: new Date(),
      processingMetrics: {
        entitiesFound: entities.length,
        suggestionsGenerated: suggestions.length,
        commandsDetected: commands.length
      }
    };
  }

  async extractMedicalEntities(text) {
    const entities = [];
    const words = text.toLowerCase().split(/\s+/);
    
    // Simple entity extraction based on vocabulary
    for (const [term, info] of this.clinicalVocabulary) {
      if (text.toLowerCase().includes(term)) {
        entities.push({
          text: term,
          category: info.category,
          confidence: info.confidence,
          startIndex: text.toLowerCase().indexOf(term),
          endIndex: text.toLowerCase().indexOf(term) + term.length,
          codes: this.getClinicalCodes(term)
        });
      }
    }
    
    // Extract common medical patterns
    const patterns = [
      { regex: /(\d+)\s*mg/gi, category: 'DOSAGE' },
      { regex: /(\d+)\s*times?\s*daily/gi, category: 'FREQUENCY' },
      { regex: /blood pressure\s*(\d+\/\d+)/gi, category: 'VITAL_SIGN' },
      { regex: /temperature\s*(\d+\.?\d*)/gi, category: 'VITAL_SIGN' },
      { regex: /heart rate\s*(\d+)/gi, category: 'VITAL_SIGN' }
    ];
    
    patterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern.regex)];
      matches.forEach(match => {
        entities.push({
          text: match[0],
          category: pattern.category,
          confidence: 0.90,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          value: match[1] || match[0]
        });
      });
    });
    
    return entities;
  }

  detectSectionTransition(transcription) {
    const sectionKeywords = {
      'CHIEF_COMPLAINT': ['chief complaint', 'presenting', 'presents with'],
      'HISTORY_PRESENT_ILLNESS': ['history of present illness', 'hpi', 'patient reports'],
      'PHYSICAL_EXAM': ['physical exam', 'examination', 'on exam'],
      'ASSESSMENT': ['assessment', 'impression', 'diagnosis'],
      'PLAN': ['plan', 'treatment plan', 'recommendations']
    };
    
    const lowerText = transcription.toLowerCase();
    
    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return {
            detectedSection: section,
            keyword: keyword,
            confidence: 0.85,
            shouldTransition: this.activeSession && 
              this.activeSession.currentSection !== section
          };
        }
      }
    }
    
    return null;
  }

  async generateSuggestions(transcription, entities) {
    const suggestions = [];
    
    // Medication suggestions based on entities
    const medications = entities.filter(e => e.category === 'MEDICATION');
    medications.forEach(med => {
      suggestions.push({
        type: 'medication_completion',
        text: `Consider adding dosage and frequency for ${med.text}`,
        confidence: 0.80,
        category: 'clinical_completeness'
      });
    });
    
    // Billing code suggestions
    const conditions = entities.filter(e => e.category === 'CONDITION');
    conditions.forEach(condition => {
      suggestions.push({
        type: 'billing_code',
        text: `ICD-10 code suggested for ${condition.text}`,
        confidence: 0.75,
        category: 'billing_optimization',
        codes: condition.codes
      });
    });
    
    // Template completion suggestions
    if (this.activeSession) {
      const currentSection = this.activeSession.transcription.sections.get(this.activeSession.currentSection);
      if (currentSection && currentSection.content.length < 50) {
        suggestions.push({
          type: 'section_completion',
          text: `Consider adding more detail to ${this.activeSession.currentSection}`,
          confidence: 0.70,
          category: 'documentation_quality'
        });
      }
    }
    
    return suggestions;
  }

  detectVoiceCommands(transcription) {
    const commands = [];
    const lowerText = transcription.toLowerCase();
    
    const commandPatterns = [
      { pattern: /next section|move to next/, command: 'NEXT_SECTION' },
      { pattern: /previous section|go back/, command: 'PREVIOUS_SECTION' },
      { pattern: /save|save note/, command: 'SAVE' },
      { pattern: /new paragraph|paragraph/, command: 'NEW_PARAGRAPH' },
      { pattern: /delete|remove that/, command: 'DELETE_LAST' },
      { pattern: /repeat|say again/, command: 'REPEAT' },
      { pattern: /spell|spelling/, command: 'SPELL_MODE' },
      { pattern: /number|numeric/, command: 'NUMBER_MODE' }
    ];
    
    commandPatterns.forEach(({ pattern, command }) => {
      if (pattern.test(lowerText)) {
        commands.push({
          command,
          confidence: 0.90,
          text: lowerText.match(pattern)[0],
          timestamp: new Date()
        });
      }
    });
    
    return commands;
  }

  async updateActiveSession(processedResult) {
    if (!this.activeSession) return;
    
    const { transcription, entities, sectionInfo, commands } = processedResult;
    
    // Handle section transitions
    if (sectionInfo && sectionInfo.shouldTransition) {
      await this.transitionToSection(sectionInfo.detectedSection);
    }
    
    // Process voice commands
    for (const command of commands) {
      await this.executeVoiceCommand(command);
    }
    
    // Update current section content
    const currentSectionData = this.activeSession.transcription.sections.get(this.activeSession.currentSection);
    if (currentSectionData) {
      currentSectionData.content += transcription + ' ';
      currentSectionData.entities.push(...entities);
      currentSectionData.lastUpdated = new Date();
      currentSectionData.confidence = this.calculateSectionConfidence(currentSectionData);
    }
    
    // Update real-time transcription
    this.activeSession.transcription.realTime = transcription;
    this.activeSession.transcription.entities.push(...entities);
    
    // Update quality metrics
    await this.updateQualityMetrics();
    
    // Update session metrics
    this.updateSessionMetrics(transcription);
  }

  async transitionToSection(sectionName) {
    if (!this.activeSession) return;
    
    const template = this.activeSession.template;
    const sectionIndex = template.sections.findIndex(s => s.name === sectionName);
    
    if (sectionIndex !== -1) {
      this.activeSession.currentSection = sectionName;
      this.activeSession.sectionIndex = sectionIndex;
      
      this.emit('sectionTransition', {
        sessionId: this.activeSession.sessionId,
        previousSection: this.activeSession.currentSection,
        newSection: sectionName,
        progress: (sectionIndex + 1) / template.sections.length
      });
    }
  }

  async executeVoiceCommand(command) {
    const { command: commandType } = command;
    
    switch (commandType) {
      case 'NEXT_SECTION':
        await this.moveToNextSection();
        break;
      case 'PREVIOUS_SECTION':
        await this.moveToPreviousSection();
        break;
      case 'SAVE':
        await this.saveSession();
        break;
      case 'NEW_PARAGRAPH':
        await this.addParagraphBreak();
        break;
      case 'DELETE_LAST':
        await this.deleteLastSentence();
        break;
      default:
        // Handle other commands
        break;
    }
    
    // Update command usage metrics
    const metrics = this.sessionMetrics.get(this.activeSession.sessionId);
    if (metrics) {
      metrics.commandsUsed++;
    }
  }

  async completeDocumentationSession(options = {}) {
    if (!this.activeSession) {
      throw new Error('No active documentation session');
    }

    try {
      // Generate final document
      const finalDocument = await this.generateFinalDocument();
      
      // Perform quality assessment
      const qualityAssessment = await this.performQualityAssessment(finalDocument);
      
      // Generate billing codes
      const billingCodes = await this.generateBillingCodes(finalDocument);
      
      // Calculate session metrics
      const sessionMetrics = this.calculateFinalMetrics();
      
      // Clear auto-save timer
      if (this.activeSession.autoSaveTimer) {
        clearInterval(this.activeSession.autoSaveTimer);
      }
      
      const completedSession = {
        sessionId: this.activeSession.sessionId,
        document: finalDocument,
        quality: qualityAssessment,
        billing: billingCodes,
        metrics: sessionMetrics,
        completedAt: new Date(),
        status: 'completed'
      };
      
      this.emit('sessionCompleted', completedSession);
      
      // Clean up active session
      this.activeSession = null;
      
      return completedSession;
    } catch (error) {
      this.emit('error', error);
      throw new Error(`Session completion failed: ${error.message}`);
    }
  }

  async generateFinalDocument() {
    if (!this.activeSession) throw new Error('No active session');
    
    const sections = [];
    const template = this.activeSession.template;
    
    for (const templateSection of template.sections) {
      const sectionData = this.activeSession.transcription.sections.get(templateSection.name);
      if (sectionData && sectionData.content.trim()) {
        sections.push({
          name: templateSection.name,
          content: sectionData.content.trim(),
          entities: sectionData.entities,
          confidence: sectionData.confidence,
          completed: sectionData.completed
        });
      }
    }
    
    return {
      type: this.activeSession.template,
      patientId: this.activeSession.patientId,
      providerId: this.activeSession.providerId,
      encounterType: this.activeSession.encounterType,
      createdAt: this.activeSession.startTime,
      completedAt: new Date(),
      sections,
      metadata: {
        totalWords: this.calculateTotalWords(sections),
        totalEntities: this.activeSession.transcription.entities.length,
        sessionDuration: Date.now() - this.activeSession.startTime.getTime(),
        voiceInputs: this.activeSession.audio.audioChunks.length
      }
    };
  }

  async performQualityAssessment(document) {
    const assessment = {
      completeness: this.assessCompleteness(document),
      accuracy: this.assessAccuracy(document),
      compliance: this.assessCompliance(document),
      billing: this.assessBillingQuality(document),
      overall: 0,
      issues: [],
      recommendations: []
    };
    
    // Calculate overall score
    assessment.overall = (
      assessment.completeness.score +
      assessment.accuracy.score +
      assessment.compliance.score +
      assessment.billing.score
    ) / 4;
    
    // Generate recommendations
    if (assessment.completeness.score < 0.8) {
      assessment.recommendations.push('Consider adding more detail to incomplete sections');
    }
    if (assessment.billing.score < 0.9) {
      assessment.recommendations.push('Review billing codes for accuracy and completeness');
    }
    
    return assessment;
  }

  // Utility methods
  categorizeTerm(term) {
    const categories = {
      'MEDICATION': ['carboplatin', 'cisplatin', 'docetaxel', 'paclitaxel', 'lisinopril', 'metformin'],
      'CONDITION': ['adenocarcinoma', 'carcinoma', 'hypertension', 'diabetes'],
      'PROCEDURE': ['chemotherapy', 'radiation', 'immunotherapy'],
      'ANATOMY': ['cardiovascular', 'respiratory', 'gastrointestinal']
    };
    
    for (const [category, terms] of Object.entries(categories)) {
      if (terms.some(t => term.includes(t))) {
        return category;
      }
    }
    return 'GENERAL';
  }

  getSynonyms(term) {
    const synonymMap = {
      'adenocarcinoma': ['adeno carcinoma', 'glandular carcinoma'],
      'hypertension': ['high blood pressure', 'HTN'],
      'diabetes': ['diabetes mellitus', 'DM'],
      'chemotherapy': ['chemo', 'systemic therapy']
    };
    return synonymMap[term] || [];
  }

  getClinicalCodes(term) {
    const codeMap = {
      'adenocarcinoma': { icd10: 'C78.00', snomed: '35917007' },
      'hypertension': { icd10: 'I10', snomed: '38341003' },
      'diabetes': { icd10: 'E11.9', snomed: '44054006' }
    };
    return codeMap[term] || {};
  }

  calculateSectionConfidence(sectionData) {
    if (!sectionData.entities.length) return 0.5;
    const avgConfidence = sectionData.entities.reduce((sum, e) => sum + e.confidence, 0) / sectionData.entities.length;
    return Math.min(avgConfidence, 0.95);
  }

  calculateTotalWords(sections) {
    return sections.reduce((total, section) => {
      return total + section.content.split(/\s+/).length;
    }, 0);
  }

  async updateQualityMetrics() {
    if (!this.activeSession) return;
    
    const sections = Array.from(this.activeSession.transcription.sections.values());
    const completedSections = sections.filter(s => s.completed);
    
    this.activeSession.quality = {
      completeness: completedSections.length / sections.length,
      accuracy: sections.reduce((sum, s) => sum + s.confidence, 0) / sections.length,
      confidence: this.activeSession.transcription.entities.reduce((sum, e) => sum + e.confidence, 0) / 
                  Math.max(this.activeSession.transcription.entities.length, 1),
      issues: []
    };
  }

  updateSessionMetrics(transcription) {
    const metrics = this.sessionMetrics.get(this.activeSession.sessionId);
    if (!metrics) return;
    
    const words = transcription.split(/\s+/).length;
    metrics.totalWords += words;
    
    const sessionDuration = (Date.now() - metrics.startTime.getTime()) / 1000 / 60; // minutes
    metrics.wordsPerMinute = sessionDuration > 0 ? metrics.totalWords / sessionDuration : 0;
  }

  calculateFinalMetrics() {
    if (!this.activeSession) return {};
    
    const metrics = this.sessionMetrics.get(this.activeSession.sessionId);
    const sessionDuration = (Date.now() - this.activeSession.startTime.getTime()) / 1000;
    
    return {
      ...metrics,
      sessionDuration,
      sectionsCompleted: Array.from(this.activeSession.transcription.sections.values())
        .filter(s => s.completed).length,
      qualityScore: this.activeSession.quality.completeness * 100,
      efficiency: metrics.totalWords / (sessionDuration / 60) // words per minute
    };
  }

  async autoSaveSession() {
    if (!this.activeSession) return;
    
    try {
      const partialDocument = await this.generateFinalDocument();
      
      this.emit('autoSaved', {
        sessionId: this.activeSession.sessionId,
        timestamp: new Date(),
        wordCount: this.calculateTotalWords(partialDocument.sections),
        progress: this.activeSession.sectionIndex / this.activeSession.template.sections.length
      });
    } catch (error) {
      this.emit('error', new Error(`Auto-save failed: ${error.message}`));
    }
  }

  // Additional helper methods for quality assessment
  assessCompleteness(document) {
    const requiredSections = document.sections.filter(s => s.name !== 'OPTIONAL');
    const completedSections = requiredSections.filter(s => s.content.length > 20);
    
    return {
      score: completedSections.length / requiredSections.length,
      missing: requiredSections.filter(s => s.content.length <= 20).map(s => s.name),
      details: `${completedSections.length}/${requiredSections.length} required sections completed`
    };
  }

  assessAccuracy(document) {
    const entities = document.sections.flatMap(s => s.entities);
    const avgConfidence = entities.length > 0 ? 
      entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length : 0.5;
    
    return {
      score: avgConfidence,
      entityCount: entities.length,
      details: `Average entity confidence: ${(avgConfidence * 100).toFixed(1)}%`
    };
  }

  assessCompliance(document) {
    let score = 1.0;
    const issues = [];
    
    // Check for required elements
    const hasChiefComplaint = document.sections.some(s => s.name === 'CHIEF_COMPLAINT');
    const hasAssessment = document.sections.some(s => s.name === 'ASSESSMENT');
    
    if (!hasChiefComplaint) {
      score -= 0.2;
      issues.push('Missing chief complaint');
    }
    if (!hasAssessment) {
      score -= 0.2;
      issues.push('Missing assessment/diagnosis');
    }
    
    return {
      score: Math.max(score, 0),
      issues,
      details: issues.length === 0 ? 'All compliance requirements met' : `${issues.length} compliance issues found`
    };
  }

  assessBillingQuality(document) {
    const entities = document.sections.flatMap(s => s.entities);
    const conditions = entities.filter(e => e.category === 'CONDITION');
    const procedures = entities.filter(e => e.category === 'PROCEDURE');
    
    let score = 0.8; // Base score
    
    if (conditions.length > 0) score += 0.1;
    if (procedures.length > 0) score += 0.1;
    
    return {
      score: Math.min(score, 1.0),
      conditions: conditions.length,
      procedures: procedures.length,
      details: `${conditions.length} conditions and ${procedures.length} procedures documented`
    };
  }

  async moveToNextSection() {
    if (!this.activeSession) return;
    
    const nextIndex = this.activeSession.sectionIndex + 1;
    const template = this.activeSession.template;
    
    if (nextIndex < template.sections.length) {
      const nextSection = template.sections[nextIndex];
      await this.transitionToSection(nextSection.name);
    }
  }

  async moveToPreviousSection() {
    if (!this.activeSession) return;
    
    const prevIndex = this.activeSession.sectionIndex - 1;
    const template = this.activeSession.template;
    
    if (prevIndex >= 0) {
      const prevSection = template.sections[prevIndex];
      await this.transitionToSection(prevSection.name);
    }
  }

  async saveSession() {
    if (!this.activeSession) return;
    
    const document = await this.generateFinalDocument();
    this.emit('sessionSaved', {
      sessionId: this.activeSession.sessionId,
      document,
      timestamp: new Date()
    });
  }

  async addParagraphBreak() {
    if (!this.activeSession) return;
    
    const currentSectionData = this.activeSession.transcription.sections.get(this.activeSession.currentSection);
    if (currentSectionData) {
      currentSectionData.content += '\n\n';
    }
  }

  async deleteLastSentence() {
    if (!this.activeSession) return;
    
    const currentSectionData = this.activeSession.transcription.sections.get(this.activeSession.currentSection);
    if (currentSectionData) {
      const sentences = currentSectionData.content.split(/[.!?]+/);
      if (sentences.length > 1) {
        sentences.pop();
        currentSectionData.content = sentences.join('.') + '.';
      }
    }
  }

  async generateBillingCodes(document) {
    const entities = document.sections.flatMap(s => s.entities);
    const codes = {
      icd10: [],
      cpt: [],
      hcpcs: [],
      confidence: 0.85
    };
    
    // Extract billing codes from entities
    entities.forEach(entity => {
      if (entity.codes) {
        if (entity.codes.icd10) {
          codes.icd10.push({
            code: entity.codes.icd10,
            description: entity.text,
            confidence: entity.confidence
          });
        }
        if (entity.codes.cpt) {
          codes.cpt.push({
            code: entity.codes.cpt,
            description: entity.text,
            confidence: entity.confidence
          });
        }
      }
    });
    
    return codes;
  }

  getSessionStatus() {
    if (!this.activeSession) {
      return { status: 'inactive', message: 'No active documentation session' };
    }
    
    const progress = this.activeSession.sectionIndex / this.activeSession.template.sections.length;
    const metrics = this.sessionMetrics.get(this.activeSession.sessionId);
    
    return {
      status: 'active',
      sessionId: this.activeSession.sessionId,
      template: this.activeSession.template,
      currentSection: this.activeSession.currentSection,
      progress: progress,
      quality: this.activeSession.quality,
      metrics: metrics,
      startTime: this.activeSession.startTime,
      duration: Date.now() - this.activeSession.startTime.getTime()
    };
  }
}

export default VoiceDocumentationService;