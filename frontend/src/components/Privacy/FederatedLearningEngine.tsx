import React, { useState, useEffect } from 'react';
import { Shield, Lock, Users, Globe, Zap, CheckCircle, AlertTriangle, Activity, Brain, Server } from 'lucide-react';
import Card from '../UI/Card';
import LoadingSpinner from '../UI/LoadingSpinner';
import FeatureErrorBoundary from '../ErrorBoundary/FeatureErrorBoundary';

interface FederatedNode {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'syncing' | 'offline';
  patients: number;
  last_sync: string;
  contribution_score: number;
  data_quality: number;
  privacy_level: 'high' | 'maximum';
}

interface LearningMetrics {
  global_model_accuracy: number;
  participating_nodes: number;
  total_patients: number;
  privacy_preservation: number;
  convergence_progress: number;
  rounds_completed: number;
  estimated_completion: string;
}

interface PrivacyAudit {
  audit_id: string;
  timestamp: string;
  type: 'data_access' | 'model_update' | 'gradient_sharing' | 'inference';
  node_id: string;
  privacy_score: number;
  compliance_status: 'compliant' | 'warning' | 'violation';
  details: string;
}

const FederatedLearningEngine: React.FC = () => {
  const [nodes, setNodes] = useState<FederatedNode[]>([]);
  const [learningMetrics, setLearningMetrics] = useState<LearningMetrics | null>(null);
  const [privacyAudits, setPrivacyAudits] = useState<PrivacyAudit[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [selectedNode, setSelectedNode] = useState<FederatedNode | null>(null);

  useEffect(() => {
    loadFederatedNetwork();
  }, []);

  const loadFederatedNetwork = async () => {
    try {
      // Simulate loading federated learning network data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockNodes: FederatedNode[] = [
        {
          id: 'node-001',
          name: 'Memorial Sloan Kettering',
          location: 'New York, NY',
          status: 'active',
          patients: 1247,
          last_sync: '2024-09-22T08:30:00Z',
          contribution_score: 95,
          data_quality: 98,
          privacy_level: 'maximum'
        },
        {
          id: 'node-002',
          name: 'MD Anderson Cancer Center',
          location: 'Houston, TX',
          status: 'active',
          patients: 1853,
          last_sync: '2024-09-22T08:28:00Z',
          contribution_score: 92,
          data_quality: 96,
          privacy_level: 'maximum'
        },
        {
          id: 'node-003',
          name: 'Johns Hopkins Hospital',
          location: 'Baltimore, MD',
          status: 'syncing',
          patients: 967,
          last_sync: '2024-09-22T08:25:00Z',
          contribution_score: 88,
          data_quality: 94,
          privacy_level: 'high'
        },
        {
          id: 'node-004',
          name: 'Mayo Clinic',
          location: 'Rochester, MN',
          status: 'active',
          patients: 1432,
          last_sync: '2024-09-22T08:31:00Z',
          contribution_score: 97,
          data_quality: 99,
          privacy_level: 'maximum'
        },
        {
          id: 'node-005',
          name: 'Dana-Farber Cancer Institute',
          location: 'Boston, MA',
          status: 'active',
          patients: 1156,
          last_sync: '2024-09-22T08:29:00Z',
          contribution_score: 94,
          data_quality: 97,
          privacy_level: 'maximum'
        }
      ];

      const mockMetrics: LearningMetrics = {
        global_model_accuracy: 94.7,
        participating_nodes: 5,
        total_patients: 6655,
        privacy_preservation: 99.8,
        convergence_progress: 87,
        rounds_completed: 127,
        estimated_completion: '2024-09-25T15:00:00Z'
      };

      const mockAudits: PrivacyAudit[] = [
        {
          audit_id: 'audit-001',
          timestamp: '2024-09-22T08:30:15Z',
          type: 'gradient_sharing',
          node_id: 'node-001',
          privacy_score: 99.9,
          compliance_status: 'compliant',
          details: 'Differential privacy applied with ε=0.1, gradient clipping successful'
        },
        {
          audit_id: 'audit-002',
          timestamp: '2024-09-22T08:29:45Z',
          type: 'model_update',
          node_id: 'node-004',
          privacy_score: 99.7,
          compliance_status: 'compliant',
          details: 'Secure aggregation protocol completed, no data leakage detected'
        },
        {
          audit_id: 'audit-003',
          timestamp: '2024-09-22T08:28:30Z',
          type: 'data_access',
          node_id: 'node-003',
          privacy_score: 98.5,
          compliance_status: 'warning',
          details: 'Temporary access log anomaly detected, automatically resolved'
        }
      ];

      setNodes(mockNodes);
      setLearningMetrics(mockMetrics);
      setPrivacyAudits(mockAudits);
      setSelectedNode(mockNodes[0]);
      
    } catch (error) {
      console.error('Error loading federated network:', error);
    }
  };

  const startFederatedTraining = async () => {
    setIsTraining(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      // Update metrics to show training progress
      if (learningMetrics) {
        setLearningMetrics({
          ...learningMetrics,
          rounds_completed: learningMetrics.rounds_completed + 1,
          convergence_progress: Math.min(95, learningMetrics.convergence_progress + 2),
          global_model_accuracy: Math.min(96, learningMetrics.global_model_accuracy + 0.3)
        });
      }
    } catch (error) {
      console.error('Error starting training:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'syncing': return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'offline': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'violation': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Federated Learning Engine</h1>
            <p className="text-gray-600">Privacy-first collaborative AI for precision oncology</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-green-600">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">Privacy Guaranteed</span>
          </div>
          <button
            onClick={startFederatedTraining}
            disabled={isTraining}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {isTraining ? <LoadingSpinner size="sm" /> : <Zap className="w-4 h-4" />}
            <span>{isTraining ? 'Training...' : 'Start Round'}</span>
          </button>
        </div>
      </div>

      {/* Learning Metrics */}
      {learningMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Global Model Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {learningMetrics.global_model_accuracy.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Round {learningMetrics.rounds_completed}
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Total Patients</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {learningMetrics.total_patients.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Across {learningMetrics.participating_nodes} nodes
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Privacy Preservation</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {learningMetrics.privacy_preservation.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600 mt-1">
                HIPAA + Differential Privacy
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Convergence Progress</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {learningMetrics.convergence_progress}%
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Est. completion: {new Date(learningMetrics.estimated_completion).toLocaleDateString()}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Federated Network */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Globe className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-semibold">Federated Network</h3>
            </div>

            <div className="space-y-4">
              {nodes.map((node, index) => (
                <div 
                  key={node.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedNode?.id === node.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedNode(node)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(node.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">{node.name}</h4>
                        <p className="text-sm text-gray-600">{node.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{node.patients.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">patients</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <div className="text-sm text-gray-600">Contribution</div>
                      <div className="font-medium text-blue-600">{node.contribution_score}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Data Quality</div>
                      <div className="font-medium text-green-600">{node.data_quality}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Privacy</div>
                      <div className={`font-medium ${
                        node.privacy_level === 'maximum' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {node.privacy_level}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Selected Node Details */}
        {selectedNode && (
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Server className="w-5 h-5 text-green-600" />
                <h3 className="text-xl font-semibold">Node Details</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">{selectedNode.name}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Location</div>
                      <div className="font-medium">{selectedNode.location}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Status</div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedNode.status)}
                        <span className="font-medium capitalize">{selectedNode.status}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Patients</div>
                      <div className="font-medium">{selectedNode.patients.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Last Sync</div>
                      <div className="font-medium">
                        {new Date(selectedNode.last_sync).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Performance Metrics</h5>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Contribution Score</span>
                        <span>{selectedNode.contribution_score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${selectedNode.contribution_score}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Data Quality</span>
                        <span>{selectedNode.data_quality}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${selectedNode.data_quality}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lock className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-900">Privacy Protection</span>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Differential privacy (ε < 0.1)</li>
                    <li>• Secure multi-party computation</li>
                    <li>• Homomorphic encryption</li>
                    <li>• Zero-knowledge proofs</li>
                    <li>• HIPAA compliant infrastructure</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Privacy Audit Log */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Shield className="w-5 h-5 text-green-600" />
            <h3 className="text-xl font-semibold">Privacy Audit Log</h3>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Real-time monitoring
            </span>
          </div>

          <div className="space-y-3">
            {privacyAudits.map((audit, index) => (
              <div key={audit.audit_id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                {getComplianceIcon(audit.compliance_status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 capitalize">
                        {audit.type.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-600">
                        Node: {nodes.find(n => n.id === audit.node_id)?.name || audit.node_id}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-green-600">
                        Privacy Score: {audit.privacy_score}%
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(audit.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{audit.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Technology Stack */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Brain className="w-5 h-5 text-purple-600" />
            <h3 className="text-xl font-semibold">Privacy-First Technology Stack</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">🔐</div>
              <h4 className="font-medium text-gray-900">Differential Privacy</h4>
              <p className="text-sm text-gray-600 mt-1">Mathematical privacy guarantees</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">🛡️</div>
              <h4 className="font-medium text-gray-900">Secure Aggregation</h4>
              <p className="text-sm text-gray-600 mt-1">Encrypted gradient sharing</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">🔒</div>
              <h4 className="font-medium text-gray-900">Homomorphic Encryption</h4>
              <p className="text-sm text-gray-600 mt-1">Computation on encrypted data</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl mb-2">✅</div>
              <h4 className="font-medium text-gray-900">Zero-Knowledge Proofs</h4>
              <p className="text-sm text-gray-600 mt-1">Verify without revealing</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const FederatedLearningEngineWithBoundary: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Federated Learning Engine"
      fallbackMessage="The federated learning system is temporarily unavailable. This feature requires secure multi-party computation infrastructure."
    >
      <FederatedLearningEngine />
    </FeatureErrorBoundary>
  );
};

export default FederatedLearningEngineWithBoundary;