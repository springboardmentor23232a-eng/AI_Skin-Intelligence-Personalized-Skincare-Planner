import React from "react";
import { Check, Clock3 } from "lucide-react";

export default function RoutineCard({ checklist, onToggle }) {
  if (!checklist?.has_routine) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900">
          Today's Routine
        </h2>

        <p className="text-gray-500 text-sm mt-3">
          Your skincare routine has not been created yet.
        </p>
      </div>
    );
  }

  const items = checklist?.items || [];

  const completed = items.filter((item) => item.completed).length;

  const progress =
    items.length > 0
      ? Math.round((completed / items.length) * 100)
      : 0;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex justify-between items-start mb-5">
        <div>
          <p className="text-sm text-emerald-600 font-semibold">
            DAILY ROUTINE
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-1">
            Today's Skincare
          </h2>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock3 size={16} />
          {progress}%
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
        <div
          className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {items.map((item) => (
          <button
            type="button"
            key={item.step_key}
            onClick={() => onToggle(item.step_key)}
            className={`w-full text-left flex gap-3 p-3 rounded-2xl border transition ${
              item.completed
                ? "bg-emerald-50 border-emerald-100"
                : "bg-white border-gray-100 hover:border-violet-200"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                item.completed
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {item.completed ? <Check size={16} /> : null}
            </div>

            <div>
              <div className="flex gap-2 items-center flex-wrap">
                <span className="text-xs font-semibold text-violet-600 uppercase">
                  {item.period}
                </span>

                <span className="text-sm font-semibold text-gray-800">
                  {item.category}
                </span>
              </div>

              <p
                className={`text-sm mt-1 ${
                  item.completed
                    ? "text-gray-400 line-through"
                    : "text-gray-500"
                }`}
              >
                {item.instruction}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}