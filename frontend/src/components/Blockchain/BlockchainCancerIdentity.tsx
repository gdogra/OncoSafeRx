import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Key, Lock, Users, CheckCircle, AlertTriangle, Clock, Hash, FileText, Database } from 'lucide-react';

interface BlockchainIdentity {
  id: string;
  patientId: string;
  publicKey: string;
  privateKeyHash: string;
  walletAddress: string;
  identityScore: number;
  verificationLevel: 'basic' | 'enhanced' | 'premium' | 'medical_grade';
  permissions: {
    read: string[];
    write: string[];
    share: string[];
    emergency: string[];
  };
  biometricData: {
    fingerprint: string;
    retinalScan: string;
    voicePrint: string;
    dnaSignature: string;
  };
  createdAt: string;
  lastVerified: string;
}

interface SecureTransaction {
  id: string;
  blockHash: string;
  transactionHash: string;
  fromAddress: string;
  toAddress: string;
  dataType: 'medical_record' | 'test_result' | 'prescription' | 'consent' | 'treatment_plan';
  dataHash: string;
  timestamp: string;
  gasUsed: number;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  validators: string[];
  encryptionLevel: 'AES256' | 'RSA2048' | 'ECC' | 'QUANTUM_RESISTANT';
}

interface SmartContract {
  id: string;
  name: string;
  address: string;
  type: 'data_access' | 'consent_management' | 'treatment_protocol' | 'insurance_claim' | 'research_participation';
  version: string;
  abi: any;
  deployedAt: string;
  gasLimit: number;
  functions: Array<{
    name: string;
    inputs: string[];
    outputs: string[];
    payable: boolean;
    stateMutability: 'view' | 'pure' | 'nonpayable' | 'payable';
  }>;
  accessControls: {
    owner: string;
    admins: string[];
    authorizedUsers: string[];
    emergencyAccess: string[];
  };
  auditTrail: Array<{
    timestamp: string;
    action: string;
    user: string;
    gasUsed: number;
  }>;
}

interface ConsentManagement {
  id: string;
  patientAddress: string;
  consentType: 'data_sharing' | 'research_participation' | 'treatment_authorization' | 'emergency_access';
  granularity: 'global' | 'selective' | 'time_limited' | 'purpose_specific';
  permissions: {
    dataTypes: string[];
    recipients: string[];
    purposes: string[];
    duration: {
      start: string;
      end: string;
      renewable: boolean;
    };
  };
  revocable: boolean;
  delegatable: boolean;
  conditions: string[];
  status: 'active' | 'revoked' | 'expired' | 'suspended';
  digitalSignature: string;
  witnessSignatures: string[];
  blockchainProof: {
    transactionHash: string;
    blockNumber: number;
    merkleProof: string[];
  };
}

interface DataIntegrity {
  id: string;
  dataId: string;
  originalHash: string;
  currentHash: string;
  checksumAlgorithm: 'SHA256' | 'SHA3' | 'BLAKE2' | 'Keccak256';
  integrityScore: number;
  tamperDetection: {
    detected: boolean;
    timestamp?: string;
    suspiciousActivity: string[];
  };
  backupNodes: Array<{
    nodeId: string;
    location: string;
    lastSync: string;
    hashMatch: boolean;
  }>;
  recoveryOptions: {
    available: boolean;
    methods: string[];
    estimatedTime: number;
  };
}

const BlockchainCancerIdentity: React.FC = () => {
  const [activeTab, setActiveTab] = useState('identity');
  const [identities, setIdentities] = useState<BlockchainIdentity[]>([]);
  const [transactions, setTransactions] = useState<SecureTransaction[]>([]);
  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const [consents, setConsents] = useState<ConsentManagement[]>([]);
  const [integrityData, setIntegrityData] = useState<DataIntegrity[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Populate demo data only when demo mode is enabled
  useEffect(() => {
    const { isDemoMode } = require('../../utils/demoMode');
    if (!isDemoMode()) {
      setIdentities([]);
      setTransactions([]);
      setContracts([]);
      setConsents([]);
      setIntegrityData([]);
      return;
    }
    const generateMockIdentities = (): BlockchainIdentity[] => {
      return Array.from({ length: 5 }, (_, i) => ({
        id: `identity-${i}`,
        patientId: `patient-${i}`,
        publicKey: `0x${Math.random().toString(16).substring(2, 66)}`,
        privateKeyHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        walletAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
        identityScore: Math.floor(Math.random() * 40) + 60,
        verificationLevel: ['basic', 'enhanced', 'premium', 'medical_grade'][Math.floor(Math.random() * 4)] as any,
        permissions: {
          read: ['medical_records', 'test_results', 'prescriptions'],
          write: ['consent_forms', 'patient_data'],
          share: ['research_data', 'insurance_claims'],
          emergency: ['emergency_contacts', 'medical_directives'],
        },
        biometricData: {
          fingerprint: `fp_${Math.random().toString(16).substring(2, 32)}`,
          retinalScan: `rs_${Math.random().toString(16).substring(2, 32)}`,
          voicePrint: `vp_${Math.random().toString(16).substring(2, 32)}`,
          dnaSignature: `dna_${Math.random().toString(16).substring(2, 32)}`,
        },
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastVerified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      }));
    };

    const generateMockTransactions = (): SecureTransaction[] => {
      return Array.from({ length: 15 }, (_, i) => ({
        id: `tx-${i}`,
        blockHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        fromAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
        toAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
        dataType: ['medical_record', 'test_result', 'prescription', 'consent', 'treatment_plan'][Math.floor(Math.random() * 5)] as any,
        dataHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        gasUsed: Math.floor(Math.random() * 100000) + 21000,
        status: ['pending', 'confirmed', 'failed'][Math.floor(Math.random() * 3)] as any,
        confirmations: Math.floor(Math.random() * 20),
        validators: Array.from({ length: 3 }, () => `0x${Math.random().toString(16).substring(2, 42)}`),
        encryptionLevel: ['AES256', 'RSA2048', 'ECC', 'QUANTUM_RESISTANT'][Math.floor(Math.random() * 4)] as any,
      }));
    };

    const generateMockContracts = (): SmartContract[] => {
      const contractTypes = ['data_access', 'consent_management', 'treatment_protocol', 'insurance_claim', 'research_participation'];
      
      return contractTypes.map((type, i) => ({
        id: `contract-${i}`,
        name: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Contract`,
        address: `0x${Math.random().toString(16).substring(2, 42)}`,
        type: type as any,
        version: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
        abi: {},
        deployedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        gasLimit: Math.floor(Math.random() * 1000000) + 500000,
        functions: [
          {
            name: 'grantAccess',
            inputs: ['address', 'uint256'],
            outputs: ['bool'],
            payable: false,
            stateMutability: 'nonpayable',
          },
          {
            name: 'revokeAccess',
            inputs: ['address'],
            outputs: ['bool'],
            payable: false,
            stateMutability: 'nonpayable',
          },
          {
            name: 'verifyPermission',
            inputs: ['address', 'string'],
            outputs: ['bool'],
            payable: false,
            stateMutability: 'view',
          },
        ],
        accessControls: {
          owner: `0x${Math.random().toString(16).substring(2, 42)}`,
          admins: Array.from({ length: 2 }, () => `0x${Math.random().toString(16).substring(2, 42)}`),
          authorizedUsers: Array.from({ length: 5 }, () => `0x${Math.random().toString(16).substring(2, 42)}`),
          emergencyAccess: Array.from({ length: 1 }, () => `0x${Math.random().toString(16).substring(2, 42)}`),
        },
        auditTrail: Array.from({ length: 10 }, (_, j) => ({
          timestamp: new Date(Date.now() - j * 24 * 60 * 60 * 1000).toISOString(),
          action: ['access_granted', 'data_retrieved', 'permission_updated'][j % 3],
          user: `0x${Math.random().toString(16).substring(2, 42)}`,
          gasUsed: Math.floor(Math.random() * 50000) + 10000,
        })),
      }));
    };

    const generateMockConsents = (): ConsentManagement[] => {
      return Array.from({ length: 8 }, (_, i) => ({
        id: `consent-${i}`,
        patientAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
        consentType: ['data_sharing', 'research_participation', 'treatment_authorization', 'emergency_access'][Math.floor(Math.random() * 4)] as any,
        granularity: ['global', 'selective', 'time_limited', 'purpose_specific'][Math.floor(Math.random() * 4)] as any,
        permissions: {
          dataTypes: ['medical_history', 'genetic_data', 'imaging_results', 'lab_tests'],
          recipients: ['hospital_staff', 'researchers', 'insurance'],
          purposes: ['treatment', 'research', 'quality_improvement'],
          duration: {
            start: new Date().toISOString(),
            end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            renewable: Math.random() > 0.5,
          },
        },
        revocable: true,
        delegatable: Math.random() > 0.5,
        conditions: ['Patient must be informed', 'Data must be anonymized', 'Access logged'],
        status: ['active', 'revoked', 'expired', 'suspended'][Math.floor(Math.random() * 4)] as any,
        digitalSignature: `0x${Math.random().toString(16).substring(2, 130)}`,
        witnessSignatures: Array.from({ length: 2 }, () => `0x${Math.random().toString(16).substring(2, 130)}`),
        blockchainProof: {
          transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
          blockNumber: Math.floor(Math.random() * 1000000) + 500000,
          merkleProof: Array.from({ length: 3 }, () => `0x${Math.random().toString(16).substring(2, 66)}`),
        },
      }));
    };

    const generateMockIntegrity = (): DataIntegrity[] => {
      return Array.from({ length: 10 }, (_, i) => ({
        id: `integrity-${i}`,
        dataId: `data-${i}`,
        originalHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        currentHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        checksumAlgorithm: ['SHA256', 'SHA3', 'BLAKE2', 'Keccak256'][Math.floor(Math.random() * 4)] as any,
        integrityScore: Math.floor(Math.random() * 20) + 80,
        tamperDetection: {
          detected: Math.random() < 0.1,
          timestamp: Math.random() < 0.1 ? new Date().toISOString() : undefined,
          suspiciousActivity: Math.random() < 0.1 ? ['Hash mismatch', 'Unauthorized access'] : [],
        },
        backupNodes: Array.from({ length: 3 }, (_, j) => ({
          nodeId: `node-${j}`,
          location: ['US-East', 'EU-West', 'Asia-Pacific'][j],
          lastSync: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
          hashMatch: Math.random() > 0.05,
        })),
        recoveryOptions: {
          available: true,
          methods: ['Backup restoration', 'Distributed recovery', 'Manual verification'],
          estimatedTime: Math.floor(Math.random() * 120) + 30,
        },
      }));
    };

    setIdentities(generateMockIdentities());
    setTransactions(generateMockTransactions());
    setContracts(generateMockContracts());
    setConsents(generateMockConsents());
    setIntegrityData(generateMockIntegrity());
  }, []);

  // Canvas visualization for blockchain network
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw blockchain network
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) / 3;

      // Draw nodes
      const nodeCount = 8;
      const nodes = Array.from({ length: nodeCount }, (_, i) => {
        const angle = (i / nodeCount) * 2 * Math.PI;
        return {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          activity: Math.random(),
        };
      });

      // Draw connections between nodes
      nodes.forEach((node, i) => {
        nodes.forEach((otherNode, j) => {
          if (i !== j && Math.random() > 0.7) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 + node.activity * 0.3})`;
            ctx.lineWidth = 1 + node.activity * 2;
            ctx.stroke();
          }
        });
      });

      // Draw nodes
      nodes.forEach((node, i) => {
        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, 15 + node.activity * 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#3b82f6';
        ctx.globalAlpha = 0.8 + node.activity * 0.2;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Activity pulse
        ctx.beginPath();
        ctx.arc(node.x, node.y, 25 + Math.sin(Date.now() * 0.003 + i) * 5, 0, 2 * Math.PI);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Node label
        ctx.fillStyle = '#1f2937';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Node ${i + 1}`, node.x, node.y + 35);
      });

      // Draw central blockchain symbol
      ctx.beginPath();
      ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
      ctx.fillStyle = '#059669';
      ctx.fill();

      // Draw blocks
      for (let i = 0; i < 3; i++) {
        const blockX = centerX - 30 + i * 30;
        const blockY = centerY - 5;
        
        ctx.fillStyle = '#d97706';
        ctx.fillRect(blockX, blockY, 25, 10);
        ctx.strokeStyle = '#92400e';
        ctx.strokeRect(blockX, blockY, 25, 10);
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [activeTab]);

  const renderIdentity = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Identities</p>
                <p className="text-2xl font-bold">{identities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold">
                  {identities.filter(i => i.verificationLevel !== 'basic').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Identity Score</p>
                <p className="text-2xl font-bold">
                  {(identities.reduce((sum, i) => sum + i.identityScore, 0) / identities.length || 0).toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Medical Grade</p>
                <p className="text-2xl font-bold">
                  {identities.filter(i => i.verificationLevel === 'medical_grade').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Blockchain Network</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas
              ref={canvasRef}
              className="w-full h-64 border rounded"
              style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Identity Verification Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['basic', 'enhanced', 'premium', 'medical_grade'].map((level) => {
                const count = identities.filter(i => i.verificationLevel === level).length;
                const percentage = (count / identities.length) * 100;
                
                return (
                  <div key={level} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm capitalize">{level.replace('_', ' ')}</span>
                      <span className="text-sm font-medium">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          level === 'basic' ? 'bg-red-500' :
                          level === 'enhanced' ? 'bg-yellow-500' :
                          level === 'premium' ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Identities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {identities.map((identity) => (
              <div key={identity.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">Patient {identity.patientId}</h4>
                    <p className="text-sm text-gray-600">
                      Wallet: {identity.walletAddress.substring(0, 10)}...{identity.walletAddress.substring(-6)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      identity.verificationLevel === 'medical_grade' ? 'bg-green-100 text-green-800' :
                      identity.verificationLevel === 'premium' ? 'bg-blue-100 text-blue-800' :
                      identity.verificationLevel === 'enhanced' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {identity.verificationLevel.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-medium">{identity.identityScore}/100</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-medium">{new Date(identity.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Verified</p>
                    <p className="font-medium">{new Date(identity.lastVerified).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Read Permissions</p>
                    <p className="font-medium">{identity.permissions.read.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Biometric Data</p>
                    <p className="font-medium">{Object.keys(identity.biometricData).length}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Hash className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold">
                  {transactions.filter(t => t.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">
                  {transactions.filter(t => t.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold">
                  {transactions.filter(t => t.status === 'failed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium capitalize">{transaction.dataType.replace('_', ' ')}</h4>
                    <p className="text-sm text-gray-600">
                      {transaction.transactionHash.substring(0, 16)}...{transaction.transactionHash.substring(-8)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      transaction.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                    <span className="text-sm font-medium">{transaction.confirmations} confirmations</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Gas Used</p>
                    <p className="font-medium">{transaction.gasUsed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Encryption</p>
                    <p className="font-medium">{transaction.encryptionLevel}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Validators</p>
                    <p className="font-medium">{transaction.validators.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Timestamp</p>
                    <p className="font-medium">{new Date(transaction.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContracts = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Smart Contracts</p>
                <p className="text-2xl font-bold">{contracts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Users</p>
                <p className="text-2xl font-bold">
                  {Math.floor(contracts.reduce((sum, c) => sum + c.accessControls.authorizedUsers.length, 0) / contracts.length || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Total Functions</p>
                <p className="text-2xl font-bold">
                  {contracts.reduce((sum, c) => sum + c.functions.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Emergency Access</p>
                <p className="text-2xl font-bold">
                  {contracts.reduce((sum, c) => sum + c.accessControls.emergencyAccess.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Smart Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contracts.map((contract) => (
              <div key={contract.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{contract.name}</h4>
                    <p className="text-sm text-gray-600">
                      {contract.address.substring(0, 16)}...{contract.address.substring(-8)} • {contract.version}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs capitalize">
                      {contract.type.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-medium">{contract.functions.length} functions</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Gas Limit</p>
                    <p className="font-medium">{contract.gasLimit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Authorized Users</p>
                    <p className="font-medium">{contract.accessControls.authorizedUsers.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Audit Trail</p>
                    <p className="font-medium">{contract.auditTrail.length} entries</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Deployed</p>
                    <p className="font-medium">{new Date(contract.deployedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <h5 className="text-sm font-medium mb-2">Available Functions</h5>
                  <div className="flex flex-wrap gap-2">
                    {contract.functions.map((func, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                        {func.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConsents = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Active Consents</p>
                <p className="text-2xl font-bold">
                  {consents.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Revoked</p>
                <p className="text-2xl font-bold">
                  {consents.filter(c => c.status === 'revoked').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold">
                  {consents.filter(c => c.status === 'expired').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Delegatable</p>
                <p className="text-2xl font-bold">
                  {consents.filter(c => c.delegatable).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consent Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {consents.map((consent) => (
              <div key={consent.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium capitalize">{consent.consentType.replace('_', ' ')}</h4>
                    <p className="text-sm text-gray-600">
                      {consent.patientAddress.substring(0, 16)}...{consent.patientAddress.substring(-8)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      consent.status === 'active' ? 'bg-green-100 text-green-800' :
                      consent.status === 'revoked' ? 'bg-red-100 text-red-800' :
                      consent.status === 'expired' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {consent.status}
                    </span>
                    <span className="text-sm font-medium capitalize">{consent.granularity.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Data Types</p>
                    <p className="font-medium">{consent.permissions.dataTypes.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Recipients</p>
                    <p className="font-medium">{consent.permissions.recipients.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Revocable</p>
                    <p className="font-medium">{consent.revocable ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Conditions</p>
                    <p className="font-medium">{consent.conditions.length}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <h5 className="text-sm font-medium mb-2">Permitted Data Types</h5>
                  <div className="flex flex-wrap gap-2">
                    {consent.permissions.dataTypes.map((dataType) => (
                      <span key={dataType} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {dataType.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-gray-800 rounded-lg">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blockchain-Secured Cancer Identity</h1>
          <p className="text-gray-600">Immutable patient identity and secure data management on blockchain</p>
        </div>
      </div>

      <div className="flex space-x-4 border-b">
        {[
          { id: 'identity', label: 'Digital Identity', icon: Shield },
          { id: 'transactions', label: 'Secure Transactions', icon: Hash },
          { id: 'contracts', label: 'Smart Contracts', icon: FileText },
          { id: 'consents', label: 'Consent Management', icon: Users },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === id
                ? 'border-gray-800 text-gray-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'identity' && renderIdentity()}
        {activeTab === 'transactions' && renderTransactions()}
        {activeTab === 'contracts' && renderContracts()}
        {activeTab === 'consents' && renderConsents()}
      </div>
    </div>
  );
};

export default BlockchainCancerIdentity;
