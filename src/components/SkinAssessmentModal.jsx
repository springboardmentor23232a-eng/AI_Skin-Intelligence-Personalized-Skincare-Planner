import React, { useState } from 'react';
import { Sparkles, X, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SkinAssessmentModal({ onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    skinType: 'Combination',
    concerns: [],
    sleepHours: '7-8 hours',
    waterIntake: '2-3 Liters'
  });

  const concernsList = ['Acne / Breakouts', 'Hyperpigmentation & Dark Spots', 'Dryness / Flaking', 'Wrinkles & Fine Lines', 'Redness / Sensitivity', 'Uneven Texture'];

  const toggleConcern = (item) => {
    if (answers.concerns.includes(item)) {
      setAnswers({ ...answers, concerns: answers.concerns.filter(c => c !== item) });
    } else {
      setAnswers({ ...answers, concerns: [...answers.concerns, item] });
    }
  };

  const handleFinish = () => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    onComplete();
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card" style={{ maxWidth: '580px', width: '100%', padding: '36px', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        {/* STEP 1: SKIN TYPE */}
        {step === 1 && (
          <div>
            <div className="badge badge-pink" style={{ marginBottom: '12px' }}>Step 1 of 3</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>What best describes your skin type?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Select your primary natural skin behavior.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'].map(type => (
                <button
                  key={type}
                  onClick={() => setAnswers({ ...answers, skinType: type })}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    textAlign: 'left',
                    background: answers.skinType === type ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: answers.skinType === type ? '1px solid var(--accent-pink)' : '1px solid var(--border-glass)',
                    color: answers.skinType === type ? '#fff' : 'var(--text-muted)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {type} Skin
                </button>
              ))}
            </div>

            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStep(2)}>
              Next: Select Concerns <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: CONCERNS */}
        {step === 2 && (
          <div>
            <div className="badge badge-purple" style={{ marginBottom: '12px' }}>Step 2 of 3</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Select your target skin concerns</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Choose all that apply for AI routine targeting.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {concernsList.map(c => (
                <button
                  key={c}
                  onClick={() => toggleConcern(c)}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    textAlign: 'left',
                    background: answers.concerns.includes(c) ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: answers.concerns.includes(c) ? '1px solid var(--accent-purple)' : '1px solid var(--border-glass)',
                    color: answers.concerns.includes(c) ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>
                Back
              </button>
              <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={() => setStep(3)}>
                Next: Lifestyle <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LIFESTYLE & SUMMARY */}
        {step === 3 && (
          <div>
            <div className="badge badge-emerald" style={{ marginBottom: '12px' }}>Step 3 of 3</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>AI Assessment Complete!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Your profile has been analyzed. Estimated Initial Skin Health Score: <strong style={{ color: 'var(--accent-emerald)' }}>84.5 / 100</strong>
            </p>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.88rem' }}>
              <div style={{ marginBottom: '6px' }}>• <strong>Skin Type:</strong> {answers.skinType}</div>
              <div>• <strong>Primary Focus:</strong> {answers.concerns.length > 0 ? answers.concerns.join(', ') : 'General Maintenance'}</div>
            </div>

            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleFinish}>
              <Sparkles size={16} /> View My Personalized Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
