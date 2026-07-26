import React from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  LayoutDashboard,
  Shield,
  Activity,
  BarChart3,
  ArrowRight,
  Info,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-20 py-6 relative">
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-ambient -z-10" />
      <div className="absolute top-96 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-ambient -z-10" />

      {/* 1. HERO SECTION */}
      <section className="relative text-center space-y-8 max-w-4xl mx-auto pt-6">
        <Badge variant="emerald" className="px-4 py-1.5 text-xs sm:text-sm rounded-full inline-flex items-center gap-2 shadow-xl shadow-emerald-500/10 border-emerald-500/40">
          <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
          Skin Intelligence Dashboard Platform
        </Badge>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent leading-[1.15]">
          AI Skin Intelligence & <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Personalized Skincare Planner
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          A multi-role dashboard application for tracking skin health profiles, routine management, and role-based access control.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link to="/login">
            <Button size="lg" className="shadow-lg shadow-emerald-500/25 px-8 text-base font-extrabold">
              Get Started <ArrowRight className="w-5 h-5 ml-1.5" />
            </Button>
          </Link>
          <Link to="/dashboard/user">
            <Button variant="outline" size="lg" className="px-6 text-base border-slate-700 hover:border-slate-500">
              Explore Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* 2. PLATFORM FEATURES SECTION (ONLY 4 CARDS) */}
      <section className="space-y-8 max-w-5xl mx-auto">
        <div className="text-center space-y-2">
          <Badge variant="cyan">Platform Features</Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Dashboard Capabilities</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Personalized Skincare Dashboard */}
          <GlassCard glow className="space-y-3 p-6 text-left">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Personalized Skincare Dashboard</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track daily skincare routines, hydration levels, and personalized skin profile indicators.
            </p>
          </GlassCard>

          {/* Card 2: Role-Based Access */}
          <GlassCard glow className="space-y-3 p-6 text-left">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Role-Based Access</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Customized role workspaces for Consumers, Skincare Consultants, Dermatologists, and Administrators.
            </p>
          </GlassCard>

          {/* Card 3: Health Tracking */}
          <GlassCard glow className="space-y-3 p-6 text-left">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Health Tracking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitor skin health scores, routine consistency, sleep metrics, and lifestyle habits.
            </p>
          </GlassCard>

          {/* Card 4: Dashboard Analytics */}
          <GlassCard glow className="space-y-3 p-6 text-left">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Dashboard Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Visual bar charts and distribution analytics to monitor progress and performance over time.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* 3. ABOUT PLATFORM SECTION */}
      <section className="max-w-3xl mx-auto border-t border-slate-900 pt-12">
        <GlassCard className="space-y-4 p-8 text-center border-slate-800/80">
          <div className="flex items-center justify-center gap-2">
            <Info className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">About the Platform</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The AI Skin Intelligence Platform is designed to streamline skin health management by providing personalized user dashboards, role-based access for skincare professionals, and visual health analytics. It brings together consumers, consultants, dermatologists, and platform administrators into a unified healthcare management application.
          </p>
        </GlassCard>
      </section>

      {/* 4. CALL-TO-ACTION SECTION */}
      <section className="relative max-w-3xl mx-auto">
        <GlassCard glow className="p-8 sm:p-10 text-center space-y-6 border-emerald-500/40">
          <Badge variant="emerald" className="mx-auto">Get Started</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to Explore the Platform?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Select a role on the login page to access your personalized workspace.
          </p>
          <div>
            <Link to="/login">
              <Button size="lg" className="shadow-lg shadow-emerald-500/30 px-8 text-base font-extrabold">
                Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
