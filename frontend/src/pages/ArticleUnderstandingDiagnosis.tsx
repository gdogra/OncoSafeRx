import React from 'react';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import Card from '../components/UI/Card';
import { BookOpen, Star, Clock, Tag, Eye } from 'lucide-react';

const ArticleUnderstandingDiagnosis: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Educational Resources', href: '/education' },
          { label: 'Understanding Your Cancer Diagnosis' },
        ]}
      />
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Understanding Your Cancer Diagnosis</h1>
          <div className="text-sm text-gray-600 flex items-center space-x-3 mt-1">
            <span>Type: ARTICLE</span>
            <span>•</span>
            <span>10 min read</span>
          </div>
        </div>
      </div>

      <Card>
        <div className="p-6 space-y-4">
          <p className="text-gray-800">
            Learn about your specific type of cancer, staging, and what to expect during treatment.
          </p>
          <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              <span>Category: treatment</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>Rating: 4.8</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>Views: 2,450</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">This is a preview. Full content will appear here.</p>
        </div>
      </Card>
    </div>
  );
};

export default ArticleUnderstandingDiagnosis;
