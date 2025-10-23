# OncoSafeRx DDI Mining System

A comprehensive biomedical data mining agent that extracts drug-drug interactions (DDIs) involving oncology drugs from multiple public data sources including clinical trial registries, regulatory filings, and scientific publications.

## Overview

The DDI Mining System automatically discovers and extracts evidence of drug-drug interactions by analyzing:

1. **ClinicalTrials.gov** - Eligibility criteria, exclusion rules, and intervention descriptions
2. **FDA Drug Labels** - OpenFDA and DailyMed prescribing information
3. **PubMed Publications** - Abstracts and full-text articles with DDI evidence

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DDI Mining Orchestrator                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ ClinicalTrials  │ │   Regulatory    │ │   Publication   │   │
│  │   Extractor     │ │     Label       │ │   Extractor     │   │
│  │                 │ │   Extractor     │ │                 │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                Evidence Normalization Service                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │  RxNorm Drug    │ │   Severity &    │ │   Conflict      │   │
│  │    Mapping      │ │   Mechanism     │ │  Resolution     │   │
│  │                 │ │ Standardization │ │                 │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Data Models

#### DrugInteractionEvidence
Core evidence model capturing:
- Drug pair information (names, RXCUIs, therapeutic classes)
- Interaction details (mechanism, severity, enzyme pathways)
- Evidence metadata (confidence, study type, source quality)
- Source-specific fields (clinical trial, regulatory label, publication)

### 2. Extraction Modules

#### ClinicalTrialsDDIExtractor
- Searches ClinicalTrials.gov for oncology drug studies
- Extracts DDI evidence from eligibility criteria and intervention descriptions
- Identifies contraindicated combinations and excluded medications
- Maps enzyme/transporter-based exclusions

#### RegulatoryLabelExtractor
- Queries OpenFDA and DailyMed for drug labels
- Parses "Drug Interactions" and "Contraindications" sections
- Extracts pharmacokinetic interaction data
- Identifies boxed warnings and precautions

#### PublicationDDIExtractor
- Searches PubMed for DDI-related publications
- Extracts quantitative pharmacokinetic data (AUC, Cmax changes)
- Processes both abstracts and full-text PMC articles
- Classifies study types and evidence quality

### 3. Evidence Normalization

#### EvidenceNormalizationService
- Maps drug names to standardized RxNorm identifiers
- Standardizes severity levels (minor/moderate/major/contraindicated)
- Normalizes enzyme/transporter nomenclature (CYP3A4, P-gp, etc.)
- Resolves conflicts between different evidence sources
- Calculates composite evidence quality scores

### 4. Orchestration

#### DDIMiningOrchestrator
- Coordinates all extraction modules
- Manages batch processing and rate limiting
- Provides progress tracking and error handling
- Generates comprehensive extraction reports
- Handles data persistence to database

## Installation

1. **Install Dependencies**
```bash
npm install axios xml2js
```

2. **Set Environment Variables**
```bash
# Optional: NCBI API key for higher rate limits
export NCBI_API_KEY="your_ncbi_api_key"

# Optional: Admin token for curated interaction management
export ADMIN_API_TOKEN="your_admin_token"
```

3. **Database Setup**
Create the evidence storage table:
```sql
CREATE TABLE drug_interaction_evidence (
  id SERIAL PRIMARY KEY,
  source_type VARCHAR(50) NOT NULL,
  source_id VARCHAR(100) NOT NULL,
  drug1_rxcui VARCHAR(20),
  drug1_name VARCHAR(255) NOT NULL,
  drug2_rxcui VARCHAR(20),
  drug2_name VARCHAR(255) NOT NULL,
  mechanism TEXT,
  enzyme_pathway VARCHAR(500),
  effect TEXT,
  severity VARCHAR(20),
  management TEXT,
  evidence_level VARCHAR(20),
  evidence_score INTEGER,
  source_title TEXT,
  source_url TEXT,
  extraction_date TIMESTAMP DEFAULT NOW(),
  validation_status VARCHAR(20) DEFAULT 'pending',
  raw_data JSONB
);
```

## Usage

### API Endpoints

#### Start Mining for Single Drug
```bash
POST /api/ddi-mining/mine-drug
{
  "drugName": "doxorubicin",
  "options": {
    "maxClinicalTrialsPerDrug": 50,
    "maxPublicationsPerDrug": 100,
    "enableNormalization": true
  }
}
```

#### Mine All Oncology Drugs
```bash
POST /api/ddi-mining/mine-all-oncology
{
  "options": {
    "batchSize": 5,
    "delayBetweenBatches": 2000,
    "minEvidenceScore": 30
  }
}
```

#### Monitor Progress
```bash
GET /api/ddi-mining/status
```

#### Export Results
```bash
GET /api/ddi-mining/results?format=csv&limit=1000
```

### Programmatic Usage

```javascript
import DDIMiningOrchestrator from './src/services/ddiMiningOrchestrator.js';

const orchestrator = new DDIMiningOrchestrator();
await orchestrator.initialize();

// Mine DDI evidence for specific drugs
const results = await orchestrator.mineDDIForMultipleDrugs([
  'doxorubicin', 'cisplatin', 'methotrexate'
], {
  enableClinicalTrials: true,
  enableRegulatoryLabels: true,
  enablePublications: true,
  minEvidenceScore: 40
});

console.log(`Found ${results.normalizedEvidence.length} high-quality interactions`);
```

### Testing

Run the comprehensive test suite:
```bash
node src/scripts/testDDIMining.js
```

The test suite validates:
- All extraction modules
- Evidence normalization
- Data model integrity
- API rate limiting
- Error handling

## Output Schema

### Standardized Evidence Format

```json
{
  "sourceType": "clinical_trial",
  "sourceId": "NCT04123456",
  "drug1": {
    "name": "doxorubicin",
    "rxcui": "3639",
    "rxnorm_name": "doxorubicin"
  },
  "drug2": {
    "name": "trastuzumab",
    "rxcui": "224905",
    "rxnorm_name": "trastuzumab"
  },
  "interaction": {
    "type": "pharmacodynamic",
    "mechanism": "additive cardiotoxicity",
    "enzyme_pathway": "",
    "effect": "increased risk of heart failure",
    "severity": "major",
    "management": "monitor cardiac function closely"
  },
  "evidence": {
    "level": "medium",
    "confidence": 75,
    "study_type": "exclusion_criteria",
    "evidence_context": "eligibility_criteria"
  },
  "source": {
    "title": "Phase II Study of Doxorubicin Plus Trastuzumab",
    "url": "https://clinicaltrials.gov/study/NCT04123456"
  },
  "clinical_trial": {
    "nct_id": "NCT04123456",
    "phase": "Phase 2",
    "exclusion_mention": true,
    "concomitant_use_allowed": false
  }
}
```

### Evidence Quality Scoring

Evidence entries receive composite scores (0-100) based on:

- **Source Type** (40%): Regulatory labels > Clinical trials > Publications
- **Evidence Level** (30%): High > Medium > Low  
- **Study Type** (20%): RCT > Dedicated DDI study > Observational > Case report
- **Mechanism Clarity** (10%): Specific mechanism > Unclear mechanism

### Severity Classification

| Level | Description | Examples |
|-------|-------------|----------|
| **Contraindicated** | Combination prohibited | Avoid concurrent use |
| **Major** | Significant clinical impact | Monitor closely, dose adjustment |
| **Moderate** | Moderate clinical impact | Consider alternatives |
| **Minor** | Limited clinical impact | Monitor if necessary |

## Configuration

### Rate Limiting
- **ClinicalTrials.gov**: 3 requests/second (no API key required)
- **OpenFDA**: 1000 requests/hour (no API key required)  
- **NCBI E-utilities**: 3 requests/second (10/second with API key)

### Quality Filters
```javascript
{
  minEvidenceScore: 30,      // Minimum composite score
  minConfidence: 40,         // Minimum extraction confidence  
  requireMechanism: false,   // Require known mechanism
  requireEnzyme: false       // Require enzyme pathway data
}
```

### Extraction Limits
```javascript
{
  maxClinicalTrialsPerDrug: 50,
  maxPublicationsPerDrug: 100,
  maxRegulatoryLabelsPerDrug: 20,
  publicationYearRange: 10
}
```

## Performance

### Typical Extraction Rates
- **Clinical Trials**: ~2-3 trials/second per drug
- **Regulatory Labels**: ~1-2 labels/second per drug
- **Publications**: ~1-2 publications/second per drug

### Expected Yields (per drug)
- **High-profile oncology drugs**: 10-50 evidence entries
- **Newer targeted therapies**: 5-20 evidence entries  
- **Rare/orphan drugs**: 1-10 evidence entries

### Processing Time Estimates
- **Single drug**: 30-120 seconds
- **10 drugs**: 5-15 minutes
- **100 oncology drugs**: 2-6 hours

## Error Handling

The system includes robust error handling for:
- API rate limiting and timeouts
- Network connectivity issues
- Malformed data responses
- Invalid drug name resolution
- Database connection failures

Failed extractions are logged with detailed error messages and do not prevent processing of other drugs.

## Data Quality

### Validation Rules
- All evidence entries must have valid drug RXCUIs
- Severity levels must be standardized
- Source URLs must be accessible
- Interaction mechanisms must be non-empty

### Confidence Scoring
Text extraction confidence based on:
- Presence of specific DDI keywords
- Enzyme/transporter mentions
- Quantitative pharmacokinetic data
- Study type and methodology

### Conflict Resolution
When multiple sources provide conflicting evidence:
- **Severity**: Take highest severity level
- **Mechanism**: Merge all mechanisms  
- **Effect**: Use most specific description
- **Quality**: Weight by evidence score

## Integration

### Database Schema
Compatible with existing OncoSafeRx drug interaction tables. Evidence can be:
- Stored in dedicated `drug_interaction_evidence` table
- Merged with existing `drug_interactions` table
- Exported to external systems via API

### API Integration
RESTful endpoints compatible with existing OncoSafeRx architecture:
- Standard error response format
- JWT authentication support
- Rate limiting middleware
- Comprehensive logging

## Compliance

### Data Sources
- **Public APIs only**: No proprietary or licensed data
- **Proper attribution**: All sources cited with URLs
- **Rate limiting**: Respectful API usage within published limits

### Privacy
- **No PHI**: Only public drug interaction data
- **Anonymized**: No patient-specific information
- **Audit trail**: Complete logging of data sources

## Future Enhancements

1. **Real-time Updates**: Scheduled background mining for new publications
2. **Machine Learning**: NLP models for improved text extraction accuracy
3. **Drug Class Expansion**: Support for non-oncology therapeutic areas
4. **International Sources**: EMA, Health Canada regulatory data
5. **Semantic Enhancement**: UMLS/SNOMED CT concept mapping

## Support

For technical support or feature requests:
- Review the test suite output for system validation
- Check API rate limits and error logs
- Verify database connectivity and schema
- Ensure all required environment variables are set

## License

This DDI mining system is part of OncoSafeRx and follows the same MIT license terms.