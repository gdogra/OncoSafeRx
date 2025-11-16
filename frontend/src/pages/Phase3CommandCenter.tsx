import React from 'react';
import Card from '../components/UI/Card';
import Badge from '../components/UI/Badge';
import Button from '../components/UI/Button';
import { 
  Atom, Globe, Zap, Activity, Shield, Brain, Microscope, 
  AlertTriangle, TrendingUp, Users, Database, Satellite,
  Command, Network, Lock, Target, Search, BarChart3
} from 'lucide-react';

const Phase3CommandCenter: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="flex justify-center items-center space-x-4">
          <Command className="h-16 w-16 text-blue-600" />
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
              OncoSafeRx Phase 3: Global Healthcare Command Center
            </h1>
            <p className="text-xl text-gray-700 mt-2">
              Real-time worldwide intelligence, quantum discovery, and autonomous healthcare orchestration
            </p>
          </div>
        </div>
        
        <div className="flex justify-center space-x-6">
          <Badge variant="default" className="px-6 py-3 text-lg">
            <Globe className="h-5 w-5 mr-2" />
            Global Leadership
          </Badge>
          <Badge variant="default" className="px-6 py-3 text-lg">
            <Atom className="h-5 w-5 mr-2" />
            Quantum Enhanced
          </Badge>
          <Badge variant="default" className="px-6 py-3 text-lg">
            <Zap className="h-5 w-5 mr-2" />
            Autonomous Systems
          </Badge>
        </div>
      </div>

      {/* Global Status Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="space-y-3">
            <div className="flex items-center text-blue-700">
              <Network className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-semibold">Global Network</h3>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-800">142</div>
              <div className="text-sm text-blue-600">Active Nodes</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium">Latency:</span>
                <div className="text-green-600">45ms</div>
              </div>
              <div>
                <span className="font-medium">Reliability:</span>
                <div className="text-green-600">98%</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="space-y-3">
            <div className="flex items-center text-purple-700">
              <Atom className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-semibold">Quantum Discovery</h3>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-800">2,847</div>
              <div className="text-sm text-purple-600">Novel Compounds</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium">Total Drugs:</span>
                <div className="text-purple-600">125,000</div>
              </div>
              <div>
                <span className="font-medium">Q-Optimized:</span>
                <div className="text-green-600">3,200</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="space-y-3">
            <div className="flex items-center text-orange-700">
              <Satellite className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-semibold">Global Surveillance</h3>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-800">67</div>
              <div className="text-sm text-orange-600">Threats Detected</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium">Coverage:</span>
                <div className="text-green-600">87%</div>
              </div>
              <div>
                <span className="font-medium">Response:</span>
                <div className="text-blue-600">1.8hrs</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <div className="space-y-3">
            <div className="flex items-center text-green-700">
              <TrendingUp className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-semibold">Global Impact</h3>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-800">52M</div>
              <div className="text-sm text-green-600">Lives Impacted</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium">Patients:</span>
                <div className="text-green-600">5.8M</div>
              </div>
              <div>
                <span className="font-medium">Insights:</span>
                <div className="text-blue-600">58,000</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* System Architecture Overview */}
      <Card>
        <div className="space-y-6">
          <div className="flex items-center">
            <Command className="h-6 w-6 mr-2 text-blue-500" />
            <h2 className="text-2xl font-bold">Phase 3 System Architecture</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Core Systems</h3>
              <div className="space-y-3">
                <Card className="border-blue-200 bg-blue-50">
                  <div className="p-4 flex items-center">
                    <Atom className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <div className="font-medium">Quantum Drug Discovery</div>
                      <div className="text-sm text-gray-600">Molecular simulation & optimization</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="border-purple-200 bg-purple-50">
                  <div className="p-4 flex items-center">
                    <Globe className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <div className="font-medium">Global Intelligence Network</div>
                      <div className="text-sm text-gray-600">Worldwide knowledge sharing</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="border-green-200 bg-green-50">
                  <div className="p-4 flex items-center">
                    <Activity className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <div className="font-medium">Autonomous Trials</div>
                      <div className="text-sm text-gray-600">AI-orchestrated clinical research</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Analytics & Prediction</h3>
              <div className="space-y-3">
                <Card className="border-orange-200 bg-orange-50">
                  <div className="p-4 flex items-center">
                    <Users className="h-8 w-8 text-orange-600 mr-3" />
                    <div>
                      <div className="font-medium">Population Health</div>
                      <div className="text-sm text-gray-600">Predictive population analytics</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="border-red-200 bg-red-50">
                  <div className="p-4 flex items-center">
                    <Satellite className="h-8 w-8 text-red-600 mr-3" />
                    <div>
                      <div className="font-medium">Disease Surveillance</div>
                      <div className="text-sm text-gray-600">Real-time threat monitoring</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="border-indigo-200 bg-indigo-50">
                  <div className="p-4 flex items-center">
                    <BarChart3 className="h-8 w-8 text-indigo-600 mr-3" />
                    <div>
                      <div className="font-medium">Predictive Analytics</div>
                      <div className="text-sm text-gray-600">AI-driven health forecasting</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Global Impact Metrics</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Countries Connected:</span>
                  <Badge variant="secondary">195</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Research Institutions:</span>
                  <Badge variant="secondary">15,000+</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Active Researchers:</span>
                  <Badge variant="secondary">250,000+</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Patients Benefited:</span>
                  <Badge variant="secondary">50M+</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Novel Discoveries:</span>
                  <Badge variant="secondary">5,000+</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Competitive Advantage Matrix */}
      <Card>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Phase 3 Competitive Advantages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-blue-200 bg-blue-50">
              <div className="p-4 text-center">
                <Lock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium">Unassailable Moat</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Quantum-enhanced capabilities impossible to replicate
                </p>
              </div>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50">
              <div className="p-4 text-center">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium">First-Mover Advantage</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Global leadership in AI-driven healthcare
                </p>
              </div>
            </Card>
            
            <Card className="border-green-200 bg-green-50">
              <div className="p-4 text-center">
                <Network className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium">Network Effects</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Value increases with global participation
                </p>
              </div>
            </Card>
            
            <Card className="border-orange-200 bg-orange-50">
              <div className="p-4 text-center">
                <Search className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-medium">Data Supremacy</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Unprecedented global health intelligence
                </p>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      {/* Action Center */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="pt-6 text-center space-y-4">
          <h3 className="text-2xl font-bold">Global Healthcare Leadership</h3>
          <p className="text-blue-100 max-w-3xl mx-auto">
            OncoSafeRx Phase 3 establishes unprecedented global healthcare leadership through 
            quantum-enhanced discovery, autonomous systems, and worldwide intelligence networks.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
              <Database className="h-4 w-4 mr-2" />
              Access Global Database
            </Button>
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-purple-600">
              <Network className="h-4 w-4 mr-2" />
              Join Intelligence Network
            </Button>
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-green-600">
              <Activity className="h-4 w-4 mr-2" />
              Launch Autonomous Trial
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Phase3CommandCenter;