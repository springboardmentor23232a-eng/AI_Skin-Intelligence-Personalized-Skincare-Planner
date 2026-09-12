import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export default function NotificationCenterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Notifications & Preferences
          </h1>
          <p className="text-slate-400 text-sm">
            Manage your notifications and customize your reminder preferences
          </p>
        </div>

        {/* Content */}
        <GlassCard>
          <NotificationCenter />
        </GlassCard>
      </div>
    </div>
  );
}
