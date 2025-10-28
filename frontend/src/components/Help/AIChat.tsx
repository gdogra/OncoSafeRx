import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Minimize2, Maximize2, X, Loader } from 'lucide-react';
import { searchKnowledgeBase } from '../../data/knowledgeBase';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  relatedArticles?: string[];
  source?: 'kb' | 'openai' | 'script';
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, className = '' }) => {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const generateAIResponse = (userMessage: string): { content: string; relatedArticles?: string[]; source: 'kb' | 'script' } => {
    const message = userMessage.toLowerCase();
    
    // Search knowledge base for relevant articles
    const relatedArticles = searchKnowledgeBase(userMessage).slice(0, 3).map(article => article.id);
    
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
    
    // Default response for unmatched queries
    return {
      content: `I'd be happy to help! I can assist you with:

• **Drug Interactions** - How to check and interpret results
• **Drug Search** - Finding medications and their details  
• **Pharmacogenomics** - Genetic factors affecting drug response
• **Safety Monitoring** - Toxicity management and protocols
• **Navigation** - Using OncoSafeRx features effectively
• **Troubleshooting** - Solving common technical issues

Could you be more specific about what you'd like help with? You can ask questions like:
- "How do I check drug interactions?"
- "What does this interaction mean?"
- "How do I search for a medication?"
- "What is pharmacogenomics?"`,
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
    
    setInputValue('');
    setIsLoading(true);

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
