import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActionBar } from '@/components/dashboard/QuickActionBar';
import { DonutChart } from '@/components/dashboard/DonutChart';
import { TrendBarChart } from '@/components/dashboard/TrendBarChart';
import { ActivityFeedCard } from '@/components/dashboard/ActivityFeedCard';
import { Stethoscope, ShieldAlert, Plus, Search, ClipboardList, CheckSquare } from 'lucide-react';

export default function DermatologistDashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const patients = [
    { id: 'p_1', name: 'Rachel Vance', diagnosis: 'Rosacea / Erythema', severity: 'Moderate', score: 58, compound: 'Metronidazole 0.75%', status: 'Stable' },
    { id: 'p_2', name: 'David Kim', diagnosis: 'Severe Cystic Acne Vulgaris', severity: 'High Risk', score: 52, compound: 'Isotretinoin Protocol', status: 'Follow-up Needed' },
    { id: 'p_3', name: 'Elena Rostova', diagnosis: 'Post-Inflammatory Hyperpigmentation', severity: 'Low Risk', score: 82, compound: 'Azelaic Acid 15%', status: 'Improving' },
    { id: 'p_4', name: 'Samuel Wright', diagnosis: 'Atopic Dermatitis Flare', severity: 'High Risk', score: 48, compound: 'Tacrolimus Ointment', status: 'Follow-up Needed' },
  ];

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Kept ONLY the single requested action button: Create Prescription
  const quickActions = [
    { label: 'Create Prescription', icon: Plus },
  ];

  const clinicalDiagnosesDistribution = [
    { label: 'Acne Vulgaris', value: 12, color: '#f43f5e' },
    { label: 'Rosacea / Erythema', value: 8, color: '#f59e0b' },
    { label: 'Melasma / Hyperpigmentation', value: 6, color: '#06b6d4' },
    { label: 'Atopic Dermatitis', value: 4, color: '#8b5cf6' },
  ];

  const patientRecoveryVelocity = [
    { label: 'Wk 1', value: 52 },
    { label: 'Wk 2', value: 58 },
    { label: 'Wk 3', value: 65 },
    { label: 'Wk 4', value: 74 },
    { label: 'Wk 5', value: 82 },
  ];

  const clinicalActivities = [
    { title: 'David Kim - Prescription Logged', description: 'Sample medical protocol updated to Isotretinoin', time: '09:30 AM' },
    { title: 'Rachel Vance - Condition Stabilized', description: 'Switched to soothing Azelaic Acid routine', time: '11:15 AM' },
    { title: 'Prescription Verification', description: 'Verified safety of 15% Azelaic Acid sample treatment', time: '01:45 PM' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Dermatologist Clinical Portal</h1>
            <Badge variant="cyan">Physician Prototype Portal</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Clinical patient insights, diagnostic records, treatment prescriptions & barrier analytics.
          </p>
        </div>

        <QuickActionBar actions={quickActions} />
      </div>

      {/* 1. PATIENT STATISTICS (4 Stat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Clinical Patients Under Care"
          value="24 Patients"
          change="+3 this month"
          trend="up"
          icon={Stethoscope}
          badgeColor="cyan"
          description="Active clinical care profiles"
        />
        <StatCard
          title="High-Risk Barrier Alerts"
          value="3 Cases"
          change="Follow-up"
          trend="down"
          icon={ShieldAlert}
          badgeColor="rose"
          description="Severe erythema or acne flares"
        />
        <StatCard
          title="Clinical Efficacy Rate"
          value="89.6%"
          change="+2.1%"
          trend="up"
          icon={CheckSquare}
          badgeColor="emerald"
          description="Successful treatment outcomes"
        />
        <StatCard
          title="Prescriptions Written"
          value="18 Active"
          change="Verified"
          trend="up"
          icon={ClipboardList}
          badgeColor="violet"
          description="Sample prescriptions logged"
        />
      </div>

      {/* 2. DIAGNOSIS DISTRIBUTION & RECOVERY CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart title="Diagnosis Distribution" badge="30 Cases" data={clinicalDiagnosesDistribution} />
        <TrendBarChart title="Avg Patient Recovery Score Trend" badge="+30 pts" data={patientRecoveryVelocity} height={180} />
      </div>

      {/* 3. PATIENT TABLE & 4. ACTIVITY LOG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Table */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-cyan-400" /> Patient Medical Diagnosis Roster
            </h3>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search patient or diagnosis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Diagnosis</th>
                  <th className="py-3 px-4">Active Protocol</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Barrier Score</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{p.name}</td>
                    <td className="py-3 px-4 text-slate-300">{p.diagnosis}</td>
                    <td className="py-3 px-4 text-emerald-400 font-mono text-[11px]">{p.compound}</td>
                    <td className="py-3 px-4">
                      <Badge variant={p.severity === 'High Risk' ? 'rose' : p.severity === 'Moderate' ? 'amber' : 'emerald'}>
                        {p.severity}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-400">{p.score} / 100</td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="outline">View Plan</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Activity Log */}
        <ActivityFeedCard title="Clinical Activity Log" activities={clinicalActivities} />
      </div>
    </div>
  );
}
