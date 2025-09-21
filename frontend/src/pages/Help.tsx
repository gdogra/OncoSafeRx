import React, { useState } from 'react';
import { HelpCircle, MessageCircle, Book, Search, Lightbulb, Users, Mail, ExternalLink } from 'lucide-react';
import KnowledgeBase from '../components/Help/KnowledgeBase';
import AIChat from '../components/Help/AIChat';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';

const Help: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'knowledge-base' | 'support'>('overview');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const quickHelp = [
    {
      title: 'Drug Search',
      description: 'Find medications by name, RXCUI, or active ingredient',
      icon: Search,
      tips: [
        'Type at least 2 characters to see suggestions',
        'Use generic or brand names',
        'Search is case-insensitive',
        'Recent searches are saved for quick access'
      ]
    },
    {
      title: 'Interaction Checker',
      description: 'Check for potential drug interactions',
      icon: HelpCircle,
      tips: [
        'Add at least 2 medications',
        'Review severity ratings carefully',
        'Follow clinical recommendations',
        'Consider patient-specific factors'
      ]
    },
    {
      title: 'Pharmacogenomics',
      description: 'Understand genetic factors affecting drug response',
      icon: Lightbulb,
      tips: [
        'Enter known genetic test results',
        'Review CPIC guidelines',
        'Consider dosing adjustments',
        'Document genetic factors'
      ]
    }
  ];

  const supportOptions = [
    {
      title: 'AI Assistant',
      description: 'Get instant help with OncoSafeRx features and clinical questions',
      icon: MessageCircle,
      action: () => setIsChatOpen(true),
      actionText: 'Start Chat'
    },
    {
      title: 'Knowledge Base',
      description: 'Browse comprehensive guides and documentation',
      icon: Book,
      action: () => setActiveTab('knowledge-base'),
      actionText: 'Browse Articles'
    },
    {
      title: 'Email Support',
      description: 'Contact our support team for technical assistance',
      icon: Mail,
      action: () => window.open('mailto:support@oncosaferx.com'),
      actionText: 'Send Email'
    },
    {
      title: 'Community Forum',
      description: 'Connect with other users and share best practices',
      icon: Users,
      action: () => window.open('https://community.oncosaferx.com', '_blank'),
      actionText: 'Visit Forum'
    },
    {
      title: 'Auth Diagnostics',
      description: 'Check your session, server verification, and profile status',
      icon: ExternalLink,
      action: () => window.location.assign('/auth-diagnostics'),
      actionText: 'Open Diagnostics'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <HelpCircle className="w-16 h-16 mx-auto mb-4 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">How can we help you?</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Welcome to the OncoSafeRx Help Center. Find answers to your questions, browse our knowledge base, 
          or chat with our AI assistant for instant help.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {supportOptions.map((option) => (
          <Card
            key={option.title}
            className="text-center p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={option.action}
          >
            <option.icon className="w-10 h-10 mx-auto mb-3 text-blue-600" />
            <h3 className="font-semibold text-gray-900 mb-2">{option.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{option.description}</p>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              {option.actionText} →
            </button>
          </Card>
        ))}
      </div>

      {/* Quick Help */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Help</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {quickHelp.map((item) => (
            <Card key={item.title} className="p-6">
              <item.icon className="w-8 h-8 mb-3 text-blue-600" />
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{item.description}</p>
              <ul className="space-y-1">
                {item.tips.map((tip, index) => (
                  <li key={index} className="text-xs text-gray-500 flex items-start">
                    <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <Alert type="info" title="New to OncoSafeRx?">
        <div className="flex items-center justify-between">
          <p>Check out our getting started guide to learn the basics and discover key features.</p>
          <button
            onClick={() => setActiveTab('knowledge-base')}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap"
          >
            Get Started
          </button>
        </div>
      </Alert>

      {/* Contact Information */}
      <Card className="bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need More Help?</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Mail className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <p className="font-medium text-gray-900">Email Support</p>
              <p className="text-sm text-gray-600">support@oncosaferx.com</p>
              <p className="text-xs text-gray-500 mt-1">Response within 24 hours</p>
            </div>
            <div>
              <ExternalLink className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <p className="font-medium text-gray-900">Documentation</p>
              <p className="text-sm text-gray-600">docs.oncosaferx.com</p>
              <p className="text-xs text-gray-500 mt-1">Technical documentation</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Support & Contact</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Get help when you need it. Our support team is here to assist you with any questions or issues.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6">
          <MessageCircle className="w-8 h-8 mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Assistant</h3>
          <p className="text-gray-600 mb-4">
            Get instant answers to your questions about OncoSafeRx features, drug interactions, 
            and clinical guidance.
          </p>
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Start Chat
          </button>
        </Card>

        <Card className="p-6">
          <Mail className="w-8 h-8 mb-4 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Email Support</h3>
          <p className="text-gray-600 mb-4">
            For technical issues, account questions, or detailed inquiries that require 
            human assistance.
          </p>
          <button
            onClick={() => window.open('mailto:support@oncosaferx.com')}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Send Email
          </button>
        </Card>
      </div>

      <Alert type="info" title="Before Contacting Support">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Check our knowledge base for answers to common questions</li>
          <li>Try the AI assistant for instant help</li>
          <li>Include specific error messages or screenshots when reporting issues</li>
          <li>Mention your browser type and version for technical problems</li>
        </ul>
      </Alert>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Help Overview
          </button>
          <button
            onClick={() => setActiveTab('knowledge-base')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'knowledge-base'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'support'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Support & Contact
          </button>
        </div>

        {/* Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'knowledge-base' && <KnowledgeBase />}
        {activeTab === 'support' && renderSupport()}
      </div>

      {/* AI Chat */}
      <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-4 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          title="Chat with AI Assistant"
        >
          <MessageCircle className="w-6 h-6 mx-auto" />
        </button>
      )}
    </div>
  );
};

export default Help;
