/**
 * DrugInteractionEvidence Model
 * 
 * Represents a drug-drug interaction evidence entry extracted from various sources
 * Supports the comprehensive DDI extraction system for OncoSafeRx
 */

export class DrugInteractionEvidence {
  constructor(data = {}) {
    // Core identifiers
    this.id = data.id || null;
    this.extractionId = data.extractionId || null; // Batch extraction ID
    this.sourceType = data.sourceType || null; // 'clinical_trial', 'regulatory_label', 'publication'
    this.sourceId = data.sourceId || null; // NCT ID, FDA label ID, PMID, etc.
    
    // Drug pair information
    this.drug1 = {
      name: data.drug1?.name || null,
      rxcui: data.drug1?.rxcui || null,
      rxnorm_name: data.drug1?.rxnorm_name || null,
      generic_name: data.drug1?.generic_name || null,
      brand_names: data.drug1?.brand_names || [],
      therapeutic_class: data.drug1?.therapeutic_class || null,
      atc_code: data.drug1?.atc_code || null
    };
    
    this.drug2 = {
      name: data.drug2?.name || null,
      rxcui: data.drug2?.rxcui || null,
      rxnorm_name: data.drug2?.rxnorm_name || null,
      generic_name: data.drug2?.generic_name || null,
      brand_names: data.drug2?.brand_names || [],
      therapeutic_class: data.drug2?.therapeutic_class || null,
      atc_code: data.drug2?.atc_code || null
    };

    // Interaction details
    this.interaction = {
      type: data.interaction?.type || null, // 'pharmacokinetic', 'pharmacodynamic', 'mixed'
      mechanism: data.interaction?.mechanism || null,
      enzyme_pathway: data.interaction?.enzyme_pathway || null, // CYP3A4, CYP2D6, P-gp, etc.
      effect: data.interaction?.effect || null,
      severity: data.interaction?.severity || null, // 'contraindicated', 'major', 'moderate', 'minor'
      clinical_significance: data.interaction?.clinical_significance || null,
      management: data.interaction?.management || null,
      alternative_drugs: data.interaction?.alternative_drugs || []
    };

    // Evidence strength and confidence
    this.evidence = {
      level: data.evidence?.level || null, // 'high', 'medium', 'low'
      confidence: data.evidence?.confidence || null, // 0-100 scale
      study_type: data.evidence?.study_type || null, // 'RCT', 'observational', 'case_report', 'exclusion_criteria'
      evidence_context: data.evidence?.evidence_context || null, // 'dedicated_DDI_study', 'exclusion_criteria', 'adverse_event'
      population_size: data.evidence?.population_size || null,
      statistical_significance: data.evidence?.statistical_significance || null
    };

    // Source metadata
    this.source = {
      title: data.source?.title || null,
      authors: data.source?.authors || [],
      publication_date: data.source?.publication_date || null,
      journal: data.source?.journal || null,
      doi: data.source?.doi || null,
      url: data.source?.url || null,
      regulatory_agency: data.source?.regulatory_agency || null, // FDA, EMA, etc.
      section: data.source?.section || null, // Drug Interactions, Clinical Pharmacology, etc.
      raw_text: data.source?.raw_text || null
    };

    // Clinical trial specific fields
    this.clinical_trial = data.sourceType === 'clinical_trial' ? {
      nct_id: data.clinical_trial?.nct_id || null,
      phase: data.clinical_trial?.phase || null,
      title: data.clinical_trial?.title || null,
      study_type: data.clinical_trial?.study_type || null,
      status: data.clinical_trial?.status || null,
      condition: data.clinical_trial?.condition || null,
      intervention: data.clinical_trial?.intervention || null,
      eligibility_criteria: data.clinical_trial?.eligibility_criteria || null,
      exclusion_mention: data.clinical_trial?.exclusion_mention || null,
      concomitant_use_allowed: data.clinical_trial?.concomitant_use_allowed || null
    } : null;

    // Regulatory label specific fields
    this.regulatory_label = data.sourceType === 'regulatory_label' ? {
      label_id: data.regulatory_label?.label_id || null,
      product_name: data.regulatory_label?.product_name || null,
      manufacturer: data.regulatory_label?.manufacturer || null,
      approval_date: data.regulatory_label?.approval_date || null,
      label_section: data.regulatory_label?.label_section || null,
      contraindication: data.regulatory_label?.contraindication || false,
      warning_type: data.regulatory_label?.warning_type || null, // 'boxed_warning', 'warnings_precautions'
      dosing_adjustment: data.regulatory_label?.dosing_adjustment || null
    } : null;

    // Extracted pharmacokinetic parameters
    this.pharmacokinetics = data.pharmacokinetics ? {
      auc_change: data.pharmacokinetics.auc_change || null,
      cmax_change: data.pharmacokinetics.cmax_change || null,
      clearance_change: data.pharmacokinetics.clearance_change || null,
      half_life_change: data.pharmacokinetics.half_life_change || null,
      affected_parameter: data.pharmacokinetics.affected_parameter || null
    } : null;

    // Quality and processing metadata
    this.extraction_metadata = {
      extracted_at: data.extraction_metadata?.extracted_at || new Date(),
      extraction_method: data.extraction_metadata?.extraction_method || 'automated',
      text_extraction_confidence: data.extraction_metadata?.text_extraction_confidence || null,
      manual_review_needed: data.extraction_metadata?.manual_review_needed || false,
      validation_status: data.extraction_metadata?.validation_status || 'pending', // 'pending', 'validated', 'rejected'
      curator_notes: data.extraction_metadata?.curator_notes || null,
      data_version: data.extraction_metadata?.data_version || '1.0'
    };
  }

  // Convert to JSON for API responses
  toJSON() {
    return {
      id: this.id,
      extractionId: this.extractionId,
      sourceType: this.sourceType,
      sourceId: this.sourceId,
      drug1: this.drug1,
      drug2: this.drug2,
      interaction: this.interaction,
      evidence: this.evidence,
      source: this.source,
      clinical_trial: this.clinical_trial,
      regulatory_label: this.regulatory_label,
      pharmacokinetics: this.pharmacokinetics,
      extraction_metadata: this.extraction_metadata
    };
  }

  // Generate unique interaction key for deduplication
  getInteractionKey() {
    const drug1_key = this.drug1.rxcui || this.drug1.name?.toLowerCase() || '';
    const drug2_key = this.drug2.rxcui || this.drug2.name?.toLowerCase() || '';
    
    // Ensure consistent ordering for deduplication
    const [drugA, drugB] = [drug1_key, drug2_key].sort();
    return `${drugA}__${drugB}`;
  }

  // Validate required fields
  isValid() {
    return !!(
      this.sourceType &&
      this.sourceId &&
      (this.drug1.name || this.drug1.rxcui) &&
      (this.drug2.name || this.drug2.rxcui) &&
      this.interaction.mechanism &&
      this.evidence.level
    );
  }

  // Calculate evidence quality score (0-100)
  calculateEvidenceScore() {
    let score = 0;

    // Source type scoring
    switch (this.sourceType) {
      case 'regulatory_label':
        score += 40;
        break;
      case 'clinical_trial':
        score += 30;
        break;
      case 'publication':
        score += 25;
        break;
      default:
        score += 10;
    }

    // Evidence level scoring
    switch (this.evidence.level) {
      case 'high':
        score += 30;
        break;
      case 'medium':
        score += 20;
        break;
      case 'low':
        score += 10;
        break;
    }

    // Study type scoring
    switch (this.evidence.study_type) {
      case 'RCT':
        score += 20;
        break;
      case 'dedicated_DDI_study':
        score += 15;
        break;
      case 'observational':
        score += 10;
        break;
      case 'case_report':
        score += 5;
        break;
    }

    // Severity scoring
    switch (this.interaction.severity) {
      case 'contraindicated':
      case 'major':
        score += 10;
        break;
      case 'moderate':
        score += 5;
        break;
    }

    return Math.min(score, 100);
  }

  // Get standardized severity level
  getStandardizedSeverity() {
    const severity = (this.interaction.severity || '').toLowerCase();
    
    const severityMap = {
      'contraindicated': 'major',
      'high': 'major',
      'severe': 'major',
      'major': 'major',
      'moderate': 'moderate',
      'medium': 'moderate',
      'minor': 'minor',
      'low': 'minor',
      'mild': 'minor'
    };
    
    return severityMap[severity] || 'unknown';
  }

  // Check if this evidence conflicts with another
  conflictsWith(otherEvidence) {
    if (this.getInteractionKey() !== otherEvidence.getInteractionKey()) {
      return false;
    }

    const thisSeverity = this.getStandardizedSeverity();
    const otherSeverity = otherEvidence.getStandardizedSeverity();
    
    // Major conflicts with minor/unknown
    if ((thisSeverity === 'major' && otherSeverity === 'minor') ||
        (thisSeverity === 'minor' && otherSeverity === 'major')) {
      return true;
    }

    return false;
  }

  // Export to standardized format for database storage
  toDatabaseRecord() {
    return {
      source_type: this.sourceType,
      source_id: this.sourceId,
      drug1_rxcui: this.drug1.rxcui,
      drug1_name: this.drug1.name,
      drug2_rxcui: this.drug2.rxcui,
      drug2_name: this.drug2.name,
      mechanism: this.interaction.mechanism,
      enzyme_pathway: this.interaction.enzyme_pathway,
      effect: this.interaction.effect,
      severity: this.getStandardizedSeverity(),
      management: this.interaction.management,
      evidence_level: this.evidence.level,
      evidence_score: this.calculateEvidenceScore(),
      source_title: this.source.title,
      source_url: this.source.url,
      extraction_date: this.extraction_metadata.extracted_at,
      validation_status: this.extraction_metadata.validation_status,
      raw_data: JSON.stringify(this.toJSON())
    };
  }
}

export default DrugInteractionEvidence;