import React, { useState } from 'react';
import { Sparkles, X, Lock, Mail, User, CheckCircle2, ArrowRight, ShieldCheck, Key } from 'lucide-react';
import confetti from 'canvas-confetti';

const API_BASE = 'http://127.0.0.1:8000';

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [selectedRole, setSelectedRole] = useState('User'); // User, Consultant, Dermatologist, Admin
  const [name, setName] = useState('');
  const [email, setEmail] = useState('ayush@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [jwtTokenPreview, setJwtTokenPreview] = useState(null);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const endpoint = authMode === 'login' ? `${API_BASE}/api/auth/login` : `${API_BASE}/api/auth/register`;
      const payload = authMode === 'login' 
        ? { email, password, role: selectedRole }
        : { name: name || email.split('@')[0], email, password, role: selectedRole, skinType: 'Combination' };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      // Save signed JWT token and user info to localStorage
      localStorage.setItem('derm_ai_jwt_token', data.access_token);
      localStorage.setItem('derm_ai_user', JSON.stringify(data.user));

      setJwtTokenPreview(data.access_token);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(data.user.role, data.access_token);
      }, 600);

    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message);
    }
  };

  const handleOAuthLogin = async (provider) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/oauth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, token: 'mock_oauth_code_xyz123', role: selectedRole })
      });

      const data = await res.json();
      if (!res.ok) throw new Error('OAuth authentication failed');

      localStorage.setItem('derm_ai_jwt_token', data.access_token);
      localStorage.setItem('derm_ai_user', JSON.stringify(data.user));

      setJwtTokenPreview(data.access_token);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(data.user.role, data.access_token);
      }, 600);

    } catch (err) {
      setIsLoading(false);
      setErrorMsg(err.message);
    }
  };

  const fillQuickDemo = (role, demoEmail, demoPass = 'password123') => {
    setSelectedRole(role);
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '32px', position: 'relative' }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '18px', right: '18px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto 10px' }}>
            <Lock size={20} />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
            {authMode === 'login' ? 'DermAI Authentication' : 'Create DermAI Account'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
            Authenticated via signed JWT Bearer Token & OAuth2 Gateway
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '14px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* JWT Signed Token Preview Badge */}
        {jwtTokenPreview && (
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', padding: '10px', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '14px', fontFamily: 'monospace' }}>
            🔑 <strong>JWT Bearer Token Signed:</strong> {jwtTokenPreview.substring(0, 32)}...
          </div>
        )}

        {/* Login vs Register Toggle */}
        <div className="glass-panel" style={{ display: 'flex', padding: '3px', gap: '3px', borderRadius: '8px', marginBottom: '16px', background: '#f1f5f9' }}>
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            style={{
              flex: 1, padding: '7px', borderRadius: '6px', border: 'none',
              background: authMode === 'login' ? '#ffffff' : 'transparent',
              color: authMode === 'login' ? '#2563eb' : '#64748b',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            style={{
              flex: 1, padding: '7px', borderRadius: '6px', border: 'none',
              background: authMode === 'register' ? '#ffffff' : 'transparent',
              color: authMode === 'register' ? '#2563eb' : '#64748b',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
            }}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {authMode === 'register' && (
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Full Name</label>
              <input 
                type="text" required
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ayush Sharma"
                style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#0f172a', fontSize: '0.88rem' }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Account Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#0f172a', fontSize: '0.88rem' }}
            >
              <option value="User">Consumer / User</option>
              <option value="Consultant">Skincare Consultant</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Admin">Platform Administrator</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email Address</label>
            <input 
              type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="ayush@example.com"
              style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#0f172a', fontSize: '0.88rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Password</label>
            <input 
              type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#0f172a', fontSize: '0.88rem' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isLoading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
          >
            {isLoading ? 'Authenticating with JWT...' : authMode === 'login' ? 'Sign In & Get Bearer Token' : 'Register Account'}
          </button>
        </form>

        {/* OAUTH2 DIRECT BUTTONS */}
        <div style={{ marginTop: '18px', borderTop: '1px solid var(--border-glass)', paddingTop: '14px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px', textAlign: 'center', textTransform: 'uppercase' }}>
            🌐 OAuth2 Single Sign-On (Google / GitHub):
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            <button 
              type="button"
              className="btn-secondary"
              onClick={() => handleOAuthLogin('google')}
              style={{ padding: '7px', fontSize: '0.78rem', justifyContent: 'center' }}
            >
              Sign In with Google
            </button>
            <button 
              type="button"
              className="btn-secondary"
              onClick={() => handleOAuthLogin('github')}
              style={{ padding: '7px', fontSize: '0.78rem', justifyContent: 'center' }}
            >
              Sign In with GitHub
            </button>
          </div>

          {/* Quick Demo Autofill */}
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '6px', textAlign: 'center' }}>
            ⚡ Autofill Demo Credentials:
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="badge badge-pink" onClick={() => fillQuickDemo('User', 'ayush@example.com')} style={{ cursor: 'pointer' }}>
              User (Ayush)
            </button>
            <button className="badge badge-purple" onClick={() => fillQuickDemo('Consultant', 'consultant@derm.org')} style={{ cursor: 'pointer' }}>
              Consultant
            </button>
            <button className="badge badge-cyan" onClick={() => fillQuickDemo('Dermatologist', 'dr.jenkins@derm.org')} style={{ cursor: 'pointer' }}>
              Dermatologist
            </button>
            <button className="badge badge-emerald" onClick={() => fillQuickDemo('Admin', 'admin@derm.ai')} style={{ cursor: 'pointer' }}>
              Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
