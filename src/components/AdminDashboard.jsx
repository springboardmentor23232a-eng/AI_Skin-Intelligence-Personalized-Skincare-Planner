import React, { useState } from 'react';
import { MOCK_ADMIN_METRICS } from '../data/mockData';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { 
  Cpu, Server, Users, Activity, Terminal, Sparkles, FileText, CheckCircle2
} from 'lucide-react';

export default function AdminDashboard() {
  const metrics = MOCK_ADMIN_METRICS;
  
  // STRICTLY THE 4 REQUESTED ADMIN FEATURES:
  // 1. User management
  // 2. Platform analytics
  // 3. Recommendation monitoring
  // 4. System reports
  const [adminTab, setAdminTab] = useState('users');

  // User Management state
  const [userRoster, setUserRoster] = useState([
    { id: 'U-1001', name: 'Ayush Sharma', email: 'ayush@example.com', role: 'Consumer User', status: 'Active', score: 82 },
    { id: 'U-1002', name: 'Dr. Jayanthi', email: 'jayanthi@derm.org', role: 'Dermatologist', status: 'Active', score: 98 },
    { id: 'U-1003', name: 'Sophia', email: 'sophia.m@gmail.com', role: 'Consumer User', status: 'Active', score: 74 },
    { id: 'U-1004', name: 'Manish', email: 'manish.v@consulting.com', role: 'Skincare Consultant', status: 'Active', score: 95 },
    { id: 'U-1005', name: 'Lucky', email: 'lucky.r@gmail.com', role: 'Consumer User', status: 'Active', score: 68 },
  ]);

  // Analytics Chart Data
  const analyticsTrend = [
    { day: 'Mon', requests: 52000, users: 11200, latency: 135 },
    { day: 'Tue', requests: 58000, users: 12400, latency: 140 },
    { day: 'Wed', requests: 64000, users: 13100, latency: 142 },
    { day: 'Thu', requests: 61000, users: 13800, latency: 138 },
    { day: 'Fri', requests: 72000, users: 14200, latency: 145 },
    { day: 'Sat', requests: 81000, users: 14600, latency: 150 },
    { day: 'Sun', requests: 79000, users: 14820, latency: 142 },
  ];

  const toggleUserStatus = (id) => {
    setUserRoster(userRoster.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 20px' }}>
      
      {/* ADMIN HEADER - DAY THEME */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>Admin Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>User Management, Platform Analytics, Recommendation Monitoring, & System Reports.</p>
        </div>
        <span className="badge badge-emerald" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
          <CheckCircle2 size={15} /> System Healthy
        </span>
      </div>

      {/* DAY THEME 4-TAB NAVIGATION */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <button className={`tab-btn ${adminTab === 'users' ? 'active' : ''}`} onClick={() => setAdminTab('users')}>
          <Users size={16} /> 1. User Management
        </button>
        <button className={`tab-btn ${adminTab === 'analytics' ? 'active' : ''}`} onClick={() => setAdminTab('analytics')}>
          <Activity size={16} /> 2. Platform Analytics
        </button>
        <button className={`tab-btn ${adminTab === 'recommendations' ? 'active' : ''}`} onClick={() => setAdminTab('recommendations')}>
          <Sparkles size={16} /> 3. Recommendation Monitoring
        </button>
        <button className={`tab-btn ${adminTab === 'reports' ? 'active' : ''}`} onClick={() => setAdminTab('reports')}>
          <FileText size={16} /> 4. System Reports
        </button>
      </div>

      {/* 1. USER MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>User Management</h3>
            <span className="badge badge-purple">{userRoster.length} Accounts Listed</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px' }}>User ID</th>
                  <th style={{ padding: '10px' }}>Name & Email</th>
                  <th style={{ padding: '10px' }}>Role</th>
                  <th style={{ padding: '10px' }}>Skin Health Score</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userRoster.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', color: 'var(--text-dim)' }}>{u.id}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${u.role.includes('Derm') ? 'badge-cyan' : u.role.includes('Consultant') ? 'badge-purple' : 'badge-pink'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#059669' }}>{u.score}/100</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontSize: '0.8rem', color: u.status === 'Active' ? '#059669' : '#e11d48' }}>
                        ● {u.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button 
                        className="btn-secondary" 
                        onClick={() => toggleUserStatus(u.id)}
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        {u.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. PLATFORM ANALYTICS */}
      {adminTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Platform Analytics</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '14px' }}>Daily API Gateway Request Volumes</h4>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsTrend}>
                    <XAxis dataKey="day" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1' }} />
                    <Bar dataKey="requests" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '14px' }}>Average API Gateway Latency (ms)</h4>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsTrend}>
                    <XAxis dataKey="day" stroke="#64748b" />
                    <YAxis stroke="#64748b" domain={[100, 200]} />
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1' }} />
                    <Area type="monotone" dataKey="latency" stroke="#0284c7" fill="#0284c7" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. RECOMMENDATION MONITORING */}
      {adminTab === 'recommendations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Recommendation Monitoring</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '14px', color: '#0284c7' }}>AI Vector Search Engine Metrics</h4>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Vector Embedding Lookup Time:</span>
                  <strong style={{ color: '#059669' }}>24 ms (Top-50 Ranked)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Recommendation Precision Score:</span>
                  <strong style={{ color: '#2563eb' }}>98.4% Accuracy</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Allergy Safety Guardrail:</span>
                  <strong style={{ color: '#d97706' }}>Enforced (0 Conflicts)</strong>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '14px', color: '#7c3aed' }}>Top Product Recommendation Matches</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                  <span>1. Radiance B3 + Zinc Serum</span>
                  <span className="badge badge-emerald">97% Match</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                  <span>2. Ceramide Barrier Surge Cream</span>
                  <span className="badge badge-emerald">95% Match</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                  <span>3. Invisible Sunscreen Fluid SPF 50+</span>
                  <span className="badge badge-emerald">98% Match</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SYSTEM REPORTS */}
      {adminTab === 'reports' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>System Reports</h3>
            <button className="btn-primary" onClick={() => window.print()} style={{ fontSize: '0.82rem' }}>
              Export System Report PDF
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#d97706', marginBottom: '6px' }}>Docker & Infrastructure Report</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                All 6 microservice containers running with 99.98% uptime. Zero memory leaks detected.
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#059669', marginBottom: '6px' }}>Database & Compliance Report</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                PostgreSQL and MongoDB daily encrypted backups verified. HIPAA & GDPR compliance checks passed.
              </p>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal color="#d97706" size={16} /> System Audit Log Output
            </h4>

            <div style={{ background: '#0f172a', borderRadius: '8px', padding: '14px', fontFamily: 'monospace', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '8px', height: '200px', overflowY: 'auto', color: '#f8fafc' }}>
              {metrics.recentLogs.map(log => (
                <div key={log.id} style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#94a3b8' }}>[{log.time}]</span>
                  <span style={{ color: log.level === 'WARN' ? '#fbbf24' : '#34d399', fontWeight: 'bold' }}>[{log.level}]</span>
                  <span style={{ color: '#cbd5e1' }}>{log.service}:</span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
