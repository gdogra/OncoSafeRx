import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

type Crumb = { label: string; href?: string };

interface BreadcrumbsProps {
  items: Crumb[];
  showBack?: boolean;
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, showBack = true, className = '' }) => {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <nav className="text-sm text-gray-600">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <span key={idx} className="inline">
              {item.href && !isLast ? (
                <Link to={item.href} className="hover:underline">{item.label}</Link>
              ) : (
                <span className="text-gray-800">{item.label}</span>
              )}
              {!isLast && <span className="mx-1">/</span>}
            </span>
          );
        })}
      </nav>
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
        >
          Back
        </button>
      )}
    </div>
  );
};

export default Breadcrumbs;

