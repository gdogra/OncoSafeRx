import React, { useEffect, useMemo, useRef, useState } from 'react';

type Option = {
  rxcui?: string | null;
  id?: string | null;
  name: string;
  type?: 'drug' | 'indication' | 'mechanism' | 'biomarker' | 'gene' | 'class';
};

interface Props {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onSelect: (opt: { rxcui?: string | null; name: string }) => void;
  maxResults?: number;
  onOfflineChange?: (offline: boolean) => void;
  onAutoResolve?: (opt: { rxcui?: string | null; name: string }) => void;
}

const LOCAL: Option[] = [
  { name: 'aspirin', type: 'drug' },
  { name: 'acetaminophen', type: 'drug' },
  { name: 'ibuprofen', type: 'drug' },
  { name: 'clopidogrel', type: 'drug' },
  { name: 'warfarin', type: 'drug' },
  { name: 'omeprazole', type: 'drug' },
  { name: 'simvastatin', type: 'drug' },
  { name: 'levodopa', type: 'drug' },
];

export default function SolidDrugSearch({ placeholder, value, onChange, onSelect, maxResults = 12, onOfflineChange, onAutoResolve }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const [highlight, setHighlight] = useState<number>(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastAutoFor = useRef<string>('');

  // Outside click to close
  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, []);

  // Fetch suggestions (debounced)
  useEffect(() => {
    let abort = false;
    const q = value.trim();
    if (q.length < 2) { setOptions([]); setOffline(false); onOfflineChange?.(false); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/drugs/suggestions?q=${encodeURIComponent(q)}&limit=${maxResults}`);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const data = await resp.json();
        if (abort) return;
        const opts = (data.suggestions || []).map((s: any) => ({ rxcui: s.rxcui, name: s.name, type: 'drug' }));
        setOptions(opts);
        setOffline(!!data.offline);
        onOfflineChange?.(!!data.offline);

        // Auto-resolve exact match: if user typed an exact drug name and we have a matching option
        const val = q.toLowerCase();
        const exact = opts.find(o => o.name.toLowerCase() === val);
        if (exact && lastAutoFor.current !== val) {
          lastAutoFor.current = val;
          onAutoResolve?.({ rxcui: exact.rxcui || null, name: exact.name });
        }

        // Auto-resolve single strong suggestion: one result and it starts with the query
        if (!exact && opts.length === 1) {
          const only = opts[0];
          if (only.name.toLowerCase().startsWith(val) && lastAutoFor.current !== val) {
            lastAutoFor.current = val;
            onAutoResolve?.({ rxcui: only.rxcui || null, name: only.name });
          }
        }
      } catch {
        if (!abort) {
          const lc = q.toLowerCase();
          const fallback = LOCAL.filter(o => o.name.includes(lc)).slice(0, maxResults);
          setOptions(fallback);
          setOffline(true);
          onOfflineChange?.(true);

          const exact = fallback.find(o => o.name.toLowerCase() === lc);
          if (exact && lastAutoFor.current !== lc) {
            lastAutoFor.current = lc;
            onAutoResolve?.({ rxcui: exact.rxcui || null, name: exact.name });
          }
        }
      } finally {
        if (!abort) setLoading(false);
      }
    }, 200);
    return () => { abort = true; clearTimeout(t); };
  }, [value, maxResults, onOfflineChange]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { 
      e.preventDefault(); 
      setHighlight(h => Math.min(h + 1, options.length - 1)); 
    }
    else if (e.key === 'ArrowUp') { 
      e.preventDefault(); 
      setHighlight(h => Math.max(h - 1, 0)); 
    }
    else if (e.key === 'Enter') { 
      e.preventDefault(); 
      if (highlight >= 0 && options[highlight]) {
        commit(options[highlight]);
      } else if (options.length === 1) {
        // Auto-select if only one option
        commit(options[0]);
      }
    }
    else if (e.key === 'Escape') { 
      setOpen(false); 
      setHighlight(-1);
    }
  };

  const commit = (opt: Option) => {
    onChange(opt.name); // Update the input value to show selection
    onSelect({ rxcui: opt.rxcui || null, name: opt.name });
    setOpen(false);
    setHighlight(-1);
    inputRef.current?.blur(); // Remove focus to indicate selection is complete
  };

  const displayOptions = useMemo(() => options.slice(0, maxResults), [options, maxResults]);

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full pl-3 pr-10 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-haspopup="listbox"
          role="combobox"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          {loading ? '...' : (offline ? 'offline' : '')}
        </div>
      </div>
      {open && displayOptions.length > 0 && (
        <ul role="listbox" className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-auto">
          {displayOptions.map((opt, idx) => (
            <li key={`${opt.rxcui || opt.name}-${idx}`}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setHighlight(idx)}
                onClick={() => commit(opt)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-150 ${
                  idx === highlight 
                    ? 'bg-violet-50 border-l-4 border-violet-500 shadow-sm' 
                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                }`}
                role="option"
                aria-selected={idx===highlight}
              >
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900 block truncate">{opt.name}</span>
                  {opt.type && (
                    <span className="text-xs text-gray-500 capitalize">{opt.type}</span>
                  )}
                </div>
                {opt.rxcui && (
                  <div className="flex-shrink-0 ml-3">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {opt.rxcui}
                    </span>
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
