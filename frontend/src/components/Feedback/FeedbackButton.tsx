import React, { useState } from 'react';
import { MessageSquare, X, Bug, Lightbulb, HelpCircle } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { FeedbackType } from '../../types/feedback';

interface FeedbackButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

const FeedbackButton: React.FC<FeedbackButtonProps> = ({ 
  position = 'bottom-right', 
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<FeedbackType>('question');

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const quickActions = [
    { 
      type: 'bug' as FeedbackType, 
      label: 'Report Bug', 
      icon: Bug, 
      color: 'bg-red-500 hover:bg-red-600' 
    },
    { 
      type: 'feature_request' as FeedbackType, 
      label: 'Request Feature', 
      icon: Lightbulb, 
      color: 'bg-blue-500 hover:bg-blue-600' 
    },
    { 
      type: 'question' as FeedbackType, 
      label: 'Ask Question', 
      icon: HelpCircle, 
      color: 'bg-green-500 hover:bg-green-600' 
    }
  ];

  const handleQuickAction = (type: FeedbackType) => {
    setSelectedType(type);
    setIsModalOpen(true);
    setIsExpanded(false);
  };

  const handleMainButtonClick = () => {
    if (isExpanded) {
      setSelectedType('question');
      setIsModalOpen(true);
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  };

  return (
    <>
      {/* Main feedback widget */}
      <div className={`fixed z-40 ${positionClasses[position]} ${className}`}>
        {/* Quick action buttons */}
        {isExpanded && (
          <div className="mb-4 space-y-2">
            {quickActions.map(({ type, label, icon: Icon, color }, index) => (
              <div
                key={type}
                className="transform transition-all duration-200 ease-out"
                style={{
                  animation: `slideIn 0.2s ease-out ${index * 0.05}s both`
                }}
              >
                <button
                  onClick={() => handleQuickAction(type)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 text-white text-sm font-medium rounded-full shadow-lg
                    ${color} transition-all duration-200 hover:shadow-xl hover:scale-105
                  `}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main button */}
        <button
          onClick={handleMainButtonClick}
          className={`
            w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg 
            flex items-center justify-center transition-all duration-200 hover:shadow-xl hover:scale-110
            ${isExpanded ? 'rotate-180' : ''}
          `}
          title={isExpanded ? 'General Feedback' : 'Feedback'}
          aria-label="Feedback"
        >
          {isExpanded ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageSquare className="w-6 h-6" />
          )}
        </button>

        {/* Close overlay when expanded */}
        {isExpanded && (
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialType={selectedType}
        initialComponent={getCurrentComponent()}
      />

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

// Helper function to get current component context
function getCurrentComponent(): string {
  const path = window.location.pathname;
  const componentMap: Record<string, string> = {
    '/': 'Dashboard',
    '/drug-search': 'Drug Search',
    '/interactions': 'Interaction Checker',
    '/protocols': 'Clinical Protocols',
    '/genomics': 'Pharmacogenomics',
    '/trials': 'Clinical Trials',
    '/regimens': 'Treatment Regimens'
  };

  return componentMap[path] || 'Unknown Page';
}

export default FeedbackButton;