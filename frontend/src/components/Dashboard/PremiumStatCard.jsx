import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function PremiumStatCard({
  title,
  value,
  subtitle,
  icon,
  color = "bg-violet-500",
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-6">

      <div className="flex justify-between items-start">

        <div>

          <p className="text-gray-500 text-sm">
            {title}
          </p>

          <h2 className="text-4xl font-bold mt-2">
            {value}
          </h2>

          <div className="flex items-center gap-2 mt-3">

            <ArrowUpRight
              size={16}
              className="text-green-500"
            />

            <span className="text-green-600 text-sm font-semibold">
              {subtitle}
            </span>

          </div>

        </div>

        <div
          className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-white`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}