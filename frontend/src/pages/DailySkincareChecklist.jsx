import React, { useState } from 'react';
import userData from '../data/userData.json';
import Breadcrumb from '../components/common/Breadcrumb';
import { Sun, Moon, CheckCircle2, Circle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DailySkincareChecklist() {
  const [checklist, setChecklist] = useState(userData.routineChecklist);

  const toggleCheck = (type, id) => {
    const updated = checklist[type].map(item => {
      if (item.id === id) {
        const nextState = !item.done;
        toast.success(nextState ? `Completed: ${item.product}` : `Undone: ${item.product}`);
        return { ...item, done: nextState };
      }
      return item;
    });
    setChecklist({ ...checklist, [type]: updated });
  };

  // Calculate today's completion percentage
  const total = checklist.morning.length + checklist.evening.length;
  const completed = checklist.morning.filter(i => i.done).length + 
                    checklist.evening.filter(i => i.done).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const crumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Skincare Checklist', path: '/dashboard/checklist' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
            Daily Skincare Checklist
          </h1>
          <p className="text-sm text-brand-850">
            Log your daily product usage compliance to feed score algorithms.
          </p>
        </div>

        {/* Completion Progress Metric */}
        <div className="glass-effect border border-brand-100 p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-sm">
          <div className="w-14 h-14 relative flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="16" fill="none" stroke="#f4fbf7" strokeWidth="3" />
              <circle 
                cx="18" 
                cy="18" 
                r="16" 
                fill="none" 
                stroke="#2d8f66" 
                strokeWidth="3" 
                strokeDasharray={`${pct}, 100`} 
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-black font-display text-brand-950">{pct}%</span>
          </div>
          <div>
            <span className="text-[9px] font-display font-bold uppercase tracking-widest text-brand-600 block">Today's Progress</span>
            <span className="text-xs font-semibold text-slate-900 font-sans block">{completed} of {total} steps completed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Morning AM Checklist */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-brand-100/60">
            <div className="p-2 bg-brand-100 rounded-xl text-brand-600">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">Morning Sequence (AM)</h3>
              <p className="text-[10px] text-brand-800 font-sans">Apply protective serums and UV filters</p>
            </div>
          </div>

          <div className="space-y-2">
            {checklist.morning.map(item => (
              <button
                key={item.id}
                onClick={() => toggleCheck('morning', item.id)}
                className="w-full text-left flex items-center justify-between p-3.5 rounded-2xl border border-brand-100 bg-brand-50/20 hover:bg-brand-50/60 transition-colors text-xs font-sans"
              >
                <div>
                  <span className="font-semibold text-slate-900 block">{item.step}</span>
                  <span className="text-[10px] text-brand-850 block mt-0.5">{item.product}</span>
                </div>
                {item.done ? (
                  <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 fill-brand-100" />
                ) : (
                  <Circle className="w-5 h-5 text-brand-300 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Evening PM Checklist */}
        <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-brand-100/60">
            <div className="p-2 bg-accent-100 text-accent-600">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">Evening Sequence (PM)</h3>
              <p className="text-[10px] text-brand-800 font-sans">Apply cell renewals and skin barrier repair ointments</p>
            </div>
          </div>

          <div className="space-y-2">
            {checklist.evening.map(item => (
              <button
                key={item.id}
                onClick={() => toggleCheck('evening', item.id)}
                className="w-full text-left flex items-center justify-between p-3.5 rounded-2xl border border-brand-100 bg-accent-50/10 hover:bg-accent-50/30 transition-colors text-xs font-sans"
              >
                <div>
                  <span className="font-semibold text-slate-900 block">{item.step}</span>
                  <span className="text-[10px] text-brand-850 block mt-0.5">{item.product}</span>
                </div>
                {item.done ? (
                  <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 fill-brand-100" />
                ) : (
                  <Circle className="w-5 h-5 text-brand-300 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
