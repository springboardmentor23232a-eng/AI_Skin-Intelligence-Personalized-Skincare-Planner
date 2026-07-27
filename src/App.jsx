import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import UserDashboard from './components/UserDashboard';
import ConsultantDashboard from './components/ConsultantDashboard';
import DermatologistDashboard from './components/DermatologistDashboard';
import AdminDashboard from './components/AdminDashboard';
import SkinAssessmentModal from './components/SkinAssessmentModal';
import AuthModal from './components/AuthModal';
import { Sparkles, Home, User, FlaskConical, Stethoscope, Cpu, Lock } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('Home'); // Home, User, Consultant, Dermatologist, Admin
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleLoginSuccess = (role) => {
    setIsAuthOpen(false);
    setActiveTab(role);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-main)' }}>
      {/* SIMPLE DAY THEME NAVBAR */}
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

          {/* DAY THEME TOP NAVIGATION */}
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
              className={`tab-btn ${activeTab === 'Consultant' ? 'active' : ''}`} 
              onClick={() => setActiveTab('Consultant')}
              style={{ fontSize: '0.85rem', padding: '6px 14px' }}
            >
              <FlaskConical size={14} /> Consultant
            </button>
            <button 
              className={`tab-btn ${activeTab === 'Dermatologist' ? 'active' : ''}`} 
              onClick={() => setActiveTab('Dermatologist')}
              style={{ fontSize: '0.85rem', padding: '6px 14px' }}
            >
              <Stethoscope size={14} /> Dermatologist
            </button>
            <button 
              className={`tab-btn ${activeTab === 'Admin' ? 'active' : ''}`} 
              onClick={() => setActiveTab('Admin')}
              style={{ fontSize: '0.85rem', padding: '6px 14px' }}
            >
              <Cpu size={14} /> Admin Dashboard
            </button>
          </div>

          {/* DEMO LOGIN BUTTON */}
          <button className="btn-primary" onClick={() => setIsAuthOpen(true)} style={{ padding: '7px 16px', fontSize: '0.85rem' }}>
            <Lock size={14} /> Demo Login
          </button>
        </div>
      </header>

      {/* VIEW SWITCHER */}
      <main style={{ paddingBottom: '50px' }}>
        {activeTab === 'Home' && (
          <LandingPage 
            onSelectRole={(role) => setActiveTab(role)} 
            onOpenQuiz={() => setIsQuizOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)} 
          />
        )}
        {activeTab === 'User' && <UserDashboard />}
        {activeTab === 'Consultant' && <ConsultantDashboard />}
        {activeTab === 'Dermatologist' && <DermatologistDashboard />}
        {activeTab === 'Admin' && <AdminDashboard />}
      </main>

      {/* MODALS */}
      {isQuizOpen && (
        <SkinAssessmentModal 
          onClose={() => setIsQuizOpen(false)} 
          onComplete={() => {
            setIsQuizOpen(false);
            setActiveTab('User');
          }} 
        />
      )}

      {isAuthOpen && (
        <AuthModal 
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.82rem', background: '#ffffff' }}>
        DermAI Skincare Intelligence Platform • Infosys Internship Project
      </footer>
    </div>
  );
}
