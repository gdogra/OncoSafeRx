import React, { useState } from 'react';
import Modal from '../UI/Modal';
import { 
  Heart, 
  Send, 
  Loader, 
  AlertTriangle, 
  CheckCircle,
  BookOpen,
  Calendar,
  Tag
} from 'lucide-react';

interface PatientStoryFormData {
  title: string;
  authorName: string;
  anonymousSubmission: boolean;
  storyContent: string;
  cancerType: string;
  treatmentPhase: string;
  keyTakeaways: string;
  email: string;
  allowContact: boolean;
  consentToPublish: boolean;
}

interface PatientStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PatientStoryModal: React.FC<PatientStoryModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<PatientStoryFormData>({
    title: '',
    authorName: '',
    anonymousSubmission: false,
    storyContent: '',
    cancerType: '',
    treatmentPhase: '',
    keyTakeaways: '',
    email: '',
    allowContact: false,
    consentToPublish: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const treatmentPhases = [
    'Recently Diagnosed',
    'Currently in Treatment',
    'Completed Treatment',
    'Long-term Survivor',
    'Caregiver Perspective',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.storyContent.trim()) {
      setError('Please provide both a title and your story.');
      return;
    }

    if (!formData.consentToPublish) {
      setError('Please provide consent to publish your story.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Submit the story via feedback system with a special type
      const storySubmission = {
        type: 'patient_story',
        title: formData.title,
        description: formData.storyContent,
        component: 'Patient Success Stories',
        email: formData.email,
        allowContact: formData.allowContact,
        metadata: {
          authorName: formData.anonymousSubmission ? 'Anonymous' : formData.authorName,
          cancerType: formData.cancerType,
          treatmentPhase: formData.treatmentPhase,
          keyTakeaways: formData.keyTakeaways,
          anonymousSubmission: formData.anonymousSubmission,
          consentToPublish: formData.consentToPublish
        }
      };

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storySubmission),
      });

      if (!response.ok) {
        throw new Error('Failed to submit story');
      }

      setSubmitted(true);
      
      // Reset form after a delay
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          title: '',
          authorName: '',
          anonymousSubmission: false,
          storyContent: '',
          cancerType: '',
          treatmentPhase: '',
          keyTakeaways: '',
          email: '',
          allowContact: false,
          consentToPublish: false
        });
        onClose();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit story');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Story Submitted" size="md">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank you for sharing your story!</h3>
          <p className="text-gray-600 mb-4">
            Your story has been submitted for review. If approved, it will be featured in our Patient Success Stories 
            section to help inspire and support others on their cancer journey.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg text-left">
            <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Our team will review your submission within 5-7 business days</li>
              <li>• We may contact you for clarification or additional details</li>
              <li>• Once approved, your story will be published on our platform</li>
              <li>• You'll receive a notification when your story goes live</li>
            </ul>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Your Success Story" size="lg">
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <BookOpen className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Help Others by Sharing Your Journey</h4>
            <p className="text-sm text-blue-700 mt-1">
              Your story could provide hope, practical advice, and emotional support to someone facing similar challenges. 
              Share your experience, lessons learned, and what helped you along the way.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Story Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Story Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Overcoming treatment fatigue, Finding strength in community, etc."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Author Information */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymousSubmission"
              checked={formData.anonymousSubmission}
              onChange={(e) => setFormData(prev => ({ ...prev, anonymousSubmission: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="anonymousSubmission" className="text-sm text-gray-700">
              Submit this story anonymously
            </label>
          </div>

          {!formData.anonymousSubmission && (
            <div>
              <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
                How would you like to be credited?
              </label>
              <input
                type="text"
                id="authorName"
                value={formData.authorName}
                onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                placeholder="e.g., Sarah M., Dr. Johnson, First name only, etc."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can use your full name, first name only, initials, or any other way you'd prefer to be identified.
              </p>
            </div>
          )}
        </div>

        {/* Cancer Type and Treatment Phase */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cancerType" className="block text-sm font-medium text-gray-700 mb-1">
              Cancer Type (Optional)
            </label>
            <input
              type="text"
              id="cancerType"
              value={formData.cancerType}
              onChange={(e) => setFormData(prev => ({ ...prev, cancerType: e.target.value }))}
              placeholder="e.g., Breast cancer, Lung cancer, etc."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="treatmentPhase" className="block text-sm font-medium text-gray-700 mb-1">
              Treatment Phase
            </label>
            <select
              id="treatmentPhase"
              value={formData.treatmentPhase}
              onChange={(e) => setFormData(prev => ({ ...prev, treatmentPhase: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select phase...</option>
              {treatmentPhases.map(phase => (
                <option key={phase} value={phase}>{phase}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Story Content */}
        <div>
          <label htmlFor="storyContent" className="block text-sm font-medium text-gray-700 mb-1">
            Your Story <span className="text-red-500">*</span>
          </label>
          <textarea
            id="storyContent"
            value={formData.storyContent}
            onChange={(e) => setFormData(prev => ({ ...prev, storyContent: e.target.value }))}
            placeholder="Share your experience, challenges you faced, strategies that helped, lessons learned, and any advice you'd give to others in similar situations..."
            rows={8}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Feel free to include specific examples, practical tips, emotional insights, or anything else that might help others.
          </p>
        </div>

        {/* Key Takeaways */}
        <div>
          <label htmlFor="keyTakeaways" className="block text-sm font-medium text-gray-700 mb-1">
            Key Takeaways (Optional)
          </label>
          <textarea
            id="keyTakeaways"
            value={formData.keyTakeaways}
            onChange={(e) => setFormData(prev => ({ ...prev, keyTakeaways: e.target.value }))}
            placeholder="Summarize the most important lessons or advice from your experience..."
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="allowContact" className="text-sm text-gray-700">
              Allow us to contact you for follow-up questions or updates
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {/* Consent */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="consentToPublish"
              checked={formData.consentToPublish}
              onChange={(e) => setFormData(prev => ({ ...prev, consentToPublish: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
              required
            />
            <label htmlFor="consentToPublish" className="text-sm text-gray-700">
              <span className="font-medium">I consent to publish my story</span> on the OncoSafeRx platform to help other patients and caregivers. 
              I understand that my story may be edited for length and clarity, and that I can request its removal at any time by contacting support.
              <span className="text-red-500"> *</span>
            </label>
          </div>
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
            disabled={isSubmitting || !formData.title.trim() || !formData.storyContent.trim() || !formData.consentToPublish}
            className="flex items-center space-x-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4" />
                <span>Submit Story</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PatientStoryModal;