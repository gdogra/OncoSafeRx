import React from 'react';
import Tooltip from '../UI/Tooltip';
import { adminApi } from '../../utils/adminApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type Status = 'ok' | 'unauthorized' | 'error' | 'unknown';

const colorFor = (s: Status) => {
  switch (s) {
    case 'ok': return 'bg-green-500';
    case 'unauthorized': return 'bg-red-500';
    case 'error': return 'bg-yellow-500';
    default: return 'bg-gray-400';
  }
};

const AdminApiStatus: React.FC<{ className?: string }>=({ className='' })=>{
  const { state } = useAuth();
  const navigate = useNavigate();
  const role = state.user?.role;
  const [status, setStatus] = React.useState<Status>('unknown');
  const [detail, setDetail] = React.useState<string>('Not checked');

  const check = async () => {
    if (!(role === 'admin' || role === 'super_admin')) { setStatus('unknown'); setDetail('Not admin'); return; }
    try {
      const resp = await adminApi.get('/api/admin/dashboard');
      if (resp.ok) {
        setStatus('ok');
        setDetail('200 OK');
      } else {
        setStatus('error');
        setDetail(`${resp.status}`);
      }
    } catch (e: any) {
      const code = e?.status;
      if (code === 401 || code === 403) { setStatus('unauthorized'); setDetail(String(code)); }
      else if (typeof code === 'number') { setStatus('error'); setDetail(String(code)); }
      else { setStatus('error'); setDetail('Network/Error'); }
    }
  };

  React.useEffect(() => {
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const pill = (
    <button
      onClick={() => navigate('/admin/auth-diagnostics')}
      className={`inline-flex items-center gap-2 px-2 py-1 text-xs font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-50 ${className}`}
      title="Admin API Diagnostics"
    >
      <span className={`inline-block w-2 h-2 rounded-full ${colorFor(status)}`} />
      <span className="text-gray-800">Admin API</span>
    </button>
  );

  return (
    <Tooltip content={`Admin API: ${detail}`}>
      {pill}
    </Tooltip>
  );
};

export default AdminApiStatus;

