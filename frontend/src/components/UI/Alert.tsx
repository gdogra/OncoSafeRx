import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import clsx from 'clsx';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ type, title, children, className }) => {
  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-success-50',
      textColor: 'text-success-800',
      iconColor: 'text-success-600',
      borderColor: 'border-success-200',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-danger-50',
      textColor: 'text-danger-800',
      iconColor: 'text-danger-600',
      borderColor: 'border-danger-200',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-warning-50',
      textColor: 'text-warning-800',
      iconColor: 'text-warning-600',
      borderColor: 'border-warning-200',
    },
    info: {
      icon: Info,
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-800',
      iconColor: 'text-primary-600',
      borderColor: 'border-primary-200',
    },
  };

  const { icon: Icon, bgColor, textColor, iconColor, borderColor } = config[type];

  return (
    <div
      className={clsx(
        'rounded-md border p-4',
        bgColor,
        textColor,
        borderColor,
        className
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={clsx('h-5 w-5', iconColor)} />
        </div>
        <div className="ml-3">
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          <div className={clsx('text-sm', title && 'mt-2')}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;