import React from 'react';
import { KeyRound } from 'lucide-react';

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-50 p-6">
      <div className="w-full max-w-md glass-effect p-8 rounded-2xl shadow-xl animate-fade-in">
        <div className="inline-flex items-center justify-center p-3 bg-brand-100 rounded-xl mb-4 text-brand-600 shadow-sm">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="font-display text-2xl font-bold text-brand-950 mb-1">
          Recover Password
        </h1>
        <p className="font-sans text-sm text-brand-800 mb-6">
          Enter your email address and we'll send password recovery instructions.
        </p>
        
        <div className="space-y-4">
          <button className="w-full btn-primary py-2.5 rounded-xl text-sm font-medium">
            Send Reset Instructions
          </button>
          
          <div className="text-center text-xs text-brand-800 pt-2">
            <a href="/login" className="hover:underline font-medium">
              Back to Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
