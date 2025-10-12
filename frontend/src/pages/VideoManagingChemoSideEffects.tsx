import React from 'react';
import Card from '../components/UI/Card';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import { Play, Tag, Star, Eye, Info } from 'lucide-react';

const VideoManagingChemoSideEffects: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Educational Resources', href: '/education' }, { label: 'Managing Chemotherapy Side Effects' }]} />
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <Play className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Managing Chemotherapy Side Effects</h1>
          <div className="text-sm text-gray-600 flex items-center space-x-3 mt-1">
            <span>Type: VIDEO</span>
            <span>•</span>
            <span>15 min</span>
          </div>
        </div>
      </div>

      <Card>
        <div className="p-6 space-y-6">
          <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600">
            <div className="inline-flex items-center gap-1">
              <Tag className="w-4 h-4" /> <span>side-effects</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> <span>4.9</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <Eye className="w-4 h-4" /> <span>3,200</span>
            </div>
          </div>

          <p className="text-gray-800">
            Practical tips for dealing with common side effects like nausea, fatigue, and hair loss.
          </p>

          <div className="bg-blue-50 text-blue-800 border border-blue-200 rounded p-3 inline-flex items-start gap-2 text-sm">
            <Info className="w-4 h-4 mt-0.5" />
            <span>This is a preview. Full content will appear here.</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VideoManagingChemoSideEffects;
