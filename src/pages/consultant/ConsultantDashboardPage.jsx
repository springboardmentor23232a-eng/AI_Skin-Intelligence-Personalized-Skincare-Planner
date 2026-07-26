import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActionBar } from '@/components/dashboard/QuickActionBar';
import { DonutChart } from '@/components/dashboard/DonutChart';
import { TrendBarChart } from '@/components/dashboard/TrendBarChart';
import { ActivityFeedCard } from '@/components/dashboard/ActivityFeedCard';
import { UserCheck, FileText, Activity, Search, Plus, Calendar } from 'lucide-react';

export default function ConsultantDashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const clients = [
    { id: 1, name: 'Sarah Jenkins', skinType: 'Combination', score: 82, status: 'Active Routine', risk: 'Low', lastAssessed: '2 hrs ago' },
    { id: 2, name: 'Marcus Vance', skinType: 'Oily / Acne-Prone', score: 64, status: 'Needs Revision', risk: 'Moderate', lastAssessed: 'Yesterday' },
    { id: 3, name: 'Amina Al-Mansoor', skinType: 'Sensitive / Dry', score: 88, status: 'Optimal Barrier', risk: 'Low', lastAssessed: '3 days ago' },
    { id: 4, name: 'David Croft', skinType: 'Dry', score: 58, status: 'High Sensitivity', risk: 'High Risk', lastAssessed: '4 days ago' },
  ];

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.skinType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Kept ONLY the 2 requested action buttons: Add New Client & Schedule Review
  const quickActions = [
    { label: 'Add New Client', icon: Plus },
    { label: 'Schedule Review', icon: Calendar },
  ];

  const skinTypeDistribution = [
    { label: 'Combination', value: 22, color: '#10b981' },
    { label: 'Oily / Acne-Prone', value: 12, color: '#06b6d4' },
    { label: 'Dry / Sensitive', value: 10, color: '#8b5cf6' },
    { label: 'Normal', value: 4, color: '#f59e0b' },
  ];

  const weeklyConsultationTrend = [
    { label: 'Mon', value: 8 },
    { label: 'Tue', value: 12 },
    { label: 'Wed', value: 15 },
    { label: 'Thu', value: 10 },
    { label: 'Fri', value: 18 },
    { label: 'Sat', value: 6 },
  ];

  const consultantActivities = [
    { title: 'Sarah Jenkins - Assessment Reviewed', description: 'Updated evening moisturizer routine', time: '10:15 AM' },
    { title: 'Marcus Vance - High Oil Flag', description: 'Recommended 2% BHA cleanser for weekly routine', time: '11:40 AM' },
    { title: 'Amina Al-Mansoor - Barrier Recovered', description: 'Skin score improved from 74 to 88', time: '2:10 PM' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Consultant Workspace</h1>
            <Badge variant="teal">Skincare Advisor Prototype</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Client profiles, skin assessment review roster, routine adjustments & progress tracking.
          </p>
        </div>

        <QuickActionBar actions={quickActions} />
      </div>

      {/* 1. CLIENT STATISTICS (4 Stat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Clients Roster"
          value="48 Clients"
          change="+4 this week"
          trend="up"
          icon={UserCheck}
          badgeColor="teal"
          description="Assigned client profiles"
        />
        <StatCard
          title="Pending Assessment Reviews"
          value="6 Urgent"
          change="-2 reviewed"
          trend="up"
          icon={Activity}
          badgeColor="amber"
          description="Awaiting routine adjustment"
        />
        <StatCard
          title="Avg Client Adherence"
          value="91.4%"
          change="+3.2%"
          trend="up"
          icon={FileText}
          badgeColor="emerald"
          description="High routine consistency"
        />
        <StatCard
          title="Recommendation Efficacy"
          value="94.8%"
          change="+1.5%"
          trend="up"
          icon={UserCheck}
          badgeColor="violet"
          description="Positive skin response rating"
        />
      </div>

      {/* 2. CHARTS (Weekly Consultations & Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart title="Client Skin Type Distribution" badge="48 Total" data={skinTypeDistribution} />
        <TrendBarChart title="Weekly Consultations Conducted" badge="69 Reviews" data={weeklyConsultationTrend} height={180} />
      </div>

      {/* 3. CLIENT TABLE & 4. ACTIVITY LOG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Table */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-400" /> Client Management Roster
            </h3>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Filter clients or skin type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Skin Profile</th>
                  <th className="py-3 px-4">Health Score</th>
                  <th className="py-3 px-4">Risk Flag</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredClients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                    <td className="py-3 px-4 text-slate-300">{c.skinType}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">{c.score} / 100</td>
                    <td className="py-3 px-4">
                      <Badge variant={c.risk === 'High Risk' ? 'rose' : c.risk === 'Moderate' ? 'amber' : 'emerald'}>
                        {c.risk}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{c.status}</td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="ghost">Review Profile</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Activity Log */}
        <ActivityFeedCard title="Consultant Action Logs" activities={consultantActivities} />
      </div>
    </div>
  );
}
