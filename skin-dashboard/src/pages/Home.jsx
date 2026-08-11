import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { Sparkles, FlaskConical, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24 flex items-center justify-center relative overflow-hidden bg-gradient-hero">
        {/* Ambient AI Mesh Background Element */}
        <div className="absolute inset-0 opacity-25 bg-gradient-mesh pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full text-xs font-bold bg-indigo-950/80 text-cyan-300 border border-cyan-500/30 shadow-glow"
          >
            <Sparkles size={14} className="text-cyan-400" />
            <span>Next-Gen Clinical AI Skincare Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6"
          >
            Precision <span className="text-gradient-aurora">Clinical Skin Intelligence</span> & Custom Care
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Multi-parameter dermatological image analysis, adaptive routines, ingredient safety verification, and clinical progress monitoring.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-4 mb-16"
          >
            {user ? (
              <Link
                to={user.role === "SKINCARE_CONSULTANT" ? "/consultant" : user.role === "ADMIN" ? "/admin" : "/user"}
                className="btn-primary-neon text-decoration-none"
              >
                Launch Workspace <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-primary-neon text-decoration-none"
                >
                  Get Started Free <ArrowRight size={16} />
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary-tech text-decoration-none"
                >
                  Sign In
                </Link>
              </>
            )}
          </motion.div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <motion.div
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-cyber-neon flex items-center justify-center text-white mb-4 shadow-md">
                <Zap size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                AI Diagnostic Engine
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Multi-metric computer vision scan quantifying acne, redness, oiliness, hydration, and hyperpigmentation.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-aurora flex items-center justify-center text-white mb-4 shadow-md">
                <FlaskConical size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Ingredient Compatibility
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Active chemical interaction checker preventing harmful acid stack combinations and formula conflicts.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-emerald flex items-center justify-center text-white mb-4 shadow-md">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Adaptive Routines
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dynamically adjusted morning, evening, and weekly regimens synced with environmental change vectors.
              </p>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;