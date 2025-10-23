/**
 * Regulatory Label DDI Extractor
 * 
 * Extracts drug-drug interactions from FDA drug labels and DailyMed
 * Part of the comprehensive DDI mining system for OncoSafeRx
 */

import axios from 'axios';
import xml2js from 'xml2js';
import { DrugInteractionEvidence } from '../models/DrugInteractionEvidence.js';
import { RxNormService } from './rxnormService.js';

export class RegulatoryLabelExtractor {
  constructor() {
    this.openFdaBaseUrl = 'https://api.fda.gov/drug/label.json';
    this.dailyMedBaseUrl = 'https://dailymed.nlm.nih.gov/dailymed';
    this.rxnormService = new RxNormService();
    this.cache = new Map();
    this.cacheTimeout = 1000 * 60 * 60 * 24; // 24 hours
    
    // Relevant label sections for DDI extraction
    this.ddiSections = [
      'drug_interactions',
      'contraindications', 
      'warnings_and_cautions',
      'clinical_pharmacology',
      'pharmacokinetics',
      'warnings',
      'precautions',
      'boxed_warning'
    ];

    // DDI-related keywords and patterns
    this.ddiIndicators = [
      'co-administration', 'concomitant', 'concurrent use',
      'drug interaction', 'drug-drug interaction', 'DDI',
      'cytochrome', 'CYP', 'P-glycoprotein', 'P-gp',
      'inhibitor', 'inducer', 'substrate',
      'contraindicated', 'avoid', 'caution',
      'monitor', 'adjust dose', 'reduce dose',
      'increase exposure', 'decrease exposure',
      'clearance', 'metabolism', 'elimination'
    ];

    // Severity mapping from FDA terminology
    this.severityMapping = {
      'contraindicated': 'major',
      'avoid': 'major',
      'not recommended': 'major',
      'boxed warning': 'major',
      'warning': 'moderate',
      'caution': 'moderate',
      'monitor': 'moderate',
      'consider': 'minor',
      'may': 'minor'
    };

    // Enzyme/transporter patterns
    this.enzymePatterns = [
      /CYP\s*([0-9][A-Z][0-9]+)/gi,
      /cytochrome\s+P450\s+([0-9][A-Z][0-9]+)/gi,
      /P-?glycoprotein|P-?gp/gi,
      /OATP[0-9A-Z]+/gi,
      /UGT[0-9A-Z]+/gi,
      /BCRP/gi,
      /MDR1/gi,
      /MATE[0-9]*/gi,
      /OCT[0-9]*/gi
    ];

    // PK parameter patterns
    this.pkPatterns = [
      /AUC.*?(?:increase|decrease)[^.]*?(\d+(?:\.\d+)?)\s*(?:%|fold|times)/gi,
      /Cmax.*?(?:increase|decrease)[^.]*?(\d+(?:\.\d+)?)\s*(?:%|fold|times)/gi,
      /clearance.*?(?:increase|decrease)[^.]*?(\d+(?:\.\d+)?)\s*(?:%|fold|times)/gi,
      /half-?life.*?(?:increase|decrease)[^.]*?(\d+(?:\.\d+)?)\s*(?:%|fold|times)/gi
    ];
  }

  /**
   * Extract DDI evidence for a specific drug using multiple data sources
   */
  async extractDDIForDrug(drugName, options = {}) {
    const { includeBrandNames = true, maxResults = 50 } = options;
    
    console.log(`Extracting regulatory DDI evidence for: ${drugName}`);
    
    const allEvidence = [];
    
    try {
      // Extract from OpenFDA
      const fdaEvidence = await this.extractFromOpenFDA(drugName, maxResults);
      allEvidence.push(...fdaEvidence);
      
      // Extract from DailyMed
      const dailyMedEvidence = await this.extractFromDailyMed(drugName, maxResults);
      allEvidence.push(...dailyMedEvidence);
      
      // If requested, also search by brand names
      if (includeBrandNames) {
        const brandNames = await this.getBrandNames(drugName);
        for (const brandName of brandNames.slice(0, 3)) { // Limit to avoid too many API calls
          const brandEvidence = await this.extractFromOpenFDA(brandName, 10);
          allEvidence.push(...brandEvidence);
        }
      }
      
    } catch (error) {
      console.error(`Error extracting regulatory DDI for ${drugName}:`, error);
    }
    
    console.log(`Found ${allEvidence.length} regulatory DDI evidence entries for ${drugName}`);
    return allEvidence;
  }

  /**
   * Extract DDI evidence from OpenFDA drug labels
   */
  async extractFromOpenFDA(drugName, limit = 50) {
    const cacheKey = `openfda_${drugName.toLowerCase()}_${limit}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const evidence = [];
    
    try {
      // Search for drug labels
      const searchParams = {
        search: `openfda.generic_name:"${drugName}" OR openfda.brand_name:"${drugName}"`,
        limit: limit
      };

      const response = await axios.get(this.openFdaBaseUrl, {
        params: searchParams,
        timeout: 30000,
        headers: {
          'User-Agent': 'OncoSafeRx-DDI-Extractor/1.0'
        }
      });

      const labels = response.data.results || [];
      
      for (const label of labels) {
        const labelEvidence = await this.extractFromFDALabel(drugName, label);
        evidence.push(...labelEvidence);
      }
      
      // Cache results
      this.cache.set(cacheKey, {
        data: evidence,
        timestamp: Date.now()
      });
      
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`No FDA labels found for ${drugName}`);
      } else {
        console.error(`Error searching OpenFDA for ${drugName}:`, error.message);
      }
    }
    
    return evidence;
  }

  /**
   * Extract DDI evidence from a single FDA label
   */
  async extractFromFDALabel(drugName, label) {
    const evidence = [];
    
    try {
      // Extract basic drug information
      const labelInfo = {
        id: label.id || 'unknown',
        productName: label.openfda?.brand_name?.[0] || label.openfda?.generic_name?.[0] || drugName,
        manufacturer: label.openfda?.manufacturer_name?.[0] || 'Unknown',
        ndc: label.openfda?.product_ndc?.[0] || null,
        rxcui: label.openfda?.rxcui?.[0] || null
      };

      // Process each relevant section
      for (const section of this.ddiSections) {
        const sectionContent = label[section];
        if (sectionContent && Array.isArray(sectionContent)) {
          for (const content of sectionContent) {
            const sectionEvidence = await this.extractFromLabelSection(
              drugName,
              content,
              section,
              labelInfo
            );
            evidence.push(...sectionEvidence);
          }
        }
      }
      
    } catch (error) {
      console.error('Error processing FDA label:', error);
    }
    
    return evidence;
  }

  /**
   * Extract DDI evidence from a specific label section
   */
  async extractFromLabelSection(drugName, sectionText, sectionName, labelInfo) {
    const evidence = [];
    
    if (!sectionText || typeof sectionText !== 'string') return evidence;
    
    // Check if section contains DDI-related content
    if (!this.containsDDIContent(sectionText)) return evidence;
    
    try {
      // Split text into interaction entries
      const interactions = this.parseInteractionEntries(sectionText);
      
      for (const interaction of interactions) {
        const interactingDrugs = await this.extractInteractingDrugs(interaction.text);
        const mechanism = this.extractMechanism(interaction.text);
        const severity = this.determineSeverity(interaction.text, sectionName);
        const effect = this.extractEffect(interaction.text);
        const management = this.extractManagement(interaction.text);
        const pkData = this.extractPharmacokinetics(interaction.text);
        
        for (const interactingDrug of interactingDrugs) {
          // Resolve RXCUIs
          const primaryRxcui = await this.resolveRxcui(drugName);
          const interactingRxcui = await this.resolveRxcui(interactingDrug);
          
          const evidenceEntry = new DrugInteractionEvidence({
            sourceType: 'regulatory_label',
            sourceId: labelInfo.id,
            drug1: {
              name: drugName,
              rxcui: primaryRxcui,
              rxnorm_name: drugName
            },
            drug2: {
              name: interactingDrug,
              rxcui: interactingRxcui,
              rxnorm_name: interactingDrug
            },
            interaction: {
              type: this.classifyInteractionType(mechanism),
              mechanism: mechanism,
              enzyme_pathway: this.extractEnzymePathways(interaction.text).join(', '),
              effect: effect,
              severity: severity,
              management: management
            },
            evidence: {
              level: this.determineEvidenceLevel(sectionName, severity),
              confidence: this.calculateLabelConfidence(interaction.text, mechanism, severity),
              study_type: 'regulatory_review',
              evidence_context: 'official_prescribing_information'
            },
            source: {
              title: `${labelInfo.productName} Prescribing Information`,
              regulatory_agency: 'FDA',
              url: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${labelInfo.id}`,
              section: sectionName,
              raw_text: interaction.text.substring(0, 1000)
            },
            regulatory_label: {
              label_id: labelInfo.id,
              product_name: labelInfo.productName,
              manufacturer: labelInfo.manufacturer,
              label_section: sectionName,
              contraindication: sectionName === 'contraindications',
              warning_type: this.classifyWarningType(sectionName),
              dosing_adjustment: management.includes('dose') || management.includes('adjust')
            },
            pharmacokinetics: pkData,
            extraction_metadata: {
              extracted_at: new Date(),
              extraction_method: 'regulatory_label_parsing',
              text_extraction_confidence: this.calculateLabelConfidence(interaction.text, mechanism, severity)
            }
          });
          
          if (evidenceEntry.isValid()) {
            evidence.push(evidenceEntry);
          }
        }
      }
      
    } catch (error) {
      console.warn(`Error extracting from label section ${sectionName}:`, error.message);
    }
    
    return evidence;
  }

  /**
   * Extract DDI evidence from DailyMed
   */
  async extractFromDailyMed(drugName, limit = 20) {
    const evidence = [];
    
    try {
      // Search DailyMed for the drug
      const searchUrl = `${this.dailyMedBaseUrl}/services/v2/spls.json`;
      const searchParams = {
        drug_name: drugName,
        page_size: limit
      };

      const searchResponse = await axios.get(searchUrl, {
        params: searchParams,
        timeout: 20000,
        headers: {
          'User-Agent': 'OncoSafeRx-DDI-Extractor/1.0'
        }
      });

      const spls = searchResponse.data.data || [];
      
      for (const spl of spls.slice(0, 10)) { // Limit to avoid too many requests
        try {
          const splEvidence = await this.extractFromDailyMedSPL(drugName, spl);
          evidence.push(...splEvidence);
          
          // Rate limiting
          await this.delay(500);
          
        } catch (error) {
          console.warn(`Error processing DailyMed SPL ${spl.setid}:`, error.message);
        }
      }
      
    } catch (error) {
      console.error(`Error searching DailyMed for ${drugName}:`, error.message);
    }
    
    return evidence;
  }

  /**
   * Extract DDI evidence from DailyMed SPL
   */
  async extractFromDailyMedSPL(drugName, splInfo) {
    const evidence = [];
    
    try {
      // Get SPL content
      const splUrl = `${this.dailyMedBaseUrl}/services/v2/spls/${splInfo.setid}.xml`;
      const splResponse = await axios.get(splUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'OncoSafeRx-DDI-Extractor/1.0'
        }
      });

      // Parse XML
      const parser = new xml2js.Parser({ explicitArray: false });
      const splData = await parser.parseStringPromise(splResponse.data);
      
      // Extract relevant sections
      const sections = this.extractSPLSections(splData);
      
      for (const [sectionName, sectionContent] of Object.entries(sections)) {
        if (sectionContent && this.containsDDIContent(sectionContent)) {
          const sectionEvidence = await this.extractFromLabelSection(
            drugName,
            sectionContent,
            sectionName,
            {
              id: splInfo.setid,
              productName: splInfo.title || drugName,
              manufacturer: splInfo.author || 'Unknown'
            }
          );
          evidence.push(...sectionEvidence);
        }
      }
      
    } catch (error) {
      console.warn(`Error processing DailyMed SPL:`, error.message);
    }
    
    return evidence;
  }

  /**
   * Extract relevant sections from DailyMed SPL XML
   */
  extractSPLSections(splData) {
    const sections = {};
    
    try {
      // Navigate SPL structure to find relevant sections
      const document = splData?.document;
      if (!document) return sections;
      
      const component = document.component;
      if (!component?.structuredBody?.component) return sections;
      
      const bodyComponents = Array.isArray(component.structuredBody.component) 
        ? component.structuredBody.component 
        : [component.structuredBody.component];
      
      for (const comp of bodyComponents) {
        const section = comp.section;
        if (!section) continue;
        
        const code = section.code?.code || '';
        const title = section.title || '';
        const text = this.extractTextFromSection(section);
        
        // Map section codes to our DDI section names
        const sectionName = this.mapSPLSectionCode(code, title);
        if (sectionName && text) {
          sections[sectionName] = text;
        }
      }
      
    } catch (error) {
      console.warn('Error parsing SPL sections:', error);
    }
    
    return sections;
  }

  /**
   * Extract text content from SPL section
   */
  extractTextFromSection(section) {
    try {
      if (section.text) {
        // Handle various text structures
        if (typeof section.text === 'string') {
          return section.text;
        }
        if (section.text.paragraph) {
          const paragraphs = Array.isArray(section.text.paragraph) 
            ? section.text.paragraph 
            : [section.text.paragraph];
          return paragraphs.map(p => typeof p === 'string' ? p : p._ || '').join(' ');
        }
      }
      
      // Handle nested sections
      if (section.component) {
        const components = Array.isArray(section.component) 
          ? section.component 
          : [section.component];
        return components
          .map(comp => this.extractTextFromSection(comp.section))
          .filter(Boolean)
          .join(' ');
      }
      
    } catch (error) {
      console.warn('Error extracting text from section:', error);
    }
    
    return '';
  }

  /**
   * Map SPL section codes to our DDI section names
   */
  mapSPLSectionCode(code, title) {
    const codeMap = {
      '34073-7': 'drug_interactions',
      '34070-3': 'contraindications',
      '43685-7': 'warnings_and_cautions',
      '34090-1': 'clinical_pharmacology',
      '43682-4': 'pharmacokinetics',
      '34071-1': 'warnings',
      '42232-9': 'precautions',
      '34066-1': 'boxed_warning'
    };
    
    if (codeMap[code]) {
      return codeMap[code];
    }
    
    // Fallback to title-based mapping
    const titleLower = title.toLowerCase();
    if (titleLower.includes('interaction')) return 'drug_interactions';
    if (titleLower.includes('contraindication')) return 'contraindications';
    if (titleLower.includes('warning')) return 'warnings_and_cautions';
    if (titleLower.includes('pharmacology')) return 'clinical_pharmacology';
    if (titleLower.includes('pharmacokinetic')) return 'pharmacokinetics';
    
    return null;
  }

  /**
   * Check if text contains DDI-related content
   */
  containsDDIContent(text) {
    if (!text || typeof text !== 'string') return false;
    
    return this.ddiIndicators.some(indicator => 
      text.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  /**
   * Parse interaction entries from section text
   */
  parseInteractionEntries(text) {
    const entries = [];
    
    // Split by common delimiters
    const potentialEntries = text.split(/\n\n|\.\s+(?=[A-Z])|;\s+(?=[A-Z])/)
      .filter(entry => entry.trim().length > 20);
    
    for (const entry of potentialEntries) {
      if (this.containsDDIContent(entry)) {
        entries.push({
          text: entry.trim(),
          confidence: this.calculateEntryConfidence(entry)
        });
      }
    }
    
    // If no clear entries found, treat whole text as one entry
    if (entries.length === 0 && this.containsDDIContent(text)) {
      entries.push({
        text: text.trim(),
        confidence: 0.5
      });
    }
    
    return entries;
  }

  /**
   * Extract interacting drugs from text
   */
  async extractInteractingDrugs(text) {
    const drugs = new Set();
    
    // Drug name patterns
    const patterns = [
      // Generic names in parentheses
      /\(([a-z][a-z\s-]+[a-z])\)/gi,
      // Capitalized drug names
      /\b([A-Z][a-z]+(?:mycin|cillin|navir|tinib|mab|zole|pril|sartan|statin|afenib))\b/g,
      // Known drug categories
      /\b(inhibitors?|inducers?|substrates?)\s+of\s+([A-Z0-9]+)/gi,
      // Listed drugs
      /(?:include|including|such as)\s+([^.;]+)/gi
    ];

    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const drugName = match[1]?.trim();
        if (drugName && drugName.length > 3 && this.isLikelyDrugName(drugName)) {
          drugs.add(drugName);
        }
      }
    }

    return Array.from(drugs);
  }

  /**
   * Extract mechanism from text
   */
  extractMechanism(text) {
    const mechanisms = [];
    
    // Enzyme mechanisms
    const enzymes = this.extractEnzymePathways(text);
    if (enzymes.length > 0) {
      if (text.toLowerCase().includes('inhibit')) {
        mechanisms.push(`${enzymes.join(', ')} inhibition`);
      }
      if (text.toLowerCase().includes('induc')) {
        mechanisms.push(`${enzymes.join(', ')} induction`);
      }
      if (text.toLowerCase().includes('substrate')) {
        mechanisms.push(`${enzymes.join(', ')} substrate competition`);
      }
    }
    
    // Other mechanisms
    if (text.toLowerCase().includes('protein binding')) {
      mechanisms.push('Protein binding displacement');
    }
    if (text.toLowerCase().includes('renal clearance')) {
      mechanisms.push('Altered renal clearance');
    }
    if (text.toLowerCase().includes('absorption')) {
      mechanisms.push('Altered absorption');
    }
    
    return mechanisms.length > 0 ? mechanisms.join('; ') : 'Mechanism not specified';
  }

  /**
   * Extract enzyme pathways from text
   */
  extractEnzymePathways(text) {
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
   * Determine severity from text and section
   */
  determineSeverity(text, sectionName) {
    const lowerText = text.toLowerCase();
    
    // Section-based severity
    if (sectionName === 'contraindications' || sectionName === 'boxed_warning') {
      return 'major';
    }
    
    // Text-based severity
    for (const [severity, indicators] of Object.entries(this.severityMapping)) {
      if (indicators.some(indicator => lowerText.includes(indicator))) {
        return this.severityMapping[severity];
      }
    }
    
    // Default based on section
    if (sectionName === 'warnings' || sectionName === 'warnings_and_cautions') {
      return 'moderate';
    }
    
    return 'moderate';
  }

  /**
   * Extract effect description from text
   */
  extractEffect(text) {
    const effects = [];
    
    if (text.includes('increase') && (text.includes('exposure') || text.includes('concentration'))) {
      effects.push('Increased drug exposure');
    }
    if (text.includes('decrease') && (text.includes('efficacy') || text.includes('effectiveness'))) {
      effects.push('Decreased efficacy');
    }
    if (text.includes('toxicity') || text.includes('adverse')) {
      effects.push('Increased toxicity risk');
    }
    if (text.includes('QT') && text.includes('prolong')) {
      effects.push('QT prolongation');
    }
    if (text.includes('bleeding')) {
      effects.push('Increased bleeding risk');
    }
    
    return effects.length > 0 ? effects.join('; ') : 'Effect not specified';
  }

  /**
   * Extract management recommendations from text
   */
  extractManagement(text) {
    const management = [];
    
    if (text.toLowerCase().includes('contraindicated') || text.toLowerCase().includes('avoid')) {
      management.push('Avoid combination');
    }
    if (text.toLowerCase().includes('dose') && text.toLowerCase().includes('reduc')) {
      management.push('Consider dose reduction');
    }
    if (text.toLowerCase().includes('monitor')) {
      management.push('Monitor closely');
    }
    if (text.toLowerCase().includes('alternative')) {
      management.push('Consider alternative therapy');
    }
    
    return management.length > 0 ? management.join('; ') : 'Management not specified';
  }

  /**
   * Extract pharmacokinetic parameters from text
   */
  extractPharmacokinetics(text) {
    const pkData = {};
    
    for (const pattern of this.pkPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const parameter = match[0].toLowerCase();
        const value = match[1];
        
        if (parameter.includes('auc')) {
          pkData.auc_change = `${value}${match[0].includes('fold') ? '-fold' : '%'}`;
        } else if (parameter.includes('cmax')) {
          pkData.cmax_change = `${value}${match[0].includes('fold') ? '-fold' : '%'}`;
        } else if (parameter.includes('clearance')) {
          pkData.clearance_change = `${value}${match[0].includes('fold') ? '-fold' : '%'}`;
        } else if (parameter.includes('half')) {
          pkData.half_life_change = `${value}${match[0].includes('fold') ? '-fold' : '%'}`;
        }
      }
    }
    
    return Object.keys(pkData).length > 0 ? pkData : null;
  }

  /**
   * Classify interaction type based on mechanism
   */
  classifyInteractionType(mechanism) {
    const lowerMech = mechanism.toLowerCase();
    
    if (lowerMech.includes('cyp') || lowerMech.includes('enzyme') || lowerMech.includes('metabolism')) {
      return 'pharmacokinetic';
    }
    if (lowerMech.includes('receptor') || lowerMech.includes('additive') || lowerMech.includes('synergistic')) {
      return 'pharmacodynamic';
    }
    if (lowerMech.includes('absorption') || lowerMech.includes('protein binding')) {
      return 'pharmacokinetic';
    }
    
    return 'mixed';
  }

  /**
   * Determine evidence level based on source section and severity
   */
  determineEvidenceLevel(sectionName, severity) {
    if (sectionName === 'contraindications' || sectionName === 'boxed_warning') {
      return 'high';
    }
    if (sectionName === 'drug_interactions' && severity === 'major') {
      return 'high';
    }
    if (sectionName === 'drug_interactions') {
      return 'medium';
    }
    if (sectionName === 'warnings' || sectionName === 'warnings_and_cautions') {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Classify warning type based on section
   */
  classifyWarningType(sectionName) {
    if (sectionName === 'boxed_warning') return 'boxed_warning';
    if (sectionName === 'warnings' || sectionName === 'warnings_and_cautions') return 'warnings_precautions';
    return null;
  }

  /**
   * Calculate confidence score for label extraction
   */
  calculateLabelConfidence(text, mechanism, severity) {
    let confidence = 70; // Higher base for regulatory sources
    
    if (mechanism && !mechanism.includes('not specified')) confidence += 15;
    if (severity === 'major') confidence += 10;
    if (text.length > 100) confidence += 5;
    if (this.enzymePatterns.some(p => p.test(text))) confidence += 10;
    
    return Math.min(confidence, 100);
  }

  /**
   * Calculate confidence for individual interaction entries
   */
  calculateEntryConfidence(entry) {
    let confidence = 0.6;
    
    if (this.ddiIndicators.some(indicator => entry.toLowerCase().includes(indicator))) {
      confidence += 0.2;
    }
    if (this.enzymePatterns.some(pattern => pattern.test(entry))) {
      confidence += 0.15;
    }
    if (entry.length > 50) {
      confidence += 0.05;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Check if a string is likely a drug name
   */
  isLikelyDrugName(name) {
    if (name.length < 4 || name.length > 25) return false;
    if (/^\d+$/.test(name)) return false;
    
    const commonWords = ['and', 'or', 'the', 'with', 'use', 'drug', 'dose', 'effect'];
    if (commonWords.includes(name.toLowerCase())) return false;
    
    // Check for drug-like patterns
    const drugSuffixes = [
      'mycin', 'cillin', 'navir', 'tinib', 'mab', 'zole', 'pril',
      'sartan', 'statin', 'afenib', 'sone', 'olol', 'ide', 'ine'
    ];
    
    return drugSuffixes.some(suffix => name.toLowerCase().endsWith(suffix)) ||
           /^[A-Z][a-z]+$/.test(name);
  }

  /**
   * Get brand names for a drug using RxNorm
   */
  async getBrandNames(drugName) {
    try {
      const results = await this.rxnormService.searchDrugs(drugName);
      return results
        .filter(r => r.tty === 'BN') // Brand names
        .map(r => r.name)
        .slice(0, 5); // Limit results
    } catch (error) {
      console.warn(`Failed to get brand names for ${drugName}:`, error.message);
      return [];
    }
  }

  /**
   * Resolve drug name to RXCUI
   */
  async resolveRxcui(drugName) {
    try {
      const results = await this.rxnormService.searchDrugs(drugName);
      if (results && results.length > 0) {
        const ingredient = results.find(r => r.tty === 'IN');
        return ingredient ? ingredient.rxcui : results[0].rxcui;
      }
    } catch (error) {
      console.warn(`Failed to resolve RXCUI for ${drugName}:`, error.message);
    }
    return null;
  }

  /**
   * Utility function for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Bulk extract DDI evidence for multiple drugs
   */
  async bulkExtractDDI(drugList, options = {}) {
    const { batchSize = 3, delayBetweenBatches = 3000 } = options;
    const allEvidence = [];
    
    console.log(`Starting bulk regulatory DDI extraction for ${drugList.length} drugs`);
    
    for (let i = 0; i < drugList.length; i += batchSize) {
      const batch = drugList.slice(i, i + batchSize);
      console.log(`Processing regulatory batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(drugList.length/batchSize)}`);
      
      const batchPromises = batch.map(drug => 
        this.extractDDIForDrug(drug, options).catch(error => {
          console.error(`Failed to extract regulatory DDI for ${drug}:`, error.message);
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
    
    console.log(`Regulatory extraction completed. Total evidence entries: ${allEvidence.length}`);
    return allEvidence;
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
      maxAge: this.cacheTimeout
    };
  }
}

export default RegulatoryLabelExtractor;