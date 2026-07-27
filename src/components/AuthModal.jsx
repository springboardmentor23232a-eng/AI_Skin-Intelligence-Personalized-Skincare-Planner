import React, { useState } from 'react';
import { Sparkles, X, Lock, Mail, User, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [selectedRole, setSelectedRole] = useState('User'); // User, Consultant, Dermatologist, Admin
  const [email, setEmail] = useState('ayush@example.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      onLoginSuccess(selectedRole);
    }, 800);
  };

  const handleQuickDemo = (role, demoEmail) => {
    setSelectedRole(role);
    setEmail(demoEmail);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      onLoginSuccess(role);
    }, 600);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '36px', position: 'relative' }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto 12px', boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)' }}>
            <Lock size={22} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {authMode === 'login' ? 'DermAI Portal Login' : 'Create DermAI Account'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Demonstrating JWT & OAuth2 Role-Based Authentication
          </p>
        </div>

        {/* Auth Mode Toggle (Login vs Register) */}
        <div className="glass-panel" style={{ display: 'flex', padding: '4px', gap: '4px', borderRadius: '12px', marginBottom: '20px' }}>
          <button
            onClick={() => setAuthMode('login')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: authMode === 'login' ? 'var(--accent-pink)' : 'transparent',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthMode('register')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: authMode === 'register' ? 'var(--accent-pink)' : 'transparent',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Role Selector */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Select Account Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem' }}
            >
              <option value="User">Consumer / User</option>
              <option value="Consultant">Skincare Consultant</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Admin">Platform Administrator</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                style={{ width: '100%', padding: '12px 12px 12px 38px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{ width: '100%', padding: '12px 12px 12px 38px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isLoading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
          >
            {isLoading ? 'Authenticating...' : authMode === 'login' ? 'Sign In to Dashboard' : 'Create Account'}
          </button>
        </form>

        {/* QUICK DEMO ONE-CLICK CREDENTIALS */}
        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '10px', textAlign: 'center', textTransform: 'uppercase' }}>
            ⚡ One-Click Demo Quick Logins:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button 
              className="btn-secondary"
              onClick={() => handleQuickDemo('User', 'ayush@example.com')}
              style={{ padding: '8px', fontSize: '0.78rem', justifyContent: 'center' }}
            >
              👤 User Login
            </button>

            <button 
              className="btn-secondary"
              onClick={() => handleQuickDemo('Consultant', 'consultant@derm.org')}
              style={{ padding: '8px', fontSize: '0.78rem', justifyContent: 'center' }}
            >
              🧴 Consultant
            </button>

            <button 
              className="btn-secondary"
              onClick={() => handleQuickDemo('Dermatologist', 'dr.jenkins@derm.org')}
              style={{ padding: '8px', fontSize: '0.78rem', justifyContent: 'center' }}
            >
              🩺 Derm Login
            </button>

            <button 
              className="btn-secondary"
              onClick={() => handleQuickDemo('Admin', 'admin@derm.ai')}
              style={{ padding: '8px', fontSize: '0.78rem', justifyContent: 'center' }}
            >
              🛡️ Admin Login
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
