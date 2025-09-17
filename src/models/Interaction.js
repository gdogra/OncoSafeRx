// Drug interaction data model
export class DrugInteraction {
  constructor({
    id,
    drug1,          // Drug object or RXCUI
    drug2,          // Drug object or RXCUI
    severity,       // 'major', 'moderate', 'minor'
    mechanism,      // How the interaction occurs
    effect,         // Clinical effect of interaction
    management,     // Clinical management recommendations
    evidence,       // Evidence level (A, B, C, D)
    sources = [],   // Data sources
    lastUpdated
  }) {
    this.id = id;
    this.drug1 = drug1;
    this.drug2 = drug2;
    this.severity = severity;
    this.mechanism = mechanism;
    this.effect = effect;
    this.management = management;
    this.evidence = evidence;
    this.sources = sources;
    this.lastUpdated = lastUpdated || new Date();
  }

  isValid() {
    return this.drug1 && this.drug2 && this.severity && this.effect;
  }

  toJSON() {
    return {
      id: this.id,
      drug1: this.drug1,
      drug2: this.drug2,
      severity: this.severity,
      mechanism: this.mechanism,
      effect: this.effect,
      management: this.management,
      evidence: this.evidence,
      sources: this.sources,
      lastUpdated: this.lastUpdated
    };
  }
}

// Gene-drug interaction model
export class GeneDrugInteraction {
  constructor({
    id,
    gene,           // Gene symbol (e.g., 'CYP2D6')
    drug,           // Drug object or RXCUI
    phenotype,      // Metabolizer status
    recommendation, // CPIC recommendation
    evidenceLevel,  // CPIC evidence level
    implications,   // Clinical implications
    dosageAdjustment,
    sources = [],
    lastUpdated
  }) {
    this.id = id;
    this.gene = gene;
    this.drug = drug;
    this.phenotype = phenotype;
    this.recommendation = recommendation;
    this.evidenceLevel = evidenceLevel;
    this.implications = implications;
    this.dosageAdjustment = dosageAdjustment;
    this.sources = sources;
    this.lastUpdated = lastUpdated || new Date();
  }

  isValid() {
    return this.gene && this.drug && this.recommendation;
  }

  toJSON() {
    return {
      id: this.id,
      gene: this.gene,
      drug: this.drug,
      phenotype: this.phenotype,
      recommendation: this.recommendation,
      evidenceLevel: this.evidenceLevel,
      implications: this.implications,
      dosageAdjustment: this.dosageAdjustment,
      sources: this.sources,
      lastUpdated: this.lastUpdated
    };
  }
}