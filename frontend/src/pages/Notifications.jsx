import React from 'react';
import { Bell } from 'lucide-react';

export default function Notifications() {
  return (
    <div className="p-6">
      <div className="glass-effect p-8 rounded-2xl shadow-lg border border-brand-100 animate-slide-up max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-brand-100 rounded-xl text-brand-600">
            <Bell className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-brand-950">Notifications Center</h1>
            <p className="font-sans text-sm text-brand-800">Routine, hydration, and consultant response alerts</p>
          </div>
        </div>
        <p className="font-sans text-brand-800 mt-4 leading-relaxed">
          Manage system notification schedules, alert channels, and review current logs of hydration, routine, or consultant suggestions.
        </p>
      </div>
    </div>
  );
}
