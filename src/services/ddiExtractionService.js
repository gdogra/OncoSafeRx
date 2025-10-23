/**
 * DDI Extraction Service - ClinicalTrials.gov Module
 * 
 * Extracts drug-drug interactions from ClinicalTrials.gov data
 * Part of the comprehensive DDI mining system for OncoSafeRx
 */

import axios from 'axios';
import { DrugInteractionEvidence } from '../models/DrugInteractionEvidence.js';
import { RxNormService } from './rxnormService.js';
import clinicalTrialsService from './clinicalTrialsService.js';

export class ClinicalTrialsDDIExtractor {
  constructor() {
    this.baseUrl = 'https://clinicaltrials.gov/api/v2/studies';
    this.rxnormService = new RxNormService();
    this.oncologyDrugs = new Set(); // Will be populated with known oncology drugs
    this.cache = new Map();
    this.cacheTimeout = 1000 * 60 * 60 * 24; // 24 hours
    
    // DDI-related keywords for text extraction
    this.ddiKeywords = [
      'concomitant', 'concurrent', 'co-administration', 'drug interaction',
      'prohibited medication', 'excluded medication', 'CYP inhibitor', 'CYP inducer',
      'strong inhibitor', 'moderate inhibitor', 'enzyme inhibitor', 'enzyme inducer',
      'contraindicated', 'avoid combination', 'use with caution',
      'P-glycoprotein', 'P-gp', 'transporter', 'metabolic', 'clearance'
    ];

    // Common enzyme/transporter patterns
    this.enzymePatterns = [
      /CYP\s*([0-9][A-Z][0-9]+)/gi,
      /P-?glycoprotein|P-?gp/gi,
      /OATP[0-9A-Z]+/gi,
      /UGT[0-9A-Z]+/gi,
      /BCRP/gi,
      /MDR1/gi
    ];

    // Severity indicators
    this.severityIndicators = {
      contraindicated: ['contraindicated', 'prohibited', 'forbidden', 'not permitted'],
      major: ['strong inhibitor', 'potent inhibitor', 'avoid', 'significant', 'major'],
      moderate: ['moderate inhibitor', 'caution', 'monitor', 'consider'],
      minor: ['weak inhibitor', 'minor', 'minimal']
    };
  }

  /**
   * Initialize with oncology drug list for focused extraction
   */
  async initialize(oncologyDrugList = []) {
    this.oncologyDrugs = new Set(oncologyDrugList.map(drug => drug.toLowerCase()));
    console.log(`Initialized with ${this.oncologyDrugs.size} oncology drugs`);
  }

  /**
   * Extract DDI evidence for a specific oncology drug
   */
  async extractDDIForDrug(drugName, options = {}) {
    const { maxStudies = 50, includeCompleted = true } = options;
    
    try {
      console.log(`Extracting DDI evidence for drug: ${drugName}`);
      
      // Search clinical trials involving this drug
      const searchResults = await this.searchTrialsForDrug(drugName, maxStudies, includeCompleted);
      
      const ddiEvidence = [];
      
      for (const study of searchResults.studies) {
        try {
          // Get detailed study information
          const studyDetails = await this.getStudyDetails(study.nctId);
          
          // Extract DDI evidence from study details
          const evidence = await this.extractDDIFromStudy(drugName, studyDetails);
          ddiEvidence.push(...evidence);
          
          // Rate limiting - respect API limits
          await this.delay(200);
          
        } catch (error) {
          console.warn(`Error processing study ${study.nctId}:`, error.message);
          continue;
        }
      }

      console.log(`Extracted ${ddiEvidence.length} DDI evidence entries for ${drugName}`);
      return ddiEvidence;
      
    } catch (error) {
      console.error(`Error extracting DDI for ${drugName}:`, error);
      throw error;
    }
  }

  /**
   * Search clinical trials for a specific drug
   */
  async searchTrialsForDrug(drugName, maxStudies = 50, includeCompleted = true) {
    const cacheKey = `trials_${drugName.toLowerCase()}_${maxStudies}_${includeCompleted}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const params = {
        'query.intr': drugName,
        'filter.overallStatus': includeCompleted ? 'RECRUITING,ACTIVE_NOT_RECRUITING,COMPLETED' : 'RECRUITING,ACTIVE_NOT_RECRUITING',
        'filter.studyType': 'INTERVENTIONAL',
        'pageSize': Math.min(maxStudies, 100),
        'format': 'json',
        'fields': 'NCTId,BriefTitle,OverallStatus,Phase,Condition,InterventionName,EligibilityCriteria'
      };

      const response = await axios.get(this.baseUrl, {
        params,
        timeout: 30000,
        headers: {
          'User-Agent': 'OncoSafeRx-DDI-Extractor/1.0'
        }
      });

      const result = {
        studies: response.data.studies || [],
        totalCount: response.data.totalCount || 0
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;

    } catch (error) {
      console.error(`Error searching trials for ${drugName}:`, error.message);
      return { studies: [], totalCount: 0 };
    }
  }

  /**
   * Get detailed study information including full eligibility criteria
   */
  async getStudyDetails(nctId) {
    const cacheKey = `study_details_${nctId}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await axios.get(`${this.baseUrl}/${nctId}`, {
        params: { 
          format: 'json',
          fields: 'NCTId,BriefTitle,OfficialTitle,OverallStatus,Phase,Condition,InterventionName,EligibilityCriteria,DetailedDescription,BriefSummary,StudyType,PrimaryPurpose,InterventionType,InterventionDescription'
        },
        timeout: 15000,
        headers: {
          'User-Agent': 'OncoSafeRx-DDI-Extractor/1.0'
        }
      });

      const study = response.data.protocolSection || response.data;
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: study,
        timestamp: Date.now()
      });

      return study;

    } catch (error) {
      console.error(`Error getting details for study ${nctId}:`, error.message);
      throw error;
    }
  }

  /**
   * Extract DDI evidence from a single clinical trial
   */
  async extractDDIFromStudy(primaryDrug, studyDetails) {
    const evidence = [];
    
    try {
      const identification = studyDetails.identificationModule || {};
      const eligibility = studyDetails.eligibilityModule || {};
      const interventions = studyDetails.armsInterventionsModule || {};
      const description = studyDetails.descriptionModule || {};
      
      // Extract text content for analysis
      const textSources = [
        eligibility.eligibilityCriteria || '',
        description.detailedDescription || '',
        description.briefSummary || ''
      ];

      const fullText = textSources.join(' ').toLowerCase();
      
      // Skip if no DDI-related content
      if (!this.containsDDIContent(fullText)) {
        return evidence;
      }

      // Extract drug interactions from eligibility criteria
      const eligibilityDDIs = await this.extractFromEligibilityCriteria(
        primaryDrug,
        eligibility.eligibilityCriteria || '',
        studyDetails
      );
      evidence.push(...eligibilityDDIs);

      // Extract from intervention descriptions
      const interventionDDIs = await this.extractFromInterventions(
        primaryDrug,
        interventions.interventions || [],
        studyDetails
      );
      evidence.push(...interventionDDIs);

      // Extract from study descriptions
      const descriptionDDIs = await this.extractFromDescriptions(
        primaryDrug,
        textSources,
        studyDetails
      );
      evidence.push(...descriptionDDIs);

    } catch (error) {
      console.error('Error extracting DDI from study:', error);
    }

    return evidence;
  }

  /**
   * Check if text contains DDI-related content
   */
  containsDDIContent(text) {
    return this.ddiKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Extract DDI evidence from eligibility criteria
   */
  async extractFromEligibilityCriteria(primaryDrug, criteriaText, studyDetails) {
    const evidence = [];
    
    if (!criteriaText) return evidence;

    // Split into inclusion and exclusion criteria
    const sections = this.parseCriteriaSections(criteriaText);
    
    // Focus on exclusion criteria for DDI evidence
    for (const section of sections.exclusion) {
      const interactions = await this.extractInteractionsFromText(
        primaryDrug,
        section,
        studyDetails,
        'exclusion_criteria'
      );
      evidence.push(...interactions);
    }

    // Check inclusion criteria for allowed concomitant medications
    for (const section of sections.inclusion) {
      const interactions = await this.extractInteractionsFromText(
        primaryDrug,
        section,
        studyDetails,
        'inclusion_criteria'
      );
      evidence.push(...interactions);
    }

    return evidence;
  }

  /**
   * Parse criteria text into inclusion/exclusion sections
   */
  parseCriteriaSections(criteriaText) {
    const sections = { inclusion: [], exclusion: [] };
    
    const lines = criteriaText.split(/\n|\r\n/).filter(line => line.trim());
    let currentSection = 'inclusion';
    let currentGroup = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Detect section headers
      if (/inclusion\s+criteria/i.test(trimmed)) {
        if (currentGroup.length > 0) {
          sections[currentSection].push(currentGroup.join(' '));
          currentGroup = [];
        }
        currentSection = 'inclusion';
        continue;
      }
      
      if (/exclusion\s+criteria/i.test(trimmed)) {
        if (currentGroup.length > 0) {
          sections[currentSection].push(currentGroup.join(' '));
          currentGroup = [];
        }
        currentSection = 'exclusion';
        continue;
      }

      // Add to current group
      if (trimmed) {
        currentGroup.push(trimmed);
      }

      // If line ends criteria point, add to section
      if (trimmed.match(/[.;]$/) || currentGroup.length > 3) {
        sections[currentSection].push(currentGroup.join(' '));
        currentGroup = [];
      }
    }

    // Add remaining group
    if (currentGroup.length > 0) {
      sections[currentSection].push(currentGroup.join(' '));
    }

    return sections;
  }

  /**
   * Extract interactions from intervention descriptions
   */
  async extractFromInterventions(primaryDrug, interventions, studyDetails) {
    const evidence = [];

    for (const intervention of interventions) {
      const description = intervention.description || '';
      const name = intervention.name || '';
      
      const interactions = await this.extractInteractionsFromText(
        primaryDrug,
        `${name} ${description}`,
        studyDetails,
        'intervention_description'
      );
      evidence.push(...interactions);
    }

    return evidence;
  }

  /**
   * Extract interactions from study descriptions
   */
  async extractFromDescriptions(primaryDrug, textSources, studyDetails) {
    const evidence = [];

    for (const text of textSources) {
      if (!text) continue;
      
      const interactions = await this.extractInteractionsFromText(
        primaryDrug,
        text,
        studyDetails,
        'study_description'
      );
      evidence.push(...interactions);
    }

    return evidence;
  }

  /**
   * Extract drug interactions from text using pattern matching and NLP
   */
  async extractInteractionsFromText(primaryDrug, text, studyDetails, evidenceContext) {
    const evidence = [];
    
    if (!text || text.length < 20) return evidence;

    // Find drug mentions
    const drugMentions = await this.extractDrugMentions(text);
    
    // Find enzyme/transporter mentions
    const enzymeMentions = this.extractEnzymeMentions(text);
    
    // Determine severity from text
    const severity = this.determineSeverity(text);
    
    // Extract mechanism information
    const mechanism = this.extractMechanism(text, enzymeMentions);

    // Create evidence entries for each drug interaction found
    for (const interactingDrug of drugMentions) {
      if (interactingDrug.toLowerCase() === primaryDrug.toLowerCase()) continue;

      try {
        // Resolve RXCUIs
        const primaryRxcui = await this.resolveRxcui(primaryDrug);
        const interactingRxcui = await this.resolveRxcui(interactingDrug);

        const evidenceEntry = new DrugInteractionEvidence({
          sourceType: 'clinical_trial',
          sourceId: studyDetails.identificationModule?.nctId || 'unknown',
          drug1: {
            name: primaryDrug,
            rxcui: primaryRxcui
          },
          drug2: {
            name: interactingDrug,
            rxcui: interactingRxcui
          },
          interaction: {
            mechanism: mechanism,
            enzyme_pathway: enzymeMentions.join(', '),
            severity: severity,
            effect: this.extractEffect(text),
            management: this.extractManagement(text)
          },
          evidence: {
            level: this.determineEvidenceLevel(evidenceContext, severity),
            evidence_context: evidenceContext,
            study_type: studyDetails.designModule?.studyType || 'unknown'
          },
          source: {
            title: studyDetails.identificationModule?.briefTitle || '',
            url: `https://clinicaltrials.gov/study/${studyDetails.identificationModule?.nctId}`,
            raw_text: text.substring(0, 500) // Store sample of raw text
          },
          clinical_trial: {
            nct_id: studyDetails.identificationModule?.nctId,
            phase: studyDetails.designModule?.phases?.[0] || 'unknown',
            title: studyDetails.identificationModule?.briefTitle,
            study_type: studyDetails.designModule?.studyType,
            status: studyDetails.statusModule?.overallStatus,
            condition: studyDetails.conditionsModule?.conditions?.[0],
            exclusion_mention: evidenceContext === 'exclusion_criteria',
            concomitant_use_allowed: evidenceContext === 'inclusion_criteria'
          },
          extraction_metadata: {
            extracted_at: new Date(),
            extraction_method: 'clinical_trials_text_mining',
            text_extraction_confidence: this.calculateTextConfidence(text, mechanism, severity)
          }
        });

        if (evidenceEntry.isValid()) {
          evidence.push(evidenceEntry);
        }

      } catch (error) {
        console.warn(`Error creating evidence entry for ${interactingDrug}:`, error.message);
      }
    }

    return evidence;
  }

  /**
   * Extract drug mentions from text
   */
  async extractDrugMentions(text) {
    const drugs = new Set();
    
    // Common drug name patterns
    const drugPatterns = [
      // Generic names (lowercase, ending in common suffixes)
      /\b([a-z]+(?:mycin|cillin|navir|tinib|mab|zole|pril|sartan|statin|afenib))\b/gi,
      // Brand names (capitalized)
      /\b([A-Z][a-z]+(?:tra|cel|nex|sor|bev|rit|ima|das|ofa|sun|ven))\b/g,
      // Quoted drug names
      /"([^"]+)"/g,
      // Lists with commas
      /(?:include|including|such as|namely)\s+([^,.;]+(?:,[^,.;]+)*)/gi
    ];

    for (const pattern of drugPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const drugName = match[1].trim();
        if (drugName.length > 3 && !this.isCommonWord(drugName)) {
          drugs.add(drugName);
        }
      }
    }

    // Filter to likely drug names using common knowledge
    return Array.from(drugs).filter(drug => this.isLikelyDrugName(drug));
  }

  /**
   * Extract enzyme/transporter mentions from text
   */
  extractEnzymeMentions(text) {
    const enzymes = new Set();
    
    for (const pattern of this.enzymePatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        enzymes.add(match[0].replace(/\s+/g, ''));
      }
    }

    return Array.from(enzymes);
  }

  /**
   * Determine interaction severity from text
   */
  determineSeverity(text) {
    const lowerText = text.toLowerCase();
    
    for (const [severity, indicators] of Object.entries(this.severityIndicators)) {
      if (indicators.some(indicator => lowerText.includes(indicator))) {
        return severity;
      }
    }
    
    // Default based on context
    if (lowerText.includes('exclusion') || lowerText.includes('prohibited')) {
      return 'major';
    }
    
    return 'moderate';
  }

  /**
   * Extract mechanism description from text
   */
  extractMechanism(text, enzymeMentions) {
    const mechanisms = [];
    
    // Enzyme inhibition/induction
    if (enzymeMentions.length > 0) {
      if (text.includes('inhibit') || text.includes('inhibitor')) {
        mechanisms.push(`${enzymeMentions.join(', ')} inhibition`);
      }
      if (text.includes('induc') || text.includes('inducer')) {
        mechanisms.push(`${enzymeMentions.join(', ')} induction`);
      }
    }

    // Pharmacodynamic mechanisms
    if (text.includes('additive') || text.includes('synergistic')) {
      mechanisms.push('Additive/synergistic effects');
    }

    if (text.includes('QT') || text.includes('cardiac')) {
      mechanisms.push('QT prolongation risk');
    }

    if (text.includes('bleeding') || text.includes('anticoagul')) {
      mechanisms.push('Increased bleeding risk');
    }

    return mechanisms.length > 0 ? mechanisms.join('; ') : 'Mechanism unclear from text';
  }

  /**
   * Extract effect description from text
   */
  extractEffect(text) {
    const effects = [];
    
    if (text.includes('increas') && text.includes('exposure')) {
      effects.push('Increased drug exposure');
    }
    if (text.includes('decreas') && text.includes('efficacy')) {
      effects.push('Decreased efficacy');
    }
    if (text.includes('toxicity') || text.includes('adverse')) {
      effects.push('Increased toxicity risk');
    }
    
    return effects.join('; ') || 'Effect unclear from text';
  }

  /**
   * Extract management recommendations from text
   */
  extractManagement(text) {
    if (text.includes('avoid') || text.includes('contraindicated')) {
      return 'Avoid combination';
    }
    if (text.includes('monitor') || text.includes('caution')) {
      return 'Monitor closely';
    }
    if (text.includes('dose') && (text.includes('reduc') || text.includes('adjust'))) {
      return 'Consider dose adjustment';
    }
    
    return 'Management not specified';
  }

  /**
   * Determine evidence level based on context and severity
   */
  determineEvidenceLevel(context, severity) {
    if (context === 'exclusion_criteria' && severity === 'contraindicated') {
      return 'high';
    }
    if (context === 'exclusion_criteria') {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Calculate confidence score for text extraction
   */
  calculateTextConfidence(text, mechanism, severity) {
    let confidence = 50;
    
    if (mechanism && !mechanism.includes('unclear')) confidence += 20;
    if (severity !== 'moderate') confidence += 15;
    if (text.length > 100) confidence += 10;
    if (this.enzymePatterns.some(p => p.test(text))) confidence += 15;
    
    return Math.min(confidence, 100);
  }

  /**
   * Check if a word is a common English word (not a drug)
   */
  isCommonWord(word) {
    const commonWords = new Set([
      'and', 'or', 'but', 'the', 'with', 'for', 'to', 'in', 'on', 'at',
      'use', 'treatment', 'therapy', 'drug', 'medication', 'patient',
      'study', 'trial', 'group', 'dose', 'effect', 'adverse', 'clinical'
    ]);
    return commonWords.has(word.toLowerCase());
  }

  /**
   * Heuristic to determine if a string is likely a drug name
   */
  isLikelyDrugName(name) {
    if (name.length < 4 || name.length > 25) return false;
    if (/^\d+$/.test(name)) return false;
    if (this.isCommonWord(name)) return false;
    
    // Check for drug-like suffixes
    const drugSuffixes = [
      'mycin', 'cillin', 'navir', 'tinib', 'mab', 'zole', 'pril',
      'sartan', 'statin', 'afenib', 'sone', 'olol', 'ide', 'ine'
    ];
    
    return drugSuffixes.some(suffix => name.toLowerCase().endsWith(suffix)) ||
           /^[A-Z][a-z]+$/.test(name); // Proper noun format
  }

  /**
   * Resolve drug name to RXCUI using RxNorm service
   */
  async resolveRxcui(drugName) {
    try {
      const results = await this.rxnormService.searchDrugs(drugName);
      if (results && results.length > 0) {
        // Prefer ingredients (IN) over other types
        const ingredient = results.find(r => r.tty === 'IN');
        return ingredient ? ingredient.rxcui : results[0].rxcui;
      }
    } catch (error) {
      console.warn(`Failed to resolve RXCUI for ${drugName}:`, error.message);
    }
    return null;
  }

  /**
   * Bulk extract DDI evidence for multiple oncology drugs
   */
  async bulkExtractDDI(drugList, options = {}) {
    const { batchSize = 5, delayBetweenBatches = 2000 } = options;
    const allEvidence = [];
    
    console.log(`Starting bulk DDI extraction for ${drugList.length} drugs`);
    
    for (let i = 0; i < drugList.length; i += batchSize) {
      const batch = drugList.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(drugList.length/batchSize)}`);
      
      const batchPromises = batch.map(drug => 
        this.extractDDIForDrug(drug, options).catch(error => {
          console.error(`Failed to extract DDI for ${drug}:`, error.message);
          return [];
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      allEvidence.push(...batchResults.flat());
      
      // Delay between batches to respect rate limits
      if (i + batchSize < drugList.length) {
        await this.delay(delayBetweenBatches);
      }
    }
    
    console.log(`Bulk extraction completed. Total evidence entries: ${allEvidence.length}`);
    return allEvidence;
  }

  /**
   * Utility function for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxAge: this.cacheTimeout,
      oldestEntry: Math.min(...Array.from(this.cache.values()).map(v => v.timestamp))
    };
  }
}

export default ClinicalTrialsDDIExtractor;