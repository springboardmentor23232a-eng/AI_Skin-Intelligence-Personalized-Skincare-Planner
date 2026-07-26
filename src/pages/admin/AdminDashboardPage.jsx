import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActionBar } from '@/components/dashboard/QuickActionBar';
import { DonutChart } from '@/components/dashboard/DonutChart';
import { TrendBarChart } from '@/components/dashboard/TrendBarChart';
import { ActivityFeedCard } from '@/components/dashboard/ActivityFeedCard';
import { Users, Server, Activity, Plus, Search, FileText, LayoutDashboard } from 'lucide-react';

export default function AdminDashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const registeredUsers = [
    { id: 'usr_01', name: 'Dr. Elena Rostova', email: 'elena@skintelligence.ai', role: 'Dermatologist', status: 'Verified', date: 'Jul 24, 2026' },
    { id: 'usr_02', name: 'Sarah Jenkins', email: 'sarah.j@gmail.com', role: 'Consumer', status: 'Active', date: 'Jul 25, 2026' },
    { id: 'usr_03', name: 'Marcus Vance', email: 'marcus.v@consultant.ai', role: 'Consultant', status: 'Active', date: 'Jul 22, 2026' },
    { id: 'usr_04', name: 'System Admin', email: 'admin@skintelligence.ai', role: 'Administrator', status: 'Superuser', date: 'Jan 01, 2026' },
  ];

  const filteredUsers = registeredUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Kept ONLY the 3 requested simple frontend action buttons
  const quickActions = [
    { label: 'Manage Users', icon: Users },
    { label: 'View Reports', icon: FileText, variant: 'outline' },
    { label: 'System Overview', icon: LayoutDashboard, variant: 'outline' },
  ];

  const roleDistribution = [
    { label: 'Consumers', value: 11920, color: '#10b981' },
    { label: 'Skincare Consultants', value: 320, color: '#06b6d4' },
    { label: 'Dermatologists', value: 180, color: '#8b5cf6' },
    { label: 'Administrators', value: 6, color: '#f59e0b' },
  ];

  const dailyRequestTrend = [
    { label: '00:00', value: 38 },
    { label: '04:00', value: 42 },
    { label: '08:00', value: 45 },
    { label: '12:00', value: 52 },
    { label: '16:00', value: 41 },
    { label: '20:00', value: 39 },
  ];

  const adminActivities = [
    { title: 'User Account Verified', description: 'Dr. Elena Rostova dermatologist profile approved', time: '12:00 PM' },
    { title: 'Database Backup Completed', description: 'Daily system database snapshot saved cleanly', time: '02:30 PM' },
    { title: 'System Catalog Updated', description: 'Updated active skincare product database catalog', time: '04:15 PM' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Administrator Console</h1>
            <Badge variant="violet">Admin Prototype Portal</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            User account directory, role distribution statistics, platform analytics & audit logs.
          </p>
        </div>

        <QuickActionBar actions={quickActions} />
      </div>

      {/* 1. PLATFORM & USER STATISTICS (4 Stat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Users"
          value="12,426"
          change="+184 today"
          trend="up"
          icon={Users}
          badgeColor="emerald"
          description="Active platform accounts"
        />
        <StatCard
          title="System Response Latency"
          value="42 ms"
          change="Optimal"
          trend="up"
          icon={Server}
          badgeColor="teal"
          description="Fast frontend response"
        />
        <StatCard
          title="Platform Activity Rate"
          value="96.8%"
          change="+0.4%"
          trend="up"
          icon={Activity}
          badgeColor="violet"
          description="Active daily user sessions"
        />
        <StatCard
          title="System Uptime"
          value="99.98%"
          change="Healthy"
          trend="up"
          icon={LayoutDashboard}
          badgeColor="cyan"
          description="Prototype platform operational"
        />
      </div>

      {/* 2. USER STATISTICS CHARTS (Role Distribution & Request Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart title="User Role Distribution" badge="12,426 Total" data={roleDistribution} />
        <TrendBarChart title="Daily Request Volume Trend (24h)" badge="Avg 42ms" data={dailyRequestTrend} height={180} />
      </div>

      {/* 3. USER MANAGEMENT TABLE & 4. ACTIVITY LOG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Management Table */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" /> User Accounts Directory
            </h3>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search user, email or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Name & Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registration Date</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{u.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{u.name}</span>
                      <span className="text-slate-400 text-[11px]">{u.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          u.role === 'Dermatologist'
                            ? 'cyan'
                            : u.role === 'Consultant'
                            ? 'teal'
                            : u.role === 'Administrator'
                            ? 'violet'
                            : 'emerald'
                        }
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{u.status}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{u.date}</td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="ghost">Edit User</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Activity Log */}
        <ActivityFeedCard title="Platform Activity Stream" activities={adminActivities} />
      </div>
    </div>
  );
}
