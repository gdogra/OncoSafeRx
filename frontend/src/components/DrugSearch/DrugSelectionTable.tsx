import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Drug } from '../../types';
import {
  GripVertical,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Pill,
  AlertTriangle,
  Shield,
  Clock,
  Info,
  Star,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import Card from '../UI/Card';

interface DrugSelectionTableProps {
  drugs: Drug[];
  onDrugsReorder: (drugs: Drug[]) => void;
  onDrugRemove: (rxcui: string) => void;
  onDrugSelect?: (drug: Drug) => void;
  interactionResults?: any;
  loading?: boolean;
}

interface SortableRowProps {
  drug: Drug;
  index: number;
  onRemove: (rxcui: string) => void;
  onSelect?: (drug: Drug) => void;
  hasInteractions: boolean;
  interactionSeverity?: 'major' | 'moderate' | 'minor' | null;
}

const SortableRow: React.FC<SortableRowProps> = ({
  drug,
  index,
  onRemove,
  onSelect,
  hasInteractions,
  interactionSeverity
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: drug.rxcui });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getSeverityColor = () => {
    switch (interactionSeverity) {
      case 'major':
        return 'bg-red-50 border-red-200';
      case 'moderate':
        return 'bg-yellow-50 border-yellow-200';
      case 'minor':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getSeverityIcon = () => {
    switch (interactionSeverity) {
      case 'major':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'moderate':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'minor':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-50 transition-colors ${isDragging ? 'shadow-lg' : ''} ${getSeverityColor()}`}
    >
      {/* Drag Handle */}
      <td className="px-4 py-3 w-8">
        <button
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      
      {/* Order */}
      <td className="px-4 py-3 w-16 text-sm text-gray-500 font-mono">
        #{index + 1}
      </td>
      
      {/* Drug Name */}
      <td className="px-4 py-3">
        <div className="flex items-start space-x-3">
          <Pill className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">
              {drug.name}
            </div>
            {drug.synonym && drug.synonym !== drug.name && (
              <div className="text-sm text-gray-500 truncate">
                {drug.synonym}
              </div>
            )}
          </div>
        </div>
      </td>
      
      {/* RxCUI */}
      <td className="px-4 py-3 text-sm text-gray-500 font-mono">
        {drug.rxcui}
      </td>
      
      {/* Type */}
      <td className="px-4 py-3">
        {drug.tty && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {drug.tty}
          </span>
        )}
      </td>
      
      {/* Interaction Status */}
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          {getSeverityIcon()}
          <span className="text-sm text-gray-700">
            {hasInteractions 
              ? `${interactionSeverity?.charAt(0).toUpperCase()}${interactionSeverity?.slice(1)} Risk`
              : 'No Interactions'
            }
          </span>
        </div>
      </td>
      
      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          {onSelect && (
            <button
              onClick={() => onSelect(drug)}
              className="text-blue-600 hover:text-blue-700 p-1 rounded"
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onRemove(drug.rxcui)}
            className="text-red-600 hover:text-red-700 p-1 rounded"
            title="Remove drug"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const DrugSelectionTable: React.FC<DrugSelectionTableProps> = ({
  drugs,
  onDrugsReorder,
  onDrugRemove,
  onDrugSelect,
  interactionResults,
  loading = false
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'order' | 'name' | 'rxcui' | 'severity'>('order');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Process interaction data to determine severity for each drug
  const drugInteractions = useMemo(() => {
    if (!interactionResults?.interactions) return {};
    
    const interactions: Record<string, { severity: string; count: number }> = {};
    
    // Combine stored and external interactions
    const allInteractions = [
      ...(interactionResults.interactions.stored || []),
      ...(interactionResults.interactions.external || [])
    ];
    
    allInteractions.forEach((interaction: any) => {
      // Assuming interaction has drug1 and drug2 rxcuis and severity
      const rxcuis = [interaction.drug1, interaction.drug2];
      const severity = interaction.severity;
      
      rxcuis.forEach(rxcui => {
        if (!interactions[rxcui] || 
            (severity === 'major' && interactions[rxcui].severity !== 'major') ||
            (severity === 'moderate' && interactions[rxcui].severity === 'minor')) {
          interactions[rxcui] = {
            severity,
            count: (interactions[rxcui]?.count || 0) + 1
          };
        }
      });
    });
    
    return interactions;
  }, [interactionResults]);

  // Filter and sort drugs
  const processedDrugs = useMemo(() => {
    let filtered = drugs.filter(drug => {
      // Search filter
      if (searchFilter) {
        const searchLower = searchFilter.toLowerCase();
        const matchesSearch = 
          drug.name.toLowerCase().includes(searchLower) ||
          drug.synonym?.toLowerCase().includes(searchLower) ||
          drug.rxcui.includes(searchFilter);
        
        if (!matchesSearch) return false;
      }
      
      // Severity filter
      if (severityFilter !== 'all') {
        const drugSeverity = drugInteractions[drug.rxcui]?.severity;
        if (severityFilter === 'no-interactions' && drugSeverity) return false;
        if (severityFilter !== 'no-interactions' && drugSeverity !== severityFilter) return false;
      }
      
      return true;
    });

    // Sort
    if (sortBy !== 'order') {
      filtered.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;
        
        switch (sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'rxcui':
            aValue = a.rxcui;
            bValue = b.rxcui;
            break;
          case 'severity':
            const severityOrder = { 'major': 3, 'moderate': 2, 'minor': 1 };
            aValue = severityOrder[drugInteractions[a.rxcui]?.severity as keyof typeof severityOrder] || 0;
            bValue = severityOrder[drugInteractions[b.rxcui]?.severity as keyof typeof severityOrder] || 0;
            break;
          default:
            aValue = 0;
            bValue = 0;
        }
        
        if (sortDirection === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }
    
    return filtered;
  }, [drugs, searchFilter, severityFilter, sortBy, sortDirection, drugInteractions]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = drugs.findIndex((drug) => drug.rxcui === active.id);
      const newIndex = drugs.findIndex((drug) => drug.rxcui === over?.id);

      onDrugsReorder(arrayMove(drugs, oldIndex, newIndex));
    }
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  if (drugs.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center">
          <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Drugs Selected</h3>
          <p className="text-gray-600">
            Add medications using the search bar above to start building your drug list.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        {/* Header with Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Pill className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Selected Medications ({drugs.length})
            </h3>
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Drugs
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter by name or RxCUI..."
                    className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interaction Risk
                </label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="major">Major Risk Only</option>
                  <option value="moderate">Moderate Risk Only</option>
                  <option value="minor">Minor Risk Only</option>
                  <option value="no-interactions">No Interactions</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="order">Custom Order</option>
                  <option value="name">Drug Name</option>
                  <option value="rxcui">RxCUI</option>
                  <option value="severity">Risk Level</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                    {/* Drag handle column */}
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-16"
                    onClick={() => handleSort('order')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Order</span>
                      {getSortIcon('order')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Drug Name</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('rxcui')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>RxCUI</span>
                      {getSortIcon('rxcui')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('severity')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Interaction Status</span>
                      {getSortIcon('severity')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <SortableContext
                  items={processedDrugs.map(drug => drug.rxcui)}
                  strategy={verticalListSortingStrategy}
                >
                  {processedDrugs.map((drug, index) => (
                    <SortableRow
                      key={drug.rxcui}
                      drug={drug}
                      index={index}
                      onRemove={onDrugRemove}
                      onSelect={onDrugSelect}
                      hasInteractions={!!drugInteractions[drug.rxcui]}
                      interactionSeverity={drugInteractions[drug.rxcui]?.severity as any}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>
        </div>

        {/* Table Footer */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {processedDrugs.length} of {drugs.length} medications
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <GripVertical className="h-4 w-4 text-gray-400" />
              <span>Drag rows to reorder</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DrugSelectionTable;