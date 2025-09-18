import React, { useState, useEffect } from 'react';
import { 
  Github, 
  Settings, 
  Check, 
  X, 
  AlertTriangle, 
  ExternalLink,
  TestTube,
  Save,
  Eye,
  EyeOff,
  BookOpen
} from 'lucide-react';
import Card from '../UI/Card';
import GitHubSetupGuide from './GitHubSetupGuide';
import { GitHubConfig, githubService } from '../../services/githubService';

interface GitHubIntegrationProps {
  onConfigChange?: (enabled: boolean) => void;
}

const GitHubIntegration: React.FC<GitHubIntegrationProps> = ({ onConfigChange }) => {
  const [config, setConfig] = useState<GitHubConfig>({
    owner: '',
    repo: '',
    token: '',
    enabled: false
  });
  
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Load existing configuration
    const existingConfig = githubService.getConfig();
    if (existingConfig) {
      setConfig(existingConfig);
    }
  }, []);

  const handleInputChange = (field: keyof GitHubConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setTestResult(null);
    setErrors([]);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    // Validate first
    const validation = githubService.validateConfig(config);
    if (!validation.valid) {
      setErrors(validation.errors);
      setTesting(false);
      return;
    }

    // Save temporarily for testing
    const originalConfig = githubService.getConfig();
    githubService.saveConfig({ ...config, enabled: true });

    try {
      const result = await githubService.testConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Test failed'
      });
    } finally {
      // Restore original config
      if (originalConfig) {
        githubService.saveConfig(originalConfig);
      }
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors([]);

    try {
      // Validate configuration
      const validation = githubService.validateConfig(config);
      if (!validation.valid) {
        setErrors(validation.errors);
        setSaving(false);
        return;
      }

      // Save configuration
      githubService.saveConfig(config);
      onConfigChange?.(config.enabled);
      
      // Show success message
      setTestResult({
        success: true,
        message: 'Configuration saved successfully'
      });
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Failed to save configuration']);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the GitHub configuration?')) {
      githubService.clearConfig();
      setConfig({
        owner: '',
        repo: '',
        token: '',
        enabled: false
      });
      setTestResult(null);
      setErrors([]);
      onConfigChange?.(false);
    }
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <Github className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">GitHub Issues Integration</h3>
              <p className="text-sm text-gray-600">
                Automatically create GitHub issues from user feedback
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {config.enabled && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Check className="w-3 h-3 mr-1" />
                Enabled
              </span>
            )}
          </div>
        </div>

        {/* Configuration Form */}
        <div className="space-y-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Enable GitHub Integration</h4>
              <p className="text-sm text-gray-600">
                When enabled, feedback will automatically create GitHub issues
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => handleInputChange('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Repository Configuration */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">
                Repository Owner <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="owner"
                value={config.owner}
                onChange={(e) => handleInputChange('owner', e.target.value)}
                placeholder="username or organization"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                GitHub username or organization name
              </p>
            </div>

            <div>
              <label htmlFor="repo" className="block text-sm font-medium text-gray-700 mb-1">
                Repository Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="repo"
                value={config.repo}
                onChange={(e) => handleInputChange('repo', e.target.value)}
                placeholder="repository-name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Repository name (e.g., "my-project")
              </p>
            </div>
          </div>

          {/* GitHub Token */}
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
              Personal Access Token <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                id="token"
                value={config.token}
                onChange={(e) => handleInputChange('token', e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showToken ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1 space-y-1">
              <p>Required permissions: <code>repo</code> (or <code>public_repo</code> for public repositories)</p>
              <a 
                href="https://github.com/settings/tokens/new?scopes=repo&description=OncoSafeRx%20Feedback%20Integration"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary-600 hover:text-primary-700"
              >
                Create token on GitHub <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>

          {/* API URL (Optional) */}
          <div>
            <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-1">
              API URL (Optional)
            </label>
            <input
              type="url"
              id="apiUrl"
              value={config.apiUrl || ''}
              onChange={(e) => handleInputChange('apiUrl', e.target.value)}
              placeholder="https://api.github.com (default)"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to use GitHub.com. Use for GitHub Enterprise Server.
            </p>
          </div>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800">Configuration Errors</h4>
                <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Test Result */}
        {testResult && (
          <div className={`p-3 border rounded-lg ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-2">
              {testResult.success ? (
                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                </h4>
                <p className={`text-sm mt-1 ${
                  testResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {testResult.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Clear Configuration
            </button>
            
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <BookOpen className="w-4 h-4" />
              <span>Setup Guide</span>
            </button>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleTest}
              disabled={testing || !config.owner || !config.repo || !config.token}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TestTube className="w-4 h-4" />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>

        {/* Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">How it works</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• User feedback is automatically converted to GitHub issues</li>
            <li>• Issues include detailed metadata, labels, and context</li>
            <li>• Priority and effort estimation are added as labels</li>
            <li>• Bug reports include reproduction steps and browser info</li>
            <li>• Issues are automatically labeled for organization</li>
          </ul>
        </div>

        {/* Setup Guide Modal */}
        <GitHubSetupGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
      </div>
    </Card>
  );
};

export default GitHubIntegration;