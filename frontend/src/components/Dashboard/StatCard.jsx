import React from "react";
import CountUp from "react-countup";

export default function StatCard({
  title,
  value,
  icon,
  color = "bg-indigo-500",
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 hover:shadow-xl transition duration-300">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {typeof value === "number" ? (
              <CountUp end={value} duration={2} />
            ) : (
              value
            )}
          </h2>
        </div>

        <div
          className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center text-white`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}