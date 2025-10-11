import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/UI/Card';
import { BookOpen, Play, Download, ExternalLink, Search, Heart, Pill, Shield, Users, ArrowRight, Star, Clock, User } from 'lucide-react';
import Modal from '../components/UI/Modal';

interface EducationalResource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'pdf' | 'interactive';
  category: string;
  duration?: string;
  rating: number;
  views: number;
  isNew?: boolean;
  url?: string;
}

const PatientEducation: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showStories, setShowStories] = useState(false);
  const [activeArticle, setActiveArticle] = useState<EducationalResource | null>(null);

  // Button handlers
  const handleReadStories = () => {
    setShowStories(true);
  };

  const handleResourceAction = (resource: EducationalResource) => {
    const actions = {
      video: () => setActiveArticle(resource),
      pdf: () => setActiveArticle(resource),
      interactive: () => setActiveArticle(resource),
      article: () => setActiveArticle(resource)
    };

    const action = resource.type === 'video' ? actions.video :
                  resource.type === 'pdf' ? actions.pdf :
                  resource.type === 'interactive' ? actions.interactive :
                  actions.article;
    
    action();
  };

  const categories = [
    { id: 'all', name: 'All Resources', icon: BookOpen },
    { id: 'treatment', name: 'Treatment Info', icon: Pill },
    { id: 'side-effects', name: 'Managing Side Effects', icon: Shield },
    { id: 'nutrition', name: 'Nutrition & Wellness', icon: Heart },
    { id: 'support', name: 'Support & Coping', icon: Users }
  ];

  const resources: EducationalResource[] = [
    {
      id: '1',
      title: 'Understanding Your Cancer Diagnosis',
      description: 'Learn about your specific type of cancer, staging, and what to expect during treatment.',
      type: 'article',
      category: 'treatment',
      duration: '10 min read',
      rating: 4.8,
      views: 2450,
      isNew: true
    },
    {
      id: '2',
      title: 'Managing Chemotherapy Side Effects',
      description: 'Practical tips for dealing with common side effects like nausea, fatigue, and hair loss.',
      type: 'video',
      category: 'side-effects',
      duration: '15 min',
      rating: 4.9,
      views: 3200
    },
    {
      id: '3',
      title: 'Nutrition During Cancer Treatment',
      description: 'Dietary guidelines, meal planning, and foods that can help you maintain strength during treatment.',
      type: 'pdf',
      category: 'nutrition',
      duration: '20 min read',
      rating: 4.7,
      views: 1800,
      isNew: true
    },
    {
      id: '4',
      title: 'Meditation for Cancer Patients',
      description: 'Guided meditation sessions specifically designed for cancer patients to reduce stress and anxiety.',
      type: 'interactive',
      category: 'support',
      duration: '20 min',
      rating: 4.6,
      views: 950
    },
    {
      id: '5',
      title: 'Understanding Your Lab Results',
      description: 'Learn how to read and understand your blood work and other laboratory test results.',
      type: 'article',
      category: 'treatment',
      duration: '8 min read',
      rating: 4.5,
      views: 1600
    },
    {
      id: '6',
      title: 'Building Your Support Network',
      description: 'Tips for communicating with family and friends about your cancer journey.',
      type: 'video',
      category: 'support',
      duration: '12 min',
      rating: 4.8,
      views: 2100
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'pdf': return Download;
      case 'interactive': return ExternalLink;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-600';
      case 'pdf': return 'bg-blue-100 text-blue-600';
      case 'interactive': return 'bg-purple-100 text-purple-600';
      default: return 'bg-green-100 text-green-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Educational Resources</h1>
        <p className="text-gray-600 mt-1">Learn about your condition, treatments, and how to manage your care</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search educational resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700 border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Featured Section */}
      <Card>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Featured: Patient Success Stories</h3>
              <p className="text-gray-700 mb-4">
                Read inspiring stories from other patients who have successfully navigated their cancer journey. 
                Learn from their experiences and find hope in their recovery.
              </p>
              <button 
                onClick={handleReadStories}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Read Stories</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const TypeIcon = getTypeIcon(resource.type);
          return (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  {resource.isNew && (
                    <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                      New
                    </span>
                  )}
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{resource.description}</p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{resource.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{resource.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{resource.views.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => handleResourceAction(resource)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <TypeIcon className="w-4 h-4" />
                  <span>
                    {resource.type === 'video' ? 'Watch Video' :
                     resource.type === 'pdf' ? 'Download PDF' :
                     resource.type === 'interactive' ? 'Start Interactive' :
                     'Read Article'}
                  </span>
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredResources.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600">Try adjusting your search terms or category filters.</p>
          </div>
        </Card>
      )}

      {/* Quick Links */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-900">Wellness Programs</h3>
              <p className="text-green-700 text-sm">Exercise, nutrition, and mental health resources</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Support Groups</h3>
              <p className="text-blue-700 text-sm">Connect with other patients and caregivers</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-purple-900">Treatment Guides</h3>
              <p className="text-purple-700 text-sm">Detailed information about your specific treatment</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-orange-900">Side Effect Management</h3>
              <p className="text-orange-700 text-sm">Tips and strategies for managing treatment side effects</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Stories Modal */}
      <Modal isOpen={showStories} onClose={() => setShowStories(false)} title="Patient Success Stories" size="lg">
        <div className="space-y-4">
          <p className="text-gray-700">Real-world experiences from patients navigating treatment and recovery.</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Managing side effects during chemotherapy</li>
            <li>Finding support networks that work</li>
            <li>Returning to everyday life after treatment</li>
          </ul>
          <p className="text-sm text-gray-500">This is a preview. Full stories will appear here.</p>
        </div>
      </Modal>

      {/* Article/Resource Modal */}
      <Modal
        isOpen={!!activeArticle}
        onClose={() => setActiveArticle(null)}
        title={activeArticle ? activeArticle.title : 'Resource'}
        size="lg"
      >
        {activeArticle && (
          <div className="space-y-3">
            <div className="text-sm text-gray-500">Type: {activeArticle.type.toUpperCase()} • {activeArticle.duration}</div>
            <p className="text-gray-800">{activeArticle.description}</p>
            <div className="text-sm text-gray-600">Category: {activeArticle.category}</div>
            <div className="text-xs text-gray-500">Rating: {activeArticle.rating} • Views: {activeArticle.views.toLocaleString()}</div>
            <div className="pt-2 text-sm text-gray-500">This is a preview. Full content will appear here.</div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientEducation;
