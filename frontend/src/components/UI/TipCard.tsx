import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';

type TipCardProps = {
  id: string; // unique key for localStorage suppression
  title?: string;
  children: React.ReactNode;
  className?: string;
};

const TipCard: React.FC<TipCardProps> = ({ id, title = 'Quick Tip', children, className = '' }) => {
  const storageKey = `osrx_tip_dismissed:${id}`;
  const [visible, setVisible] = useState<boolean>(true);
  const [dontShow, setDontShow] = useState<boolean>(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(storageKey) === '1';
      if (dismissed) setVisible(false);
    } catch {}
  }, [storageKey]);

  if (!visible) return null;

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`} role="region" aria-label="Quick Tip">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <Info className="w-5 h-5 text-blue-600" aria-hidden />
        </div>
        <div className="flex-1">
          {title && <h3 className="font-semibold text-blue-900 mb-1">{title}</h3>}
          <div className="text-sm text-blue-800">
            {children}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-blue-900/80">
              <input type="checkbox" className="rounded" checked={dontShow} onChange={(e) => setDontShow(e.target.checked)} />
              Don’t show this again
            </label>
            <button
              onClick={() => {
                if (dontShow) {
                  try { localStorage.setItem(storageKey, '1'); } catch {}
                }
                setVisible(false);
              }}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipCard;

