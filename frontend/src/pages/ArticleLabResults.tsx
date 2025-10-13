import React from 'react';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import Card from '../components/UI/Card';
import { BookOpen, Beaker, Info } from 'lucide-react';

const ArticleLabResults: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Educational Resources', href: '/education' }, { label: 'Understanding Your Lab Results' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Understanding Your Lab Results</h1>
        <span className="text-sm text-gray-600">Type: ARTICLE • 8 min read</span>
      </div>

      <Card>
        <div className="prose max-w-none">
          <p className="text-gray-700 text-lg">Learn how to read and understand your blood work and other laboratory test results.</p>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3 my-4">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              Your care team will always interpret results in the context of your overall health and treatment plan.
            </div>
          </div>

          <h2 className="flex items-center space-x-2"><Beaker className="w-5 h-5 text-gray-700" /><span>Common Blood Tests</span></h2>
          <ul>
            <li><strong>CBC (Complete Blood Count):</strong> Hemoglobin, hematocrit, white blood cells (WBC), and platelets. Low WBC may increase infection risk; low platelets may increase bleeding risk.</li>
            <li><strong>CMP (Comprehensive Metabolic Panel):</strong> Kidney (creatinine, BUN) and liver (ALT, AST, bilirubin) function; electrolytes (sodium, potassium).</li>
            <li><strong>ANC (Absolute Neutrophil Count):</strong> A key value for treatment safety. Your team may delay or adjust chemotherapy if ANC is low.</li>
          </ul>

          <h2>What is a Reference Range?</h2>
          <p>Labs typically report a reference range that reflects values for healthy individuals. Being slightly outside the range doesn’t always mean something is wrong. Trends over time are often more important than a single number.</p>

          <h2>When to Contact Your Care Team</h2>
          <ul>
            <li>Unexpected symptoms like fever (≥38°C / 100.4°F), bleeding, or severe fatigue.</li>
            <li>Rapid changes in values or persistent abnormalities.</li>
          </ul>

          <h2>Tips for Tracking</h2>
          <ul>
            <li>Keep a simple log of key values (e.g., ANC, platelets, creatinine).</li>
            <li>Note timing relative to treatment cycles—some fluctuations are expected.</li>
          </ul>

          <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200 flex items-start space-x-3">
            <BookOpen className="w-5 h-5 text-gray-700 mt-0.5" />
            <div className="text-sm text-gray-700">
              This article is informational and not a substitute for medical advice. Always discuss lab results with your clinician.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ArticleLabResults;

