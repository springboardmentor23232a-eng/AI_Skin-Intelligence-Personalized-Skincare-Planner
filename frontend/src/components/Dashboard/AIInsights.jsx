import React from "react";
import { Brain, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function AIInsights({ data }) {
  const score = Number(data?.skin_health_score ?? 0);

  const insights = [
    {
      icon: <CheckCircle2 size={18} />,
      title: "Skin Health",
      text:
        score >= 75
          ? "Your current skin health score looks good."
          : "Your skin health needs some extra attention.",
    },
    {
      icon: <ShieldCheck size={18} />,
      title: "Daily Protection",
      text: "Stay consistent with your routine and daily sun protection.",
    },
    {
      icon: <Sparkles size={18} />,
      title: "Personalized Care",
      text: "Follow your recommended routine for better long-term progress.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-violet-600 font-semibold mb-1">
            PERSONALIZED FOR YOU
          </p>

          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="text-violet-600" size={22} />
            AI Skin Insights
          </h2>
        </div>

        <div className="bg-violet-50 text-violet-700 px-3 py-1 rounded-full text-xs font-semibold">
          AI Powered
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((item, index) => (
          <div
            key={index}
            className="flex gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-violet-50 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-violet-600 shrink-0">
              {item.icon}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {item.title}
              </h3>

              <p className="text-sm text-gray-500 mt-1 leading-6">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}