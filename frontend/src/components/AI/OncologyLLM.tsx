import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, Brain, Search, BookOpen, Lightbulb, FileText, Download, Copy, ThumbsUp, ThumbsDown, RefreshCw, Zap, Target, Activity, AlertCircle, CheckCircle } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: Reference[];
  confidence?: number;
  category?: 'clinical' | 'research' | 'drug' | 'genomic' | 'protocol' | 'safety';
  reasoning?: string;
  followup_questions?: string[];
}

interface Reference {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  pmid?: string;
  doi?: string;
  relevance_score: number;
  evidence_level: 'A' | 'B' | 'C' | 'D';
  study_type: 'RCT' | 'Meta-analysis' | 'Cohort' | 'Case-control' | 'Case-series' | 'Expert opinion';
  excerpt: string;
  url?: string;
}

interface KnowledgeBase {
  drugs: {
    total: number;
    mechanisms: number;
    interactions: number;
    trials: number;
  };
  literature: {
    papers: number;
    guidelines: number;
    protocols: number;
    lastUpdate: string;
  };
  genomics: {
    variants: number;
    biomarkers: number;
    pathways: number;
    annotations: number;
  };
  clinical: {
    trials: number;
    outcomes: number;
    treatments: number;
    patients: number;
  };
}

interface QuerySuggestion {
  id: string;
  text: string;
  category: string;
  confidence: number;
  context: string;
}

interface ConversationContext {
  patient_context?: {
    age: number;
    gender: string;
    diagnosis: string;
    stage: string;
    biomarkers: { [key: string]: any };
    prior_treatments: string[];
  };
  clinical_context?: {
    setting: 'academic' | 'community' | 'specialty';
    country: string;
    guidelines: string[];
  };
  research_context?: {
    focus: string[];
    timeframe: string;
    study_types: string[];
  };
}

interface ModelCapabilities {
  id: string;
  name: string;
  version: string;
  specialization: string[];
  accuracy: {
    clinical_qa: number;
    drug_info: number;
    genomics: number;
    protocols: number;
    safety: number;
  };
  training_data: {
    papers: number;
    guidelines: number;
    drug_labels: number;
    clinical_trials: number;
    genomic_databases: number;
    last_training: string;
  };
  limitations: string[];
  certifications: string[];
}

const OncologyLLM: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('oncollm-v3');
  const [context, setContext] = useState<ConversationContext>({});
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [suggestions, setSuggestions] = useState<QuerySuggestion[]>([]);
  const [modelCapabilities, setModelCapabilities] = useState<ModelCapabilities[]>([]);
  const [showSources, setShowSources] = useState(true);
  const [conversationMode, setConversationMode] = useState<'clinical' | 'research' | 'education' | 'general'>('clinical');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const generateKnowledgeBase = useCallback((): KnowledgeBase => {
    return {
      drugs: {
        total: 2847,
        mechanisms: 1293,
        interactions: 18492,
        trials: 5673
      },
      literature: {
        papers: 2847392,
        guidelines: 1247,
        protocols: 893,
        lastUpdate: '2024-01-15'
      },
      genomics: {
        variants: 1847392,
        biomarkers: 12847,
        pathways: 2394,
        annotations: 847392
      },
      clinical: {
        trials: 45792,
        outcomes: 123847,
        treatments: 8493,
        patients: 2847392
      }
    };
  }, []);

  const generateModelCapabilities = useCallback((): ModelCapabilities[] => {
    return [
      {
        id: 'oncollm-v3',
        name: 'OncoLLM v3.0',
        version: '3.0.1',
        specialization: ['Clinical Decision Support', 'Drug Information', 'Treatment Protocols', 'Genomic Analysis'],
        accuracy: {
          clinical_qa: 94.2,
          drug_info: 96.8,
          genomics: 91.5,
          protocols: 93.7,
          safety: 97.1
        },
        training_data: {
          papers: 2847392,
          guidelines: 1247,
          drug_labels: 2847,
          clinical_trials: 45792,
          genomic_databases: 28,
          last_training: '2024-01-01'
        },
        limitations: [
          'Not for direct patient care decisions',
          'Requires clinical validation',
          'May not include latest research (>30 days)',
          'Does not replace clinical judgment'
        ],
        certifications: ['HIPAA Compliant', 'FDA 21 CFR Part 11', 'EU MDR', 'ISO 27001']
      },
      {
        id: 'research-llm-v2',
        name: 'Research Assistant v2.5',
        version: '2.5.3',
        specialization: ['Literature Review', 'Meta-analysis', 'Research Design', 'Statistical Analysis'],
        accuracy: {
          clinical_qa: 89.1,
          drug_info: 92.3,
          genomics: 95.2,
          protocols: 87.4,
          safety: 91.8
        },
        training_data: {
          papers: 3947281,
          guidelines: 892,
          drug_labels: 1847,
          clinical_trials: 67392,
          genomic_databases: 45,
          last_training: '2023-12-15'
        },
        limitations: [
          'Focused on research applications',
          'Limited clinical decision support',
          'May over-emphasize statistical significance'
        ],
        certifications: ['Research Ethics Approved', 'IRB Compliant']
      }
    ];
  }, []);

  const generateSuggestions = useCallback((currentInput: string): QuerySuggestion[] => {
    const baseSuggestions: QuerySuggestion[] = [
      {
        id: 'sug-1',
        text: 'What are the latest treatment options for EGFR-mutant NSCLC?',
        category: 'Clinical Treatment',
        confidence: 95,
        context: 'Lung cancer, targeted therapy'
      },
      {
        id: 'sug-2', 
        text: 'Explain the mechanism of action of pembrolizumab',
        category: 'Drug Information',
        confidence: 98,
        context: 'Immunotherapy, PD-1 inhibitor'
      },
      {
        id: 'sug-3',
        text: 'What are the contraindications for CAR-T cell therapy?',
        category: 'Safety Information',
        confidence: 92,
        context: 'Cellular therapy, contraindications'
      },
      {
        id: 'sug-4',
        text: 'How do I interpret BRCA1/2 mutation testing results?',
        category: 'Genomic Analysis',
        confidence: 89,
        context: 'Genetic testing, hereditary cancer'
      },
      {
        id: 'sug-5',
        text: 'What is the recommended dosing for osimertinib in renal impairment?',
        category: 'Dosing Guidance',
        confidence: 94,
        context: 'Drug dosing, renal impairment'
      },
      {
        id: 'sug-6',
        text: 'Compare efficacy of CDK4/6 inhibitors in HR+ breast cancer',
        category: 'Comparative Analysis',
        confidence: 91,
        context: 'Breast cancer, targeted therapy comparison'
      }
    ];

    if (currentInput.length > 3) {
      return baseSuggestions.filter(sug => 
        sug.text.toLowerCase().includes(currentInput.toLowerCase()) ||
        sug.context.toLowerCase().includes(currentInput.toLowerCase())
      );
    }

    return baseSuggestions.slice(0, 3);
  }, []);

  const processMessage = useCallback(async (message: string) => {
    setIsProcessing(true);
    
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate AI response based on message content
    let responseContent = '';
    let category: Message['category'] = 'clinical';
    let confidence = 90;
    let reasoning = '';
    let sources: Reference[] = [];
    let followupQuestions: string[] = [];

    if (message.toLowerCase().includes('osimertinib')) {
      category = 'drug';
      confidence = 96;
      responseContent = `**Osimertinib (Tagrisso®)** is a third-generation, irreversible EGFR tyrosine kinase inhibitor specifically designed to overcome T790M resistance mutations.

**Key Clinical Information:**

**Indications:**
- First-line treatment of metastatic NSCLC with EGFR exon 19 deletions or exon 21 L858R mutations
- Treatment of metastatic EGFR T790M mutation-positive NSCLC after progression on prior EGFR TKI therapy

**Mechanism of Action:**
Osimertinib selectively and irreversibly binds to EGFR, including both sensitizing mutations (L858R, exon 19 deletions) and the T790M resistance mutation, while sparing wild-type EGFR.

**Dosing:**
- Standard dose: 80 mg orally once daily
- Continue until disease progression or unacceptable toxicity
- Dose modifications may be required for adverse reactions

**Key Efficacy Data:**
- FLAURA trial: Median PFS 18.9 months vs 10.2 months for first-generation TKIs
- CNS penetration: Superior CNS efficacy compared to first-generation TKIs
- Overall survival benefit demonstrated in first-line setting

**Common Adverse Events:**
- Diarrhea (58%), rash (34%), dry skin (23%), nail toxicity (22%)
- QTc prolongation, pneumonitis (rare but serious)

**Monitoring Requirements:**
- Baseline and periodic ECGs for QTc interval
- Pulmonary symptoms monitoring for pneumonitis
- Dermatologic assessments`;

      reasoning = 'Based on FDA prescribing information, NCCN guidelines, and pivotal clinical trials including FLAURA and AURA3 studies.';
      
      sources = [
        {
          id: 'ref-1',
          title: 'Osimertinib in Untreated EGFR-Mutated Advanced Non-Small-Cell Lung Cancer',
          authors: ['Soria, J.C.', 'Ohe, Y.', 'Vansteenkiste, J.'],
          journal: 'New England Journal of Medicine',
          year: 2018,
          pmid: '29151359',
          doi: '10.1056/NEJMoa1713137',
          relevance_score: 98,
          evidence_level: 'A',
          study_type: 'RCT',
          excerpt: 'FLAURA trial demonstrating superior efficacy of osimertinib vs first-generation EGFR TKIs in treatment-naive patients',
          url: 'https://pubmed.ncbi.nlm.nih.gov/29151359/'
        },
        {
          id: 'ref-2',
          title: 'Osimertinib or Platinum-Pemetrexed in EGFR T790M-Positive Lung Cancer',
          authors: ['Mok, T.S.', 'Wu, Y.L.', 'Ahn, M.J.'],
          journal: 'New England Journal of Medicine',
          year: 2017,
          pmid: '27959700',
          doi: '10.1056/NEJMoa1612674',
          relevance_score: 95,
          evidence_level: 'A',
          study_type: 'RCT',
          excerpt: 'AURA3 trial showing osimertinib superiority over platinum-pemetrexed in T790M-positive NSCLC',
          url: 'https://pubmed.ncbi.nlm.nih.gov/27959700/'
        }
      ];

      followupQuestions = [
        'What are the dose modifications for osimertinib toxicity?',
        'How does osimertinib compare to other EGFR inhibitors?',
        'What resistance mechanisms develop to osimertinib?'
      ];
    } else if (message.toLowerCase().includes('pembrolizumab')) {
      category = 'drug';
      confidence = 97;
      responseContent = `**Pembrolizumab (Keytruda®)** is a humanized monoclonal antibody that blocks the PD-1 pathway, enhancing T-cell immune response against tumors.

**Mechanism of Action:**
Pembrolizumab binds to the PD-1 receptor on T-cells, blocking its interaction with PD-L1 and PD-L2. This prevents T-cell inhibition and allows the immune system to recognize and attack cancer cells.

**FDA-Approved Indications in Oncology:**
- Melanoma (unresectable/metastatic)
- NSCLC (first-line high PD-L1, second-line)
- Head and neck squamous cell carcinoma
- Classical Hodgkin lymphoma
- Urothelial carcinoma
- Microsatellite instability-high (MSI-H) solid tumors
- Gastric/gastroesophageal junction adenocarcinoma
- Cervical cancer
- Hepatocellular carcinoma
- Merkel cell carcinoma
- Renal cell carcinoma
- Endometrial carcinoma
- Tumor mutational burden-high (TMB-H) solid tumors

**Dosing:**
- Standard: 200 mg IV every 3 weeks OR 400 mg IV every 6 weeks
- Treatment duration: Until progression, unacceptable toxicity, or maximum 24 months in some indications

**Key Biomarkers:**
- PD-L1 expression (TPS ≥1%, ≥50% thresholds vary by indication)
- MSI-H/dMMR status
- TMB-H (≥10 mutations/megabase)

**Immune-Related Adverse Events (irAEs):**
- Pneumonitis (3.4%, potentially fatal)
- Colitis (1.9%)
- Hepatitis (0.7%)
- Endocrinopathies (thyroid, adrenal, pituitary dysfunction)
- Dermatologic reactions (severe cutaneous adverse reactions)`;

      sources = [
        {
          id: 'ref-3',
          title: 'Pembrolizumab versus Chemotherapy for PD-L1–Positive Non–Small-Cell Lung Cancer',
          authors: ['Reck, M.', 'Rodríguez-Abreu, D.', 'Robinson, A.G.'],
          journal: 'New England Journal of Medicine',
          year: 2016,
          pmid: '27718847',
          doi: '10.1056/NEJMoa1606774',
          relevance_score: 96,
          evidence_level: 'A',
          study_type: 'RCT',
          excerpt: 'KEYNOTE-024 trial showing pembrolizumab superiority over chemotherapy in PD-L1 high NSCLC',
          url: 'https://pubmed.ncbi.nlm.nih.gov/27718847/'
        }
      ];
    } else if (message.toLowerCase().includes('egfr') && message.toLowerCase().includes('nsclc')) {
      category = 'clinical';
      confidence = 94;
      responseContent = `**EGFR-Mutant Non-Small Cell Lung Cancer (NSCLC) Treatment Overview**

**Current Standard of Care (2024):**

**First-Line Treatment:**
1. **Osimertinib** (preferred for exon 19 deletions and L858R mutations)
   - Superior PFS and OS vs first-generation TKIs
   - Excellent CNS penetration
   - Median PFS: 18.9 months

2. **Alternative First-Generation TKIs:**
   - Erlotinib, gefitinib, afatinib (if osimertinib unavailable)
   - Consider for patients with uncommon EGFR mutations

**Resistance Management:**
- **T790M-positive progression**: Continue osimertinib if not first-line, or consider clinical trials
- **T790M-negative progression**: Chemotherapy, immunotherapy combinations, or clinical trials
- **CNS progression**: Consider CNS-penetrant agents, radiation therapy

**Emerging Therapies:**
- Fourth-generation EGFR inhibitors (targeting C797S mutations)
- EGFR-MET combination therapies
- Antibody-drug conjugates
- Novel resistance mechanism targeting

**Key Biomarker Testing:**
- EGFR mutation analysis (exons 18-21)
- T790M testing at progression
- Consider comprehensive genomic profiling for co-mutations

**Monitoring Recommendations:**
- Imaging every 6-8 weeks initially
- Brain MRI if CNS symptoms
- Cardiac monitoring for QTc prolongation
- Pulmonary symptom assessment for pneumonitis`;

      followupQuestions = [
        'What are the resistance mechanisms to EGFR inhibitors?',
        'How do you manage CNS progression in EGFR-mutant NSCLC?',
        'What combination therapies are being studied for EGFR-mutant NSCLC?'
      ];
    } else {
      responseContent = `I understand you're asking about: "${message}"

I'm OncoLLM, specialized in oncology clinical decision support. I can help with:

**Clinical Areas:**
- Treatment recommendations and protocols
- Drug information and mechanisms
- Biomarker interpretation
- Resistance mechanisms
- Adverse event management

**Research Support:**
- Literature synthesis
- Clinical trial information
- Comparative effectiveness
- Emerging therapies

**Safety Information:**
- Contraindications and warnings
- Drug interactions
- Monitoring requirements
- Dose modifications

Please feel free to ask specific questions about cancer treatment, drugs, biomarkers, or clinical protocols. I'll provide evidence-based responses with supporting references.

**Example queries:**
- "What are the treatment options for BRAF-mutant melanoma?"
- "Explain the mechanism of CDK4/6 inhibitors"
- "How do I manage immune-related adverse events?"`;

      followupQuestions = [
        'What specific cancer type or treatment are you interested in?',
        'Do you need information about a particular drug or biomarker?',
        'Are you looking for treatment protocols or safety information?'
      ];
    }

    // Generate AI response
    const aiMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      type: 'assistant',
      content: responseContent,
      timestamp: new Date().toISOString(),
      category,
      confidence,
      reasoning,
      sources,
      followup_questions: followupQuestions
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsProcessing(false);
  }, []);

  const handleSendMessage = useCallback(async (message?: string) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend || isProcessing) return;

    setInputMessage('');
    setSuggestions([]);
    await processMessage(messageToSend);
  }, [inputMessage, isProcessing, processMessage]);

  const handleInputChange = useCallback((value: string) => {
    setInputMessage(value);
    setSuggestions(generateSuggestions(value));
  }, [generateSuggestions]);

  useEffect(() => {
    setKnowledgeBase(generateKnowledgeBase());
    setModelCapabilities(generateModelCapabilities());
    
    // Add welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'system',
      content: `Welcome to OncoLLM v3.0 - your AI-powered oncology clinical decision support system. I'm trained on the latest clinical literature, treatment guidelines, and drug information to assist with evidence-based cancer care.

**My Capabilities:**
- Clinical decision support
- Drug information and mechanisms
- Biomarker interpretation  
- Treatment protocol guidance
- Literature synthesis
- Safety information

**Important:** I provide information to support clinical decision-making but do not replace clinical judgment. Always validate recommendations with current guidelines and individual patient factors.

How can I assist you today?`,
      timestamp: new Date().toISOString(),
      category: 'clinical'
    };
    
    setMessages([welcomeMessage]);
  }, [generateKnowledgeBase, generateModelCapabilities]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const currentModel = modelCapabilities.find(m => m.id === selectedModel);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Oncology AI Assistant</h1>
            <p className="text-indigo-100">
              Advanced large language model trained on comprehensive oncology literature and clinical guidelines
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{currentModel?.accuracy.clinical_qa || 94}%</div>
            <div className="text-sm text-indigo-100">Clinical Accuracy</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">AI Model:</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {modelCapabilities.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} - {model.specialization.join(', ')}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Mode:</label>
            <select
              value={conversationMode}
              onChange={(e) => setConversationMode(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="clinical">Clinical Decision Support</option>
              <option value="research">Research Assistant</option>
              <option value="education">Medical Education</option>
              <option value="general">General Oncology</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showSources}
              onChange={(e) => setShowSources(e.target.checked)}
              className="rounded"
            />
            Show Sources
          </label>

          <button
            onClick={() => setMessages(messages.filter(m => m.type === 'system'))}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
            Clear Chat
          </button>
        </div>
      </div>

      {/* Knowledge Base Stats */}
      {knowledgeBase && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Base</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Clinical Literature</div>
              <div className="text-2xl font-bold text-blue-600">
                {knowledgeBase.literature.papers.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Papers & Guidelines</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Drug Database</div>
              <div className="text-2xl font-bold text-green-600">
                {knowledgeBase.drugs.total.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Approved Drugs</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Genomic Data</div>
              <div className="text-2xl font-bold text-purple-600">
                {knowledgeBase.genomics.variants.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Genetic Variants</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Clinical Trials</div>
              <div className="text-2xl font-bold text-orange-600">
                {knowledgeBase.clinical.trials.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Active Trials</div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl p-4 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : message.type === 'system'
                  ? 'bg-gray-100 text-gray-800 border-l-4 border-gray-400'
                  : 'bg-gray-50 text-gray-800'
              }`}>
                {message.type === 'assistant' && (
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="h-5 w-5 text-indigo-600" />
                    <span className="font-medium text-indigo-600">OncoLLM</span>
                    {message.category && (
                      <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded capitalize">
                        {message.category}
                      </span>
                    )}
                    {message.confidence && (
                      <span className="text-xs text-gray-600">
                        {message.confidence}% confidence
                      </span>
                    )}
                  </div>
                )}

                <div className="prose prose-sm max-w-none">
                  {message.content.split('\n').map((line, index) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <h4 key={index} className="font-bold text-lg mt-4 mb-2">{line.slice(2, -2)}</h4>;
                    } else if (line.startsWith('*') && line.endsWith('*')) {
                      return <h5 key={index} className="font-semibold mt-3 mb-1">{line.slice(1, -1)}</h5>;
                    } else if (line.startsWith('- ')) {
                      return <li key={index} className="ml-4">{line.slice(2)}</li>;
                    } else if (line.trim()) {
                      return <p key={index} className="mb-2">{line}</p>;
                    }
                    return <br key={index} />;
                  })}
                </div>

                {message.sources && message.sources.length > 0 && showSources && (
                  <div className="mt-4 border-t pt-3">
                    <h5 className="font-medium text-gray-900 mb-2">Sources & References:</h5>
                    <div className="space-y-2">
                      {message.sources.map((source) => (
                        <div key={source.id} className="bg-white p-3 rounded border text-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-blue-600">{source.title}</div>
                              <div className="text-gray-600">
                                {source.authors.slice(0, 3).join(', ')}
                                {source.authors.length > 3 && ' et al.'} 
                                ({source.year})
                              </div>
                              <div className="text-gray-600">{source.journal}</div>
                              <div className="text-xs text-gray-500 mt-1">{source.excerpt}</div>
                            </div>
                            <div className="ml-3 text-right">
                              <span className={`px-2 py-1 text-xs rounded ${
                                source.evidence_level === 'A' ? 'bg-green-100 text-green-800' :
                                source.evidence_level === 'B' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                Level {source.evidence_level}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                {source.relevance_score}% relevance
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {message.followup_questions && message.followup_questions.length > 0 && (
                  <div className="mt-4 border-t pt-3">
                    <h5 className="font-medium text-gray-900 mb-2">Follow-up Questions:</h5>
                    <div className="space-y-1">
                      {message.followup_questions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleSendMessage(question)}
                          className="block w-full text-left p-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded"
                        >
                          • {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {message.reasoning && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
                    <strong>Reasoning:</strong> {message.reasoning}
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  <span className="text-gray-600">OncoLLM is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          {suggestions.length > 0 && (
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-2">Suggested questions:</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSendMessage(suggestion.text)}
                    className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200"
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Ask about cancer treatments, drugs, protocols, or research..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isProcessing}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isProcessing}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Model Information */}
      {currentModel && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Model Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Model Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">{currentModel.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Training:</span>
                  <span className="font-medium">{currentModel.training_data.last_training}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Papers Trained:</span>
                  <span className="font-medium">{currentModel.training_data.papers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Clinical Trials:</span>
                  <span className="font-medium">{currentModel.training_data.clinical_trials.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Accuracy Metrics</h4>
              <div className="space-y-2">
                {Object.entries(currentModel.accuracy).map(([metric, value]) => (
                  <div key={metric} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{metric.replace('_', ' ')}:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{value}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Limitations & Certifications</h4>
              <div className="space-y-2">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Limitations:</div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {currentModel.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Certifications:</div>
                  <div className="space-y-1">
                    {currentModel.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-1 text-xs">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {cert}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OncologyLLM;