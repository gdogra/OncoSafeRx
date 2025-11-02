import express from 'express';
import multer from 'multer';
import Joi from 'joi';
import VoiceDocumentationService from '../services/voiceDocumentationService.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();
const voiceService = new VoiceDocumentationService();

// Configure multer for audio uploads
const audioStorage = multer.memoryStorage();
const audioUpload = multer({
  storage: audioStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/mp4',
      'audio/ogg', 'audio/webm', 'audio/flac'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio format. Supported: WAV, MP3, MP4, OGG, WebM, FLAC'), false);
    }
  }
});

// Validation schemas
const sessionConfigSchema = Joi.object({
  template: Joi.string().valid('progress_note', 'admission_note', 'discharge_summary').required(),
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

const voiceInputSchema = Joi.object({
  sessionId: Joi.string().required(),
  audioFormat: Joi.string().valid('wav', 'mp3', 'mp4', 'ogg', 'webm', 'flac').default('wav'),
  sampleRate: Joi.number().min(8000).max(48000).default(16000),
  channels: Joi.number().min(1).max(2).default(1),
  enableSpeakerDiarization: Joi.boolean().default(false),
  enableProfanityFilter: Joi.boolean().default(false),
  realTimeProcessing: Joi.boolean().default(true)
});

// Initialize voice service
async function initializeVoiceService() {
  try {
    await voiceService.initialize();
    console.log('✅ Voice Documentation Service initialized successfully');
  } catch (error) {
    console.error('❌ Voice Documentation Service initialization failed:', error.message);
  }
}

// Initialize on startup
initializeVoiceService();

// Event handlers for real-time updates
voiceService.on('sessionStarted', (data) => {
  console.log(`📝 Voice documentation session started: ${data.sessionId}`);
});

voiceService.on('voiceProcessed', (data) => {
  console.log(`🎙️ Voice input processed for session: ${data.sessionId}`);
});

voiceService.on('sectionTransition', (data) => {
  console.log(`📋 Section transition: ${data.previousSection} → ${data.newSection}`);
});

voiceService.on('sessionCompleted', (data) => {
  console.log(`✅ Voice documentation session completed: ${data.sessionId}`);
});

voiceService.on('autoSaved', (data) => {
  console.log(`💾 Auto-saved session: ${data.sessionId} (${data.wordCount} words)`);
});

voiceService.on('error', (error) => {
  console.error('❌ Voice Documentation Service error:', error.message);
});

/**
 * @route   GET /api/voice-documentation/status
 * @desc    Get voice documentation service status
 * @access  Private
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const status = voiceService.getSessionStatus();
    
    res.json({
      success: true,
      data: {
        serviceStatus: voiceService.isInitialized ? 'active' : 'inactive',
        session: status,
        capabilities: {
          speechRecognition: true,
          voiceSynthesis: true,
          clinicalNLP: true,
          realTimeTranscription: true,
          voiceCommands: true,
          autoSave: true
        },
        templates: ['progress_note', 'admission_note', 'discharge_summary'],
        supportedFormats: ['wav', 'mp3', 'mp4', 'ogg', 'webm', 'flac']
      }
    });
  } catch (error) {
    console.error('Voice documentation status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get voice documentation status',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/voice-documentation/session/start
 * @desc    Start a new voice documentation session
 * @access  Private
 */
router.post('/session/start', 
  authenticateToken, 
  validateRequest(sessionConfigSchema),
  async (req, res) => {
    try {
      const sessionConfig = {
        ...req.body,
        providerId: req.user.id // Use authenticated user ID
      };
      
      const session = await voiceService.startDocumentationSession(sessionConfig);
      
      res.status(201).json({
        success: true,
        data: session,
        message: 'Voice documentation session started successfully'
      });
    } catch (error) {
      console.error('Start voice session error:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to start voice documentation session',
        details: error.message
      });
    }
  }
);

/**
 * @route   POST /api/voice-documentation/session/:sessionId/voice-input
 * @desc    Process voice input for an active session
 * @access  Private
 */
router.post('/session/:sessionId/voice-input',
  authenticateToken,
  audioUpload.single('audio'),
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Audio file is required'
        });
      }
      
      // Validate audio input options
      const inputOptions = {
        sessionId,
        audioFormat: req.body.audioFormat || 'wav',
        sampleRate: parseInt(req.body.sampleRate) || 16000,
        channels: parseInt(req.body.channels) || 1,
        enableSpeakerDiarization: req.body.enableSpeakerDiarization === 'true',
        enableProfanityFilter: req.body.enableProfanityFilter === 'true',
        realTimeProcessing: req.body.realTimeProcessing !== 'false'
      };
      
      const { error } = voiceInputSchema.validate(inputOptions);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid voice input parameters',
          details: error.details[0].message
        });
      }
      
      // Process voice input
      const audioData = {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        size: req.file.size,
        originalname: req.file.originalname
      };
      
      const result = await voiceService.processVoiceInput(audioData, inputOptions);
      
      res.json({
        success: true,
        data: {
          sessionId,
          transcription: result.transcription,
          confidence: result.confidence,
          entities: result.entities,
          suggestions: result.suggestions,
          commands: result.commands,
          currentSection: result.sectionInfo?.detectedSection,
          processingMetrics: result.processingMetrics,
          timestamp: result.timestamp
        },
        message: 'Voice input processed successfully'
      });
      
    } catch (error) {
      console.error('Voice input processing error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process voice input',
        details: error.message
      });
    }
  }
);

/**
 * @route   POST /api/voice-documentation/session/:sessionId/text-input
 * @desc    Process text input for an active session (fallback/editing)
 * @access  Private
 */
router.post('/session/:sessionId/text-input',
  authenticateToken,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { text, section, action } = req.body;
      
      if (!text || !section) {
        return res.status(400).json({
          success: false,
          error: 'Text content and section are required'
        });
      }
      
      // Simulate processing text as if it were transcribed voice
      const processedResult = await voiceService.processTranscription({
        transcription: text,
        confidence: 1.0,
        alternatives: [{ transcription: text, confidence: 1.0 }],
        processingTime: 0,
        language: 'en-US'
      });
      
      await voiceService.updateActiveSession(processedResult);
      
      res.json({
        success: true,
        data: {
          sessionId,
          text,
          section,
          action: action || 'append',
          entities: processedResult.entities,
          suggestions: processedResult.suggestions,
          timestamp: new Date()
        },
        message: 'Text input processed successfully'
      });
      
    } catch (error) {
      console.error('Text input processing error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process text input',
        details: error.message
      });
    }
  }
);

/**
 * @route   GET /api/voice-documentation/session/:sessionId/status
 * @desc    Get status of a specific voice documentation session
 * @access  Private
 */
router.get('/session/:sessionId/status', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const status = voiceService.getSessionStatus();
    
    if (!status || status.sessionId !== sessionId) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or inactive'
      });
    }
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Session status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session status',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/voice-documentation/session/:sessionId/command
 * @desc    Execute voice command for an active session
 * @access  Private
 */
router.post('/session/:sessionId/command',
  authenticateToken,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { command, parameters } = req.body;
      
      if (!command) {
        return res.status(400).json({
          success: false,
          error: 'Command is required'
        });
      }
      
      const allowedCommands = [
        'NEXT_SECTION', 'PREVIOUS_SECTION', 'SAVE', 'NEW_PARAGRAPH',
        'DELETE_LAST', 'REPEAT', 'SPELL_MODE', 'NUMBER_MODE'
      ];
      
      if (!allowedCommands.includes(command)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid command',
          allowedCommands
        });
      }
      
      await voiceService.executeVoiceCommand({
        command,
        parameters: parameters || {},
        timestamp: new Date()
      });
      
      res.json({
        success: true,
        data: {
          sessionId,
          command,
          parameters,
          executed: true,
          timestamp: new Date()
        },
        message: `Command ${command} executed successfully`
      });
      
    } catch (error) {
      console.error('Voice command execution error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to execute voice command',
        details: error.message
      });
    }
  }
);

/**
 * @route   POST /api/voice-documentation/session/:sessionId/complete
 * @desc    Complete and finalize a voice documentation session
 * @access  Private
 */
router.post('/session/:sessionId/complete',
  authenticateToken,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const options = req.body || {};
      
      const completedSession = await voiceService.completeDocumentationSession(options);
      
      if (completedSession.sessionId !== sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID mismatch'
        });
      }
      
      res.json({
        success: true,
        data: completedSession,
        message: 'Voice documentation session completed successfully'
      });
      
    } catch (error) {
      console.error('Session completion error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to complete voice documentation session',
        details: error.message
      });
    }
  }
);

/**
 * @route   GET /api/voice-documentation/templates
 * @desc    Get available documentation templates
 * @access  Private
 */
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const templates = {
      progress_note: {
        name: 'Progress Note',
        description: 'Standard SOAP format progress note',
        sections: ['SUBJECTIVE', 'OBJECTIVE', 'ASSESSMENT', 'PLAN'],
        estimatedTime: 300,
        encounterTypes: ['inpatient', 'outpatient', 'consultation']
      },
      admission_note: {
        name: 'Admission Note',
        description: 'Comprehensive admission documentation',
        sections: [
          'CHIEF_COMPLAINT', 'HISTORY_PRESENT_ILLNESS', 'PAST_MEDICAL_HISTORY',
          'MEDICATIONS', 'ALLERGIES', 'SOCIAL_HISTORY', 'FAMILY_HISTORY',
          'REVIEW_SYSTEMS', 'PHYSICAL_EXAM', 'LABS_IMAGING', 'ASSESSMENT_PLAN'
        ],
        estimatedTime: 900,
        encounterTypes: ['inpatient', 'emergency']
      },
      discharge_summary: {
        name: 'Discharge Summary',
        description: 'Patient discharge documentation',
        sections: [
          'ADMISSION_DIAGNOSIS', 'DISCHARGE_DIAGNOSIS', 'HOSPITAL_COURSE',
          'DISCHARGE_MEDICATIONS', 'DISCHARGE_INSTRUCTIONS', 'FOLLOW_UP'
        ],
        estimatedTime: 600,
        encounterTypes: ['inpatient']
      }
    };
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get documentation templates',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/voice-documentation/vocabulary
 * @desc    Get clinical vocabulary for voice recognition enhancement
 * @access  Private
 */
router.get('/vocabulary', authenticateToken, async (req, res) => {
  try {
    const { category, limit = 100 } = req.query;
    
    let vocabulary = Array.from(voiceService.clinicalVocabulary.values());
    
    if (category) {
      vocabulary = vocabulary.filter(term => term.category === category.toUpperCase());
    }
    
    vocabulary = vocabulary.slice(0, parseInt(limit));
    
    const categories = [...new Set(Array.from(voiceService.clinicalVocabulary.values()).map(term => term.category))];
    
    res.json({
      success: true,
      data: {
        vocabulary,
        categories,
        totalTerms: voiceService.clinicalVocabulary.size,
        filteredCount: vocabulary.length
      }
    });
  } catch (error) {
    console.error('Vocabulary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get clinical vocabulary',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/voice-documentation/test-transcription
 * @desc    Test voice transcription without creating a session
 * @access  Private
 */
router.post('/test-transcription',
  authenticateToken,
  audioUpload.single('audio'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Audio file is required'
        });
      }
      
      const audioData = {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        size: req.file.size,
        originalname: req.file.originalname
      };
      
      const options = {
        enableSpeakerDiarization: req.body.enableSpeakerDiarization === 'true',
        enableProfanityFilter: req.body.enableProfanityFilter === 'true'
      };
      
      // Test transcription
      const result = await voiceService.transcribeAudio(audioData, options);
      const processedResult = await voiceService.processTranscription(result);
      
      res.json({
        success: true,
        data: {
          transcription: result.transcription,
          confidence: result.confidence,
          alternatives: result.alternatives,
          entities: processedResult.entities,
          suggestions: processedResult.suggestions,
          processingTime: result.processingTime,
          audioLength: result.audioLength
        },
        message: 'Audio transcription test completed'
      });
      
    } catch (error) {
      console.error('Test transcription error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to test audio transcription',
        details: error.message
      });
    }
  }
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Audio file too large',
        details: 'Maximum file size is 50MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files',
        details: 'Only one audio file allowed per request'
      });
    }
  }
  
  if (error.message.includes('Invalid audio format')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid audio format',
      details: error.message
    });
  }
  
  next(error);
});

export default router;