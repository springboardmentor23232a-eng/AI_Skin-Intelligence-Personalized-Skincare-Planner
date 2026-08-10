import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      type="button"
      className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
      onClick={toggleTheme}
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 180 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {theme === "light" ? <Moon size={16} /> : <Sun size={16} className="text-amber-400" />}
      </motion.div>
    </motion.button>
  );
}

export default ThemeToggle;
