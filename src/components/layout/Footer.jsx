import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        AI Skin Intelligence Platform &copy; {new Date().getFullYear()} • Powered by React.js, Vite & FastAPI Architecture
      </div>
    </footer>
  );
}
