import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  Sparkles, Sun, Moon, CheckCircle2, Circle, Plus, Activity, Sliders, Zap
} from 'lucide-react';
import { MOCK_USER_PROFILE, MOCK_PRODUCTS } from '../data/mockData';

export default function UserDashboard() {
  const profile = MOCK_USER_PROFILE;
  
  // STRICTLY THE 5 REQUESTED USER FEATURES:
  // 1. Skin health score
  // 2. Personalized routine
  // 3. Product recommendations
  // 4. Progress tracking
  // 5. Daily skincare checklist
  const [activeTab, setActiveTab] = useState('score'); 
  
  const [productCategory, setProductCategory] = useState('All');

  // Interactive Scoring Calculator State
  const [scores, setScores] = useState({
    condition: profile.scores.condition,
    lifestyle: profile.scores.lifestyle,
    sleep: profile.scores.sleep,
    consistency: profile.scores.routineConsistency,
    hydration: profile.scores.hydration
  });

  // Calculate Weighted Skin Health Score: 35% Condition + 20% Lifestyle + 15% Sleep + 20% Consistency + 10% Hydration
  const liveScore = (
    scores.condition * 0.35 +
    scores.lifestyle * 0.20 +
    scores.sleep * 0.15 +
    scores.consistency * 0.20 +
    scores.hydration * 0.10
  ).toFixed(1);

  // Morning Checklist State
  const [morningSteps, setMorningSteps] = useState([
    { id: 1, text: 'Gentle Amino Acid Cleanser', sub: 'Cleansing (pH 5.5)', done: true },
    { id: 2, text: 'Radiance B3 + Zinc Serum (Niacinamide 10%)', sub: 'Treatment & Sebum Control', done: true },
    { id: 3, text: 'Ceramide Barrier Moisture Cream', sub: 'Moisturizing & Barrier Repair', done: false },
    { id: 4, text: 'Invisible Sunscreen Fluid SPF 50+ PA++++', sub: 'Sun Protection (Mandatory)', done: false },
  ]);

  // Evening Checklist State
  const [eveningSteps, setEveningSteps] = useState([
    { id: 1, text: 'Micellar Oil Cleanser + Gentle Wash', sub: 'Double Cleansing', done: true },
    { id: 2, text: 'Overnight Micro-Encapsulated Retinol 0.5%', sub: 'Cellular Renewal (3x / week)', done: false },
    { id: 3, text: 'Ceramide Moisture Surge Cream', sub: 'Night Repair & Moisture Lock', done: false },
  ]);

  // Routine Generator Form state
  const [genTarget, setGenTarget] = useState({
    concern: 'Acne Scars & Hyperpigmentation',
    season: 'Monsoon / High Humidity'
  });
  const [generatedRoutine, setGeneratedRoutine] = useState({
    title: 'Active Skin Barrier & Anti-Hyperpigmentation Protocol',
    climateNote: 'Optimized for High Humidity (78% Moisture)',
    morning: [
      'Amino Acid Foaming Cleanser (pH 5.5 balanced)',
      '10% Niacinamide + 1% Zinc PCA Radiance Serum',
      'Lightweight Oil-Free Gel Hydrator',
      'Broad-Spectrum Fluid Sunscreen SPF 50+ PA++++'
    ],
    evening: [
      'Squalane Cleansing Butter (Double Cleanse Step 1)',
      'Gentle Hydrating Cleanser (Double Cleanse Step 2)',
      'Encapsulated Retinol 0.5% Night Serum',
      'Multi-Peptide & Ceramide Lipid Repair Cream'
    ]
  });

  // 30-Day Trend Data for Recharts
  const trendData = [
    { day: 'Day 1', score: 68 },
    { day: 'Day 5', score: 71 },
    { day: 'Day 10', score: 74 },
    { day: 'Day 15', score: 76 },
    { day: 'Day 20', score: 79 },
    { day: 'Day 25', score: 81 },
    { day: 'Today', score: Number(liveScore) },
  ];

  // Radar Data for Assessment
  const radarData = [
    { subject: 'Condition (35%)', A: scores.condition, fullMark: 100 },
    { subject: 'Lifestyle (20%)', A: scores.lifestyle, fullMark: 100 },
    { subject: 'Sleep (15%)', A: scores.sleep, fullMark: 100 },
    { subject: 'Consistency (20%)', A: scores.consistency, fullMark: 100 },
    { subject: 'Hydration (10%)', A: scores.hydration, fullMark: 100 },
  ];

  const toggleStep = (type, id) => {
    let steps = type === 'morning' ? [...morningSteps] : [...eveningSteps];
    const idx = steps.findIndex(s => s.id === id);
    steps[idx].done = !steps[idx].done;
    
    if (type === 'morning') setMorningSteps(steps);
    else setEveningSteps(steps);

    const allMorningDone = (type === 'morning' ? steps : morningSteps).every(s => s.done);
    const allEveningDone = (type === 'evening' ? steps : eveningSteps).every(s => s.done);
    if (allMorningDone && allEveningDone) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  };

  const handleGenerateRoutine = (e) => {
    e.preventDefault();
    setGeneratedRoutine({
      title: `AI Routine Protocol for ${genTarget.concern}`,
      climateNote: `Optimized for ${genTarget.season}`,
      morning: [
        'Amino Acid Foaming Cleanser (pH 5.5 balanced)',
        '10% Niacinamide + 1% Zinc PCA Radiance Serum',
        'Lightweight Oil-Free Gel Hydrator',
        'Broad-Spectrum Fluid Sunscreen SPF 50+ PA++++'
      ],
      evening: [
        'Squalane Cleansing Butter (Double Cleanse Step 1)',
        'Gentle Hydrating Cleanser (Double Cleanse Step 2)',
        'Azelaic Acid 10% Gel (Alternating Evenings)',
        'Multi-Peptide & Ceramide Lipid Repair Cream'
      ]
    });
  };

  const filteredProducts = MOCK_PRODUCTS.filter(p => 
    productCategory === 'All' || p.category === productCategory
  );

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 20px' }}>
      
      {/* USER PROFILE HEADER - DAY THEME */}
      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img 
            src={profile.avatar} 
            alt={profile.name} 
            style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid #2563eb', objectFit: 'cover' }} 
          />
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>{profile.name}</h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Skin Type: <span className="badge badge-cyan">{profile.skinType}</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Skin Health Score</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb' }}>{liveScore} / 100</div>
        </div>
      </div>

      {/* DAY THEME 5-TAB NAVIGATION */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', overflowX: 'auto' }}>
        <button className={`tab-btn ${activeTab === 'score' ? 'active' : ''}`} onClick={() => setActiveTab('score')}>
          <Sliders size={16} /> 1. Skin Health Score
        </button>
        <button className={`tab-btn ${activeTab === 'routine' ? 'active' : ''}`} onClick={() => setActiveTab('routine')}>
          <Sparkles size={16} /> 2. Personalized Routine
        </button>
        <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
          <Zap size={16} /> 3. Product Recommendations
        </button>
        <button className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => setActiveTab('progress')}>
          <Activity size={16} /> 4. Progress Tracking
        </button>
        <button className={`tab-btn ${activeTab === 'checklist' ? 'active' : ''}`} onClick={() => setActiveTab('checklist')}>
          <CheckCircle2 size={16} /> 5. Daily Skincare Checklist
        </button>
      </div>

      {/* 1. SKIN HEALTH SCORE */}
      {activeTab === 'score' && (
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Skin Health Score Engine</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Evaluated score based on weighted skin condition assessment, lifestyle, sleep, consistency, and hydration.
              </p>
            </div>
            <div style={{ textAlign: 'right', background: '#eff6ff', padding: '12px 20px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Score Output</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#2563eb', lineHeight: 1 }}>{liveScore}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'center' }}>
            <div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                  <span>Skin Condition Assessment (35%)</span>
                  <span style={{ fontWeight: 700, color: '#2563eb' }}>{scores.condition}/100</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={scores.condition} 
                  onChange={(e) => setScores({...scores, condition: Number(e.target.value)})}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                  <span>Lifestyle Habits (20%)</span>
                  <span style={{ fontWeight: 700, color: '#7c3aed' }}>{scores.lifestyle}/100</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={scores.lifestyle} 
                  onChange={(e) => setScores({...scores, lifestyle: Number(e.target.value)})}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                  <span>Sleep Quality (15%)</span>
                  <span style={{ fontWeight: 700, color: '#0284c7' }}>{scores.sleep}/100</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={scores.sleep} 
                  onChange={(e) => setScores({...scores, sleep: Number(e.target.value)})}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                  <span>Routine Consistency (20%)</span>
                  <span style={{ fontWeight: 700, color: '#059669' }}>{scores.consistency}/100</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={scores.consistency} 
                  onChange={(e) => setScores({...scores, consistency: Number(e.target.value)})}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                  <span>Hydration Level (10%)</span>
                  <span style={{ fontWeight: 700, color: '#d97706' }}>{scores.hydration}/100</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={scores.hydration} 
                  onChange={(e) => setScores({...scores, hydration: Number(e.target.value)})}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-glass)', fontSize: '0.85rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#2563eb', marginBottom: '10px' }}>Weighted Calculation Model</h4>
              <p style={{ color: 'var(--text-muted)', marginBottom: '14px' }}>
                (0.35 × Condition) + (0.20 × Lifestyle) + (0.15 × Sleep) + (0.20 × Consistency) + (0.10 × Hydration)
              </p>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
                Calculated Score: {liveScore} / 100
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PERSONALIZED ROUTINE */}
      {activeTab === 'routine' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '10px' }}>Personalized Routine Generator</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>
              Select target skin concern to generate a personalized skincare routine.
            </p>

            <form onSubmit={handleGenerateRoutine} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Primary Concern</label>
                <select 
                  value={genTarget.concern}
                  onChange={(e) => setGenTarget({...genTarget, concern: e.target.value})}
                  style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#0f172a' }}
                >
                  <option value="Acne Scars & Hyperpigmentation">Acne Scars & Hyperpigmentation</option>
                  <option value="Active Inflammatory Acne">Active Inflammatory Acne</option>
                  <option value="Dehydration & Barrier Repair">Dehydration & Barrier Repair</option>
                  <option value="Anti-Aging & Fine Lines">Anti-Aging & Fine Lines</option>
                </select>
              </div>

              <button type="submit" className="btn-primary">
                <Zap size={15} /> Generate Routine
              </button>
            </form>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '2px' }}>{generatedRoutine.title}</h3>
            <div style={{ fontSize: '0.82rem', color: '#0284c7', marginBottom: '14px' }}>{generatedRoutine.climateNote}</div>

            <div style={{ marginBottom: '14px' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#d97706', marginBottom: '6px' }}>☀️ Morning Routine:</h4>
              <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {generatedRoutine.morning.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', color: '#7c3aed', marginBottom: '6px' }}>🌙 Evening Routine:</h4>
              <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {generatedRoutine.evening.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 3. PRODUCT RECOMMENDATIONS */}
      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Product Recommendations</h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['All', 'Face Wash', 'Moisturizer', 'Sunscreen', 'Serum', 'Night Treatment'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setProductCategory(cat)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    background: productCategory === cat ? '#2563eb' : '#ffffff',
                    border: '1px solid var(--border-glass)',
                    color: productCategory === cat ? '#ffffff' : '#475569',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            {filteredProducts.map(prod => (
              <div key={prod.id} className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <img src={prod.imageUrl} alt={prod.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="badge badge-emerald">{prod.suitabilityScore}% Match</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{prod.brand}</span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }}>{prod.name}</h4>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '10px', marginTop: '10px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800 }}>{prod.price}</div>
                  <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.78rem' }}>
                    <Plus size={13} /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PROGRESS TRACKING */}
      {activeTab === 'progress' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Progress Tracking</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '14px' }}>30-Day Skin Health Score Trajectory</h4>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <XAxis dataKey="day" stroke="#64748b" />
                    <YAxis stroke="#64748b" domain={[50, 100]} />
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1' }} />
                    <Area type="monotone" dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '14px' }}>Skin Health Parameter Breakdown</h4>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis dataKey="subject" stroke="#64748b" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                    <Radar name="Score" dataKey="A" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. DAILY SKINCARE CHECKLIST */}
      {activeTab === 'checklist' && (
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '14px' }}>Daily Skincare Checklist</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sun color="#d97706" /> Morning Checklist (AM)
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {morningSteps.map(step => (
                  <div 
                    key={step.id} 
                    onClick={() => toggleStep('morning', step.id)}
                    style={{ 
                      padding: '10px 14px', 
                      borderRadius: '6px', 
                      background: step.done ? '#ecfdf5' : '#f8fafc', 
                      border: step.done ? '1px solid #a7f3d0' : '1px solid var(--border-glass)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between'
                    }}
                  >
                    <div style={{ fontWeight: 500, fontSize: '0.88rem', textDecoration: step.done ? 'line-through' : 'none', color: step.done ? '#64748b' : '#0f172a' }}>
                      {step.text}
                    </div>
                    {step.done ? <CheckCircle2 color="#059669" size={16} /> : <Circle color="#94a3b8" size={16} />}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Moon color="#7c3aed" /> Evening Checklist (PM)
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {eveningSteps.map(step => (
                  <div 
                    key={step.id} 
                    onClick={() => toggleStep('evening', step.id)}
                    style={{ 
                      padding: '10px 14px', 
                      borderRadius: '6px', 
                      background: step.done ? '#f3e8ff' : '#f8fafc', 
                      border: step.done ? '1px solid #e9d5ff' : '1px solid var(--border-glass)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between'
                    }}
                  >
                    <div style={{ fontWeight: 500, fontSize: '0.88rem', textDecoration: step.done ? 'line-through' : 'none', color: step.done ? '#64748b' : '#0f172a' }}>
                      {step.text}
                    </div>
                    {step.done ? <CheckCircle2 color="#7c3aed" size={16} /> : <Circle color="#94a3b8" size={16} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
