import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLES } from '@/lib/constants';
import { Sparkles, User, UserCheck, Stethoscope, Shield, Menu, X, LogIn, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const rawRole = (user?.role || USER_ROLES.CONSUMER).toLowerCase().replace('wellness_coach', 'consultant');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Build navigation items filtered strictly according to user role
  const getNavItems = () => {
    const items = [{ label: 'Home', href: '/' }];

    if (!isAuthenticated) {
      return items;
    }

    if (rawRole === 'admin') { 
  return [ 
    { label: 'Home', href: '/' }, 
    { label: 'User Dashboard', href: '/dashboard/user' }, 
    { label: 'Consultant Dashboard', href: '/dashboard/consultant' }, 
    { label: 'Dermatologist Dashboard', href: '/dashboard/dermatologist' }, 
    { label: 'Admin Console', href: '/dashboard/admin' }, 
  ]; 
}

    if (rawRole === 'consultant') {
  items.push({
    label: 'Consultant Workspace',
    href: '/dashboard/consultant'
  });
} else if (rawRole === 'dermatologist') {
  items.push({
    label: 'Dermatologist Portal',
    href: '/dashboard/dermatologist'
  });
} else { 
  items.push(
    { 
      label: 'User Dashboard', 
      href: '/dashboard/user' 
    },
    
  ); 
}



return items;
  };

  const navItems = getNavItems();

  const getRoleBadge = () => {
    switch (rawRole) {
      case 'admin':
        return { label: 'Admin', color: 'bg-violet-500/20 text-violet-300 border-violet-500/40', icon: Shield };
      case 'consultant':
        return { label: 'Consultant', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40', icon: UserCheck };
      case 'dermatologist':
        return { label: 'Dermatologist', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', icon: Stethoscope };
      default:
        return { label: 'User', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: User };
    }
  };

  const roleBadge = getRoleBadge();
  const BadgeIcon = roleBadge.icon;

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
                AI Skincare Platform
              </span>
            </div>
          </Link>

          {/* Desktop Role-Based Navigation Items */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-1.5 shadow-inner">
            {navItems.map((item) => {
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

          {/* User Status Badge & Auth Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                {/* Role Badge */}
                <div className={cn('flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold shadow-sm', roleBadge.color)}>
                  <BadgeIcon className="w-3.5 h-3.5" />
                  <span>{roleBadge.label}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" /> Logout
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-400" /> Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
                >
                  Create Account
                </Link>
              </div>
            )}

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
            {isAuthenticated && (
              <div className="flex items-center justify-between p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 font-semibold">{user?.email}</span>
                <div className={cn('flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[11px] font-bold', roleBadge.color)}>
                  <BadgeIcon className="w-3 h-3" /> {roleBadge.label}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 text-xs">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-medium hover:text-white"
                >
                  {item.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-left flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-center font-bold"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 text-center font-bold"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
