import React from 'react';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import Card from '../components/UI/Card';
import { Users, Play, Info } from 'lucide-react';

const VideoSupportNetwork: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Educational Resources', href: '/education' }, { label: 'Building Your Support Network' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Building Your Support Network</h1>
        <span className="text-sm text-gray-600">Type: VIDEO • 12 min</span>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="relative w-full h-0 pb-[56.25%] bg-black rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <Play className="w-12 h-12 opacity-80" />
              <span className="ml-3 opacity-80">Video placeholder</span>
            </div>
          </div>
          <p className="text-gray-700">Tips for communicating with family and friends about your cancer journey and creating a strong support system.</p>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">If you need additional support, talk to your care team about counseling, social work, and support group options.</div>
          </div>

          <h2 className="flex items-center space-x-2 text-lg font-semibold text-gray-900"><Users className="w-5 h-5" /><span>Practical Steps</span></h2>
          <ul className="list-disc pl-6 text-gray-800 space-y-1">
            <li>Identify 2–3 people to update regularly and who can coordinate help.</li>
            <li>Be specific in asking for help (meals, rides, childcare, appointment accompaniment).</li>
            <li>Use shared calendars or group chats to organize tasks.</li>
            <li>Consider professional support: social workers, peer groups, or counseling.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default VideoSupportNetwork;

