import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-50">
      {/* Header Navbar */}
      <header className="sticky top-0 z-50 glass-effect border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-brand-100 rounded-lg text-brand-600 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-lg text-brand-950 tracking-tight">
              AI Skin Intelligence
            </span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link to="/login" className="font-sans text-sm font-medium text-brand-800 hover:text-brand-950 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary px-4 py-2 rounded-lg text-xs">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-brand-950 text-brand-100 border-t border-brand-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <span className="font-display font-semibold text-sm tracking-wider">AI SKIN INTELLIGENCE</span>
          </div>
          <p className="font-sans text-xs text-brand-300">
            &copy; 2026 AI Skin Intelligence & Personalized Skincare Planner. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
