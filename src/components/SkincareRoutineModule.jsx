import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Sun, Moon, Calendar, Snowflake, Sparkles, CheckCircle2, Circle, RefreshCw, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';

const DEFAULT_MORNING_STEPS = [
  { id: 'm1', step_number: 1, category: 'CLEANSER', step_name: 'Gentle Hydrating Gel Cleanser', instructions: 'Foam gently over damp skin for 60 seconds with lukewarm water.', recommended_ingredient: 'Ceramides & Zinc PCA' },
  { id: 'm2', step_number: 2, category: 'TREATMENT', step_name: 'Niacinamide 10% Clarifying Serum', instructions: 'Pat 3-4 drops evenly over face to regulate oil production and calm redness.', recommended_ingredient: 'Niacinamide (Vitamin B3)' },
  { id: 'm3', step_number: 3, category: 'MOISTURIZER', step_name: 'Lightweight Barrier Cream', instructions: 'Smooth nickel-sized amount over face and neck.', recommended_ingredient: 'Hyaluronic Acid & Squalane' },
  { id: 'm4', step_number: 4, category: 'SUN_PROTECTION', step_name: 'Broad-Spectrum Mineral Sunscreen SPF 50+', instructions: 'Apply two finger lengths generously as final morning step.', recommended_ingredient: 'Zinc Oxide 12%' }
];

const DEFAULT_EVENING_STEPS = [
  { id: 'e1', step_number: 1, category: 'CLEANSER', step_name: 'Double Cleansing Protocol', instructions: 'First melt away SPF & makeup with micellar oil, then wash with gentle gel cleanser.', recommended_ingredient: 'Jojoba Oil' },
  { id: 'e2', step_number: 2, category: 'TREATMENT', step_name: 'Cellular Repair Serum', instructions: 'Massage 3-4 drops into clean dry skin to support overnight renewal.', recommended_ingredient: 'Retinol / Peptides' },
  { id: 'e3', step_number: 3, category: 'MOISTURIZER', step_name: 'Deep Recovery Moisture Cream', instructions: 'Smooth rich moisturizing cream over face and neck.', recommended_ingredient: 'Ceramides AP/NP' },
  { id: 'e4', step_number: 4, category: 'NIGHT_CARE', step_name: 'Overnight Barrier Repair Mask', instructions: 'Apply thin layer to lock in hydration and prevent moisture loss overnight.', recommended_ingredient: 'Centella Asiatica (Cica)' }
];

const DEFAULT_WEEKLY_STEPS = [
  { id: 'w1', step_number: 1, category: 'EXFOLIATION', step_name: 'Mid-Week Chemical Exfoliation (Wednesday)', instructions: 'Apply BHA Salicylic 2% liquid exfoliant once weekly after cleansing. Leave 10 mins before moisturizer.', recommended_ingredient: 'Salicylic Acid 2%' },
  { id: 'w2', step_number: 2, category: 'MASK', step_name: 'Weekend Detox & Hydration Masking (Sunday)', instructions: 'Apply Kaolin Clay Mask to T-zone for 10 mins, followed by a Hydrating Bio-Cellulose Sheet Mask.', recommended_ingredient: 'French Green Clay & Hyaluronic Acid' },
  { id: 'w3', step_number: 3, category: 'TREATMENT', step_name: 'Weekly Lipid Barrier Repair (Friday)', instructions: 'Apply 3 drops of pure squalane oil over moisturizer to restore dry micro-cracks.', recommended_ingredient: '100% Plant Squalane' }
];

const DEFAULT_SEASONAL_STEPS = [
  { id: 's1', step_number: 1, category: 'SEASONAL_CARE', step_name: 'Summer Light Sebum Control Fluid', instructions: 'Switch to oil-free gel hydration during humid months to prevent clogged pores.', recommended_ingredient: 'Green Tea & Niacinamide', season: 'Summer' },
  { id: 's2', step_number: 2, category: 'SUN_PROTECTION', step_name: 'Summer SPF Reapplication Spray', instructions: 'Reapply SPF 50 mist every 2 hours when outdoors under summer sun.', recommended_ingredient: 'Broad-Spectrum UV Shield', season: 'Summer' }
];

const SkincareRoutineModule = ({ onToast }) => {
  const [activeTab, setActiveTab] = useState('MORNING'); // MORNING | EVENING | WEEKLY | SEASONAL
  const [routineData, setRoutineData] = useState({
    morning_routine: DEFAULT_MORNING_STEPS,
    evening_routine: DEFAULT_EVENING_STEPS,
    weekly_treatment: DEFAULT_WEEKLY_STEPS,
    seasonal_recommendations: DEFAULT_SEASONAL_STEPS,
    skin_type: 'Combination',
    season: 'Summer'
  });

  const [loading, setLoading] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);

  // Form State for Routine Generation
  const [genSkinType, setGenSkinType] = useState('Combination');
  const [genConcern, setGenConcern] = useState('Acne & Oil Control');
  const [genSeason, setGenSeason] = useState('Summer');

  // Track completed steps per day
  const [completedStepIds, setCompletedStepIds] = useState([]);

  const fetchRoutine = async () => {
    setLoading(true);
    try {
      const res = await apiService.getMyRoutine();
      if (res && (res.morning_routine || res.evening_routine)) {
        setRoutineData(res);
      }
    } catch (err) {
      console.warn("Using offline fallback routine data:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRoutine();
  }, []);

  const handleGenerateRoutine = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiService.generateRoutine({
        skin_type: genSkinType,
        primary_concern: genConcern,
        season: genSeason
      });
      if (res && res.morning_routine) {
        setRoutineData(res);
        if (onToast) onToast(`✨ AI Routine Generated for ${genSkinType} Skin (${genSeason})!`);
      }
    } catch (err) {
      if (onToast) onToast(`❌ Failed to generate routine: ${err?.detail || err?.message}`);
    } finally {
      setLoading(false);
      setShowGenModal(false);
    }
  };

  const toggleStepCompleted = (stepId, stepName) => {
    setCompletedStepIds((prev) => {
      const exists = prev.includes(stepId);
      const next = exists ? prev.filter((id) => id !== stepId) : [...prev, stepId];
      if (onToast) {
        onToast(exists ? `ℹ Step marked incomplete: ${stepName}` : `✔ Step completed: ${stepName}`);
      }
      return next;
    });
  };

  const getStepsForTab = () => {
    switch (activeTab) {
      case 'MORNING':
        return routineData.morning_routine || DEFAULT_MORNING_STEPS;
      case 'EVENING':
        return routineData.evening_routine || DEFAULT_EVENING_STEPS;
      case 'WEEKLY':
        return routineData.weekly_treatment || DEFAULT_WEEKLY_STEPS;
      case 'SEASONAL':
        return routineData.seasonal_recommendations || DEFAULT_SEASONAL_STEPS;
      default:
        return [];
    }
  };

  const currentSteps = getStepsForTab();
  const completedCount = currentSteps.filter((s) => completedStepIds.includes(s.id || `step-${s.step_number}`)).length;
  const progressPct = currentSteps.length > 0 ? Math.round((completedCount / currentSteps.length) * 100) : 0;

  return (
    <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
      {/* Header & Quick Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
            <span style={{ padding: '0.45rem', background: 'var(--primary-light)', borderRadius: '50%', color: 'var(--primary)', display: 'flex' }}>
              <Sparkles size={20} />
            </span>
            Personalized Skincare Routine Generator
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
            AI-generated daily, weekly &amp; seasonal skincare protocols tailored to your skin profile
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            onClick={() => setShowGenModal(true)}
            className="btn btn-primary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', borderRadius: '20px' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> <span>Generate New AI Routine</span>
          </button>
        </div>
      </div>

      {/* Routine Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('MORNING')}
          className={`btn ${activeTab === 'MORNING' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
        >
          <Sun size={15} style={{ color: activeTab === 'MORNING' ? '#fff' : '#F59E0B' }} /> Morning Routine
        </button>

        <button
          onClick={() => setActiveTab('EVENING')}
          className={`btn ${activeTab === 'EVENING' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
        >
          <Moon size={15} style={{ color: activeTab === 'EVENING' ? '#fff' : '#6366F1' }} /> Evening Routine
        </button>

        <button
          onClick={() => setActiveTab('WEEKLY')}
          className={`btn ${activeTab === 'WEEKLY' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
        >
          <Calendar size={15} style={{ color: activeTab === 'WEEKLY' ? '#fff' : '#10B981' }} /> Weekly Plan
        </button>

        <button
          onClick={() => setActiveTab('SEASONAL')}
          className={`btn ${activeTab === 'SEASONAL' ? 'btn-primary' : 'btn-outline'}`}
          style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
        >
          <Snowflake size={15} style={{ color: activeTab === 'SEASONAL' ? '#fff' : '#3B82F6' }} /> Seasonal Guide
        </button>
      </div>

      {/* Flow Diagram Visualizer */}
      <div style={{ background: 'var(--input-bg)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
          ROUTINE SEQUENCE FLOW
        </div>

        {activeTab === 'MORNING' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.82rem', fontWeight: 700 }}>
            <span style={{ padding: '0.35rem 0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '20px' }}>Morning</span>
            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', borderRadius: '20px' }}>Cleanser</span>
            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(139, 92, 246, 0.12)', color: 'var(--accent)', borderRadius: '20px' }}>Treatment</span>
            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', borderRadius: '20px' }}>Moisturizer</span>
            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', borderRadius: '20px' }}>Sunscreen</span>
          </div>
        )}

        {activeTab === 'EVENING' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.82rem', fontWeight: 700 }}>
            <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(99, 102, 241, 0.15)', color: '#6366F1', borderRadius: '20px' }}>Evening</span>
            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', borderRadius: '20px' }}>Cleanser</span>
            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(139, 92, 246, 0.12)', color: 'var(--accent)', borderRadius: '20px' }}>Treatment</span>
            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', borderRadius: '20px' }}>Moisturizer</span>
            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(236, 72, 153, 0.12)', color: '#EC4899', borderRadius: '20px' }}>Night Care</span>
          </div>
        )}

        {activeTab === 'WEEKLY' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.82rem', fontWeight: 700 }}>
            <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(249, 115, 22, 0.12)', color: '#F97316', borderRadius: '20px' }}>Wed Exfoliation</span>
            <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', borderRadius: '20px' }}>Fri Lipid Repair</span>
            <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(139, 92, 246, 0.12)', color: 'var(--accent)', borderRadius: '20px' }}>Sun Clay/Sheet Mask</span>
          </div>
        )}

        {activeTab === 'SEASONAL' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.82rem', fontWeight: 700 }}>
            <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', borderRadius: '20px' }}>Season: {routineData.season || 'Summer'}</span>
            <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(34, 197, 94, 0.12)', color: 'var(--success)', borderRadius: '20px' }}>Climate Adaptation &amp; UV Shield</span>
          </div>
        )}

        {/* Progress Bar for Active Routine */}
        <div style={{ marginTop: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>
            <span>COMPLETED STEPS TODAY: {completedCount} / {currentSteps.length}</span>
            <span>{progressPct}%</span>
          </div>
          <div style={{ height: '6px', borderRadius: '3px', background: 'var(--border-color)', overflow: 'hidden' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>
      </div>

      {/* Routine Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {currentSteps.map((step, idx) => {
          const stepKey = step.id || `step-${step.step_number}`;
          const isDone = completedStepIds.includes(stepKey);

          return (
            <div
              key={stepKey}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                background: isDone ? 'rgba(34, 197, 94, 0.06)' : 'var(--input-bg)',
                borderRadius: 'var(--radius-md)',
                border: isDone ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--border-color)',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Interactive Completion Toggle */}
              <button
                onClick={() => toggleStepCompleted(stepKey, step.step_name)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '2px', color: isDone ? 'var(--success)' : 'var(--text-muted)' }}
                title={isDone ? "Mark incomplete" : "Mark step complete"}
              >
                {isDone ? <CheckCircle2 size={22} /> : <Circle size={22} />}
              </button>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.55rem', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                      STEP {step.step_number || idx + 1} • {step.category}
                    </span>
                    {step.created_by_role && step.created_by_role !== 'SYSTEM_AI' && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <ShieldCheck size={12} /> {step.created_by_role} PRESCRIBED
                      </span>
                    )}
                  </div>

                  {step.recommended_ingredient && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)', background: 'rgba(14, 165, 233, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '8px' }}>
                      Key Ingredient: {step.recommended_ingredient}
                    </span>
                  )}
                </div>

                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 0.35rem 0', color: isDone ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>
                  {step.step_name}
                </h4>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                  {step.instructions}
                </p>

                {step.doctor_notes && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px', borderLeft: '3px solid var(--warning)', fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                    <strong style={{ color: 'var(--warning)' }}>Doctor Note:</strong> {step.doctor_notes}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Routine Generation Modal */}
      {showGenModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} className="text-primary" /> Generate AI Skincare Routine
              </h3>
              <button onClick={() => setShowGenModal(false)} className="btn btn-outline btn-sm">✕</button>
            </div>

            <form onSubmit={handleGenerateRoutine} className="form-container">
              <div className="form-group">
                <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Skin Type</label>
                <select value={genSkinType} onChange={(e) => setGenSkinType(e.target.value)}>
                  <option value="Oily">Oily Skin</option>
                  <option value="Dry">Dry Skin</option>
                  <option value="Combination">Combination Skin</option>
                  <option value="Sensitive">Sensitive Skin</option>
                  <option value="Normal">Normal Skin</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Primary Skin Concern</label>
                <select value={genConcern} onChange={(e) => setGenConcern(e.target.value)}>
                  <option value="Acne Breakouts & Oiliness">Acne Breakouts &amp; Oiliness</option>
                  <option value="Hyperpigmentation & Dark Spots">Hyperpigmentation &amp; Dark Spots</option>
                  <option value="Dryness & Barrier Damage">Dryness &amp; Barrier Damage</option>
                  <option value="Fine Lines & Wrinkles">Fine Lines &amp; Wrinkles</option>
                  <option value="Redness & Sensitivity">Redness &amp; Sensitivity</option>
                  <option value="General Maintenance">General Maintenance</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Current Season</label>
                <select value={genSeason} onChange={(e) => setGenSeason(e.target.value)}>
                  <option value="Summer">Summer (UV &amp; Sebum Control)</option>
                  <option value="Winter">Winter (Deep Cold Hydration &amp; Barrier)</option>
                  <option value="Spring">Spring (Brightening &amp; Cell Renewal)</option>
                  <option value="Autumn">Autumn (Post-Summer Recovery)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowGenModal(false)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2 }}>
                  {loading ? 'Generating...' : 'Generate 4 Skincare Plans'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkincareRoutineModule;
