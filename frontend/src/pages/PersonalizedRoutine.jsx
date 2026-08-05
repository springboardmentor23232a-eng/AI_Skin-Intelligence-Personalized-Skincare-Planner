import React from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import { Sun, Moon, Calendar, CloudSnow, Clock } from 'lucide-react';

export default function PersonalizedRoutine() {
  const crumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Personalized Routine', path: '/dashboard/routine' }
  ];

  const routines = [
    {
      title: 'Morning Routine (AM)',
      subtitle: 'Target: Protection & Hydration',
      icon: Sun,
      color: 'brand',
      steps: [
        { time: '08:00 AM', step: 'Cleanse', prod: 'Hydrating Cleanser (Gentle)', info: 'Removes overnight sebum without drying.' },
        { time: '08:05 AM', step: 'Tone', prod: 'Hydrating Rosewater Toner', info: 'Rebalances skin pH and hydrates.' },
        { time: '08:10 AM', step: 'Active Serum', prod: 'Vitamin C Serum (15%)', info: 'Provides antioxidant shield against pollution.' },
        { time: '08:15 AM', step: 'Moisturize & Shield', prod: 'Barrier Lotion + Broad SPF 50', info: 'Crucial block for UV & moisture retention.' }
      ]
    },
    {
      title: 'Evening Routine (PM)',
      subtitle: 'Target: Repair & Rejuvenate',
      icon: Moon,
      color: 'accent',
      steps: [
        { time: '09:30 PM', step: 'Double Cleanse', prod: 'Squalane Cleansing Oil + Gel Cleanser', info: 'Removes makeup, sunscreen, and daily grime.' },
        { time: '09:40 PM', step: 'Exfoliate (Alt Nights)', prod: 'Salicylic Acid Toner (2%)', info: 'Cleanses deep pores. Avoid using with retinol.' },
        { time: '09:45 PM', step: 'Cell Renewal', prod: 'Retinol Serum (0.5%)', info: 'Promotes collagen production and reduces spots.' },
        { time: '09:50 PM', step: 'Barrier Support', prod: 'Ceramide Peptide Cream', info: 'Rich texture locks actives and repairs overnight.' }
      ]
    },
    {
      title: 'Weekly Routine',
      subtitle: 'Target: Deep Exfoliation & Treatment',
      icon: Calendar,
      color: 'indigo',
      steps: [
        { time: 'Wednesday PM', step: 'Exfoliating Peel', prod: 'AHA 30% + BHA 2% Solution', info: 'Leave on for exactly 8 minutes. Rinse thoroughly.' },
        { time: 'Sunday PM', step: 'Deep Hydration Mask', prod: 'Hyaluronic Sheet Mask + Rose Oil', info: 'Rehydrates skin after exfoliating routines.' }
      ]
    },
    {
      title: 'Seasonal Routine (Summer/Winter)',
      subtitle: 'Target: Weather Adaptations',
      icon: CloudSnow,
      color: 'blue',
      steps: [
        { time: 'Summer Shift', step: 'Lightweight Texture', prod: 'Gel Moisturizers & Oil-control Mattes', info: 'Use lighter fluids to avoid clogging pores in humidity.' },
        { time: 'Winter Shift', step: 'Heavy Nourishment', prod: 'Ointments, Marula Oil & Rich Ceramides', info: 'Adds critical lipid layers to prevent dry patches from heating.' }
      ]
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      <div>
        <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
          Personalized Routine
        </h1>
        <p className="text-sm text-brand-850">
          Your tailored skincare schedule for daily protection and long-term health.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {routines.map((r, idx) => {
          const Icon = r.icon;
          return (
            <div 
              key={idx} 
              className="glass-effect border border-brand-100 p-6 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 pb-3 border-b border-brand-100/60">
                  <div className={`p-2.5 rounded-xl ${
                    r.color === 'brand' ? 'bg-brand-100 text-brand-600' :
                    r.color === 'accent' ? 'bg-accent-100 text-accent-600' :
                    r.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                    'bg-blue-100 text-blue-650'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">{r.title}</h3>
                    <p className="text-[10px] text-brand-800 font-sans">{r.subtitle}</p>
                  </div>
                </div>

                {/* Timeline display */}
                <div className="space-y-4 pt-4 relative pl-3.5 border-l border-brand-200/60 ml-3">
                  {r.steps.map((s, sidx) => (
                    <div key={sidx} className="relative space-y-0.5">
                      <div className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-white" />
                      <div className="flex items-center gap-1.5 text-[9px] font-display font-bold uppercase tracking-wide text-brand-600">
                        <Clock className="w-3 h-3" />
                        <span>{s.time}</span>
                      </div>
                      <h4 className="font-display text-xs font-bold text-slate-900">{s.step}</h4>
                      <p className="text-[11px] font-semibold text-brand-900">{s.prod}</p>
                      <p className="text-[10px] text-brand-800 leading-normal">{s.info}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
