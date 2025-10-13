import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Tooltip from './Tooltip';

type ThemeMode = 'light' | 'dark' | 'auto';

const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { state, actions } = useAuth();
  const theme = (state.user?.preferences?.theme as ThemeMode) || 'light';

  const applyTheme = (mode: ThemeMode) => {
    try {
      const root = document.documentElement;
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const useDark = mode === 'dark' || (mode === 'auto' && prefersDark);
      root.classList[useDark ? 'add' : 'remove']('dark');
      root.setAttribute('data-theme', mode || 'light');
      try { localStorage.setItem('osrx_theme', mode); } catch {}
    } catch {}
  };

  const next = (t: ThemeMode): ThemeMode => (t === 'light' ? 'dark' : t === 'dark' ? 'auto' : 'light');

  const onClick = async () => {
    const nextTheme = next(theme);
    applyTheme(nextTheme);
    try {
      await actions.updateProfile({ preferences: { ...(state.user?.preferences || {}), theme: nextTheme } as any });
      try { (window as any)?.showToast?.('success', `Theme: ${nextTheme}`); } catch {}
    } catch {
      try { (window as any)?.showToast?.('warning', 'Theme changed locally (save failed)'); } catch {}
    }
  };

  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
  const label = theme.charAt(0).toUpperCase() + theme.slice(1);

  return (
    <Tooltip content={`Theme: ${label} — Shift + D`}>
      <button
        onClick={onClick}
        aria-label={`Theme: ${label}`}
        className={`inline-flex items-center gap-2 px-2.5 py-1.5 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 ${className}`}
      >
        <Icon className="w-4 h-4 text-gray-600" />
        <span className="text-gray-700 hidden sm:inline">{label}</span>
      </button>
    </Tooltip>
  );
};

export default ThemeToggle;
