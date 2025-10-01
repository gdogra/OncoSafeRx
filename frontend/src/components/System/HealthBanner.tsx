import React, { useEffect, useState } from 'react';

type HealthInfo = {
  status: string;
  timestamp: string;
  version: string;
  api: string;
  supabase?: { enabled: boolean };
  warnings?: string[];
};

const HealthBanner: React.FC<{ className?: string }>= ({ className = '' }) => {
  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch('/api/health');
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        if (!cancelled) setHealth(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load health');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const showWarning = !!error || (health?.warnings && health.warnings.length > 0) || health?.supabase?.enabled === false;
  if (!showWarning) return null;

  const supabaseOff = health?.supabase?.enabled === false || (health?.warnings || []).includes('supabase_not_configured');

  return (
    <div className={`rounded-md border p-3 text-sm ${supabaseOff ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-red-50 border-red-200 text-red-800'} ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium">System Health Notice</div>
          {error ? (
            <div>Health endpoint unavailable: {error}</div>
          ) : (
            <div>
              {supabaseOff ? (
                <span>Supabase is not configured. Writes will not persist; some actions operate in offline mode.</span>
              ) : (
                <span>Warnings: {(health?.warnings || []).join(', ')}</span>
              )}
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {health?.timestamp ? new Date(health.timestamp).toLocaleString() : ''}
        </div>
      </div>
    </div>
  );
};

export default HealthBanner;

