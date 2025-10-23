/**
 * Evidence Normalization Service
 * 
 * Normalizes and maps drug-drug interaction evidence from multiple sources
 * Handles deduplication, conflict resolution, and standardization
 * Part of the comprehensive DDI mining system for OncoSafeRx
 */

import { RxNormService } from './rxnormService.js';
import { DrugInteractionEvidence } from '../models/DrugInteractionEvidence.js';

export class EvidenceNormalizationService {
  constructor() {
    this.rxnormService = new RxNormService();
    
    // Standardized severity levels
    this.severityLevels = ['minor', 'moderate', 'major', 'contraindicated'];
    
    // Standardized enzyme/transporter names
    this.enzymeMapping = {
      'CYP3A4': ['CYP3A4', '3A4', 'cyp3a4', 'cytochrome P450 3A4'],
      'CYP2D6': ['CYP2D6', '2D6', 'cyp2d6', 'cytochrome P450 2D6'],
      'CYP2C9': ['CYP2C9', '2C9', 'cyp2c9', 'cytochrome P450 2C9'],
      'CYP2C19': ['CYP2C19', '2C19', 'cyp2c19', 'cytochrome P450 2C19'],
      'CYP1A2': ['CYP1A2', '1A2', 'cyp1a2', 'cytochrome P450 1A2'],
      'P-gp': ['P-glycoprotein', 'P-gp', 'Pgp', 'MDR1', 'ABCB1'],
      'OATP1B1': ['OATP1B1', 'SLCO1B1'],
      'OATP1B3': ['OATP1B3', 'SLCO1B3'],
      'UGT1A1': ['UGT1A1', 'UDP-glucuronosyltransferase 1A1'],
      'BCRP': ['BCRP', 'ABCG2', 'breast cancer resistance protein']
    };
    
    // Interaction mechanism standardization
    this.mechanismMapping = {
      'enzyme_inhibition': [
        'enzyme inhibition', 'metabolic inhibition', 'inhibits metabolism',
        'CYP inhibition', 'cytochrome inhibition'
      ],
      'enzyme_induction': [
        'enzyme induction', 'metabolic induction', 'induces metabolism',
        'CYP induction', 'cytochrome induction'
      ],
      'transporter_inhibition': [
        'transporter inhibition', 'P-gp inhibition', 'OATP inhibition',
        'efflux inhibition', 'uptake inhibition'
      ],
      'protein_binding_displacement': [
        'protein binding displacement', 'protein displacement',
        'albumin binding', 'plasma protein binding'
      ],
      'absorption_interference': [
        'absorption interference', 'altered absorption', 'chelation',
        'gastric pH alteration'
      ],
      'renal_clearance_alteration': [
        'renal clearance', 'renal elimination', 'kidney clearance',
        'tubular secretion', 'glomerular filtration'
      ],
      'pharmacodynamic_interaction': [
        'pharmacodynamic', 'additive effects', 'synergistic effects',
        'antagonistic effects', 'receptor interaction'
      ]
    };
    
    // Evidence quality scoring weights
    this.evidenceWeights = {
      sourceType: {
        'regulatory_label': 0.4,
        'clinical_trial': 0.3,
        'publication': 0.3
      },
      evidenceLevel: {
        'high': 0.4,
        'medium': 0.25,
        'low': 0.1
      },
      studyType: {
        'RCT': 0.3,
        'dedicated_DDI_study': 0.25,
        'pharmacokinetic': 0.25,
        'observational': 0.15,
        'case_report': 0.05,
        'exclusion_criteria': 0.1
      }
    };
    
    // Conflict resolution rules
    this.conflictResolutionRules = {
      severityConflict: 'highest', // Take highest severity when conflicting
      mechanismConflict: 'merge', // Merge mechanisms when different
      effectConflict: 'most_specific' // Take most specific effect description
    };
  }

  /**
   * Normalize and consolidate evidence from multiple sources
   */
  async normalizeEvidence(evidenceList) {
    console.log(`Normalizing ${evidenceList.length} evidence entries`);
    
    try {
      // Step 1: Standardize individual evidence entries
      const standardizedEvidence = await this.standardizeEvidenceEntries(evidenceList);
      
      // Step 2: Map drugs to standardized RXCUIs
      const mappedEvidence = await this.mapDrugsToRxcui(standardizedEvidence);
      
      // Step 3: Group evidence by drug pairs
      const groupedEvidence = this.groupEvidenceByDrugPair(mappedEvidence);
      
      // Step 4: Resolve conflicts and merge evidence
      const mergedEvidence = await this.mergeConflictingEvidence(groupedEvidence);
      
      // Step 5: Calculate composite evidence scores
      const scoredEvidence = this.calculateEvidenceScores(mergedEvidence);
      
      // Step 6: Apply quality filters
      const filteredEvidence = this.applyQualityFilters(scoredEvidence);
      
      console.log(`Normalized to ${filteredEvidence.length} unique interactions`);
      return filteredEvidence;
      
    } catch (error) {
      console.error('Error normalizing evidence:', error);
      throw error;
    }
  }

  /**
   * Standardize individual evidence entries
   */
  async standardizeEvidenceEntries(evidenceList) {
    const standardized = [];
    
    for (const evidence of evidenceList) {
      try {
        const standardizedEntry = await this.standardizeSingleEntry(evidence);
        if (standardizedEntry) {
          standardized.push(standardizedEntry);
        }
      } catch (error) {
        console.warn('Error standardizing evidence entry:', error);
        continue;
      }
    }
    
    return standardized;
  }

  /**
   * Standardize a single evidence entry
   */
  async standardizeSingleEntry(evidence) {
    // Create a copy to avoid modifying original
    const standardized = new DrugInteractionEvidence(evidence.toJSON ? evidence.toJSON() : evidence);
    
    // Standardize severity
    standardized.interaction.severity = this.standardizeSeverity(standardized.interaction.severity);
    
    // Standardize mechanism
    standardized.interaction.mechanism = this.standardizeMechanism(standardized.interaction.mechanism);
    
    // Standardize enzyme pathways
    standardized.interaction.enzyme_pathway = this.standardizeEnzymePathways(standardized.interaction.enzyme_pathway);
    
    // Standardize drug names
    standardized.drug1.name = this.standardizeDrugName(standardized.drug1.name);
    standardized.drug2.name = this.standardizeDrugName(standardized.drug2.name);
    
    // Validate entry
    if (!standardized.isValid()) {
      console.warn('Invalid evidence entry after standardization');
      return null;
    }
    
    return standardized;
  }

  /**
   * Standardize severity levels
   */
  standardizeSeverity(severity) {
    if (!severity) return 'moderate';
    
    const lowerSeverity = severity.toLowerCase().trim();
    
    const severityMap = {
      'contraindicated': 'contraindicated',
      'avoid': 'contraindicated',
      'major': 'major',
      'high': 'major',
      'severe': 'major',
      'significant': 'major',
      'moderate': 'moderate',
      'medium': 'moderate',
      'caution': 'moderate',
      'monitor': 'moderate',
      'minor': 'minor',
      'low': 'minor',
      'mild': 'minor',
      'minimal': 'minor'
    };
    
    return severityMap[lowerSeverity] || 'moderate';
  }

  /**
   * Standardize interaction mechanism
   */
  standardizeMechanism(mechanism) {
    if (!mechanism) return 'unknown';
    
    const lowerMechanism = mechanism.toLowerCase();
    
    for (const [standardMech, variants] of Object.entries(this.mechanismMapping)) {
      if (variants.some(variant => lowerMechanism.includes(variant.toLowerCase()))) {
        return standardMech.replace('_', ' ');
      }
    }
    
    return mechanism; // Return original if no mapping found
  }

  /**
   * Standardize enzyme pathway names
   */
  standardizeEnzymePathways(pathways) {
    if (!pathways) return '';
    
    const standardizedEnzymes = [];
    const pathwayList = pathways.split(/[,;]/);
    
    for (const pathway of pathwayList) {
      const trimmedPathway = pathway.trim();
      if (!trimmedPathway) continue;
      
      let standardized = false;
      for (const [standardEnzyme, variants] of Object.entries(this.enzymeMapping)) {
        if (variants.some(variant => 
          trimmedPathway.toLowerCase().includes(variant.toLowerCase())
        )) {
          standardizedEnzymes.push(standardEnzyme);
          standardized = true;
          break;
        }
      }
      
      if (!standardized) {
        standardizedEnzymes.push(trimmedPathway);
      }
    }
    
    return [...new Set(standardizedEnzymes)].join(', ');
  }

  /**
   * Standardize drug names
   */
  standardizeDrugName(drugName) {
    if (!drugName) return '';
    
    // Remove extra whitespace and normalize case
    let standardized = drugName.trim().toLowerCase();
    
    // Remove common suffixes that don't affect the core drug name
    standardized = standardized.replace(/\s+(tablet|capsule|injection|oral|iv)s?$/, '');
    
    // Handle common abbreviations
    const abbreviationMap = {
      '5-fu': '5-fluorouracil',
      'ctx': 'cyclophosphamide',
      'mtx': 'methotrexate',
      'cddp': 'cisplatin'
    };
    
    return abbreviationMap[standardized] || standardized;
  }

  /**
   * Map drugs to standardized RXCUIs
   */
  async mapDrugsToRxcui(evidenceList) {
    const mapped = [];
    const rxcuiCache = new Map();
    
    for (const evidence of evidenceList) {
      try {
        // Map drug1 RXCUI
        if (!evidence.drug1.rxcui) {
          const rxcui1 = await this.getCachedRxcui(evidence.drug1.name, rxcuiCache);
          evidence.drug1.rxcui = rxcui1;
        }
        
        // Map drug2 RXCUI
        if (!evidence.drug2.rxcui) {
          const rxcui2 = await this.getCachedRxcui(evidence.drug2.name, rxcuiCache);
          evidence.drug2.rxcui = rxcui2;
        }
        
        // Only include evidence with valid RXCUIs
        if (evidence.drug1.rxcui && evidence.drug2.rxcui) {
          mapped.push(evidence);
        } else {
          console.warn(`Could not map RXCUIs for ${evidence.drug1.name} - ${evidence.drug2.name}`);
        }
        
      } catch (error) {
        console.warn('Error mapping RXCUIs:', error);
        continue;
      }
    }
    
    return mapped;
  }

  /**
   * Get RXCUI with caching
   */
  async getCachedRxcui(drugName, cache) {
    if (cache.has(drugName)) {
      return cache.get(drugName);
    }
    
    try {
      const results = await this.rxnormService.searchDrugs(drugName);
      if (results && results.length > 0) {
        // Prefer ingredients (IN) over other term types
        const ingredient = results.find(r => r.tty === 'IN');
        const rxcui = ingredient ? ingredient.rxcui : results[0].rxcui;
        cache.set(drugName, rxcui);
        return rxcui;
      }
    } catch (error) {
      console.warn(`Failed to resolve RXCUI for ${drugName}:`, error.message);
    }
    
    cache.set(drugName, null);
    return null;
  }

  /**
   * Group evidence by drug pairs
   */
  groupEvidenceByDrugPair(evidenceList) {
    const groups = new Map();
    
    for (const evidence of evidenceList) {
      const pairKey = this.generateDrugPairKey(evidence.drug1.rxcui, evidence.drug2.rxcui);
      
      if (!groups.has(pairKey)) {
        groups.set(pairKey, []);
      }
      
      groups.get(pairKey).push(evidence);
    }
    
    return groups;
  }

  /**
   * Generate consistent drug pair key for grouping
   */
  generateDrugPairKey(rxcui1, rxcui2) {
    // Ensure consistent ordering for deduplication
    const [drugA, drugB] = [rxcui1, rxcui2].sort();
    return `${drugA}__${drugB}`;
  }

  /**
   * Merge conflicting evidence for the same drug pair
   */
  async mergeConflictingEvidence(groupedEvidence) {
    const mergedEvidence = [];
    
    for (const [pairKey, evidenceGroup] of groupedEvidence) {
      try {
        const mergedEntry = await this.mergeSingleDrugPairEvidence(evidenceGroup);
        if (mergedEntry) {
          mergedEvidence.push(mergedEntry);
        }
      } catch (error) {
        console.warn(`Error merging evidence for pair ${pairKey}:`, error);
        continue;
      }
    }
    
    return mergedEvidence;
  }

  /**
   * Merge evidence for a single drug pair
   */
  async mergeSingleDrugPairEvidence(evidenceGroup) {
    if (evidenceGroup.length === 0) return null;
    if (evidenceGroup.length === 1) return evidenceGroup[0];
    
    // Sort by evidence quality (highest first)
    const sortedEvidence = evidenceGroup.sort((a, b) => 
      this.calculateEvidenceQuality(b) - this.calculateEvidenceQuality(a)
    );
    
    // Use highest quality evidence as base
    const baseEvidence = new DrugInteractionEvidence(sortedEvidence[0].toJSON());
    
    // Merge information from other sources
    for (let i = 1; i < sortedEvidence.length; i++) {
      const additionalEvidence = sortedEvidence[i];
      this.mergeEvidenceFields(baseEvidence, additionalEvidence);
    }
    
    // Add source aggregation metadata
    baseEvidence.source.sources_count = evidenceGroup.length;
    baseEvidence.source.source_types = [...new Set(evidenceGroup.map(e => e.sourceType))];
    baseEvidence.extraction_metadata.merged_sources = evidenceGroup.map(e => e.sourceId);
    
    return baseEvidence;
  }

  /**
   * Merge fields from additional evidence into base evidence
   */
  mergeEvidenceFields(baseEvidence, additionalEvidence) {
    // Merge severity (take highest)
    const baseSeverityIndex = this.severityLevels.indexOf(baseEvidence.interaction.severity);
    const additionalSeverityIndex = this.severityLevels.indexOf(additionalEvidence.interaction.severity);
    
    if (additionalSeverityIndex > baseSeverityIndex) {
      baseEvidence.interaction.severity = additionalEvidence.interaction.severity;
    }
    
    // Merge mechanisms
    if (additionalEvidence.interaction.mechanism && 
        additionalEvidence.interaction.mechanism !== baseEvidence.interaction.mechanism) {
      const mechanisms = new Set([
        baseEvidence.interaction.mechanism,
        additionalEvidence.interaction.mechanism
      ]);
      baseEvidence.interaction.mechanism = Array.from(mechanisms).join('; ');
    }
    
    // Merge enzyme pathways
    if (additionalEvidence.interaction.enzyme_pathway) {
      const baseEnzymes = new Set(baseEvidence.interaction.enzyme_pathway.split(', ').filter(Boolean));
      const additionalEnzymes = new Set(additionalEvidence.interaction.enzyme_pathway.split(', ').filter(Boolean));
      const allEnzymes = new Set([...baseEnzymes, ...additionalEnzymes]);
      baseEvidence.interaction.enzyme_pathway = Array.from(allEnzymes).join(', ');
    }
    
    // Merge effects
    if (additionalEvidence.interaction.effect && 
        additionalEvidence.interaction.effect !== baseEvidence.interaction.effect) {
      const effects = new Set([
        baseEvidence.interaction.effect,
        additionalEvidence.interaction.effect
      ]);
      baseEvidence.interaction.effect = Array.from(effects).join('; ');
    }
    
    // Update evidence level if higher quality
    const evidenceLevels = ['low', 'medium', 'high'];
    const baseLevel = evidenceLevels.indexOf(baseEvidence.evidence.level);
    const additionalLevel = evidenceLevels.indexOf(additionalEvidence.evidence.level);
    
    if (additionalLevel > baseLevel) {
      baseEvidence.evidence.level = additionalEvidence.evidence.level;
    }
    
    // Merge pharmacokinetic data
    if (additionalEvidence.pharmacokinetics && !baseEvidence.pharmacokinetics) {
      baseEvidence.pharmacokinetics = additionalEvidence.pharmacokinetics;
    }
  }

  /**
   * Calculate evidence quality score for sorting
   */
  calculateEvidenceQuality(evidence) {
    let score = 0;
    
    // Source type weight
    const sourceWeight = this.evidenceWeights.sourceType[evidence.sourceType] || 0.1;
    score += sourceWeight * 30;
    
    // Evidence level weight
    const evidenceWeight = this.evidenceWeights.evidenceLevel[evidence.evidence.level] || 0.1;
    score += evidenceWeight * 30;
    
    // Study type weight
    const studyWeight = this.evidenceWeights.studyType[evidence.evidence.study_type] || 0.1;
    score += studyWeight * 20;
    
    // Severity bonus (higher severity = higher importance)
    const severityIndex = this.severityLevels.indexOf(evidence.interaction.severity);
    score += severityIndex * 5;
    
    // Mechanism clarity bonus
    if (evidence.interaction.mechanism && !evidence.interaction.mechanism.includes('unknown')) {
      score += 10;
    }
    
    // Enzyme pathway bonus
    if (evidence.interaction.enzyme_pathway && evidence.interaction.enzyme_pathway.length > 0) {
      score += 5;
    }
    
    return score;
  }

  /**
   * Calculate composite evidence scores
   */
  calculateEvidenceScores(evidenceList) {
    return evidenceList.map(evidence => {
      const qualityScore = this.calculateEvidenceQuality(evidence);
      const confidenceScore = evidence.extraction_metadata?.text_extraction_confidence || 50;
      
      // Composite score (weighted average)
      const compositeScore = Math.round(qualityScore * 0.7 + confidenceScore * 0.3);
      
      // Update evidence object
      evidence.evidence.quality_score = qualityScore;
      evidence.evidence.composite_score = compositeScore;
      evidence.evidence.confidence = Math.round((qualityScore + confidenceScore) / 2);
      
      return evidence;
    });
  }

  /**
   * Apply quality filters to remove low-confidence evidence
   */
  applyQualityFilters(evidenceList, options = {}) {
    const {
      minCompositeScore = 30,
      minConfidence = 40,
      requireMechanism = false,
      requireEnzyme = false
    } = options;
    
    return evidenceList.filter(evidence => {
      // Minimum composite score
      if (evidence.evidence.composite_score < minCompositeScore) {
        return false;
      }
      
      // Minimum confidence
      if (evidence.evidence.confidence < minConfidence) {
        return false;
      }
      
      // Require mechanism if specified
      if (requireMechanism && 
          (!evidence.interaction.mechanism || evidence.interaction.mechanism.includes('unknown'))) {
        return false;
      }
      
      // Require enzyme pathway if specified
      if (requireEnzyme && 
          (!evidence.interaction.enzyme_pathway || evidence.interaction.enzyme_pathway.length === 0)) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Deduplicate evidence entries
   */
  deduplicateEvidence(evidenceList) {
    const seen = new Set();
    const deduplicated = [];
    
    for (const evidence of evidenceList) {
      const key = this.generateDeduplicationKey(evidence);
      
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(evidence);
      }
    }
    
    return deduplicated;
  }

  /**
   * Generate deduplication key
   */
  generateDeduplicationKey(evidence) {
    return [
      evidence.drug1.rxcui || evidence.drug1.name,
      evidence.drug2.rxcui || evidence.drug2.name,
      evidence.interaction.mechanism,
      evidence.sourceType
    ].join('|');
  }

  /**
   * Validate normalized evidence
   */
  validateNormalizedEvidence(evidenceList) {
    const validation = {
      valid: [],
      invalid: [],
      warnings: []
    };
    
    for (const evidence of evidenceList) {
      try {
        if (this.validateSingleEvidence(evidence)) {
          validation.valid.push(evidence);
        } else {
          validation.invalid.push(evidence);
        }
      } catch (error) {
        validation.invalid.push(evidence);
        validation.warnings.push(`Validation error: ${error.message}`);
      }
    }
    
    return validation;
  }

  /**
   * Validate single evidence entry
   */
  validateSingleEvidence(evidence) {
    // Check required fields
    if (!evidence.drug1?.rxcui || !evidence.drug2?.rxcui) {
      return false;
    }
    
    if (!evidence.interaction?.mechanism || !evidence.interaction?.severity) {
      return false;
    }
    
    if (!evidence.sourceType || !evidence.sourceId) {
      return false;
    }
    
    // Check severity is valid
    if (!this.severityLevels.includes(evidence.interaction.severity)) {
      return false;
    }
    
    // Check evidence level is valid
    const validEvidenceLevels = ['low', 'medium', 'high'];
    if (!validEvidenceLevels.includes(evidence.evidence?.level)) {
      return false;
    }
    
    return true;
  }

  /**
   * Generate normalization report
   */
  generateNormalizationReport(originalCount, normalizedEvidence) {
    const sourceTypes = {};
    const severityCounts = {};
    const evidenceLevels = {};
    const mechanismTypes = {};
    
    for (const evidence of normalizedEvidence) {
      // Count by source type
      sourceTypes[evidence.sourceType] = (sourceTypes[evidence.sourceType] || 0) + 1;
      
      // Count by severity
      severityCounts[evidence.interaction.severity] = (severityCounts[evidence.interaction.severity] || 0) + 1;
      
      // Count by evidence level
      evidenceLevels[evidence.evidence.level] = (evidenceLevels[evidence.evidence.level] || 0) + 1;
      
      // Count by mechanism type
      const mechanism = evidence.interaction.mechanism?.split(';')[0]?.trim() || 'unknown';
      mechanismTypes[mechanism] = (mechanismTypes[mechanism] || 0) + 1;
    }
    
    return {
      summary: {
        originalCount,
        normalizedCount: normalizedEvidence.length,
        reductionPercentage: Math.round((1 - normalizedEvidence.length / originalCount) * 100)
      },
      distributions: {
        sourceTypes,
        severityCounts,
        evidenceLevels,
        mechanismTypes
      },
      qualityMetrics: {
        averageCompositeScore: Math.round(
          normalizedEvidence.reduce((sum, e) => sum + (e.evidence.composite_score || 0), 0) / 
          normalizedEvidence.length
        ),
        highQualityCount: normalizedEvidence.filter(e => (e.evidence.composite_score || 0) >= 70).length,
        mechanismKnownCount: normalizedEvidence.filter(e => 
          e.interaction.mechanism && !e.interaction.mechanism.includes('unknown')
        ).length
      }
    };
  }

  /**
   * Export normalized evidence to database format
   */
  exportToDatabaseFormat(evidenceList) {
    return evidenceList.map(evidence => evidence.toDatabaseRecord());
  }

  /**
   * Clear caches
   */
  clearCaches() {
    // This service doesn't maintain persistent caches, but could clear RxNorm cache if needed
    console.log('Evidence normalization caches cleared');
  }
}

export default EvidenceNormalizationService;