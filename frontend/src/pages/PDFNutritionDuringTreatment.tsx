import React from 'react';
import Card from '../components/UI/Card';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import { Download, Tag, Star, Eye, Info } from 'lucide-react';

const PDFNutritionDuringTreatment: React.FC = () => (
  <div className="space-y-6">
    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Educational Resources', href: '/education' }, { label: 'Nutrition During Cancer Treatment' }]} />
    <div className="flex items-start space-x-3">
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
        <Download className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nutrition During Cancer Treatment</h1>
        <div className="text-sm text-gray-600 flex items-center space-x-3 mt-1">
          <span>Type: PDF</span>
          <span>•</span>
          <span>20 min read</span>
        </div>
      </div>
    </div>

    <Card>
      <div className="p-6 space-y-6">
        <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600">
          <div className="inline-flex items-center gap-1">
            <Tag className="w-4 h-4" /> <span>nutrition</span>
          </div>
          <div className="inline-flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> <span>4.7</span>
          </div>
          <div className="inline-flex items-center gap-1">
            <Eye className="w-4 h-4" /> <span>1,800</span>
          </div>
        </div>

        <p className="text-gray-800">
          Dietary guidelines, meal planning, and foods that can help you maintain strength during treatment.
        </p>

        <div className="bg-blue-50 text-blue-800 border border-blue-200 rounded p-3 inline-flex items-start gap-2 text-sm">
          <Info className="w-4 h-4 mt-0.5" />
          <span>This is a preview. Full content will appear here.</span>
        </div>
      </div>
    </Card>
  </div>
);

export default PDFNutritionDuringTreatment;
