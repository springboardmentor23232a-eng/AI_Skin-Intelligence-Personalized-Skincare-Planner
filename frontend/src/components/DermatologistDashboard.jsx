import React, { useState } from 'react';
import { MOCK_PATIENTS_DERMATOLOGIST } from '../data/mockData';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Stethoscope, Activity, FileCheck, Pill, CheckCircle2
} from 'lucide-react';

export default function DermatologistDashboard() {
  const [patients] = useState(MOCK_PATIENTS_DERMATOLOGIST);
  const [activePatient, setActivePatient] = useState(patients[0]);
  
  // STRICTLY THE 4 REQUESTED DERMATOLOGIST FEATURES:
  // 1. Patient insights
  // 2. Skin condition reports
  // 3. Treatment recommendations
  // 4. Progress analytics
  const [activeTab, setActiveTab] = useState('insights'); 

  const [prescription, setPrescription] = useState(activePatient.recommendedPrescription);
  const [savePrescriptionMsg, setSavePrescriptionMsg] = useState(false);

  const handleSavePrescription = () => {
    setSavePrescriptionMsg(true);
    setTimeout(() => setSavePrescriptionMsg(false), 2000);
  };

  const lesionTrend = [
    { week: 'Baseline', lesions: 28 },
    { week: 'Week 2', lesions: 22 },
    { week: 'Week 4', lesions: 15 },
    { week: 'Week 6', lesions: 9 },
  ];

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 20px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>Dermatologist Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Patient Insights, Skin Condition Reports, Treatment Recommendations, & Progress Analytics.</p>
        </div>
        <span className="badge badge-cyan" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
          <Stethoscope size={15} /> Clinical Suite
        </span>
      </div>

      {/* DAY THEME 4-TAB NAVIGATION */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <button className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`} onClick={() => setActiveTab('insights')}>
          <Stethoscope size={16} /> 1. Patient Insights
        </button>
        <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
          <FileCheck size={16} /> 2. Skin Condition Reports
        </button>
        <button className={`tab-btn ${activeTab === 'treatment' ? 'active' : ''}`} onClick={() => setActiveTab('treatment')}>
          <Pill size={16} /> 3. Treatment Recommendations
        </button>
        <button className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => setActiveTab('progress')}>
          <Activity size={16} /> 4. Progress Analytics
        </button>
      </div>

      {/* 1. PATIENT INSIGHTS */}
      {activeTab === 'insights' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '14px' }}>Clinical Patient Roster</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {patients.map(p => (
                <div 
                  key={p.id}
                  onClick={() => {
                    setActivePatient(p);
                    setPrescription(p.recommendedPrescription);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: activePatient.id === p.id ? '#e0f2fe' : '#ffffff',
                    border: activePatient.id === p.id ? '1px solid #bae6fd' : '1px solid var(--border-glass)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{p.patientName}</span>
                    <span className="badge badge-pink">Severity: {p.severityIndex}/10</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 500 }}>{p.diagnosis}</div>
                </div>
              ))}
            </div>
          </div>

          {activePatient && (
            <div className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '14px' }}>Patient Clinical Overview</h3>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Selected Patient</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{activePatient.patientName} (Age {activePatient.age})</div>
                <div style={{ fontSize: '0.82rem', color: '#d97706', marginTop: '2px' }}>{activePatient.diagnosis}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div><strong>Phototype:</strong> {activePatient.phototype}</div>
                <div><strong>Clinical Notes:</strong> {activePatient.notes}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. SKIN CONDITION REPORTS */}
      {activeTab === 'reports' && activePatient && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px' }}>Skin Condition Report — {activePatient.patientName}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#0284c7', marginBottom: '8px' }}>Pathology Metrics</h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Diagnosis:</strong> {activePatient.diagnosis}</div>
                <div><strong>Erythema Scale:</strong> Moderate (Grade 2.5)</div>
                <div><strong>Lesion Count:</strong> 28 Active Inflammatory Papules</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#059669', marginBottom: '8px' }}>Barrier Integrity</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Stratum corneum function is moderately compromised. Pre-condition with Ceramide lipid emulsion prior to introducing prescription Adapalene.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. TREATMENT RECOMMENDATIONS */}
      {activeTab === 'treatment' && activePatient && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '10px' }}>Clinical Treatment Recommendations</h3>
          
          {savePrescriptionMsg && (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px', borderRadius: '6px', color: '#059669', fontSize: '0.85rem', marginBottom: '12px' }}>
              ✅ Medical treatment prescription signed and authorized!
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Prescription Active & Dosage</label>
            <input 
              type="text" 
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#0f172a', fontSize: '0.88rem' }}
            />
          </div>

          <button className="btn-primary" onClick={handleSavePrescription}>
            <FileCheck size={15} /> Sign & Authorize Treatment
          </button>
        </div>
      )}

      {/* 4. PROGRESS ANALYTICS */}
      {activeTab === 'progress' && activePatient && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px' }}>Clinical Progress Analytics — Lesion Reduction</h3>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lesionTrend}>
                <XAxis dataKey="week" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1' }} />
                <Area type="monotone" dataKey="lesions" stroke="#0284c7" fill="#0284c7" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
}
