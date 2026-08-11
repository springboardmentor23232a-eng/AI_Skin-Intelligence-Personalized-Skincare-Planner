import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import JwtInspector from "../components/JwtInspector";
import { Award, Users, Droplets, Moon, MessageSquare, Send, CheckCircle, Bell, Heart } from "lucide-react";

const INITIAL_CLIENTS = [
  { id: 301, name: "John Doe", email: "john@gmail.com", water: "2.4L / 3.0L", sleep: "7.5 hrs", exercise: "30 mins", diet: "Antioxidant Rich", status: "Good Habit Tracking" },
  { id: 302, name: "Emily Watson", email: "emily@dev.io", water: "1.8L / 3.0L", sleep: "6.0 hrs", exercise: "15 mins", diet: "Low Sugar Skincare Diet", status: "Needs Improvement" },
  { id: 303, name: "Michael Chen", email: "michael@tech.com", water: "3.0L / 3.0L", sleep: "8.0 hrs", exercise: "45 mins", diet: "Omega-3 & Hydration", status: "Peak Wellness" }
];

const WellnessDashboard = () => {
  const location = useLocation();
  const [clients] = useState(INITIAL_CLIENTS);
  const [selectedClient, setSelectedClient] = useState(clients[0]);

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace("#", "");
      const el = document.getElementById(targetId) || document.getElementById(targetId === "habits" ? "clients" : targetId);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [location.hash]);

  // Lifestyle & Wellness Plan Form
  const [dietPlan, setDietPlan] = useState("Increase green leafy vegetables, walnuts, and berries. Avoid refined sugar & processed oils.");
  const [exercisePlan, setExercisePlan] = useState("30 mins brisk walking or yoga 5x weekly to boost blood micro-circulation.");
  const [lifestyleGuidance, setLifestyleGuidance] = useState("Maintain 3.0L water intake and stick to a strict 10:30 PM bedtime routine.");
  const [chatMessage, setChatMessage] = useState("");

  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handlePublishPlan = (e) => {
    e.preventDefault();
    showToast(`✔ Holistic Wellness & Lifestyle Plan transmitted to ${selectedClient.name}'s dashboard!`);
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--primary)',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '0.88rem',
          fontWeight: 700,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <CheckCircle size={18} /> <span>{toastMsg}</span>
        </div>
      )}

      <div className="dashboard-content">
        <Sidebar />

        <main className="main-viewport">
          <JwtInspector />

          {/* Section Header */}
          <div id="overview" className="section-header">
            <div>
              <h2>
                <Award className="icon-title" style={{ color: 'var(--warning)' }} /> Wellness &amp; Lifestyle Coach Dashboard
              </h2>
              <p>Monitor assigned client habits, water intake, nocturnal sleep turnover, exercise routines, and publish diet &amp; lifestyle plans.</p>
            </div>
            <span className="role-badge role-wellness_coach" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
              <Award size={14} /> WELLNESS_COACH Authorized
            </span>
          </div>

          {/* Metric Cards */}
          <div className="grid-layout grid-4-col" style={{ marginBottom: '1.75rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>ASSIGNED CLIENTS</span>
                <Users size={18} style={{ color: 'var(--primary)' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>15 Clients</div>
              <small style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active wellness tracking</small>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>AVG HYDRATION</span>
                <Droplets size={18} style={{ color: '#3B82F6' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>2.4 Liters</div>
              <small style={{ fontSize: '0.75rem', color: '#3B82F6', fontWeight: 600 }}>80% Daily Goal</small>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>AVG SLEEP RECOVERY</span>
                <Moon size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>7.2 Hours</div>
              <small style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>Good REM Turnover</small>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>WELLNESS NOTIFICATIONS</span>
                <Bell size={18} style={{ color: 'var(--warning)' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>3 Pending</div>
              <small style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600 }}>Follow-ups scheduled</small>
            </div>
          </div>

          {/* 2-Column Content Section */}
          <div className="grid-layout grid-3-col">
            
            {/* Left Column: Assigned Clients List */}
            <div id="clients" className="glass-card span-1">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>Assigned Clients</h3>
                <Users size={18} />
              </div>

              <div className="client-list">
                {clients.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedClient(c)}
                    style={{
                      background: selectedClient.id === c.id ? 'var(--primary-light)' : 'var(--input-bg)',
                      border: '1px solid var(--border-color)',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.2rem', fontWeight: 700 }}>{c.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.email}</p>
                      <small style={{ fontSize: '0.72rem', color: 'var(--warning)', fontWeight: 600 }}>
                        Water: {c.water} • Sleep: {c.sleep}
                      </small>
                    </div>
                    <span className="jwt-status-chip">{c.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Lifestyle Guidance & Habit Plan Builder */}
            <div className="glass-card span-2">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem' }}>Holistic Diet, Habit &amp; Lifestyle Plan</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Selected Client: <strong>{selectedClient.name}</strong> • Current Water: <strong>{selectedClient.water}</strong> • Sleep: <strong>{selectedClient.sleep}</strong>
                  </p>
                </div>
                <Heart size={20} style={{ color: 'var(--warning)' }} />
              </div>

              <form onSubmit={handlePublishPlan} className="form-container">
                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: '0.88rem' }}>Dietary &amp; Nutrition Guidelines for Skin Health</label>
                  <textarea
                    rows="3"
                    value={dietPlan}
                    onChange={(e) => setDietPlan(e.target.value)}
                    placeholder="Provide dietary guidelines to improve skin clarity..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: '0.88rem' }}>Exercise &amp; Physical Activity Recommendations</label>
                  <textarea
                    rows="2"
                    value={exercisePlan}
                    onChange={(e) => setExercisePlan(e.target.value)}
                    placeholder="Specify exercise routines to boost micro-circulation..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: '0.88rem' }}>Water Intake, Sleep &amp; Habit Guidance</label>
                  <textarea
                    rows="2"
                    value={lifestyleGuidance}
                    onChange={(e) => setLifestyleGuidance(e.target.value)}
                    placeholder="Specify daily habit tracking goals..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: '0.88rem' }}>Direct Chat Message to Client</label>
                  <div className="input-with-icon">
                    <MessageSquare className="input-icon" size={16} />
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder={`Send a encouraging message to ${selectedClient.name}...`}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem', padding: '0.6rem' }}>
                  <Send size={16} /> <span>Publish Holistic Wellness Guidance</span>
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WellnessDashboard;
