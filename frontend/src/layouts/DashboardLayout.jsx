import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sparkles, 
  Home, 
  User, 
  Camera, 
  Calendar, 
  TestTube, 
  ShoppingBag, 
  LineChart, 
  Bell, 
  Settings as SettingsIcon, 
  ShieldCheck, 
  HeartPulse, 
  Menu, 
  X,
  ChevronDown,
  LogOut,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const currentRole = user?.role || 'user';

  // Group paths with roles for active highlights
  const navItems = [
    // User sidebar options
    { label: 'Dashboard', path: '/dashboard', icon: Home, roles: ['user'] },
    { label: 'Skin Assessment', path: '/dashboard/assessment', icon: Camera, roles: ['user'] },
    { label: 'Personalized Routine', path: '/dashboard/routine', icon: Calendar, roles: ['user'] },
    { label: 'Recommendations', path: '/dashboard/recommendations', icon: ShoppingBag, roles: ['user'] },
    { label: 'Progress Tracking', path: '/dashboard/progress', icon: LineChart, roles: ['user'] },
    { label: 'Skincare Checklist', path: '/dashboard/checklist', icon: CheckCircle2, roles: ['user'] },
    { label: 'Ingredient Intelligence', path: '/dashboard/ingredients', icon: TestTube, roles: ['user'] },

    // Consultant sidebar options
    { label: 'Dashboard', path: '/consultant', icon: Home, roles: ['consultant'] },
    { label: 'Client Profiles', path: '/consultant/profiles', icon: User, roles: ['consultant'] },
    { label: 'Assessment Reports', path: '/consultant/reports', icon: Camera, roles: ['consultant'] },
    { label: 'Recommendation Mgmt', path: '/consultant/recommendations', icon: Sparkles, roles: ['consultant'] },
    { label: 'Progress Monitoring', path: '/consultant/progress', icon: LineChart, roles: ['consultant'] },

    // Dermatologist sidebar options
    { label: 'Dashboard', path: '/dermatologist', icon: Home, roles: ['dermatologist'] },
    { label: 'Patient Insights', path: '/dermatologist/insights', icon: User, roles: ['dermatologist'] },
    { label: 'Condition Reports', path: '/dermatologist/reports', icon: Camera, roles: ['dermatologist'] },
    { label: 'Treatment Recommendations', path: '/dermatologist/recommendations', icon: HeartPulse, roles: ['dermatologist'] },
    { label: 'Progress Analytics', path: '/dermatologist/analytics', icon: LineChart, roles: ['dermatologist'] },

    // Admin sidebar options
    { label: 'Dashboard', path: '/admin', icon: Home, roles: ['admin'] },
    { label: 'User Management', path: '/admin/users', icon: ShieldCheck, roles: ['admin'] },
    { label: 'Platform Analytics', path: '/admin/analytics', icon: LineChart, roles: ['admin'] },
    { label: 'Recommendation Monitoring', path: '/admin/monitoring', icon: Sparkles, roles: ['admin'] },
    { label: 'System Reports', path: '/admin/reports', icon: SettingsIcon, roles: ['admin'] },
  ];

  // Filter items matching active role
  const activeNavItems = navItems.filter(item => item.roles.includes(currentRole));

  const handleSignOut = () => {
    logout();
    toast.success('Signed out successfully.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-brand-50 font-sans">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-brand-950 text-brand-100 border-r border-brand-900 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-brand-900">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-brand-900 rounded-lg text-brand-400 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <span className="font-display font-bold text-base text-white tracking-tight">
              AI Skin Intelligence
            </span>
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {activeNavItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-800 text-white shadow-md' 
                    : 'text-brand-300 hover:bg-brand-900 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Profile Panel */}
        <div className="p-4 border-t border-brand-900 bg-brand-950 flex flex-col gap-2">
          {user && (
            <Link 
              to="/profile" 
              className="flex items-center gap-3 px-2 py-1.5 hover:bg-brand-900/40 rounded-xl transition-all cursor-pointer border border-transparent hover:border-brand-900"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-brand-800" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center font-display font-bold text-xs text-brand-200">
                  {user.name?.[0] || 'U'}
                </div>
              )}
              <div className="truncate text-xs">
                <div className="font-semibold text-white truncate">{user.name}</div>
                <div className="text-[10px] text-brand-300 capitalize">{user.role}</div>
              </div>
            </Link>
          )}
          <button 
            onClick={handleSignOut}
            className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-300 hover:bg-red-950/20 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Bar (WITHOUT testing role dropdown switcher) */}
        <header className="h-16 bg-white border-b border-brand-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-2 text-brand-850 hover:bg-brand-100 rounded-lg lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-display font-bold text-lg text-brand-950 lg:block hidden">
              Client Portal
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-display font-bold uppercase tracking-wider text-brand-700 bg-brand-100/50 px-3 py-1 rounded-full capitalize">
              Role: {currentRole}
            </span>
          </div>
        </header>

        {/* Content Workspace */}
        <main className="flex-1 overflow-y-auto bg-brand-50/50">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Modal Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-brand-950/60 backdrop-blur-sm"
          />
          <aside className="relative flex flex-col w-72 bg-brand-950 text-brand-100 h-full max-w-xs animate-fade-in z-50">
            <div className="h-16 flex items-center justify-between px-6 border-b border-brand-900">
              <span className="font-display font-bold text-base text-white tracking-tight">
                AI Skin Intelligence
              </span>
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="p-2 -mr-2 rounded-lg text-brand-400 hover:bg-brand-900 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {activeNavItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={idx}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-brand-800 text-white shadow-md' 
                        : 'text-brand-300 hover:bg-brand-900 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-brand-900 bg-brand-950 flex flex-col gap-2">
              {user && (
                <Link 
                  to="/profile"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center gap-3 px-2 py-1.5 hover:bg-brand-900/40 rounded-xl transition-all cursor-pointer border border-transparent hover:border-brand-900"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-brand-800" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center font-display font-bold text-xs text-brand-200">
                      {user.name?.[0] || 'U'}
                    </div>
                  )}
                  <div className="truncate text-xs">
                    <div className="font-semibold text-white truncate">{user.name}</div>
                    <div className="text-[10px] text-brand-300 capitalize">{user.role}</div>
                  </div>
                </Link>
              )}
              <button 
                onClick={handleSignOut}
                className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-300 hover:bg-red-950/20 hover:text-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
