import React, { useState } from 'react';
import { 
  BookOpen, 
  Github, 
  Key, 
  Settings, 
  ExternalLink, 
  Copy, 
  Check,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import Modal from '../UI/Modal';

interface GitHubSetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const GitHubSetupGuide: React.FC<GitHubSetupGuideProps> = ({ isOpen, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const steps = [
    {
      title: 'Create or Choose Repository',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            First, you'll need a GitHub repository where the issues will be created. This can be:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Your main OncoSafeRx repository (if you have one)</li>
            <li>A dedicated feedback/issues repository</li>
            <li>Any repository where you want to track feedback</li>
          </ul>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Repository Requirements:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Must have Issues enabled (default for most repositories)</li>
              <li>• You must have write access to create issues</li>
              <li>• Can be public or private</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: 'Create Personal Access Token',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Create a Personal Access Token (PAT) to authenticate with GitHub's API.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">1. Go to GitHub Settings</span>
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
              >
                <span className="text-sm">Open</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">2. Click "Generate new token" → "Generate new token (classic)"</span>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium mb-2">3. Configure the token:</div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Note:</strong> "OncoSafeRx Feedback Integration"</li>
                <li>• <strong>Expiration:</strong> Choose appropriate duration</li>
                <li>• <strong>Scopes:</strong> Select "repo" (or "public_repo" for public repositories only)</li>
              </ul>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">4. Click "Generate token" and copy the token immediately</span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>Important:</strong> Copy the token immediately after creation. GitHub will only show it once for security reasons.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Set Up Repository Labels',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            OncoSafeRx automatically creates labels for better issue organization. You can create these labels in advance:
          </p>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Priority Labels:</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'priority:critical', color: '#d73a49', desc: 'Critical issues' },
                  { name: 'priority:high', color: '#f66a0a', desc: 'High priority' },
                  { name: 'priority:medium', color: '#fbca04', desc: 'Medium priority' },
                  { name: 'priority:low', color: '#28a745', desc: 'Low priority' }
                ].map((label) => (
                  <div key={label.name} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="text-sm font-mono">{label.name}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(label.name, label.name)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {copiedText === label.name ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Type Labels:</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'bug', color: '#d73a49' },
                  { name: 'enhancement', color: '#a2eeef' },
                  { name: 'question', color: '#d876e3' },
                  { name: 'security', color: '#0052cc' }
                ].map((label) => (
                  <div key={label.name} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="text-sm font-mono">{label.name}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(label.name, label.name)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {copiedText === label.name ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Auto-Creation</h4>
            <p className="text-sm text-blue-800">
              Don't worry if you skip this step! GitHub will automatically create labels when OncoSafeRx tries to use them.
              Creating them in advance just ensures consistent colors and descriptions.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Configure OncoSafeRx',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Now configure the GitHub integration in OncoSafeRx:
          </p>
          
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium mb-2">1. Repository Information:</div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Owner:</strong> Your GitHub username or organization name</li>
                <li>• <strong>Repository:</strong> The repository name (not the full URL)</li>
              </ul>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium mb-2">2. Authentication:</div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Paste the Personal Access Token you created</li>
                <li>• Leave API URL empty (uses GitHub.com by default)</li>
              </ul>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium mb-2">3. Test & Enable:</div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Click "Test Connection" to verify setup</li>
                <li>• Enable the integration if test succeeds</li>
                <li>• Save the configuration</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Example Configuration:</h4>
            <div className="text-sm font-mono text-green-800 space-y-1">
              <div>Owner: <span className="bg-white px-1 rounded">your-username</span></div>
              <div>Repository: <span className="bg-white px-1 rounded">oncosaferx-feedback</span></div>
              <div>Token: <span className="bg-white px-1 rounded">ghp_xxxxxxxxxxxxxxxxxxxxx</span></div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Test the Integration',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Once configured, test the integration to ensure everything works correctly:
          </p>
          
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium mb-2">1. Submit Test Feedback:</div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use the feedback button to submit a test report</li>
                <li>• Try different feedback types (bug, feature request, etc.)</li>
                <li>• Include detailed information for testing</li>
              </ul>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium mb-2">2. Verify GitHub Issues:</div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Check your GitHub repository for new issues</li>
                <li>• Verify labels are applied correctly</li>
                <li>• Confirm issue content includes all feedback details</li>
              </ul>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium mb-2">3. Check Feedback Dashboard:</div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• View the feedback admin dashboard</li>
                <li>• Look for GitHub issue links in recent feedback</li>
                <li>• Verify the integration status</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">What Gets Created:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• GitHub issue with formatted title and description</li>
              <li>• Automatic labels based on feedback type and priority</li>
              <li>• Browser and environment information</li>
              <li>• Direct link back to the OncoSafeRx page</li>
              <li>• Reproduction steps for bug reports</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="GitHub Integration Setup Guide" size="lg">
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center space-x-2">
          {steps.map((_, index) => (
            <React.Fragment key={index}>
              <button
                onClick={() => setActiveStep(index)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index === activeStep
                    ? 'bg-primary-600 text-white'
                    : index < activeStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index < activeStep ? <Check className="w-4 h-4" /> : index + 1}
              </button>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${index < activeStep ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              {activeStep === 0 && <Github className="w-5 h-5 text-primary-600" />}
              {activeStep === 1 && <Key className="w-5 h-5 text-primary-600" />}
              {activeStep === 2 && <Settings className="w-5 h-5 text-primary-600" />}
              {activeStep === 3 && <BookOpen className="w-5 h-5 text-primary-600" />}
              {activeStep === 4 && <Check className="w-5 h-5 text-primary-600" />}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{steps[activeStep].title}</h3>
              <p className="text-sm text-gray-600">Step {activeStep + 1} of {steps.length}</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            {steps[activeStep].content}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm text-gray-500">
            {activeStep + 1} of {steps.length}
          </span>

          {activeStep < steps.length - 1 ? (
            <button
              onClick={() => setActiveStep(activeStep + 1)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default GitHubSetupGuide;