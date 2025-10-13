import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import Card from '../UI/Card';
import {
  Pill,
  Activity,
  Target,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  BarChart3,
  Eye,
  ExternalLink,
  Heart,
  Brain,
  Zap,
  Users,
  Globe,
  Award,
  DollarSign,
  Calendar,
  Info,
  ChevronDown,
  ChevronUp,
  Filter,
  Grid,
  List,
  Bookmark,
  Plus,
  Share2,
  Download
} from 'lucide-react';

// Lightweight UI fallbacks to avoid missing component imports
const CardHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={clsx('pb-2', className)}>{children}</div>
);
const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={clsx('pt-2', className)}>{children}</div>
);
const CardTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <h3 className={clsx('text-base font-semibold', className)}>{children}</h3>
);
const Badge: React.FC<{ className?: string; variant?: 'outline' | 'solid'; children: React.ReactNode }> = ({ className, children, variant = 'solid' }) => (
  <span className={clsx(
    'inline-flex items-center px-2 py-0.5 rounded text-xs',
    variant === 'outline' ? 'border border-gray-300 text-gray-700' : 'bg-gray-100 text-gray-800',
    className
  )}>{children}</span>
);
const Button: React.FC<{ className?: string; variant?: 'default' | 'outline' | 'ghost'; size?: 'sm' | 'md'; onClick?: () => void; disabled?: boolean; children: React.ReactNode }>
  = ({ className, variant = 'default', size = 'md', onClick, disabled, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center gap-1 rounded transition-colors',
        size === 'sm' ? 'px-2 py-1 text-sm' : 'px-3 py-2',
        variant === 'default' && 'bg-gray-900 text-white hover:bg-gray-800',
        variant === 'outline' && 'border border-gray-300 text-gray-700 hover:bg-gray-50',
        variant === 'ghost' && 'text-gray-600 hover:bg-gray-100',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );

interface EnhancedDrug {
  id: string;
  name: string;
  genericName?: string;
  brandName?: string;
  therapeuticClass: string;
  mechanismOfAction: string;
  indication: string[];
  biomarkers?: string[];
  fdaApproved: boolean;
  approvalDate?: string;
  clinicalTrialPhase?: string;
  safetyScore: number;
  efficacyScore: number;
  evidenceLevel: 'high' | 'moderate' | 'low';
  hasInteractions: boolean;
  hasGenomicFactors: boolean;
  requiresMonitoring: boolean;
  blackBoxWarning?: boolean;
  pregnancyCategory?: string;
  costTier: 'low' | 'moderate' | 'high' | 'specialty';
  routeOfAdministration: string[];
  dosageForm: string[];
  keyBenefits: string[];
  keyRisks: string[];
  commonSideEffects: string[];
  monitoringRequirements: string[];
  contraindications: string[];
  patientSuitability: string[];
  relatedDrugs: string[];
  clinicalTrials: number;
  publications: number;
  patientReviews?: number;
  isOncologyDrug: boolean;
  isOrphanDrug: boolean;
  thumbnailUrl?: string;
}

interface EnhancedDrugResultsProps {
  drugs: EnhancedDrug[];
  loading?: boolean;
  error?: string;
  onDrugSelect: (drug: EnhancedDrug) => void;
  onCompare?: (drugs: EnhancedDrug[]) => void;
  viewMode?: 'grid' | 'list' | 'detailed';
  sortBy?: string;
  filterBy?: any;
  onPin?: (drug: EnhancedDrug) => void;
  onAddToInteractions?: (drug: EnhancedDrug) => void;
}

const EnhancedDrugResults: React.FC<EnhancedDrugResultsProps> = ({
  drugs,
  loading,
  error,
  onDrugSelect,
  onCompare,
  viewMode = 'grid',
  sortBy = 'relevance',
  filterBy = {},
  onPin,
  onAddToInteractions
}) => {
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);
  const [currentSortBy, setCurrentSortBy] = useState(sortBy);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCards, setExpandedCards] = useState<string[]>([]);

  const handleDrugToggle = (drugId: string) => {
    setSelectedDrugs(prev => 
      prev.includes(drugId) 
        ? prev.filter(id => id !== drugId)
        : [...prev, drugId]
    );
  };

  const handleCardExpand = (drugId: string) => {
    setExpandedCards(prev =>
      prev.includes(drugId)
        ? prev.filter(id => id !== drugId)
        : [...prev, drugId]
    );
  };

  const sortedAndFilteredDrugs = useMemo(() => {
    let result = [...drugs];

    // Apply filters
    if (filterBy.fdaApproved !== undefined) {
      result = result.filter(drug => drug.fdaApproved === filterBy.fdaApproved);
    }
    if (filterBy.isOncologyDrug !== undefined) {
      result = result.filter(drug => drug.isOncologyDrug === filterBy.isOncologyDrug);
    }
    if (filterBy.therapeuticClass) {
      result = result.filter(drug => drug.therapeuticClass === filterBy.therapeuticClass);
    }
    if (filterBy.evidenceLevel) {
      result = result.filter(drug => drug.evidenceLevel === filterBy.evidenceLevel);
    }

    // Apply sorting
    switch (currentSortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'safety':
        result.sort((a, b) => b.safetyScore - a.safetyScore);
        break;
      case 'efficacy':
        result.sort((a, b) => b.efficacyScore - a.efficacyScore);
        break;
      case 'approval_date':
        result.sort((a, b) => {
          if (!a.approvalDate) return 1;
          if (!b.approvalDate) return -1;
          return new Date(b.approvalDate).getTime() - new Date(a.approvalDate).getTime();
        });
        break;
      case 'clinical_trials':
        result.sort((a, b) => b.clinicalTrials - a.clinicalTrials);
        break;
      default:
        // Keep original order for relevance
        break;
    }

    return result;
  }, [drugs, filterBy, currentSortBy]);

  const getEvidenceBadge = (level: string) => {
    const variants = {
      high: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      low: 'bg-red-100 text-red-800'
    };
    return variants[level as keyof typeof variants] || variants.moderate;
  };

  const getCostBadge = (tier: string) => {
    const variants = {
      low: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      specialty: 'bg-purple-100 text-purple-800'
    };
    return variants[tier as keyof typeof variants] || variants.moderate;
  };

  // Local storage fallbacks for pin/add when no callbacks provided
  const defaultPin = (drug: EnhancedDrug) => {
    try {
      const key = 'osrx_pinned_drugs';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      if (!list.find((d: any) => d.id === drug.id)) {
        list.unshift({ id: drug.id, name: drug.name });
        localStorage.setItem(key, JSON.stringify(list.slice(0, 20)));
      }
    } catch {}
  };

  const defaultAddToInteractions = (drug: EnhancedDrug) => {
    try {
      const key = 'osrx_interaction_basket';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      if (!list.find((d: any) => d.id === drug.id)) {
        list.push({ id: drug.id, name: drug.name });
        localStorage.setItem(key, JSON.stringify(list.slice(-10)));
      }
    } catch {}
  };

  const renderDrugCard = (drug: EnhancedDrug, isExpanded: boolean = false) => (
    <Card key={drug.id} className={`transition-all duration-200 hover:shadow-lg ${
      selectedDrugs.includes(drug.id) ? 'ring-2 ring-violet-500' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={selectedDrugs.includes(drug.id)}
                onChange={() => handleDrugToggle(drug.id)}
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <CardTitle className="text-lg font-semibold text-gray-900">
                {drug.name}
              </CardTitle>
              {drug.blackBoxWarning && (
                <Badge className="bg-red-100 text-red-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Black Box
                </Badge>
              )}
            </div>
            
            {drug.genericName && drug.genericName !== drug.name && (
              <p className="text-sm text-gray-600 mb-2">
                Generic: {drug.genericName}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                {drug.therapeuticClass}
              </Badge>
              <Badge className={getEvidenceBadge(drug.evidenceLevel)}>
                {drug.evidenceLevel} evidence
              </Badge>
              {drug.fdaApproved && (
                <Badge className="bg-blue-100 text-blue-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  FDA Approved
                </Badge>
              )}
              {drug.isOncologyDrug && (
                <Badge className="bg-purple-100 text-purple-800">
                  <Target className="h-3 w-3 mr-1" />
                  Oncology
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">{drug.efficacyScore}/100</span>
            </div>
            <Badge className={getCostBadge(drug.costTier)}>
              <DollarSign className="h-3 w-3 mr-1" />
              {drug.costTier}
            </Badge>
            <div className="flex items-center gap-2">
              <button
                title="Pin"
                onClick={() => (onPin ? onPin(drug) : defaultPin(drug))}
                className="text-gray-500 hover:text-violet-700"
              >
                <Bookmark className="h-4 w-4" />
              </button>
              <button
                title="Add to interactions"
                onClick={() => (onAddToInteractions ? onAddToInteractions(drug) : defaultAddToInteractions(drug))}
                className="text-gray-500 hover:text-violet-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Information */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Mechanism & Indications</h4>
          <p className="text-sm text-gray-600 mb-2">{drug.mechanismOfAction}</p>
          <div className="flex flex-wrap gap-1">
            {drug.indication.slice(0, 3).map((indication, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {indication}
              </Badge>
            ))}
            {drug.indication.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{drug.indication.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Scores Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Safety</span>
            </div>
            <div className="text-lg font-bold text-green-800">{drug.safetyScore}/100</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Efficacy</span>
            </div>
            <div className="text-lg font-bold text-blue-800">{drug.efficacyScore}/100</div>
          </div>
        </div>

        {/* Biomarkers */}
        {drug.biomarkers && drug.biomarkers.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-1">
              <Activity className="h-4 w-4 text-purple-600" />
              <span>Biomarker Targets</span>
            </h4>
            <div className="flex flex-wrap gap-1">
              {drug.biomarkers.map((biomarker, idx) => (
                <Badge key={idx} className="bg-purple-100 text-purple-800 text-xs">
                  {biomarker}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Expanded Information */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* Key Benefits & Risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-green-800 mb-2 flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Key Benefits</span>
                </h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  {drug.keyBenefits.slice(0, 3).map((benefit, idx) => (
                    <li key={idx}>• {benefit}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-red-800 mb-2 flex items-center space-x-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Key Risks</span>
                </h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  {drug.keyRisks.slice(0, 3).map((risk, idx) => (
                    <li key={idx}>• {risk}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Clinical Data */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-900">{drug.clinicalTrials}</div>
                <div className="text-xs text-gray-600">Clinical Trials</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-900">{drug.publications}</div>
                <div className="text-xs text-gray-600">Publications</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-900">
                  {drug.approvalDate ? new Date(drug.approvalDate).getFullYear() : 'N/A'}
                </div>
                <div className="text-xs text-gray-600">FDA Approval</div>
              </div>
            </div>

            {/* Monitoring Requirements */}
            {drug.monitoringRequirements.length > 0 && (
              <div>
                <h5 className="font-medium text-orange-800 mb-2 flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Monitoring Required</span>
                </h5>
                <div className="flex flex-wrap gap-1">
                  {drug.monitoringRequirements.slice(0, 3).map((req, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCardExpand(drug.id)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {isExpanded ? 'Less' : 'More'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDrugSelect(drug)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Search Results</h2>
          <p className="text-gray-600">
            Found {sortedAndFilteredDrugs.length} drug{sortedAndFilteredDrugs.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Sort Controls */}
          <select
            value={currentSortBy}
            onChange={(e) => setCurrentSortBy(e.target.value)}
            className="w-48 border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="relevance">Relevance</option>
            <option value="name">Name (A-Z)</option>
            <option value="safety">Safety Score</option>
            <option value="efficacy">Efficacy Score</option>
            <option value="approval_date">Approval Date</option>
            <option value="clinical_trials">Clinical Trials</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={currentViewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={currentViewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Selected Drugs Actions */}
      {selectedDrugs.length > 0 && (
        <Card className="border-violet-200 bg-violet-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-violet-800">
                {selectedDrugs.length} drug{selectedDrugs.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCompare?.(drugs.filter(d => selectedDrugs.includes(d.id)))}
                  disabled={selectedDrugs.length < 2}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Compare
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDrugs([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Grid/List */}
      <div className={
        currentViewMode === 'grid' 
          ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
          : 'space-y-4'
      }>
        {sortedAndFilteredDrugs.map(drug => 
          renderDrugCard(drug, expandedCards.includes(drug.id))
        )}
      </div>

      {/* No Results */}
      {sortedAndFilteredDrugs.length === 0 && (
        <Card className="border-gray-200">
          <CardContent className="p-12 text-center">
            <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No drugs found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters to find more results.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedDrugResults;
