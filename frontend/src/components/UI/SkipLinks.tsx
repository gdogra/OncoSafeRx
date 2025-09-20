import React from 'react';

interface SkipLink {
  href: string;
  label: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

/**
 * Skip links component for better keyboard navigation accessibility
 * Allows users to quickly jump to main content areas
 */
const SkipLinks: React.FC<SkipLinksProps> = ({ 
  links = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '#search', label: 'Skip to search' }
  ],
  className = ''
}) => {
  const handleSkipLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    const targetElement = document.querySelector(href);
    if (targetElement) {
      // Make element focusable if it isn't already
      const originalTabIndex = targetElement.getAttribute('tabindex');
      if (!targetElement.hasAttribute('tabindex')) {
        targetElement.setAttribute('tabindex', '-1');
      }
      
      // Focus the element
      (targetElement as HTMLElement).focus();
      
      // Restore original tabindex
      if (originalTabIndex === null) {
        targetElement.removeAttribute('tabindex');
      } else {
        targetElement.setAttribute('tabindex', originalTabIndex);
      }
      
      // Scroll to element
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  return (
    <div 
      className={`fixed top-0 left-0 z-[9999] ${className}`}
      role="navigation"
      aria-label="Skip links"
    >
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          onClick={(e) => handleSkipLink(e, link.href)}
          className="
            absolute top-0 left-0 px-4 py-2 bg-primary-600 text-white text-sm font-medium
            transform -translate-y-full opacity-0 pointer-events-none
            focus:translate-y-0 focus:opacity-100 focus:pointer-events-auto
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            rounded-br-md shadow-lg z-50
          "
          style={{ left: `${index * 160}px` }}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

export default SkipLinks;