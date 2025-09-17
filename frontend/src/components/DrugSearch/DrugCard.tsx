import React from 'react';
import { Drug } from '../../types';
import { Pill, ChevronRight, Tag } from 'lucide-react';
import Card from '../UI/Card';

interface DrugCardProps {
  drug: Drug;
  onClick?: (drug: Drug) => void;
  showDetails?: boolean;
}

const DrugCard: React.FC<DrugCardProps> = ({ drug, onClick, showDetails = false }) => {
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

  return (
    <Card 
      className={`transition-all duration-200 ${
        onClick 
          ? 'cursor-pointer hover:shadow-md hover:border-primary-300' 
          : ''
      }`}
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
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {drug.name}
            </h3>
            
            {drug.synonym && drug.synonym !== drug.name && (
              <p className="text-sm text-gray-600 mt-1">
                Also known as: {drug.synonym}
              </p>
            )}
            
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Tag className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">RXCUI: {drug.rxcui}</span>
              </div>
              
              {drug.tty && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(drug.tty)}`}>
                  {formatTty(drug.tty)}
                </span>
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
    </Card>
  );
};

export default DrugCard;