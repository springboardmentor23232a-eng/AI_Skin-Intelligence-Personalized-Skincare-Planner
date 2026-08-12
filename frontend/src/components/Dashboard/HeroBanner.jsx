import React from "react";
import { motion } from "framer-motion";
import { Camera, Sparkles } from "lucide-react";

export default function HeroBanner({ user }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-3xl shadow-xl p-8 text-white mb-8"
    >
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
        <div>
          <p className="text-indigo-100 text-sm mb-2">
            AI Skin Intelligence
          </p>

          <h1 className="text-4xl font-bold mb-3">
            Welcome back,
            <br />
            {user?.full_name} 👋
          </h1>

          <p className="text-indigo-100 max-w-lg">
            Your personalized skincare assistant is ready.
            Check today's AI insights and keep your skin healthy.
          </p>

          <button className="mt-6 flex items-center gap-2 bg-white text-indigo-700 px-5 py-3 rounded-xl font-semibold hover:scale-105 transition">
            <Camera size={20} />
            New Skin Scan
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-72">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={20} />
            <span className="font-semibold">
              Today's AI Insight
            </span>
          </div>

          <p className="text-sm text-indigo-100">
            Your hydration has improved compared to last week.
            Continue Vitamin C serum and don't forget SPF 50.
          </p>
        </div>
      </div>
    </motion.div>
  );
}