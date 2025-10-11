import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';
import { AlertTriangle, Search, Clock, User, Phone, MessageSquare, ChevronRight } from 'lucide-react';

interface SideEffect {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  category: string;
  description: string;
  commonCauses: string[];
  managementTips: string[];
  whenToCallDoctor: string[];
}

const SideEffects: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock side effects data
  const sideEffects: SideEffect[] = [
    {
      id: '1',
      name: 'Nausea',
      severity: 'moderate',
      category: 'Gastrointestinal',
      description: 'Feeling of sickness or queasiness that may lead to vomiting.',
      commonCauses: ['Chemotherapy', 'Radiation therapy', 'Pain medications'],
      managementTips: [
        'Eat small, frequent meals',
        'Avoid strong odors',
        'Stay hydrated with clear fluids',
        'Take anti-nausea medication as prescribed'
      ],
      whenToCallDoctor: [
        'Persistent vomiting for more than 24 hours',
        'Unable to keep fluids down',
        'Signs of dehydration'
      ]
    },
    {
      id: '2',
      name: 'Fatigue',
      severity: 'moderate',
      category: 'General',
      description: 'Extreme tiredness that doesn\'t improve with rest.',
      commonCauses: ['Chemotherapy', 'Radiation therapy', 'Cancer itself', 'Anemia'],
      managementTips: [
        'Get adequate rest and sleep',
        'Light exercise as tolerated',
        'Pace your activities',
        'Ask for help with daily tasks'
      ],
      whenToCallDoctor: [
        'Extreme fatigue that prevents daily activities',
        'Shortness of breath',
        'Dizziness or fainting'
      ]
    },
    {
      id: '3',
      name: 'Hair Loss',
      severity: 'mild',
      category: 'Cosmetic',
      description: 'Temporary loss of hair due to treatment.',
      commonCauses: ['Chemotherapy', 'Radiation therapy to the head'],
      managementTips: [
        'Use gentle shampoos',
        'Consider wigs or scarves',
        'Protect scalp from sun and cold',
        'Be gentle when brushing'
      ],
      whenToCallDoctor: [
        'Scalp irritation or sores',
        'Signs of infection'
      ]
    },
    {
      id: '4',
      name: 'Mouth Sores',
      severity: 'moderate',
      category: 'Oral',
      description: 'Painful sores or ulcers in the mouth or throat.',
      commonCauses: ['Chemotherapy', 'Radiation therapy', 'Targeted therapy'],
      managementTips: [
        'Use soft toothbrush',
        'Rinse with salt water',
        'Avoid spicy or acidic foods',
        'Stay hydrated'
      ],
      whenToCallDoctor: [
        'Severe pain that prevents eating or drinking',
        'Signs of infection',
        'Bleeding that won\'t stop'
      ]
    },
    {
      id: '5',
      name: 'Neuropathy',
      severity: 'severe',
      category: 'Neurological',
      description: 'Numbness, tingling, or pain in hands and feet.',
      commonCauses: ['Certain chemotherapy drugs', 'Radiation therapy'],
      managementTips: [
        'Wear comfortable shoes',
        'Use gloves for protection',
        'Avoid extreme temperatures',
        'Physical therapy may help'
      ],
      whenToCallDoctor: [
        'Severe pain or burning',
        'Difficulty walking or using hands',
        'Signs of infection from injuries you can\'t feel'
      ]
    }
  ];

  const categories = ['all', ...Array.from(new Set(sideEffects.map(se => se.category)))];

  const filteredSideEffects = sideEffects.filter(sideEffect => {
    const matchesSearch = sideEffect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sideEffect.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || sideEffect.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReportSideEffect = () => {
    alert('This would open a side effect reporting form to share with your care team. Feature coming soon!');
  };

  const handleContactCareTeam = () => {
    alert('This would open secure messaging with your care team about side effects. Feature coming soon!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Side Effects Guide</h1>
          <p className="text-gray-600 mt-1">Understanding and managing treatment side effects</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleReportSideEffect}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report Side Effect</span>
          </button>
          <button 
            onClick={handleContactCareTeam}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contact Care Team</span>
          </button>
        </div>
      </div>

      {/* Important Notice */}
      <Alert type="warning" title="Important">
        If you experience severe or concerning side effects, contact your healthcare team immediately. In case of emergency, call 911 or go to the nearest emergency room.
      </Alert>

      {/* Search and Filter */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search side effects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Side Effects List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredSideEffects.map((sideEffect) => (
          <Card key={sideEffect.id}>
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{sideEffect.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(sideEffect.severity)}`}>
                      {sideEffect.severity}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {sideEffect.category}
                    </span>
                  </div>
                  <p className="text-gray-600">{sideEffect.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Common Causes */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Common Causes</h4>
                  <ul className="space-y-1">
                    {sideEffect.commonCauses.map((cause, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <ChevronRight className="w-3 h-3" />
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Management Tips */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Management Tips</h4>
                  <ul className="space-y-1">
                    {sideEffect.managementTips.map((tip, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <ChevronRight className="w-3 h-3" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* When to Call Doctor */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-red-600" />
                    <span>When to Call Doctor</span>
                  </h4>
                  <ul className="space-y-1">
                    {sideEffect.whenToCallDoctor.map((reason, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-red-600">
                        <ChevronRight className="w-3 h-3" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredSideEffects.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No side effects found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or category filter.
            </p>
          </div>
        </Card>
      )}

      {/* Emergency Contact */}
      <Card>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">Emergency Contact</h3>
              <p className="text-red-700 text-sm mt-1">
                For severe or life-threatening side effects, call 911 immediately or go to your nearest emergency room.
              </p>
              <p className="text-red-700 text-sm mt-2">
                For urgent but non-emergency concerns, contact your care team's 24/7 hotline.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SideEffects;