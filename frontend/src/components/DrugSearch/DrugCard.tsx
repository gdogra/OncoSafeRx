import React from 'react';
import { Drug } from '../../types';
import { Pill, ChevronRight, Tag, AlertTriangle, Share2, Activity, Dna, MapPinned, Star } from 'lucide-react';
import Card from '../UI/Card';
import Tooltip from '../UI/Tooltip';
import { useNavigate } from 'react-router-dom';
import { useSelection } from '../../context/SelectionContext';
import { analytics } from '../../utils/analytics';
import { inferBiomarkerForDrug } from '../../utils/biomarkers';
import { isPinned, togglePin } from '../../utils/pins';

interface DrugCardProps {
  drug: Drug;
  onClick?: (drug: Drug) => void;
  showDetails?: boolean;
  showTooltips?: boolean;
  className?: string;
}

const DrugCard: React.FC<DrugCardProps> = ({ drug, onClick, showDetails = false, showTooltips = true, className = '' }) => {
  const navigate = useNavigate();
  const selection = useSelection();

  const handleClick = () => {
    onClick?.(drug);
  };

  const getSeverityColor = (tty?: string) => {
    if (!tty) return 'bg-gray-100 text-gray-700';
    
    switch (tty.toLowerCase()) {
      case 'scd':
      case 'sbd':
        return 'bg-primary-100 text-primary-700';
      case 'gpck':
      case 'bpck':
        return 'bg-warning-100 text-warning-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTty = (tty?: string) => {
    if (!tty) return 'Unknown';
    
    const ttyMap: Record<string, string> = {
      'SCD': 'Clinical Drug',
      'SBD': 'Branded Drug',
      'GPCK': 'Generic Pack',
      'BPCK': 'Branded Pack',
    };
    
    return ttyMap[tty.toUpperCase()] || tty;
  };

  // Get drug information tooltip
  const getDrugInfoTooltip = () => (
    <div className="space-y-2 text-xs">
      <div className="font-semibold">Drug Information:</div>
      <div>Name: {drug.name}</div>
      <div>RXCUI: {drug.rxcui}</div>
      {drug.tty && <div>Type: {formatTty(drug.tty)}</div>}
      {drug.generic_name && <div>Generic: {drug.generic_name}</div>}
      {drug.therapeutic_class && <div>Class: {drug.therapeutic_class}</div>}
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="text-gray-300">{onClick ? 'Click for more details' : 'Drug details'}</div>
      </div>
    </div>
  );

  // Get TTY explanation tooltip
  const getTtyTooltip = (tty?: string) => {
    const explanations: Record<string, string> = {
      'SCD': 'Semantic Clinical Drug - A clinical drug with specific ingredient(s), strength(s), and dose form',
      'SBD': 'Semantic Branded Drug - A branded drug with specific ingredient(s), strength(s), and dose form',
      'GPCK': 'Generic Pack - A collection of generic drugs in a package',
      'BPCK': 'Branded Pack - A collection of branded drugs in a package',
    };

    if (!tty) return 'Drug type classification from RxNorm terminology';
    
    return explanations[tty.toUpperCase()] || `${tty} - Drug type classification`;
  };

  // Get clinical safety tooltip
  const getClinicalSafetyTooltip = () => (
    <div className="space-y-2 text-xs">
      <div className="font-semibold text-amber-200">Clinical Safety:</div>
      <ul className="space-y-1 list-disc list-inside">
        <li>Always verify drug name and strength</li>
        <li>Check for patient allergies</li>
        <li>Review contraindications</li>
        <li>Consider drug interactions</li>
      </ul>
      <div className="mt-2 pt-2 border-t border-amber-200">
        <div className="text-amber-200">Consult clinical guidelines and patient-specific factors</div>
      </div>
    </div>
  );

  const pinned = isPinned(drug.rxcui);

  return (
    <Card 
      className={`transition-all duration-200 ${
        onClick 
          ? 'cursor-pointer hover:shadow-md hover:border-primary-300' 
          : ''
      } ${className}`}
      padding="md"
    >
      <div className="flex items-start justify-between" onClick={onClick ? handleClick : undefined}>
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {drug.name}
              </h3>
              {pinned && (
                <Tooltip content="Pinned">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    <Star className="w-3 h-3 mr-1" /> Pinned
                  </span>
                </Tooltip>
              )}
              {showTooltips && (
                <Tooltip
                  content={getDrugInfoTooltip()}
                  type="info"
                  iconOnly
                  position="top"
                  maxWidth="max-w-xs"
                />
              )}
            </div>
            
            {drug.synonym && drug.synonym !== drug.name && (
              <p className="text-sm text-gray-600 mt-1">
                Also known as: {drug.synonym}
              </p>
            )}
            
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Tag className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">RXCUI: {drug.rxcui}</span>
                {showTooltips && (
                  <Tooltip
                    content="RxNorm Concept Unique Identifier - A unique identifier for this medication in the RxNorm database"
                    type="help"
                    iconOnly
                    position="top"
                    maxWidth="max-w-xs"
                  />
                )}
              </div>
              
              {drug.tty && (
                <Tooltip
                  content={getTtyTooltip(drug.tty)}
                  type="help"
                  disabled={!showTooltips}
                  maxWidth="max-w-sm"
                >
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(drug.tty)}`}>
                    {formatTty(drug.tty)}
                  </span>
                </Tooltip>
              )}
              
              {showTooltips && (
                <Tooltip
                  content={getClinicalSafetyTooltip()}
                  type="warning"
                  iconOnly
                  position="top"
                  maxWidth="max-w-xs"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </Tooltip>
              )}
            </div>

            {showDetails && (
              <div className="mt-3 space-y-2">
                {drug.generic_name && drug.generic_name !== drug.name && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Generic: </span>
                    <span className="text-sm text-gray-600">{drug.generic_name}</span>
                  </div>
                )}
                
                {drug.therapeutic_class && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Class: </span>
                    <span className="text-sm text-gray-600">{drug.therapeutic_class}</span>
                  </div>
                )}
                
                {drug.indication && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Indication: </span>
                    <span className="text-sm text-gray-600">{drug.indication}</span>
                  </div>
                )}

                {drug.brand_names && drug.brand_names.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Brand Names: </span>
                    <span className="text-sm text-gray-600">{drug.brand_names.join(', ')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {onClick && (
          <div className="flex-shrink-0 ml-4">
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </div>
      {/* Quick actions */}
      <div className="mt-3 flex flex-wrap gap-2">
        <Tooltip content={pinned ? 'Unpin this drug' : 'Pin this drug'}>
          <button
            type="button"
            onClick={() => { togglePin(drug.rxcui, drug.name); }}
            className={`inline-flex items-center px-3 py-1.5 text-xs rounded ${pinned ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'} hover:bg-gray-200`}
            aria-pressed={pinned}
            aria-label={pinned ? 'Unpin drug' : 'Pin drug'}
          >
            <Star className={`w-3 h-3 mr-1 ${pinned ? '' : 'opacity-70'}`} /> {pinned ? 'Pinned' : 'Pin'}
          </button>
        </Tooltip>
        <button
          type="button"
          onClick={() => {
            selection.addDrug(drug);
            try { analytics.logSelection(drug.rxcui, drug.name, 'card_action_interactions'); } catch {}
            navigate('/interactions');
          }}
          className="inline-flex items-center px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          <Activity className="w-3 h-3 mr-1" /> Use in Interactions
        </button>
        <button
          type="button"
          onClick={() => {
            selection.addDrug(drug);
            try { analytics.logSelection(drug.rxcui, drug.name, 'card_action_genomics'); } catch {}
            navigate('/genomics');
          }}
          className="inline-flex items-center px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
        >
          <Dna className="w-3 h-3 mr-1" /> Analyze Genomics
        </button>
        <button
          type="button"
          onClick={() => {
            selection.addDrug(drug);
            const m = inferBiomarkerForDrug(drug.name);
            try { analytics.logSelection(drug.rxcui, drug.name, 'card_action_trials'); } catch {}
            if (m) navigate(`/trials?biomarker=${encodeURIComponent(m)}`);
            else navigate('/trials');
          }}
          className="inline-flex items-center px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
        >
          <MapPinned className="w-3 h-3 mr-1" /> Find Trials
        </button>
        {onClick && (
          <button
            type="button"
            onClick={handleClick}
            onMouseDown={() => { try { analytics.logSelection(drug.rxcui, drug.name, 'card_action_details'); } catch {} }}
            className="inline-flex items-center px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            <Share2 className="w-3 h-3 mr-1" /> View Details
          </button>
        )}
      </div>
    </Card>
  );
};

export default DrugCard;
