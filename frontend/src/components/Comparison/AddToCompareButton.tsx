import React from 'react';
import { useComparison } from '../../contexts/ComparisonContext';
import { Compare, Check, AlertCircle } from 'lucide-react';
import { Drug } from '../../types';
import Tooltip from '../UI/Tooltip';

interface AddToCompareButtonProps {
  drug: Drug;
  source?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  showLabel?: boolean;
  className?: string;
  disabled?: boolean;
}

const AddToCompareButton: React.FC<AddToCompareButtonProps> = ({
  drug,
  source,
  size = 'md',
  variant = 'outline',
  showLabel = true,
  className = '',
  disabled = false,
}) => {
  const { addDrug, hasDrug, isAtCapacity, state } = useComparison();

  const isInComparison = hasDrug(drug.rxcui);
  const cannotAdd = disabled || isAtCapacity;

  const handleClick = () => {
    if (isInComparison || cannotAdd) {
      return;
    }
    
    const success = addDrug(drug, source);
    if (success) {
      // Could add a toast notification here
      console.log(`Added ${drug.name} to comparison`);
    }
  };

  const getButtonText = () => {
    if (isInComparison) return 'In Comparison';
    if (isAtCapacity) return 'Comparison Full';
    return 'Add to Compare';
  };

  const getIcon = () => {
    if (isInComparison) return <Check className={getIconSize()} />;
    if (isAtCapacity) return <AlertCircle className={getIconSize()} />;
    return <Compare className={getIconSize()} />;
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-3 h-3';
      case 'lg': return 'w-5 h-5';
      default: return 'w-4 h-4';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'px-2 py-1 text-xs';
      case 'lg': return 'px-4 py-3 text-base';
      default: return 'px-3 py-2 text-sm';
    }
  };

  const getVariantClasses = () => {
    if (isInComparison) {
      return 'bg-green-50 text-green-700 border-green-200 cursor-default';
    }
    
    if (cannotAdd) {
      return 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed';
    }

    switch (variant) {
      case 'primary':
        return 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700 hover:border-primary-700';
      case 'secondary':
        return 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200';
      default:
        return 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-primary-300 hover:text-primary-700';
    }
  };

  const tooltipContent = () => {
    if (isInComparison) {
      return `${drug.name} is already in comparison (${state.items.length}/${state.maxItems})`;
    }
    if (isAtCapacity) {
      return `Comparison is full (${state.items.length}/${state.maxItems}). Remove a drug to add another.`;
    }
    return `Add ${drug.name} to drug comparison (${state.items.length}/${state.maxItems})`;
  };

  const button = (
    <button
      onClick={handleClick}
      disabled={isInComparison || cannotAdd}
      className={`
        inline-flex items-center justify-center font-medium rounded-md border transition-all duration-200
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${className}
      `}
      aria-label={getButtonText()}
    >
      {getIcon()}
      {showLabel && (
        <span className="ml-1.5 whitespace-nowrap">
          {getButtonText()}
        </span>
      )}
    </button>
  );

  return (
    <Tooltip content={tooltipContent()}>
      {button}
    </Tooltip>
  );
};

export default AddToCompareButton;