import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-50 p-6">
      <div className="max-w-md text-center glass-effect p-8 rounded-2xl shadow-xl animate-fade-in">
        <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-xl mb-4 text-red-600 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="font-display text-4xl font-bold text-brand-950 mb-2">404</h1>
        <h2 className="font-display text-lg font-semibold text-brand-900 mb-3">Page Not Found</h2>
        <p className="font-sans text-sm text-brand-800 mb-6">
          The diagnostics page or routine panel you are looking for does not exist or has been relocated.
        </p>
        <a href="/" className="btn-primary px-6 py-2.5 rounded-lg text-sm inline-block">
          Return Home
        </a>
      </div>
    </div>
  );
}
