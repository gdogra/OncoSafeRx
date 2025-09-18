import React from 'react';
import { ChevronRight, Info } from 'lucide-react';

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  showChevron?: boolean;
  variant?: 'default' | 'compact' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const MobileCard: React.FC<MobileCardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  showChevron = false,
  variant = 'default',
  padding = 'md'
}) => {
  const baseClasses = "bg-white rounded-lg transition-all duration-200";
  
  const variantClasses = {
    default: "shadow-sm border border-gray-200",
    compact: "shadow-sm border border-gray-100",
    elevated: "shadow-md border-0",
    bordered: "border-2 border-gray-200 shadow-none"
  };

  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6"
  };

  const interactiveClasses = onClick 
    ? "cursor-pointer hover:shadow-md active:scale-98 active:shadow-sm" 
    : "";

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${interactiveClasses}
    ${className}
  `.trim();

  return (
    <div className={classes} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {children}
        </div>
        {showChevron && onClick && (
          <ChevronRight className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
        )}
      </div>
    </div>
  );
};

export default MobileCard;