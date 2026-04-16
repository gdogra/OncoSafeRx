import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Drug } from '../types';

type SelectionState = {
  selectedDrugs: Drug[];
  lastSelected?: Drug | null;
  addDrug: (drug: Drug) => void;
  removeDrug: (rxcui: string) => void;
  clearDrugs: () => void;
  setDrugs: (drugs: Drug[]) => void;
};

const SelectionContext = createContext<SelectionState | undefined>(undefined);

const STORAGE_KEY = 'oncosaferx_selection';

export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);
  const [lastSelected, setLastSelected] = useState<Drug | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.selectedDrugs)) setSelectedDrugs(parsed.selectedDrugs);
        if (parsed?.lastSelected) setLastSelected(parsed.lastSelected);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedDrugs, lastSelected }));
    } catch {}
  }, [selectedDrugs, lastSelected]);

  const addDrug = (drug: Drug) => {
    setSelectedDrugs((prev) => {
      // Deduplicate by rxcui OR by drug name (case-insensitive)
      const nameLower = (drug.name || '').toLowerCase().trim();
      const isDuplicate = prev.some((d) =>
        d.rxcui === drug.rxcui ||
        (nameLower && (d.name || '').toLowerCase().trim() === nameLower)
      );
      return isDuplicate ? prev : [...prev, drug];
    });
    setLastSelected(drug);
    // Track popularity counts for local ranking
    try {
      const raw = localStorage.getItem('oncosaferx_popularity');
      const map = raw ? JSON.parse(raw) : {};
      map[drug.rxcui] = (map[drug.rxcui] || 0) + 1;
      localStorage.setItem('oncosaferx_popularity', JSON.stringify(map));
    } catch {}
  };

  const removeDrug = (rxcui: string) => {
    setSelectedDrugs((prev) => prev.filter((d) => d.rxcui !== rxcui));
  };

  const clearDrugs = () => {
    setSelectedDrugs([]);
    setLastSelected(null);
  };

  const setDrugs = (drugs: Drug[]) => {
    // Deduplicate by name (case-insensitive), keeping first occurrence
    const seen = new Set<string>();
    const unique = drugs.filter((d) => {
      const key = (d.name || d.rxcui || '').toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setSelectedDrugs(unique);
    setLastSelected(unique[unique.length - 1] || null);
  };

  const value = useMemo(
    () => ({ selectedDrugs, lastSelected, addDrug, removeDrug, clearDrugs, setDrugs }),
    [selectedDrugs, lastSelected]
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
};

export const useSelection = () => {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used within SelectionProvider');
  return ctx;
};
