import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  User, 
  Activity, 
  Sparkles, 
  TrendingUp, 
  FlaskConical, 
  ShoppingBag, 
  FileText, 
  Stethoscope, 
  ShieldCheck, 
  Home,
  CheckCircle2,
  Camera
} from "lucide-react";

function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const mainNavItems = [
    { path: "/user", label: "Overview", icon: LayoutDashboard, role: "USER" },
    { path: "/profile", label: "Skin Profile", icon: User, role: "USER" },
    { path: "/assessment", label: "AI Assessment", icon: Activity, role: "USER" },
    { path: "/image-analysis", label: "Skin Image Analysis", icon: Camera, role: "USER" },
    { path: "/routines", label: "Adaptive Routines", icon: Sparkles, role: "USER" },
    { path: "/analytics", label: "Skin Analytics", icon: TrendingUp, role: "USER" },
    { path: "/ingredients", label: "Ingredient Intelligence", icon: FlaskConical, role: "USER" },
    { path: "/products", label: "Products Catalog", icon: ShoppingBag, role: "USER" },
    { path: "/recommendations", label: "AI Recommendations", icon: Sparkles, role: "USER", highlight: true },
    { path: "/reports", label: "Reports & Export", icon: FileText, role: "USER" },
  ];


  return (
    <aside className="hidden md:flex flex-col w-64 min-h-[calc(100vh-3.5rem)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 transition-colors duration-200">
      <div className="flex-1 space-y-6">
        {/* Core Nav Group */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Core Workspace
          </div>
          <nav className="space-y-1">
            {user.role === "USER" &&
              mainNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all text-decoration-none ${
                      active
                        ? "text-indigo-600 dark:text-indigo-400 bg-gradient-to-r from-indigo-50/90 to-purple-50/40 dark:from-indigo-950/50 dark:to-purple-950/20 shadow-sm border border-indigo-100/50 dark:border-indigo-900/30"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-cyan-400 via-indigo-500 to-purple-500 rounded-r-full shadow-sm"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <Icon size={16} className={item.highlight ? "text-amber-500" : ""} />
                    <span>{item.label}</span>
                  </Link>

                );
              })}

            {(user.role === "SKINCARE_CONSULTANT" || user.role === "DERMATOLOGIST" || user.role === "ADMIN") && (
              <Link
                to="/consultant"
                className={`relative flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-decoration-none ${
                  isActive("/consultant")
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Stethoscope size={16} />
                <span>Consultant Workspace</span>
              </Link>
            )}

            {(user.role === "DERMATOLOGIST" || user.role === "ADMIN") && (
              <Link
                to="/dermatologist"
                className={`relative flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-decoration-none ${
                  isActive("/dermatologist")
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Stethoscope size={16} />
                <span>Dermatologist Workspace</span>
              </Link>
            )}

            {user.role === "ADMIN" && (
              <Link
                to="/admin"
                className={`relative flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-decoration-none ${
                  isActive("/admin")
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <ShieldCheck size={16} />
                <span>Admin Control Panel</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Shortcuts Group */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Platform Navigation
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all text-decoration-none"
          >
            <Home size={16} />
            <span>Platform Landing</span>
          </Link>
        </div>
      </div>

      {/* Footer Status Widget */}
      <div className="mt-auto p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 size={10} /> Active
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-200">AI Engine v2.4</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0">
          Connected to PostgreSQL.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
