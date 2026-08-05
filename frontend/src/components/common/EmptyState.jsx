import React from 'react';
import { Database } from 'lucide-react';

export default function EmptyState({ message = 'No matching accounts or entries found.', title = 'No results' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-brand-200 rounded-2xl animate-fade-in my-6">
      <div className="p-3.5 bg-brand-50 text-brand-600 rounded-2xl mb-4">
        <Database className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h3 className="font-display text-sm font-bold text-brand-950 mb-1">{title}</h3>
      <p className="font-sans text-xs text-brand-800 max-w-xs">{message}</p>
    </div>
  );
}
