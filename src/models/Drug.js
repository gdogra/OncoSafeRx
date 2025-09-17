// Drug data model for standardized drug information
export class Drug {
  constructor({
    rxcui,           // RxNorm Concept Unique Identifier
    name,            // Drug name
    genericName,     // Generic name
    brandNames = [], // Array of brand names
    activeIngredients = [],
    dosageForms = [],
    strengths = [],
    fdaApplicationNumber,
    ndc,             // National Drug Code
    therapeuticClass,
    indication,
    contraindications = [],
    warnings = [],
    adverseReactions = [],
    dosing,
    metabolism = {}, // CYP enzymes, pathways
    lastUpdated
  }) {
    this.rxcui = rxcui;
    this.name = name;
    this.genericName = genericName;
    this.brandNames = brandNames;
    this.activeIngredients = activeIngredients;
    this.dosageForms = dosageForms;
    this.strengths = strengths;
    this.fdaApplicationNumber = fdaApplicationNumber;
    this.ndc = ndc;
    this.therapeuticClass = therapeuticClass;
    this.indication = indication;
    this.contraindications = contraindications;
    this.warnings = warnings;
    this.adverseReactions = adverseReactions;
    this.dosing = dosing;
    this.metabolism = metabolism;
    this.lastUpdated = lastUpdated || new Date();
  }

  // Validation method
  isValid() {
    return this.rxcui && this.name && this.genericName;
  }

  // Convert to JSON for API responses
  toJSON() {
    return {
      rxcui: this.rxcui,
      name: this.name,
      genericName: this.genericName,
      brandNames: this.brandNames,
      activeIngredients: this.activeIngredients,
      dosageForms: this.dosageForms,
      strengths: this.strengths,
      fdaApplicationNumber: this.fdaApplicationNumber,
      ndc: this.ndc,
      therapeuticClass: this.therapeuticClass,
      indication: this.indication,
      contraindications: this.contraindications,
      warnings: this.warnings,
      adverseReactions: this.adverseReactions,
      dosing: this.dosing,
      metabolism: this.metabolism,
      lastUpdated: this.lastUpdated
    };
  }
}