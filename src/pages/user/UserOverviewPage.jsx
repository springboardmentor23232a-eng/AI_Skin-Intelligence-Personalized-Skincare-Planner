import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActionBar } from '@/components/dashboard/QuickActionBar';
import { TrendBarChart } from '@/components/dashboard/TrendBarChart';
import { ActivityFeedCard } from '@/components/dashboard/ActivityFeedCard';
import {
  Sparkles,
  Sun,
  Moon,
  Droplets,
  ShieldCheck,
  CheckCircle2,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';

export default function UserOverviewPage() {
  const {
  user,
  isFirstTimeLogin,
  fetchWithAuth,
  } = useAuth();
  const [latestAssessment, setLatestAssessment] = useState(null);
const [assessmentLoading, setAssessmentLoading] = useState(true);
useEffect(() => {
  const loadLatestAssessment = async () => {
    try {
      setAssessmentLoading(true);

      const response = await fetchWithAuth(
        'http://127.0.0.1:8000/assessment/history',
        {
          method: 'GET',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || 'Unable to load assessment data.'
        );
      }

      if (Array.isArray(data) && data.length > 0) {
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.assessment_time) -
            new Date(a.assessment_time)
        );

        setLatestAssessment(sorted[0]);
      }
    } catch (error) {
      console.error(
        'Failed to load latest assessment:',
        error
      );
    } finally {
      setAssessmentLoading(false);
    }
  };

  loadLatestAssessment();
}, []);

  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Gentle Hydrating Cleanser', done: true },
    { id: 2, text: 'Vitamin C Brightening Serum', done: true },
    { id: 3, text: 'Barrier Repair Gel Cream', done: true },
    { id: 4, text: 'Broad Spectrum SPF 50+ Sunscreen', done: false },
  ]);

  const toggleItem = (id) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const quickActions = [
    { label: 'Log Water Intake', icon: Droplets },
    { label: 'Mark Night Routine Done', icon: Moon },
  ];

  const trendData = [
    { label: 'Week 1', value: 68 },
    { label: 'Week 2', value: 72 },
    { label: 'Week 3', value: 76 },
    { label: 'Week 4', value: 82 },
  ];

  const userActivities = [
    { title: 'Morning Routine Logged', description: '3 out of 4 steps checked off', time: '8:30 AM' },
    { title: 'Hydration Goal Logged', description: 'Reached 2.4L daily target', time: '1:15 PM' },
    { title: 'Sun Protection Reminder', description: 'Reapplied SPF 50 sunscreen', time: '2:00 PM' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. WELCOME SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {isFirstTimeLogin ? `Welcome ${user?.name ? user.name.split(' ')[0] : 'User'}` : `Welcome back, ${user?.name ? user.name.split(' ')[0] : 'User'}`}
            </h1>
            <Badge variant="emerald">User Prototype Dashboard</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
  Skin Profile:{' '}
  <span className="text-slate-200 font-medium">
    {latestAssessment?.predicted_skin_type ||
      user?.skinType ||
      'Not assessed'}
  </span>

  {' • '}

  Primary Concern:{' '}
  <span className="text-slate-200 font-medium">
    {latestAssessment?.vision_predicted_concern ||
      'Not assessed'}
  </span>
</p>
        </div>

        <div className="flex flex-wrap gap-3">
  <QuickActionBar actions={quickActions} />

  <Link to="/dashboard/user/assessment">
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Sparkles className="w-4 h-4 text-emerald-400" />
      Skin Assessment
    </Button>
  </Link>

  <Link to="/dashboard/user/progress">
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <TrendingUp className="w-4 h-4 text-cyan-400" />
      Progress Tracker
    </Button>
  </Link>
</div>
      </div>

      {/* 2. FOUR SUMMARY STATISTIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
  title="Overall Skin Score"
  value={
    assessmentLoading
      ? '...'
      : latestAssessment
        ? `${latestAssessment.health_score} / 100`
        : 'No Data'
  }
  change={
    latestAssessment
      ? latestAssessment.overall_condition
      : 'Complete assessment'
  }
  trend="up"
  icon={Sparkles}
  badgeColor="emerald"
  description="Latest AI assessment score"
/>
        <StatCard
          title="Routine Consistency"
          value="92%"
          change="+8%"
          trend="up"
          icon={ShieldCheck}
          badgeColor="teal"
          description="14-day streak (Sample)"
        />
        <StatCard
          title="Hydration Intake"
          value="2.4 L / 2.5 L"
          change="96%"
          trend="up"
          icon={Droplets}
          badgeColor="cyan"
          description="Daily target tracking"
        />
        <StatCard
          title="Active Products"
          value="4 Items"
          change="Safe"
          trend="up"
          icon={ShieldAlert}
          badgeColor="violet"
          description="Sample skincare regimen"
        />
      </div>

      {/* 3. HEALTH SCORE CARD & HEALTH FACTOR BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Card */}
        <GlassCard glow className="flex flex-col items-center justify-center p-8 text-center space-y-4">
          <ScoreGauge
  score={latestAssessment?.health_score || 0}
  size={180}
  strokeWidth={14}
/>
          <div>
            <h3 className="text-lg font-bold text-white">Health Score Overview</h3>
            <p className="text-xs text-slate-400 mt-1">
  {latestAssessment
    ? `AI assessment indicates ${latestAssessment.overall_condition || 'your current skin condition'}.`
    : 'Complete a skin assessment to calculate your health score.'}
</p>
          </div>
        </GlassCard>

        {/* Health Factor Breakdown Metrics */}
        <GlassCard className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" /> Health Metrics Breakdown
            </h3>
            <span className="text-xs text-slate-400">Prototype Demo Data</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
  <div className="flex justify-between text-xs">
    <span className="text-slate-300 font-medium">
      Skin Condition Rating
    </span>

    <span className="text-emerald-400 font-bold">
      {latestAssessment?.health_score ?? 0} / 100
    </span>
  </div>

  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
    <div
      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
      style={{
        width: `${latestAssessment?.health_score ?? 0}%`,
      }}
    ></div>
  </div>
</div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Lifestyle Habits Score</span>
                <span className="text-cyan-400 font-bold">78 / 100</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400" style={{ width: '78%' }}></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Routine Consistency</span>
                <span className="text-teal-400 font-bold">90 / 100</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400" style={{ width: '90%' }}></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Sleep Quality Score</span>
                <span className="text-violet-400 font-bold">70 / 100</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400" style={{ width: '70%' }}></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Hydration Level</span>
                <span className="text-sky-400 font-bold">85 / 100</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 4. PROGRESS CHART, DAILY ROUTINE CHECKLIST & 5. ACTIVITY LOG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Chart */}
          <TrendBarChart title="Monthly Progress Trend" badge="Demo Chart" data={trendData} height={190} />

          {/* Daily Routine Checklist */}
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-400" /> Daily Skincare Routine Checklist
              </h3>
              <Badge variant="amber">
                {checklist.filter((i) => i.done).length} / {checklist.length} Completed
              </Badge>
            </div>

            <div className="space-y-2.5 text-xs">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                    item.done
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className={item.done ? 'line-through opacity-80' : ''}>{item.text}</span>
                  <CheckCircle2
                    className={`w-4 h-4 transition-transform ${
                      item.done ? 'text-emerald-400 scale-110' : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Activity Log */}
        <ActivityFeedCard title="Sample Activity Log" activities={userActivities} />
      </div>
    </div>
  );
}
