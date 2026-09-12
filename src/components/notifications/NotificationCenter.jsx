import React, { useState } from 'react';
import { Bell, Clock } from 'lucide-react';
import { NotificationsList } from './NotificationsList';
import { ReminderSchedulePanel } from './ReminderSchedulePanel';

export function NotificationCenter() {
  const [activeTab, setActiveTab] = useState('notifications');

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'schedule', label: 'Reminder Schedule', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 overflow-x-auto">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'text-emerald-400 border-emerald-500'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'notifications' && <NotificationsList />}
      {activeTab === 'schedule' && <ReminderSchedulePanel />}
    </div>
  );
}
