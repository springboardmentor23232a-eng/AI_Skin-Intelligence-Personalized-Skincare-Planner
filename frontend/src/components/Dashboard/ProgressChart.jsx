import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";

const sampleData = [
  { day: "Mon", score: 72 },
  { day: "Tue", score: 75 },
  { day: "Wed", score: 76 },
  { day: "Thu", score: 78 },
  { day: "Fri", score: 80 },
  { day: "Sat", score: 82 },
  { day: "Sun", score: 84 },
];

export default function ProgressChart() {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">

      <div className="flex items-center justify-between mb-6">

        <div>

          <p className="text-sm font-semibold text-violet-600 uppercase">
            Weekly Progress
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-1">
            Skin Health Trend
          </h2>

        </div>

        <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">

          <TrendingUp className="text-violet-600" />

        </div>

      </div>

      <ResponsiveContainer width="100%" height={280}>

        <LineChart data={sampleData}>

          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            domain={[60, 100]}
          />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="score"
            stroke="#7C3AED"
            strokeWidth={4}
            dot={{
              r: 6,
            }}
            activeDot={{
              r: 8,
            }}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}