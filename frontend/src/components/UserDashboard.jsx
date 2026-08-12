import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  Sparkles, Sun, Moon, CheckCircle2, Circle, Plus, Activity, Sliders, Zap, User, Camera
} from 'lucide-react';
import { MOCK_USER_PROFILE } from '../data/mockData';
import SkinAssessmentFlow from './SkinAssessmentFlow';

const API_BASE = 'http://127.0.0.1:8000';

export default function UserDashboard() {
  const [userProfile, setUserProfile] = useState(MOCK_USER_PROFILE);
  const [profileForm, setProfileForm] = useState({ name: '', skinType: '' });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('derm_ai_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUserProfile({ ...MOCK_USER_PROFILE, name: u.name, skinType: u.skinType || 'Combination' });
        setProfileForm({ name: u.name, skinType: u.skinType || 'Combination' });
      } catch (e) {}
    }
  }, []);
  
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
    condition: userProfile.scores?.condition || 85,
    lifestyle: userProfile.scores?.lifestyle || 70,
    sleep: userProfile.scores?.sleep || 65,
    consistency: userProfile.scores?.routineConsistency || 90,
    hydration: userProfile.scores?.hydration || 80
  });

  const [liveScore, setLiveScore] = useState(81.65);

  // Backend Products State
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Morning & Evening Checklist State
  const [checklist, setChecklist] = useState({
    morning: [
      { id: 1, text: 'Gentle Amino Acid Cleanser', done: true },
      { id: 2, text: 'Radiance B3 + Zinc Serum (Niacinamide 10%)', done: true },
      { id: 3, text: 'Ceramide Barrier Moisture Cream', done: false },
      { id: 4, text: 'Invisible Sunscreen Fluid SPF 50+ PA++++', done: false }
    ],
    evening: [
      { id: 1, text: 'Micellar Oil Cleanser + Gentle Wash', done: true },
      { id: 2, text: 'Overnight Retinol 0.5% Night Cream', done: false },
      { id: 3, text: 'Ceramide Moisture Surge Cream', done: false }
    ]
  });

  // Routine Generator Form state
  const [genTarget, setGenTarget] = useState({
    concern: 'Acne Scars & Hyperpigmentation',
    season: 'Monsoon / High Humidity'
  });
  const [isGenerating, setIsGenerating] = useState(false);
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

  // 1. Recalculate score via Backend API
  useEffect(() => {
    fetch(`${API_BASE}/api/user/calculate-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scores)
    })
      .then(res => res.json())
      .then(data => {
        if (data.calculatedScore) setLiveScore(data.calculatedScore);
      })
      .catch(() => {
        // Fallback local calculation
        const local = scores.condition * 0.35 + scores.lifestyle * 0.20 + scores.sleep * 0.15 + scores.consistency * 0.20 + scores.hydration * 0.10;
        setLiveScore(Number(local.toFixed(2)));
      });
  }, [scores]);

  // 2. Fetch Products via Backend API
  useEffect(() => {
    setIsLoadingProducts(true);
    fetch(`${API_BASE}/api/user/products?category=${encodeURIComponent(productCategory)}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setIsLoadingProducts(false);
      })
      .catch(() => setIsLoadingProducts(false));
  }, [productCategory]);

  // 3. Fetch Checklist State
  useEffect(() => {
    fetch(`${API_BASE}/api/user/checklist`)
      .then(res => res.json())
      .then(data => {
        if (data.morning) setChecklist(data);
      })
      .catch(() => {});
  }, []);

  const toggleStep = (type, id) => {
    fetch(`${API_BASE}/api/user/checklist/toggle?step_type=${type}&step_id=${id}`, { method: 'POST' })
      .then(() => {
        const steps = [...checklist[type]];
        const idx = steps.findIndex(s => s.id === id);
        steps[idx].done = !steps[idx].done;
        setChecklist({ ...checklist, [type]: steps });

        const allMorning = (type === 'morning' ? steps : checklist.morning).every(s => s.done);
        const allEvening = (type === 'evening' ? steps : checklist.evening).every(s => s.done);
        if (allMorning && allEvening) {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }
      })
      .catch(() => {});
  };

  const handleGenerateRoutine = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    fetch(`${API_BASE}/api/user/routine/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(genTarget)
    })
      .then(res => res.json())
      .then(data => {
        setGeneratedRoutine(data);
        setIsGenerating(false);
      })
      .catch(() => setIsGenerating(false));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMsg(null);
    const token = localStorage.getItem('derm_ai_jwt_token');
    
    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Update failed');
      
      setUserProfile({ ...userProfile, name: data.user.name, skinType: data.user.skin_type });
      localStorage.setItem('derm_ai_user', JSON.stringify({ ...JSON.parse(localStorage.getItem('derm_ai_user') || '{}'), name: data.user.name, skinType: data.user.skin_type }));
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setIsUpdatingProfile(false);
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
      setIsUpdatingProfile(false);
    }
  };

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

  const radarData = [
    { subject: 'Condition (35%)', A: scores.condition, fullMark: 100 },
    { subject: 'Lifestyle (20%)', A: scores.lifestyle, fullMark: 100 },
    { subject: 'Sleep (15%)', A: scores.sleep, fullMark: 100 },
    { subject: 'Consistency (20%)', A: scores.consistency, fullMark: 100 },
    { subject: 'Hydration (10%)', A: scores.hydration, fullMark: 100 },
  ];

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 20px' }}>
      
      {/* USER PROFILE HEADER */}
      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img 
            src={userProfile.avatar} 
            alt={userProfile.name} 
            style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid #2563eb', objectFit: 'cover' }} 
          />
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>{userProfile.name}</h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Skin Type: <span className="badge badge-cyan">{userProfile.skinType}</span> • Live Sync ⚡
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Live Skin Health Score</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb' }}>{liveScore} / 100</div>
        </div>
      </div>

      {/* STRICT 5-TAB NAVIGATION */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', overflowX: 'auto' }}>
        <button className={`tab-btn ${activeTab === 'assessment' ? 'active' : ''}`} onClick={() => setActiveTab('assessment')}>
          <Camera size={16} /> AI Face Assessment
        </button>
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

      {/* AI SKIN ASSESSMENT */}
      {activeTab === 'assessment' && (
        <SkinAssessmentFlow onComplete={(result) => {
          setLiveScore(result.skin_health_score);
          setActiveTab('score');
        }} />
      )}

      {/* 1. SKIN HEALTH SCORE */}
      {activeTab === 'score' && (
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Skin Health Score Engine</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Evaluated score computed dynamically by our intelligence engine.
              </p>
            </div>
            <div style={{ textAlign: 'right', background: '#eff6ff', padding: '12px 20px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Calculated Score</div>
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
              <h4 style={{ fontSize: '0.95rem', color: '#2563eb', marginBottom: '10px' }}>Advanced Analysis</h4>
              <p style={{ color: 'var(--text-muted)', marginBottom: '14px' }}>
                Data synchronized and verified.
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
              Uses our clinical intelligence engine to generate a custom routine.
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

              <button type="submit" className="btn-primary" disabled={isGenerating}>
                <Zap size={15} /> {isGenerating ? 'Generating via AI...' : 'Generate Personalized Routine'}
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

          {isLoadingProducts ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Finding the perfect products for you...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
              {products.map(prod => (
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
          )}
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
                {checklist.morning.map(step => (
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
                {checklist.evening.map(step => (
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
