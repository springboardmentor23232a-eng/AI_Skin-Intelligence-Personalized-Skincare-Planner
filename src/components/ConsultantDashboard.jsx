import React, { useState } from 'react';
import { MOCK_CLIENTS_CONSULTANT } from '../data/mockData';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  UserCheck, FileText, Activity, Sliders, Search, CheckCircle2, FlaskConical
} from 'lucide-react';

export default function ConsultantDashboard() {
  const [clients] = useState(MOCK_CLIENTS_CONSULTANT);
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  
  // STRICTLY THE 4 REQUESTED CONSULTANT FEATURES:
  // 1. Client profiles
  // 2. Skin assessment reports
  // 3. Progress monitoring
  // 4. Recommendation management
  const [activeTab, setActiveTab] = useState('profiles'); 
  const [search, setSearch] = useState('');
  
  const [recommendationNote, setRecommendationNote] = useState(
    'Client is responding well to Niacinamide 10%. Recommending ramp-up of Encapsulated Retinol 0.5% starting twice weekly.'
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.primaryConcern.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveRecommendation = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const clientProgressTrend = [
    { week: 'Week 1', score: 62 },
    { week: 'Week 2', score: 66 },
    { week: 'Week 3', score: 70 },
    { week: 'Week 4', score: selectedClient.skinScore },
  ];

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 20px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>Consultant Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Client Profiles, Skin Assessment Reports, Progress Monitoring, & Recommendation Management.</p>
        </div>
        <span className="badge badge-purple" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
          <FlaskConical size={15} /> Consultant Suite
        </span>
      </div>

      {/* DAY THEME 4-TAB NAVIGATION */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <button className={`tab-btn ${activeTab === 'profiles' ? 'active' : ''}`} onClick={() => setActiveTab('profiles')}>
          <UserCheck size={16} /> 1. Client Profiles
        </button>
        <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
          <FileText size={16} /> 2. Skin Assessment Reports
        </button>
        <button className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => setActiveTab('progress')}>
          <Activity size={16} /> 3. Progress Monitoring
        </button>
        <button className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`} onClick={() => setActiveTab('recommendations')}>
          <Sliders size={16} /> 4. Recommendation Management
        </button>
      </div>

      {/* 1. CLIENT PROFILES */}
      {activeTab === 'profiles' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type="text" 
                placeholder="Search clients..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 8px 8px 32px', background: '#f8fafc', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#0f172a', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredClients.map(c => (
                <div 
                  key={c.id}
                  onClick={() => setSelectedClient(c)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: selectedClient.id === c.id ? '#f3e8ff' : '#ffffff',
                    border: selectedClient.id === c.id ? '1px solid #e9d5ff' : '1px solid var(--border-glass)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={c.photoUrl} alt={c.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Score: {c.skinScore}/100</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedClient && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <img src={selectedClient.photoUrl} alt={selectedClient.name} style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid #7c3aed' }} />
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{selectedClient.name} (Age {selectedClient.age})</h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Skin Type: {selectedClient.skinType}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7c3aed' }}>{selectedClient.skinScore}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Skin Health Score</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Primary Concern</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{selectedClient.primaryConcern}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Assigned Routine</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#059669' }}>{selectedClient.assignedRoutine}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. SKIN ASSESSMENT REPORTS */}
      {activeTab === 'reports' && selectedClient && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px' }}>Skin Assessment Report — {selectedClient.name}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#7c3aed', marginBottom: '8px' }}>Assessment Summary</h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Score:</strong> {selectedClient.skinScore} / 100</div>
                <div><strong>Primary Concern:</strong> {selectedClient.primaryConcern}</div>
                <div><strong>Evaluated Risk:</strong> {selectedClient.riskLevel}</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#0284c7', marginBottom: '8px' }}>Diagnostic Findings</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Client exhibits mild transepidermal water loss. Skin barrier is stable enough to begin low-strength retinoid integration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. PROGRESS MONITORING */}
      {activeTab === 'progress' && selectedClient && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px' }}>Client Progress Monitoring — {selectedClient.name}</h3>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={clientProgressTrend}>
                <XAxis dataKey="week" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={[50, 100]} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1' }} />
                <Area type="monotone" dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 4. RECOMMENDATION MANAGEMENT */}
      {activeTab === 'recommendations' && selectedClient && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '10px' }}>Recommendation Management</h3>
          
          {saveSuccess && (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px', borderRadius: '6px', color: '#059669', fontSize: '0.85rem', marginBottom: '12px' }}>
              ✅ Customized recommendations dispatched to client profile!
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Consultant Recommendation Note</label>
            <textarea 
              rows={3}
              value={recommendationNote}
              onChange={(e) => setRecommendationNote(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#0f172a', fontSize: '0.88rem' }}
            />
          </div>

          <button className="btn-primary" onClick={handleSaveRecommendation}>
            <CheckCircle2 size={15} /> Save & Dispatch Recommendations
          </button>
        </div>
      )}

    </div>
  );
}
