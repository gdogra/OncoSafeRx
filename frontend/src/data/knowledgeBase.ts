export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  lastUpdated: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;
}

export interface KnowledgeBaseCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  articles: KnowledgeBaseArticle[];
}

export const knowledgeBase: KnowledgeBaseCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Learn the basics of OncoSafeRx',
    icon: 'PlayCircle',
    articles: [
      {
        id: 'introduction',
        title: 'Introduction to OncoSafeRx',
        category: 'getting-started',
        tags: ['overview', 'basics', 'introduction'],
        difficulty: 'beginner',
        estimatedReadTime: 5,
        lastUpdated: '2025-01-15',
        content: `
# Introduction to OncoSafeRx

OncoSafeRx is a comprehensive oncology drug interaction and safety platform designed to help healthcare professionals make informed decisions about cancer treatments.

## What is OncoSafeRx?

OncoSafeRx provides:
- **Drug Interaction Checking**: Identify potential interactions between medications
- **Pharmacogenomic Analysis**: Understand how genetics affect drug responses
- **Clinical Decision Support**: Evidence-based recommendations for oncology care
- **Safety Monitoring**: Real-time alerts for drug safety concerns

## Key Features

### 🔍 Drug Search
Search our comprehensive database of oncology medications, including:
- FDA-approved cancer drugs
- Supportive care medications
- Generic and brand name drugs
- Investigational agents

### ⚠️ Interaction Checker
Check for interactions between multiple medications:
- Drug-drug interactions
- Severity ratings
- Clinical recommendations
- Monitoring requirements

### 🧬 Genomic Analysis
Pharmacogenomic insights including:
- CPIC guidelines
- FDA pharmacogenomic recommendations
- Dosing adjustments based on genetic variants

### 📊 Clinical Intelligence
Access to:
- Clinical trial data
- Real-world evidence
- Treatment protocols
- Safety profiles

## Getting Help

- Use the AI chat assistant for instant help
- Browse the knowledge base for detailed guides
- Contact support for technical issues

Start by exploring the Drug Search feature to familiarize yourself with the interface.
        `
      },
      {
        id: 'navigation',
        title: 'Navigating the Interface',
        category: 'getting-started',
        tags: ['navigation', 'interface', 'basics'],
        difficulty: 'beginner',
        estimatedReadTime: 3,
        lastUpdated: '2025-01-15',
        content: `
# Navigating the OncoSafeRx Interface

## Main Navigation

The OncoSafeRx interface consists of several key sections:

### 🏠 Dashboard
- Overview of recent activity
- Quick access to common tasks
- System status and alerts

### 🔍 Drug Search
- Search for medications by name, RXCUI, or active ingredient
- View detailed drug information
- Access pharmacokinetic data

### ⚠️ Interaction Checker
- Add multiple medications
- Check for potential interactions
- View severity ratings and recommendations

### 🧬 Genomics
- Enter patient genetic information
- Get pharmacogenomic recommendations
- View CPIC guidelines

### 📚 Knowledge Base
- Access user manual and guides
- Search for specific topics
- Browse by category

## Search Tips

### Drug Search
- Type at least 2 characters to see suggestions
- Use generic or brand names
- Search is case-insensitive
- Recent searches are saved for quick access

### Interaction Checker
- Add drugs one at a time
- Minimum 2 drugs required for checking
- Results show severity and clinical recommendations

## Keyboard Shortcuts

- **Ctrl+/** or **Cmd+/**: Open search
- **Ctrl+H** or **Cmd+H**: Open help
- **Escape**: Close modals and dropdowns
        `
      },
      {
        id: 'first-search',
        title: 'Your First Drug Search',
        category: 'getting-started',
        tags: ['search', 'tutorial', 'drugs'],
        difficulty: 'beginner',
        estimatedReadTime: 4,
        lastUpdated: '2025-01-15',
        content: `
# Your First Drug Search

Let's walk through searching for a medication in OncoSafeRx.

## Step 1: Access Drug Search

1. Click on **Drug Search** in the main navigation
2. You'll see the search interface with autocomplete

## Step 2: Enter Search Terms

1. Start typing a medication name (e.g., "pembrolizumab")
2. As you type, you'll see suggestions appear
3. Suggestions include:
   - Generic names
   - Brand names
   - Recent searches (if any)

## Step 3: Select a Medication

1. Click on a suggestion or press Enter
2. You'll see detailed drug information including:
   - Basic drug details (RXCUI, name, type)
   - Clinical information
   - Available actions

## Step 4: Explore Drug Details

From the drug details page, you can:
- **View Interactions**: Check how this drug interacts with others
- **Genomic Analysis**: See pharmacogenomic considerations
- **Clinical Trials**: Find relevant studies

## Example: Searching for Pembrolizumab

1. Type "pembrolizumab" in the search box
2. Select "pembrolizumab 25 MG/ML Injectable Solution"
3. Review the drug information
4. Click "Check Interactions" to see potential drug interactions

## Search Tips

- **Use partial names**: "pembro" will find "pembrolizumab"
- **Case doesn't matter**: "ASPIRIN" = "aspirin"
- **Brand names work**: "Keytruda" will find pembrolizumab
- **Recent searches**: Your last 5 searches are saved for quick access

## Next Steps

Once you're comfortable with drug search:
1. Try the Interaction Checker with multiple drugs
2. Explore genomic analysis features
3. Review clinical decision support tools
        `
      }
    ]
  },
  {
    id: 'drug-interactions',
    name: 'Drug Interactions',
    description: 'Understanding and checking drug interactions',
    icon: 'AlertTriangle',
    articles: [
      {
        id: 'interaction-basics',
        title: 'Understanding Drug Interactions',
        category: 'drug-interactions',
        tags: ['interactions', 'safety', 'clinical'],
        difficulty: 'intermediate',
        estimatedReadTime: 8,
        lastUpdated: '2025-01-15',
        content: `
# Understanding Drug Interactions

Drug interactions can significantly impact patient safety and treatment efficacy in oncology care.

## Types of Drug Interactions

### Drug-Drug Interactions
- **Pharmacokinetic**: Affecting absorption, distribution, metabolism, or excretion
- **Pharmacodynamic**: Affecting drug action at receptor or system level
- **Pharmaceutical**: Physical or chemical incompatibilities

### Drug-Disease Interactions
- Contraindications due to patient conditions
- Dose adjustments needed for organ dysfunction
- Monitoring requirements for specific diseases

### Drug-Food Interactions
- Absorption changes with food
- Specific dietary restrictions
- Timing considerations

## Severity Classifications

### 🔴 Major (Severe)
- Life-threatening or cause permanent damage
- Requires immediate intervention
- Examples: QT prolongation with multiple agents

### 🟡 Moderate
- May cause deterioration of patient condition
- Requires monitoring or dose adjustment
- Examples: CYP450 enzyme interactions

### 🟢 Minor
- Limited clinical effects
- May not require intervention
- Examples: Minor absorption delays

## Clinical Significance

### High Clinical Significance
- Well-documented in literature
- Consistent effect across patient populations
- Clear mechanism of action

### Moderate Clinical Significance
- Some documentation available
- Variable effects depending on patient factors
- Theoretical basis with limited clinical data

### Low Clinical Significance
- Limited or anecdotal evidence
- Rare occurrence
- Theoretical concern only

## Oncology-Specific Considerations

### Chemotherapy Interactions
- Narrow therapeutic windows
- Combination therapy protocols
- Sequential vs. concurrent administration

### Supportive Care Interactions
- Antiemetics and QT prolongation
- Growth factor interactions
- Infection prophylaxis considerations

### Targeted Therapy Interactions
- CYP450 enzyme effects
- Transporter protein interactions
- Protein binding displacement

## Using the Interaction Checker

1. **Add Medications**: Enter all current medications
2. **Review Results**: Check severity and recommendations
3. **Clinical Assessment**: Consider patient-specific factors
4. **Monitor**: Follow recommended monitoring parameters
5. **Document**: Record decisions and rationale

## Best Practices

- Always check interactions before prescribing
- Consider pharmacokinetic and pharmacodynamic factors
- Review patient-specific risk factors
- Monitor for signs of interactions
- Educate patients about potential interactions
- Document interaction checks and decisions
        `
      },
      {
        id: 'checking-interactions',
        title: 'How to Check Drug Interactions',
        category: 'drug-interactions',
        tags: ['how-to', 'checker', 'workflow'],
        difficulty: 'beginner',
        estimatedReadTime: 6,
        lastUpdated: '2025-01-15',
        content: `
# How to Check Drug Interactions

Follow this step-by-step guide to effectively use the OncoSafeRx Interaction Checker.

## Step 1: Access the Interaction Checker

1. Navigate to **Interaction Checker** from the main menu
2. You'll see an interface to add medications

## Step 2: Add Medications

### Adding Your First Drug
1. Start typing in the medication search field
2. Select from the autocomplete suggestions
3. The drug will appear in your medication list

### Adding Additional Drugs
1. Repeat the search process for each medication
2. You need at least 2 drugs to check interactions
3. You can add up to 10 medications at once

### Enhanced Search Features
- **Case-insensitive**: Works with any capitalization
- **Partial matching**: "pembro" finds "pembrolizumab"
- **Brand and generic names**: Both are searchable
- **Recent searches**: Quick access to previously searched drugs

## Step 3: Review Your Medication List

Before checking interactions:
- Verify all medications are correct
- Remove any incorrect entries using the X button
- Ensure dosage forms are appropriate

## Step 4: Run the Interaction Check

1. Click **Check Interactions** button
2. The system will analyze all possible drug pairs
3. Results appear with severity ratings and details

## Step 5: Interpret Results

### No Interactions Found
- Green checkmark indicates no known interactions
- Safe to proceed with current combination

### Interactions Detected
Results show:
- **Severity level** (Major/Moderate/Minor)
- **Interaction description**
- **Clinical recommendations**
- **Monitoring requirements**

### Interaction Details Include:
- Mechanism of interaction
- Expected onset time
- Clinical significance
- Management strategies
- Literature references

## Step 6: Clinical Decision Making

### For Major Interactions:
- Consider alternative medications
- If unavoidable, implement intensive monitoring
- Adjust dosages as recommended
- Document rationale for continuing

### For Moderate Interactions:
- Assess benefit vs. risk
- Implement monitoring plans
- Consider dose adjustments
- Patient education about signs to watch

### For Minor Interactions:
- Generally safe to continue
- Minimal monitoring may be needed
- Consider timing of administration

## Advanced Features

### Patient Context
- Add patient-specific information
- Consider comorbidities
- Account for age and organ function

### Export Results
- Print interaction reports
- Save for medical records
- Share with healthcare team

## Example Workflow

Let's check interactions for a patient on:
1. Pembrolizumab (immunotherapy)
2. Warfarin (anticoagulation)
3. Ondansetron (antiemetic)

1. Add "pembrolizumab" → Select from suggestions
2. Add "warfarin" → Select from suggestions  
3. Add "ondansetron" → Select from suggestions
4. Click "Check Interactions"
5. Review results for each drug pair
6. Implement monitoring based on recommendations

## Troubleshooting

### Drug Not Found?
- Try alternative names (brand vs. generic)
- Check spelling
- Use partial names
- Contact support if still not found

### Unexpected Results?
- Verify correct drug was selected
- Check for similar drug names
- Review interaction mechanisms
- Consult additional references if needed
        `
      }
    ]
  },
  {
    id: 'pharmacogenomics',
    name: 'Pharmacogenomics',
    description: 'Genetic factors affecting drug response',
    icon: 'Dna',
    articles: [
      {
        id: 'pgx-introduction',
        title: 'Introduction to Pharmacogenomics',
        category: 'pharmacogenomics',
        tags: ['genetics', 'personalized medicine', 'dosing'],
        difficulty: 'intermediate',
        estimatedReadTime: 10,
        lastUpdated: '2025-01-15',
        content: `
# Introduction to Pharmacogenomics

Pharmacogenomics (PGx) is the study of how genetic variations affect individual responses to medications.

## What is Pharmacogenomics?

Pharmacogenomics combines pharmacology and genomics to develop safe and effective medications tailored to an individual's genetic makeup.

### Key Concepts

**Genetic Polymorphisms**: Variations in genes that affect drug metabolism, transport, or targets

**Phenotypes**: Observable characteristics resulting from genetic variations:
- **Poor Metabolizer (PM)**: Reduced enzyme activity
- **Intermediate Metabolizer (IM)**: Somewhat reduced activity
- **Normal Metabolizer (NM)**: Normal enzyme activity
- **Rapid Metabolizer (RM)**: Increased enzyme activity
- **Ultra-rapid Metabolizer (UM)**: Very high enzyme activity

## Important Pharmacogenes in Oncology

### CYP2D6
- **Drugs affected**: Tamoxifen, codeine, tramadol
- **Clinical impact**: Tamoxifen efficacy depends on CYP2D6 activity
- **Recommendations**: Consider alternative therapy for poor metabolizers

### CYP2C19
- **Drugs affected**: Proton pump inhibitors, clopidogrel
- **Clinical impact**: Varies efficacy of acid suppression and antiplatelet therapy
- **Recommendations**: Dose adjustments or alternative medications

### TPMT (Thiopurine S-methyltransferase)
- **Drugs affected**: 6-mercaptopurine, azathioprine, thioguanine
- **Clinical impact**: Risk of severe myelosuppression
- **Recommendations**: Dose reduction or alternative therapy for poor metabolizers

### DPYD (Dihydropyrimidine dehydrogenase)
- **Drugs affected**: 5-fluorouracil, capecitabine
- **Clinical impact**: Risk of severe toxicity
- **Recommendations**: Dose reduction or avoid in deficient patients

### UGT1A1
- **Drugs affected**: Irinotecan
- **Clinical impact**: Risk of severe diarrhea and neutropenia
- **Recommendations**: Dose reduction for specific genotypes

## CPIC Guidelines

The Clinical Pharmacogenetics Implementation Consortium (CPIC) provides evidence-based guidelines for implementing pharmacogenetic testing.

### CPIC Recommendation Levels
- **Level A**: Strong recommendation for genetic testing
- **Level B**: Moderate recommendation
- **Level C**: Optional recommendation
- **Level D**: No recommendation

## Using PGx Information in OncoSafeRx

### 1. Enter Patient Genetic Information
- Input known genetic test results
- Use standardized nomenclature
- Include relevant phenotype predictions

### 2. Review Drug-Specific Recommendations
- CPIC guideline summaries
- Dosing recommendations
- Alternative medication suggestions

### 3. Clinical Decision Support
- Automated alerts for high-risk combinations
- Dosing calculators
- Monitoring recommendations

## Clinical Implementation

### When to Consider PGx Testing
- Before starting medications with strong PGx evidence
- After adverse drug reactions
- For patients with family history of drug reactions
- In precision medicine protocols

### Interpreting Results
- Understand the specific gene-drug pairs
- Consider phenotype predictions
- Account for other clinical factors
- Document decisions and rationale

### Patient Education
- Explain the role of genetics in drug response
- Discuss implications for current and future medications
- Provide genetic test results summary
- Encourage sharing with other healthcare providers

## Limitations and Considerations

### Test Limitations
- Not all relevant genes may be tested
- Rare variants may not be detected
- Phenotype prediction may not always correlate with clinical response

### Clinical Factors
- Drug interactions can affect PGx predictions
- Disease state may influence drug metabolism
- Age and organ function remain important
- Environmental factors can modify genetic effects

## Future Directions

- Expanded gene panels
- Improved phenotype prediction algorithms
- Integration with electronic health records
- Cost-effectiveness studies
- Population-specific research

Pharmacogenomics represents a key component of personalized medicine in oncology, helping optimize drug selection and dosing for individual patients.
        `
      }
    ]
  },
  {
    id: 'safety-monitoring',
    name: 'Safety & Monitoring',
    description: 'Drug safety and monitoring protocols',
    icon: 'Shield',
    articles: [
      {
        id: 'safety-basics',
        title: 'Drug Safety Fundamentals',
        category: 'safety-monitoring',
        tags: ['safety', 'monitoring', 'adverse events'],
        difficulty: 'intermediate',
        estimatedReadTime: 7,
        lastUpdated: '2025-01-15',
        content: `
# Drug Safety Fundamentals

Drug safety is paramount in oncology care, where patients often receive multiple medications with narrow therapeutic windows.

## Key Safety Concepts

### Adverse Drug Reactions (ADRs)
**Type A (Augmented)**: Dose-dependent, predictable
- Examples: Myelosuppression from chemotherapy
- Management: Dose reduction, supportive care

**Type B (Bizarre)**: Dose-independent, unpredictable
- Examples: Anaphylaxis, idiosyncratic reactions
- Management: Discontinuation, symptomatic treatment

### Risk Assessment
- Patient-specific factors
- Drug-specific toxicities
- Interaction potential
- Monitoring capabilities

## Safety Monitoring Protocols

### Pre-treatment Assessment
- Baseline laboratory values
- Organ function tests
- Performance status
- Comorbidity evaluation
- Medication reconciliation

### During Treatment
- Regular laboratory monitoring
- Clinical assessments
- Patient-reported outcomes
- Dose modifications as needed

### Post-treatment
- Long-term toxicity surveillance
- Secondary malignancy screening
- Quality of life assessments

## Common Oncology Toxicities

### Hematologic
- **Myelosuppression**: Regular CBC monitoring
- **Thrombocytopenia**: Bleeding precautions
- **Neutropenia**: Infection prevention

### Gastrointestinal
- **Nausea/Vomiting**: Prophylactic antiemetics
- **Diarrhea**: Electrolyte monitoring
- **Mucositis**: Oral care protocols

### Cardiovascular
- **Cardiotoxicity**: ECHO/MUGA monitoring
- **QT Prolongation**: ECG surveillance
- **Hypertension**: Blood pressure monitoring

### Renal/Hepatic
- **Nephrotoxicity**: Creatinine, BUN monitoring
- **Hepatotoxicity**: Liver function tests

## Monitoring Technologies

### Laboratory Integration
- Automated alerts for critical values
- Trending of serial measurements
- Reference range adjustments

### Clinical Decision Support
- Drug-specific monitoring protocols
- Dose adjustment algorithms
- Toxicity grading systems

## Documentation and Reporting

### Adverse Event Documentation
- Severity grading (CTCAE)
- Causality assessment
- Timeline of events
- Management actions taken

### Regulatory Reporting
- Serious adverse events
- Unexpected reactions
- FDA MedWatch reporting
- Institutional reporting

Effective safety monitoring requires systematic approaches, appropriate technology, and clear communication among healthcare team members.
        `
      }
    ]
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Common issues and solutions',
    icon: 'Tool',
    articles: [
      {
        id: 'common-issues',
        title: 'Common Issues and Solutions',
        category: 'troubleshooting',
        tags: ['troubleshooting', 'errors', 'support'],
        difficulty: 'beginner',
        estimatedReadTime: 5,
        lastUpdated: '2025-01-15',
        content: `
# Common Issues and Solutions

Quick solutions to frequently encountered problems in OncoSafeRx.

## Search Issues

### Problem: "Drug not found in search"
**Solutions:**
- Try alternative drug names (brand vs. generic)
- Check spelling
- Use partial names (e.g., "pembro" for pembrolizumab)
- Try different capitalizations
- Contact support if drug should be available

### Problem: "Search suggestions not appearing"
**Solutions:**
- Type at least 2 characters
- Check internet connection
- Clear browser cache
- Try refreshing the page
- Disable browser extensions temporarily

### Problem: "Search is too slow"
**Solutions:**
- Check internet connection speed
- Clear browser cache and cookies
- Close unnecessary browser tabs
- Try incognito/private browsing mode

## Interaction Checker Issues

### Problem: "Cannot add second drug"
**Solutions:**
- Ensure first drug is properly selected
- Wait for first drug to appear in list
- Try refreshing the page
- Clear the form and start over

### Problem: "Interaction check not working"
**Solutions:**
- Ensure at least 2 drugs are selected
- Verify drugs are correctly added to list
- Check for server connectivity
- Try with different drug combinations

### Problem: "Unexpected interaction results"
**Solutions:**
- Verify correct drugs were selected
- Check for similar drug names
- Review interaction mechanisms
- Consult additional references

## Performance Issues

### Problem: "Page loading slowly"
**Solutions:**
- Check internet connection
- Clear browser cache
- Disable unnecessary browser extensions
- Try different browser
- Check system resources

### Problem: "Application freezing"
**Solutions:**
- Close and reopen browser tab
- Restart browser
- Clear browser data
- Check for browser updates
- Try incognito mode

## Data Issues

### Problem: "Information seems outdated"
**Solutions:**
- Refresh the page
- Check last updated timestamps
- Clear browser cache
- Report outdated information to support

### Problem: "Missing drug information"
**Solutions:**
- Try alternative drug identifiers
- Check if drug is recently approved
- Contact support to request addition
- Use alternative data sources temporarily

## Browser Compatibility

### Recommended Browsers
- **Chrome**: Version 90 or later
- **Firefox**: Version 88 or later
- **Safari**: Version 14 or later
- **Edge**: Version 90 or later

### Browser Settings
- Enable JavaScript
- Allow cookies
- Disable strict tracking protection
- Clear cache regularly

## Getting Additional Help

### In-App Support
- Use the AI chat assistant
- Check tooltips and help text
- Browse knowledge base articles

### Contact Support
- Email: support@oncosaferx.com
- Include error messages
- Describe steps to reproduce
- Mention browser and version

### Community Resources
- User forums
- Video tutorials
- Training materials
- Best practices guides

Remember: Most issues can be resolved by refreshing the page or clearing browser cache. If problems persist, don't hesitate to contact our support team.
        `
      }
    ]
  }
];

export const searchKnowledgeBase = (query: string): KnowledgeBaseArticle[] => {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase();
  const allArticles = knowledgeBase.flatMap(category => category.articles);
  
  return allArticles.filter(article => 
    article.title.toLowerCase().includes(searchTerm) ||
    article.content.toLowerCase().includes(searchTerm) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    article.category.toLowerCase().includes(searchTerm)
  ).sort((a, b) => {
    // Prioritize title matches
    const aTitle = a.title.toLowerCase().includes(searchTerm);
    const bTitle = b.title.toLowerCase().includes(searchTerm);
    if (aTitle && !bTitle) return -1;
    if (!aTitle && bTitle) return 1;
    return 0;
  });
};