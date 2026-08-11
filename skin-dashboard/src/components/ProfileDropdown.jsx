import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ProfileDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getDashboardPath = () => {
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "SKINCARE_CONSULTANT" || user.role === "DERMATOLOGIST") return "/consultant";
    return "/user";
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        className="w-9 h-9 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-sm shadow-indigo-500/20"
        onClick={() => setOpen(!open)}
      >
        {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-60 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50"
          >
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-1">
              <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                {user.full_name}
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                {user.email}
              </div>
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {user.role}
              </span>
            </div>

            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => {
                setOpen(false);
                navigate(getDashboardPath());
              }}
            >
              <LayoutDashboard size={14} /> Workspace Dashboard
            </button>

            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors mt-1"
              onClick={handleLogout}
            >
              <LogOut size={14} /> Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProfileDropdown;
