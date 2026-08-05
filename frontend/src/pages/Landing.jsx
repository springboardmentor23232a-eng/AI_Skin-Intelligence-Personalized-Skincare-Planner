import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-50 p-6">
      <div className="max-w-2xl text-center glass-effect p-8 rounded-2xl shadow-xl animate-fade-in">
        <div className="inline-flex items-center justify-center p-3 bg-brand-100 rounded-xl mb-4 text-brand-600 shadow-sm">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-brand-950 mb-3 tracking-tight">
          AI Skin Intelligence
        </h1>
        <p className="font-sans text-base text-brand-800 max-w-lg mx-auto mb-8 leading-relaxed">
          Unlock your skin's true potential with AI-driven diagnostics, customized morning and evening routine planning, and direct specialist collaboration.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a href="/login" className="w-full sm:w-auto btn-primary px-8 py-3 rounded-xl text-sm font-medium">
            Sign In
          </a>
          <a href="/register" className="w-full sm:w-auto border border-brand-200 hover:bg-brand-100/50 text-brand-800 font-display font-medium px-8 py-3 rounded-xl text-sm transition-all duration-300">
            Create Account
          </a>
        </div>
      </div>
    </div>
  );
}
