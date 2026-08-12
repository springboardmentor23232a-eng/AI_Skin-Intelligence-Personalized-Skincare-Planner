import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import UserDashboard from './components/UserDashboard';
import ConsultantDashboard from './components/ConsultantDashboard';
import DermatologistDashboard from './components/DermatologistDashboard';
import AdminDashboard from './components/AdminDashboard';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import SkinAssessmentModal from './components/SkinAssessmentModal';
import { Sparkles, Home, User, FlaskConical, Stethoscope, Cpu, Lock, LogOut, UserCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('Home'); // Home, Login, Register, User, Skincare Consultant, Dermatologist, Administrator
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [authUser, setAuthUser] = useState(null);

  // Check existing JWT Token & User on load
  useEffect(() => {
    const savedUser = localStorage.getItem('derm_ai_user');
    const savedToken = localStorage.getItem('derm_ai_jwt_token');
    if (savedUser && savedToken) {
      try {
        setAuthUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, []);

  const handleLoginSuccess = (role, token) => {
    const savedUser = localStorage.getItem('derm_ai_user');
    if (savedUser) {
      setAuthUser(JSON.parse(savedUser));
    }
    setActiveTab(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('derm_ai_jwt_token');
    localStorage.removeItem('derm_ai_user');
    setAuthUser(null);
    setActiveTab('Home');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-main)' }}>
      {/* REAL DAY THEME NAVBAR */}
      <header style={{ 
        position: 'sticky', top: 0, zIndex: 100, 
        background: '#ffffff', 
        borderBottom: '1px solid var(--border-glass)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        padding: '14px 24px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('Home')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
                Derm<span style={{ color: '#2563eb' }}>AI</span>
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', lineHeight: 1 }}>
                Skincare Intelligence Platform
              </span>
            </div>
          </div>

          {/* TOP NAVIGATION TOGGLE INCLUDING REAL LOGIN / REGISTER & DASHBOARDS */}
          <div className="glass-panel" style={{ display: 'flex', padding: '3px', gap: '3px', borderRadius: '8px', background: '#f1f5f9' }}>
            <button 
              className={`tab-btn ${activeTab === 'Home' ? 'active' : ''}`} 
              onClick={() => setActiveTab('Home')}
              style={{ fontSize: '0.85rem', padding: '6px 14px' }}
            >
              <Home size={14} /> Home
            </button>



            <button 
              className={`tab-btn ${activeTab === 'User' ? 'active' : ''}`} 
              onClick={() => setActiveTab('User')}
              style={{ fontSize: '0.85rem', padding: '6px 14px' }}
            >
              <User size={14} /> User Dashboard
            </button>
            <button 
              className={`tab-btn ${activeTab === 'Skincare Consultant' ? 'active' : ''}`} 
              onClick={() => setActiveTab('Skincare Consultant')}
              style={{ fontSize: '0.85rem', padding: '6px 14px' }}
            >
              <FlaskConical size={14} /> Skincare Consultant
            </button>
            <button 
              className={`tab-btn ${activeTab === 'Dermatologist' ? 'active' : ''}`} 
              onClick={() => setActiveTab('Dermatologist')}
              style={{ fontSize: '0.85rem', padding: '6px 14px' }}
            >
              <Stethoscope size={14} /> Dermatologist
            </button>
            <button 
              className={`tab-btn ${activeTab === 'Administrator' ? 'active' : ''}`} 
              onClick={() => setActiveTab('Administrator')}
              style={{ fontSize: '0.85rem', padding: '6px 14px' }}
            >
              <Cpu size={14} /> Administrator
            </button>
          </div>

          {/* AUTH USER BADGE & LOGOUT */}
          {authUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '0.82rem', textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{authUser.name}</div>
                <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>Verified ({authUser.role})</span>
              </div>
              <button className="btn-secondary" onClick={handleLogout} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          ) : (
            <button className="btn-primary" onClick={() => setActiveTab('Login')} style={{ padding: '7px 16px', fontSize: '0.85rem' }}>
              <Lock size={14} /> Sign In
            </button>
          )}

        </div>
      </header>

      {/* MAIN VIEW ROUTING */}
      <main style={{ paddingBottom: '50px' }}>
        {activeTab === 'Home' && (
          <LandingPage 
            onSelectRole={(role) => setActiveTab(role)} 
            onOpenQuiz={() => setIsQuizOpen(true)}
            onOpenAuth={() => setActiveTab('Login')} 
          />
        )}
        {activeTab === 'Login' && (
          <LoginPage 
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setActiveTab('Register')}
          />
        )}
        {activeTab === 'Register' && (
          <RegisterPage 
            onRegisterSuccess={handleLoginSuccess}
            onSwitchToLogin={() => setActiveTab('Login')}
          />
        )}
        {activeTab === 'User' && <UserDashboard />}
        {activeTab === 'Skincare Consultant' && <ConsultantDashboard />}
        {activeTab === 'Dermatologist' && <DermatologistDashboard />}
        {activeTab === 'Administrator' && <AdminDashboard />}
      </main>

      {/* QUIZ MODAL */}
      {isQuizOpen && (
        <SkinAssessmentModal 
          onClose={() => setIsQuizOpen(false)} 
          onComplete={() => {
            setIsQuizOpen(false);
            setActiveTab('User');
          }} 
        />
      )}

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.82rem', background: '#ffffff' }}>
        DermAI Skincare Intelligence Platform • PostgreSQL Database & Google OAuth2 Authentication
      </footer>
    </div>
  );
}
