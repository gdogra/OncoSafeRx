import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Minimize2, Maximize2, X, Loader, Info } from 'lucide-react';
import { searchKnowledgeBase } from '../../data/knowledgeBase';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../UI/Toast';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  relatedArticles?: string[];
  source?: 'kb' | 'openai' | 'script';
  cta?: { label: string; to: string };
  suggestion?: { label: string; to: string; type?: 'interactions' | 'drug-intel' | 'protocols' | 'genomics' | 'trials'; query?: string };
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, className = '' }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { state: patientState, actions: patientActions } = usePatient();
  const { state: authState } = useAuth();
  const { currentPatient } = patientState;
  const { user } = authState;
  
  // Load messages from patient context or use default
  const getChatMessages = (): ChatMessage[] => {
    if (!currentPatient) {
      return [{
        id: '1',
        type: 'ai',
        content: "Hello! I'm your OncoSafeRx assistant. I can help you with drug interactions, pharmacogenomics, safety monitoring, and navigating the platform. What can I help you with today?",
        timestamp: new Date(),
      }];
    }
    
    // Filter notes that are chat messages (type 'ai-chat')
    const chatNotes = currentPatient.notes.filter(note => note.type === 'ai-chat' || note.content.startsWith('CHAT:'));
    const chatMessages = chatNotes.map(note => ({
      id: note.id,
      type: note.content.startsWith('CHAT:USER:') ? 'user' as const : 'ai' as const,
      content: note.content.replace(/^CHAT:(USER|AI):/, ''),
      timestamp: new Date(note.timestamp),
    }));

    // If no chat messages exist, add welcome message
    if (chatMessages.length === 0) {
      const welcomeMessage = {
        id: 'welcome-' + Date.now(),
        type: 'ai' as const,
        content: "Hello! I'm your OncoSafeRx assistant. I can help you with drug interactions, pharmacogenomics, safety monitoring, and navigating the platform. What can I help you with today?",
        timestamp: new Date(),
      };
      // Save welcome message to patient
      const noteContent = `CHAT:AI:${welcomeMessage.content}`;
      const newNote = {
        id: welcomeMessage.id,
        timestamp: welcomeMessage.timestamp.toISOString(),
        author: 'OncoSafeRx Assistant',
        type: 'ai-chat' as const,
        content: noteContent,
      };
      const updatedNotes = [...currentPatient.notes, newNote];
      patientActions.updatePatientData({ notes: updatedNotes });
      return [welcomeMessage];
    }

    return chatMessages;
  };

  const [messages, setMessages] = useState<ChatMessage[]>(getChatMessages());
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [pendingConfirmId, setPendingConfirmId] = useState<string | null>(null);
  const [showTip, setShowTip] = useState<boolean>(() => {
    try {
      const gv = (window as any)?.__OSRX_FEATURES__?.guidanceVersion ?? (import.meta as any)?.env?.VITE_GUIDANCE_VERSION ?? '0';
      return localStorage.getItem(`osrx_tip_dismissed:ai-chat:${gv}`) !== '1';
    } catch { return true; }
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const copyToClipboard = async (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch {}
  };

  // Helpers for confirmation follow-ups
  const confirmYes = () => {
    setPendingConfirmId(null);
    const follow: ChatMessage = {
      id: (Date.now() + 2).toString(),
      type: 'ai',
      content: 'Great — anything else I can help with?',
      timestamp: new Date(),
      source: 'script'
    };
    setMessages(prev => [...prev, follow]);
    saveMessageToPatient(follow);
    setIsLoading(false);
  };
  const confirmNo = () => {
    setPendingConfirmId(null);
    const follow: ChatMessage = {
      id: (Date.now() + 2).toString(),
      type: 'ai',
      content: 'Thanks — what details are you looking for so I can refine the answer?',
      timestamp: new Date(),
      source: 'script'
    };
    setMessages(prev => [...prev, follow]);
    saveMessageToPatient(follow);
    setIsLoading(false);
  };

  // Update messages when current patient changes
  useEffect(() => {
    setMessages(getChatMessages());
  }, [currentPatient]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Keyboard shortcuts for pending confirmation: Y/Enter = Yes, N/Esc = No
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!pendingConfirmId) return;
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      const k = e.key.toLowerCase();
      if (k === 'y' || e.key === 'Enter') {
        e.preventDefault();
        confirmYes();
      } else if (k === 'n' || e.key === 'Escape') {
        e.preventDefault();
        confirmNo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pendingConfirmId]);

  const generateAIResponse = (userMessage: string): { content: string; relatedArticles?: string[]; source: 'kb' | 'script'; cta?: { label: string; to: string }; suggestion?: { label: string; to: string } } => {
    const message = userMessage.toLowerCase();
    
    // Search knowledge base for relevant articles
    const relatedArticles = searchKnowledgeBase(userMessage).slice(0, 3).map(article => article.id);

    // Normalize whitespace for simple routing intents
    const normalized = message.replace(/\s+/g, ' ').trim();

    // Fast-path routing for common sections (respond with CTA immediately)
    if (/(^|\b)(clinical\s*)?trials?(\b|$)/.test(normalized)) {
      return {
        content: 'Opening the Clinical Trials tools.',
        relatedArticles,
        source: 'script',
        cta: { label: 'Open Clinical Trials', to: '/trials' }
      };
    }
    if (/(^|\b)interactions?(\b|$)|interaction\s*checker/.test(normalized)) {
      return {
        content: 'Opening the Interaction Checker.',
        relatedArticles,
        source: 'script',
        cta: { label: 'Open Interactions', to: '/interactions' }
      };
    }
    if (/(^|\b)genomics?(\b|$)|pharmacogenomics|pgx/.test(normalized)) {
      return {
        content: 'Opening Genomics.',
        relatedArticles,
        source: 'script',
        cta: { label: 'Open Genomics', to: '/genomics' }
      };
    }
    if (/(^|\b)protocols?(\b|$)|regimens?/.test(normalized)) {
      return {
        content: 'Opening Protocols.',
        relatedArticles,
        source: 'script',
        cta: { label: 'Open Protocols', to: '/protocols' }
      };
    }
    if (/(^|\b)drug\s*database(\b|$)|labels?|label\s*database|dailymed/.test(normalized)) {
      return {
        content: 'Opening Drug Database.',
        relatedArticles,
        source: 'script',
        cta: { label: 'Open Drug Database', to: '/database' }
      };
    }
    if (/(^|\b)drug\s*intelligence(\b|$)|intelligence\s*integrator/.test(normalized)) {
      return {
        content: 'Opening Drug Intelligence Integrator.',
        relatedArticles,
        source: 'script',
        cta: { label: 'Open Drug Intelligence', to: '/drug-intelligence' }
      };
    }
    if (/(^|\b)multi(\-|\s*)database(\b|$)|federated\s*search/.test(normalized)) {
      return {
        content: 'Opening Multi‑Database Search.',
        relatedArticles,
        source: 'script',
        cta: { label: 'Open Multi‑DB Search', to: '/multi-database-search' }
      };
    }
    if (/(^|\b)analytics?(\b|$)/.test(normalized)) {
      return {
        content: 'Opening Analytics.',
        relatedArticles,
        source: 'script',
        cta: { label: 'Open Analytics', to: '/analytics' }
      };
    }
    if (/(^|\b)help(\b|$)|support\s*center/.test(normalized)) {
      return {
        content: 'Opening Help Center.',
        relatedArticles,
        source: 'script',
        cta: { label: 'Open Help', to: '/help' }
      };
    }
    if (/(^|\b)admin(\b|$)|admin\s*console/.test(normalized)) {
      return {
        content: 'Opening Admin Console.',
        relatedArticles,
        source: 'script',
        cta: { label: 'Open Admin', to: '/admin' }
      };
    }

    // Genetic Twins concept
    if (message.includes('genetic twin')) {
      return {
        content: `Genetic twins are patients whose genomic biomarkers and clinical context closely match yours, enabling evidence sharing and peer comparison.

How OncoSafeRx uses genetic twins:
- Match on tumor type/stage and key biomarkers (e.g., EGFR, ALK, BRCA, PD‑L1, MSI)
- Incorporate clinical factors (age, performance status) where available
- Surface real‑world outcomes, relevant trials, and protocols used in similar cases
- Preserve privacy: results are de‑identified aggregates; no personal data is exposed

How to use it:
- Open the Genetic Twin Network (sidebar → "Genetic Twins" or go to /genetic-twins)
- Filter by condition and biomarkers to explore your cohort
- Review suggested trials, protocols, and outcomes from similar profiles

Tip: You can also ask me to help pick biomarkers to start matching.`,
        relatedArticles,
        source: 'kb'
      };
    }

    // ECOG performance status
    if (message.includes('ecog') || message.includes('performance status')) {
      return {
        content: `ECOG performance status is a 0–5 scale describing how illness affects daily living and activity.

0: Fully active • 1: Restricted in strenuous activity • 2: Ambulatory, <50% daytime in bed • 3: Limited self‑care, >50% in bed • 4: Completely disabled • 5: Deceased.

It helps select therapy intensity and trial eligibility (most trials require ECOG 0–1, sometimes 2).`,
        relatedArticles,
        source: 'kb'
      };
    }

    // CPIC
    if (message.includes('cpic')) {
      return {
        content: `CPIC (Clinical Pharmacogenetics Implementation Consortium) publishes peer‑reviewed guidelines that translate a patient’s genotype into actionable prescribing—dose changes, alternative drugs, and monitoring. Levels A/B indicate strong/moderate evidence for using genetic results in care.`,
        relatedArticles,
        source: 'kb'
      };
    }

    // MSI-H / microsatellite instability
    if (message.includes('msi-h') || message.includes('microsatellite instability') || message.includes('dmmr')) {
      return {
        content: `MSI‑H (high microsatellite instability) or dMMR tumors have defective DNA mismatch repair, leading to high mutation rates. Clinically, MSI‑H predicts benefit from immune checkpoint inhibitors (e.g., pembrolizumab) and informs Lynch syndrome evaluation in appropriate settings.`,
        relatedArticles,
        source: 'kb'
      };
    }

    // PD-L1
    if (message.includes('pd-l1') || message.includes('pdl1')) {
      return {
        content: `PD‑L1 is a protein on tumor/immune cells measured by IHC (e.g., TPS or CPS). Higher PD‑L1 expression can predict greater likelihood of response to PD‑1/PD‑L1 inhibitors in several cancers (context‑specific cutoffs apply, e.g., TPS ≥50% in NSCLC).`,
        relatedArticles,
        source: 'kb'
      };
    }

    // TMB
    if (message.includes('tmb') || message.includes('tumor mutational burden')) {
      return {
        content: `Tumor mutational burden (TMB) is the number of somatic mutations per megabase. High TMB can correlate with benefit from immunotherapy in some settings, but utility and thresholds are tumor‑type‑specific and assay‑dependent.`,
        relatedArticles,
        source: 'kb'
      };
    }

    // BRCA
    if (message.includes('brca')) {
      return {
        content: `BRCA1/2 are DNA repair genes; pathogenic variants increase risk for breast/ovarian and other cancers. In tumors with BRCA alterations (germline or somatic), PARP inhibitors may be effective; consider genetic counseling and cascade testing where appropriate.`,
        relatedArticles,
        source: 'kb'
      };
    }

    // EGFR (oncology context)
    if (message.includes('egfr')) {
      return {
        content: `EGFR mutations (e.g., exon 19 deletions, L858R) in NSCLC predict sensitivity to EGFR TKIs (e.g., osimertinib). Resistance mechanisms (e.g., T790M, MET amplification) may guide subsequent therapy. Testing method and tumor type guide interpretation.`,
        relatedArticles,
        source: 'kb'
      };
    }

    // ALK
    if (message.includes('alk')) {
      return {
        content: `ALK rearrangements (e.g., EML4‑ALK) are actionable drivers in NSCLC and select tumors. ALK inhibitors (e.g., alectinib, lorlatinib) are standard; CNS activity and resistance profiles inform agent selection.`,
        relatedArticles,
        source: 'kb'
      };
    }

    // HER2 and HER2-low
    if (message.includes('her2-low') || message.includes('her2 low') || message.includes('her2low')) {
      return {
        content: `HER2‑low describes tumors with low HER2 expression (IHC 1+ or 2+ with negative ISH) that are not HER2‑positive, but may benefit from certain antibody–drug conjugates (e.g., trastuzumab deruxtecan) in select settings.`,
        relatedArticles,
        source: 'kb'
      };
    }
    if (message.includes('her2')) {
      return {
        content: `HER2 (ERBB2) amplification/overexpression drives some breast and gastric cancers. HER2‑positive tumors can respond to HER2‑targeted agents (e.g., trastuzumab, pertuzumab, T‑DM1, tucatinib); testing by IHC/ISH confirms status.`,
        relatedArticles,
        source: 'kb'
      };
    }

    // KRAS G12C
    if ((message.includes('kras') && message.includes('g12c')) || message.includes('kras g12c')) {
      return {
        content: `KRAS G12C is a specific KRAS mutation seen in NSCLC and other tumors. G12C inhibitors (e.g., sotorasib, adagrasib) target this alteration; co‑mutations and resistance mechanisms influence benefit.`,
        relatedArticles,
        source: 'kb'
      };
    }

    // BRAF V600E
    if ((message.includes('braf') && message.includes('v600e')) || message.includes('braf v600e')) {
      return {
        content: `BRAF V600E is an activating mutation common in melanoma and present in colorectal and other cancers. BRAF/MEK combinations (e.g., dabrafenib/trametinib) are standard in melanoma; colorectal tumors often need EGFR blockade added.`,
        relatedArticles,
        source: 'kb'
      };
    }

    // RET fusions
    if (message.includes('ret') && (message.includes('fusion') || message.includes('rearrange'))) {
      return {
        content: `RET fusions are actionable oncogenic drivers in NSCLC and thyroid cancers. Selective RET inhibitors (e.g., selpercatinib, pralsetinib) show high response rates with CNS activity.`,
        relatedArticles,
        source: 'kb'
      };
    }

    // NTRK fusions
    if (message.includes('ntrk') || message.includes('trk fusion')) {
      return {
        content: `NTRK gene fusions (NTRK1/2/3) are rare but highly actionable across tumor types. TRK inhibitors (larotrectinib, entrectinib) produce durable responses regardless of histology.`,
        relatedArticles,
        source: 'kb'
      };
    }

    // HRD
    if (message.includes('hrd') || message.includes('homologous recombination deficiency')) {
      return {
        content: `HRD (homologous recombination deficiency) indicates impaired DNA repair (e.g., BRCA1/2, PALB2). HRD tumors may be sensitive to platinum chemotherapy and PARP inhibitors; scoring methods vary by assay.`,
        relatedArticles,
        source: 'kb'
      };
    }

    // CPS vs TPS (PD-L1 scoring)
    if (message.includes('cps') || message.includes('tps')) {
      return {
        content: `PD‑L1 TPS is the % of tumor cells staining; CPS counts PD‑L1–positive tumor and immune cells over total viable tumor cells × 100. Tumor type and trial define which score and cutoff apply.`,
        relatedArticles,
        source: 'kb'
      };
    }

    // ORR / PFS / OS
    if (message.includes('orr') || message.includes('objective response rate')) {
      return {
        content: `ORR (objective response rate) is the % of patients with a predefined tumor shrinkage (CR+PR) by criteria such as RECIST.`,
        relatedArticles,
        source: 'kb'
      };
    }
    if (message.includes('pfs') || message.includes('progression-free survival')) {
      return {
        content: `PFS (progression‑free survival) is time from start of treatment (or randomization) to disease progression or death.`,
        relatedArticles,
        source: 'kb'
      };
    }
    if (message.includes('overall survival') || (message.includes(' os ') || message.endsWith(' os') || message.startsWith('os '))) {
      return {
        content: `OS (overall survival) is time from start of treatment (or randomization) to death from any cause; it’s the most definitive survival endpoint.`,
        relatedArticles,
        source: 'kb'
      };
    }

    // Clinical trials navigator (concise + CTA)
    if (
      message.includes('clinical trial') ||
      message.includes('clinical trials') ||
      message.includes('find trial') ||
      message.includes('trial match') ||
      message.includes('trial matching')
    ) {
      const bioMatch = message.match(/egfr|alk|ros1|braf|kras|ntrk|ret|brca|pd-?l1|msi|tmb|her2/);
      let bioLabel: string | null = null;
      if (bioMatch) {
        const raw = bioMatch[0];
        bioLabel = raw.toUpperCase().replace('PD-?L1','PD-L1');
      }
      return {
        content: 'Use Clinical Trials to search by condition/biomarker, set line/status/location, then review nearby sites.',
        relatedArticles,
        source: 'kb',
        cta: { label: 'Open Clinical Trials', to: '/trials' },
        suggestion: bioLabel ? { label: `Trials for ${bioLabel}`, to: `/trials?biomarker=${encodeURIComponent(bioLabel)}` } : undefined
      };
    }

    // Interaction checker (concise + CTA)
    if (
      message.includes('interactions') ||
      message.includes('interaction checker') ||
      (message.includes('check') && message.includes('interaction'))
    ) {
      const token = (userMessage.match(/[A-Za-z][A-Za-z0-9\-]{3,}/g) || [])[0];
      return {
        content: 'Open Interactions, add two or more meds, then run the check to see severity and management guidance.',
        relatedArticles,
        source: 'kb',
        cta: { label: 'Open Interactions', to: '/interactions' },
        suggestion: token ? { label: `Check interactions for ${token}`, to: `/interactions?drug=${encodeURIComponent(token)}`, type: 'interactions', query: token } : undefined
      };
    }

    // Drug Intelligence Integrator (concise + CTA)
    if (
      message.includes('drug intelligence') ||
      message.includes('intelligence integrator') ||
      message.includes('dailymed') || message.includes('daily med') ||
      message.includes('openfda') || message.includes('rxnorm') || message.includes('pubmed')
    ) {
      const token = (userMessage.match(/[A-Za-z][A-Za-z0-9\-]{3,}/g) || [])[0];
      return {
        content: 'Use the Drug Intelligence Integrator to fetch and compare RxNorm, DailyMed, OpenFDA, PubMed, and ClinicalTrials for a drug.',
        relatedArticles,
        source: 'kb',
        cta: { label: 'Open Drug Intelligence', to: '/drug-intelligence' },
        suggestion: token ? { label: `Search ${token}`, to: `/drug-intelligence?q=${encodeURIComponent(token)}`, type: 'drug-intel', query: token } : undefined
      };
    }

    // Protocols (concise + CTA)
    if (message.includes('protocol') || message.includes('regimen') || message.includes('guideline')) {
      const token = (userMessage.match(/[A-Za-z][A-Za-z0-9\-]{3,}/g) || [])[0];
      return {
        content: 'Open Protocols to browse evidence‑based regimens, dosing, and monitoring by disease area.',
        relatedArticles,
        source: 'kb',
        cta: { label: 'Open Protocols', to: '/protocols' },
        suggestion: token ? { label: `Find protocols for ${token}`, to: `/protocols?drug=${encodeURIComponent(token)}`, type: 'protocols', query: token } : undefined
      };
    }

    // Multi‑Database Search (concise + CTA)
    if (
      message.includes('multi database') || message.includes('multidatabase') ||
      message.includes('federated search') || message.includes('pubmed search')
    ) {
      return {
        content: 'Use Multi‑Database Search to query PubMed/trials/labels together, then filter and review linked results.',
        relatedArticles,
        source: 'kb',
        cta: { label: 'Open Multi‑DB Search', to: '/multi-database-search' },
        suggestion: { label: 'Search this query', to: `/multi-database-search?q=${encodeURIComponent(userMessage)}` }
      };
    }

    // Pattern matching for common queries
    if (message.includes('drug interaction') || message.includes('interaction check')) {
      return {
        content: `To check drug interactions in OncoSafeRx:

1. Go to the **Interaction Checker** from the main menu
2. Start typing medication names in the search field
3. Select drugs from the autocomplete suggestions
4. Add at least 2 medications to your list
5. Click **Check Interactions** to see results

The system will show:
- Severity levels (Major/Moderate/Minor)
- Clinical recommendations
- Monitoring requirements
- Management strategies

Would you like me to explain any specific aspect of drug interactions?`,
        relatedArticles,
        source: 'kb'
      };
    }
    
    if (message.includes('search') || message.includes('find drug') || message.includes('medication')) {
      return {
        content: `To search for medications:

1. Use the **Drug Search** feature from the main menu
2. Type at least 2 characters of the drug name
3. Select from autocomplete suggestions
4. View detailed drug information

**Search Tips:**
- Use generic or brand names
- Case doesn't matter ("ASPIRIN" = "aspirin")
- Partial names work ("pembro" finds "pembrolizumab")
- Recent searches are saved for quick access

What specific medication are you looking for?`,
        relatedArticles,
        source: 'kb'
      };
    }
    
    if (message.includes('pharmacogenomic') || message.includes('genetic') || message.includes('pgx')) {
      return {
        content: `Pharmacogenomics in OncoSafeRx helps personalize medication therapy based on genetic factors:

**Key Features:**
- CPIC guideline recommendations
- Dosing adjustments for genetic variants
- Risk assessments for adverse reactions
- Gene-drug interaction alerts

**Important Pharmacogenes:**
- **CYP2D6**: Affects tamoxifen, codeine
- **TPMT**: Critical for thiopurines
- **DPYD**: Essential for 5-FU/capecitabine
- **UGT1A1**: Important for irinotecan

Would you like to know more about a specific gene or drug?`,
        relatedArticles,
        source: 'kb'
      };
    }
    
    if (message.includes('safety') || message.includes('monitor') || message.includes('toxicity')) {
      return {
        content: `OncoSafeRx provides comprehensive safety monitoring tools:

**Safety Features:**
- Real-time toxicity alerts
- Monitoring protocol recommendations
- Dose adjustment guidelines
- Adverse event tracking

**Common Monitoring Parameters:**
- Hematologic: CBC, platelets
- Cardiac: ECHO, ECG for QT interval
- Hepatic: Liver function tests
- Renal: Creatinine, BUN

**Safety Classifications:**
- 🔴 **Major**: Life-threatening, requires immediate action
- 🟡 **Moderate**: Requires monitoring/dose adjustment
- 🟢 **Minor**: Limited clinical impact

What specific safety concern can I help you with?`,
        relatedArticles,
        source: 'kb'
      };
    }
    
    if (message.includes('help') || message.includes('how to') || message.includes('tutorial')) {
      return {
        content: `I'm here to help! Here are some things I can assist you with:

**Getting Started:**
- Navigating the OncoSafeRx interface
- Your first drug search
- Understanding the features

**Drug Interactions:**
- How to check interactions
- Understanding severity levels
- Clinical recommendations

**Pharmacogenomics:**
- Genetic testing interpretation
- Dosing adjustments
- CPIC guidelines

**Safety Monitoring:**
- Toxicity management
- Monitoring protocols
- Adverse event reporting

**Troubleshooting:**
- Common issues and solutions
- Browser compatibility
- Performance optimization

Just ask me about any specific topic!`,
        relatedArticles,
        source: 'kb'
      };
    }
    
    if (message.includes('oncology') || message.includes('cancer') || message.includes('chemotherapy')) {
      return {
        content: `OncoSafeRx specializes in oncology drug safety and interactions:

**Oncology-Specific Features:**
- Comprehensive cancer drug database
- Chemotherapy interaction checking
- Supportive care medication analysis
- Targeted therapy considerations

**Common Oncology Drugs Covered:**
- Immunotherapies (pembrolizumab, nivolumab)
- Targeted therapies (imatinib, erlotinib)
- Traditional chemotherapies (5-FU, cisplatin)
- Supportive care medications

**Special Considerations:**
- Narrow therapeutic windows
- Combination therapy protocols
- Sequential vs. concurrent administration
- Long-term toxicity monitoring

Which aspect of oncology drug management interests you most?`,
        relatedArticles,
        source: 'kb'
      };
    }
    
    if (message.includes('error') || message.includes('problem') || message.includes('not working')) {
      return {
        content: `I can help troubleshoot common issues:

**Common Solutions:**
1. **Refresh the page** - Solves many temporary issues
2. **Clear browser cache** - Fixes data loading problems
3. **Check internet connection** - Ensures proper functionality
4. **Try incognito/private mode** - Bypasses extension conflicts

**Specific Issues:**
- **Drug not found**: Try alternative names or spelling
- **Search slow**: Check connection, clear cache
- **Interactions not loading**: Ensure 2+ drugs selected
- **Page freezing**: Restart browser, check resources

**Browser Requirements:**
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- JavaScript enabled
- Cookies allowed

What specific error are you experiencing?`,
        relatedArticles,
        source: 'kb'
      };
    }
    
    if (message.includes('cpic') || message.includes('guideline')) {
      return {
        content: `CPIC (Clinical Pharmacogenetics Implementation Consortium) guidelines provide evidence-based recommendations:

**CPIC Levels:**
- **Level A**: Strong recommendation for genetic testing
- **Level B**: Moderate recommendation  
- **Level C**: Optional recommendation
- **Level D**: No recommendation

**Key CPIC Guidelines in Oncology:**
- **TPMT/NUDT15** and thiopurines
- **DPYD** and fluoropyrimidines
- **UGT1A1** and irinotecan
- **CYP2D6** and tamoxifen

**Implementation:**
- Review patient genotype
- Apply dosing recommendations
- Monitor for expected effects
- Document clinical decisions

Which specific CPIC guideline would you like to learn about?`,
        relatedArticles,
        source: 'kb'
      };
    }
    
    // Default response for unmatched queries (concise, answer-style prompt for clarification)
    return {
      content: 'Could you share a few more details so I can give a focused answer?',
      relatedArticles,
      source: 'script'
    };
  };

  const saveMessageToPatient = (message: ChatMessage) => {
    if (!currentPatient || !user) return;

    const noteContent = message.type === 'user' ? `CHAT:USER:${message.content}` : `CHAT:AI:${message.content}`;
    const newNote = {
      id: message.id,
      timestamp: message.timestamp.toISOString(),
      author: message.type === 'user' ? (user.email || 'User') : 'OncoSafeRx Assistant',
      type: 'ai-chat' as const,
      content: noteContent,
    };

    // Add the note to the patient's notes array
    const updatedNotes = [...currentPatient.notes, newNote];
    patientActions.updatePatientData({ notes: updatedNotes });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Save user message to patient context
    saveMessageToPatient(userMessage);
    
    // Intercept simple confirmations typed by the user (handles "yes", "no thanks", etc.)
    if (pendingConfirmId) {
      const text = inputValue.trim().toLowerCase();
      const isNo = /^(no|no\s+thanks|nope|nah|not\s+really|didn['’]t|did\s+not)/.test(text);
      const isYes = /^(yes|yep|yeah|sure|ok|okay|that\s+helps|makes\s+sense|got\s+it)/.test(text);
      setInputValue('');
      if (isNo) {
        // Ask for details; do not generate a new answer
        setPendingConfirmId(null);
        const follow: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: 'Thanks — what details are you looking for so I can refine the answer?',
          timestamp: new Date(),
          source: 'script'
        };
        setMessages(prev => [...prev, follow]);
        saveMessageToPatient(follow);
        setIsLoading(false);
        return;
      } else if (isYes) {
        // Acknowledge and exit; do not generate a new answer
        setPendingConfirmId(null);
        const follow: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: 'Great — anything else I can help with?',
          timestamp: new Date(),
          source: 'script'
        };
        setMessages(prev => [...prev, follow]);
        saveMessageToPatient(follow);
        setIsLoading(false);
        return;
      }
      // If it's neither clear yes nor no, continue to normal flow
    }

    setInputValue('');
    setIsLoading(true);

    // Intent: simple drug-purpose Q&A (e.g., "what is zolfresh for" / "purpose of cilicar")
    try {
      const drugIntent = (() => {
        const q = userMessage.content.toLowerCase().trim();
        const m1 = q.match(/purpose of (?:a |an |the )?drug (?:like |named |called )?([a-z0-9 .\-+]+)/i);
        const m2 = q.match(/what is (?:a |an |the )?drug (?:like |named |called )?([a-z0-9 .\-+]+)/i);
        const m3 = q.match(/what is ([a-z0-9 .\-+]+) (?:for|used for|purpose)/i);
        const m4 = q.match(/([a-z0-9 .\-+]+) purpose|([a-z0-9 .\-+]+) used for/i);
        const candidate = (m1?.[1] || m2?.[1] || m3?.[1] || m4?.[1] || m4?.[2] || '').trim();
        return candidate.length >= 2 ? candidate : null;
      })();

      if (drugIntent) {
        // Try backend search → details → label indication
        const searchResp = await fetch(`/api/drugs/search?q=${encodeURIComponent(drugIntent)}`);
        const searchData = await searchResp.json().catch(() => ({} as any));
        const hit = (searchData?.results || [])[0];
        if (hit?.rxcui) {
          const detailsResp = await fetch(`/api/drugs/${encodeURIComponent(hit.rxcui)}`);
          const details = await detailsResp.json().catch(() => ({} as any));
          // Attempt DailyMed label search for indication text
          let indicationText = '';
          try {
            const labelSearch = await fetch(`/api/drugs/labels/search?q=${encodeURIComponent(details?.name || drugIntent)}`);
            const labelData = await labelSearch.json().catch(() => ({} as any));
            const first = (labelData?.results || [])[0];
            if (first?.setid) {
              const labelDetailsResp = await fetch(`/api/drugs/labels/${first.setid}`);
              const labelDetails = await labelDetailsResp.json().catch(() => ({} as any));
              indicationText = labelDetails?.indications_and_usage?.[0] || '';
            }
          } catch {}

          const brand = (details?.brand_names || [])?.slice(0,3).join(', ');
          const generic = details?.generic_name || details?.name || hit?.name || drugIntent;
          const purpose = indicationText
            ? indicationText.replace(/\s+/g,' ').trim().slice(0, 600)
            : (details?.therapeutic_class || 'Indication information unavailable.');

          const answer = [
            `${generic}${brand ? ` (${brand})` : ''}:`,
            typeof purpose === 'string' ? purpose : String(purpose)
          ].join(' ');

          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: answer,
            timestamp: new Date(),
            source: 'drug-info'
          };
          setMessages(prev => [...prev, aiMessage]);
          saveMessageToPatient(aiMessage);
          setPendingConfirmId(aiMessage.id);
          setIsLoading(false);
          return;
        }
      }
    } catch {}

    // Intent: drug "claims" explanation (pull from Indications & Usage + Clinical Studies summaries)
    try {
      const claimsIntent = (() => {
        const q = userMessage.content.toLowerCase().trim();
        const m1 = q.match(/(?:what (?:does|do) )?([a-z0-9 .\-+]+) (?:claim|claims)(?:\?)?$/i);
        const m2 = q.match(/drug (?:claims|claim) for ([a-z0-9 .\-+]+)/i);
        const m3 = q.match(/claims? of ([a-z0-9 .\-+]+)/i);
        const m4 = q.match(/what are the claims? of ([a-z0-9 .\-+]+)/i);
        const candidate = (m1?.[1] || m2?.[1] || m3?.[1] || m4?.[1] || '').trim();
        return candidate.length >= 2 ? candidate : null;
      })();

      if (claimsIntent) {
        const searchResp = await fetch(`/api/drugs/search?q=${encodeURIComponent(claimsIntent)}`);
        const searchData = await searchResp.json().catch(() => ({} as any));
        const hit = (searchData?.results || [])[0];
        if (hit?.rxcui) {
          const detailsResp = await fetch(`/api/drugs/${encodeURIComponent(hit.rxcui)}`);
          const details = await detailsResp.json().catch(() => ({} as any));
          let indications = '';
          let studies = '';
          try {
            const labelSearch = await fetch(`/api/drugs/labels/search?q=${encodeURIComponent(details?.name || claimsIntent)}`);
            const labelData = await labelSearch.json().catch(() => ({} as any));
            const first = (labelData?.results || [])[0];
            if (first?.setid) {
              const labelDetailsResp = await fetch(`/api/drugs/labels/${first.setid}`);
              const labelDetails = await labelDetailsResp.json().catch(() => ({} as any));
              indications = (labelDetails?.indications_and_usage?.[0] || '').replace(/\s+/g,' ').trim();
              const cs = Array.isArray(labelDetails?.clinical_studies) ? labelDetails?.clinical_studies[0] : '';
              studies = (cs || '').replace(/\s+/g,' ').trim();
            }
          } catch {}

          const brand = (details?.brand_names || [])?.slice(0,3).join(', ');
          const generic = details?.generic_name || details?.name || hit?.name || claimsIntent;
          const parts = [] as string[];
          if (indications) parts.push(`Indications & Usage: ${indications}`);
          if (studies) parts.push(`Clinical Studies: ${studies}`);
          const content = parts.length ? parts.join('\n\n') : 'Label claims unavailable. Try viewing the FDA label or clinical studies.';

          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: `${generic}${brand ? ` (${brand})` : ''} —\n${content}`,
            timestamp: new Date(),
            source: 'drug-claims'
          };
          setMessages(prev => [...prev, aiMessage]);
          saveMessageToPatient(aiMessage);
          setPendingConfirmId(aiMessage.id);
          setIsLoading(false);
          return;
        }
      }
    } catch {}

    // Handle release notes / new features intent via API
    try {
      const q = inputValue.toLowerCase();
      const wantsWhatsNew = /what'?s new|new features|release notes|integrations|auth diagnostics|api keys|openapi/.test(q);
      if (wantsWhatsNew) {
        const resp = await fetch('/api/release-notes');
        let body: any = null;
        try { body = await resp.json(); } catch {}
        let content = '';
        if (resp.ok && body?.version) {
          content += `Here are the latest OncoSafeRx updates (${body.version} on ${body.date}):\n\n`;
          if (body.added) content += `Added:\n${body.added}\n\n`;
          if (body.changed) content += `Changed:\n${body.changed}\n\n`;
          if (body.fixed) content += `Fixed:\n${body.fixed}\n\n`;
          content += `You can find the OpenAPI spec at ${body.openapi}.`;
        } else {
          content = 'I could not load release notes right now. Please try again from the Admin Console → System/Integrations.';
        }
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        saveMessageToPatient(aiMessage);
        setIsLoading(false);
        return;
      }
    } catch {}

    // Optional AI chat endpoint if enabled
    try {
      const enableAI = String((import.meta as any)?.env?.VITE_ENABLE_AI_CHAT || '').toLowerCase() === 'true';
      const endpoint = (import.meta as any)?.env?.VITE_AI_CHAT_ENDPOINT || '/api/ai/chat';
      if (enableAI) {
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userMessage.content, page: window.location.pathname })
        });
        if (resp.ok) {
          const body = await resp.json().catch(() => ({}));
          const text = body?.answer || body?.content || (typeof body === 'string' ? body : '');
          if (text) {
            const aiMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              type: 'ai',
              content: text,
              timestamp: new Date(),
              relatedArticles: undefined,
              source: 'openai'
            };
            setMessages(prev => [...prev, aiMessage]);
            saveMessageToPatient(aiMessage);
            setPendingConfirmId(aiMessage.id);
            setIsLoading(false);
            return;
          }
        }
      }
    } catch {}

    // Fallback to KB/scripted response
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage.content);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        relatedArticles: aiResponse.relatedArticles,
        source: aiResponse.source
      };
      setMessages(prev => [...prev, aiMessage]);
      saveMessageToPatient(aiMessage);
      setPendingConfirmId(aiMessage.id);
      setIsLoading(false);
    }, 700 + Math.random() * 600);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-xl z-50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">OncoSafeRx Assistant</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Body */}
      {!isMinimized && (
        <>
          {showTip && (
            <div className="px-4 pt-3">
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded p-3">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="flex-1 text-xs text-blue-800">
                  Tips: Answers indicate their source (Knowledge Base vs AI). You can also find help articles in the Help center.
                </div>
                <button
                  className="text-xs text-blue-700 hover:text-blue-900"
                  onClick={() => {
                    try {
                      const gv = (window as any)?.__OSRX_FEATURES__?.guidanceVersion ?? (import.meta as any)?.env?.VITE_GUIDANCE_VERSION ?? '0';
                      localStorage.setItem(`osrx_tip_dismissed:ai-chat:${gv}`,'1');
                    } catch {}
                    setShowTip(false);
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-2 max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' ? 'bg-blue-600' : 'bg-gray-100'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div className={`px-3 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs mt-1 opacity-70 flex items-center gap-2">
                      <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {message.type === 'ai' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-gray-300 bg-white text-gray-700">
                          {message.source === 'kb' && 'Source: Knowledge Base'}
                          {message.source === 'openai' && 'Source: AI (OpenAI)'}
                          {message.source === 'script' && 'Source: Assistant'}
                        </span>
                      )}
                    </div>
                    {message.type === 'ai' && pendingConfirmId === message.id && (
                      <div className="mt-2 flex items-center gap-2 text-xs group">
                        <span className="text-gray-700">Did that answer your question?</span>
                        {message.cta && (
                          <button
                            className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200"
                            onClick={() => {
                              try { (window as any).scrollTo(0,0); } catch {}
                              try { (window as any).location && navigate(message.cta!.to); } catch {}
                              setPendingConfirmId(null);
                            }}
                          >
                            {message.cta.label}
                          </button>
                        )}
                        {message.cta && (
                          <button
                            className="px-2 py-0.5 rounded border text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy link"
                            onClick={() => {
                              const href = new URL(message.cta!.to, window.location.origin).toString();
                              copyToClipboard(href);
                              try { showToast('success', 'Link copied'); } catch {}
                            }}
                          >
                            Copy link
                          </button>
                        )}
                        {message.suggestion && (
                          <button
                            className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200"
                            onClick={async () => {
                              try { (window as any).scrollTo(0,0); } catch {}
                              const sug = message.suggestion!;
                              const q = (sug.query || '').trim();
                              if (q && (sug.type === 'interactions' || sug.type === 'drug-intel' || sug.type === 'protocols')) {
                                try {
                                  const resp = await fetch(`/api/drugs/search?q=${encodeURIComponent(q)}`);
                                  if (resp.ok) {
                                    const data = await resp.json();
                                    const hit = (data.results || [])[0];
                                    if (hit) {
                                      if (sug.type === 'interactions') {
                                        const to = `/interactions?drug=${encodeURIComponent(hit.rxcui || hit.name || q)}`;
                                        navigate(to);
                                      } else if (sug.type === 'drug-intel') {
                                        const to = `/drug-intelligence?q=${encodeURIComponent(hit.name || q)}`;
                                        navigate(to);
                                      } else if (sug.type === 'protocols') {
                                        const to = `/protocols?drug=${encodeURIComponent(hit.name || q)}`;
                                        navigate(to);
                                      } else {
                                        navigate(sug.to);
                                      }
                                      setPendingConfirmId(null);
                                      return;
                                    }
                                  }
                                } catch {}
                              }
                              navigate(sug.to);
                              setPendingConfirmId(null);
                            }}
                          >
                            {message.suggestion.label}
                          </button>
                        )}
                        {message.suggestion && (
                          <button
                            className="px-2 py-0.5 rounded border text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy link"
                            onClick={() => {
                              const href = new URL(message.suggestion!.to, window.location.origin).toString();
                              copyToClipboard(href);
                              try { showToast('success', 'Link copied'); } catch {}
                            }}
                          >
                            Copy link
                          </button>
                        )}
                        <button
                          className="px-2 py-0.5 rounded bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"
                          onClick={() => {
                            setPendingConfirmId(null);
                            const follow: ChatMessage = {
                              id: (Date.now() + 2).toString(),
                              type: 'ai',
                              content: 'Great — anything else I can help with?',
                              timestamp: new Date(),
                              source: 'script'
                            };
                            setMessages(prev => [...prev, follow]);
                            saveMessageToPatient(follow);
                          }}
                        >
                          Yes
                        </button>
                        <button
                          className="px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 hover:bg-red-200"
                          onClick={() => {
                            setPendingConfirmId(null);
                            const follow: ChatMessage = {
                              id: (Date.now() + 2).toString(),
                              type: 'ai',
                              content: 'Thanks — what details are you looking for so I can refine the answer?',
                              timestamp: new Date(),
                              source: 'script'
                            };
                            setMessages(prev => [...prev, follow]);
                            saveMessageToPatient(follow);
                          }}
                        >
                          No
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex space-x-2 max-w-xs lg:max-w-md">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-gray-100 text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about OncoSafeRx..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              Press Enter to send • Shift+Enter for new line
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChat;
