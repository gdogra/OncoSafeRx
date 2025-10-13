import React from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DISMISS_KEY = 'osrx_admin_banner_dismissed';

const AdminModeBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { state } = useAuth();
  const location = useLocation();
  const role = state.user?.role;
  const inAdmin = location.pathname.startsWith('/admin');
  const canShow = inAdmin && (role === 'admin' || role === 'super_admin');

  const [dismissed, setDismissed] = React.useState<boolean>(() => {
    try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
  });

  const onClose = () => {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch {}
  };

  if (!canShow || dismissed) return null;

  return (
    <div className={`mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-800 flex items-center justify-between ${className}`} role="status" aria-live="polite">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-red-600" />
        <div className="text-sm">
          <span className="font-medium">Admin Mode:</span> You are viewing administrative pages. Use caution when making changes.
        </div>
      </div>
      <button onClick={onClose} aria-label="Dismiss admin mode banner" className="p-1 rounded hover:bg-red-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AdminModeBanner;

