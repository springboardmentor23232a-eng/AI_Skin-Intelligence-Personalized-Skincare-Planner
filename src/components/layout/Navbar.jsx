import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLES } from '@/lib/constants';
import { Sparkles, SlidersHorizontal, User, UserCheck, Stethoscope, Shield, Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const location = useLocation();
  const { user, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNavItems = [
    { label: 'Home', href: '/' },
    { label: 'User Dashboard', href: '/dashboard/user' },
    { label: 'Consultant Dashboard', href: '/dashboard/consultant' },
    { label: 'Dermatologist Dashboard', href: '/dashboard/dermatologist' },
    { label: 'Admin Dashboard', href: '/dashboard/admin' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-slate-950/85 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center text-slate-950 font-extrabold shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-all">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  SkinIntelligence
                </span>
              </div>
              <span className="text-[10px] block font-semibold text-slate-400 uppercase tracking-widest">
                Dashboard Platform
              </span>
            </div>
          </Link>

          {/* Desktop Main Routes */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-1.5 shadow-inner">
            {mainNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 shadow-md shadow-emerald-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Role Switcher Pill & Login Action */}
          <div className="flex items-center gap-3">
            {/* Role Switcher Pill */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-1 text-xs shadow-lg">
              <span className="px-2.5 text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" /> Role:
              </span>
              <button
                onClick={() => switchRole(USER_ROLES.CONSUMER)}
                className={cn(
                  'px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1',
                  user.role === USER_ROLES.CONSUMER
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <User className="w-3 h-3" /> User
              </button>
              <button
                onClick={() => switchRole(USER_ROLES.CONSULTANT)}
                className={cn(
                  'px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1',
                  user.role === USER_ROLES.CONSULTANT
                    ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <UserCheck className="w-3 h-3" /> Consultant
              </button>
              <button
                onClick={() => switchRole(USER_ROLES.DERMATOLOGIST)}
                className={cn(
                  'px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1',
                  user.role === USER_ROLES.DERMATOLOGIST
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <Stethoscope className="w-3 h-3" /> Derm
              </button>
              <button
                onClick={() => switchRole(USER_ROLES.ADMIN)}
                className={cn(
                  'px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1',
                  user.role === USER_ROLES.ADMIN
                    ? 'bg-violet-500 text-slate-950 shadow-md shadow-violet-500/20'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <Shield className="w-3 h-3" /> Admin
              </button>
            </div>

            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" /> Login
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800/80 space-y-3">
            <div className="flex flex-wrap gap-1 p-2 bg-slate-900/90 rounded-xl border border-slate-800">
              <button
                onClick={() => { switchRole(USER_ROLES.CONSUMER); setMobileMenuOpen(false); }}
                className={cn('flex-1 py-1.5 rounded-lg text-xs font-bold', user.role === USER_ROLES.CONSUMER ? 'bg-emerald-500 text-slate-950' : 'text-slate-400')}
              >
                User
              </button>
              <button
                onClick={() => { switchRole(USER_ROLES.CONSULTANT); setMobileMenuOpen(false); }}
                className={cn('flex-1 py-1.5 rounded-lg text-xs font-bold', user.role === USER_ROLES.CONSULTANT ? 'bg-teal-500 text-slate-950' : 'text-slate-400')}
              >
                Consultant
              </button>
              <button
                onClick={() => { switchRole(USER_ROLES.DERMATOLOGIST); setMobileMenuOpen(false); }}
                className={cn('flex-1 py-1.5 rounded-lg text-xs font-bold', user.role === USER_ROLES.DERMATOLOGIST ? 'bg-cyan-500 text-slate-950' : 'text-slate-400')}
              >
                Derm
              </button>
              <button
                onClick={() => { switchRole(USER_ROLES.ADMIN); setMobileMenuOpen(false); }}
                className={cn('flex-1 py-1.5 rounded-lg text-xs font-bold', user.role === USER_ROLES.ADMIN ? 'bg-violet-500 text-slate-950' : 'text-slate-400')}
              >
                Admin
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-medium hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold"
              >
                Login Page
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
