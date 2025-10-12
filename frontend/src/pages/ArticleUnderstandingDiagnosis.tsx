import React from 'react';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import Card from '../components/UI/Card';
import { BookOpen, Star, Clock, Tag, Eye, Info } from 'lucide-react';

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
        <div className="p-6 space-y-6">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <div className="inline-flex items-center gap-2 bg-gray-100 rounded px-2 py-1">
              <span className="uppercase tracking-wide text-xs">Type</span> <span className="font-medium">ARTICLE</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <Clock className="w-4 h-4" /> <span>10 min read</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <Tag className="w-4 h-4" /> <span>treatment</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> <span>4.8</span>
            </div>
            <div className="inline-flex items-center gap-1">
              <Eye className="w-4 h-4" /> <span>2,450</span>
            </div>
          </div>

          {/* Summary */}
          <div className="text-gray-800">
            Learn about your specific type of cancer, how staging works, and what to expect during treatment and follow-up.
          </div>

          {/* Sections */}
          <div className="space-y-5 text-sm text-gray-800">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">What a diagnosis means</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your diagnosis describes the cancer type and where it started (the primary site).</li>
                <li>Biopsy and imaging help determine histology (cell type) and molecular markers.</li>
                <li>These details guide treatment options and prognosis.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Understanding staging</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Staging reflects tumor size, lymph node involvement, and spread (metastasis).</li>
                <li>It helps compare outcomes across patients and pick appropriate therapies.</li>
                <li>Staging may evolve as more information becomes available.</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">What to expect during treatment</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Common modalities include surgery, radiation, systemic therapy, or combinations.</li>
                <li>Side effects vary; your team will help prevent and manage them.</li>
                <li>Regular monitoring tracks response and helps adjust the plan if needed.</li>
              </ul>
            </div>
            <div className="bg-blue-50 text-blue-800 border border-blue-200 rounded p-3 inline-flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5" />
              <span>Always discuss your individual situation with your care team—this overview is general guidance.</span>
            </div>
          </div>

          <p className="text-xs text-gray-500">This is a preview. Full content will appear here.</p>
        </div>
      </Card>
    </div>
  );
};

export default ArticleUnderstandingDiagnosis;
