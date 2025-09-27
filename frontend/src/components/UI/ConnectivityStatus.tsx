import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import Tooltip from './Tooltip';

type Status = 'unknown' | 'online' | 'offline' | 'error';

interface Props {
  apiBase?: string; // optional override
  align?: 'left' | 'right';
  compact?: boolean;
  pollMs?: number; // default 120000
}

const STORAGE_KEY = 'rxnorm_connectivity_meta';

function readStored(): { status: Status; at: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.status === 'string' && typeof parsed?.at === 'number') return parsed;
  } catch {}
  return null;
}

function writeStored(status: Status) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ status, at: Date.now() }));
  } catch {}
}

export default function ConnectivityStatus({ apiBase, align = 'right', compact = false, pollMs = 120000 }: Props) {
  const base = useMemo(() => {
    if (apiBase) return apiBase;
    const vite = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
    // Use Netlify proxy for production (avoids CORS issues)
    if (typeof window !== 'undefined' && window.location?.hostname !== 'localhost') {
      console.log('🚨 ConnectivityStatus: Using Netlify proxy for production API calls');
      return '/api';
    }
    if (vite?.trim()) return vite;
    if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') return 'http://localhost:3000/api';
    if (typeof window !== 'undefined' && window.location?.origin) return `${window.location.origin}/api`;
    return '/api';
  }, [apiBase]);

  const [status, setStatus] = useState<Status>(() => readStored()?.status || 'unknown');
  const [checkedAt, setCheckedAt] = useState<string | null>(() => {
    const st = readStored();
    return st?.at ? new Date(st.at).toLocaleTimeString() : null;
  });
  const [testing, setTesting] = useState(false);
  const timerRef = useRef<number | null>(null);

  async function test() {
    try {
      setTesting(true);
      const resp = await fetch(`${base}/drugs/suggestions?q=aspirin&limit=1`);
      if (!resp.ok) {
        // Handle rate limiting as online (API is responding)
        if (resp.status === 429) {
          setStatus('online');
          writeStored('online');
        } else {
          // Check if we're getting HTML instead of JSON (API not deployed)
          const text = await resp.text();
          if (text.includes('<!doctype html>')) {
            setStatus('offline');
            writeStored('offline');
          } else {
            setStatus('error');
            writeStored('error');
          }
        }
      } else {
        const data = await resp.json();
        const s: Status = data?.offline ? 'offline' : 'online';
        setStatus(s);
        writeStored(s);
      }
      setCheckedAt(new Date().toLocaleTimeString());
    } catch {
      setStatus('offline'); // Treat as offline instead of error for better UX
      writeStored('offline');
      setCheckedAt(new Date().toLocaleTimeString());
    } finally {
      setTesting(false);
    }
  }

  useEffect(() => {
    // initial light check only if unknown/stale (>10min)
    const st = readStored();
    const stale = !st || (Date.now() - st.at > 10 * 60 * 1000);
    if (stale) test().catch(() => {});
    // background polling
    timerRef.current = window.setInterval(() => { test().catch(() => {}); }, Math.max(30000, pollMs));
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [base, pollMs]);

  const dotClass = status === 'online' ? 'bg-green-500' : status === 'offline' ? 'bg-amber-500' : status === 'error' ? 'bg-red-500' : 'bg-gray-400';

  return (
    <div className={`inline-flex items-center gap-2 text-xs ${compact ? '' : 'bg-gray-50 border border-gray-200 rounded px-2 py-1'}`} style={{ justifySelf: align }}>
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${dotClass}`} />
      {!compact && (
        <span className="text-gray-700">
          {status === 'online' && 'RxNorm: Online'}
          {status === 'offline' && 'RxNorm: Offline (fallback)'}
          {status === 'error' && 'RxNorm: Error'}
          {status === 'unknown' && 'RxNorm: Unknown'}
          {checkedAt ? ` • ${checkedAt}` : ''}
        </span>
      )}
      <button onClick={test} disabled={testing} className="text-blue-700 hover:text-blue-800 underline disabled:opacity-60">
        {testing ? 'Testing…' : 'Test'}
      </button>
      {!compact && (
        <Tooltip
          content={
            'When offline, typeahead uses a limited local list. Full search and details may rely on RxNorm. The app auto-checks every 2 minutes. Only a generic test query ("aspirin") is sent—no PHI.'
          }
          position="top"
        >
          <span aria-label="Connectivity details" className="inline-flex items-center text-gray-500 hover:text-gray-700 cursor-help">
            <Info className="w-3.5 h-3.5" />
          </span>
        </Tooltip>
      )}
    </div>
  );
}
