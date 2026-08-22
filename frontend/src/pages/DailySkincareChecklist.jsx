import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/common/Breadcrumb';
import { Sun, Moon, CheckCircle2, Circle, Calendar, ClipboardList, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import * as routineService from '../services/routineService';

export default function DailySkincareChecklist() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasRoutine, setHasRoutine] = useState(false);
  const [routine, setRoutine] = useState(null);
  
  // Checklist split states
  const [morningList, setMorningList] = useState([]);
  const [eveningList, setEveningList] = useState([]);
  const [weeklyList, setWeeklyList] = useState([]);
  
  // Checkbox completion state map: { [itemId]: boolean }
  const [checkedItems, setCheckedItems] = useState({});

  const crumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Skincare Checklist', path: '/dashboard/checklist' }
  ];

  const loadChecklistData = async () => {
    setLoading(true);
    try {
      const routineData = await routineService.getCurrentRoutine();
      setRoutine(routineData);
      
      const items = routineData.items || [];
      setMorningList(items.filter(i => i.routine_type === 'MORNING' && i.is_enabled).sort((a, b) => a.step_order - b.step_order));
      setEveningList(items.filter(i => i.routine_type === 'EVENING' && i.is_enabled).sort((a, b) => a.step_order - b.step_order));
      setWeeklyList(items.filter(i => i.routine_type === 'WEEKLY' && i.is_enabled).sort((a, b) => a.step_order - b.step_order));
      setHasRoutine(true);
      
      // Load saved progress from localStorage
      const saved = localStorage.getItem('skincare_checklist_progress');
      if (saved) {
        try {
          setCheckedItems(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setHasRoutine(false);
      } else {
        toast.error('Failed to load daily checklist.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChecklistData();
  }, []);

  const toggleCheck = (id, name) => {
    const nextVal = !checkedItems[id];
    const newChecked = { ...checkedItems, [id]: nextVal };
    setCheckedItems(newChecked);
    localStorage.setItem('skincare_checklist_progress', JSON.stringify(newChecked));
    toast.success(nextVal ? `Completed: ${name}` : `Undone: ${name}`);
  };

  // Calculate today's completion percentage (AM + PM only, weekly is checklist treatment support)
  const total = morningList.length + eveningList.length;
  const completed = morningList.filter(i => checkedItems[i.id]).length + 
                    eveningList.filter(i => checkedItems[i.id]).length;
  const pct = total > 0 ? Math.round((completed / total) * 105 / 1.05) : 0; // standard round bound

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
            Daily Skincare Checklist
          </h1>
          <p className="text-sm text-brand-850">
            Log your daily product usage compliance to maintain routine consistency.
          </p>
        </div>

        {/* Completion Progress Metric */}
        {hasRoutine && total > 0 && (
          <div className="glass-effect border border-brand-100 p-4 rounded-2xl flex items-center gap-4 shrink-0 shadow-sm bg-white">
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
        )}
      </div>

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-brand-850 font-semibold">Loading daily checklist...</span>
        </div>
      )}

      {!loading && !hasRoutine && (
        <div className="py-16 text-center border-2 border-dashed border-brand-200 bg-white rounded-3xl p-8 max-w-md mx-auto flex flex-col items-center justify-center gap-4">
          <ClipboardList className="w-12 h-12 text-brand-400 animate-bounce" />
          <h3 className="font-display text-lg font-bold text-brand-950">No Active Routine</h3>
          <p className="text-xs text-brand-800 leading-relaxed">
            Please complete your skincare questionnaire profile first to generate a personalized routine and checklist steps.
          </p>
          <button
            onClick={() => navigate('/dashboard/routine')}
            className="btn-primary py-2 px-5 rounded-xl text-xs font-display font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            Go to Personalized Routine
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {!loading && hasRoutine && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left/Main AM/PM lists */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Morning AM Checklist */}
              <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm bg-white space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-brand-100/60">
                  <div className="p-2 bg-brand-50 text-brand-650 rounded-xl">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">Morning Sequence (AM)</h3>
                    <p className="text-[10px] text-brand-800 font-sans">Apply protective serums and UV filters</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {morningList.length > 0 ? (
                    morningList.map(item => (
                      <button
                        key={item.id}
                        onClick={() => toggleCheck(item.id, item.name)}
                        className={`w-full text-left flex items-center justify-between p-3.5 rounded-2xl border transition-colors text-xs font-sans ${
                          checkedItems[item.id] 
                            ? 'bg-brand-50/50 border-brand-200' 
                            : 'bg-brand-50/10 border-brand-100/80 hover:bg-brand-50/40'
                        }`}
                      >
                        <div className="pr-4">
                          <span className="font-semibold text-slate-900 block">Step {item.step_order} • {item.category}</span>
                          <span className="text-[10px] text-brand-850 block mt-0.5">{item.name}</span>
                        </div>
                        {checkedItems[item.id] ? (
                          <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 fill-brand-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-brand-300 shrink-0 hover:text-brand-400" />
                        )}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-6">No morning steps generated.</p>
                  )}
                </div>
              </div>

              {/* Evening PM Checklist */}
              <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm bg-white space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-brand-100/60">
                  <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">Evening Sequence (PM)</h3>
                    <p className="text-[10px] text-brand-800 font-sans">Apply cell renewals and barrier repair creams</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {eveningList.length > 0 ? (
                    eveningList.map(item => (
                      <button
                        key={item.id}
                        onClick={() => toggleCheck(item.id, item.name)}
                        className={`w-full text-left flex items-center justify-between p-3.5 rounded-2xl border transition-colors text-xs font-sans ${
                          checkedItems[item.id] 
                            ? 'bg-indigo-50/30 border-indigo-200' 
                            : 'bg-indigo-50/5 border-indigo-100/60 hover:bg-indigo-50/20'
                        }`}
                      >
                        <div className="pr-4">
                          <span className="font-semibold text-slate-900 block">Step {item.step_order} • {item.category}</span>
                          <span className="text-[10px] text-brand-850 block mt-0.5">{item.name}</span>
                        </div>
                        {checkedItems[item.id] ? (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 fill-indigo-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-indigo-300 shrink-0 hover:text-indigo-400" />
                        )}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-6">No evening steps generated.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right column: Weekly active checklist tracker */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm bg-white space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-brand-100/60">
                  <div className="p-2 bg-brand-50/55 text-brand-650 rounded-xl">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">Weekly Exfoliations & Masks</h3>
                    <p className="text-[10px] text-brand-800 font-sans">Active chemical peels & hydration masks</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {weeklyList.length > 0 ? (
                    weeklyList.map(item => (
                      <button
                        key={item.id}
                        onClick={() => toggleCheck(item.id, item.name)}
                        className={`w-full text-left flex items-center justify-between p-3 border transition-colors text-xs font-sans rounded-2xl ${
                          checkedItems[item.id] 
                            ? 'bg-brand-50/50 border-brand-200' 
                            : 'bg-brand-50/5 border-brand-100/80 hover:bg-brand-50/30'
                        }`}
                      >
                        <div className="pr-4 text-xs">
                          <span className="font-bold text-brand-900 block">{item.name}</span>
                          <span className="text-[10.5px] text-slate-700 block mt-0.5 leading-normal">{item.description}</span>
                        </div>
                        {checkedItems[item.id] ? (
                          <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 fill-brand-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-brand-300 shrink-0 hover:text-brand-400" />
                        )}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-6">No weekly active treatments generated.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
