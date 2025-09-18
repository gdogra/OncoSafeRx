import React, { useState } from 'react';
import { Drug } from '../../types';
import DrugSearchBar from './DrugSearchBar';
import { Search, Tag, Star, Pill, Heart, Zap } from 'lucide-react';

interface SimpleDrugSearchProps {
  onSearch: (query: string, filters?: any) => void;
  onDrugSelect?: (drug: Drug) => void;
  loading?: boolean;
  className?: string;
}

// Common drug shortcuts organized by category
const drugShortcuts = {
  'Common Medications': [
    { term: 'aspirin', label: 'Aspirin' },
    { term: 'ibuprofen', label: 'Ibuprofen' },
    { term: 'acetaminophen', label: 'Acetaminophen' },
    { term: 'metformin', label: 'Metformin' },
  ],
  'Cardiovascular': [
    { term: 'atorvastatin', label: 'Atorvastatin' },
    { term: 'lisinopril', label: 'Lisinopril' },
    { term: 'amlodipine', label: 'Amlodipine' },
    { term: 'warfarin', label: 'Warfarin' },
  ],
  'Oncology': [
    { term: 'fluorouracil', label: 'Fluorouracil (5-FU)' },
    { term: 'cisplatin', label: 'Cisplatin' },
    { term: 'pembrolizumab', label: 'Pembrolizumab' },
    { term: 'doxorubicin', label: 'Doxorubicin' },
  ],
  'Gastrointestinal': [
    { term: 'omeprazole', label: 'Omeprazole' },
    { term: 'pantoprazole', label: 'Pantoprazole' },
    { term: 'ranitidine', label: 'Ranitidine' },
    { term: 'simethicone', label: 'Simethicone' },
  ],
};

const categoryIcons = {
  'Common Medications': Pill,
  'Cardiovascular': Heart,
  'Oncology': Zap,
  'Gastrointestinal': Star,
};

const SimpleDrugSearch: React.FC<SimpleDrugSearchProps> = ({
  onSearch,
  onDrugSelect,
  loading = false,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    onSearch(query);
  };

  const handleShortcutClick = (term: string) => {
    setSearchQuery(term);
    handleSearch(term);
  };

  // Keyboard navigation for shortcut buttons
  const shortcutsContainerId = 'shortcut-grid';
  const onShortcutsKeyDown = (e: React.KeyboardEvent) => {
    const key = e.key;
    if (!['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','j','k','h','l'].includes(key)) return;
    const container = document.getElementById(shortcutsContainerId);
    if (!container) return;
    const buttons = Array.from(container.querySelectorAll('button')) as HTMLButtonElement[];
    if (buttons.length === 0) return;
    const idx = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const horiz = key === 'ArrowRight' || key === 'l';
    const revh = key === 'ArrowLeft' || key === 'h';
    const vert = key === 'ArrowDown' || key === 'j';
    const revv = key === 'ArrowUp' || key === 'k';
    let next = idx;
    if (vert || horiz) next = Math.min(buttons.length - 1, Math.max(0, idx + 1));
    if (revv || revh) next = Math.min(buttons.length - 1, Math.max(0, idx - 1));
    if (next < 0) next = 0;
    buttons[next]?.focus();
    e.preventDefault();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Search Bar */}
      <div className="flex items-center space-x-2 mb-4">
        <Search className="w-6 h-6 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">Search Medications</h2>
      </div>

      <DrugSearchBar
        onSearch={handleSearch}
        loading={loading}
        placeholder="Enter drug name (e.g., aspirin, warfarin, fluorouracil)..."
        value={searchQuery}
        onChange={setSearchQuery}
        inputId="drug-search-input"
        className="w-full"
      />

      {/* Quick Access Shortcuts */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Quick Access by Category:</span>
        </div>

        <div
          id={shortcutsContainerId}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          tabIndex={0}
          onKeyDown={onShortcutsKeyDown}
          role="listbox"
          aria-label="Quick access drug shortcuts"
        >
          {Object.entries(drugShortcuts).map(([category, drugs]) => {
            const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                  <IconComponent className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium text-gray-800">{category}</span>
                </div>
                <div className="space-y-1">
                  {drugs.map((drug) => (
                    <button
                      key={drug.term}
                      onClick={() => handleShortcutClick(drug.term)}
                      className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-700 rounded transition-colors"
                      role="option"
                    >
                      {drug.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Search className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">Search Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Search by generic name (e.g., "acetaminophen") or brand name (e.g., "Tylenol")</li>
              <li>Use partial names - searching "aspir" will find "aspirin"</li>
              <li>Try drug categories like "statin" or "beta blocker"</li>
              <li>Search is case-insensitive</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDrugSearch;
