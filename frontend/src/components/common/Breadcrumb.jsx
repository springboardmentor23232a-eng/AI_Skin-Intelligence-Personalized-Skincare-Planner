import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumb({ crumbs }) {
  if (!crumbs || crumbs.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-brand-850 font-display font-medium mb-6">
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <div key={idx} className="flex items-center space-x-1.5">
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-brand-300 shrink-0" />}
            {isLast ? (
              <span className="text-brand-600 font-semibold">{crumb.label}</span>
            ) : (
              <Link 
                to={crumb.path} 
                className="hover:text-brand-950 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
