import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import NotificationCenter from "./NotificationCenter";
import ProfileDropdown from "./ProfileDropdown";
import { Sparkles, Search, Command, Menu, X, LayoutDashboard, User, Activity, TrendingUp, FlaskConical, ShoppingBag, FileText, Stethoscope, ShieldCheck, Home, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const mobileNavItems = [
    { path: "/user", label: "Overview", icon: LayoutDashboard, role: "USER" },
    { path: "/profile", label: "Skin Profile", icon: User, role: "USER" },
    { path: "/assessment", label: "AI Assessment", icon: Activity, role: "USER" },
    { path: "/image-analysis", label: "Skin Image Analysis", icon: Camera, role: "USER" },
    { path: "/routines", label: "Adaptive Routines", icon: Sparkles, role: "USER" },
    { path: "/analytics", label: "Skin Analytics", icon: TrendingUp, role: "USER" },
    { path: "/ingredients", label: "Ingredient Intelligence", icon: FlaskConical, role: "USER" },
    { path: "/products", label: "Products Catalog", icon: ShoppingBag, role: "USER" },
    { path: "/recommendations", label: "AI Recommendations", icon: Sparkles, role: "USER" },
    { path: "/reports", label: "Reports & Export", icon: FileText, role: "USER" },
  ];


  return (
    <header className="sticky top-0 z-50 w-full h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Brand Logo & Mobile Trigger */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              type="button"
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group text-decoration-none">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20"
            >
              <Sparkles size={18} />
            </motion.div>
            <span className="font-bold text-slate-900 dark:text-white tracking-tight text-sm sm:text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              AI Skin Intelligence
            </span>
          </Link>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center relative w-64 lg:w-80">
          <Search size={14} className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search AI features, ingredients..."
            className="w-full h-8 pl-8 pr-10 text-xs rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
          />
          <div className="absolute right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-semibold text-slate-400 shadow-2xs">
            <Command size={10} /> K
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <ThemeToggle />
          {user && <NotificationCenter />}
          {user ? (
            <ProfileDropdown />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-decoration-none"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-500/20 transition-all text-decoration-none"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 space-y-1 shadow-lg"
          >
            {user.role === "USER" &&
              mobileNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-decoration-none ${
                      active
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

            {(user.role === "SKINCARE_CONSULTANT" || user.role === "DERMATOLOGIST" || user.role === "ADMIN") && (
              <Link
                to="/consultant"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-decoration-none ${
                  isActive("/consultant")
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Stethoscope size={16} />
                <span>Consultant Workspace</span>
              </Link>
            )}

            {(user.role === "DERMATOLOGIST" || user.role === "ADMIN") && (
              <Link
                to="/dermatologist"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-decoration-none ${
                  isActive("/dermatologist")
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Stethoscope size={16} />
                <span>Dermatologist Workspace</span>
              </Link>
            )}

            {user.role === "ADMIN" && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-decoration-none ${
                  isActive("/admin")
                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <ShieldCheck size={16} />
                <span>Admin Control Panel</span>
              </Link>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-decoration-none"
              >
                <Home size={16} />
                <span>Platform Landing</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;