/**
 * DDI Mining Orchestrator
 * 
 * Main service that orchestrates the complete drug-drug interaction mining process
 * Coordinates all extraction modules and manages the overall workflow
 * Part of the comprehensive DDI mining system for OncoSafeRx
 */

import ClinicalTrialsDDIExtractor from './ddiExtractionService.js';
import RegulatoryLabelExtractor from './regulatoryLabelExtractor.js';
import PublicationDDIExtractor from './publicationDDIExtractor.js';
import EvidenceNormalizationService from './evidenceNormalizationService.js';
import { DrugInteractionEvidence } from '../models/DrugInteractionEvidence.js';
import { RxNormService } from './rxnormService.js';
import supabaseService from '../config/supabase.js';

export class DDIMiningOrchestrator {
  constructor() {
    // Initialize extraction services
    this.clinicalTrialsExtractor = new ClinicalTrialsDDIExtractor();
    this.regulatoryExtractor = new RegulatoryLabelExtractor();
    this.publicationExtractor = new PublicationDDIExtractor();
    this.normalizationService = new EvidenceNormalizationService();
    this.rxnormService = new RxNormService();
    
    // Mining configuration
    this.config = {
      enableClinicalTrials: true,
      enableRegulatoryLabels: true,
      enablePublications: true,
      enableNormalization: true,
      enablePersistence: true,
      
      // Rate limiting and batching
      batchSize: 5,
      delayBetweenBatches: 2000,
      maxConcurrentExtractors: 3,
      
      // Quality filters
      minEvidenceScore: 30,
      minConfidence: 40,
      requireMechanism: false,
      
      // Data source limits
      maxClinicalTrialsPerDrug: 50,
      maxPublicationsPerDrug: 100,
      maxRegulatoryLabelsPerDrug: 20,
      
      // Processing options
      includeCompletedTrials: true,
      includePreprints: false,
      includeBrandNames: true,
      publicationYearRange: 10
    };
    
    // Oncology drug list (will be loaded from database or configuration)
    this.oncologyDrugs = new Set();
    
    // Progress tracking
    this.progressCallback = null;
    this.currentProgress = {
      phase: 'idle',
      completed: 0,
      total: 0,
      currentDrug: null,
      extractedEvidence: 0,
      normalizedEvidence: 0,
      errors: []
    };
    
    // Results storage
    this.extractionResults = {
      rawEvidence: [],
      normalizedEvidence: [],
      extractionReport: null,
      normalizationReport: null,
      startTime: null,
      endTime: null,
      totalDuration: null
    };
  }

  /**
   * Initialize the orchestrator with configuration
   */
  async initialize(options = {}) {
    console.log('Initializing DDI Mining Orchestrator...');
    
    // Merge configuration options
    this.config = { ...this.config, ...options };
    
    // Load oncology drug list
    await this.loadOncologyDrugs();
    
    // Initialize extractors
    await this.clinicalTrialsExtractor.initialize(Array.from(this.oncologyDrugs));
    
    console.log(`Initialized with ${this.oncologyDrugs.size} oncology drugs`);
  }

  /**
   * Load oncology drug list from database or configuration
   */
  async loadOncologyDrugs() {
    try {
      // Try to load from database first
      const dbDrugs = await this.loadDrugsFromDatabase();
      if (dbDrugs.length > 0) {
        this.oncologyDrugs = new Set(dbDrugs);
        return;
      }
      
      // Fallback to hardcoded list of common oncology drugs
      const commonOncologyDrugs = [
        'doxorubicin', 'cyclophosphamide', 'methotrexate', 'cisplatin', 'carboplatin',
        'paclitaxel', 'docetaxel', 'gemcitabine', 'irinotecan', 'oxaliplatin',
        'bevacizumab', 'trastuzumab', 'rituximab', 'cetuximab', 'erlotinib',
        'gefitinib', 'imatinib', 'dasatinib', 'nilotinib', 'sorafenib',
        'sunitinib', 'pazopanib', 'regorafenib', 'cabozantinib', 'lenvatinib',
        'pembrolizumab', 'nivolumab', 'atezolizumab', 'durvalumab', 'ipilimumab',
        'avelumab', 'cemiplimab', 'dostarlimab', 'tisotumab', 'sacituzumab',
        'trastuzumab deruxtecan', 'fam-trastuzumab deruxtecan', 'ado-trastuzumab',
        'brentuximab vedotin', 'polatuzumab vedotin', 'enfortumab vedotin',
        'mirvetuximab soravtansine', 'belantamab mafodotin', 'moxetumomab pasudotox',
        'inotuzumab ozogamicin', 'gemtuzumab ozogamicin', 'mylotarg',
        'venetoclax', 'ibrutinib', 'acalabrutinib', 'zanubrutinib', 'idelalisib',
        'copanlisib', 'duvelisib', 'umbralisib', 'tazemetostat', 'pinometostat',
        'ruxolitinib', 'fedratinib', 'pacritinib', 'momelotinib', 'baricitinib',
        'tofacitinib', 'upadacitinib', 'filgotinib', 'peficitinib', 'decernotinib',
        'olaparib', 'rucaparib', 'niraparib', 'talazoparib', 'veliparib',
        'fluzoparib', 'pamiparib', 'iniparib', 'rucosopasem', 'temozolomide',
        'lomustine', 'carmustine', 'streptozocin', 'dacarbazine', 'procarbazine',
        'hydroxyurea', 'mercaptopurine', '6-mercaptopurine', 'thioguanine',
        'fluorouracil', '5-fluorouracil', '5-fu', 'capecitabine', 'tegafur',
        'cytarabine', 'ara-c', 'azacitidine', 'decitabine', 'cladribine',
        'fludarabine', 'pentostatin', 'nelarabine', 'clofarabine', 'bendamustine',
        'melphalan', 'chlorambucil', 'cyclophosphamide', 'ifosfamide', 'trofosfamide',
        'mitomycin', 'bleomycin', 'dactinomycin', 'daunorubicin', 'epirubicin',
        'idarubicin', 'mitoxantrone', 'plicamycin', 'streptozocin', 'topotecan',
        'etoposide', 'teniposide', 'vincristine', 'vinblastine', 'vinorelbine',
        'vindesine', 'vinflunine', 'cabazitaxel', 'ixabepilone', 'eribulin'
      ];
      
      this.oncologyDrugs = new Set(commonOncologyDrugs);
      
    } catch (error) {
      console.warn('Error loading oncology drugs:', error);
      this.oncologyDrugs = new Set(['doxorubicin', 'cisplatin', 'methotrexate']); // Minimal fallback
    }
  }

  /**
   * Load drugs from database
   */
  async loadDrugsFromDatabase() {
    try {
      // Query for oncology drugs from the database
      const result = await supabaseService.query(`
        SELECT DISTINCT generic_name as name
        FROM drugs 
        WHERE therapeutic_class ILIKE '%oncology%' 
           OR therapeutic_class ILIKE '%cancer%'
           OR therapeutic_class ILIKE '%chemotherapy%'
           OR therapeutic_class ILIKE '%antineoplastic%'
           OR indication ILIKE '%cancer%'
           OR indication ILIKE '%tumor%'
           OR indication ILIKE '%oncology%'
        LIMIT 200
      `);
      
      return result.map(row => row.name).filter(Boolean);
      
    } catch (error) {
      console.warn('Could not load drugs from database:', error.message);
      return [];
    }
  }

  /**
   * Mine DDI evidence for a single drug
   */
  async mineDDIForSingleDrug(drugName, options = {}) {
    console.log(`Mining DDI evidence for: ${drugName}`);
    
    const drugOptions = { ...this.config, ...options };
    const allEvidence = [];
    
    try {
      this.updateProgress('extracting', 0, 1, drugName);
      
      // Extract from multiple sources in parallel
      const extractionPromises = [];
      
      if (drugOptions.enableClinicalTrials) {
        extractionPromises.push(
          this.clinicalTrialsExtractor.extractDDIForDrug(drugName, {
            maxStudies: drugOptions.maxClinicalTrialsPerDrug,
            includeCompleted: drugOptions.includeCompletedTrials
          }).catch(error => {
            console.warn(`Clinical trials extraction failed for ${drugName}:`, error.message);
            return [];
          })
        );
      }
      
      if (drugOptions.enableRegulatoryLabels) {
        extractionPromises.push(
          this.regulatoryExtractor.extractDDIForDrug(drugName, {
            maxResults: drugOptions.maxRegulatoryLabelsPerDrug,
            includeBrandNames: drugOptions.includeBrandNames
          }).catch(error => {
            console.warn(`Regulatory extraction failed for ${drugName}:`, error.message);
            return [];
          })
        );
      }
      
      if (drugOptions.enablePublications) {
        extractionPromises.push(
          this.publicationExtractor.extractDDIForDrug(drugName, {
            maxResults: drugOptions.maxPublicationsPerDrug,
            yearRange: drugOptions.publicationYearRange,
            includePreprints: drugOptions.includePreprints
          }).catch(error => {
            console.warn(`Publication extraction failed for ${drugName}:`, error.message);
            return [];
          })
        );
      }
      
      // Wait for all extractions to complete
      const extractionResults = await Promise.all(extractionPromises);
      
      // Combine results
      for (const sourceResults of extractionResults) {
        allEvidence.push(...sourceResults);
      }
      
      this.updateProgress('normalizing', 1, 1, drugName, allEvidence.length);
      
      console.log(`Extracted ${allEvidence.length} evidence entries for ${drugName}`);
      return allEvidence;
      
    } catch (error) {
      console.error(`Error mining DDI for ${drugName}:`, error);
      this.currentProgress.errors.push({
        drug: drugName,
        error: error.message,
        timestamp: new Date()
      });
      return [];
    }
  }

  /**
   * Mine DDI evidence for multiple drugs
   */
  async mineDDIForMultipleDrugs(drugList, options = {}) {
    console.log(`Mining DDI evidence for ${drugList.length} drugs`);
    
    const miningOptions = { ...this.config, ...options };
    const allEvidence = [];
    
    this.extractionResults.startTime = new Date();
    this.updateProgress('initializing', 0, drugList.length);
    
    try {
      // Process drugs in batches to respect API rate limits
      for (let i = 0; i < drugList.length; i += miningOptions.batchSize) {
        const batch = drugList.slice(i, i + miningOptions.batchSize);
        
        console.log(`Processing batch ${Math.floor(i/miningOptions.batchSize) + 1}/${Math.ceil(drugList.length/miningOptions.batchSize)}`);
        
        // Process batch in parallel
        const batchPromises = batch.map(drug => 
          this.mineDDIForSingleDrug(drug, miningOptions)
        );
        
        const batchResults = await Promise.all(batchPromises);
        
        // Collect results
        for (const drugResults of batchResults) {
          allEvidence.push(...drugResults);
        }
        
        this.updateProgress('extracting', i + batch.length, drugList.length, null, allEvidence.length);
        
        // Delay between batches
        if (i + miningOptions.batchSize < drugList.length) {
          await this.delay(miningOptions.delayBetweenBatches);
        }
      }
      
      this.extractionResults.rawEvidence = allEvidence;
      
      // Normalize evidence if enabled
      let normalizedEvidence = allEvidence;
      if (miningOptions.enableNormalization && allEvidence.length > 0) {
        this.updateProgress('normalizing', drugList.length, drugList.length, null, allEvidence.length);
        
        normalizedEvidence = await this.normalizationService.normalizeEvidence(allEvidence);
        
        // Apply quality filters
        normalizedEvidence = this.normalizationService.applyQualityFilters(normalizedEvidence, {
          minCompositeScore: miningOptions.minEvidenceScore,
          minConfidence: miningOptions.minConfidence,
          requireMechanism: miningOptions.requireMechanism
        });
        
        this.extractionResults.normalizedEvidence = normalizedEvidence;
        this.updateProgress('normalizing', drugList.length, drugList.length, null, allEvidence.length, normalizedEvidence.length);
      }
      
      // Generate reports
      this.generateExtractionReport(drugList, allEvidence);
      if (miningOptions.enableNormalization) {
        this.extractionResults.normalizationReport = this.normalizationService.generateNormalizationReport(
          allEvidence.length, 
          normalizedEvidence
        );
      }
      
      // Persist to database if enabled
      if (miningOptions.enablePersistence && normalizedEvidence.length > 0) {
        this.updateProgress('persisting', drugList.length, drugList.length, null, allEvidence.length, normalizedEvidence.length);
        await this.persistEvidence(normalizedEvidence);
      }
      
      this.extractionResults.endTime = new Date();
      this.extractionResults.totalDuration = this.extractionResults.endTime - this.extractionResults.startTime;
      
      this.updateProgress('completed', drugList.length, drugList.length, null, allEvidence.length, normalizedEvidence.length);
      
      console.log(`Mining completed. Raw evidence: ${allEvidence.length}, Normalized: ${normalizedEvidence.length}`);
      
      return {
        rawEvidence: allEvidence,
        normalizedEvidence: normalizedEvidence,
        reports: {
          extraction: this.extractionResults.extractionReport,
          normalization: this.extractionResults.normalizationReport
        }
      };
      
    } catch (error) {
      console.error('Error in bulk DDI mining:', error);
      this.updateProgress('error', 0, drugList.length, null, allEvidence.length);
      throw error;
    }
  }

  /**
   * Mine DDI evidence for all oncology drugs
   */
  async mineAllOncologyDrugs(options = {}) {
    const drugList = Array.from(this.oncologyDrugs);
    return await this.mineDDIForMultipleDrugs(drugList, options);
  }

  /**
   * Mine DDI evidence for specific oncology indications
   */
  async mineDDIForIndications(indications, options = {}) {
    const indicationDrugs = await this.getDrugsForIndications(indications);
    return await this.mineDDIForMultipleDrugs(indicationDrugs, options);
  }

  /**
   * Get drugs for specific cancer indications
   */
  async getDrugsForIndications(indications) {
    try {
      const indicationQuery = indications.map(indication => 
        `indication ILIKE '%${indication}%'`
      ).join(' OR ');
      
      const result = await supabaseService.query(`
        SELECT DISTINCT generic_name as name
        FROM drugs 
        WHERE ${indicationQuery}
        LIMIT 100
      `);
      
      return result.map(row => row.name).filter(Boolean);
      
    } catch (error) {
      console.warn('Could not load drugs for indications:', error.message);
      // Fallback to indication-specific drug lists
      return this.getIndicationDrugsFallback(indications);
    }
  }

  /**
   * Fallback method to get drugs for indications
   */
  getIndicationDrugsFallback(indications) {
    const indicationDrugs = {
      'breast cancer': ['doxorubicin', 'cyclophosphamide', 'paclitaxel', 'trastuzumab', 'pertuzumab'],
      'lung cancer': ['cisplatin', 'carboplatin', 'paclitaxel', 'gemcitabine', 'erlotinib'],
      'colorectal cancer': ['fluorouracil', 'oxaliplatin', 'irinotecan', 'bevacizumab', 'cetuximab'],
      'leukemia': ['methotrexate', 'cytarabine', 'daunorubicin', 'imatinib', 'dasatinib'],
      'lymphoma': ['rituximab', 'cyclophosphamide', 'doxorubicin', 'vincristine', 'prednisone']
    };
    
    const drugs = new Set();
    for (const indication of indications) {
      const indicationLower = indication.toLowerCase();
      for (const [key, drugList] of Object.entries(indicationDrugs)) {
        if (indicationLower.includes(key)) {
          drugList.forEach(drug => drugs.add(drug));
        }
      }
    }
    
    return Array.from(drugs);
  }

  /**
   * Update progress and notify callback
   */
  updateProgress(phase, completed, total, currentDrug = null, extractedEvidence = null, normalizedEvidence = null) {
    this.currentProgress = {
      ...this.currentProgress,
      phase,
      completed,
      total,
      currentDrug,
      ...(extractedEvidence !== null && { extractedEvidence }),
      ...(normalizedEvidence !== null && { normalizedEvidence })
    };
    
    if (this.progressCallback) {
      this.progressCallback(this.currentProgress);
    }
  }

  /**
   * Set progress callback for real-time updates
   */
  setProgressCallback(callback) {
    this.progressCallback = callback;
  }

  /**
   * Generate extraction report
   */
  generateExtractionReport(drugList, evidence) {
    const sourceTypes = {};
    const drugCoverage = {};
    const extractionErrors = this.currentProgress.errors;
    
    for (const entry of evidence) {
      sourceTypes[entry.sourceType] = (sourceTypes[entry.sourceType] || 0) + 1;
      
      const drug1 = entry.drug1.name;
      const drug2 = entry.drug2.name;
      drugCoverage[drug1] = (drugCoverage[drug1] || 0) + 1;
      drugCoverage[drug2] = (drugCoverage[drug2] || 0) + 1;
    }
    
    this.extractionResults.extractionReport = {
      summary: {
        drugsProcessed: drugList.length,
        totalEvidence: evidence.length,
        averageEvidencePerDrug: Math.round(evidence.length / drugList.length),
        successRate: Math.round((1 - extractionErrors.length / drugList.length) * 100)
      },
      sources: sourceTypes,
      coverage: {
        drugsWithEvidence: Object.keys(drugCoverage).length,
        topDrugs: Object.entries(drugCoverage)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([drug, count]) => ({ drug, evidenceCount: count }))
      },
      errors: extractionErrors.map(error => ({
        drug: error.drug,
        message: error.error,
        timestamp: error.timestamp
      }))
    };
  }

  /**
   * Persist evidence to database
   */
  async persistEvidence(evidenceList) {
    try {
      console.log(`Persisting ${evidenceList.length} evidence entries to database...`);
      
      const batchSize = 50;
      let persisted = 0;
      
      for (let i = 0; i < evidenceList.length; i += batchSize) {
        const batch = evidenceList.slice(i, i + batchSize);
        
        try {
          const dbRecords = batch.map(evidence => evidence.toDatabaseRecord());
          
          // Insert batch into database
          await supabaseService.insertBatch('drug_interaction_evidence', dbRecords);
          
          persisted += batch.length;
          console.log(`Persisted ${persisted}/${evidenceList.length} evidence entries`);
          
        } catch (error) {
          console.warn(`Error persisting batch ${i}-${i + batch.length}:`, error.message);
          continue;
        }
      }
      
      console.log(`Successfully persisted ${persisted} evidence entries`);
      
    } catch (error) {
      console.error('Error persisting evidence:', error);
      throw error;
    }
  }

  /**
   * Get current progress
   */
  getProgress() {
    return { ...this.currentProgress };
  }

  /**
   * Get extraction results
   */
  getResults() {
    return { ...this.extractionResults };
  }

  /**
   * Export results to various formats
   */
  exportResults(format = 'json') {
    const results = this.getResults();
    
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(results, null, 2);
        
      case 'csv':
        return this.exportToCSV(results.normalizedEvidence);
        
      case 'tsv':
        return this.exportToTSV(results.normalizedEvidence);
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export to CSV format
   */
  exportToCSV(evidenceList) {
    const headers = [
      'drug1_name', 'drug1_rxcui', 'drug2_name', 'drug2_rxcui',
      'severity', 'mechanism', 'enzyme_pathway', 'effect',
      'source_type', 'evidence_level', 'composite_score',
      'source_title', 'source_url'
    ];
    
    const rows = evidenceList.map(evidence => [
      evidence.drug1.name || '',
      evidence.drug1.rxcui || '',
      evidence.drug2.name || '',
      evidence.drug2.rxcui || '',
      evidence.interaction.severity || '',
      evidence.interaction.mechanism || '',
      evidence.interaction.enzyme_pathway || '',
      evidence.interaction.effect || '',
      evidence.sourceType || '',
      evidence.evidence.level || '',
      evidence.evidence.composite_score || '',
      evidence.source.title || '',
      evidence.source.url || ''
    ].map(field => `"${String(field).replace(/"/g, '""')}"`));
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  /**
   * Export to TSV format
   */
  exportToTSV(evidenceList) {
    return this.exportToCSV(evidenceList).replace(/,/g, '\t').replace(/"/g, '');
  }

  /**
   * Clear all caches
   */
  clearCaches() {
    this.clinicalTrialsExtractor.clearCache();
    this.regulatoryExtractor.clearCache();
    this.publicationExtractor.clearCache();
    this.normalizationService.clearCaches();
    console.log('All DDI mining caches cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      clinicalTrials: this.clinicalTrialsExtractor.getCacheStats(),
      regulatory: this.regulatoryExtractor.getCacheStats(),
      publications: this.publicationExtractor.getCacheStats()
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('DDI mining configuration updated');
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    const required = ['batchSize', 'delayBetweenBatches', 'minEvidenceScore'];
    const missing = required.filter(key => this.config[key] === undefined);
    
    if (missing.length > 0) {
      throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }
    
    if (this.config.batchSize < 1 || this.config.batchSize > 20) {
      throw new Error('Batch size must be between 1 and 20');
    }
    
    if (this.config.delayBetweenBatches < 1000) {
      throw new Error('Delay between batches must be at least 1000ms');
    }
    
    return true;
  }

  /**
   * Utility function for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset orchestrator state
   */
  reset() {
    this.currentProgress = {
      phase: 'idle',
      completed: 0,
      total: 0,
      currentDrug: null,
      extractedEvidence: 0,
      normalizedEvidence: 0,
      errors: []
    };
    
    this.extractionResults = {
      rawEvidence: [],
      normalizedEvidence: [],
      extractionReport: null,
      normalizationReport: null,
      startTime: null,
      endTime: null,
      totalDuration: null
    };
    
    console.log('DDI mining orchestrator reset');
  }
}

export default DDIMiningOrchestrator;