import React, { useState } from 'react';
import { useComparison } from '../../contexts/ComparisonContext';
import { X, GitCompare, ChevronUp, ChevronDown, Trash2, RotateCcw, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Tooltip from '../UI/Tooltip';

const ComparisonTray: React.FC = () => {
  const { state, removeDrug, clearAll, toggleTray, closeTray, reorderItems } = useComparison();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (state.items.length === 0) {
    return null; // Don't render if empty
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderItems(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const handleCompare = () => {
    // Navigate to comparison page with drug IDs
    const drugIds = state.items.map(item => item.drug.rxcui).join(',');
    window.open(`/compare?drugs=${drugIds}`, '_blank');
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg transition-transform duration-300 ease-in-out z-40 ${
        state.isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ transform: state.isOpen ? 'translateY(0)' : 'translateY(calc(100% - 48px))' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTray}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label={state.isOpen ? 'Collapse comparison tray' : 'Expand comparison tray'}
          >
            {state.isOpen ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <div className="flex items-center space-x-2">
            <GitCompare className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-gray-900">
              Drug Comparison ({state.items.length}/{state.maxItems})
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {state.items.length >= 2 && (
            <Tooltip content="Compare selected drugs">
              <button
                onClick={handleCompare}
                className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded hover:bg-primary-700 transition-colors flex items-center space-x-1"
              >
                <GitCompare className="w-4 h-4" />
                <span>Compare</span>
              </button>
            </Tooltip>
          )}
          
          <Tooltip content="Clear all drugs">
            <button
              onClick={clearAll}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              aria-label="Clear all drugs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Tooltip>
          
          <Tooltip content="Close comparison tray">
            <button
              onClick={closeTray}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              aria-label="Close comparison tray"
            >
              <X className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Drug List */}
      {state.isOpen && (
        <div className="px-4 py-3 max-h-60 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {state.items.map((item, index) => (
              <div
                key={item.drug.rxcui}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative bg-gray-50 rounded-lg p-3 border transition-all duration-200 cursor-move hover:shadow-md ${
                  draggedIndex === index ? 'opacity-50 scale-95' : ''
                }`}
              >
                {/* Remove button */}
                <button
                  onClick={() => removeDrug(item.drug.rxcui)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  aria-label={`Remove ${item.drug.name} from comparison`}
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Drug info */}
                <div className="pr-6">
                  <h4 className="font-medium text-gray-900 text-sm truncate mb-1">
                    {item.drug.name}
                  </h4>
                  
                  {item.drug.generic && item.drug.generic !== item.drug.name && (
                    <p className="text-xs text-gray-600 truncate mb-1">
                      Generic: {item.drug.generic}
                    </p>
                  )}
                  
                  {item.drug.brand && item.drug.brand !== item.drug.name && (
                    <p className="text-xs text-gray-600 truncate mb-1">
                      Brand: {item.drug.brand}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {item.source && `From ${item.source}`}
                    </span>
                    
                    <Link
                      to={`/search?q=${encodeURIComponent(item.drug.name)}`}
                      className="text-xs text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                      title="View details"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add more placeholder */}
            {state.items.length < state.maxItems && (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-3 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <GitCompare className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                  <p className="text-xs">Add drug to compare</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Instructions */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Drag to reorder • Add drugs from search results • Compare 2+ drugs for interactions and details
            </p>
          </div>
        </div>
      )}

      {/* Collapsed state preview */}
      {!state.isOpen && (
        <div className="px-4 py-3">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {state.items.slice(0, 3).map((item) => (
              <div
                key={item.drug.rxcui}
                className="flex-shrink-0 bg-primary-50 text-primary-700 px-2 py-1 rounded text-xs font-medium"
              >
                {item.drug.name}
              </div>
            ))}
            {state.items.length > 3 && (
              <div className="flex-shrink-0 text-xs text-gray-500">
                +{state.items.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonTray;