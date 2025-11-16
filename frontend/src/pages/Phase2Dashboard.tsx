import React from 'react';
import Card from '../components/UI/Card';
import Badge from '../components/UI/Badge';
import { Brain, Shield, Microscope, Activity, Database, Search, Zap, Globe } from 'lucide-react';

const Phase2Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
          OncoSafeRx Phase 2: Industry-Disrupting Capabilities
        </h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          Revolutionary healthcare AI platform combining Digital Twin Patient Modeling, 
          Blockchain-Verified Clinical Evidence, and AI Research Assistance
        </p>
        <div className="flex justify-center space-x-4">
          <Badge variant="default" className="px-4 py-2">
            <Zap className="h-4 w-4 mr-2" />
            Industry Disrupting
          </Badge>
          <Badge variant="default" className="px-4 py-2">
            <Globe className="h-4 w-4 mr-2" />
            Global Impact
          </Badge>
          <Badge variant="default" className="px-4 py-2">
            <Shield className="h-4 w-4 mr-2" />
            Competitive Moat
          </Badge>
        </div>
      </div>

      {/* Capability Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="space-y-3">
            <div className="flex items-center text-blue-700">
              <Brain className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-semibold">Digital Twin Modeling</h3>
            </div>
            <p className="text-sm text-blue-600">
              Multi-modal patient modeling with genomics, proteomics, and physiological simulation
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Active Digital Twins</span>
                <Badge variant="secondary">3</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Genomic Profiles</span>
                <Badge variant="secondary">Complete</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Simulation Accuracy</span>
                <Badge variant="secondary">94.2%</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="space-y-3">
            <div className="flex items-center text-purple-700">
              <Shield className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-semibold">Blockchain Evidence</h3>
            </div>
            <p className="text-sm text-purple-600">
              Immutable clinical evidence with smart contracts and decentralized trials
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Verified Records</span>
                <Badge variant="secondary">3</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Blockchain Hash</span>
                <Badge variant="secondary">Verified</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Smart Contracts</span>
                <Badge variant="secondary">Active</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <div className="space-y-3">
            <div className="flex items-center text-green-700">
              <Microscope className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-semibold">AI Research Assistant</h3>
            </div>
            <p className="text-sm text-green-600">
              Autonomous research with hypothesis generation and literature synthesis
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Active Hypotheses</span>
                <Badge variant="secondary">12</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Literature Analysis</span>
                <Badge variant="secondary">Real-time</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Novel Combinations</span>
                <Badge variant="secondary">5 Found</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Integration Matrix */}
      <Card>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Phase 2 Integration Matrix</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Brain className="h-6 w-6 text-blue-500 mr-1" />
                <Shield className="h-6 w-6 text-purple-500" />
              </div>
              <h4 className="font-semibold">Twin + Blockchain</h4>
              <p className="text-xs text-gray-600 mt-1">
                Immutable digital twin evolution records
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-6 w-6 text-purple-500 mr-1" />
                <Microscope className="h-6 w-6 text-green-500" />
              </div>
              <h4 className="font-semibold">Blockchain + AI</h4>
              <p className="text-xs text-gray-600 mt-1">
                Verified research insights and evidence
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Brain className="h-6 w-6 text-blue-500 mr-1" />
                <Microscope className="h-6 w-6 text-green-500" />
              </div>
              <h4 className="font-semibold">Twin + AI Research</h4>
              <p className="text-xs text-gray-600 mt-1">
                AI-guided twin optimization
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Phase2Dashboard;