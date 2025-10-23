/**
 * Publication DDI Extractor
 * 
 * Extracts drug-drug interactions from PubMed publications and PMC supplements
 * Part of the comprehensive DDI mining system for OncoSafeRx
 */

import axios from 'axios';
import xml2js from 'xml2js';
import { DrugInteractionEvidence } from '../models/DrugInteractionEvidence.js';
import { RxNormService } from './rxnormService.js';

export class PublicationDDIExtractor {
  constructor() {
    this.pubmedBaseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
    this.pmcBaseUrl = 'https://www.ncbi.nlm.nih.gov/pmc/utils';
    this.rxnormService = new RxNormService();
    this.cache = new Map();
    this.cacheTimeout = 1000 * 60 * 60 * 24 * 7; // 7 days
    
    // API key for NCBI E-utilities (recommended for higher rate limits)
    this.apiKey = process.env.NCBI_API_KEY || null;
    
    // Search terms for DDI-related publications
    this.ddiSearchTerms = [
      'drug interaction', 'drug-drug interaction', 'DDI',
      'cytochrome P450', 'CYP interaction', 'pharmacokinetic interaction',
      'concomitant medication', 'co-administration',
      'enzyme inhibition', 'enzyme induction',
      'P-glycoprotein interaction', 'transporter interaction'
    ];

    // Journal quality weights for evidence scoring
    this.journalWeights = {
      'high': ['nature', 'science', 'cell', 'nejm', 'lancet', 'jama', 'bmj'],
      'medium': ['plos', 'clinical', 'pharmacology', 'therapeutics', 'oncology'],
      'standard': [] // Default weight
    };

    // Study type indicators for evidence classification
    this.studyTypeIndicators = {
      'RCT': ['randomized', 'controlled trial', 'RCT', 'clinical trial'],
      'observational': ['observational', 'cohort', 'case-control', 'retrospective'],
      'case_report': ['case report', 'case series', 'case study'],
      'in_vitro': ['in vitro', 'cell culture', 'microsome'],
      'pharmacokinetic': ['pharmacokinetic', 'PK study', 'bioequivalence']
    };

    // DDI-related MeSH terms for targeted searching
    this.meshTerms = [
      'Drug Interactions',
      'Cytochrome P-450 Enzyme System',
      'ATP Binding Cassette Transporter, Subfamily B',
      'Drug-Related Side Effects and Adverse Reactions',
      'Pharmacokinetics',
      'Drug Administration Schedule'
    ];
  }

  /**
   * Extract DDI evidence for a specific drug from publications
   */
  async extractDDIForDrug(drugName, options = {}) {
    const { 
      maxResults = 100, 
      yearRange = 10, 
      includePreprints = false,
      includeSupplements = true 
    } = options;
    
    console.log(`Extracting publication DDI evidence for: ${drugName}`);
    
    const allEvidence = [];
    
    try {
      // Search PubMed for relevant publications
      const pmids = await this.searchPubMedForDrug(drugName, maxResults, yearRange);
      console.log(`Found ${pmids.length} relevant publications for ${drugName}`);
      
      // Extract DDI evidence from each publication
      for (const pmid of pmids) {
        try {
          const evidence = await this.extractFromPublication(drugName, pmid, includeSupplements);
          allEvidence.push(...evidence);
          
          // Rate limiting - NCBI recommends max 3 requests per second
          await this.delay(350);
          
        } catch (error) {
          console.warn(`Error processing publication ${pmid}:`, error.message);
          continue;
        }
      }
      
    } catch (error) {
      console.error(`Error extracting publication DDI for ${drugName}:`, error);
    }
    
    console.log(`Found ${allEvidence.length} publication DDI evidence entries for ${drugName}`);
    return allEvidence;
  }

  /**
   * Search PubMed for DDI-related publications involving a specific drug
   */
  async searchPubMedForDrug(drugName, maxResults = 100, yearRange = 10) {
    const cacheKey = `pubmed_search_${drugName.toLowerCase()}_${maxResults}_${yearRange}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Construct search query
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - yearRange;
      
      const searchTerms = this.ddiSearchTerms.map(term => `"${term}"`).join(' OR ');
      const query = `(${drugName}[tiab] OR ${drugName}[mesh]) AND (${searchTerms}) AND ${startYear}:${currentYear}[pdat]`;
      
      // Search PubMed
      const searchParams = {
        db: 'pubmed',
        term: query,
        retmax: maxResults,
        retmode: 'json',
        sort: 'relevance'
      };
      
      if (this.apiKey) {
        searchParams.api_key = this.apiKey;
      }

      const searchResponse = await axios.get(`${this.pubmedBaseUrl}/esearch.fcgi`, {
        params: searchParams,
        timeout: 30000,
        headers: {
          'User-Agent': 'OncoSafeRx-DDI-Extractor/1.0'
        }
      });

      const pmids = searchResponse.data.esearchresult?.idlist || [];
      
      // Cache results
      this.cache.set(cacheKey, {
        data: pmids,
        timestamp: Date.now()
      });
      
      return pmids;
      
    } catch (error) {
      console.error(`Error searching PubMed for ${drugName}:`, error.message);
      return [];
    }
  }

  /**
   * Extract DDI evidence from a single publication
   */
  async extractFromPublication(drugName, pmid, includeSupplements = true) {
    const evidence = [];
    
    try {
      // Get publication metadata
      const pubData = await this.getPublicationMetadata(pmid);
      if (!pubData) return evidence;
      
      // Extract from abstract
      const abstractEvidence = await this.extractFromAbstract(drugName, pubData);
      evidence.push(...abstractEvidence);
      
      // Try to get full text if available in PMC
      if (includeSupplements && pubData.pmcid) {
        try {
          const fullTextEvidence = await this.extractFromFullText(drugName, pubData);
          evidence.push(...fullTextEvidence);
        } catch (error) {
          console.warn(`Could not extract from full text for PMID ${pmid}:`, error.message);
        }
      }
      
    } catch (error) {
      console.error(`Error extracting from publication ${pmid}:`, error);
    }
    
    return evidence;
  }

  /**
   * Get publication metadata from PubMed
   */
  async getPublicationMetadata(pmid) {
    const cacheKey = `pubmed_metadata_${pmid}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const params = {
        db: 'pubmed',
        id: pmid,
        retmode: 'xml',
        rettype: 'abstract'
      };
      
      if (this.apiKey) {
        params.api_key = this.apiKey;
      }

      const response = await axios.get(`${this.pubmedBaseUrl}/efetch.fcgi`, {
        params,
        timeout: 15000,
        headers: {
          'User-Agent': 'OncoSafeRx-DDI-Extractor/1.0'
        }
      });

      // Parse XML response
      const parser = new xml2js.Parser({ explicitArray: false });
      const data = await parser.parseStringPromise(response.data);
      
      const article = data?.PubmedArticleSet?.PubmedArticle;
      if (!article) return null;
      
      const medlineCitation = article.MedlineCitation;
      const pubmedData = article.PubmedData;
      
      const metadata = {
        pmid: pmid,
        title: medlineCitation?.Article?.ArticleTitle || '',
        abstract: this.extractAbstractText(medlineCitation?.Article?.Abstract),
        authors: this.extractAuthors(medlineCitation?.Article?.AuthorList),
        journal: medlineCitation?.Article?.Journal?.Title || '',
        journalAbbrev: medlineCitation?.Article?.Journal?.ISOAbbreviation || '',
        publicationDate: this.extractPublicationDate(medlineCitation?.Article?.Journal?.JournalIssue),
        meshTerms: this.extractMeshTerms(medlineCitation?.MeshHeadingList),
        pmcid: this.extractPMCID(pubmedData?.ArticleIdList),
        doi: this.extractDOI(pubmedData?.ArticleIdList),
        publicationType: this.extractPublicationType(medlineCitation?.Article?.PublicationTypeList)
      };
      
      // Cache metadata
      this.cache.set(cacheKey, {
        data: metadata,
        timestamp: Date.now()
      });
      
      return metadata;
      
    } catch (error) {
      console.error(`Error fetching metadata for PMID ${pmid}:`, error.message);
      return null;
    }
  }

  /**
   * Extract DDI evidence from publication abstract
   */
  async extractFromAbstract(drugName, pubData) {
    const evidence = [];
    
    if (!pubData.abstract || pubData.abstract.length < 50) return evidence;
    
    try {
      // Check if abstract contains DDI-related content
      if (!this.containsDDIContent(pubData.abstract)) return evidence;
      
      // Extract drug interactions from abstract text
      const interactions = await this.extractInteractionsFromText(
        drugName,
        pubData.abstract,
        pubData,
        'abstract'
      );
      
      evidence.push(...interactions);
      
    } catch (error) {
      console.warn(`Error extracting from abstract of PMID ${pubData.pmid}:`, error.message);
    }
    
    return evidence;
  }

  /**
   * Extract DDI evidence from full text (PMC)
   */
  async extractFromFullText(drugName, pubData) {
    const evidence = [];
    
    if (!pubData.pmcid) return evidence;
    
    try {
      // Get full text from PMC
      const fullText = await this.getFullTextFromPMC(pubData.pmcid);
      if (!fullText) return evidence;
      
      // Extract relevant sections
      const sections = this.extractRelevantSections(fullText);
      
      for (const [sectionName, sectionText] of Object.entries(sections)) {
        if (this.containsDDIContent(sectionText)) {
          const sectionEvidence = await this.extractInteractionsFromText(
            drugName,
            sectionText,
            pubData,
            sectionName
          );
          evidence.push(...sectionEvidence);
        }
      }
      
    } catch (error) {
      console.warn(`Error extracting from full text of PMC${pubData.pmcid}:`, error.message);
    }
    
    return evidence;
  }

  /**
   * Get full text content from PMC
   */
  async getFullTextFromPMC(pmcid) {
    const cacheKey = `pmc_fulltext_${pmcid}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await axios.get(`${this.pmcBaseUrl}/oa/oa.fcgi`, {
        params: {
          id: `PMC${pmcid}`,
          format: 'xml'
        },
        timeout: 20000,
        headers: {
          'User-Agent': 'OncoSafeRx-DDI-Extractor/1.0'
        }
      });

      // Parse XML to extract text content
      const parser = new xml2js.Parser({ explicitArray: false });
      const data = await parser.parseStringPromise(response.data);
      
      const fullText = this.extractTextFromPMCXML(data);
      
      // Cache full text
      this.cache.set(cacheKey, {
        data: fullText,
        timestamp: Date.now()
      });
      
      return fullText;
      
    } catch (error) {
      console.warn(`Error fetching full text for PMC${pmcid}:`, error.message);
      return null;
    }
  }

  /**
   * Extract text content from PMC XML structure
   */
  extractTextFromPMCXML(data) {
    try {
      const article = data?.articles?.article;
      if (!article) return null;
      
      const body = article.body;
      if (!body) return null;
      
      // Extract text from various sections
      const sections = {};
      
      if (body.sec) {
        const secs = Array.isArray(body.sec) ? body.sec : [body.sec];
        for (const sec of secs) {
          const title = sec.title || 'untitled';
          const text = this.extractTextFromSection(sec);
          if (text) {
            sections[title.toLowerCase()] = text;
          }
        }
      }
      
      return sections;
      
    } catch (error) {
      console.warn('Error parsing PMC XML:', error);
      return null;
    }
  }

  /**
   * Extract text from a PMC XML section
   */
  extractTextFromSection(section) {
    let text = '';
    
    try {
      if (section.p) {
        const paragraphs = Array.isArray(section.p) ? section.p : [section.p];
        for (const p of paragraphs) {
          if (typeof p === 'string') {
            text += p + ' ';
          } else if (p._) {
            text += p._ + ' ';
          }
        }
      }
      
      // Handle nested sections
      if (section.sec) {
        const subsecs = Array.isArray(section.sec) ? section.sec : [section.sec];
        for (const subsec of subsecs) {
          text += this.extractTextFromSection(subsec) + ' ';
        }
      }
      
    } catch (error) {
      console.warn('Error extracting text from section:', error);
    }
    
    return text.trim();
  }

  /**
   * Extract relevant sections for DDI analysis
   */
  extractRelevantSections(fullTextSections) {
    const relevantSections = {};
    
    for (const [sectionName, sectionText] of Object.entries(fullTextSections)) {
      const lowerName = sectionName.toLowerCase();
      
      // Include sections likely to contain DDI information
      if (lowerName.includes('method') ||
          lowerName.includes('result') ||
          lowerName.includes('discussion') ||
          lowerName.includes('conclusion') ||
          lowerName.includes('interaction') ||
          lowerName.includes('pharmacokinetic') ||
          lowerName.includes('safety')) {
        relevantSections[sectionName] = sectionText;
      }
    }
    
    return relevantSections;
  }

  /**
   * Extract drug interactions from text
   */
  async extractInteractionsFromText(drugName, text, pubData, section) {
    const evidence = [];
    
    if (!text || text.length < 50) return evidence;
    
    try {
      // Extract drug mentions
      const drugMentions = await this.extractDrugMentions(text);
      
      // Extract quantitative data (AUC, Cmax changes, etc.)
      const pkData = this.extractQuantitativeData(text);
      
      // Determine study type
      const studyType = this.determineStudyType(text, pubData);
      
      // Extract mechanism information
      const mechanism = this.extractMechanism(text);
      
      // Determine severity
      const severity = this.determineSeverity(text);
      
      // Create evidence entries
      for (const interactingDrug of drugMentions) {
        if (interactingDrug.toLowerCase() === drugName.toLowerCase()) continue;
        
        try {
          // Resolve RXCUIs
          const primaryRxcui = await this.resolveRxcui(drugName);
          const interactingRxcui = await this.resolveRxcui(interactingDrug);
          
          const evidenceEntry = new DrugInteractionEvidence({
            sourceType: 'publication',
            sourceId: pubData.pmid,
            drug1: {
              name: drugName,
              rxcui: primaryRxcui
            },
            drug2: {
              name: interactingDrug,
              rxcui: interactingRxcui
            },
            interaction: {
              type: this.classifyInteractionType(mechanism),
              mechanism: mechanism,
              enzyme_pathway: this.extractEnzymePathways(text).join(', '),
              effect: this.extractEffect(text),
              severity: severity,
              clinical_significance: this.extractClinicalSignificance(text)
            },
            evidence: {
              level: this.determineEvidenceLevel(studyType, pubData),
              confidence: this.calculatePublicationConfidence(text, mechanism, studyType, pubData),
              study_type: studyType,
              evidence_context: section,
              population_size: this.extractPopulationSize(text),
              statistical_significance: this.extractStatisticalSignificance(text)
            },
            source: {
              title: pubData.title,
              authors: pubData.authors,
              publication_date: pubData.publicationDate,
              journal: pubData.journal,
              doi: pubData.doi,
              url: `https://pubmed.ncbi.nlm.nih.gov/${pubData.pmid}/`,
              raw_text: text.substring(0, 1000)
            },
            pharmacokinetics: pkData,
            extraction_metadata: {
              extracted_at: new Date(),
              extraction_method: 'publication_text_mining',
              text_extraction_confidence: this.calculateTextConfidence(text, mechanism, studyType)
            }
          });
          
          if (evidenceEntry.isValid()) {
            evidence.push(evidenceEntry);
          }
          
        } catch (error) {
          console.warn(`Error creating evidence entry for ${interactingDrug}:`, error.message);
        }
      }
      
    } catch (error) {
      console.warn('Error extracting interactions from text:', error);
    }
    
    return evidence;
  }

  /**
   * Check if text contains DDI-related content
   */
  containsDDIContent(text) {
    if (!text) return false;
    
    return this.ddiSearchTerms.some(term => 
      text.toLowerCase().includes(term.toLowerCase())
    );
  }

  /**
   * Extract drug mentions from text
   */
  async extractDrugMentions(text) {
    const drugs = new Set();
    
    // Drug name patterns
    const patterns = [
      // Generic names (common suffixes)
      /\b([a-z]+(?:mycin|cillin|navir|tinib|mab|zole|pril|sartan|statin|afenib|sone|olol))\b/gi,
      // Brand names (capitalized)
      /\b([A-Z][a-z]+(?:tra|cel|nex|sor|bev|rit|ima|das|ofa|sun|ven))\b/g,
      // Parenthetical mentions
      /\(([A-Za-z][A-Za-z\s-]{3,20})\)/g,
      // Drug lists
      /(?:including|such as|namely)\s+([^,.;]+(?:,[^,.;]+)*)/gi
    ];

    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const drugName = match[1].trim();
        if (drugName.length > 3 && this.isLikelyDrugName(drugName)) {
          drugs.add(drugName);
        }
      }
    }

    return Array.from(drugs);
  }

  /**
   * Extract quantitative pharmacokinetic data
   */
  extractQuantitativeData(text) {
    const pkData = {};
    
    // AUC changes
    const aucPattern = /AUC.*?(?:increase|decrease)[^.]*?(\d+(?:\.\d+)?)\s*(?:%|fold|times)/gi;
    const aucMatch = aucPattern.exec(text);
    if (aucMatch) {
      pkData.auc_change = aucMatch[1] + (aucMatch[0].includes('fold') ? '-fold' : '%');
    }
    
    // Cmax changes
    const cmaxPattern = /Cmax.*?(?:increase|decrease)[^.]*?(\d+(?:\.\d+)?)\s*(?:%|fold|times)/gi;
    const cmaxMatch = cmaxPattern.exec(text);
    if (cmaxMatch) {
      pkData.cmax_change = cmaxMatch[1] + (cmaxMatch[0].includes('fold') ? '-fold' : '%');
    }
    
    // Clearance changes
    const clearancePattern = /clearance.*?(?:increase|decrease)[^.]*?(\d+(?:\.\d+)?)\s*(?:%|fold|times)/gi;
    const clearanceMatch = clearancePattern.exec(text);
    if (clearanceMatch) {
      pkData.clearance_change = clearanceMatch[1] + (clearanceMatch[0].includes('fold') ? '-fold' : '%');
    }
    
    return Object.keys(pkData).length > 0 ? pkData : null;
  }

  /**
   * Determine study type from text and metadata
   */
  determineStudyType(text, pubData) {
    const lowerText = text.toLowerCase();
    
    // Check publication type first
    if (pubData.publicationType) {
      for (const pubType of pubData.publicationType) {
        if (pubType.toLowerCase().includes('randomized controlled trial')) {
          return 'RCT';
        }
        if (pubType.toLowerCase().includes('case report')) {
          return 'case_report';
        }
      }
    }
    
    // Check text content
    for (const [studyType, indicators] of Object.entries(this.studyTypeIndicators)) {
      if (indicators.some(indicator => lowerText.includes(indicator.toLowerCase()))) {
        return studyType;
      }
    }
    
    return 'unknown';
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
    }
    
    // Other mechanisms
    if (text.toLowerCase().includes('protein binding')) {
      mechanisms.push('Protein binding displacement');
    }
    if (text.toLowerCase().includes('absorption')) {
      mechanisms.push('Altered absorption');
    }
    if (text.toLowerCase().includes('distribution')) {
      mechanisms.push('Altered distribution');
    }
    
    return mechanisms.length > 0 ? mechanisms.join('; ') : 'Mechanism not specified';
  }

  /**
   * Extract enzyme pathways from text
   */
  extractEnzymePathways(text) {
    const enzymes = new Set();
    
    const patterns = [
      /CYP\s*([0-9][A-Z][0-9]+)/gi,
      /cytochrome\s+P450\s+([0-9][A-Z][0-9]+)/gi,
      /P-?glycoprotein|P-?gp/gi,
      /OATP[0-9A-Z]+/gi,
      /UGT[0-9A-Z]+/gi
    ];
    
    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        enzymes.add(match[0].replace(/\s+/g, ''));
      }
    }
    
    return Array.from(enzymes);
  }

  /**
   * Determine severity from text
   */
  determineSeverity(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('contraindicated') || lowerText.includes('avoid')) {
      return 'major';
    }
    if (lowerText.includes('significant') || lowerText.includes('marked')) {
      return 'moderate';
    }
    if (lowerText.includes('minor') || lowerText.includes('slight')) {
      return 'minor';
    }
    
    // Based on quantitative changes
    if ((/AUC.*increase.*?(\d+)/i.exec(lowerText)?.[1] || 0) > 200) {
      return 'major';
    }
    if ((/AUC.*increase.*?(\d+)/i.exec(lowerText)?.[1] || 0) > 100) {
      return 'moderate';
    }
    
    return 'moderate';
  }

  /**
   * Extract effect description
   */
  extractEffect(text) {
    const effects = [];
    
    if (text.includes('increase') && text.includes('exposure')) {
      effects.push('Increased drug exposure');
    }
    if (text.includes('decrease') && text.includes('efficacy')) {
      effects.push('Decreased efficacy');
    }
    if (text.includes('toxicity') || text.includes('adverse')) {
      effects.push('Increased toxicity risk');
    }
    
    return effects.join('; ') || 'Effect not specified';
  }

  /**
   * Extract clinical significance
   */
  extractClinicalSignificance(text) {
    if (text.toLowerCase().includes('clinically significant')) {
      return 'clinically significant';
    }
    if (text.toLowerCase().includes('not clinically relevant')) {
      return 'not clinically significant';
    }
    return 'clinical significance unclear';
  }

  /**
   * Extract population size
   */
  extractPopulationSize(text) {
    const sizePattern = /(\d+)\s*(?:patients?|subjects?|participants?)/gi;
    const match = sizePattern.exec(text);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Extract statistical significance
   */
  extractStatisticalSignificance(text) {
    const pValuePattern = /p\s*[<>=]\s*(\d+\.?\d*)/gi;
    const match = pValuePattern.exec(text);
    return match ? `p ${match[0].includes('<') ? '<' : '='} ${match[1]}` : null;
  }

  /**
   * Classify interaction type
   */
  classifyInteractionType(mechanism) {
    const lowerMech = mechanism.toLowerCase();
    
    if (lowerMech.includes('cyp') || lowerMech.includes('enzyme') || lowerMech.includes('metabolism')) {
      return 'pharmacokinetic';
    }
    if (lowerMech.includes('receptor') || lowerMech.includes('binding')) {
      return 'pharmacodynamic';
    }
    
    return 'mixed';
  }

  /**
   * Determine evidence level based on study type and publication quality
   */
  determineEvidenceLevel(studyType, pubData) {
    // High-quality studies
    if (studyType === 'RCT' || studyType === 'pharmacokinetic') {
      return 'high';
    }
    
    // Medium-quality studies
    if (studyType === 'observational' && this.isHighQualityJournal(pubData.journal)) {
      return 'high';
    }
    if (studyType === 'observational') {
      return 'medium';
    }
    
    // Lower-quality evidence
    if (studyType === 'case_report') {
      return 'low';
    }
    
    return 'medium';
  }

  /**
   * Check if journal is high quality
   */
  isHighQualityJournal(journalName) {
    const lowerJournal = journalName.toLowerCase();
    
    for (const [quality, journals] of Object.entries(this.journalWeights)) {
      if (quality === 'high' && journals.some(j => lowerJournal.includes(j))) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Calculate confidence score for publication evidence
   */
  calculatePublicationConfidence(text, mechanism, studyType, pubData) {
    let confidence = 50;
    
    // Study type bonus
    if (studyType === 'RCT') confidence += 25;
    else if (studyType === 'pharmacokinetic') confidence += 20;
    else if (studyType === 'observational') confidence += 15;
    
    // Mechanism clarity bonus
    if (mechanism && !mechanism.includes('not specified')) confidence += 15;
    
    // Journal quality bonus
    if (this.isHighQualityJournal(pubData.journal)) confidence += 10;
    
    // Text quality indicators
    if (text.length > 200) confidence += 5;
    if (this.extractQuantitativeData(text)) confidence += 10;
    
    return Math.min(confidence, 100);
  }

  /**
   * Calculate text extraction confidence
   */
  calculateTextConfidence(text, mechanism, studyType) {
    let confidence = 60;
    
    if (mechanism && !mechanism.includes('not specified')) confidence += 15;
    if (studyType !== 'unknown') confidence += 10;
    if (text.length > 100) confidence += 10;
    if (this.extractEnzymePathways(text).length > 0) confidence += 5;
    
    return Math.min(confidence, 100);
  }

  /**
   * Check if string is likely a drug name
   */
  isLikelyDrugName(name) {
    if (name.length < 4 || name.length > 25) return false;
    if (/^\d+$/.test(name)) return false;
    
    const commonWords = ['study', 'patient', 'group', 'dose', 'treatment', 'therapy'];
    if (commonWords.includes(name.toLowerCase())) return false;
    
    return true;
  }

  /**
   * Helper functions for metadata extraction
   */
  extractAbstractText(abstract) {
    if (!abstract) return '';
    
    if (typeof abstract === 'string') return abstract;
    
    if (abstract.AbstractText) {
      if (Array.isArray(abstract.AbstractText)) {
        return abstract.AbstractText.map(text => typeof text === 'string' ? text : text._).join(' ');
      }
      return typeof abstract.AbstractText === 'string' ? abstract.AbstractText : abstract.AbstractText._;
    }
    
    return '';
  }

  extractAuthors(authorList) {
    if (!authorList?.Author) return [];
    
    const authors = Array.isArray(authorList.Author) ? authorList.Author : [authorList.Author];
    return authors.map(author => {
      const lastName = author.LastName || '';
      const firstName = author.ForeName || '';
      return `${firstName} ${lastName}`.trim();
    }).filter(Boolean);
  }

  extractPublicationDate(journalIssue) {
    if (!journalIssue?.PubDate) return '';
    
    const pubDate = journalIssue.PubDate;
    const year = pubDate.Year || '';
    const month = pubDate.Month || '';
    const day = pubDate.Day || '';
    
    return `${year}${month ? '-' + month : ''}${day ? '-' + day : ''}`;
  }

  extractMeshTerms(meshHeadingList) {
    if (!meshHeadingList?.MeshHeading) return [];
    
    const headings = Array.isArray(meshHeadingList.MeshHeading) 
      ? meshHeadingList.MeshHeading 
      : [meshHeadingList.MeshHeading];
    
    return headings.map(heading => heading.DescriptorName?._).filter(Boolean);
  }

  extractPMCID(articleIdList) {
    if (!articleIdList?.ArticleId) return null;
    
    const ids = Array.isArray(articleIdList.ArticleId) ? articleIdList.ArticleId : [articleIdList.ArticleId];
    const pmcId = ids.find(id => id.$.IdType === 'pmc');
    return pmcId ? pmcId._.replace('PMC', '') : null;
  }

  extractDOI(articleIdList) {
    if (!articleIdList?.ArticleId) return null;
    
    const ids = Array.isArray(articleIdList.ArticleId) ? articleIdList.ArticleId : [articleIdList.ArticleId];
    const doi = ids.find(id => id.$.IdType === 'doi');
    return doi ? doi._ : null;
  }

  extractPublicationType(publicationTypeList) {
    if (!publicationTypeList?.PublicationType) return [];
    
    const types = Array.isArray(publicationTypeList.PublicationType) 
      ? publicationTypeList.PublicationType 
      : [publicationTypeList.PublicationType];
    
    return types.map(type => typeof type === 'string' ? type : type._).filter(Boolean);
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
    const { batchSize = 2, delayBetweenBatches = 5000 } = options;
    const allEvidence = [];
    
    console.log(`Starting bulk publication DDI extraction for ${drugList.length} drugs`);
    
    for (let i = 0; i < drugList.length; i += batchSize) {
      const batch = drugList.slice(i, i + batchSize);
      console.log(`Processing publication batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(drugList.length/batchSize)}`);
      
      const batchPromises = batch.map(drug => 
        this.extractDDIForDrug(drug, options).catch(error => {
          console.error(`Failed to extract publication DDI for ${drug}:`, error.message);
          return [];
        })
      );
      
      const batchResults = await Promise.all(batchPromises);
      allEvidence.push(...batchResults.flat());
      
      // Delay between batches for NCBI rate limits
      if (i + batchSize < drugList.length) {
        await this.delay(delayBetweenBatches);
      }
    }
    
    console.log(`Publication extraction completed. Total evidence entries: ${allEvidence.length}`);
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

export default PublicationDDIExtractor;