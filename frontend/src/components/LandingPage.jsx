import React, { useState } from 'react';
import { 
  Sparkles, ShieldCheck, Cpu, Zap, Activity, Award, ArrowRight, 
  CheckCircle2, Droplets, Sun, Moon, FlaskConical, Stethoscope, 
  UserCheck, Layers, ChevronRight, BarChart3, HeartPulse, Lock, Key
} from 'lucide-react';

export default function LandingPage({ onSelectRole, onOpenQuiz, onOpenAuth }) {
  const [sliderVals, setSliderVals] = useState({
    condition: 75,
    lifestyle: 80,
    sleep: 70,
    consistency: 85,
    hydration: 90
  });

  // Calculate Weighted Score: 35% Condition + 20% Lifestyle + 15% Sleep + 20% Consistency + 10% Hydration
  const calculatedScore = (
    sliderVals.condition * 0.35 +
    sliderVals.lifestyle * 0.20 +
    sliderVals.sleep * 0.15 +
    sliderVals.consistency * 0.20 +
    sliderVals.hydration * 0.10
  ).toFixed(1);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* HERO SECTION */}
      <section style={{ 
        position: 'relative', 
        padding: '90px 24px 70px', 
        overflow: 'hidden', 
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 20%, rgba(236, 72, 153, 0.15) 0%, rgba(139, 92, 246, 0.08) 35%, transparent 70%)'
      }}>
        {/* Background Decorative Blurs */}
        <div style={{
          position: 'absolute', top: '10%', left: '15%', width: '300px', height: '300px',
          background: 'rgba(236, 72, 153, 0.12)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', top: '25%', right: '15%', width: '350px', height: '350px',
          background: 'rgba(6, 182, 212, 0.12)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div className="badge badge-pink" style={{ marginBottom: '24px', padding: '6px 16px' }}>
            <Sparkles size={14} /> Next-Gen AI Skincare Intelligence Platform
          </div>

          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 4.2rem)', 
            fontWeight: 800, 
            lineHeight: 1.1, 
            marginBottom: '24px' 
          }}>
            Precision Skincare, Powered by <br />
            <span className="gradient-text">Clinical Artificial Intelligence</span>
          </h1>

          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-muted)', 
            maxWidth: '780px', 
            margin: '0 auto 40px',
            fontWeight: 400
          }}>
            Analyze skin parameters, lifestyle metrics, sleep quality, and environmental micro-climates. 
            Generate AI-recommended routines, ingredient safety profiles, and clinical progress tracking.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '50px' }}>
            <button className="btn-primary" onClick={onOpenQuiz} style={{ fontSize: '1.05rem', padding: '14px 28px' }}>
              <Zap size={18} /> Start Free AI Assessment
            </button>
          </div>

          {/* Key Metrics Ribbon */}
          <div className="glass-card" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '24px', 
            padding: '28px',
            textAlign: 'left'
          }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-pink)' }}>98.4%</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>AI Skin Classification Accuracy</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-purple)' }}>15,000+</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Clinical Routines</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>Bank-Grade</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Security & Privacy Control</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>4 Dashboards</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>User, Consultant, Derm & Admin</div>
            </div>
          </div>
        </div>
      </section>



      {/* ROLE EXPLORER SECTION */}
      <section style={{ padding: '60px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div className="badge badge-purple" style={{ marginBottom: '12px' }}>Role-Based Architecture</div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 700 }}>Explore Role Dashboards</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Experience the platform from any user perspective</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '28px', cursor: 'pointer' }} onClick={() => onSelectRole('User')}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-pink)', marginBottom: '20px' }}>
              <UserCheck size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>Consumer / User</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Skin health score, personalized routines, product recommendations, progress tracking, and daily checklist.
            </p>
            <span style={{ color: 'var(--accent-pink)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Open User Dashboard <ChevronRight size={16} />
            </span>
          </div>

          <div className="glass-card" style={{ padding: '28px', cursor: 'pointer' }} onClick={() => onSelectRole('Consultant')}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple)', marginBottom: '20px' }}>
              <FlaskConical size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>Skincare Consultant</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Client profiles, skin assessment reports, progress monitoring, and recommendation management.
            </p>
            <span style={{ color: 'var(--accent-purple)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Open Consultant Portal <ChevronRight size={16} />
            </span>
          </div>

          <div className="glass-card" style={{ padding: '28px', cursor: 'pointer' }} onClick={() => onSelectRole('Dermatologist')}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)', marginBottom: '20px' }}>
              <Stethoscope size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>Dermatologist</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Patient insights, skin condition pathology reports, treatment recommendations, and progress analytics.
            </p>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Open Clinical Suite <ChevronRight size={16} />
            </span>
          </div>

          <div className="glass-card" style={{ padding: '28px', cursor: 'pointer' }} onClick={() => onSelectRole('Admin')}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)', marginBottom: '20px' }}>
              <Cpu size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>Administrator</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              User management, platform analytics, recommendation monitoring, and system audit reports.
            </p>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Open Admin Console <ChevronRight size={16} />
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
