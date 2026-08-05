import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-50">
      {/* Left side brand banner (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-brand-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle decorative background gradient circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-800 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-900 rounded-full blur-3xl opacity-30 -ml-20 -mb-20"></div>
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider font-display">Back to home</span>
          </Link>
        </div>
        
        <div className="relative z-10 my-auto">
          <div className="inline-flex items-center justify-center p-3 bg-brand-800/80 backdrop-blur rounded-2xl mb-6 text-brand-300">
            <Sparkles className="w-10 h-10" />
          </div>
          <h2 className="font-display text-4xl font-bold tracking-tight mb-4">
            Unlock Smarter Skincare
          </h2>
          <p className="font-sans text-brand-200 text-base max-w-md leading-relaxed">
            Get instant analytical insights on chemical compatibility, lifestyle effects, and track your visual improvements.
          </p>
        </div>
        
        <div className="relative z-10 text-xs text-brand-300">
          AI Skin Intelligence &copy; 2026
        </div>
      </div>

      {/* Right side form view */}
      <div className="flex-grow flex items-center justify-center p-6 md:w-1/2 relative">
        {/* Back Link for mobile */}
        <div className="absolute top-6 left-6 md:hidden">
          <Link to="/" className="inline-flex items-center gap-1.5 text-brand-800 hover:text-brand-950 font-medium text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>
        
        <Outlet />
      </div>
    </div>
  );
}
