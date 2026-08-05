import React from 'react';
import { User } from 'lucide-react';

export default function SkinProfile() {
  return (
    <div className="p-6">
      <div className="glass-effect p-8 rounded-2xl shadow-lg border border-brand-100 animate-slide-up max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-brand-100 rounded-xl text-brand-600">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-brand-950">Skin Profile</h1>
            <p className="font-sans text-sm text-brand-800">Your core skin parameters, lifestyle indicators, and attributes</p>
          </div>
        </div>
        <p className="font-sans text-brand-800 mt-4 leading-relaxed">
          Manage your skin parameters, allergy mappings, lifestyle details, sleep variables, and ambient environment settings.
        </p>
      </div>
    </div>
  );
}
