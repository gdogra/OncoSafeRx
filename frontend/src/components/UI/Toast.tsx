import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

type ToastType = 'success' | 'info' | 'warning' | 'error';

interface ToastAction {
  label: string;
  onClick?: () => void;
}

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  action?: ToastAction;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string, duration?: number, action?: ToastAction) => string;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, any>>({});

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const showToast = useCallback((type: ToastType, message: string, duration = 3000, action?: ToastAction) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const toast: ToastItem = { id, type, message, duration, action };
    setToasts(prev => [...prev, toast]);
    timers.current[id] = setTimeout(() => hideToast(id), duration);
    return id;
  }, [hideToast]);

  const value = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast viewport */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2">
        {toasts.map(t => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={`px-4 py-2 rounded shadow text-white flex items-start gap-3 ${
              t.type === 'success' ? 'bg-green-600' :
              t.type === 'warning' ? 'bg-yellow-600' :
              t.type === 'error' ? 'bg-red-600' : 'bg-gray-800'
            }`}
          >
            <div className="flex-1">{t.message}</div>
            {t.action && (
              <button
                className="underline text-white/90 hover:text-white text-sm"
                onClick={() => { try { t.action?.onClick?.(); } finally { hideToast(t.id); } }}
              >
                {t.action.label}
              </button>
            )}
            <button
              aria-label="Dismiss notification"
              className="ml-1 text-white/80 hover:text-white"
              onClick={() => hideToast(t.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
