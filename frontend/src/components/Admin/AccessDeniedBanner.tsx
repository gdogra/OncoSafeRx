import React from 'react';

type Props = { className?: string; message?: string };

const AccessDeniedBanner: React.FC<Props> = ({ className = '', message }) => {
  return (
    <div className={`bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 ${className}`} role="alert" aria-live="polite">
      <div className="font-semibold">Access Denied</div>
      <div className="text-sm">
        {message || 'You do not have permission to access this administrative resource. Ensure you are logged in with an admin account.'}
      </div>
    </div>
  );
};

export default AccessDeniedBanner;

