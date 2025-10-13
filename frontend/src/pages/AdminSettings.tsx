import React from 'react';
import Card from '../components/UI/Card';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import { Download } from 'lucide-react';
import { useToast } from '../components/UI/Toast';

const AdminSettings: React.FC = () => {
  const { showToast } = useToast();

  const exportFile = async (type: 'users' | 'stats') => {
    try {
      const resp = await fetch(`/api/admin/export/${type}`);
      if (!resp.ok) throw new Error('Export failed');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('success', `Exported ${type}`);
    } catch (e: any) {
      console.error(e);
      showToast('error', e?.message || 'Export failed');
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Admin', href: '/admin/console' }, { label: 'Admin Settings' }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600 mt-1">Maintenance and utilities</p>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export</h3>
        <div className="flex gap-3">
          <button onClick={() => exportFile('users')} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            <Download size={16} /> Export Users
          </button>
          <button onClick={() => exportFile('stats')} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            <Download size={16} /> Export Stats
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AdminSettings;
