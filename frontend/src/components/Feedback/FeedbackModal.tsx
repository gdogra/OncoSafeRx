import React, { useState } from 'react';
import Modal from '../UI/Modal';
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  ThumbsUp, 
  AlertTriangle, 
  HelpCircle,
  Zap,
  Target,
  Send,
  Loader
} from 'lucide-react';
import { FeedbackType, FeedbackFormData } from '../../types/feedback';
import { feedbackService } from '../../services/feedbackService';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: FeedbackType;
  initialComponent?: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  onClose, 
  initialType = 'question',
  initialComponent 
}) => {
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: initialType,
    title: '',
    description: '',
    reproductionSteps: '',
    expectedBehavior: '',
    actualBehavior: '',
    component: initialComponent || '',
    email: '',
    allowContact: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const feedbackTypes: Array<{ 
    type: FeedbackType; 
    label: string; 
    icon: React.ComponentType<any>; 
    color: string;
    description: string;
  }> = [
    { 
      type: 'bug', 
      label: 'Bug Report', 
      icon: Bug, 
      color: 'text-red-600 bg-red-100',
      description: 'Something is broken or not working as expected'
    },
    { 
      type: 'feature_request', 
      label: 'Feature Request', 
      icon: Lightbulb, 
      color: 'text-blue-600 bg-blue-100',
      description: 'Suggest a new feature or functionality'
    },
    { 
      type: 'improvement', 
      label: 'Improvement', 
      icon: Target, 
      color: 'text-green-600 bg-green-100',
      description: 'Suggest how to make something better'
    },
    { 
      type: 'usability_issue', 
      label: 'Usability Issue', 
      icon: AlertTriangle, 
      color: 'text-yellow-600 bg-yellow-100',
      description: 'Something is confusing or hard to use'
    },
    { 
      type: 'performance_issue', 
      label: 'Performance Issue', 
      icon: Zap, 
      color: 'text-purple-600 bg-purple-100',
      description: 'Something is slow or unresponsive'
    },
    { 
      type: 'question', 
      label: 'Question', 
      icon: HelpCircle, 
      color: 'text-gray-600 bg-gray-100',
      description: 'Ask a question about how to use something'
    },
    { 
      type: 'compliment', 
      label: 'Compliment', 
      icon: ThumbsUp, 
      color: 'text-pink-600 bg-pink-100',
      description: 'Share positive feedback about something you like'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please provide both a title and description.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await feedbackService.submitFeedback(formData);
      setSubmitted(true);
      
      // Reset form after a delay
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          type: 'question',
          title: '',
          description: '',
          reproductionSteps: '',
          expectedBehavior: '',
          actualBehavior: '',
          component: '',
          email: '',
          allowContact: false
        });
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTypeInfo = feedbackTypes.find(t => t.type === formData.type);

  if (submitted) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Feedback Submitted" size="md">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ThumbsUp className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank you for your feedback!</h3>
          <p className="text-gray-600">
            Your feedback has been submitted and automatically categorized for our development team.
            We appreciate you helping us improve OncoSafeRx.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Your Feedback" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Feedback Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What type of feedback do you have?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {feedbackTypes.map(({ type, label, icon: Icon, color, description }) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type }))}
                className={`
                  p-3 text-left border rounded-lg transition-all
                  ${formData.type === type 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{label}</div>
                    <div className="text-xs text-gray-500 mt-1">{description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder={`Brief summary of your ${selectedTypeInfo?.label.toLowerCase()}`}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Provide detailed information about your feedback..."
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        {/* Bug-specific fields */}
        {(formData.type === 'bug' || formData.type === 'usability_issue') && (
          <div className="space-y-4 p-4 bg-red-50 rounded-lg">
            <h4 className="text-sm font-medium text-red-900">Additional Bug Information</h4>
            
            <div>
              <label htmlFor="reproductionSteps" className="block text-sm font-medium text-gray-700 mb-1">
                Steps to Reproduce
              </label>
              <textarea
                id="reproductionSteps"
                value={formData.reproductionSteps}
                onChange={(e) => setFormData(prev => ({ ...prev, reproductionSteps: e.target.value }))}
                placeholder="1. Go to...&#10;2. Click on...&#10;3. Notice that..."
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="expectedBehavior" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Behavior
                </label>
                <textarea
                  id="expectedBehavior"
                  value={formData.expectedBehavior}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedBehavior: e.target.value }))}
                  placeholder="What should happen?"
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="actualBehavior" className="block text-sm font-medium text-gray-700 mb-1">
                  Actual Behavior
                </label>
                <textarea
                  id="actualBehavior"
                  value={formData.actualBehavior}
                  onChange={(e) => setFormData(prev => ({ ...prev, actualBehavior: e.target.value }))}
                  placeholder="What actually happens?"
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Component/Feature */}
        <div>
          <label htmlFor="component" className="block text-sm font-medium text-gray-700 mb-1">
            Component or Feature (Optional)
          </label>
          <input
            type="text"
            id="component"
            value={formData.component}
            onChange={(e) => setFormData(prev => ({ ...prev, component: e.target.value }))}
            placeholder="e.g., Drug Search, Interaction Checker, Protocol Modal"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Contact Information */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="allowContact"
              checked={formData.allowContact}
              onChange={(e) => setFormData(prev => ({ ...prev, allowContact: e.target.checked }))}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="allowContact" className="text-sm text-gray-700">
              Allow us to contact you for follow-up questions
            </label>
          </div>

          {formData.allowContact && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@example.com"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Feedback</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FeedbackModal;