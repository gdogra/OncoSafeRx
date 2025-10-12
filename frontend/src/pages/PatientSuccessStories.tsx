import React from 'react';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import Card from '../components/UI/Card';
import { Clock, User, Tag } from 'lucide-react';

const PatientSuccessStories: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Educational Resources', href: '/education' },
          { label: 'Patient Success Stories' },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patient Success Stories</h1>
        <p className="text-gray-600 mt-1">Real-world experiences from patients navigating treatment and recovery.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Story 1 */}
        <Card className="p-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Managing side effects during chemotherapy</h2>
            <p className="text-sm text-gray-700">
              From nausea and fatigue to changes in appetite, chemotherapy can be hard on daily life.
              Patients share practical strategies that helped them keep routines, communicate with their
              care teams, and feel more in control.
            </p>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="inline-flex items-center gap-2">
                <User className="w-4 h-4" /> <span>Alex R.</span>
                <Tag className="w-4 h-4 ml-3" /> <span>Side Effects</span>
              </div>
              <div className="inline-flex items-center gap-1">
                <Clock className="w-4 h-4" /> <span>3 min read</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">This is a preview. Full story will appear here.</p>
          </div>
        </Card>

        {/* Story 2 */}
        <Card className="p-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Finding support networks that work</h2>
            <p className="text-sm text-gray-700">
              Whether in-person groups, online communities, or 1:1 peer connections, support can look different
              for everyone. Read how patients matched the right type of support to their personality and schedule.
            </p>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="inline-flex items-center gap-2">
                <User className="w-4 h-4" /> <span>Priya S.</span>
                <Tag className="w-4 h-4 ml-3" /> <span>Community</span>
              </div>
              <div className="inline-flex items-center gap-1">
                <Clock className="w-4 h-4" /> <span>4 min read</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">This is a preview. Full story will appear here.</p>
          </div>
        </Card>

        {/* Story 3 */}
        <Card className="p-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Returning to everyday life after treatment</h2>
            <p className="text-sm text-gray-700">
              The transition after treatment can be emotional. Patients describe pacing their return to work,
              rebuilding energy, and navigating follow-up care—while celebrating milestones along the way.
            </p>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="inline-flex items-center gap-2">
                <User className="w-4 h-4" /> <span>Jordan M.</span>
                <Tag className="w-4 h-4 ml-3" /> <span>Recovery</span>
              </div>
              <div className="inline-flex items-center gap-1">
                <Clock className="w-4 h-4" /> <span>3 min read</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">This is a preview. Full story will appear here.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PatientSuccessStories;
